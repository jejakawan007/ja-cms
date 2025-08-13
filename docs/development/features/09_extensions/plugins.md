# 🔌 Plugin System Architecture

> **Sistem Plugin Modular JA-CMS**  
> Extensible platform untuk menambah functionality melalui plugins dan extensions

---

## 📋 **Deskripsi**

Plugin System Architecture menyediakan framework modular yang memungkinkan pengembangan dan integrasi fitur tambahan tanpa mengubah core CMS. Sistem ini dirancang dengan fokus pada keamanan, performa, dan developer experience yang optimal.

---

## ⭐ **Core Features**

### **1. 🧩 Plugin Management System**

#### **Plugin Architecture:**
```typescript
interface Plugin {
  id: string;
  name: string;
  slug: string;
  version: string;
  description: string;
  author: {
    name: string;
    email: string;
    website: string;
    avatar?: string;
  };
  homepage: string;
  repository: string;
  license: string;
  keywords: string[];
  category: PluginCategory;
  icon: string;
  screenshots: string[];
  changelog: ChangelogEntry[];
  requirements: {
    cmsVersion: string;
    phpVersion?: string;
    nodeVersion?: string;
    dependencies: PluginDependency[];
  };
  permissions: string[];
  hooks: HookDefinition[];
  settings: PluginSettings;
  status: 'inactive' | 'active' | 'error' | 'updating';
  installedAt: Date;
  activatedAt?: Date;
  updatedAt: Date;
  downloadCount: number;
  rating: number;
  reviewCount: number;
}

interface PluginDependency {
  name: string;
  version: string;
  optional: boolean;
  type: 'plugin' | 'npm' | 'composer';
}

interface HookDefinition {
  name: string;
  type: 'filter' | 'action';
  priority: number;
  callback: string;
  description: string;
}

type PluginCategory = 
  | 'content' 
  | 'seo' 
  | 'security' 
  | 'performance' 
  | 'analytics' 
  | 'social' 
  | 'ecommerce' 
  | 'utility' 
  | 'integration';
```

