# 👤 User Management System

> **Comprehensive User CRUD Operations JA-CMS**  
> Advanced user management dengan bulk operations, search, dan status management

---

## 📋 **Deskripsi**

User Management System menyediakan comprehensive tools untuk mengelola users dalam JA-CMS. Sistem ini mendukung CRUD operations, bulk management, advanced search, status management, dan user lifecycle management dengan interface yang user-friendly dan API yang powerful.

---

## ⭐ **Core Features**

### **1. 👤 User CRUD Operations**

#### **User Architecture:**
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  website?: string;
  phone?: string;
  roles: Role[];
  permissions: Permission[];
  groups: UserGroup[];
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin?: Date;
  loginCount: number;
  failedLoginAttempts: number;
  passwordChangedAt: Date;
  preferences: UserPreferences;
  profile: UserProfile;
  metadata: UserMetadata;
  createdAt: Date;
  updatedAt: Date;
}

interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  theme: 'light' | 'dark' | 'auto';
  emailNotifications: NotificationSettings;
  pushNotifications: NotificationSettings;
  weeklyDigest: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
  accessibility: AccessibilitySettings;
}

interface UserProfile {
  company?: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  birthDate?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  socialLinks: SocialLinks;
  customFields: CustomField[];
  skills: string[];
  interests: string[];
}

interface UserMetadata {
  source: 'registration' | 'import' | 'invitation' | 'migration';
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  notes: AdminNote[];
  tags: string[];
  customData: Record<string, any>;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
}

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}

type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending' | 'banned' | 'archived';
```

#### **User Management Service:**
```typescript
export class UserManagementService {
  private userRepository: UserRepository;
  private roleService: RoleService;
  private permissionService: PermissionService;
  private notificationService: NotificationService;
  private auditService: AuditService;
  private validationService: ValidationService;

