# 🎨 Media Analytics System

> **Analisis Performa Media & Assets JA-CMS**  
> Tracking usage, performance, dan optimization untuk semua media assets

---

## 📋 **Deskripsi**

Media Analytics System menyediakan insights komprehensif tentang penggunaan media assets, performance tracking, storage optimization, dan user engagement dengan konten visual. Sistem ini membantu mengoptimalkan media strategy dan mengelola storage secara efisien.

---

## ⭐ **Core Features**

### **1. 📊 Usage Analytics**

#### **Media Usage Tracking:**
```typescript
interface MediaAnalytics {
  overview: {
    totalFiles: number;
    totalSize: number;
    averageFileSize: number;
    storageUsed: number;
    storageQuota: number;
    filesUploaded: number;
    filesDeleted: number;
  };
  usage: {
    mostUsedFiles: MediaUsageData[];
    unusedFiles: UnusedMediaData[];
    recentUploads: RecentUploadData[];
    downloadStats: DownloadStats;
  };
  performance: {
    loadTimes: MediaLoadTime[];
    bandwidthUsage: BandwidthData;
    cacheHitRate: number;
    compressionSavings: number;
  };
  types: {
    images: ImageAnalytics;
    videos: VideoAnalytics;
    documents: DocumentAnalytics;
    audio: AudioAnalytics;
  };
}

interface MediaUsageData {
  id: string;
  filename: string;
  type: string;
  size: number;
  usageCount: number;
  lastUsed: Date;
  usedIn: MediaUsageLocation[];
  views: number;
  downloads: number;
  engagement: MediaEngagement;
}

interface MediaUsageLocation {
  type: 'post' | 'page' | 'widget' | 'theme' | 'email';
  id: string;
  title: string;
  url?: string;
  usage: 'featured' | 'inline' | 'gallery' | 'background' | 'attachment';
}

interface MediaEngagement {
  views: number;
  clicks: number;
  shares: number;
  downloads: number;
  averageViewTime?: number; // for videos
  interactionRate: number;
}
```

#### **Media Usage Service:**
```typescript
export class MediaAnalyticsService {
  async getMediaUsageAnalytics(timeRange: DateRange): Promise<MediaAnalytics> {
    const overview = await this.getMediaOverview(timeRange);
    const usage = await this.getUsageAnalytics(timeRange);
    const performance = await this.getPerformanceAnalytics(timeRange);
    const types = await this.getTypeAnalytics(timeRange);

    return {
      overview,
      usage,
      performance,
      types
    };
  }

  async trackMediaUsage(mediaId: string, usageData: MediaUsageEvent): Promise<void> {
    // Record media usage event
    await this.recordUsageEvent({
      mediaId,
      eventType: usageData.eventType, // view, download, click, share
      userId: usageData.userId,
      sessionId: usageData.sessionId,
      referrer: usageData.referrer,
      userAgent: usageData.userAgent,
      timestamp: new Date()
    });

    // Update media statistics
    await this.updateMediaStats(mediaId, usageData.eventType);
  }

  async findUnusedMedia(olderThanDays: number = 90): Promise<UnusedMediaData[]> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    
    const unusedFiles = await this.prisma.mediaFile.findMany({
      where: {
        AND: [
          {
            OR: [
              { lastUsed: { lt: cutoffDate } },
              { lastUsed: null }
            ]
          },
          {
            usageCount: { lte: 0 }
          }
        ]
      },
      include: {
        usageLocations: true
      }
    });

    return unusedFiles.map(file => ({
      id: file.id,
      filename: file.filename,
      size: file.size,
      uploadedAt: file.createdAt,
      lastUsed: file.lastUsed,
      potentialSavings: file.size,
      riskLevel: this.calculateDeletionRisk(file)
    }));
  }

  async getMediaPerformanceInsights(mediaId: string): Promise<MediaInsights> {
    const usage = await this.getMediaUsage(mediaId);
    const performance = await this.getMediaPerformance(mediaId);
    const engagement = await this.getMediaEngagement(mediaId);

    return {
      usage,
      performance,
      engagement,
      recommendations: await this.generateMediaRecommendations(mediaId),
      optimization: await this.getOptimizationSuggestions(mediaId)
    };
  }

  private calculateDeletionRisk(file: MediaFile): 'low' | 'medium' | 'high' {
    if (file.usageCount > 0) return 'high';
    if (file.lastUsed && file.lastUsed > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) return 'medium';
    return 'low';
  }
}

interface UnusedMediaData {
  id: string;
  filename: string;
  size: number;
  uploadedAt: Date;
  lastUsed?: Date;
  potentialSavings: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface MediaInsights {
  usage: MediaUsageData;
  performance: MediaPerformanceData;
  engagement: MediaEngagement;
  recommendations: string[];
  optimization: OptimizationSuggestion[];
}
```

