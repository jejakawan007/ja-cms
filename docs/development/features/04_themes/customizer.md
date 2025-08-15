# 🎨 Theme Customizer System

> **Sistem Kustomisasi Theme Real-time JA-CMS**  
> Live theme customization with real-time preview and advanced controls

---

## 📋 **Deskripsi**

Theme Customizer System menyediakan interface yang powerful dan user-friendly untuk mengkustomisasi tampilan website secara real-time. Sistem ini memungkinkan users untuk mengubah colors, typography, layout, dan elemen visual lainnya dengan preview langsung tanpa coding.

---

## ⭐ **Core Features**

### **1. 🎛️ Live Customization Interface**

#### **Customizer Architecture:**
```typescript
interface CustomizerConfig {
  sections: CustomizerSection[];
  panels: CustomizerPanel[];
  controls: CustomizerControl[];
  settings: CustomizerSettings;
  transport: TransportConfig;
}

interface CustomizerSection {
  id: string;
  title: string;
  description?: string;
  panel?: string; // parent panel
  priority: number;
  capability?: string; // required permission
  controls: string[]; // control IDs in this section
  active_callback?: string; // JS function for conditional display
}

interface CustomizerPanel {
  id: string;
  title: string;
  description?: string;
  priority: number;
  capability?: string;
  sections: string[]; // section IDs in this panel
}

interface CustomizerControl {
  id: string;
  type: ControlType;
  section: string;
  label: string;
  description?: string;
  priority: number;
  default: any;
  transport: 'refresh' | 'postMessage';
  sanitize_callback?: string;
  validate_callback?: string;
  choices?: Record<string, string>;
  input_attrs?: Record<string, any>;
  active_callback?: string;
  settings: string[]; // setting IDs this control manages
}

type ControlType = 
  | 'text' 
  | 'email' 
  | 'url' 
  | 'number' 
  | 'range' 
  | 'color' 
  | 'image' 
  | 'cropped_image'
  | 'upload'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'textarea'
  | 'code'
  | 'date'
  | 'datetime'
  | 'typography'
  | 'spacing'
  | 'border'
  | 'background'
  | 'dimensions';
```

#### **Real-time Preview System:**
```typescript
export class CustomizerPreview {
  private iframe: HTMLIFrameElement;
  private previewWindow: Window;
  private settings: Map<string, any> = new Map();

  constructor(previewUrl: string) {
    this.setupPreviewFrame(previewUrl);
    this.bindEvents();
  }

  private setupPreviewFrame(url: string) {
    this.iframe = document.createElement('iframe');
    this.iframe.src = `${url}?customize_preview=true`;
    this.iframe.style.width = '100%';
    this.iframe.style.height = '100%';
    this.iframe.style.border = 'none';

    // Add device preview controls
    this.addDeviceControls();
    
    document.getElementById('preview-container')?.appendChild(this.iframe);

    this.iframe.onload = () => {
      this.previewWindow = this.iframe.contentWindow!;
      this.initializePreviewScripts();
    };
  }

  private initializePreviewScripts() {
    // Inject preview scripts into iframe
    const script = this.previewWindow.document.createElement('script');
    script.textContent = `
      // Preview enhancement scripts
      window.customizerPreview = {
        updateSetting: function(settingId, value) {
          // Apply setting changes to preview
          const event = new CustomEvent('customizer-setting-changed', {
            detail: { settingId, value }
          });
          document.dispatchEvent(event);
        },
        
        highlightElement: function(selector) {
          // Highlight elements for better UX
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            el.style.outline = '2px solid #0073aa';
            el.style.outlineOffset = '2px';
          });
        },
        
        removeHighlight: function() {
          // Remove all highlights
          const highlighted = document.querySelectorAll('[style*="outline"]');
          highlighted.forEach(el => {
            el.style.outline = '';
            el.style.outlineOffset = '';
          });
        }
      };

      // Listen for setting changes
      document.addEventListener('customizer-setting-changed', function(event) {
        const { settingId, value } = event.detail;
        applySettingToPreview(settingId, value);
      });

      function applySettingToPreview(settingId, value) {
        switch(settingId) {
          case 'site_title':
            updateSiteTitle(value);
            break;
          case 'primary_color':
            updatePrimaryColor(value);
            break;
          case 'typography_heading':
            updateHeadingTypography(value);
            break;
          // ... more setting handlers
        }
      }
    `;
    
    this.previewWindow.document.head.appendChild(script);
  }

  updateSetting(settingId: string, value: any, transport: 'refresh' | 'postMessage' = 'postMessage') {
    this.settings.set(settingId, value);

    if (transport === 'postMessage' && this.previewWindow) {
      this.previewWindow.postMessage({
        type: 'customizer-setting-update',
        settingId,
        value
      }, '*');
    } else {
      // Refresh preview
      this.refreshPreview();
    }
  }

  private refreshPreview() {
    const currentUrl = new URL(this.iframe.src);
    const settings = Object.fromEntries(this.settings);
    
    // Add current settings as URL parameters
    Object.entries(settings).forEach(([key, value]) => {
      currentUrl.searchParams.set(`customize[${key}]`, JSON.stringify(value));
    });

    this.iframe.src = currentUrl.toString();
  }

  setDevice(device: 'desktop' | 'tablet' | 'mobile') {
    const dimensions = {
      desktop: { width: '100%', height: '100%' },
      tablet: { width: '768px', height: '1024px' },
      mobile: { width: '375px', height: '667px' }
    };

    const { width, height } = dimensions[device];
    this.iframe.style.width = width;
    this.iframe.style.height = height;

    // Center iframe for non-desktop views
    if (device !== 'desktop') {
      this.iframe.style.margin = '0 auto';
      this.iframe.style.display = 'block';
    }
  }
}
```

