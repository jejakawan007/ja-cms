# 📊 Media Analytics System

> **Comprehensive Media Intelligence JA-CMS**  
> Advanced analytics dengan AI insights dan performance optimization

---

## 📋 **Deskripsi**

Media Analytics System menyediakan insights yang mendalam tentang penggunaan, performa, dan optimisasi media assets. Sistem ini menggunakan AI untuk menganalisis patterns, memberikan recommendations, dan membantu optimisasi media management strategy.

---

## ⭐ **Core Features**

### **1. 📈 Usage Analytics**

#### **Media Usage Tracking:**
```typescript
interface MediaUsageEvent {
  id: string;
  mediaFileId: string;
  eventType: 'view' | 'download' | 'share' | 'embed' | 'search' | 'upload' | 'delete';
  userId?: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  context: {
    page?: string;
    source: 'website' | 'admin' | 'api' | 'cdn';
    device: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
    country?: string;
    region?: string;
  };
  metadata: {
    duration?: number; // for video views
    position?: number; // for video/audio position
    quality?: string; // for video quality
    bandwidth?: number; // for streaming
  };
  timestamp: Date;
}

interface MediaAnalytics {
  fileId: string;
  file: MediaFile;
  timeRange: DateRange;
  usage: {
    totalViews: number;
    uniqueViews: number;
    totalDownloads: number;
    uniqueDownloads: number;
    shares: number;
    embeds: number;
    searches: number;
  };
  performance: {
    averageLoadTime: number;
    bounceRate: number; // for videos
    completionRate: number; // for videos
    engagementScore: number;
  };
  audience: {
    topCountries: CountryStats[];
    topDevices: DeviceStats[];
    topBrowsers: BrowserStats[];
    peakHours: HourlyStats[];
  };
  trends: {
    viewTrend: TrendData[];
    downloadTrend: TrendData[];
    engagementTrend: TrendData[];
  };
  insights: MediaInsight[];
}

interface MediaInsight {
  type: 'performance' | 'audience' | 'optimization' | 'trend';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  recommendation?: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number; // 0-1
}
```

