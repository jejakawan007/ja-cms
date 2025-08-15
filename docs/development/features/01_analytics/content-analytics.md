# 📊 Content Analytics System

> **Analisis Performa Konten JA-CMS**  
> Tracking dan analysis untuk semua aspek content performance dan engagement

---

## 📋 **Deskripsi**

Content Analytics System menyediakan insights mendalam tentang performa konten, engagement metrics, social shares, dan SEO performance. Sistem ini membantu content creators dan administrators untuk mengoptimalkan strategi konten berdasarkan data yang akurat.

---

## ⭐ **Core Features**

### **1. 📄 Content Performance Metrics**

#### **Post Analytics:**
```typescript
interface ContentAnalytics {
  posts: PostAnalytics[];
  pages: PageAnalytics[];
  categories: CategoryAnalytics[];
  tags: TagAnalytics[];
  search: SearchAnalytics;
  engagement: EngagementMetrics;
}

interface PostAnalytics {
  id: string;
  title: string;
  slug: string;
  author: {
    id: string;
    name: string;
  };
  publishedAt: Date;
  metrics: {
    pageViews: number;
    uniqueViews: number;
    averageTimeOnPage: number;
    bounceRate: number;
    exitRate: number;
    readingProgress: {
      started: number;
      quarter: number;
      half: number;
      threeQuarter: number;
      completed: number;
    };
  };
  engagement: {
    likes: number;
    shares: SocialShareData;
    comments: number;
    commentEngagementRate: number;
    socialMentions: number;
  };
  seo: {
    organicTraffic: number;
    keywordRankings: KeywordRanking[];
    backlinks: number;
    featuredSnippets: number;
  };
  conversion: {
    goalCompletions: number;
    conversionRate: number;
    revenue?: number;
  };
}

interface SocialShareData {
  facebook: number;
  twitter: number;
  linkedin: number;
  pinterest: number;
  whatsapp: number;
  email: number;
  total: number;
}

interface KeywordRanking {
  keyword: string;
  position: number;
  searchVolume: number;
  difficulty: number;
  url: string;
  lastUpdated: Date;
}
```

#### **Content Performance Tracking:**
```typescript
export class ContentAnalyticsService {
  async getContentPerformance(
    contentId: string, 
    timeRange: DateRange
  ): Promise<ContentPerformance> {
    const baseMetrics = await this.getBaseMetrics(contentId, timeRange);
    const engagementMetrics = await this.getEngagementMetrics(contentId, timeRange);
    const seoMetrics = await this.getSEOMetrics(contentId, timeRange);
    const socialMetrics = await this.getSocialMetrics(contentId, timeRange);

    return {
      id: contentId,
      timeRange,
      metrics: baseMetrics,
      engagement: engagementMetrics,
      seo: seoMetrics,
      social: socialMetrics,
      trends: await this.calculateTrends(contentId, timeRange),
      recommendations: await this.generateRecommendations(contentId, baseMetrics)
    };
  }

  async getTopPerformingContent(
    criteria: PerformanceCriteria,
    limit: number = 10
  ): Promise<ContentRanking[]> {
    const query = this.buildPerformanceQuery(criteria);
    const results = await this.executeQuery(query, limit);
    
    return results.map(result => ({
      content: result.content,
      score: this.calculatePerformanceScore(result.metrics),
      metrics: result.metrics,
      rank: result.rank,
      change: result.change // vs previous period
    }));
  }

  private calculatePerformanceScore(metrics: ContentMetrics): number {
    // Weighted scoring algorithm
    const weights = {
      pageViews: 0.25,
      timeOnPage: 0.20,
      engagementRate: 0.20,
      socialShares: 0.15,
      organicTraffic: 0.15,
      conversionRate: 0.05
    };

    let score = 0;
    score += this.normalizeMetric(metrics.pageViews, 'pageViews') * weights.pageViews;
    score += this.normalizeMetric(metrics.averageTimeOnPage, 'timeOnPage') * weights.timeOnPage;
    score += this.normalizeMetric(metrics.engagementRate, 'engagement') * weights.engagementRate;
    score += this.normalizeMetric(metrics.socialShares, 'social') * weights.socialShares;
    score += this.normalizeMetric(metrics.organicTraffic, 'organic') * weights.organicTraffic;
    score += this.normalizeMetric(metrics.conversionRate, 'conversion') * weights.conversionRate;

    return Math.round(score * 100);
  }

  async generateContentInsights(contentId: string): Promise<ContentInsights> {
    const analytics = await this.getContentPerformance(contentId, {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date()
    });

    const insights: ContentInsights = {
      performance: this.analyzePerformance(analytics),
      audience: await this.analyzeAudience(contentId),
      optimization: await this.generateOptimizationTips(analytics),
      competitive: await this.getCompetitiveAnalysis(contentId)
    };

    return insights;
  }
}

interface ContentPerformance {
  id: string;
  timeRange: DateRange;
  metrics: ContentMetrics;
  engagement: EngagementMetrics;
  seo: SEOMetrics;
  social: SocialMetrics;
  trends: TrendData;
  recommendations: string[];
}

interface ContentInsights {
  performance: {
    status: 'excellent' | 'good' | 'average' | 'poor';
    score: number;
    summary: string;
    keyMetrics: KeyMetric[];
  };
  audience: {
    demographics: AudienceDemographics;
    behavior: AudienceBehavior;
    preferences: AudiencePreferences;
  };
  optimization: {
    seo: SEORecommendation[];
    content: ContentRecommendation[];
    engagement: EngagementRecommendation[];
  };
  competitive: {
    position: number;
    competitors: CompetitorContent[];
    opportunities: string[];
  };
}
```

