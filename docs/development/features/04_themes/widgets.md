# 🧩 Widget System

> **Advanced Widget Management JA-CMS**  
> Drag-drop widget system dengan custom widget creation dan dynamic areas

---

## 📋 **Deskripsi**

Widget System menyediakan framework yang flexible untuk membuat, mengelola, dan menggunakan widgets dalam themes JA-CMS. Sistem ini mendukung drag-drop interface, custom widget development, dynamic widget areas, dan real-time preview untuk memberikan control penuh atas layout dan functionality website.

---

## ⭐ **Core Features**

### **1. 🎛️ Widget Management Framework**

#### **Widget Architecture:**
```typescript
interface Widget {
  id: string;
  type: WidgetType;
  name: string;
  title: string;
  description: string;
  icon: string;
  category: WidgetCategory;
  settings: WidgetSettings;
  content?: WidgetContent;
  area: string; // widget area ID
  position: number;
  visibility: VisibilityRules;
  permissions: WidgetPermissions;
  metadata: {
    version: string;
    author: string;
    isActive: boolean;
    isSystem: boolean;
    isCustom: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastUsed?: Date;
  };
  performance: {
    loadTime: number;
    cacheEnabled: boolean;
    cacheDuration: number;
    dependencies: string[];
  };
}

interface WidgetType {
  id: string;
  name: string;
  className: string;
  template: string;
  settingsSchema: SettingsSchema;
  defaultSettings: Record<string, any>;
  supports: WidgetSupport[];
  hooks: WidgetHooks;
  assets: {
    css?: string[];
    js?: string[];
    dependencies?: string[];
  };
}

interface WidgetArea {
  id: string;
  name: string;
  description: string;
  theme: string;
  location: string; // header, sidebar, footer, content, etc.
  maxWidgets?: number;
  allowedTypes?: string[];
  defaultWidgets?: DefaultWidget[];
  settings: {
    layout: 'vertical' | 'horizontal' | 'grid';
    spacing: string;
    alignment: 'left' | 'center' | 'right' | 'justify';
    responsive: ResponsiveSettings;
  };
  conditions: DisplayCondition[];
  isActive: boolean;
}

interface WidgetSettings {
  [key: string]: {
    value: any;
    type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'multiselect' | 'color' | 'image' | 'url' | 'date' | 'json';
    label: string;
    description?: string;
    default?: any;
    options?: SelectOption[];
    validation?: ValidationRule[];
    conditional?: ConditionalDisplay;
  };
}

interface VisibilityRules {
  pages?: string[]; // page IDs or types
  postTypes?: string[];
  taxonomies?: string[];
  userRoles?: string[];
  devices?: ('desktop' | 'tablet' | 'mobile')[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  conditions?: LogicalCondition[];
}

interface WidgetContent {
  html?: string;
  data?: Record<string, any>;
  cache?: {
    key: string;
    duration: number;
    tags: string[];
  };
}

type WidgetCategory = 'content' | 'navigation' | 'social' | 'media' | 'form' | 'ecommerce' | 'analytics' | 'custom';
type WidgetSupport = 'caching' | 'ajax' | 'responsive' | 'rtl' | 'translation' | 'customization';
```

