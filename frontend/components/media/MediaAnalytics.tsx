'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Eye, 
  HardDrive,
  Clock,
  Users,
  FileImage,
  FileVideo,
  FileText
} from 'lucide-react';

interface MediaAnalytics {
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
  }[];
  popularFiles: {
    id: string;
    fileName: string;
    downloads: number;
    views: number;
    size: number;
  }[];
}

interface MediaAnalyticsProps {
  className?: string;
}

export function MediaAnalytics({ className }: MediaAnalyticsProps) {
  const [analytics, setAnalytics] = useState<MediaAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call
      const mockAnalytics: MediaAnalytics = {
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
            timestamp: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            action: 'downloaded',
            fileName: 'product-video.mp4',
            user: 'Sarah Wilson',
            timestamp: '2024-01-15T09:15:00Z'
          },
          {
            id: '3',
            action: 'viewed',
            fileName: 'presentation.pdf',
            user: 'Mike Johnson',
            timestamp: '2024-01-15T08:45:00Z'
          }
        ],
        popularFiles: [
          {
            id: '1',
            fileName: 'hero-image.jpg',
            downloads: 1240,
            views: 5670,
            size: 2.4 * 1024 * 1024
          },
          {
            id: '2',
            fileName: 'product-video.mp4',
            downloads: 890,
            views: 3420,
            size: 15.7 * 1024 * 1024
          },
          {
            id: '3',
            fileName: 'logo.png',
            downloads: 670,
            views: 2890,
            size: 512 * 1024
          }
        ]
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getStoragePercentage = () => {
    if (!analytics) return 0;
    return (analytics.storageUsed / analytics.storageLimit) * 100;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Failed to load analytics
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Files</p>
                <p className="text-2xl font-bold">{formatNumber(analytics.totalFiles)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold">{formatFileSize(analytics.storageUsed)}</p>
                <p className="text-xs text-muted-foreground">
                  of {formatFileSize(analytics.storageLimit)}
                </p>
              </div>
              <HardDrive className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={getStoragePercentage()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                <p className="text-2xl font-bold">{formatNumber(analytics.usageStats.downloads)}</p>
              </div>
              <Download className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{formatNumber(analytics.usageStats.views)}</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Types Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              File Types Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileImage className="h-4 w-4 text-blue-500" />
                <span>Images</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{analytics.fileTypes.images}</span>
                <Badge variant="secondary">
                  {((analytics.fileTypes.images / analytics.totalFiles) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileVideo className="h-4 w-4 text-red-500" />
                <span>Videos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{analytics.fileTypes.videos}</span>
                <Badge variant="secondary">
                  {((analytics.fileTypes.videos / analytics.totalFiles) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-500" />
                <span>Documents</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{analytics.fileTypes.documents}</span>
                <Badge variant="secondary">
                  {((analytics.fileTypes.documents / analytics.totalFiles) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{activity.user}</span>
                  <span className="text-muted-foreground">
                    {activity.action} {activity.fileName}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Popular Files */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Popular Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.popularFiles.map((file, index) => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{file.fileName}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>{formatNumber(file.downloads)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{formatNumber(file.views)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