#### **Analytics Service:**
```typescript
export class MediaAnalyticsService {
  private eventTracker: EventTracker;
  private dataProcessor: DataProcessor;
  private insightEngine: InsightEngine;
  private reportGenerator: ReportGenerator;

  async trackEvent(event: MediaUsageEvent): Promise<void> {
    // Validate event data
    const validation = this.validateEvent(event);
    if (!validation.valid) {
      console.error('Invalid analytics event:', validation.errors);
      return;
    }

    // Enrich event with additional data
    const enrichedEvent = await this.enrichEvent(event);

    // Store event
    await this.eventTracker.track(enrichedEvent);

    // Update real-time metrics
    await this.updateRealTimeMetrics(enrichedEvent);

    // Process for insights (async)
    this.processEventForInsights(enrichedEvent).catch(console.error);
  }

  async getMediaAnalytics(fileId: string, timeRange: DateRange): Promise<MediaAnalytics> {
    const file = await this.getMediaFile(fileId);
    if (!file) {
      throw new Error('Media file not found');
    }

    // Get usage statistics
    const usage = await this.calculateUsageStats(fileId, timeRange);

    // Get performance metrics
    const performance = await this.calculatePerformanceMetrics(fileId, timeRange);

    // Get audience analytics
    const audience = await this.calculateAudienceAnalytics(fileId, timeRange);

    // Get trends
    const trends = await this.calculateTrends(fileId, timeRange);

    // Generate insights
    const insights = await this.generateInsights(fileId, { usage, performance, audience, trends });

    return {
      fileId,
      file,
      timeRange,
      usage,
      performance,
      audience,
      trends,
      insights
    };
  }

  async getLibraryAnalytics(folderId?: string, timeRange?: DateRange): Promise<LibraryAnalytics> {
    const defaultTimeRange = timeRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    };

    // Get all files in scope
    const files = await this.getFilesInScope(folderId);

    // Calculate aggregate statistics
    const overview = await this.calculateLibraryOverview(files, defaultTimeRange);
    const topFiles = await this.getTopPerformingFiles(files, defaultTimeRange, 20);
    const fileTypes = await this.getFileTypeAnalytics(files, defaultTimeRange);
    const storage = await this.getStorageAnalytics(files, defaultTimeRange);
    const trends = await this.getLibraryTrends(files, defaultTimeRange);

    return {
      folderId,
      timeRange: defaultTimeRange,
      overview,
      topFiles,
      fileTypes,
      storage,
      trends,
      insights: await this.generateLibraryInsights({
        overview,
        topFiles,
        fileTypes,
        storage,
        trends
      })
    };
  }

  async generateReport(reportConfig: ReportConfig): Promise<AnalyticsReport> {
    const report = await this.reportGenerator.generate(reportConfig);
    
    // Store report for future reference
    await this.storeReport(report);

    // Send report if configured
    if (reportConfig.delivery) {
      await this.deliverReport(report, reportConfig.delivery);
    }

    return report;
  }

  private async enrichEvent(event: MediaUsageEvent): Promise<EnrichedMediaUsageEvent> {
    const enrichedEvent = { ...event } as EnrichedMediaUsageEvent;

    // Get user information if available
    if (event.userId) {
      const user = await this.getUserInfo(event.userId);
      enrichedEvent.user = {
        id: user.id,
        type: user.type,
        registrationDate: user.createdAt,
        totalFiles: user.fileCount
      };
    }

    // Get file information
    const file = await this.getMediaFile(event.mediaFileId);
    if (file) {
      enrichedEvent.fileInfo = {
        size: file.size,
        type: file.mimeType,
        folder: file.folder?.name,
        tags: file.tags.map(t => t.name),
        age: Date.now() - file.createdAt.getTime()
      };
    }

    // Geo-location from IP
    if (event.ipAddress) {
      const location = await this.getLocationFromIP(event.ipAddress);
      enrichedEvent.context.country = location.country;
      enrichedEvent.context.region = location.region;
      enrichedEvent.context.city = location.city;
    }

    // Parse user agent for device info
    const deviceInfo = this.parseUserAgent(event.userAgent);
    enrichedEvent.context.device = deviceInfo.device;
    enrichedEvent.context.browser = deviceInfo.browser;
    enrichedEvent.context.os = deviceInfo.os;

    return enrichedEvent;
  }

  private async calculateUsageStats(fileId: string, timeRange: DateRange): Promise<UsageStats> {
    const events = await this.getFileEvents(fileId, timeRange);

    const views = events.filter(e => e.eventType === 'view');
    const downloads = events.filter(e => e.eventType === 'download');
    const shares = events.filter(e => e.eventType === 'share');
    const embeds = events.filter(e => e.eventType === 'embed');
    const searches = events.filter(e => e.eventType === 'search');

    return {
      totalViews: views.length,
      uniqueViews: new Set(views.map(e => e.sessionId)).size,
      totalDownloads: downloads.length,
      uniqueDownloads: new Set(downloads.map(e => e.sessionId)).size,
      shares: shares.length,
      embeds: embeds.length,
      searches: searches.length
    };
  }

  private async calculatePerformanceMetrics(fileId: string, timeRange: DateRange): Promise<PerformanceMetrics> {
    const events = await this.getFileEvents(fileId, timeRange, ['view']);
    
    // Calculate load times
    const loadTimes = events
      .filter(e => e.metadata.loadTime)
      .map(e => e.metadata.loadTime!);
    
    const averageLoadTime = loadTimes.length > 0 
      ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length 
      : 0;

    // For video files, calculate engagement metrics
    const videoEvents = events.filter(e => e.metadata.duration);
    let bounceRate = 0;
    let completionRate = 0;
    let engagementScore = 0;

    if (videoEvents.length > 0) {
      const shortViews = videoEvents.filter(e => 
        e.metadata.position! < (e.metadata.duration! * 0.1) // Less than 10% watched
      ).length;
      
      bounceRate = (shortViews / videoEvents.length) * 100;

      const completeViews = videoEvents.filter(e => 
        e.metadata.position! > (e.metadata.duration! * 0.9) // More than 90% watched
      ).length;
      
      completionRate = (completeViews / videoEvents.length) * 100;

      // Calculate average watch percentage
      const watchPercentages = videoEvents.map(e => 
        (e.metadata.position! / e.metadata.duration!) * 100
      );
      
      engagementScore = watchPercentages.reduce((sum, pct) => sum + pct, 0) / watchPercentages.length;
    }

    return {
      averageLoadTime,
      bounceRate,
      completionRate,
      engagementScore
    };
  }

  private async generateInsights(
    fileId: string, 
    analytics: {
      usage: UsageStats;
      performance: PerformanceMetrics;
      audience: AudienceAnalytics;
      trends: TrendAnalytics;
    }
  ): Promise<MediaInsight[]> {
    const insights: MediaInsight[] = [];
    const file = await this.getMediaFile(fileId);

    // High bounce rate insight (for videos)
    if (file?.mimeType.startsWith('video/') && analytics.performance.bounceRate > 70) {
      insights.push({
        type: 'performance',
        severity: 'warning',
        title: 'High Bounce Rate Detected',
        description: `${analytics.performance.bounceRate.toFixed(1)}% of viewers leave within the first 10% of the video`,
        recommendation: 'Consider improving the video intro or thumbnail to better engage viewers',
        impact: 'high',
        confidence: 0.85
      });
    }

    // Slow load time insight
    if (analytics.performance.averageLoadTime > 3000) { // 3 seconds
      insights.push({
        type: 'performance',
        severity: 'critical',
        title: 'Slow Loading Performance',
        description: `Average load time is ${(analytics.performance.averageLoadTime / 1000).toFixed(1)}s`,
        recommendation: 'Consider optimizing file size, enabling CDN, or using progressive loading',
        impact: 'high',
        confidence: 0.9
      });
    }

    // Popular content insight
    if (analytics.usage.totalViews > 1000) {
      insights.push({
        type: 'trend',
        severity: 'info',
        title: 'High-Performing Content',
        description: `This file has received ${analytics.usage.totalViews} views, making it popular content`,
        recommendation: 'Consider creating similar content or promoting this file more prominently',
        impact: 'medium',
        confidence: 0.95
      });
    }

    // Mobile optimization insight
    const mobileUsage = analytics.audience.topDevices.find(d => d.device === 'mobile');
    if (mobileUsage && mobileUsage.percentage > 60 && analytics.performance.averageLoadTime > 2000) {
      insights.push({
        type: 'optimization',
        severity: 'warning',
        title: 'Mobile Optimization Needed',
        description: `${mobileUsage.percentage.toFixed(1)}% of views are from mobile devices with slower load times`,
        recommendation: 'Optimize file for mobile viewing with responsive images or adaptive streaming',
        impact: 'high',
        confidence: 0.8
      });
    }

    // Declining trend insight
    const recentTrend = analytics.trends.viewTrend.slice(-7); // Last 7 data points
    if (recentTrend.length >= 3) {
      const isDecreasing = recentTrend.every((point, index) => 
        index === 0 || point.value <= recentTrend[index - 1].value
      );
      
      if (isDecreasing) {
        insights.push({
          type: 'trend',
          severity: 'warning',
          title: 'Declining View Trend',
          description: 'Views have been consistently decreasing over the past week',
          recommendation: 'Review content relevance, update metadata, or consider refreshing the content',
          impact: 'medium',
          confidence: 0.75
        });
      }
    }

    return insights;
  }
}

interface LibraryAnalytics {
  folderId?: string;
  timeRange: DateRange;
  overview: {
    totalFiles: number;
    totalSize: number;
    totalViews: number;
    totalDownloads: number;
    averageEngagement: number;
    storageGrowth: number; // percentage
  };
  topFiles: TopFile[];
  fileTypes: FileTypeAnalytics[];
  storage: StorageAnalytics;
  trends: LibraryTrends;
  insights: LibraryInsight[];
}

interface TopFile {
  file: MediaFile;
  views: number;
  downloads: number;
  engagement: number;
  trend: 'up' | 'down' | 'stable';
}

interface FileTypeAnalytics {
  type: string;
  count: number;
  percentage: number;
  totalSize: number;
  averageSize: number;
  views: number;
  downloads: number;
  performance: {
    averageLoadTime: number;
    engagementScore: number;
  };
}

interface StorageAnalytics {
  totalSize: number;
  breakdown: {
    byType: Record<string, number>;
    byFolder: Record<string, number>;
    byAge: Record<string, number>;
  };
  growth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  optimization: {
    duplicates: number;
    unused: number;
    oversized: number;
    potentialSavings: number;
  };
}

interface UsageStats {
  totalViews: number;
  uniqueViews: number;
  totalDownloads: number;
  uniqueDownloads: number;
  shares: number;
  embeds: number;
  searches: number;
}

interface PerformanceMetrics {
  averageLoadTime: number;
  bounceRate: number;
  completionRate: number;
  engagementScore: number;
}

interface AudienceAnalytics {
  topCountries: CountryStats[];
  topDevices: DeviceStats[];
  topBrowsers: BrowserStats[];
  peakHours: HourlyStats[];
}
```

