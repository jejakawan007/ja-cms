# 🖼️ Theme Management System

> **Comprehensive Theme Management JA-CMS**  
> Advanced theme installation, switching, updates, dan marketplace integration

---

## 📋 **Deskripsi**

Theme Management System menyediakan capabilities yang comprehensive untuk mengelola themes dalam JA-CMS. Sistem ini mendukung theme installation, switching, updates, preview, backup, dan integration dengan theme marketplace untuk memberikan flexibility maksimal dalam design website.

---

## ⭐ **Core Features**

### **1. 🔧 Theme Installation & Management**

#### **Theme Architecture:**
```typescript
interface Theme {
  id: string;
  name: string;
  version: string;
  description: string;
  author: ThemeAuthor;
  screenshot: string;
  thumbnails: string[];
  tags: string[];
  category: ThemeCategory;
  features: ThemeFeature[];
  compatibility: {
    minVersion: string;
    maxVersion?: string;
    requiredFeatures: string[];
    supportedLanguages: string[];
  };
  customizer: CustomizerConfig;
  templates: ThemeTemplate[];
  assets: ThemeAssets;
  settings: ThemeSettings;
  metadata: {
    isActive: boolean;
    isSystem: boolean;
    isChild: boolean;
    parentTheme?: string;
    installedAt: Date;
    updatedAt: Date;
    lastUsed?: Date;
    downloadCount?: number;
    rating?: number;
    reviewCount?: number;
  };
  license: {
    type: 'free' | 'premium' | 'commercial';
    price?: number;
    licenseKey?: string;
    expiresAt?: Date;
  };
}

interface ThemeAuthor {
  name: string;
  email: string;
  website: string;
  avatar?: string;
  verified: boolean;
  social?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

interface ThemeFeature {
  name: string;
  supported: boolean;
  version?: string;
  config?: Record<string, any>;
  required?: boolean;
}

interface ThemeTemplate {
  name: string;
  path: string;
  type: 'page' | 'post' | 'archive' | 'single' | 'custom';
  description?: string;
  preview?: string;
  customFields?: CustomField[];
}

interface ThemeAssets {
  css: AssetFile[];
  js: AssetFile[];
  fonts: AssetFile[];
  images: AssetFile[];
  icons: AssetFile[];
}

interface AssetFile {
  name: string;
  path: string;
  version?: string;
  dependencies?: string[];
  conditions?: LoadCondition[];
  minified: boolean;
  size: number;
}

interface LoadCondition {
  type: 'page' | 'post_type' | 'taxonomy' | 'user_role' | 'device';
  value: string | string[];
  operator: 'is' | 'is_not' | 'contains' | 'starts_with';
}

type ThemeCategory = 'business' | 'blog' | 'portfolio' | 'ecommerce' | 'landing' | 'magazine' | 'creative' | 'minimal';
```

