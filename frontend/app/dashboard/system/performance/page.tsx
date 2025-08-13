'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { 
  Zap, 
  Activity, 
  RefreshCw,
  Plus,
  BarChart3,
  HardDrive,
  Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import PerformanceOptimizationTab from '@/components/settings/PerformanceOptimizationTab';

interface PerformanceStats {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  cacheHitRate: number;
  totalRequests: number;
  errorRate: number;
}

export default function PerformancePage() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceStats();
  }, []);

  const fetchPerformanceStats = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please login to access Performance features', variant: 'destructive' });
        return;
      }
      const response = await fetch('/api/performance/stats', { headers: { 'Authorization': `Bearer ${token}` } });
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
      console.error('Error fetching performance stats:', error); 
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to fetch performance statistics', variant: 'destructive' }); 
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Activity className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading Performance Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Performance Optimization</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and optimize system performance, caching, and resource usage
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={fetchPerformanceStats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Optimization
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.responseTime}ms</div>
              <p className="text-xs text-muted-foreground">
                Average response time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <HardDrive className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.memoryUsage}%</div>
              <p className="text-xs text-muted-foreground">
                Current memory usage
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
              <Zap className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cacheHitRate}%</div>
              <p className="text-xs text-muted-foreground">
                Cache efficiency
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.errorRate}%</div>
              <p className="text-xs text-muted-foreground">
                System error rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Optimization Dashboard</CardTitle>
          <CardDescription>
            Monitor system performance, optimize caching, and manage resource usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PerformanceOptimizationTab />
        </CardContent>
      </Card>
    </div>
  );
}

