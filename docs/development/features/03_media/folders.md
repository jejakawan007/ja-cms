# 📁 Media Folders Management

> **Hierarchical Media Organization JA-CMS**  
> Advanced folder system dengan permissions, analytics, dan bulk operations

---

## 📋 **Deskripsi**

Media Folders Management System menyediakan struktur hierarkis yang powerful untuk mengorganisir media files. Sistem ini mendukung unlimited nesting, granular permissions, bulk operations, dan analytics untuk membantu mengelola media library yang besar dan kompleks.

---

## ⭐ **Core Features**

### **1. 🗂️ Hierarchical Folder System**

#### **Folder Structure:**
```typescript
interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string;
  children: MediaFolder[];
  path: string; // Full path from root
  level: number; // Nesting depth
  order: number; // Sort order within parent
  type: 'system' | 'user' | 'shared';
  visibility: 'public' | 'private' | 'restricted';
  permissions: FolderPermissions;
  settings: FolderSettings;
  stats: {
    fileCount: number;
    totalSize: number;
    lastActivity: Date;
    mostUsedFileType: string;
  };
  metadata: {
    color?: string;
    icon?: string;
    tags: string[];
    customFields: Record<string, any>;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FolderPermissions {
  owner: string;
  editors: string[]; // User IDs who can edit
  viewers: string[]; // User IDs who can view
  groups: {
    [groupId: string]: 'read' | 'write' | 'admin';
  };
  public: {
    canView: boolean;
    canUpload: boolean;
    canDownload: boolean;
  };
  inheritance: {
    enabled: boolean;
    override: string[]; // Which permissions to override
  };
}

interface FolderSettings {
  allowedFileTypes: string[];
  maxFileSize: number;
  maxFiles: number;
  autoOrganize: boolean;
  autoTags: string[];
  uploadNotifications: boolean;
  versionControl: boolean;
  watermarkSettings?: WatermarkConfig;
  compressionSettings?: CompressionConfig;
}

interface FolderTree {
  folder: MediaFolder;
  children: FolderTree[];
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isSelected: boolean;
}
```

