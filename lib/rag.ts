import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Annotation, START } from "@langchain/langgraph";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { createRetrieverTool } from "langchain/tools/retriever";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { webTool, gradeTool } from "./tools";
import { END } from "@langchain/langgraph";

import { pull } from "langchain/hub";
import { z } from "zod";
import { StateGraph } from "@langchain/langgraph";
import { generatePrompt, gradePrompt, rewritePrompt } from "./prompt";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { tokenTracker, estimateTokens } from "./utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "embedding-001",
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

const vectorStore = new SupabaseVectorStore(embeddings, {
  client: supabase,
  tableName: "dcp",
  queryName: "match_documents",
});

const retriever = vectorStore.asRetriever({
  k: 3, // Reduce from default to limit token usage
});

// Use Gemini 2.0 Flash for best free tier limits: 15 RPM, 1M TPM, 200 RPD
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.1,
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  streaming: true,
  maxOutputTokens: 512, // Limit output to reduce token consumption
});

const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  useWebSearch: Annotation<boolean>({
    reducer: (x, y) => y ?? x,
    default: () => false,
  }),
});

const tool = createRetrieverTool(retriever, {
  name: "recommend_tv_shows_and_movies",
  description: "Search and return relevant tv shows and movies.",
});
const tools = [tool];

const toolNode = new ToolNode(tools);

function shouldRecommend(state: typeof GraphState.State) {
  const { messages } = state;
  console.log("------Deciding whether to recommend tv shows and movies------");
  const lastMessage = messages[messages.length - 1];
  if (
    "tool_calls" in lastMessage &&
    Array.isArray(lastMessage.tool_calls) &&
    lastMessage.tool_calls.length
  ) {
    return "retrieve";
  }
  return END;
}

// Simplified grading that skips web search for better token efficiency
async function gradeRecomendation(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("------Grading the recommendation------");
  const { messages } = state;

  // Simple heuristic: if we got retrieval results, consider them relevant
  // This saves one API call and reduces token usage
  const lastMessage = messages[messages.length - 1];
  if (
    lastMessage.getType() === "tool" &&
    lastMessage.content &&
    (lastMessage.content as string).trim().length > 50
  ) {
    console.log("---DECISION: DOCS RELEVANT (heuristic)---");
    return { useWebSearch: false };
  }

  // Only do expensive grading for edge cases
  const prompt = ChatPromptTemplate.fromTemplate(gradePrompt);
  const model = llm.bindTools([gradeTool], {
    tool_choice: gradeTool.name,
  });
  const chain = prompt.pipe(model);

  const score = await chain.invoke({
    question: messages[0].content as string,
    context: lastMessage.content as string,
  });

  return {
    messages: [score],
  };
}

function checkRelevance(state: typeof GraphState.State): string {
  console.log("---CHECK RELEVANCE---");

  const { messages, useWebSearch } = state;

  // If we already decided to skip web search, go to generate
  if (useWebSearch === false) {
    return "yes";
  }

  const lastMessage = messages[messages.length - 1];
  if (!("tool_calls" in lastMessage)) {
    throw new Error(
      "The 'checkRelevance' node requires the most recent message to contain tool calls."
    );
  }
  const toolCalls = (lastMessage as AIMessage).tool_calls;
  if (!toolCalls || !toolCalls.length) {
    throw new Error("Last message was not a function message");
  }

  if (toolCalls[0].args.binaryScore === "yes") {
    console.log("---DECISION: DOCS RELEVANT---");
    return "yes";
  }
  console.log("---DECISION: DOCS NOT RELEVANT---");
  return "no";
}

// Simplified agent that doesn't rewrite queries (saves tokens)
async function agent(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---CALL AGENT---");

  const { messages } = state;
  const filteredMessages = messages.filter((message) => {
    if (
      "tool_calls" in message &&
      Array.isArray(message.tool_calls) &&
      message.tool_calls.length > 0
    ) {
      return message.tool_calls[0].name !== "give_relevance_score";
    }
    return true;
  });

  const model = llm.bindTools(tools);

  const response = await model.invoke(filteredMessages);
  return {
    messages: [response],
  };
}

