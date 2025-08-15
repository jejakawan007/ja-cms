# 👥 User Analytics System

> **Analisis Perilaku User JA-CMS**  
> Tracking user behavior, engagement patterns, dan demographic insights

---

## 📋 **Deskripsi**

User Analytics System menyediakan insights mendalam tentang perilaku user, pola engagement, demographic data, dan user journey analysis. Sistem ini membantu memahami audience dan mengoptimalkan user experience berdasarkan data behavioral yang akurat.

---

## ⭐ **Core Features**

### **1. 📊 User Behavior Analytics**

#### **Behavioral Tracking:**
```typescript
interface UserAnalytics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    averageSessionDuration: number;
    bounceRate: number;
  };
  behavior: {
    sessionData: SessionAnalytics[];
    journeyPatterns: UserJourney[];
    engagementMetrics: EngagementMetrics;
    activityPatterns: ActivityPattern[];
  };
  demographics: {
    geographic: GeographicData[];
    devices: DeviceData[];
    browsers: BrowserData[];
    operatingSystems: OSData[];
  };
  engagement: {
    contentInteractions: ContentInteraction[];
    featureUsage: FeatureUsage[];
    userSegments: UserSegment[];
    loyaltyMetrics: LoyaltyMetrics;
  };
}

interface SessionAnalytics {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  pageViews: number;
  events: UserEvent[];
  referrer?: string;
  campaign?: CampaignData;
  device: DeviceInfo;
  location: LocationInfo;
  converted: boolean;
  conversionValue?: number;
}

interface UserJourney {
  userId?: string;
  sessionId: string;
  path: JourneyStep[];
  totalDuration: number;
  touchpoints: number;
  converted: boolean;
  conversionGoal?: string;
  dropOffPoint?: string;
  journeyType: 'first-visit' | 'returning' | 'conversion' | 'exploration';
}

interface JourneyStep {
  page: string;
  timestamp: Date;
  duration: number;
  events: string[];
  exitPoint: boolean;
  conversionPoint: boolean;
}
```

