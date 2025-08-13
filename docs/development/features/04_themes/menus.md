# 🧭 Navigation Menu System

> **Advanced Menu Builder JA-CMS**  
> Drag-drop menu builder dengan mega menus, conditional display, dan analytics

---

## 📋 **Deskripsi**

Navigation Menu System menyediakan tools yang powerful untuk membuat, mengelola, dan menampilkan navigation menus dalam JA-CMS. Sistem ini mendukung hierarchical menu structure, drag-drop builder, mega menus, conditional display rules, dan comprehensive analytics untuk memberikan navigation experience yang optimal.

---

## ⭐ **Core Features**

### **1. 🏗️ Menu Builder & Management**

#### **Menu Architecture:**
```typescript
interface NavigationMenu {
  id: string;
  name: string;
  slug: string;
  description?: string;
  location: MenuLocation;
  theme?: string;
  items: MenuItem[];
  settings: MenuSettings;
  permissions: MenuPermissions;
  analytics: MenuAnalytics;
  metadata: {
    isActive: boolean;
    isSystem: boolean;
    itemCount: number;
    maxDepth: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    lastUsed?: Date;
  };
}

interface MenuItem {
  id: string;
  parentId?: string;
  title: string;
  url: string;
  type: MenuItemType;
  target: '_self' | '_blank' | '_parent' | '_top';
  cssClasses?: string[];
  icon?: MenuIcon;
  badge?: MenuBadge;
  description?: string;
  order: number;
  depth: number;
  children: MenuItem[];
  visibility: ItemVisibility;
  settings: ItemSettings;
  metadata: {
    objectId?: string; // For page/post/category items
    objectType?: string;
    clicks: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface MenuSettings {
  layout: 'horizontal' | 'vertical' | 'dropdown' | 'mega';
  theme: string;
  responsive: {
    breakpoint: number;
    mobileLayout: 'hamburger' | 'accordion' | 'slide';
    showMobileToggle: boolean;
  };
  styling: {
    container: CSSProperties;
    items: CSSProperties;
    activeItem: CSSProperties;
    dropdown: CSSProperties;
  };
  behavior: {
    hoverDelay: number;
    clickToOpen: boolean;
    closeOnClick: boolean;
    autoClose: boolean;
    smoothScroll: boolean;
  };
  seo: {
    includeInSitemap: boolean;
    nofollow: boolean;
    structured: boolean;
  };
}

interface ItemVisibility {
  rules: VisibilityRule[];
  schedule?: {
    start?: Date;
    end?: Date;
    timezone?: string;
  };
  conditions: DisplayCondition[];
}

interface MenuIcon {
  type: 'class' | 'svg' | 'image' | 'emoji';
  value: string;
  position: 'before' | 'after' | 'replace';
  size?: string;
  color?: string;
}

interface MenuBadge {
  text: string;
  color: string;
  backgroundColor: string;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  shape: 'circle' | 'rounded' | 'square';
}

type MenuItemType = 'page' | 'post' | 'category' | 'tag' | 'custom' | 'external' | 'separator' | 'mega';
type MenuLocation = 'primary' | 'secondary' | 'footer' | 'mobile' | 'sidebar' | 'custom';
```

