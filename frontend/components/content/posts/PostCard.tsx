'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MoreHorizontal, Eye, Edit, Calendar, Tag, Folder, ImageIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/cn'
import { useState } from 'react'

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

interface PostCardProps {
  post: Post
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
  onView?: (postId: string) => void
  onPreview?: (postId: string) => void
  className?: string
}

export function PostCard({ post, onEdit, onDelete, onView, onPreview, className }: PostCardProps) {
  const [imageError, setImageError] = useState(false)

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

  return (
    <Card className={cn('group border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:border-border/80', className)}>
      {/* Featured Image */}
      {post.featuredImage && post.featuredImage.url && !imageError && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={post.featuredImage.url} 
            alt={post.featuredImage.alt || post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        </div>
      )}
      
      {/* Fallback for missing or failed images */}
      {(!post.featuredImage || !post.featuredImage.url || imageError) && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold leading-tight text-foreground line-clamp-2 mb-2">
              {post.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(post.status)} className="text-xs">
                {getStatusDisplayName(post.status)}
              </Badge>
              {post.categories.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Folder className="h-3 w-3 mr-1" />
                  {post.categories[0]?.name || 'Uncategorized'}
                </Badge>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
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
                  className="text-destructive focus:text-destructive"
                >
                  Delete Post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Excerpt */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {post.excerpt || post.content.substring(0, 150) + '...'}
        </p>
        
        {/* Author and Date */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={post.author?.avatar} alt={post.author?.name || 'Unknown'} />
              <AvatarFallback className="text-xs">{getInitials(post.author?.name || 'Unknown')}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{post.author?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{post.viewCount} views</span>
          </div>
          <div>
            <span>{post.readingTime} min read</span>
          </div>
          {post.commentCount > 0 && (
            <div>
              <span>{post.commentCount} comments</span>
            </div>
          )}
        </div>
        
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
