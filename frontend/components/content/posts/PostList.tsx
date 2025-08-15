'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  MoreHorizontal,
  Eye,
  Edit,
  Calendar,
  Tag,
  User,
  Save,
  X
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

interface PostListProps {
  posts: Post[]
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
  onView?: (postId: string) => void
  onPostAction?: (postId: string, action: string) => void
  onQuickEdit?: (postId: string, data: { title: string; excerpt: string; status: Post['status'] }) => void
  editingPost?: string | null
  editForm?: {
    title: string
    excerpt: string
    status: Post['status']
  }
  onEditFormChange?: (data: { title: string; excerpt: string; status: Post['status'] }) => void
  onSaveQuickEdit?: (postId: string) => void
  onCancelQuickEdit?: () => void
  actionLoading?: string | null
  className?: string
}

export function PostList({ 
  posts, 
  onEdit, 
  onDelete, 
  onView, 
  onPostAction,
  onQuickEdit,
  editingPost,
  editForm,
  onEditFormChange,
  onSaveQuickEdit,
  onCancelQuickEdit,
  actionLoading,
  className 
}: PostListProps) {
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

  return (
    <div className={cn('space-y-2', className)}>
      {posts.map((post) => {
        const isEditing = editingPost === post.id
        
        return (
          <div 
            key={post.id} 
            className="group flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            {/* Checkbox */}
            <div className="flex-shrink-0">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                // Quick Edit Mode
                <div className="space-y-2">
                  <Input
                    value={editForm?.title || ''}
                    onChange={(e) => onEditFormChange?.({
                      ...editForm!,
                      title: e.target.value
                    })}
                    placeholder="Post title"
                    className="text-sm font-medium"
                  />
                  <Input
                    value={editForm?.excerpt || ''}
                    onChange={(e) => onEditFormChange?.({
                      ...editForm!,
                      excerpt: e.target.value
                    })}
                    placeholder="Post excerpt"
                    className="text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <Select 
                      value={editForm?.status || 'DRAFT'} 
                      onValueChange={(value: Post['status']) => onEditFormChange?.({
                        ...editForm!,
                        status: value
                      })}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      onClick={() => onSaveQuickEdit?.(post.id)}
                      disabled={actionLoading === post.id}
                    >
                      {actionLoading === post.id ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent mr-1" />
                      ) : (
                        <Save className="h-3 w-3 mr-1" />
                      )}
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onCancelQuickEdit}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium truncate">{post.title}</h3>
                    {getStatusBadge(post.status)}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {post.excerpt}
                  </p>
                </div>
              )}
            </div>

            {/* Meta Information */}
            {!isEditing && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
                                       {/* Author */}
                       <div className="flex items-center gap-1">
                         <User className="h-3 w-3" />
                         <span className="truncate max-w-20">
                           {post.author?.name || 'Unknown Author'}
                         </span>
                       </div>

                       {/* Date */}
                       <div className="flex items-center gap-1">
                         <Calendar className="h-3 w-3" />
                         <span>
                           {post.status === 'published' && post.publishedAt
                             ? formatDate(post.publishedAt)
                             : formatDate(post.createdAt)
                           }
                         </span>
                       </div>

                       {/* Categories */}
                       {post.categories && post.categories.length > 0 && (
                         <div className="flex items-center gap-1">
                           <Tag className="h-3 w-3" />
                           <span className="truncate max-w-16">{post.categories[0]?.name}</span>
                         </div>
                       )}

                       {/* Stats */}
                       <div className="flex items-center gap-3">
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
            )}

            {/* Actions */}
            {!isEditing && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                       <Button
                         variant="ghost"
                         size="sm"
                         className="h-6 w-6 p-0"
                         onClick={() => onView?.(post.id)}
                         title="View post"
                       >
                         <Eye className="h-3 w-3" />
                       </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => onQuickEdit?.(post.id, {
                    title: post.title,
                    excerpt: post.excerpt,
                    status: post.status
                  })}
                  title="Quick edit"
                >
                  <Edit className="h-3 w-3" />
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
            )}
          </div>
        )
      })}
    </div>
  )
}
