// Watchlist-related types
export type WatchStatus = "watched" | "plan_to_watch" | "currently_watching";

/**
 * Represents a single item in a user's watchlist
 */
export interface WatchlistItem {
  id: string;
  displayTitle: string;
  posterPath: string | null;
  average: number;
  mediaType: "movie" | "tv";
  watchStatus: WatchStatus;
  dateAdded: string;
  dateWatched?: string;
}

/**
 * Represents a user's complete watchlist organized by media type
 */
export interface Watchlist {
  movies: WatchlistItem[];
  tvShows: WatchlistItem[];
  totalItems: number;
  watchedCount: number;
  planToWatchCount: number;
  currentlyWatchingCount: number;
}

// Base interface for common properties between Movies and TV Shows
export interface BaseMediaItem {
  id: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  vote_count: number;
  overview: string;
  popularity: number;
  homepage?: string;
  status: string;
  genres: { id: number; name: string }[];
  original_language: string;
  tagline?: string;
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
}

export interface Movies extends BaseMediaItem {
  title: string;
  adult: "true" | "false";
  runtime: number;
  release_date: string;
  budget: number;
  revenue: number;
  spoken_languages: { english_name: string }[];
  belongs_to_collection?: {
    id: number;
    name: string;
  };
}

export interface TvShows extends BaseMediaItem {
  name: string;
  type: string;
  first_air_date: string;
  last_air_date: string;
  number_of_episodes: number;
  number_of_seasons: number;
  episode_run_time: number[];
  in_production: boolean;
  languages: string[];
  networks: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];
  next_episode_to_air?: {
    air_date: string;
    episode_number: number;
    season_number: number;
  };
}

export interface Trending extends BaseMediaItem {
  title?: string;
  name?: string; // For TV shows
  media_type: "movie" | "tv"; // To distinguish between movies and TV shows
  release_date?: string; // For movies
  first_air_date?: string; // For TV shows
}