// Simplified web search with token limits
async function webSearchWrapper(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("------STARTING WEB SEARCH------");
  const { messages } = state;

  try {
    const question = messages[0].content as string;
    console.log("Web search query:", question);

    const searchResults = await webTool.invoke({ query: question });

    // Truncate web search results to limit tokens
    const truncatedResults =
      (searchResults as string).slice(0, 1000) +
      (searchResults.length > 1000 ? "..." : "");

    console.log("Web search results (truncated):", truncatedResults);

    return {
      messages: [
        {
          content: truncatedResults,
          type: "tool",
          name: "webSearch",
          tool_call_id: "web_search_" + Date.now(),
        } as any,
      ],
    };
  } catch (error) {
    console.error("ERROR in web search:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      messages: [
        {
          content: `Web search failed: ${errorMessage}`,
          type: "tool",
          name: "webSearch",
          tool_call_id: "web_search_error_" + Date.now(),
        } as any,
      ],
    };
  }
}

async function generate(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---GENERATE---");

  const { messages } = state;
  const question = messages[0].content as string;

  const lastToolMessage = messages
    .slice()
    .reverse()
    .find((msg) => msg.getType() === "tool");
  if (!lastToolMessage) {
    throw new Error("No tool message found in the conversation history");
  }

  let docs = lastToolMessage.content as string;

  // Truncate context to limit token usage
  if (docs.length > 2000) {
    docs = docs.slice(0, 2000) + "...";
  }

  const prompt = ChatPromptTemplate.fromTemplate(generatePrompt);
  const ragChain = prompt.pipe(llm);

  const response = await ragChain.invoke({
    context: docs,
    question,
  });

  return {
    messages: [response],
  };
}

// Simplified workflow with fewer steps
const workflow = new StateGraph(GraphState)
  .addNode("agent", agent)
  .addNode("retrieve", toolNode)
  .addNode("gradeDocuments", gradeRecomendation)
  .addNode("webSearch", webSearchWrapper)
  .addNode("generate", generate);

// Simplified flow: skip rewrite step to save tokens
workflow.addEdge(START, "agent");
workflow.addConditionalEdges("agent", shouldRecommend);
workflow.addEdge("retrieve", "gradeDocuments");
workflow.addConditionalEdges("gradeDocuments", checkRelevance, {
  yes: "generate",
  no: "webSearch",
});
workflow.addEdge("webSearch", "generate");
workflow.addEdge("generate", END);

const runner = workflow.compile();

/**
 * Streams recommendations for a given user query using the token-optimized agentic RAG workflow.
 * Optimized for Gemini API free tier limits.
 * Usage example:
 *
 *   for await (const output of streamRecommendations("your query here")) {
 *     // handle output
 *   }
 */
export async function* streamRecommendations(query: string) {
  // Check if we should throttle due to rate limits
  if (tokenTracker.shouldThrottle()) {
    const stats = tokenTracker.getUsageStats();
    yield {
      node: "rate_limit",
      type: "error",
      content: `Rate limit protection: Please wait a moment before making another request. Usage: ${stats.requestsLastMinute}/${stats.limits.requestsPerMinute} requests/min`,
      tool_calls: undefined,
    };
    return;
  }

  // Track initial token usage
  const queryTokens = estimateTokens(query);
  tokenTracker.addUsage(queryTokens, "gemini-2.0-flash");

  const inputs = {
    messages: [new HumanMessage(query)],
  };
  let finalState;
  for await (const output of await runner.stream(inputs)) {
    for (const [key, value] of Object.entries(output)) {
      if (
        !value ||
        !("messages" in value) ||
        !Array.isArray((value as any).messages) ||
        !(value as any).messages.length
      ) {
        continue;
      }
      const messages = (value as any).messages;
      const lastMsg = messages[messages.length - 1];

      // Track token usage for AI responses
      if (lastMsg.content && typeof lastMsg.content === "string") {
        const responseTokens = estimateTokens(lastMsg.content);
        tokenTracker.addUsage(responseTokens, "gemini-2.0-flash");
      }

      // Use safe access for tool_calls
      yield {
        node: key,
        type: lastMsg._getType ? lastMsg._getType() : lastMsg.type || "unknown",
        content: lastMsg.content,
        tool_calls:
          "tool_calls" in lastMsg ? (lastMsg as any).tool_calls : undefined,
      };
      finalState = value;
    }
  }
  // Optionally yield the final state
  yield { finalState };
}
