# 📃 Pages Management System

> **Static Pages & Landing Pages JA-CMS**  
> Comprehensive page builder dan management system untuk static content

---

## 📋 **Deskripsi**

Pages Management System menyediakan tools lengkap untuk membuat, mengelola, dan mengoptimalkan static pages seperti landing pages, about us, contact, dan custom pages. Sistem ini dilengkapi dengan visual page builder dan template system yang powerful.

---

## ⭐ **Core Features**

### **1. 📄 Page Builder System**

#### **Visual Page Builder:**
```typescript
interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  template: string;
  status: 'draft' | 'published' | 'private';
  parent?: string;
  order: number;
  visibility: 'public' | 'private' | 'password';
  password?: string;
  customFields: CustomField[];
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    ogImage?: string;
  };
  author: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

interface CustomField {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'boolean' | 'select' | 'image' | 'url';
  value: any;
  required: boolean;
  options?: string[]; // for select type
}

interface PageTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'landing' | 'about' | 'contact' | 'portfolio' | 'service' | 'custom';
  blocks: PageBlock[];
  customFields: CustomFieldDefinition[];
  isDefault: boolean;
}

interface PageBlock {
  id: string;
  type: 'hero' | 'text' | 'image' | 'gallery' | 'form' | 'testimonial' | 'cta' | 'features';
  order: number;
  settings: BlockSettings;
  content: any;
}
```

#### **Page Builder Service:**
```typescript
export class PageBuilderService {
  async createPage(pageData: CreatePageData): Promise<Page> {
    // Validate page data
    const validation = await this.validatePageData(pageData);
    if (!validation.valid) {
      throw new Error(`Invalid page data: ${validation.errors.join(', ')}`);
    }

    // Generate unique slug
    const slug = await this.generateUniqueSlug(pageData.title);

    // Create page
    const page = await this.prisma.page.create({
      data: {
        title: pageData.title,
        slug,
        content: pageData.content || '',
        template: pageData.template || 'default',
        status: 'draft',
        visibility: pageData.visibility || 'public',
        authorId: pageData.authorId,
        parentId: pageData.parentId,
        order: pageData.order || 0,
        customFields: pageData.customFields || [],
        seo: pageData.seo || {}
      },
      include: {
        author: true,
        parent: true,
        children: true
      }
    });

    // Index for search
    await this.indexPageForSearch(page);

    return page;
  }

  async updatePage(pageId: string, updateData: UpdatePageData): Promise<Page> {
    // Check permissions
    const canEdit = await this.checkPageEditPermission(pageId, updateData.userId);
    if (!canEdit) {
      throw new Error('Insufficient permissions to edit page');
    }

    // Create revision before update
    await this.createPageRevision(pageId);

    // Update page
    const page = await this.prisma.page.update({
      where: { id: pageId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        author: true,
        parent: true,
        children: true
      }
    });

    // Update search index
    await this.updatePageSearchIndex(page);

    return page;
  }

  async buildPageFromTemplate(templateId: string, pageData: Partial<CreatePageData>): Promise<Page> {
    const template = await this.getPageTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Build page content from template blocks
    const content = await this.buildContentFromBlocks(template.blocks);
    
    // Merge template custom fields with page data
    const customFields = this.mergeCustomFields(template.customFields, pageData.customFields);

    return this.createPage({
      ...pageData,
      content,
      template: templateId,
      customFields
    });
  }

  async duplicatePage(pageId: string, newTitle: string): Promise<Page> {
    const originalPage = await this.getPage(pageId);
    if (!originalPage) {
      throw new Error(`Page ${pageId} not found`);
    }

    return this.createPage({
      title: newTitle,
      content: originalPage.content,
      template: originalPage.template,
      visibility: 'draft', // Always create duplicates as draft
      customFields: originalPage.customFields,
      seo: {
        ...originalPage.seo,
        metaTitle: newTitle // Update meta title
      },
      authorId: originalPage.authorId
    });
  }

  async getPageHierarchy(): Promise<PageHierarchy[]> {
    const pages = await this.prisma.page.findMany({
      where: { status: 'published' },
      include: { children: true },
      orderBy: { order: 'asc' }
    });

    return this.buildPageTree(pages.filter(p => !p.parentId));
  }

  private buildPageTree(pages: Page[]): PageHierarchy[] {
    return pages.map(page => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      order: page.order,
      children: this.buildPageTree(page.children || [])
    }));
  }

  private async buildContentFromBlocks(blocks: PageBlock[]): Promise<string> {
    const sortedBlocks = blocks.sort((a, b) => a.order - b.order);
    const contentParts: string[] = [];

    for (const block of sortedBlocks) {
      const blockContent = await this.renderBlock(block);
      contentParts.push(blockContent);
    }

    return contentParts.join('\n\n');
  }

  private async renderBlock(block: PageBlock): Promise<string> {
    switch (block.type) {
      case 'hero':
        return this.renderHeroBlock(block);
      case 'text':
        return this.renderTextBlock(block);
      case 'image':
        return this.renderImageBlock(block);
      case 'gallery':
        return this.renderGalleryBlock(block);
      case 'form':
        return this.renderFormBlock(block);
      case 'testimonial':
        return this.renderTestimonialBlock(block);
      case 'cta':
        return this.renderCTABlock(block);
      case 'features':
        return this.renderFeaturesBlock(block);
      default:
        return '';
    }
  }
}

interface CreatePageData {
  title: string;
  content?: string;
  template?: string;
  visibility?: 'public' | 'private' | 'password';
  password?: string;
  parentId?: string;
  order?: number;
  customFields?: CustomField[];
  seo?: PageSEO;
  authorId: string;
}

interface PageHierarchy {
  id: string;
  title: string;
  slug: string;
  order: number;
  children: PageHierarchy[];
}
```

