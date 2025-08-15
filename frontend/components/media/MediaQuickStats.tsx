'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Download, 
  Eye, 
  HardDrive,
  Clock,
  FileImage,
  FileVideo,
  FileText,
  Music,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { formatFileSize, getStatusIcon } from '@/lib/utils/media-utils';
import { MediaAdvancedService } from '@/lib/services/media-advanced-service';

interface MediaStats {
  totalFiles: number;
  totalSize: number;
  storageUsed: number;
  storageLimit: number;
  fileTypes: {
    images: number;
    videos: number;
    documents: number;
    audio: number;
    other: number;
  };
  usageStats: {
    downloads: number;
    views: number;
    uploads: number;
  };
  recentActivity: {
    id: string;
    action: string;
    fileName: string;
    user: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error';
  }[];
  storageAlerts: {
    id: string;
    type: 'warning' | 'error';
    message: string;
    action?: string;
  }[];
  performanceMetrics: {
    averageLoadTime: number;
    cdnHitRate: number;
    optimizationRate: number;
  };
}

const mockStats: MediaStats = {
  totalFiles: 1247,
  totalSize: 2.4 * 1024 * 1024 * 1024, // 2.4 GB
  storageUsed: 2.4 * 1024 * 1024 * 1024,
  storageLimit: 10 * 1024 * 1024 * 1024, // 10 GB
  fileTypes: {
    images: 856,
    videos: 234,
    documents: 123,
    audio: 34,
    other: 0
  },
  usageStats: {
    downloads: 15420,
    views: 89234,
    uploads: 156
  },
  recentActivity: [
    {
      id: '1',
      action: 'uploaded',
      fileName: 'hero-image.jpg',
      user: 'John Doe',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'success'
    },
    {
      id: '2',
      action: 'downloaded',
      fileName: 'product-video.mp4',
      user: 'Sarah Wilson',
      timestamp: '2024-01-15T09:15:00Z',
      status: 'success'
    },
    {
      id: '3',
      action: 'failed to upload',
      fileName: 'large-file.zip',
      user: 'Mike Johnson',
      timestamp: '2024-01-15T08:45:00Z',
      status: 'error'
    },
    {
      id: '4',
      action: 'optimized',
      fileName: 'banner-image.png',
      user: 'System',
      timestamp: '2024-01-15T08:30:00Z',
      status: 'success'
    },
  ],
  storageAlerts: [
    {
      id: '1',
      type: 'warning',
      message: 'Storage usage is approaching 80% of limit',
      action: 'Upgrade Plan'
    },
    {
      id: '2',
      type: 'warning',
      message: '5 large files detected (>50MB each)',
      action: 'Review Files'
    }
  ],
  performanceMetrics: {
    averageLoadTime: 1.2,
    cdnHitRate: 94.5,
    optimizationRate: 87.3
  }
};

export function MediaQuickStats() {
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Real API call
      const response = await MediaAdvancedService.getAnalytics('month');
      // TODO: Transform response to match MediaStats interface
      // setStats(response);
      console.log('Analytics response:', response);
      
      // For now, use mock data
      setTimeout(() => {
        setStats(mockStats);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load statistics');
      console.error('Failed to load stats:', error);
      setIsLoading(false);
    }
  };



  const getAlertIcon = (type: string) => {
    return type === 'error' 
      ? <XCircle className="h-4 w-4 text-red-500" />
      : <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load statistics</h3>
          <p className="text-muted-foreground mb-4">
            {error}
          </p>
          <Button onClick={loadStats}>
            <Loader2 className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!stats && !isLoading) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No statistics available</h3>
          <p className="text-muted-foreground mb-4">
            No media statistics found. Upload some files to see statistics.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const storagePercentage = (stats.storageUsed / stats.storageLimit) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Quick Statistics</h2>
        <p className="text-muted-foreground">
          Overview of your media library usage and performance metrics
        </p>
      </div>

      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Storage Used</p>
              <p className="text-2xl font-bold">{formatFileSize(stats.storageUsed)}</p>
              <p className="text-sm text-muted-foreground">
                {storagePercentage.toFixed(1)}% of {formatFileSize(stats.storageLimit)}
              </p>
            </div>
            <div className="w-32">
              <Progress value={storagePercentage} className="h-2" />
            </div>
          </div>
          
          {storagePercentage > 80 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Storage usage is high. Consider upgrading your plan or cleaning up unused files.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Type Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Images</CardTitle>
            <FileImage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fileTypes.images}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.fileTypes.images / stats.totalFiles) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videos</CardTitle>
            <FileVideo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fileTypes.videos}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.fileTypes.videos / stats.totalFiles) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fileTypes.documents}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.fileTypes.documents / stats.totalFiles) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audio</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fileTypes.audio}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.fileTypes.audio / stats.totalFiles) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usageStats.downloads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usageStats.views.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500 mr-1" />
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usageStats.uploads}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 text-red-500 mr-1" />
              -5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.performanceMetrics.averageLoadTime}s</div>
              <p className="text-sm text-muted-foreground">Average Load Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.performanceMetrics.cdnHitRate}%</div>
              <p className="text-sm text-muted-foreground">CDN Hit Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.performanceMetrics.optimizationRate}%</div>
              <p className="text-sm text-muted-foreground">Optimization Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                {getStatusIcon(activity.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {activity.user} {activity.action} {activity.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Storage Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Storage Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.storageAlerts.length > 0 ? (
              stats.storageAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    {alert.action && (
                      <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                        {alert.action}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No storage alerts</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
