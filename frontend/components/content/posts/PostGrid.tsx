'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  MoreHorizontal,
  Eye,
  Edit,
  Tag
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/cn'

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

interface PostGridProps {
  posts: Post[]
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
  onView?: (postId: string) => void
  onPostAction?: (postId: string, action: string) => void
  className?: string
}

export function PostGrid({ 
  posts, 
  onEdit, 
  onDelete, 
  onView, 
  onPostAction,
  className 
}: PostGridProps) {
  const getStatusBadge = (status: Post['status']) => {
    const variants = {
      draft: 'secondary',
      published: 'default',
      scheduled: 'outline',
      archived: 'destructive'
    } as const

    return (
      <Badge variant={variants[status]} className="text-xs">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
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
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4', className)}>
      {posts.map((post) => (
        <Card 
          key={post.id} 
          className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
        >
                    {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative h-48 overflow-hidden">
              <img
                src={post.featuredImage.url}
                alt={post.featuredImage.alt}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute top-2 right-2">
                {getStatusBadge(post.status)}
              </div>
            </div>
          )}

          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-1">
                  {post.title}
                </h3>
                {!post.featuredImage && (
                  <div className="mb-2">
                    {getStatusBadge(post.status)}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onView?.(post.id)}
                  title="View post"
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onEdit?.(post.id)}>
                      <Edit className="h-3 w-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onView?.(post.id)}>
                      <Eye className="h-3 w-3 mr-2" />
                      View
                    </DropdownMenuItem>
                                               {post.status === 'draft' && (
                             <DropdownMenuItem onClick={() => onPostAction?.(post.id, 'publish')}>
                               Publish
                             </DropdownMenuItem>
                           )}
                           {post.status === 'published' && (
                             <DropdownMenuItem onClick={() => onPostAction?.(post.id, 'unpublish')}>
                               Unpublish
                             </DropdownMenuItem>
                           )}
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(post.id)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Excerpt */}
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {post.excerpt}
            </p>

            {/* Meta Information */}
            <div className="space-y-2">
                                   {/* Author & Date */}
                     <div className="flex items-center gap-2 text-xs text-muted-foreground">
                       <Avatar className="h-5 w-5">
                         <AvatarImage src={post.author?.avatar || ""} />
                         <AvatarFallback className="text-xs">
                           {getInitials(post.author?.name || 'Unknown')}
                         </AvatarFallback>
                       </Avatar>
                       <span className="truncate">
                         {post.author?.name || 'Unknown Author'}
                       </span>
                       <span>•</span>
                       <span>
                         {post.status === 'published' && post.publishedAt
                           ? formatDate(post.publishedAt)
                           : formatDate(post.createdAt)
                         }
                       </span>
                     </div>

                     {/* Categories */}
                     {post.categories && post.categories.length > 0 && (
                       <div className="flex items-center gap-1 text-xs text-muted-foreground">
                         <Tag className="h-3 w-3" />
                         <span className="truncate">{post.categories[0]?.name}</span>
                       </div>
                     )}

                     {/* Tags */}
                     {post.tags && post.tags.length > 0 && (
                       <div className="flex flex-wrap gap-1">
                         {post.tags.slice(0, 2).map((tag) => (
                           <Badge key={tag.id} variant="secondary" className="text-xs px-1.5 py-0.5">
                             {tag.name}
                           </Badge>
                         ))}
                         {post.tags.length > 2 && (
                           <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                             +{post.tags.length - 2}
                           </Badge>
                         )}
                       </div>
                     )}

                     {/* Stats */}
                     <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                       <span className="flex items-center gap-1">
                         <Eye className="h-3 w-3" />
                         {post.viewCount.toLocaleString()}
                       </span>
                       <span className="flex items-center gap-1">
                         <span>💬</span>
                         {post.commentCount}
                       </span>
                       <span className="flex items-center gap-1">
                         <span>📖</span>
                         {post.readingTime} min
                       </span>
                     </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
