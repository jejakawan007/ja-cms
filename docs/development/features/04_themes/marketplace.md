# 🛒 Theme Marketplace

> **Theme Marketplace & Distribution JA-CMS**  
> Complete marketplace system untuk theme distribution, purchasing, dan community features

---

## 📋 **Deskripsi**

Theme Marketplace menyediakan platform comprehensive untuk distribusi, pembelian, dan pengelolaan themes JA-CMS. Sistem ini mendukung free dan premium themes, review system, developer tools, dan community features untuk menciptakan ecosystem yang vibrant.

---

## ⭐ **Core Features**

### **1. 🏪 Marketplace Platform**

#### **Marketplace Architecture:**
```typescript
interface ThemeMarketplace {
  id: string;
  name: string;
  description: string;
  url: string;
  config: MarketplaceConfig;
  themes: MarketplaceTheme[];
  categories: ThemeCategory[];
  developers: Developer[];
  reviews: Review[];
  analytics: MarketplaceAnalytics;
  settings: MarketplaceSettings;
}

interface MarketplaceTheme {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  developer: Developer;
  category: ThemeCategory;
  tags: string[];
  version: string;
  compatibility: CompatibilityInfo;
  pricing: ThemePricing;
  assets: ThemeAssets;
  screenshots: Screenshot[];
  demoUrl?: string;
  downloadUrl: string;
  documentation: Documentation;
  support: SupportInfo;
  stats: ThemeStats;
  reviews: Review[];
  ratings: ThemeRating;
  featured: boolean;
  status: ThemeStatus;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    lastVersionUpdate: Date;
    downloadCount: number;
    activeInstalls: number;
    averageRating: number;
    reviewCount: number;
  };
}

interface Developer {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  bio?: string;
  website?: string;
  social: SocialLinks;
  verification: DeveloperVerification;
  themes: string[]; // theme IDs
  stats: DeveloperStats;
  earnings: EarningsInfo;
  settings: DeveloperSettings;
  metadata: {
    joinedAt: Date;
    lastActive: Date;
    isActive: boolean;
    isVerified: boolean;
    isFeatured: boolean;
  };
}

interface ThemePricing {
  type: 'free' | 'paid' | 'freemium';
  price?: number;
  currency: string;
  licenses: LicenseOption[];
  discounts: Discount[];
  paymentMethods: PaymentMethod[];
}

interface LicenseOption {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  limitations: string[];
  duration?: number; // days, null for lifetime
  maxSites?: number;
  support: SupportLevel;
}

interface Review {
  id: string;
  themeId: string;
  userId: string;
  username: string;
  avatar?: string;
  rating: number; // 1-5
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
  helpful: number;
  notHelpful: number;
  replies: ReviewReply[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

interface ThemeStats {
  downloads: {
    total: number;
    weekly: number;
    monthly: number;
    daily: number;
  };
  installs: {
    active: number;
    total: number;
  };
  revenue?: {
    total: number;
    monthly: number;
    weekly: number;
  };
  ratings: {
    average: number;
    count: number;
    distribution: { [rating: number]: number };
  };
  views: {
    total: number;
    unique: number;
    weekly: number;
  };
}

type ThemeStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended' | 'archived';
type SupportLevel = 'none' | 'community' | 'email' | 'priority';
```

