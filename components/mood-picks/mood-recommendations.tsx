"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MovieCard } from "@/components/movie-card";
import { AddToWatchlistButton } from "@/components/watchlist";
import { getRecommendations } from "@/lib/actions";
import type { MoodOption } from "./mood-selector";
import type { Movies, TvShows, Trending } from "@/types";

interface MoodRecommendationsProps {
  selectedMood: MoodOption | null;
  onBack: () => void;
  className?: string;
}

interface RecommendationResult {
  content?: string;
  movies?: (Movies | TvShows | Trending)[];
  error?: string;
}

export function MoodRecommendations({
  selectedMood,
  onBack,
  className,
}: MoodRecommendationsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] =
    useState<RecommendationResult | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Auto-fetch recommendations when mood is selected
  useEffect(() => {
    if (selectedMood) {
      fetchRecommendations();
    }
  }, [selectedMood]);

  const fetchRecommendations = async () => {
    if (!selectedMood) return;

    setIsLoading(true);
    setStartTime(Date.now());
    setRecommendations(null);

    try {
      // Use the existing recommendation system
      const results = await getRecommendations(selectedMood.prompt);

      // Process the results similar to the recommend component
      const finalOutput = results.find((r) => r.finalState);
      if (finalOutput?.finalState?.messages) {
        const generateNodeOutput = results.find((r) => r.node === "generate");

        if (
          generateNodeOutput?.content &&
          typeof generateNodeOutput.content === "string"
        ) {
          setRecommendations({
            content: generateNodeOutput.content,
          });
        } else {
          // Fallback: Extract the last AI message with recommendations
          const messages = [...finalOutput.finalState.messages];
          const lastAIMessage = messages
            .reverse()
            .find(
              (msg: any) =>
                msg.type === "ai" &&
                msg.content &&
                typeof msg.content === "string" &&
                !msg.content.includes("functionCall") &&
                !msg.content.includes("tool_call") &&
                !msg.content.includes('{"') &&
                msg.content.length > 50
            );

          if (lastAIMessage?.content) {
            setRecommendations({
              content: lastAIMessage.content,
            });
          } else {
            setRecommendations({
              error:
                "No recommendations were generated. Please try again with a different mood.",
            });
          }
        }
      } else {
        setRecommendations({
          error:
            "Unable to get recommendations at this time. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error getting mood recommendations:", error);
      setRecommendations({
        error:
          "Failed to get recommendations. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatRecommendationText = (text: string) => {
    // Split text into paragraphs and format
    const paragraphs = text.split("\n").filter((p) => p.trim());

    return paragraphs.map((paragraph, index) => {
      // Check if it's a title (contains numbers or bullets)
      const isTitleLine = /^\d+\.|\*\*|^-/.test(paragraph.trim());

      if (isTitleLine) {
        return (
          <div
            key={index}
            className="font-semibold text-foreground mt-4 first:mt-0"
          >
            {paragraph.replace(/\*\*/g, "").trim()}
          </div>
        );
      }

      return (
        <p key={index} className="text-foreground/80 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  const getElapsedTime = () => {
    if (!startTime) return null;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    return elapsed;
  };

  if (!selectedMood) return null;

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="text-2xl"
              role="img"
              aria-label={selectedMood.label}
            >
              {selectedMood.emoji}
            </span>
            <div>
              <CardTitle className="text-lg">{selectedMood.label}</CardTitle>
              <p className="text-sm text-foreground/60 mt-1">
                {selectedMood.description}
              </p>
            </div>
          </div>
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            Pick Different Mood
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <span className="text-foreground/80">
                  Finding perfect matches for your mood...
                </span>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
              {startTime && (
                <div className="flex items-center gap-1 text-xs text-foreground/50">
                  <Clock className="h-3 w-3" />
                  {getElapsedTime()}s
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {recommendations?.error && (
            <div className="text-center py-8 space-y-4">
              <p className="text-red-600">{recommendations.error}</p>
              <Button
                onClick={fetchRecommendations}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Recommendations Content */}
          {recommendations?.content && !isLoading && (
            <div className="space-y-4">
              {/* Performance Info */}
              {startTime && (
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-foreground/70">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Found personalized recommendations for your{" "}
                    {selectedMood.label.toLowerCase()} mood
                  </div>
                  <div className="flex items-center gap-1 text-xs text-foreground/50">
                    <Clock className="h-3 w-3" />
                    {getElapsedTime()}s
                  </div>
                </div>
              )}

              {/* Recommendations Text */}
              <div className="prose max-w-none">
                <div className="space-y-3 text-sm">
                  {formatRecommendationText(recommendations.content)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button
                  onClick={fetchRecommendations}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Get More Suggestions
                </Button>

                <Button onClick={onBack} variant="ghost" size="sm">
                  Change Mood
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
