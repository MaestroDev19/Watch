"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MovieCard } from "./movie-card";
import { getRecommendations } from "../lib/actions";
import { testWebSearch } from "../lib/actions";

const formSchema = z.object({
  query: z.string().min(1, {
    message: "Query is required",
  }),
});

const loadingTexts: string[] = [
  "Locking in...",
  "Cooking...",
  "Chill, I got you...",
  "Almost ready...",
];

export default function Recommend() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(loadingTexts[0]);
  const [textIndex, setTextIndex] = useState(0);
  const [streamed, setStreamed] = useState<any[]>([]);
  const [response, setResponse] = useState<any | null>(null);
  const [webSearchTest, setWebSearchTest] = useState<any | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  // Effect to cycle through loading texts when loading
  useEffect(() => {
    if (!isLoading) {
      setTextIndex(0);
      setLoadingText(loadingTexts[0]);
      return;
    }

    const interval = setInterval(() => {
      setTextIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % loadingTexts.length;
        setLoadingText(loadingTexts[nextIndex]);
        return nextIndex;
      });
    }, 2000); // Change text every 2 seconds

    return () => clearInterval(interval);
  }, [isLoading]);

  // Handle form submit with real streaming
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setStreamed([]);
    setResponse(null);

    try {
      // Call the server action to get recommendations (streamed)
      const results = await getRecommendations(values.query);
      setStreamed(results);

      // Debug: log the results to console
      console.log("Full results:", results);
      console.log(
        "Workflow trace:",
        results.map((r) => r.node).filter(Boolean)
      );

      // Check if web search was executed
      const webSearchExecuted = results.some((r) => r.node === "webSearch");
      console.log("Web search executed:", webSearchExecuted);

      if (webSearchExecuted) {
        const webSearchResult = results.find((r) => r.node === "webSearch");
        console.log("Web search result:", webSearchResult);
      }

      // Find the final generated response with recommendations
      const finalOutput = results.find((r) => r.finalState);
      if (
        finalOutput &&
        finalOutput.finalState &&
        finalOutput.finalState.messages
      ) {
        // Debug: log the messages
        console.log("Final messages:", finalOutput.finalState.messages);

        // Look for the actual generated recommendation (from the generate node)
        const generateNodeOutput = results.find((r) => r.node === "generate");
        if (
          generateNodeOutput &&
          generateNodeOutput.content &&
          typeof generateNodeOutput.content === "string"
        ) {
          setResponse({
            recommendations: generateNodeOutput.content,
            usage: null, // Generate node output might not have usage data
          });
        } else {
          // Fallback: Extract the last AI message that contains actual recommendations (not function calls)
          const messages = [...finalOutput.finalState.messages];
          const lastAIMessage = messages.reverse().find(
            (msg: any) =>
              msg.type === "ai" &&
              msg.content &&
              typeof msg.content === "string" &&
              !msg.content.includes("functionCall") &&
              !msg.content.includes("tool_call") &&
              !msg.content.includes('{"') && // Avoid JSON content
              msg.content.length > 50 // Ensure it's substantial content
          );

          if (lastAIMessage && lastAIMessage.content) {
            setResponse({
              recommendations: lastAIMessage.content,
              usage: lastAIMessage.usage_metadata,
            });
          } else {
            // No recommendations found
            setResponse({
              error:
                "No recommendations were generated. Please try a different query.",
            });
          }
        }
      } else {
        setResponse({
          error:
            "The workflow completed but no final recommendations were found.",
        });
      }
    } catch (error) {
      console.error("Error getting recommendations:", error);
      setResponse({
        error: "Failed to get recommendations. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test web search function
  const handleTestWebSearch = async () => {
    setWebSearchTest({ loading: true });
    try {
      const result = await testWebSearch("best cop TV shows");
      setWebSearchTest(result);
    } catch (error) {
      setWebSearchTest({ success: false, error: String(error) });
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto space-y-8">
      {/* Test Web Search Button */}
      <div className="flex gap-2">
        <Button
          onClick={handleTestWebSearch}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          Test Web Search
        </Button>
        {webSearchTest && (
          <div className="text-xs text-gray-600">
            {webSearchTest.loading
              ? "Testing..."
              : webSearchTest.success
              ? "✅ Web search working"
              : "❌ Web search failed"}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormControl>
                      <Input
                        className="py-6 col-span-1 md:col-span-2"
                        placeholder="e.g. 'action', 'comedy', 'drama'"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="py-6 whitespace-nowrap min-w-0 flex-shrink-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin flex-shrink-0" />
                    <span className="truncate">{loadingText}</span>
                  </>
                ) : (
                  "Get Recs"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Streamed outputs - only show during loading for debugging */}
      {isLoading && streamed.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">Processing...</h3>
          {streamed.slice(-3).map((item, idx) => {
            // Map technical node names to user-friendly descriptions
            const nodeDescriptions: Record<string, string> = {
              agent: "🤖 Analyzing your request",
              retrieve: "📚 Searching database",
              gradeDocuments: "📊 Evaluating results",
              webSearch: "🌐 Searching the web",
              rewrite: "✍️ Refining query",
              generate: "✨ Generating recommendations",
            };

            const description =
              nodeDescriptions[item.node] || `Processing: ${item.node}`;

            return (
              <Card key={idx} className="text-xs">
                <CardContent className="p-3">
                  <div className="text-gray-700">{description}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Final recommendations */}
      {response && !isLoading && (
        <div className="space-y-4">
          {response.error ? (
            <Card>
              <CardContent className="p-4">
                <div className="text-red-600">{response.error}</div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap">
                  {response.recommendations}
                </div>
                {response.usage && (
                  <div className="mt-4 text-xs text-gray-500">
                    Tokens used: {response.usage.total_tokens}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
