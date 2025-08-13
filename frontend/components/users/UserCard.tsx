'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Mail, Calendar, Shield } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/cn'

import { User } from '@/lib/api/users'

interface UserCardProps {
  user: User
  onEdit?: (userId: string) => void
  onDelete?: (userId: string) => void
  onView?: (userId: string) => void
  className?: string
}

export function UserCard({ user, onEdit, onDelete, onView, className }: UserCardProps) {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'destructive' as const
      case 'ADMIN':
        return 'default' as const
      case 'EDITOR':
        return 'secondary' as const
      case 'USER':
        return 'outline' as const
      default:
        return 'outline' as const
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default' as const
      case 'INACTIVE':
        return 'secondary' as const
      case 'SUSPENDED':
        return 'destructive' as const
      default:
        return 'outline' as const
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg font-semibold">{`${user.firstName} ${user.lastName}`}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getRoleBadgeVariant(user.role)}>
                <Shield className="h-3 w-3 mr-1" />
                {user.role.replace('_', ' ')}
              </Badge>
              <Badge variant={getStatusBadgeVariant(user.status)}>
                {user.status}
              </Badge>
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(user.id)}>
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(user.id)}>
                Edit User
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem 
                onClick={() => onDelete(user.id)}
                className="text-red-600"
              >
                Delete User
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{user.email}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Joined: {formatDate(user.createdAt)}</span>
          </div>
          
          {user.lastLogin && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Last login: {formatDate(user.lastLogin)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
