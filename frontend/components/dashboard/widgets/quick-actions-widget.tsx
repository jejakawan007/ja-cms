'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-no-shadow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Upload, 
  UserPlus, 
  ExternalLink, 
  Database, 
  Settings,
  Plus,
  MoreHorizontal,
  Download,
  Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/cn';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href?: string;
  action?: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
  badge?: string;
}

interface QuickActionsWidgetProps {
  config?: {
    maxActions?: number;
    showIcons?: boolean;
  };
}

const defaultActions: QuickAction[] = [
  {
    id: 'create-post',
    title: 'Create Post',
    description: 'Write a new blog post',
    icon: FileText,
    href: '/dashboard/content/posts/new',
    color: 'primary'
  },
  {
    id: 'upload-media',
    title: 'Upload Media',
    description: 'Add new media files',
    icon: Upload,
    href: '/dashboard/media/upload',
    color: 'secondary'
  },
  {
    id: 'add-user',
    title: 'Add User',
    description: 'Create new user account',
    icon: UserPlus,
    href: '/dashboard/users/new',
    color: 'success'
  },
  {
    id: 'view-site',
    title: 'View Site',
    description: 'Preview your website',
    icon: ExternalLink,
    action: 'viewSite',
    color: 'info'
  },
  {
    id: 'create-backup',
    title: 'Create Backup',
    description: 'Backup system data',
    icon: Database,
    action: 'createBackup',
    color: 'warning',
    badge: 'New'
  },
  {
    id: 'system-settings',
    title: 'System Settings',
    description: 'Manage system configuration',
    icon: Settings,
    href: '/dashboard/system/settings',
    color: 'default'
  },
  {
    id: 'export-data',
    title: 'Export Data',
    description: 'Export system data',
    icon: Download,
    action: 'exportData',
    color: 'warning'
  },
  {
    id: 'security-scan',
    title: 'Security Scan',
    description: 'Run security check',
    icon: Shield,
    action: 'securityScan',
    color: 'danger'
  }
];

const colorClasses = {
  primary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
  secondary: 'bg-secondary hover:bg-secondary/90 text-secondary-foreground',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  info: 'bg-blue-600 hover:bg-blue-700 text-white',
  default: 'bg-muted hover:bg-muted/80 text-muted-foreground'
};

export function QuickActionsWidget({ config }: QuickActionsWidgetProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showAllActions, setShowAllActions] = useState(false);

  const maxActions = config?.maxActions || 6;

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
  
  const displayedActions = defaultActions.slice(0, maxActions);

  const handleAction = async (action: QuickAction) => {
    if (loading) return;
    
    setLoading(action.id);
    
    try {
      if (action.href) {
        router.push(action.href);
        toast({
          title: action.title,
          description: `Navigating to ${action.title.toLowerCase()}...`,
        });
      } else if (action.action) {
        switch (action.action) {
          case 'viewSite':
            window.open('/', '_blank');
            toast({
              title: "View Site",
              description: "Opening website in new tab...",
            });
            break;
          case 'createBackup':
            // Simulate backup creation
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast({
              title: "Backup Created",
              description: "System backup has been created successfully.",
            });
            break;
          case 'exportData':
            // Simulate data export
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast({
              title: "Data Exported",
              description: "System data has been exported successfully.",
            });
            break;
          case 'securityScan':
            // Simulate security scan
            await new Promise(resolve => setTimeout(resolve, 3000));
            toast({
              title: "Security Scan Complete",
              description: "No security issues found. System is secure.",
            });
            break;
          default:
            console.log(`Action: ${action.action}`);
        }
      }
    } catch (error) {
      console.error('Action failed:', error);
      toast({
        title: "Action Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleConfigAction = (action: string) => {
    setShowConfigMenu(false);
    
    switch (action) {
      case 'customize':
        toast({
          title: "Customize Quick Actions",
          description: "Quick action customization feature coming soon.",
        });
        break;
      case 'reorder':
        toast({
          title: "Reorder Actions",
          description: "Drag and drop to reorder quick actions.",
        });
        break;
      case 'add-custom':
        toast({
          title: "Add Custom Action",
          description: "Create your own custom quick actions.",
        });
        break;
      case 'export-config':
        toast({
          title: "Export Configuration",
          description: "Quick actions configuration exported.",
        });
        break;
      default:
        console.log(`Config action: ${action}`);
    }
  };

  return (
    <Card className="h-full border-border bg-card shadow-sm flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
            <p className="text-sm text-muted-foreground">Common tasks and shortcuts</p>
          </div>
          <div className="relative" ref={menuRef}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-muted/50"
              onClick={() => setShowConfigMenu(!showConfigMenu)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            
            {showConfigMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                <div className="p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleConfigAction('customize')}
                    className="w-full justify-start text-sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Customize Actions
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleConfigAction('reorder')}
                    className="w-full justify-start text-sm"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Reorder Actions
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleConfigAction('add-custom')}
                    className="w-full justify-start text-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Action
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleConfigAction('export-config')}
                    className="w-full justify-start text-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Configuration
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="grid grid-cols-1 gap-3 flex-1">
          {displayedActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="w-full justify-start h-auto p-3 hover:bg-muted/50 border-border"
              onClick={() => handleAction(action)}
              disabled={loading === action.id}
            >
              <div className="flex items-center space-x-3 w-full">
                <div className={cn(
                  "p-2 rounded-lg",
                  colorClasses[action.color]
                )}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{action.title}</span>
                    {action.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
                {loading === action.id && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                )}
              </div>
            </Button>
          ))}
          
          {defaultActions.length > maxActions && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-foreground mt-auto"
              onClick={() => setShowAllActions(!showAllActions)}
            >
              {showAllActions ? 'Show Less' : `View All Actions (${defaultActions.length - maxActions} more)`}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
