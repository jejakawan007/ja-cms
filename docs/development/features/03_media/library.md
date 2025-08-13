# 📁 Media Library System

> **Sistem Perpustakaan Media Digital JA-CMS**  
> Comprehensive media management with advanced organization and processing

---

## 📋 **Deskripsi**

Media Library System adalah pusat pengelolaan semua aset digital dalam JA-CMS. Sistem ini menyediakan interface yang intuitif untuk mengorganisir, mencari, dan mengelola file media dengan dukungan folder hierarkis, tagging system, dan processing otomatis.

---

## ⭐ **Core Features**

### **1. 📁 File Management System**

#### **Media File Structure:**
```typescript
interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number; // for videos/audio
  url: string;
  thumbnailUrl?: string;
  alt: string;
  title: string;
  description: string;
  caption: string;
  folder: MediaFolder;
  tags: MediaTag[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  uploadedAt: Date;
  lastModified: Date;
  downloadCount: number;
  isPublic: boolean;
  metadata: Record<string, any>;
  processing: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    thumbnails: ThumbnailVariant[];
    optimized: boolean;
    cdnSynced: boolean;
  };
}

interface MediaFolder {
  id: string;
  name: string;
  path: string;
  parent?: MediaFolder;
  children: MediaFolder[];
  description: string;
  tags: string[];
  permissions: {
    read: string[];
    write: string[];
    delete: string[];
  };
  fileCount: number;
  totalSize: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ThumbnailVariant {
  size: string; // e.g., "150x150"
  url: string;
  width: number;
  height: number;
  format: 'jpeg' | 'webp' | 'png';
}
```

#### **Supported File Types:**
- **Images**: JPEG, PNG, WebP, SVG, GIF, BMP, TIFF, AVIF
- **Videos**: MP4, WebM, AVI, MOV, WMV, FLV, MKV
- **Audio**: MP3, WAV, OGG, AAC, FLAC, M4A
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
- **Archives**: ZIP, RAR, 7Z, TAR, GZ
- **Code**: JSON, XML, CSV, JS, TS, CSS, HTML

### **2. 🗂️ Advanced Organization**

#### **Hierarchical Folder System:**
```typescript
// Folder management service
export class MediaFolderService {
  async createFolder(data: CreateFolderRequest): Promise<MediaFolder> {
    const folder = await this.prisma.mediaFolder.create({
      data: {
        name: data.name,
        path: this.generatePath(data.parentId, data.name),
        parentId: data.parentId,
        description: data.description,
        permissions: data.permissions || this.getDefaultPermissions(),
        createdBy: data.userId
      },
      include: {
        parent: true,
        children: true,
        files: {
          select: { id: true, size: true }
        }
      }
    });

    // Update parent folder stats
    if (data.parentId) {
      await this.updateFolderStats(data.parentId);
    }

    return folder;
  }

  async moveFolder(folderId: string, newParentId: string): Promise<MediaFolder> {
    const folder = await this.getFolderById(folderId);
    const newParent = newParentId ? await this.getFolderById(newParentId) : null;

    // Validate move (prevent circular references)
    if (newParent && await this.isDescendant(newParent.id, folderId)) {
      throw new Error('Cannot move folder to its own descendant');
    }

    // Update folder path and all descendant paths
    const newPath = this.generatePath(newParentId, folder.name);
    await this.updateFolderPaths(folderId, folder.path, newPath);

    return this.prisma.mediaFolder.update({
      where: { id: folderId },
      data: { 
        parentId: newParentId,
        path: newPath 
      },
      include: {
        parent: true,
        children: true
      }
    });
  }

  private generatePath(parentId: string | null, name: string): string {
    if (!parentId) return `/${name}`;
    
    const parent = await this.getFolderById(parentId);
    return `${parent.path}/${name}`;
  }
}
```

### **3. 🔍 Advanced Search & Filtering**