### **2. 🏷️ Category & Tag Analytics**

#### **Category Performance:**
```typescript
interface CategoryAnalytics {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  metrics: {
    totalViews: number;
    averageViewsPerPost: number;
    engagementRate: number;
    averageTimeOnPage: number;
    bounceRate: number;
  };
  trends: {
    viewsTrend: TrendData;
    postsTrend: TrendData;
    engagementTrend: TrendData;
  };
  topPosts: PostSummary[];
  audience: {
    demographics: AudienceDemographics;
    interests: string[];
    behavior: AudienceBehavior;
  };
}

export class CategoryAnalyticsService {
  async getCategoryPerformance(categoryId: string): Promise<CategoryAnalytics> {
    const category = await this.getCategory(categoryId);
    const posts = await this.getCategoryPosts(categoryId);
    
    const metrics = await this.calculateCategoryMetrics(posts);
    const trends = await this.calculateCategoryTrends(categoryId);
    const topPosts = await this.getTopPostsInCategory(categoryId, 5);
    const audience = await this.analyzeCategoryAudience(categoryId);

    return {
      id: categoryId,
      name: category.name,
      slug: category.slug,
      postCount: posts.length,
      metrics,
      trends,
      topPosts,
      audience
    };
  }

  async getCategoryComparison(categoryIds: string[]): Promise<CategoryComparison> {
    const categories = await Promise.all(
      categoryIds.map(id => this.getCategoryPerformance(id))
    );

    return {
      categories,
      comparison: {
        bestPerforming: this.findBestPerforming(categories),
        growthLeader: this.findGrowthLeader(categories),
        engagementLeader: this.findEngagementLeader(categories),
        opportunities: this.identifyOpportunities(categories)
      }
    };
  }

  private calculateCategoryMetrics(posts: Post[]): CategoryMetrics {
    const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
    const totalEngagement = posts.reduce((sum, post) => sum + post.engagement, 0);
    const totalTime = posts.reduce((sum, post) => sum + post.timeOnPage, 0);

    return {
      totalViews,
      averageViewsPerPost: totalViews / posts.length,
      engagementRate: (totalEngagement / totalViews) * 100,
      averageTimeOnPage: totalTime / posts.length,
      bounceRate: this.calculateBounceRate(posts)
    };
  }
}
```

