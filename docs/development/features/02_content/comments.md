# 💬 Comments Management System

> **Interactive Community Engagement JA-CMS**  
> Advanced comment system dengan moderation, analytics, dan community features

---

## 📋 **Deskripsi**

Comments Management System menyediakan platform engagement yang comprehensive untuk membangun komunitas aktif. Sistem ini dilengkapi dengan moderation tools, spam detection, analytics, dan features untuk mendorong diskusi yang sehat dan produktif.

---

## ⭐ **Core Features**

### **1. 💬 Advanced Comment System**

#### **Comment Structure:**
```typescript
interface Comment {
  id: string;
  postId: string;
  parentId?: string; // for threaded comments
  author: {
    id?: string; // registered user
    name: string;
    email: string;
    website?: string;
    avatar?: string;
    isGuest: boolean;
  };
  content: string;
  status: 'pending' | 'approved' | 'spam' | 'trash';
  metadata: {
    ipAddress: string;
    userAgent: string;
    referrer?: string;
  };
  engagement: {
    likes: number;
    dislikes: number;
    reports: number;
    replies: number;
  };
  moderation: {
    moderatedBy?: string;
    moderatedAt?: Date;
    moderationReason?: string;
    spamScore: number;
    flagged: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  editedAt?: Date;
  depth: number; // nesting level
}

interface CommentThread {
  rootComment: Comment;
  replies: CommentThread[];
  totalReplies: number;
  depth: number;
  collapsed: boolean;
}

interface CommentSettings {
  enabled: boolean;
  requireApproval: boolean;
  allowGuests: boolean;
  requireRegistration: boolean;
  maxNestingLevel: number;
  autoCloseAfterDays?: number;
  enableVoting: boolean;
  enableReporting: boolean;
  enableEditing: boolean;
  editTimeLimit: number; // minutes
  spamProtection: {
    enabled: boolean;
    akismetKey?: string;
    customFilters: string[];
    rateLimiting: {
      maxCommentsPerHour: number;
      maxCommentsPerDay: number;
    };
  };
}
```

