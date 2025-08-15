import memoize from "memoizee";

// High-performance in-memory cache for frequently accessed data
class SimpleCache {
  private cache = new Map<string, { data: any; expiry: number }>();
  private maxSize: number;
  private ttl: number;

  constructor(options: { max: number; ttl: number }) {
    this.maxSize = options.max;
    this.ttl = options.ttl;
  }

  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  put(key: string, data: any, customTtl?: number): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    const expiry = Date.now() + (customTtl || this.ttl);
    this.cache.set(key, { data, expiry });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cache = new SimpleCache({
  max: 10000, // Maximum number of items
  ttl: 1000 * 60 * 15 // 15 minutes TTL
});

// Memoization for database queries to reduce load
export const memoizedQuery = memoize(
  async (queryKey: string, queryFn: () => Promise<any>) => {
    return await queryFn();
  },
  {
    promise: true,
    maxAge: 1000 * 60 * 10, // 10 minutes cache
    max: 1000, // Max 1000 cached queries
    preFetch: true // Pre-fetch before expiry
  }
);

// Cache middleware for API responses
export const cacheMiddleware = (duration: number = 300000) => { // 5 minutes default
  return (req: any, res: any, next: any) => {
    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedResponse);
    }
    
    const originalJson = res.json;
    res.json = function(data: any) {
      res.set('X-Cache', 'MISS');
      cache.put(key, data, duration);
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Cache for static content like batches, subjects (changes infrequently)
export const staticContentCache = cacheMiddleware(1000 * 60 * 30); // 30 minutes

// Cache for user-specific content (shorter duration)
export const userContentCache = cacheMiddleware(1000 * 60 * 5); // 5 minutes

// Cache for video metadata
export const videoMetadataCache = cacheMiddleware(1000 * 60 * 60); // 1 hour