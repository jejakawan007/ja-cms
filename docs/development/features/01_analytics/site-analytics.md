# 🌐 Site Analytics System

> **Analisis Performa Website JA-CMS**  
> Comprehensive site performance, traffic analysis, dan SEO metrics

---

## 📋 **Deskripsi**

Site Analytics System menyediakan insights mendalam tentang performa website secara keseluruhan, traffic patterns, SEO performance, dan technical metrics. Sistem ini membantu mengoptimalkan website performance dan meningkatkan user experience berdasarkan data yang akurat.

---

## ⭐ **Core Features**

### **1. 📈 Traffic Analytics**

#### **Website Traffic Tracking:**
```typescript
interface SiteAnalytics {
  overview: {
    totalPageViews: number;
    uniqueVisitors: number;
    sessions: number;
    averageSessionDuration: number;
    bounceRate: number;
    newVsReturning: {
      newVisitors: number;
      returningVisitors: number;
    };
  };
  traffic: {
    sources: TrafficSource[];
    channels: TrafficChannel[];
    referrers: Referrer[];
    campaigns: CampaignData[];
  };
  geography: {
    countries: CountryData[];
    cities: CityData[];
    regions: RegionData[];
  };
  technology: {
    browsers: BrowserData[];
    operatingSystems: OSData[];
    devices: DeviceData[];
    screenResolutions: ScreenData[];
  };
  timeRange: {
    start: Date;
    end: Date;
  };
}

interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  percentage: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
  newUsers: number;
  returningUsers: number;
}

interface TrafficChannel {
  channel: 'organic' | 'direct' | 'social' | 'email' | 'paid' | 'referral';
  sessions: number;
  percentage: number;
  trend: TrendData;
  quality: ChannelQuality;
}

interface ChannelQuality {
  engagementRate: number;
  conversionRate: number;
  averageOrderValue?: number;
  customerLifetimeValue?: number;
  qualityScore: number; // 0-100
}
```

