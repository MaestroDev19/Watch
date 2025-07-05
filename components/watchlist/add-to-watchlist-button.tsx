"use client";

import { useState } from "react";
import { Plus, Check, Heart, Clock, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useWatchlist, useIsInWatchlist } from "@/hooks/use-watchlist";
import type { Movies, TvShows, Trending, WatchStatus } from "@/types";

interface AddToWatchlistButtonProps {
  item: Movies | TvShows | Trending;
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "destructive"
    | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
  showLabel?: boolean;
  showDropdown?: boolean;
  defaultStatus?: WatchStatus;
  onSuccess?: (item: Movies | TvShows | Trending, status: WatchStatus) => void;
  onError?: (error: string) => void;
}

const statusOptions = [
  {
    value: "plan_to_watch" as const,
    label: "Plan to Watch",
    icon: Calendar,
    description: "Add to your list for later",
  },
  {
    value: "currently_watching" as const,
    label: "Currently Watching",
    icon: Clock,
    description: "You're watching this now",
  },
  {
    value: "watched" as const,
    label: "Watched",
    icon: Eye,
    description: "You've already seen this",
  },
];

export function AddToWatchlistButton({
  item,
  variant = "default",
  size = "default",
  className,
  showLabel = true,
  showDropdown = true,
  defaultStatus = "plan_to_watch",
  onSuccess,
  onError,
}: AddToWatchlistButtonProps) {
  const { addToWatchlist, removeFromWatchlist } = useWatchlist();
  const isInWatchlist = useIsInWatchlist(item.id);

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToWatchlist = async (status: WatchStatus = defaultStatus) => {
    setIsLoading(true);

    try {
      const result = await addToWatchlist(item, status);

      if (result.success) {
        setShowSuccess(true);
        onSuccess?.(item, status);

        // Hide success indicator after 2 seconds
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        const errorMessage =
          result.error?.userMessage || "Failed to add to watchlist";
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add to watchlist";
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async () => {
    setIsLoading(true);

    try {
      const result = await removeFromWatchlist(item.id);

      if (!result.success) {
        const errorMessage =
          result.error?.userMessage || "Failed to remove from watchlist";
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to remove from watchlist";
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Get item title for display
  const getItemTitle = () => {
    if ("title" in item) return item.title;
    if ("name" in item) return item.name;
    return "Unknown Title";
  };

  // Show success state
  if (showSuccess) {
    return (
      <Button
        variant="outline"
        size={size}
        className={`border-green-200 bg-green-50 text-green-700 hover:bg-green-100 ${className}`}
        disabled
      >
        <Check className="h-4 w-4 mr-2" />
        {showLabel && "Added!"}
      </Button>
    );
  }

  // Show already in watchlist state
  if (isInWatchlist) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={size}
            className={`border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 ${className}`}
            disabled={isLoading}
          >
            <Heart className="h-4 w-4 mr-2 fill-current" />
            {showLabel && "In List"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            "{getItemTitle()}" is in your watchlist
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleRemoveFromWatchlist}
            className="text-red-600 focus:text-red-600"
          >
            Remove from Watchlist
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Show add button with optional dropdown
  if (showDropdown) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={className}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showLabel && "Add to List"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            Add "{getItemTitle()}" to watchlist
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {statusOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleAddToWatchlist(option.value)}
                className="flex flex-col items-start p-3"
              >
                <div className="flex items-center w-full">
                  <IconComponent className="h-4 w-4 mr-3" />
                  <span className="font-medium">{option.label}</span>
                </div>
                <span className="text-xs text-gray-500 ml-7">
                  {option.description}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Simple add button without dropdown
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => handleAddToWatchlist()}
      disabled={isLoading}
    >
      <Plus className="h-4 w-4 mr-2" />
      {showLabel && "Add to List"}
    </Button>
  );
}

// Compact version for smaller spaces
export function AddToWatchlistIcon({
  item,
  className,
  onSuccess,
  onError,
}: Pick<
  AddToWatchlistButtonProps,
  "item" | "className" | "onSuccess" | "onError"
>) {
  return (
    <AddToWatchlistButton
      item={item}
      variant="ghost"
      size="sm"
      className={className}
      showLabel={false}
      showDropdown={true}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
}

// Quick add version with default status
export function QuickAddToWatchlistButton({
  item,
  status = "plan_to_watch",
  className,
  onSuccess,
  onError,
}: Pick<
  AddToWatchlistButtonProps,
  "item" | "className" | "onSuccess" | "onError"
> & {
  status?: WatchStatus;
}) {
  const statusConfig = statusOptions.find((opt) => opt.value === status);
  const IconComponent = statusConfig?.icon || Plus;

  return (
    <AddToWatchlistButton
      item={item}
      variant="outline"
      size="sm"
      className={className}
      showLabel={true}
      showDropdown={false}
      defaultStatus={status}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
}
