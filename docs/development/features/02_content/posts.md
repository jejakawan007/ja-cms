# 📝 Posts & Pages Management

> **Sistem Pengelolaan Posts dan Pages**  
> Complete post and page creation, editing, and management system

---

## 📋 **Deskripsi**

Posts & Pages Management adalah core feature dari content management system yang menangani pembuatan, editing, dan pengelolaan semua jenis konten. Sistem ini menyediakan rich text editor, version control, dan workflow management yang powerful.

---

## ⭐ **Core Features**

### **1. 📄 Post Management**

#### **Post Creation & Editing:**
- **Rich Text Editor**: WYSIWYG editor dengan formatting tools lengkap
- **Markdown Support**: Alternative markdown editor untuk developers
- **Auto-save**: Automatic draft saving setiap 30 detik
- **Revision History**: Track changes dengan restore capability
- **Preview Mode**: Live preview sebelum publish

**Post Data Structure:**
```typescript
interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  categories: Category[];
  tags: Tag[];
  featuredImage?: {
    id: string;
    url: string;
    alt: string;
    caption?: string;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    ogImage?: string;
  };
  publishedAt?: Date;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  commentCount: number;
  readingTime: number; // in minutes
}
```

#### **Post Types:**
- **Blog Posts**: Standard blog articles dengan rich content
- **News Articles**: Time-sensitive news content
- **Tutorials**: Step-by-step guides dengan code examples
- **Reviews**: Product/service reviews dengan rating
- **Case Studies**: Detailed project analysis

### **2. 📃 Page Management**

#### **Static Pages:**
- **Page Builder**: Visual page builder dengan drag-drop components
- **Template Selection**: Pre-built page templates
- **Hierarchical Structure**: Parent-child page relationships
- **Custom Fields**: Additional metadata fields
- **Page Visibility**: Public, private, password-protected options

**Page Data Structure:**
```typescript
interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  template: string;
  status: 'draft' | 'published' | 'private';
  parent?: {
    id: string;
    title: string;
    slug: string;
  };
  children: Page[];
  order: number;
  customFields: Record<string, any>;
  seo: SEOData;
  visibility: 'public' | 'private' | 'password';
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Page Types:**
- **Landing Pages**: Marketing dan promotional pages
- **About Pages**: Company information dan team
- **Contact Pages**: Contact forms dan information
- **Service Pages**: Service descriptions dan pricing
- **Portfolio Pages**: Work showcase dan case studies

---

## 🎨 **Editor Interface**

### **Rich Text Editor:**
```
┌─────────────────────────────────────────────────────────┐
│ 📝 Edit Post: "Getting Started Guide"    [Save] [Publish] │
├─────────────────────────────────────────────────────────┤
│ Title: [Getting Started with JA-CMS___________________] │
│ Slug:  [getting-started-ja-cms________________________] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Rich Text Editor ─────────────────────────────────┐   │
│ │ [B] [I] [U] [Link] [Image] [Code] [Quote] [List]   │   │
│ │                                                    │   │
│ │ # Welcome to JA-CMS                                │   │
│ │                                                    │   │
│ │ This comprehensive guide will help you get started │   │
│ │ with JA-CMS development...                         │   │
│ │                                                    │   │
│ └────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│ ┌─ Sidebar ──────────┐                                   │
│ │ 📊 Publish         │                                   │
│ │ Status: Draft      │                                   │
│ │ Visibility: Public │                                   │
│ │ Schedule: Now      │                                   │
│ │                    │                                   │
│ │ 📂 Categories      │                                   │
│ │ ☑ Tutorials        │                                   │
│ │ ☐ Development      │                                   │
│ │                    │                                   │
│ │ 🏷️ Tags            │                                   │
│ │ cms, tutorial      │                                   │
│ │                    │                                   │
│ │ 🖼️ Featured Image  │                                   │
│ │ [Upload Image]     │                                   │
│ └────────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
```

### **Content List View:**
```
┌─────────────────────────────────────────────────────────┐
│ 📝 Posts                        [Add New] [Bulk Actions] │
├─────────────────────────────────────────────────────────┤
│ [Search posts...] [All▼] [Category▼] [Author▼] [Date▼]  │
├─────────────────────────────────────────────────────────┤
│ ☐ Title                      Author    Status     Date   │
│ ☐ Getting Started Guide      John Doe  Published  Jan 9  │
│ ☐ Advanced CMS Tips          Jane S.   Draft      Jan 8  │
│ ☐ Security Best Practices    Admin     Scheduled  Jan 10 │
│ ☐ Theme Development          Bob J.    Published  Jan 7  │
├─────────────────────────────────────────────────────────┤
│ Selected: 0 items [Delete] [Change Status] [Bulk Edit]   │
│ Showing 1-20 of 156 posts                    [1][2][3]  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Posts management
GET    /api/posts                    // Get posts with pagination & filters
POST   /api/posts                    // Create new post
GET    /api/posts/{id}               // Get specific post
PUT    /api/posts/{id}               // Update post
DELETE /api/posts/{id}               // Delete post
POST   /api/posts/bulk-action        // Bulk operations

// Pages management  
GET    /api/pages                    // Get pages with hierarchy
POST   /api/pages                    // Create new page
GET    /api/pages/{id}               // Get specific page
PUT    /api/pages/{id}               // Update page
DELETE /api/pages/{id}               // Delete page