#### **Folder Management Service:**
```typescript
export class MediaFolderService {
  async createFolder(folderData: CreateFolderData): Promise<MediaFolder> {
    // Validate folder data
    const validation = await this.validateFolderData(folderData);
    if (!validation.valid) {
      throw new Error(`Invalid folder data: ${validation.errors.join(', ')}`);
    }

    // Check permissions on parent folder
    if (folderData.parent) {
      const canCreate = await this.checkFolderPermission(folderData.parent, folderData.createdBy, 'write');
      if (!canCreate) {
        throw new Error('Insufficient permissions to create folder in parent');
      }
    }

    // Generate unique slug
    const slug = await this.generateUniqueSlug(folderData.name, folderData.parent);

    // Calculate folder path and level
    const path = await this.calculateFolderPath(folderData.parent, slug);
    const level = await this.calculateFolderLevel(folderData.parent);

    // Get next order in parent
    const order = await this.getNextOrderInParent(folderData.parent);

    // Create folder
    const folder = await this.prisma.mediaFolder.create({
      data: {
        name: folderData.name,
        slug,
        description: folderData.description,
        parentId: folderData.parent,
        path,
        level,
        order,
        type: folderData.type || 'user',
        visibility: folderData.visibility || 'private',
        permissions: folderData.permissions || this.getDefaultPermissions(folderData.createdBy),
        settings: folderData.settings || this.getDefaultSettings(),
        metadata: folderData.metadata || { tags: [], customFields: {} },
        createdBy: folderData.createdBy
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { files: true }
        }
      }
    });

    // Update parent folder stats
    if (folderData.parent) {
      await this.updateFolderStats(folderData.parent);
    }

    // Create folder on filesystem
    await this.createPhysicalFolder(folder.path);

    // Log activity
    await this.logFolderActivity('folder_created', folder.id, folderData.createdBy);

    return folder;
  }

  async getFolderTree(parentId?: string, userId?: string): Promise<FolderTree[]> {
    const folders = await this.prisma.mediaFolder.findMany({
      where: {
        parentId: parentId || null,
        ...(userId && await this.buildPermissionFilter(userId))
      },
      include: {
        children: {
          include: {
            _count: { select: { files: true } }
          }
        },
        _count: { select: { files: true } }
      },
      orderBy: { order: 'asc' }
    });

    return folders.map(folder => this.buildFolderTree(folder, 0));
  }

  async moveFolder(folderId: string, newParentId: string | null, userId: string): Promise<void> {
    const folder = await this.getFolder(folderId);
    if (!folder) {
      throw new Error('Folder not found');
    }

    // Check permissions
    const canMove = await this.checkFolderPermission(folderId, userId, 'write');
    if (!canMove) {
      throw new Error('Insufficient permissions to move folder');
    }

    // Prevent moving to descendant
    if (newParentId && await this.isDescendant(folderId, newParentId)) {
      throw new Error('Cannot move folder to its own descendant');
    }

    // Calculate new path and level
    const newPath = await this.calculateFolderPath(newParentId, folder.slug);
    const newLevel = await this.calculateFolderLevel(newParentId);

    // Update folder and all descendants
    await this.updateFolderHierarchy(folderId, newParentId, newPath, newLevel);

    // Move physical folder
    await this.movePhysicalFolder(folder.path, newPath);

    // Update folder stats
    if (folder.parentId) {
      await this.updateFolderStats(folder.parentId);
    }
    if (newParentId) {
      await this.updateFolderStats(newParentId);
    }

    // Log activity
    await this.logFolderActivity('folder_moved', folderId, userId, {
      oldParent: folder.parentId,
      newParent: newParentId
    });
  }

  async bulkMoveFiles(fileIds: string[], targetFolderId: string, userId: string): Promise<BulkMoveResult> {
    const targetFolder = await this.getFolder(targetFolderId);
    if (!targetFolder) {
      throw new Error('Target folder not found');
    }

    // Check permissions on target folder
    const canUpload = await this.checkFolderPermission(targetFolderId, userId, 'write');
    if (!canUpload) {
      throw new Error('Insufficient permissions to move files to target folder');
    }

    const results: BulkMoveResult = {
      success: [],
      failed: [],
      total: fileIds.length
    };

    for (const fileId of fileIds) {
      try {
        // Check if file exists and user has permission
        const file = await this.getMediaFile(fileId);
        if (!file) {
          results.failed.push({ fileId, error: 'File not found' });
          continue;
        }

        const canMoveFile = await this.checkFilePermission(fileId, userId, 'write');
        if (!canMoveFile) {
          results.failed.push({ fileId, error: 'Insufficient permissions' });
          continue;
        }

        // Check folder constraints
        const constraintCheck = await this.checkFolderConstraints(targetFolderId, file);
        if (!constraintCheck.allowed) {
          results.failed.push({ fileId, error: constraintCheck.reason });
          continue;
        }

        // Move file
        await this.moveFileToFolder(fileId, targetFolderId);
        results.success.push(fileId);

      } catch (error) {
        results.failed.push({ fileId, error: error.message });
      }
    }

    // Update folder stats
    await this.updateFolderStats(targetFolderId);

    // Log bulk operation
    await this.logFolderActivity('bulk_move_files', targetFolderId, userId, {
      fileCount: results.success.length,
      failedCount: results.failed.length
    });

    return results;
  }

  async duplicateFolder(folderId: string, newName: string, userId: string): Promise<MediaFolder> {
    const originalFolder = await this.getFolderWithFiles(folderId);
    if (!originalFolder) {
      throw new Error('Folder not found');
    }

    // Check permissions
    const canRead = await this.checkFolderPermission(folderId, userId, 'read');
    if (!canRead) {
      throw new Error('Insufficient permissions to duplicate folder');
    }

    // Create new folder
    const newFolder = await this.createFolder({
      name: newName,
      description: originalFolder.description,
      parent: originalFolder.parentId,
      type: 'user',
      visibility: 'private',
      permissions: this.getDefaultPermissions(userId),
      settings: { ...originalFolder.settings },
      metadata: { ...originalFolder.metadata },
      createdBy: userId
    });

    // Duplicate files
    const duplicatedFiles = await this.duplicateFolderFiles(originalFolder.files, newFolder.id, userId);

    // Duplicate subfolders recursively
    for (const child of originalFolder.children) {
      await this.duplicateFolderRecursive(child, newFolder.id, userId);
    }

    // Update folder stats
    await this.updateFolderStats(newFolder.id);

    return newFolder;
  }

  async getFolderAnalytics(folderId: string, timeRange: DateRange): Promise<FolderAnalytics> {
    const folder = await this.getFolder(folderId);
    if (!folder) {
      throw new Error('Folder not found');
    }

    const analytics = await this.calculateFolderAnalytics(folderId, timeRange);
    const usage = await this.getFolderUsage(folderId, timeRange);
    const trends = await this.getFolderTrends(folderId, timeRange);
    const topFiles = await this.getTopFilesInFolder(folderId, 10);

    return {
      folder,
      timeRange,
      overview: {
        totalFiles: analytics.fileCount,
        totalSize: analytics.totalSize,
        averageFileSize: analytics.averageFileSize,
        fileTypes: analytics.fileTypeDistribution,
        uploadTrend: trends.uploads,
        accessTrend: trends.access
      },
      usage,
      trends,
      topFiles,
      insights: await this.generateFolderInsights(analytics, usage, trends)
    };
  }

  async organizeFolderAutomatically(folderId: string, strategy: OrganizationStrategy): Promise<OrganizationResult> {
    const folder = await this.getFolderWithFiles(folderId);
    if (!folder) {
      throw new Error('Folder not found');
    }

    const result: OrganizationResult = {
      foldersCreated: [],
      filesMoved: [],
      errors: []
    };

    switch (strategy.type) {
      case 'by_file_type':
        result = await this.organizeByFileType(folder, strategy.options);
        break;
      
      case 'by_date':
        result = await this.organizeByDate(folder, strategy.options);
        break;
      
      case 'by_size':
        result = await this.organizeBySize(folder, strategy.options);
        break;
      
      case 'by_ai_content':
        result = await this.organizeByAIContent(folder, strategy.options);
        break;
      
      default:
        throw new Error(`Unknown organization strategy: ${strategy.type}`);
    }

    // Log organization activity
    await this.logFolderActivity('auto_organize', folderId, strategy.userId, {
      strategy: strategy.type,
      foldersCreated: result.foldersCreated.length,
      filesMoved: result.filesMoved.length
    });

    return result;
  }

  private async organizeByFileType(folder: MediaFolder, options: any): Promise<OrganizationResult> {
    const result: OrganizationResult = {
      foldersCreated: [],
      filesMoved: [],
      errors: []
    };

    // Group files by type
    const filesByType = new Map<string, MediaFile[]>();
    
    for (const file of folder.files) {
      const category = this.categorizeFileType(file.mimeType);
      if (!filesByType.has(category)) {
        filesByType.set(category, []);
      }
      filesByType.get(category)!.push(file);
    }

    // Create folders for each type and move files
    for (const [category, files] of filesByType.entries()) {
      if (files.length === 0) continue;

      // Create category folder
      const categoryFolder = await this.createFolder({
        name: this.getCategoryDisplayName(category),
        parent: folder.id,
        type: 'user',
        visibility: folder.visibility,
        createdBy: options.userId
      });

      result.foldersCreated.push(categoryFolder.id);

      // Move files to category folder
      for (const file of files) {
        try {
          await this.moveFileToFolder(file.id, categoryFolder.id);
          result.filesMoved.push(file.id);
        } catch (error) {
          result.errors.push({
            fileId: file.id,
            error: error.message
          });
        }
      }
    }

    return result;
  }

  private async organizeByDate(folder: MediaFolder, options: any): Promise<OrganizationResult> {
    const result: OrganizationResult = {
      foldersCreated: [],
      filesMoved: [],
      errors: []
    };

    // Group files by date
    const filesByDate = new Map<string, MediaFile[]>();
    
    for (const file of folder.files) {
      const date = new Date(file.createdAt);
      const dateKey = options.groupBy === 'month' 
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      if (!filesByDate.has(dateKey)) {
        filesByDate.set(dateKey, []);
      }
      filesByDate.get(dateKey)!.push(file);
    }

    // Create date folders and move files
    for (const [dateKey, files] of filesByDate.entries()) {
      if (files.length === 0) continue;

      const folderName = options.groupBy === 'month'
        ? this.formatMonthFolderName(dateKey)
        : this.formatDayFolderName(dateKey);

      const dateFolder = await this.createFolder({
        name: folderName,
        parent: folder.id,
        type: 'user',
        visibility: folder.visibility,
        createdBy: options.userId
      });

      result.foldersCreated.push(dateFolder.id);

      for (const file of files) {
        try {
          await this.moveFileToFolder(file.id, dateFolder.id);
          result.filesMoved.push(file.id);
        } catch (error) {
          result.errors.push({
            fileId: file.id,
            error: error.message
          });
        }
      }
    }

    return result;
  }

  private categorizeFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'images';
    if (mimeType.startsWith('video/')) return 'videos';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'documents';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'documents';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheets';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentations';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'archives';
    return 'other';
  }

  private async updateFolderHierarchy(folderId: string, newParentId: string | null, newPath: string, newLevel: number): Promise<void> {
    // Update the folder itself
    await this.prisma.mediaFolder.update({
      where: { id: folderId },
      data: {
        parentId: newParentId,
        path: newPath,
        level: newLevel
      }
    });

    // Update all descendants
    const descendants = await this.getFolderDescendants(folderId);
    for (const descendant of descendants) {
      const descendantPath = newPath + '/' + descendant.slug;
      const descendantLevel = newLevel + (descendant.level - newLevel + 1);
      
      await this.prisma.mediaFolder.update({
        where: { id: descendant.id },
        data: {
          path: descendantPath,
          level: descendantLevel
        }
      });
    }
  }

  private buildFolderTree(folder: any, depth: number): FolderTree {
    return {
      folder: {
        ...folder,
        stats: {
          fileCount: folder._count.files,
          totalSize: 0, // Will be calculated separately
          lastActivity: folder.updatedAt,
          mostUsedFileType: 'image' // Will be calculated separately
        }
      },
      children: folder.children?.map(child => 
        this.buildFolderTree(child, depth + 1)
      ) || [],
      depth,
      hasChildren: (folder.children?.length || 0) > 0,
      isExpanded: depth < 2, // Auto-expand first 2 levels
      isSelected: false
    };
  }
}

interface CreateFolderData {
  name: string;
  description?: string;
  parent?: string;
  type?: 'system' | 'user' | 'shared';
  visibility?: 'public' | 'private' | 'restricted';
  permissions?: FolderPermissions;
  settings?: FolderSettings;
  metadata?: any;
  createdBy: string;
}

interface BulkMoveResult {
  success: string[];
  failed: { fileId: string; error: string }[];
  total: number;
}

interface FolderAnalytics {
  folder: MediaFolder;
  timeRange: DateRange;
  overview: {
    totalFiles: number;
    totalSize: number;
    averageFileSize: number;
    fileTypes: Record<string, number>;
    uploadTrend: TrendData;
    accessTrend: TrendData;
  };
  usage: FolderUsage;
  trends: FolderTrends;
  topFiles: MediaFile[];
  insights: FolderInsight[];
}

interface OrganizationStrategy {
  type: 'by_file_type' | 'by_date' | 'by_size' | 'by_ai_content';
  options: Record<string, any>;
  userId: string;
}

interface OrganizationResult {
  foldersCreated: string[];
  filesMoved: string[];
  errors: { fileId: string; error: string }[];
}
```

