'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-no-shadow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MousePointer, 
  Clock,
  MoreHorizontal,
  Database,
  Settings
} from 'lucide-react';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AnalyticsChartWidgetProps {
  config?: {
    chartType?: 'area' | 'line' | 'bar';
    defaultMetric?: string;
    availableMetrics?: string[];
    timeRange?: string;
  };
}

interface ChartDataPoint {
  name: string;
  value: number;
  date: string;
  pageViews?: number;
  uniqueVisitors?: number;
  sessions?: number;
  bounceRate?: number;
  conversionRate?: number;
  avgSessionDuration?: number;
}

interface MetricOption {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
}

const metricOptions: MetricOption[] = [
  {
    key: 'overview',
    label: 'Overview',
    icon: TrendingUp,
    color: '#6366f1'
  },
  {
    key: 'pageViews',
    label: 'Page Views',
    icon: BarChart3,
    color: '#3b82f6'
  },
  {
    key: 'uniqueVisitors',
    label: 'Unique Visitors',
    icon: Users,
    color: '#10b981'
  },
  {
    key: 'sessions',
    label: 'Sessions',
    icon: MousePointer,
    color: '#f59e0b'
  },
  {
    key: 'bounceRate',
    label: 'Bounce Rate',
    icon: TrendingUp,
    color: '#ef4444'
  },
  {
    key: 'conversionRate',
    label: 'Conversion Rate',
    icon: TrendingUp,
    color: '#8b5cf6'
  },
  {
    key: 'avgSessionDuration',
    label: 'Avg Session Duration',
    icon: Clock,
    color: '#06b6d4'
  }
];

const timeRangeOptions = [
  { value: '7d', label: '7 Days' },
  { value: '14d', label: '14 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '3 Months' },
  { value: '180d', label: '6 Months' },
  { value: '1y', label: '1 Year' }
];

export function AnalyticsChartWidget({ config }: AnalyticsChartWidgetProps) {
  const [selectedMetric, setSelectedMetric] = useState(config?.defaultMetric || 'overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState(config?.timeRange || '30d');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      case 'export-data':
        console.log('Export chart data');
        break;
      case 'save-chart':
        console.log('Save chart configuration');
        break;
      case 'fullscreen':
        console.log('Open chart in fullscreen');
        break;
      case 'settings':
        console.log('Chart settings');
        break;
      default:
        console.log(`Config action: ${action}`);
    }
  };

  // Sample data - in real app, this would come from API
  const generateSampleData = (metric: string, timeRange: string): ChartDataPoint[] => {
    const days = timeRange === '7d' ? 7 : 
                 timeRange === '14d' ? 14 : 
                 timeRange === '30d' ? 30 : 
                 timeRange === '90d' ? 90 : 
                 timeRange === '180d' ? 180 : 365;
    const data: ChartDataPoint[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate all metrics for each data point
      const pageViews = Math.floor(Math.random() * 5000) + 1000;
      const uniqueVisitors = Math.floor(Math.random() * 2000) + 500;
      const sessions = Math.floor(Math.random() * 1500) + 300;
      const bounceRate = Math.floor(Math.random() * 40) + 20;
      const conversionRate = Math.floor(Math.random() * 15) + 2;
      const avgSessionDuration = Math.floor(Math.random() * 300) + 60;
      
      let value: number;
      switch (metric) {
        case 'overview':
          // Overview shows combined metrics (weighted average)
          value = Math.round((pageViews * 0.4) + (uniqueVisitors * 0.3) + (sessions * 0.3));
          break;
        case 'pageViews':
          value = pageViews;
          break;
        case 'uniqueVisitors':
          value = uniqueVisitors;
          break;
        case 'sessions':
          value = sessions;
          break;
        case 'bounceRate':
          value = bounceRate;
          break;
        case 'conversionRate':
          value = conversionRate;
          break;
        case 'avgSessionDuration':
          value = avgSessionDuration;
          break;
        default:
          value = pageViews;
      }
      
      data.push({
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value,
        date: date.toISOString(),
        pageViews,
        uniqueVisitors,
        sessions,
        bounceRate,
        conversionRate,
        avgSessionDuration
      });
    }
    
    return data;
  };

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const data = generateSampleData(selectedMetric, selectedTimeRange);
      setChartData(data);
      setLoading(false);
    }, 500);
  }, [selectedMetric, selectedTimeRange]);

  const currentMetric = metricOptions.find(m => m.key === selectedMetric);

  const formatValue = (value: number) => {
    switch (selectedMetric) {
      case 'bounceRate':
      case 'conversionRate':
        return `${value}%`;
      case 'avgSessionDuration':
        const minutes = Math.floor(value / 60);
        const seconds = value % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">Visitor Analytics</CardTitle>
            <p className="text-sm text-muted-foreground">Page Views, Unique Visitors & Sessions for the selected period</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Metric Selector */}
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metricOptions.map((metric) => (
                  <SelectItem key={metric.key} value={metric.key} className="text-xs">
                    <div className="flex items-center space-x-2">
                      <metric.icon className="h-3 w-3" />
                      <span>{metric.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Time Range Selector */}
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Config Menu */}
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
                      <Database className="h-4 w-4 mr-2" />
                      Refresh Data
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleConfigAction('export')}
                      className="w-full justify-start text-sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Export Chart
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleConfigAction('customize')}
                      className="w-full justify-start text-sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Customize Chart
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="space-y-4 w-full max-w-md">
              <div className="h-4 bg-muted rounded animate-pulse"></div>
              <div className="h-64 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="color-pageViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="color-uniqueVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="color-sessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="color-overview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="color-pageViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="color-uniqueVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="color-sessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="color-bounceRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="color-conversionRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="color-avgSessionDuration" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatValue}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium text-sm mb-2">{label}</p>
                          {selectedMetric === 'overview' ? (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-600">● Page Views</span>
                                <span className="text-sm font-medium">{payload[0]?.payload?.pageViews?.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-green-600">● Unique Visitors</span>
                                <span className="text-sm font-medium">{payload[0]?.payload?.uniqueVisitors?.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-yellow-600">● Sessions</span>
                                <span className="text-sm font-medium">{payload[0]?.payload?.sessions?.toLocaleString()}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{currentMetric?.label}</span>
                              <span className="text-sm font-medium">{formatValue(payload[0].value as number)}</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {selectedMetric === 'overview' ? (
                  <>
                    <Area
                      type="monotone"
                      dataKey="pageViews"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#color-pageViews)"
                      fillOpacity={0.3}
                      name="Page Views"
                    />
                    <Area
                      type="monotone"
                      dataKey="uniqueVisitors"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#color-uniqueVisitors)"
                      fillOpacity={0.3}
                      name="Unique Visitors"
                    />
                    <Area
                      type="monotone"
                      dataKey="sessions"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="url(#color-sessions)"
                      fillOpacity={0.3}
                      name="Sessions"
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      wrapperStyle={{ fontSize: '11px' }}
                      iconType="circle"
                      iconSize={8}
                    />
                  </>
                ) : (
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={currentMetric?.color}
                    strokeWidth={2}
                    fill={`url(#color-${selectedMetric})`}
                    fillOpacity={0.3}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