### **2. 📋 Page Templates System**

#### **Template Management:**
```typescript
export class PageTemplateService {
  private templates: Map<string, PageTemplate> = new Map();

  constructor() {
    this.loadDefaultTemplates();
  }

  async getTemplates(category?: string): Promise<PageTemplate[]> {
    const templates = Array.from(this.templates.values());
    
    if (category) {
      return templates.filter(t => t.category === category);
    }
    
    return templates;
  }

  async createTemplate(templateData: CreateTemplateData): Promise<PageTemplate> {
    const template: PageTemplate = {
      id: generateId(),
      name: templateData.name,
      description: templateData.description,
      thumbnail: templateData.thumbnail,
      category: templateData.category,
      blocks: templateData.blocks,
      customFields: templateData.customFields || [],
      isDefault: false
    };

    this.templates.set(template.id, template);
    
    // Save to database
    await this.saveTemplate(template);
    
    return template;
  }

  private loadDefaultTemplates(): void {
    // Landing Page Template
    this.templates.set('landing-basic', {
      id: 'landing-basic',
      name: 'Basic Landing Page',
      description: 'Simple landing page with hero, features, and CTA',
      thumbnail: '/templates/landing-basic.jpg',
      category: 'landing',
      blocks: [
        {
          id: 'hero-1',
          type: 'hero',
          order: 1,
          settings: {
            background: 'gradient',
            alignment: 'center'
          },
          content: {
            title: 'Welcome to Our Service',
            subtitle: 'Transform your business with our amazing solution',
            ctaText: 'Get Started',
            ctaUrl: '/contact',
            backgroundImage: '/images/hero-bg.jpg'
          }
        },
        {
          id: 'features-1',
          type: 'features',
          order: 2,
          settings: {
            columns: 3,
            style: 'cards'
          },
          content: {
            title: 'Why Choose Us',
            features: [
              {
                icon: 'zap',
                title: 'Fast & Reliable',
                description: 'Lightning fast performance with 99.9% uptime guarantee'
              },
              {
                icon: 'shield',
                title: 'Secure',
                description: 'Enterprise-grade security to protect your data'
              },
              {
                icon: 'heart',
                title: 'Easy to Use',
                description: 'Intuitive interface that anyone can master'
              }
            ]
          }
        },
        {
          id: 'cta-1',
          type: 'cta',
          order: 3,
          settings: {
            background: 'primary',
            alignment: 'center'
          },
          content: {
            title: 'Ready to Get Started?',
            description: 'Join thousands of satisfied customers today',
            ctaText: 'Start Free Trial',
            ctaUrl: '/signup'
          }
        }
      ],
      customFields: [
        {
          key: 'hero_title',
          label: 'Hero Title',
          type: 'text',
          required: true,
          defaultValue: 'Welcome to Our Service'
        },
        {
          key: 'hero_subtitle',
          label: 'Hero Subtitle',
          type: 'textarea',
          required: false,
          defaultValue: 'Transform your business with our amazing solution'
        }
      ],
      isDefault: true
    });

    // About Page Template
    this.templates.set('about-company', {
      id: 'about-company',
      name: 'Company About Page',
      description: 'Professional about page with team and company info',
      thumbnail: '/templates/about-company.jpg',
      category: 'about',
      blocks: [
        {
          id: 'text-1',
          type: 'text',
          order: 1,
          settings: {
            alignment: 'left',
            maxWidth: '800px'
          },
          content: {
            title: 'About Our Company',
            content: '<p>We are a leading company in our industry, dedicated to providing exceptional service and innovative solutions to our clients.</p>'
          }
        },
        {
          id: 'image-1',
          type: 'image',
          order: 2,
          settings: {
            alignment: 'center',
            size: 'large'
          },
          content: {
            src: '/images/team-photo.jpg',
            alt: 'Our Team',
            caption: 'Our amazing team working together'
          }
        }
      ],
      customFields: [
        {
          key: 'company_name',
          label: 'Company Name',
          type: 'text',
          required: true,
          defaultValue: 'Your Company Name'
        },
        {
          key: 'founded_year',
          label: 'Founded Year',
          type: 'number',
          required: false,
          defaultValue: 2020
        }
      ],
      isDefault: true
    });

    // Contact Page Template
    this.templates.set('contact-form', {
      id: 'contact-form',
      name: 'Contact Form Page',
      description: 'Contact page with form and company information',
      thumbnail: '/templates/contact-form.jpg',
      category: 'contact',
      blocks: [
        {
          id: 'text-1',
          type: 'text',
          order: 1,
          settings: {
            alignment: 'center'
          },
          content: {
            title: 'Get In Touch',
            content: '<p>We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.</p>'
          }
        },
        {
          id: 'form-1',
          type: 'form',
          order: 2,
          settings: {
            style: 'modern',
            columns: 1
          },
          content: {
            fields: [
              { name: 'name', label: 'Name', type: 'text', required: true },
              { name: 'email', label: 'Email', type: 'email', required: true },
              { name: 'subject', label: 'Subject', type: 'text', required: true },
              { name: 'message', label: 'Message', type: 'textarea', required: true }
            ],
            submitText: 'Send Message',
            successMessage: 'Thank you for your message. We\'ll get back to you soon!'
          }
        }
      ],
      customFields: [
        {
          key: 'contact_email',
          label: 'Contact Email',
          type: 'text',
          required: true,
          defaultValue: 'contact@company.com'
        },
        {
          key: 'phone_number',
          label: 'Phone Number',
          type: 'text',
          required: false,
          defaultValue: '+1 (555) 123-4567'
        }
      ],
      isDefault: true
    });
  }
}

interface CreateTemplateData {
  name: string;
  description: string;
  thumbnail: string;
  category: 'landing' | 'about' | 'contact' | 'portfolio' | 'service' | 'custom';
  blocks: PageBlock[];
  customFields?: CustomFieldDefinition[];
}

interface CustomFieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'boolean' | 'select' | 'image' | 'url';
  required: boolean;
  defaultValue?: any;
  options?: string[];
}
```