### **2. 🔐 Folder Permissions System**

#### **Advanced Permission Management:**
```typescript
export class FolderPermissionService {
  async setFolderPermissions(folderId: string, permissions: FolderPermissions, userId: string): Promise<void> {
    // Check if user can modify permissions
    const canManage = await this.checkFolderPermission(folderId, userId, 'admin');
    if (!canManage) {
      throw new Error('Insufficient permissions to modify folder permissions');
    }

    // Update folder permissions
    await this.prisma.mediaFolder.update({
      where: { id: folderId },
      data: { permissions }
    });

    // Apply inheritance to subfolders if enabled
    if (permissions.inheritance.enabled) {
      await this.applyPermissionInheritance(folderId, permissions);
    }

    // Log permission change
    await this.logFolderActivity('permissions_changed', folderId, userId, { permissions });
  }

  async checkFolderAccess(folderId: string, userId: string, action: 'read' | 'write' | 'admin'): Promise<boolean> {
    const folder = await this.getFolder(folderId);
    if (!folder) {
      return false;
    }

    // Owner always has full access
    if (folder.createdBy === userId) {
      return true;
    }

    // Check explicit permissions
    const permissions = folder.permissions;

    // Check admin permissions
    if (action === 'admin' && permissions.owner === userId) {
      return true;
    }

    // Check write permissions
    if (action === 'write' && (permissions.editors.includes(userId) || permissions.owner === userId)) {
      return true;
    }

    // Check read permissions
    if (action === 'read' && (
      permissions.viewers.includes(userId) || 
      permissions.editors.includes(userId) || 
      permissions.owner === userId
    )) {
      return true;
    }

    // Check group permissions
    const userGroups = await this.getUserGroups(userId);
    for (const groupId of userGroups) {
      const groupPermission = permissions.groups[groupId];
      if (groupPermission) {
        if (action === 'read' && ['read', 'write', 'admin'].includes(groupPermission)) {
          return true;
        }
        if (action === 'write' && ['write', 'admin'].includes(groupPermission)) {
          return true;
        }
        if (action === 'admin' && groupPermission === 'admin') {
          return true;
        }
      }
    }

    // Check public permissions
    if (folder.visibility === 'public') {
      if (action === 'read' && permissions.public.canView) {
        return true;
      }
      if (action === 'write' && permissions.public.canUpload) {
        return true;
      }
    }

    // Check inherited permissions from parent
    if (permissions.inheritance.enabled && folder.parentId) {
      return this.checkFolderAccess(folder.parentId, userId, action);
    }

    return false;
  }

  async shareFolder(folderId: string, shareData: FolderShareData): Promise<FolderShare> {
    const folder = await this.getFolder(folderId);
    if (!folder) {
      throw new Error('Folder not found');
    }

    // Check permissions
    const canShare = await this.checkFolderPermission(folderId, shareData.sharedBy, 'admin');
    if (!canShare) {
      throw new Error('Insufficient permissions to share folder');
    }

    // Create share record
    const share = await this.prisma.folderShare.create({
      data: {
        folderId,
        sharedBy: shareData.sharedBy,
        sharedWith: shareData.sharedWith,
        permission: shareData.permission,
        expiresAt: shareData.expiresAt,
        message: shareData.message,
        allowDownload: shareData.allowDownload,
        allowUpload: shareData.allowUpload,
        token: this.generateShareToken()
      }
    });

    // Send notification to shared user
    if (shareData.sendNotification) {
      await this.sendShareNotification(share);
    }

    // Update folder permissions
    await this.addUserToFolderPermissions(folderId, shareData.sharedWith, shareData.permission);

    return share;
  }

  async createPublicLink(folderId: string, linkData: PublicLinkData): Promise<PublicFolderLink> {
    const folder = await this.getFolder(folderId);
    if (!folder) {
      throw new Error('Folder not found');
    }

    // Check permissions
    const canCreateLink = await this.checkFolderPermission(folderId, linkData.createdBy, 'admin');
    if (!canCreateLink) {
      throw new Error('Insufficient permissions to create public link');
    }

    // Create public link
    const link = await this.prisma.publicFolderLink.create({
      data: {
        folderId,
        name: linkData.name,
        description: linkData.description,
        token: this.generatePublicToken(),
        password: linkData.password ? await this.hashPassword(linkData.password) : null,
        expiresAt: linkData.expiresAt,
        maxViews: linkData.maxViews,
        allowDownload: linkData.allowDownload,
        allowUpload: linkData.allowUpload,
        createdBy: linkData.createdBy
      }
    });

    return link;
  }

  async getFolderShares(folderId: string): Promise<FolderShare[]> {
    return this.prisma.folderShare.findMany({
      where: { folderId },
      include: {
        sharedByUser: { select: { id: true, name: true, email: true } },
        sharedWithUser: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async revokeFolderAccess(folderId: string, userId: string, revokedBy: string): Promise<void> {
    // Check permissions
    const canRevoke = await this.checkFolderPermission(folderId, revokedBy, 'admin');
    if (!canRevoke) {
      throw new Error('Insufficient permissions to revoke access');
    }

    // Remove user from folder permissions
    await this.removeUserFromFolderPermissions(folderId, userId);

    // Remove active shares
    await this.prisma.folderShare.deleteMany({
      where: {
        folderId,
        sharedWith: userId
      }
    });

    // Log activity
    await this.logFolderActivity('access_revoked', folderId, revokedBy, { revokedUser: userId });
  }

  private async applyPermissionInheritance(folderId: string, permissions: FolderPermissions): Promise<void> {
    const children = await this.getFolderChildren(folderId);
    
    for (const child of children) {
      // Skip if child has override permissions
      if (child.permissions.inheritance.override.length > 0) {
        continue;
      }

      // Apply parent permissions
      const inheritedPermissions = {
        ...permissions,
        owner: child.permissions.owner, // Keep original owner
        inheritance: child.permissions.inheritance // Keep inheritance settings
      };

      await this.prisma.mediaFolder.update({
        where: { id: child.id },
        data: { permissions: inheritedPermissions }
      });

      // Recursively apply to grandchildren
      await this.applyPermissionInheritance(child.id, inheritedPermissions);
    }
  }

  private generateShareToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generatePublicToken(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}

interface FolderShareData {
  sharedBy: string;
  sharedWith: string;
  permission: 'read' | 'write';
  expiresAt?: Date;
  message?: string;
  allowDownload: boolean;
  allowUpload: boolean;
  sendNotification: boolean;
}

interface PublicLinkData {
  name: string;
  description?: string;
  password?: string;
  expiresAt?: Date;
  maxViews?: number;
  allowDownload: boolean;
  allowUpload: boolean;
  createdBy: string;
}

interface FolderShare {
  id: string;
  folderId: string;
  sharedBy: string;
  sharedWith: string;
  permission: string;
  token: string;
  expiresAt?: Date;
  message?: string;
  allowDownload: boolean;
  allowUpload: boolean;
  createdAt: Date;
}

interface PublicFolderLink {
  id: string;
  folderId: string;
  name: string;
  description?: string;
  token: string;
  password?: string;
  expiresAt?: Date;
  maxViews?: number;
  viewCount: number;
  allowDownload: boolean;
  allowUpload: boolean;
  createdBy: string;
  createdAt: Date;
}
```

