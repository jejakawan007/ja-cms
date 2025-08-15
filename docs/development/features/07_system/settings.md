# ⚙️ System Settings Management

> **Pusat Konfigurasi Sistem JA-CMS**  
> Comprehensive system configuration untuk mengatur semua aspek CMS

---

## 📋 **Deskripsi**

System Settings Management adalah pusat kontrol untuk mengkonfigurasi semua aspek JA-CMS. Sistem ini menyediakan interface yang user-friendly untuk administrator namun tetap powerful untuk system administrators, dengan validasi pengaturan dan backup/restore configuration.

---

## ⭐ **Core Features**

### **1. 🌐 General Settings**

#### **Site Information Configuration:**
```typescript
interface GeneralSettings {
  site: {
    title: string;
    tagline: string;
    url: string;
    adminEmail: string;
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    favicon?: string;
    logo?: string;
    description?: string;
    keywords?: string[];
  };
  registration: {
    allowRegistration: boolean;
    defaultRole: string;
    requireEmailVerification: boolean;
    moderateRegistrations: boolean;
    allowedDomains?: string[];
    blockedDomains?: string[];
  };
  comments: {
    allowComments: boolean;
    requireModeration: boolean;
    allowGuestComments: boolean;
    maxNestingLevel: number;
    closeAfterDays?: number;
    requireApproval: boolean;
    showAvatars: boolean;
    threadsPerPage: number;
  };
  privacy: {
    collectAnalytics: boolean;
    showCookieNotice: boolean;
    privacyPolicyUrl?: string;
    termsOfServiceUrl?: string;
    dataRetentionDays: number;
  };
}
```

#### **Site Configuration Management:**
```typescript
export class SiteConfigurationService {
  private settings: Map<string, any> = new Map();
  private validators: Map<string, SettingValidator> = new Map();

  async getSettings(category?: string): Promise<any> {
    if (category) {
      return this.settings.get(category);
    }
    
    // Return all settings grouped by category
    const allSettings: Record<string, any> = {};
    for (const [key, value] of this.settings.entries()) {
      allSettings[key] = value;
    }
    
    return allSettings;
  }

  async updateSetting(category: string, key: string, value: any): Promise<void> {
    // Validate setting
    const validator = this.validators.get(`${category}.${key}`);
    if (validator) {
      const validation = await validator(value);
      if (!validation.valid) {
        throw new Error(`Invalid setting value: ${validation.message}`);
      }
    }

    // Get current category settings
    const categorySettings = this.settings.get(category) || {};
    
    // Update specific key
    categorySettings[key] = value;
    
    // Save updated settings
    this.settings.set(category, categorySettings);
    
    // Persist to database
    await this.persistSettings(category, categorySettings);
    
    // Trigger change event
    this.emitSettingChange(category, key, value);
  }

  async bulkUpdateSettings(category: string, updates: Record<string, any>): Promise<void> {
    const categorySettings = this.settings.get(category) || {};
    
    // Validate all updates first
    for (const [key, value] of Object.entries(updates)) {
      const validator = this.validators.get(`${category}.${key}`);
      if (validator) {
        const validation = await validator(value);
        if (!validation.valid) {
          throw new Error(`Invalid setting value for ${key}: ${validation.message}`);
        }
      }
    }
    
    // Apply all updates
    Object.assign(categorySettings, updates);
    
    // Save updated settings
    this.settings.set(category, categorySettings);
    await this.persistSettings(category, categorySettings);
    
    // Trigger bulk change event
    this.emitBulkSettingChange(category, updates);
  }

  registerValidator(settingPath: string, validator: SettingValidator): void {
    this.validators.set(settingPath, validator);
  }

  private async persistSettings(category: string, settings: any): Promise<void> {
    await this.prisma.systemSettings.upsert({
      where: { category },
      update: { 
        settings,
        updatedAt: new Date()
      },
      create: {
        category,
        settings,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  private emitSettingChange(category: string, key: string, value: any): void {
    this.eventEmitter.emit('setting.changed', {
      category,
      key,
      value,
      timestamp: new Date()
    });
  }
}

type SettingValidator = (value: any) => Promise<ValidationResult> | ValidationResult;

interface ValidationResult {
  valid: boolean;
  message?: string;
}
```

