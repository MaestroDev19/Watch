import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToDecimal(rating: number): string {
  return rating.toFixed(1);
}

// Token usage tracking for Gemini API free tier
interface TokenUsage {
  timestamp: number;
  tokens: number;
  model: string;
}

class TokenTracker {
  private usage: TokenUsage[] = [];
  private readonly FREE_TIER_LIMITS = {
    "gemini-2.0-flash": {
      tokensPerMinute: 1000000,
      requestsPerMinute: 15,
      requestsPerDay: 200,
    },
    "gemini-2.5-flash": {
      tokensPerMinute: 250000,
      requestsPerMinute: 10,
      requestsPerDay: 250,
    },
  };

  addUsage(tokens: number, model: string = "gemini-2.0-flash") {
    this.usage.push({
      timestamp: Date.now(),
      tokens,
      model,
    });

    // Clean up old entries (older than 24 hours)
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.usage = this.usage.filter((entry) => entry.timestamp > dayAgo);
  }

  getUsageStats(model: string = "gemini-2.0-flash") {
    const now = Date.now();
    const minuteAgo = now - 60 * 1000;
    const dayAgo = now - 24 * 60 * 60 * 1000;

    const lastMinute = this.usage.filter(
      (entry) => entry.timestamp > minuteAgo && entry.model === model
    );
    const lastDay = this.usage.filter(
      (entry) => entry.timestamp > dayAgo && entry.model === model
    );

    const limits =
      this.FREE_TIER_LIMITS[model as keyof typeof this.FREE_TIER_LIMITS];

    return {
      tokensLastMinute: lastMinute.reduce(
        (sum, entry) => sum + entry.tokens,
        0
      ),
      requestsLastMinute: lastMinute.length,
      requestsLastDay: lastDay.length,
      limits,
      isNearLimit: {
        tokens:
          lastMinute.reduce((sum, entry) => sum + entry.tokens, 0) >
          limits.tokensPerMinute * 0.8,
        requestsMinute: lastMinute.length > limits.requestsPerMinute * 0.8,
        requestsDay: lastDay.length > limits.requestsPerDay * 0.8,
      },
    };
  }

  shouldThrottle(model: string = "gemini-2.0-flash"): boolean {
    const stats = this.getUsageStats(model);
    return (
      stats.isNearLimit.tokens ||
      stats.isNearLimit.requestsMinute ||
      stats.isNearLimit.requestsDay
    );
  }
}

export const tokenTracker = new TokenTracker();

// Utility function to estimate token count (rough approximation)
export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}

// Warning message for token usage
export function getTokenWarning(
  stats: ReturnType<typeof tokenTracker.getUsageStats>
): string | null {
  if (stats.isNearLimit.requestsDay) {
    return `⚠️ Approaching daily request limit: ${stats.requestsLastDay}/${stats.limits.requestsPerDay}`;
  }
  if (stats.isNearLimit.requestsMinute) {
    return `⚠️ Approaching per-minute request limit: ${stats.requestsLastMinute}/${stats.limits.requestsPerMinute}`;
  }
  if (stats.isNearLimit.tokens) {
    return `⚠️ Approaching token limit: ${stats.tokensLastMinute}/${stats.limits.tokensPerMinute} tokens/min`;
  }
  return null;
}