### **3. 📊 Folder Analytics & Insights**

#### **Comprehensive Folder Analytics:**
```typescript
export class FolderAnalyticsService {
  async getFolderInsights(folderId: string, timeRange: DateRange): Promise<FolderInsights> {
    const folder = await this.getFolder(folderId);
    if (!folder) {
      throw new Error('Folder not found');
    }

    const analytics = await this.calculateFolderAnalytics(folderId, timeRange);
    const usage = await this.getFolderUsagePatterns(folderId, timeRange);
    const optimization = await this.analyzeFolderOptimization(folderId);

    return {
      folder,
      timeRange,
      overview: {
        totalFiles: analytics.fileCount,
        totalSize: analytics.totalSize,
        averageFileSize: analytics.averageFileSize,
        growthRate: analytics.growthRate,
        activityScore: analytics.activityScore
      },
      usage,
      optimization,
      recommendations: await this.generateFolderRecommendations(analytics, usage, optimization),
      trends: await this.calculateFolderTrends(folderId, timeRange)
    };
  }

  async getFolderHeatmap(folderId: string, timeRange: DateRange): Promise<FolderHeatmap> {
    const activities = await this.getFolderActivities(folderId, timeRange);
    const timeSlots = this.generateTimeSlots(timeRange, 'day');
    
    const heatmapData: HeatmapCell[][] = [];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    for (const hour of hours) {
      const hourRow: HeatmapCell[] = [];
      
      for (const timeSlot of timeSlots) {
        const activity = activities.filter(a => 
          a.timestamp.getHours() === hour &&
          a.timestamp >= timeSlot.start && a.timestamp <= timeSlot.end
        ).length;

        hourRow.push({
          hour,
          date: timeSlot.start,
          activity,
          intensity: this.calculateIntensity(activity, activities.length)
        });
      }
      
      heatmapData.push(hourRow);
    }

    return {
      folderId,
      timeRange,
      data: heatmapData,
      maxActivity: Math.max(...heatmapData.flat().map(c => c.activity)),
      insights: this.generateHeatmapInsights(heatmapData)
    };
  }

  async getFolderStorageAnalysis(folderId: string): Promise<StorageAnalysis> {
    const folder = await this.getFolderWithFiles(folderId);
    if (!folder) {
      throw new Error('Folder not found');
    }

    const analysis = await this.analyzeStorageUsage(folder);
    const duplicates = await this.findDuplicateFiles(folder);
    const optimization = await this.calculateStorageOptimization(folder);

    return {
      folderId,
      totalSize: analysis.totalSize,
      fileCount: analysis.fileCount,
      breakdown: {
        byFileType: analysis.fileTypeBreakdown,
        bySize: analysis.sizeDistribution,
        byAge: analysis.ageDistribution
      },
      duplicates: {
        count: duplicates.length,
        totalSize: duplicates.reduce((sum, d) => sum + d.size, 0),
        files: duplicates
      },
      optimization: {
        potentialSavings: optimization.potentialSavings,
        recommendations: optimization.recommendations,
        compressionOpportunities: optimization.compressionOpportunities
      },
      trends: await this.calculateStorageTrends(folderId)
    };
  }

  async generateFolderReport(folderId: string, reportType: FolderReportType): Promise<FolderReport> {
    const folder = await this.getFolder(folderId);
    if (!folder) {
      throw new Error('Folder not found');
    }

    let reportData: any;

    switch (reportType) {
      case 'usage':
        reportData = await this.generateUsageReport(folderId);
        break;
      case 'storage':
        reportData = await this.generateStorageReport(folderId);
        break;
      case 'activity':
        reportData = await this.generateActivityReport(folderId);
        break;
      case 'permissions':
        reportData = await this.generatePermissionsReport(folderId);
        break;
      case 'comprehensive':
        reportData = await this.generateComprehensiveReport(folderId);
        break;
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }

    return {
      id: this.generateReportId(),
      folderId,
      type: reportType,
      data: reportData,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
  }

  private async calculateFolderOptimization(folderId: string): Promise<FolderOptimization> {
    const folder = await this.getFolderWithFiles(folderId);
    const optimizations: OptimizationOpportunity[] = [];

    // Check for large files that could be compressed
    const largeFiles = folder.files.filter(f => f.size > 10 * 1024 * 1024); // > 10MB
    if (largeFiles.length > 0) {
      optimizations.push({
        type: 'compression',
        priority: 'medium',
        description: `${largeFiles.length} large files could be compressed`,
        potentialSaving: largeFiles.reduce((sum, f) => sum + f.size * 0.3, 0), // Estimated 30% compression
        affectedFiles: largeFiles.map(f => f.id)
      });
    }

    // Check for unused files
    const unusedFiles = await this.findUnusedFiles(folder.files);
    if (unusedFiles.length > 0) {
      optimizations.push({
        type: 'cleanup',
        priority: 'low',
        description: `${unusedFiles.length} files haven't been accessed in 6+ months`,
        potentialSaving: unusedFiles.reduce((sum, f) => sum + f.size, 0),
        affectedFiles: unusedFiles.map(f => f.id)
      });
    }

    // Check for duplicate files
    const duplicates = await this.findDuplicateFiles(folder);
    if (duplicates.length > 0) {
      optimizations.push({
        type: 'deduplication',
        priority: 'high',
        description: `${duplicates.length} duplicate files found`,
        potentialSaving: duplicates.reduce((sum, d) => sum + d.size, 0),
        affectedFiles: duplicates.map(d => d.id)
      });
    }

    const totalPotentialSaving = optimizations.reduce((sum, o) => sum + o.potentialSaving, 0);
    const optimizationScore = Math.min(100, (totalPotentialSaving / folder.stats.totalSize) * 100);

    return {
      score: 100 - optimizationScore, // Higher score = less optimization needed
      opportunities: optimizations,
      potentialSaving: totalPotentialSaving,
      recommendations: this.generateOptimizationRecommendations(optimizations)
    };
  }

  private async generateFolderRecommendations(
    analytics: any, 
    usage: any, 
    optimization: FolderOptimization
  ): Promise<FolderRecommendation[]> {
    const recommendations: FolderRecommendation[] = [];

    // Storage optimization recommendations
    if (optimization.score < 70) {
      recommendations.push({
        type: 'storage_optimization',
        priority: 'high',
        title: 'Optimize folder storage',
        description: `This folder could save ${this.formatFileSize(optimization.potentialSaving)} through optimization`,
        actions: optimization.recommendations
      });
    }

    // Organization recommendations
    if (analytics.fileCount > 100 && analytics.subfolderCount === 0) {
      recommendations.push({
        type: 'organization',
        priority: 'medium',
        title: 'Consider organizing files into subfolders',
        description: 'Large folders are easier to navigate when organized into categories',
        actions: ['Create subfolders by file type', 'Create subfolders by date', 'Use auto-organization']
      });
    }

    // Permission recommendations
    if (usage.accessPatterns.uniqueUsers > 10 && !usage.hasGroupPermissions) {
      recommendations.push({
        type: 'permissions',
        priority: 'medium',
        title: 'Consider using group permissions',
        description: 'Managing permissions through groups is more efficient for shared folders',
        actions: ['Create user groups', 'Set group-based permissions', 'Enable permission inheritance']
      });
    }

    return recommendations;
  }
}