### **2. 🖼️ Image Analytics**

#### **Image Performance Tracking:**
```typescript
interface ImageAnalytics {
  overview: {
    totalImages: number;
    totalSize: number;
    averageSize: number;
    compressionRatio: number;
    formatDistribution: FormatDistribution;
  };
  performance: {
    averageLoadTime: number;
    compressionSavings: number;
    webPAdoption: number;
    responsiveUsage: number;
    lazyLoadingEffectiveness: number;
  };
  usage: {
    mostViewedImages: ImageUsageData[];
    featuredImages: FeaturedImageData[];
    galleryPerformance: GalleryPerformanceData[];
  };
  optimization: {
    oversizedImages: OversizedImageData[];
    unoptimizedImages: UnoptimizedImageData[];
    conversionOpportunities: ConversionOpportunity[];
  };
}

export class ImageAnalyticsService {
  async analyzeImagePerformance(imageId: string): Promise<ImagePerformanceAnalysis> {
    const image = await this.getImageDetails(imageId);
    const usage = await this.getImageUsage(imageId);
    const performance = await this.getImagePerformanceMetrics(imageId);

    return {
      image,
      usage,
      performance: {
        loadTime: performance.averageLoadTime,
        cacheHitRate: performance.cacheHitRate,
        compressionRatio: this.calculateCompressionRatio(image),
        responsiveEffectiveness: await this.analyzeResponsiveUsage(imageId)
      },
      optimization: {
        currentSize: image.size,
        optimizedSize: await this.calculateOptimizedSize(image),
        potentialSavings: await this.calculatePotentialSavings(image),
        recommendations: await this.generateImageOptimizationRecommendations(image)
      }
    };
  }

  async getImageEngagementMetrics(imageId: string): Promise<ImageEngagement> {
    const views = await this.getImageViews(imageId);
    const clicks = await this.getImageClicks(imageId);
    const shares = await this.getImageShares(imageId);
    const downloads = await this.getImageDownloads(imageId);

    return {
      views,
      clicks,
      shares,
      downloads,
      clickThroughRate: (clicks / views) * 100,
      engagementRate: ((clicks + shares + downloads) / views) * 100,
      popularityScore: this.calculateImagePopularityScore(views, clicks, shares)
    };
  }

  async identifyOptimizationOpportunities(): Promise<OptimizationOpportunity[]> {
    const oversizedImages = await this.findOversizedImages();
    const unoptimizedFormats = await this.findUnoptimizedFormats();
    const unusedSizes = await this.findUnusedImageSizes();

    return [
      ...oversizedImages.map(img => ({
        type: 'resize' as const,
        mediaId: img.id,
        currentSize: img.size,
        recommendedSize: img.recommendedSize,
        potentialSavings: img.size - img.recommendedSize,
        impact: 'high' as const
      })),
      ...unoptimizedFormats.map(img => ({
        type: 'format' as const,
        mediaId: img.id,
        currentFormat: img.format,
        recommendedFormat: img.recommendedFormat,
        potentialSavings: img.potentialSavings,
        impact: 'medium' as const
      })),
      ...unusedSizes.map(img => ({
        type: 'cleanup' as const,
        mediaId: img.id,
        unusedSizes: img.unusedSizes,
        potentialSavings: img.potentialSavings,
        impact: 'low' as const
      }))
    ];
  }

  private async findOversizedImages(): Promise<OversizedImageData[]> {
    // Find images that are significantly larger than their display size
    const images = await this.getAllImagesWithUsage();
    
    return images.filter(img => {
      const maxDisplaySize = Math.max(...img.displaySizes);
      return img.originalWidth > maxDisplaySize * 2; // More than 2x display size
    }).map(img => ({
      id: img.id,
      filename: img.filename,
      size: img.size,
      originalWidth: img.originalWidth,
      originalHeight: img.originalHeight,
      maxDisplayWidth: Math.max(...img.displaySizes),
      recommendedSize: this.calculateRecommendedSize(img),
      potentialSavings: img.size - this.calculateRecommendedSize(img)
    }));
  }
}

interface ImagePerformanceAnalysis {
  image: ImageDetails;
  usage: ImageUsageData;
  performance: {
    loadTime: number;
    cacheHitRate: number;
    compressionRatio: number;
    responsiveEffectiveness: number;
  };
  optimization: {
    currentSize: number;
    optimizedSize: number;
    potentialSavings: number;
    recommendations: string[];
  };
}

interface OptimizationOpportunity {
  type: 'resize' | 'format' | 'cleanup';
  mediaId: string;
  currentSize?: number;
  recommendedSize?: number;
  currentFormat?: string;
  recommendedFormat?: string;
  unusedSizes?: string[];
  potentialSavings: number;
  impact: 'low' | 'medium' | 'high';
}
```

