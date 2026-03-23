import { ExternalToolsResponse } from "@/services/external-tools-service";

interface CacheEntry {
  data: ExternalToolsResponse;
  timestamp: number;
}

const externalToolsCache = new Map<string, CacheEntry>();

// External tools/presets rarely change, so a longer TTL is fine
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function getCachedExternalTools(userId: string): ExternalToolsResponse | null {
  const entry = externalToolsCache.get(userId);
  if (!entry) return null;

  if (CACHE_TTL_MS > 0 && Date.now() - entry.timestamp > CACHE_TTL_MS) {
    externalToolsCache.delete(userId);
    return null;
  }

  return entry.data;
}

export function setCachedExternalTools(userId: string, data: ExternalToolsResponse): void {
  externalToolsCache.set(userId, {
    data,
    timestamp: Date.now(),
  });
}

export function clearExternalToolsCache(userId: string): void {
  externalToolsCache.delete(userId);
}