### **2. 🎨 Advanced Control Types**

#### **Typography Control:**
```typescript
export class TypographyControl extends CustomizerControl {
  private fontFamilies: FontFamily[] = [];
  private googleFonts: GoogleFont[] = [];

  render(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'customizer-control typography-control';

    container.innerHTML = `
      <label class="control-label">${this.config.label}</label>
      ${this.config.description ? `<p class="control-description">${this.config.description}</p>` : ''}
      
      <div class="typography-fields">
        <div class="field-group">
          <label>Font Family</label>
          <select class="font-family-select">
            <option value="">Select Font</option>
            <optgroup label="System Fonts">
              ${this.renderSystemFonts()}
            </optgroup>
            <optgroup label="Google Fonts">
              ${this.renderGoogleFonts()}
            </optgroup>
          </select>
        </div>

        <div class="field-group">
          <label>Font Weight</label>
          <select class="font-weight-select">
            <option value="100">Thin (100)</option>
            <option value="300">Light (300)</option>
            <option value="400">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi Bold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="900">Black (900)</option>
          </select>
        </div>

        <div class="field-group">
          <label>Font Size</label>
          <div class="range-control">
            <input type="range" class="font-size-range" min="10" max="72" step="1">
            <input type="number" class="font-size-input" min="10" max="72">
            <span class="unit">px</span>
          </div>
        </div>

        <div class="field-group">
          <label>Line Height</label>
          <div class="range-control">
            <input type="range" class="line-height-range" min="1" max="3" step="0.1">
            <input type="number" class="line-height-input" min="1" max="3" step="0.1">
          </div>
        </div>

        <div class="field-group">
          <label>Letter Spacing</label>
          <div class="range-control">
            <input type="range" class="letter-spacing-range" min="-2" max="5" step="0.1">
            <input type="number" class="letter-spacing-input" min="-2" max="5" step="0.1">
            <span class="unit">px</span>
          </div>
        </div>

        <div class="field-group">
          <label>Text Transform</label>
          <select class="text-transform-select">
            <option value="none">None</option>
            <option value="uppercase">Uppercase</option>
            <option value="lowercase">Lowercase</option>
            <option value="capitalize">Capitalize</option>
          </select>
        </div>
      </div>

      <div class="typography-preview">
        <p class="preview-text">The quick brown fox jumps over the lazy dog</p>
      </div>
    `;

    this.bindEvents(container);
    return container;
  }

  private bindEvents(container: HTMLElement) {
    const fields = container.querySelectorAll('select, input');
    
    fields.forEach(field => {
      field.addEventListener('change', () => {
        this.updateValue();
        this.updatePreview(container);
      });

      field.addEventListener('input', () => {
        this.updateValue();
        this.updatePreview(container);
      });
    });
  }

  private updateValue() {
    const container = this.element;
    const value: TypographyValue = {
      fontFamily: (container.querySelector('.font-family-select') as HTMLSelectElement).value,
      fontWeight: (container.querySelector('.font-weight-select') as HTMLSelectElement).value,
      fontSize: (container.querySelector('.font-size-input') as HTMLInputElement).value + 'px',
      lineHeight: (container.querySelector('.line-height-input') as HTMLInputElement).value,
      letterSpacing: (container.querySelector('.letter-spacing-input') as HTMLInputElement).value + 'px',
      textTransform: (container.querySelector('.text-transform-select') as HTMLSelectElement).value
    };

    this.setValue(value);
  }

  private updatePreview(container: HTMLElement) {
    const preview = container.querySelector('.preview-text') as HTMLElement;
    const value = this.getValue() as TypographyValue;

    if (preview && value) {
      preview.style.fontFamily = value.fontFamily || '';
      preview.style.fontWeight = value.fontWeight || '';
      preview.style.fontSize = value.fontSize || '';
      preview.style.lineHeight = value.lineHeight || '';
      preview.style.letterSpacing = value.letterSpacing || '';
      preview.style.textTransform = value.textTransform || '';
    }
  }
}

interface TypographyValue {
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  textTransform: string;
}
```

