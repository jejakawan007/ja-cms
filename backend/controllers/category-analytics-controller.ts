import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class CategoryAnalyticsController {
  /**
   * Get category analytics overview
   */
  async getCategoryAnalytics(req: Request, res: Response) {
    try {
      const { period = '30d', startDate, endDate } = req.query;
      
      // Calculate date range
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : this.getStartDate(period as string, end);

      // Get all categories with their analytics
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: {
              posts: true,
              children: true
            }
          }
        }
      });

      // Get category analytics data
      const categoryAnalytics = await this.getCategoryAnalyticsData(start, end);
      
      // Combine category data with analytics
      const categoryPerformance = categories.map(category => {
        const analytics = categoryAnalytics.find(a => a.categoryId === category.id);
        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          postCount: category._count.posts,
          subcategoryCount: category._count.children,
          analytics: analytics || {
            views: 0,
            uniqueViews: 0,
            likes: 0,
            shares: 0,
            comments: 0,
            avgTimeOnPage: 0,
            bounceRate: 0,
            exitRate: 0
          }
        };
      });

      // Sort by performance (views)
      categoryPerformance.sort((a, b) => b.analytics.views - a.analytics.views);

      // Calculate summary metrics
      const summary = {
        totalCategories: categories.length,
        activeCategories: categoryPerformance.filter(c => c.postCount > 0).length,
        totalPosts: categoryPerformance.reduce((sum, c) => sum + c.postCount, 0),
        totalViews: categoryPerformance.reduce((sum, c) => sum + c.analytics.views, 0),
        avgViewsPerCategory: Math.round(categoryPerformance.reduce((sum, c) => sum + c.analytics.views, 0) / categories.length),
        topPerformer: categoryPerformance[0] || null
      };

      res.json({
        success: true,
        data: {
          summary,
          categories: categoryPerformance,
          timeRange: {
            start: start.toISOString(),
            end: end.toISOString()
          }
        },
        message: 'Category analytics retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching category analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category analytics'
      });
    }
  }

  /**
   * Get detailed analytics for specific category
   */
  async getCategoryDetailAnalytics(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const { period = '30d', startDate, endDate } = req.query;
      
      // Calculate date range
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : this.getStartDate(period as string, end);

      // Get category details
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          _count: {
            select: {
              posts: true,
              children: true
            }
          },
          children: {
            include: {
              _count: {
                select: {
                  posts: true
                }
              }
            }
          }
        }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Get category analytics data
      const analytics = await this.getCategoryAnalyticsData(start, end, categoryId);
      const categoryAnalytics = analytics.find(a => a.categoryId === categoryId) || {
        views: 0,
        uniqueViews: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        avgTimeOnPage: 0,
        bounceRate: 0,
        exitRate: 0
      };

      // Get posts in this category
      const posts = await prisma.post.findMany({
        where: {
          categoryId: categoryId
        },
        include: {
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      });

      // Get trend data
      const trends = await this.getCategoryTrends(categoryId, start, end);

      // Get content gaps
      const contentGaps = await this.analyzeContentGaps(categoryId);

      const detailedAnalytics = {
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          postCount: category._count.posts,
          subcategoryCount: category._count.children,
          subcategories: category.children.map(child => ({
            id: child.id,
            name: child.name,
            postCount: child._count.posts
          }))
        },
        analytics: categoryAnalytics,
        posts: posts.map(post => ({
          id: post.id,
          title: post.title,
          status: post.status,
          createdAt: post.createdAt,
          likeCount: post._count.likes,
          commentCount: post._count.comments
        })),
        trends,
        contentGaps,
        timeRange: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      };

      res.json({
        success: true,
        data: detailedAnalytics,
        message: 'Category detail analytics retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching category detail analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category detail analytics'
      });
    }
  }

  /**
   * Get category performance metrics
   */
  async getCategoryPerformance(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const { period = '30d' } = req.query;
      
      const end = new Date();
      const start = this.getStartDate(period as string, end);

      // Get category performance data
      const performance = await this.calculateCategoryPerformance(categoryId, start, end);

      res.json({
        success: true,
        data: performance,
        message: 'Category performance retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching category performance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category performance'
      });
    }
  }

  /**
   * Get content gaps analysis for category
   */
  async getCategoryContentGaps(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      
      const contentGaps = await this.analyzeContentGaps(categoryId);

      res.json({
        success: true,
        data: contentGaps,
        message: 'Category content gaps analysis retrieved successfully'
      });
    } catch (error) {
      console.error('Error analyzing category content gaps:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze category content gaps'
      });
    }
  }

  // Private helper methods
  private async getCategoryAnalyticsData(start: Date, end: Date, categoryId?: string) {
    const whereClause: any = {
      contentType: 'category',
      date: {
        gte: start,
        lte: end
      }
    };

    if (categoryId) {
      whereClause.contentId = categoryId;
    }

    return await prisma.contentAnalytics.groupBy({
      by: ['contentId'],
      where: whereClause,
      _sum: {
        views: true,
        uniqueViews: true,
        likes: true,
        shares: true,
        comments: true,
        avgTimeOnPage: true
      },
      _avg: {
        bounceRate: true,
        exitRate: true
      }
    }).then(results => 
      results.map(r => ({
        categoryId: r.contentId,
        views: r._sum.views || 0,
        uniqueViews: r._sum.uniqueViews || 0,
        likes: r._sum.likes || 0,
        shares: r._sum.shares || 0,
        comments: r._sum.comments || 0,
        avgTimeOnPage: r._sum.avgTimeOnPage || 0,
        bounceRate: r._avg.bounceRate || 0,
        exitRate: r._avg.exitRate || 0
      }))
    );
  }

  private async getCategoryTrends(categoryId: string, start: Date, end: Date) {
    const trends = await prisma.contentAnalytics.findMany({
      where: {
        contentId: categoryId,
        contentType: 'category',
        date: {
          gte: start,
          lte: end
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    return trends.map(trend => ({
      date: trend.date,
      views: trend.views,
      uniqueViews: trend.uniqueViews,
      likes: trend.likes,
      shares: trend.shares,
      comments: trend.comments
    }));
  }

  private async calculateCategoryPerformance(categoryId: string, start: Date, end: Date) {
    const analytics = await this.getCategoryAnalyticsData(start, end, categoryId);
    const categoryAnalytics = analytics[0] || {
      views: 0,
      uniqueViews: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      avgTimeOnPage: 0,
      bounceRate: 0,
      exitRate: 0
    };

    // Calculate performance score (0-100)
    const performanceScore = this.calculatePerformanceScore(categoryAnalytics);

    // Get posts in category
    const posts = await prisma.post.findMany({
      where: {
        categoryId: categoryId
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true
      }
    });

    return {
      performanceScore,
      metrics: categoryAnalytics,
      postCount: posts.length,
      publishedPosts: posts.filter(p => p.status === 'PUBLISHED').length,
      draftPosts: posts.filter(p => p.status === 'DRAFT').length,
      recentPosts: posts
        .filter(p => p.createdAt >= start)
        .length,
      engagementRate: categoryAnalytics.views > 0 
        ? ((categoryAnalytics.likes + categoryAnalytics.comments + categoryAnalytics.shares) / categoryAnalytics.views) * 100
        : 0
    };
  }

  private async analyzeContentGaps(categoryId: string) {
    const gaps = [];

    // Get category posts
    const posts = await prisma.post.findMany({
      where: {
        categoryId: categoryId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Check posting frequency
    if (posts.length > 0) {
      const lastPost = posts[0];
      const daysSinceLastPost = Math.floor((Date.now() - lastPost.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastPost > 14) {
        gaps.push({
          type: 'posting_frequency',
          severity: 'medium',
          title: 'Infrequent posting',
          description: `No posts in ${daysSinceLastPost} days`,
          suggestion: 'Consider creating more content for this category'
        });
      }
    } else {
      gaps.push({
        type: 'no_content',
        severity: 'high',
        title: 'No content available',
        description: 'This category has no posts yet',
        suggestion: 'Start creating content for this category'
      });
    }

    // Check content variety
    const statuses = [...new Set(posts.map(p => p.status))];
    if (statuses.length === 1 && statuses[0] === 'DRAFT') {
      gaps.push({
        type: 'content_status',
        severity: 'medium',
        title: 'All content is in draft',
        description: 'No published content in this category',
        suggestion: 'Publish some content to make it visible to users'
      });
    }

    return gaps;
  }

  private calculatePerformanceScore(analytics: any): number {
    let score = 0;
    
    // Views weight: 30%
    const viewScore = Math.min(analytics.views / 1000, 1) * 30;
    score += viewScore;
    
    // Engagement weight: 40%
    const engagementRate = analytics.views > 0 
      ? (analytics.likes + analytics.comments + analytics.shares) / analytics.views
      : 0;
    const engagementScore = Math.min(engagementRate * 100, 1) * 40;
    score += engagementScore;
    
    // Time on page weight: 20%
    const timeScore = Math.min(analytics.avgTimeOnPage / 300, 1) * 20; // 5 minutes = 100%
    score += timeScore;
    
    // Bounce rate weight: 10% (inverse)
    const bounceScore = Math.max(0, (1 - analytics.bounceRate / 100)) * 10;
    score += bounceScore;
    
    return Math.round(score);
  }

  private getStartDate(period: string, end: Date): Date {
    const start = new Date(end);
    
    switch (period) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }
    
    return start;
  }
}

export const categoryAnalyticsController = new CategoryAnalyticsController();
