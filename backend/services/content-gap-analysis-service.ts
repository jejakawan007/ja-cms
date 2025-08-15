import { PrismaClient } from '@prisma/client';
import * as stats from 'simple-statistics';

const prisma = new PrismaClient();

export interface ContentGapData {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  competition: number;
  existingContent: number;
  opportunity: number;
  recommendedType: string;
  priority: string;
  estimatedTraffic: number;
  estimatedRevenue: number;
}

export interface ContentGapRecommendation {
  title: string;
  description: string;
  contentType: string;
  targetKeywords: string[];
  estimatedWordCount: number;
  estimatedTime: number;
  priority: string;
}

export interface GapAnalysisResult {
  gaps: ContentGapData[];
  recommendations: ContentGapRecommendation[];
  summary: {
    totalOpportunities: number;
    averageDifficulty: number;
    totalEstimatedTraffic: number;
    totalEstimatedRevenue: number;
    topCategories: Array<{ category: string; opportunities: number }>;
  };
}

export class ContentGapAnalysisService {
  /**
   * Analyze content gaps for a specific category
   */
  async analyzeCategoryGaps(categoryId: string, userId: string): Promise<GapAnalysisResult> {
    try {
      // Get existing content in the category
      const existingContent = await this.getExistingContent(categoryId);
      
      // Get competitor analysis
      const competitorData = await this.getCompetitorAnalysis(categoryId);
      
      // Generate keyword opportunities
      const keywordOpportunities = await this.generateKeywordOpportunities(categoryId, existingContent);
      
      // Analyze gaps
      const gaps = await this.analyzeGaps(keywordOpportunities, existingContent, competitorData);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(gaps, categoryId);
      
      // Calculate summary
      const summary = this.calculateSummary(gaps, categoryId);
      
      // Store analysis results
      await this.storeAnalysisResults(gaps, categoryId, userId);
      
      return {
        gaps,
        recommendations,
        summary
      };
    } catch (error) {
      console.error('Error analyzing content gaps:', error);
      throw new Error('Failed to analyze content gaps');
    }
  }

  /**
   * Get existing content in a category
   */
  private async getExistingContent(categoryId: string) {
    const posts = await prisma.post.findMany({
      where: { categoryId },
      select: {
        id: true,
        title: true,
        content: true,
        metaKeywords: true,
        publishedAt: true,
        views: {
          select: { viewedAt: true }
        }
      }
    });

    return posts.map(post => ({
      id: post.id,
      title: post.title,
      keywords: this.extractKeywords(post.title + ' ' + post.content),
      publishedAt: post.publishedAt,
      viewCount: post.views.length,
      metaKeywords: post.metaKeywords ? post.metaKeywords.split(',').map(k => k.trim()) : []
    }));
  }

  /**
   * Get competitor analysis data
   */
  private async getCompetitorAnalysis(_categoryId: string) {
    // Simulate competitor data (in real implementation, this would come from SEO APIs)
    const competitors = [
      { domain: 'competitor1.com', contentCount: 150, avgRanking: 8.5 },
      { domain: 'competitor2.com', contentCount: 89, avgRanking: 7.2 },
      { domain: 'competitor3.com', contentCount: 234, avgRanking: 9.1 }
    ];

    return {
      competitors,
      averageContentCount: stats.mean(competitors.map(c => c.contentCount)),
      averageRanking: stats.mean(competitors.map(c => c.avgRanking)),
      totalCompetition: competitors.reduce((sum, c) => sum + c.contentCount, 0)
    };
  }

  /**
   * Generate keyword opportunities
   */
  private async generateKeywordOpportunities(categoryId: string, existingContent: any[]) {
    // Get category info
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Generate keyword variations based on category
    const baseKeywords = this.generateBaseKeywords(category.name);
    const longTailKeywords = this.generateLongTailKeywords(baseKeywords);
    
    // Combine and analyze
    const allKeywords = [...baseKeywords, ...longTailKeywords];
    
    return allKeywords.map(keyword => ({
      keyword,
      searchVolume: this.estimateSearchVolume(keyword),
      difficulty: this.calculateDifficulty(keyword, existingContent),
      competition: this.estimateCompetition(keyword),
      existingContent: this.countExistingContent(keyword, existingContent)
    }));
  }