  async createUser(userData: CreateUserData, createdBy: string): Promise<User> {
    // Validate user data
    const validation = await this.validationService.validateUserData(userData);
    if (!validation.valid) {
      throw new Error(`User validation failed: ${validation.errors.join(', ')}`);
    }

    // Check for existing user
    const existingUser = await this.checkExistingUser(userData.email, userData.username);
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password if provided
    let hashedPassword;
    if (userData.password) {
      hashedPassword = await this.hashPassword(userData.password);
    }

    // Create user
    const user: User = {
      id: this.generateUserId(),
      username: userData.username,
      email: userData.email.toLowerCase(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      displayName: userData.displayName || `${userData.firstName} ${userData.lastName}`,
      avatar: userData.avatar,
      bio: userData.bio,
      website: userData.website,
      phone: userData.phone,
      roles: await this.assignDefaultRoles(userData.roles),
      permissions: [],
      groups: [],
      status: userData.status || 'pending',
      emailVerified: userData.emailVerified || false,
      phoneVerified: userData.phoneVerified || false,
      twoFactorEnabled: false,
      loginCount: 0,
      failedLoginAttempts: 0,
      passwordChangedAt: new Date(),
      preferences: this.getDefaultPreferences(),
      profile: this.initializeProfile(userData.profile),
      metadata: this.initializeMetadata(userData.metadata, createdBy),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save user
    const savedUser = await this.userRepository.create(user, hashedPassword);

    // Send verification email if needed
    if (!user.emailVerified && userData.sendVerificationEmail !== false) {
      await this.sendVerificationEmail(savedUser);
    }

    // Send welcome notification
    if (userData.sendWelcomeEmail !== false) {
      await this.sendWelcomeNotification(savedUser);
    }

    // Log audit event
    await this.auditService.log({
      action: 'user_created',
      userId: savedUser.id,
      performedBy: createdBy,
      details: {
        email: savedUser.email,
        roles: savedUser.roles.map(r => r.name)
      }
    });

    return savedUser;
  }

  async updateUser(userId: string, updates: UpdateUserData, updatedBy: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate updates
    const validation = await this.validationService.validateUserUpdate(updates, user);
    if (!validation.valid) {
      throw new Error(`User update validation failed: ${validation.errors.join(', ')}`);
    }

    // Check permissions
    const canUpdate = await this.checkUpdatePermissions(updatedBy, user, updates);
    if (!canUpdate.allowed) {
      throw new Error(`Insufficient permissions: ${canUpdate.reason}`);
    }

    // Handle sensitive updates
    const sensitiveFields = ['email', 'username', 'roles', 'permissions', 'status'];
    const hasSensitiveUpdates = Object.keys(updates).some(key => sensitiveFields.includes(key));

    if (hasSensitiveUpdates) {
      await this.validateSensitiveUpdates(updates, user, updatedBy);
    }

    // Apply updates
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };

    // Handle email change
    if (updates.email && updates.email !== user.email) {
      updatedUser.emailVerified = false;
      await this.sendEmailChangeVerification(updatedUser, updates.email);
    }

    // Handle role/permission changes
    if (updates.roles || updates.permissions) {
      await this.validateRolePermissionChanges(updatedUser, user);
    }

    // Save updates
    const savedUser = await this.userRepository.update(userId, updatedUser);

    // Send notifications for important changes
    await this.notifyUserChanges(savedUser, user, updates, updatedBy);

    // Log audit event
    await this.auditService.log({
      action: 'user_updated',
      userId: savedUser.id,
      performedBy: updatedBy,
      details: {
        changes: this.getChangesSummary(user, updatedUser),
        sensitive: hasSensitiveUpdates
      }
    });

    return savedUser;
  }

  async deleteUser(userId: string, deletedBy: string, options: DeleteUserOptions = {}): Promise<DeleteResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check permissions
    const canDelete = await this.checkDeletePermissions(deletedBy, user);
    if (!canDelete.allowed) {
      throw new Error(`Cannot delete user: ${canDelete.reason}`);
    }

    // Prevent self-deletion
    if (userId === deletedBy && !options.allowSelfDeletion) {
      throw new Error('Cannot delete your own account');
    }

    // Handle user content
    const userContent = await this.getUserContent(userId);
    if (userContent.hasContent && !options.handleContent) {
      throw new Error('User has associated content. Please specify how to handle it.');
    }

    try {
      // Start transaction
      await this.userRepository.startTransaction();

      // Handle user content based on options
      if (userContent.hasContent) {
        await this.handleUserContent(userId, options.handleContent || 'reassign', options.reassignTo);
      }

      // Handle user sessions
      await this.invalidateAllUserSessions(userId);

      // Handle user notifications
      await this.cleanupUserNotifications(userId);

      // Perform deletion (soft or hard)
      let result: DeleteResult;
      if (options.hardDelete) {
        await this.userRepository.hardDelete(userId);
        result = { success: true, type: 'hard', message: 'User permanently deleted' };
      } else {
        await this.userRepository.softDelete(userId, deletedBy);
        result = { success: true, type: 'soft', message: 'User archived successfully' };
      }

      // Commit transaction
      await this.userRepository.commitTransaction();

      // Send notification to user (if soft delete)
      if (!options.hardDelete && options.notifyUser !== false) {
        await this.notifyUserDeletion(user, deletedBy);
      }

      // Log audit event
      await this.auditService.log({
        action: options.hardDelete ? 'user_hard_deleted' : 'user_soft_deleted',
        userId,
        performedBy: deletedBy,
        details: {
          email: user.email,
          hadContent: userContent.hasContent,
          contentHandling: options.handleContent
        }
      });

      return result;

    } catch (error) {
      await this.userRepository.rollbackTransaction();
      throw error;
    }
  }