#### **Comment Management Service:**
```typescript
export class CommentService {
  private spamDetector: SpamDetectionService;
  private moderationQueue: ModerationQueueService;
  private notificationService: NotificationService;

  async createComment(commentData: CreateCommentData): Promise<Comment> {
    // Validate comment data
    const validation = await this.validateCommentData(commentData);
    if (!validation.valid) {
      throw new Error(`Invalid comment data: ${validation.errors.join(', ')}`);
    }

    // Check rate limiting
    await this.checkRateLimit(commentData.author.email, commentData.metadata.ipAddress);

    // Spam detection
    const spamScore = await this.spamDetector.analyzeComment(commentData);
    
    // Determine initial status
    const status = await this.determineCommentStatus(commentData, spamScore);

    // Create comment
    const comment = await this.prisma.comment.create({
      data: {
        postId: commentData.postId,
        parentId: commentData.parentId,
        authorName: commentData.author.name,
        authorEmail: commentData.author.email,
        authorWebsite: commentData.author.website,
        authorId: commentData.author.id,
        content: commentData.content,
        status,
        ipAddress: commentData.metadata.ipAddress,
        userAgent: commentData.metadata.userAgent,
        referrer: commentData.metadata.referrer,
        spamScore,
        depth: await this.calculateCommentDepth(commentData.parentId)
      },
      include: {
        author: true,
        parent: true,
        post: true
      }
    });

    // Handle moderation workflow
    if (status === 'pending') {
      await this.moderationQueue.addToQueue(comment);
    } else if (status === 'approved') {
      await this.handleApprovedComment(comment);
    }

    // Send notifications
    await this.sendCommentNotifications(comment);

    return comment;
  }

  async moderateComment(commentId: string, action: ModerationAction, moderatorId: string): Promise<Comment> {
    const comment = await this.getComment(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    const updatedComment = await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        status: action.status,
        moderatedBy: moderatorId,
        moderatedAt: new Date(),
        moderationReason: action.reason
      },
      include: {
        author: true,
        post: true
      }
    });

    // Handle post-moderation actions
    await this.handleModerationAction(updatedComment, action);

    // Log moderation activity
    await this.logModerationActivity(commentId, action, moderatorId);

    return updatedComment;
  }

  async getCommentsForPost(postId: string, options: CommentQueryOptions = {}): Promise<CommentThread[]> {
    const comments = await this.prisma.comment.findMany({
      where: {
        postId,
        status: options.includeModerated ? undefined : 'approved'
      },
      include: {
        author: true,
        _count: {
          select: { replies: true }
        }
      },
      orderBy: options.sortBy === 'newest' ? { createdAt: 'desc' } : { createdAt: 'asc' }
    });

    return this.buildCommentThreads(comments);
  }

  async voteOnComment(commentId: string, userId: string, vote: 'like' | 'dislike'): Promise<CommentVoteResult> {
    // Check if user already voted
    const existingVote = await this.prisma.commentVote.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId
        }
      }
    });

    if (existingVote) {
      if (existingVote.type === vote) {
        // Remove vote if same type
        await this.prisma.commentVote.delete({
          where: { id: existingVote.id }
        });
        await this.updateCommentVoteCount(commentId, vote, -1);
        return { action: 'removed', vote };
      } else {
        // Change vote type
        await this.prisma.commentVote.update({
          where: { id: existingVote.id },
          data: { type: vote }
        });
        await this.updateCommentVoteCount(commentId, existingVote.type, -1);
        await this.updateCommentVoteCount(commentId, vote, 1);
        return { action: 'changed', vote, previousVote: existingVote.type };
      }
    } else {
      // Create new vote
      await this.prisma.commentVote.create({
        data: {
          commentId,
          userId,
          type: vote
        }
      });
      await this.updateCommentVoteCount(commentId, vote, 1);
      return { action: 'added', vote };
    }
  }

  async reportComment(commentId: string, reportData: CommentReportData): Promise<void> {
    // Create report
    await this.prisma.commentReport.create({
      data: {
        commentId,
        reporterId: reportData.reporterId,
        reason: reportData.reason,
        description: reportData.description,
        ipAddress: reportData.ipAddress
      }
    });

    // Update comment report count
    await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        reportCount: {
          increment: 1
        }
      }
    });

    // Check if comment needs automatic action
    const comment = await this.getComment(commentId);
    if (comment && comment.reportCount >= 5) {
      await this.moderationQueue.addToQueue(comment, 'high_priority');
    }

    // Notify moderators
    await this.notificationService.notifyModerators('comment_reported', {
      commentId,
      reason: reportData.reason,
      reportCount: comment?.reportCount
    });
  }

  private async determineCommentStatus(commentData: CreateCommentData, spamScore: number): Promise<CommentStatus> {
    const settings = await this.getCommentSettings(commentData.postId);

    // Auto-reject high spam score
    if (spamScore > 0.8) {
      return 'spam';
    }

    // Require approval for guests if setting enabled
    if (settings.requireApproval && commentData.author.isGuest) {
      return 'pending';
    }

    // Require approval for new users
    if (commentData.author.id) {
      const user = await this.getUserById(commentData.author.id);
      if (user && user.commentCount < 3) {
        return 'pending';
      }
    }

    // Auto-approve trusted users
    return 'approved';
  }

  private buildCommentThreads(comments: Comment[]): CommentThread[] {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create comment map and identify root comments
    for (const comment of comments) {
      commentMap.set(comment.id, comment);
      if (!comment.parentId) {
        rootComments.push(comment);
      }
    }

    // Second pass: build threads
    return rootComments.map(rootComment => 
      this.buildCommentThread(rootComment, commentMap)
    );
  }

  private buildCommentThread(comment: Comment, commentMap: Map<string, Comment>): CommentThread {
    const replies: CommentThread[] = [];
    let totalReplies = 0;

    // Find direct replies
    for (const [id, potentialReply] of commentMap.entries()) {
      if (potentialReply.parentId === comment.id) {
        const replyThread = this.buildCommentThread(potentialReply, commentMap);
        replies.push(replyThread);
        totalReplies += 1 + replyThread.totalReplies;
      }
    }

    return {
      rootComment: comment,
      replies,
      totalReplies,
      depth: comment.depth,
      collapsed: comment.depth > 3 // Auto-collapse deep threads
    };
  }
}

interface CreateCommentData {
  postId: string;
  parentId?: string;
  author: {
    id?: string;
    name: string;
    email: string;
    website?: string;
    isGuest: boolean;
  };
  content: string;
  metadata: {
    ipAddress: string;
    userAgent: string;
    referrer?: string;
  };
}

interface ModerationAction {
  status: 'approved' | 'spam' | 'trash';
  reason?: string;
  notifyAuthor?: boolean;
}

interface CommentVoteResult {
  action: 'added' | 'removed' | 'changed';
  vote: 'like' | 'dislike';
  previousVote?: 'like' | 'dislike';
}

type CommentStatus = 'pending' | 'approved' | 'spam' | 'trash';
```