#### **Color Palette Control:**
```typescript
export class ColorPaletteControl extends CustomizerControl {
  private colorPicker: ColorPicker;
  private predefinedPalettes: ColorPalette[] = [];

  render(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'customizer-control color-palette-control';

    container.innerHTML = `
      <label class="control-label">${this.config.label}</label>
      ${this.config.description ? `<p class="control-description">${this.config.description}</p>` : ''}
      
      <div class="color-palette-fields">
        <div class="predefined-palettes">
          <label>Predefined Palettes</label>
          <div class="palette-grid">
            ${this.renderPredefinedPalettes()}
          </div>
        </div>

        <div class="custom-colors">
          <label>Custom Colors</label>
          <div class="color-inputs">
            <div class="color-field">
              <label>Primary</label>
              <input type="color" class="color-input" data-color="primary">
              <input type="text" class="color-text" data-color="primary" placeholder="#000000">
            </div>
            <div class="color-field">
              <label>Secondary</label>
              <input type="color" class="color-input" data-color="secondary">
              <input type="text" class="color-text" data-color="secondary" placeholder="#000000">
            </div>
            <div class="color-field">
              <label>Accent</label>
              <input type="color" class="color-input" data-color="accent">
              <input type="text" class="color-text" data-color="accent" placeholder="#000000">
            </div>
            <div class="color-field">
              <label>Text</label>
              <input type="color" class="color-input" data-color="text">
              <input type="text" class="color-text" data-color="text" placeholder="#000000">
            </div>
            <div class="color-field">
              <label>Background</label>
              <input type="color" class="color-input" data-color="background">
              <input type="text" class="color-text" data-color="background" placeholder="#ffffff">
            </div>
          </div>
        </div>

        <div class="palette-preview">
          <div class="preview-card">
            <div class="preview-header">Header</div>
            <div class="preview-content">
              <h3>Sample Heading</h3>
              <p>Sample paragraph text with <a href="#">link</a></p>
              <button class="preview-button">Button</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
    this.updatePreview(container);
    
    return container;
  }

  private renderPredefinedPalettes(): string {
    return this.predefinedPalettes.map(palette => `
      <div class="palette-option" data-palette="${palette.id}">
        <div class="palette-colors">
          ${palette.colors.map(color => `
            <div class="palette-color" style="background-color: ${color}"></div>
          `).join('')}
        </div>
        <span class="palette-name">${palette.name}</span>
      </div>
    `).join('');
  }

  private bindEvents(container: HTMLElement) {
    // Color input synchronization
    container.querySelectorAll('.color-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const colorKey = target.dataset.color!;
        const textInput = container.querySelector(`[data-color="${colorKey}"].color-text`) as HTMLInputElement;
        
        textInput.value = target.value;
        this.updateValue();
        this.updatePreview(container);
      });
    });

    container.querySelectorAll('.color-text').forEach(input => {
      input.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const colorKey = target.dataset.color!;
        const colorInput = container.querySelector(`[data-color="${colorKey}"].color-input`) as HTMLInputElement;
        
        if (this.isValidColor(target.value)) {
          colorInput.value = target.value;
          this.updateValue();
          this.updatePreview(container);
        }
      });
    });

    // Predefined palette selection
    container.querySelectorAll('.palette-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const paletteId = (e.currentTarget as HTMLElement).dataset.palette!;
        this.applyPredefinedPalette(paletteId, container);
      });
    });
  }

  private applyPredefinedPalette(paletteId: string, container: HTMLElement) {
    const palette = this.predefinedPalettes.find(p => p.id === paletteId);
    if (!palette) return;

    const colorKeys = ['primary', 'secondary', 'accent', 'text', 'background'];
    
    colorKeys.forEach((key, index) => {
      const color = palette.colors[index] || palette.colors[0];
      const colorInput = container.querySelector(`[data-color="${key}"].color-input`) as HTMLInputElement;
      const textInput = container.querySelector(`[data-color="${key}"].color-text`) as HTMLInputElement;
      
      if (colorInput && textInput) {
        colorInput.value = color;
        textInput.value = color;
      }
    });

    this.updateValue();
    this.updatePreview(container);
  }

  private updateValue() {
    const container = this.element;
    const colors: Record<string, string> = {};

    container.querySelectorAll('.color-text').forEach(input => {
      const colorKey = (input as HTMLInputElement).dataset.color!;
      colors[colorKey] = (input as HTMLInputElement).value;
    });

    this.setValue(colors);
  }

  private updatePreview(container: HTMLElement) {
    const preview = container.querySelector('.preview-card') as HTMLElement;
    const colors = this.getValue() as Record<string, string>;

    if (preview && colors) {
      const style = `
        --primary-color: ${colors.primary || '#007cba'};
        --secondary-color: ${colors.secondary || '#666666'};
        --accent-color: ${colors.accent || '#ff6b6b'};
        --text-color: ${colors.text || '#333333'};
        --background-color: ${colors.background || '#ffffff'};
      `;

      preview.style.cssText = style;
    }
  }

  private isValidColor(color: string): boolean {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
  }
}

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}
```

### **3. 🔧 Settings Management**

#### **Settings Storage & Validation:**
```typescript
export class CustomizerSettings {
  private settings: Map<string, CustomizerSetting> = new Map();
  private validators: Map<string, SettingValidator> = new Map();
  private sanitizers: Map<string, SettingSanitizer> = new Map();

