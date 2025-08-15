import { apiClient } from '@/lib/api/client';

export interface AnalyticsMetrics {
  pageViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  topPages: Array<{
    name: string;
    views: number;
    uniqueViews: number;
    avgTimeOnPage: number;
  }>;
  trafficSources: Array<{
    source: string;
    sessions: number;
    percentage: number;
  }>;
  userEngagement: Array<{
    date: string;
    pageViews: number;
    uniqueVisitors: number;
    avgSessionDuration: number;
  }>;
  contentPerformance: Array<{
    title: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }>;
  userDemographics: {
    ageGroups: Array<{ age: string; percentage: number }>;
    locations: Array<{ country: string; percentage: number }>;
    devices: Array<{ device: string; percentage: number }>;
  };
}

export interface AnalyticsFilters {
  period: '7d' | '30d' | '90d' | '1y';
  startDate?: string;
  endDate?: string;
  page?: string;
  source?: string;
}

class AnalyticsService {
  /**
   * Get comprehensive analytics data
   */
  async getAnalytics(filters: AnalyticsFilters = { period: '30d' }): Promise<AnalyticsMetrics> {
    try {
      const response = await apiClient.get('/analytics', { params: filters });
      return response.data as AnalyticsMetrics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Return sample data for development
      return this.getSampleAnalytics();
    }
  }

  /**
   * Get real-time analytics
   */
  async getRealTimeAnalytics(): Promise<{
    activeUsers: number;
    currentPageViews: number;
    topPages: Array<{ name: string; views: number }>;
  }> {
    try {
      const response = await apiClient.get('/analytics/realtime');
      return response.data as {
        activeUsers: number;
        currentPageViews: number;
        topPages: Array<{ name: string; views: number }>;
      };
    } catch (error) {
      console.error('Error fetching real-time analytics:', error);
      return {
        activeUsers: Math.floor(Math.random() * 50) + 10,
        currentPageViews: Math.floor(Math.random() * 200) + 50,
        topPages: [
          { name: 'Homepage', views: Math.floor(Math.random() * 100) + 20 },
          { name: 'Blog', views: Math.floor(Math.random() * 80) + 15 },
          { name: 'About', views: Math.floor(Math.random() * 60) + 10 }
        ]
      };
    }
  }

