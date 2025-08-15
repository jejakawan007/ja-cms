'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-no-shadow';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { 
  Settings, 
  BarChart3, 
  LayoutDashboard, 
  Palette, 
  Database, 
  X, 
  Save, 
  RotateCcw,
  Zap,
  Activity
} from 'lucide-react';
import { useDashboardSettings, DashboardSettings } from '@/contexts/dashboard-settings-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/cn';

interface DashboardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSettingsModal({ isOpen, onClose }: DashboardSettingsModalProps) {
  const { settings, updateSettings } = useDashboardSettings();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [tempSettings, setTempSettings] = useState<DashboardSettings>(settings);

  // Update temp settings when settings change
  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleSaveSettings = () => {
    updateSettings(tempSettings);
    toast({
      title: "Settings Saved",
      description: "Dashboard settings have been updated successfully.",
    });
    onClose();
  };

  const handleResetSettings = () => {
    setTempSettings(settings);
    toast({
      title: "Settings Reset",
      description: "Settings have been reset to current values.",
    });
  };

  const handleDiscardChanges = () => {
    setTempSettings(settings);
    onClose();
  };

  const updateTempSettings = (path: string, value: any) => {
    setTempSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      // Navigate to the parent object
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key && current[key] !== undefined) {
          current = current[key];
        } else {
          console.error('Invalid path:', path);
          return prev; // Return unchanged if path is invalid
        }
      }
      
      // Set the value
      const lastKey = keys[keys.length - 1];
      if (lastKey) {
        current[lastKey] = value;
      }
      
      return newSettings;
    });
  };

  if (!isOpen) return null;

  const hasChanges = JSON.stringify(tempSettings) !== JSON.stringify(settings);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Dashboard Settings</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your dashboard configuration and widget settings
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-border bg-muted/20">
            <div className="p-4 space-y-2">
              <button
                onClick={() => setActiveTab('general')}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  activeTab === 'general' 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <Settings className="h-4 w-4 mr-2 inline" />
                General Settings
              </button>
              <button
                onClick={() => setActiveTab('widgets')}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  activeTab === 'widgets' 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <BarChart3 className="h-4 w-4 mr-2 inline" />
                Widget Management
              </button>
              <button
                onClick={() => setActiveTab('layout')}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  activeTab === 'layout' 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <LayoutDashboard className="h-4 w-4 mr-2 inline" />
                Layout Settings
              </button>
              <button
                onClick={() => setActiveTab('appearance')}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  activeTab === 'appearance' 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <Palette className="h-4 w-4 mr-2 inline" />
                Appearance
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  activeTab === 'data' 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <Database className="h-4 w-4 mr-2 inline" />
                Data & Refresh
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">General Dashboard Settings</h3>
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Layout Mode</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Layout Mode</Label>
                            <p className="text-xs text-muted-foreground">Choose between default and custom layout</p>
                          </div>
                          <Select 
                            value={tempSettings.layoutMode} 
                            onValueChange={(value: 'default' | 'custom') => {
                              console.log('Layout mode changed to:', value);
                              updateTempSettings('layoutMode', value);
                              // Update settings immediately
                              updateSettings({ layoutMode: value });
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Default Layout</SelectItem>
                              <SelectItem value="custom">Custom Layout</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {tempSettings.layoutMode === 'custom' && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              <strong>Custom Layout Mode:</strong> You can drag, resize, and arrange widgets. Changes are saved automatically.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>


                  </div>
                </div>
              </div>
            )}

            {activeTab === 'widgets' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Widget Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Quick Actions Widget */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center space-x-2">
                          <Zap className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-base">Quick Actions</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Enable Widget</Label>
                          <Switch
                            checked={tempSettings.widgets.quickActions.enabled}
                            onCheckedChange={(checked) => updateTempSettings('widgets.quickActions.enabled', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Max Actions</Label>
                          <Select 
                            value={tempSettings.widgets.quickActions.maxActions.toString()} 
                            onValueChange={(value) => updateTempSettings('widgets.quickActions.maxActions', parseInt(value))}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="6">6</SelectItem>
                              <SelectItem value="8">8</SelectItem>
                              <SelectItem value="12">12</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Show Icons</Label>
                          <Switch
                            checked={tempSettings.widgets.quickActions.showIcons}
                            onCheckedChange={(checked) => updateTempSettings('widgets.quickActions.showIcons', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Activity Widget */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center space-x-2">
                          <Activity className="h-5 w-5 text-green-600" />
                          <CardTitle className="text-base">Recent Activity</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Enable Widget</Label>
                          <Switch
                            checked={tempSettings.widgets.recentActivity.enabled}
                            onCheckedChange={(checked) => updateTempSettings('widgets.recentActivity.enabled', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Max Items</Label>
                          <Select 
                            value={tempSettings.widgets.recentActivity.maxItems.toString()} 
                            onValueChange={(value) => updateTempSettings('widgets.recentActivity.maxItems', parseInt(value))}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="8">8</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="15">15</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Show Avatars</Label>
                          <Switch
                            checked={tempSettings.widgets.recentActivity.showUserAvatars}
                            onCheckedChange={(checked) => updateTempSettings('widgets.recentActivity.showUserAvatars', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Show Timestamps</Label>
                          <Switch
                            checked={tempSettings.widgets.recentActivity.showTimestamps}
                            onCheckedChange={(checked) => updateTempSettings('widgets.recentActivity.showTimestamps', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Analytics Chart Widget */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-5 w-5 text-purple-600" />
                          <CardTitle className="text-base">Analytics Chart</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Enable Widget</Label>
                          <Switch
                            checked={tempSettings.widgets.analyticsChart.enabled}
                            onCheckedChange={(checked) => updateTempSettings('widgets.analyticsChart.enabled', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Default Metric</Label>
                          <Select 
                            value={tempSettings.widgets.analyticsChart.defaultMetric} 
                            onValueChange={(value) => updateTempSettings('widgets.analyticsChart.defaultMetric', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="overview">Overview</SelectItem>
                              <SelectItem value="pageViews">Page Views</SelectItem>
                              <SelectItem value="uniqueVisitors">Unique Visitors</SelectItem>
                              <SelectItem value="sessions">Sessions</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Time Range</Label>
                          <Select 
                            value={tempSettings.widgets.analyticsChart.timeRange} 
                            onValueChange={(value) => updateTempSettings('widgets.analyticsChart.timeRange', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="7d">7 Days</SelectItem>
                              <SelectItem value="30d">30 Days</SelectItem>
                              <SelectItem value="90d">90 Days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Chart Type</Label>
                          <Select 
                            value={tempSettings.widgets.analyticsChart.chartType} 
                            onValueChange={(value: 'area' | 'line' | 'bar') => updateTempSettings('widgets.analyticsChart.chartType', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="area">Area</SelectItem>
                              <SelectItem value="line">Line</SelectItem>
                              <SelectItem value="bar">Bar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Stats Cards Widget */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-5 w-5 text-orange-600" />
                          <CardTitle className="text-base">Stats Cards</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Enable Widget</Label>
                          <Switch
                            checked={tempSettings.widgets.statsCards.enabled}
                            onCheckedChange={(checked) => updateTempSettings('widgets.statsCards.enabled', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Show System Health</Label>
                          <Switch
                            checked={tempSettings.widgets.statsCards.showSystemHealth}
                            onCheckedChange={(checked) => updateTempSettings('widgets.statsCards.showSystemHealth', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Show Security Status</Label>
                          <Switch
                            checked={tempSettings.widgets.statsCards.showSecurityStatus}
                            onCheckedChange={(checked) => updateTempSettings('widgets.statsCards.showSecurityStatus', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Layout</Label>
                          <Select 
                            value={tempSettings.widgets.statsCards.layout} 
                            onValueChange={(value: 'grid' | 'list') => updateTempSettings('widgets.statsCards.layout', value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="grid">Grid</SelectItem>
                              <SelectItem value="list">List</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Layout Settings</h3>
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Grid Configuration</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Grid Columns</Label>
                            <p className="text-xs text-muted-foreground">Number of columns in dashboard grid</p>
                          </div>
                          <Select 
                            value={tempSettings.layout.gridColumns.toString()} 
                            onValueChange={(value) => updateTempSettings('layout.gridColumns', parseInt(value))}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Column</SelectItem>
                              <SelectItem value="2">2 Columns</SelectItem>
                              <SelectItem value="3">3 Columns</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Widget Spacing</Label>
                            <p className="text-xs text-muted-foreground">Space between widgets</p>
                          </div>
                          <Select 
                            value={tempSettings.layout.widgetSpacing} 
                            onValueChange={(value: 'compact' | 'normal' | 'spacious') => updateTempSettings('layout.widgetSpacing', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="compact">Compact</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="spacious">Spacious</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Appearance Settings</h3>
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Theme Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Theme</Label>
                            <p className="text-xs text-muted-foreground">Choose dashboard theme</p>
                          </div>
                          <Select 
                            value={tempSettings.appearance.theme} 
                            onValueChange={(value: 'light' | 'dark' | 'system') => updateTempSettings('appearance.theme', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Card Style</Label>
                            <p className="text-xs text-muted-foreground">Widget card appearance</p>
                          </div>
                          <Select 
                            value={tempSettings.appearance.cardStyle} 
                            onValueChange={(value: 'flat' | 'elevated' | 'bordered') => updateTempSettings('appearance.cardStyle', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="flat">Flat</SelectItem>
                              <SelectItem value="elevated">Elevated</SelectItem>
                              <SelectItem value="bordered">Bordered</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Data & Refresh Settings</h3>
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Data Management</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Caching</Label>
                            <p className="text-xs text-muted-foreground">Cache dashboard data for better performance</p>
                          </div>
                          <Switch
                            checked={tempSettings.data.cacheEnabled}
                            onCheckedChange={(checked) => updateTempSettings('data.cacheEnabled', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Data Retention</Label>
                            <p className="text-xs text-muted-foreground">How long to keep cached data</p>
                          </div>
                          <Select 
                            value={tempSettings.data.retentionPeriod.toString()} 
                            onValueChange={(value) => updateTempSettings('data.retentionPeriod', parseInt(value))}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Hour</SelectItem>
                              <SelectItem value="6">6 Hours</SelectItem>
                              <SelectItem value="24">24 Hours</SelectItem>
                              <SelectItem value="168">7 Days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleResetSettings}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Changes
            </Button>
            {hasChanges && (
              <span className="text-sm text-muted-foreground">
                You have unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDiscardChanges}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