#### **Widget Management Service:**
```typescript
export class WidgetManagementService {
  private widgetRegistry: WidgetRegistry;
  private areaManager: WidgetAreaManager;
  private renderer: WidgetRenderer;
  private cacheManager: WidgetCacheManager;
  private permissionManager: PermissionManager;

  async createWidget(widgetData: CreateWidgetData): Promise<Widget> {
    // Validate widget data
    const validation = await this.validateWidgetData(widgetData);
    if (!validation.valid) {
      throw new Error(`Invalid widget data: ${validation.errors.join(', ')}`);
    }

    // Check permissions
    const canCreate = await this.permissionManager.canCreateWidget(
      widgetData.createdBy, 
      widgetData.type
    );
    if (!canCreate) {
      throw new Error('Insufficient permissions to create widget');
    }

    // Get widget type definition
    const widgetType = await this.widgetRegistry.getType(widgetData.type);
    if (!widgetType) {
      throw new Error(`Widget type "${widgetData.type}" not found`);
    }

    // Create widget instance
    const widget: Widget = {
      id: this.generateWidgetId(),
      type: widgetType,
      name: widgetData.name,
      title: widgetData.title,
      description: widgetData.description || '',
      icon: widgetType.icon || 'widget',
      category: widgetType.category,
      settings: this.initializeSettings(widgetType, widgetData.settings),
      area: widgetData.area,
      position: await this.getNextPosition(widgetData.area),
      visibility: widgetData.visibility || this.getDefaultVisibility(),
      permissions: widgetData.permissions || this.getDefaultPermissions(),
      metadata: {
        version: widgetType.version || '1.0.0',
        author: widgetData.createdBy,
        isActive: true,
        isSystem: false,
        isCustom: widgetType.isCustom || false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      performance: {
        loadTime: 0,
        cacheEnabled: widgetType.supports?.includes('caching') || false,
        cacheDuration: 3600, // 1 hour default
        dependencies: widgetType.assets?.dependencies || []
      }
    };

    // Store widget
    await this.storeWidget(widget);

    // Initialize widget content
    if (widgetType.hooks?.onCreated) {
      await this.executeHook(widgetType.hooks.onCreated, widget);
    }

    // Clear area cache
    await this.cacheManager.clearAreaCache(widget.area);

    return widget;
  }

  async updateWidget(widgetId: string, updates: UpdateWidgetData): Promise<Widget> {
    const widget = await this.getWidget(widgetId);
    if (!widget) {
      throw new Error('Widget not found');
    }

    // Check permissions
    const canUpdate = await this.permissionManager.canUpdateWidget(
      updates.updatedBy, 
      widget
    );
    if (!canUpdate) {
      throw new Error('Insufficient permissions to update widget');
    }

    // Validate updates
    if (updates.settings) {
      const validation = await this.validateSettings(widget.type, updates.settings);
      if (!validation.valid) {
        throw new Error(`Invalid settings: ${validation.errors.join(', ')}`);
      }
    }

    // Apply updates
    const updatedWidget = {
      ...widget,
      ...updates,
      metadata: {
        ...widget.metadata,
        updatedAt: new Date()
      }
    };

    // Store updated widget
    await this.storeWidget(updatedWidget);

    // Execute update hook
    if (widget.type.hooks?.onUpdated) {
      await this.executeHook(widget.type.hooks.onUpdated, updatedWidget, widget);
    }

    // Clear caches
    await this.cacheManager.clearWidgetCache(widgetId);
    await this.cacheManager.clearAreaCache(widget.area);

    return updatedWidget;
  }

  async moveWidget(widgetId: string, targetArea: string, targetPosition: number): Promise<void> {
    const widget = await this.getWidget(widgetId);
    if (!widget) {
      throw new Error('Widget not found');
    }

    const sourceArea = widget.area;
    
    // Validate target area
    const area = await this.areaManager.getArea(targetArea);
    if (!area) {
      throw new Error('Target area not found');
    }

    // Check area restrictions
    if (area.allowedTypes && !area.allowedTypes.includes(widget.type.id)) {
      throw new Error('Widget type not allowed in target area');
    }

    if (area.maxWidgets) {
      const currentCount = await this.getAreaWidgetCount(targetArea);
      if (currentCount >= area.maxWidgets && sourceArea !== targetArea) {
        throw new Error('Target area has reached maximum widget limit');
      }
    }

    // Update widget position
    await this.updateWidgetPosition(widgetId, targetArea, targetPosition);

    // Reorder widgets in both areas
    if (sourceArea !== targetArea) {
      await this.reorderAreaWidgets(sourceArea);
    }
    await this.reorderAreaWidgets(targetArea);

    // Clear caches
    await this.cacheManager.clearAreaCache(sourceArea);
    if (sourceArea !== targetArea) {
      await this.cacheManager.clearAreaCache(targetArea);
    }
  }

  async duplicateWidget(widgetId: string, targetArea?: string): Promise<Widget> {
    const sourceWidget = await this.getWidget(widgetId);
    if (!sourceWidget) {
      throw new Error('Widget not found');
    }

    // Create duplicate
    const duplicateData: CreateWidgetData = {
      type: sourceWidget.type.id,
      name: `${sourceWidget.name} (Copy)`,
      title: `${sourceWidget.title} (Copy)`,
      description: sourceWidget.description,
      settings: { ...sourceWidget.settings },
      area: targetArea || sourceWidget.area,
      visibility: { ...sourceWidget.visibility },
      permissions: { ...sourceWidget.permissions },
      createdBy: 'system' // or current user
    };

    return this.createWidget(duplicateData);
  }

  async renderWidget(widgetId: string, context: RenderContext = {}): Promise<WidgetRenderResult> {
    const widget = await this.getWidget(widgetId);
    if (!widget) {
      throw new Error('Widget not found');
    }

    // Check visibility rules
    const isVisible = await this.checkVisibility(widget, context);
    if (!isVisible) {
      return {
        html: '',
        visible: false,
        cached: false
      };
    }

    // Check cache
    const cacheKey = this.generateCacheKey(widget, context);
    if (widget.performance.cacheEnabled) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return {
          html: cached.html,
          visible: true,
          cached: true,
          cacheKey
        };
      }
    }

    const startTime = Date.now();

    try {
      // Render widget
      const html = await this.renderer.render(widget, context);
      
      // Calculate render time
      const renderTime = Date.now() - startTime;
      
      // Update performance metrics
      await this.updatePerformanceMetrics(widgetId, renderTime);

      // Cache result
      if (widget.performance.cacheEnabled && html) {
        await this.cacheManager.set(cacheKey, { html }, widget.performance.cacheDuration);
      }

      return {
        html,
        visible: true,
        cached: false,
        renderTime,
        cacheKey
      };

    } catch (error) {
      // Log error
      console.error(`Error rendering widget ${widgetId}:`, error);
      
      // Return error fallback
      return {
        html: this.getErrorFallback(widget, error),
        visible: true,
        cached: false,
        error: error.message
      };
    }
  }

  async renderArea(areaId: string, context: RenderContext = {}): Promise<AreaRenderResult> {
    const area = await this.areaManager.getArea(areaId);
    if (!area) {
      throw new Error('Widget area not found');
    }

    // Check area display conditions
    const shouldDisplay = await this.checkAreaConditions(area, context);
    if (!shouldDisplay) {
      return {
        html: '',
        visible: false,
        widgets: []
      };
    }

    // Get area widgets
    const widgets = await this.getAreaWidgets(areaId);
    const renderedWidgets: RenderedWidget[] = [];

    // Render each widget
    for (const widget of widgets) {
      const renderResult = await this.renderWidget(widget.id, context);
      
      if (renderResult.visible && renderResult.html) {
        renderedWidgets.push({
          widget,
          html: renderResult.html,
          cached: renderResult.cached,
          renderTime: renderResult.renderTime
        });
      }
    }

    // Generate area HTML
    const areaHtml = await this.generateAreaHtml(area, renderedWidgets);

    return {
      html: areaHtml,
      visible: true,
      widgets: renderedWidgets,
      area
    };
  }

  private async checkVisibility(widget: Widget, context: RenderContext): Promise<boolean> {
    const rules = widget.visibility;

    // Check page conditions
    if (rules.pages && rules.pages.length > 0) {
      if (!context.pageId || !rules.pages.includes(context.pageId)) {
        return false;
      }
    }

    // Check post type conditions
    if (rules.postTypes && rules.postTypes.length > 0) {
      if (!context.postType || !rules.postTypes.includes(context.postType)) {
        return false;
      }
    }

    // Check user role conditions
    if (rules.userRoles && rules.userRoles.length > 0) {
      if (!context.userRole || !rules.userRoles.includes(context.userRole)) {
        return false;
      }
    }

    // Check device conditions
    if (rules.devices && rules.devices.length > 0) {
      if (!context.device || !rules.devices.includes(context.device)) {
        return false;
      }
    }

    // Check date range
    if (rules.dateRange) {
      const now = new Date();
      if (rules.dateRange.start && now < rules.dateRange.start) {
        return false;
      }
      if (rules.dateRange.end && now > rules.dateRange.end) {
        return false;
      }
    }

    // Check custom conditions
    if (rules.conditions && rules.conditions.length > 0) {
      const conditionResult = await this.evaluateConditions(rules.conditions, context);
      if (!conditionResult) {
        return false;
      }
    }

    return true;
  }

  private async generateAreaHtml(area: WidgetArea, widgets: RenderedWidget[]): Promise<string> {
    if (widgets.length === 0) {
      return '';
    }

    const areaClasses = [
      'widget-area',
      `widget-area-${area.id}`,
      `widget-area-${area.location}`,
      `layout-${area.settings.layout}`
    ];

    const areaStyles = [
      area.settings.spacing ? `gap: ${area.settings.spacing}` : '',
      area.settings.alignment ? `text-align: ${area.settings.alignment}` : ''
    ].filter(Boolean).join('; ');

    let html = `<div class="${areaClasses.join(' ')}"`;
    if (areaStyles) {
      html += ` style="${areaStyles}"`;
    }
    html += ` data-area="${area.id}">`;

    // Add widgets
    for (const renderedWidget of widgets) {
      const widgetClasses = [
        'widget',
        `widget-${renderedWidget.widget.type.id}`,
        `widget-${renderedWidget.widget.id}`
      ];

      html += `<div class="${widgetClasses.join(' ')}" data-widget="${renderedWidget.widget.id}">`;
      html += renderedWidget.html;
      html += '</div>';
    }

    html += '</div>';

    return html;
  }
}

interface CreateWidgetData {
  type: string;
  name: string;
  title: string;
  description?: string;
  settings?: Record<string, any>;
  area: string;
  visibility?: VisibilityRules;
  permissions?: WidgetPermissions;
  createdBy: string;
}

interface UpdateWidgetData {
  name?: string;
  title?: string;
  description?: string;
  settings?: Record<string, any>;
  visibility?: VisibilityRules;
  permissions?: WidgetPermissions;
  updatedBy: string;
}

interface RenderContext {
  pageId?: string;
  postType?: string;
  userRole?: string;
  device?: 'desktop' | 'tablet' | 'mobile';
  theme?: string;
  language?: string;
  customData?: Record<string, any>;
}

interface WidgetRenderResult {
  html: string;
  visible: boolean;
  cached: boolean;
  renderTime?: number;
  cacheKey?: string;
  error?: string;
}

interface AreaRenderResult {
  html: string;
  visible: boolean;
  widgets: RenderedWidget[];
  area?: WidgetArea;
}

interface RenderedWidget {
  widget: Widget;
  html: string;
  cached: boolean;
  renderTime?: number;
}
```