interface FolderInsights {
  folder: MediaFolder;
  timeRange: DateRange;
  overview: {
    totalFiles: number;
    totalSize: number;
    averageFileSize: number;
    growthRate: number;
    activityScore: number;
  };
  usage: FolderUsagePatterns;
  optimization: FolderOptimization;
  recommendations: FolderRecommendation[];
  trends: FolderTrends;
}

interface FolderHeatmap {
  folderId: string;
  timeRange: DateRange;
  data: HeatmapCell[][];
  maxActivity: number;
  insights: HeatmapInsight[];
}

interface HeatmapCell {
  hour: number;
  date: Date;
  activity: number;
  intensity: number; // 0-1
}

interface StorageAnalysis {
  folderId: string;
  totalSize: number;
  fileCount: number;
  breakdown: {
    byFileType: Record<string, number>;
    bySize: Record<string, number>;
    byAge: Record<string, number>;
  };
  duplicates: {
    count: number;
    totalSize: number;
    files: DuplicateFile[];
  };
  optimization: {
    potentialSavings: number;
    recommendations: string[];
    compressionOpportunities: CompressionOpportunity[];
  };
  trends: StorageTrends;
}

interface FolderOptimization {
  score: number; // 0-100
  opportunities: OptimizationOpportunity[];
  potentialSaving: number;
  recommendations: string[];
}