#### **Theme Management Service:**
```typescript
export class ThemeManagementService {
  private themeLoader: ThemeLoader;
  private assetManager: AssetManager;
  private templateEngine: TemplateEngine;
  private backupService: ThemeBackupService;
  private updateService: ThemeUpdateService;

  async installTheme(source: ThemeSource): Promise<ThemeInstallResult> {
    const installation = await this.createInstallation(source);
    
    try {
      // Download and validate theme
      const themePackage = await this.downloadTheme(source);
      const validation = await this.validateTheme(themePackage);
      
      if (!validation.valid) {
        throw new Error(`Theme validation failed: ${validation.errors.join(', ')}`);
      }

      // Extract theme files
      const extractPath = await this.extractTheme(themePackage, installation.id);
      
      // Parse theme configuration
      const themeConfig = await this.parseThemeConfig(extractPath);
      
      // Check dependencies
      const dependencies = await this.checkDependencies(themeConfig);
      if (!dependencies.satisfied) {
        throw new Error(`Missing dependencies: ${dependencies.missing.join(', ')}`);
      }

      // Install theme assets
      await this.installAssets(themeConfig, extractPath);
      
      // Register theme in database
      const theme = await this.registerTheme(themeConfig, {
        installationId: installation.id,
        extractPath,
        source
      });

      // Run post-install hooks
      await this.runPostInstallHooks(theme);

      // Generate theme preview
      await this.generateThemePreview(theme);

      return {
        success: true,
        theme,
        installation,
        message: `Theme "${theme.name}" installed successfully`
      };

    } catch (error) {
      // Cleanup failed installation
      await this.cleanupFailedInstallation(installation.id);
      
      return {
        success: false,
        error: error.message,
        installation,
        message: `Failed to install theme: ${error.message}`
      };
    }
  }

  async activateTheme(themeId: string): Promise<ThemeActivationResult> {
    const theme = await this.getTheme(themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }

    const currentTheme = await this.getActiveTheme();
    
    try {
      // Pre-activation checks
      const checks = await this.preActivationChecks(theme);
      if (!checks.passed) {
        throw new Error(`Pre-activation checks failed: ${checks.issues.join(', ')}`);
      }

      // Create backup of current theme settings
      let backup: ThemeBackup | null = null;
      if (currentTheme) {
        backup = await this.backupService.createBackup(currentTheme.id, 'pre-activation');
      }

      // Deactivate current theme
      if (currentTheme) {
        await this.deactivateTheme(currentTheme.id);
      }

      // Load theme assets
      await this.loadThemeAssets(theme);
      
      // Apply theme settings
      await this.applyThemeSettings(theme);
      
      // Update database
      await this.updateThemeStatus(themeId, 'active');
      
      // Run activation hooks
      await this.runActivationHooks(theme);
      
      // Clear caches
      await this.clearThemeCaches();

      // Generate theme preview
      await this.generateThemePreview(theme);

      return {
        success: true,
        theme,
        previousTheme: currentTheme,
        backup,
        message: `Theme "${theme.name}" activated successfully`
      };

    } catch (error) {
      // Rollback on failure
      if (currentTheme) {
        await this.rollbackThemeActivation(currentTheme, backup);
      }
      
      return {
        success: false,
        error: error.message,
        theme,
        message: `Failed to activate theme: ${error.message}`
      };
    }
  }

  async switchTheme(fromThemeId: string, toThemeId: string): Promise<ThemeSwitchResult> {
    const fromTheme = await this.getTheme(fromThemeId);
    const toTheme = await this.getTheme(toThemeId);

    if (!fromTheme || !toTheme) {
      throw new Error('Source or target theme not found');
    }

    // Create comprehensive backup
    const backup = await this.backupService.createFullBackup([fromThemeId], 'theme-switch');
    
    try {
      // Transfer compatible settings
      const settingsTransfer = await this.transferThemeSettings(fromTheme, toTheme);
      
      // Deactivate source theme
      await this.deactivateTheme(fromThemeId);
      
      // Activate target theme
      const activation = await this.activateTheme(toThemeId);
      
      if (!activation.success) {
        throw new Error(activation.error || 'Failed to activate target theme');
      }

      return {
        success: true,
        fromTheme,
        toTheme,
        settingsTransferred: settingsTransfer,
        backup,
        message: `Successfully switched from "${fromTheme.name}" to "${toTheme.name}"`
      };

    } catch (error) {
      // Restore from backup
      await this.backupService.restoreBackup(backup.id);
      
      return {
        success: false,
        error: error.message,
        fromTheme,
        toTheme,
        backup,
        message: `Failed to switch themes: ${error.message}`
      };
    }
  }

  async uninstallTheme(themeId: string, options: UninstallOptions = {}): Promise<ThemeUninstallResult> {
    const theme = await this.getTheme(themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }

    // Prevent uninstalling active theme
    if (theme.metadata.isActive && !options.force) {
      throw new Error('Cannot uninstall active theme. Switch to another theme first.');
    }

    // Prevent uninstalling system theme
    if (theme.metadata.isSystem && !options.allowSystem) {
      throw new Error('Cannot uninstall system theme');
    }

    try {
      // Create backup before uninstall
      const backup = await this.backupService.createBackup(themeId, 'pre-uninstall');
      
      // Deactivate if active
      if (theme.metadata.isActive) {
        const defaultTheme = await this.getDefaultTheme();
        await this.activateTheme(defaultTheme.id);
      }

      // Remove theme files
      await this.removeThemeFiles(theme);
      
      // Remove theme assets
      await this.removeThemeAssets(theme);
      
      // Remove theme data
      await this.removeThemeData(themeId, options.keepUserData);
      
      // Clear caches
      await this.clearThemeCaches();

      return {
        success: true,
        theme,
        backup,
        message: `Theme "${theme.name}" uninstalled successfully`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        theme,
        message: `Failed to uninstall theme: ${error.message}`
      };
    }
  }

  async previewTheme(themeId: string, options: PreviewOptions = {}): Promise<ThemePreview> {
    const theme = await this.getTheme(themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }

    // Generate preview token
    const previewToken = await this.generatePreviewToken(themeId, options);
    
    // Create preview environment
    const previewEnv = await this.createPreviewEnvironment(theme, previewToken);
    
    // Generate preview screenshots
    const screenshots = await this.generatePreviewScreenshots(theme, {
      devices: options.devices || ['desktop', 'tablet', 'mobile'],
      pages: options.pages || ['home', 'blog', 'about', 'contact']
    });

    return {
      theme,
      previewToken,
      previewUrl: `${this.getBaseUrl()}/preview/${previewToken}`,
      screenshots,
      expiresAt: new Date(Date.now() + (options.duration || 3600) * 1000), // 1 hour default
      environment: previewEnv
    };
  }

  private async validateTheme(themePackage: Buffer): Promise<ThemeValidation> {
    const validation: ThemeValidation = {
      valid: true,
      errors: [],
      warnings: []
    };

    try {
      // Extract and parse theme.json
      const themeConfig = await this.extractThemeConfig(themePackage);
      
      // Required fields validation
      const requiredFields = ['name', 'version', 'author'];
      for (const field of requiredFields) {
        if (!themeConfig[field]) {
          validation.errors.push(`Missing required field: ${field}`);
        }
      }

      // Version format validation
      if (themeConfig.version && !this.isValidVersion(themeConfig.version)) {
        validation.errors.push('Invalid version format');
      }

      // Template validation
      if (themeConfig.templates) {
        for (const template of themeConfig.templates) {
          if (!template.name || !template.path) {
            validation.errors.push(`Invalid template configuration: ${JSON.stringify(template)}`);
          }
        }
      }

      // Asset validation
      if (themeConfig.assets) {
        const assetValidation = await this.validateAssets(themeConfig.assets, themePackage);
        validation.errors.push(...assetValidation.errors);
        validation.warnings.push(...assetValidation.warnings);
      }

      // Security validation
      const securityCheck = await this.performSecurityScan(themePackage);
      if (!securityCheck.safe) {
        validation.errors.push(...securityCheck.threats);
      }

      validation.valid = validation.errors.length === 0;

    } catch (error) {
      validation.valid = false;
      validation.errors.push(`Theme validation failed: ${error.message}`);
    }

    return validation;
  }

  private async transferThemeSettings(fromTheme: Theme, toTheme: Theme): Promise<SettingsTransfer> {
    const transfer: SettingsTransfer = {
      compatible: [],
      incompatible: [],
      warnings: []
    };

    const fromSettings = await this.getThemeSettings(fromTheme.id);
    const toCustomizer = toTheme.customizer;

    // Map compatible settings
    for (const [key, value] of Object.entries(fromSettings)) {
      const targetControl = this.findCustomizerControl(toCustomizer, key);
      
      if (targetControl) {
        // Check type compatibility
        if (this.isSettingCompatible(value, targetControl)) {
          transfer.compatible.push({
            key,
            value,
            fromControl: key,
            toControl: targetControl.id
          });
        } else {
          transfer.warnings.push(`Setting "${key}" exists but has incompatible type`);
        }
      } else {
        // Try to find similar setting
        const similarControl = this.findSimilarControl(toCustomizer, key);
        if (similarControl) {
          transfer.warnings.push(`Setting "${key}" mapped to similar control "${similarControl.id}"`);
          transfer.compatible.push({
            key,
            value,
            fromControl: key,
            toControl: similarControl.id
          });
        } else {
          transfer.incompatible.push({
            key,
            value,
            reason: 'No compatible control found'
          });
        }
      }
    }

    // Apply compatible settings
    if (transfer.compatible.length > 0) {
      await this.applyTransferredSettings(toTheme.id, transfer.compatible);
    }

    return transfer;
  }

  async getThemeAnalytics(themeId: string, timeRange: DateRange): Promise<ThemeAnalytics> {
    const theme = await this.getTheme(themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }

    const analytics = await this.calculateThemeAnalytics(themeId, timeRange);
    
    return {
      theme,
      timeRange,
      usage: {
        activations: analytics.activationCount,
        activeTime: analytics.totalActiveTime,
        pageViews: analytics.pageViews,
        uniqueVisitors: analytics.uniqueVisitors,
        averageSessionDuration: analytics.avgSessionDuration
      },
      performance: {
        loadTime: analytics.avgLoadTime,
        firstContentfulPaint: analytics.avgFCP,
        largestContentfulPaint: analytics.avgLCP,
        cumulativeLayoutShift: analytics.avgCLS,
        interactionToNextPaint: analytics.avgINP
      },
      customization: {
        settingsChanged: analytics.customizationEvents,
        mostChangedSettings: analytics.topChangedSettings,
        customizationSessions: analytics.customizerSessions,
        averageCustomizationTime: analytics.avgCustomizationTime
      },
      issues: {
        errorCount: analytics.errorCount,
        warningCount: analytics.warningCount,
        topErrors: analytics.topErrors,
        performanceIssues: analytics.performanceIssues
      },
      insights: await this.generateThemeInsights(analytics)
    };
  }
}

interface ThemeSource {
  type: 'upload' | 'url' | 'marketplace' | 'git';
  data: string | Buffer;
  metadata?: Record<string, any>;
}

interface ThemeInstallResult {
  success: boolean;
  theme?: Theme;
  installation?: ThemeInstallation;
  error?: string;
  message: string;
}

interface ThemeActivationResult {
  success: boolean;
  theme?: Theme;
  previousTheme?: Theme;
  backup?: ThemeBackup;
  error?: string;
  message: string;
}

interface ThemeSwitchResult {
  success: boolean;
  fromTheme?: Theme;
  toTheme?: Theme;
  settingsTransferred?: SettingsTransfer;
  backup?: ThemeBackup;
  error?: string;
  message: string;
}

interface ThemeUninstallResult {
  success: boolean;
  theme?: Theme;
  backup?: ThemeBackup;
  error?: string;
  message: string;
}

interface ThemePreview {
  theme: Theme;
  previewToken: string;
  previewUrl: string;
  screenshots: PreviewScreenshot[];
  expiresAt: Date;
  environment: PreviewEnvironment;
}

interface ThemeValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface SettingsTransfer {
  compatible: TransferredSetting[];
  incompatible: IncompatibleSetting[];
  warnings: string[];
}

interface TransferredSetting {
  key: string;
  value: any;
  fromControl: string;
  toControl: string;
}

interface IncompatibleSetting {
  key: string;
  value: any;
  reason: string;
}

interface ThemeAnalytics {
  theme: Theme;
  timeRange: DateRange;
  usage: {
    activations: number;
    activeTime: number;
    pageViews: number;
    uniqueVisitors: number;
    averageSessionDuration: number;
  };
  performance: {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    interactionToNextPaint: number;
  };
  customization: {
    settingsChanged: number;
    mostChangedSettings: string[];
    customizationSessions: number;
    averageCustomizationTime: number;
  };
  issues: {
    errorCount: number;
    warningCount: number;
    topErrors: string[];
    performanceIssues: string[];
  };
  insights: ThemeInsight[];
}

interface UninstallOptions {
  force?: boolean;
  allowSystem?: boolean;
  keepUserData?: boolean;
}

interface PreviewOptions {
  devices?: string[];
  pages?: string[];
  duration?: number; // seconds
}
```

