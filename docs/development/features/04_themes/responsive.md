# 📱 Responsive Design System

> **Mobile-First Responsive Design JA-CMS**  
> Advanced responsive design tools dengan breakpoint management dan device testing

---

## 📋 **Deskripsi**

Responsive Design System menyediakan comprehensive tools untuk membuat website yang optimal di semua device. Sistem ini menggunakan mobile-first approach dengan flexible breakpoint management, device testing, dan performance optimization untuk memberikan user experience yang konsisten.

---

## ⭐ **Core Features**

### **1. 📐 Breakpoint Management**

#### **Responsive Architecture:**
```typescript
interface ResponsiveSystem {
  breakpoints: BreakpointConfig;
  devicePresets: DevicePreset[];
  viewportManager: ViewportManager;
  mediaQueryGenerator: MediaQueryGenerator;
  responsiveUtilities: ResponsiveUtility[];
}

interface BreakpointConfig {
  mobile: {
    min: number;
    max: number;
    default: number;
  };
  tablet: {
    min: number;
    max: number;
    default: number;
  };
  desktop: {
    min: number;
    max: number;
    default: number;
  };
  largeDesktop?: {
    min: number;
    max: number;
    default: number;
  };
  custom: CustomBreakpoint[];
}

interface CustomBreakpoint {
  id: string;
  name: string;
  minWidth: number;
  maxWidth?: number;
  description: string;
  isActive: boolean;
}

interface DevicePreset {
  id: string;
  name: string;
  category: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
  pixelRatio: number;
  userAgent: string;
  orientation: 'portrait' | 'landscape';
  features: DeviceFeature[];
  isPopular: boolean;
}

interface DeviceFeature {
  name: string;
  supported: boolean;
  version?: string;
}

interface ResponsiveProperty {
  property: string;
  values: {
    mobile?: any;
    tablet?: any;
    desktop?: any;
    largeDesktop?: any;
    [key: string]: any; // custom breakpoints
  };
  unit?: string;
  important?: boolean;
}

interface ResponsiveUtility {
  name: string;
  className: string;
  properties: ResponsiveProperty[];
  description: string;
  category: 'layout' | 'spacing' | 'typography' | 'display' | 'flexbox' | 'grid';
}
```

