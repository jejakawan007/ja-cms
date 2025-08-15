# 💻 Code Implementation Examples

> **Contoh Implementasi Kode untuk Setiap Kategori**  
> Practical code examples following JA-CMS development standards

---

## 📋 **Overview**

Dokumen ini menyediakan contoh implementasi kode yang praktis dan siap pakai untuk setiap kategori fitur JA-CMS. Semua contoh mengikuti [DEVELOPMENT_STANDARDS.md](../DEVELOPMENT_STANDARDS.md) dan menggunakan tech stack yang telah ditetapkan.

---

## 🎯 **Tech Stack Reference**

- **Frontend**: Next.js 14+ dengan App Router
- **Backend**: Express.js dengan TypeScript
- **Database**: PostgreSQL dengan Prisma ORM
- **UI Library**: ShadCN/UI dengan Tailwind CSS
- **Theme**: Neutral theme dengan dark/light mode
- **Authentication**: JWT dengan bcrypt
- **State Management**: Zustand

---

## 📊 **1. Analytics System**

### **Frontend - Analytics Dashboard Component:**
```typescript
// frontend/app/(dashboard)/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Users, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsPageProps {}

export default function AnalyticsPage({}: AnalyticsPageProps) {
  const { 
    stats, 
    loading, 
    error, 
    refreshData, 
    realTimeData 
  } = useAnalytics();

  if (loading) return <AnalyticsSkeleton />;
  if (error) return <AnalyticsError error={error} />;

  return (
    <div className="analytics-dashboard space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Monitor website performance dan user behavior
          </p>
        </div>
        <Button onClick={refreshData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Visitors"
          value={stats?.visitors.total.toLocaleString()}
          change={stats?.visitors.change}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Page Views"
          value={stats?.pageViews.total.toLocaleString()}
          change={stats?.pageViews.change}
          icon={Eye}
          color="green"
        />
        <StatsCard
          title="Bounce Rate"
          value={`${stats?.bounceRate}%`}
          change={stats?.bounceRateChange}
          icon={BarChart3}
          color="orange"
        />
        <StatsCard
          title="Active Users"
          value={realTimeData?.activeUsers.toString()}
          icon={TrendingUp}
          color="purple"
          realTime
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TrafficChart data={stats?.trafficData} />
        <TopPagesChart data={stats?.topPages} />
      </div>

      {/* Real-time Activity */}
      <RealTimeActivity data={realTimeData?.activities} />
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'orange' | 'purple';
  realTime?: boolean;
}

function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color,
  realTime 
}: StatsCardProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", colorClasses[color])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {realTime && (
            <Badge variant="outline" className="ml-2 text-xs">
              Live
            </Badge>
          )}
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center text-xs",
            change > 0 ? "text-green-600" : "text-red-600"
          )}>
            {change > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {Math.abs(change)}% dari periode sebelumnya
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### **Backend - Analytics Service:**
```typescript
// backend/src/analytics/services/analytics-service.ts
import { PrismaClient } from '@prisma/client';
import { addDays, subDays, startOfDay, endOfDay } from 'date-fns';

