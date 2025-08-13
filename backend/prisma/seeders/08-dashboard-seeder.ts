import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDashboard() {
  console.log('🌐 Seeding Dashboard Data...');

  try {
    // Create default dashboard widgets
    const defaultWidgets = [
      {
        name: 'overview_stats',
        title: 'Overview Statistics',
        description: 'Key metrics and statistics overview',
        type: 'STATS_CARD' as const,
        category: 'OVERVIEW' as const,
        icon: 'BarChart3',
        component: 'StatsCardWidget',
        isActive: true,
        isDefault: true,
        sortOrder: 1,
        permissions: ['SUPER_ADMIN', 'ADMIN'],
        config: {
          showTrends: true,
          refreshInterval: 30000,
          maxItems: 4
        }
      },
      {
        name: 'analytics_chart',
        title: 'Analytics Overview',
        description: 'Interactive area chart with multiple data sources',
        type: 'CHART' as const,
        category: 'ANALYTICS' as const,
        icon: 'TrendingUp',
        component: 'AnalyticsChartWidget',
        isActive: true,
        isDefault: true,
        sortOrder: 2,
        permissions: ['SUPER_ADMIN', 'ADMIN'],
        config: {
          defaultMetric: 'pageViews',
          timeRange: '30d',
          showLegend: true,
          responsive: true
        }
      },
      {
        name: 'quick_actions',
        title: 'Quick Actions',
        description: 'Frequently used actions and shortcuts',
        type: 'QUICK_ACTIONS' as const,
        category: 'OVERVIEW' as const,
        icon: 'Zap',
        component: 'QuickActionsWidget',
        isActive: true,
        isDefault: true,
        sortOrder: 3,
        permissions: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
        config: {
          maxActions: 6,
          showIcons: true,
          showDescriptions: true
        }
      },
      {
        name: 'recent_activity',
        title: 'Recent Activity',
        description: 'Latest activities and updates',
        type: 'ACTIVITY_FEED' as const,
        category: 'CONTENT' as const,
        icon: 'Activity',
        component: 'RecentActivityWidget',
        isActive: true,
        isDefault: true,
        sortOrder: 4,
        permissions: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
        config: {
          maxItems: 10,
          showUserAvatars: true,
          showTimestamps: true,
          autoRefresh: true
        }
      }
    ];

    // Create widgets
    for (const widget of defaultWidgets) {
      await prisma.dashboardWidget.upsert({
        where: { name: widget.name },
        update: widget,
        create: widget
      });
    }

    // Create default dashboard settings for existing users
    const users = await prisma.user.findMany({
      select: { id: true, email: true }
    });

    for (const user of users) {
      await prisma.dashboardSettings.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          layoutMode: 'default',
          theme: 'neutral',
          widgets: {
            quickActions: {
              enabled: true,
              maxActions: 8,
              showIcons: true,
            },
            recentActivity: {
              enabled: true,
              maxItems: 8,
              showUserAvatars: true,
              showTimestamps: true,
            },
            analyticsChart: {
              enabled: true,
              defaultMetric: 'overview',
              timeRange: '30d',
              chartType: 'area',
            },
            statsCards: {
              enabled: true,
              showSystemHealth: true,
              showSecurityStatus: true,
              layout: 'grid',
            },
          },
          layout: {
            gridColumns: 3,
            widgetSpacing: 'normal',
          },
          appearance: {
            theme: 'system',
            cardStyle: 'flat',
          },
          data: {
            retentionPeriod: 24,
            cacheEnabled: true,
          },
          gridLayout: null,
        }
      });
    }

    // Create sample notifications
    const sampleNotifications = [
      {
        title: 'System Update Available',
        message: 'A new system update is available for installation',
        type: 'info',
        isRead: false
      },
      {
        title: 'New User Registration',
        message: 'A new user has registered: john.doe@example.com',
        type: 'info',
        isRead: false
      },
      {
        title: 'Database Backup Completed',
        message: 'Daily database backup completed successfully',
        type: 'success',
        isRead: true
      }
    ];

    // Create notifications
    for (const notification of sampleNotifications) {
      await prisma.notification.create({
        data: notification
      });
    }

    // Create sample system health metrics
    const systemHealthMetrics = [
      {
        storageUsed: BigInt(50000000000), // 50GB
        storageTotal: BigInt(1000000000000), // 1TB
        memoryUsage: 65.5,
        cpuUsage: 45.2,
        uptimeSeconds: BigInt(86400), // 24 hours
        activeConnections: 125,
        databaseSize: BigInt(2500000000), // 2.5GB
        cacheHitRate: 92.5
      },
      {
        storageUsed: BigInt(52000000000), // 52GB
        storageTotal: BigInt(1000000000000), // 1TB
        memoryUsage: 68.1,
        cpuUsage: 47.8,
        uptimeSeconds: BigInt(90000), // 25 hours
        activeConnections: 142,
        databaseSize: BigInt(2550000000), // 2.55GB
        cacheHitRate: 91.8
      }
    ];

    // Create system health metrics
    for (const metric of systemHealthMetrics) {
      await prisma.dashboardSystemHealthMetric.create({
        data: {
          storageUsed: metric.storageUsed,
          storageTotal: metric.storageTotal,
          memoryUsage: metric.memoryUsage,
          cpuUsage: metric.cpuUsage,
          uptimeSeconds: metric.uptimeSeconds,
          activeConnections: metric.activeConnections,
          databaseSize: metric.databaseSize,
          cacheHitRate: metric.cacheHitRate
        }
      });
    }

    // Create sample dashboard activities
    const sampleActivities = [
      {
        action: 'POST_CREATED',
        entityType: 'post',
        entityId: 'post_123',
        description: 'Created new post: "Getting Started with JA-CMS"',
        metadata: {
          postTitle: 'Getting Started with JA-CMS',
          category: 'Tutorial'
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        action: 'USER_REGISTERED',
        entityType: 'user',
        entityId: 'user_456',
        description: 'New user registered: jane.smith@example.com',
        metadata: {
          email: 'jane.smith@example.com',
          role: 'EDITOR'
        },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        action: 'MEDIA_UPLOADED',
        entityType: 'media',
        entityId: 'media_789',
        description: 'Uploaded new media file: hero-image.jpg',
        metadata: {
          fileName: 'hero-image.jpg',
          fileSize: '2.5MB',
          mimeType: 'image/jpeg'
        },
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Linux x86_64) AppleWebKit/537.36'
      }
    ];

    // Get admin user for activities
    const adminUser = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (adminUser) {
      // Create dashboard activities
      for (const activity of sampleActivities) {
        await prisma.dashboardActivity.create({
          data: {
            ...activity,
            userId: adminUser.id
          }
        });
      }
    }

    // Create sample chart data cache
    const chartDataCache = [
      {
        chartType: 'pageViews',
        data: [
          { name: 'Jan 1', value: 1200 },
          { name: 'Jan 2', value: 1350 },
          { name: 'Jan 3', value: 1100 },
          { name: 'Jan 4', value: 1500 },
          { name: 'Jan 5', value: 1400 }
        ],
        filters: { timeRange: '7d', metric: 'pageViews' },
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      },
      {
        chartType: 'uniqueVisitors',
        data: [
          { name: 'Jan 1', value: 800 },
          { name: 'Jan 2', value: 950 },
          { name: 'Jan 3', value: 750 },
          { name: 'Jan 4', value: 1100 },
          { name: 'Jan 5', value: 1000 }
        ],
        filters: { timeRange: '7d', metric: 'uniqueVisitors' },
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      }
    ];

    // Create chart data cache
    for (const cache of chartDataCache) {
      await prisma.chartDataCache.create({
        data: cache
      });
    }

    console.log('✅ Dashboard data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding dashboard data:', error);
    throw error;
  }
}