### **3. 🔒 Page Visibility & Access Control**

#### **Visibility Management:**
```typescript
export class PageVisibilityService {
  async setPageVisibility(pageId: string, visibility: PageVisibility): Promise<void> {
    await this.prisma.page.update({
      where: { id: pageId },
      data: {
        visibility: visibility.type,
        password: visibility.password,
        allowedUsers: visibility.allowedUsers,
        allowedRoles: visibility.allowedRoles
      }
    });

    // Clear page cache
    await this.clearPageCache(pageId);
  }

  async canAccessPage(pageId: string, user?: User): Promise<AccessResult> {
    const page = await this.getPage(pageId);
    if (!page) {
      return { canAccess: false, reason: 'Page not found' };
    }

    switch (page.visibility) {
      case 'public':
        return { canAccess: true };

      case 'private':
        if (!user) {
          return { canAccess: false, reason: 'Authentication required' };
        }
        
        // Check if user is in allowed users list
        if (page.allowedUsers?.includes(user.id)) {
          return { canAccess: true };
        }
        
        // Check if user has allowed role
        if (page.allowedRoles?.some(role => user.roles.includes(role))) {
          return { canAccess: true };
        }
        
        return { canAccess: false, reason: 'Insufficient permissions' };

      case 'password':
        return { canAccess: false, reason: 'Password required', requiresPassword: true };

      default:
        return { canAccess: false, reason: 'Invalid visibility setting' };
    }
  }

  async validatePagePassword(pageId: string, password: string): Promise<boolean> {
    const page = await this.getPage(pageId);
    if (!page || page.visibility !== 'password') {
      return false;
    }

    // Hash the provided password and compare
    const hashedPassword = await bcrypt.hash(password, 10);
    return bcrypt.compare(password, page.password || '');
  }

  async getPageAccessLog(pageId: string): Promise<PageAccessLog[]> {
    return this.prisma.pageAccessLog.findMany({
      where: { pageId },
      include: { user: true },
      orderBy: { accessedAt: 'desc' },
      take: 100
    });
  }

  async logPageAccess(pageId: string, userId?: string, ipAddress?: string): Promise<void> {
    await this.prisma.pageAccessLog.create({
      data: {
        pageId,
        userId,
        ipAddress,
        accessedAt: new Date()
      }
    });
  }
}

interface PageVisibility {
  type: 'public' | 'private' | 'password';
  password?: string;
  allowedUsers?: string[];
  allowedRoles?: string[];
}

interface AccessResult {
  canAccess: boolean;
  reason?: string;
  requiresPassword?: boolean;
}

interface PageAccessLog {
  id: string;
  pageId: string;
  userId?: string;
  user?: User;
  ipAddress?: string;
  accessedAt: Date;
}
```