#### **Menu Management Service:**
```typescript
export class MenuManagementService {
  private menuBuilder: MenuBuilder;
  private itemFactory: MenuItemFactory;
  private renderer: MenuRenderer;
  private analyticsTracker: MenuAnalyticsTracker;
  private permissionManager: PermissionManager;

  async createMenu(menuData: CreateMenuData): Promise<NavigationMenu> {
    // Validate menu data
    const validation = await this.validateMenuData(menuData);
    if (!validation.valid) {
      throw new Error(`Invalid menu data: ${validation.errors.join(', ')}`);
    }

    // Check permissions
    const canCreate = await this.permissionManager.canCreateMenu(menuData.createdBy);
    if (!canCreate) {
      throw new Error('Insufficient permissions to create menu');
    }

    // Generate unique slug
    const slug = await this.generateUniqueSlug(menuData.name);

    // Create menu
    const menu: NavigationMenu = {
      id: this.generateMenuId(),
      name: menuData.name,
      slug,
      description: menuData.description,
      location: menuData.location,
      theme: menuData.theme,
      items: [],
      settings: menuData.settings || this.getDefaultSettings(),
      permissions: menuData.permissions || this.getDefaultPermissions(),
      analytics: this.initializeAnalytics(),
      metadata: {
        isActive: true,
        isSystem: false,
        itemCount: 0,
        maxDepth: 0,
        createdBy: menuData.createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    // Store menu
    await this.storeMenu(menu);

    // Initialize default items if provided
    if (menuData.defaultItems && menuData.defaultItems.length > 0) {
      await this.addMenuItems(menu.id, menuData.defaultItems);
    }

    return menu;
  }

  async addMenuItem(menuId: string, itemData: AddMenuItemData): Promise<MenuItem> {
    const menu = await this.getMenu(menuId);
    if (!menu) {
      throw new Error('Menu not found');
    }

    // Check permissions
    const canEdit = await this.permissionManager.canEditMenu(itemData.addedBy, menu);
    if (!canEdit) {
      throw new Error('Insufficient permissions to edit menu');
    }

    // Validate item data
    const validation = await this.validateItemData(itemData);
    if (!validation.valid) {
      throw new Error(`Invalid menu item data: ${validation.errors.join(', ')}`);
    }

    // Calculate position and depth
    const order = await this.getNextOrder(menuId, itemData.parentId);
    const depth = await this.calculateDepth(itemData.parentId);

    // Create menu item
    const menuItem: MenuItem = {
      id: this.generateItemId(),
      parentId: itemData.parentId,
      title: itemData.title,
      url: await this.resolveItemUrl(itemData),
      type: itemData.type,
      target: itemData.target || '_self',
      cssClasses: itemData.cssClasses || [],
      icon: itemData.icon,
      badge: itemData.badge,
      description: itemData.description,
      order,
      depth,
      children: [],
      visibility: itemData.visibility || this.getDefaultVisibility(),
      settings: itemData.settings || {},
      metadata: {
        objectId: itemData.objectId,
        objectType: itemData.objectType,
        clicks: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    // Add item to menu
    await this.insertMenuItem(menuId, menuItem);

    // Update menu metadata
    await this.updateMenuMetadata(menuId);

    // Clear menu cache
    await this.clearMenuCache(menuId);

    return menuItem;
  }

  async reorderMenuItems(menuId: string, itemOrders: ItemOrder[]): Promise<void> {
    const menu = await this.getMenu(menuId);
    if (!menu) {
      throw new Error('Menu not found');
    }

    // Validate reorder data
    const validation = await this.validateReorderData(itemOrders, menu.items);
    if (!validation.valid) {
      throw new Error(`Invalid reorder data: ${validation.errors.join(', ')}`);
    }

    // Apply new order
    await this.applyItemOrders(menuId, itemOrders);

    // Rebuild menu hierarchy
    await this.rebuildMenuHierarchy(menuId);

    // Update menu metadata
    await this.updateMenuMetadata(menuId);

    // Clear cache
    await this.clearMenuCache(menuId);
  }

  async createMegaMenu(menuId: string, itemId: string, megaConfig: MegaMenuConfig): Promise<MegaMenuItem> {
    const menu = await this.getMenu(menuId);
    const item = await this.getMenuItem(itemId);
    
    if (!menu || !item) {
      throw new Error('Menu or item not found');
    }

    // Convert regular item to mega menu
    const megaItem: MegaMenuItem = {
      ...item,
      type: 'mega',
      megaConfig: {
        layout: megaConfig.layout,
        columns: megaConfig.columns,
        content: megaConfig.content,
        styling: megaConfig.styling,
        responsive: megaConfig.responsive
      }
    };

    // Update item
    await this.updateMenuItem(itemId, megaItem);

    // Generate mega menu content
    await this.generateMegaContent(megaItem);

    return megaItem;
  }

  async renderMenu(menuId: string, context: MenuRenderContext = {}): Promise<MenuRenderResult> {
    const menu = await this.getMenu(menuId);
    if (!menu) {
      throw new Error('Menu not found');
    }

    // Check menu visibility
    const isVisible = await this.checkMenuVisibility(menu, context);
    if (!isVisible) {
      return {
        html: '',
        visible: false,
        cached: false
      };
    }

    // Check cache
    const cacheKey = this.generateMenuCacheKey(menu, context);
    const cached = await this.getCachedMenu(cacheKey);
    if (cached) {
      return {
        html: cached.html,
        visible: true,
        cached: true,
        cacheKey
      };
    }

    const startTime = Date.now();

    try {
      // Filter visible items
      const visibleItems = await this.filterVisibleItems(menu.items, context);

      // Build menu structure
      const menuStructure = await this.buildMenuStructure(visibleItems, context);

      // Render menu HTML
      const html = await this.renderer.render(menu, menuStructure, context);

      // Calculate render time
      const renderTime = Date.now() - startTime;

      // Cache result
      await this.cacheMenu(cacheKey, html, menu.settings.cache?.duration || 3600);

      // Track analytics
      await this.analyticsTracker.trackMenuRender(menu.id, context, renderTime);

      return {
        html,
        visible: true,
        cached: false,
        renderTime,
        cacheKey
      };

    } catch (error) {
      console.error(`Error rendering menu ${menuId}:`, error);
      
      return {
        html: this.getErrorFallback(menu, error),
        visible: true,
        cached: false,
        error: error.message
      };
    }
  }

  async trackMenuClick(menuId: string, itemId: string, context: ClickContext): Promise<void> {
    // Update item click count
    await this.incrementItemClicks(itemId);

    // Track analytics
    await this.analyticsTracker.trackItemClick({
      menuId,
      itemId,
      userId: context.userId,
      sessionId: context.sessionId,
      referrer: context.referrer,
      userAgent: context.userAgent,
      timestamp: new Date()
    });

    // Update menu analytics
    await this.updateMenuAnalytics(menuId);
  }

  async generateBreadcrumb(currentUrl: string, menuId?: string): Promise<BreadcrumbItem[]> {
    const breadcrumb: BreadcrumbItem[] = [];
    
    // Add home item
    breadcrumb.push({
      title: 'Home',
      url: '/',
      isHome: true,
      isCurrent: currentUrl === '/'
    });

    if (currentUrl === '/') {
      return breadcrumb;
    }

    // Find menu path if menu specified
    if (menuId) {
      const menuPath = await this.findMenuPath(menuId, currentUrl);
      if (menuPath.length > 0) {
        breadcrumb.push(...menuPath.map((item, index) => ({
          title: item.title,
          url: item.url,
          isHome: false,
          isCurrent: index === menuPath.length - 1
        })));
        return breadcrumb;
      }
    }

    // Generate breadcrumb from URL structure
    const urlParts = currentUrl.split('/').filter(Boolean);
    let currentPath = '';

    for (let i = 0; i < urlParts.length; i++) {
      currentPath += '/' + urlParts[i];
      const isLast = i === urlParts.length - 1;
      
      // Try to resolve title from content
      const title = await this.resolvePageTitle(currentPath) || this.formatUrlPart(urlParts[i]);
      
      breadcrumb.push({
        title,
        url: isLast ? '' : currentPath, // Don't link current page
        isHome: false,
        isCurrent: isLast
      });
    }

    return breadcrumb;
  }

  private async filterVisibleItems(items: MenuItem[], context: MenuRenderContext): Promise<MenuItem[]> {
    const visibleItems: MenuItem[] = [];

    for (const item of items) {
      const isVisible = await this.checkItemVisibility(item, context);
      
      if (isVisible) {
        const visibleItem = { ...item };
        
        // Recursively filter children
        if (item.children && item.children.length > 0) {
          visibleItem.children = await this.filterVisibleItems(item.children, context);
        }
        
        visibleItems.push(visibleItem);
      }
    }

    return visibleItems;
  }

  private async checkItemVisibility(item: MenuItem, context: MenuRenderContext): Promise<boolean> {
    const rules = item.visibility.rules;

    // Check each visibility rule
    for (const rule of rules) {
      const ruleResult = await this.evaluateVisibilityRule(rule, context);
      if (!ruleResult) {
        return false;
      }
    }

    // Check schedule
    if (item.visibility.schedule) {
      const now = new Date();
      if (item.visibility.schedule.start && now < item.visibility.schedule.start) {
        return false;
      }
      if (item.visibility.schedule.end && now > item.visibility.schedule.end) {
        return false;
      }
    }

    // Check conditions
    if (item.visibility.conditions.length > 0) {
      const conditionResult = await this.evaluateDisplayConditions(item.visibility.conditions, context);
      if (!conditionResult) {
        return false;
      }
    }

    return true;
  }

  private async resolveItemUrl(itemData: AddMenuItemData): Promise<string> {
    switch (itemData.type) {
      case 'page':
        return this.getPageUrl(itemData.objectId!);
      case 'post':
        return this.getPostUrl(itemData.objectId!);
      case 'category':
        return this.getCategoryUrl(itemData.objectId!);
      case 'tag':
        return this.getTagUrl(itemData.objectId!);
      case 'custom':
      case 'external':
        return itemData.url || '#';
      default:
        return itemData.url || '#';
    }
  }
}

interface CreateMenuData {
  name: string;
  description?: string;
  location: MenuLocation;
  theme?: string;
  settings?: MenuSettings;
  permissions?: MenuPermissions;
  defaultItems?: AddMenuItemData[];
  createdBy: string;
}

interface AddMenuItemData {
  parentId?: string;
  title: string;
  url?: string;
  type: MenuItemType;
  target?: string;
  cssClasses?: string[];
  icon?: MenuIcon;
  badge?: MenuBadge;
  description?: string;
  visibility?: ItemVisibility;
  settings?: ItemSettings;
  objectId?: string;
  objectType?: string;
  addedBy: string;
}

interface MenuRenderContext {
  userId?: string;
  userRole?: string;
  currentUrl?: string;
  device?: 'desktop' | 'tablet' | 'mobile';
  theme?: string;
  language?: string;
  customData?: Record<string, any>;
}

interface MenuRenderResult {
  html: string;
  visible: boolean;
  cached: boolean;
  renderTime?: number;
  cacheKey?: string;
  error?: string;
}

interface BreadcrumbItem {
  title: string;
  url: string;
  isHome: boolean;
  isCurrent: boolean;
}

interface ItemOrder {
  itemId: string;
  parentId?: string;
  order: number;
}

interface ClickContext {
  userId?: string;
  sessionId: string;
  referrer?: string;
  userAgent: string;
}
```