  async bulkCreateUsers(usersData: CreateUserData[], createdBy: string): Promise<BulkCreateResult> {
    const results: BulkCreateResult = {
      successful: [],
      failed: [],
      summary: {
        total: usersData.length,
        success: 0,
        failed: 0,
        skipped: 0
      }
    };

    // Validate all users first
    const validationResults = await Promise.all(
      usersData.map(userData => this.validationService.validateUserData(userData))
    );

    for (let i = 0; i < usersData.length; i++) {
      const userData = usersData[i];
      const validation = validationResults[i];

      if (!validation.valid) {
        results.failed.push({
          data: userData,
          error: `Validation failed: ${validation.errors.join(', ')}`,
          index: i
        });
        results.summary.failed++;
        continue;
      }

      try {
        const user = await this.createUser(userData, createdBy);
        results.successful.push({
          data: userData,
          user,
          index: i
        });
        results.summary.success++;
      } catch (error) {
        results.failed.push({
          data: userData,
          error: error.message,
          index: i
        });
        results.summary.failed++;
      }
    }

    // Log bulk operation
    await this.auditService.log({
      action: 'bulk_users_created',
      performedBy: createdBy,
      details: {
        total: results.summary.total,
        successful: results.summary.success,
        failed: results.summary.failed
      }
    });

    return results;
  }

  async searchUsers(query: UserSearchQuery): Promise<UserSearchResult> {
    // Build search criteria
    const searchCriteria = this.buildSearchCriteria(query);
    
    // Execute search
    const users = await this.userRepository.search(searchCriteria, {
      sort: query.sort || { createdAt: -1 },
      limit: query.limit || 20,
      offset: query.offset || 0,
      include: query.include || ['roles', 'groups']
    });

    // Get total count
    const totalCount = await this.userRepository.countSearch(searchCriteria);

    // Apply privacy filters
    const filteredUsers = await this.applyPrivacyFilters(users, query.requestedBy);

    return {
      users: filteredUsers,
      total: totalCount,
      pagination: {
        limit: query.limit || 20,
        offset: query.offset || 0,
        total: totalCount,
        pages: Math.ceil(totalCount / (query.limit || 20))
      },
      facets: await this.generateSearchFacets(searchCriteria),
      suggestions: await this.getSearchSuggestions(query.q)
    };
  }

  async updateUserStatus(userId: string, newStatus: UserStatus, updatedBy: string, reason?: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate status transition
    const canTransition = this.validateStatusTransition(user.status, newStatus);
    if (!canTransition.allowed) {
      throw new Error(`Invalid status transition: ${canTransition.reason}`);
    }

    // Check permissions
    const canUpdate = await this.checkStatusUpdatePermissions(updatedBy, user, newStatus);
    if (!canUpdate.allowed) {
      throw new Error(`Insufficient permissions: ${canUpdate.reason}`);
    }

    const oldStatus = user.status;
    user.status = newStatus;
    user.updatedAt = new Date();

    // Handle status-specific actions
    await this.handleStatusChange(user, oldStatus, newStatus, reason);

    // Save user
    const updatedUser = await this.userRepository.update(userId, user);

    // Send notifications
    await this.notifyStatusChange(updatedUser, oldStatus, newStatus, reason);

    // Log audit event
    await this.auditService.log({
      action: 'user_status_changed',
      userId,
      performedBy: updatedBy,
      details: {
        oldStatus,
        newStatus,
        reason
      }
    });

    return updatedUser;
  }

  private buildSearchCriteria(query: UserSearchQuery): any {
    const criteria: any = {};

    // Text search
    if (query.q) {
      criteria.$or = [
        { username: { $regex: query.q, $options: 'i' } },
        { email: { $regex: query.q, $options: 'i' } },
        { firstName: { $regex: query.q, $options: 'i' } },
        { lastName: { $regex: query.q, $options: 'i' } },
        { displayName: { $regex: query.q, $options: 'i' } }
      ];
    }

    // Status filter
    if (query.status) {
      criteria.status = Array.isArray(query.status) ? { $in: query.status } : query.status;
    }

    // Role filter
    if (query.roles) {
      criteria['roles.slug'] = { $in: Array.isArray(query.roles) ? query.roles : [query.roles] };
    }

    // Group filter
    if (query.groups) {
      criteria['groups.slug'] = { $in: Array.isArray(query.groups) ? query.groups : [query.groups] };
    }

    // Date filters
    if (query.createdAfter || query.createdBefore) {
      criteria.createdAt = {};
      if (query.createdAfter) criteria.createdAt.$gte = query.createdAfter;
      if (query.createdBefore) criteria.createdAt.$lte = query.createdBefore;
    }

    if (query.lastLoginAfter || query.lastLoginBefore) {
      criteria.lastLogin = {};
      if (query.lastLoginAfter) criteria.lastLogin.$gte = query.lastLoginAfter;
      if (query.lastLoginBefore) criteria.lastLogin.$lte = query.lastLoginBefore;
    }

    // Verification filters
    if (query.emailVerified !== undefined) {
      criteria.emailVerified = query.emailVerified;
    }

    if (query.twoFactorEnabled !== undefined) {
      criteria.twoFactorEnabled = query.twoFactorEnabled;
    }

    // Tag filter
    if (query.tags) {
      criteria['metadata.tags'] = { $in: Array.isArray(query.tags) ? query.tags : [query.tags] };
    }

    return criteria;
  }