### **2. 🛡️ Advanced Spam Detection**

#### **AI-Powered Spam Protection:**
```typescript
export class SpamDetectionService {
  private mlModel: SpamClassifierModel;
  private akismetService: AkismetService;
  private patternMatcher: PatternMatcher;

  async analyzeComment(commentData: CreateCommentData): Promise<number> {
    let spamScore = 0;
    const factors: SpamFactor[] = [];

    // Akismet API check
    if (this.akismetService.isEnabled()) {
      const akismetResult = await this.akismetService.checkComment({
        content: commentData.content,
        author: commentData.author.name,
        email: commentData.author.email,
        url: commentData.author.website,
        userAgent: commentData.metadata.userAgent,
        referrer: commentData.metadata.referrer
      });

      if (akismetResult.isSpam) {
        spamScore += 0.7;
        factors.push({
          type: 'akismet',
          score: 0.7,
          description: 'Flagged by Akismet'
        });
      }
    }

    // ML model prediction
    const mlPrediction = await this.mlModel.predict({
      content: commentData.content,
      authorName: commentData.author.name,
      email: commentData.author.email,
      ipAddress: commentData.metadata.ipAddress,
      userAgent: commentData.metadata.userAgent
    });

    spamScore += mlPrediction.spamProbability * 0.5;
    factors.push({
      type: 'ml_model',
      score: mlPrediction.spamProbability * 0.5,
      description: `ML model confidence: ${(mlPrediction.spamProbability * 100).toFixed(1)}%`
    });

    // Pattern matching
    const patternScore = await this.patternMatcher.analyze(commentData.content);
    spamScore += patternScore * 0.3;
    if (patternScore > 0) {
      factors.push({
        type: 'pattern_match',
        score: patternScore * 0.3,
        description: 'Matched spam patterns'
      });
    }

    // Rate limiting check
    const rateLimitScore = await this.checkRateLimitViolation(
      commentData.author.email,
      commentData.metadata.ipAddress
    );
    spamScore += rateLimitScore * 0.2;
    if (rateLimitScore > 0) {
      factors.push({
        type: 'rate_limit',
        score: rateLimitScore * 0.2,
        description: 'Rate limit violation detected'
      });
    }

    // URL density check
    const urlDensity = this.calculateUrlDensity(commentData.content);
    if (urlDensity > 0.1) {
      const urlScore = Math.min(urlDensity * 2, 0.5);
      spamScore += urlScore;
      factors.push({
        type: 'url_density',
        score: urlScore,
        description: `High URL density: ${(urlDensity * 100).toFixed(1)}%`
      });
    }

    // Content quality analysis
    const qualityScore = await this.analyzeContentQuality(commentData.content);
    if (qualityScore < 0.3) {
      const penalty = (0.3 - qualityScore) * 0.4;
      spamScore += penalty;
      factors.push({
        type: 'low_quality',
        score: penalty,
        description: 'Low content quality detected'
      });
    }

    // Log spam analysis
    await this.logSpamAnalysis(commentData, spamScore, factors);

    return Math.min(spamScore, 1); // Cap at 1.0
  }

  async trainSpamModel(trainingData: SpamTrainingData[]): Promise<ModelTrainingResult> {
    console.log(`Training spam model with ${trainingData.length} samples...`);

    // Prepare features
    const features = await this.extractSpamFeatures(trainingData);

    // Train model
    const model = await this.mlModel.train(features);

    // Evaluate performance
    const evaluation = await this.evaluateSpamModel(model, trainingData);

    // Save model
    await this.saveSpamModel(model);

    return {
      accuracy: evaluation.accuracy,
      precision: evaluation.precision,
      recall: evaluation.recall,
      f1Score: evaluation.f1Score,
      falsePositiveRate: evaluation.falsePositiveRate,
      trainingTime: evaluation.trainingTime
    };
  }

  async updateSpamPatterns(): Promise<void> {
    // Get recent spam comments for pattern analysis
    const recentSpam = await this.getRecentSpamComments(30); // Last 30 days

    // Extract common patterns
    const patterns = await this.extractSpamPatterns(recentSpam);

    // Update pattern database
    await this.updatePatternDatabase(patterns);

    console.log(`Updated spam patterns: ${patterns.length} new patterns added`);
  }

  private calculateUrlDensity(content: string): number {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex) || [];
    const totalLength = content.length;
    const urlLength = urls.reduce((sum, url) => sum + url.length, 0);
    
    return totalLength > 0 ? urlLength / totalLength : 0;
  }

  private async analyzeContentQuality(content: string): Promise<number> {
    let qualityScore = 0.5; // Start with neutral score

    // Length analysis
    if (content.length < 10) {
      qualityScore -= 0.3;
    } else if (content.length > 100) {
      qualityScore += 0.2;
    }

    // Grammar and spelling check
    const grammarScore = await this.checkGrammar(content);
    qualityScore += grammarScore * 0.3;

    // Coherence analysis
    const coherenceScore = await this.analyzeCoherence(content);
    qualityScore += coherenceScore * 0.2;

    // Repetition detection
    const repetitionScore = this.detectRepetition(content);
    qualityScore -= repetitionScore * 0.3;

    // Capitalization analysis
    const capsScore = this.analyzeCaps(content);
    qualityScore -= capsScore * 0.2;

    return Math.max(0, Math.min(1, qualityScore));
  }

  private detectRepetition(content: string): number {
    const words = content.toLowerCase().split(/\s+/);
    const wordCount = new Map<string, number>();
    
    for (const word of words) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }

    let repetitionScore = 0;
    for (const [word, count] of wordCount.entries()) {
      if (word.length > 3 && count > 3) {
        repetitionScore += (count - 3) * 0.1;
      }
    }

    return Math.min(repetitionScore, 1);
  }

  private analyzeCaps(content: string): number {
    const uppercaseChars = (content.match(/[A-Z]/g) || []).length;
    const totalChars = content.replace(/\s/g, '').length;
    
    if (totalChars === 0) return 0;
    
    const capsRatio = uppercaseChars / totalChars;
    
    // Penalize excessive caps
    if (capsRatio > 0.5) {
      return (capsRatio - 0.5) * 2;
    }
    
    return 0;
  }
}

interface SpamFactor {
  type: 'akismet' | 'ml_model' | 'pattern_match' | 'rate_limit' | 'url_density' | 'low_quality';
  score: number;
  description: string;
}

interface SpamTrainingData {
  content: string;
  authorName: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  isSpam: boolean;
  features?: Record<string, number>;
}

interface ModelTrainingResult {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
  trainingTime: number;
}
```