### **2. 🎨 Built-in Widget Types**

#### **Core Widget Library:**
```typescript
export class CoreWidgetLibrary {
  static getBuiltInWidgets(): WidgetType[] {
    return [
      // Content Widgets
      {
        id: 'text',
        name: 'Text Widget',
        className: 'TextWidget',
        template: 'widgets/text',
        category: 'content',
        settingsSchema: {
          title: {
            type: 'text',
            label: 'Title',
            default: ''
          },
          content: {
            type: 'textarea',
            label: 'Content',
            default: '',
            rows: 10
          },
          format: {
            type: 'select',
            label: 'Content Format',
            options: [
              { value: 'html', label: 'HTML' },
              { value: 'markdown', label: 'Markdown' },
              { value: 'plain', label: 'Plain Text' }
            ],
            default: 'html'
          }
        },
        supports: ['caching', 'translation'],
        hooks: {
          onRender: 'processTextContent'
        }
      },

      {
        id: 'recent_posts',
        name: 'Recent Posts',
        className: 'RecentPostsWidget',
        template: 'widgets/recent-posts',
        category: 'content',
        settingsSchema: {
          title: {
            type: 'text',
            label: 'Title',
            default: 'Recent Posts'
          },
          count: {
            type: 'number',
            label: 'Number of Posts',
            default: 5,
            min: 1,
            max: 20
          },
          post_type: {
            type: 'select',
            label: 'Post Type',
            options: 'getPostTypes', // Dynamic options
            default: 'post'
          },
          show_date: {
            type: 'boolean',
            label: 'Show Date',
            default: true
          },
          show_excerpt: {
            type: 'boolean',
            label: 'Show Excerpt',
            default: false
          },
          excerpt_length: {
            type: 'number',
            label: 'Excerpt Length',
            default: 100,
            conditional: {
              field: 'show_excerpt',
              value: true
            }
          }
        },
        supports: ['caching', 'ajax'],
        hooks: {
          onRender: 'fetchRecentPosts'
        }
      },

      // Navigation Widgets
      {
        id: 'navigation_menu',
        name: 'Navigation Menu',
        className: 'NavigationMenuWidget',
        template: 'widgets/navigation-menu',
        category: 'navigation',
        settingsSchema: {
          title: {
            type: 'text',
            label: 'Title',
            default: ''
          },
          menu: {
            type: 'select',
            label: 'Select Menu',
            options: 'getNavigationMenus',
            default: ''
          },
          depth: {
            type: 'number',
            label: 'Menu Depth',
            default: 0,
            min: 0,
            max: 5
          },
          show_icons: {
            type: 'boolean',
            label: 'Show Icons',
            default: false
          }
        },
        supports: ['caching', 'responsive'],
        hooks: {
          onRender: 'renderNavigationMenu'
        }
      },

      // Media Widgets
      {
        id: 'image',
        name: 'Image Widget',
        className: 'ImageWidget',
        template: 'widgets/image',
        category: 'media',
        settingsSchema: {
          title: {
            type: 'text',
            label: 'Title',
            default: ''
          },
          image: {
            type: 'image',
            label: 'Select Image',
            default: null
          },
          alt_text: {
            type: 'text',
            label: 'Alt Text',
            default: ''
          },
          link_url: {
            type: 'url',
            label: 'Link URL',
            default: ''
          },
          link_target: {
            type: 'select',
            label: 'Link Target',
            options: [
              { value: '_self', label: 'Same Window' },
              { value: '_blank', label: 'New Window' }
            ],
            default: '_self',
            conditional: {
              field: 'link_url',
              operator: 'not_empty'
            }
          },
          size: {
            type: 'select',
            label: 'Image Size',
            options: 'getImageSizes',
            default: 'medium'
          }
        },
        supports: ['responsive'],
        assets: {
          css: ['widgets/image.css']
        }
      },

      // Social Widgets
      {
        id: 'social_links',
        name: 'Social Links',
        className: 'SocialLinksWidget',
        template: 'widgets/social-links',
        category: 'social',
        settingsSchema: {
          title: {
            type: 'text',
            label: 'Title',
            default: 'Follow Us'
          },
          links: {
            type: 'json',
            label: 'Social Links',
            default: [],
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  platform: { type: 'string' },
                  url: { type: 'string' },
                  icon: { type: 'string' }
                }
              }
            }
          },
          style: {
            type: 'select',
            label: 'Style',
            options: [
              { value: 'icons', label: 'Icons Only' },
              { value: 'text', label: 'Text Only' },
              { value: 'both', label: 'Icons + Text' }
            ],
            default: 'icons'
          },
          size: {
            type: 'select',
            label: 'Icon Size',
            options: [
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' }
            ],
            default: 'medium'
          }
        },
        assets: {
          css: ['widgets/social-links.css']
        }
      },

      // Form Widgets
      {
        id: 'search',
        name: 'Search Widget',
        className: 'SearchWidget',
        template: 'widgets/search',
        category: 'form',
        settingsSchema: {
          title: {
            type: 'text',
            label: 'Title',
            default: 'Search'
          },
          placeholder: {
            type: 'text',
            label: 'Placeholder Text',
            default: 'Search...'
          },
          button_text: {
            type: 'text',
            label: 'Button Text',
            default: 'Search'
          },
          show_button: {
            type: 'boolean',
            label: 'Show Search Button',
            default: true
          },
          search_types: {
            type: 'multiselect',
            label: 'Search Types',
            options: [
              { value: 'posts', label: 'Posts' },
              { value: 'pages', label: 'Pages' },
              { value: 'media', label: 'Media' },
              { value: 'users', label: 'Users' }
            ],
            default: ['posts', 'pages']
          }
        },
        supports: ['ajax'],
        assets: {
          js: ['widgets/search.js']
        }
      }
    ];
  }
}

// Widget Renderer Classes
export class TextWidget {
  async render(widget: Widget, context: RenderContext): Promise<string> {
    const settings = widget.settings;
    let content = settings.content.value || '';

    // Process content based on format
    switch (settings.format.value) {
      case 'markdown':
        content = await this.processMarkdown(content);
        break;
      case 'plain':
        content = this.escapeHtml(content);
        break;
      default:
        content = this.sanitizeHtml(content);
    }

    return this.renderTemplate('widgets/text', {
      title: settings.title.value,
      content,
      widget
    });
  }

  private async processMarkdown(content: string): Promise<string> {
    // Implement markdown processing
    return content; // Placeholder
  }

  private escapeHtml(content: string): string {
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private sanitizeHtml(content: string): string {
    // Implement HTML sanitization
    return content; // Placeholder
  }

  private renderTemplate(template: string, data: any): string {
    // Implement template rendering
    return `<div class="widget-content">${data.content}</div>`; // Placeholder
  }
}

export class RecentPostsWidget {
  async render(widget: Widget, context: RenderContext): Promise<string> {
    const settings = widget.settings;
    
    // Fetch recent posts
    const posts = await this.fetchRecentPosts({
      count: settings.count.value,
      postType: settings.post_type.value,
      showDate: settings.show_date.value,
      showExcerpt: settings.show_excerpt.value,
      excerptLength: settings.excerpt_length.value
    });

    return this.renderTemplate('widgets/recent-posts', {
      title: settings.title.value,
      posts,
      settings,
      widget
    });
  }

  private async fetchRecentPosts(options: any): Promise<any[]> {
    // Implement post fetching logic
    return []; // Placeholder
  }
}
```

