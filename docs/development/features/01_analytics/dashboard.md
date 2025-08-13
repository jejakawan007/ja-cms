# 📊 Analytics Dashboard

> **Dashboard Widgets & Real-time Overview**  
> Comprehensive dashboard system for monitoring key metrics and KPIs

---

## 📋 **Deskripsi**

Analytics Dashboard adalah pusat kontrol utama yang menyediakan overview komprehensif tentang performa website, user behavior, dan system health. Dashboard ini dirancang untuk memberikan insights yang actionable dalam format yang mudah dipahami.

---

## ⭐ **Core Features**

### **1. 📈 Overview Statistics**
- **Total Content**: Jumlah posts, pages, media files
- **User Statistics**: Total users, active users, new registrations  
- **Traffic Overview**: Page views, unique visitors (hari ini/minggu/bulan)
- **System Status**: Storage usage, database size, memory usage
- **Recent Activity**: 10 aktivitas terakhir di sistem

**Technical Implementation:**
```typescript
interface DashboardStats {
  content: {
    totalPosts: number;
    totalPages: number;
    totalMedia: number;
    publishedPosts: number;
    draftPosts: number;
  };
  users: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    onlineUsers: number;
  };
  traffic: {
    todayViews: number;
    weeklyViews: number;
    monthlyViews: number;
    uniqueVisitors: number;
  };
  system: {
    storageUsed: string;
    storageTotal: string;
    databaseSize: string;
    memoryUsage: string;
    uptime: string;
  };
}
```

### **2. 🚀 Quick Actions Panel**
- **Create New Post**: Direct link ke post editor
- **Upload Media**: Quick upload modal
- **Add New User**: User creation shortcut
- **View Site**: Preview website di tab baru
- **System Backup**: One-click backup creation

```typescript
interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  permission: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}
```

### **3. 🔔 Notifications Center**
- **System Alerts**: Updates available, security warnings
- **Content Notifications**: New comments, pending approvals
- **User Activities**: New user registrations, login failures
- **Performance Alerts**: High memory usage, slow queries
- **Backup Status**: Backup success/failure notifications

### **4. 📈 Mini Analytics Widget**
- **Today's Stats**: Views, visitors, new content
- **Trending Content**: Most viewed posts/pages
- **Traffic Sources**: Direct, search, social, referral
- **Device Breakdown**: Desktop, mobile, tablet
- **Geographic Data**: Top countries/cities

---

## 🎨 **Dashboard Layout**

### **Desktop Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ 🏠 Dashboard                                    🔔 [3]   │
├─────────────────────────────────────────────────────────┤
│ 📊 Stats Cards Row                                      │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                        │
│ │Posts│ │Users│ │Views│ │Space│                        │
│ └─────┘ └─────┘ └─────┘ └─────┘                        │
├─────────────────────────────────────────────────────────┤
│ 🚀 Quick Actions                                        │
│ [New Post] [Upload] [Add User] [View Site] [Backup]     │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────────────────────┐ │
│ │ 📈 Analytics    │ │ 📋 Recent Activity              │ │
│ │ Chart Widget    │ │ • User login                    │ │
│ │                 │ │ • New post created              │ │
│ │                 │ │ • Comment approved              │ │
│ └─────────────────┘ └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **Responsive Behavior:**
- **Desktop**: 4-column stats cards, side-by-side widgets
- **Tablet**: 2-column stats cards, stacked widgets  
- **Mobile**: Single column layout, collapsible sections

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Dashboard data endpoints
GET /api/dashboard/overview
GET /api/dashboard/stats
GET /api/dashboard/activity
GET /api/dashboard/notifications

// Quick actions
POST /api/dashboard/quick-backup
GET /api/dashboard/quick-actions

// Widget management
GET /api/dashboard/widgets
PUT /api/dashboard/widgets/layout
POST /api/dashboard/widgets/{id}/settings
```

### **State Management:**
```typescript
interface DashboardState {
  stats: DashboardStats;
  activities: ActivityEntry[];
  notifications: Notification[];
  quickActions: QuickAction[];
  widgets: Widget[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
}

// Zustand store example
const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: null,
  activities: [],
  notifications: [],
  quickActions: [],
  widgets: [],
  loading: false,
  error: null,
  lastUpdated: new Date(),

  // Actions
  fetchDashboardData: async () => {
    set({ loading: true });
    try {
      const data = await dashboardApi.getOverview();
      set({ 
        stats: data.stats,
        activities: data.activities,
        notifications: data.notifications,
        loading: false,
        lastUpdated: new Date()
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  refreshStats: async () => {
    const data = await dashboardApi.getStats();
    set({ stats: data, lastUpdated: new Date() });
  }
}));
```

### **Real-time Updates:**
```typescript
// WebSocket connection untuk real-time updates
const useDashboardRealtime = () => {
  const { refreshStats } = useDashboardStore();

  useEffect(() => {
    const ws = new WebSocket('/ws/dashboard');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'stats_update':
          refreshStats();
          break;
        case 'new_notification':
          // Handle new notification
          break;
        case 'activity_update':
          // Handle activity update
          break;
      }
    };

    return () => ws.close();
  }, [refreshStats]);
};
```

---

## 📱 **Component Structure**

### **Dashboard Component:**
```typescript
// Dashboard main component
export const Dashboard: React.FC = () => {
  const { 
    stats, 
    activities, 
    notifications, 
    loading, 
    fetchDashboardData 
  } = useDashboardStore();

  useDashboardRealtime(); // Real-time updates

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="dashboard-container">
      <DashboardHeader notifications={notifications} />
      <StatsCards stats={stats} />
      <QuickActions />
      <div className="dashboard-grid">
        <AnalyticsWidget />
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
};
```

### **Stats Cards Component:**
```typescript
interface StatsCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: LucideIcon;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'primary'
}) => {
  const changeColor = change > 0 ? 'text-green-600' : 'text-red-600';
  const changeIcon = change > 0 ? TrendingUp : TrendingDown;

  return (
    <Card className="stats-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold">{value}</p>
              {change && (
                <div className={cn("flex items-center text-sm", changeColor)}>
                  <ChangeIcon className="w-4 h-4 mr-1" />
                  {Math.abs(change)}%
                </div>
              )}
            </div>
          </div>
          <Icon className={cn("w-8 h-8", `text-${color}`)} />
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## 🎯 **Performance Optimization**

### **Loading States:**
- **Skeleton Loading**: Placeholder untuk stats cards
- **Progressive Loading**: Load critical data first
- **Smooth Transitions**: Fade-in animations untuk new data
- **Error Handling**: Graceful fallbacks untuk failed requests

### **Caching Strategy:**
```typescript
// React Query untuk caching dashboard data
const useDashboardQuery = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getOverview(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
    refetchOnWindowFocus: true
  });
};
```

### **Performance Targets:**
- **Initial Load**: < 2 seconds
- **Data Refresh**: < 1 second  
- **Widget Interactions**: < 500ms
- **Mobile Performance**: 60 FPS scrolling

---

## 🔗 **Related Documentation**

- **[Real-time Monitoring](./realtime.md)** - WebSocket implementation
- **[Custom Reports](./reports.md)** - Report generation system
- **[Analytics Tracking](./tracking.md)** - Data collection methods

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