### **3. 📊 Comment Analytics & Insights**

#### **Engagement Analytics:**
```typescript
export class CommentAnalyticsService {
  async getCommentAnalytics(postId?: string, timeRange?: DateRange): Promise<CommentAnalytics> {
    const baseQuery = postId ? { postId } : {};
    const dateFilter = timeRange ? {
      createdAt: {
        gte: timeRange.start,
        lte: timeRange.end
      }
    } : {};

    const comments = await this.prisma.comment.findMany({
      where: { ...baseQuery, ...dateFilter },
      include: {
        author: true,
        post: true,
        _count: {
          select: { replies: true }
        }
      }
    });

    const analytics = await this.calculateCommentMetrics(comments);
    const trends = await this.calculateCommentTrends(comments, timeRange);
    const topCommenters = await this.getTopCommenters(comments);
    const engagement = await this.calculateEngagementMetrics(comments);

    return {
      overview: analytics,
      trends,
      topCommenters,
      engagement,
      moderation: await this.getModerationMetrics(timeRange),
      sentiment: await this.analyzeSentiment(comments)
    };
  }

  async getCommentEngagementReport(timeRange: DateRange): Promise<CommentEngagementReport> {
    const comments = await this.getCommentsInRange(timeRange);
    const previousPeriod = this.getPreviousPeriod(timeRange);
    const previousComments = await this.getCommentsInRange(previousPeriod);

    return {
      current: {
        totalComments: comments.length,
        averageCommentsPerPost: await this.calculateAverageCommentsPerPost(comments),
        engagementRate: await this.calculateCommentEngagementRate(comments),
        responseRate: await this.calculateResponseRate(comments),
        averageResponseTime: await this.calculateAverageResponseTime(comments)
      },
      previous: {
        totalComments: previousComments.length,
        averageCommentsPerPost: await this.calculateAverageCommentsPerPost(previousComments),
        engagementRate: await this.calculateCommentEngagementRate(previousComments),
        responseRate: await this.calculateResponseRate(previousComments),
        averageResponseTime: await this.calculateAverageResponseTime(previousComments)
      },
      trends: {
        commentsGrowth: this.calculateGrowthRate(comments.length, previousComments.length),
        engagementGrowth: await this.calculateEngagementGrowth(comments, previousComments),
        qualityTrend: await this.calculateQualityTrend(comments, previousComments)
      },
      insights: await this.generateEngagementInsights(comments),
      recommendations: await this.generateEngagementRecommendations(comments)
    };
  }

  async analyzeSentiment(comments: Comment[]): Promise<SentimentAnalysis> {
    const sentimentResults: SentimentResult[] = [];

    for (const comment of comments) {
      const sentiment = await this.nlpService.analyzeSentiment(comment.content);
      sentimentResults.push({
        commentId: comment.id,
        sentiment: sentiment.label,
        confidence: sentiment.confidence,
        emotions: sentiment.emotions
      });
    }

    const positive = sentimentResults.filter(s => s.sentiment === 'positive').length;
    const negative = sentimentResults.filter(s => s.sentiment === 'negative').length;
    const neutral = sentimentResults.filter(s => s.sentiment === 'neutral').length;

    return {
      overview: {
        positive: (positive / comments.length) * 100,
        negative: (negative / comments.length) * 100,
        neutral: (neutral / comments.length) * 100,
        overallSentiment: this.calculateOverallSentiment(sentimentResults)
      },
      trends: await this.calculateSentimentTrends(sentimentResults),
      topPositiveComments: await this.getTopCommentsBySentiment(sentimentResults, 'positive', 5),
      topNegativeComments: await this.getTopCommentsBySentiment(sentimentResults, 'negative', 5),
      emotionalBreakdown: this.calculateEmotionalBreakdown(sentimentResults)
    };
  }

  async generateCommentInsights(postId: string): Promise<CommentInsights> {
    const comments = await this.getPostComments(postId);
    const analytics = await this.getCommentAnalytics(postId);

    return {
      postId,
      summary: {
        totalComments: comments.length,
        engagementScore: this.calculateEngagementScore(comments),
        communityHealth: this.assessCommunityHealth(comments),
        moderationWorkload: analytics.moderation.pendingCount
      },
      patterns: {
        peakCommentingTimes: await this.identifyPeakCommentingTimes(comments),
        commonTopics: await this.extractCommonTopics(comments),
        userBehaviorPatterns: await this.analyzeUserBehaviorPatterns(comments)
      },
      quality: {
        averageCommentLength: this.calculateAverageLength(comments),
        readabilityScore: await this.calculateReadabilityScore(comments),
        constructivenessScore: await this.assessConstructiveness(comments)
      },
      recommendations: {
        engagementStrategies: await this.suggestEngagementStrategies(analytics),
        moderationPriorities: await this.identifyModerationPriorities(comments),
        communityGuidelines: await this.suggestCommunityGuidelines(analytics)
      }
    };
  }

  private async calculateCommentMetrics(comments: Comment[]): Promise<CommentMetrics> {
    const approved = comments.filter(c => c.status === 'approved');
    const pending = comments.filter(c => c.status === 'pending');
    const spam = comments.filter(c => c.status === 'spam');

    return {
      total: comments.length,
      approved: approved.length,
      pending: pending.length,
      spam: spam.length,
      approvalRate: comments.length > 0 ? (approved.length / comments.length) * 100 : 0,
      averageLength: comments.reduce((sum, c) => sum + c.content.length, 0) / comments.length,
      threaded: comments.filter(c => c.parentId).length,
      threadingRate: comments.length > 0 ? (comments.filter(c => c.parentId).length / comments.length) * 100 : 0
    };
  }

  private calculateEngagementScore(comments: Comment[]): number {
    if (comments.length === 0) return 0;

    let score = 0;
    
    // Base score from comment count (normalized)
    score += Math.min(comments.length / 50, 1) * 30;
    
    // Threading bonus
    const threadedComments = comments.filter(c => c.parentId).length;
    score += (threadedComments / comments.length) * 25;
    
    // Response rate bonus
    const responses = comments.filter(c => c.parentId).length;
    const rootComments = comments.filter(c => !c.parentId).length;
    if (rootComments > 0) {
      score += (responses / rootComments) * 20;
    }
    
    // Quality bonus (based on average length)
    const avgLength = comments.reduce((sum, c) => sum + c.content.length, 0) / comments.length;
    score += Math.min(avgLength / 200, 1) * 15;
    
    // Diversity bonus (unique commenters)
    const uniqueCommenters = new Set(comments.map(c => c.authorEmail)).size;
    score += (uniqueCommenters / comments.length) * 10;

    return Math.round(score);
  }

  private assessCommunityHealth(comments: Comment[]): 'excellent' | 'good' | 'fair' | 'poor' {
    const spamRate = comments.filter(c => c.status === 'spam').length / comments.length;
    const reportRate = comments.reduce((sum, c) => sum + c.reportCount, 0) / comments.length;
    const engagementScore = this.calculateEngagementScore(comments);

    if (spamRate < 0.05 && reportRate < 0.1 && engagementScore > 70) {
      return 'excellent';
    } else if (spamRate < 0.1 && reportRate < 0.2 && engagementScore > 50) {
      return 'good';
    } else if (spamRate < 0.2 && reportRate < 0.3 && engagementScore > 30) {
      return 'fair';
    } else {
      return 'poor';
    }
  }
}

interface CommentAnalytics {
  overview: CommentMetrics;
  trends: CommentTrends;
  topCommenters: TopCommenter[];
  engagement: EngagementMetrics;
  moderation: ModerationMetrics;
  sentiment: SentimentAnalysis;
}

interface CommentEngagementReport {
  current: EngagementMetrics;
  previous: EngagementMetrics;
  trends: {
    commentsGrowth: number;
    engagementGrowth: number;
    qualityTrend: number;
  };
  insights: EngagementInsight[];
  recommendations: EngagementRecommendation[];
}

interface CommentInsights {
  postId: string;
  summary: {
    totalComments: number;
    engagementScore: number;
    communityHealth: 'excellent' | 'good' | 'fair' | 'poor';
    moderationWorkload: number;
  };
  patterns: {
    peakCommentingTimes: TimePattern[];
    commonTopics: TopicData[];
    userBehaviorPatterns: BehaviorPattern[];
  };
  quality: {
    averageCommentLength: number;
    readabilityScore: number;
    constructivenessScore: number;
  };
  recommendations: {
    engagementStrategies: string[];
    moderationPriorities: string[];
    communityGuidelines: string[];
  };
}
```

