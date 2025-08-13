import { PrismaClient } from '@prisma/client';
import NodeCache from 'node-cache';
import * as os from 'os';

const prisma = new PrismaClient();

export interface PerformanceMetric {
  metricType: string;
  value: number;
  unit: string;
  endpoint?: string;
  method?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  checkperiod: number; // Check for expired keys every N seconds
  maxKeys: number; // Maximum number of keys in cache
}

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message: string;
  statusCode: number;
}

export class PerformanceOptimizationService {
  private memoryCache: NodeCache;
  private performanceMetrics: PerformanceMetric[] = [];
  private isMonitoring = false;

  constructor() {
    // Initialize memory cache with default config
    this.memoryCache = new NodeCache({
      stdTTL: 300, // 5 minutes default TTL
      checkperiod: 60, // Check for expired keys every minute
      maxKeys: 1000 // Maximum 1000 keys in cache
    });

    // Start performance monitoring
    this.startPerformanceMonitoring();
  }

  /**
   * Cache Management
   */
  async setCache(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      // Set in memory cache
      this.memoryCache.set(key, value, ttl);

      // Store in database for persistence
      await prisma.cacheEntry.upsert({
        where: { key },
        update: {
          value: value as any,
          ttl,
          expiresAt: new Date(Date.now() + ttl * 1000),
          hitCount: { increment: 0 }
        },
        create: {
          key,
          value: value as any,
          ttl,
          expiresAt: new Date(Date.now() + ttl * 1000),
          hitCount: 0
        }
      });
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  async getCache(key: string): Promise<any> {
    try {
      // Try memory cache first
      let value = this.memoryCache.get(key);
      
      if (value !== undefined) {
        // Update hit count in database
        await prisma.cacheEntry.update({
          where: { key },
          data: {
            hitCount: { increment: 1 },
            lastAccessed: new Date()
          }
        });
        return value;
      }

      // Try database cache
      const dbEntry = await prisma.cacheEntry.findUnique({
        where: { key }
      });

      if (dbEntry && dbEntry.expiresAt > new Date()) {
        // Restore to memory cache
        this.memoryCache.set(key, dbEntry.value, dbEntry.ttl);
        
        // Update hit count
        await prisma.cacheEntry.update({
          where: { key },
          data: {
            hitCount: { increment: 1 },
            lastAccessed: new Date()
          }
        });

        return dbEntry.value;
      }

      return null;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  async deleteCache(key: string): Promise<void> {
    try {
      // Remove from memory cache
      this.memoryCache.del(key);

      // Remove from database
      await prisma.cacheEntry.delete({
        where: { key }
      });
    } catch (error) {
      console.error('Error deleting cache:', error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      // Clear memory cache
      this.memoryCache.flushAll();

      // Clear database cache
      await prisma.cacheEntry.deleteMany();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async getCacheStats(): Promise<any> {
    try {
      const stats = this.memoryCache.getStats();
      const dbStats = await prisma.cacheEntry.aggregate({
        _count: { id: true },
        _avg: { hitCount: true }
      });

      return {
        memory: {
          keys: stats.keys,
          hits: stats.hits,
          misses: stats.misses,
          hitRate: stats.hits / (stats.hits + stats.misses) * 100
        },
        database: {
          totalEntries: dbStats._count.id,
          averageHits: Math.round(dbStats._avg.hitCount || 0)
        }
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  }

  /**
   * Performance Monitoring
   */
  async recordMetric(metric: PerformanceMetric): Promise<void> {
    try {
      // Store in memory for batch processing
      this.performanceMetrics.push(metric);

      // Store in database
      await prisma.performanceMetric.create({
        data: {
          metricType: metric.metricType,
          value: metric.value,
          unit: metric.unit,
          endpoint: metric.endpoint,
          method: metric.method,
          userId: metric.userId,
          ipAddress: metric.ipAddress,
          userAgent: metric.userAgent,
          metadata: metric.metadata as any
        }
      });
    } catch (error) {
      console.error('Error recording metric:', error);
    }
  }

  async getPerformanceMetrics(
    metricType?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100
  ): Promise<any[]> {
    try {
      const where: any = {};
      
      if (metricType) where.metricType = metricType;
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = startDate;
        if (endDate) where.timestamp.lte = endDate;
      }

      return await prisma.performanceMetric.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return [];
    }
  }

  async getPerformanceSummary(): Promise<any> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [
        responseTimeStats,
        memoryUsageStats,
        cpuUsageStats,
        cacheHitRateStats,
        totalMetrics
      ] = await Promise.all([
        prisma.performanceMetric.aggregate({
          where: {
            metricType: 'response_time',
            timestamp: { gte: oneHourAgo }
          },
          _avg: { value: true },
          _min: { value: true },
          _max: { value: true }
        }),
        prisma.performanceMetric.aggregate({
          where: {
            metricType: 'memory_usage',
            timestamp: { gte: oneHourAgo }
          },
          _avg: { value: true },
          _max: { value: true }
        }),
        prisma.performanceMetric.aggregate({
          where: {
            metricType: 'cpu_usage',
            timestamp: { gte: oneHourAgo }
          },
          _avg: { value: true },
          _max: { value: true }
        }),
        prisma.performanceMetric.aggregate({
          where: {
            metricType: 'cache_hit_rate',
            timestamp: { gte: oneHourAgo }
          },
          _avg: { value: true }
        }),
        prisma.performanceMetric.count({
          where: {
            timestamp: { gte: oneDayAgo }
          }
        })
      ]);

      return {
        responseTime: {
          average: Math.round(responseTimeStats._avg.value || 0),
          min: Math.round(responseTimeStats._min.value || 0),
          max: Math.round(responseTimeStats._max.value || 0)
        },
        memoryUsage: {
          average: Math.round(memoryUsageStats._avg.value || 0),
          max: Math.round(memoryUsageStats._max.value || 0)
        },
        cpuUsage: {
          average: Math.round(cpuUsageStats._avg.value || 0),
          max: Math.round(cpuUsageStats._max.value || 0)
        },
        cacheHitRate: Math.round(cacheHitRateStats._avg.value || 0),
        totalMetrics
      };
    } catch (error) {
      console.error('Error getting performance summary:', error);
      return null;
    }
  }

  /**
   * System Resource Monitoring
   */
  private startPerformanceMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Monitor every 30 seconds
    setInterval(async () => {
      await this.recordSystemMetrics();
    }, 30000);
  }

  private async recordSystemMetrics(): Promise<void> {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = os.loadavg()[0]; // 1-minute load average

      // Record memory usage
      await this.recordMetric({
        metricType: 'memory_usage',
        value: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        unit: 'mb',
        metadata: {
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024),
          rss: Math.round(memUsage.rss / 1024 / 1024)
        }
      });

      // Record CPU usage
      await this.recordMetric({
        metricType: 'cpu_usage',
        value: Math.round(cpuUsage * 100), // Percentage
        unit: 'percentage',
        metadata: {
          loadAverage: cpuUsage,
          uptime: os.uptime()
        }
      });
    } catch (error) {
      console.error('Error recording system metrics:', error);
    }
  }

  /**
   * Rate Limiting
   */
  async logRateLimitAttempt(data: {
    ipAddress: string;
    endpoint: string;
    method: string;
    userAgent?: string;
    userId?: string;
    blocked: boolean;
    reason?: string;
  }): Promise<void> {
    try {
      await prisma.rateLimitLog.create({
        data: {
          ipAddress: data.ipAddress,
          endpoint: data.endpoint,
          method: data.method,
          userAgent: data.userAgent,
          userId: data.userId,
          blocked: data.blocked,
          reason: data.reason
        }
      });
    } catch (error) {
      console.error('Error logging rate limit attempt:', error);
    }
  }

  async getRateLimitStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    try {
      const where: any = {};
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = startDate;
        if (endDate) where.timestamp.lte = endDate;
      }

      const [
        totalAttempts,
        blockedAttempts,
        topIPs,
        topEndpoints
      ] = await Promise.all([
        prisma.rateLimitLog.count({ where }),
        prisma.rateLimitLog.count({ where: { ...where, blocked: true } }),
        prisma.rateLimitLog.groupBy({
          by: ['ipAddress'],
          where,
          _count: { ipAddress: true },
          orderBy: { _count: { ipAddress: 'desc' } },
          take: 10
        }),
        prisma.rateLimitLog.groupBy({
          by: ['endpoint'],
          where,
          _count: { endpoint: true },
          orderBy: { _count: { endpoint: 'desc' } },
          take: 10
        })
      ]);

      return {
        totalAttempts,
        blockedAttempts,
        blockRate: totalAttempts > 0 ? (blockedAttempts / totalAttempts) * 100 : 0,
        topIPs: topIPs.map(ip => ({
          ipAddress: ip.ipAddress,
          attempts: ip._count.ipAddress
        })),
        topEndpoints: topEndpoints.map(endpoint => ({
          endpoint: endpoint.endpoint,
          attempts: endpoint._count.endpoint
        }))
      };
    } catch (error) {
      console.error('Error getting rate limit stats:', error);
      return null;
    }
  }

