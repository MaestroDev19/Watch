import { TavilySearch } from "@langchain/tavily";
import { z } from "zod";
const webTool = new TavilySearch({
  tavilyApiKey: process.env.TAVILY_API_KEY,
  maxResults: 5,
});

export { webTool };

const gradeTool = {
  name: "give_relevance_score",
  description: "Give a relevance score to the retrieved documents.",
  schema: z.object({
    binaryScore: z.string().describe("Relevance score 'yes' or 'no'"),
  }),
};
export { gradeTool };