---

## 🎨 **Comments Management Interface**

### **Comment Moderation Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 💬 Comment Moderation              [Auto-Approve] [Settings] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Moderation Queue ─────────────────────────────────┐   │
│ │ 📋 Pending (23) | 🚨 Reported (5) | 🗑️ Spam (12)   │   │
│ │                                                   │   │
│ │ ⚠️ High Priority:                                  │   │
│ │ ┌─────────────────────────────────────────────────┐ │   │
│ │ │ 👤 John Doe • 2 hours ago • Spam Score: 0.8    │ │   │
│ │ │ "Check out this amazing deal at..."             │ │   │
│ │ │ 📍 Post: "Getting Started with React"          │ │   │
│ │ │ [Approve] [Spam] [Trash] [View Full]           │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ │                                                   │   │
│ │ 📊 Normal Priority:                               │   │
│ │ ┌─────────────────────────────────────────────────┐ │   │
│ │ │ 👤 Jane Smith • 4 hours ago • Spam Score: 0.3  │ │   │
│ │ │ "Thanks for this tutorial! Really helpful..."   │ │   │
│ │ │ 📍 Post: "Advanced JavaScript Tips"            │ │   │
│ │ │ [Approve] [Spam] [Trash] [View Full]           │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Quick Stats ──────────────────────────────────────┐   │
│ │ 📈 Today: 45 comments (↗️ +12%)                    │   │
│ │ ✅ Approved: 38 (84.4%)                           │   │
│ │ ⏳ Pending: 5 (11.1%)                             │   │
│ │ 🚫 Spam: 2 (4.4%)                                 │   │
│ │ ⚡ Avg Response Time: 2.3 hours                    │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Comment Analytics Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Comment Analytics                    [Export] [Settings] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Engagement Overview ──────────────────────────────┐   │
│ │ 💬 Total Comments: 1,234 (+15.2% vs last month)   │   │
│ │ 👥 Unique Commenters: 456 (+8.7%)                 │   │
│ │ 🔄 Response Rate: 68.3% (+5.1%)                   │   │
│ │ ⏱️ Avg Response Time: 3.2 hours (-12.5%)           │   │
│ │ 📊 Engagement Score: 78/100 (+6 points)           │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Comment Trends ───────────────────────────────────┐   │
│ │ Comments ┌─────────────────────────────────────────┐  │   │
│ │    50    │               ╭─╮                       │  │   │
│ │    40    │             ╭─╯ ╰─╮                     │  │   │
│ │    30    │           ╭─╯     ╰─╮                   │  │   │
│ │    20    │         ╭─╯         ╰─╮                 │  │   │
│ │    10    │       ╭─╯             ╰─╮               │  │   │
│ │     0    └─────────────────────────────────────────┘  │   │
│ │          Jan 1    Jan 15    Jan 30                    │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Sentiment Analysis ───┐ ┌─ Top Commenters ──────────┐ │
│ │ 😊 Positive: 65.2%     │ │ 1. Sarah Wilson (23)      │ │
│ │ 😐 Neutral: 28.1%      │ │ 2. Mike Johnson (19)      │ │
│ │ 😞 Negative: 6.7%      │ │ 3. Alex Chen (15)         │ │
│ │                        │ │ 4. Emma Davis (12)        │ │
│ │ Overall: Very Positive │ │ 5. Tom Brown (11)         │ │
│ │ Community Health: Good │ │                           │ │
│ └────────────────────────┘ └───────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Comment management
GET    /api/comments                       // List comments
POST   /api/comments                       // Create comment
GET    /api/comments/{id}                  // Get comment
PUT    /api/comments/{id}                  // Update comment
DELETE /api/comments/{id}                  // Delete comment

