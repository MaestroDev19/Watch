"use client";
import type { Movies, Trending, TvShows } from "@/types";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { convertToDecimal } from "@/lib/utils";
import { AddToWatchlistIcon } from "@/components/watchlist/add-to-watchlist-button";

interface MovieCardProps {
  item: Trending | Movies | TvShows;
  aspectRatio?: "portrait" | "square" | "video";
  width?: number;
  height?: number;
}

export function MovieCard({
  item,
  aspectRatio = "portrait",
  width,
  height,
}: MovieCardProps) {
  const route = useRouter();
  // Determine aspect ratio class
  const aspectRatioClass = {
    portrait: "aspect-[2/3]",
    square: "aspect-square",
    video: "aspect-video",
  }[aspectRatio];

  // Get title based on media type
  const title =
    "name" in item ? item.name : "title" in item ? item.title : "Unknown Title";

  // Get media type
  const mediaType = "name" in item ? "tv" : "movie";

  // Get release year if available
  const releaseDate =
    "release_date" in item
      ? item.release_date
      : "first_air_date" in item
      ? item.first_air_date
      : "";
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : null;

  return (
    <div
      className="group block w-full"
      onClick={() => route.push(`/${mediaType}/${item.id}`)}
    >
      <div className="relative overflow-hidden rounded-lg cursor-pointer transition-transform duration-300 hover:scale-105 w-full">
        {/* Movie poster */}
        <div className={`relative ${aspectRatioClass} overflow-hidden w-full`}>
          {item.poster_path ? (
            <img
              src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE}${item.poster_path}`}
              alt={title}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover w-full h-full"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <span className="text-xs sm:text-sm text-gray-400">No image</span>
            </div>
          )}

          {/* Gradient overlay - always visible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>

          {/* Add to Watchlist button - appears on hover */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <AddToWatchlistIcon
              item={item}
              className="bg-white/90 hover:bg-white shadow-md"
            />
          </div>
        </div>

        {/* Content below the image */}
        <div className="mt-2 space-y-1">
          {/* Title */}
          <h3 className="line-clamp-1 font-medium text-sm">{title}</h3>

          {/* Year and Rating */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div>{releaseYear}</div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span>{convertToDecimal(item.vote_average || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
