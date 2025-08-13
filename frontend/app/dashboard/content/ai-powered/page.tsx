'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Search, 
  Target, 
  FileText,
  Activity, 
  RefreshCw,
  BarChart3,
  ArrowRight,
  Zap,
  Sparkles
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

interface AIPoweredStats {
  contentAnalyzed: number;
  autoTagged: number;
  seoOptimized: number;
  contentGenerated: number;
  accuracy: number;
  timeSaved: number;
}

export default function AIPoweredPage() {
  const [stats, setStats] = useState<AIPoweredStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAIPoweredStats();
  }, []);

  const fetchAIPoweredStats = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please login to access AI-powered features', variant: 'destructive' });
        return;
      }
      
      const response = await fetch('/api/ai-powered/stats', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.status === 401) {
        toast({ title: 'Authentication Error', description: 'Please login again to continue', variant: 'destructive' });
        return;
      }
      if (response.status === 404) {
        toast({ title: 'API Not Available', description: 'AI-powered statistics API is not available yet', variant: 'destructive' });
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
      console.error('Error fetching AI-powered stats:', error); 
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to fetch AI-powered statistics', variant: 'destructive' }); 
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Activity className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading AI-powered Content Management...</span>
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
            <BreadcrumbPage>AI-Powered</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI-Powered Content Management</h1>
          <p className="text-muted-foreground mt-2">
            Leverage artificial intelligence to enhance your content creation and management
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={fetchAIPoweredStats} variant="outline">
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
              <CardTitle className="text-sm font-medium">Content Analyzed</CardTitle>
              <Brain className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.contentAnalyzed}</div>
              <p className="text-xs text-muted-foreground">
                Pieces of content analyzed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Auto Tagged</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.autoTagged}</div>
              <p className="text-xs text-muted-foreground">
                Tags automatically applied
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SEO Optimized</CardTitle>
              <Search className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.seoOptimized}</div>
              <p className="text-xs text-muted-foreground">
                Content optimized for SEO
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              <Zap className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.timeSaved}h</div>
              <p className="text-xs text-muted-foreground">
                Hours saved with AI
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Content Intelligence */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/content/ai-powered/content-intelligence">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Brain className="h-8 w-8 text-purple-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle>Content Intelligence</CardTitle>
              <CardDescription>
                Analyze content, extract keywords, and get intelligent suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Accuracy</span>
                  <Badge variant="secondary">{stats?.accuracy || 0}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Content Analyzed</span>
                  <span className="text-sm font-medium">{stats?.contentAnalyzed || 0}</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Auto Tagging */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/content/ai-powered/auto-tagging">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Target className="h-8 w-8 text-blue-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle>Auto Tagging</CardTitle>
              <CardDescription>
                Automatically suggest and apply relevant tags to your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tags Applied</span>
                  <Badge variant="secondary">{stats?.autoTagged || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="text-sm font-medium">94%</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Content Generation */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/content/ai-powered/content-generation">
            <CardHeader>
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 text-green-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle>Content Generation</CardTitle>
              <CardDescription>
                Generate high-quality content with AI writing assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Content Generated</span>
                  <Badge variant="secondary">{stats?.contentGenerated || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Quality Score</span>
                  <span className="text-sm font-medium">8.7/10</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* SEO Optimization */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/content/ai-powered/seo-optimization">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Search className="h-8 w-8 text-orange-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle>SEO Optimization</CardTitle>
              <CardDescription>
                Get AI-powered SEO recommendations and optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Content Optimized</span>
                  <Badge variant="secondary">{stats?.seoOptimized || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Score</span>
                  <span className="text-sm font-medium">87/100</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Content Audit */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/content/ai-powered/content-audit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <BarChart3 className="h-8 w-8 text-red-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle>Content Audit</CardTitle>
              <CardDescription>
                Analyze content quality and get improvement suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Audits Completed</span>
                  <Badge variant="secondary">24</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Issues Found</span>
                  <span className="text-sm font-medium">12</span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Smart Categorization */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/content/ai-powered/smart-categorization">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Sparkles className="h-8 w-8 text-indigo-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle>Smart Categorization</CardTitle>
              <CardDescription>
                Automatically categorize content with intelligent algorithms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Categories Suggested</span>
                  <Badge variant="secondary">156</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Accuracy</span>
                  <span className="text-sm font-medium">92%</span>
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
            Common AI-powered tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Brain className="h-5 w-5" />
              <span>Analyze Content</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Target className="h-5 w-5" />
              <span>Auto Tag Content</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <FileText className="h-5 w-5" />
              <span>Generate Content</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Search className="h-5 w-5" />
              <span>Optimize SEO</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