  /**
   * Generate base keywords from category name
   */
  private generateBaseKeywords(categoryName: string): string[] {
    const variations = [
      categoryName,
      `${categoryName} guide`,
      `${categoryName} tutorial`,
      `${categoryName} tips`,
      `${categoryName} best practices`,
      `how to ${categoryName}`,
      `${categoryName} examples`,
      `${categoryName} for beginners`
    ];

    return variations;
  }

  /**
   * Generate long-tail keywords
   */
  private generateLongTailKeywords(baseKeywords: string[]): string[] {
    const modifiers = [
      '2024', 'latest', 'complete', 'comprehensive', 'ultimate',
      'step by step', 'detailed', 'advanced', 'professional',
      'free', 'online', 'digital', 'modern', 'effective'
    ];

    const longTail: string[] = [];
    
    baseKeywords.forEach(base => {
      modifiers.forEach(modifier => {
        longTail.push(`${base} ${modifier}`);
      });
    });

    return longTail.slice(0, 50); // Limit to top 50
  }

  /**
   * Estimate search volume for a keyword
   */
  private estimateSearchVolume(keyword: string): number {
    // Simulate search volume estimation
    const baseVolume = Math.random() * 10000;
    const wordCount = keyword.split(' ').length;
    
    // Long-tail keywords typically have lower volume
    if (wordCount > 3) {
      return Math.floor(baseVolume * 0.3);
    } else if (wordCount > 2) {
      return Math.floor(baseVolume * 0.6);
    }
    
    return Math.floor(baseVolume);
  }

  /**
   * Calculate keyword difficulty
   */
  private calculateDifficulty(keyword: string, existingContent: any[]): number {
    const wordCount = keyword.split(' ').length;
    const existingMatches = existingContent.filter(content => 
      content.keywords.some((k: string) => 
        k.toLowerCase().includes(keyword.toLowerCase())
      )
    ).length;

    // Base difficulty increases with word count and existing content
    let difficulty = (wordCount * 10) + (existingMatches * 15);
    
    // Normalize to 0-100 scale
    difficulty = Math.min(100, Math.max(0, difficulty));
    
    return Math.round(difficulty);
  }

  /**
   * Estimate competition for a keyword
   */
  private estimateCompetition(keyword: string): number {
    // Simulate competition estimation
    const baseCompetition = Math.random() * 100;
    const wordCount = keyword.split(' ').length;
    
    // More specific keywords have lower competition
    if (wordCount > 3) {
      return Math.floor(baseCompetition * 0.4);
    } else if (wordCount > 2) {
      return Math.floor(baseCompetition * 0.7);
    }
    
    return Math.floor(baseCompetition);
  }

