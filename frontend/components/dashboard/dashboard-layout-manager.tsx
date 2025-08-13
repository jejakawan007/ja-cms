'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  LayoutDashboard, 
  Settings, 
  Grid3X3, 
  RotateCcw,
  Plus,
  X,
  GripVertical
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { AnalyticsChartWidget } from './widgets/analytics-chart-widget';
import { QuickActionsWidget } from './widgets/quick-actions-widget';
import { RecentActivityWidget } from './widgets/recent-activity-widget';
import { StatsCardsWidget } from './widgets/stats-cards-widget';

interface WidgetConfig {
  id: string;
  name: string;
  title: string;
  description: string;
  component: string;
  isEnabled: boolean;
  position: { x: number; y: number; w: number; h: number };
  config?: any;
}

interface DashboardLayoutManagerProps {
  onLayoutChange?: (layout: 'default' | 'custom') => void;
  onWidgetsChange?: (widgets: WidgetConfig[]) => void;
}

const defaultWidgets: WidgetConfig[] = [
  {
    id: 'analytics-chart',
    name: 'analytics-chart',
    title: 'Analytics Overview',
    description: 'Interactive area chart with multiple data sources',
    component: 'AnalyticsChartWidget',
    isEnabled: true,
    position: { x: 0, y: 0, w: 8, h: 4 },
    config: {
      chartType: 'area',
      defaultMetric: 'pageViews',
      timeRange: '30d'
    }
  },
  {
    id: 'quick-actions',
    name: 'quick-actions',
    title: 'Quick Actions',
    description: 'Frequently used actions and shortcuts',
    component: 'QuickActionsWidget',
    isEnabled: true,
    position: { x: 8, y: 0, w: 4, h: 4 },
    config: {
      maxActions: 6,
      showIcons: true
    }
  },
  {
    id: 'recent-activity',
    name: 'recent-activity',
    title: 'Recent Activity',
    description: 'Latest activities and updates',
    component: 'RecentActivityWidget',
    isEnabled: true,
    position: { x: 0, y: 4, w: 6, h: 4 },
    config: {
      maxItems: 10,
      showUserAvatars: true,
      showTimestamps: true
    }
  },
  {
    id: 'system-health',
    name: 'system-health',
    title: 'System Health',
    description: 'System performance and health metrics',
    component: 'SystemHealthWidget',
    isEnabled: true,
    position: { x: 6, y: 4, w: 6, h: 4 },
    config: {
      showStorage: true,
      showMemory: true,
      showUptime: true
    }
  }
];

const availableWidgets = [
  {
    id: 'stats-overview',
    name: 'stats-overview',
    title: 'Overview Statistics',
    description: 'Key metrics and statistics overview',
    component: 'StatsOverviewWidget',
    category: 'OVERVIEW'
  },
  {
    id: 'analytics-chart',
    name: 'analytics-chart',
    title: 'Analytics Overview',
    description: 'Interactive area chart with multiple data sources',
    component: 'AnalyticsChartWidget',
    category: 'ANALYTICS'
  },
  {
    id: 'quick-actions',
    name: 'quick-actions',
    title: 'Quick Actions',
    description: 'Frequently used actions and shortcuts',
    component: 'QuickActionsWidget',
    category: 'OVERVIEW'
  },
  {
    id: 'recent-activity',
    name: 'recent-activity',
    title: 'Recent Activity',
    description: 'Latest activities and updates',
    component: 'RecentActivityWidget',
    category: 'CONTENT'
  },
  {
    id: 'system-health',
    name: 'system-health',
    title: 'System Health',
    description: 'System performance and health metrics',
    component: 'SystemHealthWidget',
    category: 'SYSTEM'
  },
  {
    id: 'security-status',
    name: 'security-status',
    title: 'Security Status',
    description: 'Security alerts and system status',
    component: 'SecurityStatusWidget',
    category: 'SECURITY'
  },
  {
    id: 'real-time-visitors',
    name: 'real-time-visitors',
    title: 'Real-time Visitors',
    description: 'Live visitor tracking and analytics',
    component: 'RealTimeVisitorsWidget',
    category: 'ANALYTICS'
  },
  {
    id: 'traffic-sources',
    name: 'traffic-sources',
    title: 'Traffic Sources',
    description: 'Traffic source breakdown and analysis',
    component: 'TrafficSourcesWidget',
    category: 'ANALYTICS'
  }
];

