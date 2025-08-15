# 🌐 CDN Integration System

> **Global Content Delivery JA-CMS**  
> Multi-CDN integration dengan automatic optimization dan performance monitoring

---

## 📋 **Deskripsi**

CDN Integration System menyediakan integrasi yang seamless dengan multiple Content Delivery Networks untuk mengoptimalkan delivery media files secara global. Sistem ini mendukung automatic failover, intelligent routing, dan real-time performance monitoring.

---

## ⭐ **Core Features**

### **1. 🌍 Multi-CDN Management**

#### **CDN Configuration:**
```typescript
interface CDNProvider {
  id: string;
  name: string;
  type: 'cloudflare' | 'amazon_cloudfront' | 'google_cloud_cdn' | 'azure_cdn' | 'fastly' | 'keycdn';
  status: 'active' | 'inactive' | 'maintenance';
  priority: number; // 1 = highest priority
  regions: CDNRegion[];
  config: CDNConfig;
  performance: CDNPerformance;
  costs: CDNCostInfo;
  limits: CDNLimits;
}

interface CDNConfig {
  apiKey: string;
  apiSecret?: string;
  baseUrl: string;
  customDomain?: string;
  ssl: {
    enabled: boolean;
    certificate?: string;
    tlsVersion: string;
  };
  caching: {
    defaultTtl: number; // seconds
    maxTtl: number;
    browserTtl: number;
    rules: CachingRule[];
  };
  compression: {
    enabled: boolean;
    types: string[];
    level: number; // 1-9
  };
  security: {
    hotlinkProtection: boolean;
    allowedDomains: string[];
    accessControl: boolean;
    tokenAuth: boolean;
  };
}

interface CachingRule {
  pattern: string; // file pattern or path
  ttl: number;
  browserTtl: number;
  bypassCache: boolean;
  edgeTtl?: number;
}

interface CDNRegion {
  code: string;
  name: string;
  continent: string;
  country: string;
  latency: number; // ms
  availability: number; // percentage
}

interface CDNPerformance {
  averageLatency: number;
  hitRatio: number; // percentage
  bandwidth: number; // MB/s
  uptime: number; // percentage
  errorRate: number; // percentage
  lastUpdated: Date;
}
```

