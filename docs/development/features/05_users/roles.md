# 🛡️ Roles & Permissions System

> **Advanced Role-Based Access Control JA-CMS**  
> Granular permissions system dengan hierarchical roles dan flexible access control

---

## 📋 **Deskripsi**

Roles & Permissions System menyediakan comprehensive Role-Based Access Control (RBAC) untuk JA-CMS. Sistem ini mendukung hierarchical roles, granular permissions, dynamic permission assignment, dan flexible access control yang dapat disesuaikan dengan kebutuhan organisasi.

---

## ⭐ **Core Features**

### **1. 🏗️ Role Architecture**

#### **Role Structure:**
```typescript
interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  level: number; // hierarchy level (0 = highest)
  color: string; // UI color representation
  icon: string;
  isSystem: boolean; // system roles cannot be deleted
  isDefault: boolean; // assigned to new users
  permissions: Permission[];
  inheritFrom?: string; // parent role ID for inheritance
  capabilities: RoleCapability[];
  restrictions: RoleRestriction[];
  metadata: {
    userCount: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    lastAssigned?: Date;
  };
}

interface Permission {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: PermissionCategory;
  resource: string; // what resource this permission applies to
  action: PermissionAction; // what action is allowed
  scope: PermissionScope; // scope of the permission
  conditions: PermissionCondition[]; // conditional permissions
  isSystem: boolean;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
}

interface RoleCapability {
  capability: string;
  enabled: boolean;
  config?: Record<string, any>;
}

interface RoleRestriction {
  type: RestrictionType;
  value: any;
  description: string;
}

interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  description: string;
}

type PermissionCategory = 'content' | 'users' | 'system' | 'media' | 'themes' | 'plugins' | 'analytics' | 'security';
type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'publish' | 'moderate' | 'manage' | 'configure';
type PermissionScope = 'global' | 'own' | 'group' | 'department' | 'custom';
type RestrictionType = 'time_based' | 'ip_based' | 'location_based' | 'device_based' | 'quota_based';
```