#### **Marketplace Service:**
```typescript
export class ThemeMarketplaceService {
  private themeRepository: ThemeRepository;
  private developerService: DeveloperService;
  private reviewService: ReviewService;
  private paymentService: PaymentService;
  private analyticsService: MarketplaceAnalyticsService;
  private moderationService: ModerationService;

  async browseThemes(filters: ThemeFilters, pagination: Pagination): Promise<ThemeBrowseResult> {
    // Build query based on filters
    const query = this.buildThemeQuery(filters);
    
    // Apply sorting
    const sortedQuery = this.applySorting(query, filters.sort);
    
    // Execute query with pagination
    const themes = await this.themeRepository.findMany(sortedQuery, pagination);
    
    // Get total count for pagination
    const totalCount = await this.themeRepository.count(query);
    
    // Enhance themes with additional data
    const enhancedThemes = await this.enhanceThemesData(themes);
    
    return {
      themes: enhancedThemes,
      pagination: {
        ...pagination,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pagination.limit)
      },
      filters: await this.getAvailableFilters(),
      featured: await this.getFeaturedThemes(),
      categories: await this.getActiveCategories()
    };
  }

  async getThemeDetails(themeId: string, userId?: string): Promise<ThemeDetails> {
    const theme = await this.themeRepository.findById(themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }

    // Increment view count
    await this.incrementViewCount(themeId, userId);
    
    // Get enhanced theme data
    const enhancedTheme = await this.enhanceThemeData(theme);
    
    // Get related themes
    const relatedThemes = await this.getRelatedThemes(theme);
    
    // Get user-specific data
    let userData = null;
    if (userId) {
      userData = await this.getUserThemeData(userId, themeId);
    }

    return {
      theme: enhancedTheme,
      related: relatedThemes,
      user: userData,
      compatibility: await this.checkCompatibility(theme),
      changelog: await this.getThemeChangelog(themeId)
    };
  }

  async purchaseTheme(themeId: string, licenseId: string, userId: string, paymentData: PaymentData): Promise<PurchaseResult> {
    const theme = await this.themeRepository.findById(themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }

    const license = theme.pricing.licenses.find(l => l.id === licenseId);
    if (!license) {
      throw new Error('License option not found');
    }

    // Check if user already owns this theme
    const existingPurchase = await this.checkExistingPurchase(userId, themeId);
    if (existingPurchase) {
      throw new Error('Theme already purchased');
    }

    // Process payment
    const paymentResult = await this.paymentService.processPayment({
      amount: license.price,
      currency: theme.pricing.currency,
      description: `${theme.name} - ${license.name}`,
      userId,
      themeId,
      licenseId,
      ...paymentData
    });

    if (!paymentResult.success) {
      throw new Error(`Payment failed: ${paymentResult.error}`);
    }

    // Create purchase record
    const purchase = await this.createPurchase({
      userId,
      themeId,
      licenseId,
      paymentId: paymentResult.paymentId,
      amount: license.price,
      currency: theme.pricing.currency
    });

    // Generate license key
    const licenseKey = await this.generateLicenseKey(purchase);
    
    // Update theme statistics
    await this.updateThemeStats(themeId, 'purchase');
    
    // Update developer earnings
    await this.updateDeveloperEarnings(theme.developer.id, license.price);
    
    // Send confirmation email
    await this.sendPurchaseConfirmation(userId, theme, license, licenseKey);

    return {
      success: true,
      purchase,
      licenseKey,
      downloadUrl: await this.generateDownloadUrl(themeId, licenseKey),
      message: 'Theme purchased successfully'
    };
  }

  async downloadTheme(themeId: string, licenseKey?: string, userId?: string): Promise<DownloadResult> {
    const theme = await this.themeRepository.findById(themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }

    // Validate download permissions
    const canDownload = await this.validateDownloadPermission(theme, licenseKey, userId);
    if (!canDownload.allowed) {
      throw new Error(canDownload.reason);
    }

    // Generate secure download URL
    const downloadUrl = await this.generateSecureDownloadUrl(theme, licenseKey, userId);
    
    // Track download
    await this.trackDownload(themeId, userId);
    
    // Update statistics
    await this.updateThemeStats(themeId, 'download');

    return {
      success: true,
      downloadUrl,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
      theme: {
        id: theme.id,
        name: theme.name,
        version: theme.version
      }
    };
  }

  async submitTheme(themeData: ThemeSubmission, developerId: string): Promise<SubmissionResult> {
    // Validate developer permissions
    const developer = await this.developerService.getDeveloper(developerId);
    if (!developer || !developer.metadata.isActive) {
      throw new Error('Developer account not found or inactive');
    }

    // Validate theme submission
    const validation = await this.validateThemeSubmission(themeData);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
        message: 'Theme submission validation failed'
      };
    }

    // Upload theme package
    const uploadResult = await this.uploadThemePackage(themeData.package, developerId);
    if (!uploadResult.success) {
      throw new Error('Failed to upload theme package');
    }

    // Create theme record
    const theme = await this.createTheme({
      ...themeData,
      developerId,
      packageUrl: uploadResult.url,
      status: 'pending'
    });

    // Start review process
    await this.moderationService.startReview(theme.id, 'theme_submission');
    
    // Notify developer
    await this.notifyDeveloper(developerId, 'theme_submitted', theme);

    return {
      success: true,
      theme,
      message: 'Theme submitted successfully and is now under review'
    };
  }

  async reviewTheme(themeId: string, userId: string, reviewData: ReviewData): Promise<ReviewResult> {
    // Check if user can review this theme
    const canReview = await this.validateReviewPermission(userId, themeId);
    if (!canReview.allowed) {
      throw new Error(canReview.reason);
    }

    // Create review
    const review = await this.reviewService.createReview({
      themeId,
      userId,
      ...reviewData
    });

    // Update theme rating
    await this.updateThemeRating(themeId);
    
    // Notify developer
    const theme = await this.themeRepository.findById(themeId);
    if (theme) {
      await this.notifyDeveloper(theme.developer.id, 'new_review', { theme, review });
    }

    return {
      success: true,
      review,
      message: 'Review submitted successfully'
    };
  }

  async searchThemes(query: string, filters: ThemeFilters = {}): Promise<ThemeSearchResult> {
    // Build search query
    const searchQuery = this.buildSearchQuery(query, filters);
    
    // Execute search
    const searchResults = await this.executeSearch(searchQuery);
    
    // Enhance results
    const enhancedResults = await this.enhanceSearchResults(searchResults);
    
    // Track search
    await this.trackSearch(query, filters, searchResults.length);

    return {
      query,
      results: enhancedResults,
      totalResults: searchResults.length,
      suggestions: await this.getSearchSuggestions(query),
      popularSearches: await this.getPopularSearches()
    };
  }

  private async enhanceThemeData(theme: MarketplaceTheme): Promise<EnhancedTheme> {
    const [developer, reviews, stats, compatibility] = await Promise.all([
      this.developerService.getDeveloper(theme.developer.id),
      this.reviewService.getThemeReviews(theme.id, { limit: 5 }),
      this.getThemeStats(theme.id),
      this.checkThemeCompatibility(theme)
    ]);

    return {
      ...theme,
      developer,
      recentReviews: reviews,
      stats,
      compatibility
    };
  }

  private async validateDownloadPermission(theme: MarketplaceTheme, licenseKey?: string, userId?: string): Promise<ValidationResult> {
    // Free themes
    if (theme.pricing.type === 'free') {
      return { allowed: true };
    }

    // Paid themes require license key or valid purchase
    if (!licenseKey && !userId) {
      return { 
        allowed: false, 
        reason: 'License key or user authentication required for paid theme' 
      };
    }

    if (licenseKey) {
      const licenseValidation = await this.validateLicenseKey(licenseKey, theme.id);
      return licenseValidation;
    }

    if (userId) {
      const purchase = await this.checkExistingPurchase(userId, theme.id);
      if (!purchase) {
        return { 
          allowed: false, 
          reason: 'Theme not purchased by user' 
        };
      }
      
      if (purchase.status !== 'active') {
        return { 
          allowed: false, 
          reason: 'Purchase is not active' 
        };
      }

      return { allowed: true };
    }

    return { 
      allowed: false, 
      reason: 'Unable to validate download permission' 
    };
  }

  private buildThemeQuery(filters: ThemeFilters): any {
    const query: any = {
      status: 'approved'
    };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.pricing) {
      query['pricing.type'] = filters.pricing;
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.developer) {
      query['developer.username'] = filters.developer;
    }

    if (filters.rating) {
      query['metadata.averageRating'] = { $gte: filters.rating };
    }

    if (filters.compatibility) {
      query['compatibility.minVersion'] = { $lte: filters.compatibility };
    }

    return query;
  }

  private applySorting(query: any, sort: ThemeSortOption = 'popularity'): any {
    const sortOptions: { [key: string]: any } = {
      popularity: { 'metadata.downloadCount': -1, 'metadata.averageRating': -1 },
      newest: { 'metadata.publishedAt': -1 },
      rating: { 'metadata.averageRating': -1, 'metadata.reviewCount': -1 },
      price_low: { 'pricing.price': 1 },
      price_high: { 'pricing.price': -1 },
      downloads: { 'metadata.downloadCount': -1 },
      updated: { 'metadata.lastVersionUpdate': -1 }
    };

    return {
      ...query,
      $sort: sortOptions[sort] || sortOptions.popularity
    };
  }
}

interface ThemeFilters {
  category?: string;
  pricing?: 'free' | 'paid';
  tags?: string[];
  developer?: string;
  rating?: number;
  compatibility?: string;
  sort?: ThemeSortOption;
}

interface ThemeBrowseResult {
  themes: EnhancedTheme[];
  pagination: PaginationResult;
  filters: AvailableFilters;
  featured: MarketplaceTheme[];
  categories: ThemeCategory[];
}

interface PurchaseResult {
  success: boolean;
  purchase?: Purchase;
  licenseKey?: string;
  downloadUrl?: string;
  message: string;
}

interface DownloadResult {
  success: boolean;
  downloadUrl?: string;
  expiresAt?: Date;
  theme?: {
    id: string;
    name: string;
    version: string;
  };
}

interface ThemeSubmission {
  name: string;
  description: string;
  longDescription: string;
  category: string;
  tags: string[];
  pricing: ThemePricing;
  screenshots: File[];
  package: File;
  documentation?: File;
  demoUrl?: string;
}

type ThemeSortOption = 'popularity' | 'newest' | 'rating' | 'price_low' | 'price_high' | 'downloads' | 'updated';
```

