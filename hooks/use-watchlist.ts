"use client";

import { useState, useCallback, useEffect } from "react";
import { useLocalStorage } from "./use-local-storage";
import {
  addToWatchlist as addToWatchlistStorage,
  removeFromWatchlist as removeFromWatchlistStorage,
  updateWatchStatus as updateWatchStatusStorage,
  isInWatchlist as checkIsInWatchlist,
  getWatchlistStats,
  clearWatchlist as clearWatchlistStorage,
  WATCHLIST_STORAGE_KEY,
  WATCHLIST_MAX_ITEMS,
} from "@/lib/watchlist-storage";
import {
  handleWatchlistError,
  safeLocalStorageOperation,
  attemptDataRecovery,
  WatchlistError,
  WatchlistErrorType,
} from "@/lib/watchlist-error-handling";
import type {
  WatchlistItem,
  WatchStatus,
  Movies,
  TvShows,
  Trending,
} from "@/types";

export interface UseWatchlistReturn {
  // State
  items: WatchlistItem[];
  isLoading: boolean;
  error: string | null;
  lastError: WatchlistError | null;

  // Statistics
  stats: {
    totalItems: number;
    watchedCount: number;
    planToWatchCount: number;
    currentlyWatchingCount: number;
    averageRating: number;
  };

  // Actions
  addToWatchlist: (
    item: Movies | TvShows | Trending,
    status?: WatchStatus
  ) => Promise<{ success: boolean; error?: WatchlistError }>;
  removeFromWatchlist: (
    itemId: string
  ) => Promise<{ success: boolean; error?: WatchlistError }>;
  updateWatchStatus: (
    itemId: string,
    status: WatchStatus
  ) => Promise<{ success: boolean; error?: WatchlistError }>;
  isInWatchlist: (itemId: string) => boolean;
  clearWatchlist: () => Promise<{ success: boolean; error?: WatchlistError }>;

  // Utilities
  getMovies: () => WatchlistItem[];
  getTvShows: () => WatchlistItem[];
  getItemsByStatus: (status: WatchStatus) => WatchlistItem[];
  refreshWatchlist: () => void;

  // Error recovery
  attemptRecovery: () => Promise<{ success: boolean; message: string }>;
  clearErrors: () => void;
}

/**
 * Custom hook for managing watchlist state and operations
 */