### **3. 🔧 Custom Widget Development**

#### **Custom Widget Creation:**
```typescript
export class CustomWidgetBuilder {
  async createCustomWidget(definition: CustomWidgetDefinition): Promise<WidgetType> {
    // Validate definition
    const validation = await this.validateDefinition(definition);
    if (!validation.valid) {
      throw new Error(`Invalid widget definition: ${validation.errors.join(', ')}`);
    }

    // Generate widget class
    const widgetClass = await this.generateWidgetClass(definition);
    
    // Create template
    const template = await this.createTemplate(definition);
    
    // Generate assets
    const assets = await this.generateAssets(definition);

    // Register widget type
    const widgetType: WidgetType = {
      id: definition.id,
      name: definition.name,
      className: widgetClass.name,
      template: template.path,
      category: definition.category,
      settingsSchema: definition.settings,
      defaultSettings: this.extractDefaultSettings(definition.settings),
      supports: definition.supports || [],
      hooks: definition.hooks || {},
      assets: assets,
      version: definition.version || '1.0.0',
      isCustom: true
    };

    await this.registerWidgetType(widgetType);
    
    return widgetType;
  }

  async generateWidgetClass(definition: CustomWidgetDefinition): Promise<GeneratedClass> {
    const className = this.pascalCase(definition.id) + 'Widget';
    
    let classCode = `
