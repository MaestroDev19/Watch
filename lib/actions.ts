"use server";

import { streamRecommendations } from "./rag";
import { webTool } from "./tools";

/**
 * Serializes a LangChain message object to a plain object
 * that can be safely passed to client components
 */
function serializeMessage(message: any) {
  if (!message) return null;

  // Handle complex content structures
  let serializedContent = message.content;
  if (Array.isArray(message.content)) {
    // Handle array content (e.g., from function calls)
    serializedContent = message.content
      .map((item: any) => {
        if (typeof item === "object" && item !== null) {
          return JSON.stringify(item);
        }
        return item;
      })
      .join("\n");
  } else if (typeof message.content === "object" && message.content !== null) {
    // Handle object content
    serializedContent = JSON.stringify(message.content, null, 2);
  }

  return {
    type: message._getType ? message._getType() : message.type,
    content: serializedContent,
    tool_calls: message.tool_calls || undefined,
    additional_kwargs: message.additional_kwargs || {},
    usage_metadata: message.usage_metadata || undefined,
    response_metadata: message.response_metadata || undefined,
  };
}

/**
 * Serializes the streamed output to plain objects
 * that can be safely passed to client components
 */
function serializeOutput(output: any) {
  if (!output) return null;

  if (output.finalState) {
    return {
      finalState: {
        messages: output.finalState.messages?.map(serializeMessage) || [],
      },
    };
  }

  return {
    node: output.node,
    type: output.type,
    content: output.content,
    tool_calls: output.tool_calls,
  };
}

/**
 * Server action to get recommendations for a query.
 * Usage: await getRecommendations(query)
 */
export async function getRecommendations(query: string) {
  const results = [];
  for await (const output of streamRecommendations(query)) {
    const serializedOutput = serializeOutput(output);
    if (serializedOutput) {
      results.push(serializedOutput);
    }
  }
  return results;
}

/**
 * Test function to check if web search (Tavily) is working
 */
export async function testWebSearch(query: string = "best cop TV shows") {
  try {
    console.log("Testing web search with query:", query);
    const result = await webTool.invoke({ query });
    console.log("Web search test successful:", result);
    return { success: true, result };
  } catch (error) {
    console.error("Web search test failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}