#### **Tag Analytics:**
```typescript
interface TagAnalytics {
  id: string;
  name: string;
  slug: string;
  usageCount: number;
  metrics: {
    totalViews: number;
    averageViewsPerPost: number;
    engagementRate: number;
    socialShares: number;
  };
  trends: {
    usage: TrendData;
    performance: TrendData;
  };
  relatedTags: RelatedTag[];
  topPosts: PostSummary[];
}

export class TagAnalyticsService {
  async getTagTrends(timeRange: DateRange): Promise<TagTrends> {
    const trendingTags = await this.getTrendingTags(timeRange, 20);
    const emergingTags = await this.getEmergingTags(timeRange, 10);
    const decliningTags = await this.getDecliningTags(timeRange, 10);

    return {
      trending: trendingTags,
      emerging: emergingTags,
      declining: decliningTags,
      recommendations: await this.generateTagRecommendations(trendingTags)
    };
  }

  async getTagCloud(options: TagCloudOptions): Promise<TagCloudData> {
    const tags = await this.getTagsWithMetrics(options.timeRange);
    
    return {
      tags: tags.map(tag => ({
        name: tag.name,
        weight: this.calculateTagWeight(tag, options.weightBy),
        color: this.getTagColor(tag.performance),
        url: `/tags/${tag.slug}`
      })),
      maxWeight: Math.max(...tags.map(t => t.usageCount)),
      minWeight: Math.min(...tags.map(t => t.usageCount))
    };
  }

  async getRelatedTags(tagId: string): Promise<RelatedTag[]> {
    // Find tags that frequently appear together
    const coOccurrences = await this.getTagCoOccurrences(tagId);
    
    return coOccurrences.map(co => ({
      tag: co.tag,
      correlation: co.correlation,
      frequency: co.frequency,
      strength: this.calculateRelationStrength(co)
    }));
  }
}

interface TagTrends {
  trending: TrendingTag[];
  emerging: EmergingTag[];
  declining: DecliningTag[];
  recommendations: TagRecommendation[];
}

interface TrendingTag {
  tag: Tag;
  growth: number; // percentage
  momentum: number; // trend strength
  posts: number;
  engagement: number;
}
```

### **3. 🔍 Search Analytics**

#### **Search Performance Tracking:**
```typescript
interface SearchAnalytics {
  overview: {
    totalSearches: number;
    uniqueSearchers: number;
    averageResultsPerSearch: number;
    clickThroughRate: number;
    noResultsRate: number;
  };
  queries: {
    topQueries: SearchQuery[];
    trendingQueries: SearchQuery[];
    noResultQueries: SearchQuery[];
    longTailQueries: SearchQuery[];
  };
  results: {
    topClickedResults: SearchResult[];
    popularContent: ContentSearchData[];
    abandonedSearches: AbandonedSearch[];
  };
  behavior: {
    searchPatterns: SearchPattern[];
    refinementPatterns: RefinementPattern[];
    exitPoints: ExitPoint[];
  };
}

export class SearchAnalyticsService {
  async getSearchAnalytics(timeRange: DateRange): Promise<SearchAnalytics> {
    const overview = await this.getSearchOverview(timeRange);
    const queries = await this.getQueryAnalytics(timeRange);
    const results = await this.getResultAnalytics(timeRange);
    const behavior = await this.getBehaviorAnalytics(timeRange);

    return {
      overview,
      queries,
      results,
      behavior
    };
  }

  async trackSearch(searchData: SearchEvent): Promise<void> {
    // Record search event
    await this.recordSearchEvent({
      query: searchData.query,
      userId: searchData.userId,
      sessionId: searchData.sessionId,
      timestamp: new Date(),
      resultsCount: searchData.resultsCount,
      filters: searchData.filters,
      sortBy: searchData.sortBy
    });

    // Update search statistics
    await this.updateSearchStats(searchData.query);
  }

  async trackSearchClick(clickData: SearchClickEvent): Promise<void> {
    // Record click on search result
    await this.recordSearchClick({
      searchId: clickData.searchId,
      resultId: clickData.resultId,
      position: clickData.position,
      timestamp: new Date()
    });

    // Update click-through rates
    await this.updateClickThroughRates(clickData);
  }

  async generateSearchInsights(): Promise<SearchInsights> {
    const popularQueries = await this.getPopularQueries();
    const contentGaps = await this.identifyContentGaps();
    const optimizationOpportunities = await this.findOptimizationOpportunities();

    return {
      popularQueries,
      contentGaps,
      optimizationOpportunities,
      recommendations: await this.generateSearchRecommendations()
    };
  }

  private async identifyContentGaps(): Promise<ContentGap[]> {
    // Find high-volume searches with low-quality results
    const noResultQueries = await this.getNoResultQueries();
    const lowClickQueries = await this.getLowClickThroughQueries();

    return [...noResultQueries, ...lowClickQueries]
      .map(query => ({
        query: query.term,
        searchVolume: query.count,
        opportunity: this.calculateOpportunityScore(query),
        suggestedContent: this.suggestContentType(query.term)
      }))
      .sort((a, b) => b.opportunity - a.opportunity);
  }
}

interface SearchQuery {
  term: string;
  count: number;
  clickThroughRate: number;
  averagePosition: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

interface SearchInsights {
  popularQueries: SearchQuery[];
  contentGaps: ContentGap[];
  optimizationOpportunities: OptimizationOpportunity[];
  recommendations: SearchRecommendation[];
}

interface ContentGap {
  query: string;
  searchVolume: number;
  opportunity: number; // 0-100 score
  suggestedContent: string;
}
```