#### **Traffic Analytics Service:**
```typescript
export class SiteAnalyticsService {
  async getSiteAnalytics(timeRange: DateRange): Promise<SiteAnalytics> {
    const overview = await this.getSiteOverview(timeRange);
    const traffic = await this.getTrafficAnalytics(timeRange);
    const geography = await this.getGeographicAnalytics(timeRange);
    const technology = await this.getTechnologyAnalytics(timeRange);

    return {
      overview,
      traffic,
      geography,
      technology,
      timeRange
    };
  }

  async trackPageView(pageViewData: PageViewEvent): Promise<void> {
    // Record page view
    await this.recordPageView({
      url: pageViewData.url,
      title: pageViewData.title,
      userId: pageViewData.userId,
      sessionId: pageViewData.sessionId,
      referrer: pageViewData.referrer,
      userAgent: pageViewData.userAgent,
      ipAddress: pageViewData.ipAddress,
      timestamp: new Date(),
      loadTime: pageViewData.loadTime,
      scrollDepth: pageViewData.scrollDepth
    });

    // Update real-time metrics
    await this.updateRealTimeMetrics(pageViewData);
  }

  async analyzeTrafficSources(timeRange: DateRange): Promise<TrafficSourceAnalysis> {
    const sources = await this.getTrafficSources(timeRange);
    const previousPeriod = this.getPreviousPeriod(timeRange);
    const previousSources = await this.getTrafficSources(previousPeriod);

    return {
      current: sources,
      previous: previousSources,
      trends: this.calculateSourceTrends(sources, previousSources),
      insights: this.generateSourceInsights(sources),
      recommendations: this.generateSourceRecommendations(sources)
    };
  }

  async getTopPages(criteria: TopPagesCriteria): Promise<TopPagesAnalysis> {
    const pages = await this.getPageAnalytics(criteria.timeRange, criteria.metric);
    
    return {
      pages: pages.map(page => ({
        url: page.url,
        title: page.title,
        pageViews: page.pageViews,
        uniquePageViews: page.uniquePageViews,
        averageTimeOnPage: page.averageTimeOnPage,
        bounceRate: page.bounceRate,
        exitRate: page.exitRate,
        entrances: page.entrances,
        conversionRate: page.conversionRate,
        trend: page.trend
      })),
      insights: this.generatePageInsights(pages),
      opportunities: this.identifyPageOptimizationOpportunities(pages)
    };
  }

  async getRealTimeAnalytics(): Promise<RealTimeAnalytics> {
    const activeUsers = await this.getActiveUsers();
    const currentTraffic = await this.getCurrentTraffic();
    const topContent = await this.getCurrentTopContent();
    const events = await this.getRecentEvents(300); // Last 5 minutes

    return {
      activeUsers: {
        current: activeUsers.length,
        trend: await this.getActiveUsersTrend(),
        by: {
          location: this.groupBy(activeUsers, 'country'),
          device: this.groupBy(activeUsers, 'deviceType'),
          source: this.groupBy(activeUsers, 'source')
        }
      },
      traffic: {
        pageViewsPerMinute: currentTraffic.pageViewsPerMinute,
        sessionsPerMinute: currentTraffic.sessionsPerMinute,
        topPages: topContent.pages,
        topSources: currentTraffic.topSources
      },
      events: {
        recent: events,
        conversions: events.filter(e => e.type === 'conversion'),
        goals: events.filter(e => e.type === 'goal_completion')
      }
    };
  }

  private calculateSourceTrends(current: TrafficSource[], previous: TrafficSource[]): SourceTrend[] {
    return current.map(source => {
      const prevSource = previous.find(p => p.source === source.source && p.medium === source.medium);
      
      if (!prevSource) {
        return {
          source: source.source,
          medium: source.medium,
          trend: 'new',
          change: null,
          growth: null
        };
      }

      const change = source.sessions - prevSource.sessions;
      const growth = ((source.sessions - prevSource.sessions) / prevSource.sessions) * 100;

      return {
        source: source.source,
        medium: source.medium,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
        change,
        growth
      };
    });
  }
}

interface TrafficSourceAnalysis {
  current: TrafficSource[];
  previous: TrafficSource[];
  trends: SourceTrend[];
  insights: SourceInsight[];
  recommendations: SourceRecommendation[];
}

interface RealTimeAnalytics {
  activeUsers: {
    current: number;
    trend: TrendData;
    by: {
      location: Record<string, number>;
      device: Record<string, number>;
      source: Record<string, number>;
    };
  };
  traffic: {
    pageViewsPerMinute: number;
    sessionsPerMinute: number;
    topPages: TopPage[];
    topSources: TopSource[];
  };
  events: {
    recent: RecentEvent[];
    conversions: ConversionEvent[];
    goals: GoalEvent[];
  };
}
```

### **2. 🚀 Performance Analytics**

