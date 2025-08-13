'use client';

import { AnalyticsOverview } from '@/components/analytics/analytics-overview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Users, 
  Download,
  Filter,
  BarChart3,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { analyticsService, AnalyticsMetrics } from '@/lib/services/analytics-service';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  // Load analytics data
  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getAnalytics({ period: selectedPeriod });
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and period change
  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed insights into your website performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Time Period:</span>
            </div>
            <div className="flex gap-2">
              {(['7d', '30d', '90d', '1y'] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period === '7d' && 'Last 7 days'}
                  {period === '30d' && 'Last 30 days'}
                  {period === '90d' && 'Last 90 days'}
                  {period === '1y' && 'Last year'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Overview */}
      <AnalyticsOverview filters={{ period: selectedPeriod }} />

      {/* Detailed Analytics */}
      {analytics && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Top Pages</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPages.slice(0, 5).map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{page.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDuration(page.avgTimeOnPage)} avg. time
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(page.views)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatNumber(page.uniqueViews)} unique
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Traffic Sources</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.trafficSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{source.source}</div>
                        <div className="text-sm text-muted-foreground">
                          {source.sessions.toLocaleString()} sessions
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{source.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Demographics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>User Demographics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Age Groups */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Age Groups</h4>
                  <div className="space-y-2">
                    {analytics.userDemographics.ageGroups.map((age, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{age.age}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${age.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{age.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Devices */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Devices</h4>
                  <div className="space-y-2">
                    {analytics.userDemographics.devices.map((device, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {device.device === 'Desktop' && <Monitor className="h-4 w-4" />}
                          {device.device === 'Mobile' && <Smartphone className="h-4 w-4" />}
                          {device.device === 'Tablet' && <Monitor className="h-4 w-4" />}
                          <span className="text-sm">{device.device}</span>
                        </div>
                        <span className="text-sm font-medium">{device.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Content Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.contentPerformance.slice(0, 5).map((content, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{content.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {content.likes} likes • {content.comments} comments • {content.shares} shares
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-medium">{formatNumber(content.views)}</div>
                      <div className="text-sm text-muted-foreground">views</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 bg-gray-200 animate-pulse rounded w-32"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div>
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
