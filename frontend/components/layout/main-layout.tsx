'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  LayoutDashboard, 
  FileText, 
  Image, 
  Settings, 
  Users, 
  BarChart3, 
  Menu, 
  X, 
  LogOut, 
  User,
  Bell,
  Search,
  Shield,
  Palette,
  Wrench,
  Puzzle,
  FolderOpen,
  MessageSquare,
  Upload,
  FolderTree,
  Eye,
  BarChart,
  Brain,

  Globe,
  Database,
  HardDrive,
  Zap,
  Activity,
  AlertTriangle,
  RefreshCw,
  Mail,
  Code,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Home,
  ChevronDown,

} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { useTheme } from 'next-themes';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
  children?: NavigationItem[];
}

interface MainLayoutProps {
  children: React.ReactNode;
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    current: true,
  },
  {
    name: 'Content',
    href: '/dashboard/content',
    icon: FileText,
    current: false,
    children: [
      { name: 'Posts', href: '/dashboard/content/posts', icon: FileText, current: false },
      { name: 'Pages', href: '/dashboard/content/pages', icon: FileText, current: false },
      {
        name: 'Categories',
        href: '/dashboard/content/categories',
        icon: FolderOpen,
        current: false,
        children: [
          {
            name: 'All Categories',
            href: '/dashboard/content/categories',
            icon: FolderOpen,
            current: false
          },
          {
            name: 'Advanced Management',
            href: '/dashboard/content/categories/advanced',
            icon: Settings,
            current: false
          }
        ]
      },
      { name: 'Comments', href: '/dashboard/content/comments', icon: MessageSquare, current: false },
      { name: 'Advanced', href: '/dashboard/content/advanced', icon: Settings, current: false },
      { name: 'AI-Powered', href: '/dashboard/content/ai-powered', icon: Brain, current: false },
    ]
  },
  {
    name: 'Media',
    href: '/dashboard/media',
    icon: Image,
    current: false,
    children: [
      { name: 'Library', href: '/dashboard/media/library', icon: Image, current: false },
      { name: 'Upload', href: '/dashboard/media/upload', icon: Upload, current: false },
      { name: 'Folders', href: '/dashboard/media/folders', icon: FolderTree, current: false },
      { name: 'Processing', href: '/dashboard/media/processing', icon: Zap, current: false },
    ]
  },
  {
    name: 'Themes',
    href: '/dashboard/themes',
    icon: Palette,
    current: false,
    children: [
      { name: 'Themes', href: '/dashboard/themes/list', icon: Palette, current: false },
      { name: 'Customizer', href: '/dashboard/themes/customizer', icon: Eye, current: false },
      { name: 'Widgets', href: '/dashboard/themes/widgets', icon: Puzzle, current: false },
      { name: 'Menus', href: '/dashboard/themes/menus', icon: Menu, current: false },
    ]
  },
  {
    name: 'Users',
    href: '/dashboard/users',
    icon: Users,
    current: false,
    children: [
      { name: 'Users', href: '/dashboard/users/list', icon: Users, current: false },
      { name: 'Roles', href: '/dashboard/users/roles', icon: Shield, current: false },
      { name: 'Groups', href: '/dashboard/users/groups', icon: Users, current: false },
      { name: 'Permissions', href: '/dashboard/users/permissions', icon: Shield, current: false },
    ]
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    current: false,
    children: [
      { name: 'Overview', href: '/dashboard/analytics', icon: BarChart3, current: false },
      {
        name: 'Category Analytics',
        href: '/dashboard/analytics/content/categories',
        icon: FolderOpen,
        current: false
      },
      { name: 'Content Analytics', href: '/dashboard/analytics/content', icon: BarChart, current: false },
      { name: 'User Analytics', href: '/dashboard/analytics/users', icon: Users, current: false },
      { name: 'Reports', href: '/dashboard/analytics/reports', icon: FileText, current: false },
    ]
  },
  {
    name: 'Security',
    href: '/dashboard/security',
    icon: Shield,
    current: false,
    children: [
      { name: 'Monitoring', href: '/dashboard/security/monitoring', icon: Activity, current: false },
      { name: 'Firewall', href: '/dashboard/security/firewall', icon: Shield, current: false },
      { name: 'Incidents', href: '/dashboard/security/incidents', icon: AlertTriangle, current: false },
      { name: 'Updates', href: '/dashboard/security/updates', icon: RefreshCw, current: false },
    ]
  },
  {
    name: 'System',
    href: '/dashboard/system',
    icon: Settings,
    current: false,
    children: [
      { name: 'Settings', href: '/dashboard/system/settings', icon: Settings, current: false },
      { name: 'Performance', href: '/dashboard/system/performance', icon: Zap, current: false },
      { name: 'Health', href: '/dashboard/system/health', icon: Activity, current: false },
      { name: 'Maintenance', href: '/dashboard/system/maintenance', icon: Wrench, current: false },
      { name: 'Email', href: '/dashboard/system/email', icon: Mail, current: false },
    ]
  },
  {
    name: 'Tools',
    href: '/dashboard/tools',
    icon: Wrench,
    current: false,
    children: [
      { name: 'Backup', href: '/dashboard/tools/backup', icon: HardDrive, current: false },
      { name: 'Import/Export', href: '/dashboard/tools/import-export', icon: Database, current: false },
      { name: 'Database', href: '/dashboard/tools/database', icon: Database, current: false },
      { name: 'Diagnostics', href: '/dashboard/tools/diagnostics', icon: Activity, current: false },
    ]
  },
  {
    name: 'Extensions',
    href: '/dashboard/extensions',
    icon: Puzzle,
    current: false,
    children: [
      { name: 'Plugins', href: '/dashboard/extensions/plugins', icon: Puzzle, current: false },
      { name: 'Marketplace', href: '/dashboard/extensions/marketplace', icon: Globe, current: false },
      { name: 'Development', href: '/dashboard/extensions/development', icon: Code, current: false },
    ]
  },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isCurrentPath = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const isMenuOpen = (menuName: string) => openMenus.includes(menuName);

  // Auto-open menu if current path is in sub-menu
  const getInitialOpenMenus = () => {
    const open: string[] = [];
    navigation.forEach(item => {
      if (item.children && item.children.some(child => isCurrentPath(child.href))) {
        open.push(item.name);
      }
    });
    return open;
  };

  // Initialize open menus on mount
  useEffect(() => {
    setOpenMenus(getInitialOpenMenus());
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 bg-background border-r border-border/50 transition-all duration-200",
        sidebarCollapsed ? "w-16" : "w-64",
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-14 items-center justify-between px-4 border-b border-border/50">
            <div className="flex items-center">
              {!sidebarCollapsed && (
                <h1 className="text-lg font-semibold text-foreground">
                  JA-CMS
                </h1>
              )}
              {sidebarCollapsed && (
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold text-xs">J</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex h-7 w-7 p-0"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <ChevronLeft className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden h-7 w-7 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-0.5 px-2 py-3 overflow-y-auto">
            {navigation.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isActive = isCurrentPath(item.href);
              const isOpen = isMenuOpen(item.name);

              if (!hasChildren) {
                // Simple menu item without children
                return (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                      )}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon className={cn(
                        "flex-shrink-0",
                        sidebarCollapsed ? "h-4 w-4" : "mr-2 h-4 w-4"
                      )} />
                      {!sidebarCollapsed && item.name}
                    </Link>
                  </div>
                );
              }

              // Menu item with children (dropdown)
              return (
                <div key={item.name}>
                  <Collapsible
                    open={!sidebarCollapsed && isOpen}
                    onOpenChange={() => !sidebarCollapsed && toggleMenu(item.name)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between px-2 py-1.5 text-sm font-medium rounded-md transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                        )}
                        title={sidebarCollapsed ? item.name : undefined}
                      >
                        <div className="flex items-center">
                          <item.icon className={cn(
                            "flex-shrink-0",
                            sidebarCollapsed ? "h-4 w-4" : "mr-2 h-4 w-4"
                          )} />
                          {!sidebarCollapsed && item.name}
                        </div>
                        {!sidebarCollapsed && (
                          <ChevronDown className={cn(
                            "h-3 w-3 transition-transform duration-200",
                            isOpen && "rotate-180"
                          )} />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    
                    {!sidebarCollapsed && (
                      <CollapsibleContent className="space-y-0.5">
                        <div className="ml-4 mt-1 space-y-0.5">
                          {item.children!.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className={cn(
                                "group flex items-center px-2 py-1 text-xs font-medium rounded-md transition-colors",
                                isCurrentPath(child.href)
                                  ? "bg-accent/30 text-accent-foreground"
                                  : "text-muted-foreground hover:bg-accent/30 hover:text-accent-foreground"
                              )}
                            >
                              <child.icon className="mr-2 h-3 w-3 flex-shrink-0" />
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                </div>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="border-t border-border/50 p-3">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user?.firstName || 'Admin'} {user?.lastName || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.role || 'SUPER_ADMIN'}
                    </p>
                  </div>
                </div>
              )}
              {sidebarCollapsed && (
                <div className="flex justify-center">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn(
        "transition-all duration-200",
        sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        {/* Top navbar */}
        <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-4 border-b border-border/50 bg-background px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden h-8 w-8 p-0"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              <Home className="h-3 w-3" />
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">
              {navigation.find(item => isCurrentPath(item.href))?.name || 'Dashboard'}
            </span>
          </div>

          {/* Search */}
          <div className="flex flex-1 justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-4 text-muted-foreground pl-3" />
              <Input
                type="search"
                placeholder="Search anything..."
                className="pl-9 h-8 bg-background border-border/50"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-x-2 lg:gap-x-3">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8 p-0"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full p-0 text-xs bg-destructive text-destructive-foreground">
                3
              </Badge>
            </Button>

            <Separator orientation="vertical" className="h-5" />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2 h-8">
                  <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <span className="hidden lg:block text-sm font-medium">
                    {user?.firstName || 'Admin'} {user?.lastName || 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