#### **Site Performance Monitoring:**
```typescript
interface PerformanceAnalytics {
  coreWebVitals: {
    largestContentfulPaint: WebVitalMetric;
    firstInputDelay: WebVitalMetric;
    cumulativeLayoutShift: WebVitalMetric;
    firstContentfulPaint: WebVitalMetric;
    timeToInteractive: WebVitalMetric;
  };
  loadTimes: {
    averagePageLoad: number;
    serverResponseTime: number;
    domContentLoaded: number;
    timeToFirstByte: number;
    resourceLoadTime: number;
  };
  errors: {
    count404: number;
    count500: number;
    jsErrors: JSError[];
    brokenLinks: BrokenLink[];
    failedRequests: FailedRequest[];
  };
  uptime: {
    availability: number;
    downtimeEvents: DowntimeEvent[];
    responseTime: ResponseTimeData[];
    slaCompliance: number;
  };
  resources: {
    totalRequests: number;
    totalBytes: number;
    compressionRatio: number;
    cacheHitRate: number;
    cdnUsage: number;
  };
}

export class PerformanceAnalyticsService {
  async getPerformanceAnalytics(timeRange: DateRange): Promise<PerformanceAnalytics> {
    const coreWebVitals = await this.getCoreWebVitals(timeRange);
    const loadTimes = await this.getLoadTimeMetrics(timeRange);
    const errors = await this.getErrorAnalytics(timeRange);
    const uptime = await this.getUptimeAnalytics(timeRange);
    const resources = await this.getResourceAnalytics(timeRange);

    return {
      coreWebVitals,
      loadTimes,
      errors,
      uptime,
      resources
    };
  }

  async trackPerformanceMetrics(metricsData: PerformanceMetricsEvent): Promise<void> {
    // Record performance metrics
    await this.recordPerformanceMetrics({
      url: metricsData.url,
      loadTime: metricsData.loadTime,
      domContentLoaded: metricsData.domContentLoaded,
      firstContentfulPaint: metricsData.firstContentfulPaint,
      largestContentfulPaint: metricsData.largestContentfulPaint,
      firstInputDelay: metricsData.firstInputDelay,
      cumulativeLayoutShift: metricsData.cumulativeLayoutShift,
      timeToInteractive: metricsData.timeToInteractive,
      userId: metricsData.userId,
      sessionId: metricsData.sessionId,
      userAgent: metricsData.userAgent,
      connection: metricsData.connection,
      timestamp: new Date()
    });

    // Update performance aggregates
    await this.updatePerformanceAggregates(metricsData);
  }

  async analyzePagePerformance(url: string, timeRange: DateRange): Promise<PagePerformanceAnalysis> {
    const metrics = await this.getPagePerformanceMetrics(url, timeRange);
    const errors = await this.getPageErrors(url, timeRange);
    const resources = await this.getPageResources(url);

    return {
      url,
      metrics: {
        averageLoadTime: this.calculateAverage(metrics.map(m => m.loadTime)),
        medianLoadTime: this.calculateMedian(metrics.map(m => m.loadTime)),
        p95LoadTime: this.calculatePercentile(metrics.map(m => m.loadTime), 95),
        coreWebVitals: this.calculateCoreWebVitals(metrics)
      },
      performance: {
        score: this.calculatePerformanceScore(metrics),
        grade: this.getPerformanceGrade(metrics),
        issues: this.identifyPerformanceIssues(metrics, resources),
        recommendations: this.generatePerformanceRecommendations(metrics, resources)
      },
      trends: {
        loadTimeTrend: this.calculateLoadTimeTrend(metrics),
        errorTrend: this.calculateErrorTrend(errors),
        improvementOpportunities: this.identifyImprovementOpportunities(metrics)
      }
    };
  }

  async generatePerformanceBudget(pages: string[]): Promise<PerformanceBudget> {
    const budgetRules: BudgetRule[] = [
      {
        metric: 'loadTime',
        threshold: 3000, // 3 seconds
        priority: 'high'
      },
      {
        metric: 'firstContentfulPaint',
        threshold: 1800, // 1.8 seconds
        priority: 'high'
      },
      {
        metric: 'largestContentfulPaint',
        threshold: 2500, // 2.5 seconds
        priority: 'critical'
      },
      {
        metric: 'firstInputDelay',
        threshold: 100, // 100ms
        priority: 'high'
      },
      {
        metric: 'cumulativeLayoutShift',
        threshold: 0.1, // 0.1 CLS score
        priority: 'medium'
      }
    ];

    const budgetStatus = await Promise.all(
      pages.map(async page => {
        const metrics = await this.getLatestPageMetrics(page);
        const violations = this.checkBudgetViolations(metrics, budgetRules);
        
        return {
          page,
          status: violations.length === 0 ? 'passed' : 'failed',
          violations,
          score: this.calculateBudgetScore(metrics, budgetRules)
        };
      })
    );

    return {
      rules: budgetRules,
      pages: budgetStatus,
      overallScore: this.calculateOverallBudgetScore(budgetStatus),
      recommendations: this.generateBudgetRecommendations(budgetStatus)
    };
  }

  private calculatePerformanceScore(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0;

    const weights = {
      loadTime: 0.3,
      firstContentfulPaint: 0.2,
      largestContentfulPaint: 0.2,
      firstInputDelay: 0.15,
      cumulativeLayoutShift: 0.15
    };

    const scores = metrics.map(metric => {
      let score = 0;
      
      // Load time score (3s = 100, 6s = 50, 10s+ = 0)
      score += this.normalizeScore(metric.loadTime, 3000, 10000) * weights.loadTime;
      
      // FCP score (1.8s = 100, 3s = 50, 6s+ = 0)
      score += this.normalizeScore(metric.firstContentfulPaint, 1800, 6000) * weights.firstContentfulPaint;
      
      // LCP score (2.5s = 100, 4s = 50, 6s+ = 0)
      score += this.normalizeScore(metric.largestContentfulPaint, 2500, 6000) * weights.largestContentfulPaint;
      
      // FID score (100ms = 100, 300ms = 50, 500ms+ = 0)
      score += this.normalizeScore(metric.firstInputDelay, 100, 500) * weights.firstInputDelay;
      
      // CLS score (0.1 = 100, 0.25 = 50, 0.5+ = 0)
      score += this.normalizeScore(metric.cumulativeLayoutShift, 0.1, 0.5, true) * weights.cumulativeLayoutShift;

      return score;
    });

    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  private normalizeScore(value: number, good: number, poor: number, inverse = false): number {
    if (inverse) {
      // For metrics where lower is better (like CLS)
      if (value <= good) return 100;
      if (value >= poor) return 0;
      return 100 - ((value - good) / (poor - good)) * 100;
    } else {
      // For metrics where lower is better (like load time)
      if (value <= good) return 100;
      if (value >= poor) return 0;
      return 100 - ((value - good) / (poor - good)) * 100;
    }
  }
}

interface WebVitalMetric {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  percentile75: number;
  percentile90: number;
  percentile95: number;
  trend: TrendData;
}

interface PagePerformanceAnalysis {
  url: string;
  metrics: {
    averageLoadTime: number;
    medianLoadTime: number;
    p95LoadTime: number;
    coreWebVitals: CoreWebVitalsData;
  };
  performance: {
    score: number; // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    issues: PerformanceIssue[];
    recommendations: PerformanceRecommendation[];
  };
  trends: {
    loadTimeTrend: TrendData;
    errorTrend: TrendData;
    improvementOpportunities: ImprovementOpportunity[];
  };
}

interface PerformanceBudget {
  rules: BudgetRule[];
  pages: PageBudgetStatus[];
  overallScore: number;
  recommendations: BudgetRecommendation[];
}
```