### **2. 🎯 Performance Analytics**

#### **Performance Monitoring:**
```typescript
export class MediaPerformanceService {
  async trackPerformance(fileId: string, metrics: PerformanceMetrics): Promise<void> {
    const performanceEvent = {
      fileId,
      loadTime: metrics.loadTime,
      renderTime: metrics.renderTime,
      bandwidth: metrics.bandwidth,
      quality: metrics.quality,
      errors: metrics.errors,
      userAgent: metrics.userAgent,
      connection: metrics.connection,
      timestamp: new Date()
    };

    await this.storePerformanceEvent(performanceEvent);
    await this.updatePerformanceAggregates(fileId, performanceEvent);
  }

  async getPerformanceReport(fileId: string, timeRange: DateRange): Promise<PerformanceReport> {
    const events = await this.getPerformanceEvents(fileId, timeRange);
    
    return {
      fileId,
      timeRange,
      metrics: {
        averageLoadTime: this.calculateAverage(events, 'loadTime'),
        p95LoadTime: this.calculatePercentile(events, 'loadTime', 95),
        p99LoadTime: this.calculatePercentile(events, 'loadTime', 99),
        errorRate: this.calculateErrorRate(events),
        bandwidth: {
          average: this.calculateAverage(events, 'bandwidth'),
          peak: this.calculateMax(events, 'bandwidth'),
          distribution: this.calculateBandwidthDistribution(events)
        }
      },
      trends: await this.calculatePerformanceTrends(events),
      breakdown: {
        byDevice: this.groupBy(events, 'device'),
        byBrowser: this.groupBy(events, 'browser'),
        byConnection: this.groupBy(events, 'connection'),
        byRegion: this.groupBy(events, 'region')
      },
      insights: await this.generatePerformanceInsights(events)
    };
  }

  async optimizePerformance(fileId: string): Promise<OptimizationRecommendations> {
    const file = await this.getMediaFile(fileId);
    const performance = await this.getPerformanceReport(fileId, {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    });

    const recommendations: PerformanceRecommendation[] = [];

    // Large file size recommendation
    if (file.size > 10 * 1024 * 1024) { // > 10MB
      recommendations.push({
        type: 'compression',
        priority: 'high',
        title: 'Compress Large File',
        description: `File size is ${this.formatFileSize(file.size)}. Consider compression to improve load times.`,
        estimatedImprovement: '30-50% faster loading',
        actions: [
          'Enable image compression',
          'Use modern formats (WebP, AVIF)',
          'Implement progressive loading'
        ]
      });
    }

    // Slow load time recommendation
    if (performance.metrics.averageLoadTime > 3000) {
      recommendations.push({
        type: 'caching',
        priority: 'high',
        title: 'Improve Caching Strategy',
        description: `Average load time is ${(performance.metrics.averageLoadTime / 1000).toFixed(1)}s.`,
        estimatedImprovement: '40-60% faster loading',
        actions: [
          'Enable CDN caching',
          'Set appropriate cache headers',
          'Implement browser caching'
        ]
      });
    }

    // Mobile performance recommendation
    const mobilePerformance = performance.breakdown.byDevice.mobile;
    if (mobilePerformance && mobilePerformance.averageLoadTime > 5000) {
      recommendations.push({
        type: 'mobile_optimization',
        priority: 'medium',
        title: 'Optimize for Mobile',
        description: 'Mobile load times are significantly slower than desktop.',
        estimatedImprovement: '25-40% faster mobile loading',
        actions: [
          'Create mobile-optimized variants',
          'Implement responsive images',
          'Use adaptive bitrate streaming'
        ]
      });
    }

    return {
      fileId,
      currentPerformance: performance.metrics,
      recommendations,
      estimatedImpact: this.calculateEstimatedImpact(recommendations)
    };
  }

  private async generatePerformanceInsights(events: PerformanceEvent[]): Promise<PerformanceInsight[]> {
    const insights: PerformanceInsight[] = [];

    // Identify performance bottlenecks
    const slowEvents = events.filter(e => e.loadTime > 5000);
    if (slowEvents.length > events.length * 0.1) { // More than 10% slow
      insights.push({
        type: 'bottleneck',
        title: 'Performance Bottleneck Detected',
        description: `${((slowEvents.length / events.length) * 100).toFixed(1)}% of loads are slower than 5 seconds`,
        impact: 'high',
        recommendation: 'Investigate server response times and file optimization'
      });
    }

    // Regional performance variations
    const regionalPerformance = this.groupBy(events, 'region');
    const avgLoadTimes = Object.entries(regionalPerformance).map(([region, regionEvents]) => ({
      region,
      avgLoadTime: this.calculateAverage(regionEvents, 'loadTime')
    }));

    const maxDifference = Math.max(...avgLoadTimes.map(r => r.avgLoadTime)) - 
                         Math.min(...avgLoadTimes.map(r => r.avgLoadTime));

    if (maxDifference > 2000) { // 2 second difference
      insights.push({
        type: 'regional_variance',
        title: 'Regional Performance Variance',
        description: `Load times vary by up to ${(maxDifference / 1000).toFixed(1)}s across regions`,
        impact: 'medium',
        recommendation: 'Consider implementing a global CDN or regional optimization'
      });
    }

    return insights;
  }
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bandwidth: number;
  quality: string;
  errors: string[];
  userAgent: string;
  connection: string;
}

interface PerformanceReport {
  fileId: string;
  timeRange: DateRange;
  metrics: {
    averageLoadTime: number;
    p95LoadTime: number;
    p99LoadTime: number;
    errorRate: number;
    bandwidth: {
      average: number;
      peak: number;
      distribution: BandwidthDistribution;
    };
  };
  trends: PerformanceTrend[];
  breakdown: {
    byDevice: Record<string, DevicePerformance>;
    byBrowser: Record<string, BrowserPerformance>;
    byConnection: Record<string, ConnectionPerformance>;
    byRegion: Record<string, RegionalPerformance>;
  };
  insights: PerformanceInsight[];
}

interface PerformanceRecommendation {
  type: 'compression' | 'caching' | 'mobile_optimization' | 'cdn' | 'format_conversion';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  estimatedImprovement: string;
  actions: string[];
}

interface OptimizationRecommendations {
  fileId: string;
  currentPerformance: any;
  recommendations: PerformanceRecommendation[];
  estimatedImpact: {
    loadTimeImprovement: number; // percentage
    bandwidthSavings: number; // percentage
    userExperienceScore: number; // 0-100
  };
}
```

