"use client";

import { useState } from "react";
import { MoodSelector, type MoodOption } from "./mood-selector";
import { MoodRecommendations } from "./mood-recommendations";

interface MoodPicksContainerProps {
  className?: string;
}

export function MoodPicksContainer({ className }: MoodPicksContainerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMoodSelect = (mood: MoodOption) => {
    setSelectedMood(mood);
    setIsLoading(true);

    // The MoodRecommendations component will handle the loading state
    // We just need to set this for the selector's loading display
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleBack = () => {
    setSelectedMood(null);
    setIsLoading(false);
  };

  // If a mood is selected, show recommendations
  if (selectedMood) {
    return (
      <MoodRecommendations
        selectedMood={selectedMood}
        onBack={handleBack}
        className={className}
      />
    );
  }

  // Otherwise show mood selector
  return (
    <MoodSelector
      onMoodSelect={handleMoodSelect}
      isLoading={isLoading}
      className={className}
    />
  );
}