### **3. 🔍 SEO Analytics**

#### **Search Engine Optimization Tracking:**
```typescript
interface SEOAnalytics {
  overview: {
    organicTraffic: number;
    organicTrafficTrend: TrendData;
    averagePosition: number;
    clickThroughRate: number;
    impressions: number;
    clicks: number;
  };
  keywords: {
    totalKeywords: number;
    rankingKeywords: KeywordRanking[];
    topKeywords: TopKeyword[];
    keywordOpportunities: KeywordOpportunity[];
    featuredSnippets: FeaturedSnippet[];
  };
  pages: {
    indexedPages: number;
    crawlErrors: CrawlError[];
    pageTitles: PageTitleAnalysis[];
    metaDescriptions: MetaDescriptionAnalysis[];
    structuredData: StructuredDataAnalysis[];
  };
  backlinks: {
    totalBacklinks: number;
    referringDomains: number;
    domainAuthority: number;
    topBacklinks: Backlink[];
    newBacklinks: Backlink[];
    lostBacklinks: Backlink[];
  };
  technical: {
    siteSpeed: SiteSpeedData;
    mobileUsability: MobileUsabilityData;
    coreWebVitals: CoreWebVitalsData;
    structuredData: StructuredDataStatus;
  };
}

export class SEOAnalyticsService {
  async getSEOAnalytics(timeRange: DateRange): Promise<SEOAnalytics> {
    const overview = await this.getSEOOverview(timeRange);
    const keywords = await this.getKeywordAnalytics(timeRange);
    const pages = await this.getPageAnalytics(timeRange);
    const backlinks = await this.getBacklinkAnalytics(timeRange);
    const technical = await this.getTechnicalSEOAnalytics();

    return {
      overview,
      keywords,
      pages,
      backlinks,
      technical
    };
  }

  async trackKeywordRankings(): Promise<KeywordTrackingResult> {
    const keywords = await this.getTrackedKeywords();
    const rankings: KeywordRanking[] = [];

    for (const keyword of keywords) {
      try {
        const ranking = await this.checkKeywordRanking(keyword);
        rankings.push({
          keyword: keyword.term,
          position: ranking.position,
          url: ranking.url,
          previousPosition: keyword.lastPosition,
          change: ranking.position - (keyword.lastPosition || 0),
          searchVolume: keyword.searchVolume,
          difficulty: keyword.difficulty,
          lastUpdated: new Date()
        });

        // Update keyword tracking data
        await this.updateKeywordTracking(keyword.id, ranking);
      } catch (error) {
        console.error(`Error tracking keyword ${keyword.term}:`, error);
      }
    }

    return {
      keywords: rankings,
      summary: this.generateRankingSummary(rankings),
      improvements: rankings.filter(r => r.change > 0),
      declines: rankings.filter(r => r.change < 0),
      opportunities: await this.identifyKeywordOpportunities(rankings)
    };
  }

  async analyzeTechnicalSEO(url: string): Promise<TechnicalSEOAnalysis> {
    const analysis: TechnicalSEOAnalysis = {
      url,
      issues: [],
      recommendations: [],
      score: 0
    };

    // Analyze page structure
    const pageStructure = await this.analyzePageStructure(url);
    analysis.issues.push(...pageStructure.issues);
    analysis.recommendations.push(...pageStructure.recommendations);

    // Analyze meta tags
    const metaTags = await this.analyzeMetaTags(url);
    analysis.issues.push(...metaTags.issues);
    analysis.recommendations.push(...metaTags.recommendations);

    // Analyze structured data
    const structuredData = await this.analyzeStructuredData(url);
    analysis.issues.push(...structuredData.issues);
    analysis.recommendations.push(...structuredData.recommendations);

    // Analyze mobile usability
    const mobileUsability = await this.analyzeMobileUsability(url);
    analysis.issues.push(...mobileUsability.issues);
    analysis.recommendations.push(...mobileUsability.recommendations);

    // Analyze page speed
    const pageSpeed = await this.analyzePageSpeed(url);
    analysis.issues.push(...pageSpeed.issues);
    analysis.recommendations.push(...pageSpeed.recommendations);

    // Calculate overall SEO score
    analysis.score = this.calculateSEOScore(analysis.issues);

    return analysis;
  }

  async generateSEOReport(timeRange: DateRange): Promise<SEOReport> {
    const analytics = await this.getSEOAnalytics(timeRange);
    const previousPeriod = this.getPreviousPeriod(timeRange);
    const previousAnalytics = await this.getSEOAnalytics(previousPeriod);

    return {
      period: timeRange,
      summary: {
        organicTraffic: analytics.overview.organicTraffic,
        organicTrafficChange: analytics.overview.organicTraffic - previousAnalytics.overview.organicTraffic,
        averagePosition: analytics.overview.averagePosition,
        positionChange: analytics.overview.averagePosition - previousAnalytics.overview.averagePosition,
        totalKeywords: analytics.keywords.totalKeywords,
        keywordsChange: analytics.keywords.totalKeywords - previousAnalytics.keywords.totalKeywords
      },
      topPerformers: {
        keywords: analytics.keywords.topKeywords.slice(0, 10),
        pages: await this.getTopSEOPages(timeRange, 10),
        improvements: await this.getBiggestImprovements(timeRange)
      },
      issues: {
        critical: await this.getCriticalSEOIssues(),
        warnings: await this.getSEOWarnings(),
        recommendations: await this.getSEORecommendations()
      },
      opportunities: {
        keywords: analytics.keywords.keywordOpportunities.slice(0, 10),
        content: await this.getContentOpportunities(),
        technical: await this.getTechnicalOpportunities()
      }
    };
  }

  private calculateSEOScore(issues: SEOIssue[]): number {
    let score = 100;
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 15;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    });

    return Math.max(score, 0);
  }

  private async analyzePageStructure(url: string): Promise<StructureAnalysisResult> {
    const page = await this.fetchPageContent(url);
    const issues: SEOIssue[] = [];
    const recommendations: SEORecommendation[] = [];

    // Check title tag
    const title = page.querySelector('title')?.textContent;
    if (!title) {
      issues.push({
        type: 'missing-title',
        severity: 'critical',
        message: 'Missing title tag',
        url
      });
    } else if (title.length > 60) {
      issues.push({
        type: 'long-title',
        severity: 'medium',
        message: `Title tag is too long (${title.length} characters)`,
        url
      });
    }

    // Check meta description
    const metaDescription = page.querySelector('meta[name="description"]')?.getAttribute('content');
    if (!metaDescription) {
      issues.push({
        type: 'missing-meta-description',
        severity: 'high',
        message: 'Missing meta description',
        url
      });
    } else if (metaDescription.length > 160) {
      issues.push({
        type: 'long-meta-description',
        severity: 'medium',
        message: `Meta description is too long (${metaDescription.length} characters)`,
        url
      });
    }

    // Check heading structure
    const headings = page.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const h1Tags = page.querySelectorAll('h1');
    
    if (h1Tags.length === 0) {
      issues.push({
        type: 'missing-h1',
        severity: 'high',
        message: 'Missing H1 tag',
        url
      });
    } else if (h1Tags.length > 1) {
      issues.push({
        type: 'multiple-h1',
        severity: 'medium',
        message: `Multiple H1 tags found (${h1Tags.length})`,
        url
      });
    }

    return { issues, recommendations };
  }
}

interface KeywordRanking {
  keyword: string;
  position: number;
  url: string;
  previousPosition?: number;
  change: number;
  searchVolume: number;
  difficulty: number;
  lastUpdated: Date;
}

interface TechnicalSEOAnalysis {
  url: string;
  issues: SEOIssue[];
  recommendations: SEORecommendation[];
  score: number; // 0-100
}

interface SEOReport {
  period: DateRange;
  summary: {
    organicTraffic: number;
    organicTrafficChange: number;
    averagePosition: number;
    positionChange: number;
    totalKeywords: number;
    keywordsChange: number;
  };
  topPerformers: {
    keywords: TopKeyword[];
    pages: TopSEOPage[];
    improvements: SEOImprovement[];
  };
  issues: {
    critical: SEOIssue[];
    warnings: SEOIssue[];
    recommendations: SEORecommendation[];
  };
  opportunities: {
    keywords: KeywordOpportunity[];
    content: ContentOpportunity[];
    technical: TechnicalOpportunity[];
  };
}
```