interface OptimizationOpportunity {
  type: 'compression' | 'cleanup' | 'deduplication' | 'organization';
  priority: 'low' | 'medium' | 'high';
  description: string;
  potentialSaving: number;
  affectedFiles: string[];
}

interface FolderRecommendation {
  type: 'storage_optimization' | 'organization' | 'permissions' | 'security';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actions: string[];
}

type FolderReportType = 'usage' | 'storage' | 'activity' | 'permissions' | 'comprehensive';

interface FolderReport {
  id: string;
  folderId: string;
  type: FolderReportType;
  data: any;
  generatedAt: Date;
  expiresAt: Date;
}
```

---

## 🎨 **Folders Interface**

### **Folder Tree Navigation:**
```
┌─────────────────────────────────────────────────────────┐
│ 📁 Media Folders                      [New Folder] [Organize] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Folder Tree ──────────────────────────────────────┐   │
│ │ 📂 Root                                            │   │
│ │   ├─ 📁 Images (1,234 files • 2.5GB)              │   │
│ │   │   ├─ 📁 Photos (856 files • 1.8GB)            │   │
│ │   │   │   ├─ 📁 2024 (234 files • 456MB)          │   │
│ │   │   │   ├─ 📁 2023 (345 files • 678MB)          │   │
│ │   │   │   └─ 📁 Archive (277 files • 666MB)       │   │
│ │   │   ├─ 📁 Graphics (234 files • 345MB)          │   │
│ │   │   └─ 📁 Icons (144 files • 23MB)              │   │
│ │   ├─ 📁 Videos (89 files • 15.6GB)                │   │
│ │   │   ├─ 📁 Tutorials (45 files • 8.2GB)          │   │
│ │   │   └─ 📁 Marketing (44 files • 7.4GB)          │   │
│ │   ├─ 📁 Documents (567 files • 1.2GB)             │   │
│ │   │   ├─ 📁 PDFs (234 files • 567MB)              │   │
│ │   │   └─ 📁 Presentations (333 files • 633MB)     │   │
│ │   └─ 📁 Audio (123 files • 890MB)                 │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Selected Folder: Images ──────────────────────────┐   │
│ │ 📊 1,234 files • 2.5GB • Last updated: 2 hours ago│   │
│ │ 👥 Shared with 5 users • 🔒 Private folder         │   │
│ │                                                   │   │
│ │ Quick Actions:                                     │   │
│ │ [📤 Upload] [📁 New Subfolder] [🔗 Share]         │   │
│ │ [⚙️ Settings] [📊 Analytics] [🗂️ Organize]        │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Folder Analytics Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Folder Analytics: Images            [Export] [Share] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Storage Overview ─────────────────────────────────┐   │
│ │ 💾 Total Size: 2.5GB (+15.2% this month)          │   │
│ │ 📄 File Count: 1,234 (+89 new files)              │   │
│ │ 📈 Growth Rate: +12.5% monthly                     │   │
│ │ ⚡ Activity Score: 78/100 (Very Active)           │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ File Type Breakdown ──┐ ┌─ Access Patterns ────────┐ │
│ │ 📸 JPEG: 45.2% (567MB) │ │ Peak Hours: 9-11 AM      │ │
│ │ 🖼️ PNG: 32.1% (402MB)  │ │ Most Active Day: Wed     │ │
│ │ 🎨 WebP: 15.8% (198MB) │ │ Unique Users: 23         │ │
│ │ 🔍 SVG: 6.9% (86MB)    │ │ Avg Session: 15 min      │ │
│ └─────────────────────────┘ └───────────────────────────┘ │
│                                                         │
│ ┌─ Activity Heatmap ─────────────────────────────────┐   │
│ │      Mon  Tue  Wed  Thu  Fri  Sat  Sun            │   │
│ │ 00h  ░░░  ░░░  ░░░  ░░░  ░░░  ░░░  ░░░            │   │
│ │ 06h  ░▓░  ░▓░  ░██  ░▓░  ░▓░  ░░░  ░░░            │   │
│ │ 12h  ░██  ░██  ░██  ░██  ░██  ░▓░  ░░░            │   │
│ │ 18h  ░▓░  ░▓░  ░██  ░▓░  ░▓░  ░▓░  ░░░            │   │
│ │                                                   │   │
│ │ ░ Low   ▓ Medium   █ High Activity                │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Optimization Opportunities ───────────────────────┐   │
│ │ 💡 Potential Savings: 756MB (30.2%)               │   │
│ │ • 89 duplicate files (234MB)                      │   │
│ │ • 156 files can be compressed (522MB)             │   │
│ │ • 23 unused files (67MB)                          │   │
│ │                                                   │   │
│ │ [🔧 Auto-Optimize] [📋 View Details]              │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Folder management
GET    /api/media/folders                 // List folders
POST   /api/media/folders                 // Create folder
GET    /api/media/folders/{id}            // Get folder details
PUT    /api/media/folders/{id}            // Update folder
DELETE /api/media/folders/{id}            // Delete folder