#### **Role Management Service:**
```typescript
export class RoleManagementService {
  private roleRepository: RoleRepository;
  private permissionRepository: PermissionRepository;
  private userRoleRepository: UserRoleRepository;
  private auditService: AuditService;
  private cacheService: CacheService;

  async createRole(roleData: CreateRoleData, createdBy: string): Promise<Role> {
    // Validate role data
    const validation = await this.validateRoleData(roleData);
    if (!validation.valid) {
      throw new Error(`Role validation failed: ${validation.errors.join(', ')}`);
    }

    // Check for duplicate slug
    const existingRole = await this.roleRepository.findBySlug(roleData.slug);
    if (existingRole) {
      throw new Error('Role with this slug already exists');
    }

    // Validate permission assignments
    if (roleData.permissions) {
      await this.validatePermissions(roleData.permissions);
    }

    // Create role
    const role: Role = {
      id: this.generateRoleId(),
      name: roleData.name,
      slug: roleData.slug,
      description: roleData.description,
      level: roleData.level || this.calculateRoleLevel(roleData.inheritFrom),
      color: roleData.color || this.generateRoleColor(),
      icon: roleData.icon || 'shield',
      isSystem: false,
      isDefault: roleData.isDefault || false,
      permissions: await this.resolvePermissions(roleData.permissions || []),
      inheritFrom: roleData.inheritFrom,
      capabilities: roleData.capabilities || [],
      restrictions: roleData.restrictions || [],
      metadata: {
        userCount: 0,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    // Handle inheritance
    if (role.inheritFrom) {
      role.permissions = await this.mergeInheritedPermissions(role);
    }

    // Ensure only one default role per level
    if (role.isDefault) {
      await this.clearOtherDefaultRoles(role.level);
    }

    // Save role
    const savedRole = await this.roleRepository.create(role);

    // Clear permission cache
    await this.cacheService.clearPattern('permissions:*');

    // Log audit event
    await this.auditService.log({
      action: 'role_created',
      resourceType: 'role',
      resourceId: savedRole.id,
      performedBy: createdBy,
      details: {
        name: savedRole.name,
        permissions: savedRole.permissions.length
      }
    });

    return savedRole;
  }

  async updateRole(roleId: string, updates: UpdateRoleData, updatedBy: string): Promise<Role> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Prevent system role modification
    if (role.isSystem && !this.canModifySystemRole(updatedBy)) {
      throw new Error('Cannot modify system role');
    }

    // Validate updates
    const validation = await this.validateRoleUpdate(updates, role);
    if (!validation.valid) {
      throw new Error(`Role update validation failed: ${validation.errors.join(', ')}`);
    }

    // Track changes for audit
    const changes = this.trackRoleChanges(role, updates);

    // Apply updates
    const updatedRole = {
      ...role,
      ...updates,
      metadata: {
        ...role.metadata,
        updatedAt: new Date()
      }
    };

    // Handle permission changes
    if (updates.permissions) {
      updatedRole.permissions = await this.resolvePermissions(updates.permissions);
      
      // Re-merge inherited permissions if needed
      if (updatedRole.inheritFrom) {
        updatedRole.permissions = await this.mergeInheritedPermissions(updatedRole);
      }
    }

    // Handle inheritance changes
    if (updates.inheritFrom !== undefined) {
      if (updates.inheritFrom) {
        // Adding inheritance
        updatedRole.permissions = await this.mergeInheritedPermissions(updatedRole);
      } else {
        // Removing inheritance - keep only direct permissions
        updatedRole.permissions = updatedRole.permissions.filter(p => !p.inherited);
      }
    }

    // Save updated role
    const savedRole = await this.roleRepository.update(roleId, updatedRole);

    // Update affected users' permissions if permissions changed
    if (changes.permissionsChanged) {
      await this.refreshUserPermissions(roleId);
    }

    // Clear caches
    await this.cacheService.clearPattern('permissions:*');
    await this.cacheService.clearPattern(`role:${roleId}:*`);

    // Log audit event
    await this.auditService.log({
      action: 'role_updated',
      resourceType: 'role',
      resourceId: roleId,
      performedBy: updatedBy,
      details: changes
    });

    return savedRole;
  }

  async deleteRole(roleId: string, deletedBy: string, options: DeleteRoleOptions = {}): Promise<void> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Prevent system role deletion
    if (role.isSystem) {
      throw new Error('Cannot delete system role');
    }

    // Check if role is in use
    const userCount = await this.getUserCountForRole(roleId);
    if (userCount > 0 && !options.reassignUsers) {
      throw new Error(`Cannot delete role: ${userCount} users are assigned to this role`);
    }

    // Handle users assigned to this role
    if (userCount > 0) {
      if (options.reassignTo) {
        await this.reassignUsersToRole(roleId, options.reassignTo);
      } else if (options.removeFromUsers) {
        await this.removeRoleFromUsers(roleId);
      } else {
        throw new Error('Must specify how to handle users assigned to this role');
      }
    }

    // Handle child roles that inherit from this role
    const childRoles = await this.getChildRoles(roleId);
    if (childRoles.length > 0) {
      for (const childRole of childRoles) {
        await this.updateRole(childRole.id, { inheritFrom: null }, deletedBy);
      }
    }

    // Delete role
    await this.roleRepository.delete(roleId);

    // Clear caches
    await this.cacheService.clearPattern('permissions:*');
    await this.cacheService.clearPattern(`role:${roleId}:*`);

    // Log audit event
    await this.auditService.log({
      action: 'role_deleted',
      resourceType: 'role',
      resourceId: roleId,
      performedBy: deletedBy,
      details: {
        name: role.name,
        userCount,
        reassignedTo: options.reassignTo
      }
    });
  }

  async assignRoleToUser(userId: string, roleId: string, assignedBy: string, options: RoleAssignmentOptions = {}): Promise<void> {
    const [user, role] = await Promise.all([
      this.getUserById(userId),
      this.roleRepository.findById(roleId)
    ]);

    if (!user || !role) {
      throw new Error('User or role not found');
    }

    // Check if user already has this role
    const hasRole = await this.userHasRole(userId, roleId);
    if (hasRole) {
      throw new Error('User already has this role');
    }

    // Validate role assignment
    const canAssign = await this.canAssignRole(assignedBy, roleId, userId);
    if (!canAssign.allowed) {
      throw new Error(`Cannot assign role: ${canAssign.reason}`);
    }

    // Create role assignment
    const assignment = await this.userRoleRepository.create({
      userId,
      roleId,
      assignedBy,
      assignedAt: new Date(),
      expiresAt: options.expiresAt,
      conditions: options.conditions || []
    });

    // Update role user count
    await this.incrementRoleUserCount(roleId);

    // Refresh user permissions cache
    await this.refreshUserPermissionsCache(userId);

    // Send notification if requested
    if (options.notifyUser) {
      await this.notifyRoleAssignment(userId, roleId, assignedBy);
    }

    // Log audit event
    await this.auditService.log({
      action: 'role_assigned',
      resourceType: 'user_role',
      resourceId: assignment.id,
      userId,
      performedBy: assignedBy,
      details: {
        roleName: role.name,
        expiresAt: options.expiresAt
      }
    });
  }

  async removeRoleFromUser(userId: string, roleId: string, removedBy: string): Promise<void> {
    const assignment = await this.userRoleRepository.findByUserAndRole(userId, roleId);
    if (!assignment) {
      throw new Error('User does not have this role');
    }

    // Check permissions
    const canRemove = await this.canRemoveRole(removedBy, roleId, userId);
    if (!canRemove.allowed) {
      throw new Error(`Cannot remove role: ${canRemove.reason}`);
    }

    // Remove assignment
    await this.userRoleRepository.delete(assignment.id);

    // Update role user count
    await this.decrementRoleUserCount(roleId);

    // Refresh user permissions cache
    await this.refreshUserPermissionsCache(userId);

    // Log audit event
    await this.auditService.log({
      action: 'role_removed',
      resourceType: 'user_role',
      resourceId: assignment.id,
      userId,
      performedBy: removedBy,
      details: {
        roleName: assignment.role?.name
      }
    });
  }

  async getUserPermissions(userId: string, context?: PermissionContext): Promise<UserPermissions> {
    // Check cache first
    const cacheKey = `permissions:user:${userId}:${context ? this.hashContext(context) : 'default'}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Get user roles
    const userRoles = await this.getUserRoles(userId);
    
    // Collect all permissions from roles
    const allPermissions = new Map<string, Permission>();
    
    for (const userRole of userRoles) {
      const role = userRole.role;
      
      // Check if role assignment is still valid
      if (!this.isRoleAssignmentValid(userRole)) {
        continue;
      }
      
      for (const permission of role.permissions) {
        // Check permission conditions
        if (await this.evaluatePermissionConditions(permission, userId, context)) {
          allPermissions.set(permission.id, permission);
        }
      }
    }

    // Get direct user permissions (if any)
    const directPermissions = await this.getDirectUserPermissions(userId);
    for (const permission of directPermissions) {
      if (await this.evaluatePermissionConditions(permission, userId, context)) {
        allPermissions.set(permission.id, permission);
      }
    }

    const userPermissions: UserPermissions = {
      userId,
      permissions: Array.from(allPermissions.values()),
      roles: userRoles.map(ur => ur.role),
      context,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000) // 1 hour cache
    };

    // Cache the result
    await this.cacheService.set(cacheKey, userPermissions, 3600); // 1 hour

    return userPermissions;
  }

  async checkPermission(userId: string, permission: string, resource?: string, context?: PermissionContext): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, context);
    
    // Check direct permission match
    const hasDirectPermission = userPermissions.permissions.some(p => 
      p.slug === permission && (!resource || p.resource === resource || p.resource === '*')
    );
    
    if (hasDirectPermission) {
      return true;
    }

    // Check wildcard permissions
    const hasWildcardPermission = userPermissions.permissions.some(p => 
      p.slug.endsWith('.*') && permission.startsWith(p.slug.replace('.*', ''))
    );
    
    return hasWildcardPermission;
  }

  private async mergeInheritedPermissions(role: Role): Promise<Permission[]> {
    if (!role.inheritFrom) {
      return role.permissions;
    }

    const parentRole = await this.roleRepository.findById(role.inheritFrom);
    if (!parentRole) {
      return role.permissions;
    }

    // Get parent permissions (recursively if parent also inherits)
    const parentPermissions = await this.mergeInheritedPermissions(parentRole);
    
    // Merge permissions (direct permissions override inherited ones)
    const permissionMap = new Map<string, Permission>();
    
    // Add inherited permissions first
    for (const permission of parentPermissions) {
      permissionMap.set(permission.id, { ...permission, inherited: true });
    }
    
    // Add/override with direct permissions
    for (const permission of role.permissions) {
      permissionMap.set(permission.id, { ...permission, inherited: false });
    }
    
    return Array.from(permissionMap.values());
  }

  private async evaluatePermissionConditions(permission: Permission, userId: string, context?: PermissionContext): Promise<boolean> {
    if (!permission.conditions || permission.conditions.length === 0) {
      return true;
    }

    for (const condition of permission.conditions) {
      const result = await this.evaluateCondition(condition, userId, context);
      if (!result) {
        return false; // All conditions must be true
      }
    }

    return true;
  }

  private async evaluateCondition(condition: PermissionCondition, userId: string, context?: PermissionContext): Promise<boolean> {
    let actualValue: any;

    // Get the actual value based on the field
    switch (condition.field) {
      case 'user.id':
        actualValue = userId;
        break;
      case 'user.department':
        const user = await this.getUserById(userId);
        actualValue = user?.profile?.department;
        break;
      case 'context.resource_id':
        actualValue = context?.resourceId;
        break;
      case 'context.resource_owner':
        actualValue = context?.resourceOwner;
        break;
      case 'time.hour':
        actualValue = new Date().getHours();
        break;
      case 'time.day_of_week':
        actualValue = new Date().getDay();
        break;
      default:
        return false; // Unknown field
    }

    // Evaluate based on operator
    switch (condition.operator) {
      case 'equals':
        return actualValue === condition.value;
      case 'not_equals':
        return actualValue !== condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(actualValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(actualValue);
      case 'contains':
        return typeof actualValue === 'string' && actualValue.includes(condition.value);
      case 'greater_than':
        return actualValue > condition.value;
      case 'less_than':
        return actualValue < condition.value;
      default:
        return false;
    }
  }
}