### **4. 📱 Responsive Page Design**

#### **Mobile-First Page Builder:**
```typescript
export class ResponsivePageService {
  async optimizePageForMobile(pageId: string): Promise<PageOptimization> {
    const page = await this.getPage(pageId);
    if (!page) {
      throw new Error('Page not found');
    }

    const optimizations: OptimizationSuggestion[] = [];

    // Analyze page blocks for mobile optimization
    const blocks = this.parsePageBlocks(page.content);
    
    for (const block of blocks) {
      const blockOptimizations = await this.analyzeBlockMobileOptimization(block);
      optimizations.push(...blockOptimizations);
    }

    // Check images for mobile optimization
    const imageOptimizations = await this.analyzeImageOptimization(page);
    optimizations.push(...imageOptimizations);

    // Check text readability
    const textOptimizations = await this.analyzeTextOptimization(page);
    optimizations.push(...textOptimizations);

    return {
      pageId,
      score: this.calculateMobileScore(optimizations),
      optimizations,
      autoFixAvailable: optimizations.some(o => o.autoFixable)
    };
  }

  async applyMobileOptimizations(pageId: string, optimizationIds: string[]): Promise<void> {
    const page = await this.getPage(pageId);
    if (!page) {
      throw new Error('Page not found');
    }

    const optimizations = await this.getOptimizations(optimizationIds);
    
    for (const optimization of optimizations) {
      if (optimization.autoFixable) {
        await this.applyOptimization(pageId, optimization);
      }
    }

    // Update page modified date
    await this.updatePageModifiedDate(pageId);
  }

  async previewPageOnDevice(pageId: string, device: DeviceType): Promise<PagePreview> {
    const page = await this.getPage(pageId);
    if (!page) {
      throw new Error('Page not found');
    }

    const deviceConfig = this.getDeviceConfig(device);
    
    return {
      pageId,
      device,
      viewport: deviceConfig.viewport,
      renderedContent: await this.renderPageForDevice(page, deviceConfig),
      performanceMetrics: await this.calculatePagePerformance(page, deviceConfig),
      usabilityScore: await this.calculateUsabilityScore(page, deviceConfig)
    };
  }

  private getDeviceConfig(device: DeviceType): DeviceConfig {
    const configs: Record<DeviceType, DeviceConfig> = {
      'mobile': {
        viewport: { width: 375, height: 667 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        touchEnabled: true,
        connectionSpeed: '3g'
      },
      'tablet': {
        viewport: { width: 768, height: 1024 },
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        touchEnabled: true,
        connectionSpeed: 'wifi'
      },
      'desktop': {
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        touchEnabled: false,
        connectionSpeed: 'wifi'
      }
    };

    return configs[device];
  }

  private async analyzeBlockMobileOptimization(block: PageBlock): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    switch (block.type) {
      case 'hero':
        if (block.content.backgroundImage && !block.settings.mobileBackground) {
          suggestions.push({
            id: generateId(),
            type: 'image',
            priority: 'high',
            title: 'Add mobile-optimized hero background',
            description: 'Hero section should have a mobile-specific background image',
            autoFixable: false
          });
        }
        break;

      case 'text':
        if (block.settings.fontSize && block.settings.fontSize > 18) {
          suggestions.push({
            id: generateId(),
            type: 'typography',
            priority: 'medium',
            title: 'Reduce font size for mobile',
            description: 'Large font sizes can cause readability issues on mobile',
            autoFixable: true
          });
        }
        break;

      case 'gallery':
        if (!block.settings.mobileColumns) {
          suggestions.push({
            id: generateId(),
            type: 'layout',
            priority: 'medium',
            title: 'Set mobile column count',
            description: 'Gallery should specify how many columns to show on mobile',
            autoFixable: true
          });
        }
        break;
    }

    return suggestions;
  }
}

type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceConfig {
  viewport: { width: number; height: number };
  userAgent: string;
  touchEnabled: boolean;
  connectionSpeed: '2g' | '3g' | '4g' | 'wifi';
}

interface PageOptimization {
  pageId: string;
  score: number; // 0-100
  optimizations: OptimizationSuggestion[];
  autoFixAvailable: boolean;
}

interface OptimizationSuggestion {
  id: string;
  type: 'image' | 'typography' | 'layout' | 'performance';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  autoFixable: boolean;
}

interface PagePreview {
  pageId: string;
  device: DeviceType;
  viewport: { width: number; height: number };
  renderedContent: string;
  performanceMetrics: PerformanceMetrics;
  usabilityScore: number;
}
```