  private async handleStatusChange(user: User, oldStatus: UserStatus, newStatus: UserStatus, reason?: string): Promise<void> {
    switch (newStatus) {
      case 'suspended':
        // Invalidate all sessions
        await this.invalidateAllUserSessions(user.id);
        // Log security event
        await this.auditService.logSecurityEvent({
          type: 'user_suspended',
          userId: user.id,
          reason,
          timestamp: new Date()
        });
        break;

      case 'banned':
        // Invalidate all sessions
        await this.invalidateAllUserSessions(user.id);
        // Block IP if configured
        if (user.metadata.ipAddress) {
          await this.addToIPBlocklist(user.metadata.ipAddress, reason);
        }
        break;

      case 'active':
        // Reset failed login attempts
        await this.resetFailedLoginAttempts(user.id);
        // Remove from IP blocklist if was banned
        if (oldStatus === 'banned' && user.metadata.ipAddress) {
          await this.removeFromIPBlocklist(user.metadata.ipAddress);
        }
        break;

      case 'archived':
        // Clean up user data
        await this.archiveUserData(user.id);
        break;
    }
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const [contentStats, activityStats, securityStats] = await Promise.all([
      this.getContentStats(userId),
      this.getActivityStats(userId),
      this.getSecurityStats(userId)
    ]);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        status: user.status
      },
      content: contentStats,
      activity: activityStats,
      security: securityStats,
      summary: {
        joinDate: user.createdAt,
        lastActive: user.lastLogin,
        totalLogins: user.loginCount,
        accountAge: this.calculateAccountAge(user.createdAt)
      }
    };
  }
}

interface CreateUserData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  password?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  phone?: string;
  roles?: string[];
  status?: UserStatus;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  profile?: Partial<UserProfile>;
  metadata?: Partial<UserMetadata>;
  sendVerificationEmail?: boolean;
  sendWelcomeEmail?: boolean;
}

interface UpdateUserData {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  phone?: string;
  roles?: Role[];
  permissions?: Permission[];
  groups?: UserGroup[];
  status?: UserStatus;
  preferences?: Partial<UserPreferences>;
  profile?: Partial<UserProfile>;
  metadata?: Partial<UserMetadata>;
}

interface UserSearchQuery {
  q?: string; // text search
  status?: UserStatus | UserStatus[];
  roles?: string | string[];
  groups?: string | string[];
  createdAfter?: Date;
  createdBefore?: Date;
  lastLoginAfter?: Date;
  lastLoginBefore?: Date;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  tags?: string | string[];
  sort?: any;
  limit?: number;
  offset?: number;
  include?: string[];
  requestedBy?: string;
}

interface UserSearchResult {
  users: User[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
    total: number;
    pages: number;
  };
  facets: SearchFacets;
  suggestions: string[];
}

interface BulkCreateResult {
  successful: Array<{
    data: CreateUserData;
    user: User;
    index: number;
  }>;
  failed: Array<{
    data: CreateUserData;
    error: string;
    index: number;
  }>;
  summary: {
    total: number;
    success: number;
    failed: number;
    skipped: number;
  };
}

interface DeleteUserOptions {
  hardDelete?: boolean;
  handleContent?: 'delete' | 'reassign' | 'archive';
  reassignTo?: string;
  notifyUser?: boolean;
  allowSelfDeletion?: boolean;
}