### **2. 👨‍💻 Developer Tools & Dashboard**

#### **Developer Dashboard:**
```typescript
export class DeveloperDashboardService {
  private developerRepository: DeveloperRepository;
  private themeRepository: ThemeRepository;
  private analyticsService: DeveloperAnalyticsService;
  private earningsService: EarningsService;

  async getDeveloperDashboard(developerId: string): Promise<DeveloperDashboard> {
    const developer = await this.developerRepository.findById(developerId);
    if (!developer) {
      throw new Error('Developer not found');
    }

    const [themes, analytics, earnings, notifications] = await Promise.all([
      this.getDeveloperThemes(developerId),
      this.getDeveloperAnalytics(developerId),
      this.getDeveloperEarnings(developerId),
      this.getDeveloperNotifications(developerId)
    ]);

    return {
      developer,
      themes,
      analytics,
      earnings,
      notifications,
      quickStats: await this.getQuickStats(developerId)
    };
  }

  async getDeveloperAnalytics(developerId: string, timeRange: DateRange = this.getDefaultTimeRange()): Promise<DeveloperAnalytics> {
    const themes = await this.getDeveloperThemes(developerId);
    const themeIds = themes.map(t => t.id);

    const [downloads, revenue, reviews, views] = await Promise.all([
      this.analyticsService.getDownloadAnalytics(themeIds, timeRange),
      this.analyticsService.getRevenueAnalytics(themeIds, timeRange),
      this.analyticsService.getReviewAnalytics(themeIds, timeRange),
      this.analyticsService.getViewAnalytics(themeIds, timeRange)
    ]);

    return {
      timeRange,
      downloads: {
        total: downloads.total,
        trend: downloads.trend,
        byTheme: downloads.byTheme,
        byCountry: downloads.byCountry,
        chart: downloads.chartData
      },
      revenue: {
        total: revenue.total,
        trend: revenue.trend,
        byTheme: revenue.byTheme,
        byLicense: revenue.byLicense,
        chart: revenue.chartData
      },
      reviews: {
        average: reviews.averageRating,
        total: reviews.totalReviews,
        trend: reviews.trend,
        distribution: reviews.ratingDistribution,
        recent: reviews.recentReviews
      },
      views: {
        total: views.total,
        unique: views.unique,
        trend: views.trend,
        byTheme: views.byTheme,
        chart: views.chartData
      },
      insights: await this.generateDeveloperInsights(developerId, {
        downloads,
        revenue,
        reviews,
        views
      })
    };
  }

  async updateDeveloperProfile(developerId: string, updates: DeveloperProfileUpdate): Promise<Developer> {
    const developer = await this.developerRepository.findById(developerId);
    if (!developer) {
      throw new Error('Developer not found');
    }

    // Validate updates
    const validation = await this.validateProfileUpdate(updates);
    if (!validation.valid) {
      throw new Error(`Profile update validation failed: ${validation.errors.join(', ')}`);
    }

    // Update profile
    const updatedDeveloper = await this.developerRepository.update(developerId, {
      ...updates,
      metadata: {
        ...developer.metadata,
        lastActive: new Date()
      }
    });

    // Update verification status if needed
    if (this.requiresReverification(updates)) {
      await this.requestVerification(developerId);
    }

    return updatedDeveloper;
  }

  async requestPayout(developerId: string, payoutData: PayoutRequest): Promise<PayoutResult> {
    const developer = await this.developerRepository.findById(developerId);
    if (!developer) {
      throw new Error('Developer not found');
    }

    // Check earnings eligibility
    const earnings = await this.earningsService.getDeveloperEarnings(developerId);
    if (earnings.available < payoutData.amount) {
      throw new Error('Insufficient available earnings');
    }

    if (payoutData.amount < this.getMinimumPayoutAmount()) {
      throw new Error(`Minimum payout amount is ${this.getMinimumPayoutAmount()}`);
    }

    // Create payout request
    const payout = await this.earningsService.createPayoutRequest({
      developerId,
      amount: payoutData.amount,
      method: payoutData.method,
      details: payoutData.details,
      status: 'pending'
    });

    // Update earnings
    await this.earningsService.updateEarnings(developerId, {
      available: earnings.available - payoutData.amount,
      pending: earnings.pending + payoutData.amount
    });

    // Notify finance team
    await this.notifyPayoutRequest(payout);

    return {
      success: true,
      payout,
      message: 'Payout request submitted successfully'
    };
  }

  async submitThemeUpdate(themeId: string, updateData: ThemeUpdateData): Promise<UpdateResult> {
    const theme = await this.themeRepository.findById(themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }

    // Validate update
    const validation = await this.validateThemeUpdate(updateData);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
        message: 'Theme update validation failed'
      };
    }

    // Upload new package if provided
    let packageUrl = theme.assets.packageUrl;
    if (updateData.package) {
      const uploadResult = await this.uploadThemePackage(updateData.package, theme.developer.id);
      if (!uploadResult.success) {
        throw new Error('Failed to upload theme package');
      }
      packageUrl = uploadResult.url;
    }

    // Create update record
    const update = await this.createThemeUpdate({
      themeId,
      version: updateData.version,
      changelog: updateData.changelog,
      packageUrl,
      status: 'pending'
    });

    // Start review process if significant changes
    if (this.requiresReview(updateData)) {
      await this.moderationService.startReview(themeId, 'theme_update');
    } else {
      // Auto-approve minor updates
      await this.approveThemeUpdate(update.id);
    }

    return {
      success: true,
      update,
      message: 'Theme update submitted successfully'
    };
  }

  private async generateDeveloperInsights(developerId: string, analytics: any): Promise<DeveloperInsight[]> {
    const insights: DeveloperInsight[] = [];

    // Revenue insights
    if (analytics.revenue.trend < -10) {
      insights.push({
        type: 'revenue',
        severity: 'warning',
        title: 'Revenue Decline',
        description: `Revenue has decreased by ${Math.abs(analytics.revenue.trend).toFixed(1)}% this period`,
        recommendation: 'Consider updating themes or adjusting pricing strategy',
        impact: 'high'
      });
    }

    // Download insights
    if (analytics.downloads.trend > 50) {
      insights.push({
        type: 'performance',
        severity: 'success',
        title: 'Strong Download Growth',
        description: `Downloads increased by ${analytics.downloads.trend.toFixed(1)}% this period`,
        recommendation: 'Consider releasing similar themes to capitalize on this trend',
        impact: 'medium'
      });
    }

    // Review insights
    if (analytics.reviews.average < 4.0) {
      insights.push({
        type: 'quality',
        severity: 'warning',
        title: 'Review Score Needs Improvement',
        description: `Average rating is ${analytics.reviews.average.toFixed(1)}/5.0`,
        recommendation: 'Review recent feedback and address common issues',
        impact: 'high'
      });
    }

    // Popular theme insight
    const topTheme = analytics.downloads.byTheme[0];
    if (topTheme && topTheme.downloads > 100) {
      insights.push({
        type: 'opportunity',
        severity: 'info',
        title: 'Popular Theme Identified',
        description: `"${topTheme.name}" has ${topTheme.downloads} downloads this period`,
        recommendation: 'Consider creating variations or updates for this popular theme',
        impact: 'medium'
      });
    }

    return insights;
  }
}

interface DeveloperDashboard {
  developer: Developer;
  themes: DeveloperTheme[];
  analytics: DeveloperAnalytics;
  earnings: DeveloperEarnings;
  notifications: Notification[];
  quickStats: QuickStats;
}

interface DeveloperAnalytics {
  timeRange: DateRange;
  downloads: DownloadAnalytics;
  revenue: RevenueAnalytics;
  reviews: ReviewAnalytics;
  views: ViewAnalytics;
  insights: DeveloperInsight[];
}

interface DeveloperInsight {
  type: 'revenue' | 'performance' | 'quality' | 'opportunity';
  severity: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description: string;
  recommendation: string;
  impact: 'low' | 'medium' | 'high';
}

interface PayoutRequest {
  amount: number;
  method: 'paypal' | 'bank_transfer' | 'stripe';
  details: PaymentDetails;
}

interface ThemeUpdateData {
  version: string;
  changelog: string[];
  package?: File;
  screenshots?: File[];
  description?: string;
  tags?: string[];
  pricing?: Partial<ThemePricing>;
}
```