#### **CDN Management Service:**
```typescript
export class CDNService {
  private providers: Map<string, CDNProvider> = new Map();
  private router: CDNRouter;
  private monitor: CDNMonitor;
  private failover: CDNFailover;

  async registerProvider(provider: CDNProvider): Promise<void> {
    // Validate provider configuration
    const validation = await this.validateProviderConfig(provider);
    if (!validation.valid) {
      throw new Error(`Invalid CDN configuration: ${validation.errors.join(', ')}`);
    }

    // Test connection
    const connectionTest = await this.testProviderConnection(provider);
    if (!connectionTest.success) {
      throw new Error(`Failed to connect to CDN provider: ${connectionTest.error}`);
    }

    // Register provider
    this.providers.set(provider.id, provider);

    // Initialize monitoring
    await this.monitor.startMonitoring(provider);

    // Update routing rules
    await this.router.updateRoutingRules();
  }

  async deployAsset(asset: MediaAsset, options: DeploymentOptions = {}): Promise<DeploymentResult> {
    const providers = this.getActiveProviders(options.regions);
    const deploymentResults: ProviderDeploymentResult[] = [];

    // Deploy to primary provider
    const primaryProvider = providers[0];
    const primaryResult = await this.deployToProvider(asset, primaryProvider, options);
    deploymentResults.push(primaryResult);

    // Deploy to secondary providers if configured
    if (options.multiProvider && providers.length > 1) {
      const secondaryDeployments = providers.slice(1).map(provider =>
        this.deployToProvider(asset, provider, options)
      );
      
      const secondaryResults = await Promise.allSettled(secondaryDeployments);
      secondaryResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          deploymentResults.push(result.value);
        } else {
          console.error(`Failed to deploy to ${providers[index + 1].name}:`, result.reason);
        }
      });
    }

    // Generate CDN URLs
    const cdnUrls = await this.generateCDNUrls(asset, deploymentResults);

    // Update asset metadata
    await this.updateAssetCDNInfo(asset.id, {
      cdnUrls,
      deployedAt: new Date(),
      providers: deploymentResults.map(r => r.providerId)
    });

    return {
      assetId: asset.id,
      success: deploymentResults.some(r => r.success),
      primaryUrl: cdnUrls.primary,
      fallbackUrls: cdnUrls.fallback,
      deploymentResults,
      totalSize: asset.size,
      deploymentTime: Date.now() - performance.now()
    };
  }

  async getBestCDNUrl(assetId: string, userLocation?: UserLocation): Promise<string> {
    const asset = await this.getAsset(assetId);
    if (!asset || !asset.cdnInfo) {
      return asset?.url || '';
    }

    // Use intelligent routing to select best CDN
    const bestProvider = await this.router.selectBestProvider(
      asset.cdnInfo.providers,
      userLocation
    );

    if (!bestProvider) {
      return asset.url; // Fallback to original URL
    }

    return this.buildCDNUrl(asset, bestProvider);
  }

  async purgeCache(assetId: string, providers?: string[]): Promise<PurgeResult> {
    const asset = await this.getAsset(assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }

    const targetProviders = providers || asset.cdnInfo?.providers || [];
    const purgeResults: ProviderPurgeResult[] = [];

    for (const providerId of targetProviders) {
      const provider = this.providers.get(providerId);
      if (!provider) {
        continue;
      }

      try {
        const result = await this.purgeFromProvider(asset, provider);
        purgeResults.push({
          providerId,
          success: true,
          purgedAt: new Date(),
          ...result
        });
      } catch (error) {
        purgeResults.push({
          providerId,
          success: false,
          error: error.message,
          purgedAt: new Date()
        });
      }
    }

    return {
      assetId,
      results: purgeResults,
      success: purgeResults.some(r => r.success),
      totalPurged: purgeResults.filter(r => r.success).length
    };
  }

  async syncAssets(options: SyncOptions = {}): Promise<SyncResult> {
    const assets = await this.getAssetsToSync(options);
    const syncResults: AssetSyncResult[] = [];

    for (const asset of assets) {
      try {
        const result = await this.syncAsset(asset, options);
        syncResults.push(result);
      } catch (error) {
        syncResults.push({
          assetId: asset.id,
          success: false,
          error: error.message,
          syncedAt: new Date()
        });
      }
    }

    return {
      totalAssets: assets.length,
      syncedAssets: syncResults.filter(r => r.success).length,
      failedAssets: syncResults.filter(r => !r.success).length,
      results: syncResults,
      syncDuration: Date.now() - performance.now()
    };
  }

  private async deployToProvider(
    asset: MediaAsset, 
    provider: CDNProvider, 
    options: DeploymentOptions
  ): Promise<ProviderDeploymentResult> {
    const startTime = Date.now();

    try {
      // Get provider-specific client
      const client = this.getProviderClient(provider);

      // Prepare asset for deployment
      const deploymentData = await this.prepareAssetForDeployment(asset, provider, options);

      // Upload to CDN
      const uploadResult = await client.upload(deploymentData);

      // Configure caching rules
      if (options.cachingRules) {
        await client.setCachingRules(uploadResult.path, options.cachingRules);
      }

      // Set security headers
      if (provider.config.security.accessControl) {
        await client.setSecurityHeaders(uploadResult.path, {
          allowedOrigins: provider.config.security.allowedDomains,
          hotlinkProtection: provider.config.security.hotlinkProtection
        });
      }

      return {
        providerId: provider.id,
        success: true,
        url: uploadResult.url,
        path: uploadResult.path,
        size: deploymentData.size,
        deploymentTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        providerId: provider.id,
        success: false,
        error: error.message,
        deploymentTime: Date.now() - startTime
      };
    }
  }

  private getProviderClient(provider: CDNProvider): CDNClient {
    switch (provider.type) {
      case 'cloudflare':
        return new CloudflareClient(provider.config);
      case 'amazon_cloudfront':
        return new CloudFrontClient(provider.config);
      case 'google_cloud_cdn':
        return new GoogleCloudCDNClient(provider.config);
      case 'azure_cdn':
        return new AzureCDNClient(provider.config);
      case 'fastly':
        return new FastlyClient(provider.config);
      case 'keycdn':
        return new KeyCDNClient(provider.config);
      default:
        throw new Error(`Unsupported CDN provider: ${provider.type}`);
    }
  }
}

interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  cdnInfo?: {
    providers: string[];
    urls: CDNUrls;
    deployedAt: Date;
  };
}

interface DeploymentOptions {
  regions?: string[];
  multiProvider?: boolean;
  cachingRules?: CachingRule[];
  compression?: boolean;
  optimize?: boolean;
}

interface DeploymentResult {
  assetId: string;
  success: boolean;
  primaryUrl: string;
  fallbackUrls: string[];
  deploymentResults: ProviderDeploymentResult[];
  totalSize: number;
  deploymentTime: number;
}

interface ProviderDeploymentResult {
  providerId: string;
  success: boolean;
  url?: string;
  path?: string;
  size?: number;
  error?: string;
  deploymentTime: number;
}

interface CDNUrls {
  primary: string;
  fallback: string[];
  regions: Record<string, string>;
}
```