#### **Search Implementation:**
```typescript
export class MediaSearchService {
  async searchMedia(query: MediaSearchQuery): Promise<MediaSearchResult> {
    const {
      text,
      fileTypes,
      sizeRange,
      dateRange,
      tags,
      folderId,
      authorId,
      dimensions,
      sortBy = 'uploadedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 24
    } = query;

    let whereClause: any = {};

    // Text search (filename, title, description, alt text)
    if (text) {
      whereClause.OR = [
        { filename: { contains: text, mode: 'insensitive' } },
        { title: { contains: text, mode: 'insensitive' } },
        { description: { contains: text, mode: 'insensitive' } },
        { alt: { contains: text, mode: 'insensitive' } },
        { caption: { contains: text, mode: 'insensitive' } }
      ];
    }

    // File type filtering
    if (fileTypes && fileTypes.length > 0) {
      whereClause.mimeType = {
        in: fileTypes.map(type => this.getMimeTypesForCategory(type)).flat()
      };
    }

    // Size range filtering
    if (sizeRange) {
      whereClause.size = {
        gte: sizeRange.min,
        lte: sizeRange.max
      };
    }

    // Date range filtering
    if (dateRange) {
      whereClause.uploadedAt = {
        gte: dateRange.start,
        lte: dateRange.end
      };
    }

    // Tag filtering
    if (tags && tags.length > 0) {
      whereClause.tags = {
        some: {
          tag: {
            name: { in: tags }
          }
        }
      };
    }

    // Folder filtering
    if (folderId) {
      if (folderId === 'root') {
        whereClause.folderId = null;
      } else {
        // Include subfolders
        const folderPaths = await this.getFolderAndDescendantPaths(folderId);
        whereClause.folder = {
          path: { in: folderPaths }
        };
      }
    }

    // Author filtering
    if (authorId) {
      whereClause.authorId = authorId;
    }

    // Dimension filtering (for images/videos)
    if (dimensions) {
      whereClause.AND = [
        { width: { gte: dimensions.minWidth } },
        { width: { lte: dimensions.maxWidth } },
        { height: { gte: dimensions.minHeight } },
        { height: { lte: dimensions.maxHeight } }
      ];
    }

    // Execute search with pagination
    const [files, total] = await Promise.all([
      this.prisma.mediaFile.findMany({
        where: whereClause,
        include: {
          folder: true,
          tags: {
            include: { tag: true }
          },
          author: {
            select: { id: true, name: true, avatar: true }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.mediaFile.count({ where: whereClause })
    ]);

    return {
      files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      facets: await this.generateSearchFacets(whereClause)
    };
  }

  private getMimeTypesForCategory(category: string): string[] {
    const mimeTypes = {
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
      video: ['video/mp4', 'video/webm', 'video/avi', 'video/mov'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac'],
      document: ['application/pdf', 'application/msword', 'text/plain'],
      archive: ['application/zip', 'application/x-rar-compressed']
    };
    
    return mimeTypes[category] || [];
  }

  private async generateSearchFacets(baseWhere: any): Promise<SearchFacets> {
    // Generate facets for file types, sizes, authors, etc.
    const [fileTypes, authors, folders] = await Promise.all([
      this.getFileTypeFacets(baseWhere),
      this.getAuthorFacets(baseWhere),
      this.getFolderFacets(baseWhere)
    ]);

    return { fileTypes, authors, folders };
  }
}
```

### **4. 🎨 Bulk Operations**