#### **Plugin Lifecycle Management:**
```typescript
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private hooks: Map<string, Hook[]> = new Map();
  private sandboxes: Map<string, PluginSandbox> = new Map();

  async installPlugin(pluginPackage: PluginPackage): Promise<InstallationResult> {
    try {
      // Validate plugin package
      const validation = await this.validatePlugin(pluginPackage);
      if (!validation.valid) {
        throw new Error(`Plugin validation failed: ${validation.errors.join(', ')}`);
      }

      // Check dependencies
      const dependencyCheck = await this.checkDependencies(pluginPackage.manifest);
      if (!dependencyCheck.satisfied) {
        throw new Error(`Missing dependencies: ${dependencyCheck.missing.join(', ')}`);
      }

      // Extract plugin files
      const extractPath = await this.extractPlugin(pluginPackage);

      // Install dependencies
      if (pluginPackage.manifest.requirements.dependencies.length > 0) {
        await this.installDependencies(pluginPackage.manifest.requirements.dependencies);
      }

      // Register plugin
      const plugin = await this.registerPlugin(pluginPackage.manifest, extractPath);

      // Create sandbox environment
      const sandbox = await this.createSandbox(plugin);
      this.sandboxes.set(plugin.id, sandbox);

      // Store plugin metadata
      await this.storePluginMetadata(plugin);

      return {
        success: true,
        plugin,
        message: `Plugin ${plugin.name} installed successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to install plugin: ${error.message}`
      };
    }
  }

  async activatePlugin(pluginId: string): Promise<ActivationResult> {
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) {
        throw new Error(`Plugin ${pluginId} not found`);
      }

      if (plugin.status === 'active') {
        return {
          success: true,
          message: 'Plugin is already active'
        };
      }

      // Pre-activation checks
      await this.preActivationChecks(plugin);

      // Load plugin in sandbox
      const sandbox = this.sandboxes.get(pluginId);
      if (!sandbox) {
        throw new Error(`Sandbox not found for plugin ${pluginId}`);
      }

      await sandbox.loadPlugin();

      // Register hooks
      await this.registerPluginHooks(plugin);

      // Run activation hook
      await this.runPluginHook(plugin, 'activate');

      // Update plugin status
      plugin.status = 'active';
      plugin.activatedAt = new Date();

      // Save updated status
      await this.updatePluginStatus(pluginId, 'active');

      return {
        success: true,
        message: `Plugin ${plugin.name} activated successfully`
      };
    } catch (error) {
      // Mark plugin as error state
      await this.updatePluginStatus(pluginId, 'error');
      
      return {
        success: false,
        error: error.message,
        message: `Failed to activate plugin: ${error.message}`
      };
    }
  }

  async deactivatePlugin(pluginId: string): Promise<DeactivationResult> {
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) {
        throw new Error(`Plugin ${pluginId} not found`);
      }

      if (plugin.status !== 'active') {
        return {
          success: true,
          message: 'Plugin is not active'
        };
      }

      // Run deactivation hook
      await this.runPluginHook(plugin, 'deactivate');

      // Unregister hooks
      await this.unregisterPluginHooks(plugin);

      // Unload from sandbox
      const sandbox = this.sandboxes.get(pluginId);
      if (sandbox) {
        await sandbox.unloadPlugin();
      }

      // Update plugin status
      plugin.status = 'inactive';
      plugin.activatedAt = undefined;

      // Save updated status
      await this.updatePluginStatus(pluginId, 'inactive');

      return {
        success: true,
        message: `Plugin ${plugin.name} deactivated successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to deactivate plugin: ${error.message}`
      };
    }
  }

  async uninstallPlugin(pluginId: string): Promise<UninstallationResult> {
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) {
        throw new Error(`Plugin ${pluginId} not found`);
      }

      // Deactivate if active
      if (plugin.status === 'active') {
        await this.deactivatePlugin(pluginId);
      }

      // Run uninstall hook
      await this.runPluginHook(plugin, 'uninstall');

      // Remove sandbox
      const sandbox = this.sandboxes.get(pluginId);
      if (sandbox) {
        await sandbox.destroy();
        this.sandboxes.delete(pluginId);
      }

      // Remove plugin files
      await this.removePluginFiles(plugin);

      // Remove from database
      await this.removePluginMetadata(pluginId);

      // Remove from memory
      this.plugins.delete(pluginId);

      return {
        success: true,
        message: `Plugin ${plugin.name} uninstalled successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to uninstall plugin: ${error.message}`
      };
    }
  }

  private async createSandbox(plugin: Plugin): Promise<PluginSandbox> {
    return new PluginSandbox({
      pluginId: plugin.id,
      pluginPath: this.getPluginPath(plugin),
      permissions: plugin.permissions,
      resourceLimits: {
        memory: 128 * 1024 * 1024, // 128MB
        cpu: 0.1, // 10% CPU
        network: plugin.permissions.includes('network'),
        filesystem: plugin.permissions.includes('filesystem')
      }
    });
  }
}

interface InstallationResult {
  success: boolean;
  plugin?: Plugin;
  error?: string;
  message: string;
}

interface ActivationResult {
  success: boolean;
  error?: string;
  message: string;
}
```

### **2. 🔒 Plugin Sandbox System**