### **2. 🎨 Mega Menu System**

#### **Mega Menu Builder:**
```typescript
export class MegaMenuBuilder {
  async createMegaMenu(config: MegaMenuConfig): Promise<MegaMenuItem> {
    const megaMenu: MegaMenuItem = {
      id: this.generateId(),
      title: config.title,
      type: 'mega',
      url: config.url || '#',
      target: '_self',
      order: 0,
      depth: 0,
      children: [],
      visibility: this.getDefaultVisibility(),
      settings: {},
      metadata: {
        clicks: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      megaConfig: {
        layout: config.layout || 'grid',
        columns: config.columns || 4,
        content: config.content || [],
        styling: config.styling || {},
        responsive: config.responsive || {
          breakpoint: 768,
          mobileLayout: 'accordion'
        }
      }
    };

    return megaMenu;
  }

  async renderMegaMenu(megaItem: MegaMenuItem, context: MenuRenderContext): Promise<string> {
    const config = megaItem.megaConfig;
    let html = `<div class="mega-menu" data-layout="${config.layout}" data-columns="${config.columns}">`;

    // Render content sections
    for (const section of config.content) {
      html += await this.renderMegaSection(section, context);
    }

    html += '</div>';

    return html;
  }

  private async renderMegaSection(section: MegaMenuSection, context: MenuRenderContext): Promise<string> {
    let sectionHtml = `<div class="mega-section mega-section-${section.type}" data-column="${section.column}">`;

    switch (section.type) {
      case 'menu':
        sectionHtml += await this.renderMenuSection(section as MenuSection, context);
        break;
      case 'content':
        sectionHtml += await this.renderContentSection(section as ContentSection, context);
        break;
      case 'widget':
        sectionHtml += await this.renderWidgetSection(section as WidgetSection, context);
        break;
      case 'image':
        sectionHtml += await this.renderImageSection(section as ImageSection, context);
        break;
    }

    sectionHtml += '</div>';
    return sectionHtml;
  }

  private async renderMenuSection(section: MenuSection, context: MenuRenderContext): Promise<string> {
    let html = '';
    
    if (section.title) {
      html += `<h3 class="mega-section-title">${section.title}</h3>`;
    }

    html += '<ul class="mega-menu-list">';
    
    for (const item of section.items) {
      const isActive = context.currentUrl === item.url;
      const activeClass = isActive ? ' active' : '';
      
      html += `<li class="mega-menu-item${activeClass}">`;
      html += `<a href="${item.url}" target="${item.target || '_self'}"`;
      
      if (item.cssClasses && item.cssClasses.length > 0) {
        html += ` class="${item.cssClasses.join(' ')}"`;
      }
      
      html += '>';
      
      if (item.icon) {
        html += this.renderIcon(item.icon);
      }
      
      html += item.title;
      
      if (item.badge) {
        html += this.renderBadge(item.badge);
      }
      
      html += '</a>';
      
      if (item.description) {
        html += `<p class="mega-item-description">${item.description}</p>`;
      }
      
      html += '</li>';
    }
    
    html += '</ul>';
    return html;
  }

  private async renderContentSection(section: ContentSection, context: MenuRenderContext): Promise<string> {
    let html = '';
    
    if (section.title) {
      html += `<h3 class="mega-section-title">${section.title}</h3>`;
    }

    html += `<div class="mega-content">${section.content}</div>`;
    
    if (section.link) {
      html += `<a href="${section.link.url}" class="mega-section-link" target="${section.link.target || '_self'}">${section.link.text}</a>`;
    }

    return html;
  }

  private async renderWidgetSection(section: WidgetSection, context: MenuRenderContext): Promise<string> {
    // Render widget content
    const widget = await this.getWidget(section.widgetId);
    if (!widget) {
      return '<div class="mega-widget-error">Widget not found</div>';
    }

    return await this.renderWidget(widget, context);
  }

  private async renderImageSection(section: ImageSection, context: MenuRenderContext): Promise<string> {
    let html = `<div class="mega-image-section">`;
    
    if (section.link) {
      html += `<a href="${section.link.url}" target="${section.link.target || '_self'}">`;
    }
    
    html += `<img src="${section.imageUrl}" alt="${section.altText || ''}"`;
    
    if (section.title) {
      html += ` title="${section.title}"`;
    }
    
    html += ' />';
    
    if (section.link) {
      html += '</a>';
    }
    
    if (section.caption) {
      html += `<p class="mega-image-caption">${section.caption}</p>`;
    }
    
    html += '</div>';
    return html;
  }

  private renderIcon(icon: MenuIcon): string {
    switch (icon.type) {
      case 'class':
        return `<i class="${icon.value}"${icon.color ? ` style="color: ${icon.color}"` : ''}></i>`;
      case 'svg':
        return icon.value;
      case 'image':
        return `<img src="${icon.value}" alt="" class="menu-icon"${icon.size ? ` style="width: ${icon.size}; height: ${icon.size}"` : ''} />`;
      case 'emoji':
        return `<span class="menu-emoji">${icon.value}</span>`;
      default:
        return '';
    }
  }

  private renderBadge(badge: MenuBadge): string {
    return `<span class="menu-badge badge-${badge.shape} badge-${badge.position}" style="color: ${badge.color}; background-color: ${badge.backgroundColor}">${badge.text}</span>`;
  }
}

interface MegaMenuConfig {
  title: string;
  url?: string;
  layout: 'grid' | 'columns' | 'tabs';
  columns: number;
  content: MegaMenuSection[];
  styling: {
    width?: string;
    maxWidth?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderRadius?: string;
    padding?: string;
    shadow?: string;
  };
  responsive: {
    breakpoint: number;
    mobileLayout: 'accordion' | 'tabs' | 'stack';
  };
}

interface MegaMenuItem extends MenuItem {
  megaConfig: MegaMenuConfig;
}

interface MegaMenuSection {
  id: string;
  type: 'menu' | 'content' | 'widget' | 'image';
  column: number;
  title?: string;
  order: number;
}

interface MenuSection extends MegaMenuSection {
  type: 'menu';
  items: MenuItem[];
}

interface ContentSection extends MegaMenuSection {
  type: 'content';
  content: string;
  link?: {
    url: string;
    text: string;
    target?: string;
  };
}

interface WidgetSection extends MegaMenuSection {
  type: 'widget';
  widgetId: string;
}

interface ImageSection extends MegaMenuSection {
  type: 'image';
  imageUrl: string;
  altText?: string;
  caption?: string;
  link?: {
    url: string;
    target?: string;
  };
}
```

