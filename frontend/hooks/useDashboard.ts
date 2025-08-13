/**
 * Dashboard Hook
 * Hook for managing dashboard data with enterprise types
 */

import { useState, useEffect } from 'react';
import { dashboardApi } from '@/lib/api/dashboard';
import { DashboardStats, ActivityItem } from '@/types';
import { useAuth } from './useAuth';

export const useDashboard = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [widgets, setWidgets] = useState<any[]>([]);
  const [quickActions, setQuickActions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [securityStatus, setSecurityStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard overview
  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardApi.getOverview();
      if (response.success && response.data) {
        setOverview(response.data);
        setStats(response.data.stats);
        setRecentActivity(response.data.recentActivity);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard overview');
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardApi.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent activity
  const fetchRecentActivity = async (limit?: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardApi.getRecentActivity(limit);
      if (response.success && response.data) {
        setRecentActivity(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recent activity');
    } finally {
      setLoading(false);
    }
  };

  // Fetch widgets
  const fetchWidgets = async () => {
    try {
      const response = await dashboardApi.getWidgets();
      if (response.success && response.data) {
        setWidgets(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch widgets:', err);
    }
  };

  // Fetch quick actions
  const fetchQuickActions = async () => {
    try {
      const response = await dashboardApi.getQuickActions();
      if (response.success && response.data) {
        setQuickActions(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch quick actions:', err);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await dashboardApi.getNotifications(10, 1);
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  // Fetch system health
  const fetchSystemHealth = async () => {
    try {
      const response = await dashboardApi.getSystemHealth();
      if (response.success && response.data) {
        setSystemHealth(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch system health:', err);
    }
  };

  // Fetch security status
  const fetchSecurityStatus = async () => {
    try {
      const response = await dashboardApi.getSecurityStatus();
      if (response.success && response.data) {
        setSecurityStatus(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch security status:', err);
    }
  };

  // Execute quick action
  const executeQuickAction = async (actionId: string) => {
    try {
      const response = await dashboardApi.executeQuickAction(actionId);
      if (response.success) {
        // Refresh data after action execution
        await fetchOverview();
        return response.data;
      }
    } catch (err) {
      console.error('Failed to execute quick action:', err);
      throw err;
    }
  };

  // Mark notification as read
  const markNotificationRead = async (notificationId: string) => {
    try {
      await dashboardApi.markNotificationRead(notificationId);
      // Refresh notifications
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Get chart data
  const getChartData = async (type: string, timeRange: string, metric: string) => {
    try {
      const response = await dashboardApi.getChartData(type, timeRange, metric);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('Failed to get chart data:', err);
      throw err;
    }
  };

  // Fetch all data on mount only when authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const fetchData = async () => {
        await Promise.all([
          fetchOverview(),
          fetchWidgets(),
          fetchQuickActions(),
          fetchNotifications(),
          fetchSystemHealth(),
          fetchSecurityStatus()
        ]);
      };

      fetchData();
    }
  }, [authLoading, isAuthenticated]);

  return {
    // Data
    stats,
    recentActivity,
    overview,
    widgets,
    quickActions,
    notifications,
    systemHealth,
    securityStatus,
    
    // State
    loading,
    error,
    
    // Actions
    fetchOverview,
    fetchStats,
    fetchRecentActivity,
    fetchWidgets,
    fetchQuickActions,
    fetchNotifications,
    fetchSystemHealth,
    fetchSecurityStatus,
    executeQuickAction,
    markNotificationRead,
    getChartData,
    
    // Refresh all data
    refresh: async () => {
      await Promise.all([
        fetchOverview(),
        fetchWidgets(),
        fetchQuickActions(),
        fetchNotifications(),
        fetchSystemHealth(),
        fetchSecurityStatus()
      ]);
    },
  };
};
