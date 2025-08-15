# 🏗️ Visual Page Builder

> **Drag-Drop Page Builder JA-CMS**  
> Advanced visual page builder dengan blocks, templates, dan real-time editing

---

## 📋 **Deskripsi**

Visual Page Builder menyediakan interface yang intuitive untuk membangun pages dan layouts secara visual menggunakan drag-drop functionality. Sistem ini dilengkapi dengan block library, template system, responsive design tools, dan real-time preview untuk memberikan creative freedom tanpa coding.

---

## ⭐ **Core Features**

### **1. 🎨 Visual Editor Interface**

#### **Builder Architecture:**
```typescript
interface PageBuilder {
  id: string;
  name: string;
  version: string;
  config: BuilderConfig;
  canvas: Canvas;
  blocks: Block[];
  templates: Template[];
  history: HistoryState[];
  settings: BuilderSettings;
  metadata: {
    isActive: boolean;
    lastSaved: Date;
    autoSave: boolean;
    collaborators: Collaborator[];
  };
}

interface Canvas {
  id: string;
  width: number;
  height: number;
  zoom: number;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  gridEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
  rulers: boolean;
  guidelines: Guideline[];
  background: {
    type: 'color' | 'image' | 'gradient';
    value: string;
  };
}

interface Block {
  id: string;
  type: BlockType;
  name: string;
  category: BlockCategory;
  icon: string;
  description: string;
  content: BlockContent;
  styles: BlockStyles;
  attributes: BlockAttributes;
  position: Position;
  dimensions: Dimensions;
  constraints: Constraints;
  animations: Animation[];
  interactions: Interaction[];
  responsive: ResponsiveSettings;
  metadata: {
    version: string;
    isLocked: boolean;
    isHidden: boolean;
    parentId?: string;
    childrenIds: string[];
    createdAt: Date;
    updatedAt: Date;
  };
}

interface BlockContent {
  html?: string;
  text?: string;
  image?: ImageContent;
  video?: VideoContent;
  form?: FormContent;
  data?: Record<string, any>;
  children?: Block[];
}

interface BlockStyles {
  layout: {
    display: string;
    position: string;
    flexDirection?: string;
    justifyContent?: string;
    alignItems?: string;
    gap?: string;
  };
  spacing: {
    margin: Spacing;
    padding: Spacing;
  };
  typography: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    textAlign?: string;
    color?: string;
  };
  background: {
    color?: string;
    image?: string;
    gradient?: string;
    size?: string;
    position?: string;
    repeat?: string;
  };
  border: {
    width?: string;
    style?: string;
    color?: string;
    radius?: string;
  };
  effects: {
    shadow?: string;
    opacity?: number;
    transform?: string;
    filter?: string;
  };
}

interface Position {
  x: number;
  y: number;
  z: number; // z-index
}

interface Dimensions {
  width: string | number;
  height: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
}

interface ResponsiveSettings {
  desktop: Partial<Block>;
  tablet: Partial<Block>;
  mobile: Partial<Block>;
  breakpoints: {
    tablet: number;
    mobile: number;
  };
}

type BlockType = 'text' | 'image' | 'video' | 'button' | 'form' | 'container' | 'column' | 'row' | 'spacer' | 'divider' | 'icon' | 'map' | 'social' | 'gallery' | 'slider' | 'accordion' | 'tabs' | 'testimonial' | 'pricing' | 'countdown' | 'progress' | 'chart';

type BlockCategory = 'basic' | 'layout' | 'media' | 'form' | 'social' | 'ecommerce' | 'advanced';
```

