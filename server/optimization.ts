import cluster from 'cluster';
import os from 'os';

/**
 * High-traffic optimization utilities for handling 1-10 lakh concurrent users
 */

// CPU optimization - use all available cores in production
export function enableClusterMode() {
  if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
    const numCPUs = os.cpus().length;
    console.log(`Starting ${numCPUs} worker processes...`);
    
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died. Restarting...`);
      cluster.fork();
    });
    
    return true; // Master process
  }
  return false; // Worker process or development
}

// Memory optimization
export function optimizeGarbageCollection() {
  if (process.env.NODE_ENV === 'production') {
    // Set V8 flags for better memory management with high traffic
    process.env.NODE_OPTIONS = [
      '--max-old-space-size=4096', // 4GB heap size
      '--max-semi-space-size=256',  // 256MB for young generation
      '--optimize-for-size',         // Optimize for memory usage
    ].join(' ');
  }
}

// Connection pooling optimization
export const highTrafficConfig = {
  database: {
    pool: {
      min: 10,
      max: 100,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 60000,
      reapIntervalMillis: 1000,
    }
  },
  redis: {
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
  }
};

// Request optimization for video streaming
export function optimizeVideoStreaming(req: any, res: any, next: any) {
  // Enable HTTP/2 push for video assets
  if (req.url.includes('/video/') || req.url.includes('/api/videos/')) {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Cache-Control': 'public, max-age=86400', // 24 hours for video metadata
      'Vary': 'Accept-Encoding',
      'Connection': 'keep-alive',
    });
  }
  next();
}

// Monitor performance metrics
export function performanceMonitor() {
  if (process.env.NODE_ENV === 'production') {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      console.log({
        timestamp: new Date().toISOString(),
        memory: {
          rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
          external: Math.round(memUsage.external / 1024 / 1024) + 'MB',
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        }
      });
    }, 60000); // Log every minute
  }
}