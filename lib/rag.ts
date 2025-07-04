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
vectorStore.asRetriever();

const retriever = vectorStore.asRetriever();
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.1,
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  streaming: true,
});

const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
});

const tool = createRetrieverTool(retriever, {
  name: "recommend_tv_shows_and_movies",
  description: "Search and return relevant tv shows and movies.",
});
const tools = [tool];

const toolNode = new ToolNode<typeof GraphState.State>(tools);

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

async function gradeRecomendation(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("------Grading the recommendation------");
  const { messages } = state;
  const prompt = ChatPromptTemplate.fromTemplate(gradePrompt);
  const model = llm.bindTools([gradeTool], {
    tool_choice: gradeTool.name,
  });
  const chain = prompt.pipe(model);

  const lastMessage = messages[messages.length - 1];
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

  const { messages } = state;
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

async function rewrite(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---TRANSFORM QUERY---");

  const { messages } = state;
  const question = messages[0].content as string;
  const prompt = ChatPromptTemplate.fromTemplate(rewritePrompt);

  const model = llm;
  const response = await prompt.pipe(model).invoke({ question });
  return {
    messages: [response],
  };
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

  const docs = lastToolMessage.content as string;

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

// Create a wrapper for webSearch to add debugging
async function webSearchWrapper(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("------STARTING WEB SEARCH------");
  const { messages } = state;

  try {
    // Get the user's original question
    const question = messages[0].content as string;
    console.log("Web search query:", question);

    // Call the webTool (Tavily search)
    const searchResults = await webTool.invoke({ query: question });
    console.log("Web search results:", searchResults);

    return {
      messages: [
        {
          content: searchResults,
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

const workflow = new StateGraph(GraphState)
  .addNode("agent", agent)
  .addNode("retrieve", toolNode)
  .addNode("gradeDocuments", gradeRecomendation)
  .addNode("webSearch", webSearchWrapper)
  .addNode("rewrite", rewrite)
  .addNode("generate", generate);

workflow.addEdge(START, "rewrite");
workflow.addEdge("rewrite", "agent");
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
 * Streams recommendations for a given user query using the agentic RAG workflow.
 * Usage example:
 *
 *   for await (const output of streamRecommendations("your query here")) {
 *     // handle output
 *   }
 */
export async function* streamRecommendations(query: string) {
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
