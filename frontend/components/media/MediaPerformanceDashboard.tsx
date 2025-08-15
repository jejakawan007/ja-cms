'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { useMediaFiles } from '@/hooks/useMediaFiles';

interface PerformanceMetrics {
  loadTime: number;
  errorCount: number;
  successCount: number;
  averageResponseTime: number;
  cacheHitRate: number;
  userInteractions: {
    search: number;
    upload: number;
    delete: number;
    folderCreate: number;
  };
  totalEvents: number;
  successRate: string;
  recommendations: string[];
}

export function MediaPerformanceDashboard() {
  const { files } = useMediaFiles();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Simulate performance metrics (in real app, this would come from the performance hook)
  useEffect(() => {
    const interval = setInterval(() => {
      const mockMetrics: PerformanceMetrics = {
        loadTime: Math.random() * 2000 + 500,
        errorCount: Math.floor(Math.random() * 5),
        successCount: Math.floor(Math.random() * 50) + 20,
        averageResponseTime: Math.random() * 1000 + 200,
        cacheHitRate: Math.random() * 100,
        userInteractions: {
          search: Math.floor(Math.random() * 100),
          upload: Math.floor(Math.random() * 20),
          delete: Math.floor(Math.random() * 10),
          folderCreate: Math.floor(Math.random() * 5),
        },
        totalEvents: Math.floor(Math.random() * 100) + 50,
        successRate: `${(Math.random() * 20 + 80).toFixed(1)}%`,
        recommendations: [
          'Consider implementing virtual scrolling for large file lists',
          'Cache frequently accessed folders',
          'Optimize image thumbnails loading',
        ],
      };
      setMetrics(mockMetrics);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Activity className="h-4 w-4 mr-2" />
        Performance
      </Button>
    );
  }

  if (!metrics) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 border border-border bg-card shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm">Loading metrics...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (value: number, threshold: number) => {
    return value > threshold ? 'text-red-600' : 'text-green-600';
  };

  const getStatusIcon = (value: number, threshold: number) => {
    return value > threshold ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 border border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Media Performance</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Response Time */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Response Time</span>
              <div className="flex items-center space-x-1">
                {getStatusIcon(metrics.averageResponseTime, 1000)}
                <span className={getStatusColor(metrics.averageResponseTime, 1000)}>
                  {metrics.averageResponseTime.toFixed(0)}ms
                </span>
              </div>
            </div>
            <Progress 
              value={(metrics.averageResponseTime / 2000) * 100} 
              className="h-1"
            />
          </div>

          {/* Success Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Success Rate</span>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600">{metrics.successRate}</span>
              </div>
            </div>
            <Progress 
              value={parseFloat(metrics.successRate)} 
              className="h-1"
            />
          </div>

          {/* Error Count */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Errors</span>
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-red-600">{metrics.errorCount}</span>
            </div>
          </div>

          {/* User Interactions */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">User Interactions</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span>Search</span>
                <Badge variant="outline" className="text-xs">
                  {metrics.userInteractions.search}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Upload</span>
                <Badge variant="outline" className="text-xs">
                  {metrics.userInteractions.upload}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Delete</span>
                <Badge variant="outline" className="text-xs">
                  {metrics.userInteractions.delete}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Folders</span>
                <Badge variant="outline" className="text-xs">
                  {metrics.userInteractions.folderCreate}
                </Badge>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {metrics.recommendations.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Recommendations</div>
              <div className="space-y-1">
                {metrics.recommendations.slice(0, 2).map((rec, index) => (
                  <div key={index} className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current State */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Current State</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">
                  Ready
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {files.length} files loaded
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