#### **User Behavior Service:**
```typescript
export class UserAnalyticsService {
  async getUserBehaviorAnalytics(timeRange: DateRange): Promise<UserAnalytics> {
    const overview = await this.getUserOverview(timeRange);
    const behavior = await this.getBehaviorAnalytics(timeRange);
    const demographics = await this.getDemographicAnalytics(timeRange);
    const engagement = await this.getEngagementAnalytics(timeRange);

    return {
      overview,
      behavior,
      demographics,
      engagement
    };
  }

  async trackUserEvent(eventData: UserEventData): Promise<void> {
    // Record user event
    await this.recordUserEvent({
      userId: eventData.userId,
      sessionId: eventData.sessionId,
      eventType: eventData.eventType,
      eventCategory: eventData.eventCategory,
      eventAction: eventData.eventAction,
      eventLabel: eventData.eventLabel,
      eventValue: eventData.eventValue,
      page: eventData.page,
      timestamp: new Date(),
      metadata: eventData.metadata
    });

    // Update user metrics
    await this.updateUserMetrics(eventData.userId || eventData.sessionId, eventData);
  }

  async analyzeUserJourney(userId: string, timeRange: DateRange): Promise<UserJourneyAnalysis> {
    const sessions = await this.getUserSessions(userId, timeRange);
    const events = await this.getUserEvents(userId, timeRange);
    
    const journeys = this.constructUserJourneys(sessions, events);
    const patterns = this.identifyJourneyPatterns(journeys);
    const conversions = this.analyzeConversionPaths(journeys);

    return {
      user: await this.getUserDetails(userId),
      journeys,
      patterns,
      conversions,
      insights: await this.generateUserInsights(userId, journeys),
      recommendations: await this.generateUserRecommendations(userId, patterns)
    };
  }

  async segmentUsers(criteria: SegmentationCriteria): Promise<UserSegmentation> {
    const users = await this.getAllUsersWithMetrics(criteria.timeRange);
    
    const segments = {
      behavioral: this.segmentByBehavior(users, criteria.behavioral),
      demographic: this.segmentByDemographics(users, criteria.demographic),
      engagement: this.segmentByEngagement(users, criteria.engagement),
      value: this.segmentByValue(users, criteria.value)
    };

    return {
      segments,
      insights: this.generateSegmentInsights(segments),
      recommendations: this.generateSegmentRecommendations(segments)
    };
  }

  private constructUserJourneys(sessions: Session[], events: UserEvent[]): UserJourney[] {
    return sessions.map(session => {
      const sessionEvents = events.filter(e => e.sessionId === session.id);
      const path = this.buildJourneyPath(sessionEvents);
      
      return {
        userId: session.userId,
        sessionId: session.id,
        path,
        totalDuration: session.duration,
        touchpoints: path.length,
        converted: sessionEvents.some(e => e.eventType === 'conversion'),
        conversionGoal: this.identifyConversionGoal(sessionEvents),
        dropOffPoint: this.identifyDropOffPoint(path),
        journeyType: this.classifyJourneyType(session, path)
      };
    });
  }

  private segmentByBehavior(users: UserWithMetrics[], criteria: BehavioralCriteria): BehavioralSegment[] {
    const segments: BehavioralSegment[] = [
      {
        name: 'Power Users',
        users: users.filter(u => u.sessionsPerWeek >= 5 && u.averageSessionDuration >= 300),
        characteristics: ['High frequency', 'Long sessions', 'Deep engagement']
      },
      {
        name: 'Casual Users',
        users: users.filter(u => u.sessionsPerWeek >= 1 && u.sessionsPerWeek < 5),
        characteristics: ['Moderate frequency', 'Medium sessions', 'Selective engagement']
      },
      {
        name: 'Occasional Users',
        users: users.filter(u => u.sessionsPerWeek < 1),
        characteristics: ['Low frequency', 'Short sessions', 'Limited engagement']
      },
      {
        name: 'New Users',
        users: users.filter(u => u.daysSinceFirstVisit <= 7),
        characteristics: ['Recent acquisition', 'Exploring content', 'Learning platform']
      }
    ];

    return segments.filter(s => s.users.length > 0);
  }
}

interface UserJourneyAnalysis {
  user: UserDetails;
  journeys: UserJourney[];
  patterns: JourneyPattern[];
  conversions: ConversionAnalysis;
  insights: UserInsight[];
  recommendations: UserRecommendation[];
}

interface UserSegmentation {
  segments: {
    behavioral: BehavioralSegment[];
    demographic: DemographicSegment[];
    engagement: EngagementSegment[];
    value: ValueSegment[];
  };
  insights: SegmentInsight[];
  recommendations: SegmentRecommendation[];
}
```

### **2. 🔐 Login Analytics**