// Folder hierarchy
GET    /api/media/folders/tree            // Get folder tree
POST   /api/media/folders/{id}/move       // Move folder
POST   /api/media/folders/bulk-move       // Bulk move files
POST   /api/media/folders/{id}/duplicate  // Duplicate folder

// Folder permissions
GET    /api/media/folders/{id}/permissions // Get permissions
PUT    /api/media/folders/{id}/permissions // Set permissions
POST   /api/media/folders/{id}/share      // Share folder
GET    /api/media/folders/{id}/shares     // List shares
DELETE /api/media/folders/shares/{id}     // Revoke share

// Folder analytics
GET    /api/media/folders/{id}/analytics  // Folder analytics
GET    /api/media/folders/{id}/insights   // Folder insights
GET    /api/media/folders/{id}/heatmap    // Activity heatmap
POST   /api/media/folders/{id}/report     // Generate report

// Folder organization
POST   /api/media/folders/{id}/organize   // Auto-organize folder
GET    /api/media/folders/{id}/duplicates // Find duplicates
POST   /api/media/folders/{id}/optimize   // Optimize storage
```

### **Database Schema:**
```sql
-- Media folders
CREATE TABLE media_folders (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES media_folders(id) ON DELETE CASCADE,
  path VARCHAR(1000) NOT NULL,
  level INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  type VARCHAR(20) DEFAULT 'user',
  visibility VARCHAR(20) DEFAULT 'private',
  permissions JSONB NOT NULL,
  settings JSONB NOT NULL,
  metadata JSONB,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(parent_id, slug)
);