### **2. 📖 Content Settings**

#### **Reading & Display Configuration:**
```typescript
interface ContentSettings {
  reading: {
    frontPageDisplay: 'posts' | 'page';
    frontPage?: string; // page ID
    postsPage?: string; // page ID
    postsPerPage: number;
    postsPerRss: number;
    rssUseExcerpt: boolean;
    searchEngineVisibility: boolean;
    showOnFrontPage: {
      posts: boolean;
      pages: boolean;
      categories: boolean;
    };
  };
  writing: {
    defaultCategory: string;
    defaultPostFormat: 'standard' | 'video' | 'audio' | 'gallery' | 'image';
    defaultPostStatus: 'draft' | 'published' | 'private';
    autoSaveInterval: number; // minutes
    revisionLimit: number;
    defaultEditor: 'visual' | 'text' | 'markdown';
    enableEmojis: boolean;
    convertSmilies: boolean;
  };
  media: {
    imageCompression: number; // 1-100
    thumbnailSizes: {
      small: { width: number; height: number; crop: boolean };
      medium: { width: number; height: number; crop: boolean };
      large: { width: number; height: number; crop: boolean };
    };
    maxUploadSize: number; // bytes
    allowedFileTypes: string[];
    organizeUploads: boolean; // organize by date
    enableWebP: boolean;
    enableAVIF: boolean;
  };
}
```

### **3. 🔧 Technical Settings**

#### **Performance & Optimization:**
```typescript
interface TechnicalSettings {
  performance: {
    caching: {
      enabled: boolean;
      type: 'memory' | 'file' | 'redis';
      ttl: number; // seconds
      excludeUrls: string[];
    };
    compression: {
      enabled: boolean;
      level: number; // 1-9
      types: string[]; // mime types to compress
    };
    optimization: {
      minifyCSS: boolean;
      minifyJS: boolean;
      combineFiles: boolean;
      lazyLoadImages: boolean;
      enableCDN: boolean;
      cdnUrl?: string;
    };
  };
  database: {
    optimizeInterval: number; // hours
    cleanupRevisions: boolean;
    maxRevisions: number;
    cleanupTrash: boolean;
    trashRetentionDays: number;
    enableQueryCache: boolean;
  };
  security: {
    forceSSL: boolean;
    hideWPVersion: boolean;
    disableFileEditing: boolean;
    limitLoginAttempts: number;
    sessionTimeout: number; // minutes
    enableTwoFactor: boolean;
    allowedIPs?: string[];
    blockedIPs?: string[];
  };
}
```

### **4. 📧 Email Configuration**