---

## 🎨 **Site Analytics Interface**

### **Site Analytics Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 🌐 Site Analytics                       [Real-time] [SEO] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Traffic Overview ─────────────────────────────────┐   │
│ │ 👁️ Page Views: 245.2K (+12.5%)                    │   │
│ │ 👥 Unique Visitors: 89.1K (+8.3%)                 │   │
│ │ 📊 Sessions: 156.8K (+5.1%)                       │   │
│ │ ⏱️ Avg Session: 4:32 (-2.1%)                       │   │
│ │ 📱 Bounce Rate: 45.2% (-3.2%)                     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Traffic Sources ──────────────────────────────────┐   │
│ │ 🔍 Organic Search: 45.2% (↗️ +5.2%)               │   │
│ │ 🌐 Direct: 28.7% (↗️ +2.1%)                       │   │
│ │ 📱 Social Media: 15.3% (↘️ -1.8%)                 │   │
│ │ 📧 Email: 7.2% (↗️ +3.4%)                         │   │
│ │ 💰 Paid Ads: 3.6% (↗️ +1.2%)                      │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Performance Metrics ──┐ ┌─ SEO Overview ─────────────┐ │
│ │ ⚡ Page Speed: 2.3s    │ │ 🔍 Organic Traffic: 112K   │ │
│ │ 📊 Core Web Vitals:   │ │ 📈 Avg Position: 15.2      │ │
│ │   LCP: 2.1s ✅        │ │ 🎯 CTR: 3.8%               │ │
│ │   FID: 85ms ✅        │ │ 🔑 Keywords: 1,234         │ │
│ │   CLS: 0.08 ✅        │ │ 🔗 Backlinks: 5,678        │ │
│ │ 🔄 Cache Hit: 78%     │ │ 📊 Domain Authority: 65    │ │
│ └────────────────────────┘ └─────────────────────────────┘ │
│                                                         │
│ ┌─ Top Pages ────────────────────────────────────────┐   │
│ │ Page                           Views    Time   CVR  │   │
│ │ ┌─────────────────────────────────────────────────┐ │   │
│ │ │ /getting-started              23.4K    4:15  8.2%│ │   │
│ │ │ /advanced-guide               18.7K    5:32  6.9%│ │   │
│ │ │ /troubleshooting              15.2K    3:48  4.1%│ │   │
│ │ │ /api-documentation            12.8K    6:12  3.7%│ │   │
│ │ │ /pricing                      10.9K    2:24 12.5%│ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Site analytics overview
GET    /api/analytics/site                      // Site overview
GET    /api/analytics/site/traffic              // Traffic analytics
GET    /api/analytics/site/performance          // Performance metrics
GET    /api/analytics/site/seo                  // SEO analytics