#### **Secure Plugin Execution:**
```typescript
export class PluginSandbox {
  private vm: NodeVM;
  private resourceMonitor: ResourceMonitor;
  private permissions: Set<string>;

  constructor(private config: SandboxConfig) {
    this.permissions = new Set(config.permissions);
    this.setupVM();
    this.setupResourceMonitor();
  }

  private setupVM(): void {
    this.vm = new NodeVM({
      console: 'inherit',
      sandbox: this.createSandboxGlobals(),
      require: {
        external: this.getAllowedModules(),
        builtin: this.getAllowedBuiltins(),
        root: this.config.pluginPath,
        mock: this.createMockModules()
      },
      wrapper: 'none',
      timeout: 30000, // 30 seconds
      eval: false,
      wasm: false
    });
  }

  private createSandboxGlobals(): any {
    return {
      // Plugin API
      JA_CMS: {
        version: process.env.CMS_VERSION,
        hooks: this.createHooksAPI(),
        storage: this.createStorageAPI(),
        http: this.createHttpAPI(),
        events: this.createEventsAPI(),
        ui: this.createUIAPI(),
        utils: this.createUtilsAPI()
      },
      
      // Limited Node.js globals
      Buffer: this.permissions.has('buffer') ? Buffer : undefined,
      setTimeout: this.createTimeoutWrapper(),
      setInterval: this.createIntervalWrapper(),
      clearTimeout: clearTimeout,
      clearInterval: clearInterval,
      
      // Console (monitored)
      console: this.createConsoleWrapper()
    };
  }

  private createHooksAPI(): any {
    return {
      addFilter: (name: string, callback: Function, priority = 10) => {
        if (!this.permissions.has('hooks')) {
          throw new Error('Permission denied: hooks');
        }
        this.registerHook('filter', name, callback, priority);
      },
      
      addAction: (name: string, callback: Function, priority = 10) => {
        if (!this.permissions.has('hooks')) {
          throw new Error('Permission denied: hooks');
        }
        this.registerHook('action', name, callback, priority);
      },
      
      applyFilters: (name: string, value: any, ...args: any[]) => {
        return this.applyFilters(name, value, ...args);
      },
      
      doAction: (name: string, ...args: any[]) => {
        return this.doAction(name, ...args);
      }
    };
  }

  private createStorageAPI(): any {
    return {
      get: async (key: string) => {
        if (!this.permissions.has('storage')) {
          throw new Error('Permission denied: storage');
        }
        return this.getPluginStorage(key);
      },
      
      set: async (key: string, value: any) => {
        if (!this.permissions.has('storage')) {
          throw new Error('Permission denied: storage');
        }
        return this.setPluginStorage(key, value);
      },
      
      delete: async (key: string) => {
        if (!this.permissions.has('storage')) {
          throw new Error('Permission denied: storage');
        }
        return this.deletePluginStorage(key);
      }
    };
  }

  private createHttpAPI(): any {
    if (!this.permissions.has('network')) {
      return undefined;
    }

    return {
      get: this.createHttpWrapper('GET'),
      post: this.createHttpWrapper('POST'),
      put: this.createHttpWrapper('PUT'),
      delete: this.createHttpWrapper('DELETE'),
      request: this.createHttpRequestWrapper()
    };
  }

  async loadPlugin(): Promise<void> {
    try {
      const pluginMainFile = path.join(this.config.pluginPath, 'index.js');
      const pluginCode = await fs.readFile(pluginMainFile, 'utf8');
      
      // Execute plugin code in sandbox
      this.vm.run(pluginCode, pluginMainFile);
      
      // Start resource monitoring
      this.resourceMonitor.start();
      
    } catch (error) {
      throw new Error(`Failed to load plugin: ${error.message}`);
    }
  }

  async unloadPlugin(): Promise<void> {
    try {
      // Stop resource monitoring
      this.resourceMonitor.stop();
      
      // Clear timers
      this.clearAllTimers();
      
      // Cleanup resources
      await this.cleanup();
      
    } catch (error) {
      console.error(`Error unloading plugin ${this.config.pluginId}:`, error);
    }
  }

  async destroy(): Promise<void> {
    await this.unloadPlugin();
    
    // Remove plugin files if needed
    if (this.permissions.has('filesystem')) {
      await this.removePluginFiles();
    }
  }

  private setupResourceMonitor(): void {
    this.resourceMonitor = new ResourceMonitor({
      limits: this.config.resourceLimits,
      onLimitExceeded: (resource, usage, limit) => {
        console.warn(`Plugin ${this.config.pluginId} exceeded ${resource} limit: ${usage}/${limit}`);
        
        // Take action based on resource type
        switch (resource) {
          case 'memory':
            this.handleMemoryLimitExceeded();
            break;
          case 'cpu':
            this.handleCPULimitExceeded();
            break;
        }
      }
    });
  }

  private handleMemoryLimitExceeded(): void {
    // Force garbage collection
    if (global.gc) {
      global.gc();
    }
    
    // If still over limit, deactivate plugin
    setTimeout(() => {
      if (this.resourceMonitor.getCurrentUsage('memory') > this.config.resourceLimits.memory) {
        this.emergencyShutdown('Memory limit exceeded');
      }
    }, 5000);
  }

  private emergencyShutdown(reason: string): void {
    console.error(`Emergency shutdown of plugin ${this.config.pluginId}: ${reason}`);
    
    // Notify plugin manager
    this.emit('emergency-shutdown', {
      pluginId: this.config.pluginId,
      reason
    });
    
    // Force unload
    this.unloadPlugin().catch(console.error);
  }
}

interface SandboxConfig {
  pluginId: string;
  pluginPath: string;
  permissions: string[];
  resourceLimits: {
    memory: number; // bytes
    cpu: number; // percentage
    network: boolean;
    filesystem: boolean;
  };
}
```

