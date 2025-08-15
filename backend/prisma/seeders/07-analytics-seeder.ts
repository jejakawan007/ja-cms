/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { SeededUsers } from './01-users-seeder';
import { SeededContent } from './02-content-seeder';

export async function seedAnalytics(prisma: PrismaClient, users: SeededUsers, content: SeededContent) {
  console.log('  📊 Creating analytics data...');
  
  // Get first user as admin for analytics
  const adminUser = users[0]; // First user is super admin
  
  // Create site analytics for last 30 days
  const siteAnalytics = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    siteAnalytics.push(
      prisma.siteAnalytics.create({
        data: {
          date,
          pageViews: Math.floor(Math.random() * 2000) + 500,
          uniqueVisitors: Math.floor(Math.random() * 800) + 200,
          sessions: Math.floor(Math.random() * 1200) + 300,
          bounceRate: Math.random() * 0.5 + 0.2, // 20-70%
          avgSessionTime: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
          newVisitors: Math.floor(Math.random() * 400) + 100,
          returningVisitors: Math.floor(Math.random() * 400) + 100,
          conversionRate: Math.random() * 0.05 + 0.01 // 1-6%
        }
      })
    );
  }

  // Create page views
  const pageViews = [];
  const pages = ['/', '/about', '/blog', '/contact', '/services'];
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
  const countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France'];

  for (let i = 0; i < 1000; i++) {
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
    
    pageViews.push(
      prisma.pageView.create({
        data: {
          path: pages[Math.floor(Math.random() * pages.length)],
          title: `Sample Page ${Math.floor(Math.random() * 100)}`,
          referrer: Math.random() > 0.5 ? 'https://google.com' : null,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          country: countries[Math.floor(Math.random() * countries.length)],
          city: 'Sample City',
          device: devices[Math.floor(Math.random() * devices.length)],
          browser: browsers[Math.floor(Math.random() * browsers.length)],
          os: 'Windows',
          sessionId: `session_${Math.floor(Math.random() * 1000)}`,
          userId: adminUser.id,
          duration: Math.floor(Math.random() * 300) + 30,
          timestamp: randomDate
        }
      })
    );
  }

  // Create analytics sessions
  const sessions = [];
  for (let i = 0; i < 200; i++) {
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - Math.floor(Math.random() * 30));
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + Math.floor(Math.random() * 60) + 5);
    
    sessions.push(
      prisma.analyticsSession.create({
        data: {
          sessionId: `session_${i}`,
          userId: adminUser.id,
          startTime,
          endTime,
          duration: Math.floor((endTime.getTime() - startTime.getTime()) / 1000),
          pageViews: Math.floor(Math.random() * 10) + 1,
          isActive: Math.random() > 0.8, // 20% active sessions
          referrer: Math.random() > 0.5 ? 'https://google.com' : null,
          landingPage: '/',
          exitPage: pages[Math.floor(Math.random() * pages.length)],
          device: devices[Math.floor(Math.random() * devices.length)],
          browser: browsers[Math.floor(Math.random() * browsers.length)],
          os: 'Windows',
          country: countries[Math.floor(Math.random() * countries.length)],
          city: 'Sample City',
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`
        }
      })
    );
  }

  // Create content analytics for posts (if posts exist)
  const contentAnalytics = [];
  if (content.posts > 0) {
    // Get actual posts from database
    const posts = await prisma.post.findMany({
      take: 5,
      select: { id: true }
    });
    
    for (const post of posts) {
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        contentAnalytics.push(
          prisma.contentAnalytics.create({
            data: {
              contentId: post.id,
              contentType: 'post',
              date,
              views: Math.floor(Math.random() * 500) + 100,
              uniqueViews: Math.floor(Math.random() * 300) + 50,
              likes: Math.floor(Math.random() * 50) + 5,
              shares: Math.floor(Math.random() * 20) + 1,
              comments: Math.floor(Math.random() * 15) + 1,
              avgTimeOnPage: Math.floor(Math.random() * 300) + 60,
              bounceRate: Math.random() * 0.4 + 0.1,
              exitRate: Math.random() * 0.3 + 0.1
            }
          })
        );
      }
    }
  }

  // Create user analytics
  const userAnalytics = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    userAnalytics.push(
      prisma.userAnalytics.create({
        data: {
          userId: adminUser.id,
          date,
          sessionsCount: Math.floor(Math.random() * 5) + 1,
          pageViews: Math.floor(Math.random() * 50) + 10,
          timeSpent: Math.floor(Math.random() * 3600) + 300, // 5-65 minutes
          actionsCount: Math.floor(Math.random() * 20) + 5,
          postsCreated: Math.floor(Math.random() * 3) + 1,
          postsUpdated: Math.floor(Math.random() * 5) + 1,
          commentsPosted: Math.floor(Math.random() * 10) + 1,
          likesGiven: Math.floor(Math.random() * 15) + 1
        }
      })
    );
  }

  // Create analytics events
  const events = [];
  const eventTypes = [
    { name: 'page_view', category: 'engagement', action: 'view' },
    { name: 'button_click', category: 'interaction', action: 'click' },
    { name: 'form_submit', category: 'conversion', action: 'submit' },
    { name: 'scroll', category: 'engagement', action: 'scroll' },
    { name: 'download', category: 'conversion', action: 'download' }
  ];

  for (let i = 0; i < 500; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 30));
    
    events.push(
      prisma.analyticsEvent.create({
        data: {
          eventName: eventType.name,
          category: eventType.category,
          action: eventType.action,
          label: `Sample Label ${Math.floor(Math.random() * 100)}`,
          value: Math.floor(Math.random() * 100) + 1,
          userId: adminUser.id,
          sessionId: `session_${Math.floor(Math.random() * 200)}`,
          path: pages[Math.floor(Math.random() * pages.length)],
          properties: {
            device: devices[Math.floor(Math.random() * devices.length)],
            browser: browsers[Math.floor(Math.random() * browsers.length)],
            country: countries[Math.floor(Math.random() * countries.length)]
          },
          timestamp
        }
      })
    );
  }

  // Create sample reports
  const reports = [
    prisma.report.create({
      data: {
        name: 'Daily Site Overview',
        description: 'Daily overview of site performance and traffic',
        type: 'dashboard',
        config: {
          metrics: ['pageViews', 'uniqueVisitors', 'bounceRate'],
          timeRange: '1d',
          refreshInterval: 3600
        },
        schedule: '0 9 * * *', // Daily at 9 AM
        isActive: true,
        createdBy: adminUser.id
      }
    }),
    prisma.report.create({
      data: {
        name: 'Weekly Content Performance',
        description: 'Weekly analysis of content performance',
        type: 'content',
        config: {
          metrics: ['views', 'likes', 'comments', 'shares'],
          timeRange: '7d',
          contentTypes: ['post', 'page']
        },
        schedule: '0 10 * * 1', // Weekly on Monday at 10 AM
        isActive: true,
        createdBy: adminUser.id
      }
    })
  ];

  // Execute all database operations
  const results = await Promise.all([
    ...siteAnalytics,
    ...pageViews,
    ...sessions,
    ...contentAnalytics,
    ...userAnalytics,
    ...events,
    ...reports
  ]);

  console.log(`  ✅ Created ${results.length} analytics records`);

  return { 
    siteAnalytics: siteAnalytics.length,
    pageViews: pageViews.length,
    sessions: sessions.length,
    contentAnalytics: contentAnalytics.length,
    userAnalytics: userAnalytics.length,
    events: events.length,
    reports: reports.length
  };
}

export type SeededAnalytics = Awaited<ReturnType<typeof seedAnalytics>>;