interface CreateRoleData {
  name: string;
  slug: string;
  description: string;
  level?: number;
  color?: string;
  icon?: string;
  isDefault?: boolean;
  permissions?: string[];
  inheritFrom?: string;
  capabilities?: RoleCapability[];
  restrictions?: RoleRestriction[];
}

interface UpdateRoleData {
  name?: string;
  description?: string;
  level?: number;
  color?: string;
  icon?: string;
  isDefault?: boolean;
  permissions?: string[];
  inheritFrom?: string | null;
  capabilities?: RoleCapability[];
  restrictions?: RoleRestriction[];
}

interface DeleteRoleOptions {
  reassignTo?: string;
  reassignUsers?: boolean;
  removeFromUsers?: boolean;
}

interface RoleAssignmentOptions {
  expiresAt?: Date;
  conditions?: PermissionCondition[];
  notifyUser?: boolean;
}

interface UserPermissions {
  userId: string;
  permissions: Permission[];
  roles: Role[];
  context?: PermissionContext;
  generatedAt: Date;
  expiresAt: Date;
}

interface PermissionContext {
  resourceType?: string;
  resourceId?: string;
  resourceOwner?: string;
  department?: string;
  location?: string;
  timeConstraints?: {
    startTime?: string;
    endTime?: string;
    daysOfWeek?: number[];
  };
}
```

### **2. 📋 Permission Categories & Actions**

#### **Built-in Permission System:**
```typescript
export class PermissionSystem {
  private static readonly SYSTEM_PERMISSIONS: Permission[] = [
    // Content Permissions
    {
      id: 'content.posts.create',
      name: 'Create Posts',
      slug: 'content.posts.create',
      description: 'Create new blog posts',
      category: 'content',
      resource: 'posts',
      action: 'create',
      scope: 'global'
    },
    {
      id: 'content.posts.edit_own',
      name: 'Edit Own Posts',
      slug: 'content.posts.edit_own',
      description: 'Edit own blog posts',
      category: 'content',
      resource: 'posts',
      action: 'update',
      scope: 'own'
    },
    {
      id: 'content.posts.edit_all',
      name: 'Edit All Posts',
      slug: 'content.posts.edit_all',
      description: 'Edit any blog posts',
      category: 'content',
      resource: 'posts',
      action: 'update',
      scope: 'global'
    },
    {
      id: 'content.posts.delete_own',
      name: 'Delete Own Posts',
      slug: 'content.posts.delete_own',
      description: 'Delete own blog posts',
      category: 'content',
      resource: 'posts',
      action: 'delete',
      scope: 'own'
    },
    {
      id: 'content.posts.delete_all',
      name: 'Delete All Posts',
      slug: 'content.posts.delete_all',
      description: 'Delete any blog posts',
      category: 'content',
      resource: 'posts',
      action: 'delete',
      scope: 'global'
    },
    {
      id: 'content.posts.publish',
      name: 'Publish Posts',
      slug: 'content.posts.publish',
      description: 'Publish blog posts',
      category: 'content',
      resource: 'posts',
      action: 'publish',
      scope: 'global'
    },

    // User Management Permissions
    {
      id: 'users.create',
      name: 'Create Users',
      slug: 'users.create',
      description: 'Create new user accounts',
      category: 'users',
      resource: 'users',
      action: 'create',
      scope: 'global'
    },
    {
      id: 'users.edit',
      name: 'Edit Users',
      slug: 'users.edit',
      description: 'Edit user accounts',
      category: 'users',
      resource: 'users',
      action: 'update',
      scope: 'global'
    },
    {
      id: 'users.delete',
      name: 'Delete Users',
      slug: 'users.delete',
      description: 'Delete user accounts',
      category: 'users',
      resource: 'users',
      action: 'delete',
      scope: 'global'
    },
    {
      id: 'users.manage_roles',
      name: 'Manage User Roles',
      slug: 'users.manage_roles',
      description: 'Assign and remove user roles',
      category: 'users',
      resource: 'user_roles',
      action: 'manage',
      scope: 'global'
    },

    // System Permissions
    {
      id: 'system.settings',
      name: 'System Settings',
      slug: 'system.settings',
      description: 'Access system settings',
      category: 'system',
      resource: 'settings',
      action: 'manage',
      scope: 'global'
    },
    {
      id: 'system.themes',
      name: 'Theme Management',
      slug: 'system.themes',
      description: 'Install and manage themes',
      category: 'system',
      resource: 'themes',
      action: 'manage',
      scope: 'global'
    },
    {
      id: 'system.plugins',
      name: 'Plugin Management',
      slug: 'system.plugins',
      description: 'Install and manage plugins',
      category: 'system',
      resource: 'plugins',
      action: 'manage',
      scope: 'global'
    },

    // Media Permissions
    {
      id: 'media.upload',
      name: 'Upload Media',
      slug: 'media.upload',
      description: 'Upload media files',
      category: 'media',
      resource: 'media',
      action: 'create',
      scope: 'global'
    },
    {
      id: 'media.edit_own',
      name: 'Edit Own Media',
      slug: 'media.edit_own',
      description: 'Edit own media files',
      category: 'media',
      resource: 'media',
      action: 'update',
      scope: 'own'
    },
    {
      id: 'media.edit_all',
      name: 'Edit All Media',
      slug: 'media.edit_all',
      description: 'Edit any media files',
      category: 'media',
      resource: 'media',
      action: 'update',
      scope: 'global'
    },
    {
      id: 'media.delete_own',
      name: 'Delete Own Media',
      slug: 'media.delete_own',
      description: 'Delete own media files',
      category: 'media',
      resource: 'media',
      action: 'delete',
      scope: 'own'
    },
    {
      id: 'media.delete_all',
      name: 'Delete All Media',
      slug: 'media.delete_all',
      description: 'Delete any media files',
      category: 'media',
      resource: 'media',
      action: 'delete',
      scope: 'global'
    },

    // Analytics Permissions
    {
      id: 'analytics.view',
      name: 'View Analytics',
      slug: 'analytics.view',
      description: 'View analytics data',
      category: 'analytics',
      resource: 'analytics',
      action: 'read',
      scope: 'global'
    },
    {
      id: 'analytics.export',
      name: 'Export Analytics',
      slug: 'analytics.export',
      description: 'Export analytics data',
      category: 'analytics',
      resource: 'analytics',
      action: 'read',
      scope: 'global'
    }
  ];

