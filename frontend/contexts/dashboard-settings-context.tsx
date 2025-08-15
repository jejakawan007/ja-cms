'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Types for dashboard settings - sesuai dengan backend
export interface DashboardSettings {
  id?: string;
  userId: string;
  layoutMode: 'default' | 'custom';
  theme: string;
  widgets: {
    quickActions: {
      enabled: boolean;
      maxActions: number;
      showIcons: boolean;
    };
    recentActivity: {
      enabled: boolean;
      maxItems: number;
      showUserAvatars: boolean;
      showTimestamps: boolean;
    };
    analyticsChart: {
      enabled: boolean;
      defaultMetric: string;
      timeRange: string;
      chartType: 'area' | 'line' | 'bar';
    };
    statsCards: {
      enabled: boolean;
      showSystemHealth: boolean;
      showSecurityStatus: boolean;
      layout: 'grid' | 'list';
    };
  };
  layout: {
    gridColumns: number;
    widgetSpacing: 'compact' | 'normal' | 'spacious';
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    cardStyle: 'flat' | 'elevated' | 'bordered';
  };
  data: {
    retentionPeriod: number;
    cacheEnabled: boolean;
  };
  gridLayout?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

// Default settings
const defaultSettings: DashboardSettings = {
  userId: '',
  layoutMode: 'default',
  theme: 'neutral',
  widgets: {
    quickActions: {
      enabled: true,
      maxActions: 8,
      showIcons: true,
    },
    recentActivity: {
      enabled: true,
      maxItems: 8,
      showUserAvatars: true,
      showTimestamps: true,
    },
    analyticsChart: {
      enabled: true,
      defaultMetric: 'overview',
      timeRange: '30d',
      chartType: 'area',
    },
    statsCards: {
      enabled: true,
      showSystemHealth: true,
      showSecurityStatus: true,
      layout: 'grid',
    },
  },
  layout: {
    gridColumns: 3,
    widgetSpacing: 'normal',
  },
  appearance: {
    theme: 'system',
    cardStyle: 'flat',
  },
  data: {
    retentionPeriod: 24,
    cacheEnabled: true,
  },
};

interface DashboardSettingsContextType {
  settings: DashboardSettings;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<DashboardSettings>) => Promise<void>;
  updateGridLayout: (gridLayout: any) => Promise<void>;
  resetSettings: () => Promise<void>;
  getWidgetConfig: (widgetName: keyof DashboardSettings['widgets']) => any;
}

const DashboardSettingsContext = createContext<DashboardSettingsContextType | undefined>(undefined);

export function DashboardSettingsProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<DashboardSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from API
  const loadSettings = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      // Jika tidak authenticated, gunakan default settings
      setSettings({ ...defaultSettings, userId: user?.id || '' });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard-settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ja-cms-token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard settings');
      }

      const result = await response.json();
      
      if (result.success) {
        setSettings(result.data);
        console.log('✅ Dashboard settings loaded from API:', result.data);
      } else {
        throw new Error(result.message || 'Failed to load settings');
      }
    } catch (err) {
      console.error('Error loading dashboard settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      
      // Jika gagal load dari API, gunakan default settings
      setSettings({ ...defaultSettings, userId: user?.id || '' });
      
      toast({
        title: "Settings Load Error",
        description: "Using default settings. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, toast]);

  // Update settings - SELALU SIMPAN KE DATABASE
  const updateSettings = useCallback(async (newSettings: Partial<DashboardSettings>) => {
    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please login to save dashboard settings.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update local state immediately for better UX
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

              const response = await fetch('/api/dashboard-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ja-cms-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to update dashboard settings');
      }

      const result = await response.json();
      
      if (result.success) {
        setSettings(result.data);
        console.log('✅ Dashboard settings saved to database:', result.data);
        toast({
          title: "Settings Saved",
          description: "Dashboard settings have been saved to database successfully.",
        });
      } else {
        throw new Error(result.message || 'Failed to update settings');
      }
    } catch (err) {
      console.error('Error updating dashboard settings:', err);
      
      // Revert local state if API call failed
      setSettings(settings);
      
      toast({
        title: "Settings Save Error",
        description: "Failed to save settings to database. Please try again.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, user?.id, settings, toast]);

  // Update grid layout specifically - SELALU SIMPAN KE DATABASE
  const updateGridLayout = useCallback(async (gridLayout: any) => {
    if (!isAuthenticated || !user?.id) {
      console.warn('User not authenticated, skipping grid layout save');
      return;
    }

    try {
      // Update local state immediately for better UX
      setSettings(prevSettings => ({ ...prevSettings, gridLayout }));

      const response = await fetch('/api/dashboard-settings/grid-layout', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ja-cms-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gridLayout }),
      });

      if (!response.ok) {
        throw new Error('Failed to update grid layout');
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Grid layout saved to database');
      } else {
        throw new Error(result.message || 'Failed to update grid layout');
      }
    } catch (err) {
      console.error('Error updating grid layout:', err);
      
      // Revert local state if API call failed
      setSettings(prevSettings => ({ ...prevSettings, gridLayout: prevSettings.gridLayout }));
      
      toast({
        title: "Grid Layout Save Error",
        description: "Failed to save grid layout to database. Please try again.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, user?.id, toast]);

  // Reset settings - SELALU RESET KE DATABASE
  const resetSettings = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please login to reset dashboard settings.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/dashboard-settings/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ja-cms-token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reset dashboard settings');
      }

      const result = await response.json();
      
      if (result.success) {
        setSettings(result.data);
        console.log('✅ Dashboard settings reset in database:', result.data);
        toast({
          title: "Settings Reset",
          description: "Dashboard settings have been reset to default in database.",
        });
      } else {
        throw new Error(result.message || 'Failed to reset settings');
      }
    } catch (err) {
      console.error('Error resetting dashboard settings:', err);
      
      toast({
        title: "Settings Reset Error",
        description: "Failed to reset settings in database. Please try again.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, user?.id, toast]);

  const getWidgetConfig = (widgetName: keyof DashboardSettings['widgets']) => {
    return settings.widgets[widgetName];
  };

  // Load settings on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadSettings();
    }
  }, [isAuthenticated, user?.id, loadSettings]);

  return (
    <DashboardSettingsContext.Provider value={{
      settings,
      loading,
      error,
      updateSettings,
      updateGridLayout,
      resetSettings,
      getWidgetConfig,
    }}>
      {children}
    </DashboardSettingsContext.Provider>
  );
}

export function useDashboardSettings() {
  const context = useContext(DashboardSettingsContext);
  if (context === undefined) {
    throw new Error('useDashboardSettings must be used within a DashboardSettingsProvider');
  }
  return context;
}
