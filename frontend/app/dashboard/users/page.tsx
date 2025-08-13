'use client';


import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  MoreHorizontal,
  User,
  Shield,
  Mail,
  Calendar,
  Activity,
  Eye,
  Lock,
  Unlock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'USER' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  postCount: number;
  loginCount: number;
}

export default function UsersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  const { users, loading, error, updateUserStatus, deleteUser } = useUsers();

  // Sample users data for fallback
  const sampleUsers: User[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'ADMIN',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      lastLogin: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      postCount: 25,
      loginCount: 156
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@example.com',
      role: 'EDITOR',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
      lastLogin: '2024-01-14T14:20:00Z',
      createdAt: '2024-01-02T00:00:00Z',
      postCount: 18,
      loginCount: 89
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@example.com',
      role: 'USER',
      status: 'ACTIVE',
      lastLogin: '2024-01-13T16:45:00Z',
      createdAt: '2024-01-03T00:00:00Z',
      postCount: 12,
      loginCount: 67
    },
    {
      id: '4',
      firstName: 'Emily',
      lastName: 'Brown',
      email: 'emily.brown@example.com',
      role: 'USER',
      status: 'INACTIVE',
      lastLogin: '2024-01-10T09:15:00Z',
      createdAt: '2024-01-04T00:00:00Z',
      postCount: 8,
      loginCount: 34
    },
    {
      id: '5',
      firstName: 'David',
      lastName: 'Miller',
      email: 'david.miller@example.com',
      role: 'VIEWER',
      status: 'ACTIVE',
      lastLogin: '2024-01-15T08:30:00Z',
      createdAt: '2024-01-05T00:00:00Z',
      postCount: 0,
      loginCount: 23
    },
    {
      id: '6',
      firstName: 'Lisa',
      lastName: 'Garcia',
      email: 'lisa.garcia@example.com',
      role: 'EDITOR',
      status: 'SUSPENDED',
      lastLogin: '2024-01-08T11:30:00Z',
      createdAt: '2024-01-06T00:00:00Z',
      postCount: 15,
      loginCount: 45
    }
  ];

  const getRoleBadge = (role: User['role']) => {
    const variants = {
      ADMIN: 'destructive',
      EDITOR: 'default',
      USER: 'secondary',
      VIEWER: 'outline'
    } as const;

    return (
      <Badge variant={variants[role]}>
        {role.charAt(0) + role.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: User['status']) => {
    const variants = {
      ACTIVE: 'default',
      INACTIVE: 'secondary',
      SUSPENDED: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLastLogin = (dateString: string) => {
    const now = new Date();
    const lastLogin = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  const displayUsers = users.length > 0 ? users : sampleUsers;
  
  const filteredUsers = displayUsers.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditUser = (userId: string) => {
    console.log('Edit user:', userId);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: User['status']) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateUserStatus(userId, newStatus);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage user accounts and permissions
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/users/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedRole === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRole('all')}
                >
                  All Roles
                </Button>
                <Button
                  variant={selectedRole === 'ADMIN' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRole('ADMIN')}
                >
                  Admin
                </Button>
                <Button
                  variant={selectedRole === 'EDITOR' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRole('EDITOR')}
                >
                  Editor
                </Button>
                <Button
                  variant={selectedRole === 'USER' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRole('USER')}
                >
                  Author
                </Button>
                <Button
                  variant={selectedRole === 'VIEWER' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRole('VIEWER')}
                >
                  Viewer
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('all')}
                >
                  All Status
                </Button>
                <Button
                  variant={selectedStatus === 'ACTIVE' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('ACTIVE')}
                >
                  Active
                </Button>
                <Button
                  variant={selectedStatus === 'INACTIVE' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('INACTIVE')}
                >
                  Inactive
                </Button>
                <Button
                  variant={selectedStatus === 'SUSPENDED' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('SUSPENDED')}
                >
                  Suspended
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading users...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error loading users: {error}</p>
            </div>
          ) : (
                        filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {user.firstName} {user.lastName}
                          </h3>
                          {getRoleBadge(user.role)}
                          {getStatusBadge(user.status)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Joined {formatDate(user.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="h-4 w-4" />
                            {user.postCount} posts
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {user.loginCount} logins
                          </span>
                        </div>
                        
                        {user.lastLogin && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Last login: {formatLastLogin(user.lastLogin)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(user.id, user.status)}
                      >
                        {user.status === 'ACTIVE' ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <Unlock className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          
          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-4" />
                  </div>
                  <h3 className="text-lg font-semibold">No users found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedRole !== 'all' || selectedStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Create your first user account'
                    }
                  </p>
                  {!searchTerm && selectedRole === 'all' && selectedStatus === 'all' && (
                    <Button onClick={() => router.push('/dashboard/users/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Total Users</span>
              </div>
              <div className="text-2xl font-bold mt-2">{displayUsers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Active Users</span>
              </div>
              <div className="text-2xl font-bold mt-2">
                {displayUsers.filter(u => u.status === 'ACTIVE').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">Total Posts</span>
              </div>
              <div className="text-2xl font-bold mt-2">
                {displayUsers.reduce((sum, user) => sum + user.postCount, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Total Logins</span>
              </div>
              <div className="text-2xl font-bold mt-2">
                {displayUsers.reduce((sum, user) => sum + user.loginCount, 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
