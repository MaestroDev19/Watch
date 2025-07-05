"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  Download,
  Trash2,
  RefreshCw,
  TrendingUp,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WatchlistContainer } from "@/components/watchlist";
import { useWatchlist } from "@/hooks/use-watchlist";

export default function WatchlistPage() {
  const {
    items,
    isLoading,
    error,
    lastError,
    stats,
    clearWatchlist,
    attemptRecovery,
    clearErrors,
  } = useWatchlist();

  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  // Clear errors when component mounts
  useEffect(() => {
    if (error || lastError) {
      // Auto-clear simple errors after 10 seconds
      const timer = setTimeout(() => {
        clearErrors();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [error, lastError, clearErrors]);

  const handleClearWatchlist = async () => {
    if (
      !confirm(
        "Are you sure you want to clear your entire watchlist? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsClearing(true);
    try {
      const result = await clearWatchlist();
      if (!result.success) {
        console.error("Failed to clear watchlist:", result.error);
      }
    } catch (error) {
      console.error("Error clearing watchlist:", error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleAttemptRecovery = async () => {
    setIsRecovering(true);
    try {
      const result = await attemptRecovery();
      if (result.success) {
        clearErrors();
      }
    } catch (error) {
      console.error("Recovery failed:", error);
    } finally {
      setIsRecovering(false);
    }
  };

  const handleExportWatchlist = () => {
    if (items.length === 0) {
      alert("Your watchlist is empty. Nothing to export.");
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      totalItems: items.length,
      stats,
      items: items.map((item) => ({
        id: item.id,
        title: item.displayTitle,
        mediaType: item.mediaType,
        rating: item.average,
        status: item.watchStatus,
        dateAdded: item.dateAdded,
        dateWatched: item.dateWatched,
        posterPath: item.posterPath,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `picks-watchlist-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Error Recovery Section
  const renderErrorRecovery = () => {
    if (!error && !lastError) return null;

    return (
      <Card className="border-red-200 bg-red-50 mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-800">Watchlist Error</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-red-700">
              {error ||
                lastError?.userMessage ||
                "An error occurred with your watchlist."}
            </p>

            {lastError?.recoverable && (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleAttemptRecovery}
                  disabled={isRecovering}
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isRecovering ? "animate-spin" : ""
                    }`}
                  />
                  {isRecovering ? "Recovering..." : "Attempt Recovery"}
                </Button>

                <Button
                  onClick={clearErrors}
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-100"
                >
                  Dismiss
                </Button>

                <Button
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-100"
                >
                  {showErrorDetails ? "Hide" : "Show"} Details
                </Button>
              </div>
            )}

            {showErrorDetails && lastError && (
              <div className="mt-3 p-3 bg-red-100 rounded text-xs text-red-800 font-mono">
                <div>
                  <strong>Error Type:</strong> {lastError.type}
                </div>
                <div>
                  <strong>Message:</strong> {lastError.message}
                </div>
                <div>
                  <strong>Recoverable:</strong>{" "}
                  {lastError.recoverable ? "Yes" : "No"}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Header with actions
  const renderHeader = () => (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold ">My Watchlist</h1>
          <p className=" mt-1 text-foreground/60">
            Manage your movies and TV shows
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {items.length > 0 && (
            <>
              <Button
                onClick={handleExportWatchlist}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>

              <Button
                onClick={handleClearWatchlist}
                disabled={isClearing}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {isClearing ? "Clearing..." : "Clear All"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Empty state
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="flex flex-col items-center justify-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <List className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold  mb-2">Your watchlist is empty</h3>
        <p className=" mb-6 max-w-md mx-auto text-foreground/60">
          Start adding movies and TV shows to keep track of what you want to
          watch, what you're currently watching, and what you've already seen.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => (window.location.href = "/")} className="px-6">
            Browse Recommendations
          </Button>
          <Button
            onClick={() => (window.location.href = "/search")}
            variant="outline"
            className="px-6"
          >
            Search Movies & TV
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {renderHeader()}
        {renderErrorRecovery()}

        {/* Main Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="">Loading your watchlist...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          renderEmptyState()
        ) : (
          <WatchlistContainer
            showStats={true}
            defaultLayout="grid"
            defaultFilter="all"
            className="space-y-6"
          />
        )}
      </div>
    </div>
  );
}
