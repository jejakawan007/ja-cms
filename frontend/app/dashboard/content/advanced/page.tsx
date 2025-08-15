'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Target, 
  Workflow,
  Activity, 
  RefreshCw,
  BarChart3,
  ArrowRight,
  Zap
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

interface AdvancedStats {
  seoScore: number;
  contentGaps: number;
  activeWorkflows: number;
  optimizationOpportunities: number;
}

export default function AdvancedPage() {
  const [stats, setStats] = useState<AdvancedStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdvancedStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please login to access Advanced features', variant: 'destructive' });
        return;
      }
      
      const response = await fetch('/api/advanced/stats', { headers: { 'Authorization': `Bearer ${token}` } });
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
      console.error('Error fetching advanced stats:', error); 
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to fetch advanced statistics', variant: 'destructive' }); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdvancedStats();
  }, [fetchAdvancedStats]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Activity className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading Advanced Content Management...</span>
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
            <BreadcrumbLink asChild>
              <Link href="/dashboard/content">Content</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Advanced</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Advanced Content Management</h1>
          <p className="text-muted-foreground mt-2">
            Advanced tools for SEO optimization, content analysis, and workflow automation
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={fetchAdvancedStats} variant="outline">
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
              <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
              <Search className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.seoScore}/100</div>
              <p className="text-xs text-muted-foreground">
                Overall SEO performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Gaps</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.contentGaps}</div>
              <p className="text-xs text-muted-foreground">
                Opportunities identified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
              <Workflow className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeWorkflows}</div>
              <p className="text-xs text-muted-foreground">
                Automated processes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Optimization Opportunities</CardTitle>
              <Zap className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.optimizationOpportunities}</div>
              <p className="text-xs text-muted-foreground">
                Potential improvements
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SEO Management */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/content/advanced/seo">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Search className="h-8 w-8 text-green-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle>SEO Management</CardTitle>
              <CardDescription>
                Optimize your content for search engines with advanced SEO tools and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">SEO Score</span>
                  <Badge variant="secondary">{stats?.seoScore || 0}/100</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pages Analyzed</span>
                  <span className="text-sm font-medium">24</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Content Gap Analysis */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/content/advanced/gaps">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Target className="h-8 w-8 text-blue-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle>Content Gap Analysis</CardTitle>
              <CardDescription>
                Identify content opportunities and optimize your content strategy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Content Gaps</span>
                  <Badge variant="secondary">{stats?.contentGaps || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">High Priority</span>
                  <span className="text-sm font-medium">8</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Content Workflows */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/content/advanced/workflows">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Workflow className="h-8 w-8 text-purple-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle>Content Workflows</CardTitle>
              <CardDescription>
                Automate content processes with rules engine and workflow management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Workflows</span>
                  <Badge variant="secondary">{stats?.activeWorkflows || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Rules</span>
                  <span className="text-sm font-medium">12</span>
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
            Common tasks and shortcuts for advanced content management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Search className="h-5 w-5" />
              <span>Run SEO Audit</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Target className="h-5 w-5" />
              <span>Analyze Content Gaps</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Workflow className="h-5 w-5" />
              <span>Create Workflow</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <BarChart3 className="h-5 w-5" />
              <span>View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