### **3. 🔍 Search Analytics**

#### **Search Performance Tracking:**
```typescript
export class MediaSearchAnalyticsService {
  async trackSearchEvent(event: SearchAnalyticsEvent): Promise<void> {
    const enrichedEvent = await this.enrichSearchEvent(event);
    await this.storeSearchEvent(enrichedEvent);
    await this.updateSearchMetrics(enrichedEvent);
  }

  async getSearchAnalytics(timeRange: DateRange): Promise<SearchAnalytics> {
    const events = await this.getSearchEvents(timeRange);
    
    return {
      timeRange,
      overview: {
        totalSearches: events.length,
        uniqueSearchers: new Set(events.map(e => e.sessionId)).size,
        averageResultsPerSearch: this.calculateAverage(events, 'resultCount'),
        clickThroughRate: this.calculateClickThroughRate(events),
        noResultsRate: this.calculateNoResultsRate(events),
        averageSearchTime: this.calculateAverage(events, 'searchTime')
      },
      queries: {
        top: await this.getTopQueries(events),
        trending: await this.getTrendingQueries(events),
        noResults: await this.getNoResultQueries(events),
        abandoned: await this.getAbandonedQueries(events)
      },
      performance: {
        searchTime: this.analyzeSearchTimes(events),
        resultRelevance: await this.analyzeResultRelevance(events),
        userSatisfaction: await this.calculateUserSatisfaction(events)
      },
      insights: await this.generateSearchInsights(events)
    };
  }

  async optimizeSearchExperience(): Promise<SearchOptimization> {
    const analytics = await this.getSearchAnalytics({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    });

    const optimizations: SearchOptimizationAction[] = [];

    // High no-results rate
    if (analytics.overview.noResultsRate > 20) {
      optimizations.push({
        type: 'index_expansion',
        priority: 'high',
        description: 'Expand search index to reduce no-results queries',
        impact: 'Reduce no-results rate by 15-25%'
      });
    }

    // Slow search performance
    if (analytics.overview.averageSearchTime > 1000) {
      optimizations.push({
        type: 'performance_tuning',
        priority: 'medium',
        description: 'Optimize search performance and indexing',
        impact: 'Improve search speed by 30-50%'
      });
    }

    // Low click-through rate
    if (analytics.overview.clickThroughRate < 30) {
      optimizations.push({
        type: 'relevance_improvement',
        priority: 'high',
        description: 'Improve search result relevance and ranking',
        impact: 'Increase click-through rate by 20-40%'
      });
    }

    return {
      currentMetrics: analytics.overview,
      optimizations,
      estimatedImpact: this.calculateSearchOptimizationImpact(optimizations)
    };
  }

  private async generateSearchInsights(events: SearchAnalyticsEvent[]): Promise<SearchInsight[]> {
    const insights: SearchInsight[] = [];

    // Popular search terms that return few results
    const lowResultQueries = events.filter(e => e.resultCount < 3 && e.resultCount > 0);
    if (lowResultQueries.length > events.length * 0.15) {
      insights.push({
        type: 'content_gap',
        title: 'Content Gap Identified',
        description: `${((lowResultQueries.length / events.length) * 100).toFixed(1)}% of searches return very few results`,
        recommendation: 'Consider adding more content for popular search terms',
        impact: 'medium'
      });
    }

    // Search pattern analysis
    const searchPatterns = this.analyzeSearchPatterns(events);
    if (searchPatterns.hasSeasonalTrends) {
      insights.push({
        type: 'seasonal_trend',
        title: 'Seasonal Search Patterns Detected',
        description: 'Search behavior shows seasonal variations',
        recommendation: 'Prepare content and optimize for seasonal peaks',
        impact: 'low'
      });
    }

    return insights;
  }
}

interface SearchAnalyticsEvent {
  query: string;
  resultCount: number;
  searchTime: number;
  clicked: boolean;
  clickPosition?: number;
  sessionId: string;
  userId?: string;
  timestamp: Date;
}

interface SearchAnalytics {
  timeRange: DateRange;
  overview: {
    totalSearches: number;
    uniqueSearchers: number;
    averageResultsPerSearch: number;
    clickThroughRate: number;
    noResultsRate: number;
    averageSearchTime: number;
  };
  queries: {
    top: TopQuery[];
    trending: TrendingQuery[];
    noResults: NoResultQuery[];
    abandoned: AbandonedQuery[];
  };
  performance: {
    searchTime: SearchTimeAnalysis;
    resultRelevance: RelevanceAnalysis;
    userSatisfaction: SatisfactionScore;
  };
  insights: SearchInsight[];
}

interface SearchOptimization {
  currentMetrics: any;
  optimizations: SearchOptimizationAction[];
  estimatedImpact: {
    searchSpeedImprovement: number;
    relevanceImprovement: number;
    userSatisfactionIncrease: number;
  };
}

interface SearchOptimizationAction {
  type: 'index_expansion' | 'performance_tuning' | 'relevance_improvement' | 'ui_enhancement';
  priority: 'low' | 'medium' | 'high';
  description: string;
  impact: string;
}
```

