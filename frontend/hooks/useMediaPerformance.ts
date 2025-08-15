import { useCallback, useRef, useEffect } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  errorCount: number;
  successCount: number;
  averageResponseTime: number;
  cacheHitRate: number;
  userInteractions: {
    search: number;
    upload: number;
    delete: number;
    folderCreate: number;
  };
}

interface PerformanceEvent {
  type: 'load' | 'error' | 'success' | 'interaction';
  action: string;
  duration?: number;
  timestamp: number;
  details?: any;
}

export function useMediaPerformance() {
  const metricsRef = useRef<PerformanceMetrics>({
    loadTime: 0,
    errorCount: 0,
    successCount: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    userInteractions: {
      search: 0,
      upload: 0,
      delete: 0,
      folderCreate: 0,
    },
  });

  const eventsRef = useRef<PerformanceEvent[]>([]);
  const startTimeRef = useRef<number>(0);

  // Start timing
  const startTimer = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  // End timing and record
  const endTimer = useCallback((type: 'load' | 'error' | 'success', action: string, details?: any) => {
    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;

    const event: PerformanceEvent = {
      type,
      action,
      duration,
      timestamp: Date.now(),
      details,
    };

    eventsRef.current.push(event);

    // Update metrics
    const metrics = metricsRef.current;
    
    if (type === 'load') {
      metrics.loadTime = duration;
    } else if (type === 'error') {
      metrics.errorCount++;
    } else if (type === 'success') {
      metrics.successCount++;
    }

    // Calculate average response time
    const responseEvents = eventsRef.current.filter(e => e.duration);
    if (responseEvents.length > 0) {
      const totalDuration = responseEvents.reduce((sum, e) => sum + (e.duration || 0), 0);
      metrics.averageResponseTime = totalDuration / responseEvents.length;
    }

    // Log performance data
    console.log(`Media Performance [${type.toUpperCase()}]: ${action} took ${duration.toFixed(2)}ms`, details);
  }, []);

  // Record user interaction
  const recordInteraction = useCallback((action: keyof PerformanceMetrics['userInteractions']) => {
    metricsRef.current.userInteractions[action]++;
    
    const event: PerformanceEvent = {
      type: 'interaction',
      action,
      timestamp: Date.now(),
    };

    eventsRef.current.push(event);
    console.log(`Media Interaction: ${action}`);
  }, []);

  // Get current metrics
  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  // Get performance report
  const getPerformanceReport = useCallback(() => {
    const metrics = metricsRef.current;
    const totalEvents = eventsRef.current.length;
    const successRate = totalEvents > 0 ? (metrics.successCount / (metrics.successCount + metrics.errorCount)) * 100 : 0;

    return {
      ...metrics,
      totalEvents,
      successRate: `${successRate.toFixed(1)}%`,
      averageResponseTime: `${metrics.averageResponseTime.toFixed(2)}ms`,
      recommendations: getRecommendations(metrics),
    };
  }, []);

  // Get performance recommendations
  const getRecommendations = useCallback((metrics: PerformanceMetrics) => {
    const recommendations: string[] = [];

    if (metrics.averageResponseTime > 1000) {
      recommendations.push('Consider implementing caching for frequently accessed files');
    }

    if (metrics.errorCount > metrics.successCount * 0.1) {
      recommendations.push('High error rate detected - check network connectivity and API endpoints');
    }

    if (metrics.userInteractions.search > 100) {
      recommendations.push('High search usage - consider implementing search suggestions and filters');
    }

    return recommendations;
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      loadTime: 0,
      errorCount: 0,
      successCount: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      userInteractions: {
        search: 0,
        upload: 0,
        delete: 0,
        folderCreate: 0,
      },
    };
    eventsRef.current = [];
  }, []);

  // Auto-cleanup old events (keep last 1000 events)
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (eventsRef.current.length > 1000) {
        eventsRef.current = eventsRef.current.slice(-500);
      }
    }, 60000); // Cleanup every minute

    return () => clearInterval(cleanup);
  }, []);

  return {
    startTimer,
    endTimer,
    recordInteraction,
    getMetrics,
    getPerformanceReport,
    resetMetrics,
  };
}
