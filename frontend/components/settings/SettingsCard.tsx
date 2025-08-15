'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Settings, Globe, FileText, Shield, Mail, Database, Zap, Users, Palette, Bell } from 'lucide-react'
import { cn } from '@/lib/cn'

interface SettingsCategory {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  settingsCount: number
  isRequired?: boolean
  isAdvanced?: boolean
  lastModified?: string
}

interface SettingsCardProps {
  category: SettingsCategory
  onOpen?: (categoryId: string) => void
  className?: string
}

export function SettingsCard({ category, onOpen, className }: SettingsCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-md group cursor-pointer', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {category.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">{category.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {category.isRequired && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
              {category.isAdvanced && (
                <Badge variant="outline" className="text-xs">
                  Advanced
                </Badge>
              )}
              {category.badge && (
                <Badge variant={category.badgeVariant || 'default'} className="text-xs">
                  {category.badge}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onOpen?.(category.id)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {category.description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{category.settingsCount} settings</span>
            {category.lastModified && (
              <span>Updated: {formatDate(category.lastModified)}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Predefined settings categories
export const SETTINGS_CATEGORIES: SettingsCategory[] = [
  {
    id: 'general',
    name: 'General Settings',
    description: 'Site information, registration, comments, and privacy settings',
    icon: <Globe className="h-5 w-5" />,
    badge: 'Core',
    badgeVariant: 'default',
    settingsCount: 15,
    isRequired: true
  },
  {
    id: 'content',
    name: 'Content Settings',
    description: 'Reading, writing, and media configuration',
    icon: <FileText className="h-5 w-5" />,
    badge: 'Content',
    badgeVariant: 'secondary',
    settingsCount: 12,
    isRequired: true
  },
  {
    id: 'technical',
    name: 'Technical Settings',
    description: 'Performance, database, and security configuration',
    icon: <Zap className="h-5 w-5" />,
    badge: 'Advanced',
    badgeVariant: 'outline',
    settingsCount: 18,
    isAdvanced: true
  },
  {
    id: 'email',
    name: 'Email Configuration',
    description: 'SMTP settings, templates, and notification preferences',
    icon: <Mail className="h-5 w-5" />,
    badge: 'Communication',
    badgeVariant: 'secondary',
    settingsCount: 10
  },
  {
    id: 'users',
    name: 'User Management',
    description: 'User roles, permissions, and authentication settings',
    icon: <Users className="h-5 w-5" />,
    badge: 'Security',
    badgeVariant: 'destructive',
    settingsCount: 8,
    isRequired: true
  },
  {
    id: 'appearance',
    name: 'Appearance',
    description: 'Theme customization, colors, and layout settings',
    icon: <Palette className="h-5 w-5" />,
    badge: 'UI/UX',
    badgeVariant: 'outline',
    settingsCount: 6
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'System notifications and alert preferences',
    icon: <Bell className="h-5 w-5" />,
    badge: 'Alerts',
    badgeVariant: 'secondary',
    settingsCount: 5
  },
  {
    id: 'database',
    name: 'Database',
    description: 'Database optimization and maintenance settings',
    icon: <Database className="h-5 w-5" />,
    badge: 'System',
    badgeVariant: 'outline',
    settingsCount: 7,
    isAdvanced: true
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Security policies, access control, and threat protection',
    icon: <Shield className="h-5 w-5" />,
    badge: 'Critical',
    badgeVariant: 'destructive',
    settingsCount: 9,
    isRequired: true
  }
]
