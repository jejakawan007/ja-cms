'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  FolderOpen, 
  MessageSquare, 
  Settings, 
  Brain,
  Activity, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface ContentStats {
  totalPosts: number;
  totalPages: number;
  totalCategories: number;
  totalComments: number;
  publishedContent: number;
  draftContent: number;
  recentActivity: number;
  contentViews: number;
}

export default function ContentPage() {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContentStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please login to access Content features', variant: 'destructive' });
        return;
      }
      
      const response = await fetch('/api/content/stats', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.status === 401) {
        toast({ title: 'Authentication Error', description: 'Please login again to continue', variant: 'destructive' });
        return;
      }
      if (response.ok) { 
        const data = await response.json(); 
        if (data.success) { 
          setStats(data.data); 
        } else { 
          throw new Error('Failed to fetch stats'); 
        } 
      } else { 
        const errorData = await response.json().catch(() => ({})); 
        throw new Error(errorData.message || 'Failed to fetch stats'); 
      }
    } catch (error) { 
      console.error('Error fetching content stats:', error); 
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to fetch content statistics', variant: 'destructive' }); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContentStats();
  }, [fetchContentStats]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Activity className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading Content Management...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Content</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Content Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage all your content including posts, pages, categories, and more
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={fetchContentStats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                Published: {stats.publishedContent} | Draft: {stats.draftContent}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPages}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <FolderOpen className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCategories}</div>
              <p className="text-xs text-muted-foreground">
                +5 categories this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComments}</div>
              <p className="text-xs text-muted-foreground">
                +23% from last month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Management Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Posts Management */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/content/posts">
            <CardHeader>
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 text-blue-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle>Posts</CardTitle>
              <CardDescription>
                Create, edit, and manage your blog posts and articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Posts</span>
                  <Badge variant="secondary">{stats?.totalPosts || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Published</span>
                  <span className="text-sm font-medium">{stats?.publishedContent || 0}</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Pages Management */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/content/pages">
            <CardHeader>
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 text-green-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle>Pages</CardTitle>
              <CardDescription>
                Manage static pages like About, Contact, and landing pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Pages</span>
                  <Badge variant="secondary">{stats?.totalPages || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <span className="text-sm font-medium">{stats?.totalPages || 0}</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Categories Management */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/content/categories">
            <CardHeader>
              <div className="flex items-center justify-between">
                <FolderOpen className="h-8 w-8 text-purple-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Organize content with categories and tags
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Categories</span>
                  <Badge variant="secondary">{stats?.totalCategories || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tags</span>
                  <span className="text-sm font-medium">24</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Comments Management */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/content/comments">
            <CardHeader>
              <div className="flex items-center justify-between">
                <MessageSquare className="h-8 w-8 text-orange-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle>Comments</CardTitle>
              <CardDescription>
                Moderate and manage user comments and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Comments</span>
                  <Badge variant="secondary">{stats?.totalComments || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="text-sm font-medium">5</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Advanced Features */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/content/advanced">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Settings className="h-8 w-8 text-indigo-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle>Advanced</CardTitle>
              <CardDescription>
                SEO optimization, content gaps, and workflow automation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">SEO Score</span>
                  <Badge variant="secondary">87/100</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Workflows</span>
                  <span className="text-sm font-medium">3 Active</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* AI-Powered Features */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/content/ai-powered">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Brain className="h-8 w-8 text-pink-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle>AI-Powered</CardTitle>
              <CardDescription>
                AI-powered content intelligence and automation tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">AI Features</span>
                  <Badge variant="secondary">6 Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Accuracy</span>
                  <span className="text-sm font-medium">94.2%</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common content management tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2" asChild>
              <Link href="/dashboard/content/posts/new">
                <FileText className="h-5 w-5" />
                <span>Create Post</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2" asChild>
              <Link href="/dashboard/content/pages/new">
                <FileText className="h-5 w-5" />
                <span>Create Page</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2" asChild>
              <Link href="/dashboard/content/categories/new">
                <FolderOpen className="h-5 w-5" />
                <span>Add Category</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2" asChild>
              <Link href="/dashboard/content/ai-powered">
                <Brain className="h-5 w-5" />
                <span>AI Analysis</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
