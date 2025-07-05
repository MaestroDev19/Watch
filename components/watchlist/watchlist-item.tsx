"use client";

import { useState } from "react";
import { Star, Calendar, Trash2, Eye, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WatchlistItem, WatchStatus } from "@/types";

interface WatchlistItemProps {
  item: WatchlistItem;
  onUpdateStatus: (
    id: string,
    status: WatchStatus
  ) => Promise<{ success: boolean; error?: any }>;
  onRemove: (id: string) => Promise<{ success: boolean; error?: any }>;
  compact?: boolean;
  showActions?: boolean;
}

const statusConfig = {
  plan_to_watch: {
    label: "Plan to Watch",
    icon: Calendar,
    color: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  },
  currently_watching: {
    label: "Currently Watching",
    icon: Play,
    color: "bg-green-100 text-green-800 hover:bg-green-200",
  },
  watched: {
    label: "Watched",
    icon: Eye,
    color: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  },
} as const;

export function WatchlistItem({
  item,
  onUpdateStatus,
  onRemove,
  compact = false,
  showActions = true,
}: WatchlistItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const currentStatus = statusConfig[item.watchStatus];
  const StatusIcon = currentStatus.icon;

  const handleStatusChange = async (newStatus: WatchStatus) => {
    if (newStatus === item.watchStatus) return;

    setIsUpdating(true);
    try {
      await onUpdateStatus(item.id, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(item.id);
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const renderRating = () => {
    if (!item.average || item.average === 0) return null;

    return (
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">{item.average.toFixed(1)}</span>
      </div>
    );
  };

  const renderCompactView = () => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Poster */}
          <div className="flex-shrink-0">
            {item.posterPath ? (
              <img
                src={`https://image.tmdb.org/t/p/w200${item.posterPath}`}
                alt={item.displayTitle}
                className="w-12 h-16 object-cover rounded"
                loading="lazy"
              />
            ) : (
              <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs text-gray-500">
                  {item.mediaType === "movie" ? "🎬" : "📺"}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm truncate">
                  {item.displayTitle}
                </h3>
                <p className="text-xs text-gray-600">
                  Added: {formatDate(item.dateAdded)}
                </p>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center gap-2">
                {renderRating()}

                <Badge className={`text-xs ${currentStatus.color}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {currentStatus.label}
                </Badge>

                {showActions && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isUpdating || isRemoving}
                      >
                        •••
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() =>
                            handleStatusChange(status as WatchStatus)
                          }
                          disabled={status === item.watchStatus}
                        >
                          <config.icon className="h-4 w-4 mr-2" />
                          {config.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem
                        onClick={handleRemove}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderFullView = () => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Poster */}
          <div className="flex-shrink-0">
            {item.posterPath ? (
              <img
                src={`https://image.tmdb.org/t/p/w300${item.posterPath}`}
                alt={item.displayTitle}
                className="w-24 h-36 object-cover rounded-lg shadow-sm"
                loading="lazy"
              />
            ) : (
              <div className="w-24 h-36 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl">
                  {item.mediaType === "movie" ? "🎬" : "📺"}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-lg mb-2">{item.displayTitle}</h3>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Added: {formatDate(item.dateAdded)}
                  </div>

                  {item.dateWatched && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      Watched: {formatDate(item.dateWatched)}
                    </div>
                  )}

                  {renderRating()}

                  <Badge variant="outline" className="text-xs">
                    {item.mediaType === "movie" ? "Movie" : "TV Show"}
                  </Badge>
                </div>
              </div>

              {/* Status and Actions */}
              {showActions && (
                <div className="flex flex-col gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={currentStatus.color}
                        disabled={isUpdating || isRemoving}
                      >
                        <StatusIcon className="h-4 w-4 mr-2" />
                        {currentStatus.label}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() =>
                            handleStatusChange(status as WatchStatus)
                          }
                          disabled={status === item.watchStatus}
                        >
                          <config.icon className="h-4 w-4 mr-2" />
                          {config.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemove}
                    disabled={isRemoving || isUpdating}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return compact ? renderCompactView() : renderFullView();
}
