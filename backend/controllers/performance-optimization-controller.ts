import { Request, Response } from 'express';
import performanceOptimizationService from '../services/performance-optimization-service';

export class PerformanceOptimizationController {
  /**
   * Cache Management
   */
  async setCache(req: Request, res: Response) {
    try {
      const { key, value, ttl = 300 } = req.body;

      if (!key || value === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Key and value are required'
        });
      }

      await performanceOptimizationService.setCache(key, value, ttl);

      res.json({
        success: true,
        message: 'Cache entry set successfully'
      });
    } catch (error) {
      console.error('Error in setCache:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set cache entry'
      });
    }
  }

  async getCache(req: Request, res: Response) {
    try {
      const { key } = req.params;

      const value = await performanceOptimizationService.getCache(key);

      if (value === null) {
        return res.status(404).json({
          success: false,
          message: 'Cache entry not found'
        });
      }

      res.json({
        success: true,
        data: value,
        message: 'Cache entry retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getCache:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cache entry'
      });
    }
  }

  async deleteCache(req: Request, res: Response) {
    try {
      const { key } = req.params;

      await performanceOptimizationService.deleteCache(key);

      res.json({
        success: true,
        message: 'Cache entry deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteCache:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete cache entry'
      });
    }
  }

  async clearCache(_req: Request, res: Response) {
    try {
      await performanceOptimizationService.clearCache();

      res.json({
        success: true,
        message: 'Cache cleared successfully'
      });
    } catch (error) {
      console.error('Error in clearCache:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache'
      });
    }
  }

  async getCacheStats(_req: Request, res: Response) {
    try {
      const stats = await performanceOptimizationService.getCacheStats();

      res.json({
        success: true,
        data: stats,
        message: 'Cache statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getCacheStats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cache statistics'
      });
    }
  }

  /**
   * Performance Monitoring
   */
  async recordMetric(req: Request, res: Response) {
    try {
      const {
        metricType,
        value,
        unit,
        endpoint,
        method,
        metadata
      } = req.body;

      if (!metricType || value === undefined || !unit) {
        return res.status(400).json({
          success: false,
          message: 'Metric type, value, and unit are required'
        });
      }

      const userId = (req as any).user?.id;

      await performanceOptimizationService.recordMetric({
        metricType,
        value,
        unit,
        endpoint,
        method,
        userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata
      });

      res.json({
        success: true,
        message: 'Performance metric recorded successfully'
      });
    } catch (error) {
      console.error('Error in recordMetric:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record performance metric'
      });
    }
  }

  async getPerformanceMetrics(req: Request, res: Response) {
    try {
      const { metricType, startDate, endDate, limit = 100 } = req.query;

      const metrics = await performanceOptimizationService.getPerformanceMetrics(
        metricType as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: metrics,
        message: 'Performance metrics retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getPerformanceMetrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve performance metrics'
      });
    }
  }

  async getPerformanceSummary(_req: Request, res: Response) {
    try {
      const summary = await performanceOptimizationService.getPerformanceSummary();

      res.json({
        success: true,
        data: summary,
        message: 'Performance summary retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getPerformanceSummary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve performance summary'
      });
    }
  }

  /**
   * Rate Limiting
   */
  async logRateLimitAttempt(req: Request, res: Response) {
    try {
      const {
        ipAddress,
        endpoint,
        method,
        userAgent,
        blocked,
        reason
      } = req.body;

      if (!ipAddress || !endpoint || !method) {
        return res.status(400).json({
          success: false,
          message: 'IP address, endpoint, and method are required'
        });
      }

      const userId = (req as any).user?.id;

      await performanceOptimizationService.logRateLimitAttempt({
        ipAddress,
        endpoint,
        method,
        userAgent,
        userId,
        blocked: blocked || false,
        reason
      });

      res.json({
        success: true,
        message: 'Rate limit attempt logged successfully'
      });
    } catch (error) {
      console.error('Error in logRateLimitAttempt:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to log rate limit attempt'
      });
    }
  }

  async getRateLimitStats(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      const stats = await performanceOptimizationService.getRateLimitStats(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: stats,
        message: 'Rate limit statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getRateLimitStats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve rate limit statistics'
      });
    }
  }

  /**
   * Cache Optimization
   */
  async optimizeCache(_req: Request, res: Response) {
    try {
      const result = await performanceOptimizationService.optimizeCache();

      res.json({
        success: true,
        data: result,
        message: 'Cache optimization completed successfully'
      });
    } catch (error) {
      console.error('Error in optimizeCache:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to optimize cache'
      });
    }
  }

  /**
   * Performance Recommendations
   */
  async getPerformanceRecommendations(_req: Request, res: Response) {
    try {
      const recommendations = await performanceOptimizationService.generatePerformanceRecommendations();

      res.json({
        success: true,
        data: recommendations,
        message: 'Performance recommendations generated successfully'
      });
    } catch (error) {
      console.error('Error in getPerformanceRecommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate performance recommendations'
      });
    }
  }

  /**
   * System Health Check
   */
  async getSystemHealth(_req: Request, res: Response) {
    try {
      const summary = await performanceOptimizationService.getPerformanceSummary();
      const cacheStats = await performanceOptimizationService.getCacheStats();
      const recommendations = await performanceOptimizationService.generatePerformanceRecommendations();

      const health = {
        status: 'healthy',
        timestamp: new Date(),
        performance: summary,
        cache: cacheStats,
        recommendations: recommendations.length,
        criticalIssues: recommendations.filter(r => r.priority === 'high').length
      };

      // Determine overall health status
      if (health.criticalIssues > 0) {
        health.status = 'warning';
      }

      if (summary && (
        summary.responseTime.average > 1000 ||
        summary.memoryUsage.average > 1024 ||
        summary.cpuUsage.average > 90
      )) {
        health.status = 'critical';
      }

      res.json({
        success: true,
        data: health,
        message: 'System health check completed'
      });
    } catch (error) {
      console.error('Error in getSystemHealth:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get system health'
      });
    }
  }
}

export default new PerformanceOptimizationController();