### **2. 🔄 Theme Updates & Marketplace**

#### **Update Management:**
```typescript
export class ThemeUpdateService {
  private updateChecker: UpdateChecker;
  private downloadManager: DownloadManager;
  private patchApplier: PatchApplier;
  private rollbackManager: RollbackManager;

  async checkForUpdates(themeId?: string): Promise<UpdateCheckResult> {
    const themes = themeId ? [await this.getTheme(themeId)] : await this.getAllThemes();
    const updateChecks: ThemeUpdateCheck[] = [];

    for (const theme of themes.filter(Boolean)) {
      const updateInfo = await this.updateChecker.checkTheme(theme!);
      updateChecks.push({
        theme: theme!,
        hasUpdate: updateInfo.hasUpdate,
        latestVersion: updateInfo.latestVersion,
        currentVersion: theme!.version,
        updateSize: updateInfo.updateSize,
        changelog: updateInfo.changelog,
        securityUpdate: updateInfo.securityUpdate,
        compatibility: updateInfo.compatibility
      });
    }

    return {
      totalThemes: themes.length,
      updatesAvailable: updateChecks.filter(c => c.hasUpdate).length,
      securityUpdates: updateChecks.filter(c => c.securityUpdate).length,
      checks: updateChecks
    };
  }

  async updateTheme(themeId: string, options: UpdateOptions = {}): Promise<ThemeUpdateResult> {
    const theme = await this.getTheme(themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }

    const updateInfo = await this.updateChecker.checkTheme(theme);
    if (!updateInfo.hasUpdate) {
      return {
        success: false,
        message: 'No updates available',
        theme
      };
    }

    try {
      // Create backup before update
      const backup = await this.createUpdateBackup(theme);
      
      // Download update
      const updatePackage = await this.downloadManager.downloadUpdate(updateInfo);
      
      // Validate update
      const validation = await this.validateUpdate(updatePackage, theme);
      if (!validation.valid) {
        throw new Error(`Update validation failed: ${validation.errors.join(', ')}`);
      }

      // Apply update
      const updateResult = await this.applyUpdate(theme, updatePackage, options);
      
      // Verify update
      const verification = await this.verifyUpdate(theme, updateInfo.latestVersion);
      if (!verification.success) {
        // Rollback on verification failure
        await this.rollbackManager.rollback(backup);
        throw new Error('Update verification failed');
      }

      // Clear caches
      await this.clearUpdateCaches(theme);
      
      // Run post-update hooks
      await this.runPostUpdateHooks(theme, updateInfo);

      return {
        success: true,
        theme: await this.getTheme(themeId), // Get updated theme
        previousVersion: theme.version,
        newVersion: updateInfo.latestVersion,
        backup,
        changelog: updateInfo.changelog,
        message: `Theme "${theme.name}" updated successfully to version ${updateInfo.latestVersion}`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        theme,
        message: `Failed to update theme: ${error.message}`
      };
    }
  }

  async scheduleAutoUpdates(themeId: string, schedule: UpdateSchedule): Promise<void> {
    const theme = await this.getTheme(themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }

    await this.storeUpdateSchedule({
      themeId,
      schedule,
      enabled: true,
      lastCheck: new Date(),
      nextCheck: this.calculateNextCheck(schedule)
    });

    // Schedule cron job
    await this.scheduleUpdateJob(themeId, schedule);
  }

  private async applyUpdate(theme: Theme, updatePackage: Buffer, options: UpdateOptions): Promise<UpdateApplication> {
    const updateType = await this.determineUpdateType(theme, updatePackage);
    
    switch (updateType) {
      case 'full':
        return this.applyFullUpdate(theme, updatePackage, options);
      case 'patch':
        return this.applyPatchUpdate(theme, updatePackage, options);
      case 'incremental':
        return this.applyIncrementalUpdate(theme, updatePackage, options);
      default:
        throw new Error(`Unknown update type: ${updateType}`);
    }
  }

  private async applyFullUpdate(theme: Theme, updatePackage: Buffer, options: UpdateOptions): Promise<UpdateApplication> {
    // Full theme replacement
    const tempPath = await this.extractUpdatePackage(updatePackage);
    const newThemeConfig = await this.parseThemeConfig(tempPath);
    
    // Preserve user settings if requested
    let userSettings: any = null;
    if (options.preserveSettings) {
      userSettings = await this.getThemeSettings(theme.id);
    }
    
    // Replace theme files
    await this.replaceThemeFiles(theme, tempPath);
    
    // Update theme configuration
    await this.updateThemeConfig(theme.id, newThemeConfig);
    
    // Restore user settings
    if (userSettings && options.preserveSettings) {
      await this.restoreCompatibleSettings(theme.id, userSettings, newThemeConfig);
    }
    
    // Regenerate assets
    await this.regenerateThemeAssets(theme.id);
    
    return {
      type: 'full',
      filesUpdated: await this.countUpdatedFiles(theme, tempPath),
      settingsPreserved: options.preserveSettings || false,
      assetsRegenerated: true
    };
  }
}

interface UpdateCheckResult {
  totalThemes: number;
  updatesAvailable: number;
  securityUpdates: number;
  checks: ThemeUpdateCheck[];
}

interface ThemeUpdateCheck {
  theme: Theme;
  hasUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
  updateSize: number;
  changelog: string[];
  securityUpdate: boolean;
  compatibility: CompatibilityInfo;
}

interface ThemeUpdateResult {
  success: boolean;
  theme?: Theme;
  previousVersion?: string;
  newVersion?: string;
  backup?: ThemeBackup;
  changelog?: string[];
  error?: string;
  message: string;
}

interface UpdateOptions {
  preserveSettings?: boolean;
  createBackup?: boolean;
  testMode?: boolean;
  skipValidation?: boolean;
}

interface UpdateSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  time?: string; // HH:MM format
  dayOfWeek?: number; // 0-6, for weekly
  dayOfMonth?: number; // 1-31, for monthly
  autoApply?: boolean;
  securityOnly?: boolean;
}
```

