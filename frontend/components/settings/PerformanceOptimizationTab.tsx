import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import {
  Zap,
  Activity,
  Database,
  // Shield,
  // TrendingUp,
  // TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  // BarChart3,
  Cpu,
  HardDrive,
  // Network,
  // Gauge,
  Target
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  metricType: string;
  value: number;
  unit: string;
  endpoint?: string;
  method?: string;
  timestamp: string;
  metadata?: any;
}

interface CacheStats {
  memory: {
    keys: number;
    hits: number;
    misses: number;
    hitRate: number;
  };
  database: {
    totalEntries: number;
    averageHits: number;
  };
}

interface PerformanceSummary {
  responseTime: {
    average: number;
    min: number;
    max: number;
  };
  memoryUsage: {
    average: number;
    max: number;
  };
  cpuUsage: {
    average: number;
    max: number;
  };
  cacheHitRate: number;
  totalMetrics: number;
}

interface SystemHealth {
  status: string;
  timestamp: string;
  performance: PerformanceSummary;
  cache: CacheStats;
  recommendations: number;
  criticalIssues: number;
}

export default function PerformanceOptimizationTab() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state for cache
  const [cacheForm, setCacheForm] = useState({
    key: '',
    value: '',
    ttl: 300
  });

  // Load data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([
      fetchMetrics(),
      fetchCacheStats(),
      fetchPerformanceSummary(),
      fetchSystemHealth()
    ]);
    setIsLoading(false);
  };

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch('/api/performance/metrics?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchCacheStats = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch('/api/performance/cache/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCacheStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching cache stats:', error);
    }
  };

  const fetchPerformanceSummary = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch('/api/performance/performance/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPerformanceSummary(data.data);
      }
    } catch (error) {
      console.error('Error fetching performance summary:', error);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch('/api/performance/health', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSystemHealth(data.data);
      }
    } catch (error) {
      console.error('Error fetching system health:', error);
    }
  };

  const setCache = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/performance/cache', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cacheForm),
      });

      if (response.status === 401) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to set cache');
      }

      await response.json();
      toast({
        title: "Success",
        description: "Cache entry set successfully",
      });

      setIsDialogOpen(false);
      setCacheForm({ key: '', value: '', ttl: 300 });
      fetchCacheStats();
    } catch (error) {
      console.error('Error setting cache:', error);
      toast({
        title: "Error",
        description: "Failed to set cache entry",
        variant: "destructive",
      });
    }
  };

  const optimizeCache = async () => {
    try {
      setIsOptimizing(true);
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/performance/cache/optimize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to optimize cache');
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: `Cache optimized! Deleted ${data.data.deletedExpiredEntries} expired entries`,
      });

      fetchCacheStats();
    } catch (error) {
      console.error('Error optimizing cache:', error);
      toast({
        title: "Error",
        description: "Failed to optimize cache",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const clearCache = async () => {
    if (!confirm('Are you sure you want to clear all cache?')) return;

    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/performance/cache', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to clear cache');
      }

      await response.json();
      toast({
        title: "Success",
        description: "Cache cleared successfully",
      });

      fetchCacheStats();
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: "Error",
        description: "Failed to clear cache",
        variant: "destructive",
      });
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMetricIcon = (metricType: string) => {
    switch (metricType) {
      case 'response_time': return <Clock className="h-4 w-4" />;
      case 'memory_usage': return <HardDrive className="h-4 w-4" />;
      case 'cpu_usage': return <Cpu className="h-4 w-4" />;
      case 'cache_hit_rate': return <Database className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Optimization</h2>
          <p className="text-muted-foreground">
            Monitor and optimize system performance, caching, and resource usage
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={optimizeCache} disabled={isOptimizing} variant="outline">
            <Zap className="h-4 w-4 mr-2" />
            {isOptimizing ? 'Optimizing...' : 'Optimize Cache'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Set Cache
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Cache Entry</DialogTitle>
                <DialogDescription>
                  Add a new entry to the cache
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="key">Cache Key</Label>
                  <Input
                    id="key"
                    value={cacheForm.key}
                    onChange={(e) => setCacheForm({ ...cacheForm, key: e.target.value })}
                    placeholder="Enter cache key"
                  />
                </div>
                <div>
                  <Label htmlFor="value">Cache Value</Label>
                  <Textarea
                    id="value"
                    value={cacheForm.value}
                    onChange={(e) => setCacheForm({ ...cacheForm, value: e.target.value })}
                    placeholder="Enter cache value (JSON)"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="ttl">TTL (seconds)</Label>
                  <Input
                    id="ttl"
                    type="number"
                    value={cacheForm.ttl}
                    onChange={(e) => setCacheForm({ ...cacheForm, ttl: parseInt(e.target.value) })}
                    min="1"
                    max="86400"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={setCache} disabled={!cacheForm.key || !cacheForm.value}>
                  Set Cache
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* System Health Status */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getHealthStatusIcon(systemHealth.status)}
              System Health Status
            </CardTitle>
            <CardDescription>
              Overall system performance and health indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge className={getHealthStatusColor(systemHealth.status)}>
                    {systemHealth.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Critical Issues</p>
                  <p className="text-2xl font-bold">{systemHealth.criticalIssues}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Recommendations</p>
                  <p className="text-2xl font-bold">{systemHealth.recommendations}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(systemHealth.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Summary Cards */}
      {performanceSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceSummary.responseTime.average}ms</div>
              <p className="text-xs text-muted-foreground">
                Avg: {performanceSummary.responseTime.min}ms - {performanceSummary.responseTime.max}ms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceSummary.memoryUsage.average}MB</div>
              <p className="text-xs text-muted-foreground">
                Max: {performanceSummary.memoryUsage.max}MB
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceSummary.cpuUsage.average}%</div>
              <p className="text-xs text-muted-foreground">
                Max: {performanceSummary.cpuUsage.max}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceSummary.cacheHitRate}%</div>
              <p className="text-xs text-muted-foreground">
                {performanceSummary.totalMetrics} metrics tracked
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cache Statistics */}
      {cacheStats && (
        <Card>
          <CardHeader>
            <CardTitle>Cache Statistics</CardTitle>
            <CardDescription>
              Memory and database cache performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-4">Memory Cache</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Keys:</span>
                    <span className="font-medium">{cacheStats.memory.keys}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hits:</span>
                    <span className="font-medium text-green-600">{cacheStats.memory.hits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Misses:</span>
                    <span className="font-medium text-red-600">{cacheStats.memory.misses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hit Rate:</span>
                    <span className="font-medium">{cacheStats.memory.hitRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-4">Database Cache</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Entries:</span>
                    <span className="font-medium">{cacheStats.database.totalEntries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Hits:</span>
                    <span className="font-medium">{cacheStats.database.averageHits}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Button onClick={clearCache} variant="outline" size="sm">
                    Clear All Cache
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="cache">Cache Management</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Performance Metrics</CardTitle>
              <CardDescription>
                Latest system performance measurements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric) => (
                    <TableRow key={metric.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMetricIcon(metric.metricType)}
                          <span className="capitalize">{metric.metricType.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {metric.value} {metric.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        {metric.endpoint ? (
                          <Badge variant="outline">{metric.method} {metric.endpoint}</Badge>
                        ) : (
                          <span className="text-muted-foreground">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(metric.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Management</CardTitle>
              <CardDescription>
                Monitor and manage cache entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Cache management interface will be available here
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Use the buttons above to manage cache entries
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
