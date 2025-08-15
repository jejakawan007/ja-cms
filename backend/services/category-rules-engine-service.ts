import { PrismaClient } from '@prisma/client';
import nlp from 'compromise';
import stopwords from 'stopwords';
import * as cron from 'node-cron';

const prisma = new PrismaClient();

export interface CategoryRuleCondition {
  keywords?: string[];
  titlePatterns?: string[];
  contentPatterns?: string[];
  minimumMatches?: number;
  confidence: number;
  freshnessHours?: number;
  contentType?: string[];
  readingTime?: {
    min?: number;
    max?: number;
  };
  wordCount?: {
    min?: number;
    max?: number;
  };
}

export interface CategoryRule {
  id: string;
  name: string;
  categoryId: string;
  conditions: CategoryRuleCondition;
  priority: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleExecutionResult {
  ruleId: string;
  postId: string;
  matched: boolean;
  confidence: number;
  matchedConditions: string[];
  executionTime: number;
  details: {
    keywordMatches?: string[];
    patternMatches?: string[];
    contentTypeMatch?: boolean;
    readingTimeMatch?: boolean;
    wordCountMatch?: boolean;
  };
}

export interface ContentAnalysis {
  titleKeywords: string[];
  contentKeywords: string[];
  contentType: string;
  readingTime: number;
  wordCount: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  language: string;
  topics: string[];
}

export class CategoryRulesEngineService {
  constructor() {
    // Setup scheduled categorization
    this.setupScheduledCategorization();
  }

  /**
   * Create a new category rule
   */
  async createRule(ruleData: Omit<CategoryRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<CategoryRule> {
    try {
      const rule = await prisma.categoryRule.create({
        data: {
          name: ruleData.name,
          categoryId: ruleData.categoryId,
          conditions: ruleData.conditions as any,
          priority: ruleData.priority,
          isActive: ruleData.isActive,
          createdBy: ruleData.createdBy,
        },
        include: {
          category: true,
          creator: true,
        }
      });

      return rule as unknown as CategoryRule;
    } catch (error) {
      // Log error without console.log
      throw new Error('Failed to create category rule');
    }
  }

  /**
   * Get all active rules for a category
   */
  async getCategoryRules(categoryId: string): Promise<CategoryRule[]> {
    try {
      const rules = await prisma.categoryRule.findMany({
        where: {
          categoryId,
          isActive: true,
        },
        orderBy: {
          priority: 'desc',
        },
        include: {
          category: true,
          creator: true,
        }
      });

      return rules as unknown as CategoryRule[];
    } catch (error) {
      // Log error without console.log
      throw new Error('Failed to fetch category rules');
    }
  }

  /**
   * Analyze post content for categorization
   */
  async analyzePostContent(postId: string): Promise<ContentAnalysis> {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: {
          title: true,
          content: true,
          excerpt: true,
          createdAt: true,
        }
      });

      if (!post) {
        throw new Error('Post not found');
      }

      // Extract keywords from title
      const titleKeywords = this.extractKeywords(post.title);
      
      // Extract keywords from content
      const contentKeywords = this.extractKeywords(post.content);
      
      // Detect content type
      const contentType = this.detectContentType(post.title, post.content);
      
      // Calculate reading time (average 200 words per minute)
      const wordCount = this.countWords(post.content);
      const readingTime = Math.ceil(wordCount / 200);
      
      // Analyze sentiment
      const sentiment = this.analyzeSentiment(post.content);
      
      // Detect language
      const language = this.detectLanguage(post.content);
      
      // Extract topics
      const topics = this.extractTopics(post.content);