#### **Authentication Behavior Tracking:**
```typescript
interface LoginAnalytics {
  overview: {
    totalLogins: number;
    uniqueUsers: number;
    successfulLogins: number;
    failedLogins: number;
    successRate: number;
    averageSessionDuration: number;
  };
  patterns: {
    loginTimes: TimePattern[];
    loginFrequency: FrequencyPattern[];
    devicePatterns: DevicePattern[];
    locationPatterns: LocationPattern[];
  };
  security: {
    suspiciousActivity: SuspiciousActivity[];
    failedAttempts: FailedAttempt[];
    bruteForceAttempts: BruteForceAttempt[];
    unusualLocations: UnusualLocation[];
  };
  performance: {
    loginDuration: LoginDuration[];
    authenticationMethods: AuthMethodUsage[];
    twoFactorAdoption: TwoFactorStats;
  };
}

export class LoginAnalyticsService {
  async trackLoginEvent(loginData: LoginEventData): Promise<void> {
    // Record login event
    await this.recordLoginEvent({
      userId: loginData.userId,
      success: loginData.success,
      method: loginData.method, // password, 2fa, sso, social
      ipAddress: loginData.ipAddress,
      userAgent: loginData.userAgent,
      location: await this.resolveLocation(loginData.ipAddress),
      duration: loginData.duration,
      errorCode: loginData.errorCode,
      timestamp: new Date()
    });

    // Update user login metrics
    if (loginData.success) {
      await this.updateUserLoginStats(loginData.userId);
    }

    // Check for suspicious activity
    await this.checkSuspiciousActivity(loginData);
  }

  async getLoginAnalytics(timeRange: DateRange): Promise<LoginAnalytics> {
    const overview = await this.getLoginOverview(timeRange);
    const patterns = await this.getLoginPatterns(timeRange);
    const security = await this.getSecurityAnalytics(timeRange);
    const performance = await this.getLoginPerformance(timeRange);

    return {
      overview,
      patterns,
      security,
      performance
    };
  }

  async detectAnomalousLogins(userId: string): Promise<AnomalousLogin[]> {
    const user = await this.getUserDetails(userId);
    const recentLogins = await this.getRecentLogins(userId, 30); // Last 30 days
    const userProfile = await this.buildUserProfile(userId);

    const anomalies: AnomalousLogin[] = [];

    for (const login of recentLogins) {
      const anomalyScore = await this.calculateAnomalyScore(login, userProfile);
      
      if (anomalyScore > 0.7) { // Threshold for anomaly
        anomalies.push({
          login,
          anomalyScore,
          anomalyReasons: this.identifyAnomalyReasons(login, userProfile),
          riskLevel: this.calculateRiskLevel(anomalyScore),
          recommendedActions: this.getRecommendedActions(anomalyScore)
        });
      }
    }

    return anomalies.sort((a, b) => b.anomalyScore - a.anomalyScore);
  }

  private async buildUserProfile(userId: string): Promise<UserLoginProfile> {
    const logins = await this.getUserLogins(userId, 90); // Last 90 days
    
    return {
      typicalLoginTimes: this.analyzeLoginTimes(logins),
      commonLocations: this.analyzeLoginLocations(logins),
      preferredDevices: this.analyzeLoginDevices(logins),
      loginFrequency: this.analyzeLoginFrequency(logins),
      sessionDurations: this.analyzeSessionDurations(logins)
    };
  }

  private async calculateAnomalyScore(login: LoginEvent, profile: UserLoginProfile): Promise<number> {
    let score = 0;

    // Time anomaly
    const timeScore = this.calculateTimeAnomalyScore(login.timestamp, profile.typicalLoginTimes);
    score += timeScore * 0.2;

    // Location anomaly
    const locationScore = this.calculateLocationAnomalyScore(login.location, profile.commonLocations);
    score += locationScore * 0.3;

    // Device anomaly
    const deviceScore = this.calculateDeviceAnomalyScore(login.device, profile.preferredDevices);
    score += deviceScore * 0.25;

    // Frequency anomaly
    const frequencyScore = this.calculateFrequencyAnomalyScore(login.timestamp, profile.loginFrequency);
    score += frequencyScore * 0.25;

    return Math.min(score, 1); // Cap at 1.0
  }
}

interface AnomalousLogin {
  login: LoginEvent;
  anomalyScore: number; // 0-1
  anomalyReasons: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedActions: string[];
}

interface UserLoginProfile {
  typicalLoginTimes: TimeRange[];
  commonLocations: LocationData[];
  preferredDevices: DeviceData[];
  loginFrequency: FrequencyData;
  sessionDurations: DurationData;
}
```

### **3. 🎯 User Engagement Metrics**

