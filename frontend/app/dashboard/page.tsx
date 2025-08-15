'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { StatsCardsWidget } from '@/components/dashboard/widgets/stats-cards-widget';
import { QuickActionsWidget } from '@/components/dashboard/widgets/quick-actions-widget';
import { AnalyticsChartWidget } from '@/components/dashboard/widgets/analytics-chart-widget';
import { RecentActivityWidget } from '@/components/dashboard/widgets/recent-activity-widget';
import { DashboardSettingsModal } from '@/components/dashboard/dashboard-settings-modal';
import { DashboardSettingsProvider } from '@/contexts/dashboard-settings-context';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  RefreshCw,
  Settings,
  LayoutDashboard,
  AlertCircle
} from 'lucide-react';

/**
 * Komponen utama dashboard content
 * Mengelola layout, widgets, dan interaksi user
 */
function DashboardContent() {
  const { stats, loading, error, refresh } = useDashboard();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // Stabilkan stats data untuk mencegah re-render berlebihan
  const stableStats = useMemo(() => ({
    totalUsers: stats?.totalUsers || 0,
    totalPosts: stats?.totalPosts || 0,
    totalMedia: stats?.totalMedia || 0,
    totalViews: stats?.totalViews || 0,
    systemHealth: (stats?.systemHealth?.status as 'healthy' | 'warning' | 'critical') || 'healthy',
    securityStatus: 'secure' as const
  }), [stats?.totalUsers, stats?.totalPosts, stats?.totalMedia, stats?.totalViews, stats?.systemHealth?.status]);

  // Redirect ke login jika tidak authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Event handlers dengan useCallback untuk optimasi performance
  const handleSettingsClick = useCallback(() => {
    setShowSettingsModal(true);
    toast({
      title: "Dashboard Settings",
      description: "Configure your dashboard preferences and layout options.",
    });
  }, [toast]);

  const handleRefresh = useCallback(async () => {
    try {
      await refresh();
      toast({
        title: "Dashboard Refreshed",
        description: "All dashboard data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh dashboard data. Please try again.",
        variant: "destructive",
      });
    }
  }, [refresh, toast]);

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Dashboard Error</h2>
            <p className="text-muted-foreground max-w-md">
              {error || 'An error occurred while loading the dashboard. Please try refreshing the page.'}
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          
          <Button
            onClick={handleSettingsClick}
            variant="outline"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Dashboard Content - Default Layout */}
      <div className="grid gap-6">
        {/* Statistics Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <StatsCardsWidget stats={stableStats} isLoading={loading} />
          </CardContent>
        </Card>

        {/* Analytics Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChartWidget />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickActionsWidget />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivityWidget />
          </CardContent>
        </Card>
      </div>

      {/* Settings Modal */}
      <DashboardSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
}

/**
 * Dashboard Page Component
 * Wrapper untuk DashboardSettingsProvider
 */
export default function DashboardPage() {
  return (
    <DashboardSettingsProvider>
      <DashboardContent />
    </DashboardSettingsProvider>
  );
}