---

## 🎨 **Pages Management Interface**

### **Page Builder Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ 📃 Page Builder                         [Save] [Preview] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Page Settings ────────────────────────────────────┐   │
│ │ Title: [About Us_________________________]         │   │
│ │ Slug: [about-us_________________________]          │   │
│ │ Template: [Company About ▼]                        │   │
│ │ Status: [Published ▼] Visibility: [Public ▼]       │   │
│ │ Parent: [None ▼] Order: [0___]                     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Content Blocks ───────────────────────────────────┐   │
│ │ ┌─ Hero Section ────────────────────────────────┐  │   │
│ │ │ [Edit] [Move ↕] [Delete]                       │  │   │
│ │ │ ┌─ Hero Content ──────────────────────────────┐ │  │   │
│ │ │ │ Title: Welcome to Our Company              │ │  │   │
│ │ │ │ Subtitle: Leading innovation since 2020    │ │  │   │
│ │ │ │ CTA: Learn More                           │ │  │   │
│ │ │ └────────────────────────────────────────────┘ │  │   │
│ │ └────────────────────────────────────────────────┘  │   │
│ │                                                   │   │
│ │ ┌─ Features Section ─────────────────────────────┐  │   │
│ │ │ [Edit] [Move ↕] [Delete]                       │  │   │
│ │ │ • Fast & Reliable                             │  │   │
│ │ │ • Secure Platform                             │  │   │
│ │ │ • 24/7 Support                                │  │   │
│ │ └────────────────────────────────────────────────┘  │   │
│ │                                                   │   │
│ │ [+ Add Block ▼]                                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ SEO & Meta ───────────────────────────────────────┐   │
│ │ Meta Title: [About Us - Company Name___________]    │   │
│ │ Meta Desc: [Learn about our company and team___]   │   │
│ │ Keywords: [about, company, team, history_______]   │   │
│ │ OG Image: [Browse...] [about-og.jpg]               │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Pages List Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ 📃 Pages Management                 [New Page] [Templates] │
├─────────────────────────────────────────────────────────┤
│ [Search pages...] [All ▼] [Published ▼] [Template ▼]    │
├─────────────────────────────────────────────────────────┤
│ Title                    Status      Modified    Views   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📄 Home                  Published   2 hours ago  2.3K│ │
│ │   ├─ About Us            Published   1 day ago    856 │ │
│ │   ├─ Services            Published   3 days ago   1.2K│ │
│ │   │   ├─ Web Development  Published   1 week ago   445 │ │
│ │   │   └─ Mobile Apps      Draft       2 weeks ago  0  │ │
│ │   └─ Contact             Published   1 day ago    234 │ │
│ │ 📄 Privacy Policy        Published   1 month ago  123 │ │
│ │ 📄 Terms of Service      Published   1 month ago  89  │ │
│ │ 📄 Landing Page (Draft)  Draft       Today        0  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Quick Actions ────────────────────────────────────┐   │
│ │ [Bulk Edit] [Export] [Import] [Duplicate Selected] │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ Showing 1-10 of 23 pages                   [1][2][3]   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Page management
GET    /api/pages                          // List all pages
POST   /api/pages                          // Create new page
GET    /api/pages/{id}                     // Get page details
PUT    /api/pages/{id}                     // Update page
DELETE /api/pages/{id}                     // Delete page
POST   /api/pages/{id}/duplicate           // Duplicate page

