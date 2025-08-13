'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Users, 
  Clock,
  Activity,
  RefreshCw,
  Download
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { analyticsService, AnalyticsMetrics } from '@/lib/services/analytics-service';

interface AnalyticsOverviewProps {
  filters?: {
    period: '7d' | '30d' | '90d' | '1y';
  };
}

export function AnalyticsOverview({ filters = { period: '30d' } }: AnalyticsOverviewProps) {
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState<{
    activeUsers: number;
    currentPageViews: number;
    topPages: { name: string; views: number; }[];
  }>({
    activeUsers: 0,
    currentPageViews: 0,
    topPages: []
  });

  useEffect(() => {
    loadAnalytics();
    loadRealTimeData();
    
    // Refresh real-time data every 30 seconds
    const interval = setInterval(loadRealTimeData, 30000);
    
    return () => clearInterval(interval);
  }, [filters.period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getAnalytics(filters);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeData = async () => {
    try {
      const data = await analyticsService.getRealTimeAnalytics();
      setRealTimeData(data);
    } catch (error) {
      console.error('Error loading real-time data:', error);
    }
  };

  const exportData = async () => {
    try {
      const blob = await analyticsService.exportAnalytics(filters, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${filters.period}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return <div>Error loading analytics data</div>;
  }

  const metrics = [
    {
      title: 'Total Page Views',
      value: analytics.pageViews.toLocaleString(),
      change: '+12.5%',
      trend: 'up' as const,
      icon: Eye,
      description: 'Total page views in selected period'
    },
    {
      title: 'Unique Visitors',
      value: analytics.uniqueVisitors.toLocaleString(),
      change: '+8.2%',
      trend: 'up' as const,
      icon: Users,
      description: 'Unique visitors in selected period'
    },
    {
      title: 'Avg. Session Duration',
      value: `${Math.floor(analytics.avgSessionDuration / 60)}m ${analytics.avgSessionDuration % 60}s`,
      change: '+5.1%',
      trend: 'up' as const,
      icon: Clock,
      description: 'Average session duration'
    },
    {
      title: 'Bounce Rate',
      value: `${analytics.bounceRate.toFixed(1)}%`,
      change: '-2.3%',
      trend: 'down' as const,
      icon: TrendingDown,
      description: 'Percentage of single-page sessions'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Real-time Data */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Analytics Overview</h2>
            <p className="text-muted-foreground">
              Real-time insights into your website performance
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            <span>{realTimeData.activeUsers} active now</span>
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {metric.change}
                </span>
                <span>vs last period</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Real-time Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Real-time Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{realTimeData.activeUsers}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{realTimeData.currentPageViews}</div>
              <div className="text-sm text-muted-foreground">Page Views Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.conversionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
            </div>
          </div>
          
          {realTimeData.topPages.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Top Pages Right Now</h4>
              <div className="space-y-2">
                {realTimeData.topPages.slice(0, 3).map((page, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="truncate">{page.name}</span>
                    <span className="text-muted-foreground">{page.views} views</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