### **3. 🏪 Plugin Marketplace**

#### **Marketplace Integration:**
```typescript
interface MarketplacePlugin {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  version: string;
  author: PluginAuthor;
  category: PluginCategory;
  tags: string[];
  icon: string;
  screenshots: string[];
  banner: string;
  homepage: string;
  repository: string;
  license: string;
  pricing: {
    type: 'free' | 'paid' | 'freemium';
    price?: number;
    currency?: string;
    billingCycle?: 'monthly' | 'yearly' | 'lifetime';
  };
  ratings: {
    average: number;
    count: number;
    distribution: {
      [stars: number]: number;
    };
  };
  stats: {
    downloads: number;
    activeInstalls: number;
    lastUpdated: Date;
    createdAt: Date;
  };
  compatibility: {
    cmsVersions: string[];
    phpVersions: string[];
    nodeVersions: string[];
  };
  support: {
    documentation: string;
    forum: string;
    email?: string;
    tickets?: string;
  };
  changelog: ChangelogEntry[];
  reviews: PluginReview[];
}

export class PluginMarketplace {
  private apiClient: MarketplaceAPIClient;
  private cache: MarketplaceCache;

  constructor() {
    this.apiClient = new MarketplaceAPIClient();
    this.cache = new MarketplaceCache();
  }

  async searchPlugins(query: PluginSearchQuery): Promise<PluginSearchResult> {
    // Check cache first
    const cacheKey = this.generateCacheKey(query);
    const cached = await this.cache.get(cacheKey);
    
    if (cached && !this.isCacheExpired(cached)) {
      return cached.data;
    }

    // Fetch from marketplace API
    const results = await this.apiClient.searchPlugins(query);
    
    // Cache results
    await this.cache.set(cacheKey, {
      data: results,
      timestamp: new Date(),
      ttl: 300000 // 5 minutes
    });

    return results;
  }

  async getPluginDetails(pluginId: string): Promise<MarketplacePlugin> {
    const cacheKey = `plugin:${pluginId}`;
    const cached = await this.cache.get(cacheKey);
    
    if (cached && !this.isCacheExpired(cached)) {
      return cached.data;
    }

    const plugin = await this.apiClient.getPlugin(pluginId);
    
    await this.cache.set(cacheKey, {
      data: plugin,
      timestamp: new Date(),
      ttl: 600000 // 10 minutes
    });

    return plugin;
  }

  async downloadPlugin(pluginId: string, version?: string): Promise<PluginPackage> {
    try {
      // Get plugin details
      const plugin = await this.getPluginDetails(pluginId);
      
      // Verify compatibility
      const compatibility = await this.checkCompatibility(plugin);
      if (!compatibility.compatible) {
        throw new Error(`Plugin not compatible: ${compatibility.reasons.join(', ')}`);
      }

      // Download plugin package
      const downloadUrl = await this.apiClient.getDownloadUrl(pluginId, version || plugin.version);
      const packageData = await this.downloadPackage(downloadUrl);
      
      // Verify package integrity
      await this.verifyPackageIntegrity(packageData, plugin);
      
      return packageData;
    } catch (error) {
      throw new Error(`Failed to download plugin: ${error.message}`);
    }
  }

  async submitReview(pluginId: string, review: PluginReviewSubmission): Promise<PluginReview> {
    // Validate review
    const validation = this.validateReview(review);
    if (!validation.valid) {
      throw new Error(`Invalid review: ${validation.errors.join(', ')}`);
    }

    // Submit to marketplace
    const submittedReview = await this.apiClient.submitReview(pluginId, review);
    
    // Clear plugin cache to refresh reviews
    await this.cache.delete(`plugin:${pluginId}`);
    
    return submittedReview;
  }

  private async checkCompatibility(plugin: MarketplacePlugin): Promise<CompatibilityResult> {
    const currentVersion = process.env.CMS_VERSION!;
    const phpVersion = process.env.PHP_VERSION;
    const nodeVersion = process.version;

    const reasons: string[] = [];
    let compatible = true;

    // Check CMS version compatibility
    if (!this.isVersionCompatible(currentVersion, plugin.compatibility.cmsVersions)) {
      compatible = false;
      reasons.push(`CMS version ${currentVersion} not supported`);
    }

    // Check PHP version if required
    if (phpVersion && plugin.compatibility.phpVersions.length > 0) {
      if (!this.isVersionCompatible(phpVersion, plugin.compatibility.phpVersions)) {
        compatible = false;
        reasons.push(`PHP version ${phpVersion} not supported`);
      }
    }

    // Check Node.js version if required
    if (plugin.compatibility.nodeVersions.length > 0) {
      if (!this.isVersionCompatible(nodeVersion, plugin.compatibility.nodeVersions)) {
        compatible = false;
        reasons.push(`Node.js version ${nodeVersion} not supported`);
      }
    }

    return { compatible, reasons };
  }

  private isVersionCompatible(version: string, supportedVersions: string[]): boolean {
    // Implementation of semantic version checking
    // This would use a library like semver for proper version comparison
    return supportedVersions.some(supported => {
      // Simplified version check - in reality would use semver.satisfies()
      return version.startsWith(supported) || supported === '*';
    });
  }
}

interface PluginSearchQuery {
  query?: string;
  category?: PluginCategory;
  tags?: string[];
  author?: string;
  pricing?: 'free' | 'paid' | 'all';
  rating?: number; // minimum rating
  sort?: 'relevance' | 'downloads' | 'rating' | 'updated' | 'name';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface PluginSearchResult {
  plugins: MarketplacePlugin[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  facets: {
    categories: { name: string; count: number }[];
    tags: { name: string; count: number }[];
    pricing: { type: string; count: number }[];
  };
}
```