// Real-time analytics
GET    /api/analytics/site/realtime             // Real-time data
WS     /ws/analytics/realtime                   // Real-time websocket

// Traffic analysis
GET    /api/analytics/site/sources              // Traffic sources
GET    /api/analytics/site/pages                // Page analytics
GET    /api/analytics/site/referrers            // Top referrers

// Performance monitoring
GET    /api/analytics/site/core-web-vitals      // Core Web Vitals
GET    /api/analytics/site/errors               // Error analytics
GET    /api/analytics/site/uptime               // Uptime monitoring

// SEO tracking
GET    /api/analytics/site/keywords             // Keyword rankings
GET    /api/analytics/site/backlinks            // Backlink analysis
POST   /api/analytics/site/crawl                // Trigger SEO crawl

// Tracking endpoints
POST   /api/analytics/site/pageview             // Track page view
POST   /api/analytics/site/performance          // Track performance
POST   /api/analytics/site/error                // Track error
```

### **Database Schema:**
```sql
-- Page views tracking
CREATE TABLE page_views (
  id UUID PRIMARY KEY,
  url TEXT NOT NULL,
  title VARCHAR(500),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255) NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  load_time INTEGER, -- milliseconds
  scroll_depth INTEGER, -- percentage
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Performance metrics
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY,
  url TEXT NOT NULL,
  load_time INTEGER NOT NULL, -- milliseconds
  dom_content_loaded INTEGER,
  first_contentful_paint INTEGER,
  largest_contentful_paint INTEGER,
  first_input_delay INTEGER,
  cumulative_layout_shift DECIMAL(4,3),
  time_to_interactive INTEGER,
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  connection_type VARCHAR(50),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- SEO keyword rankings
CREATE TABLE keyword_rankings (
  id UUID PRIMARY KEY,
  keyword VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL,
  search_volume INTEGER,
  difficulty INTEGER,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(keyword, date)
);

-- Site errors
CREATE TABLE site_errors (
  id UUID PRIMARY KEY,
  error_type VARCHAR(100) NOT NULL, -- 404, 500, js_error, etc.
  url TEXT NOT NULL,
  error_message TEXT,
  stack_trace TEXT,
  user_agent TEXT,
  ip_address INET,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Real-time analytics
CREATE TABLE realtime_events (
  id UUID PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  url TEXT,
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

---

## 🔗 **Related Documentation**

- **[Analytics Dashboard](./dashboard.md)** - Real-time site analytics dashboard
- **[Performance Monitoring](../07_system/settings.md)** - Site performance optimization
- **[Content Analytics](./content-analytics.md)** - Content performance tracking
- **[User Analytics](./user-analytics.md)** - User behavior analysis

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active