// Page hierarchy
GET    /api/pages/hierarchy                // Get page tree
PUT    /api/pages/{id}/move                // Move page in hierarchy
PUT    /api/pages/{id}/reorder             // Reorder pages

// Templates
GET    /api/page-templates                 // List templates
GET    /api/page-templates/{id}            // Get template
POST   /api/page-templates                 // Create template
POST   /api/pages/{id}/apply-template      // Apply template to page

// Visibility & access
PUT    /api/pages/{id}/visibility          // Set page visibility
POST   /api/pages/{id}/validate-password   // Validate page password
GET    /api/pages/{id}/access-log          // Get access log

// Mobile optimization
GET    /api/pages/{id}/mobile-analysis     // Analyze mobile optimization
POST   /api/pages/{id}/optimize-mobile     // Apply mobile optimizations
GET    /api/pages/{id}/preview/{device}    // Preview on device
```

### **Database Schema:**
```sql
-- Pages table
CREATE TABLE pages (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT,
  template VARCHAR(100) DEFAULT 'default',
  status VARCHAR(20) DEFAULT 'draft',
  visibility VARCHAR(20) DEFAULT 'public',
  password VARCHAR(255),
  parent_id UUID REFERENCES pages(id),
  order_index INTEGER DEFAULT 0,
  custom_fields JSONB,
  seo JSONB,
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- Page templates
CREATE TABLE page_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail VARCHAR(500),
  category VARCHAR(50) NOT NULL,
  blocks JSONB NOT NULL,
  custom_fields JSONB,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Page access log
CREATE TABLE page_access_log (
  id UUID PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMP DEFAULT NOW()
);

-- Page revisions
CREATE TABLE page_revisions (
  id UUID PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  custom_fields JSONB,
  seo JSONB,
  revision_number INTEGER NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_pages_parent ON pages(parent_id);
CREATE INDEX idx_pages_author ON pages(author_id);
CREATE INDEX idx_page_access_log_page ON page_access_log(page_id);
CREATE INDEX idx_page_revisions_page ON page_revisions(page_id);
```

---

## 🔗 **Related Documentation**

- **[Content Posts](./posts.md)** - Posts management system
- **[Content Editor](./editor.md)** - Rich text editor and content creation
- **[SEO Optimization](../01_analytics/site-analytics.md)** - SEO analytics and optimization
- **[User Permissions](../05_users/)** - Page access control and permissions

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
