'use client';


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Search, 
  Shield,
  Users,
  Settings,
  Edit,
  Trash2,
  Lock
} from 'lucide-react';
import { useState } from 'react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
}

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Sample permissions data
  const permissions: Permission[] = [
    // Dashboard permissions
    { id: 'dashboard.view', name: 'View Dashboard', description: 'Access to dashboard overview', category: 'Dashboard' },
    { id: 'dashboard.analytics', name: 'View Analytics', description: 'Access to analytics and reports', category: 'Dashboard' },
    
    // Posts permissions
    { id: 'posts.view', name: 'View Posts', description: 'View all posts', category: 'Posts' },
    { id: 'posts.create', name: 'Create Posts', description: 'Create new posts', category: 'Posts' },
    { id: 'posts.edit', name: 'Edit Posts', description: 'Edit existing posts', category: 'Posts' },
    { id: 'posts.delete', name: 'Delete Posts', description: 'Delete posts', category: 'Posts' },
    { id: 'posts.publish', name: 'Publish Posts', description: 'Publish posts', category: 'Posts' },
    
    // Media permissions
    { id: 'media.view', name: 'View Media', description: 'View media library', category: 'Media' },
    { id: 'media.upload', name: 'Upload Media', description: 'Upload new media files', category: 'Media' },
    { id: 'media.delete', name: 'Delete Media', description: 'Delete media files', category: 'Media' },
    
    // Users permissions
    { id: 'users.view', name: 'View Users', description: 'View user list', category: 'Users' },
    { id: 'users.create', name: 'Create Users', description: 'Create new users', category: 'Users' },
    { id: 'users.edit', name: 'Edit Users', description: 'Edit user profiles', category: 'Users' },
    { id: 'users.delete', name: 'Delete Users', description: 'Delete users', category: 'Users' },
    
    // Settings permissions
    { id: 'settings.view', name: 'View Settings', description: 'View system settings', category: 'Settings' },
    { id: 'settings.edit', name: 'Edit Settings', description: 'Edit system settings', category: 'Settings' },
    
    // Categories permissions
    { id: 'categories.view', name: 'View Categories', description: 'View categories', category: 'Categories' },
    { id: 'categories.create', name: 'Create Categories', description: 'Create new categories', category: 'Categories' },
    { id: 'categories.edit', name: 'Edit Categories', description: 'Edit categories', category: 'Categories' },
    { id: 'categories.delete', name: 'Delete Categories', description: 'Delete categories', category: 'Categories' }
  ];

  // Sample roles data
  const roles: Role[] = [
    {
      id: '1',
      name: 'Administrator',
      description: 'Full access to all features and settings',
      userCount: 2,
      permissions: permissions.map(p => p.id),
      isSystem: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Editor',
      description: 'Can manage posts, media, and categories',
      userCount: 3,
      permissions: [
        'dashboard.view',
        'posts.view', 'posts.create', 'posts.edit', 'posts.publish',
        'media.view', 'media.upload',
        'categories.view', 'categories.create', 'categories.edit'
      ],
      isSystem: true,
      createdAt: '2024-01-02T00:00:00Z'
    },
    {
      id: '3',
      name: 'Author',
      description: 'Can create and edit their own posts',
      userCount: 5,
      permissions: [
        'dashboard.view',
        'posts.view', 'posts.create', 'posts.edit',
        'media.view', 'media.upload'
      ],
      isSystem: true,
      createdAt: '2024-01-03T00:00:00Z'
    },
    {
      id: '4',
      name: 'Viewer',
      description: 'Read-only access to dashboard and posts',
      userCount: 8,
      permissions: [
        'dashboard.view',
        'posts.view',
        'media.view'
      ],
      isSystem: true,
      createdAt: '2024-01-04T00:00:00Z'
    },
    {
      id: '5',
      name: 'Content Manager',
      description: 'Custom role for content management',
      userCount: 1,
      permissions: [
        'dashboard.view',
        'posts.view', 'posts.create', 'posts.edit', 'posts.publish',
        'media.view', 'media.upload',
        'categories.view', 'categories.create'
      ],
      isSystem: false,
      createdAt: '2024-01-10T00:00:00Z'
    }
  ];

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      const category = permission.category || 'Other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category]!.push(permission);
    });
    return categories;
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsCreateModalOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      console.log('Delete role:', roleId);
    }
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
            <p className="text-muted-foreground">
              Manage user roles and access permissions
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Role
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Roles List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => (
            <Card key={role.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                      <Shield className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      {role.isSystem && (
                        <Badge variant="outline" className="text-xs">
                          System Role
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditRole(role)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!role.isSystem && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {role.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {role.userCount} users
                    </span>
                    <span className="flex items-center gap-1">
                      <Lock className="h-4 w-4" />
                      {role.permissions.length} permissions
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Key Permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map(permissionId => {
                      const permission = permissions.find(p => p.id === permissionId);
                      return (
                        <Badge key={permissionId} variant="secondary" className="text-xs">
                          {permission?.name || permissionId}
                        </Badge>
                      );
                    })}
                    {role.permissions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.permissions.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredRoles.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-semibold">No roles found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search criteria' : 'Create your first custom role'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Role
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>
                  {selectedRole ? 'Edit Role' : 'Create New Role'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Role Details */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role Name</label>
                    <Input
                      placeholder="Role name"
                      defaultValue={selectedRole?.name}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      placeholder="Role description"
                      defaultValue={selectedRole?.description}
                    />
                  </div>
                </div>
                
                {/* Permissions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Permissions</h3>
                  <div className="space-y-4">
                    {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="font-medium text-sm">{category}</h4>
                        <div className="grid gap-2 md:grid-cols-2">
                          {categoryPermissions.map(permission => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={permission.id}
                                defaultChecked={selectedRole?.permissions.includes(permission.id)}
                              />
                              <label
                                htmlFor={permission.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                <div className="font-medium">{permission.name}</div>
                                <div className="text-xs text-muted-foreground">{permission.description}</div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setSelectedRole(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button className="flex-1">
                    {selectedRole ? 'Update Role' : 'Create Role'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Permissions Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Permissions Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-sm">{category}</h4>
                  <div className="space-y-1">
                    {categoryPermissions.map(permission => (
                      <div key={permission.id} className="text-xs text-muted-foreground">
                        • {permission.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
