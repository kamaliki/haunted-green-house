import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  data: T;
  expiresAt: Date;
}

/**
 * Simple in-memory cache service for analytics data
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly cache = new Map<string, CacheEntry<any>>();

  /**
   * Store data in cache with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttlMs Time-to-live in milliseconds
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    const expiresAt = new Date(Date.now() + ttlMs);
    this.cache.set(key, { data, expiresAt });
    this.logger.debug(`Cached data for key: ${key}, expires at: ${expiresAt.toISOString()}`);
  }

  /**
   * Retrieve data from cache
   * @param key Cache key
   * @returns Cached data or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.logger.debug(`Cache miss for key: ${key}`);
      return undefined;
    }

    // Check if entry has expired
    if (new Date() > entry.expiresAt) {
      this.logger.debug(`Cache entry expired for key: ${key}`);
      this.cache.delete(key);
      return undefined;
    }

    this.logger.debug(`Cache hit for key: ${key}`);
    return entry.data as T;
  }

  /**
   * Invalidate cache entry
   * @param key Cache key
   */
  invalidate(key: string): void {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug(`Invalidated cache for key: ${key}`);
    }
  }

  /**
   * Invalidate all cache entries matching a pattern
   * @param pattern String pattern to match keys
   */
  invalidatePattern(pattern: string): void {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    this.logger.debug(`Invalidated ${count} cache entries matching pattern: ${pattern}`);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.log(`Cleared ${size} cache entries`);
  }

  /**
   * Get cache statistics
   * @returns Object with cache size and entry count
   */
  getStats(): { entryCount: number; keys: string[] } {
    return {
      entryCount: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}
