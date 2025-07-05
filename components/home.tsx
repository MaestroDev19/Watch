"use client";
import { useState } from "react";
import {
  Tv,
  Brain,
  Heart,
  ArrowRight,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useWatchlistStats } from "@/hooks/use-watchlist";
import { MoodPicksContainer } from "./mood-picks";
import Recommend from "./recommend";

export default function Homepage() {
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null);
  const [recommendationMode, setRecommendationMode] = useState<
    "mood" | "conversation"
  >("mood");
  const watchlistStats = useWatchlistStats();

  return (
    <section className="min-h-dvh flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col space-y-8 items-center justify-center">
          {/* Watchlist Preview - only show if user has items */}
          {watchlistStats.totalItems > 0 && (
            <Card className="w-full max-w-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <CardTitle className="text-lg">Your Watchlist</CardTitle>
                  </div>
                  <Link href="/watchlist">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      View All
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {watchlistStats.totalItems}
                    </div>
                    <div className="text-sm text-gray-600">Total Items</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {watchlistStats.watchedCount}
                    </div>
                    <div className="text-sm text-gray-600">Watched</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {watchlistStats.currentlyWatchingCount}
                    </div>
                    <div className="text-sm text-gray-600">Watching</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {watchlistStats.planToWatchCount}
                    </div>
                    <div className="text-sm text-gray-600">Plan to Watch</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center space-y-4 py-12">
            <h1 className="text-4xl font-bold">
              What Are You in the Mood to{" "}
              <span className="text-primary font-bold underline underline-offset-2">
                Watch?
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Discover your next favorite show through intelligent conversation
              or quick mood-based picks. No more endless scrolling—just tell us
              what you're looking for.
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex  rounded-lg p-1">
              <Button
                variant={recommendationMode === "mood" ? "default" : "ghost"}
                size="sm"
                onClick={() => setRecommendationMode("mood")}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Quick Mood Picks
              </Button>
              <Button
                variant={
                  recommendationMode === "conversation" ? "default" : "ghost"
                }
                size="sm"
                onClick={() => setRecommendationMode("conversation")}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                AI Conversation
              </Button>
            </div>
          </div>

          {/* Content based on mode */}
          {recommendationMode === "mood" ? (
            <MoodPicksContainer className="w-full max-w-4xl" />
          ) : (
            <Recommend />
          )}
        </div>
      </div>
    </section>
  );
}