// Content operations
POST   /api/posts/{id}/duplicate     // Duplicate post
POST   /api/posts/{id}/restore       // Restore from trash
GET    /api/posts/{id}/revisions     // Get revision history
POST   /api/posts/{id}/preview       // Generate preview link
```

### **Database Schema:**
```sql
-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  type VARCHAR(50) DEFAULT 'post', -- post, page, custom
  author_id UUID REFERENCES users(id),
  parent_id UUID REFERENCES posts(id), -- for pages hierarchy
  featured_image_id UUID REFERENCES media_files(id),
  template VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  visibility VARCHAR(20) DEFAULT 'public',
  password VARCHAR(255),
  published_at TIMESTAMP,
  scheduled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0
);

-- Post meta table untuk custom fields
CREATE TABLE post_meta (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  meta_key VARCHAR(255) NOT NULL,
  meta_value TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, meta_key)
);

-- Post revisions
CREATE TABLE post_revisions (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT,
  excerpt TEXT,
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- SEO data
CREATE TABLE post_seo (
  post_id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  keywords TEXT[],
  canonical_url VARCHAR(255),
  og_image VARCHAR(255),
  og_title VARCHAR(255),
  og_description TEXT,
  twitter_title VARCHAR(255),
  twitter_description TEXT,
  twitter_image VARCHAR(255),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Content Editor Component:**
```typescript
// Main editor component
export const PostEditor: React.FC<PostEditorProps> = ({ 
  postId, 
  mode = 'edit' 
}) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Auto-save functionality
  const { debouncedValue } = useDebounce(post?.content, 30000); // 30 seconds
  
  useEffect(() => {
    if (debouncedValue && post?.id) {
      autoSave();
    }
  }, [debouncedValue]);

  const autoSave = async () => {
    if (!post) return;
    
    setSaving(true);
    try {
      await postsApi.update(post.id, { 
        content: post.content,
        title: post.title 
      });
      toast.success('Auto-saved');
    } catch (error) {
      toast.error('Auto-save failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!post) return;
    
    try {
      await postsApi.update(post.id, { 
        status: 'published',
        publishedAt: new Date() 
      });
      toast.success('Post published successfully');
      router.push('/admin/content/posts');
    } catch (error) {
      toast.error('Failed to publish post');
    }
  };

  return (
    <div className="post-editor">
      <EditorHeader 
        post={post}
        saving={saving}
        onSave={handleSave}
        onPublish={handlePublish}
      />
      
      <div className="editor-layout">
        <div className="editor-main">
          <TitleInput 
            value={post?.title || ''}
            onChange={(title) => setPost(prev => ({ ...prev!, title }))}
          />
          
          <SlugInput 
            value={post?.slug || ''}
            onChange={(slug) => setPost(prev => ({ ...prev!, slug }))}
            autoGenerate={!post?.slug}
            title={post?.title}
          />
          
          <RichTextEditor
            content={post?.content || ''}
            onChange={(content) => setPost(prev => ({ ...prev!, content }))}
            placeholder="Start writing your content..."
          />
        </div>
        
        <EditorSidebar 
          post={post}
          onUpdate={setPost}
        />
      </div>
    </div>
  );
};
```

### **Rich Text Editor Integration:**
```typescript
// Rich text editor dengan TipTap
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight: createLowlight(common),
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-neutral max-w-none focus:outline-none',
      },
    },
  });

  return (
    <div className="rich-text-editor">
      <EditorToolbar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="editor-content"
      />
    </div>
  );
};
```

---

## 🚀 **Advanced Features**

### **1. 📊 Content Analytics:**
```typescript
interface PostAnalytics {
  views: number;
  uniqueViews: number;
  averageTimeOnPage: number;
  bounceRate: number;
  socialShares: {
    facebook: number;
    twitter: number;
    linkedin: number;
    total: number;
  };
  searchRankings: {
    keyword: string;
    position: number;
    searchVolume: number;
  }[];
  conversionRate: number;
}
```

### **2. 🔄 Content Workflow:**
```typescript
interface ContentWorkflow {
  stages: WorkflowStage[];
  currentStage: string;
  assignees: User[];
  dueDate?: Date;
  approvers: User[];
}

interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  requiredPermissions: string[];
  autoAdvance: boolean;
  notifications: NotificationConfig[];
}
```

### **3. 🎨 Content Blocks:**
```typescript
// Block-based content system
interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'code' | 'quote' | 'list';
  content: any;
  attributes: Record<string, any>;
  order: number;
}

const blockComponents = {
  paragraph: ParagraphBlock,
  heading: HeadingBlock,
  image: ImageBlock,
  code: CodeBlock,
  quote: QuoteBlock,
  list: ListBlock,
};
```

---

## 📱 **User Experience**

### **Content Creation Flow:**
1. **Create New Post** → Choose post type dan template
2. **Add Title & Content** → Rich text editing dengan auto-save
3. **Set Categories & Tags** → Organize content
4. **Configure SEO** → Meta tags dan social sharing
5. **Preview & Publish** → Review dan publish

### **Performance Optimization:**
- **Lazy Loading**: Load editor components on demand
- **Auto-save**: Background saving tanpa interruption
- **Image Optimization**: Automatic image compression
- **Search Indexing**: Full-text search capability
- **Caching**: Content caching untuk performance

---

## 🔗 **Related Documentation**

- **[Taxonomy System](./taxonomy.md)** - Categories dan tags management
- **[Comments System](./comments.md)** - Comment moderation
- **[Content Workflow](./workflow.md)** - Editorial workflow
- **[Media Integration](../03_media/)** - Asset management

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