#### **Bulk Actions Implementation:**
```typescript
export class MediaBulkService {
  async executeBulkAction(action: BulkAction, fileIds: string[], userId: string): Promise<BulkActionResult> {
    // Validate permissions
    const files = await this.validateBulkPermissions(fileIds, userId, action.type);
    
    const results: BulkActionResult = {
      success: [],
      failed: [],
      total: fileIds.length
    };

    switch (action.type) {
      case 'move':
        return this.bulkMove(files, action.targetFolderId, results);
      case 'delete':
        return this.bulkDelete(files, results);
      case 'tag':
        return this.bulkTag(files, action.tags, results);
      case 'untag':
        return this.bulkUntag(files, action.tags, results);
      case 'download':
        return this.bulkDownload(files, results);
      case 'optimize':
        return this.bulkOptimize(files, results);
      default:
        throw new Error(`Unsupported bulk action: ${action.type}`);
    }
  }

  private async bulkMove(files: MediaFile[], targetFolderId: string, results: BulkActionResult): Promise<BulkActionResult> {
    for (const file of files) {
      try {
        await this.prisma.mediaFile.update({
          where: { id: file.id },
          data: { folderId: targetFolderId }
        });

        results.success.push({
          id: file.id,
          filename: file.filename,
          message: 'Moved successfully'
        });
      } catch (error) {
        results.failed.push({
          id: file.id,
          filename: file.filename,
          error: error.message
        });
      }
    }

    // Update folder statistics
    await this.updateFolderStats(targetFolderId);
    
    return results;
  }

  private async bulkTag(files: MediaFile[], tags: string[], results: BulkActionResult): Promise<BulkActionResult> {
    // Ensure tags exist
    const tagRecords = await this.ensureTagsExist(tags);
    
    for (const file of files) {
      try {
        await this.prisma.mediaFile.update({
          where: { id: file.id },
          data: {
            tags: {
              connectOrCreate: tagRecords.map(tag => ({
                where: {
                  fileId_tagId: {
                    fileId: file.id,
                    tagId: tag.id
                  }
                },
                create: {
                  tagId: tag.id
                }
              }))
            }
          }
        });

        results.success.push({
          id: file.id,
          filename: file.filename,
          message: `Tagged with: ${tags.join(', ')}`
        });
      } catch (error) {
        results.failed.push({
          id: file.id,
          filename: file.filename,
          error: error.message
        });
      }
    }

    return results;
  }

  private async bulkDownload(files: MediaFile[], results: BulkActionResult): Promise<BulkActionResult> {
    // Create ZIP archive for bulk download
    const archiveName = `media-export-${Date.now()}.zip`;
    const archivePath = path.join(this.tempDir, archiveName);
    
    const archive = archiver('zip', { zlib: { level: 9 } });
    const output = fs.createWriteStream(archivePath);
    
    archive.pipe(output);

    for (const file of files) {
      try {
        const filePath = this.getFilePath(file);
        const fileName = this.sanitizeFilename(file.originalName);
        
        archive.file(filePath, { name: fileName });
        
        results.success.push({
          id: file.id,
          filename: file.filename,
          message: 'Added to archive'
        });
      } catch (error) {
        results.failed.push({
          id: file.id,
          filename: file.filename,
          error: error.message
        });
      }
    }

    await archive.finalize();

    // Return download URL
    results.downloadUrl = `/api/media/bulk-download/${archiveName}`;
    
    return results;
  }
}
```

---

## 🎨 **Media Library Interface**

### **Main Library View:**
```
┌─────────────────────────────────────────────────────────┐
│ 📁 Media Library                    [Upload] [New Folder] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Sidebar ──────────┐ ┌─ Main Content ──────────────┐  │
│ │ 📁 All Files       │ │ [Search media...] [Grid▼]   │  │
│ │ 📂 Images (1,234)  │ │ [Type▼] [Size▼] [Date▼]     │  │
│ │ │  └─ Blog (456)   │ │                              │  │
│ │ │  └─ Products     │ │ ┌───┐ ┌───┐ ┌───┐ ┌───┐     │  │
│ │ 📂 Videos (89)     │ │ │IMG│ │VID│ │PDF│ │IMG│     │  │
│ │ 📂 Documents (234) │ │ │ ✓ │ │   │ │   │ │   │     │  │
│ │ 📂 Audio (45)      │ │ └───┘ └───┘ └───┘ └───┘     │  │
│ │ 🗑️ Trash (12)      │ │ ┌───┐ ┌───┐ ┌───┐ ┌───┐     │  │
│ │                    │ │ │DOC│ │IMG│ │ZIP│ │AUD│     │  │
│ │ 🏷️ Tags            │ │ │   │ │ ✓ │ │   │ │   │     │  │
│ │ • design (89)      │ │ └───┘ └───┘ └───┘ └───┘     │  │
│ │ • hero (34)        │ │                              │  │
│ │ • product (156)    │ │ Selected: 2 files            │  │
│ │ • blog (67)        │ │ [Move] [Tag] [Delete] [↓]    │  │
│ └────────────────────┘ └──────────────────────────────┘  │
│ Showing 1-20 of 1,234 files                [1][2][3]... │
└─────────────────────────────────────────────────────────┘
```