### **2. 🔄 Intelligent Routing**

#### **Smart CDN Selection:**
```typescript
export class CDNRouter {
  private geoLocationService: GeoLocationService;
  private performanceMonitor: CDNPerformanceMonitor;
  private loadBalancer: CDNLoadBalancer;

  async selectBestProvider(
    availableProviders: string[], 
    userLocation?: UserLocation
  ): Promise<CDNProvider | null> {
    const providers = availableProviders
      .map(id => this.cdnService.getProvider(id))
      .filter(Boolean);

    if (providers.length === 0) {
      return null;
    }

    if (providers.length === 1) {
      return providers[0];
    }

    // Calculate scores for each provider
    const providerScores = await Promise.all(
      providers.map(provider => this.calculateProviderScore(provider, userLocation))
    );

    // Select provider with highest score
    const bestScore = Math.max(...providerScores.map(s => s.score));
    const bestProviderIndex = providerScores.findIndex(s => s.score === bestScore);

    return providers[bestProviderIndex];
  }

  private async calculateProviderScore(
    provider: CDNProvider, 
    userLocation?: UserLocation
  ): Promise<ProviderScore> {
    let score = 0;
    const factors: ScoreFactor[] = [];

    // Geographic proximity (30% weight)
    if (userLocation) {
      const proximityScore = await this.calculateProximityScore(provider, userLocation);
      score += proximityScore * 0.3;
      factors.push({ name: 'proximity', score: proximityScore, weight: 0.3 });
    }

    // Performance metrics (25% weight)
    const performanceScore = this.calculatePerformanceScore(provider.performance);
    score += performanceScore * 0.25;
    factors.push({ name: 'performance', score: performanceScore, weight: 0.25 });

    // Availability (20% weight)
    const availabilityScore = provider.performance.uptime / 100;
    score += availabilityScore * 0.2;
    factors.push({ name: 'availability', score: availabilityScore, weight: 0.2 });

    // Load balancing (15% weight)
    const loadScore = await this.loadBalancer.getProviderLoadScore(provider.id);
    score += loadScore * 0.15;
    factors.push({ name: 'load', score: loadScore, weight: 0.15 });

    // Cost efficiency (10% weight)
    const costScore = this.calculateCostScore(provider.costs);
    score += costScore * 0.1;
    factors.push({ name: 'cost', score: costScore, weight: 0.1 });

    return {
      providerId: provider.id,
      score,
      factors
    };
  }

  private async calculateProximityScore(
    provider: CDNProvider, 
    userLocation: UserLocation
  ): Promise<number> {
    // Find closest region
    let minDistance = Infinity;
    
    for (const region of provider.regions) {
      const distance = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        region.latitude,
        region.longitude
      );
      minDistance = Math.min(minDistance, distance);
    }

    // Convert distance to score (closer = higher score)
    // Max distance considered: 20,000 km (half earth circumference)
    return Math.max(0, 1 - (minDistance / 20000));
  }

  private calculatePerformanceScore(performance: CDNPerformance): number {
    // Normalize metrics to 0-1 scale
    const latencyScore = Math.max(0, 1 - (performance.averageLatency / 1000)); // 1s max
    const hitRatioScore = performance.hitRatio / 100;
    const errorRateScore = Math.max(0, 1 - (performance.errorRate / 10)); // 10% max

    // Weighted average
    return (latencyScore * 0.4) + (hitRatioScore * 0.4) + (errorRateScore * 0.2);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

interface UserLocation {
  latitude: number;
  longitude: number;
  country?: string;
  region?: string;
  city?: string;
}

interface ProviderScore {
  providerId: string;
  score: number; // 0-1
  factors: ScoreFactor[];
}

interface ScoreFactor {
  name: string;
  score: number;
  weight: number;
}
```