export class ${className} {
  constructor(private widgetService: WidgetService) {}

  async render(widget: Widget, context: RenderContext): Promise<string> {
    const settings = widget.settings;
    
    // Custom render logic
    ${definition.renderLogic || 'return this.defaultRender(widget, context);'}
  }

  private async defaultRender(widget: Widget, context: RenderContext): Promise<string> {
    return this.renderTemplate('${definition.template}', {
      widget,
      settings: widget.settings,
      context
    });
  }

  ${definition.methods?.map(method => `
  ${method.name}(${method.params?.join(', ') || ''}): ${method.returnType || 'any'} {
    ${method.body}
  }
  `).join('') || ''}
}
    `;

    // Compile and validate class
    const compiledClass = await this.compileClass(classCode, className);
    
    return {
      name: className,
      code: classCode,
      compiled: compiledClass
    };
  }

  async createTemplate(definition: CustomWidgetDefinition): Promise<GeneratedTemplate> {
    let templateContent = definition.templateContent;
    
    if (!templateContent) {
      // Generate default template
      templateContent = this.generateDefaultTemplate(definition);
    }

    // Validate template syntax
    const validation = await this.validateTemplate(templateContent);
    if (!validation.valid) {
      throw new Error(`Invalid template: ${validation.errors.join(', ')}`);
    }

    const templatePath = `widgets/custom/${definition.id}`;
    await this.saveTemplate(templatePath, templateContent);

    return {
      path: templatePath,
      content: templateContent
    };
  }

  private generateDefaultTemplate(definition: CustomWidgetDefinition): string {
    let template = `<div class="widget widget-${definition.id}">`;
    
    // Add title if title setting exists
    if (definition.settings.title) {
      template += `
  {{#if settings.title.value}}
  <h3 class="widget-title">{{settings.title.value}}</h3>
  {{/if}}`;
    }

    template += `
  <div class="widget-content">
    <!-- Custom widget content -->
    ${definition.defaultContent || '<p>Custom widget content goes here</p>'}
  </div>
</div>`;

    return template;
  }

  async generateAssets(definition: CustomWidgetDefinition): Promise<ThemeAssets> {
    const assets: ThemeAssets = {
      css: [],
      js: [],
      fonts: [],
      images: [],
      icons: []
    };

    // Generate CSS if styles provided
    if (definition.styles) {
      const cssFile = await this.generateCSS(definition);
      assets.css.push(cssFile);
    }

    // Generate JavaScript if scripts provided
    if (definition.scripts) {
      const jsFile = await this.generateJS(definition);
      assets.js.push(jsFile);
    }

    return assets;
  }

  private async generateCSS(definition: CustomWidgetDefinition): Promise<AssetFile> {
    let css = `
.widget-${definition.id} {
  ${definition.styles?.container || ''}
}

.widget-${definition.id} .widget-title {
  ${definition.styles?.title || ''}
}

.widget-${definition.id} .widget-content {
  ${definition.styles?.content || ''}
}

${definition.styles?.custom || ''}
    `;

    const fileName = `${definition.id}.css`;
    const filePath = `assets/widgets/${fileName}`;
    
    await this.saveAsset(filePath, css);

    return {
      name: fileName,
      path: filePath,
      minified: false,
      size: Buffer.byteLength(css, 'utf8')
    };
  }

  private async generateJS(definition: CustomWidgetDefinition): Promise<AssetFile> {
    let js = `
(function() {
  'use strict';
  
  class ${this.pascalCase(definition.id)}WidgetFrontend {
    constructor() {
      this.init();
    }
    
    init() {
      ${definition.scripts?.init || '// Widget initialization'}
    }
    
    ${definition.scripts?.methods?.map(method => `
    ${method.name}(${method.params?.join(', ') || ''}) {
      ${method.body}
    }
    `).join('') || ''}
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new ${this.pascalCase(definition.id)}WidgetFrontend();
    });
  } else {
    new ${this.pascalCase(definition.id)}WidgetFrontend();
  }
})();
    `;

    const fileName = `${definition.id}.js`;
    const filePath = `assets/widgets/${fileName}`;
    
    await this.saveAsset(filePath, js);

    return {
      name: fileName,
      path: filePath,
      minified: false,
      size: Buffer.byteLength(js, 'utf8')
    };
  }
}

interface CustomWidgetDefinition {
  id: string;
  name: string;
  description: string;
  category: WidgetCategory;
  version?: string;
  settings: Record<string, WidgetSetting>;
  template?: string;
  templateContent?: string;
  defaultContent?: string;
  renderLogic?: string;
  methods?: CustomMethod[];
  styles?: {
    container?: string;
    title?: string;
    content?: string;
    custom?: string;
  };
  scripts?: {
    init?: string;
    methods?: CustomMethod[];
  };
  supports?: WidgetSupport[];
  hooks?: WidgetHooks;
}

interface CustomMethod {
  name: string;
  params?: string[];
  returnType?: string;
  body: string;
}

interface GeneratedClass {
  name: string;
  code: string;
  compiled: any;
}

interface GeneratedTemplate {
  path: string;
  content: string;
}
```