### **3. 🔍 Review & Rating System**

#### **Review Management:**
```typescript
export class ReviewManagementService {
  private reviewRepository: ReviewRepository;
  private moderationService: ModerationService;
  private notificationService: NotificationService;
  private analyticsService: ReviewAnalyticsService;

  async createReview(reviewData: CreateReviewData): Promise<Review> {
    // Validate review data
    const validation = await this.validateReview(reviewData);
    if (!validation.valid) {
      throw new Error(`Review validation failed: ${validation.errors.join(', ')}`);
    }

    // Check for duplicate reviews
    const existingReview = await this.reviewRepository.findByUserAndTheme(
      reviewData.userId, 
      reviewData.themeId
    );
    if (existingReview) {
      throw new Error('User has already reviewed this theme');
    }

    // Create review
    const review = await this.reviewRepository.create({
      ...reviewData,
      status: 'pending',
      helpful: 0,
      notHelpful: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Start moderation process
    await this.moderationService.moderateReview(review.id);
    
    // Update theme rating (will be finalized when approved)
    await this.updateThemeRating(reviewData.themeId);

    return review;
  }

  async moderateReview(reviewId: string, moderatorId: string, action: ModerationAction, reason?: string): Promise<void> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // Update review status
    await this.reviewRepository.update(reviewId, {
      status: action === 'approve' ? 'approved' : 'rejected',
      moderatedBy: moderatorId,
      moderatedAt: new Date(),
      moderationReason: reason
    });

    // Update theme rating if approved
    if (action === 'approve') {
      await this.updateThemeRating(review.themeId);
    }

    // Notify reviewer
    await this.notificationService.notifyUser(review.userId, {
      type: 'review_moderated',
      data: {
        reviewId,
        action,
        reason
      }
    });

    // Notify developer if approved
    if (action === 'approve') {
      const theme = await this.getTheme(review.themeId);
      if (theme) {
        await this.notificationService.notifyUser(theme.developer.id, {
          type: 'new_review',
          data: {
            themeId: review.themeId,
            reviewId,
            rating: review.rating
          }
        });
      }
    }
  }

  async getThemeReviews(themeId: string, options: ReviewQueryOptions = {}): Promise<ReviewsResult> {
    const query = {
      themeId,
      status: 'approved',
      ...options.filters
    };

    const reviews = await this.reviewRepository.findMany(query, {
      sort: options.sort || { createdAt: -1 },
      limit: options.limit || 10,
      offset: options.offset || 0
    });

    const totalCount = await this.reviewRepository.count(query);
    
    // Get review statistics
    const stats = await this.getReviewStats(themeId);

    return {
      reviews,
      total: totalCount,
      stats,
      pagination: {
        limit: options.limit || 10,
        offset: options.offset || 0,
        total: totalCount
      }
    };
  }

  async voteReview(reviewId: string, userId: string, vote: 'helpful' | 'not_helpful'): Promise<void> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // Check if user already voted
    const existingVote = await this.getReviewVote(reviewId, userId);
    if (existingVote) {
      // Update existing vote
      await this.updateReviewVote(reviewId, userId, vote);
    } else {
      // Create new vote
      await this.createReviewVote(reviewId, userId, vote);
    }

    // Update review vote counts
    await this.updateReviewVoteCounts(reviewId);
  }

  async replyToReview(reviewId: string, replyData: ReviewReplyData): Promise<ReviewReply> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // Validate reply permissions
    const canReply = await this.validateReplyPermission(replyData.userId, review);
    if (!canReply) {
      throw new Error('Insufficient permissions to reply to this review');
    }

    // Create reply
    const reply = await this.createReviewReply({
      reviewId,
      ...replyData,
      createdAt: new Date()
    });

    // Notify reviewer
    await this.notificationService.notifyUser(review.userId, {
      type: 'review_reply',
      data: {
        reviewId,
        replyId: reply.id,
        repliedBy: replyData.username
      }
    });

    return reply;
  }

  async getReviewAnalytics(themeId: string, timeRange: DateRange): Promise<ReviewAnalytics> {
    const reviews = await this.reviewRepository.findByThemeAndDateRange(themeId, timeRange);
    
    const analytics = {
      totalReviews: reviews.length,
      averageRating: this.calculateAverageRating(reviews),
      ratingDistribution: this.calculateRatingDistribution(reviews),
      sentiment: await this.analyzeSentiment(reviews),
      commonKeywords: await this.extractKeywords(reviews),
      trends: await this.calculateTrends(themeId, timeRange),
      topReviews: await this.getTopReviews(themeId),
      responseRate: await this.calculateResponseRate(themeId),
      helpfulnessScore: this.calculateHelpfulnessScore(reviews)
    };

    return analytics;
  }

  private async updateThemeRating(themeId: string): Promise<void> {
    const reviews = await this.reviewRepository.findByTheme(themeId, { status: 'approved' });
    
    const averageRating = this.calculateAverageRating(reviews);
    const ratingDistribution = this.calculateRatingDistribution(reviews);
    
    await this.updateTheme(themeId, {
      'ratings.average': averageRating,
      'ratings.count': reviews.length,
      'ratings.distribution': ratingDistribution,
      'metadata.averageRating': averageRating,
      'metadata.reviewCount': reviews.length
    });
  }

  private calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal
  }

  private calculateRatingDistribution(reviews: Review[]): { [rating: number]: number } {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    
    return distribution;
  }

  private async analyzeSentiment(reviews: Review[]): Promise<SentimentAnalysis> {
    // Implement sentiment analysis using AI/ML service
    const sentiments = await Promise.all(
      reviews.map(review => this.analyzeSingleReviewSentiment(review.content))
    );

    const positive = sentiments.filter(s => s === 'positive').length;
    const negative = sentiments.filter(s => s === 'negative').length;
    const neutral = sentiments.filter(s => s === 'neutral').length;

    return {
      positive: (positive / sentiments.length) * 100,
      negative: (negative / sentiments.length) * 100,
      neutral: (neutral / sentiments.length) * 100,
      overall: positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral'
    };
  }

  private async extractKeywords(reviews: Review[]): Promise<KeywordAnalysis[]> {
    // Implement keyword extraction
    const allText = reviews.map(r => `${r.title} ${r.content}`).join(' ');
    const keywords = await this.extractKeywordsFromText(allText);
    
    return keywords.map(keyword => ({
      word: keyword.word,
      frequency: keyword.frequency,
      sentiment: keyword.sentiment
    }));
  }
}

interface CreateReviewData {
  themeId: string;
  userId: string;
  username: string;
  avatar?: string;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
}

interface ReviewQueryOptions {
  filters?: {
    rating?: number;
    wouldRecommend?: boolean;
  };
  sort?: any;
  limit?: number;
  offset?: number;
}

interface ReviewsResult {
  reviews: Review[];
  total: number;
  stats: ReviewStats;
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

interface ReviewReplyData {
  userId: string;
  username: string;
  content: string;
  isOwner?: boolean;
  isDeveloper?: boolean;
}

interface SentimentAnalysis {
  positive: number;
  negative: number;
  neutral: number;
  overall: 'positive' | 'negative' | 'neutral';
}

interface KeywordAnalysis {
  word: string;
  frequency: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

type ModerationAction = 'approve' | 'reject';
```