### **3. 📊 Performance Monitoring**

#### **Real-time CDN Analytics:**
```typescript
export class CDNMonitoringService {
  private metricsCollector: MetricsCollector;
  private alertManager: AlertManager;
  private analytics: CDNAnalytics;

  async monitorProvider(providerId: string): Promise<void> {
    const provider = await this.cdnService.getProvider(providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }

    // Start continuous monitoring
    setInterval(async () => {
      try {
        const metrics = await this.collectProviderMetrics(provider);
        await this.processMetrics(metrics);
        
        // Check for alerts
        await this.checkAlerts(provider, metrics);
        
      } catch (error) {
        console.error(`Monitoring error for ${provider.name}:`, error);
      }
    }, 60000); // Every minute
  }

  async collectProviderMetrics(provider: CDNProvider): Promise<CDNMetrics> {
    const client = this.getProviderClient(provider);
    
    // Collect various metrics
    const [
      latencyMetrics,
      bandwidthMetrics,
      hitRatioMetrics,
      errorMetrics,
      uptimeMetrics
    ] = await Promise.all([
      client.getLatencyMetrics(),
      client.getBandwidthMetrics(),
      client.getHitRatioMetrics(),
      client.getErrorMetrics(),
      client.getUptimeMetrics()
    ]);

    return {
      providerId: provider.id,
      timestamp: new Date(),
      latency: latencyMetrics,
      bandwidth: bandwidthMetrics,
      hitRatio: hitRatioMetrics,
      errors: errorMetrics,
      uptime: uptimeMetrics,
      regions: await this.getRegionalMetrics(provider)
    };
  }

  async getCDNAnalytics(timeRange: DateRange): Promise<CDNAnalyticsReport> {
    const providers = await this.cdnService.getAllProviders();
    const analyticsData: ProviderAnalytics[] = [];

    for (const provider of providers) {
      const metrics = await this.getProviderMetrics(provider.id, timeRange);
      const analysis = await this.analyzeProviderPerformance(provider, metrics);
      analyticsData.push(analysis);
    }

    return {
      timeRange,
      providers: analyticsData,
      summary: {
        totalBandwidth: analyticsData.reduce((sum, p) => sum + p.totalBandwidth, 0),
        averageLatency: analyticsData.reduce((sum, p) => sum + p.averageLatency, 0) / analyticsData.length,
        overallHitRatio: analyticsData.reduce((sum, p) => sum + p.hitRatio, 0) / analyticsData.length,
        totalRequests: analyticsData.reduce((sum, p) => sum + p.totalRequests, 0),
        costSavings: analyticsData.reduce((sum, p) => sum + p.costSavings, 0)
      },
      trends: await this.calculateCDNTrends(analyticsData),
      recommendations: await this.generateOptimizationRecommendations(analyticsData)
    };
  }

  async optimizeCDNConfiguration(): Promise<OptimizationResult> {
    const providers = await this.cdnService.getAllProviders();
    const optimizations: CDNOptimization[] = [];

    for (const provider of providers) {
      const analysis = await this.analyzeProviderConfiguration(provider);
      const providerOptimizations = await this.generateProviderOptimizations(provider, analysis);
      optimizations.push(...providerOptimizations);
    }

    // Apply optimizations
    const results = await Promise.allSettled(
      optimizations.map(opt => this.applyOptimization(opt))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      totalOptimizations: optimizations.length,
      successful,
      failed,
      optimizations,
      estimatedImprovements: {
        latencyReduction: this.calculateLatencyImprovement(optimizations),
        bandwidthSavings: this.calculateBandwidthSavings(optimizations),
        costReduction: this.calculateCostReduction(optimizations)
      }
    };
  }

  private async checkAlerts(provider: CDNProvider, metrics: CDNMetrics): Promise<void> {
    const alerts: CDNAlert[] = [];

    // High latency alert
    if (metrics.latency.average > 1000) { // > 1 second
      alerts.push({
        type: 'high_latency',
        severity: 'warning',
        providerId: provider.id,
        message: `High latency detected: ${metrics.latency.average}ms`,
        value: metrics.latency.average,
        threshold: 1000
      });
    }

    // Low hit ratio alert
    if (metrics.hitRatio.current < 80) { // < 80%
      alerts.push({
        type: 'low_hit_ratio',
        severity: 'warning',
        providerId: provider.id,
        message: `Low cache hit ratio: ${metrics.hitRatio.current}%`,
        value: metrics.hitRatio.current,
        threshold: 80
      });
    }

    // High error rate alert
    if (metrics.errors.rate > 5) { // > 5%
      alerts.push({
        type: 'high_error_rate',
        severity: 'critical',
        providerId: provider.id,
        message: `High error rate: ${metrics.errors.rate}%`,
        value: metrics.errors.rate,
        threshold: 5
      });
    }

    // Service unavailable alert
    if (metrics.uptime.current < 99) { // < 99%
      alerts.push({
        type: 'service_unavailable',
        severity: 'critical',
        providerId: provider.id,
        message: `Service availability low: ${metrics.uptime.current}%`,
        value: metrics.uptime.current,
        threshold: 99
      });
    }

    // Process alerts
    for (const alert of alerts) {
      await this.alertManager.processAlert(alert);
    }
  }

  private async generateOptimizationRecommendations(
    analyticsData: ProviderAnalytics[]
  ): Promise<CDNRecommendation[]> {
    const recommendations: CDNRecommendation[] = [];

    // Analyze overall performance
    const avgLatency = analyticsData.reduce((sum, p) => sum + p.averageLatency, 0) / analyticsData.length;
    const avgHitRatio = analyticsData.reduce((sum, p) => sum + p.hitRatio, 0) / analyticsData.length;

    // High latency recommendation
    if (avgLatency > 500) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Optimize CDN Configuration for Lower Latency',
        description: `Average latency is ${avgLatency.toFixed(0)}ms. Consider optimizing caching rules and geographic distribution.`,
        actions: [
          'Review and optimize caching TTL settings',
          'Add more edge locations in high-traffic regions',
          'Enable compression for static assets',
          'Implement HTTP/2 and HTTP/3 support'
        ],
        estimatedImpact: 'Reduce latency by 20-40%'
      });
    }

    // Low hit ratio recommendation
    if (avgHitRatio < 85) {
      recommendations.push({
        type: 'caching',
        priority: 'medium',
        title: 'Improve Cache Hit Ratio',
        description: `Current hit ratio is ${avgHitRatio.toFixed(1)}%. Optimizing caching strategies can improve performance and reduce costs.`,
        actions: [
          'Increase cache TTL for static assets',
          'Implement cache warming strategies',
          'Review and optimize cache key normalization',
          'Enable browser caching headers'
        ],
        estimatedImpact: 'Increase hit ratio by 10-15%'
      });
    }

    // Cost optimization recommendation
    const totalCosts = analyticsData.reduce((sum, p) => sum + p.totalCosts, 0);
    if (totalCosts > 1000) { // $1000+ monthly
      recommendations.push({
        type: 'cost',
        priority: 'medium',
        title: 'Optimize CDN Costs',
        description: `Current monthly CDN costs are $${totalCosts.toFixed(2)}. Consider cost optimization strategies.`,
        actions: [
          'Review bandwidth usage patterns',
          'Implement tiered pricing strategies',
          'Optimize image and video compression',
          'Consider reserved capacity pricing'
        ],
        estimatedImpact: 'Reduce costs by 15-25%'
      });
    }

    return recommendations;
  }
}

interface CDNMetrics {
  providerId: string;
  timestamp: Date;
  latency: {
    average: number;
    p95: number;
    p99: number;
  };
  bandwidth: {
    total: number;
    peak: number;
    average: number;
  };
  hitRatio: {
    current: number;
    average: number;
  };
  errors: {
    total: number;
    rate: number; // percentage
    types: Record<string, number>;
  };
  uptime: {
    current: number; // percentage
    sla: number; // percentage
  };
  regions: RegionalMetrics[];
}

interface CDNAnalyticsReport {
  timeRange: DateRange;
  providers: ProviderAnalytics[];
  summary: {
    totalBandwidth: number;
    averageLatency: number;
    overallHitRatio: number;
    totalRequests: number;
    costSavings: number;
  };
  trends: CDNTrend[];
  recommendations: CDNRecommendation[];
}

interface CDNRecommendation {
  type: 'performance' | 'caching' | 'cost' | 'security';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actions: string[];
  estimatedImpact: string;
}

interface CDNAlert {
  type: 'high_latency' | 'low_hit_ratio' | 'high_error_rate' | 'service_unavailable';
  severity: 'info' | 'warning' | 'critical';
  providerId: string;
  message: string;
  value: number;
  threshold: number;
}
```