### **3. 📊 Menu Analytics & Optimization**

#### **Menu Analytics Service:**
```typescript
export class MenuAnalyticsService {
  async getMenuAnalytics(menuId: string, timeRange: DateRange): Promise<MenuAnalytics> {
    const menu = await this.getMenu(menuId);
    if (!menu) {
      throw new Error('Menu not found');
    }

    const analytics = await this.calculateMenuAnalytics(menuId, timeRange);
    
    return {
      menu,
      timeRange,
      overview: {
        totalClicks: analytics.totalClicks,
        uniqueUsers: analytics.uniqueUsers,
        averageDepth: analytics.averageDepth,
        bounceRate: analytics.bounceRate,
        conversionRate: analytics.conversionRate
      },
      itemPerformance: await this.getItemPerformance(menuId, timeRange),
      pathAnalysis: await this.analyzeUserPaths(menuId, timeRange),
      deviceBreakdown: await this.getDeviceBreakdown(menuId, timeRange),
      trends: await this.calculateMenuTrends(menuId, timeRange),
      insights: await this.generateMenuInsights(analytics)
    };
  }

  async optimizeMenu(menuId: string): Promise<MenuOptimization> {
    const analytics = await this.getMenuAnalytics(menuId, {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
      end: new Date()
    });

    const optimizations: MenuOptimizationSuggestion[] = [];

    // Analyze item performance
    const lowPerformingItems = analytics.itemPerformance
      .filter(item => item.clickRate < 0.05) // Less than 5% click rate
      .sort((a, b) => a.clickRate - b.clickRate);

    if (lowPerformingItems.length > 0) {
      optimizations.push({
        type: 'low_performance',
        priority: 'medium',
        title: 'Low-performing menu items detected',
        description: `${lowPerformingItems.length} menu items have very low click rates`,
        affectedItems: lowPerformingItems.map(i => i.itemId),
        recommendations: [
          'Consider repositioning low-performing items',
          'Review item labels for clarity',
          'Remove unused items to reduce clutter'
        ],
        estimatedImpact: 'Improve navigation efficiency by 15-25%'
      });
    }

    // Analyze menu depth
    if (analytics.overview.averageDepth > 3) {
      optimizations.push({
        type: 'excessive_depth',
        priority: 'high',
        title: 'Menu structure too deep',
        description: `Average navigation depth is ${analytics.overview.averageDepth.toFixed(1)} levels`,
        recommendations: [
          'Flatten menu structure',
          'Group related items',
          'Consider mega menus for complex sections'
        ],
        estimatedImpact: 'Reduce user effort by 20-30%'
      });
    }

    // Analyze mobile performance
    const mobilePerformance = analytics.deviceBreakdown.find(d => d.device === 'mobile');
    if (mobilePerformance && mobilePerformance.bounceRate > 60) {
      optimizations.push({
        type: 'mobile_optimization',
        priority: 'high',
        title: 'Poor mobile navigation experience',
        description: `Mobile bounce rate is ${mobilePerformance.bounceRate.toFixed(1)}%`,
        recommendations: [
          'Optimize for mobile-first design',
          'Implement hamburger menu',
          'Reduce menu complexity on mobile'
        ],
        estimatedImpact: 'Improve mobile engagement by 25-40%'
      });
    }

    // Analyze conversion paths
    const conversionPaths = await this.analyzeConversionPaths(menuId);
    const lowConvertingPaths = conversionPaths.filter(p => p.conversionRate < 0.1);

    if (lowConvertingPaths.length > 0) {
      optimizations.push({
        type: 'conversion_optimization',
        priority: 'medium',
        title: 'Low conversion paths identified',
        description: `${lowConvertingPaths.length} navigation paths have low conversion rates`,
        recommendations: [
          'Optimize call-to-action placement',
          'Improve landing page relevance',
          'Add conversion-focused menu items'
        ],
        estimatedImpact: 'Increase conversions by 10-20%'
      });
    }

    return {
      menuId,
      currentPerformance: analytics.overview,
      optimizations,
      priorityActions: optimizations
        .filter(o => o.priority === 'high')
        .slice(0, 3),
      estimatedImpact: this.calculateTotalImpact(optimizations)
    };
  }

  async generateMenuHeatmap(menuId: string, timeRange: DateRange): Promise<MenuHeatmap> {
    const clickData = await this.getMenuClickData(menuId, timeRange);
    const menu = await this.getMenu(menuId);
    
    const heatmapData: HeatmapItem[] = [];
    
    // Calculate click intensity for each menu item
    const maxClicks = Math.max(...clickData.map(d => d.clicks));
    
    for (const item of this.flattenMenuItems(menu.items)) {
      const itemClicks = clickData.find(d => d.itemId === item.id)?.clicks || 0;
      const intensity = maxClicks > 0 ? itemClicks / maxClicks : 0;
      
      heatmapData.push({
        itemId: item.id,
        title: item.title,
        clicks: itemClicks,
        intensity,
        position: this.getItemPosition(item),
        depth: item.depth
      });
    }

    return {
      menuId,
      timeRange,
      maxClicks,
      items: heatmapData,
      insights: this.generateHeatmapInsights(heatmapData)
    };
  }

  private async generateMenuInsights(analytics: any): Promise<MenuInsight[]> {
    const insights: MenuInsight[] = [];

    // High bounce rate insight
    if (analytics.bounceRate > 50) {
      insights.push({
        type: 'performance',
        severity: 'warning',
        title: 'High Navigation Bounce Rate',
        description: `${analytics.bounceRate.toFixed(1)}% of users leave after viewing only one page`,
        recommendation: 'Review menu structure and improve internal linking',
        impact: 'high'
      });
    }

    // Popular path insight
    const topPath = analytics.topPaths?.[0];
    if (topPath && topPath.usage > 20) {
      insights.push({
        type: 'opportunity',
        severity: 'info',
        title: 'Popular Navigation Path Identified',
        description: `${topPath.usage.toFixed(1)}% of users follow the path: ${topPath.path.join(' → ')}`,
        recommendation: 'Consider optimizing this path or creating shortcuts',
        impact: 'medium'
      });
    }

    // Underused items insight
    const underusedItems = analytics.itemPerformance?.filter(item => item.clickRate < 0.02);
    if (underusedItems && underusedItems.length > 0) {
      insights.push({
        type: 'optimization',
        severity: 'info',
        title: 'Underused Menu Items',
        description: `${underusedItems.length} menu items receive very few clicks`,
        recommendation: 'Consider removing or repositioning underused items',
        impact: 'low'
      });
    }

    return insights;
  }

  private flattenMenuItems(items: MenuItem[]): MenuItem[] {
    const flattened: MenuItem[] = [];
    
    for (const item of items) {
      flattened.push(item);
      if (item.children && item.children.length > 0) {
        flattened.push(...this.flattenMenuItems(item.children));
      }
    }
    
    return flattened;
  }
}

interface MenuAnalytics {
  menu: NavigationMenu;
  timeRange: DateRange;
  overview: {
    totalClicks: number;
    uniqueUsers: number;
    averageDepth: number;
    bounceRate: number;
    conversionRate: number;
  };
  itemPerformance: ItemPerformance[];
  pathAnalysis: PathAnalysis[];
  deviceBreakdown: DeviceBreakdown[];
  trends: MenuTrend[];
  insights: MenuInsight[];
}

interface MenuOptimization {
  menuId: string;
  currentPerformance: any;
  optimizations: MenuOptimizationSuggestion[];
  priorityActions: MenuOptimizationSuggestion[];
  estimatedImpact: string;
}

interface MenuOptimizationSuggestion {
  type: 'low_performance' | 'excessive_depth' | 'mobile_optimization' | 'conversion_optimization';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  affectedItems?: string[];
  recommendations: string[];
  estimatedImpact: string;
}

interface MenuHeatmap {
  menuId: string;
  timeRange: DateRange;
  maxClicks: number;
  items: HeatmapItem[];
  insights: HeatmapInsight[];
}

interface HeatmapItem {
  itemId: string;
  title: string;
  clicks: number;
  intensity: number; // 0-1
  position: { x: number; y: number };
  depth: number;
}

interface ItemPerformance {
  itemId: string;
  title: string;
  clicks: number;
  clickRate: number;
  conversionRate: number;
  averageTimeToClick: number;
}

interface MenuInsight {
  type: 'performance' | 'opportunity' | 'optimization';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  impact: 'low' | 'medium' | 'high';
}
```

