"use client";

import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface MoodOption {
  id: string;
  emoji: string;
  label: string;
  description: string;
  prompt: string;
  color: string;
}

interface MoodSelectorProps {
  onMoodSelect: (mood: MoodOption) => void;
  isLoading?: boolean;
  className?: string;
}

const moodOptions: MoodOption[] = [
  {
    id: "happy",
    emoji: "😊",
    label: "Happy & Uplifting",
    description: "Feel-good movies and shows",
    prompt:
      "Recommend a list of happy, uplifting, and feel-good movies or TV shows across genres like comedy, musical, light romance, or slice-of-life. Do not ask any questions. Just return great content that keeps my mood high.",
    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  },
  {
    id: "excited",
    emoji: "🤩",
    label: "Thrilled & Energetic",
    description: "Action-packed adventures",
    prompt:
      "Provide high-energy, adrenaline-pumping movie or TV show recommendations in genres like action, thriller, sci-fi, heist, or superhero. Focus on content that matches an excited, energetic mood. No questions—just a thrilling list.",
    color: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  },
  {
    id: "chill",
    emoji: "😌",
    label: "Calm & Relaxed",
    description: "Easy-watching content",
    prompt:
      "Suggest chill, easy-to-watch TV shows or movies in genres like slice-of-life, light comedy, slow-paced drama, or cozy documentary. Match a relaxed, laid-back mood. Don’t ask any questions—just recommend.",
    color: "bg-green-100 text-green-800 hover:bg-green-200",
  },
  {
    id: "romantic",
    emoji: "🥰",
    label: "Romantic & Loving",
    description: "Love stories and romance",
    prompt:
      "List romantic movies or TV shows focused on love stories, emotional connection, or meaningful relationships. Include genres like romantic drama, romantic comedy, and teen romance. No questions—just warm, loving content.",
    color: "bg-pink-100 text-pink-800 hover:bg-pink-200",
  },
  {
    id: "mysterious",
    emoji: "🤔",
    label: "Curious & Intrigued",
    description: "Mystery and thrillers",
    prompt:
      "Give a list of mysterious and suspenseful movies or shows. Focus on genres like mystery, psychological thriller, crime drama, and noir. Prioritize stories with plot twists and intrigue. No questions, just deliver the mystery.",
    color: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  },
  {
    id: "nostalgic",
    emoji: "🥺",
    label: "Nostalgic & Sentimental",
    description: "Classic and heartfelt stories",
    prompt:
      "Recommend sentimental and nostalgic films or shows, such as coming-of-age dramas, childhood favorites, or classic TV series and movies. Think timeless or emotionally resonant. Just list them—no questions.",
    color: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  },
  {
    id: "adventurous",
    emoji: "🧗",
    label: "Adventurous & Bold",
    description: "Epic journeys and exploration",
    prompt:
      "Suggest adventurous and epic storytelling in genres like fantasy, road-trip, sci-fi, survival, or historical adventure. I want a bold journey. No questions—just immersive, explorative recommendations.",
    color: "bg-teal-100 text-teal-800 hover:bg-teal-200",
  },
  {
    id: "thoughtful",
    emoji: "🧠",
    label: "Thoughtful & Cerebral",
    description: "Deep and meaningful content",
    prompt:
      "Provide a list of intellectually stimulating and thought-provoking movies or shows in genres like psychological drama, philosophical sci-fi, or meaningful documentary. Prioritize complexity and depth. No follow-up questions—just deliver.",
    color: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
  },
  {
    id: "cozy",
    emoji: "🏠",
    label: "Cozy & Comfortable",
    description: "Comfort viewing",
    prompt:
      "Give me cozy and comforting movie or show suggestions in genres like family drama, small-town slice-of-life, or familiar sitcoms. I want warm, soft content that feels like a hug. No questions—just make it cozy.",
    color: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  },
  {
    id: "dramatic",
    emoji: "🎭",
    label: "Emotional & Dramatic",
    description: "Intense emotional stories",
    prompt:
      "List emotionally intense, dramatic movies or shows in genres like drama, tragedy, biopic, or melodrama. I want powerful performances and layered emotional arcs. No questions, just deliver the drama.",
    color: "bg-red-100 text-red-800 hover:bg-red-200",
  },
];

export function MoodSelector({
  onMoodSelect,
  isLoading = false,
  className,
}: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMoodClick = (mood: MoodOption) => {
    setSelectedMood(mood.id);
    onMoodSelect(mood);
  };

  const handleSurpriseMe = () => {
    const randomMood =
      moodOptions[Math.floor(Math.random() * moodOptions.length)];
    handleMoodClick(randomMood);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">How are you feeling?</CardTitle>
        </div>
        <p className="text-sm text-foreground/60">
          Pick your mood and get instant recommendations tailored to how you
          feel right now.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Mood Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {moodOptions.map((mood) => (
              <Button
                key={mood.id}
                variant="outline"
                className={`h-auto flex flex-col items-center gap-2 p-3 transition-all duration-200 ${
                  selectedMood === mood.id
                    ? "ring-2 ring-primary ring-offset-2 bg-primary/5"
                    : "hover:scale-105"
                } ${
                  isLoading && selectedMood === mood.id ? "animate-pulse" : ""
                }`}
                onClick={() => handleMoodClick(mood)}
                disabled={isLoading}
              >
                <span className="text-2xl" role="img" aria-label={mood.label}>
                  {mood.emoji}
                </span>
                <div className="text-center">
                  <div className="font-medium text-xs leading-tight">
                    {mood.label}
                  </div>
                  <div className="text-xs text-foreground/50 mt-1">
                    {mood.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Surprise Me Button */}
          <div className="pt-2 border-t">
            <Button
              onClick={handleSurpriseMe}
              disabled={isLoading}
              variant="ghost"
              className="w-full flex items-center gap-2 text-foreground/70 hover:text-foreground"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Surprise me with something random!
            </Button>
          </div>

          {/* Selected Mood Display */}
          {selectedMood && !isLoading && (
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground/60">
                  Selected mood:
                </span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>
                    {moodOptions.find((m) => m.id === selectedMood)?.emoji}
                  </span>
                  {moodOptions.find((m) => m.id === selectedMood)?.label}
                </Badge>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && selectedMood && (
            <div className="pt-2">
              <div className="flex items-center gap-2 text-sm text-foreground/60">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Getting recommendations for your mood...
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { moodOptions };
