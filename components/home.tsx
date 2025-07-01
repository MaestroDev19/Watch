"use client";
import { useState } from "react";
import { Tv, Brain } from "lucide-react";
import Recommend from "./recommend";

export default function Homepage() {
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null);
  return (
    <section className="min-h-dvh flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col space-y-8 items-center justify-center">
          <div className="text-center space-y-4 py-12">
            <h1 className="text-4xl font-bold">
              What Are You in the Mood to{" "}
              <span className="text-primary font-bold underline underline-offset-2">
                Watch?
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Discover your next favorite show through intelligent conversation.
              No more endless scrolling—just tell us what you're looking for.
            </p>
          </div>
          <Recommend />
        </div>
      </div>
    </section>
  );
}