### **3. 🎬 Video Analytics**

#### **Video Performance Tracking:**
```typescript
interface VideoAnalytics {
  overview: {
    totalVideos: number;
    totalDuration: number; // in seconds
    totalSize: number;
    averageSize: number;
    totalViews: number;
    totalWatchTime: number;
  };
  engagement: {
    averageViewDuration: number;
    completionRate: number;
    dropOffPoints: DropOffPoint[];
    engagementHeatmap: EngagementHeatmap[];
    mostWatchedVideos: VideoEngagementData[];
  };
  performance: {
    averageLoadTime: number;
    bufferingRate: number;
    qualityDistribution: QualityDistribution;
    devicePerformance: DevicePerformance[];
  };
  optimization: {
    encodingEfficiency: EncodingEfficiency[];
    storageOptimization: StorageOptimization;
    deliveryOptimization: DeliveryOptimization;
  };
}

export class VideoAnalyticsService {
  async trackVideoEngagement(videoId: string, engagementData: VideoEngagementEvent): Promise<void> {
    // Record video engagement event
    await this.recordEngagementEvent({
      videoId,
      userId: engagementData.userId,
      sessionId: engagementData.sessionId,
      eventType: engagementData.eventType, // play, pause, seek, complete, quality_change
      timestamp: engagementData.timestamp,
      currentTime: engagementData.currentTime,
      duration: engagementData.duration,
      quality: engagementData.quality,
      buffering: engagementData.buffering
    });

    // Update real-time metrics
    await this.updateVideoMetrics(videoId, engagementData);
  }

  async getVideoEngagementAnalysis(videoId: string): Promise<VideoEngagementAnalysis> {
    const engagementEvents = await this.getVideoEngagementEvents(videoId);
    const viewSessions = await this.getVideoViewSessions(videoId);

    return {
      overview: {
        totalViews: viewSessions.length,
        uniqueViewers: new Set(viewSessions.map(s => s.userId)).size,
        totalWatchTime: viewSessions.reduce((sum, s) => sum + s.watchTime, 0),
        averageWatchTime: viewSessions.reduce((sum, s) => sum + s.watchTime, 0) / viewSessions.length,
        completionRate: viewSessions.filter(s => s.completed).length / viewSessions.length * 100
      },
      engagement: {
        dropOffPoints: this.calculateDropOffPoints(engagementEvents),
        engagementHeatmap: this.generateEngagementHeatmap(engagementEvents),
        seekPatterns: this.analyzeSeekPatterns(engagementEvents),
        qualityPreferences: this.analyzeQualityPreferences(engagementEvents)
      },
      audience: {
        retentionCurve: this.calculateRetentionCurve(viewSessions),
        deviceBreakdown: this.analyzeDeviceUsage(viewSessions),
        geographicDistribution: this.analyzeGeographicDistribution(viewSessions)
      }
    };
  }

  async optimizeVideoDelivery(videoId: string): Promise<DeliveryOptimizationPlan> {
    const video = await this.getVideoDetails(videoId);
    const analytics = await this.getVideoEngagementAnalysis(videoId);
    const performance = await this.getVideoPerformanceMetrics(videoId);

    return {
      currentDelivery: {
        formats: video.formats,
        qualities: video.qualities,
        avgLoadTime: performance.averageLoadTime,
        bufferingRate: performance.bufferingRate
      },
      recommendations: [
        ...await this.getEncodingRecommendations(video, analytics),
        ...await this.getCDNRecommendations(video, analytics),
        ...await this.getAdaptiveStreamingRecommendations(video, analytics)
      ],
      expectedImprovements: {
        loadTimeReduction: this.calculateExpectedLoadTimeReduction(performance),
        bufferingReduction: this.calculateExpectedBufferingReduction(performance),
        storageSavings: this.calculateExpectedStorageSavings(video)
      }
    };
  }

  private calculateDropOffPoints(events: VideoEngagementEvent[]): DropOffPoint[] {
    const sessions = this.groupEventsBySessions(events);
    const dropOffs: Map<number, number> = new Map();

    sessions.forEach(session => {
      const lastEvent = session[session.length - 1];
      if (lastEvent.eventType === 'pause' || lastEvent.eventType === 'stop') {
        const timePoint = Math.floor(lastEvent.currentTime / 10) * 10; // Group by 10-second intervals
        dropOffs.set(timePoint, (dropOffs.get(timePoint) || 0) + 1);
      }
    });

    return Array.from(dropOffs.entries())
      .map(([time, count]) => ({ time, count, percentage: (count / sessions.length) * 100 }))
      .sort((a, b) => b.count - a.count);
  }

  private generateEngagementHeatmap(events: VideoEngagementEvent[]): EngagementHeatmap[] {
    const duration = Math.max(...events.map(e => e.duration));
    const intervals = Math.ceil(duration / 10); // 10-second intervals
    const heatmap: EngagementHeatmap[] = [];

    for (let i = 0; i < intervals; i++) {
      const startTime = i * 10;
      const endTime = (i + 1) * 10;
      
      const relevantEvents = events.filter(e => 
        e.currentTime >= startTime && e.currentTime < endTime
      );

      const plays = relevantEvents.filter(e => e.eventType === 'play').length;
      const pauses = relevantEvents.filter(e => e.eventType === 'pause').length;
      const seeks = relevantEvents.filter(e => e.eventType === 'seek').length;

      heatmap.push({
        startTime,
        endTime,
        engagement: plays - pauses + seeks,
        intensity: this.calculateIntensity(plays, pauses, seeks)
      });
    }

    return heatmap;
  }
}

interface VideoEngagementAnalysis {
  overview: {
    totalViews: number;
    uniqueViewers: number;
    totalWatchTime: number;
    averageWatchTime: number;
    completionRate: number;
  };
  engagement: {
    dropOffPoints: DropOffPoint[];
    engagementHeatmap: EngagementHeatmap[];
    seekPatterns: SeekPattern[];
    qualityPreferences: QualityPreference[];
  };
  audience: {
    retentionCurve: RetentionPoint[];
    deviceBreakdown: DeviceBreakdown[];
    geographicDistribution: GeographicDistribution[];
  };
}

interface DropOffPoint {
  time: number; // seconds
  count: number;
  percentage: number;
}

interface EngagementHeatmap {
  startTime: number;
  endTime: number;
  engagement: number;
  intensity: 'low' | 'medium' | 'high';
}
```

