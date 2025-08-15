'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MoreHorizontal, Eye, Download, Star, /* Settings, */ Palette, CheckCircle, /* AlertCircle */ } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/cn'

interface ThemeAuthor {
  name: string
  email: string
  website: string
  avatar?: string
  verified: boolean
  social?: {
    twitter?: string
    github?: string
    linkedin?: string
  }
}

interface Theme {
  id: string
  name: string
  version: string
  description: string
  author: ThemeAuthor
  screenshot: string
  thumbnails: string[]
  tags: string[]
  category: 'business' | 'blog' | 'portfolio' | 'ecommerce' | 'landing' | 'corporate' | 'creative'
  features: Array<{
    name: string
    supported: boolean
    version?: string
    config?: Record<string, any>
    required?: boolean
  }>
  compatibility: {
    minVersion: string
    maxVersion?: string
    requiredFeatures: string[]
    supportedLanguages: string[]
  }
  metadata: {
    isActive: boolean
    isSystem: boolean
    isChild: boolean
    parentTheme?: string
    installedAt: string
    updatedAt: string
    lastUsed?: string
    downloadCount?: number
    rating?: number
    reviewCount?: number
  }
  license: {
    type: 'free' | 'premium' | 'commercial'
    price?: number
    licenseKey?: string
    expiresAt?: string
  }
}

interface ThemeCardProps {
  theme: Theme
  onActivate?: (themeId: string) => void
  onCustomize?: (themeId: string) => void
  onPreview?: (themeId: string) => void
  onDelete?: (themeId: string) => void
  onUpdate?: (themeId: string) => void
  className?: string
}

export function ThemeCard({ theme, onActivate, onCustomize, onPreview, onDelete, onUpdate, className }: ThemeCardProps) {
  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'business':
        return 'default' as const
      case 'blog':
        return 'secondary' as const
      case 'portfolio':
        return 'outline' as const
      case 'ecommerce':
        return 'destructive' as const
      case 'landing':
        return 'default' as const
      case 'corporate':
        return 'secondary' as const
      case 'creative':
        return 'outline' as const
      default:
        return 'outline' as const
    }
  }

  const getLicenseBadgeVariant = (type: string) => {
    switch (type) {
      case 'free':
        return 'default' as const
      case 'premium':
        return 'secondary' as const
      case 'commercial':
        return 'destructive' as const
      default:
        return 'outline' as const
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const supportedFeatures = theme.features.filter(f => f.supported)
  // const requiredFeatures = theme.features.filter(f => f.required)

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-md group', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          {/* Screenshot */}
          <div className="w-20 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            <img 
              src={theme.screenshot} 
              alt={`${theme.name} preview`}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">{theme.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {theme.metadata.isActive && (
                <Badge variant="default" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
              <Badge variant={getCategoryBadgeVariant(theme.category)} className="text-xs">
                {theme.category.charAt(0).toUpperCase() + theme.category.slice(1)}
              </Badge>
              <Badge variant={getLicenseBadgeVariant(theme.license.type)} className="text-xs">
                {theme.license.type.charAt(0).toUpperCase() + theme.license.type.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onPreview && (
              <DropdownMenuItem onClick={() => onPreview(theme.id)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
            )}
            {onCustomize && (
              <DropdownMenuItem onClick={() => onCustomize(theme.id)}>
                <Palette className="h-4 w-4 mr-2" />
                Customize
              </DropdownMenuItem>
            )}
            {!theme.metadata.isActive && onActivate && (
              <DropdownMenuItem onClick={() => onActivate(theme.id)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate
              </DropdownMenuItem>
            )}
            {onUpdate && (
              <DropdownMenuItem onClick={() => onUpdate(theme.id)}>
                <Download className="h-4 w-4 mr-2" />
                Update
              </DropdownMenuItem>
            )}
            {!theme.metadata.isSystem && onDelete && (
              <DropdownMenuItem 
                onClick={() => onDelete(theme.id)}
                className="text-red-600"
              >
                Delete Theme
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {theme.description}
          </p>
          
          {/* Author */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={theme.author.avatar} alt={theme.author.name} />
                <AvatarFallback className="text-xs">{getInitials(theme.author.name)}</AvatarFallback>
              </Avatar>
              <span>{theme.author.name}</span>
              {theme.author.verified && (
                <Badge variant="outline" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span>v{theme.version}</span>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {theme.metadata.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{theme.metadata.rating.toFixed(1)}</span>
                {theme.metadata.reviewCount && (
                  <span>({theme.metadata.reviewCount})</span>
                )}
              </div>
            )}
            {theme.metadata.downloadCount && (
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                <span>{theme.metadata.downloadCount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>{supportedFeatures.length} features</span>
            </div>
          </div>
          
          {/* Features */}
          {supportedFeatures.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {supportedFeatures.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature.name}
                </Badge>
              ))}
              {supportedFeatures.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{supportedFeatures.length - 3} more
                </span>
              )}
            </div>
          )}
          
          {/* Installation Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Installed: {formatDate(theme.metadata.installedAt)}</span>
            {theme.metadata.lastUsed && (
              <span>Last used: {formatDate(theme.metadata.lastUsed)}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