  /**
   * Cache Optimization
   */
  async optimizeCache(): Promise<any> {
    try {
      // Remove expired entries from database
      const deletedCount = await prisma.cacheEntry.deleteMany({
        where: {
          expiresAt: { lt: new Date() }
        }
      });

      // Get cache statistics
      const stats = await this.getCacheStats();

      // Suggest optimizations
      const suggestions = [];
      
      if (stats.memory.hitRate < 70) {
        suggestions.push('Consider increasing cache TTL for frequently accessed data');
      }
      
      if (stats.memory.keys > 800) {
        suggestions.push('Cache is near capacity, consider increasing maxKeys or implementing cache eviction');
      }

      return {
        deletedExpiredEntries: deletedCount.count,
        stats,
        suggestions
      };
    } catch (error) {
      console.error('Error optimizing cache:', error);
      return null;
    }
  }

  /**
   * Performance Recommendations
   */
  async generatePerformanceRecommendations(): Promise<any[]> {
    try {
      const summary = await this.getPerformanceSummary();
      const recommendations = [];

      if (!summary) return recommendations;

      // Response time recommendations
      if (summary.responseTime.average > 500) {
        recommendations.push({
          type: 'response_time',
          priority: 'high',
          message: 'Average response time is high',
          suggestion: 'Consider implementing database query optimization, caching, or CDN'
        });
      }

      // Memory usage recommendations
      if (summary.memoryUsage.average > 512) {
        recommendations.push({
          type: 'memory_usage',
          priority: 'medium',
          message: 'High memory usage detected',
          suggestion: 'Consider implementing memory leak detection or increasing server resources'
        });
      }

      // CPU usage recommendations
      if (summary.cpuUsage.average > 80) {
        recommendations.push({
          type: 'cpu_usage',
          priority: 'high',
          message: 'High CPU usage detected',
          suggestion: 'Consider implementing load balancing or optimizing heavy operations'
        });
      }

      // Cache hit rate recommendations
      if (summary.cacheHitRate < 70) {
        recommendations.push({
          type: 'cache',
          priority: 'medium',
          message: 'Low cache hit rate',
          suggestion: 'Review cache strategy and consider caching more frequently accessed data'
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating performance recommendations:', error);
      return [];
    }
  }
}

export default new PerformanceOptimizationService();