### **3. 🎨 Theme Categories & Marketplace**

#### **Theme Marketplace Integration:**
```typescript
export class ThemeMarketplaceService {
  private apiClient: MarketplaceAPIClient;
  private cacheManager: CacheManager;
  private reviewSystem: ReviewSystem;
  private licenseManager: LicenseManager;

  async browseThemes(filters: ThemeFilters = {}): Promise<ThemeMarketplaceResponse> {
    const cacheKey = this.generateCacheKey('browse', filters);
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const response = await this.apiClient.get('/themes', {
      params: {
        category: filters.category,
        tags: filters.tags?.join(','),
        price: filters.price,
        rating: filters.rating,
        author: filters.author,
        search: filters.search,
        sort: filters.sort || 'popularity',
        page: filters.page || 1,
        limit: filters.limit || 20
      }
    });

    const result: ThemeMarketplaceResponse = {
      themes: response.data.themes.map(this.mapMarketplaceTheme),
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages,
      filters: response.data.availableFilters,
      categories: response.data.categories
    };

    await this.cacheManager.set(cacheKey, result, 300); // 5 minutes cache
    return result;
  }

  async getThemeDetails(themeId: string): Promise<MarketplaceTheme> {
    const cacheKey = `theme-details-${themeId}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const response = await this.apiClient.get(`/themes/${themeId}`);
    const theme = this.mapMarketplaceTheme(response.data);

    // Get additional details
    const [reviews, changelog, compatibility] = await Promise.all([
      this.getThemeReviews(themeId),
      this.getThemeChangelog(themeId),
      this.checkThemeCompatibility(themeId)
    ]);

    theme.reviews = reviews;
    theme.changelog = changelog;
    theme.compatibility = compatibility;

    await this.cacheManager.set(cacheKey, theme, 600); // 10 minutes cache
    return theme;
  }

  async purchaseTheme(themeId: string, licenseType: LicenseType = 'single'): Promise<ThemePurchaseResult> {
    const theme = await this.getThemeDetails(themeId);
    
    if (theme.license.type === 'free') {
      // Free theme - direct download
      return this.downloadFreeTheme(theme);
    }

    // Paid theme - process payment
    const payment = await this.processPayment(theme, licenseType);
    
    if (!payment.success) {
      return {
        success: false,
        error: payment.error,
        message: 'Payment processing failed'
      };
    }

    // Generate license
    const license = await this.licenseManager.generateLicense(theme, licenseType, payment);
    
    // Download theme
    const download = await this.downloadPaidTheme(theme, license);
    
    return {
      success: true,
      theme,
      license,
      downloadUrl: download.url,
      downloadToken: download.token,
      expiresAt: download.expiresAt,
      message: `Theme "${theme.name}" purchased successfully`
    };
  }

  async downloadTheme(themeId: string, licenseKey?: string): Promise<ThemeDownloadResult> {
    const theme = await this.getThemeDetails(themeId);
    
    // Verify license for paid themes
    if (theme.license.type !== 'free') {
      if (!licenseKey) {
        throw new Error('License key required for paid theme');
      }
      
      const licenseValidation = await this.licenseManager.validateLicense(licenseKey, themeId);
      if (!licenseValidation.valid) {
        throw new Error('Invalid license key');
      }
    }

    // Generate download token
    const downloadToken = await this.generateDownloadToken(themeId, licenseKey);
    
    // Get download URL
    const downloadUrl = await this.getDownloadUrl(themeId, downloadToken);
    
    return {
      success: true,
      theme,
      downloadUrl,
      downloadToken,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
      message: 'Download ready'
    };
  }

  async submitTheme(themeData: ThemeSubmission): Promise<ThemeSubmissionResult> {
    // Validate submission
    const validation = await this.validateSubmission(themeData);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
        message: 'Theme submission validation failed'
      };
    }

    // Upload theme package
    const upload = await this.uploadThemePackage(themeData.package);
    
    // Create submission record
    const submission = await this.createSubmission({
      ...themeData,
      packageUrl: upload.url,
      status: 'pending',
      submittedAt: new Date()
    });

    // Start review process
    await this.startReviewProcess(submission);
    
    return {
      success: true,
      submission,
      message: 'Theme submitted for review'
    };
  }

  async rateTheme(themeId: string, rating: ThemeRating): Promise<void> {
    await this.reviewSystem.submitRating({
      themeId,
      userId: rating.userId,
      rating: rating.score,
      review: rating.review,
      pros: rating.pros,
      cons: rating.cons,
      wouldRecommend: rating.wouldRecommend,
      submittedAt: new Date()
    });

    // Update theme average rating
    await this.updateThemeRating(themeId);
  }

  private mapMarketplaceTheme(data: any): MarketplaceTheme {
    return {
      id: data.id,
      name: data.name,
      version: data.version,
      description: data.description,
      author: data.author,
      category: data.category,
      tags: data.tags || [],
      screenshots: data.screenshots || [],
      demoUrl: data.demoUrl,
      price: data.price || 0,
      currency: data.currency || 'USD',
      license: data.license,
      rating: {
        average: data.rating?.average || 0,
        count: data.rating?.count || 0,
        distribution: data.rating?.distribution || {}
      },
      stats: {
        downloads: data.stats?.downloads || 0,
        activeInstalls: data.stats?.activeInstalls || 0,
        lastUpdated: new Date(data.stats?.lastUpdated || Date.now())
      },
      features: data.features || [],
      compatibility: data.compatibility,
      support: {
        documentation: data.support?.documentation,
        forum: data.support?.forum,
        email: data.support?.email,
        responseTime: data.support?.responseTime
      }
    };
  }
}