-- Folder shares
CREATE TABLE folder_shares (
  id UUID PRIMARY KEY,
  folder_id UUID REFERENCES media_folders(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES users(id) ON DELETE CASCADE,
  permission VARCHAR(20) NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP,
  message TEXT,
  allow_download BOOLEAN DEFAULT true,
  allow_upload BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Public folder links
CREATE TABLE public_folder_links (
  id UUID PRIMARY KEY,
  folder_id UUID REFERENCES media_folders(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  token VARCHAR(32) NOT NULL UNIQUE,
  password VARCHAR(255),
  expires_at TIMESTAMP,
  max_views INTEGER,
  view_count INTEGER DEFAULT 0,
  allow_download BOOLEAN DEFAULT true,
  allow_upload BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Folder activities
CREATE TABLE folder_activities (
  id UUID PRIMARY KEY,
  folder_id UUID REFERENCES media_folders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  activity_type VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Folder analytics
CREATE TABLE folder_analytics (
  id UUID PRIMARY KEY,
  folder_id UUID REFERENCES media_folders(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  file_count INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,
  upload_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  access_count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(folder_id, date)
);

-- Indexes for performance
CREATE INDEX idx_media_folders_parent ON media_folders(parent_id);
CREATE INDEX idx_media_folders_path ON media_folders(path);
CREATE INDEX idx_media_folders_created_by ON media_folders(created_by);
CREATE INDEX idx_folder_shares_folder ON folder_shares(folder_id);
CREATE INDEX idx_folder_shares_token ON folder_shares(token);
CREATE INDEX idx_public_folder_links_token ON public_folder_links(token);
CREATE INDEX idx_folder_activities_folder ON folder_activities(folder_id);
CREATE INDEX idx_folder_analytics_folder_date ON folder_analytics(folder_id, date);
```

---

## 🔗 **Related Documentation**

- **[Media Library](./library.md)** - File management integration
- **[Media Upload](./upload.md)** - Upload to specific folders
- **[Media Analytics](./analytics.md)** - Folder performance tracking
- **[User Management](../05_users/)** - Folder permissions and sharing

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