export function useWatchlist(): UseWatchlistReturn {
  const [items, setItems, clearStorage] = useLocalStorage<WatchlistItem[]>(
    WATCHLIST_STORAGE_KEY,
    []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastError, setLastError] = useState<WatchlistError | null>(null);

  // Calculate statistics whenever items change
  const stats = getWatchlistStats(items);

  // Clear any existing error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  /**
   * Add item to watchlist
   */
  const addToWatchlist = useCallback(
    async (
      item: Movies | TvShows | Trending,
      status: WatchStatus = "plan_to_watch"
    ): Promise<{ success: boolean; error?: WatchlistError }> => {
      setIsLoading(true);
      setError(null);
      setLastError(null);

      const { result, error: operationError } = safeLocalStorageOperation(
        () => {
          const result = addToWatchlistStorage(items, item, status);
          if (result.success) {
            setItems(result.items);
          }
          return result;
        },
        { success: false, items: [] },
        "addToWatchlist"
      );

      if (operationError) {
        setError(operationError.userMessage);
        setLastError(operationError);
        setIsLoading(false);
        return { success: false, error: operationError };
      }

      if (!result.success) {
        const error = new WatchlistError(
          WatchlistErrorType.UNKNOWN_ERROR,
          result.error || "Failed to add item to watchlist",
          result.error || "Failed to add item to watchlist"
        );
        setError(error.userMessage);
        setLastError(error);
        setIsLoading(false);
        return { success: false, error };
      }

      setIsLoading(false);
      return { success: true };
    },
    [items, setItems]
  );

  /**
   * Remove item from watchlist
   */
  const removeFromWatchlist = useCallback(
    async (
      itemId: string
    ): Promise<{ success: boolean; error?: WatchlistError }> => {
      setIsLoading(true);
      setError(null);
      setLastError(null);

      const { result, error: operationError } = safeLocalStorageOperation(
        () => {
          const result = removeFromWatchlistStorage(items, itemId);
          if (result.success) {
            setItems(result.items);
          }
          return result;
        },
        { success: false, items: [] },
        "removeFromWatchlist"
      );

      if (operationError) {
        setError(operationError.userMessage);
        setLastError(operationError);
        setIsLoading(false);
        return { success: false, error: operationError };
      }

      if (!result.success) {
        const error = new WatchlistError(
          WatchlistErrorType.ITEM_NOT_FOUND,
          "Failed to remove item from watchlist",
          "The item you're trying to remove was not found in your watchlist"
        );
        setError(error.userMessage);
        setLastError(error);
        setIsLoading(false);
        return { success: false, error };
      }

      setIsLoading(false);
      return { success: true };
    },
    [items, setItems]
  );

  /**
   * Update watch status of an item
   */
  const updateWatchStatus = useCallback(
    async (
      itemId: string,
      status: WatchStatus
    ): Promise<{ success: boolean; error?: WatchlistError }> => {
      setIsLoading(true);
      setError(null);
      setLastError(null);

      const { result, error: operationError } = safeLocalStorageOperation(
        () => {
          const result = updateWatchStatusStorage(items, itemId, status);
          if (result.success) {
            setItems(result.items);
          }
          return result;
        },
        { success: false, items: [] },
        "updateWatchStatus"
      );

      if (operationError) {
        setError(operationError.userMessage);
        setLastError(operationError);
        setIsLoading(false);
        return { success: false, error: operationError };
      }

      if (!result.success) {
        const error = new WatchlistError(
          WatchlistErrorType.ITEM_NOT_FOUND,
          "Failed to update watch status",
          "The item you're trying to update was not found in your watchlist"
        );
        setError(error.userMessage);
        setLastError(error);
        setIsLoading(false);
        return { success: false, error };
      }

      setIsLoading(false);
      return { success: true };
    },
    [items, setItems]
  );

  /**
   * Check if item is in watchlist
   */
  const isInWatchlist = useCallback(
    (itemId: string): boolean => {
      return checkIsInWatchlist(items, itemId);
    },
    [items]
  );

  /**
   * Clear entire watchlist
   */
  const clearWatchlist = useCallback(async (): Promise<{
    success: boolean;
    error?: WatchlistError;
  }> => {
    setIsLoading(true);
    setError(null);
    setLastError(null);

    const { result, error: operationError } = safeLocalStorageOperation(
      () => {
        const success = clearWatchlistStorage();
        if (success) {
          setItems([]);
        }
        return success;
      },
      false,
      "clearWatchlist"
    );

    if (operationError) {
      setError(operationError.userMessage);
      setLastError(operationError);
      setIsLoading(false);
      return { success: false, error: operationError };
    }

    if (!result) {
      const error = new WatchlistError(
        WatchlistErrorType.UNKNOWN_ERROR,
        "Failed to clear watchlist",
        "Unable to clear your watchlist. Please try again."
      );
      setError(error.userMessage);
      setLastError(error);
      setIsLoading(false);
      return { success: false, error };
    }

    setIsLoading(false);
    return { success: true };
  }, [setItems]);

  /**
   * Get only movies from watchlist
   */
  const getMovies = useCallback((): WatchlistItem[] => {
    return items.filter((item) => item.mediaType === "movie");
  }, [items]);

  /**
   * Get only TV shows from watchlist
   */
  const getTvShows = useCallback((): WatchlistItem[] => {
    return items.filter((item) => item.mediaType === "tv");
  }, [items]);

  /**
   * Get items by watch status
   */
  const getItemsByStatus = useCallback(
    (status: WatchStatus): WatchlistItem[] => {
      return items.filter((item) => item.watchStatus === status);
    },
    [items]
  );

  /**
   * Refresh watchlist from storage (useful for debugging or manual refresh)
   */
  const refreshWatchlist = useCallback(() => {
    // Force re-read from localStorage
    const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (stored) {
      try {
        const parsedItems: WatchlistItem[] = JSON.parse(stored);
        setItems(parsedItems);
      } catch (err) {
        setError("Failed to refresh watchlist from storage");
      }
    }
  }, [setItems]);

  /**
   * Attempt recovery from errors
   */
  const attemptRecovery = useCallback(async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    setIsLoading(true);

    try {
      const recovery = attemptDataRecovery();

      if (recovery.success && recovery.recoveredData) {
        setItems(recovery.recoveredData);
        setError(null);
        setLastError(null);
        setIsLoading(false);
        return { success: true, message: recovery.message };
      } else {
        setIsLoading(false);
        return { success: false, message: recovery.message };
      }
    } catch (err) {
      setIsLoading(false);
      return {
        success: false,
        message: `Recovery failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      };
    }
  }, [setItems]);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setError(null);
    setLastError(null);
  }, []);

  return {
    // State
    items,
    isLoading,
    error,
    lastError,

    // Statistics
    stats: {
      totalItems: stats.totalItems,
      watchedCount: stats.watchedCount,
      planToWatchCount: stats.planToWatchCount,
      currentlyWatchingCount: stats.currentlyWatchingCount,
      averageRating: stats.averageRating,
    },

    // Actions
    addToWatchlist,
    removeFromWatchlist,
    updateWatchStatus,
    isInWatchlist,
    clearWatchlist,

    // Utilities
    getMovies,
    getTvShows,
    getItemsByStatus,
    refreshWatchlist,

    // Error recovery
    attemptRecovery,
    clearErrors,
  };
}

/**
 * Hook for checking if a specific item is in the watchlist (optimized for performance)
 */
export function useIsInWatchlist(itemId: string): boolean {
  const [items] = useLocalStorage<WatchlistItem[]>(WATCHLIST_STORAGE_KEY, []);
  return checkIsInWatchlist(items, itemId);
}

/**
 * Hook for getting watchlist statistics only (lightweight)
 */
export function useWatchlistStats() {
  const [items] = useLocalStorage<WatchlistItem[]>(WATCHLIST_STORAGE_KEY, []);
  return getWatchlistStats(items);
}