---

## 🎨 **Menu Management Interface**

### **Menu Builder Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 🧭 Menu Builder: Primary Navigation    [Save] [Preview] [Settings] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Menu Structure ───────────────────────────────────┐   │
│ │ 📝 Home                           [Edit] [Delete]  │   │
│ │ 📄 About                          [Edit] [Delete]  │   │
│ │   └─ 👥 Our Team                  [Edit] [Delete]  │   │
│ │   └─ 🏢 Company History           [Edit] [Delete]  │   │
│ │ 🛍️ Products                       [Edit] [Delete]  │   │
│ │   └─ 💻 Software                  [Edit] [Delete]  │   │
│ │       └─ 🌐 Web Development       [Edit] [Delete]  │   │
│ │       └─ 📱 Mobile Apps           [Edit] [Delete]  │   │
│ │   └─ 🎨 Design Services           [Edit] [Delete]  │   │
│ │ 📞 Contact                        [Edit] [Delete]  │   │
│ │ 📰 Blog                           [Edit] [Delete]  │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Add Menu Item ────────────────────────────────────┐   │
│ │ Item Type: [Page ▼]                                │   │
│ │ Select Page: [About Us ▼]                          │   │
│ │ Menu Text: [About Us_________________]             │   │
│ │ Parent Item: [None ▼]                              │   │
│ │                                                   │   │
│ │ Advanced Options:                                  │   │
│ │ Link Target: [Same Window ▼]                       │   │
│ │ CSS Classes: [_________________________]           │   │
│ │ Icon: [🏢] [Choose Icon]                           │   │
│ │ Description: [________________________]            │   │
│ │                                                   │   │
│ │ [Add to Menu]                                      │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Menu Settings ────────────────────────────────────┐   │
│ │ Menu Name: [Primary Navigation___________]         │   │
│ │ Location: [Header Primary ▼]                       │   │
│ │ Layout: [Horizontal ▼]                             │   │
│ │                                                   │   │
│ │ Mobile Settings:                                   │   │
│ │ ☑ Show mobile toggle                               │   │
│ │ Mobile Layout: [Hamburger ▼]                       │   │
│ │ Breakpoint: [768px]                                │   │
│ │                                                   │   │
│ │ Behavior:                                          │   │
│ │ ☑ Close on click outside                           │   │
│ │ ☐ Click to open dropdowns                          │   │
│ │ Hover delay: [300ms]                               │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Mega Menu Builder:**
```
┌─────────────────────────────────────────────────────────┐
│ 🎨 Mega Menu Builder: Products          [Save] [Preview] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Layout Configuration ─────────────────────────────┐   │
│ │ Layout: [Grid ▼]  Columns: [4 ▼]                  │   │
│ │ Width: [Auto ▼]   Max Width: [1200px]             │   │
│ │ Background: [#ffffff] Border: [#e5e5e5]            │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Content Sections ─────────────────────────────────┐   │
│ │ ┌─ Column 1 ──────────────────────────────────────┐ │   │
│ │ │ Section Type: [Menu ▼]                          │ │   │
│ │ │ Title: [Software Products__________]            │ │   │
│ │ │                                                │ │   │
│ │ │ Menu Items:                                     │ │   │
│ │ │ • 🌐 Web Development                            │ │   │
│ │ │ • 📱 Mobile Apps                                │ │   │
│ │ │ • 🖥️ Desktop Software                           │ │   │
│ │ │ • ☁️ Cloud Solutions                            │ │   │
│ │ │                                                │ │   │
│ │ │ [Edit Items] [Add Item]                         │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ │                                                   │   │
│ │ ┌─ Column 2 ──────────────────────────────────────┐ │   │
│ │ │ Section Type: [Content ▼]                       │ │   │
│ │ │ Title: [Featured Product___________]            │ │   │
│ │ │                                                │ │   │
│ │ │ Content:                                        │ │   │
│ │ │ ┌─────────────────────────────────────────────┐ │ │   │
│ │ │ │ Discover our latest web development         │ │ │   │
│ │ │ │ platform with AI-powered features and      │ │ │   │
│ │ │ │ enterprise-grade security.                  │ │ │   │
│ │ │ │                                            │ │ │   │
│ │ │ │ [Learn More →]                              │ │ │   │
│ │ │ └─────────────────────────────────────────────┘ │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ │                                                   │   │
│ │ ┌─ Column 3 ──────────────────────────────────────┐ │   │
│ │ │ Section Type: [Image ▼]                         │ │   │
│ │ │                                                │ │   │
│ │ │ ┌─────────────────────────────────────────────┐ │ │   │
│ │ │ │ [📸 Product Screenshot]                     │ │ │   │
│ │ │ │                                            │ │ │   │
│ │ │ │ New Product Launch                          │ │ │   │
│ │ │ │ Starting at $99/month                       │ │ │   │
│ │ │ └─────────────────────────────────────────────┘ │ │   │
│ │ │                                                │ │   │
│ │ │ [Upload Image] [Edit Caption]                   │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Preview ──────────────────────────────────────────┐   │
│ │ Products ▼                                         │   │
│ │ ┌─────────────────────────────────────────────────┐ │   │
│ │ │ Software Products  │ Featured Product │ [Image] │ │   │
│ │ │ • Web Development  │ Discover our...  │ Product │ │   │
│ │ │ • Mobile Apps      │ latest platform  │ Launch  │ │   │
│ │ │ • Desktop Software │ with AI-powered  │ $99/mo  │ │   │
│ │ │ • Cloud Solutions  │ [Learn More →]   │         │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Menu management
GET    /api/menus                        // List all menus
POST   /api/menus                        // Create menu
GET    /api/menus/{id}                   // Get menu details
PUT    /api/menus/{id}                   // Update menu
DELETE /api/menus/{id}                   // Delete menu

// Menu items
POST   /api/menus/{id}/items             // Add menu item
PUT    /api/menus/{id}/items/{itemId}    // Update menu item
DELETE /api/menus/{id}/items/{itemId}    // Delete menu item
POST   /api/menus/{id}/reorder           // Reorder menu items

// Menu rendering
GET    /api/menus/{id}/render            // Render menu HTML
POST   /api/menus/{id}/preview           // Preview menu changes
GET    /api/breadcrumb                   // Generate breadcrumb

// Mega menus
POST   /api/menus/{id}/items/{itemId}/mega // Create mega menu
PUT    /api/menus/{id}/items/{itemId}/mega  // Update mega menu
DELETE /api/menus/{id}/items/{itemId}/mega // Remove mega menu

// Menu analytics
GET    /api/menus/{id}/analytics         // Get menu analytics
POST   /api/menus/{id}/track-click       // Track menu click
GET    /api/menus/{id}/heatmap           // Get menu heatmap
POST   /api/menus/{id}/optimize          // Get optimization suggestions
```

