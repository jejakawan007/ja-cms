'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  TrendingUp,
  Activity,
  BarChart3,
  Shield,
  Heart,
  MoreHorizontal,
  Settings,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

interface StatsCardsWidgetProps {
  stats: {
    totalUsers: number;
    totalPosts: number;
    totalMedia: number;
    totalViews: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
    securityStatus: 'secure' | 'warning' | 'vulnerable';
  };
  trends?: {
    users: { value: number; isPositive: boolean };
    posts: { value: number; isPositive: boolean };
    media: { value: number; isPositive: boolean };
    views: { value: number; isPositive: boolean };
  };
  isLoading?: boolean;
  config?: {
    showSystemHealth?: boolean;
    showSecurityStatus?: boolean;
    layout?: 'grid' | 'list';
  };
}

/**
 * Komponen StatsCardsWidget untuk menampilkan statistik dashboard
 * Menggunakan neutral flat clean design system
 */
export function StatsCardsWidget({ stats, trends, isLoading = false, config }: StatsCardsWidgetProps) {
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu ketika klik di luar
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

  // Event handlers dengan useCallback untuk optimasi performance
  const handleConfigAction = useCallback((action: string) => {
    setShowConfigMenu(false);
    
    switch (action) {
      case 'refresh':
        console.log('Refresh stats');
        break;
      case 'export':
        console.log('Export stats data');
        break;
      case 'customize':
        console.log('Customize stats cards');
        break;
      case 'settings':
        console.log('Stats settings');
        break;
      default:
        console.log(`Config action: ${action}`);
    }
  }, []);

  // Helper functions untuk status variants
  const getSystemHealthVariant = useCallback((health: string) => {
    switch (health) {
      case 'healthy':
        return 'default' as const;
      case 'warning':
        return 'secondary' as const;
      case 'critical':
        return 'destructive' as const;
      default:
        return 'default' as const;
    }
  }, []);

  const getSecurityStatusVariant = useCallback((status: string) => {
    switch (status) {
      case 'secure':
        return 'default' as const;
      case 'warning':
        return 'secondary' as const;
      case 'vulnerable':
        return 'destructive' as const;
      default:
        return 'default' as const;
    }
  }, []);

  const getSystemHealthIcon = useCallback((health: string) => {
    switch (health) {
      case 'healthy':
        return <Heart className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <Activity className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <Activity className="h-4 w-4 text-red-600" />;
      default:
        return <Heart className="h-4 w-4 text-muted-foreground" />;
    }
  }, []);

  const getSecurityStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'secure':
        return <Shield className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <Shield className="h-4 w-4 text-yellow-600" />;
      case 'vulnerable':
        return <Shield className="h-4 w-4 text-red-600" />;
      default:
        return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  }, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="border-border bg-card shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-8 bg-muted rounded animate-pulse"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Stats data dengan icons dan colors yang konsisten
  const statsData = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
      trend: trends?.users,
      color: 'text-foreground'
    },
    {
      title: 'Total Posts',
      value: stats.totalPosts.toLocaleString(),
      icon: <BarChart3 className="h-5 w-5 text-muted-foreground" />,
      trend: trends?.posts,
      color: 'text-foreground'
    },
    {
      title: 'Total Media',
      value: stats.totalMedia.toLocaleString(),
      icon: <Activity className="h-5 w-5 text-muted-foreground" />,
      trend: trends?.media,
      color: 'text-foreground'
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: <TrendingUp className="h-5 w-5 text-muted-foreground" />,
      trend: trends?.views,
      color: 'text-foreground'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header dengan config menu */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Statistics Overview</h2>
          <p className="text-sm text-muted-foreground">Key metrics and system status</p>
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
                  Refresh Stats
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleConfigAction('export')}
                  className="w-full justify-start text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleConfigAction('customize')}
                  className="w-full justify-start text-sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Customize Cards
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index} className="border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className={cn("text-2xl font-semibold", stat.color)}>
                    {stat.value}
                  </p>
                  {stat.trend && (
                    <div className="flex items-center space-x-1">
                      <TrendingUp 
                        className={cn(
                          "h-3 w-3",
                          stat.trend.isPositive ? "text-green-600" : "text-red-600"
                        )} 
                      />
                      <span className={cn(
                        "text-xs font-medium",
                        stat.trend.isPositive ? "text-green-600" : "text-red-600"
                      )}>
                        {stat.trend.isPositive ? '+' : ''}{stat.trend.value}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status Row */}
      {(config?.showSystemHealth !== false || config?.showSecurityStatus !== false) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {config?.showSystemHealth !== false && (
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getSystemHealthIcon(stats.systemHealth)}
                    <div>
                      <p className="text-sm font-medium text-foreground">System Health</p>
                      <p className="text-xs text-muted-foreground">Current system status</p>
                    </div>
                  </div>
                  <Badge variant={getSystemHealthVariant(stats.systemHealth)}>
                    {stats.systemHealth}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
          
          {config?.showSecurityStatus !== false && (
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getSecurityStatusIcon(stats.securityStatus)}
                    <div>
                      <p className="text-sm font-medium text-foreground">Security Status</p>
                      <p className="text-xs text-muted-foreground">System security level</p>
                    </div>
                  </div>
                  <Badge variant={getSecurityStatusVariant(stats.securityStatus)}>
                    {stats.securityStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
