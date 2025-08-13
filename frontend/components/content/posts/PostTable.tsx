'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MoreHorizontal, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PostCard } from './PostCard'

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  author: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  categories: Array<{ id: string; name: string; color: string }>
  tags: Array<{ id: string; name: string }>
  featuredImage?: {
    id: string
    url: string
    alt: string
    caption?: string
  }
  publishedAt?: string
  createdAt: string
  updatedAt: string
  viewCount: number
  commentCount: number
  readingTime: number
}

interface PostTableProps {
  posts: Post[]
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
  onView?: (postId: string) => void
  onPreview?: (postId: string) => void
  onAdd?: () => void
  className?: string
}

export function PostTable({ posts, onEdit, onDelete, onView, onPreview, onAdd, className }: PostTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default' as const
      case 'draft':
        return 'secondary' as const
      case 'scheduled':
        return 'outline' as const
      case 'archived':
        return 'destructive' as const
      default:
        return 'outline' as const
    }
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'published':
        return 'Published'
      case 'draft':
        return 'Draft'
      case 'scheduled':
        return 'Scheduled'
      case 'archived':
        return 'Archived'
      default:
        return status
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

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.author?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || 
                           post.categories.some(cat => cat.name === categoryFilter)
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  // Get unique categories for filter
  const categories = Array.from(new Set(posts.flatMap(post => post.categories.map(cat => cat.name))))

  if (viewMode === 'cards') {
    return (
      <div className={className}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => setViewMode('table')}>
              Table View
            </Button>
            
            {onAdd && (
              <Button onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            )}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              onPreview={onPreview}
            />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No posts found matching your criteria.
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
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => setViewMode('cards')}>
            Card View
          </Button>
          
          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {post.featuredImage && (
                      <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                        <img 
                          src={post.featuredImage.url} 
                          alt={post.featuredImage.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-medium truncate max-w-[200px]">{post.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {post.excerpt || post.content.substring(0, 50) + '...'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                                         <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                       {getInitials(post.author?.name || 'Unknown')}
                     </div>
                                         <span className="text-sm">{post.author?.name || 'Unknown'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(post.status)}>
                    {getStatusDisplayName(post.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {post.categories.length > 0 && post.categories[0] && (
                    <Badge variant="outline" className="text-xs">
                      {post.categories[0].name || 'Uncategorized'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {post.viewCount.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(post.createdAt)}
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
                        <DropdownMenuItem onClick={() => onPreview(post.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                      )}
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(post.id)}>
                          View Details
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(post.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Post
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(post.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Post
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

      {filteredPosts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No posts found matching your criteria.
        </div>
      )}
    </div>
  )
}