#### **Engagement Analysis:**
```typescript
interface EngagementMetrics {
  overview: {
    averageEngagementScore: number;
    engagementTrend: TrendData;
    highEngagementUsers: number;
    lowEngagementUsers: number;
    churnRisk: number;
  };
  interactions: {
    contentInteractions: ContentInteraction[];
    featureUsage: FeatureUsage[];
    socialEngagement: SocialEngagement;
    feedbackSubmissions: FeedbackData[];
  };
  retention: {
    retentionRates: RetentionRate[];
    cohortAnalysis: CohortData[];
    churnAnalysis: ChurnAnalysis;
    lifetimeValue: LifetimeValue[];
  };
  satisfaction: {
    npsScore: number;
    satisfactionRating: number;
    feedbackSentiment: SentimentData;
    supportTickets: SupportTicketData[];
  };
}

export class EngagementAnalyticsService {
  async calculateEngagementScore(userId: string, timeRange: DateRange): Promise<EngagementScore> {
    const user = await this.getUserDetails(userId);
    const activities = await this.getUserActivities(userId, timeRange);
    
    const metrics = {
      frequency: this.calculateFrequencyScore(activities),
      depth: this.calculateDepthScore(activities),
      breadth: this.calculateBreadthScore(activities),
      recency: this.calculateRecencyScore(activities),
      social: this.calculateSocialScore(activities)
    };

    const weightedScore = 
      metrics.frequency * 0.25 +
      metrics.depth * 0.25 +
      metrics.breadth * 0.20 +
      metrics.recency * 0.20 +
      metrics.social * 0.10;

    return {
      userId,
      score: Math.round(weightedScore * 100), // 0-100 scale
      metrics,
      level: this.getEngagementLevel(weightedScore),
      trend: await this.getEngagementTrend(userId),
      recommendations: this.generateEngagementRecommendations(metrics)
    };
  }

  async performCohortAnalysis(cohortDefinition: CohortDefinition): Promise<CohortAnalysis> {
    const cohorts = await this.buildCohorts(cohortDefinition);
    const analysis: CohortAnalysis = {
      definition: cohortDefinition,
      cohorts: [],
      insights: [],
      trends: []
    };

    for (const cohort of cohorts) {
      const cohortData = await this.analyzeCohort(cohort);
      analysis.cohorts.push(cohortData);
    }

    analysis.insights = this.generateCohortInsights(analysis.cohorts);
    analysis.trends = this.identifyCohortTrends(analysis.cohorts);

    return analysis;
  }

  async predictChurnRisk(userId: string): Promise<ChurnPrediction> {
    const user = await this.getUserWithMetrics(userId);
    const features = await this.extractChurnFeatures(user);
    
    // Use ML model to predict churn probability
    const churnProbability = await this.churnModel.predict(features);
    
    return {
      userId,
      churnProbability,
      riskLevel: this.categorizeChurnRisk(churnProbability),
      keyFactors: this.identifyChurnFactors(features, churnProbability),
      recommendations: this.generateRetentionRecommendations(user, churnProbability),
      timeToChurn: this.estimateTimeToChurn(user, churnProbability)
    };
  }

  private calculateFrequencyScore(activities: UserActivity[]): number {
    const days = 30;
    const sessionsPerDay = activities.length / days;
    
    // Score based on session frequency (normalized to 0-1)
    return Math.min(sessionsPerDay / 2, 1); // 2+ sessions per day = max score
  }

  private calculateDepthScore(activities: UserActivity[]): number {
    const avgSessionDuration = activities.reduce((sum, a) => sum + a.duration, 0) / activities.length;
    const avgPageViews = activities.reduce((sum, a) => sum + a.pageViews, 0) / activities.length;
    
    // Combine duration and page views for depth score
    const durationScore = Math.min(avgSessionDuration / 600, 1); // 10 minutes = max
    const pageViewScore = Math.min(avgPageViews / 10, 1); // 10 pages = max
    
    return (durationScore + pageViewScore) / 2;
  }

  private calculateBreadthScore(activities: UserActivity[]): number {
    const uniqueFeatures = new Set(activities.flatMap(a => a.featuresUsed)).size;
    const uniqueContentTypes = new Set(activities.flatMap(a => a.contentTypesViewed)).size;
    
    // Score based on feature and content diversity
    const featureScore = Math.min(uniqueFeatures / 10, 1); // 10 features = max
    const contentScore = Math.min(uniqueContentTypes / 5, 1); // 5 content types = max
    
    return (featureScore + contentScore) / 2;
  }

  private getEngagementLevel(score: number): EngagementLevel {
    if (score >= 0.8) return 'champion';
    if (score >= 0.6) return 'loyal';
    if (score >= 0.4) return 'engaged';
    if (score >= 0.2) return 'casual';
    return 'at-risk';
  }
}

interface EngagementScore {
  userId: string;
  score: number; // 0-100
  metrics: {
    frequency: number;
    depth: number;
    breadth: number;
    recency: number;
    social: number;
  };
  level: EngagementLevel;
  trend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
}

type EngagementLevel = 'champion' | 'loyal' | 'engaged' | 'casual' | 'at-risk';

interface ChurnPrediction {
  userId: string;
  churnProbability: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  keyFactors: ChurnFactor[];
  recommendations: RetentionRecommendation[];
  timeToChurn?: number; // days
}

interface ChurnFactor {
  factor: string;
  impact: number; // contribution to churn probability
  description: string;
}
```