---

## 🎨 **Analytics Interface**

### **Media Analytics Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Media Analytics                     [Export] [Schedule] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Overview (Last 30 Days) ──────────────────────────┐   │
│ │ 📁 Total Files: 12,345 (+234 new)                 │   │
│ │ 💾 Storage: 45.6GB (+2.3GB growth)                │   │
│ │ 👁️ Total Views: 234.5K (+15.2% vs last month)     │   │
│ │ 📥 Downloads: 45.6K (+8.9% vs last month)         │   │
│ │ ⚡ Avg Load Time: 1.2s (↓ 0.3s improvement)       │   │
│ │ 🎯 Engagement: 78% (↑ 5% improvement)             │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Top Performing Files ─────────────────────────────┐   │
│ │ File                    Views    Downloads  Engage  │   │
│ │ 🖼️ hero-banner.webp      23.4K    1.2K      94%   │   │
│ │ 🎥 product-demo.mp4      18.7K    890       87%   │   │
│ │ 📄 user-guide.pdf        12.3K    2.1K      76%   │   │
│ │ 🖼️ logo-variations.svg   9.8K     567       91%   │   │
│ │ 🎵 intro-music.mp3       8.1K     234       82%   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ File Type Performance ─┐ ┌─ Geographic Distribution ─┐ │
│ │ 🖼️ Images: 67.2%         │ │ 🇺🇸 United States: 34.2% │ │
│ │   Views: 156.8K          │ │ 🇬🇧 United Kingdom: 12.8% │ │
│ │   Avg Load: 0.8s         │ │ 🇩🇪 Germany: 9.1%        │ │
│ │                          │ │ 🇫🇷 France: 7.3%         │ │
│ │ 🎥 Videos: 18.4%         │ │ 🇯🇵 Japan: 6.9%          │ │
│ │   Views: 43.2K           │ │ 🌍 Others: 29.7%         │ │
│ │   Avg Load: 3.2s         │ │                          │ │
│ │                          │ │ Peak Hours:              │ │
│ │ 📄 Documents: 14.4%      │ │ 🕘 9-11 AM: 23.4%        │ │
│ │   Views: 33.8K           │ │ 🕐 1-3 PM: 19.8%         │ │
│ │   Avg Load: 1.5s         │ │ 🕖 7-9 PM: 15.2%         │ │
│ └──────────────────────────┘ └───────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **Performance Analytics Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ ⚡ Performance Analytics               [Real-time] [Optimize] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Load Time Analysis ───────────────────────────────┐   │
│ │ Average: 1.2s (Target: <2s) ✅                     │   │
│ │ P95: 2.8s (Target: <5s) ✅                        │   │
│ │ P99: 4.1s (Target: <8s) ✅                        │   │
│ │                                                   │   │
│ │ Load Time ┌─────────────────────────────────────┐  │   │
│ │ (seconds) │               ╭─╮                   │  │   │
│ │     4     │             ╭─╯ ╰─╮                 │  │   │
│ │     3     │           ╭─╯     ╰─╮               │  │   │
│ │     2     │         ╭─╯         ╰─╮             │  │   │
│ │     1     │       ╭─╯             ╰─╮           │  │   │
│ │     0     └─────────────────────────────────────┘  │   │
│ │           Jan 1    Jan 15    Jan 30              │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Device Performance ───┐ ┌─ Connection Speed ────────┐ │
│ │ 💻 Desktop: 0.9s        │ │ 🚀 Fast (>10Mbps): 0.8s  │ │
│ │ 📱 Mobile: 1.8s         │ │ 🏃 Medium (1-10Mbps): 1.5s│ │
│ │ 📟 Tablet: 1.3s         │ │ 🐌 Slow (<1Mbps): 3.2s   │ │
│ └─────────────────────────┘ └───────────────────────────┘ │
│                                                         │
│ ┌─ Optimization Opportunities ───────────────────────┐   │
│ │ 💡 Recommendations:                                │   │
│ │ • Compress 234 large images (-30% load time)      │   │
│ │ • Enable CDN for 89 slow-loading files            │   │
│ │ • Convert 156 files to modern formats (WebP)      │   │
│ │ • Implement lazy loading for 67 below-fold images │   │
│ │                                                   │   │
│ │ Estimated Impact: 35% faster loading • $89/mo savings │
│ │ [Apply Optimizations] [Schedule Review]            │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Analytics tracking
POST   /api/media/analytics/track         // Track usage event
POST   /api/media/analytics/performance   // Track performance
POST   /api/media/analytics/search        // Track search event
POST   /api/media/analytics/batch         // Batch track events