interface ThemeFilters {
  category?: ThemeCategory;
  tags?: string[];
  price?: 'free' | 'paid' | 'any';
  rating?: number;
  author?: string;
  search?: string;
  sort?: 'popularity' | 'rating' | 'newest' | 'price_low' | 'price_high';
  page?: number;
  limit?: number;
}

interface MarketplaceTheme extends Theme {
  demoUrl?: string;
  price: number;
  currency: string;
  rating: {
    average: number;
    count: number;
    distribution: Record<number, number>;
  };
  stats: {
    downloads: number;
    activeInstalls: number;
    lastUpdated: Date;
  };
  reviews?: ThemeReview[];
  changelog?: ChangelogEntry[];
  support: {
    documentation?: string;
    forum?: string;
    email?: string;
    responseTime?: string;
  };
}

interface ThemeMarketplaceResponse {
  themes: MarketplaceTheme[];
  total: number;
  page: number;
  totalPages: number;
  filters: AvailableFilters;
  categories: ThemeCategory[];
}

interface ThemePurchaseResult {
  success: boolean;
  theme?: MarketplaceTheme;
  license?: ThemeLicense;
  downloadUrl?: string;
  downloadToken?: string;
  expiresAt?: Date;
  error?: string;
  message: string;
}

interface ThemeDownloadResult {
  success: boolean;
  theme?: MarketplaceTheme;
  downloadUrl?: string;
  downloadToken?: string;
  expiresAt?: Date;
  error?: string;
  message: string;
}

