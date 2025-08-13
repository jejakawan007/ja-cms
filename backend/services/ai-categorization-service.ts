import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ContentAnalysis {
  titleKeywords: string[];
  contentKeywords: string[];
  structure: {
    hasHeadings: boolean;
    hasLists: boolean;
    hasImages: boolean;
    hasLinks: boolean;
  };
  type: 'article' | 'tutorial' | 'news' | 'review' | 'guide' | 'other';
  length: number;
  readingTime: number;
}

interface CategorySuggestion {
  categoryId: string;
  categoryName: string;
  confidence: number;
  reasons: string[];
}

export class AICategorizationService {
  constructor() {
    this.initializeCategoryRules();
  }

  /**
   * Initialize default category rules
   */
  private async initializeCategoryRules() {
    // Get all categories to create rules
    const categories = await prisma.category.findMany();
    
    // Initialize rules (currently not used but ready for future enhancement)
    const rules = categories.map(category => ({
      id: `rule-${category.id}`,
      name: `${category.name} Auto-Rule`,
      categoryId: category.id,
      conditions: {
        keywords: this.extractKeywordsFromName(category.name),
        titlePatterns: this.generateTitlePatterns(category.name),
        minimumMatches: 1,
        confidence: 0.8
      }
    }));
    
    // Store rules for future use
    console.log(`Initialized ${rules.length} category rules for AI categorization`);
  }

  /**
   * Analyze post content and suggest categories
   */
  async suggestCategoriesForPost(post: any): Promise<CategorySuggestion[]> {
    try {
      // Analyze post content
      const analysis = await this.analyzePostContent(post);
      
      // Get all categories
      const categories = await prisma.category.findMany();
      
      // Score each category
      const suggestions: CategorySuggestion[] = [];
      
      for (const category of categories) {
        const score = await this.calculateCategoryMatchScore(analysis, category);
        
        if (score > 0.3) {
          suggestions.push({
            categoryId: category.id,
            categoryName: category.name,
            confidence: score,
            reasons: this.generateMatchReasons(analysis, category)
          });
        }
      }

      return suggestions.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('Error suggesting categories for post:', error);
      return [];
    }
  }