#### **Responsive Manager Service:**
```typescript
export class ResponsiveManagerService {
  private breakpointConfig: BreakpointConfig;
  private devicePresets: DevicePreset[];
  private cssGenerator: ResponsiveCSSGenerator;
  private deviceTester: DeviceTester;

  constructor() {
    this.breakpointConfig = this.getDefaultBreakpoints();
    this.devicePresets = this.getPopularDevices();
    this.cssGenerator = new ResponsiveCSSGenerator();
    this.deviceTester = new DeviceTester();
  }

  async setBreakpoints(config: Partial<BreakpointConfig>): Promise<void> {
    // Validate breakpoint configuration
    const validation = this.validateBreakpoints(config);
    if (!validation.valid) {
      throw new Error(`Invalid breakpoint configuration: ${validation.errors.join(', ')}`);
    }

    // Update configuration
    this.breakpointConfig = {
      ...this.breakpointConfig,
      ...config
    };

    // Regenerate responsive CSS
    await this.regenerateResponsiveCSS();
    
    // Update all themes using these breakpoints
    await this.updateThemeBreakpoints();
  }

  async addCustomBreakpoint(breakpoint: CustomBreakpoint): Promise<void> {
    // Validate custom breakpoint
    const validation = this.validateCustomBreakpoint(breakpoint);
    if (!validation.valid) {
      throw new Error(`Invalid custom breakpoint: ${validation.errors.join(', ')}`);
    }

    // Check for conflicts with existing breakpoints
    const conflicts = this.checkBreakpointConflicts(breakpoint);
    if (conflicts.length > 0) {
      throw new Error(`Breakpoint conflicts with: ${conflicts.join(', ')}`);
    }

    // Add to configuration
    this.breakpointConfig.custom.push(breakpoint);

    // Update CSS framework
    await this.updateCSSFramework();
  }

  generateResponsiveCSS(styles: ResponsiveStyles): string {
    let css = '';
    
    // Mobile-first approach: start with mobile styles
    if (styles.mobile) {
      css += this.generateDeviceCSS(styles.mobile, 'mobile');
    }

    // Tablet styles
    if (styles.tablet) {
      css += `\n@media (min-width: ${this.breakpointConfig.tablet.min}px) {\n`;
      css += this.generateDeviceCSS(styles.tablet, 'tablet');
      css += '\n}';
    }

    // Desktop styles
    if (styles.desktop) {
      css += `\n@media (min-width: ${this.breakpointConfig.desktop.min}px) {\n`;
      css += this.generateDeviceCSS(styles.desktop, 'desktop');
      css += '\n}';
    }

    // Large desktop styles
    if (styles.largeDesktop) {
      css += `\n@media (min-width: ${this.breakpointConfig.largeDesktop?.min}px) {\n`;
      css += this.generateDeviceCSS(styles.largeDesktop, 'largeDesktop');
      css += '\n}';
    }

    // Custom breakpoint styles
    this.breakpointConfig.custom.forEach(breakpoint => {
      if (styles[breakpoint.id]) {
        css += `\n@media (min-width: ${breakpoint.minWidth}px)`;
        if (breakpoint.maxWidth) {
          css += ` and (max-width: ${breakpoint.maxWidth}px)`;
        }
        css += ' {\n';
        css += this.generateDeviceCSS(styles[breakpoint.id], breakpoint.id);
        css += '\n}';
      }
    });

    return css;
  }

  async testDevice(deviceId: string, url: string): Promise<DeviceTestResult> {
    const device = this.devicePresets.find(d => d.id === deviceId);
    if (!device) {
      throw new Error('Device preset not found');
    }

    const testResult = await this.deviceTester.test({
      url,
      device,
      tests: [
        'viewport',
        'performance',
        'usability',
        'accessibility',
        'seo'
      ]
    });

    return {
      device,
      url,
      timestamp: new Date(),
      results: testResult,
      score: this.calculateDeviceScore(testResult),
      recommendations: this.generateRecommendations(testResult, device)
    };
  }

  async generateResponsiveUtilities(): Promise<ResponsiveUtility[]> {
    const utilities: ResponsiveUtility[] = [];

    // Display utilities
    utilities.push({
      name: 'Display',
      className: 'd-{breakpoint}-{value}',
      properties: [{
        property: 'display',
        values: {
          mobile: 'block',
          tablet: 'flex',
          desktop: 'grid'
        }
      }],
      description: 'Control element display property across breakpoints',
      category: 'display'
    });

    // Spacing utilities
    utilities.push({
      name: 'Margin',
      className: 'm-{breakpoint}-{size}',
      properties: [{
        property: 'margin',
        values: {
          mobile: '0.5rem',
          tablet: '1rem',
          desktop: '1.5rem'
        },
        unit: 'rem'
      }],
      description: 'Responsive margin spacing',
      category: 'spacing'
    });

    utilities.push({
      name: 'Padding',
      className: 'p-{breakpoint}-{size}',
      properties: [{
        property: 'padding',
        values: {
          mobile: '0.5rem',
          tablet: '1rem',
          desktop: '1.5rem'
        },
        unit: 'rem'
      }],
      description: 'Responsive padding spacing',
      category: 'spacing'
    });

    // Typography utilities
    utilities.push({
      name: 'Font Size',
      className: 'fs-{breakpoint}-{size}',
      properties: [{
        property: 'font-size',
        values: {
          mobile: '0.875rem',
          tablet: '1rem',
          desktop: '1.125rem'
        },
        unit: 'rem'
      }],
      description: 'Responsive font sizes',
      category: 'typography'
    });

    // Flexbox utilities
    utilities.push({
      name: 'Flex Direction',
      className: 'flex-{breakpoint}-{direction}',
      properties: [{
        property: 'flex-direction',
        values: {
          mobile: 'column',
          tablet: 'row',
          desktop: 'row'
        }
      }],
      description: 'Responsive flex direction',
      category: 'flexbox'
    });

    // Grid utilities
    utilities.push({
      name: 'Grid Columns',
      className: 'grid-cols-{breakpoint}-{count}',
      properties: [{
        property: 'grid-template-columns',
        values: {
          mobile: 'repeat(1, minmax(0, 1fr))',
          tablet: 'repeat(2, minmax(0, 1fr))',
          desktop: 'repeat(3, minmax(0, 1fr))'
        }
      }],
      description: 'Responsive grid column count',
      category: 'grid'
    });

    return utilities;
  }

  private getDefaultBreakpoints(): BreakpointConfig {
    return {
      mobile: {
        min: 0,
        max: 767,
        default: 375
      },
      tablet: {
        min: 768,
        max: 1023,
        default: 768
      },
      desktop: {
        min: 1024,
        max: 1199,
        default: 1024
      },
      largeDesktop: {
        min: 1200,
        max: 9999,
        default: 1200
      },
      custom: []
    };
  }

  private getPopularDevices(): DevicePreset[] {
    return [
      // Mobile Devices
      {
        id: 'iphone-se',
        name: 'iPhone SE',
        category: 'mobile',
        width: 375,
        height: 667,
        pixelRatio: 2,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        orientation: 'portrait',
        features: [
          { name: 'touch', supported: true },
          { name: 'geolocation', supported: true },
          { name: 'camera', supported: true }
        ],
        isPopular: true
      },
      {
        id: 'iphone-12',
        name: 'iPhone 12',
        category: 'mobile',
        width: 390,
        height: 844,
        pixelRatio: 3,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        orientation: 'portrait',
        features: [
          { name: 'touch', supported: true },
          { name: 'geolocation', supported: true },
          { name: 'camera', supported: true },
          { name: 'face-id', supported: true }
        ],
        isPopular: true
      },
      {
        id: 'samsung-galaxy-s21',
        name: 'Samsung Galaxy S21',
        category: 'mobile',
        width: 384,
        height: 854,
        pixelRatio: 2.75,
        userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        orientation: 'portrait',
        features: [
          { name: 'touch', supported: true },
          { name: 'geolocation', supported: true },
          { name: 'camera', supported: true },
          { name: 'fingerprint', supported: true }
        ],
        isPopular: true
      },

      // Tablet Devices
      {
        id: 'ipad',
        name: 'iPad',
        category: 'tablet',
        width: 768,
        height: 1024,
        pixelRatio: 2,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A372 Safari/604.1',
        orientation: 'portrait',
        features: [
          { name: 'touch', supported: true },
          { name: 'geolocation', supported: true },
          { name: 'camera', supported: true }
        ],
        isPopular: true
      },
      {
        id: 'ipad-pro',
        name: 'iPad Pro 12.9"',
        category: 'tablet',
        width: 1024,
        height: 1366,
        pixelRatio: 2,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15A372 Safari/604.1',
        orientation: 'portrait',
        features: [
          { name: 'touch', supported: true },
          { name: 'geolocation', supported: true },
          { name: 'camera', supported: true },
          { name: 'apple-pencil', supported: true }
        ],
        isPopular: true
      },

      // Desktop Devices
      {
        id: 'macbook-air',
        name: 'MacBook Air',
        category: 'desktop',
        width: 1440,
        height: 900,
        pixelRatio: 2,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36',
        orientation: 'landscape',
        features: [
          { name: 'keyboard', supported: true },
          { name: 'mouse', supported: true },
          { name: 'camera', supported: true }
        ],
        isPopular: true
      },
      {
        id: 'desktop-1080p',
        name: 'Desktop 1080p',
        category: 'desktop',
        width: 1920,
        height: 1080,
        pixelRatio: 1,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36',
        orientation: 'landscape',
        features: [
          { name: 'keyboard', supported: true },
          { name: 'mouse', supported: true }
        ],
        isPopular: true
      }
    ];
  }

  private generateDeviceCSS(styles: DeviceStyles, device: string): string {
    let css = '';
    
    Object.entries(styles).forEach(([selector, properties]) => {
      css += `  ${selector} {\n`;
      
      Object.entries(properties).forEach(([property, value]) => {
        css += `    ${property}: ${value};\n`;
      });
      
      css += '  }\n';
    });

    return css;
  }

  private calculateDeviceScore(testResult: any): number {
    // Calculate overall score based on test results
    const weights = {
      performance: 0.3,
      usability: 0.3,
      accessibility: 0.2,
      seo: 0.2
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([category, weight]) => {
      if (testResult[category] && testResult[category].score !== undefined) {
        totalScore += testResult[category].score * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  private generateRecommendations(testResult: any, device: DevicePreset): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Performance recommendations
    if (testResult.performance && testResult.performance.score < 70) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        title: `Optimize for ${device.name}`,
        description: 'Page loading time is too slow for this device',
        actions: [
          'Optimize images for mobile',
          'Minify CSS and JavaScript',
          'Enable compression',
          'Use lazy loading'
        ]
      });
    }

    // Usability recommendations
    if (testResult.usability && testResult.usability.score < 80) {
      recommendations.push({
        category: 'usability',
        priority: 'medium',
        title: 'Improve mobile usability',
        description: 'Touch targets and navigation need improvement',
        actions: [
          'Increase touch target sizes',
          'Improve navigation for touch',
          'Optimize form inputs',
          'Add mobile-specific interactions'
        ]
      });
    }

    // Accessibility recommendations
    if (testResult.accessibility && testResult.accessibility.score < 90) {
      recommendations.push({
        category: 'accessibility',
        priority: 'medium',
        title: 'Enhance accessibility',
        description: 'Accessibility features need improvement',
        actions: [
          'Add proper ARIA labels',
          'Improve color contrast',
          'Ensure keyboard navigation',
          'Add screen reader support'
        ]
      });
    }

    return recommendations;
  }
}

interface ResponsiveStyles {
  mobile?: DeviceStyles;
  tablet?: DeviceStyles;
  desktop?: DeviceStyles;
  largeDesktop?: DeviceStyles;
  [key: string]: DeviceStyles | undefined; // custom breakpoints
}

interface DeviceStyles {
  [selector: string]: {
    [property: string]: string;
  };
}

interface DeviceTestResult {
  device: DevicePreset;
  url: string;
  timestamp: Date;
  results: any;
  score: number;
  recommendations: Recommendation[];
}

interface Recommendation {
  category: 'performance' | 'usability' | 'accessibility' | 'seo';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actions: string[];
}
```

### **2. 🔧 Responsive Utilities Generator**

#### **CSS Framework Generator:**
```typescript
export class ResponsiveCSSFramework {
  private breakpoints: BreakpointConfig;
  private utilities: ResponsiveUtility[];

  constructor(breakpoints: BreakpointConfig) {
    this.breakpoints = breakpoints;
    this.utilities = [];
  }

  generateFramework(): string {
    let css = '';

    // Base styles
    css += this.generateBaseStyles();

    // Container styles
    css += this.generateContainerStyles();

    // Grid system
    css += this.generateGridSystem();

    // Utility classes
    css += this.generateUtilityClasses();

    // Component responsive styles
    css += this.generateComponentStyles();

    return css;
  }

  private generateBaseStyles(): string {
    return `
/* Base Responsive Styles */
* {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

img {
  max-width: 100%;
  height: auto;
}

/* Responsive Images */
.img-responsive {
  display: block;
  max-width: 100%;
  height: auto;
}

/* Responsive Embeds */
.embed-responsive {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  overflow: hidden;
}

.embed-responsive::before {
  display: block;
  content: "";
}

.embed-responsive-16by9::before {
  padding-top: 56.25%;
}

.embed-responsive-4by3::before {
  padding-top: 75%;
}

.embed-responsive-item {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
`;
  }

  private generateContainerStyles(): string {
    let css = `
/* Container Styles */
.container {
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}

.container-fluid {
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}
`;

    // Add responsive container max-widths
    Object.entries(this.breakpoints).forEach(([device, config]) => {
      if (device !== 'custom' && device !== 'mobile') {
        css += `
@media (min-width: ${config.min}px) {
  .container {
    max-width: ${config.default}px;
  }
}`;
      }
    });

    return css;
  }

  private generateGridSystem(): string {
    let css = `
/* Grid System */
.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
}

.col {
  position: relative;
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  flex-basis: 0;
  flex-grow: 1;
  max-width: 100%;
}

/* Auto-layout columns */
.col-auto {
  flex: 0 0 auto;
  width: auto;
  max-width: 100%;
}
`;

    // Generate column classes for each breakpoint
    Object.entries(this.breakpoints).forEach(([device, config]) => {
      if (device === 'custom') return;
      
      const prefix = device === 'mobile' ? '' : `-${device}`;
      
      if (device !== 'mobile') {
        css += `\n@media (min-width: ${config.min}px) {`;
      }

      // Column sizes (1-12)
      for (let i = 1; i <= 12; i++) {
        const percentage = (i / 12) * 100;
        css += `
  .col${prefix}-${i} {
    flex: 0 0 ${percentage.toFixed(6)}%;
    max-width: ${percentage.toFixed(6)}%;
  }`;
      }

      // Offset classes
      for (let i = 0; i <= 11; i++) {
        const percentage = (i / 12) * 100;
        css += `
  .offset${prefix}-${i} {
    margin-left: ${percentage.toFixed(6)}%;
  }`;
      }

      if (device !== 'mobile') {
        css += '\n}';
      }
    });

    return css;
  }

  private generateUtilityClasses(): string {
    let css = '';

    // Display utilities
    const displayValues = ['none', 'inline', 'inline-block', 'block', 'flex', 'inline-flex', 'grid', 'table', 'table-cell'];
    
    displayValues.forEach(value => {
      css += `\n.d-${value} { display: ${value} !important; }`;
    });

    // Responsive display utilities
    Object.entries(this.breakpoints).forEach(([device, config]) => {
      if (device === 'custom') return;
      
      const prefix = device === 'mobile' ? '' : `-${device}`;
      
      if (device !== 'mobile') {
        css += `\n@media (min-width: ${config.min}px) {`;
      }

      displayValues.forEach(value => {
        css += `\n  .d${prefix}-${value} { display: ${value} !important; }`;
      });

      if (device !== 'mobile') {
        css += '\n}';
      }
    });

    // Spacing utilities
    const spacingSizes = [0, 1, 2, 3, 4, 5];
    const spacingProperties = ['m', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'];

    spacingProperties.forEach(property => {
      spacingSizes.forEach(size => {
        const value = size === 0 ? '0' : `${size * 0.25}rem`;
        css += `\n.${property}-${size} { ${this.getSpacingCSS(property, value)} }`;
      });
    });

    // Responsive spacing utilities
    Object.entries(this.breakpoints).forEach(([device, config]) => {
      if (device === 'custom' || device === 'mobile') return;
      
      css += `\n@media (min-width: ${config.min}px) {`;
      
      spacingProperties.forEach(property => {
        spacingSizes.forEach(size => {
          const value = size === 0 ? '0' : `${size * 0.25}rem`;
          css += `\n  .${property}-${device}-${size} { ${this.getSpacingCSS(property, value)} }`;
        });
      });
      
      css += '\n}';
    });

    // Text alignment utilities
    const textAlignValues = ['left', 'center', 'right', 'justify'];
    
    textAlignValues.forEach(value => {
      css += `\n.text-${value} { text-align: ${value} !important; }`;
    });

    // Responsive text alignment
    Object.entries(this.breakpoints).forEach(([device, config]) => {
      if (device === 'custom' || device === 'mobile') return;
      
      css += `\n@media (min-width: ${config.min}px) {`;
      
      textAlignValues.forEach(value => {
        css += `\n  .text-${device}-${value} { text-align: ${value} !important; }`;
      });
      
      css += '\n}';
    });

    return css;
  }

  private generateComponentStyles(): string {
    return `
/* Responsive Components */

/* Navigation */
.navbar-toggler {
  display: none;
  padding: 0.25rem 0.75rem;
  font-size: 1.25rem;
  line-height: 1;
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 0.25rem;
}

@media (max-width: ${this.breakpoints.tablet.min - 1}px) {
  .navbar-toggler {
    display: block;
  }
  
  .navbar-collapse {
    display: none;
  }
  
  .navbar-collapse.show {
    display: block;
  }
}

/* Cards */
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: #fff;
  background-clip: border-box;
  border: 1px solid rgba(0,0,0,.125);
  border-radius: 0.25rem;
}

@media (max-width: ${this.breakpoints.tablet.min - 1}px) {
  .card {
    margin-bottom: 1rem;
  }
}

/* Tables */
.table-responsive {
  display: block;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: ${this.breakpoints.tablet.min - 1}px) {
  .table-responsive-sm {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

/* Forms */
@media (max-width: ${this.breakpoints.mobile.max}px) {
  .form-control {
    font-size: 16px; /* Prevent zoom on iOS */
  }
  
  .btn {
    padding: 0.75rem 1.5rem;
    font-size: 1.1rem;
  }
}
`;
  }

  private getSpacingCSS(property: string, value: string): string {
    const propertyMap: { [key: string]: string } = {
      'm': `margin: ${value} !important;`,
      'mt': `margin-top: ${value} !important;`,
      'mr': `margin-right: ${value} !important;`,
      'mb': `margin-bottom: ${value} !important;`,
      'ml': `margin-left: ${value} !important;`,
      'mx': `margin-left: ${value} !important; margin-right: ${value} !important;`,
      'my': `margin-top: ${value} !important; margin-bottom: ${value} !important;`,
      'p': `padding: ${value} !important;`,
      'pt': `padding-top: ${value} !important;`,
      'pr': `padding-right: ${value} !important;`,
      'pb': `padding-bottom: ${value} !important;`,
      'pl': `padding-left: ${value} !important;`,
      'px': `padding-left: ${value} !important; padding-right: ${value} !important;`,
      'py': `padding-top: ${value} !important; padding-bottom: ${value} !important;`
    };

    return propertyMap[property] || '';
  }
}
```

### **3. 📱 Device Testing & Preview**

#### **Device Testing Service:**
```typescript
export class DeviceTestingService {
  private testSuite: DeviceTestSuite;
  private performanceMonitor: PerformanceMonitor;
  private usabilityTester: UsabilityTester;
  private accessibilityChecker: AccessibilityChecker;

  async runDeviceTest(config: DeviceTestConfig): Promise<DeviceTestReport> {
    const testResults: DeviceTestResult[] = [];

    for (const device of config.devices) {
      const result = await this.testSingleDevice(device, config.url, config.tests);
      testResults.push(result);
    }

    // Generate comparative analysis
    const analysis = this.generateComparativeAnalysis(testResults);
    
    // Generate recommendations
    const recommendations = this.generateDeviceRecommendations(testResults);

    return {
      url: config.url,
      testedAt: new Date(),
      devices: testResults,
      analysis,
      recommendations,
      overallScore: this.calculateOverallScore(testResults)
    };
  }

  private async testSingleDevice(device: DevicePreset, url: string, tests: DeviceTestType[]): Promise<DeviceTestResult> {
    const results: { [key: string]: any } = {};

    // Performance testing
    if (tests.includes('performance')) {
      results.performance = await this.performanceMonitor.test(url, device);
    }

    // Usability testing
    if (tests.includes('usability')) {
      results.usability = await this.usabilityTester.test(url, device);
    }

    // Accessibility testing
    if (tests.includes('accessibility')) {
      results.accessibility = await this.accessibilityChecker.test(url, device);
    }

    // Viewport testing
    if (tests.includes('viewport')) {
      results.viewport = await this.testViewport(url, device);
    }

    // Touch interaction testing
    if (tests.includes('touch') && device.category !== 'desktop') {
      results.touch = await this.testTouchInteractions(url, device);
    }

    return {
      device,
      results,
      score: this.calculateDeviceScore(results),
      timestamp: new Date()
    };
  }

  private async testViewport(url: string, device: DevicePreset): Promise<ViewportTestResult> {
    // Simulate device viewport
    const viewport = {
      width: device.width,
      height: device.height,
      pixelRatio: device.pixelRatio
    };

    // Test viewport meta tag
    const viewportMeta = await this.checkViewportMeta(url);
    
    // Test responsive breakpoints
    const breakpointTest = await this.testBreakpoints(url, device);
    
    // Test content overflow
    const overflowTest = await this.checkContentOverflow(url, viewport);
    
    // Test touch target sizes
    const touchTargetTest = await this.checkTouchTargets(url, device);

    return {
      viewport,
      viewportMeta,
      breakpoints: breakpointTest,
      overflow: overflowTest,
      touchTargets: touchTargetTest,
      score: this.calculateViewportScore({
        viewportMeta,
        breakpoints: breakpointTest,
        overflow: overflowTest,
        touchTargets: touchTargetTest
      })
    };
  }

  private async testTouchInteractions(url: string, device: DevicePreset): Promise<TouchTestResult> {
    return {
      tapTargetSize: await this.checkTapTargetSizes(url, device),
      touchGestures: await this.testTouchGestures(url, device),
      scrollPerformance: await this.testScrollPerformance(url, device),
      touchFeedback: await this.checkTouchFeedback(url, device),
      score: 0 // Will be calculated based on individual test results
    };
  }

  private generateComparativeAnalysis(results: DeviceTestResult[]): ComparativeAnalysis {
    const analysis: ComparativeAnalysis = {
      bestPerforming: this.findBestPerforming(results),
      worstPerforming: this.findWorstPerforming(results),
      commonIssues: this.findCommonIssues(results),
      deviceSpecificIssues: this.findDeviceSpecificIssues(results),
      performanceTrends: this.analyzePerformanceTrends(results)
    };

    return analysis;
  }

  private generateDeviceRecommendations(results: DeviceTestResult[]): DeviceRecommendation[] {
    const recommendations: DeviceRecommendation[] = [];

    // Analyze performance across devices
    const performanceIssues = results.filter(r => r.results.performance?.score < 70);
    if (performanceIssues.length > 0) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        title: 'Optimize performance for mobile devices',
        description: `${performanceIssues.length} devices showing poor performance`,
        affectedDevices: performanceIssues.map(r => r.device.id),
        actions: [
          'Optimize images for different screen densities',
          'Implement lazy loading for below-the-fold content',
          'Minify and compress CSS/JS files',
          'Use responsive image formats (WebP, AVIF)'
        ]
      });
    }

    // Analyze usability issues
    const usabilityIssues = results.filter(r => r.results.usability?.score < 80);
    if (usabilityIssues.length > 0) {
      recommendations.push({
        category: 'usability',
        priority: 'medium',
        title: 'Improve mobile usability',
        description: `${usabilityIssues.length} devices have usability concerns`,
        affectedDevices: usabilityIssues.map(r => r.device.id),
        actions: [
          'Increase touch target sizes (minimum 44px)',
          'Improve navigation for touch devices',
          'Optimize form inputs for mobile',
          'Add appropriate touch feedback'
        ]
      });
    }

    return recommendations;
  }
}

interface DeviceTestConfig {
  url: string;
  devices: DevicePreset[];
  tests: DeviceTestType[];
}

interface DeviceTestReport {
  url: string;
  testedAt: Date;
  devices: DeviceTestResult[];
  analysis: ComparativeAnalysis;
  recommendations: DeviceRecommendation[];
  overallScore: number;
}

interface ViewportTestResult {
  viewport: {
    width: number;
    height: number;
    pixelRatio: number;
  };
  viewportMeta: any;
  breakpoints: any;
  overflow: any;
  touchTargets: any;
  score: number;
}

interface TouchTestResult {
  tapTargetSize: any;
  touchGestures: any;
  scrollPerformance: any;
  touchFeedback: any;
  score: number;
}

interface ComparativeAnalysis {
  bestPerforming: DeviceTestResult;
  worstPerforming: DeviceTestResult;
  commonIssues: string[];
  deviceSpecificIssues: { [deviceId: string]: string[] };
  performanceTrends: any;
}

interface DeviceRecommendation {
  category: 'performance' | 'usability' | 'accessibility' | 'viewport';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  affectedDevices: string[];
  actions: string[];
}

type DeviceTestType = 'performance' | 'usability' | 'accessibility' | 'viewport' | 'touch' | 'seo';
```

---

## 🎨 **Responsive Design Interface**

### **Responsive Design Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 📱 Responsive Design Manager           [Test] [Preview] [Save] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Breakpoint Configuration ─────────────────────────┐   │
│ │ 📱 Mobile:    0px - 767px   (Default: 375px)      │   │
│ │ 📱 Tablet:    768px - 1023px (Default: 768px)     │   │
│ │ 💻 Desktop:   1024px - 1199px (Default: 1024px)   │   │
│ │ 🖥️ Large:     1200px+       (Default: 1200px)     │   │
│ │                                                   │   │
│ │ Custom Breakpoints:                                │   │
│ │ 📺 TV:        1400px - 1920px (Default: 1400px)   │   │
│ │                                                   │   │
│ │ [Add Custom Breakpoint] [Reset to Default]        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Device Preview ───────────────────────────────────┐   │
│ │ Current View: [Desktop ▼]                          │   │
│ │                                                   │   │
│ │ Quick Devices:                                     │   │
│ │ [📱 iPhone 12] [📱 Galaxy S21] [📱 iPad] [💻 MacBook] │   │
│ │                                                   │   │
│ │ ┌─ Preview Window ───────────────────────────────┐  │   │
│ │ │ 💻 Desktop (1024×768)                          │  │   │
│ │ │ ┌─────────────────────────────────────────────┐│  │   │
│ │ │ │ 🏠 Your Website                             ││  │   │
│ │ │ │ ═══════════════════════════════════════════ ││  │   │
│ │ │ │                                            ││  │   │
│ │ │ │ Welcome to our responsive website          ││  │   │
│ │ │ │                                            ││  │   │
│ │ │ │ [Hero Section]                             ││  │   │
│ │ │ │                                            ││  │   │
│ │ │ │ ┌────────┐ ┌────────┐ ┌────────┐          ││  │   │
│ │ │ │ │Feature1│ │Feature2│ │Feature3│          ││  │   │
│ │ │ │ └────────┘ └────────┘ └────────┘          ││  │   │
│ │ │ └─────────────────────────────────────────────┘│  │   │
│ │ │                                               │  │   │
│ │ │ Zoom: [50%] [75%] [100%] [125%] [150%]        │  │   │
│ │ └─────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Responsive Settings ──────────────────────────────┐   │
│ │ Element: Header Navigation                         │   │
│ │                                                   │   │
│ │ 💻 Desktop Settings:                               │   │
│ │ Display: [Flex ▼] Direction: [Row ▼]              │   │
│ │ Width: [100%] Height: [60px]                       │   │
│ │ Padding: [0 20px] Margin: [0]                      │   │
│ │                                                   │   │
│ │ 📱 Mobile Settings:                                │   │
│ │ Display: [Block ▼] Direction: [Column ▼]          │   │
│ │ Width: [100%] Height: [Auto]                       │   │
│ │ Padding: [10px] Margin: [0]                        │   │
│ │                                                   │   │
│ │ ☑ Hide on mobile  ☐ Different content             │   │
│ │                                                   │   │
│ │ [Apply Changes] [Reset] [Copy to Other Devices]   │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Device Testing Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ 🧪 Device Testing Suite                 [Run Test] [Schedule] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Test Configuration ───────────────────────────────┐   │
│ │ URL to Test: [https://yoursite.com_______________] │   │
│ │                                                   │   │
│ │ Select Devices:                                    │   │
│ │ ☑ iPhone SE (375×667)     ☑ iPhone 12 (390×844)  │   │
│ │ ☑ Galaxy S21 (384×854)    ☑ iPad (768×1024)      │   │
│ │ ☑ iPad Pro (1024×1366)    ☑ MacBook (1440×900)   │   │
│ │ ☑ Desktop 1080p (1920×1080)                       │   │
│ │                                                   │   │
│ │ Test Types:                                        │   │
│ │ ☑ Performance  ☑ Usability  ☑ Accessibility      │   │
│ │ ☑ Viewport     ☑ Touch      ☐ SEO                │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Test Results ─────────────────────────────────────┐   │
│ │ Last Test: December 21, 2023 at 2:30 PM           │   │
│ │                                                   │   │
│ │ Device Performance Scores:                         │   │
│ │ 📱 iPhone 12:      ████████░░ 82/100              │   │
│ │ 📱 Galaxy S21:     ███████░░░ 78/100              │   │
│ │ 📱 iPad:           █████████░ 91/100              │   │
│ │ 💻 MacBook:        ██████████ 95/100              │   │
│ │ 🖥️ Desktop 1080p:  ██████████ 98/100              │   │
│ │                                                   │   │
│ │ Overall Score: ████████░░ 89/100                  │   │
│ │                                                   │   │
│ │ ⚠️ Issues Found:                                   │   │
│ │ • Mobile tap targets too small (3 devices)        │   │
│ │ • Slow loading on 3G connection                   │   │
│ │ • Text contrast issues on mobile                  │   │
│ │                                                   │   │
│ │ [View Detailed Report] [Download PDF]             │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Recommendations ──────────────────────────────────┐   │
│ │ 🔧 High Priority:                                  │   │
│ │ 1. Increase button sizes for mobile devices       │   │
│ │    Affected: iPhone SE, Galaxy S21                │   │
│ │    Action: Use minimum 44px touch targets         │   │
│ │                                                   │   │
│ │ 2. Optimize images for mobile performance         │   │
│ │    Affected: All mobile devices                   │   │
│ │    Action: Implement responsive images            │   │
│ │                                                   │   │
│ │ 📋 Medium Priority:                                │   │
│ │ 3. Improve color contrast for accessibility       │   │
│ │    Affected: All devices                          │   │
│ │    Action: Use WCAG AA contrast ratios            │   │
│ │                                                   │   │
│ │ [Apply Recommendations] [Ignore] [Remind Later]   │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Responsive configuration
GET    /api/responsive/breakpoints        // Get breakpoint configuration
PUT    /api/responsive/breakpoints        // Update breakpoints
POST   /api/responsive/breakpoints/custom // Add custom breakpoint
DELETE /api/responsive/breakpoints/{id}   // Delete custom breakpoint

// Device testing
POST   /api/responsive/test               // Run device tests
GET    /api/responsive/test/{id}          // Get test results
GET    /api/responsive/test/{id}/report   // Download test report
POST   /api/responsive/test/schedule      // Schedule automated tests

// CSS framework
GET    /api/responsive/framework          // Get responsive CSS framework
POST   /api/responsive/framework/generate // Generate custom framework
GET    /api/responsive/utilities          // Get utility classes

// Device presets
GET    /api/responsive/devices            // List device presets
POST   /api/responsive/devices            // Add custom device preset
PUT    /api/responsive/devices/{id}       // Update device preset
DELETE /api/responsive/devices/{id}       // Delete device preset
```

### **Database Schema:**
```sql
-- Responsive configurations
CREATE TABLE responsive_configs (
  id UUID PRIMARY KEY,
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  breakpoints JSONB NOT NULL,
  utilities JSONB,
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Device presets
CREATE TABLE device_presets (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(20) NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  pixel_ratio DECIMAL(3,2) DEFAULT 1.0,
  user_agent TEXT,
  orientation VARCHAR(20) DEFAULT 'portrait',
  features JSONB,
  is_popular BOOLEAN DEFAULT false,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Device test results
CREATE TABLE device_test_results (
  id UUID PRIMARY KEY,
  url VARCHAR(1000) NOT NULL,
  device_id VARCHAR(50) REFERENCES device_presets(id),
  test_types TEXT[] NOT NULL,
  results JSONB NOT NULL,
  score INTEGER NOT NULL,
  tested_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Responsive utilities
CREATE TABLE responsive_utilities (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  class_name VARCHAR(255) NOT NULL,
  properties JSONB NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_responsive_configs_theme ON responsive_configs(theme_id);
CREATE INDEX idx_device_presets_category ON device_presets(category);
CREATE INDEX idx_device_presets_popular ON device_presets(is_popular);
CREATE INDEX idx_device_test_results_url ON device_test_results(url);
CREATE INDEX idx_device_test_results_tested_at ON device_test_results(tested_at);
CREATE INDEX idx_responsive_utilities_category ON responsive_utilities(category);
```

---

## 🔗 **Related Documentation**

- **[Theme Customizer](./customizer.md)** - Responsive settings dalam live customizer
- **[Visual Page Builder](./builder.md)** - Responsive block editing
- **[Widget System](./widgets.md)** - Responsive widget behavior
- **[Performance Optimization](../07_system/)** - Mobile performance optimization

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active