interface ThemeSubmission {
  name: string;
  description: string;
  category: ThemeCategory;
  tags: string[];
  package: Buffer;
  screenshots: Buffer[];
  demoUrl?: string;
  price?: number;
  license: LicenseType;
  authorInfo: AuthorInfo;
}

interface ThemeRating {
  userId: string;
  score: number; // 1-5
  review?: string;
  pros?: string[];
  cons?: string[];
  wouldRecommend: boolean;
}

type LicenseType = 'single' | 'multi' | 'developer' | 'unlimited';
```

---

## 🎨 **Theme Management Interface**

### **Theme Management Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 🖼️ Theme Management                   [Install] [Marketplace] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Active Theme ─────────────────────────────────────┐   │
│ │ 📸 [Screenshot]     ✨ Modern Business Pro         │   │
│ │                     Version: 2.1.4                 │   │
│ │                     Author: ThemeStudio             │   │
│ │                     Active since: Dec 15, 2023     │   │
│ │                                                   │   │
│ │ [🎨 Customize] [📊 Analytics] [🔄 Check Updates]   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Installed Themes ─────────────────────────────────┐   │
│ │ 📸 [Thumb] Creative Portfolio v1.8.2 ⚡            │   │
│ │            Author: DesignCorp • 1,234 downloads    │   │
│ │            [Activate] [Preview] [Settings] [Delete]│   │
│ │                                                   │   │
│ │ 📸 [Thumb] Minimal Blog v3.2.1 🔄 Update Available │   │
│ │            Author: BlogThemes • 856 downloads      │   │
│ │            [Activate] [Preview] [Update] [Settings]│   │
│ │                                                   │   │
│ │ 📸 [Thumb] E-commerce Store v2.5.0                │   │
│ │            Author: ShopDesign • 2,156 downloads    │   │
│ │            [Activate] [Preview] [Settings] [Delete]│   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Theme Statistics ─────────────────────────────────┐   │
│ │ 📊 Total Themes: 12 installed                     │   │
│ │ 🔄 Updates Available: 3 themes                    │   │
│ │ 🛡️ Security Updates: 1 critical                   │   │
│ │ 💾 Storage Used: 156MB                            │   │
│ │ ⚡ Performance Score: 87/100                      │   │
│ │ 🎨 Active Customizations: 23 settings modified   │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Theme Preview Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ 👁️ Theme Preview: Creative Portfolio    [Close] [Activate] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Device Preview ───────────────────────────────────┐   │
│ │ [💻 Desktop] [📱 Tablet] [📱 Mobile]               │   │
│ │                                                   │   │
│ │ ┌─ Website Preview ─────────────────────────────┐  │   │
│ │ │ ╔══════════════════════════════════════════╗ │  │   │
│ │ │ ║  🏠 CREATIVE PORTFOLIO    [Menu] [Search] ║ │  │   │
│ │ │ ║                                          ║ │  │   │
│ │ │ ║  ╭─────────╮  ╭─────────╮  ╭─────────╮  ║ │  │   │
│ │ │ ║  │ Project │  │ Project │  │ Project │  ║ │  │   │
│ │ │ ║  │   #1    │  │   #2    │  │   #3    │  ║ │  │   │
│ │ │ ║  ╰─────────╯  ╰─────────╯  ╰─────────╯  ║ │  │   │
│ │ │ ║                                          ║ │  │   │
│ │ │ ║  About • Services • Contact             ║ │  │   │
│ │ │ ╚══════════════════════════════════════════╝ │  │   │
│ │ └─────────────────────────────────────────────┘  │   │
│ │                                                   │   │
│ │ [🏠 Home] [📝 Blog] [📞 Contact] [🛍️ Shop]         │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Theme Information ────────────────────────────────┐   │
│ │ 📝 Description: Modern portfolio theme for creatives│  │
│ │ 👤 Author: DesignCorp (⭐ Verified)               │   │
│ │ 📅 Version: 1.8.2 (Updated: Dec 10, 2023)        │   │
│ │ 🏷️ Tags: portfolio, creative, modern, responsive  │   │
│ │ ⭐ Rating: 4.8/5 (127 reviews)                   │   │
│ │ 📥 Downloads: 1,234                               │   │
│ │                                                   │   │
│ │ ✅ Features:                                      │   │
│ │ • Responsive design • Custom widgets             │   │
│ │ • SEO optimized • WooCommerce ready              │   │
│ │ • Translation ready • RTL support                │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Theme management
GET    /api/themes                       // List installed themes
POST   /api/themes/install               // Install theme
GET    /api/themes/{id}                  // Get theme details
PUT    /api/themes/{id}/activate         // Activate theme
DELETE /api/themes/{id}                  // Uninstall theme

// Theme updates
GET    /api/themes/updates               // Check for updates
POST   /api/themes/{id}/update           // Update theme
GET    /api/themes/{id}/changelog        // Get theme changelog
POST   /api/themes/{id}/schedule-update  // Schedule auto-update

// Theme preview
POST   /api/themes/{id}/preview          // Create preview
GET    /api/themes/preview/{token}       // Access preview
DELETE /api/themes/preview/{token}       // Delete preview

// Theme marketplace
GET    /api/marketplace/themes           // Browse marketplace
GET    /api/marketplace/themes/{id}      // Get marketplace theme
POST   /api/marketplace/themes/{id}/purchase // Purchase theme
POST   /api/marketplace/themes/{id}/download // Download theme
POST   /api/marketplace/themes/{id}/rate // Rate theme

// Theme analytics
GET    /api/themes/{id}/analytics        // Get theme analytics
GET    /api/themes/{id}/performance      // Get performance metrics
GET    /api/themes/{id}/usage           // Get usage statistics
```