  /**
   * Analyze post content structure and extract insights
   */
  private async analyzePostContent(post: any): Promise<ContentAnalysis> {
    const title = post.title || '';
    const content = post.content || '';
    
    // Extract keywords from title and content
    const titleKeywords = this.extractKeywords(title);
    const contentKeywords = this.extractKeywords(content);
    
    // Analyze content structure
    const structure = this.analyzeContentStructure(content);
    
    // Detect content type
    const type = this.detectContentType(post);
    
    // Calculate reading time (average 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    return {
      titleKeywords,
      contentKeywords: contentKeywords.slice(0, 20), // Top 20 keywords
      structure,
      type,
      length: content.length,
      readingTime
    };
  }

  /**
   * Extract keywords from text using NLP techniques
   */
  private extractKeywords(text: string): string[] {
    if (!text) return [];
    
    // Convert to lowercase and remove special characters
    const cleanText = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Split into words
    const words = cleanText.split(/\s+/);
    
    // Remove common stop words
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs'
    ]);
    
    // Filter out stop words and short words
    const keywords = words.filter(word => 
      word.length > 2 && !stopWords.has(word)
    );
    
    // Count frequency and return top keywords
    const frequency: Record<string, number> = {};
    keywords.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Analyze content structure
   */
  private analyzeContentStructure(content: string) {
    return {
      hasHeadings: /<h[1-6]>/i.test(content),
      hasLists: /<[uo]l>|<li>/i.test(content),
      hasImages: /<img/i.test(content),
      hasLinks: /<a\s+href/i.test(content)
    };
  }

  /**
   * Detect content type based on title and content patterns
   */
  private detectContentType(post: any): 'article' | 'tutorial' | 'news' | 'review' | 'guide' | 'other' {
    const title = (post.title || '').toLowerCase();
    const content = (post.content || '').toLowerCase();
    
    // Tutorial patterns
    if (title.includes('how to') || title.includes('tutorial') || title.includes('step by step') ||
        content.includes('step 1') || content.includes('first,') || content.includes('next,')) {
      return 'tutorial';
    }
    
    // News patterns
    if (title.includes('breaking') || title.includes('news') || title.includes('announcement') ||
        title.includes('update') || /\d{4}/.test(title)) {
      return 'news';
    }
    
    // Review patterns
    if (title.includes('review') || title.includes('rating') || title.includes('stars') ||
        content.includes('pros') || content.includes('cons') || content.includes('rating')) {
      return 'review';
    }
    
    // Guide patterns
    if (title.includes('guide') || title.includes('complete') || title.includes('ultimate') ||
        content.includes('guide') || content.includes('complete guide')) {
      return 'guide';
    }
    
    return 'article';
  }

  /**
   * Calculate how well a category matches the content
   */
  private async calculateCategoryMatchScore(analysis: ContentAnalysis, category: any): Promise<number> {
    let score = 0;
    
    // Keyword matching (40% weight)
    const keywordScore = this.calculateKeywordMatchScore(
      [...analysis.titleKeywords, ...analysis.contentKeywords],
      category
    );
    score += keywordScore * 0.4;
    
    // Category description matching (30% weight)
    if (category.description) {
      const descriptionScore = await this.calculateSemanticSimilarity(
        analysis.contentKeywords.join(' '),
        category.description
      );
      score += descriptionScore * 0.3;
    }
    
    // Content type matching (20% weight)
    const typeScore = this.calculateContentTypeMatch(analysis.type, category);
    score += typeScore * 0.2;
    
    // Historical patterns (10% weight)
    const historicalScore = await this.calculateHistoricalPatternScore(analysis, category);
    score += historicalScore * 0.1;
    
    return Math.min(score, 1); // Cap at 1.0
  }

  /**
   * Calculate keyword match score
   */
  private calculateKeywordMatchScore(keywords: string[], category: any): number {
    if (!category.metaKeywords && !category.description) {
      return 0;
    }
    
    const categoryKeywords = this.extractKeywords(
      (category.metaKeywords || '') + ' ' + (category.description || '') + ' ' + category.name
    );
    
    const matches = keywords.filter(keyword => 
      categoryKeywords.some(catKeyword => 
        keyword.toLowerCase().includes(catKeyword.toLowerCase()) ||
        catKeyword.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    return matches.length / Math.max(keywords.length, categoryKeywords.length);
  }

  /**
   * Calculate semantic similarity (simplified version)
   */
  private async calculateSemanticSimilarity(text1: string, text2: string): Promise<number> {
    // Simple word overlap similarity
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Calculate content type match score
   */
  private calculateContentTypeMatch(contentType: string, category: any): number {
    // Simple mapping based on category name patterns
    const categoryName = category.name.toLowerCase();
    
    if (contentType === 'tutorial' && (categoryName.includes('tutorial') || categoryName.includes('how-to'))) {
      return 1.0;
    }
    
    if (contentType === 'news' && (categoryName.includes('news') || categoryName.includes('announcement'))) {
      return 1.0;
    }
    
    if (contentType === 'review' && (categoryName.includes('review') || categoryName.includes('rating'))) {
      return 1.0;
    }
    
    if (contentType === 'guide' && (categoryName.includes('guide') || categoryName.includes('help'))) {
      return 1.0;
    }
    
    return 0.5; // Default score for other types
  }

  /**
   * Calculate historical pattern score
   */
  private async calculateHistoricalPatternScore(analysis: ContentAnalysis, category: any): Promise<number> {
    // Get recent posts in this category to analyze patterns
    const recentPosts = await prisma.post.findMany({
      where: {
        categoryId: category.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    
    if (recentPosts.length === 0) {
      return 0.5; // Neutral score for new categories
    }
    
    // Calculate average similarity with recent posts
    let totalSimilarity = 0;
    
    for (const post of recentPosts) {
      const postKeywords = this.extractKeywords(post.title + ' ' + (post.content || ''));
      const similarity = this.calculateKeywordMatchScore(
        [...analysis.titleKeywords, ...analysis.contentKeywords],
        { name: category.name, description: category.description, metaKeywords: postKeywords.join(' ') }
      );
      totalSimilarity += similarity;
    }
    
    return totalSimilarity / recentPosts.length;
  }

  /**
   * Generate reasons for category match
   */
  private generateMatchReasons(analysis: ContentAnalysis, category: any): string[] {
    const reasons: string[] = [];
    
    // Keyword matches
    const keywordMatches = analysis.titleKeywords.filter(keyword => 
      category.name.toLowerCase().includes(keyword) ||
      (category.description && category.description.toLowerCase().includes(keyword))
    );
    
    if (keywordMatches.length > 0) {
      reasons.push(`Keyword matches: ${keywordMatches.slice(0, 3).join(', ')}`);
    }
    
    // Content type match
    if (analysis.type !== 'other') {
      reasons.push(`Content type: ${analysis.type}`);
    }
    
    // Content length
    if (analysis.length > 1000) {
      reasons.push('Long-form content');
    } else if (analysis.length < 500) {
      reasons.push('Short-form content');
    }
    
    return reasons;
  }

  /**
   * Extract keywords from category name
   */
  private extractKeywordsFromName(name: string): string[] {
    return this.extractKeywords(name);
  }

  /**
   * Generate title patterns for category
   */
  private generateTitlePatterns(name: string): RegExp[] {
    const patterns: RegExp[] = [];
    
    // Add pattern for category name
    patterns.push(new RegExp(name, 'i'));
    
    // Add common patterns based on category type
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('tutorial') || lowerName.includes('guide')) {
      patterns.push(/how to/i, /tutorial/i, /guide/i, /step by step/i);
    }
    
    if (lowerName.includes('news') || lowerName.includes('announcement')) {
      patterns.push(/breaking/i, /news/i, /announcement/i, /update/i);
    }
    
    if (lowerName.includes('review')) {
      patterns.push(/review/i, /rating/i, /stars/i, /pros and cons/i);
    }
    
    return patterns;
  }

  /**
   * Auto-categorize posts based on content analysis
   */
  async autoCategorizePosts(): Promise<{
    processed: number;
    categorized: number;
    failed: number;
    suggestions: Array<{
      postId: string;
      postTitle: string;
      suggestions: CategorySuggestion[];
    }>;
  }> {
    const result = {
      processed: 0,
      categorized: 0,
      failed: 0,
      suggestions: [] as Array<{
        postId: string;
        postTitle: string;
        suggestions: CategorySuggestion[];
      }>
    };

    try {
      // Get uncategorized posts (posts without category)
      const uncategorizedPosts = await prisma.post.findMany({
        where: {
          categoryId: null
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      for (const post of uncategorizedPosts) {
        try {
          result.processed++;
          
          const suggestions = await this.suggestCategoriesForPost(post);
          
          if (suggestions.length > 0) {
            const bestSuggestion = suggestions[0];
            
            if (bestSuggestion.confidence > 0.8) {
              // Auto-assign high-confidence suggestions
              await prisma.post.update({
                where: { id: post.id },
                data: { categoryId: bestSuggestion.categoryId }
              });
              result.categorized++;
            } else {
              // Store for manual review
              result.suggestions.push({
                postId: post.id,
                postTitle: post.title,
                suggestions: suggestions.slice(0, 3)
              });
            }
          }
        } catch (error) {
          result.failed++;
          console.error(`Failed to categorize post ${post.id}:`, error);
        }
      }

      return result;
    } catch (error) {
      console.error('Error in auto-categorization:', error);
      throw error;
    }
  }

  /**
   * Get category suggestions for manual review
   */
  async getCategorySuggestions(): Promise<Array<{
    postId: string;
    postTitle: string;
    suggestions: CategorySuggestion[];
  }>> {
    const uncategorizedPosts = await prisma.post.findMany({
      where: {
        categoryId: null
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to recent posts
    });

    const suggestions = [];

    for (const post of uncategorizedPosts) {
      const postSuggestions = await this.suggestCategoriesForPost(post);
      
      if (postSuggestions.length > 0) {
        suggestions.push({
          postId: post.id,
          postTitle: post.title,
          suggestions: postSuggestions.slice(0, 3)
        });
      }
    }

    return suggestions;
  }
}

export const aiCategorizationService = new AICategorizationService();