interface DeleteResult {
  success: boolean;
  type: 'soft' | 'hard';
  message: string;
}

interface UserStats {
  user: {
    id: string;
    username: string;
    email: string;
    displayName: string;
    status: UserStatus;
  };
  content: {
    postsCreated: number;
    pagesCreated: number;
    commentsPosted: number;
    mediaUploaded: number;
  };
  activity: {
    totalLogins: number;
    lastLogin?: Date;
    averageSessionDuration: number;
    mostActiveHours: number[];
    deviceTypes: { [key: string]: number };
  };
  security: {
    failedLoginAttempts: number;
    passwordAge: number;
    twoFactorEnabled: boolean;
    suspiciousActivity: number;
  };
  summary: {
    joinDate: Date;
    lastActive?: Date;
    totalLogins: number;
    accountAge: number; // days
  };
}
```

### **2. 📊 User Status Management**

#### **Status Workflow:**
```typescript
export class UserStatusManager {
  private readonly statusTransitions: Record<UserStatus, UserStatus[]> = {
    pending: ['active', 'suspended', 'banned'],
    active: ['inactive', 'suspended', 'banned', 'archived'],
    inactive: ['active', 'suspended', 'banned', 'archived'],
    suspended: ['active', 'banned', 'archived'],
    banned: ['archived'], // Only admins can unban
    archived: [] // Cannot change from archived
  };

  validateStatusTransition(currentStatus: UserStatus, newStatus: UserStatus): ValidationResult {
    const allowedTransitions = this.statusTransitions[currentStatus];
    
    if (!allowedTransitions.includes(newStatus)) {
      return {
        allowed: false,
        reason: `Cannot transition from ${currentStatus} to ${newStatus}`
      };
    }

    return { allowed: true };
  }

  async processStatusChange(user: User, newStatus: UserStatus, reason?: string): Promise<StatusChangeResult> {
    const actions: StatusAction[] = [];

    switch (newStatus) {
      case 'active':
        actions.push('reset_failed_attempts', 'enable_login', 'send_reactivation_email');
        break;
      case 'inactive':
        actions.push('disable_login', 'preserve_sessions');
        break;
      case 'suspended':
        actions.push('disable_login', 'invalidate_sessions', 'log_security_event');
        break;
      case 'banned':
        actions.push('disable_login', 'invalidate_sessions', 'block_ip', 'log_security_event');
        break;
      case 'archived':
        actions.push('disable_login', 'invalidate_sessions', 'archive_data', 'anonymize_pii');
        break;
    }

    return {
      status: newStatus,
      actions,
      reason,
      timestamp: new Date()
    };
  }
}

interface StatusChangeResult {
  status: UserStatus;
  actions: StatusAction[];
  reason?: string;
  timestamp: Date;
}

type StatusAction = 
  | 'reset_failed_attempts'
  | 'enable_login'
  | 'disable_login'
  | 'invalidate_sessions'
  | 'preserve_sessions'
  | 'block_ip'
  | 'unblock_ip'
  | 'archive_data'
  | 'anonymize_pii'
  | 'send_reactivation_email'
  | 'log_security_event';
```

### **3. 🔍 Advanced User Search**

#### **Search Service:**
```typescript
export class UserSearchService {
  private searchEngine: SearchEngine;
  private indexManager: IndexManager;