  static getSystemPermissions(): Permission[] {
    return this.SYSTEM_PERMISSIONS.map(p => ({
      ...p,
      isSystem: true,
      conditions: [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }));
  }

  static getPermissionsByCategory(category: PermissionCategory): Permission[] {
    return this.SYSTEM_PERMISSIONS.filter(p => p.category === category);
  }

  static getPermissionsByResource(resource: string): Permission[] {
    return this.SYSTEM_PERMISSIONS.filter(p => p.resource === resource);
  }
}
```

### **3. 🏗️ Default Role Hierarchy**

#### **System Roles:**
```typescript
export class SystemRoles {
  private static readonly DEFAULT_ROLES: Omit<Role, 'id' | 'metadata'>[] = [
    {
      name: 'Super Administrator',
      slug: 'super_admin',
      description: 'Full system access with all permissions',
      level: 0,
      color: '#dc2626',
      icon: 'crown',
      isSystem: true,
      isDefault: false,
      permissions: [], // Will be populated with ALL permissions
      capabilities: [
        { capability: 'bypass_restrictions', enabled: true },
        { capability: 'impersonate_users', enabled: true },
        { capability: 'system_maintenance', enabled: true }
      ],
      restrictions: []
    },
    {
      name: 'Administrator',
      slug: 'administrator',
      description: 'Site administration with most permissions',
      level: 1,
      color: '#dc2626',
      icon: 'shield-check',
      isSystem: true,
      isDefault: false,
      permissions: [
        'users.create', 'users.edit', 'users.delete', 'users.manage_roles',
        'content.posts.create', 'content.posts.edit_all', 'content.posts.delete_all', 'content.posts.publish',
        'content.pages.create', 'content.pages.edit_all', 'content.pages.delete_all', 'content.pages.publish',
        'media.upload', 'media.edit_all', 'media.delete_all',
        'system.settings', 'system.themes', 'analytics.view', 'analytics.export'
      ],
      capabilities: [
        { capability: 'bulk_operations', enabled: true },
        { capability: 'user_impersonation', enabled: true }
      ],
      restrictions: []
    },
    {
      name: 'Editor',
      slug: 'editor',
      description: 'Content management and user oversight',
      level: 2,
      color: '#2563eb',
      icon: 'pencil',
      isSystem: true,
      isDefault: false,
      permissions: [
        'content.posts.create', 'content.posts.edit_all', 'content.posts.delete_all', 'content.posts.publish',
        'content.pages.create', 'content.pages.edit_all', 'content.pages.publish',
        'content.comments.moderate',
        'media.upload', 'media.edit_all',
        'users.edit', // Limited user editing
        'analytics.view'
      ],
      capabilities: [
        { capability: 'content_scheduling', enabled: true },
        { capability: 'comment_moderation', enabled: true }
      ],
      restrictions: [
        {
          type: 'quota_based',
          value: { maxUsers: 50 },
          description: 'Can only manage up to 50 users'
        }
      ]
    },
    {
      name: 'Author',
      slug: 'author',
      description: 'Content creation and own content management',
      level: 3,
      color: '#059669',
      icon: 'user-edit',
      isSystem: true,
      isDefault: false,
      permissions: [
        'content.posts.create', 'content.posts.edit_own', 'content.posts.delete_own',
        'content.pages.create', 'content.pages.edit_own',
        'media.upload', 'media.edit_own', 'media.delete_own'
      ],
      capabilities: [
        { capability: 'draft_posts', enabled: true },
        { capability: 'schedule_posts', enabled: true }
      ],
      restrictions: [
        {
          type: 'quota_based',
          value: { maxPosts: 100, maxMedia: 500 },
          description: 'Limited to 100 posts and 500MB media'
        }
      ]
    },
    {
      name: 'Contributor',
      slug: 'contributor',
      description: 'Content submission for review',
      level: 4,
      color: '#7c3aed',
      icon: 'user-plus',
      isSystem: true,
      isDefault: false,
      permissions: [
        'content.posts.create', 'content.posts.edit_own',
        'media.upload', 'media.edit_own'
      ],
      capabilities: [
        { capability: 'submit_for_review', enabled: true }
      ],
      restrictions: [
        {
          type: 'quota_based',
          value: { maxPosts: 20, maxMedia: 100 },
          description: 'Limited to 20 posts and 100MB media'
        }
      ]
    },
    {
      name: 'Subscriber',
      slug: 'subscriber',
      description: 'Read-only access to content',
      level: 5,
      color: '#6b7280',
      icon: 'user',
      isSystem: true,
      isDefault: true,
      permissions: [
        'content.posts.read', 'content.pages.read', 'content.comments.create'
      ],
      capabilities: [
        { capability: 'comment_posts', enabled: true },
        { capability: 'profile_edit', enabled: true }
      ],
      restrictions: [
        {
          type: 'quota_based',
          value: { maxComments: 10 },
          description: 'Limited to 10 comments per day'
        }
      ]
    }
  ];