export function DashboardLayoutManager({ onLayoutChange, onWidgetsChange }: DashboardLayoutManagerProps) {
  const [layout, setLayout] = useState<'default' | 'custom'>('default');
  const [widgets, setWidgets] = useState<WidgetConfig[]>(defaultWidgets);
  const [isEditing, setIsEditing] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);

  const handleLayoutChange = (newLayout: 'default' | 'custom') => {
    setLayout(newLayout);
    setIsEditing(newLayout === 'custom');
    onLayoutChange?.(newLayout);
  };

  const toggleWidget = (widgetId: string) => {
    const updatedWidgets = widgets.map(widget =>
      widget.id === widgetId ? { ...widget, isEnabled: !widget.isEnabled } : widget
    );
    setWidgets(updatedWidgets);
    onWidgetsChange?.(updatedWidgets);
  };

  const addWidget = (widgetType: string) => {
    const widgetTemplate = availableWidgets.find(w => w.id === widgetType);
    if (!widgetTemplate) return;

    const newWidget: WidgetConfig = {
      id: `${widgetType}-${Date.now()}`,
      name: widgetTemplate.name,
      title: widgetTemplate.title,
      description: widgetTemplate.description,
      component: widgetTemplate.component,
      isEnabled: true,
      position: { x: 0, y: 0, w: 6, h: 4 }
    };

    const updatedWidgets = [...widgets, newWidget];
    setWidgets(updatedWidgets);
    onWidgetsChange?.(updatedWidgets);
    setShowWidgetSelector(false);
  };

  const removeWidget = (widgetId: string) => {
    const updatedWidgets = widgets.filter(widget => widget.id !== widgetId);
    setWidgets(updatedWidgets);
    onWidgetsChange?.(updatedWidgets);
  };

  const handleDragStart = (widgetId: string) => {
    if (!isEditing) return;
    setDraggedWidget(widgetId);
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  const renderWidget = (widget: WidgetConfig) => {
    if (!widget.isEnabled) return null;

    switch (widget.component) {
      case 'AnalyticsChartWidget':
        return <AnalyticsChartWidget config={widget.config} />;
      case 'QuickActionsWidget':
        return <QuickActionsWidget config={widget.config} />;
      case 'RecentActivityWidget':
        return <RecentActivityWidget config={widget.config} />;
      case 'StatsCardsWidget':
        return <StatsCardsWidget 
          config={widget.config}
          stats={{
            totalUsers: 0,
            totalPosts: 0,
            totalMedia: 0,
            totalViews: 0,
            systemHealth: 'healthy',
            securityStatus: 'secure'
          }}
          isLoading={false}
        />;
      default:
        return (
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <p className="font-medium">{widget.title}</p>
                <p className="text-sm">{widget.description}</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Layout Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Dashboard Layout</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={layout === 'default' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLayoutChange('default')}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Default
              </Button>
              <Button
                variant={layout === 'custom' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLayoutChange('custom')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Custom
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {layout === 'default' ? 'Default Layout' : 'Custom Layout'}
              </p>
              <p className="text-xs text-muted-foreground">
                {layout === 'default' 
                  ? 'Pre-configured layout with essential widgets'
                  : 'Drag and drop to customize your dashboard'
                }
              </p>
            </div>
            {layout === 'custom' && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWidgetSelector(!showWidgetSelector)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Widget
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setWidgets(defaultWidgets);
                    onWidgetsChange?.(defaultWidgets);
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Widget Selector */}
      {showWidgetSelector && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Widget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableWidgets.map((widget) => (
                <Button
                  key={widget.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start space-y-2 text-left"
                  onClick={() => addWidget(widget.id)}
                >
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {widget.category}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{widget.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {widget.description}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Widget Controls */}
      {layout === 'custom' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Widget Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {widgets.map((widget) => (
                <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <div>
                      <p className="font-medium text-sm">{widget.title}</p>
                      <p className="text-xs text-muted-foreground">{widget.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={widget.isEnabled}
                      onCheckedChange={() => toggleWidget(widget.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWidget(widget.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Grid */}
      <div className={cn(
        "grid gap-6",
        layout === 'default' 
          ? "grid-cols-12 auto-rows-fr"
          : "grid-cols-12 auto-rows-fr"
      )}>
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={cn(
              "transition-all duration-200",
              layout === 'default'
                ? `col-span-${widget.position.w} row-span-${widget.position.h}`
                : `col-span-${widget.position.w} row-span-${widget.position.h}`,
              draggedWidget === widget.id && "opacity-50"
            )}
            draggable={isEditing}
            onDragStart={() => handleDragStart(widget.id)}
            onDragEnd={handleDragEnd}
          >
            {renderWidget(widget)}
          </div>
        ))}
      </div>
    </div>
  );
}
