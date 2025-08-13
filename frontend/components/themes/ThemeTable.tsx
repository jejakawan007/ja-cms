'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MoreHorizontal, Search, /* Filter, */ Plus, Eye, Palette, CheckCircle, Download, Trash2, Star } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ThemeCard } from './ThemeCard'

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

interface ThemeTableProps {
  themes: Theme[]
  onActivate?: (themeId: string) => void
  onCustomize?: (themeId: string) => void
  onPreview?: (themeId: string) => void
  onDelete?: (themeId: string) => void
  onUpdate?: (themeId: string) => void
  onInstall?: () => void
  className?: string
}

export function ThemeTable({ themes, onActivate, onCustomize, onPreview, onDelete, onUpdate, onInstall, className }: ThemeTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [licenseFilter, setLicenseFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

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

  const filteredThemes = themes.filter(theme => {
    const matchesSearch = theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         theme.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         theme.author.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || theme.category === categoryFilter
    const matchesLicense = licenseFilter === 'all' || theme.license.type === licenseFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && theme.metadata.isActive) ||
                         (statusFilter === 'inactive' && !theme.metadata.isActive)
    
    return matchesSearch && matchesCategory && matchesLicense && matchesStatus
  })

  if (viewMode === 'cards') {
    return (
      <div className={className}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search themes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="portfolio">Portfolio</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="landing">Landing</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={licenseFilter} onValueChange={setLicenseFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="License" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Licenses</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => setViewMode('table')}>
              Table View
            </Button>
            
            {onInstall && (
              <Button onClick={onInstall}>
                <Plus className="h-4 w-4 mr-2" />
                Install Theme
              </Button>
            )}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              onActivate={onActivate}
              onCustomize={onCustomize}
              onPreview={onPreview}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>

        {filteredThemes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No themes found matching your criteria.
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search themes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="portfolio">Portfolio</SelectItem>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="landing">Landing</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={licenseFilter} onValueChange={setLicenseFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="License" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Licenses</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => setViewMode('cards')}>
            Card View
          </Button>
          
          {onInstall && (
            <Button onClick={onInstall}>
              <Plus className="h-4 w-4 mr-2" />
              Install Theme
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Theme</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Installed</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredThemes.map((theme) => (
              <TableRow key={theme.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-9 rounded overflow-hidden bg-muted flex items-center justify-center">
                      <img 
                        src={theme.screenshot} 
                        alt={`${theme.name} preview`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium truncate max-w-[200px]">{theme.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {theme.description}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getCategoryBadgeVariant(theme.category)} className="text-xs">
                    {theme.category.charAt(0).toUpperCase() + theme.category.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getLicenseBadgeVariant(theme.license.type)} className="text-xs">
                    {theme.license.type.charAt(0).toUpperCase() + theme.license.type.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                      {getInitials(theme.author.name)}
                    </div>
                    <span className="text-sm">{theme.author.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {theme.metadata.rating ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{theme.metadata.rating.toFixed(1)}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {theme.metadata.isActive ? (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(theme.metadata.installedAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
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
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Theme
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredThemes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No themes found matching your criteria.
        </div>
      )}
    </div>
  )
}