  /**
   * Count existing content for a keyword
   */
  private countExistingContent(keyword: string, existingContent: any[]): number {
    return existingContent.filter(content => 
      content.keywords.some((k: string) => 
        k.toLowerCase().includes(keyword.toLowerCase())
      ) ||
      content.title.toLowerCase().includes(keyword.toLowerCase())
    ).length;
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));
    
    // Get unique words and count frequency
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Return top keywords by frequency
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  }

  /**
   * Check if word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
      'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
      'might', 'can', 'this', 'that', 'these', 'those', 'a', 'an', 'as'
    ];
    
    return stopWords.includes(word);
  }

  /**
   * Analyze gaps and calculate opportunities
   */
  private async analyzeGaps(keywordOpportunities: any[], _existingContent: any[], competitorData: any): Promise<ContentGapData[]> {
    return keywordOpportunities.map(keywordOpportunity => {
      const opportunity = this.calculateOpportunity(keywordOpportunity, competitorData);
      const recommendedType = this.determineContentType(keywordOpportunity.keyword, keywordOpportunity.searchVolume);
      const priority = this.determinePriority(opportunity, keywordOpportunity.difficulty);
      const estimatedTraffic = this.estimateTraffic(keywordOpportunity.searchVolume, keywordOpportunity.difficulty);
      const estimatedRevenue = this.estimateRevenue(estimatedTraffic);

      return {
        keyword: keywordOpportunity.keyword,
        searchVolume: keywordOpportunity.searchVolume,
        difficulty: keywordOpportunity.difficulty,
        competition: keywordOpportunity.competition,
        existingContent: keywordOpportunity.existingContent,
        opportunity,
        recommendedType,
        priority,
        estimatedTraffic,
        estimatedRevenue
      };
    }).sort((a, b) => b.opportunity - a.opportunity);
  }

  /**
   * Calculate opportunity score
   */
  private calculateOpportunity(opportunity: any, _competitorData: any): number {
    const searchVolumeWeight = 0.4;
    const difficultyWeight = 0.3;
    const competitionWeight = 0.3;
    
    const normalizedVolume = opportunity.searchVolume / 10000; // Normalize to 0-1
    const normalizedDifficulty = (100 - opportunity.difficulty) / 100; // Invert difficulty
    const normalizedCompetition = (100 - opportunity.competition) / 100; // Invert competition
    
    return (
      normalizedVolume * searchVolumeWeight +
      normalizedDifficulty * difficultyWeight +
      normalizedCompetition * competitionWeight
    ) * 100;
  }

  /**
   * Determine content type based on keyword and search volume
   */
  private determineContentType(keyword: string, searchVolume: number): string {
    const wordCount = keyword.split(' ').length;
    
    if (searchVolume > 5000 && wordCount <= 2) {
      return 'pillar';
    } else if (searchVolume > 2000) {
      return 'article';
    } else if (wordCount > 3) {
      return 'guide';
    } else {
      return 'tutorial';
    }
  }

  /**
   * Determine priority level
   */
  private determinePriority(opportunity: number, difficulty: number): string {
    if (opportunity > 70 && difficulty < 50) {
      return 'high';
    } else if (opportunity > 50 && difficulty < 70) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Estimate traffic potential
   */
  private estimateTraffic(searchVolume: number, difficulty: number): number {
    const clickThroughRate = 0.1; // 10% CTR
    const rankingPosition = Math.max(1, difficulty / 20); // Estimate ranking position
    const positionMultiplier = 1 / Math.sqrt(rankingPosition); // Position 1 gets 100%, position 4 gets 50%
    
    return Math.floor(searchVolume * clickThroughRate * positionMultiplier);
  }

  /**
   * Estimate revenue potential
   */
  private estimateRevenue(traffic: number): number {
    const conversionRate = 0.02; // 2% conversion rate
    const averageOrderValue = 50; // $50 average order value
    
    return traffic * conversionRate * averageOrderValue;
  }

  /**
   * Generate content recommendations
   */
  private async generateRecommendations(gaps: ContentGapData[], _categoryId: string): Promise<ContentGapRecommendation[]> {
    const topGaps = gaps.slice(0, 10); // Top 10 opportunities
    
    return topGaps.map(gap => ({
      title: this.generateTitle(gap.keyword, gap.recommendedType),
      description: this.generateDescription(gap.keyword, gap.recommendedType),
      contentType: gap.recommendedType,
      targetKeywords: [gap.keyword, ...this.generateRelatedKeywords(gap.keyword)],
      estimatedWordCount: this.estimateWordCount(gap.recommendedType),
      estimatedTime: this.estimateTime(gap.recommendedType),
      priority: gap.priority
    }));
  }

  /**
   * Generate title for content
   */
  private generateTitle(keyword: string, contentType: string): string {
    const templates = {
      pillar: `Complete Guide to ${keyword}`,
      article: `${keyword}: Everything You Need to Know`,
      guide: `How to ${keyword}: Step-by-Step Guide`,
      tutorial: `${keyword} Tutorial for Beginners`
    };
    
    return templates[contentType as keyof typeof templates] || `Complete Guide to ${keyword}`;
  }

  /**
   * Generate description for content
   */
  private generateDescription(keyword: string, contentType: string): string {
    const templates = {
      pillar: `Comprehensive guide covering all aspects of ${keyword}. Learn best practices, tips, and strategies.`,
      article: `Discover everything about ${keyword}. From basics to advanced techniques, this article covers it all.`,
      guide: `Step-by-step guide to ${keyword}. Perfect for beginners and intermediate users.`,
      tutorial: `Learn ${keyword} from scratch with this detailed tutorial. Includes examples and practical exercises.`
    };
    
    return templates[contentType as keyof typeof templates] || `Learn about ${keyword} with our comprehensive guide.`;
  }

  /**
   * Generate related keywords
   */
  private generateRelatedKeywords(keyword: string): string[] {
    const related = [
      `${keyword} examples`,
      `${keyword} tips`,
      `${keyword} best practices`,
      `${keyword} tutorial`,
      `${keyword} guide`
    ];
    
    return related.slice(0, 3);
  }

  /**
   * Estimate word count based on content type
   */
  private estimateWordCount(contentType: string): number {
    const wordCounts = {
      pillar: 3000,
      article: 1500,
      guide: 2000,
      tutorial: 1200
    };
    
    return wordCounts[contentType as keyof typeof wordCounts] || 1500;
  }

  /**
   * Estimate time to create content
   */
  private estimateTime(contentType: string): number {
    const times = {
      pillar: 240, // 4 hours
      article: 120, // 2 hours
      guide: 180,  // 3 hours
      tutorial: 90  // 1.5 hours
    };
    
    return times[contentType as keyof typeof times] || 120;
  }

  /**
   * Calculate analysis summary
   */
  private calculateSummary(gaps: ContentGapData[], _categoryId: string) {
    const totalOpportunities = gaps.length;
    const averageDifficulty = stats.mean(gaps.map(g => g.difficulty));
    const totalEstimatedTraffic = gaps.reduce((sum, g) => sum + g.estimatedTraffic, 0);
    const totalEstimatedRevenue = gaps.reduce((sum, g) => sum + g.estimatedRevenue, 0);
    
    // Group by priority
    const highPriority = gaps.filter(g => g.priority === 'high').length;
    const mediumPriority = gaps.filter(g => g.priority === 'medium').length;
    const lowPriority = gaps.filter(g => g.priority === 'low').length;
    
    return {
      totalOpportunities,
      averageDifficulty: Math.round(averageDifficulty),
      totalEstimatedTraffic,
      totalEstimatedRevenue: Math.round(totalEstimatedRevenue),
      topCategories: [
        { category: 'High Priority', opportunities: highPriority },
        { category: 'Medium Priority', opportunities: mediumPriority },
        { category: 'Low Priority', opportunities: lowPriority }
      ]
    };
  }

  /**
   * Store analysis results in database
   */
  private async storeAnalysisResults(gaps: ContentGapData[], categoryId: string, userId: string) {
    const analysisPromises = gaps.map(gap => 
      prisma.contentGapAnalysis.create({
        data: {
          categoryId,
          keyword: gap.keyword,
          searchVolume: gap.searchVolume,
          difficulty: gap.difficulty,
          opportunity: gap.opportunity,
          competition: gap.competition,
          existingContent: gap.existingContent,
          recommendedType: gap.recommendedType,
          priority: gap.priority,
          estimatedTraffic: gap.estimatedTraffic,
          estimatedRevenue: gap.estimatedRevenue,
          createdBy: userId
        }
      })
    );

    await Promise.all(analysisPromises);
  }

  /**
   * Get stored analysis results
   */
  async getStoredAnalysis(categoryId?: string, limit: number = 50) {
    const where = categoryId ? { categoryId } : {};
    
    return await prisma.contentGapAnalysis.findMany({
      where,
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { opportunity: 'desc' },
      take: limit
    });
  }

  /**
   * Create content recommendation
   */
  async createRecommendation(data: {
    gapAnalysisId: string;
    title: string;
    description: string;
    contentType: string;
    targetKeywords: string[];
    estimatedWordCount: number;
    estimatedTime: number;
    priority: string;
    assignedTo?: string;
  }) {
    return await prisma.contentGapRecommendation.create({
      data: {
        gapAnalysisId: data.gapAnalysisId,
        title: data.title,
        description: data.description,
        contentType: data.contentType,
        targetKeywords: data.targetKeywords as any,
        estimatedWordCount: data.estimatedWordCount,
        estimatedTime: data.estimatedTime,
        priority: data.priority,
        assignedTo: data.assignedTo
      },
      include: {
        gapAnalysis: true,
        assignee: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  /**
   * Get content recommendations
   */
  async getRecommendations(status?: string, priority?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    return await prisma.contentGapRecommendation.findMany({
      where,
      include: {
        gapAnalysis: {
          include: {
            category: true
          }
        },
        assignee: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { priority: 'desc' }
    });
  }
}

export default new ContentGapAnalysisService();