#### **Visual Editor Service:**
```typescript
export class VisualEditorService {
  private canvas: CanvasManager;
  private blockManager: BlockManager;
  private historyManager: HistoryManager;
  private templateManager: TemplateManager;
  private collaborationManager: CollaborationManager;

  async initializeEditor(config: EditorConfig): Promise<PageBuilder> {
    const builder: PageBuilder = {
      id: this.generateBuilderId(),
      name: config.name || 'Untitled Page',
      version: '1.0.0',
      config: config,
      canvas: await this.canvas.initialize(config.canvas),
      blocks: [],
      templates: await this.templateManager.getTemplates(config.templateCategory),
      history: [],
      settings: config.settings || this.getDefaultSettings(),
      metadata: {
        isActive: true,
        lastSaved: new Date(),
        autoSave: config.autoSave !== false,
        collaborators: []
      }
    };

    // Initialize history
    await this.historyManager.initialize(builder.id);

    // Load existing content if editing
    if (config.pageId) {
      const existingContent = await this.loadPageContent(config.pageId);
      if (existingContent) {
        builder.blocks = existingContent.blocks;
        builder.canvas = { ...builder.canvas, ...existingContent.canvas };
      }
    }

    return builder;
  }

  async addBlock(builderId: string, blockType: BlockType, position: Position): Promise<Block> {
    const builder = await this.getBuilder(builderId);
    if (!builder) {
      throw new Error('Builder not found');
    }

    // Get block definition
    const blockDefinition = await this.blockManager.getBlockDefinition(blockType);
    if (!blockDefinition) {
      throw new Error(`Block type "${blockType}" not found`);
    }

    // Create block instance
    const block: Block = {
      id: this.generateBlockId(),
      type: blockType,
      name: blockDefinition.name,
      category: blockDefinition.category,
      icon: blockDefinition.icon,
      description: blockDefinition.description,
      content: this.createDefaultContent(blockDefinition),
      styles: this.createDefaultStyles(blockDefinition),
      attributes: blockDefinition.defaultAttributes || {},
      position,
      dimensions: blockDefinition.defaultDimensions || { width: 'auto', height: 'auto' },
      constraints: blockDefinition.constraints || {},
      animations: [],
      interactions: [],
      responsive: this.createResponsiveDefaults(blockDefinition),
      metadata: {
        version: blockDefinition.version || '1.0.0',
        isLocked: false,
        isHidden: false,
        childrenIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    // Add block to builder
    builder.blocks.push(block);

    // Save state to history
    await this.historyManager.saveState(builderId, {
      action: 'add_block',
      blockId: block.id,
      data: block
    });

    // Auto-save if enabled
    if (builder.metadata.autoSave) {
      await this.autoSave(builderId);
    }

    return block;
  }

  async updateBlock(builderId: string, blockId: string, updates: Partial<Block>): Promise<Block> {
    const builder = await this.getBuilder(builderId);
    if (!builder) {
      throw new Error('Builder not found');
    }

    const blockIndex = builder.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) {
      throw new Error('Block not found');
    }

    const originalBlock = builder.blocks[blockIndex];
    const updatedBlock = {
      ...originalBlock,
      ...updates,
      metadata: {
        ...originalBlock.metadata,
        updatedAt: new Date()
      }
    };

    // Validate updates
    const validation = await this.validateBlockUpdate(updatedBlock);
    if (!validation.valid) {
      throw new Error(`Invalid block update: ${validation.errors.join(', ')}`);
    }

    // Apply updates
    builder.blocks[blockIndex] = updatedBlock;

    // Save state to history
    await this.historyManager.saveState(builderId, {
      action: 'update_block',
      blockId,
      data: { original: originalBlock, updated: updatedBlock }
    });

    // Auto-save if enabled
    if (builder.metadata.autoSave) {
      await this.autoSave(builderId);
    }

    return updatedBlock;
  }

  async moveBlock(builderId: string, blockId: string, newPosition: Position): Promise<void> {
    const builder = await this.getBuilder(builderId);
    if (!builder) {
      throw new Error('Builder not found');
    }

    const block = builder.blocks.find(b => b.id === blockId);
    if (!block) {
      throw new Error('Block not found');
    }

    const oldPosition = block.position;

    // Check constraints
    const constraints = await this.checkMoveConstraints(block, newPosition, builder);
    if (!constraints.allowed) {
      throw new Error(`Move not allowed: ${constraints.reason}`);
    }

    // Update position
    block.position = newPosition;
    block.metadata.updatedAt = new Date();

    // Handle snap to grid
    if (builder.canvas.snapToGrid) {
      block.position = this.snapToGrid(newPosition, builder.canvas.gridSize);
    }

    // Save state to history
    await this.historyManager.saveState(builderId, {
      action: 'move_block',
      blockId,
      data: { oldPosition, newPosition: block.position }
    });

    // Auto-save if enabled
    if (builder.metadata.autoSave) {
      await this.autoSave(builderId);
    }
  }

  async duplicateBlock(builderId: string, blockId: string): Promise<Block> {
    const builder = await this.getBuilder(builderId);
    if (!builder) {
      throw new Error('Builder not found');
    }

    const originalBlock = builder.blocks.find(b => b.id === blockId);
    if (!originalBlock) {
      throw new Error('Block not found');
    }

    // Create duplicate
    const duplicatedBlock: Block = {
      ...JSON.parse(JSON.stringify(originalBlock)), // Deep clone
      id: this.generateBlockId(),
      position: {
        x: originalBlock.position.x + 20,
        y: originalBlock.position.y + 20,
        z: originalBlock.position.z
      },
      metadata: {
        ...originalBlock.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    // Add to builder
    builder.blocks.push(duplicatedBlock);

    // Save state to history
    await this.historyManager.saveState(builderId, {
      action: 'duplicate_block',
      blockId: duplicatedBlock.id,
      data: { originalId: blockId, duplicated: duplicatedBlock }
    });

    return duplicatedBlock;
  }

  async deleteBlock(builderId: string, blockId: string): Promise<void> {
    const builder = await this.getBuilder(builderId);
    if (!builder) {
      throw new Error('Builder not found');
    }

    const blockIndex = builder.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) {
      throw new Error('Block not found');
    }

    const deletedBlock = builder.blocks[blockIndex];

    // Check if block can be deleted
    const canDelete = await this.checkDeleteConstraints(deletedBlock, builder);
    if (!canDelete.allowed) {
      throw new Error(`Cannot delete block: ${canDelete.reason}`);
    }

    // Handle children blocks
    if (deletedBlock.metadata.childrenIds.length > 0) {
      // Delete children or move them to parent
      for (const childId of deletedBlock.metadata.childrenIds) {
        await this.handleOrphanedChild(builderId, childId, deletedBlock.metadata.parentId);
      }
    }

    // Remove block
    builder.blocks.splice(blockIndex, 1);

    // Update parent's children list
    if (deletedBlock.metadata.parentId) {
      const parent = builder.blocks.find(b => b.id === deletedBlock.metadata.parentId);
      if (parent) {
        parent.metadata.childrenIds = parent.metadata.childrenIds.filter(id => id !== blockId);
      }
    }

    // Save state to history
    await this.historyManager.saveState(builderId, {
      action: 'delete_block',
      blockId,
      data: deletedBlock
    });
  }

  async generateHTML(builderId: string, options: GenerateOptions = {}): Promise<GeneratedHTML> {
    const builder = await this.getBuilder(builderId);
    if (!builder) {
      throw new Error('Builder not found');
    }

    const generator = new HTMLGenerator();
    
    // Sort blocks by z-index and position
    const sortedBlocks = this.sortBlocksForRendering(builder.blocks);
    
    // Generate HTML structure
    const html = await generator.generate(sortedBlocks, {
      responsive: options.responsive !== false,
      minify: options.minify || false,
      includeStyles: options.includeStyles !== false,
      includeScripts: options.includeScripts !== false,
      targetDevice: options.targetDevice || 'all'
    });

    // Extract CSS
    const css = await generator.extractCSS(sortedBlocks, {
      minify: options.minify || false,
      responsive: options.responsive !== false
    });

    // Extract JavaScript
    const js = await generator.extractJS(sortedBlocks, {
      minify: options.minify || false
    });

    return {
      html,
      css,
      js,
      assets: generator.getRequiredAssets(),
      metadata: {
        blockCount: sortedBlocks.length,
        generatedAt: new Date(),
        options
      }
    };
  }

  async saveAsTemplate(builderId: string, templateData: SaveTemplateData): Promise<Template> {
    const builder = await this.getBuilder(builderId);
    if (!builder) {
      throw new Error('Builder not found');
    }

    // Generate template from current builder state
    const template: Template = {
      id: this.generateTemplateId(),
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      thumbnail: templateData.thumbnail,
      blocks: JSON.parse(JSON.stringify(builder.blocks)), // Deep clone
      canvas: JSON.parse(JSON.stringify(builder.canvas)),
      settings: templateData.settings || {},
      metadata: {
        isPublic: templateData.isPublic || false,
        createdBy: templateData.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        rating: 0
      }
    };

    // Save template
    await this.templateManager.saveTemplate(template);

    return template;
  }

  private createDefaultContent(blockDefinition: BlockDefinition): BlockContent {
    switch (blockDefinition.type) {
      case 'text':
        return { text: 'Your text here...' };
      case 'image':
        return { 
          image: {
            src: '/placeholder-image.jpg',
            alt: 'Placeholder image',
            width: 300,
            height: 200
          }
        };
      case 'button':
        return { text: 'Click me' };
      case 'container':
        return { children: [] };
      default:
        return {};
    }
  }

  private createDefaultStyles(blockDefinition: BlockDefinition): BlockStyles {
    return {
      layout: {
        display: blockDefinition.defaultDisplay || 'block',
        position: 'absolute'
      },
      spacing: {
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        padding: { top: 10, right: 10, bottom: 10, left: 10 }
      },
      typography: {
        fontSize: '16px',
        color: '#333333'
      },
      background: {},
      border: {},
      effects: {}
    };
  }

  private snapToGrid(position: Position, gridSize: number): Position {
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize,
      z: position.z
    };
  }

  private sortBlocksForRendering(blocks: Block[]): Block[] {
    return blocks.sort((a, b) => {
      // First by z-index
      if (a.position.z !== b.position.z) {
        return a.position.z - b.position.z;
      }
      // Then by y position
      if (a.position.y !== b.position.y) {
        return a.position.y - b.position.y;
      }
      // Finally by x position
      return a.position.x - b.position.x;
    });
  }
}

interface EditorConfig {
  name?: string;
  pageId?: string;
  templateId?: string;
  templateCategory?: string;
  canvas?: Partial<Canvas>;
  settings?: BuilderSettings;
  autoSave?: boolean;
}

interface GenerateOptions {
  responsive?: boolean;
  minify?: boolean;
  includeStyles?: boolean;
  includeScripts?: boolean;
  targetDevice?: 'all' | 'desktop' | 'tablet' | 'mobile';
}

interface GeneratedHTML {
  html: string;
  css: string;
  js: string;
  assets: RequiredAsset[];
  metadata: {
    blockCount: number;
    generatedAt: Date;
    options: GenerateOptions;
  };
}

interface SaveTemplateData {
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  settings?: Record<string, any>;
  isPublic?: boolean;
  createdBy: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  blocks: Block[];
  canvas: Canvas;
  settings: Record<string, any>;
  metadata: {
    isPublic: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    usageCount: number;
    rating: number;
  };
}
```