---

## 🎨 **Plugin Management Interface**

### **Plugin Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 🔌 Plugins                    [Browse Marketplace] [Upload] │
├─────────────────────────────────────────────────────────┤
│ [Search plugins...] [All ▼] [Active ▼] [Category ▼]     │
├─────────────────────────────────────────────────────────┤
│ ┌─ Installed Plugins ────────────────────────────────┐   │
│ │ ┌─────┐ SEO Optimizer                    v2.1.0   │   │
│ │ │ 📊  │ Comprehensive SEO tools          ✅ Active  │   │
│ │ └─────┘ by SEO Team                               │   │
│ │         [Configure] [Deactivate] [Update]         │   │
│ │                                                   │   │
│ │ ┌─────┐ Analytics Pro                    v1.5.2   │   │
│ │ │ 📈  │ Advanced analytics tracking      ⏸️ Inactive│   │
│ │ └─────┘ by Analytics Inc                          │   │
│ │         [Activate] [Settings] [Remove]            │   │
│ │                                                   │   │
│ │ ┌─────┐ Security Shield                  v3.0.1   │   │
│ │ │ 🛡️  │ Enhanced security features       ✅ Active  │   │
│ │ └─────┘ by Security Corp                          │   │
│ │         [Configure] [Deactivate] [Update]         │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Quick Stats ──────────────────────────────────────┐   │
│ │ Total Plugins: 12    Active: 8    Updates: 3      │   │
│ │ Storage Used: 45MB   Last Check: 2 hours ago      │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Marketplace Browser:**
```
┌─────────────────────────────────────────────────────────┐
│ 🏪 Plugin Marketplace                    [My Account] [Help] │
├─────────────────────────────────────────────────────────┤
│ [Search plugins...] [All ▼] [Free ▼] [⭐ 4+ ▼]         │
├─────────────────────────────────────────────────────────┤
│ ┌─ Featured Plugins ─────────────────────────────────┐   │
│ │ ┌─────┐ Advanced SEO Suite            ⭐ 4.8 (234) │   │
│ │ │ 🎯  │ Complete SEO optimization      💰 $29/year │   │
│ │ └─────┘ 50K+ downloads                            │   │
│ │         [View Details] [Install]                   │   │
│ │                                                   │   │
│ │ ┌─────┐ E-commerce Pro                ⭐ 4.9 (156) │   │
│ │ │ 🛒  │ Full online store solution    💰 $49/year │   │
│ │ └─────┘ 25K+ downloads                            │   │
│ │         [View Details] [Try Free]                  │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Categories ───────────────────────────────────────┐   │
│ │ 📝 Content (45)      🔍 SEO (23)      🛡️ Security (18)│   │
│ │ 📊 Analytics (15)    🚀 Performance (12) 🎨 UI (34) │   │
│ │ 🛒 E-commerce (28)   🔌 Integration (67) 🔧 Utility│   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ Showing 1-12 of 234 plugins            [1] [2] [3] ... │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Plugin management
GET    /api/plugins                    // List installed plugins
POST   /api/plugins/install            // Install plugin
POST   /api/plugins/{id}/activate      // Activate plugin
POST   /api/plugins/{id}/deactivate    // Deactivate plugin
DELETE /api/plugins/{id}               // Uninstall plugin
GET    /api/plugins/{id}/settings      // Get plugin settings
PUT    /api/plugins/{id}/settings      // Update plugin settings

// Marketplace
GET    /api/marketplace/plugins        // Search marketplace
GET    /api/marketplace/plugins/{id}   // Get plugin details
POST   /api/marketplace/plugins/{id}/download // Download plugin
GET    /api/marketplace/categories     // List categories
POST   /api/marketplace/reviews        // Submit review

// Plugin development
POST   /api/plugins/validate           // Validate plugin package
POST   /api/plugins/test               // Test plugin in sandbox
GET    /api/plugins/hooks              // List available hooks
GET    /api/plugins/api-docs           // Plugin API documentation
```