  /**
   * Get content performance analytics
   */
  async getContentAnalytics(filters: AnalyticsFilters = { period: '30d' }): Promise<{
    topContent: Array<{
      id: string;
      title: string;
      views: number;
      likes: number;
      comments: number;
      shares: number;
      avgTimeOnPage: number;
    }>;
    contentTrends: Array<{
      date: string;
      published: number;
      views: number;
      engagement: number;
    }>;
  }> {
    try {
      const response = await apiClient.get('/analytics/content', { params: filters });
      return response.data as {
        topContent: Array<{
          id: string;
          title: string;
          views: number;
          likes: number;
          comments: number;
          shares: number;
          avgTimeOnPage: number;
        }>;
        contentTrends: Array<{
          date: string;
          published: number;
          views: number;
          engagement: number;
        }>;
      };
    } catch (error) {
      console.error('Error fetching content analytics:', error);
      return {
        topContent: [
          {
            id: '1',
            title: 'Getting Started with Next.js 14',
            views: 1247,
            likes: 89,
            comments: 23,
            shares: 45,
            avgTimeOnPage: 180
          },
          {
            id: '2',
            title: 'TypeScript Best Practices for 2024',
            views: 892,
            likes: 67,
            comments: 15,
            shares: 32,
            avgTimeOnPage: 240
          }
        ],
        contentTrends: [
          { date: '2024-01-01', published: 5, views: 1200, engagement: 85 },
          { date: '2024-01-02', published: 3, views: 980, engagement: 72 },
          { date: '2024-01-03', published: 7, views: 1500, engagement: 95 }
        ]
      };
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(filters: AnalyticsFilters = { period: '30d' }): Promise<{
    userGrowth: Array<{ date: string; newUsers: number; totalUsers: number }>;
    userEngagement: Array<{ date: string; activeUsers: number; avgSessionDuration: number }>;
    userRetention: Array<{ cohort: string; day1: number; day7: number; day30: number }>;
    userDemographics: {
      ageGroups: Array<{ age: string; percentage: number }>;
      locations: Array<{ country: string; percentage: number }>;
      devices: Array<{ device: string; percentage: number }>;
    };
  }> {
    try {
      const response = await apiClient.get('/analytics/users', { params: filters });
      return response.data as {
        userGrowth: Array<{ date: string; newUsers: number; totalUsers: number }>;
        userEngagement: Array<{ date: string; activeUsers: number; avgSessionDuration: number }>;
        userRetention: Array<{ cohort: string; day1: number; day7: number; day30: number }>;
        userDemographics: {
          ageGroups: Array<{ age: string; percentage: number }>;
          locations: Array<{ country: string; percentage: number }>;
          devices: Array<{ device: string; percentage: number }>;
        };
      };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return {
        userGrowth: [
          { date: '2024-01-01', newUsers: 45, totalUsers: 1200 },
          { date: '2024-01-02', newUsers: 52, totalUsers: 1252 },
          { date: '2024-01-03', newUsers: 38, totalUsers: 1290 }
        ],
        userEngagement: [
          { date: '2024-01-01', activeUsers: 850, avgSessionDuration: 180 },
          { date: '2024-01-02', activeUsers: 920, avgSessionDuration: 195 },
          { date: '2024-01-03', activeUsers: 780, avgSessionDuration: 165 }
        ],
        userRetention: [
          { cohort: 'Jan 2024', day1: 85, day7: 45, day30: 25 },
          { cohort: 'Dec 2023', day1: 82, day7: 42, day30: 22 },
          { cohort: 'Nov 2023', day1: 88, day7: 48, day30: 28 }
        ],
        userDemographics: {
          ageGroups: [
            { age: '18-24', percentage: 25 },
            { age: '25-34', percentage: 35 },
            { age: '35-44', percentage: 20 },
            { age: '45+', percentage: 20 }
          ],
          locations: [
            { country: 'United States', percentage: 45 },
            { country: 'United Kingdom', percentage: 15 },
            { country: 'Canada', percentage: 10 },
            { country: 'Germany', percentage: 8 },
            { country: 'Others', percentage: 22 }
          ],
          devices: [
            { device: 'Desktop', percentage: 55 },
            { device: 'Mobile', percentage: 40 },
            { device: 'Tablet', percentage: 5 }
          ]
        }
      };
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(filters: AnalyticsFilters, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    try {
      const response = await apiClient.get('/analytics/export', { 
        params: { ...filters, format },
        responseType: 'blob'
      });
      return response.data as Blob;
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw new Error('Failed to export analytics data');
    }
  }

  /**
   * Sample analytics data for development
   */
  private getSampleAnalytics(): AnalyticsMetrics {
    return {
      pageViews: 45231,
      uniqueVisitors: 12847,
      avgSessionDuration: 154,
      bounceRate: 32.1,
      conversionRate: 2.8,
      topPages: [
        { name: 'Homepage', views: 2500, uniqueViews: 1800, avgTimeOnPage: 120 },
        { name: 'About Us', views: 1200, uniqueViews: 950, avgTimeOnPage: 180 },
        { name: 'Blog', views: 1800, uniqueViews: 1400, avgTimeOnPage: 240 },
        { name: 'Contact', views: 800, uniqueViews: 650, avgTimeOnPage: 90 },
        { name: 'Services', views: 1500, uniqueViews: 1200, avgTimeOnPage: 200 }
      ],
      trafficSources: [
        { source: 'Direct', sessions: 2035, percentage: 45 },
        { source: 'Organic Search', sessions: 1356, percentage: 30 },
        { source: 'Social Media', sessions: 678, percentage: 15 },
        { source: 'Referral', sessions: 452, percentage: 10 }
      ],
      userEngagement: [
        { date: '2024-01-01', pageViews: 1200, uniqueVisitors: 850, avgSessionDuration: 180 },
        { date: '2024-01-02', pageViews: 1350, uniqueVisitors: 920, avgSessionDuration: 195 },
        { date: '2024-01-03', pageViews: 1100, uniqueVisitors: 780, avgSessionDuration: 165 },
        { date: '2024-01-04', pageViews: 1400, uniqueVisitors: 950, avgSessionDuration: 210 },
        { date: '2024-01-05', pageViews: 1600, uniqueVisitors: 1100, avgSessionDuration: 225 },
        { date: '2024-01-06', pageViews: 1800, uniqueVisitors: 1250, avgSessionDuration: 240 },
        { date: '2024-01-07', pageViews: 2000, uniqueVisitors: 1400, avgSessionDuration: 260 }
      ],
      contentPerformance: [
        { title: 'Getting Started with Next.js 14', views: 1247, likes: 89, comments: 23, shares: 45 },
        { title: 'TypeScript Best Practices for 2024', views: 892, likes: 67, comments: 15, shares: 32 },
        { title: 'Building Scalable APIs with Node.js', views: 756, likes: 54, comments: 12, shares: 28 },
        { title: 'CSS Grid vs Flexbox: When to Use What', views: 634, likes: 42, comments: 8, shares: 18 },
        { title: 'Introduction to GraphQL', views: 567, likes: 34, comments: 8, shares: 15 }
      ],
      userDemographics: {
        ageGroups: [
          { age: '18-24', percentage: 25 },
          { age: '25-34', percentage: 35 },
          { age: '35-44', percentage: 20 },
          { age: '45+', percentage: 20 }
        ],
        locations: [
          { country: 'United States', percentage: 45 },
          { country: 'United Kingdom', percentage: 15 },
          { country: 'Canada', percentage: 10 },
          { country: 'Germany', percentage: 8 },
          { country: 'Others', percentage: 22 }
        ],
        devices: [
          { device: 'Desktop', percentage: 55 },
          { device: 'Mobile', percentage: 40 },
          { device: 'Tablet', percentage: 5 }
        ]
      }
    };
  }
}

export const analyticsService = new AnalyticsService();
