"use client";

import type {
  WatchlistItem,
  WatchStatus,
  Movies,
  TvShows,
  Trending,
} from "@/types";
import { isLocalStorageNearCapacity } from "@/hooks/use-local-storage";

export const WATCHLIST_MAX_ITEMS = 50;
export const WATCHLIST_WARNING_THRESHOLD = 45; // Warn when approaching limit

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

/**
 * Validate if an item can be added to the watchlist
 */
export function validateAddToWatchlist(
  currentItems: WatchlistItem[],
  newItem: Movies | TvShows | Trending
): ValidationResult {
  // Check if item is valid
  const itemValidation = validateMediaItem(newItem);
  if (!itemValidation.isValid) {
    return itemValidation;
  }

  // Check if item already exists
  if (currentItems.some((item) => item.id === newItem.id)) {
    return {
      isValid: false,
      error: "This item is already in your watchlist",
    };
  }

  // Check item limit
  if (currentItems.length >= WATCHLIST_MAX_ITEMS) {
    return {
      isValid: false,
      error: `Your watchlist is full (maximum ${WATCHLIST_MAX_ITEMS} items). Please remove some items first.`,
    };
  }

  // Check localStorage capacity
  if (isLocalStorageNearCapacity()) {
    return {
      isValid: false,
      error:
        "Your browser storage is nearly full. Please clear some data or export your watchlist.",
    };
  }

  // Warning if approaching limit
  const warning =
    currentItems.length >= WATCHLIST_WARNING_THRESHOLD
      ? `You're approaching the watchlist limit (${currentItems.length}/${WATCHLIST_MAX_ITEMS} items)`
      : undefined;

  return {
    isValid: true,
    warning,
  };
}

/**
 * Validate a media item before processing
 */
export function validateMediaItem(
  item: Movies | TvShows | Trending
): ValidationResult {
  if (!item) {
    return {
      isValid: false,
      error: "Invalid item: Item is null or undefined",
    };
  }

  // Check required fields
  if (!item.id || typeof item.id !== "string") {
    return {
      isValid: false,
      error: "Invalid item: Missing or invalid ID",
    };
  }

  if (
    typeof item.vote_average !== "number" ||
    item.vote_average < 0 ||
    item.vote_average > 10
  ) {
    return {
      isValid: false,
      error: "Invalid item: Invalid rating",
    };
  }

  // Check if it has a title
  const hasTitle =
    ("title" in item && item.title) ||
    ("name" in item && item.name) ||
    (item as Trending).title ||
    (item as Trending).name;

  if (!hasTitle) {
    return {
      isValid: false,
      error: "Invalid item: Missing title",
    };
  }

  return { isValid: true };
}

/**
 * Validate a watchlist item structure
 */
export function validateWatchlistItem(item: any): ValidationResult {
  if (!item || typeof item !== "object") {
    return {
      isValid: false,
      error: "Invalid watchlist item: Not an object",
    };
  }

  // Check required string fields
  const requiredStringFields = ["id", "displayTitle", "dateAdded"];
  for (const field of requiredStringFields) {
    if (typeof item[field] !== "string" || !item[field]) {
      return {
        isValid: false,
        error: `Invalid watchlist item: Missing or invalid ${field}`,
      };
    }
  }

  // Check number fields
  if (
    typeof item.average !== "number" ||
    item.average < 0 ||
    item.average > 10
  ) {
    return {
      isValid: false,
      error: "Invalid watchlist item: Invalid average rating",
    };
  }

  // Check mediaType
  if (!["movie", "tv"].includes(item.mediaType)) {
    return {
      isValid: false,
      error: "Invalid watchlist item: Invalid media type",
    };
  }

  // Check watchStatus
  if (
    !["watched", "plan_to_watch", "currently_watching"].includes(
      item.watchStatus
    )
  ) {
    return {
      isValid: false,
      error: "Invalid watchlist item: Invalid watch status",
    };
  }

  // Check posterPath (can be null)
  if (item.posterPath !== null && typeof item.posterPath !== "string") {
    return {
      isValid: false,
      error: "Invalid watchlist item: Invalid poster path",
    };
  }

  // Check dateWatched (optional)
  if (item.dateWatched && typeof item.dateWatched !== "string") {
    return {
      isValid: false,
      error: "Invalid watchlist item: Invalid date watched",
    };
  }

  // Validate date formats
  try {
    new Date(item.dateAdded);
    if (item.dateWatched) {
      new Date(item.dateWatched);
    }
  } catch {
    return {
      isValid: false,
      error: "Invalid watchlist item: Invalid date format",
    };
  }

  return { isValid: true };
}

/**
 * Validate watch status
 */
export function validateWatchStatus(status: any): ValidationResult {
  const validStatuses: WatchStatus[] = [
    "watched",
    "plan_to_watch",
    "currently_watching",
  ];

  if (!validStatuses.includes(status)) {
    return {
      isValid: false,
      error: `Invalid watch status. Must be one of: ${validStatuses.join(
        ", "
      )}`,
    };
  }

  return { isValid: true };
}

/**
 * Validate entire watchlist array
 */
export function validateWatchlistArray(items: any[]): ValidationResult {
  if (!Array.isArray(items)) {
    return {
      isValid: false,
      error: "Invalid watchlist: Not an array",
    };
  }

  if (items.length > WATCHLIST_MAX_ITEMS) {
    return {
      isValid: false,
      error: `Watchlist exceeds maximum limit of ${WATCHLIST_MAX_ITEMS} items`,
    };
  }

  // Check for duplicate IDs
  const ids = items.map((item) => item?.id).filter(Boolean);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    return {
      isValid: false,
      error: "Invalid watchlist: Contains duplicate items",
    };
  }

  // Validate each item
  for (let i = 0; i < items.length; i++) {
    const validation = validateWatchlistItem(items[i]);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: `Item ${i + 1}: ${validation.error}`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Sanitize and clean a watchlist array
 */
export function sanitizeWatchlist(items: any[]): WatchlistItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  const validItems: WatchlistItem[] = [];
  const seenIds = new Set<string>();

  for (const item of items) {
    const validation = validateWatchlistItem(item);

    if (validation.isValid && !seenIds.has(item.id)) {
      // Sanitize the item
      const sanitizedItem: WatchlistItem = {
        id: String(item.id),
        displayTitle: String(item.displayTitle).trim(),
        posterPath: item.posterPath === null ? null : String(item.posterPath),
        average: Math.max(0, Math.min(10, Number(item.average))), // Clamp between 0-10
        mediaType: item.mediaType as "movie" | "tv",
        watchStatus: item.watchStatus as WatchStatus,
        dateAdded: item.dateAdded,
        dateWatched: item.dateWatched || undefined,
      };

      validItems.push(sanitizedItem);
      seenIds.add(item.id);

      // Stop if we reach the limit
      if (validItems.length >= WATCHLIST_MAX_ITEMS) {
        break;
      }
    }
  }

  return validItems;
}

/**
 * Get watchlist capacity info
 */
export function getWatchlistCapacity(currentCount: number) {
  const percentage = (currentCount / WATCHLIST_MAX_ITEMS) * 100;
  const remaining = WATCHLIST_MAX_ITEMS - currentCount;

  return {
    current: currentCount,
    max: WATCHLIST_MAX_ITEMS,
    remaining,
    percentage: Math.round(percentage),
    isFull: currentCount >= WATCHLIST_MAX_ITEMS,
    isNearFull: currentCount >= WATCHLIST_WARNING_THRESHOLD,
  };
}
