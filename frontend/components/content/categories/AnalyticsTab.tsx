'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Clock, 
  FileText, 
  Activity, 
  Calendar,
  ArrowUpRight,
  Target,
  Zap,
  Download
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CategoryAnalytics {
  id: string;
  name: string;
  totalViews: number;
  totalPosts: number;
  avgViewsPerPost: number;
  growthRate: number;
  engagementRate: number;
  lastUpdated: string;
}

interface AnalyticsSummary {
  totalCategories: number;
  totalViews: number;
  totalPosts: number;
  avgEngagement: number;
  topPerformingCategory: string;
  growthTrend: number;
}

export default function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<CategoryAnalytics[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    fetchCategoryAnalytics();
  }, []);

  const fetchCategoryAnalytics = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please login to access Analytics features', variant: 'destructive' });
        return;
      }

      const response = await fetch('/api/analytics/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        toast({ title: 'Authentication Error', description: 'Please login again to continue', variant: 'destructive' });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalytics(data.data.categories || []);
          setSummary(data.data.summary || null);
        } else {
          throw new Error('Failed to fetch analytics');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching category analytics:', error);
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to fetch analytics', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };



  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSeverityColor = (value: number | undefined | null, type: 'positive' | 'negative' = 'positive') => {
    if (value === undefined || value === null) return 'text-gray-600';
    if (type === 'positive') {
      return value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600';
    } else {
      return value > 0 ? 'text-red-600' : value < 0 ? 'text-green-600' : 'text-gray-600';
    }
  };

  const getGrowthIcon = (value: number | undefined | null) => {
    if (value === undefined || value === null) return <Clock className="h-4 w-4 text-gray-600" />;
    if (value > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (value < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Clock className="h-4 w-4 text-gray-600" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalCategories}</div>
              <p className="text-xs text-muted-foreground">
                Active categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(summary.totalViews)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getGrowthIcon(summary.growthTrend)}
                <span className={`ml-1 ${getSeverityColor(summary.growthTrend)}`}>
                  {summary.growthTrend && summary.growthTrend > 0 ? '+' : ''}{summary.growthTrend || 0}% from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(summary.totalPosts)}</div>
              <p className="text-xs text-muted-foreground">
                Across all categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.avgEngagement}%</div>
              <p className="text-xs text-muted-foreground">
                Overall engagement rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Category Performance</span>
          </CardTitle>
          <CardDescription>
            Detailed analytics for each category
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No analytics data</h3>
              <p className="text-sm text-muted-foreground">Analytics data will appear here once categories have activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.map((category) => (
                <div 
                  key={category.id} 
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{category.name}</h4>
                        {category.growthRate > 0 && (
                          <Badge variant="default" className="text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +{category.growthRate}%
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                        <div className="text-center">
                          <div className="text-lg font-semibold">{formatNumber(category.totalViews)}</div>
                          <div className="text-xs text-muted-foreground">Total Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{category.totalPosts}</div>
                          <div className="text-xs text-muted-foreground">Posts</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{formatNumber(category.avgViewsPerPost)}</div>
                          <div className="text-xs text-muted-foreground">Avg Views/Post</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{category.engagementRate}%</div>
                          <div className="text-xs text-muted-foreground">Engagement</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        Updated {formatDate(category.lastUpdated)}
                      </span>
                      <Button size="sm" variant="outline">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedCategory === category.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">Performance Metrics</h5>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Views Today:</span>
                              <span className="font-medium">{formatNumber(Math.floor(category.totalViews * 0.1))}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Views This Week:</span>
                              <span className="font-medium">{formatNumber(Math.floor(category.totalViews * 0.3))}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Views This Month:</span>
                              <span className="font-medium">{formatNumber(Math.floor(category.totalViews * 0.8))}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">Content Analysis</h5>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Most Popular Post:</span>
                              <span className="font-medium">-</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Avg Reading Time:</span>
                              <span className="font-medium">5 min</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Bounce Rate:</span>
                              <span className="font-medium">45%</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">Growth Trends</h5>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Monthly Growth:</span>
                              <span className={`font-medium ${getSeverityColor(category.growthRate)}`}>
                                {category.growthRate > 0 ? '+' : ''}{category.growthRate}%
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Engagement Trend:</span>
                              <span className="font-medium text-green-600">+12%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Content Velocity:</span>
                              <span className="font-medium">2.3/week</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-4 w-4 mr-2" />
                          Export Report
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Common analytics actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Calendar className="h-6 w-6" />
              <span>Generate Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Download className="h-6 w-6" />
              <span>Export Data</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Target className="h-6 w-6" />
              <span>Set Goals</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