### **4. 📄 Document Analytics**

#### **Document Usage Tracking:**
```typescript
interface DocumentAnalytics {
  overview: {
    totalDocuments: number;
    totalSize: number;
    totalDownloads: number;
    averageFileSize: number;
    formatDistribution: DocumentFormatDistribution;
  };
  usage: {
    mostDownloadedDocs: DocumentUsageData[];
    recentUploads: RecentDocumentData[];
    accessPatterns: DocumentAccessPattern[];
  };
  performance: {
    averageDownloadTime: number;
    conversionRates: DocumentConversionRate[];
    searchability: DocumentSearchability;
  };
}

export class DocumentAnalyticsService {
  async trackDocumentAccess(documentId: string, accessData: DocumentAccessEvent): Promise<void> {
    // Record document access
    await this.recordDocumentAccess({
      documentId,
      userId: accessData.userId,
      accessType: accessData.accessType, // view, download, preview
      referrer: accessData.referrer,
      userAgent: accessData.userAgent,
      timestamp: new Date()
    });

    // Update document metrics
    await this.updateDocumentMetrics(documentId, accessData.accessType);
  }

  async getDocumentInsights(documentId: string): Promise<DocumentInsights> {
    const document = await this.getDocumentDetails(documentId);
    const usage = await this.getDocumentUsage(documentId);
    const performance = await this.getDocumentPerformance(documentId);

    return {
      document,
      usage: {
        totalAccesses: usage.totalAccesses,
        downloads: usage.downloads,
        previews: usage.previews,
        shares: usage.shares,
        popularityTrend: usage.popularityTrend
      },
      performance: {
        averageDownloadTime: performance.averageDownloadTime,
        downloadSuccessRate: performance.downloadSuccessRate,
        previewLoadTime: performance.previewLoadTime
      },
      audience: {
        userTypes: usage.userTypes,
        accessSources: usage.accessSources,
        deviceBreakdown: usage.deviceBreakdown
      },
      optimization: await this.getDocumentOptimizationSuggestions(documentId)
    };
  }

  async analyzeDocumentSearchability(): Promise<DocumentSearchability> {
    const documents = await this.getAllDocuments();
    const searchableCount = documents.filter(doc => doc.searchable).length;
    const indexedCount = documents.filter(doc => doc.indexed).length;

    return {
      totalDocuments: documents.length,
      searchableDocuments: searchableCount,
      indexedDocuments: indexedCount,
      searchabilityRate: (searchableCount / documents.length) * 100,
      indexingRate: (indexedCount / documents.length) * 100,
      missingMetadata: documents.filter(doc => !doc.title || !doc.description).length,
      recommendations: this.generateSearchabilityRecommendations(documents)
    };
  }
}

interface DocumentInsights {
  document: DocumentDetails;
  usage: {
    totalAccesses: number;
    downloads: number;
    previews: number;
    shares: number;
    popularityTrend: TrendData;
  };
  performance: {
    averageDownloadTime: number;
    downloadSuccessRate: number;
    previewLoadTime: number;
  };
  audience: {
    userTypes: UserTypeBreakdown[];
    accessSources: AccessSourceBreakdown[];
    deviceBreakdown: DeviceBreakdown[];
  };
  optimization: OptimizationSuggestion[];
}
```