### **4. 📍 Geographic & Device Analytics**

#### **User Demographics Analysis:**
```typescript
interface DemographicAnalytics {
  geographic: {
    countries: CountryData[];
    cities: CityData[];
    regions: RegionData[];
    timeZones: TimeZoneData[];
  };
  devices: {
    deviceTypes: DeviceTypeData[];
    brands: DeviceBrandData[];
    operatingSystems: OSData[];
    browsers: BrowserData[];
    screenResolutions: ScreenResolutionData[];
  };
  temporal: {
    activeHours: HourlyActivityData[];
    dayOfWeek: WeeklyActivityData[];
    seasonality: SeasonalityData[];
  };
  behavioral: {
    newVsReturning: NewVsReturningData;
    sessionDurations: SessionDurationData[];
    pageDepth: PageDepthData[];
  };
}

export class DemographicAnalyticsService {
  async getDemographicAnalytics(timeRange: DateRange): Promise<DemographicAnalytics> {
    const geographic = await this.getGeographicAnalytics(timeRange);
    const devices = await this.getDeviceAnalytics(timeRange);
    const temporal = await this.getTemporalAnalytics(timeRange);
    const behavioral = await this.getBehavioralAnalytics(timeRange);

    return {
      geographic,
      devices,
      temporal,
      behavioral
    };
  }

  async analyzeUserDistribution(): Promise<UserDistributionAnalysis> {
    const users = await this.getAllUsersWithLocation();
    
    return {
      geographic: {
        concentration: this.calculateGeographicConcentration(users),
        diversity: this.calculateGeographicDiversity(users),
        growthAreas: this.identifyGrowthAreas(users),
        marketPenetration: this.calculateMarketPenetration(users)
      },
      demographic: {
        ageDistribution: await this.getAgeDistribution(users),
        genderDistribution: await this.getGenderDistribution(users),
        languagePreferences: await this.getLanguagePreferences(users),
        devicePreferences: await this.getDevicePreferences(users)
      },
      insights: this.generateDemographicInsights(users),
      opportunities: this.identifyMarketOpportunities(users)
    };
  }

  async getDevicePerformanceAnalytics(): Promise<DevicePerformanceAnalysis> {
    const sessions = await this.getSessionsWithDeviceData();
    
    const devicePerformance = sessions.reduce((acc, session) => {
      const deviceKey = `${session.device.type}-${session.device.os}`;
      
      if (!acc[deviceKey]) {
        acc[deviceKey] = {
          device: session.device,
          sessions: [],
          metrics: {
            averageLoadTime: 0,
            bounceRate: 0,
            sessionDuration: 0,
            pageViews: 0,
            conversionRate: 0
          }
        };
      }
      
      acc[deviceKey].sessions.push(session);
      return acc;
    }, {} as Record<string, DevicePerformanceData>);

    // Calculate metrics for each device type
    Object.values(devicePerformance).forEach(data => {
      data.metrics = this.calculateDeviceMetrics(data.sessions);
    });

    return {
      devicePerformance: Object.values(devicePerformance),
      insights: this.generateDeviceInsights(Object.values(devicePerformance)),
      recommendations: this.generateDeviceRecommendations(Object.values(devicePerformance))
    };
  }

  private calculateGeographicConcentration(users: UserWithLocation[]): GeographicConcentration {
    const countryCounts = users.reduce((acc, user) => {
      acc[user.country] = (acc[user.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalUsers = users.length;
    const sortedCountries = Object.entries(countryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    const top3Percentage = sortedCountries.slice(0, 3)
      .reduce((sum, [, count]) => sum + count, 0) / totalUsers * 100;

    return {
      topCountries: sortedCountries.map(([country, count]) => ({
        country,
        count,
        percentage: (count / totalUsers) * 100
      })),
      concentrationRatio: top3Percentage,
      diversityIndex: this.calculateDiversityIndex(countryCounts)
    };
  }

  private calculateDeviceMetrics(sessions: Session[]): DeviceMetrics {
    const totalSessions = sessions.length;
    
    return {
      averageLoadTime: sessions.reduce((sum, s) => sum + s.loadTime, 0) / totalSessions,
      bounceRate: sessions.filter(s => s.bounced).length / totalSessions * 100,
      sessionDuration: sessions.reduce((sum, s) => sum + s.duration, 0) / totalSessions,
      pageViews: sessions.reduce((sum, s) => sum + s.pageViews, 0) / totalSessions,
      conversionRate: sessions.filter(s => s.converted).length / totalSessions * 100
    };
  }
}

interface UserDistributionAnalysis {
  geographic: {
    concentration: GeographicConcentration;
    diversity: GeographicDiversity;
    growthAreas: GrowthArea[];
    marketPenetration: MarketPenetration[];
  };
  demographic: {
    ageDistribution: AgeDistribution[];
    genderDistribution: GenderDistribution[];
    languagePreferences: LanguagePreference[];
    devicePreferences: DevicePreference[];
  };
  insights: DemographicInsight[];
  opportunities: MarketOpportunity[];
}

interface DevicePerformanceAnalysis {
  devicePerformance: DevicePerformanceData[];
  insights: DeviceInsight[];
  recommendations: DeviceRecommendation[];
}
```