### **4. 💬 Comment Analytics**

#### **Comment Engagement Tracking:**
```typescript
interface CommentAnalytics {
  overview: {
    totalComments: number;
    approvedComments: number;
    pendingComments: number;
    spamComments: number;
    averageCommentsPerPost: number;
    commentEngagementRate: number;
  };
  engagement: {
    topCommenters: TopCommenter[];
    mostDiscussedPosts: PostCommentData[];
    commentThreads: ThreadAnalytics[];
    sentimentAnalysis: SentimentData;
  };
  moderation: {
    moderationWorkload: ModerationStats;
    spamDetectionAccuracy: number;
    averageApprovalTime: number;
    moderatorActivity: ModeratorActivity[];
  };
  trends: {
    commentVolume: TrendData;
    engagementTrend: TrendData;
    sentimentTrend: TrendData;
  };
}

export class CommentAnalyticsService {
  async getCommentAnalytics(timeRange: DateRange): Promise<CommentAnalytics> {
    const overview = await this.getCommentOverview(timeRange);
    const engagement = await this.getEngagementAnalytics(timeRange);
    const moderation = await this.getModerationAnalytics(timeRange);
    const trends = await this.getCommentTrends(timeRange);

    return {
      overview,
      engagement,
      moderation,
      trends
    };
  }

  async analyzeSentiment(comments: Comment[]): Promise<SentimentData> {
    const sentimentResults = await Promise.all(
      comments.map(comment => this.analyzeSingleCommentSentiment(comment.content))
    );

    const positive = sentimentResults.filter(s => s.sentiment === 'positive').length;
    const negative = sentimentResults.filter(s => s.sentiment === 'negative').length;
    const neutral = sentimentResults.filter(s => s.sentiment === 'neutral').length;

    return {
      positive: (positive / comments.length) * 100,
      negative: (negative / comments.length) * 100,
      neutral: (neutral / comments.length) * 100,
      overallSentiment: this.calculateOverallSentiment(sentimentResults),
      keyTopics: await this.extractKeyTopics(comments),
      emotionalTone: await this.analyzeEmotionalTone(comments)
    };
  }

  async getCommentEngagementMetrics(postId: string): Promise<CommentEngagement> {
    const comments = await this.getPostComments(postId);
    const replies = await this.getCommentReplies(comments.map(c => c.id));

    return {
      totalComments: comments.length,
      totalReplies: replies.length,
      averageCommentsPerUser: this.calculateAverageCommentsPerUser(comments),
      commentDepth: this.calculateAverageDepth(comments, replies),
      responseRate: this.calculateResponseRate(comments, replies),
      engagementScore: this.calculateCommentEngagementScore(comments, replies)
    };
  }

  private async analyzeSingleCommentSentiment(content: string): Promise<SentimentResult> {
    // Implement sentiment analysis (could use external service or local ML model)
    const sentiment = await this.sentimentAnalyzer.analyze(content);
    
    return {
      sentiment: sentiment.label,
      confidence: sentiment.confidence,
      emotions: sentiment.emotions,
      topics: sentiment.topics
    };
  }
}

interface TopCommenter {
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  commentCount: number;
  averageSentiment: number;
  engagementScore: number;
  topTopics: string[];
}

interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
  overallSentiment: 'positive' | 'negative' | 'neutral';
  keyTopics: string[];
  emotionalTone: EmotionalTone;
}

interface EmotionalTone {
  joy: number;
  anger: number;
  sadness: number;
  fear: number;
  surprise: number;
  trust: number;
}
```

