'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Eye, 
  FileText, 
  AlertTriangle,
  Activity,
  Target
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CategoryAnalytics {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  subcategoryCount: number;
  analytics: {
    views: number;
    uniqueViews: number;
    likes: number;
    shares: number;
    comments: number;
    avgTimeOnPage: number;
    bounceRate: number;
    exitRate: number;
  };
}

interface AnalyticsSummary {
  totalCategories: number;
  activeCategories: number;
  totalPosts: number;
  totalViews: number;
  avgViewsPerCategory: number;
  topPerformer: CategoryAnalytics | null;
}

interface ContentGap {
  type: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestion: string;
}

export default function CategoryAnalyticsPage() {
  const [analytics, setAnalytics] = useState<CategoryAnalytics[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryDetails, setCategoryDetails] = useState<any>(null);
  const [contentGaps, setContentGaps] = useState<ContentGap[]>([]);
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategoryAnalytics();
  }, [timeRange]);

  const fetchCategoryAnalytics = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('ja-cms-token');
      
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please login to view analytics',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(`/api/analytics/categories?period=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalytics(data.data.categories);
          setSummary(data.data.summary);
        }
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching category analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch category analytics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoryDetails = async (categoryId: string) => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      
      const response = await fetch(`/api/analytics/categories/${categoryId}?period=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategoryDetails(data.data);
        }
      }

      // Fetch content gaps
      const gapsResponse = await fetch(`/api/analytics/categories/${categoryId}/content-gaps`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (gapsResponse.ok) {
        const gapsData = await gapsResponse.json();
        if (gapsData.success) {
          setContentGaps(gapsData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching category details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch category details',
        variant: 'destructive',
      });
    } finally {
      // setIsLoadingDetails(false); // Removed as per edit hint
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    fetchCategoryDetails(categoryId);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getPerformanceScore = (analytics: any): number => {
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
    const timeScore = Math.min(analytics.avgTimeOnPage / 300, 1) * 20;
    score += timeScore;
    
    // Bounce rate weight: 10% (inverse)
    const bounceScore = Math.max(0, (1 - analytics.bounceRate / 100)) * 10;
    score += bounceScore;
    
    return Math.round(score);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Category Analytics</h1>
            <p className="text-muted-foreground mt-2">Loading analytics data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Category Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track performance and insights for your content categories
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchCategoryAnalytics} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

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
                {summary.activeCategories} active
              </p>
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
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(summary.totalViews)}</div>
              <p className="text-xs text-muted-foreground">
                Avg {formatNumber(summary.avgViewsPerCategory)} per category
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {summary.topPerformer?.name || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(summary.topPerformer?.analytics.views || 0)} views
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>
                Performance metrics for all categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.map((category) => {
                  const performanceScore = getPerformanceScore(category.analytics);
                  const isSelected = selectedCategory === category.id;
                  
                  return (
                    <div
                      key={category.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-border/80'
                      }`}
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold">{category.name}</h3>
                            <Badge variant="outline">
                              {category.postCount} posts
                            </Badge>
                            {category.subcategoryCount > 0 && (
                              <Badge variant="secondary">
                                {category.subcategoryCount} subcategories
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                            <div className="text-sm">
                              <div className="text-muted-foreground">Views</div>
                              <div className="font-medium">{formatNumber(category.analytics.views)}</div>
                            </div>
                            <div className="text-sm">
                              <div className="text-muted-foreground">Engagement</div>
                              <div className="font-medium">
                                {category.analytics.views > 0 
                                  ? (((category.analytics.likes + category.analytics.comments + category.analytics.shares) / category.analytics.views) * 100).toFixed(1)
                                  : '0'
                                }%
                              </div>
                            </div>
                            <div className="text-sm">
                              <div className="text-muted-foreground">Time on Page</div>
                              <div className="font-medium">{formatTime(category.analytics.avgTimeOnPage)}</div>
                            </div>
                            <div className="text-sm">
                              <div className="text-muted-foreground">Performance</div>
                              <div className="font-medium">{performanceScore}/100</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <div className="w-16 h-16 rounded-full border-4 border-muted flex items-center justify-center">
                            <div className="text-sm font-bold">{performanceScore}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Details */}
        <div className="space-y-6">
          {selectedCategory && categoryDetails ? (
            <>
              {/* Category Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>{categoryDetails.category.name}</span>
                  </CardTitle>
                  <CardDescription>
                    Detailed analytics and insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{categoryDetails.category.postCount}</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{formatNumber(categoryDetails.analytics.views)}</div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Engagement Rate</span>
                      <span className="font-medium">
                        {categoryDetails.analytics.views > 0 
                          ? (((categoryDetails.analytics.likes + categoryDetails.analytics.comments + categoryDetails.analytics.shares) / categoryDetails.analytics.views) * 100).toFixed(1)
                          : '0'
                        }%
                      </span>
                    </div>
                    <Progress 
                      value={categoryDetails.analytics.views > 0 
                        ? ((categoryDetails.analytics.likes + categoryDetails.analytics.comments + categoryDetails.analytics.shares) / categoryDetails.analytics.views) * 100
                        : 0
                      } 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Content Gaps */}
              {contentGaps.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <span>Content Gaps</span>
                    </CardTitle>
                    <CardDescription>
                      Areas that need attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {contentGaps.map((gap, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-start space-x-2">
                            <Badge variant={getSeverityColor(gap.severity)} className="mt-1">
                              {gap.severity}
                            </Badge>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{gap.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {gap.description}
                              </p>
                              <p className="text-xs text-primary mt-1">
                                💡 {gap.suggestion}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Posts */}
              {categoryDetails.posts && categoryDetails.posts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Recent Posts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categoryDetails.posts.slice(0, 5).map((post: any) => (
                        <div key={post.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{post.title}</h4>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>{post.likeCount} likes</span>
                              <span>•</span>
                              <span>{post.commentCount} comments</span>
                            </div>
                          </div>
                          <Badge variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                            {post.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
                <CardDescription>
                  Select a category to view detailed analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click on a category to see detailed analytics</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