#### **Email Settings Management:**
```typescript
interface EmailSettings {
  smtp: {
    enabled: boolean;
    host: string;
    port: number;
    encryption: 'none' | 'tls' | 'ssl';
    username: string;
    password: string;
    fromName: string;
    fromEmail: string;
    replyToEmail?: string;
  };
  templates: {
    welcomeEmail: {
      enabled: boolean;
      subject: string;
      template: string;
    };
    passwordReset: {
      subject: string;
      template: string;
    };
    emailVerification: {
      subject: string;
      template: string;
    };
    commentNotification: {
      enabled: boolean;
      subject: string;
      template: string;
    };
  };
  notifications: {
    newUserRegistration: boolean;
    newComment: boolean;
    newPost: boolean;
    systemUpdates: boolean;
    securityAlerts: boolean;
    adminEmail: string;
  };
}

export class EmailConfigurationService {
  async testEmailConnection(config: EmailSettings['smtp']): Promise<TestResult> {
    try {
      const transporter = nodemailer.createTransporter({
        host: config.host,
        port: config.port,
        secure: config.encryption === 'ssl',
        auth: {
          user: config.username,
          pass: config.password
        }
      });

      // Verify connection
      await transporter.verify();

      // Send test email
      const testResult = await transporter.sendMail({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: config.fromEmail,
        subject: 'JA-CMS Email Test',
        text: 'This is a test email from JA-CMS. If you receive this, your email configuration is working correctly.',
        html: `
          <h2>Email Configuration Test</h2>
          <p>This is a test email from JA-CMS.</p>
          <p>If you receive this, your email configuration is working correctly.</p>
          <p><strong>Configuration Details:</strong></p>
          <ul>
            <li>Host: ${config.host}</li>
            <li>Port: ${config.port}</li>
            <li>Encryption: ${config.encryption}</li>
            <li>From: ${config.fromName} &lt;${config.fromEmail}&gt;</li>
          </ul>
        `
      });

      return {
        success: true,
        message: 'Email sent successfully',
        messageId: testResult.messageId
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error
      };
    }
  }

  async updateEmailTemplate(templateName: string, template: EmailTemplate): Promise<void> {
    // Validate template
    const validation = await this.validateEmailTemplate(template);
    if (!validation.valid) {
      throw new Error(`Invalid email template: ${validation.message}`);
    }

    // Save template
    await this.prisma.emailTemplate.upsert({
      where: { name: templateName },
      update: {
        subject: template.subject,
        htmlTemplate: template.template,
        variables: template.variables,
        updatedAt: new Date()
      },
      create: {
        name: templateName,
        subject: template.subject,
        htmlTemplate: template.template,
        variables: template.variables,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  private async validateEmailTemplate(template: EmailTemplate): Promise<ValidationResult> {
    // Check for required placeholders
    const requiredVariables = template.variables?.filter(v => v.required) || [];
    const templateContent = template.template;

    for (const variable of requiredVariables) {
      const placeholder = `{{${variable.name}}}`;
      if (!templateContent.includes(placeholder)) {
        return {
          valid: false,
          message: `Required variable ${variable.name} is missing from template`
        };
      }
    }

    // Validate HTML structure
    try {
      // Basic HTML validation
      const parser = new DOMParser();
      const doc = parser.parseFromString(templateContent, 'text/html');
      const errors = doc.querySelectorAll('parsererror');
      
      if (errors.length > 0) {
        return {
          valid: false,
          message: 'Invalid HTML structure in template'
        };
      }
    } catch (error) {
      return {
        valid: false,
        message: 'Failed to parse HTML template'
      };
    }

    return { valid: true };
  }
}

interface EmailTemplate {
  subject: string;
  template: string;
  variables?: {
    name: string;
    description: string;
    required: boolean;
    defaultValue?: string;
  }[];
}

interface TestResult {
  success: boolean;
  message: string;
  messageId?: string;
  error?: any;
}
```

### **5. 🔐 Advanced Configuration**

#### **System Maintenance Settings:**
```typescript
interface MaintenanceSettings {
  maintenance: {
    enabled: boolean;
    message: string;
    allowedIPs: string[];
    showCountdown: boolean;
    scheduledStart?: Date;
    scheduledEnd?: Date;
  };
  backups: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM
    retention: number; // days
    includeDatabase: boolean;
    includeFiles: boolean;
    includeMedia: boolean;
    storageLocation: 'local' | 's3' | 'gcs' | 'azure';
    storageConfig: Record<string, any>;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    maxFileSize: number; // MB
    maxFiles: number;
    enableQueryLogging: boolean;
    enableErrorLogging: boolean;
    enableAccessLogging: boolean;
    logRetentionDays: number;
  };
  monitoring: {
    enableHealthChecks: boolean;
    healthCheckInterval: number; // minutes
    alertThresholds: {
      cpuUsage: number; // percentage
      memoryUsage: number; // percentage
      diskUsage: number; // percentage
      responseTime: number; // milliseconds
    };
    notificationChannels: {
      email: boolean;
      slack?: {
        enabled: boolean;
        webhookUrl: string;
        channel: string;
      };
      webhook?: {
        enabled: boolean;
        url: string;
        secret: string;
      };
    };
  };
}
```