---

## 🎨 **User Analytics Interface**

### **User Analytics Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 👥 User Analytics                       [Segment] [Export] │
├─────────────────────────────────────────────────────────┤
│ ┌─ User Overview ────────────────────────────────────┐   │
│ │ 👤 Total Users: 12,345   🟢 Active: 8,901         │   │
│ │ 🆕 New Users: 234        🔄 Returning: 8,667      │   │
│ │ ⏱️ Avg Session: 4:32     📊 Engagement: 72%        │   │
│ │ 📱 Mobile: 68%           🌍 Countries: 45          │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ User Segments ────────────────────────────────────┐   │
│ │ 🏆 Champions: 15%        💪 Loyal: 25%             │   │
│ │ 😊 Engaged: 30%          🤔 Casual: 20%            │   │
│ │ ⚠️ At Risk: 10%          💸 Churned: 5%            │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Geographic Distribution ──┐ ┌─ Device Breakdown ────┐ │
│ │ 🇺🇸 USA: 35%              │ │ 📱 Mobile: 68%         │ │
│ │ 🇬🇧 UK: 15%               │ │ 💻 Desktop: 28%        │ │
│ │ 🇨🇦 Canada: 12%           │ │ 📟 Tablet: 4%          │ │
│ │ 🇦🇺 Australia: 8%         │ │ 🍎 iOS: 45%            │ │
│ │ 🇩🇪 Germany: 6%           │ │ 🤖 Android: 35%        │ │
│ │ 🌍 Others: 24%            │ │ 🖥️ Windows: 20%        │ │
│ └────────────────────────────┘ └────────────────────────┘ │
│                                                         │
│ ┌─ Engagement Trends ────────────────────────────────┐   │
│ │ Score ┌─────────────────────────────────────────┐  │   │
│ │   100 │                   ╭─╮                   │  │   │
│ │    80 │         ╭─╮     ╭─╯ ╰─╮                 │  │   │
│ │    60 │       ╭─╯ ╰─╮ ╭─╯     ╰─╮               │  │   │
│ │    40 │     ╭─╯     ╰─╯         ╰─╮             │  │   │
│ │    20 │   ╭─╯                     ╰─╮           │  │   │
│ │     0 └─────────────────────────────────────────┘  │   │
│ │       Jan   Feb   Mar   Apr   May   Jun           │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// User analytics overview
GET    /api/analytics/users                     // User overview
GET    /api/analytics/users/behavior            // Behavior analytics
GET    /api/analytics/users/demographics        // Demographic data
GET    /api/analytics/users/engagement          // Engagement metrics