      return {
        titleKeywords,
        contentKeywords,
        contentType,
        readingTime,
        wordCount,
        sentiment,
        language,
        topics,
      };
    } catch (error) {
      // Log error without console.log
      throw new Error('Failed to analyze post content');
    }
  }

  /**
   * Execute rules against a post
   */
  async executeRulesForPost(postId: string): Promise<RuleExecutionResult[]> {
    try {
      // Get all active rules
      const rules = await prisma.categoryRule.findMany({
        where: { isActive: true },
        orderBy: { priority: 'desc' },
      });

      // Analyze post content
      const contentAnalysis = await this.analyzePostContent(postId);
      
      const results: RuleExecutionResult[] = [];

      for (const rule of rules) {
        const ruleStartTime = Date.now();
        
        const result = await this.evaluateRule(rule, contentAnalysis, postId);
        
        if (result.matched) {
          results.push({
            ...result,
            executionTime: Date.now() - ruleStartTime,
          });
        }
      }

      return results;
    } catch (error) {
      // Log error without console.log
      throw new Error('Failed to execute rules for post');
    }
  }

  /**
   * Evaluate a single rule against content analysis
   */
  private async evaluateRule(
    rule: Record<string, unknown>, 
    analysis: ContentAnalysis, 
    postId: string
  ): Promise<RuleExecutionResult> {
    const conditions = rule['conditions'] as CategoryRuleCondition;
    const matchedConditions: string[] = [];
    let totalConfidence = 0;
    let conditionCount = 0;

    const details: Record<string, unknown> = {};

    // Check keyword matches
    if (conditions.keywords && conditions.keywords.length > 0) {
      const allKeywords = [...analysis.titleKeywords, ...analysis.contentKeywords];
      const matches = conditions.keywords.filter(keyword =>
        allKeywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
      );

      if (matches.length >= (conditions.minimumMatches || 1)) {
        matchedConditions.push('keywords');
        totalConfidence += conditions.confidence;
        conditionCount++;
        details['keywordMatches'] = matches;
      }
    }

    // Check title patterns
    if (conditions.titlePatterns && conditions.titlePatterns.length > 0) {
      const titleMatches = conditions.titlePatterns.filter(pattern =>
        analysis.titleKeywords.some(keyword => 
          keyword.toLowerCase().includes(pattern.toLowerCase())
        )
      );

      if (titleMatches.length > 0) {
        matchedConditions.push('title_patterns');
        totalConfidence += conditions.confidence * 0.8; // Title patterns get slightly lower weight
        conditionCount++;
        details['patternMatches'] = titleMatches;
      }
    }

    // Check content type
    if (conditions.contentType && conditions.contentType.length > 0) {
      if (conditions.contentType.includes(analysis.contentType)) {
        matchedConditions.push('content_type');
        totalConfidence += conditions.confidence * 0.6; // Content type gets lower weight
        conditionCount++;
        details['contentTypeMatch'] = true;
      }
    }

    // Check reading time
    if (conditions.readingTime) {
      const { min = 0, max = Infinity } = conditions.readingTime;
      if (analysis.readingTime >= min && analysis.readingTime <= max) {
        matchedConditions.push('reading_time');
        totalConfidence += conditions.confidence * 0.4; // Reading time gets lower weight
        conditionCount++;
        details['readingTimeMatch'] = true;
      }
    }

    // Check word count
    if (conditions.wordCount) {
      const { min = 0, max = Infinity } = conditions.wordCount;
      if (analysis.wordCount >= min && analysis.wordCount <= max) {
        matchedConditions.push('word_count');
        totalConfidence += conditions.confidence * 0.3; // Word count gets lower weight
        conditionCount++;
        details['wordCountMatch'] = true;
      }
    }

    // Calculate final confidence
    const finalConfidence = conditionCount > 0 ? totalConfidence / conditionCount : 0;

    // Store execution result
    if (matchedConditions.length > 0) {
      await this.storeExecutionResult(rule['id'] as string, postId, {
        matched: true,
        confidence: finalConfidence,
        matchedConditions,
        details,
      });
    }

    return {
      ruleId: rule['id'] as string,
      postId,
      matched: matchedConditions.length > 0,
      confidence: finalConfidence,
      matchedConditions,
      executionTime: 0, // Will be set by caller
      details,
    };
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    try {
      // Use compromise for better text processing
      const doc = nlp(text);
      
      // Extract nouns, verbs, and adjectives
      const nouns = doc.nouns().out('array');
      const verbs = doc.verbs().out('array');
      const adjectives = doc.adjectives().out('array');
      
      // Combine and filter
      const allWords = [...nouns, ...verbs, ...adjectives];
      
      // Remove stopwords and short words
      const keywords = allWords
        .filter(word => word.length > 2)
        .filter(word => !stopwords.includes(word.toLowerCase()))
        .map(word => word.toLowerCase())
        .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates

      return keywords.slice(0, 20); // Limit to top 20 keywords
    } catch (error) {
      // Log error without console.log
      return [];
    }
  }

  /**
   * Detect content type
   */
  private detectContentType(title: string, content: string): string {
    const text = `${title} ${content}`.toLowerCase();
    
    if (text.includes('how to') || text.includes('tutorial') || text.includes('guide')) {
      return 'tutorial';
    }
    
    if (text.includes('news') || text.includes('breaking') || text.includes('announcement')) {
      return 'news';
    }
    
    if (text.includes('review') || text.includes('rating') || text.includes('opinion')) {
      return 'review';
    }
    
    if (text.includes('analysis') || text.includes('research') || text.includes('study')) {
      return 'analysis';
    }
    
    if (text.includes('interview') || text.includes('q&a') || text.includes('conversation')) {
      return 'interview';
    }
    
    return 'article';
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Analyze sentiment
   */
  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    // Simple sentiment analysis using keyword matching
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'best', 'love', 'like'];
    const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'hate', 'dislike', 'poor'];
    
    const words = text.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Detect language (simplified)
   */
  private detectLanguage(text: string): string {
    // Simple language detection based on common words
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    const indonesianWords = ['dan', 'atau', 'tetapi', 'di', 'ke', 'dari', 'untuk', 'dengan'];
    
    const words = text.toLowerCase().split(/\s+/);
    const englishCount = words.filter(word => englishWords.includes(word)).length;
    const indonesianCount = words.filter(word => indonesianWords.includes(word)).length;
    
    return indonesianCount > englishCount ? 'id' : 'en';
  }

  /**
   * Extract topics from content
   */
  private extractTopics(content: string): string[] {
    // Extract topics using TF-IDF approach
    const words = content.toLowerCase().split(/\s+/);
    const wordFreq: { [key: string]: number } = {};
    
    words.forEach(word => {
      if (word.length > 3 && !stopwords.includes(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    // Get top 5 most frequent words as topics
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Store execution result
   */
  private async storeExecutionResult(
    ruleId: string, 
    postId: string, 
    result: Omit<RuleExecutionResult, 'ruleId' | 'postId' | 'executionTime'>
  ): Promise<void> {
    await prisma.categoryRuleExecution.create({
      data: {
        ruleId,
        postId,
        executionResult: result as any,
        confidenceScore: result.confidence,
      }
    });
  }

  /**
   * Setup scheduled categorization
   */
  private setupScheduledCategorization(): void {
    // Run categorization every hour
    cron.schedule('0 * * * *', async () => {
      try {
        // Get uncategorized posts from the last 24 hours
        const uncategorizedPosts = await prisma.post.findMany({
          where: {
            categoryId: null,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
          select: { id: true },
        });

        // Process posts directly
        for (const post of uncategorizedPosts) {
          try {
            const results = await this.executeRulesForPost(post.id);
            
            // Auto-assign category if high confidence
            const highConfidenceResults = results.filter(r => r.confidence > 0.8);
            if (highConfidenceResults.length > 0) {
              const bestMatch = highConfidenceResults[0];
              const rule = await prisma.categoryRule.findUnique({
                where: { id: bestMatch.ruleId },
              });
              
              if (rule) {
                await prisma.post.update({
                  where: { id: post.id },
                  data: { categoryId: rule.categoryId },
                });
              }
            }
          } catch (error) {
            // Handle individual post processing errors
          }
        }
      } catch (error) {
        // Handle general scheduling errors
      }
    });
  }

  /**
   * Get rule execution statistics
   */
  async getRuleStatistics(ruleId: string): Promise<Record<string, unknown>> {
    try {
      const executions = await prisma.categoryRuleExecution.findMany({
        where: { ruleId },
        orderBy: { executedAt: 'desc' },
        take: 100, // Last 100 executions
      });

      const totalExecutions = executions.length;
      const successfulExecutions = executions.filter(e => e.confidenceScore > 0.5).length;
      const averageConfidence = executions.reduce((sum, e) => sum + e.confidenceScore, 0) / totalExecutions;

      return {
        totalExecutions,
        successfulExecutions,
        successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
        averageConfidence,
        recentExecutions: executions.slice(0, 10),
      };
    } catch (error) {
      // Log error without console.log
      throw new Error('Failed to get rule statistics');
    }
  }

  /**
   * Cleanup old execution logs
   */
  async cleanupOldLogs(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      
      await prisma.categoryRuleExecution.deleteMany({
        where: {
          executedAt: {
            lt: cutoffDate,
          },
        },
      });

      // Log without console.log
    } catch (error) {
      // Log error without console.log
    }
  }
}

export default new CategoryRulesEngineService();