### **Database Schema:**
```sql
-- Menus
CREATE TABLE menus (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  location VARCHAR(50) NOT NULL,
  theme VARCHAR(100),
  settings JSONB NOT NULL,
  permissions JSONB,
  metadata JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Menu items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY,
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(1000) NOT NULL,
  type VARCHAR(50) NOT NULL,
  target VARCHAR(20) DEFAULT '_self',
  css_classes TEXT[],
  icon JSONB,
  badge JSONB,
  description TEXT,
  order_index INTEGER NOT NULL,
  depth INTEGER DEFAULT 0,
  visibility JSONB,
  settings JSONB,
  metadata JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Mega menu content
CREATE TABLE mega_menu_content (
  id UUID PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  layout VARCHAR(50) NOT NULL,
  columns INTEGER DEFAULT 4,
  content JSONB NOT NULL,
  styling JSONB,
  responsive JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Menu analytics
CREATE TABLE menu_analytics (
  id UUID PRIMARY KEY,
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  avg_depth DECIMAL(4,2) DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  device_breakdown JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(menu_id, date)
);

-- Menu item clicks
CREATE TABLE menu_item_clicks (
  id UUID PRIMARY KEY,
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  clicked_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_menus_location ON menus(location);
CREATE INDEX idx_menus_active ON menus(is_active);
CREATE INDEX idx_menu_items_menu ON menu_items(menu_id);
CREATE INDEX idx_menu_items_parent ON menu_items(parent_id);
CREATE INDEX idx_menu_items_order ON menu_items(menu_id, order_index);
CREATE INDEX idx_menu_analytics_menu_date ON menu_analytics(menu_id, date);
CREATE INDEX idx_menu_item_clicks_menu ON menu_item_clicks(menu_id);
CREATE INDEX idx_menu_item_clicks_item ON menu_item_clicks(menu_item_id);
CREATE INDEX idx_menu_item_clicks_clicked_at ON menu_item_clicks(clicked_at);
```

---

## 🔗 **Related Documentation**

- **[Theme Customizer](./customizer.md)** - Menu integration dalam live customizer
- **[Widget System](./widgets.md)** - Navigation widget implementation
- **[Theme Management](./management.md)** - Menu support dalam themes
- **[Content Management](../02_content/)** - Content integration dalam menus

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