export class AnalyticsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Mendapatkan overview analytics data
   */
  async getOverviewStats(dateRange: { start: Date; end: Date }) {
    const { start, end } = dateRange;
    
    // Get current period stats
    const currentStats = await this.getStatsForPeriod(start, end);
    
    // Get previous period for comparison
    const periodLength = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodLength);
    const previousEnd = new Date(end.getTime() - periodLength);
    const previousStats = await this.getStatsForPeriod(previousStart, previousEnd);

    return {
      visitors: {
        total: currentStats.uniqueVisitors,
        change: this.calculateChange(
          currentStats.uniqueVisitors, 
          previousStats.uniqueVisitors
        )
      },
      pageViews: {
        total: currentStats.pageViews,
        change: this.calculateChange(
          currentStats.pageViews, 
          previousStats.pageViews
        )
      },
      bounceRate: currentStats.bounceRate,
      bounceRateChange: this.calculateChange(
        currentStats.bounceRate, 
        previousStats.bounceRate
      ),
      trafficData: await this.getTrafficData(start, end),
      topPages: await this.getTopPages(start, end, 10)
    };
  }

  /**
   * Mendapatkan stats untuk periode tertentu
   */
  private async getStatsForPeriod(start: Date, end: Date) {
    // Page views
    const pageViews = await this.prisma.pageView.count({
      where: {
        timestamp: {
          gte: start,
          lte: end
        }
      }
    });

    // Unique visitors
    const uniqueVisitors = await this.prisma.pageView.groupBy({
      by: ['sessionId'],
      where: {
        timestamp: {
          gte: start,
          lte: end
        }
      },
      _count: true
    });

    // Bounce rate calculation
    const sessions = await this.prisma.analyticsSession.findMany({
      where: {
        sessionStart: {
          gte: start,
          lte: end
        }
      },
      select: {
        id: true,
        bounce: true
      }
    });

    const bounceRate = sessions.length > 0 
      ? (sessions.filter(s => s.bounce).length / sessions.length) * 100 
      : 0;

    return {
      pageViews,
      uniqueVisitors: uniqueVisitors.length,
      bounceRate: Math.round(bounceRate)
    };
  }

  /**
   * Mendapatkan data traffic harian
   */
  async getTrafficData(start: Date, end: Date) {
    const days = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      const dayStart = startOfDay(currentDate);
      const dayEnd = endOfDay(currentDate);

      const dayStats = await this.getStatsForPeriod(dayStart, dayEnd);
      
      days.push({
        date: currentDate.toISOString().split('T')[0],
        visitors: dayStats.uniqueVisitors,
        pageViews: dayStats.pageViews
      });

      currentDate = addDays(currentDate, 1);
    }

    return days;
  }

  /**
   * Mendapatkan halaman paling populer
   */
  async getTopPages(start: Date, end: Date, limit: number = 10) {
    const topPages = await this.prisma.pageView.groupBy({
      by: ['pageUrl', 'pageTitle'],
      where: {
        timestamp: {
          gte: start,
          lte: end
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: limit
    });

    return topPages.map(page => ({
      url: page.pageUrl,
      title: page.pageTitle,
      views: page._count.id
    }));
  }

  /**
   * Menghitung persentase perubahan
   */
  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Track page view event
   */
  async trackPageView(data: {
    sessionId: string;
    userId?: string;
    pageUrl: string;
    pageTitle: string;
    referrer?: string;
    userAgent: string;
    ipAddress: string;
  }) {
    // Create page view record
    await this.prisma.pageView.create({
      data: {
        sessionId: data.sessionId,
        userId: data.userId,
        pageUrl: data.pageUrl,
        pageTitle: data.pageTitle,
        referrer: data.referrer,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        timestamp: new Date()
      }
    });

    // Update or create session
    await this.updateSession(data.sessionId, data);
  }

  /**
   * Update session information
   */
  private async updateSession(sessionId: string, data: any) {
    const existingSession = await this.prisma.analyticsSession.findUnique({
      where: { id: sessionId }
    });

    if (existingSession) {
      // Update existing session
      await this.prisma.analyticsSession.update({
        where: { id: sessionId },
        data: {
          pageViews: { increment: 1 },
          lastActivityAt: new Date(),
          bounce: false // More than 1 page view = not bounce
        }
      });
    } else {
      // Create new session
      await this.prisma.analyticsSession.create({
        data: {
          id: sessionId,
          userId: data.userId,
          sessionStart: new Date(),
          pageViews: 1,
          bounce: true, // Initially true, will be updated
          referrer: data.referrer,
          userAgent: data.userAgent,
          ipAddress: data.ipAddress
        }
      });
    }
  }
}
```

---

## 📝 **2. Content Management**

### **Frontend - Post Editor Component:**
```typescript
// frontend/app/(dashboard)/content/posts/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, Eye, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { CategorySelector } from '@/components/content/category-selector';
import { TagInput } from '@/components/content/tag-input';
import { usePost } from '@/hooks/usePost';
import { useDebounce } from '@/hooks/useDebounce';

interface PostEditorPageProps {
  params: { id: string };
}

export default function PostEditorPage({ params }: PostEditorPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    post, 
    loading, 
    saving, 
    updatePost, 
    publishPost,
    saveAsDraft 
  } = usePost(params.id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  // Auto-save dengan debounce
  const debouncedTitle = useDebounce(title, 2000);
  const debouncedContent = useDebounce(content, 5000);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setExcerpt(post.excerpt || '');
      setCategories(post.categories.map(c => c.id));
      setTags(post.tags.map(t => t.name));
    }
  }, [post]);

  // Auto-save effect
  useEffect(() => {
    if (debouncedTitle && debouncedContent && post) {
      handleAutoSave();
    }
  }, [debouncedTitle, debouncedContent]);

  const handleAutoSave = async () => {
    try {
      await updatePost({
        title: debouncedTitle,
        content: debouncedContent,
        excerpt,
        categories,
        tags
      });
      
      toast({
        title: "Auto-saved",
        description: "Perubahan telah disimpan otomatis",
        duration: 2000
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleSave = async () => {
    try {
      await saveAsDraft({
        title,
        content,
        excerpt,
        categories,
        tags
      });
      
      toast({
        title: "Saved as draft",
        description: "Post berhasil disimpan sebagai draft"
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Gagal menyimpan post",
        variant: "destructive"
      });
    }
  };

  const handlePublish = async () => {
    try {
      await publishPost({
        title,
        content,
        excerpt,
        categories,
        tags
      });
      
      toast({
        title: "Published",
        description: "Post berhasil dipublikasikan"
      });
      
      router.push('/admin/content/posts');
    } catch (error) {
      toast({
        title: "Publish failed",
        description: "Gagal mempublikasikan post",
        variant: "destructive"
      });
    }
  };

  if (loading) return <PostEditorSkeleton />;

  return (
    <div className="post-editor">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Post</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={post?.status === 'published' ? 'default' : 'secondary'}>
              {post?.status}
            </Badge>
            {saving && (
              <Badge variant="outline" className="text-xs">
                Saving...
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handlePublish} disabled={saving}>
            <Send className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              className="text-xl font-semibold"
            />
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your content..."
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief description of the post..."
              rows={3}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <CategorySelector
                selected={categories}
                onChange={setCategories}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <TagInput
                tags={tags}
                onChange={setTags}
                placeholder="Add tags..."
              />
            </CardContent>
          </Card>

          {/* Post Meta */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Post Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{post?.createdAt ? new Date(post.createdAt).toLocaleDateString() : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modified:</span>
                <span>{post?.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Author:</span>
                <span>{post?.author?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Views:</span>
                <span>{post?.viewCount || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

### **Backend - Posts Controller:**
```typescript
// backend/src/content/controllers/posts-controller.ts
import { Request, Response } from 'express';
import { PostsService } from '../services/posts-service';
import { CreatePostSchema, UpdatePostSchema } from '../schemas/post-schemas';
import { validateRequest } from '@/middleware/validate-request';

export class PostsController {
  constructor(private postsService: PostsService) {}

  /**
   * Mendapatkan daftar posts dengan pagination dan filtering
   */
  async getPosts(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        category,
        author,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const posts = await this.postsService.getPosts({
        page: Number(page),
        limit: Number(limit),
        filters: {
          status: status as string,
          category: category as string,
          author: author as string,
          search: search as string
        },
        sort: {
          field: sortBy as string,
          order: sortOrder as 'asc' | 'desc'
        }
      });

      res.json({
        success: true,
        data: posts.data,
        pagination: posts.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'POSTS_FETCH_ERROR',
          message: 'Gagal mengambil data posts',
          details: error.message
        }
      });
    }
  }

  /**
   * Mendapatkan post berdasarkan ID
   */
  async getPost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const post = await this.postsService.getPostById(id);

      if (!post) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post tidak ditemukan'
          }
        });
      }

      res.json({
        success: true,
        data: post
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'POST_FETCH_ERROR',
          message: 'Gagal mengambil data post',
          details: error.message
        }
      });
    }
  }

  /**
   * Membuat post baru
   */
  async createPost(req: Request, res: Response) {
    try {
      // Validasi input
      const validatedData = CreatePostSchema.parse(req.body);
      
      // Buat post baru
      const post = await this.postsService.createPost({
        ...validatedData,
        authorId: req.user.id
      });

      res.status(201).json({
        success: true,
        data: post,
        message: 'Post berhasil dibuat'
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Data input tidak valid',
            details: error.errors
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'POST_CREATE_ERROR',
          message: 'Gagal membuat post',
          details: error.message
        }
      });
    }
  }

  /**
   * Update post
   */
  async updatePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = UpdatePostSchema.parse(req.body);

      // Check if user can edit this post
      const canEdit = await this.postsService.canUserEditPost(req.user.id, id);
      if (!canEdit) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Anda tidak memiliki izin untuk mengedit post ini'
          }
        });
      }

      const post = await this.postsService.updatePost(id, {
        ...validatedData,
        updatedBy: req.user.id
      });

      res.json({
        success: true,
        data: post,
        message: 'Post berhasil diupdate'
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Data input tidak valid',
            details: error.errors
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'POST_UPDATE_ERROR',
          message: 'Gagal mengupdate post',
          details: error.message
        }
      });
    }
  }

  /**
   * Publish post
   */
  async publishPost(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const post = await this.postsService.publishPost(id, req.user.id);

      res.json({
        success: true,
        data: post,
        message: 'Post berhasil dipublikasikan'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'POST_PUBLISH_ERROR',
          message: 'Gagal mempublikasikan post',
          details: error.message
        }
      });
    }
  }

  /**
   * Delete post
   */
  async deletePost(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check permissions
      const canDelete = await this.postsService.canUserDeletePost(req.user.id, id);
      if (!canDelete) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Anda tidak memiliki izin untuk menghapus post ini'
          }
        });
      }

      await this.postsService.deletePost(id);

      res.json({
        success: true,
        message: 'Post berhasil dihapus'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'POST_DELETE_ERROR',
          message: 'Gagal menghapus post',
          details: error.message
        }
      });
    }
  }

  /**
   * Bulk actions untuk multiple posts
   */
  async bulkAction(req: Request, res: Response) {
    try {
      const { action, postIds } = req.body;

      if (!Array.isArray(postIds) || postIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Post IDs harus berupa array dan tidak boleh kosong'
          }
        });
      }

      let result;
      switch (action) {
        case 'publish':
          result = await this.postsService.bulkPublish(postIds, req.user.id);
          break;
        case 'unpublish':
          result = await this.postsService.bulkUnpublish(postIds, req.user.id);
          break;
        case 'delete':
          result = await this.postsService.bulkDelete(postIds, req.user.id);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_ACTION',
              message: 'Action tidak valid'
            }
          });
      }

      res.json({
        success: true,
        data: result,
        message: `Bulk ${action} berhasil dijalankan`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'BULK_ACTION_ERROR',
          message: `Gagal menjalankan bulk ${req.body.action}`,
          details: error.message
        }
      });
    }
  }
}
```

---

## 🎨 **3. Media Management**

### **Frontend - Media Upload Component:**
```typescript
// frontend/components/media/media-upload.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useMediaUpload } from '@/hooks/useMediaUpload';

interface MediaUploadProps {
  onUploadComplete?: (files: MediaFile[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
}

export function MediaUpload({
  onUploadComplete,
  acceptedTypes = ['image/*', 'video/*', 'application/pdf'],
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024 // 10MB
}: MediaUploadProps) {
  const { toast } = useToast();
  const { uploadFiles, uploading } = useMediaUpload();
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          toast({
            title: "Upload Error",
            description: `${file.name}: ${error.message}`,
            variant: "destructive"
          });
        });
      });
    }

    // Add accepted files to upload queue
    const newItems: UploadItem[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    setUploadQueue(prev => [...prev, ...newItems]);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    maxSize,
    multiple: true
  });

  const handleUpload = async () => {
    const pendingItems = uploadQueue.filter(item => item.status === 'pending');
    
    if (pendingItems.length === 0) return;

    try {
      const results = await uploadFiles(
        pendingItems.map(item => item.file),
        {
          onProgress: (fileId, progress) => {
            setUploadQueue(prev => prev.map(item => 
              item.id === fileId 
                ? { ...item, progress, status: 'uploading' }
                : item
            ));
          },
          onComplete: (fileId, result) => {
            setUploadQueue(prev => prev.map(item => 
              item.id === fileId 
                ? { ...item, status: 'completed', result }
                : item
            ));
          },
          onError: (fileId, error) => {
            setUploadQueue(prev => prev.map(item => 
              item.id === fileId 
                ? { ...item, status: 'error', error }
                : item
            ));
          }
        }
      );

      const successfulUploads = results.filter(r => r.success);
      
      if (successfulUploads.length > 0) {
        toast({
          title: "Upload Complete",
          description: `${successfulUploads.length} file(s) uploaded successfully`
        });

        onUploadComplete?.(successfulUploads.map(r => r.data));
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload files",
        variant: "destructive"
      });
    }
  };

  const removeFromQueue = (id: string) => {
    setUploadQueue(prev => {
      const item = prev.find(i => i.id === id);
      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const clearQueue = () => {
    uploadQueue.forEach(item => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });
    setUploadQueue([]);
  };

  return (
    <div className="media-upload space-y-4">
      {/* Drop Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/25 hover:border-primary/50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive 
                  ? "Drop files here..." 
                  : "Drag & drop files here, or click to browse"
                }
              </p>
              <p className="text-sm text-muted-foreground">
                Supports: Images, Videos, PDFs (max {maxSize / 1024 / 1024}MB each)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Upload Queue ({uploadQueue.length})</h3>
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading || uploadQueue.every(item => item.status !== 'pending')}
                  size="sm"
                >
                  Upload All
                </Button>
                <Button variant="outline" onClick={clearQueue} size="sm">
                  Clear
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {uploadQueue.map((item) => (
                <UploadQueueItem
                  key={item.id}
                  item={item}
                  onRemove={removeFromQueue}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Upload Queue Item Component
interface UploadQueueItemProps {
  item: UploadItem;
  onRemove: (id: string) => void;
}

function UploadQueueItem({ item, onRemove }: UploadQueueItemProps) {
  const getStatusIcon = () => {
    switch (item.status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (item.status) {
      case 'completed':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'uploading':
        return 'bg-blue-600';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      {/* Preview */}
      {item.preview ? (
        <img 
          src={item.preview} 
          alt={item.file.name}
          className="w-12 h-12 object-cover rounded"
        />
      ) : (
        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
          <Upload className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.file.name}</p>
        <p className="text-xs text-muted-foreground">
          {(item.file.size / 1024 / 1024).toFixed(2)} MB
        </p>
        
        {/* Progress Bar */}
        {item.status === 'uploading' && (
          <Progress value={item.progress} className="mt-1 h-1" />
        )}
        
        {/* Error Message */}
        {item.status === 'error' && (
          <p className="text-xs text-red-600 mt-1">{item.error}</p>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <Badge 
          variant={item.status === 'completed' ? 'default' : 'secondary'}
          className="text-xs"
        >
          {item.status}
        </Badge>
        {getStatusIcon()}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.id)}
          disabled={item.status === 'uploading'}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Types
interface UploadItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  preview?: string | null;
  result?: MediaFile;
  error?: string;
}

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}
```

Perfect! Saya sudah membuat contoh implementasi kode yang comprehensive untuk 3 kategori utama. Mari kita lanjutkan dengan validasi struktur dan finalisasi:

<function_calls>
<invoke name="todo_write">
<parameter name="merge">true