### **Database Schema:**
```sql
-- Installed plugins
CREATE TABLE plugins (
  id UUID PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  description TEXT,
  author_name VARCHAR(255),
  author_email VARCHAR(255),
  homepage TEXT,
  repository TEXT,
  license VARCHAR(100),
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'inactive',
  settings JSONB,
  permissions TEXT[],
  installed_at TIMESTAMP DEFAULT NOW(),
  activated_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Plugin hooks
CREATE TABLE plugin_hooks (
  id UUID PRIMARY KEY,
  plugin_id UUID REFERENCES plugins(id) ON DELETE CASCADE,
  hook_name VARCHAR(100) NOT NULL,
  hook_type VARCHAR(20) NOT NULL,
  callback_function VARCHAR(255) NOT NULL,
  priority INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Plugin storage
CREATE TABLE plugin_storage (
  id UUID PRIMARY KEY,
  plugin_id UUID REFERENCES plugins(id) ON DELETE CASCADE,
  storage_key VARCHAR(255) NOT NULL,
  storage_value JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(plugin_id, storage_key)
);

-- Plugin reviews (for marketplace)
CREATE TABLE plugin_reviews (
  id UUID PRIMARY KEY,
  plugin_slug VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Plugin downloads
CREATE TABLE plugin_downloads (
  id UUID PRIMARY KEY,
  plugin_slug VARCHAR(100) NOT NULL,
  version VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  downloaded_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔗 **Related Documentation**

- **[Security System](../06_security/monitoring.md)** - Plugin security and sandboxing
- **[System Settings](../07_system/settings.md)** - Plugin configuration management
- **[API Documentation](../API_SCHEMAS.md)** - Plugin API reference
- **[Development Standards](../../DEVELOPMENT_STANDARDS.md)** - Plugin development guidelines

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