---

## 🎨 **Widget Management Interface**

### **Widget Management Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 🧩 Widget Management                   [Add Widget] [Create Custom] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Widget Areas ─────────────────────────────────────┐   │
│ │ 📍 Header (2 widgets)                             │   │
│ │ ┌─────────────────────────────────────────────────┐  │   │
│ │ │ 🔍 Search Widget          [Edit] [Move] [Delete]│  │   │
│ │ │ 🔗 Social Links Widget    [Edit] [Move] [Delete]│  │   │
│ │ └─────────────────────────────────────────────────┘  │   │
│ │                                                   │   │
│ │ 📍 Sidebar (4 widgets)                            │   │
│ │ ┌─────────────────────────────────────────────────┐  │   │
│ │ │ 📝 Recent Posts           [Edit] [Move] [Delete]│  │   │
│ │ │ 🏷️ Categories             [Edit] [Move] [Delete]│  │   │
│ │ │ 📅 Calendar               [Edit] [Move] [Delete]│  │   │
│ │ │ 📊 Popular Posts          [Edit] [Move] [Delete]│  │   │
│ │ └─────────────────────────────────────────────────┘  │   │
│ │                                                   │   │
│ │ 📍 Footer (3 widgets)                             │   │
│ │ ┌─────────────────────────────────────────────────┐  │   │
│ │ │ 📄 Text Widget            [Edit] [Move] [Delete]│  │   │
│ │ │ 🧭 Navigation Menu        [Edit] [Move] [Delete]│  │   │
│ │ │ 📧 Newsletter Signup      [Edit] [Move] [Delete]│  │   │
│ │ └─────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Available Widgets ────────────────────────────────┐   │
│ │ 📝 Content Widgets:                                │   │
│ │ • Text Widget • Recent Posts • Categories          │   │
│ │ • Tags • Archives • Calendar                       │   │
│ │                                                   │   │
│ │ 🧭 Navigation Widgets:                             │   │
│ │ • Navigation Menu • Breadcrumbs • Page Links       │   │
│ │                                                   │   │
│ │ 📱 Social Widgets:                                 │   │
│ │ • Social Links • Twitter Feed • Facebook Like     │   │
│ │                                                   │   │
│ │ 📊 Analytics Widgets:                              │   │
│ │ • Popular Posts • Visitor Counter • Live Stats    │   │
│ │                                                   │   │
│ │ 🎨 Custom Widgets: (3 available)                  │   │
│ │ • Contact Form • Testimonials • Product Showcase  │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Widget Editor Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ ✏️ Edit Widget: Recent Posts              [Save] [Cancel] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Widget Settings ──────────────────────────────────┐   │
│ │ Title: [Recent Blog Posts___________________]      │   │
│ │                                                   │   │
│ │ Number of Posts: [5 ▼]                            │   │
│ │                                                   │   │
│ │ Post Type: [Blog Posts ▼]                         │   │
│ │                                                   │   │
│ │ ☑ Show publication date                           │   │
│ │ ☑ Show excerpt                                    │   │
│ │ Excerpt length: [100] characters                  │   │
│ │ ☐ Show featured image                             │   │
│ │ ☐ Show author name                                │   │
│ │                                                   │   │
│ │ Order by: [Date (newest first) ▼]                 │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Visibility Rules ─────────────────────────────────┐   │
│ │ Show on:                                           │   │
│ │ ☑ All pages    ☐ Home page only                   │   │
│ │ ☐ Blog pages   ☐ Specific pages                   │   │
│ │                                                   │   │
│ │ Device visibility:                                 │   │
│ │ ☑ Desktop      ☑ Tablet      ☑ Mobile            │   │
│ │                                                   │   │
│ │ User roles:                                        │   │
│ │ ☑ All users    ☐ Logged in   ☐ Specific roles    │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Preview ──────────────────────────────────────────┐   │
│ │ ┌─ Recent Blog Posts ─────────────────────────────┐ │   │
│ │ │ • Latest Website Redesign Tips                  │ │   │
│ │ │   December 20, 2023                             │ │   │
│ │ │   Learn the best practices for modern web...    │ │   │
│ │ │                                                │ │   │
│ │ │ • SEO Optimization Guide                        │ │   │
│ │ │   December 18, 2023                             │ │   │
│ │ │   Improve your search engine rankings with...   │ │   │
│ │ │                                                │ │   │
│ │ │ • Content Marketing Strategy                    │ │   │
│ │ │   December 15, 2023                             │ │   │
│ │ │   Create engaging content that converts...      │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Widget management
GET    /api/widgets                      // List all widgets
POST   /api/widgets                      // Create widget
GET    /api/widgets/{id}                 // Get widget details
PUT    /api/widgets/{id}                 // Update widget
DELETE /api/widgets/{id}                 // Delete widget