// User journey analysis
GET    /api/analytics/users/{id}/journey        // User journey
GET    /api/analytics/users/journeys/patterns   // Journey patterns
GET    /api/analytics/users/conversion-paths    // Conversion analysis

// User segmentation
GET    /api/analytics/users/segments            // User segments
POST   /api/analytics/users/segments            // Create segment
GET    /api/analytics/users/cohorts             // Cohort analysis

// Login analytics
GET    /api/analytics/users/logins              // Login analytics
GET    /api/analytics/users/security            // Security analytics
GET    /api/analytics/users/{id}/anomalies      // Anomalous activity

// Tracking endpoints
POST   /api/analytics/users/track               // Track user event
POST   /api/analytics/users/login               // Track login event
```

### **Database Schema:**
```sql
-- User events tracking
CREATE TABLE user_events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_category VARCHAR(100),
  event_action VARCHAR(100),
  event_label VARCHAR(255),
  event_value INTEGER,
  page VARCHAR(500),
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- User sessions
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255) NOT NULL UNIQUE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration INTEGER, -- seconds
  page_views INTEGER DEFAULT 0,
  events INTEGER DEFAULT 0,
  bounce BOOLEAN DEFAULT true,
  referrer TEXT,
  campaign_source VARCHAR(100),
  campaign_medium VARCHAR(100),
  device_info JSONB,
  location_info JSONB,
  converted BOOLEAN DEFAULT false,
  conversion_value DECIMAL(10,2)
);

-- Login events
CREATE TABLE login_events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  success BOOLEAN NOT NULL,
  method VARCHAR(50) NOT NULL, -- password, 2fa, sso, social
  ip_address INET,
  user_agent TEXT,
  location JSONB,
  duration INTEGER, -- milliseconds
  error_code VARCHAR(50),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- User engagement scores
CREATE TABLE user_engagement_scores (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  engagement_score INTEGER NOT NULL, -- 0-100
  frequency_score DECIMAL(3,2),
  depth_score DECIMAL(3,2),
  breadth_score DECIMAL(3,2),
  recency_score DECIMAL(3,2),
  social_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

---

## 🔗 **Related Documentation**

- **[User Management](../05_users/)** - User authentication and management
- **[Analytics Dashboard](./dashboard.md)** - Real-time user analytics
- **[Content Analytics](./content-analytics.md)** - Content interaction analytics
- **[Security Monitoring](../06_security/monitoring.md)** - User security analytics

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active