// Post comments
GET    /api/posts/{id}/comments            // Get post comments
POST   /api/posts/{id}/comments            // Add comment to post

// Comment moderation
GET    /api/comments/moderation/queue      // Moderation queue
POST   /api/comments/{id}/moderate         // Moderate comment
POST   /api/comments/bulk-moderate         // Bulk moderation

// Comment engagement
POST   /api/comments/{id}/vote             // Vote on comment
POST   /api/comments/{id}/report           // Report comment
GET    /api/comments/{id}/replies          // Get comment replies

// Comment analytics
GET    /api/comments/analytics             // Comment analytics
GET    /api/comments/sentiment             // Sentiment analysis
GET    /api/comments/engagement            // Engagement metrics
```

### **Database Schema:**
```sql
-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  author_website VARCHAR(500),
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  spam_score DECIMAL(3,2) DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  dislike_count INTEGER DEFAULT 0,
  depth INTEGER DEFAULT 0,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMP,
  moderation_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  edited_at TIMESTAMP
);

-- Comment votes
CREATE TABLE comment_votes (
  id UUID PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('like', 'dislike')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Comment reports
CREATE TABLE comment_reports (
  id UUID PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reason VARCHAR(50) NOT NULL,
  description TEXT,
  ip_address INET,
  status VARCHAR(20) DEFAULT 'pending',
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comment analytics
CREATE TABLE comment_analytics (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  comment_count INTEGER DEFAULT 0,
  approved_count INTEGER DEFAULT 0,
  spam_count INTEGER DEFAULT 0,
  average_length DECIMAL(8,2) DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0,
  sentiment_positive DECIMAL(5,2) DEFAULT 0,
  sentiment_negative DECIMAL(5,2) DEFAULT 0,
  sentiment_neutral DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, date)
);

-- Spam detection log
CREATE TABLE spam_detection_log (
  id UUID PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  spam_score DECIMAL(3,2) NOT NULL,
  factors JSONB,
  model_version VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_author_email ON comments(author_email);
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_comment_votes_comment ON comment_votes(comment_id);
CREATE INDEX idx_comment_reports_comment ON comment_reports(comment_id);
CREATE INDEX idx_comment_analytics_post_date ON comment_analytics(post_id, date);
```

---

## 🔗 **Related Documentation**

- **[Content Posts](./posts.md)** - Post and comment integration
- **[User Management](../05_users/)** - Comment author management
- **[Content Analytics](../01_analytics/content-analytics.md)** - Comment engagement analytics
- **[Security Monitoring](../06_security/monitoring.md)** - Spam detection and security

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
