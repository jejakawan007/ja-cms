import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class AnalyticsController {
  /**
   * Get comprehensive analytics data
   */
  async getAnalytics(req: Request, res: Response) {
    try {
      const { period = '30d', startDate, endDate } = req.query;
      
      // Calculate date range
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : this.getStartDate(period as string, end);

      // Get site analytics for the period
      const siteAnalytics = await this.getSiteAnalytics(start, end);
      
      // Get top pages
      const topPages = await this.getTopPages(start, end);
      
      // Get traffic sources
      const trafficSources = await this.getTrafficSources(start, end);
      
      // Get user engagement data
      const userEngagement = await this.getUserEngagement(start, end);
      
      // Get content performance
      const contentPerformance = await this.getContentPerformance(start, end);
      
      // Get user demographics
      const userDemographics = await this.getUserDemographics(start, end);

      const analytics = {
        pageViews: siteAnalytics.totalPageViews,
        uniqueVisitors: siteAnalytics.uniqueVisitors,
        avgSessionDuration: siteAnalytics.avgSessionDuration,
        bounceRate: siteAnalytics.bounceRate,
        conversionRate: siteAnalytics.conversionRate,
        topPages,
        trafficSources,
        userEngagement,
        contentPerformance,
        userDemographics
      };

      res.json({
        success: true,
        data: analytics,
        message: 'Analytics data retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics data'
      });
    }
  }

  /**
   * Get real-time analytics
   */
  async getRealTimeAnalytics(_req: Request, res: Response) {
    try {
      // Get active users (sessions active in last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const activeUsers = await prisma.analyticsSession.count({
        where: {
          isActive: true,
          startTime: {
            gte: fiveMinutesAgo
          }
        }
      });

      // Get current page views (last 5 minutes)
      const currentPageViews = await prisma.pageView.count({
        where: {
          timestamp: {
            gte: fiveMinutesAgo
          }
        }
      });

      // Get top pages right now
      const topPages = await prisma.pageView.groupBy({
        by: ['path'],
        where: {
          timestamp: {
            gte: fiveMinutesAgo
          }
        },
        _count: {
          path: true
        },
        orderBy: {
          _count: {
            path: 'desc'
          }
        },
        take: 5
      });

      const realTimeData = {
        activeUsers,
        currentPageViews,
        topPages: topPages.map(page => ({
          name: page.path,
          views: page._count.path
        }))
      };

      res.json({
        success: true,
        data: realTimeData,
        message: 'Real-time analytics retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching real-time analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch real-time analytics'
      });
    }
  }

  /**
   * Get content performance analytics
   */
  async getContentAnalytics(req: Request, res: Response) {
    try {
      const { period = '30d' } = req.query;
      const end = new Date();
      const start = this.getStartDate(period as string, end);

      // Get top content by views
      const topContent = await prisma.contentAnalytics.groupBy({
        by: ['contentId', 'contentType'],
        where: {
          date: {
            gte: start,
            lte: end
          }
        },
        _sum: {
          views: true,
          likes: true,
          comments: true,
          shares: true,
          avgTimeOnPage: true
        },
        orderBy: {
          _sum: {
            views: 'desc'
          }
        },
        take: 10
      });

      // Get content with titles
      const contentWithTitles = await Promise.all(
        topContent.map(async (content) => {
          let title = 'Unknown Content';
          
          if (content.contentType === 'post') {
            const post = await prisma.post.findUnique({
              where: { id: content.contentId },
              select: { title: true }
            });
            title = post?.title || 'Unknown Post';
          }

          return {
            id: content.contentId,
            title,
            views: content._sum.views || 0,
            likes: content._sum.likes || 0,
            comments: content._sum.comments || 0,
            shares: content._sum.shares || 0,
            avgTimeOnPage: content._sum.avgTimeOnPage || 0
          };
        })
      );

      // Get content trends
      const contentTrends = await prisma.contentAnalytics.groupBy({
        by: ['date'],
        where: {
          date: {
            gte: start,
            lte: end
          }
        },
        _sum: {
          views: true
        },
        orderBy: {
          date: 'asc'
        }
      });

      const trends = contentTrends.map(trend => ({
        date: trend.date.toISOString().split('T')[0],
        published: 0, // Would need to query posts table for this
        views: trend._sum.views || 0,
        engagement: 0 // Would need to calculate from likes/comments
      }));

      res.json({
        success: true,
        data: {
          topContent: contentWithTitles,
          contentTrends: trends
        },
        message: 'Content analytics retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching content analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch content analytics'
      });
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(req: Request, res: Response) {
    try {
      const { period = '30d' } = req.query;
      const end = new Date();
      const start = this.getStartDate(period as string, end);

      // Get user growth data
      const userGrowth = await prisma.userAnalytics.groupBy({
        by: ['date'],
        where: {
          date: {
            gte: start,
            lte: end
          }
        },
        _sum: {
          sessionsCount: true,
          pageViews: true
        },
        orderBy: {
          date: 'asc'
        }
      });

      // Get user engagement
      const userEngagement = await prisma.userAnalytics.groupBy({
        by: ['date'],
        where: {
          date: {
            gte: start,
            lte: end
          }
        },
        _sum: {
          sessionsCount: true,
          timeSpent: true
        },
        orderBy: {
          date: 'asc'
        }
      });

      // Get user demographics from page views
      const demographics = await this.getUserDemographics(start, end);

      res.json({
        success: true,
        data: {
          userGrowth: userGrowth.map(growth => ({
            date: growth.date.toISOString().split('T')[0],
            newUsers: 0, // Would need to query users table for registration dates
            totalUsers: 0 // Would need to count total users
          })),
          userEngagement: userEngagement.map(engagement => ({
            date: engagement.date.toISOString().split('T')[0],
            activeUsers: engagement._sum.sessionsCount || 0,
            avgSessionDuration: engagement._sum.timeSpent || 0
          })),
          userRetention: [], // Would need complex cohort analysis
          userDemographics: demographics
        },
        message: 'User analytics retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user analytics'
      });
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(req: Request, res: Response) {
    try {
      const { period = '30d', format = 'csv' } = req.query;
      const end = new Date();
      const start = this.getStartDate(period as string, end);

      // Get analytics data
      const siteAnalytics = await this.getSiteAnalytics(start, end);
      const topPages = await this.getTopPages(start, end);
      const trafficSources = await this.getTrafficSources(start, end);

      if (format === 'csv') {
        const csvData = this.convertToCSV({
          siteAnalytics,
          topPages,
          trafficSources
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=analytics-${period}.csv`);
        res.send(csvData);
      } else {
        res.json({
          success: true,
          data: {
            siteAnalytics,
            topPages,
            trafficSources
          },
          message: 'Analytics data exported successfully'
        });
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export analytics data'
      });
    }
  }

  // Helper methods
  private getStartDate(period: string, endDate: Date): Date {
    const start = new Date(endDate);
    
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

  private async getSiteAnalytics(start: Date, end: Date) {
    const analytics = await prisma.siteAnalytics.findMany({
      where: {
        date: {
          gte: start,
          lte: end
        }
      }
    });

    const totalPageViews = analytics.reduce((sum, a) => sum + a.pageViews, 0);
    const totalUniqueVisitors = analytics.reduce((sum, a) => sum + a.uniqueVisitors, 0);
    // const _totalSessions = analytics.reduce((sum, a) => sum + a.sessions, 0);
    const avgBounceRate = analytics.reduce((sum, a) => sum + a.bounceRate, 0) / analytics.length;
    const avgSessionDuration = analytics.reduce((sum, a) => sum + a.avgSessionTime, 0) / analytics.length;
    const avgConversionRate = analytics.reduce((sum, a) => sum + a.conversionRate, 0) / analytics.length;

    return {
      totalPageViews,
      uniqueVisitors: totalUniqueVisitors,
      avgSessionDuration,
      bounceRate: avgBounceRate * 100,
      conversionRate: avgConversionRate * 100
    };
  }

  private async getTopPages(start: Date, end: Date) {
    const pages = await prisma.pageView.groupBy({
      by: ['path'],
      where: {
        timestamp: {
          gte: start,
          lte: end
        }
      },
      _count: {
        path: true
      },
      _avg: {
        duration: true
      },
      orderBy: {
        _count: {
          path: 'desc'
        }
      },
      take: 10
    });

    return pages.map(page => ({
      name: page.path,
      views: page._count.path,
      uniqueViews: page._count.path, // Simplified - would need distinct count
      avgTimeOnPage: Math.round(page._avg.duration || 0)
    }));
  }

  private async getTrafficSources(start: Date, end: Date) {
    const sources = await prisma.pageView.groupBy({
      by: ['referrer'],
      where: {
        timestamp: {
          gte: start,
          lte: end
        }
      },
      _count: {
        referrer: true
      }
    });

    const total = sources.reduce((sum, s) => sum + s._count.referrer, 0);

    return sources.map(source => ({
      source: source.referrer || 'Direct',
      sessions: source._count.referrer,
      percentage: Math.round((source._count.referrer / total) * 100)
    }));
  }

  private async getUserEngagement(start: Date, end: Date) {
    const engagement = await prisma.siteAnalytics.findMany({
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      select: {
        date: true,
        pageViews: true,
        uniqueVisitors: true,
        avgSessionTime: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    return engagement.map(e => ({
      date: e.date.toISOString().split('T')[0],
      pageViews: e.pageViews,
      uniqueVisitors: e.uniqueVisitors,
      avgSessionDuration: e.avgSessionTime
    }));
  }

  private async getContentPerformance(start: Date, end: Date) {
    const content = await prisma.contentAnalytics.groupBy({
      by: ['contentId', 'contentType'],
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      _sum: {
        views: true,
        likes: true,
        comments: true,
        shares: true
      },
      orderBy: {
        _sum: {
          views: 'desc'
        }
      },
      take: 10
    });

    return content.map(c => ({
      title: `Content ${c.contentId}`,
      views: c._sum.views || 0,
      likes: c._sum.likes || 0,
      comments: c._sum.comments || 0,
      shares: c._sum.shares || 0
    }));
  }

  private async getUserDemographics(start: Date, end: Date) {
    // Get device breakdown
    const devices = await prisma.pageView.groupBy({
      by: ['device'],
      where: {
        timestamp: {
          gte: start,
          lte: end
        }
      },
      _count: {
        device: true
      }
    });

    const totalDevices = devices.reduce((sum, d) => sum + d._count.device, 0);

    // Get country breakdown
    const countries = await prisma.pageView.groupBy({
      by: ['country'],
      where: {
        timestamp: {
          gte: start,
          lte: end
        }
      },
      _count: {
        country: true
      }
    });

    const totalCountries = countries.reduce((sum, c) => sum + c._count.country, 0);

    return {
      ageGroups: [
        { age: '18-24', percentage: 25 },
        { age: '25-34', percentage: 35 },
        { age: '35-44', percentage: 20 },
        { age: '45+', percentage: 20 }
      ],
      locations: countries.map(country => ({
        country: country.country || 'Unknown',
        percentage: Math.round((country._count.country / totalCountries) * 100)
      })),
      devices: devices.map(device => ({
        device: device.device || 'Unknown',
        percentage: Math.round((device._count.device / totalDevices) * 100)
      }))
    };
  }

  private convertToCSV(data: any): string {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Page Views', data.siteAnalytics.totalPageViews],
      ['Unique Visitors', data.siteAnalytics.uniqueVisitors],
      ['Average Session Duration', data.siteAnalytics.avgSessionDuration],
      ['Bounce Rate', data.siteAnalytics.bounceRate],
      ['Conversion Rate', data.siteAnalytics.conversionRate]
    ];

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

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
      const categoryAnalytics = await this.getCategoryAnalyticsData(categories, start, end);

      res.json({
        success: true,
        data: categoryAnalytics,
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
          posts: {
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
          }
        }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Get category performance metrics
      const performance = await this.getCategoryPerformanceMetrics(categoryId, start, end);
      
      // Get content gaps analysis
      const contentGaps = await this.analyzeCategoryContentGaps(category);

      const analytics = {
        category,
        performance,
        contentGaps,
        timeRange: { start, end }
      };

      res.json({
        success: true,
        data: analytics,
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
      const { period = '30d', startDate, endDate } = req.query;
      
      // Calculate date range
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : this.getStartDate(period as string, end);

      const performance = await this.getCategoryPerformanceMetrics(categoryId, start, end);

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
   * Get category content gaps analysis
   */
  async getCategoryContentGaps(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          posts: {
            orderBy: {
              createdAt: 'desc'
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

      const contentGaps = await this.analyzeCategoryContentGaps(category);

      res.json({
        success: true,
        data: contentGaps,
        message: 'Category content gaps analysis retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching category content gaps:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category content gaps'
      });
    }
  }

  // Private helper methods for category analytics
  private async getCategoryAnalyticsData(categories: any[], start: Date, end: Date) {
    const analytics = [];

    for (const category of categories) {
      // Get posts in this category
      const posts = await prisma.post.findMany({
        where: {
          categoryId: category.id,
          createdAt: {
            gte: start,
            lte: end
          }
        },
        include: {
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        }
      });

      // Calculate metrics
      const totalPosts = posts.length;
      const totalLikes = posts.reduce((sum, post) => sum + post._count.likes, 0);
      const totalComments = posts.reduce((sum, post) => sum + post._count.comments, 0);
      const avgLikes = totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0;
      const avgComments = totalPosts > 0 ? Math.round(totalComments / totalPosts) : 0;

      // Calculate engagement rate
      const engagementRate = totalPosts > 0 ? 
        Math.round(((totalLikes + totalComments) / totalPosts) * 100) / 100 : 0;

      analytics.push({
        id: category.id,
        name: category.name,
        slug: category.slug,
        metrics: {
          totalPosts,
          subcategoryCount: category._count.children,
          totalLikes,
          totalComments,
          avgLikes,
          avgComments,
          engagementRate
        },
        trends: {
          postsGrowth: this.calculateGrowthRate(posts, 'createdAt'),
          engagementGrowth: this.calculateEngagementGrowth(posts)
        }
      });
    }

    return analytics.sort((a, b) => b.metrics.totalPosts - a.metrics.totalPosts);
  }

  private async getCategoryPerformanceMetrics(categoryId: string, start: Date, end: Date) {
    // Get posts in category for the period
    const posts = await prisma.post.findMany({
      where: {
        categoryId,
        createdAt: {
          gte: start,
          lte: end
        }
      },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    // Calculate performance metrics
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, post) => sum + post._count.likes, 0);
    const totalComments = posts.reduce((sum, post) => sum + post._count.comments, 0);
    const avgLikes = totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0;
    const avgComments = totalPosts > 0 ? Math.round(totalComments / totalPosts) : 0;

    // Calculate posting frequency
    const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const postsPerDay = daysInPeriod > 0 ? Math.round((totalPosts / daysInPeriod) * 100) / 100 : 0;

    // Calculate engagement rate
    const engagementRate = totalPosts > 0 ? 
      Math.round(((totalLikes + totalComments) / totalPosts) * 100) / 100 : 0;

    return {
      totalPosts,
      totalLikes,
      totalComments,
      avgLikes,
      avgComments,
      postsPerDay,
      engagementRate,
      performanceScore: this.calculatePerformanceScore({
        totalPosts,
        engagementRate,
        postsPerDay
      })
    };
  }

  private async analyzeCategoryContentGaps(category: any) {
    const gaps = [];

    // Check posting frequency
    const recentPosts = category.posts.slice(0, 5);
    if (recentPosts.length > 0) {
      const lastPostDate = new Date(recentPosts[0].createdAt);
      const daysSinceLastPost = Math.ceil((Date.now() - lastPostDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastPost > 14) {
        gaps.push({
          type: 'posting_frequency',
          severity: 'medium',
          title: 'Infrequent posting',
          description: `No posts in ${daysSinceLastPost} days`,
          suggestion: 'Consider creating more content for this category'
        });
      }
    }

    // Check content variety
    const uniqueAuthors = new Set(category.posts.map((post: any) => post.authorId)).size;
    if (uniqueAuthors < 2 && category.posts.length > 5) {
      gaps.push({
        type: 'content_variety',
        severity: 'low',
        title: 'Limited author diversity',
        description: `Only ${uniqueAuthors} author(s) contributing`,
        suggestion: 'Encourage more authors to contribute to this category'
      });
    }

    // Check engagement levels
    const avgLikes = category.posts.length > 0 ? 
      category.posts.reduce((sum: number, post: any) => sum + post._count.likes, 0) / category.posts.length : 0;
    
    if (avgLikes < 5 && category.posts.length > 3) {
      gaps.push({
        type: 'engagement',
        severity: 'medium',
        title: 'Low engagement',
        description: `Average of ${Math.round(avgLikes)} likes per post`,
        suggestion: 'Focus on creating more engaging content'
      });
    }

    return gaps;
  }

  private calculateGrowthRate(data: any[], dateField: string): number {
    if (data.length < 2) return 0;
    
    const sortedData = data.sort((a, b) => 
      new Date(a[dateField]).getTime() - new Date(b[dateField]).getTime()
    );
    
    const firstHalf = sortedData.slice(0, Math.ceil(data.length / 2));
    const secondHalf = sortedData.slice(Math.ceil(data.length / 2));
    
    const firstHalfCount = firstHalf.length;
    const secondHalfCount = secondHalf.length;
    
    if (firstHalfCount === 0) return secondHalfCount > 0 ? 100 : 0;
    
    return Math.round(((secondHalfCount - firstHalfCount) / firstHalfCount) * 100);
  }

  private calculateEngagementGrowth(posts: any[]): number {
    if (posts.length < 2) return 0;
    
    const sortedPosts = posts.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    const firstHalf = sortedPosts.slice(0, Math.ceil(posts.length / 2));
    const secondHalf = sortedPosts.slice(Math.ceil(posts.length / 2));
    
    const firstHalfEngagement = firstHalf.reduce((sum, post) => 
      sum + post._count.likes + post._count.comments, 0
    );
    const secondHalfEngagement = secondHalf.reduce((sum, post) => 
      sum + post._count.likes + post._count.comments, 0
    );
    
    if (firstHalfEngagement === 0) return secondHalfEngagement > 0 ? 100 : 0;
    
    return Math.round(((secondHalfEngagement - firstHalfEngagement) / firstHalfEngagement) * 100);
  }

  private calculatePerformanceScore(metrics: any): number {
    const { totalPosts, engagementRate, postsPerDay } = metrics;
    
    // Score based on multiple factors
    let score = 0;
    
    // Posts count (40% weight)
    if (totalPosts >= 10) score += 40;
    else if (totalPosts >= 5) score += 30;
    else if (totalPosts >= 2) score += 20;
    else score += 10;
    
    // Engagement rate (40% weight)
    if (engagementRate >= 10) score += 40;
    else if (engagementRate >= 5) score += 30;
    else if (engagementRate >= 2) score += 20;
    else score += 10;
    
    // Posting frequency (20% weight)
    if (postsPerDay >= 0.5) score += 20;
    else if (postsPerDay >= 0.2) score += 15;
    else if (postsPerDay >= 0.1) score += 10;
    else score += 5;
    
    return Math.min(score, 100);
  }
}

export const analyticsController = new AnalyticsController();
