"use client";

import { useState, useMemo } from "react";
import { Grid3X3, List, Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { WatchlistItem } from "./watchlist-item";
import { useWatchlist } from "@/hooks/use-watchlist";
import type { WatchStatus } from "@/types";

interface WatchlistContainerProps {
  className?: string;
  showStats?: boolean;
  defaultLayout?: "grid" | "list";
  defaultFilter?: WatchStatus | "all";
}

type SortOption = "title" | "dateAdded" | "rating" | "type";
type SortOrder = "asc" | "desc";

export function WatchlistContainer({
  className,
  showStats = true,
  defaultLayout = "grid",
  defaultFilter = "all",
}: WatchlistContainerProps) {
  const {
    items,
    isLoading,
    error,
    stats,
    updateWatchStatus,
    removeFromWatchlist,
  } = useWatchlist();

  // Local state for UI controls
  const [layout, setLayout] = useState<"grid" | "list">(defaultLayout);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WatchStatus | "all">(
    defaultFilter
  );
  const [sortBy, setSortBy] = useState<SortOption>("dateAdded");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) =>
        item.displayTitle.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.watchStatus === statusFilter);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "title":
          aValue = a.displayTitle.toLowerCase();
          bValue = b.displayTitle.toLowerCase();
          break;
        case "dateAdded":
          aValue = new Date(a.dateAdded);
          bValue = new Date(b.dateAdded);
          break;
        case "rating":
          aValue = a.average || 0;
          bValue = b.average || 0;
          break;
        case "type":
          aValue = a.mediaType;
          bValue = b.mediaType;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [items, searchQuery, statusFilter, sortBy, sortOrder]);

  const handleStatusChange = async (id: string, status: WatchStatus) => {
    return await updateWatchStatus(id, status);
  };

  const handleRemoveItem = async (id: string) => {
    return await removeFromWatchlist(id);
  };

  const statusOptions = [
    { value: "all" as const, label: "All Items" },
    { value: "plan_to_watch" as const, label: "Plan to Watch" },
    { value: "currently_watching" as const, label: "Currently Watching" },
    { value: "watched" as const, label: "Watched" },
  ];

  const sortOptions = [
    { value: "dateAdded" as const, label: "Date Added" },
    { value: "title" as const, label: "Title" },
    { value: "rating" as const, label: "Rating" },
    { value: "type" as const, label: "Type" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="font-medium">Error loading watchlist</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Stats Section */}
      {showStats && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Watchlist Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalItems}
                </div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.watchedCount}
                </div>
                <div className="text-sm text-gray-600">Watched</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.currentlyWatchingCount}
                </div>
                <div className="text-sm text-gray-600">Watching</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.planToWatchCount}
                </div>
                <div className="text-sm text-gray-600">Plan to Watch</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search your watchlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter by Status */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-0">
              <Filter className="h-4 w-4 mr-2" />
              {statusOptions.find((opt) => opt.value === statusFilter)?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {statusOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-0">
              {sortOrder === "asc" ? (
                <SortAsc className="h-4 w-4 mr-2" />
              ) : (
                <SortDesc className="h-4 w-4 mr-2" />
              )}
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSortBy(option.value)}
              >
                {option.label}
                {sortBy === option.value && " ✓"}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "Descending" : "Ascending"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Layout Toggle */}
        <div className="flex border rounded-md">
          <Button
            variant={layout === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setLayout("grid")}
            className="rounded-r-none"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setLayout("list")}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredAndSortedItems.length} of {items.length} items
      </div>

      {/* Items Grid/List */}
      {filteredAndSortedItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No items found</p>
              <p className="text-sm">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Your watchlist is empty. Start adding some movies and TV shows!"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            layout === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          }
        >
          {filteredAndSortedItems.map((item) => (
            <WatchlistItem
              key={item.id}
              item={item}
              onUpdateStatus={handleStatusChange}
              onRemove={handleRemoveItem}
              compact={layout === "list"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