// Analytics data
GET    /api/media/analytics/file/{id}     // File analytics
GET    /api/media/analytics/library       // Library analytics
GET    /api/media/analytics/performance   // Performance analytics
GET    /api/media/analytics/search        // Search analytics

// Reports
POST   /api/media/analytics/reports       // Generate report
GET    /api/media/analytics/reports       // List reports
GET    /api/media/analytics/reports/{id}  // Get report
DELETE /api/media/analytics/reports/{id}  // Delete report

// Insights & optimization
GET    /api/media/analytics/insights      // Get insights
POST   /api/media/analytics/optimize      // Get optimization recommendations
GET    /api/media/analytics/trends        // Get trend analysis
```

### **Database Schema:**
```sql
-- Media usage events
CREATE TABLE media_usage_events (
  id UUID PRIMARY KEY,
  media_file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  event_type VARCHAR(20) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(100) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  context JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Performance events
CREATE TABLE media_performance_events (
  id UUID PRIMARY KEY,
  media_file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  load_time INTEGER NOT NULL,
  render_time INTEGER,
  bandwidth INTEGER,
  quality VARCHAR(20),
  errors TEXT[],
  user_agent TEXT,
  connection_type VARCHAR(20),
  device_type VARCHAR(20),
  browser VARCHAR(50),
  os VARCHAR(50),
  country VARCHAR(2),
  region VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Search events
CREATE TABLE media_search_events (
  id UUID PRIMARY KEY,
  query TEXT NOT NULL,
  result_count INTEGER DEFAULT 0,
  search_time INTEGER DEFAULT 0,
  clicked BOOLEAN DEFAULT false,
  click_position INTEGER,
  session_id VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics aggregates
CREATE TABLE media_analytics_daily (
  id UUID PRIMARY KEY,
  media_file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  unique_downloads INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  avg_load_time INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(media_file_id, date)
);

-- Performance aggregates
CREATE TABLE media_performance_daily (
  id UUID PRIMARY KEY,
  media_file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  avg_load_time INTEGER DEFAULT 0,
  p95_load_time INTEGER DEFAULT 0,
  p99_load_time INTEGER DEFAULT 0,
  error_rate DECIMAL(5,2) DEFAULT 0,
  total_requests INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(media_file_id, date)
);

-- Search analytics
CREATE TABLE search_analytics_daily (
  id UUID PRIMARY KEY,
  date DATE NOT NULL,
  total_searches INTEGER DEFAULT 0,
  unique_searchers INTEGER DEFAULT 0,
  avg_results_per_search DECIMAL(8,2) DEFAULT 0,
  click_through_rate DECIMAL(5,2) DEFAULT 0,
  no_results_rate DECIMAL(5,2) DEFAULT 0,
  avg_search_time INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date)
);

-- Analytics reports
CREATE TABLE analytics_reports (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  data JSONB,
  generated_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_media_usage_events_file ON media_usage_events(media_file_id);
CREATE INDEX idx_media_usage_events_created_at ON media_usage_events(created_at);
CREATE INDEX idx_media_performance_events_file ON media_performance_events(media_file_id);
CREATE INDEX idx_media_performance_events_created_at ON media_performance_events(created_at);
CREATE INDEX idx_media_search_events_query ON media_search_events(query);
CREATE INDEX idx_media_search_events_created_at ON media_search_events(created_at);
CREATE INDEX idx_media_analytics_daily_file_date ON media_analytics_daily(media_file_id, date);
CREATE INDEX idx_media_performance_daily_file_date ON media_performance_daily(media_file_id, date);
CREATE INDEX idx_search_analytics_daily_date ON search_analytics_daily(date);
```

---

## 🔗 **Related Documentation**

- **[Media Library](./library.md)** - File management integration
- **[Media Search](./search.md)** - Search analytics tracking
- **[Media CDN](./cdn.md)** - CDN performance monitoring
- **[System Analytics](../01_analytics/)** - System-wide analytics integration

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