  async indexUser(user: User): Promise<void> {
    const searchDocument = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`,
      displayName: user.displayName,
      bio: user.bio,
      website: user.website,
      roles: user.roles.map(r => r.name),
      groups: user.groups.map(g => g.name),
      status: user.status,
      tags: user.metadata.tags,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      // Searchable custom fields
      customFields: user.profile.customFields.reduce((acc, field) => {
        acc[field.key] = field.value;
        return acc;
      }, {} as Record<string, any>)
    };

    await this.searchEngine.index('users', user.id, searchDocument);
  }

  async searchUsers(query: UserSearchQuery): Promise<UserSearchResult> {
    const searchParams = this.buildSearchParams(query);
    const results = await this.searchEngine.search('users', searchParams);

    return {
      users: await this.hydrateUsers(results.hits),
      total: results.total,
      pagination: this.buildPagination(query, results.total),
      facets: this.buildFacets(results.aggregations),
      suggestions: await this.getSuggestions(query.q),
      highlighted: this.extractHighlights(results.hits)
    };
  }

  private buildSearchParams(query: UserSearchQuery): SearchParams {
    const params: SearchParams = {
      query: query.q || '*',
      filters: [],
      sort: query.sort || [{ createdAt: 'desc' }],
      from: query.offset || 0,
      size: query.limit || 20,
      highlight: {
        fields: ['username', 'email', 'fullName', 'bio'],
        pre_tags: ['<mark>'],
        post_tags: ['</mark>']
      },
      aggregations: {
        status: { terms: { field: 'status' } },
        roles: { terms: { field: 'roles.keyword' } },
        groups: { terms: { field: 'groups.keyword' } },
        emailVerified: { terms: { field: 'emailVerified' } },
        twoFactorEnabled: { terms: { field: 'twoFactorEnabled' } },
        createdAt: {
          date_histogram: {
            field: 'createdAt',
            calendar_interval: 'month'
          }
        }
      }
    };

    // Add filters
    if (query.status) {
      params.filters.push({
        terms: { status: Array.isArray(query.status) ? query.status : [query.status] }
      });
    }

    if (query.roles) {
      params.filters.push({
        terms: { 'roles.keyword': Array.isArray(query.roles) ? query.roles : [query.roles] }
      });
    }

    if (query.emailVerified !== undefined) {
      params.filters.push({
        term: { emailVerified: query.emailVerified }
      });
    }

    if (query.createdAfter || query.createdBefore) {
      const range: any = {};
      if (query.createdAfter) range.gte = query.createdAfter;
      if (query.createdBefore) range.lte = query.createdBefore;
      params.filters.push({ range: { createdAt: range } });
    }

    return params;
  }

  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    return this.searchEngine.getSavedSearches('users', userId);
  }

  async saveSearch(userId: string, searchData: SaveSearchData): Promise<SavedSearch> {
    return this.searchEngine.saveSearch('users', userId, searchData);
  }
}

interface SavedSearch {
  id: string;
  name: string;
  query: UserSearchQuery;
  userId: string;
  createdAt: Date;
  lastUsed: Date;
  useCount: number;
}

interface SaveSearchData {
  name: string;
  query: UserSearchQuery;
  isPublic?: boolean;
  description?: string;
}
```

---

## 🎨 **User Management Interface**

### **User Management Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 👥 User Management                    [Add User] [Import] [Export] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Search & Filters ─────────────────────────────────┐   │
│ │ 🔍 Search: [john@example.com____________] [Search]  │   │
│ │                                                   │   │
│ │ Status: [All ▼] Role: [All ▼] Group: [All ▼]      │   │
│ │ Verified: [All ▼] 2FA: [All ▼] Last Login: [Any ▼] │   │
│ │                                                   │   │
│ │ [Save Search] [Clear Filters] [Advanced Search]   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ User List ────────────────────────────────────────┐   │
│ │ ☑ Select All    📊 1,234 users found              │   │
│ │                                                   │   │
│ │ ┌─ John Doe ─────────────────────────────────────┐  │   │
│ │ │ 👤 [Avatar] john.doe@company.com               │  │   │
│ │ │ 🏷️ Administrator • Marketing Team               │  │   │
│ │ │ ✅ Active • ✅ Verified • 🔒 2FA Enabled       │  │   │
│ │ │ 📅 Joined: Jan 15, 2023 • Last login: 2h ago  │  │   │
│ │ │ [Edit] [View Profile] [Login As] [Suspend]     │  │   │
│ │ └─────────────────────────────────────────────────┘  │   │
│ │                                                   │   │
│ │ ┌─ Jane Smith ───────────────────────────────────┐  │   │
│ │ │ 👤 [Avatar] jane.smith@company.com             │  │   │
│ │ │ 🏷️ Editor • Content Team                       │  │   │
│ │ │ ⚠️ Suspended • ✅ Verified • ❌ 2FA Disabled   │  │   │
│ │ │ 📅 Joined: Mar 10, 2023 • Last login: 5d ago  │  │   │
│ │ │ [Edit] [View Profile] [Reactivate] [Delete]    │  │   │
│ │ └─────────────────────────────────────────────────┘  │   │
│ │                                                   │   │
│ │ ┌─ Mike Johnson ─────────────────────────────────┐  │   │
│ │ │ 👤 [Avatar] mike.j@company.com                 │  │   │
│ │ │ 🏷️ Author • Content Team                       │  │   │
│ │ │ ⏳ Pending • ❌ Unverified • ❌ 2FA Disabled   │  │   │
│ │ │ 📅 Joined: Dec 20, 2023 • Never logged in     │  │   │
│ │ │ [Edit] [Resend Invite] [Verify] [Delete]       │  │   │
│ │ └─────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Bulk Actions ─────────────────────────────────────┐   │
│ │ Selected: 0 users                                  │   │
│ │                                                   │   │
│ │ Actions: [Change Status ▼] [Assign Role ▼]        │   │
│ │         [Add to Group ▼] [Send Email ▼]           │   │
│ │                                                   │   │
│ │ [Apply to Selected] [Export Selected]             │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Quick Stats ──────────────────────────────────────┐   │
│ │ 📊 Total Users: 1,234 (+23 this month)            │   │
│ │ ✅ Active: 1,156 • ⚠️ Suspended: 45 • ⏳ Pending: 33 │   │
│ │ 🔒 2FA Enabled: 892 (72%) • ✅ Verified: 1,201 (97%) │   │
│ │ 📈 New registrations: +15% vs last month          │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **User Creation/Edit Form:**
```
┌─────────────────────────────────────────────────────────┐
│ ✏️ Edit User: John Doe                    [Save] [Cancel] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Basic Information ────────────────────────────────┐   │
│ │ 👤 Avatar: [📷 Upload] [🗑️ Remove] [🔗 From URL]     │   │
│ │                                                   │   │
│ │ First Name: [John_________________]               │   │
│ │ Last Name:  [Doe__________________]               │   │
│ │ Display Name: [John Doe___________] (Auto-fill)   │   │
│ │                                                   │   │
│ │ Username: [john.doe_______________] ✅ Available   │   │
│ │ Email:    [john.doe@company.com___] ✅ Verified   │   │
│ │ Phone:    [+1 (555) 123-4567______] ❌ Unverified │   │
│ │                                                   │   │
│ │ Bio: ┌─────────────────────────────────────────┐   │   │
│ │      │ Senior Marketing Manager with 8+ years │   │   │
│ │      │ experience in digital marketing and    │   │   │
│ │      │ content strategy...                    │   │   │
│ │      └─────────────────────────────────────────┘   │   │
│ │                                                   │   │
│ │ Website: [https://johndoe.com_____]               │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Account Settings ─────────────────────────────────┐   │
│ │ Status: [Active ▼] ✅                              │   │
│ │ ☑ Email Verified  ☑ Phone Verified               │   │
│ │ ☑ 2FA Enabled     ☐ Force Password Change        │   │
│ │                                                   │   │
│ │ Roles: [Administrator ▼] [+ Add Role]             │   │
│ │ • Administrator (Full access)                     │   │
│ │ • Marketing Manager (Marketing permissions)       │   │
│ │                                                   │   │
│ │ Groups: [Marketing Team ▼] [+ Add Group]          │   │
│ │ • Marketing Team                                  │   │
│ │ • Senior Staff                                    │   │
│ │                                                   │   │
│ │ Custom Permissions:                               │   │
│ │ ☑ Can manage users  ☐ Can access analytics       │   │
│ │ ☑ Can publish posts ☑ Can moderate comments      │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Profile & Preferences ────────────────────────────┐   │
│ │ Company: [Acme Corporation________]                │   │
│ │ Job Title: [Marketing Manager_____]                │   │
│ │ Department: [Marketing____________]                │   │
│ │ Location: [New York, NY___________]                │   │
│ │                                                   │   │
│ │ Language: [English ▼] Timezone: [EST ▼]           │   │
│ │ Date Format: [MM/DD/YYYY ▼] Time: [12 hour ▼]     │   │
│ │ Theme: [Auto ▼] (Light/Dark/Auto)                 │   │
│ │                                                   │   │
│ │ Notifications:                                     │   │
│ │ ☑ Email notifications  ☑ Push notifications      │   │
│ │ ☑ Weekly digest       ☐ Marketing emails         │   │
│ │ ☑ Security alerts     ☑ System announcements     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Admin Notes & Tags ───────────────────────────────┐   │
│ │ Tags: [VIP] [Marketing] [Senior] [+ Add Tag]       │   │
│ │                                                   │   │
│ │ Admin Notes:                                       │   │
│ │ ┌─────────────────────────────────────────────────┐ │   │
│ │ │ Dec 20, 2023 - Admin: Promoted to Marketing    │ │   │
│ │ │ Manager role. Granted additional permissions.  │ │   │
│ │ │                                                │ │   │
│ │ │ Nov 15, 2023 - System: 2FA enabled by user    │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ │                                                   │   │
│ │ Add Note: [_________________________] [Add Note]  │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// User CRUD operations
GET    /api/users                        // List users with pagination/filtering
POST   /api/users                        // Create new user
GET    /api/users/{id}                   // Get user details
PUT    /api/users/{id}                   // Update user
DELETE /api/users/{id}                   // Delete user (soft delete)

// User search and filtering
GET    /api/users/search                 // Advanced user search
POST   /api/users/search/save            // Save search query
GET    /api/users/search/saved           // Get saved searches
DELETE /api/users/search/{id}            // Delete saved search

// Bulk operations
POST   /api/users/bulk                   // Bulk create users
PUT    /api/users/bulk                   // Bulk update users
DELETE /api/users/bulk                   // Bulk delete users
POST   /api/users/import                 // Import users from file
GET    /api/users/export                 // Export users to file

// User status management
PUT    /api/users/{id}/status            // Update user status
POST   /api/users/{id}/activate          // Activate user
POST   /api/users/{id}/suspend           // Suspend user
POST   /api/users/{id}/ban               // Ban user
POST   /api/users/{id}/archive           // Archive user

// User statistics and analytics
GET    /api/users/{id}/stats             // Get user statistics
GET    /api/users/analytics              // Get user analytics
GET    /api/users/activity/{id}          // Get user activity log
```

### **Database Schema:**
```sql
-- Users table (main user data)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,
  password_hash VARCHAR(255),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200),
  avatar VARCHAR(500),
  bio TEXT,
  website VARCHAR(500),
  phone VARCHAR(50),
  phone_verified BOOLEAN DEFAULT false,
  phone_verified_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(100),
  last_login TIMESTAMP,
  login_count INTEGER DEFAULT 0,
  failed_login_attempts INTEGER DEFAULT 0,
  password_changed_at TIMESTAMP DEFAULT NOW(),
  preferences JSONB,
  profile JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- User sessions
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  location JSONB,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW()
);

-- User activity log
CREATE TABLE user_activity (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User preferences history
CREATE TABLE user_preferences_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  old_preferences JSONB,
  new_preferences JSONB,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP DEFAULT NOW()
);

-- User verification tokens
CREATE TABLE user_verification_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- email, phone, password_reset, etc.
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_login ON users(last_login);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_action ON user_activity(action);
CREATE INDEX idx_user_activity_created_at ON user_activity(created_at);
CREATE INDEX idx_user_verification_tokens_user ON user_verification_tokens(user_id);
CREATE INDEX idx_user_verification_tokens_token ON user_verification_tokens(token);
```

---

## 🔗 **Related Documentation**

- **[Authentication System](./authentication.md)** - Login, 2FA, session management
- **[Roles & Permissions](./roles.md)** - RBAC system integration
- **[User Groups](./groups.md)** - Group management integration
- **[Security System](../06_security/)** - Security features dan audit logging
- **[User Analytics](../01_analytics/user-analytics.md)** - User behavior tracking

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