---

## 🎨 **Media Analytics Interface**

### **Media Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 🎨 Media Analytics                      [Optimize] [Export] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Storage Overview ─────────────────────────────────┐   │
│ │ 📁 Total Files: 1,234   💾 Storage: 2.4GB/10GB    │   │
│ │ 🖼️ Images: 856 (1.8GB)  🎬 Videos: 45 (580MB)     │   │
│ │ 📄 Docs: 289 (120MB)    🎵 Audio: 44 (85MB)       │   │
│ │ ⚠️ Unused: 156 files (340MB potential savings)     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Most Used Media ──────────────────────────────────┐   │
│ │ File                     Type    Usage   Size       │   │
│ │ ┌─────────────────────────────────────────────────┐ │   │
│ │ │ hero-banner.jpg         IMG     234×    1.2MB   │ │   │
│ │ │ product-demo.mp4        VID     89×     45MB    │ │   │
│ │ │ user-guide.pdf          DOC     156×    2.3MB   │ │   │
│ │ │ logo-variations.svg     IMG     445×    24KB    │ │   │
│ │ │ testimonial-audio.mp3   AUD     23×     8.5MB   │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Performance Metrics ──┐ ┌─ Optimization Opportunities┐ │
│ │ ⚡ Avg Load: 2.3s      │ │ 🔧 Resize 23 oversized imgs│ │
│ │ 📊 Cache Hit: 78%      │ │ 🗜️ Compress 45 large files │ │
│ │ 🎯 WebP Usage: 45%     │ │ 🗑️ Remove 156 unused files │ │
│ │ 📱 Mobile Opt: 67%     │ │ 📐 Convert 12 to WebP     │ │
│ └────────────────────────┘ └───────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Media analytics overview
GET    /api/analytics/media                     // Media overview
GET    /api/analytics/media/usage               // Usage statistics
GET    /api/analytics/media/performance         // Performance metrics
GET    /api/analytics/media/optimization        // Optimization opportunities

// Specific media analytics
GET    /api/analytics/media/{id}                // Specific media analytics
GET    /api/analytics/media/{id}/usage          // Media usage details
GET    /api/analytics/media/{id}/engagement     // Media engagement

// Media type specific
GET    /api/analytics/media/images              // Image analytics
GET    /api/analytics/media/videos              // Video analytics
GET    /api/analytics/media/documents           // Document analytics

// Tracking endpoints
POST   /api/analytics/media/track               // Track media event
POST   /api/analytics/media/engagement          // Track engagement
```

### **Database Schema:**
```sql
-- Media usage tracking
CREATE TABLE media_usage_events (
  id UUID PRIMARY KEY,
  media_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- view, download, click, share
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  referrer TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Video engagement tracking
CREATE TABLE video_engagement_events (
  id UUID PRIMARY KEY,
  video_id UUID NOT NULL,
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  event_type VARCHAR(50) NOT NULL, -- play, pause, seek, complete
  current_time INTEGER NOT NULL, -- seconds
  duration INTEGER NOT NULL, -- seconds
  quality VARCHAR(20),
  buffering BOOLEAN DEFAULT false,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Media performance metrics
CREATE TABLE media_performance_metrics (
  id UUID PRIMARY KEY,
  media_id UUID NOT NULL,
  date DATE NOT NULL,
  load_time_avg INTEGER, -- milliseconds
  cache_hit_rate DECIMAL(5,2),
  bandwidth_usage BIGINT, -- bytes
  error_rate DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(media_id, date)
);
```

---

## 🔗 **Related Documentation**

- **[Media Library](../03_media/library.md)** - Media management system
- **[Analytics Dashboard](./dashboard.md)** - Real-time analytics dashboard
- **[Content Analytics](./content-analytics.md)** - Content performance analytics
- **[System Performance](../07_system/settings.md)** - System optimization settings

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
