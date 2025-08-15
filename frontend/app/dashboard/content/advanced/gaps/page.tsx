'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { 
  Target, 
  Activity, 
  RefreshCw,
  Plus,
  BarChart3,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ContentGapAnalysisTab from '@/components/content/advanced/ContentGapAnalysisTab';

interface ContentGapStats {
  totalGaps: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  opportunities: number;
  estimatedTraffic: number;
}

export default function ContentGapsPage() {
  const [stats, setStats] = useState<ContentGapStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContentGapStats();
  }, []);

  const fetchContentGapStats = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please login to access Content Gap Analysis features', variant: 'destructive' });
        return;
      }
      const response = await fetch('/api/content-gaps/stats', { headers: { 'Authorization': `Bearer ${token}` } });
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
      console.error('Error fetching content gap stats:', error); 
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to fetch content gap statistics', variant: 'destructive' }); 
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Activity className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading Content Gap Analysis...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Content Gap Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Identify content opportunities, keyword gaps, and optimization strategies
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={fetchContentGapStats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gaps</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGaps}</div>
              <p className="text-xs text-muted-foreground">
                Content opportunities identified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.highPriority}</div>
              <p className="text-xs text-muted-foreground">
                High-impact opportunities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
              <Lightbulb className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.opportunities}</div>
              <p className="text-xs text-muted-foreground">
                Content creation opportunities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Est. Traffic</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.estimatedTraffic.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Potential monthly traffic
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Content Gap Analysis Dashboard</CardTitle>
          <CardDescription>
            Analyze content gaps, identify opportunities, and optimize your content strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContentGapAnalysisTab />
        </CardContent>
      </Card>
    </div>
  );
}