### **2. 🧱 Block System**

#### **Block Library:**
```typescript
export class BlockLibrary {
  static getBuiltInBlocks(): BlockDefinition[] {
    return [
      // Basic Blocks
      {
        type: 'text',
        name: 'Text',
        category: 'basic',
        icon: 'text',
        description: 'Add text content with rich formatting',
        version: '1.0.0',
        defaultDisplay: 'block',
        defaultDimensions: { width: 'auto', height: 'auto' },
        defaultAttributes: {
          editable: true,
          formatting: ['bold', 'italic', 'underline', 'link', 'color']
        },
        settingsSchema: {
          content: {
            type: 'richtext',
            label: 'Content',
            default: 'Your text here...'
          },
          typography: {
            type: 'typography',
            label: 'Typography',
            controls: ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'textAlign', 'color']
          },
          spacing: {
            type: 'spacing',
            label: 'Spacing',
            controls: ['margin', 'padding']
          }
        },
        responsive: true,
        animations: ['fadeIn', 'slideUp', 'typewriter'],
        interactions: ['hover', 'click']
      },

      {
        type: 'image',
        name: 'Image',
        category: 'media',
        icon: 'image',
        description: 'Add images with various display options',
        version: '1.0.0',
        defaultDisplay: 'block',
        defaultDimensions: { width: 300, height: 200 },
        settingsSchema: {
          source: {
            type: 'image',
            label: 'Image Source',
            required: true
          },
          alt: {
            type: 'text',
            label: 'Alt Text',
            default: ''
          },
          caption: {
            type: 'text',
            label: 'Caption',
            default: ''
          },
          link: {
            type: 'url',
            label: 'Link URL',
            default: ''
          },
          linkTarget: {
            type: 'select',
            label: 'Link Target',
            options: [
              { value: '_self', label: 'Same Window' },
              { value: '_blank', label: 'New Window' }
            ],
            default: '_self'
          },
          objectFit: {
            type: 'select',
            label: 'Object Fit',
            options: [
              { value: 'cover', label: 'Cover' },
              { value: 'contain', label: 'Contain' },
              { value: 'fill', label: 'Fill' },
              { value: 'none', label: 'None' }
            ],
            default: 'cover'
          }
        },
        responsive: true,
        animations: ['fadeIn', 'zoomIn', 'slideLeft', 'slideRight'],
        interactions: ['hover', 'click', 'lightbox']
      },

      {
        type: 'button',
        name: 'Button',
        category: 'basic',
        icon: 'button',
        description: 'Add interactive buttons with custom styling',
        version: '1.0.0',
        defaultDisplay: 'inline-block',
        defaultDimensions: { width: 'auto', height: 'auto' },
        settingsSchema: {
          text: {
            type: 'text',
            label: 'Button Text',
            default: 'Click me'
          },
          url: {
            type: 'url',
            label: 'Link URL',
            default: '#'
          },
          target: {
            type: 'select',
            label: 'Link Target',
            options: [
              { value: '_self', label: 'Same Window' },
              { value: '_blank', label: 'New Window' }
            ],
            default: '_self'
          },
          style: {
            type: 'select',
            label: 'Button Style',
            options: [
              { value: 'primary', label: 'Primary' },
              { value: 'secondary', label: 'Secondary' },
              { value: 'outline', label: 'Outline' },
              { value: 'ghost', label: 'Ghost' }
            ],
            default: 'primary'
          },
          size: {
            type: 'select',
            label: 'Size',
            options: [
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' }
            ],
            default: 'medium'
          },
          icon: {
            type: 'icon',
            label: 'Icon',
            default: null
          },
          iconPosition: {
            type: 'select',
            label: 'Icon Position',
            options: [
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' }
            ],
            default: 'left'
          }
        },
        responsive: true,
        animations: ['pulse', 'bounce', 'shake', 'glow'],
        interactions: ['hover', 'click', 'focus']
      },

      // Layout Blocks
      {
        type: 'container',
        name: 'Container',
        category: 'layout',
        icon: 'container',
        description: 'Container for grouping other blocks',
        version: '1.0.0',
        defaultDisplay: 'block',
        defaultDimensions: { width: '100%', height: 'auto' },
        canContainChildren: true,
        settingsSchema: {
          maxWidth: {
            type: 'number',
            label: 'Max Width',
            default: 1200,
            unit: 'px'
          },
          alignment: {
            type: 'select',
            label: 'Alignment',
            options: [
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' }
            ],
            default: 'center'
          },
          background: {
            type: 'background',
            label: 'Background',
            controls: ['color', 'image', 'gradient']
          },
          spacing: {
            type: 'spacing',
            label: 'Spacing',
            controls: ['margin', 'padding']
          }
        },
        responsive: true
      },

      {
        type: 'row',
        name: 'Row',
        category: 'layout',
        icon: 'row',
        description: 'Horizontal layout container',
        version: '1.0.0',
        defaultDisplay: 'flex',
        defaultDimensions: { width: '100%', height: 'auto' },
        canContainChildren: true,
        settingsSchema: {
          columns: {
            type: 'number',
            label: 'Number of Columns',
            default: 2,
            min: 1,
            max: 12
          },
          gap: {
            type: 'number',
            label: 'Gap',
            default: 20,
            unit: 'px'
          },
          justifyContent: {
            type: 'select',
            label: 'Justify Content',
            options: [
              { value: 'flex-start', label: 'Start' },
              { value: 'center', label: 'Center' },
              { value: 'flex-end', label: 'End' },
              { value: 'space-between', label: 'Space Between' },
              { value: 'space-around', label: 'Space Around' }
            ],
            default: 'flex-start'
          },
          alignItems: {
            type: 'select',
            label: 'Align Items',
            options: [
              { value: 'stretch', label: 'Stretch' },
              { value: 'flex-start', label: 'Start' },
              { value: 'center', label: 'Center' },
              { value: 'flex-end', label: 'End' }
            ],
            default: 'stretch'
          }
        },
        responsive: true
      },

      // Advanced Blocks
      {
        type: 'gallery',
        name: 'Image Gallery',
        category: 'media',
        icon: 'gallery',
        description: 'Display multiple images in various layouts',
        version: '1.0.0',
        defaultDisplay: 'block',
        defaultDimensions: { width: '100%', height: 'auto' },
        settingsSchema: {
          images: {
            type: 'image_collection',
            label: 'Images',
            default: []
          },
          layout: {
            type: 'select',
            label: 'Layout',
            options: [
              { value: 'grid', label: 'Grid' },
              { value: 'masonry', label: 'Masonry' },
              { value: 'carousel', label: 'Carousel' },
              { value: 'justified', label: 'Justified' }
            ],
            default: 'grid'
          },
          columns: {
            type: 'number',
            label: 'Columns',
            default: 3,
            min: 1,
            max: 6
          },
          gap: {
            type: 'number',
            label: 'Gap',
            default: 10,
            unit: 'px'
          },
          lightbox: {
            type: 'boolean',
            label: 'Enable Lightbox',
            default: true
          },
          showCaptions: {
            type: 'boolean',
            label: 'Show Captions',
            default: false
          }
        },
        responsive: true,
        animations: ['fadeIn', 'slideUp'],
        interactions: ['hover', 'click', 'lightbox'],
        assets: {
          js: ['lightbox.js'],
          css: ['gallery.css']
        }
      },

      {
        type: 'form',
        name: 'Contact Form',
        category: 'form',
        icon: 'form',
        description: 'Create custom contact forms',
        version: '1.0.0',
        defaultDisplay: 'block',
        defaultDimensions: { width: '100%', height: 'auto' },
        settingsSchema: {
          fields: {
            type: 'form_builder',
            label: 'Form Fields',
            default: [
              { type: 'text', name: 'name', label: 'Name', required: true },
              { type: 'email', name: 'email', label: 'Email', required: true },
              { type: 'textarea', name: 'message', label: 'Message', required: true }
            ]
          },
          submitText: {
            type: 'text',
            label: 'Submit Button Text',
            default: 'Send Message'
          },
          successMessage: {
            type: 'text',
            label: 'Success Message',
            default: 'Thank you for your message!'
          },
          emailTo: {
            type: 'email',
            label: 'Send To Email',
            required: true
          },
          emailSubject: {
            type: 'text',
            label: 'Email Subject',
            default: 'New Contact Form Submission'
          }
        },
        responsive: true,
        interactions: ['submit', 'validation'],
        assets: {
          js: ['form-validation.js'],
          css: ['form.css']
        }
      }
    ];
  }

  static createCustomBlock(definition: CustomBlockDefinition): BlockDefinition {
    return {
      type: definition.type,
      name: definition.name,
      category: 'custom',
      icon: definition.icon || 'custom',
      description: definition.description,
      version: definition.version || '1.0.0',
      defaultDisplay: definition.defaultDisplay || 'block',
      defaultDimensions: definition.defaultDimensions || { width: 'auto', height: 'auto' },
      settingsSchema: definition.settingsSchema,
      template: definition.template,
      styles: definition.styles,
      scripts: definition.scripts,
      responsive: definition.responsive !== false,
      animations: definition.animations || [],
      interactions: definition.interactions || [],
      assets: definition.assets
    };
  }
}

interface BlockDefinition {
  type: BlockType;
  name: string;
  category: BlockCategory;
  icon: string;
  description: string;
  version: string;
  defaultDisplay: string;
  defaultDimensions: Dimensions;
  defaultAttributes?: Record<string, any>;
  canContainChildren?: boolean;
  settingsSchema: Record<string, SettingControl>;
  template?: string;
  styles?: string;
  scripts?: string;
  responsive: boolean;
  animations?: string[];
  interactions?: string[];
  assets?: {
    js?: string[];
    css?: string[];
    dependencies?: string[];
  };
  constraints?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    aspectRatio?: number;
  };
}

interface CustomBlockDefinition {
  type: string;
  name: string;
  description: string;
  icon?: string;
  version?: string;
  defaultDisplay?: string;
  defaultDimensions?: Dimensions;
  settingsSchema: Record<string, SettingControl>;
  template: string;
  styles?: string;
  scripts?: string;
  responsive?: boolean;
  animations?: string[];
  interactions?: string[];
  assets?: {
    js?: string[];
    css?: string[];
    dependencies?: string[];
  };
}

interface SettingControl {
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'color' | 'image' | 'url' | 'typography' | 'spacing' | 'background';
  label: string;
  default?: any;
  required?: boolean;
  options?: { value: any; label: string }[];
  min?: number;
  max?: number;
  unit?: string;
  controls?: string[];
}
```