  registerSetting(config: CustomizerSettingConfig) {
    const setting = new CustomizerSetting(config);
    this.settings.set(config.id, setting);

    if (config.validate) {
      this.validators.set(config.id, config.validate);
    }

    if (config.sanitize) {
      this.sanitizers.set(config.id, config.sanitize);
    }
  }

  async updateSetting(settingId: string, value: any): Promise<boolean> {
    const setting = this.settings.get(settingId);
    if (!setting) {
      throw new Error(`Setting ${settingId} not found`);
    }

    // Sanitize value
    const sanitizer = this.sanitizers.get(settingId);
    if (sanitizer) {
      value = sanitizer(value);
    }

    // Validate value
    const validator = this.validators.get(settingId);
    if (validator) {
      const validation = await validator(value);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.message}`);
      }
    }

    // Update setting
    setting.setValue(value);

    // Save to database
    await this.saveSetting(settingId, value);

    // Trigger change event
    this.triggerChange(settingId, value);

    return true;
  }

  private async saveSetting(settingId: string, value: any) {
    try {
      await fetch('/api/customizer/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          settingId,
          value
        })
      });
    } catch (error) {
      console.error('Failed to save setting:', error);
      throw error;
    }
  }

  private triggerChange(settingId: string, value: any) {
    const event = new CustomEvent('customizer-setting-changed', {
      detail: { settingId, value }
    });
    
    document.dispatchEvent(event);
  }

  exportSettings(): CustomizerExport {
    const settings: Record<string, any> = {};
    
    this.settings.forEach((setting, id) => {
      settings[id] = setting.getValue();
    });

    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      settings
    };
  }

  async importSettings(exportData: CustomizerExport): Promise<void> {
    // Validate export format
    if (!this.validateExport(exportData)) {
      throw new Error('Invalid export format');
    }

    // Import each setting
    for (const [settingId, value] of Object.entries(exportData.settings)) {
      try {
        await this.updateSetting(settingId, value);
      } catch (error) {
        console.warn(`Failed to import setting ${settingId}:`, error);
      }
    }
  }

  private validateExport(exportData: any): boolean {
    return exportData && 
           exportData.version && 
           exportData.settings && 
           typeof exportData.settings === 'object';
  }
}

class CustomizerSetting {
  private value: any;
  private default: any;
  private transport: 'refresh' | 'postMessage';

  constructor(private config: CustomizerSettingConfig) {
    this.default = config.default;
    this.value = config.default;
    this.transport = config.transport || 'refresh';
  }

  setValue(value: any) {
    this.value = value;
  }

  getValue(): any {
    return this.value;
  }

  getDefault(): any {
    return this.default;
  }

  reset() {
    this.value = this.default;
  }

  getTransport(): 'refresh' | 'postMessage' {
    return this.transport;
  }
}

interface CustomizerSettingConfig {
  id: string;
  default: any;
  transport?: 'refresh' | 'postMessage';
  validate?: SettingValidator;
  sanitize?: SettingSanitizer;
}

interface CustomizerExport {
  version: string;
  timestamp: string;
  settings: Record<string, any>;
}

type SettingValidator = (value: any) => Promise<ValidationResult> | ValidationResult;
type SettingSanitizer = (value: any) => any;

interface ValidationResult {
  valid: boolean;
  message?: string;
}
```

---

## 🎨 **Customizer Interface**

### **Main Customizer Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ 🎨 Customize: Default Theme                    [✕] [💾] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Controls ──────────┐ ┌─ Preview ───────────────────┐  │
│ │ 🔍 [Search...]      │ │ 📱 [Desktop] [Tablet] [📱]  │  │
│ │                     │ │ ┌─────────────────────────┐  │  │
│ │ ▼ Site Identity     │ │ │                         │  │  │
│ │   • Site Title      │ │ │    [Live Preview]       │  │  │
│ │   • Logo            │ │ │                         │  │  │
│ │   • Favicon         │ │ │                         │  │  │
│ │                     │ │ │                         │  │  │
│ │ ▼ Colors           │ │ │                         │  │  │
│ │   • Primary Color   │ │ │                         │  │  │
│ │   • Secondary       │ │ │                         │  │  │
│ │   • Accent          │ │ │                         │  │  │
│ │   • Text Colors     │ │ │                         │  │  │
│ │                     │ │ │                         │  │  │
│ │ ▼ Typography       │ │ │                         │  │  │
│ │   • Heading Font    │ │ │                         │  │  │
│ │   • Body Font       │ │ │                         │  │  │
│ │   • Font Sizes      │ │ │                         │  │  │
│ │                     │ │ └─────────────────────────┘  │  │
│ │ ▼ Layout           │ │                              │  │
│ │   • Header Style    │ │ [🔄 Refresh] [📤 Export]    │  │
│ │   • Sidebar         │ │ [📥 Import] [↩️ Reset]      │  │
│ │   • Footer          │ │                              │  │
│ └─────────────────────┘ └──────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│ [Cancel Changes] [Save & Publish] [Save Draft]          │
└─────────────────────────────────────────────────────────┘
```

### **Color Customization Panel:**
```
┌─ Colors ────────────────────────────────────────────────┐
│ 🎨 Brand Colors                                         │
│                                                         │
│ Primary Color                                           │
│ ┌──────┐ [#007cba___________] 🎨                        │
│ │██████│                                                │
│ └──────┘                                                │
│                                                         │
│ Secondary Color                                         │
│ ┌──────┐ [#666666___________] 🎨                        │
│ │██████│                                                │
│ └──────┘                                                │
│                                                         │
│ 📋 Predefined Palettes                                  │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                        │
│ │█████│ │█████│ │█████│ │█████│                        │
│ │█████│ │█████│ │█████│ │█████│                        │
│ └─────┘ └─────┘ └─────┘ └─────┘                        │
│ Modern   Ocean   Sunset  Forest                        │
│                                                         │
│ 🎯 Color Preview                                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Header with Primary Color                           │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Content area with text colors                   │ │ │
│ │ │ [Button] with accent color                      │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │ Footer with secondary colors                        │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Customizer management
GET    /api/customizer/config           // Get customizer configuration
POST   /api/customizer/settings         // Update setting value
GET    /api/customizer/settings         // Get all current settings
POST   /api/customizer/preview          // Generate preview URL
POST   /api/customizer/save             // Save customizations
POST   /api/customizer/reset            // Reset to defaults

// Import/Export
POST   /api/customizer/export           // Export customizations
POST   /api/customizer/import           // Import customizations
GET    /api/customizer/presets          // Get preset configurations

// Theme integration
GET    /api/themes/{id}/customizer      // Get theme customizer config
POST   /api/themes/{id}/customize       // Apply customizations to theme
```

### **Database Schema:**
```sql
-- Customizer settings
CREATE TABLE customizer_settings (
  id UUID PRIMARY KEY,
  setting_id VARCHAR(100) NOT NULL,
  theme_id VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(setting_id, theme_id)
);

-- Customizer presets
CREATE TABLE customizer_presets (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  theme_id VARCHAR(100) NOT NULL,
  settings JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Theme configurations
CREATE TABLE theme_customizer_configs (
  theme_id VARCHAR(100) PRIMARY KEY,
  config JSONB NOT NULL,
  version VARCHAR(20) NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔗 **Related Documentation**

- **[Theme Management](./themes.md)** - Theme installation and management
- **[Widget System](./widgets.md)** - Widget management integration
- **[Frontend Integration](../02_content/)** - Theme rendering with customizations
- **[Performance Optimization](../08_tools/)** - CSS optimization and caching

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
