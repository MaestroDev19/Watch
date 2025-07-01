"use client";
import { useState } from "react";
import { Tv, Brain } from "lucide-react";

export default function Homepage() {
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Welcome to the Homepage</h1>
    </div>
  );
}