---

## 🎨 **CDN Management Interface**

### **CDN Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 🌐 CDN Management                      [Add Provider] [Settings] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Active Providers ─────────────────────────────────┐   │
│ │ 🟢 CloudFlare (Primary)     Latency: 45ms  ↗️ 98.9%│   │
│ │    Bandwidth: 2.3TB/month   Hit Ratio: 94.2%      │   │
│ │    Cost: $234/month         Regions: 15 active    │   │
│ │    [Configure] [Analytics] [Purge Cache]           │   │
│ │                                                   │   │
│ │ 🟡 AWS CloudFront (Secondary) Latency: 67ms ↗️ 99.1% │   │
│ │    Bandwidth: 1.8TB/month   Hit Ratio: 91.5%      │   │
│ │    Cost: $189/month         Regions: 12 active    │   │
│ │    [Configure] [Analytics] [Purge Cache]           │   │
│ │                                                   │   │
│ │ 🟢 Google Cloud CDN (Backup) Latency: 52ms ↗️ 99.5%  │   │
│ │    Bandwidth: 0.9TB/month   Hit Ratio: 89.8%      │   │
│ │    Cost: $98/month          Regions: 8 active     │   │
│ │    [Configure] [Analytics] [Purge Cache]           │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Global Performance ───────────────────────────────┐   │
│ │ 🌍 Worldwide Latency: 54ms (↓ 12% vs last month)  │   │
│ │ 📊 Cache Hit Ratio: 92.1% (↑ 3.2% vs last month)  │   │
│ │ 💰 Total Cost: $521/month (↓ 8% vs last month)    │   │
│ │ 📈 Bandwidth: 5.0TB/month (↑ 15% vs last month)   │   │
│ │ ⚡ Uptime: 99.2% (SLA: 99.9%)                      │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Regional Performance Map ─────────────────────────┐   │
│ │                🌐 Global CDN Status                │   │
│ │                                                   │   │
│ │    🇺🇸 NA: 43ms     🇪🇺 EU: 38ms     🇯🇵 APAC: 67ms │   │
│ │    (99.8% uptime)   (99.9% uptime)   (98.7% uptime)  │   │
│ │                                                   │   │
│ │    🇧🇷 SA: 89ms     🇿🇦 AF: 124ms    🇦🇺 OC: 78ms  │   │
│ │    (99.1% uptime)   (97.8% uptime)   (99.4% uptime)  │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **CDN Analytics Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ 📊 CDN Analytics: CloudFlare           [Export] [Configure] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Performance Metrics ──────────────────────────────┐   │
│ │ ⚡ Avg Latency: 45ms (Target: <100ms) ✅           │   │
│ │ 📈 Hit Ratio: 94.2% (Target: >90%) ✅             │   │
│ │ 📊 Bandwidth: 2.3TB/month (+15.2% vs last month)  │   │
│ │ 🎯 Requests: 45.6M/month (+12.8% vs last month)   │   │
│ │ ❌ Error Rate: 0.12% (Target: <0.5%) ✅           │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Latency Trends ───────────────────────────────────┐   │
│ │ Latency ┌─────────────────────────────────────────┐  │   │
│ │ (ms)    │               ╭─╮                       │  │   │
│ │   80    │             ╭─╯ ╰─╮                     │  │   │
│ │   60    │           ╭─╯     ╰─╮                   │  │   │
│ │   40    │         ╭─╯         ╰─╮                 │  │   │
│ │   20    │       ╭─╯             ╰─╮               │  │   │
│ │    0    └─────────────────────────────────────────┘  │   │
│ │         Jan 1    Jan 15    Jan 30                    │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Top Content ──────────────────────────────────────┐   │
│ │ File                    Requests    Bandwidth  Hit% │   │
│ │ hero-image.webp         2.3M        456MB     98%  │   │
│ │ logo.svg                1.8M        23MB      99%  │   │
│ │ product-video.mp4       890K        1.2GB     87%  │   │
│ │ style.css               1.2M        45MB      96%  │   │
│ │ main.js                 1.1M        67MB      94%  │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Optimization Opportunities ───────────────────────┐   │
│ │ 💡 Recommendations:                                │   │
│ │ • Increase TTL for static assets (+5% hit ratio)  │   │
│ │ • Enable Brotli compression (-15% bandwidth)      │   │
│ │ • Add more edge locations in APAC (-20ms latency) │   │
│ │ • Implement HTTP/3 support (+10% performance)     │   │
│ │                                                   │   │
│ │ Estimated Savings: $89/month • Performance: +18%  │   │
│ │ [Apply Optimizations] [Schedule Review]            │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// CDN management
GET    /api/cdn/providers                 // List CDN providers
POST   /api/cdn/providers                 // Add CDN provider
GET    /api/cdn/providers/{id}            // Get provider details
PUT    /api/cdn/providers/{id}            // Update provider
DELETE /api/cdn/providers/{id}            // Remove provider