---

## 🎨 **Marketplace Interface**

### **Theme Marketplace Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 🛒 Theme Marketplace                   [Upload] [Account] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Featured Themes ──────────────────────────────────┐   │
│ │ 📸 [Hero] Modern Business Pro ⭐ Editor's Choice   │   │
│ │ Professional business theme with advanced features │   │
│ │ By ThemeStudio • $49 • ⭐4.9 (234 reviews)        │   │
│ │ [Preview] [Buy Now]                                │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Categories ──────┐ ┌─ Themes ──────────────────────┐  │
│ │ 🏢 Business (156) │ │ ┌─ Modern Portfolio ─────────┐ │  │
│ │ 🛍️ E-commerce (89)│ │ │ 📸 [Thumbnail]             │ │  │
│ │ 📝 Blog (234)     │ │ │ Creative portfolio theme   │ │  │
│ │ 🎨 Portfolio (67) │ │ │ By DesignCorp              │ │  │
│ │ 📧 Landing (145)  │ │ │ FREE • ⭐4.7 (89 reviews) │ │  │
│ │ 🎓 Education (23) │ │ │ 📥 1,234 downloads         │ │  │
│ │ 🏥 Healthcare (34)│ │ │ [Preview] [Download]       │ │  │
│ │ 🍕 Restaurant (45)│ │ └─────────────────────────────┘ │  │
│ └───────────────────┘ │                               │  │
│                       │ ┌─ E-shop Pro ──────────────┐ │  │
│ ┌─ Filters ─────────┐ │ │ 📸 [Thumbnail]             │ │  │
│ │ Price:            │ │ │ Complete e-commerce theme  │ │  │
│ │ ☑ Free            │ │ │ By ShopDesign              │ │  │
│ │ ☑ Paid            │ │ │ $79 • ⭐4.8 (156 reviews) │ │  │
│ │                   │ │ │ 📥 2,456 downloads         │ │  │
│ │ Rating:           │ │ │ [Preview] [Buy Now]        │ │  │
│ │ ⭐⭐⭐⭐⭐ & up    │ │ └─────────────────────────────┘ │  │
│ │ ⭐⭐⭐⭐☆ & up    │ │                               │  │
│ │                   │ │ ┌─ Blog Master ─────────────┐ │  │
│ │ Features:         │ │ │ 📸 [Thumbnail]             │ │  │
│ │ ☑ Responsive      │ │ │ Advanced blogging platform │ │  │
│ │ ☑ SEO Ready       │ │ │ By BlogThemes              │ │  │
│ │ ☐ WooCommerce     │ │ │ $29 • ⭐4.6 (78 reviews)  │ │  │
│ │ ☐ Multilingual    │ │ │ 📥 567 downloads           │ │  │
│ │                   │ │ │ [Preview] [Buy Now]        │ │  │
│ │ [Clear Filters]   │ │ └─────────────────────────────┘ │  │
│ └───────────────────┘ └───────────────────────────────┘  │
│                                                         │
│ ┌─ Popular Searches ─────────────────────────────────┐   │
│ │ 🔍 responsive themes • business templates          │   │
│ │ 🔍 e-commerce • portfolio • blog themes            │   │
│ │ 🔍 landing page • restaurant • healthcare          │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Developer Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 👨‍💻 Developer Dashboard                [Upload Theme] [Settings] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Quick Stats ──────────────────────────────────────┐   │
│ │ 📊 Total Downloads: 15,234 (+12% this month)      │   │
│ │ 💰 Total Earnings: $3,456.78 (+$234 this month)   │   │
│ │ ⭐ Average Rating: 4.6/5.0 (234 reviews)          │   │
│ │ 🎨 Active Themes: 8 themes published              │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ My Themes ────────────────────────────────────────┐   │
│ │ ┌─ Modern Business Pro ──────────────────────────┐  │   │
│ │ │ Status: ✅ Published • Version: 2.1.4          │  │   │
│ │ │ Downloads: 3,456 • Revenue: $1,234.50         │  │   │
│ │ │ Rating: ⭐4.8 (89 reviews)                     │  │   │
│ │ │ [View] [Edit] [Analytics] [Update]             │  │   │
│ │ └─────────────────────────────────────────────────┘  │   │
│ │                                                   │   │
│ │ ┌─ Creative Portfolio ───────────────────────────┐  │   │
│ │ │ Status: 🔄 Under Review • Version: 1.2.0       │  │   │
│ │ │ Submitted: Dec 20, 2023                        │  │   │
│ │ │ Note: Minor design updates                     │  │   │
│ │ │ [View] [Edit] [Withdraw]                       │  │   │
│ │ └─────────────────────────────────────────────────┘  │   │
│ │                                                   │   │
│ │ ┌─ Blog Master ──────────────────────────────────┐  │   │
│ │ │ Status: ❌ Needs Attention • Version: 1.0.0    │  │   │
│ │ │ Issue: Responsive design improvements needed   │  │   │
│ │ │ Deadline: Dec 25, 2023                         │  │   │
│ │ │ [View] [Fix Issues] [Contact Support]          │  │   │
│ │ └─────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Analytics ────────────────────────────────────────┐   │
│ │ 📈 Downloads (Last 30 days)                       │   │
│ │ ┌─────────────────────────────────────────────────┐ │   │
│ │ │        ▄▄                                      │ │   │
│ │ │    ▄▄▄█  █▄▄                                   │ │   │
│ │ │ ▄▄█       █  █▄▄▄                             │ │   │
│ │ │█             █   ████▄▄                       │ │   │
│ │ │                     ██████▄▄▄                 │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ │ Peak: 156 downloads on Dec 15                     │   │
│ │                                                   │   │
│ │ 💰 Revenue Breakdown:                              │   │
│ │ • Modern Business Pro: $1,234.50 (78%)           │   │
│ │ • E-shop Starter: $567.80 (16%)                   │   │
│ │ • Blog Theme: $89.30 (6%)                         │   │
│ │                                                   │   │
│ │ [View Detailed Analytics] [Export Data]           │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Recent Activity ──────────────────────────────────┐   │
│ │ 🔔 New review on "Modern Business Pro" (⭐5)       │   │
│ │ 💰 Payout of $500 processed successfully          │   │
│ │ 📥 "Creative Portfolio" downloaded 23 times today │   │
│ │ ⚠️ "Blog Master" needs responsive fixes           │   │
│ │ 🎉 "E-shop Starter" reached 1000 downloads        │   │
│ │                                                   │   │
│ │ [View All Notifications]                          │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Marketplace browsing
GET    /api/marketplace/themes           // Browse themes
GET    /api/marketplace/themes/{id}      // Get theme details
GET    /api/marketplace/categories       // Get categories
GET    /api/marketplace/search           // Search themes
GET    /api/marketplace/featured         // Get featured themes

