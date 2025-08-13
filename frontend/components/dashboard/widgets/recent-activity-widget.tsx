'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-no-shadow';
import { Button } from '@/components/ui/button';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Activity, 
  FileText, 
  User, 
  Upload, 
  Database, 
  Settings,
  MoreHorizontal,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface ActivityItem {
  id: string;
  type: 'POST_CREATED' | 'USER_REGISTERED' | 'MEDIA_UPLOADED' | 'BACKUP_CREATED' | 'SETTINGS_UPDATED';
  title: string;
  description: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    email: string;
  };
  timestamp: string;
  link?: string;
  metadata?: any;
}

interface RecentActivityWidgetProps {
  config?: {
    maxItems?: number;
    showUserAvatars?: boolean;
    showTimestamps?: boolean;
  };
}

const activityIcons = {
  POST_CREATED: FileText,
  USER_REGISTERED: User,
  MEDIA_UPLOADED: Upload,
  BACKUP_CREATED: Database,
  SETTINGS_UPDATED: Settings
};

const activityColors = {
  POST_CREATED: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  USER_REGISTERED: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  MEDIA_UPLOADED: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  BACKUP_CREATED: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  SETTINGS_UPDATED: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - activityTime.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
};

export function RecentActivityWidget({ config }: RecentActivityWidgetProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const maxItems = config?.maxItems || 10;
  const showUserAvatars = config?.showUserAvatars !== false;
  const showTimestamps = config?.showTimestamps !== false;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowConfigMenu(false);
      }
    };

    if (showConfigMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showConfigMenu]);

  const handleConfigAction = (action: string) => {
    setShowConfigMenu(false);
    
    switch (action) {
      case 'refresh':
        setLoading(true);
        // Simulate refresh
        setTimeout(() => setLoading(false), 1000);
        break;
      case 'filter':
        console.log('Filter activities');
        break;
      case 'export':
        console.log('Export activities');
        break;
      case 'settings':
        console.log('Activity settings');
        break;
      default:
        console.log(`Config action: ${action}`);
    }
  };

  // Sample activities - in real app, this would come from API
  const sampleActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'POST_CREATED',
      title: 'New Post Created',
      description: 'Created new post: "Getting Started with JA-CMS"',
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: '/avatars/john.jpg'
      },
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      link: '/dashboard/content/posts/1'
    },
    {
      id: '2',
      type: 'USER_REGISTERED',
      title: 'New User Registration',
      description: 'New user registered: jane.smith@example.com',
      user: {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com'
      },
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
      link: '/dashboard/users/2'
    },
    {
      id: '3',
      type: 'MEDIA_UPLOADED',
      title: 'Media Uploaded',
      description: 'Uploaded 5 new media files (2.5MB total)',
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: '/avatars/john.jpg'
      },
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      link: '/dashboard/media',
      metadata: { count: 5, totalSize: '2.5MB' }
    },
    {
      id: '4',
      type: 'BACKUP_CREATED',
      title: 'System Backup',
      description: 'Daily backup completed successfully',
      user: {
        id: '3',
        name: 'System',
        email: 'system@jacms.com'
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      link: '/dashboard/tools/backup',
      metadata: { backupId: 'backup-001', size: '1.2GB' }
    },
    {
      id: '5',
      type: 'SETTINGS_UPDATED',
      title: 'Settings Updated',
      description: 'Updated site configuration settings',
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: '/avatars/john.jpg'
      },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      link: '/dashboard/system/settings'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setActivities(sampleActivities);
      setLoading(false);
    }, 500);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Card className="h-full border-border/50 bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-border bg-card shadow-sm flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Latest system and user activities</p>
          </div>
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfigMenu(!showConfigMenu)}
              className="h-8 w-8 p-0 hover:bg-muted/50"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            
            {showConfigMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                <div className="p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleConfigAction('refresh')}
                    className="w-full justify-start text-sm"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Refresh Activities
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleConfigAction('export')}
                    className="w-full justify-start text-sm"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Export Activities
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleConfigAction('settings')}
                    className="w-full justify-start text-sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Activity Settings
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          {activities.slice(0, maxItems).map((activity) => {
            const IconComponent = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];
            
            return (
              <div key={activity.id} className="flex items-start space-x-3 group">
                {showUserAvatars ? (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                    <AvatarFallback className="text-xs">
                      {getInitials(activity.user.name)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center bg-muted/50",
                    colorClass
                  )}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {activity.user.name}
                        </span>
                        {showTimestamps && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(activity.timestamp)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {activity.link && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/50"
                        onClick={() => window.open(activity.link, '_blank')}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {activities.length > maxItems && (
          <div className="mt-4 pt-3 border-t border-border mt-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              View All Activities ({activities.length - maxItems} more)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
