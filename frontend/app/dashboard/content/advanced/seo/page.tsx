'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { 
  CheckCircle, 
  FileText, 
  Activity, 
  RefreshCw,
  Plus,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import EnhancedSEOTab from '@/components/content/advanced/EnhancedSEOTab';

interface SEOStats {
  totalPages: number;
  optimizedPages: number;
  needsOptimization: number;
  averageScore: number;
  totalAudits: number;
  criticalIssues: number;
}

export default function SEOPage() {
  const [stats, setStats] = useState<SEOStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSEOStats();
  }, []);

  const fetchSEOStats = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please login to access SEO features', variant: 'destructive' });
        return;
      }
      const response = await fetch('/api/seo/stats', { headers: { 'Authorization': `Bearer ${token}` } });
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
      console.error('Error fetching SEO stats:', error); 
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to fetch SEO statistics', variant: 'destructive' }); 
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Activity className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading SEO Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">SEO Management</h1>
          <p className="text-muted-foreground mt-2">
            Optimize your content for search engines with advanced SEO tools and analytics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={fetchSEOStats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Audit
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPages}</div>
              <p className="text-xs text-muted-foreground">
                Pages analyzed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Optimized</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.optimizedPages}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalPages > 0 ? ((stats.optimizedPages / stats.totalPages) * 100).toFixed(1) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}/100</div>
              <p className="text-xs text-muted-foreground">
                Overall SEO score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
              <BarChart3 className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.criticalIssues}</div>
              <p className="text-xs text-muted-foreground">
                Issues to fix
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Management Dashboard</CardTitle>
          <CardDescription>
            Manage SEO metadata, conduct audits, and optimize your content for search engines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnhancedSEOTab />
        </CardContent>
      </Card>
    </div>
  );
}