// Theme purchasing
POST   /api/marketplace/purchase         // Purchase theme
POST   /api/marketplace/download         // Download theme
GET    /api/marketplace/licenses/{key}   // Validate license

// Developer operations
POST   /api/developer/themes             // Submit theme
PUT    /api/developer/themes/{id}        // Update theme
GET    /api/developer/dashboard          // Get dashboard
GET    /api/developer/analytics          // Get analytics
POST   /api/developer/payout             // Request payout

// Review system
POST   /api/themes/{id}/reviews          // Create review
GET    /api/themes/{id}/reviews          // Get reviews
POST   /api/reviews/{id}/vote            // Vote on review
POST   /api/reviews/{id}/reply           // Reply to review
```

### **Database Schema:**
```sql
-- Marketplace themes
CREATE TABLE marketplace_themes (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  developer_id UUID REFERENCES developers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES theme_categories(id),
  tags TEXT[],
  version VARCHAR(50) NOT NULL,
  compatibility JSONB NOT NULL,
  pricing JSONB NOT NULL,
  assets JSONB NOT NULL,
  screenshots JSONB,
  demo_url VARCHAR(1000),
  download_url VARCHAR(1000),
  documentation JSONB,
  support JSONB,
  featured BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending',
  metadata JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Developers
CREATE TABLE developers (
  id UUID PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar VARCHAR(500),
  bio TEXT,
  website VARCHAR(500),
  social JSONB,
  verification JSONB,
  settings JSONB,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Theme purchases
CREATE TABLE theme_purchases (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES marketplace_themes(id) ON DELETE CASCADE,
  license_id VARCHAR(100) NOT NULL,
  payment_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  license_key VARCHAR(255) UNIQUE,
  status VARCHAR(20) DEFAULT 'active',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, theme_id)
);

-- Reviews
CREATE TABLE theme_reviews (
  id UUID PRIMARY KEY,
  theme_id UUID REFERENCES marketplace_themes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(100) NOT NULL,
  avatar VARCHAR(500),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  pros TEXT[],
  cons TEXT[],
  would_recommend BOOLEAN NOT NULL,
  helpful INTEGER DEFAULT 0,
  not_helpful INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  moderated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMP,
  moderation_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(theme_id, user_id)
);

-- Developer earnings
CREATE TABLE developer_earnings (
  id UUID PRIMARY KEY,
  developer_id UUID REFERENCES developers(id) ON DELETE CASCADE,
  total DECIMAL(12,2) DEFAULT 0,
  available DECIMAL(12,2) DEFAULT 0,
  pending DECIMAL(12,2) DEFAULT 0,
  paid DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_marketplace_themes_developer ON marketplace_themes(developer_id);
CREATE INDEX idx_marketplace_themes_category ON marketplace_themes(category_id);
CREATE INDEX idx_marketplace_themes_status ON marketplace_themes(status);
CREATE INDEX idx_marketplace_themes_featured ON marketplace_themes(featured);
CREATE INDEX idx_theme_purchases_user ON theme_purchases(user_id);
CREATE INDEX idx_theme_purchases_theme ON theme_purchases(theme_id);
CREATE INDEX idx_theme_reviews_theme ON theme_reviews(theme_id);
CREATE INDEX idx_theme_reviews_user ON theme_reviews(user_id);
CREATE INDEX idx_theme_reviews_status ON theme_reviews(status);
CREATE INDEX idx_developer_earnings_developer ON developer_earnings(developer_id);
```

---

## 🔗 **Related Documentation**

- **[Theme Management](./management.md)** - Theme installation dan management
- **[Theme Customizer](./customizer.md)** - Live theme customization
- **[Payment System](../07_system/)** - Payment processing integration
- **[User Management](../05_users/)** - Developer accounts dan permissions

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active