---

## 🎨 **Content Analytics Interface**

### **Content Performance Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Content Analytics                    [Export] [Settings] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Performance Overview ─────────────────────────────┐   │
│ │ 📄 Total Posts: 245    👁️ Total Views: 1.2M       │   │
│ │ 📈 Avg Views/Post: 4.9K  ⏱️ Avg Time: 3:24        │   │
│ │ 💬 Comments: 2,156      📱 Mobile: 68%            │   │
│ │ 📊 Engagement Rate: 7.2%  🔄 Bounce Rate: 45%     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Top Performing Content ───────────────────────────┐   │
│ │ Rank  Title                    Views    Engagement  │   │
│ │ ┌─────────────────────────────────────────────────┐ │   │
│ │ │ 1.  Getting Started Guide    45.2K      8.9%    │ │   │
│ │ │ 2.  Advanced Tips & Tricks   38.7K      7.4%    │ │   │
│ │ │ 3.  Best Practices 2024      29.1K      9.1%    │ │   │
│ │ │ 4.  Troubleshooting Common   25.8K      6.8%    │ │   │
│ │ │ 5.  Installation Tutorial    22.3K      5.2%    │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Category Performance ─┐ ┌─ Tag Trends ─────────────┐   │
│ │ Technology: 45%        │ │ 🔥 react (+25%)          │   │
│ │ Tutorials: 30%         │ │ 🔥 javascript (+18%)     │   │
│ │ News: 15%              │ │ 📈 typescript (+12%)     │   │
│ │ Reviews: 10%           │ │ 📉 jquery (-15%)         │   │
│ └────────────────────────┘ └──────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Content analytics
GET    /api/analytics/content                    // Content overview
GET    /api/analytics/content/{id}               // Specific content analytics
GET    /api/analytics/content/top                // Top performing content
GET    /api/analytics/content/trends             // Content trends

// Category analytics  
GET    /api/analytics/categories                 // All categories performance
GET    /api/analytics/categories/{id}            // Category analytics
GET    /api/analytics/categories/compare         // Compare categories

// Tag analytics
GET    /api/analytics/tags                       // Tag performance
GET    /api/analytics/tags/trending              // Trending tags
GET    /api/analytics/tags/cloud                 // Tag cloud data

// Search analytics
GET    /api/analytics/search                     // Search overview
GET    /api/analytics/search/queries             // Popular queries
GET    /api/analytics/search/gaps                // Content gaps
POST   /api/analytics/search/track               // Track search event

// Comment analytics
GET    /api/analytics/comments                   // Comment overview
GET    /api/analytics/comments/sentiment         // Sentiment analysis
GET    /api/analytics/comments/engagement        // Comment engagement
```

### **Database Schema:**
```sql
-- Content analytics
CREATE TABLE content_analytics (
  id UUID PRIMARY KEY,
  content_id UUID NOT NULL,
  date DATE NOT NULL,
  page_views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  time_on_page INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  social_shares INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_id, date)
);

-- Search analytics
CREATE TABLE search_analytics (
  id UUID PRIMARY KEY,
  query TEXT NOT NULL,
  results_count INTEGER NOT NULL,
  clicked_results INTEGER DEFAULT 0,
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Comment sentiment
CREATE TABLE comment_sentiment (
  id UUID PRIMARY KEY,
  comment_id UUID NOT NULL,
  sentiment VARCHAR(20) NOT NULL,
  confidence DECIMAL(3,2) NOT NULL,
  emotions JSONB,
  topics TEXT[],
  analyzed_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔗 **Related Documentation**

- **[Analytics Dashboard](./dashboard.md)** - Real-time analytics dashboard
- **[Analytics Reports](./reports.md)** - Custom reports system
- **[Content Management](../02_content/)** - Content creation and management
- **[User Analytics](./user-analytics.md)** - User behavior analytics

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
