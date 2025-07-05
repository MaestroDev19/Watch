"use client";

import { WATCHLIST_STORAGE_KEY } from "./watchlist-storage";

/**
 * Watchlist-specific error types
 */
export enum WatchlistErrorType {
  STORAGE_UNAVAILABLE = "STORAGE_UNAVAILABLE",
  STORAGE_QUOTA_EXCEEDED = "STORAGE_QUOTA_EXCEEDED",
  INVALID_DATA = "INVALID_DATA",
  ITEM_NOT_FOUND = "ITEM_NOT_FOUND",
  DUPLICATE_ITEM = "DUPLICATE_ITEM",
  CAPACITY_EXCEEDED = "CAPACITY_EXCEEDED",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Custom error class for watchlist operations
 */
export class WatchlistError extends Error {
  public readonly type: WatchlistErrorType;
  public readonly recoverable: boolean;
  public readonly userMessage: string;

  constructor(
    type: WatchlistErrorType,
    message: string,
    userMessage?: string,
    recoverable = false
  ) {
    super(message);
    this.name = "WatchlistError";
    this.type = type;
    this.recoverable = recoverable;
    this.userMessage = userMessage || this.getDefaultUserMessage(type);
  }

  private getDefaultUserMessage(type: WatchlistErrorType): string {
    switch (type) {
      case WatchlistErrorType.STORAGE_UNAVAILABLE:
        return "Your browser doesn't support local storage or it's disabled. Your watchlist won't be saved.";
      case WatchlistErrorType.STORAGE_QUOTA_EXCEEDED:
        return "Your browser storage is full. Please clear some data or export your watchlist to free up space.";
      case WatchlistErrorType.INVALID_DATA:
        return "Some watchlist data appears to be corrupted. We've cleaned it up for you.";
      case WatchlistErrorType.ITEM_NOT_FOUND:
        return "The item you're looking for was not found in your watchlist.";
      case WatchlistErrorType.DUPLICATE_ITEM:
        return "This item is already in your watchlist.";
      case WatchlistErrorType.CAPACITY_EXCEEDED:
        return "Your watchlist is full. Please remove some items before adding new ones.";
      case WatchlistErrorType.NETWORK_ERROR:
        return "There was a network error. Please check your connection and try again.";
      default:
        return "Something went wrong with your watchlist. Please try again.";
    }
  }
}

/**
 * Error recovery strategies
 */
export interface ErrorRecoveryResult {
  success: boolean;
  message: string;
  recoveredData?: any;
}

/**
 * Attempt to recover from localStorage errors
 */
export function attemptLocalStorageRecovery(): ErrorRecoveryResult {
  try {
    // Test if localStorage is available
    if (typeof window === "undefined" || !window.localStorage) {
      return {
        success: false,
        message: "LocalStorage is not available in this environment",
      };
    }

    // Test localStorage functionality
    const testKey = "__watchlist_test__";
    const testValue = "test";

    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);

    if (retrieved !== testValue) {
      return {
        success: false,
        message: "LocalStorage is not functioning correctly",
      };
    }

    return {
      success: true,
      message: "LocalStorage is working correctly",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "QuotaExceededError") {
      return {
        success: false,
        message: "Storage quota exceeded",
      };
    }

    return {
      success: false,
      message: `LocalStorage error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Attempt to recover corrupted watchlist data
 */
export function attemptDataRecovery(): ErrorRecoveryResult {
  try {
    const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);

    if (!stored) {
      return {
        success: true,
        message: "No stored data to recover",
        recoveredData: [],
      };
    }

    // Try to parse the data
    let data;
    try {
      data = JSON.parse(stored);
    } catch (parseError) {
      // Attempt to fix common JSON issues
      const fixedData = stored
        .replace(/,\s*}/g, "}") // Remove trailing commas
        .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
        .replace(/'/g, '"'); // Replace single quotes with double quotes

      try {
        data = JSON.parse(fixedData);
      } catch (secondParseError) {
        return {
          success: false,
          message: "Unable to parse watchlist data - data may be corrupted",
        };
      }
    }

    // Validate and clean the data
    if (!Array.isArray(data)) {
      return {
        success: false,
        message: "Watchlist data is not in the expected format",
      };
    }

    // Filter out obviously invalid items
    const validItems = data.filter((item) => {
      return (
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.displayTitle === "string" &&
        typeof item.mediaType === "string" &&
        ["movie", "tv"].includes(item.mediaType)
      );
    });

    return {
      success: true,
      message: `Recovered ${validItems.length} valid items from ${data.length} total items`,
      recoveredData: validItems,
    };
  } catch (error) {
    return {
      success: false,
      message: `Data recovery failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Create a backup of current watchlist data
 */
export function createBackup(): ErrorRecoveryResult {
  try {
    const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);

    if (!stored) {
      return {
        success: true,
        message: "No data to backup",
        recoveredData: null,
      };
    }

    const backupKey = `${WATCHLIST_STORAGE_KEY}_backup_${Date.now()}`;
    localStorage.setItem(backupKey, stored);

    return {
      success: true,
      message: `Backup created with key: ${backupKey}`,
      recoveredData: backupKey,
    };
  } catch (error) {
    return {
      success: false,
      message: `Backup failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Clear all watchlist-related data (including backups)
 */
export function clearAllWatchlistData(): ErrorRecoveryResult {
  try {
    const keysToRemove: string[] = [];

    // Find all watchlist-related keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("picks_watchlist")) {
        keysToRemove.push(key);
      }
    }

    // Remove all found keys
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    return {
      success: true,
      message: `Cleared ${keysToRemove.length} watchlist-related items`,
      recoveredData: keysToRemove,
    };
  } catch (error) {
    return {
      success: false,
      message: `Clear operation failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Get storage usage information
 */
export function getStorageInfo() {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return {
        available: false,
        totalSize: 0,
        usedSize: 0,
        watchlistSize: 0,
        percentage: 0,
      };
    }

    let totalSize = 0;
    let watchlistSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || "";
        const itemSize = key.length + value.length;
        totalSize += itemSize;

        if (key.startsWith("picks_watchlist")) {
          watchlistSize += itemSize;
        }
      }
    }

    // Estimate total available space (typically 5-10MB)
    const estimatedMaxSize = 5 * 1024 * 1024; // 5MB conservative estimate
    const percentage = (totalSize / estimatedMaxSize) * 100;

    return {
      available: true,
      totalSize,
      usedSize: totalSize,
      watchlistSize,
      percentage: Math.round(percentage),
      estimatedMaxSize,
    };
  } catch (error) {
    return {
      available: false,
      totalSize: 0,
      usedSize: 0,
      watchlistSize: 0,
      percentage: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Comprehensive error handler for watchlist operations
 */
export function handleWatchlistError(error: unknown): WatchlistError {
  if (error instanceof WatchlistError) {
    return error;
  }

  if (error instanceof Error) {
    // Handle specific localStorage errors
    if (
      error.name === "QuotaExceededError" ||
      error.message.includes("quota")
    ) {
      return new WatchlistError(
        WatchlistErrorType.STORAGE_QUOTA_EXCEEDED,
        error.message,
        undefined,
        true
      );
    }

    if (error.name === "SecurityError") {
      return new WatchlistError(
        WatchlistErrorType.STORAGE_UNAVAILABLE,
        error.message,
        "Local storage is disabled or unavailable in your browser",
        false
      );
    }

    if (error.name === "SyntaxError" || error.message.includes("JSON")) {
      return new WatchlistError(
        WatchlistErrorType.INVALID_DATA,
        error.message,
        undefined,
        true
      );
    }

    if (error.message.includes("Network") || error.message.includes("fetch")) {
      return new WatchlistError(
        WatchlistErrorType.NETWORK_ERROR,
        error.message,
        undefined,
        true
      );
    }

    return new WatchlistError(
      WatchlistErrorType.UNKNOWN_ERROR,
      error.message,
      `An unexpected error occurred: ${error.message}`,
      false
    );
  }

  return new WatchlistError(
    WatchlistErrorType.UNKNOWN_ERROR,
    "Unknown error occurred",
    "Something went wrong. Please try again.",
    false
  );
}

/**
 * Safe localStorage operation wrapper
 */
export function safeLocalStorageOperation<T>(
  operation: () => T,
  fallback: T,
  errorContext?: string
): { result: T; error?: WatchlistError } {
  try {
    const result = operation();
    return { result };
  } catch (error) {
    const watchlistError = handleWatchlistError(error);

    if (errorContext) {
      console.error(`Watchlist error in ${errorContext}:`, watchlistError);
    }

    return {
      result: fallback,
      error: watchlistError,
    };
  }
}
