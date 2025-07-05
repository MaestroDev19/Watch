"use client";

import type {
  WatchlistItem,
  Watchlist,
  WatchStatus,
  Movies,
  TvShows,
  Trending,
} from "@/types";
import { sanitizeWatchlist } from "./watchlist-validation";

// Constants for localStorage keys and limits
export const WATCHLIST_STORAGE_KEY = "picks_watchlist";
export const WATCHLIST_MAX_ITEMS = 50;

/**
 * Create a WatchlistItem from movie/TV show data
 */
export function createWatchlistItem(
  item: Movies | TvShows | Trending,
  watchStatus: WatchStatus = "plan_to_watch"
): WatchlistItem {
  // Determine media type and title
  const isMovie = "title" in item;
  const isTv = "name" in item;
  const mediaType: "movie" | "tv" = isMovie ? "movie" : "tv";

  let displayTitle: string;
  if (isMovie) {
    displayTitle = (item as Movies).title;
  } else if (isTv) {
    displayTitle = (item as TvShows).name;
  } else {
    // For Trending items
    displayTitle =
      (item as Trending).title || (item as Trending).name || "Unknown Title";
  }

  return {
    id: item.id,
    displayTitle,
    posterPath: item.poster_path || null,
    average: item.vote_average,
    mediaType,
    watchStatus,
    dateAdded: new Date().toISOString(),
    dateWatched:
      watchStatus === "watched" ? new Date().toISOString() : undefined,
  };
}

/**
 * Load watchlist from localStorage
 */
export function loadWatchlist(): Watchlist {
  if (typeof window === "undefined") {
    return createEmptyWatchlist();
  }

  try {
    const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!stored) {
      return createEmptyWatchlist();
    }

    const rawItems = JSON.parse(stored);

    // Sanitize and validate items using comprehensive validation
    const validItems = sanitizeWatchlist(rawItems);

    return createWatchlistFromItems(validItems);
  } catch (error) {
    console.error("Error loading watchlist from localStorage:", error);
    return createEmptyWatchlist();
  }
}

/**
 * Save watchlist to localStorage
 */
export function saveWatchlist(items: WatchlistItem[]): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    // Enforce item limit
    const limitedItems = items.slice(0, WATCHLIST_MAX_ITEMS);
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(limitedItems));
    return true;
  } catch (error) {
    console.error("Error saving watchlist to localStorage:", error);
    return false;
  }
}

/**
 * Add item to watchlist
 */
export function addToWatchlist(
  currentItems: WatchlistItem[],
  newItem: Movies | TvShows | Trending,
  watchStatus: WatchStatus = "plan_to_watch"
): { success: boolean; items: WatchlistItem[]; error?: string } {
  // Check if item already exists
  const existingIndex = currentItems.findIndex(
    (item) => item.id === newItem.id
  );
  if (existingIndex !== -1) {
    return {
      success: false,
      items: currentItems,
      error: "Item already in watchlist",
    };
  }

  // Check item limit
  if (currentItems.length >= WATCHLIST_MAX_ITEMS) {
    return {
      success: false,
      items: currentItems,
      error: `Watchlist is full (${WATCHLIST_MAX_ITEMS} items maximum)`,
    };
  }

  // Create new watchlist item
  const watchlistItem = createWatchlistItem(newItem, watchStatus);
  const updatedItems = [watchlistItem, ...currentItems];

  // Save to localStorage
  const saved = saveWatchlist(updatedItems);
  if (!saved) {
    return {
      success: false,
      items: currentItems,
      error: "Failed to save to localStorage",
    };
  }

  return {
    success: true,
    items: updatedItems,
  };
}

/**
 * Remove item from watchlist
 */
export function removeFromWatchlist(
  currentItems: WatchlistItem[],
  itemId: string
): { success: boolean; items: WatchlistItem[] } {
  const updatedItems = currentItems.filter((item) => item.id !== itemId);

  const saved = saveWatchlist(updatedItems);
  return {
    success: saved,
    items: saved ? updatedItems : currentItems,
  };
}

/**
 * Update watch status of an item
 */
export function updateWatchStatus(
  currentItems: WatchlistItem[],
  itemId: string,
  newStatus: WatchStatus
): { success: boolean; items: WatchlistItem[] } {
  const updatedItems = currentItems.map((item) => {
    if (item.id === itemId) {
      return {
        ...item,
        watchStatus: newStatus,
        dateWatched:
          newStatus === "watched" ? new Date().toISOString() : undefined,
      };
    }
    return item;
  });

  const saved = saveWatchlist(updatedItems);
  return {
    success: saved,
    items: saved ? updatedItems : currentItems,
  };
}

/**
 * Check if item is in watchlist
 */
export function isInWatchlist(items: WatchlistItem[], itemId: string): boolean {
  return items.some((item) => item.id === itemId);
}

/**
 * Get watchlist statistics
 */
export function getWatchlistStats(items: WatchlistItem[]) {
  const totalItems = items.length;
  const watchedCount = items.filter(
    (item) => item.watchStatus === "watched"
  ).length;
  const planToWatchCount = items.filter(
    (item) => item.watchStatus === "plan_to_watch"
  ).length;
  const currentlyWatchingCount = items.filter(
    (item) => item.watchStatus === "currently_watching"
  ).length;

  return {
    totalItems,
    watchedCount,
    planToWatchCount,
    currentlyWatchingCount,
    averageRating:
      totalItems > 0
        ? items.reduce((sum, item) => sum + item.average, 0) / totalItems
        : 0,
  };
}

/**
 * Clear entire watchlist
 */
export function clearWatchlist(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    localStorage.removeItem(WATCHLIST_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing watchlist:", error);
    return false;
  }
}

// Helper functions

function createEmptyWatchlist(): Watchlist {
  return {
    movies: [],
    tvShows: [],
    totalItems: 0,
    watchedCount: 0,
    planToWatchCount: 0,
    currentlyWatchingCount: 0,
  };
}

function createWatchlistFromItems(items: WatchlistItem[]): Watchlist {
  const movies = items.filter((item) => item.mediaType === "movie");
  const tvShows = items.filter((item) => item.mediaType === "tv");
  const stats = getWatchlistStats(items);

  return {
    movies,
    tvShows,
    totalItems: stats.totalItems,
    watchedCount: stats.watchedCount,
    planToWatchCount: stats.planToWatchCount,
    currentlyWatchingCount: stats.currentlyWatchingCount,
  };
}

function isValidWatchlistItem(item: any): item is WatchlistItem {
  return (
    item &&
    typeof item === "object" &&
    typeof item.id === "string" &&
    typeof item.displayTitle === "string" &&
    typeof item.average === "number" &&
    (item.mediaType === "movie" || item.mediaType === "tv") &&
    ["watched", "plan_to_watch", "currently_watching"].includes(
      item.watchStatus
    ) &&
    typeof item.dateAdded === "string"
  );
}