  static getDefaultRoles(): Role[] {
    return this.DEFAULT_ROLES.map(roleData => ({
      ...roleData,
      id: this.generateSystemRoleId(roleData.slug),
      permissions: this.resolveSystemPermissions(roleData.permissions),
      metadata: {
        userCount: 0,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }));
  }

  private static resolveSystemPermissions(permissionSlugs: string[]): Permission[] {
    const systemPermissions = PermissionSystem.getSystemPermissions();
    return permissionSlugs
      .map(slug => systemPermissions.find(p => p.slug === slug))
      .filter(Boolean) as Permission[];
  }

  private static generateSystemRoleId(slug: string): string {
    return `role_${slug}`;
  }
}
```

### **4. 🔐 Permission Middleware & Guards**

#### **Permission Middleware:**
```typescript
export class PermissionMiddleware {
  constructor(
    private roleService: RoleManagementService,
    private authService: AuthenticationService
  ) {}

  /**
   * Express middleware for checking permissions
   */
  requirePermission(permission: string, resource?: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Get current user
        const user = await this.authService.getCurrentUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        // Build permission context from request
        const context: PermissionContext = {
          resourceType: resource,
          resourceId: req.params.id,
          resourceOwner: req.body?.ownerId || req.query?.ownerId as string
        };

        // Check permission
        const hasPermission = await this.roleService.checkPermission(
          user.id,
          permission,
          resource,
          context
        );

        if (!hasPermission) {
          return res.status(403).json({ 
            error: 'Insufficient permissions',
            required: permission,
            resource
          });
        }

        next();
      } catch (error) {
        console.error('Permission check error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }

  /**
   * Multiple permissions (any one required)
   */
  requireAnyPermission(permissions: string[], resource?: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = await this.authService.getCurrentUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const context: PermissionContext = {
          resourceType: resource,
          resourceId: req.params.id,
          resourceOwner: req.body?.ownerId || req.query?.ownerId as string
        };

        // Check if user has any of the required permissions
        for (const permission of permissions) {
          const hasPermission = await this.roleService.checkPermission(
            user.id,
            permission,
            resource,
            context
          );
          
          if (hasPermission) {
            return next();
          }
        }

        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permissions,
          resource
        });
      } catch (error) {
        console.error('Permission check error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }

  /**
   * Multiple permissions (all required)
   */
  requireAllPermissions(permissions: string[], resource?: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = await this.authService.getCurrentUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const context: PermissionContext = {
          resourceType: resource,
          resourceId: req.params.id,
          resourceOwner: req.body?.ownerId || req.query?.ownerId as string
        };

        // Check if user has all required permissions
        for (const permission of permissions) {
          const hasPermission = await this.roleService.checkPermission(
            user.id,
            permission,
            resource,
            context
          );
          
          if (!hasPermission) {
            return res.status(403).json({ 
              error: 'Insufficient permissions',
              required: permissions,
              missing: permission,
              resource
            });
          }
        }

        next();
      } catch (error) {
        console.error('Permission check error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }

  /**
   * Role-based access control
   */
  requireRole(roles: string | string[]) {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = await this.authService.getCurrentUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const userRoles = await this.roleService.getUserRoles(user.id);
        const userRoleSlugs = userRoles.map(ur => ur.role.slug);
        
        const hasRequiredRole = roleArray.some(role => userRoleSlugs.includes(role));
        
        if (!hasRequiredRole) {
          return res.status(403).json({ 
            error: 'Insufficient role',
            required: roleArray,
            current: userRoleSlugs
          });
        }

        next();
      } catch (error) {
        console.error('Role check error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }

  /**
   * Resource ownership check
   */
  requireOwnership(resourceType: string, ownerField: string = 'createdBy') {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = await this.authService.getCurrentUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        // Get resource
        const resourceId = req.params.id;
        const resource = await this.getResource(resourceType, resourceId);
        
        if (!resource) {
          return res.status(404).json({ error: 'Resource not found' });
        }

        // Check ownership
        const isOwner = resource[ownerField] === user.id;
        
        if (!isOwner) {
          return res.status(403).json({ 
            error: 'Access denied: not resource owner',
            resource: resourceType,
            resourceId
          });
        }

        // Add resource to request for use in handler
        req.resource = resource;
        next();
      } catch (error) {
        console.error('Ownership check error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }

  private async getResource(resourceType: string, resourceId: string): Promise<any> {
    // Implementation would depend on your data layer
    // This is a simplified example
    switch (resourceType) {
      case 'posts':
        return this.getPost(resourceId);
      case 'pages':
        return this.getPage(resourceId);
      case 'media':
        return this.getMedia(resourceId);
      default:
        throw new Error(`Unknown resource type: ${resourceType}`);
    }
  }
}

// Usage examples:
/*
// Require specific permission
router.post('/posts', 
  permissionMiddleware.requirePermission('content.posts.create', 'posts'),
  createPost
);

// Require any of multiple permissions
router.put('/posts/:id', 
  permissionMiddleware.requireAnyPermission([
    'content.posts.edit_all', 
    'content.posts.edit_own'
  ], 'posts'),
  updatePost
);

// Require specific role
router.get('/admin/users', 
  permissionMiddleware.requireRole(['administrator', 'super_admin']),
  listUsers
);

// Require ownership
router.delete('/posts/:id', 
  permissionMiddleware.requireOwnership('posts', 'authorId'),
  deletePost
);
*/
```

---

## 🎨 **Roles & Permissions Interface**

### **Role Management Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 🛡️ Roles & Permissions                 [Create Role] [Import] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Role Hierarchy ───────────────────────────────────┐   │
│ │ 👑 Super Administrator (1 user)                    │   │
│ │ ├─ 🛡️ Administrator (3 users)                       │   │
│ │ │  ├─ 📝 Editor (12 users)                          │   │
│ │ │  │  ├─ ✍️ Author (45 users)                       │   │
│ │ │  │  └─ 👥 Contributor (23 users)                 │   │
│ │ │  └─ 🎨 Designer (5 users)                         │   │
│ │ └─ 👤 Subscriber (1,156 users) [Default]           │   │
│ │                                                   │   │
│ │ Custom Roles:                                      │   │
│ │ ├─ 📊 Marketing Manager (8 users)                  │   │
│ │ ├─ 🔧 Technical Lead (3 users)                     │   │
│ │ └─ 📞 Support Agent (12 users)                     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Selected Role: Editor ────────────────────────────┐   │
│ │ 📝 Editor                                          │   │
│ │ Level 2 • 12 users • Inherits from: Administrator │   │
│ │                                                   │   │
│ │ Description: Content management and user oversight │   │
│ │                                                   │   │
│ │ Capabilities:                                      │   │
│ │ ✅ Content scheduling  ✅ Comment moderation       │   │
│ │ ❌ User impersonation  ❌ System settings          │   │
│ │                                                   │   │
│ │ Restrictions:                                      │   │
│ │ 👥 Max users to manage: 50                        │   │
│ │ 📅 Time-based: 9 AM - 6 PM weekdays              │   │
│ │                                                   │   │
│ │ [Edit Role] [Clone Role] [View Users] [Delete]    │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Permission Matrix ────────────────────────────────┐   │
│ │           │Super│Admin│Editor│Author│Contrib│Subscr│   │
│ │ Content   │     │     │      │      │       │      │   │
│ │ Create    │  ✅  │  ✅  │  ✅   │  ✅   │   ✅   │  ❌   │   │
│ │ Edit All  │  ✅  │  ✅  │  ✅   │  ❌   │   ❌   │  ❌   │   │
│ │ Edit Own  │  ✅  │  ✅  │  ✅   │  ✅   │   ✅   │  ❌   │   │
│ │ Delete    │  ✅  │  ✅  │  ✅   │  ❌   │   ❌   │  ❌   │   │
│ │ Publish   │  ✅  │  ✅  │  ✅   │  ❌   │   ❌   │  ❌   │   │
│ │           │     │     │      │      │       │      │   │
│ │ Users     │     │     │      │      │       │      │   │
│ │ Create    │  ✅  │  ✅  │  ❌   │  ❌   │   ❌   │  ❌   │   │
│ │ Edit      │  ✅  │  ✅  │  ✅   │  ❌   │   ❌   │  ❌   │   │
│ │ Delete    │  ✅  │  ✅  │  ❌   │  ❌   │   ❌   │  ❌   │   │
│ │ Roles     │  ✅  │  ✅  │  ❌   │  ❌   │   ❌   │  ❌   │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Role Editor Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ ✏️ Edit Role: Marketing Manager          [Save] [Cancel] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Basic Information ────────────────────────────────┐   │
│ │ Role Name: [Marketing Manager_________]            │   │
│ │ Slug: [marketing_manager______________] (Auto)     │   │
│ │ Description:                                       │   │
│ │ ┌─────────────────────────────────────────────────┐ │   │
│ │ │ Manages marketing campaigns, content strategy,  │ │   │
│ │ │ and marketing team coordination.                │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ │                                                   │   │
│ │ Hierarchy Level: [3 ▼] Color: [🟡] Icon: [📊]     │   │
│ │ ☐ System Role    ☐ Default Role                   │   │
│ │                                                   │   │
│ │ Inherit From: [Editor ▼] (Optional)               │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Permissions ──────────────────────────────────────┐   │
│ │ 📝 Content Permissions:                            │   │
│ │ ☑ Create posts           ☑ Edit all posts         │   │
│ │ ☑ Delete own posts       ☑ Publish posts          │   │
│ │ ☑ Create pages           ☑ Edit all pages         │   │
│ │ ☑ Moderate comments      ☐ Delete all comments    │   │
│ │                                                   │   │
│ │ 👥 User Permissions:                               │   │
│ │ ☐ Create users           ☑ Edit users (limited)   │   │
│ │ ☐ Delete users           ☐ Manage roles           │   │
│ │ ☑ View user profiles     ☑ Export user data      │   │
│ │                                                   │   │
│ │ 📊 Analytics Permissions:                          │   │
│ │ ☑ View analytics         ☑ Export reports         │   │
│ │ ☑ Create custom reports  ☐ Manage analytics       │   │
│ │                                                   │   │
│ │ 🎨 Marketing Permissions:                          │   │
│ │ ☑ Manage campaigns       ☑ Email marketing        │   │
│ │ ☑ Social media          ☑ SEO tools              │   │
│ │ ☑ A/B testing           ☑ Lead management         │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Capabilities & Restrictions ──────────────────────┐   │
│ │ Special Capabilities:                              │   │
│ │ ☑ Bulk operations        ☑ Content scheduling     │   │
│ │ ☑ Campaign automation    ☐ User impersonation     │   │
│ │ ☑ API access            ☑ Export data            │   │
│ │                                                   │   │
│ │ Restrictions:                                      │   │
│ │ Time-based: [9 AM] to [6 PM] Weekdays: [M-F ✓]   │   │
│ │ Max users to manage: [100___]                     │   │
│ │ Max campaigns: [50___]                            │   │
│ │ IP restrictions: [Add IP Range]                   │   │
│ │                                                   │   │
│ │ Conditional Permissions:                           │   │
│ │ • Edit posts: Only if author is in Marketing team │   │
│ │ • Delete content: Only own content or team content│   │
│ │ • Access analytics: Only marketing-related data   │   │
│ │                                                   │   │
│ │ [Add Condition] [Import from Template]            │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Role management
GET    /api/roles                        // List all roles
POST   /api/roles                        // Create new role
GET    /api/roles/{id}                   // Get role details
PUT    /api/roles/{id}                   // Update role
DELETE /api/roles/{id}                   // Delete role

// Permission management
GET    /api/permissions                  // List all permissions
GET    /api/permissions/categories       // Get permission categories
POST   /api/permissions                  // Create custom permission
PUT    /api/permissions/{id}             // Update permission
DELETE /api/permissions/{id}             // Delete custom permission

// User role assignment
GET    /api/users/{id}/roles             // Get user roles
POST   /api/users/{id}/roles             // Assign role to user
DELETE /api/users/{id}/roles/{roleId}    // Remove role from user
GET    /api/users/{id}/permissions       // Get user permissions
POST   /api/users/{id}/permissions/check // Check specific permission

// Role analytics
GET    /api/roles/{id}/users             // Get users with role
GET    /api/roles/{id}/analytics         // Get role usage analytics
GET    /api/roles/hierarchy              // Get role hierarchy
POST   /api/roles/{id}/clone             // Clone role
```

### **Database Schema:**
```sql
-- Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 999,
  color VARCHAR(7) DEFAULT '#6b7280',
  icon VARCHAR(50) DEFAULT 'shield',
  is_system BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  inherit_from UUID REFERENCES roles(id) ON DELETE SET NULL,
  capabilities JSONB DEFAULT '[]',
  restrictions JSONB DEFAULT '[]',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  scope VARCHAR(50) NOT NULL DEFAULT 'global',
  conditions JSONB DEFAULT '[]',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Role permissions (many-to-many)
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  granted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- User roles (many-to-many with additional metadata)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  conditions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id)
);

-- Direct user permissions (for exceptions)
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  conditions JSONB DEFAULT '[]',
  UNIQUE(user_id, permission_id)
);

-- Permission cache for performance
CREATE TABLE permission_cache (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permissions JSONB NOT NULL,
  context_hash VARCHAR(64),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, context_hash)
);

-- Indexes for performance
CREATE INDEX idx_roles_slug ON roles(slug);
CREATE INDEX idx_roles_level ON roles(level);
CREATE INDEX idx_roles_system ON roles(is_system);
CREATE INDEX idx_roles_default ON roles(is_default);
CREATE INDEX idx_permissions_slug ON permissions(slug);
CREATE INDEX idx_permissions_category ON permissions(category);
CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_roles_active ON user_roles(is_active);
CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX idx_permission_cache_user ON permission_cache(user_id);
CREATE INDEX idx_permission_cache_expires ON permission_cache(expires_at);
```

---

## 🔗 **Related Documentation**

- **[User Management](./management.md)** - User CRUD operations dan management
- **[Authentication](./authentication.md)** - Login system integration
- **[User Groups](./groups.md)** - Group-based permissions
- **[Security System](../06_security/)** - Security audit dan compliance
- **[User Analytics](../01_analytics/user-analytics.md)** - Role usage analytics

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