### **File Details Modal:**
```
┌─ File Details ──────────────────────────────────────────┐
│ 🖼️ hero-image.jpg                          [✕]         │
├─────────────────────────────────────────────────────────┤
│ ┌─ Preview ──────────────┐ ┌─ Information ──────────┐   │
│ │                        │ │ 📊 File Details         │   │
│ │    [Large Preview]     │ │ Size: 2.4 MB           │   │
│ │                        │ │ Dimensions: 1920x1080   │   │
│ │                        │ │ Type: JPEG Image        │   │
│ └────────────────────────┘ │ Created: Jan 9, 2024    │   │
│                            │ Modified: Jan 9, 2024   │   │
│ ┌─ Metadata ─────────────┐ │ Author: John Doe        │   │
│ │ Title: [____________]  │ │ Downloads: 23           │   │
│ │ Alt: [_____________]   │ │ Views: 156              │   │
│ │ Caption: [__________]  │ │                         │   │
│ │ Description:           │ │ 🗂️ Location             │   │
│ │ [________________]     │ │ /images/blog/           │   │
│ │                        │ │                         │   │
│ │ 🏷️ Tags:               │ │ 🔗 URLs                 │   │
│ │ [design] [hero] [blog] │ │ Original: [Copy URL]    │   │
│ │ [+ Add Tag]            │ │ Thumbnail: [Copy URL]   │   │
│ └────────────────────────┘ │ WebP: [Copy URL]        │   │
│                            └─────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│ [Save Changes] [Replace File] [Move] [Delete] [Download] │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Media files
GET    /api/media                      // List media files with filters
POST   /api/media/upload               // Upload new files
GET    /api/media/{id}                 // Get file details
PUT    /api/media/{id}                 // Update file metadata
DELETE /api/media/{id}                 // Delete file
POST   /api/media/{id}/replace         // Replace file content
GET    /api/media/{id}/download        // Download file
POST   /api/media/bulk-action          // Bulk operations

// Folders
GET    /api/media/folders              // List folders
POST   /api/media/folders              // Create folder
PUT    /api/media/folders/{id}         // Update folder
DELETE /api/media/folders/{id}         // Delete folder
POST   /api/media/folders/{id}/move    // Move folder

// Search & filtering
GET    /api/media/search               // Advanced search
GET    /api/media/similar/{id}         // Find similar files
GET    /api/media/facets               // Get search facets

// Processing
POST   /api/media/{id}/process         // Process file
GET    /api/media/{id}/thumbnails      // Get thumbnails
POST   /api/media/{id}/optimize        // Optimize file

// Tags
GET    /api/media/tags                 // List all tags
POST   /api/media/tags                 // Create tag
PUT    /api/media/tags/{id}            // Update tag
DELETE /api/media/tags/{id}            // Delete tag
```

### **Database Schema:**
```sql
-- Media files table
CREATE TABLE media_files (
  id UUID PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt_text TEXT,
  title VARCHAR(255),
  description TEXT,
  caption TEXT,
  folder_id UUID REFERENCES media_folders(id),
  author_id UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  last_modified TIMESTAMP DEFAULT NOW(),
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  is_optimized BOOLEAN DEFAULT false,
  metadata JSONB,
  processing_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Media folders table
CREATE TABLE media_folders (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  path TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES media_folders(id),
  description TEXT,
  permissions JSONB,
  file_count INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Media tags
CREATE TABLE media_tags (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7), -- hex color
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- File-tag junction
CREATE TABLE media_file_tags (
  file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES media_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (file_id, tag_id)
);

-- Thumbnail variants
CREATE TABLE media_thumbnails (
  id UUID PRIMARY KEY,
  file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  variant VARCHAR(50) NOT NULL, -- e.g., "150x150", "300x300"
  url TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  format VARCHAR(10) NOT NULL,
  size BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- File processing jobs
CREATE TABLE media_processing_jobs (
  id UUID PRIMARY KEY,
  file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- thumbnail, optimize, convert
  status VARCHAR(20) DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  result JSONB,
  error TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_media_files_folder ON media_files(folder_id);
CREATE INDEX idx_media_files_author ON media_files(author_id);
CREATE INDEX idx_media_files_mime_type ON media_files(mime_type);
CREATE INDEX idx_media_files_uploaded_at ON media_files(uploaded_at);
CREATE INDEX idx_media_files_size ON media_files(size);
CREATE INDEX idx_media_folders_path ON media_folders(path);
CREATE INDEX idx_media_folders_parent ON media_folders(parent_id);
CREATE INDEX idx_media_tags_name ON media_tags(name);
```

---

## 🔗 **Related Documentation**

- **[Media Upload System](./upload.md)** - File upload implementation
- **[Image Processing](./processing.md)** - Image optimization and processing
- **[Content Integration](../02_content/)** - Media integration with content
- **[Security Features](../06_security/)** - File security and permissions

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