### **Database Schema:**
```sql
-- Themes
CREATE TABLE themes (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  description TEXT,
  author JSONB NOT NULL,
  category VARCHAR(50) NOT NULL,
  tags TEXT[],
  features JSONB,
  customizer JSONB,
  templates JSONB,
  assets JSONB,
  settings JSONB,
  metadata JSONB,
  license JSONB,
  is_active BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  installed_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Theme installations
CREATE TABLE theme_installations (
  id UUID PRIMARY KEY,
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  source_type VARCHAR(50) NOT NULL,
  source_data JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  error_message TEXT,
  installed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Theme backups
CREATE TABLE theme_backups (
  id UUID PRIMARY KEY,
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  backup_type VARCHAR(50) NOT NULL,
  backup_data JSONB NOT NULL,
  file_path VARCHAR(500),
  size BIGINT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Theme updates
CREATE TABLE theme_updates (
  id UUID PRIMARY KEY,
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  from_version VARCHAR(50) NOT NULL,
  to_version VARCHAR(50) NOT NULL,
  update_type VARCHAR(20) NOT NULL,
  changelog TEXT[],
  update_data JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  applied_by UUID REFERENCES users(id) ON DELETE SET NULL,
  applied_at TIMESTAMP DEFAULT NOW()
);

-- Theme analytics
CREATE TABLE theme_analytics (
  id UUID PRIMARY KEY,
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_load_time INTEGER DEFAULT 0,
  avg_fcp INTEGER DEFAULT 0,
  avg_lcp INTEGER DEFAULT 0,
  customization_events INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(theme_id, date)
);

-- Indexes for performance
CREATE INDEX idx_themes_category ON themes(category);
CREATE INDEX idx_themes_active ON themes(is_active);
CREATE INDEX idx_theme_installations_status ON theme_installations(status);
CREATE INDEX idx_theme_backups_theme ON theme_backups(theme_id);
CREATE INDEX idx_theme_updates_theme ON theme_updates(theme_id);
CREATE INDEX idx_theme_analytics_theme_date ON theme_analytics(theme_id, date);
```

---

## 🔗 **Related Documentation**

- **[Theme Customizer](./customizer.md)** - Live theme customization system
- **[Widget System](./widgets.md)** - Theme widget management
- **[Navigation Menus](./menus.md)** - Menu system integration
- **[Media Integration](../03_media/)** - Asset management dalam themes

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