### **3. 📱 Responsive Design Tools**

#### **Responsive Manager:**
```typescript
export class ResponsiveManager {
  private breakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  };

  async setResponsiveSettings(block: Block, device: 'desktop' | 'tablet' | 'mobile', settings: Partial<Block>): Promise<void> {
    if (!block.responsive) {
      block.responsive = {
        desktop: {},
        tablet: {},
        mobile: {},
        breakpoints: this.breakpoints
      };
    }

    // Store device-specific settings
    block.responsive[device] = {
      ...block.responsive[device],
      ...settings
    };

    // Update block metadata
    block.metadata.updatedAt = new Date();
  }

  generateResponsiveCSS(block: Block): string {
    if (!block.responsive) {
      return '';
    }

    let css = '';

    // Desktop styles (default)
    css += this.generateBlockCSS(block, 'desktop');

    // Tablet styles
    if (Object.keys(block.responsive.tablet).length > 0) {
      css += `\n@media (max-width: ${block.responsive.breakpoints.tablet}px) {\n`;
      css += this.generateBlockCSS({...block, ...block.responsive.tablet}, 'tablet');
      css += '\n}';
    }

    // Mobile styles
    if (Object.keys(block.responsive.mobile).length > 0) {
      css += `\n@media (max-width: ${block.responsive.breakpoints.mobile}px) {\n`;
      css += this.generateBlockCSS({...block, ...block.responsive.mobile}, 'mobile');
      css += '\n}';
    }

    return css;
  }

  private generateBlockCSS(block: Block, device: string): string {
    const selector = `#block-${block.id}`;
    let css = `${selector} {\n`;

    // Layout styles
    if (block.styles.layout) {
      Object.entries(block.styles.layout).forEach(([prop, value]) => {
        if (value !== undefined) {
          css += `  ${this.camelToKebab(prop)}: ${value};\n`;
        }
      });
    }

    // Spacing styles
    if (block.styles.spacing) {
      const { margin, padding } = block.styles.spacing;
      
      if (margin) {
        css += `  margin: ${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px;\n`;
      }
      
      if (padding) {
        css += `  padding: ${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px;\n`;
      }
    }

    // Typography styles
    if (block.styles.typography) {
      Object.entries(block.styles.typography).forEach(([prop, value]) => {
        if (value !== undefined) {
          css += `  ${this.camelToKebab(prop)}: ${value};\n`;
        }
      });
    }

    // Background styles
    if (block.styles.background) {
      Object.entries(block.styles.background).forEach(([prop, value]) => {
        if (value !== undefined) {
          const cssProp = prop === 'image' ? 'background-image' : 
                         prop === 'size' ? 'background-size' :
                         prop === 'position' ? 'background-position' :
                         prop === 'repeat' ? 'background-repeat' :
                         `background-${prop}`;
          
          const cssValue = prop === 'image' ? `url(${value})` : value;
          css += `  ${cssProp}: ${cssValue};\n`;
        }
      });
    }

    // Border styles
    if (block.styles.border) {
      Object.entries(block.styles.border).forEach(([prop, value]) => {
        if (value !== undefined) {
          const cssProp = prop === 'radius' ? 'border-radius' : `border-${prop}`;
          css += `  ${cssProp}: ${value};\n`;
        }
      });
    }

    // Effect styles
    if (block.styles.effects) {
      Object.entries(block.styles.effects).forEach(([prop, value]) => {
        if (value !== undefined) {
          const cssProp = prop === 'shadow' ? 'box-shadow' : prop;
          css += `  ${cssProp}: ${value};\n`;
        }
      });
    }

    // Position and dimensions
    css += `  position: ${block.styles.layout?.position || 'absolute'};\n`;
    css += `  left: ${block.position.x}px;\n`;
    css += `  top: ${block.position.y}px;\n`;
    css += `  z-index: ${block.position.z};\n`;
    
    if (block.dimensions.width) {
      css += `  width: ${typeof block.dimensions.width === 'number' ? block.dimensions.width + 'px' : block.dimensions.width};\n`;
    }
    
    if (block.dimensions.height) {
      css += `  height: ${typeof block.dimensions.height === 'number' ? block.dimensions.height + 'px' : block.dimensions.height};\n`;
    }

    css += '}\n';

    return css;
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  async previewDeviceMode(builderId: string, device: 'desktop' | 'tablet' | 'mobile'): Promise<DevicePreview> {
    const builder = await this.getBuilder(builderId);
    if (!builder) {
      throw new Error('Builder not found');
    }

    // Update canvas device mode
    builder.canvas.deviceMode = device;
    
    // Apply device-specific dimensions
    const deviceDimensions = this.getDeviceDimensions(device);
    builder.canvas.width = deviceDimensions.width;
    builder.canvas.height = deviceDimensions.height;

    // Generate device-specific HTML/CSS
    const html = await this.generateDeviceHTML(builder, device);
    const css = await this.generateDeviceCSS(builder, device);

    return {
      device,
      dimensions: deviceDimensions,
      html,
      css,
      previewUrl: await this.generatePreviewUrl(builderId, device)
    };
  }

  private getDeviceDimensions(device: string): { width: number; height: number } {
    switch (device) {
      case 'mobile':
        return { width: 375, height: 667 }; // iPhone SE
      case 'tablet':
        return { width: 768, height: 1024 }; // iPad
      case 'desktop':
      default:
        return { width: 1200, height: 800 };
    }
  }
}

interface DevicePreview {
  device: 'desktop' | 'tablet' | 'mobile';
  dimensions: { width: number; height: number };
  html: string;
  css: string;
  previewUrl: string;
}
```

---

## 🎨 **Visual Builder Interface**

### **Page Builder Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 🏗️ Visual Page Builder                 [Save] [Preview] [Publish] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Toolbar ──────────────────────────────────────────┐   │
│ │ [↶ Undo] [↷ Redo] | [💻 Desktop] [📱 Tablet] [📱 Mobile] │   │
│ │ | [⊞ Grid] [📏 Rulers] | [🎨 Theme] [⚙️ Settings]   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Block Library ─┐ ┌─ Canvas ──────────────────────┐    │
│ │ 📝 Basic         │ │ ┌─────────────────────────┐  │    │
│ │ • Text           │ │ │ 📝 Welcome to Our Site  │  │    │
│ │ • Image          │ │ │                         │  │    │
│ │ • Button         │ │ │ 🖼️ [Hero Image]         │  │    │
│ │ • Video          │ │ │                         │  │    │
│ │                  │ │ │ [Get Started] [Learn More] │    │
│ │ 🏗️ Layout        │ │ │                         │  │    │
│ │ • Container      │ │ │ ┌─────┐ ┌─────┐ ┌─────┐ │  │    │
│ │ • Row            │ │ │ │ 🎯  │ │ ⚡  │ │ 🔧  │ │  │    │
│ │ • Column         │ │ │ │Fast │ │Easy │ │Pro  │ │  │    │
│ │ • Spacer         │ │ │ └─────┘ └─────┘ └─────┘ │  │    │
│ │                  │ │ │                         │  │    │
│ │ 📱 Media         │ │ │ 📞 Contact Us           │  │    │
│ │ • Gallery        │ │ │ [Contact Form]          │  │    │
│ │ • Slider         │ │ └─────────────────────────┘  │    │
│ │ • Video          │ └─────────────────────────────────┘    │
│ │                  │                                       │
│ │ 📋 Forms         │                                       │
│ │ • Contact        │                                       │
│ │ • Newsletter     │                                       │
│ │ • Survey         │                                       │
│ └──────────────────┘                                       │
│                                                         │
│ ┌─ Properties Panel ─────────────────────────────────┐   │
│ │ Selected: Text Block                               │   │
│ │                                                   │   │
│ │ Content:                                           │   │
│ │ ┌─────────────────────────────────────────────────┐ │   │
│ │ │ Welcome to Our Site                             │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ │                                                   │   │
│ │ Typography:                                        │   │
│ │ Font: [Inter ▼] Size: [32px] Weight: [Bold ▼]     │   │
│ │ Color: [#333333] Align: [Center ▼]                │   │
│ │                                                   │   │
│ │ Spacing:                                           │   │
│ │ Margin: [20px] [20px] [20px] [20px]               │   │
│ │ Padding: [10px] [10px] [10px] [10px]              │   │
│ │                                                   │   │
│ │ Animation:                                         │   │
│ │ Effect: [Fade In ▼] Duration: [0.5s] Delay: [0s]  │   │
│ │                                                   │   │
│ │ Responsive:                                        │   │
│ │ 💻 Desktop | 📱 Tablet | 📱 Mobile                │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Template Library Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ 📚 Template Library                    [Upload] [Create New] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Categories ─────────┐ ┌─ Templates ────────────────┐  │
│ │ 🏢 Business (23)     │ │ ┌─────┐ ┌─────┐ ┌─────┐   │  │
│ │ 🛍️ E-commerce (18)   │ │ │ 📸  │ │ 📸  │ │ 📸  │   │  │
│ │ 📝 Blog (15)         │ │ │Corp │ │Shop │ │Port │   │  │
│ │ 🎨 Portfolio (12)    │ │ │Site │ │Home │ │folio│   │  │
│ │ 📧 Landing (34)      │ │ └─────┘ └─────┘ └─────┘   │  │
│ │ 🎓 Education (8)     │ │ Business Corporate Shop   │  │
│ │ 🏥 Healthcare (6)    │ │ ⭐4.8   ⭐4.9   ⭐4.7      │  │
│ │ 🍕 Restaurant (11)   │ │                           │  │
│ └──────────────────────┘ │ ┌─────┐ ┌─────┐ ┌─────┐   │  │
│                          │ │ 📸  │ │ 📸  │ │ 📸  │   │  │
│ ┌─ Filters ────────────┐ │ │Blog │ │Event│ │News │   │  │
│ │ Style:               │ │ │Home │ │Page │ │Site │   │  │
│ │ ☑ Modern             │ │ └─────┘ └─────┘ └─────┘   │  │
│ │ ☐ Classic            │ │ Blog Home Event Newsletter │  │
│ │ ☐ Minimal            │ │ ⭐4.6   ⭐4.8   ⭐4.5      │  │
│ │                      │ │                           │  │
│ │ Color:               │ │ ┌─────┐ ┌─────┐ ┌─────┐   │  │
│ │ ☑ Blue               │ │ │ 📸  │ │ 📸  │ │ 📸  │   │  │
│ │ ☐ Green              │ │ │Rest │ │Gym  │ │Tech │   │  │
│ │ ☐ Red                │ │ │aurant│ │Site │ │Blog │   │  │
│ │ ☐ Purple             │ │ └─────┘ └─────┘ └─────┘   │  │
│ │                      │ │ Restaurant Gym  Tech Blog │  │
│ │ Features:            │ │ ⭐4.9   ⭐4.7   ⭐4.8      │  │
│ │ ☑ Responsive         │ └───────────────────────────┘  │
│ │ ☑ SEO Optimized     │                               │
│ │ ☐ E-commerce Ready   │ ┌─ Template Preview ────────┐  │
│ │ ☐ Multi-language     │ │ 📸 [Template Screenshot]  │  │
│ └──────────────────────┘ │                           │  │
│                          │ Corporate Business Site   │  │
│ ┌─ Search ─────────────┐ │ ⭐⭐⭐⭐⭐ 4.8 (127 reviews)│  │
│ │ [Search templates__] │ │                           │  │
│ │ [🔍]                 │ │ Features:                 │  │
│ └──────────────────────┘ │ • Responsive design       │  │
│                          │ • Contact forms           │  │
│                          │ • Team sections           │  │
│                          │ • Service showcase        │  │
│                          │                           │  │
│                          │ [Preview] [Use Template]  │  │
│                          └───────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Builder management
POST   /api/builder/create               // Create new builder session
GET    /api/builder/{id}                 // Get builder state
PUT    /api/builder/{id}                 // Update builder state
DELETE /api/builder/{id}                 // Delete builder session

// Block operations
POST   /api/builder/{id}/blocks          // Add block
PUT    /api/builder/{id}/blocks/{blockId} // Update block
DELETE /api/builder/{id}/blocks/{blockId} // Delete block
POST   /api/builder/{id}/blocks/{blockId}/duplicate // Duplicate block

// Template operations
GET    /api/templates                    // List templates
GET    /api/templates/{id}               // Get template
POST   /api/templates                    // Create template
PUT    /api/templates/{id}               // Update template
DELETE /api/templates/{id}               // Delete template

// Generation & export
POST   /api/builder/{id}/generate        // Generate HTML/CSS/JS
POST   /api/builder/{id}/preview         // Generate preview
POST   /api/builder/{id}/export          // Export page
POST   /api/builder/{id}/save-template   // Save as template

// Collaboration
GET    /api/builder/{id}/collaborators   // Get collaborators
POST   /api/builder/{id}/invite          // Invite collaborator
DELETE /api/builder/{id}/collaborators/{userId} // Remove collaborator
```

### **Database Schema:**
```sql
-- Page builders
CREATE TABLE page_builders (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  canvas JSONB NOT NULL,
  settings JSONB NOT NULL,
  metadata JSONB NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Builder blocks
CREATE TABLE builder_blocks (
  id UUID PRIMARY KEY,
  builder_id UUID REFERENCES page_builders(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  content JSONB NOT NULL,
  styles JSONB NOT NULL,
  attributes JSONB,
  position JSONB NOT NULL,
  dimensions JSONB NOT NULL,
  responsive JSONB,
  animations JSONB,
  interactions JSONB,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Builder templates
CREATE TABLE builder_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  thumbnail VARCHAR(500),
  canvas JSONB NOT NULL,
  blocks JSONB NOT NULL,
  settings JSONB,
  metadata JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Builder history
CREATE TABLE builder_history (
  id UUID PRIMARY KEY,
  builder_id UUID REFERENCES page_builders(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Builder collaborators
CREATE TABLE builder_collaborators (
  id UUID PRIMARY KEY,
  builder_id UUID REFERENCES page_builders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'editor',
  permissions JSONB,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  invited_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(builder_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_page_builders_page ON page_builders(page_id);
CREATE INDEX idx_builder_blocks_builder ON builder_blocks(builder_id);
CREATE INDEX idx_builder_templates_category ON builder_templates(category);
CREATE INDEX idx_builder_templates_public ON builder_templates(is_public);
CREATE INDEX idx_builder_history_builder ON builder_history(builder_id);
CREATE INDEX idx_builder_collaborators_builder ON builder_collaborators(builder_id);
```

---

## 🔗 **Related Documentation**

- **[Theme Customizer](./customizer.md)** - Integration dengan live customizer
- **[Widget System](./widgets.md)** - Widget blocks dalam builder
- **[Theme Management](./management.md)** - Builder integration dalam themes
- **[Content Management](../02_content/)** - Content blocks dan page integration

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active