// Asset deployment
POST   /api/cdn/deploy                    // Deploy asset to CDN
POST   /api/cdn/deploy/bulk               // Bulk deploy assets
POST   /api/cdn/sync                      // Sync assets
GET    /api/cdn/assets/{id}/url           // Get best CDN URL

// Cache management
POST   /api/cdn/purge                     // Purge cache
POST   /api/cdn/purge/bulk                // Bulk purge
POST   /api/cdn/preload                   // Preload cache
GET    /api/cdn/cache/status              // Cache status

// Monitoring & analytics
GET    /api/cdn/analytics                 // CDN analytics
GET    /api/cdn/performance               // Performance metrics
GET    /api/cdn/alerts                    // Active alerts
POST   /api/cdn/optimize                  // Optimize configuration
```

### **Database Schema:**
```sql
-- CDN providers
CREATE TABLE cdn_providers (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  priority INTEGER DEFAULT 1,
  config JSONB NOT NULL,
  regions JSONB,
  performance JSONB,
  costs JSONB,
  limits JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CDN deployments
CREATE TABLE cdn_deployments (
  id UUID PRIMARY KEY,
  asset_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES cdn_providers(id) ON DELETE CASCADE,
  cdn_url VARCHAR(1000) NOT NULL,
  cdn_path VARCHAR(500) NOT NULL,
  deployed_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active',
  metadata JSONB,
  UNIQUE(asset_id, provider_id)
);

-- CDN metrics
CREATE TABLE cdn_metrics (
  id UUID PRIMARY KEY,
  provider_id UUID REFERENCES cdn_providers(id) ON DELETE CASCADE,
  timestamp TIMESTAMP NOT NULL,
  latency JSONB,
  bandwidth JSONB,
  hit_ratio JSONB,
  errors JSONB,
  uptime JSONB,
  regions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CDN analytics
CREATE TABLE cdn_analytics (
  id UUID PRIMARY KEY,
  provider_id UUID REFERENCES cdn_providers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_requests BIGINT DEFAULT 0,
  total_bandwidth BIGINT DEFAULT 0,
  avg_latency INTEGER DEFAULT 0,
  hit_ratio DECIMAL(5,2) DEFAULT 0,
  error_rate DECIMAL(5,2) DEFAULT 0,
  uptime DECIMAL(5,2) DEFAULT 0,
  cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider_id, date)
);

-- CDN alerts
CREATE TABLE cdn_alerts (
  id UUID PRIMARY KEY,
  provider_id UUID REFERENCES cdn_providers(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  value DECIMAL(10,2),
  threshold DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_cdn_providers_status ON cdn_providers(status);
CREATE INDEX idx_cdn_providers_priority ON cdn_providers(priority);
CREATE INDEX idx_cdn_deployments_asset ON cdn_deployments(asset_id);
CREATE INDEX idx_cdn_deployments_provider ON cdn_deployments(provider_id);
CREATE INDEX idx_cdn_metrics_provider_timestamp ON cdn_metrics(provider_id, timestamp);
CREATE INDEX idx_cdn_analytics_provider_date ON cdn_analytics(provider_id, date);
CREATE INDEX idx_cdn_alerts_provider_status ON cdn_alerts(provider_id, status);
```

---

## 🔗 **Related Documentation**

- **[Media Upload](./upload.md)** - CDN deployment during upload
- **[Media Processing](./processing.md)** - CDN integration with processed files
- **[Media Analytics](./analytics.md)** - CDN performance tracking
- **[System Settings](../07_system/)** - CDN configuration management

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