---

## 🎨 **Settings Interface**

### **General Settings Panel:**
```
┌─────────────────────────────────────────────────────────┐
│ ⚙️ System Settings                        [Save Changes] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Site Information ─────────────────────────────────┐   │
│ │ Site Title: [JA-CMS Website_________________]      │   │
│ │ Tagline: [Powerful Content Management_______]      │   │
│ │ Site URL: [https://example.com______________]      │   │
│ │ Admin Email: [admin@example.com_____________]      │   │
│ │ Language: [English ▼]                             │   │
│ │ Timezone: [UTC ▼]                                 │   │
│ │ Date Format: [Y-m-d ▼] Preview: 2024-01-09       │   │
│ │ Time Format: [H:i ▼] Preview: 14:30              │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ User Registration ────────────────────────────────┐   │
│ │ ☑ Allow user registration                          │   │
│ │ Default Role: [Subscriber ▼]                       │   │
│ │ ☑ Require email verification                       │   │
│ │ ☐ Moderate new registrations                       │   │
│ │ Allowed Domains: [example.com, company.com_____]  │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Comments ─────────────────────────────────────────┐   │
│ │ ☑ Allow comments on posts                          │   │
│ │ ☑ Require comment moderation                       │   │
│ │ ☐ Allow guest comments                             │   │
│ │ Max nesting level: [3___]                          │   │
│ │ Auto-close comments after: [30__] days             │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Technical Settings Panel:**
```
┌─────────────────────────────────────────────────────────┐
│ 🔧 Technical Settings                     [Save] [Test] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Performance ──────────────────────────────────────┐   │
│ │ ☑ Enable caching                                   │   │
│ │ Cache Type: [Redis ▼]                              │   │
│ │ Cache TTL: [3600___] seconds                       │   │
│ │ ☑ Enable compression (Level: [6___])               │   │
│ │ ☑ Minify CSS/JS                                    │   │
│ │ ☑ Lazy load images                                 │   │
│ │ ☑ Enable CDN                                       │   │
│ │ CDN URL: [https://cdn.example.com__________]       │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Database ─────────────────────────────────────────┐   │
│ │ Optimize every: [24__] hours                       │   │
│ │ ☑ Cleanup old revisions (Keep: [10__] revisions)   │   │
│ │ ☑ Cleanup trash (After: [30__] days)              │   │
│ │ ☑ Enable query cache                               │   │
│ │ [Optimize Now] [Clean Revisions] [Empty Trash]     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Security ─────────────────────────────────────────┐   │
│ │ ☑ Force SSL                                        │   │
│ │ ☑ Hide version information                         │   │
│ │ ☑ Disable file editing                             │   │
│ │ Login attempts limit: [5___] per hour              │   │
│ │ Session timeout: [120___] minutes                  │   │
│ │ Allowed IPs: [192.168.1.0/24, 10.0.0.0/8____]    │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Settings management
GET    /api/settings                     // Get all settings
GET    /api/settings/{category}          // Get category settings
PUT    /api/settings/{category}          // Update category settings
PATCH  /api/settings/{category}/{key}    // Update single setting
POST   /api/settings/validate            // Validate settings
POST   /api/settings/test                // Test settings (email, cache, etc.)

// Configuration backup/restore
GET    /api/settings/export              // Export all settings
POST   /api/settings/import              // Import settings
POST   /api/settings/backup              // Create settings backup
GET    /api/settings/backups             // List available backups
POST   /api/settings/restore/{backupId}  // Restore from backup

// System maintenance
POST   /api/system/maintenance           // Enable/disable maintenance mode
POST   /api/system/optimize              // Optimize database
POST   /api/system/cleanup               // Cleanup old data
GET    /api/system/health                // System health check
```

### **Database Schema:**
```sql
-- System settings
CREATE TABLE system_settings (
  id UUID PRIMARY KEY,
  category VARCHAR(100) NOT NULL UNIQUE,
  settings JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Settings history for audit trail
CREATE TABLE settings_history (
  id UUID PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  key_name VARCHAR(255) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Email templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  subject VARCHAR(255) NOT NULL,
  html_template TEXT NOT NULL,
  text_template TEXT,
  variables JSONB,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Settings backups
CREATE TABLE settings_backups (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  settings_data JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  file_size INTEGER,
  checksum VARCHAR(64)
);

-- System maintenance log
CREATE TABLE maintenance_log (
  id UUID PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'running',
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration INTEGER, -- seconds
  details JSONB,
  performed_by UUID REFERENCES users(id)
);
```

### **Settings Validation Service:**
```typescript
export class SettingsValidationService {
  private validators: Map<string, SettingValidator[]> = new Map();

  constructor() {
    this.registerDefaultValidators();
  }

  private registerDefaultValidators(): void {
    // URL validation
    this.addValidator('site.url', (value: string) => {
      try {
        new URL(value);
        return { valid: true };
      } catch {
        return { valid: false, message: 'Invalid URL format' };
      }
    });

    // Email validation
    this.addValidator('site.adminEmail', (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        valid: emailRegex.test(value),
        message: emailRegex.test(value) ? undefined : 'Invalid email format'
      };
    });

    // Numeric range validation
    this.addValidator('reading.postsPerPage', (value: number) => {
      return {
        valid: value >= 1 && value <= 100,
        message: value >= 1 && value <= 100 ? undefined : 'Must be between 1 and 100'
      };
    });

    // File size validation
    this.addValidator('media.maxUploadSize', (value: number) => {
      const maxSize = 100 * 1024 * 1024; // 100MB
      return {
        valid: value > 0 && value <= maxSize,
        message: value > 0 && value <= maxSize ? undefined : 'Must be between 1 byte and 100MB'
      };
    });
  }

  addValidator(settingPath: string, validator: SettingValidator): void {
    const existing = this.validators.get(settingPath) || [];
    existing.push(validator);
    this.validators.set(settingPath, existing);
  }

  async validateSetting(settingPath: string, value: any): Promise<ValidationResult[]> {
    const validators = this.validators.get(settingPath) || [];
    const results: ValidationResult[] = [];

    for (const validator of validators) {
      const result = await validator(value);
      results.push(result);
    }

    return results;
  }

  async validateAllSettings(settings: Record<string, any>): Promise<ValidationSummary> {
    const results: ValidationSummary = {
      valid: true,
      errors: {},
      warnings: {}
    };

    for (const [path, value] of Object.entries(this.flattenObject(settings))) {
      const validationResults = await this.validateSetting(path, value);
      
      for (const result of validationResults) {
        if (!result.valid) {
          results.valid = false;
          if (!results.errors[path]) {
            results.errors[path] = [];
          }
          results.errors[path].push(result.message || 'Validation failed');
        }
        
        if (result.warning) {
          if (!results.warnings[path]) {
            results.warnings[path] = [];
          }
          results.warnings[path].push(result.warning);
        }
      }
    }

    return results;
  }

  private flattenObject(obj: any, prefix = ''): Record<string, any> {
    const flattened: Record<string, any> = {};
    
    for (const key in obj) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }
    
    return flattened;
  }
}

interface ValidationSummary {
  valid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}
```

---

## 🔗 **Related Documentation**

- **[User Management](../05_users/)** - User-related settings and permissions
- **[Security Monitoring](../06_security/monitoring.md)** - Security settings integration
- **[Email Configuration](../08_tools/)** - Email system setup
- **[Performance Optimization](../08_tools/)** - Performance settings

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