// Widget areas
GET    /api/widget-areas                 // List widget areas
GET    /api/widget-areas/{id}            // Get area details
GET    /api/widget-areas/{id}/widgets    // Get area widgets
POST   /api/widget-areas/{id}/widgets    // Add widget to area
PUT    /api/widget-areas/{id}/reorder    // Reorder area widgets

// Widget types
GET    /api/widget-types                 // List available types
GET    /api/widget-types/{id}            // Get type details
POST   /api/widget-types                 // Create custom type
PUT    /api/widget-types/{id}            // Update custom type
DELETE /api/widget-types/{id}            // Delete custom type

// Widget rendering
GET    /api/widgets/{id}/render          // Render single widget
GET    /api/widget-areas/{id}/render     // Render widget area
POST   /api/widgets/{id}/preview         // Preview widget changes
```

### **Database Schema:**
```sql
-- Widget types
CREATE TABLE widget_types (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  class_name VARCHAR(255) NOT NULL,
  template VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  settings_schema JSONB NOT NULL,
  default_settings JSONB,
  supports TEXT[],
  hooks JSONB,
  assets JSONB,
  version VARCHAR(20) DEFAULT '1.0.0',
  is_custom BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Widgets
CREATE TABLE widgets (
  id UUID PRIMARY KEY,
  type_id VARCHAR(100) REFERENCES widget_types(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  area VARCHAR(100) NOT NULL,
  position INTEGER NOT NULL,
  settings JSONB NOT NULL,
  visibility JSONB,
  permissions JSONB,
  metadata JSONB,
  performance JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Widget areas
CREATE TABLE widget_areas (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  theme VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  max_widgets INTEGER,
  allowed_types TEXT[],
  default_widgets JSONB,
  settings JSONB NOT NULL,
  conditions JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Widget cache
CREATE TABLE widget_cache (
  cache_key VARCHAR(255) PRIMARY KEY,
  widget_id UUID REFERENCES widgets(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Widget analytics
CREATE TABLE widget_analytics (
  id UUID PRIMARY KEY,
  widget_id UUID REFERENCES widgets(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  render_count INTEGER DEFAULT 0,
  avg_render_time INTEGER DEFAULT 0,
  cache_hits INTEGER DEFAULT 0,
  cache_misses INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(widget_id, date)
);

-- Indexes for performance
CREATE INDEX idx_widgets_area ON widgets(area);
CREATE INDEX idx_widgets_position ON widgets(area, position);
CREATE INDEX idx_widgets_type ON widgets(type_id);
CREATE INDEX idx_widget_cache_expires ON widget_cache(expires_at);
CREATE INDEX idx_widget_analytics_widget_date ON widget_analytics(widget_id, date);
```

---

## 🔗 **Related Documentation**

- **[Theme Customizer](./customizer.md)** - Widget integration dalam customizer
- **[Theme Management](./management.md)** - Widget support dalam themes
- **[Navigation Menus](./menus.md)** - Menu widget integration
- **[Content Management](../02_content/)** - Content widget data sources

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
