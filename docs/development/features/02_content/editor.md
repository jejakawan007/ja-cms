# ✏️ Content Editor System

> **Advanced Rich Text Editor JA-CMS**  
> Modern, extensible editor dengan AI assistance dan real-time collaboration

---

## 📋 **Deskripsi**

Content Editor System menyediakan experience editing yang modern dan powerful untuk content creation. Sistem ini dilengkapi dengan rich text editing, markdown support, AI assistance, real-time collaboration, dan extensible block system untuk berbagai jenis konten.

---

## ⭐ **Core Features**

### **1. 📝 Rich Text Editor**

#### **Editor Architecture:**
```typescript
interface EditorConfig {
  id: string;
  mode: 'wysiwyg' | 'markdown' | 'hybrid';
  theme: 'light' | 'dark' | 'auto';
  language: string;
  features: EditorFeature[];
  toolbar: ToolbarConfig;
  plugins: EditorPlugin[];
  shortcuts: KeyboardShortcut[];
  autoSave: {
    enabled: boolean;
    interval: number; // seconds
    strategy: 'local' | 'server' | 'both';
  };
  collaboration: {
    enabled: boolean;
    showCursors: boolean;
    showSelections: boolean;
    maxCollaborators: number;
  };
}

interface EditorState {
  content: EditorContent;
  selection: EditorSelection;
  history: EditorHistory;
  metadata: {
    wordCount: number;
    characterCount: number;
    readingTime: number;
    lastSaved: Date;
    version: number;
  };
  collaborators: ActiveCollaborator[];
  status: 'idle' | 'typing' | 'saving' | 'saved' | 'error';
}

interface EditorContent {
  type: 'doc';
  content: EditorNode[];
  version: number;
}

interface EditorNode {
  type: string;
  attrs?: Record<string, any>;
  content?: EditorNode[];
  text?: string;
  marks?: EditorMark[];
}

interface EditorMark {
  type: string;
  attrs?: Record<string, any>;
}

interface BlockComponent {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: 'text' | 'media' | 'embed' | 'layout' | 'interactive';
  schema: BlockSchema;
  component: React.ComponentType<BlockProps>;
  toolbar?: ToolbarItem[];
  settings?: SettingsPanel;
}
```

#### **Editor Service:**
```typescript
export class EditorService {
  private editor: Editor;
  private collaborationService: CollaborationService;
  private aiService: AIAssistantService;
  private autoSaveService: AutoSaveService;

  constructor(config: EditorConfig) {
    this.editor = new Editor({
      extensions: this.loadExtensions(config),
      content: config.initialContent,
      onUpdate: this.handleContentUpdate.bind(this),
      onSelectionUpdate: this.handleSelectionUpdate.bind(this),
      onFocus: this.handleEditorFocus.bind(this),
      onBlur: this.handleEditorBlur.bind(this)
    });

    this.setupCollaboration(config.collaboration);
    this.setupAutoSave(config.autoSave);
    this.setupAIAssistant();
  }

  async insertBlock(blockType: string, position?: number): Promise<void> {
    const blockComponent = this.getBlockComponent(blockType);
    if (!blockComponent) {
      throw new Error(`Block type "${blockType}" not found`);
    }

    // Create block node
    const blockNode = this.createBlockNode(blockComponent);
    
    // Insert at position or current cursor
    const insertPosition = position ?? this.editor.state.selection.head;
    
    this.editor.chain()
      .focus()
      .insertContentAt(insertPosition, blockNode)
      .run();

    // Track block usage
    await this.trackBlockUsage(blockType);
  }

  async transformContent(transformation: ContentTransformation): Promise<void> {
    switch (transformation.type) {
      case 'format':
        await this.applyFormatting(transformation.options);
        break;
      
      case 'structure':
        await this.restructureContent(transformation.options);
        break;
      
      case 'ai_enhance':
        await this.enhanceWithAI(transformation.options);
        break;
      
      case 'cleanup':
        await this.cleanupContent(transformation.options);
        break;
    }
  }

  async getContentAnalysis(): Promise<ContentAnalysis> {
    const content = this.editor.getHTML();
    const text = this.editor.getText();

    return {
      structure: await this.analyzeContentStructure(content),
      readability: await this.analyzeReadability(text),
      seo: await this.analyzeSEO(content, text),
      accessibility: await this.analyzeAccessibility(content),
      performance: await this.analyzePerformance(content),
      suggestions: await this.generateContentSuggestions(content, text)
    };
  }

  async enableAIAssistant(): Promise<void> {
    this.aiService.initialize({
      onSuggestion: this.handleAISuggestion.bind(this),
      onCompletion: this.handleAICompletion.bind(this),
      onError: this.handleAIError.bind(this)
    });

    // Add AI toolbar
    this.addAIToolbar();
  }

  private async handleContentUpdate({ editor, transaction }): Promise<void> {
    // Update metadata
    this.updateContentMetadata();

    // Trigger auto-save
    if (this.autoSaveService.isEnabled()) {
      this.autoSaveService.scheduleAutoSave();
    }

    // Broadcast changes to collaborators
    if (this.collaborationService.isActive()) {
      await this.collaborationService.broadcastChanges(transaction);
    }

    // Trigger AI analysis if enabled
    if (this.aiService.isActive()) {
      this.aiService.analyzeContent(editor.getHTML());
    }
  }

  private loadExtensions(config: EditorConfig): Extension[] {
    const extensions: Extension[] = [
      // Core extensions
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      Strike,
      Code,
      Link,
      Image,
      
      // List extensions
      BulletList,
      OrderedList,
      ListItem,
      
      // Structure extensions
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      Blockquote,
      CodeBlock,
      HorizontalRule,
      
      // Table extension
      Table.configure({
        resizable: true,
        handleWidth: 5,
        cellMinWidth: 100
      }),
      
      // Collaboration extension
      ...(config.collaboration.enabled ? [
        Collaboration.configure({
          document: this.collaborationService.getDocument()
        }),
        CollaborationCursor.configure({
          provider: this.collaborationService.getProvider(),
          user: this.collaborationService.getCurrentUser()
        })
      ] : []),
      
      // History extension
      History.configure({
        depth: 100,
        newGroupDelay: 1000
      }),
      
      // Placeholder extension
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return `Heading ${node.attrs.level}`;
          }
          return 'Start writing...';
        }
      }),
      
      // Custom extensions
      ...this.loadCustomExtensions(config)
    ];

    return extensions;
  }

  private loadCustomExtensions(config: EditorConfig): Extension[] {
    const customExtensions: Extension[] = [];

    // Block system extension
    customExtensions.push(
      BlockSystem.configure({
        blocks: this.getAvailableBlocks(),
        allowedBlocks: config.features.includes('blocks') ? undefined : []
      })
    );

    // AI Assistant extension
    if (config.features.includes('ai_assistant')) {
      customExtensions.push(
        AIAssistant.configure({
          apiKey: process.env.AI_API_KEY,
          model: 'gpt-4',
          features: ['completion', 'suggestion', 'grammar', 'tone']
        })
      );
    }

    // Markdown extension
    if (config.mode === 'markdown' || config.mode === 'hybrid') {
      customExtensions.push(
        Markdown.configure({
          html: true,
          linkify: true,
          typographer: true
        })
      );
    }

    // Emoji extension
    if (config.features.includes('emoji')) {
      customExtensions.push(
        Emoji.configure({
          emojis: this.getEmojiSet(),
          enableEmoticons: true
        })
      );
    }

    return customExtensions;
  }
}

interface ContentTransformation {
  type: 'format' | 'structure' | 'ai_enhance' | 'cleanup';
  options: Record<string, any>;
}

interface ContentAnalysis {
  structure: {
    headings: HeadingAnalysis[];
    paragraphs: number;
    lists: number;
    images: number;
    links: number;
  };
  readability: {
    score: number;
    grade: string;
    suggestions: string[];
  };
  seo: {
    score: number;
    issues: SEOIssue[];
    recommendations: string[];
  };
  accessibility: {
    score: number;
    violations: A11yViolation[];
    improvements: string[];
  };
  performance: {
    score: number;
    metrics: PerformanceMetric[];
    optimizations: string[];
  };
  suggestions: ContentSuggestion[];
}
```

### **2. 🧱 Block System**

#### **Extensible Block Architecture:**
```typescript
export class BlockSystemService {
  private blocks: Map<string, BlockComponent> = new Map();
  private blockCategories: BlockCategory[] = [];

  registerBlock(block: BlockComponent): void {
    this.blocks.set(block.type, block);
    this.updateBlockCategories(block);
  }

  getAvailableBlocks(category?: string): BlockComponent[] {
    const blocks = Array.from(this.blocks.values());
    
    if (category) {
      return blocks.filter(block => block.category === category);
    }
    
    return blocks;
  }

  createBlockNode(blockType: string, attrs: Record<string, any> = {}): EditorNode {
    const block = this.blocks.get(blockType);
    if (!block) {
      throw new Error(`Block type "${blockType}" not found`);
    }

    return {
      type: blockType,
      attrs: {
        ...block.schema.defaultAttrs,
        ...attrs
      },
      content: block.schema.content ? [] : undefined
    };
  }

  validateBlockContent(blockType: string, content: any): ValidationResult {
    const block = this.blocks.get(blockType);
    if (!block) {
      return { valid: false, errors: ['Block type not found'] };
    }

    return this.validateAgainstSchema(content, block.schema);
  }

  private initializeDefaultBlocks(): void {
    // Text blocks
    this.registerBlock({
      type: 'paragraph',
      name: 'Paragraph',
      description: 'Basic text paragraph',
      icon: 'type',
      category: 'text',
      schema: {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM: () => ['p', 0]
      },
      component: ParagraphBlock,
      toolbar: [
        { type: 'bold', icon: 'bold' },
        { type: 'italic', icon: 'italic' },
        { type: 'link', icon: 'link' }
      ]
    });

    this.registerBlock({
      type: 'heading',
      name: 'Heading',
      description: 'Section heading',
      icon: 'heading',
      category: 'text',
      schema: {
        attrs: { level: { default: 1 } },
        content: 'inline*',
        group: 'block',
        defining: true,
        parseDOM: [
          { tag: 'h1', attrs: { level: 1 } },
          { tag: 'h2', attrs: { level: 2 } },
          { tag: 'h3', attrs: { level: 3 } },
          { tag: 'h4', attrs: { level: 4 } },
          { tag: 'h5', attrs: { level: 5 } },
          { tag: 'h6', attrs: { level: 6 } }
        ],
        toDOM: (node) => [`h${node.attrs.level}`, 0]
      },
      component: HeadingBlock,
      settings: {
        level: {
          type: 'select',
          label: 'Heading Level',
          options: [
            { value: 1, label: 'H1' },
            { value: 2, label: 'H2' },
            { value: 3, label: 'H3' },
            { value: 4, label: 'H4' },
            { value: 5, label: 'H5' },
            { value: 6, label: 'H6' }
          ]
        }
      }
    });

    // Media blocks
    this.registerBlock({
      type: 'image',
      name: 'Image',
      description: 'Insert image with caption',
      icon: 'image',
      category: 'media',
      schema: {
        attrs: {
          src: {},
          alt: { default: null },
          title: { default: null },
          width: { default: null },
          height: { default: null },
          caption: { default: null },
          alignment: { default: 'center' }
        },
        group: 'block',
        draggable: true,
        parseDOM: [{
          tag: 'img[src]',
          getAttrs: (dom) => ({
            src: dom.getAttribute('src'),
            alt: dom.getAttribute('alt'),
            title: dom.getAttribute('title'),
            width: dom.getAttribute('width'),
            height: dom.getAttribute('height')
          })
        }],
        toDOM: (node) => ['img', node.attrs]
      },
      component: ImageBlock,
      toolbar: [
        { type: 'alignment', icon: 'align-center' },
        { type: 'resize', icon: 'maximize' },
        { type: 'caption', icon: 'message-circle' }
      ],
      settings: {
        alignment: {
          type: 'radio',
          label: 'Alignment',
          options: [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' }
          ]
        },
        width: {
          type: 'range',
          label: 'Width',
          min: 100,
          max: 1200,
          step: 50
        }
      }
    });

    this.registerBlock({
      type: 'video',
      name: 'Video',
      description: 'Embed video content',
      icon: 'video',
      category: 'media',
      schema: {
        attrs: {
          src: {},
          poster: { default: null },
          width: { default: null },
          height: { default: null },
          controls: { default: true },
          autoplay: { default: false },
          muted: { default: false },
          loop: { default: false }
        },
        group: 'block',
        draggable: true,
        parseDOM: [{
          tag: 'video',
          getAttrs: (dom) => ({
            src: dom.getAttribute('src'),
            poster: dom.getAttribute('poster'),
            width: dom.getAttribute('width'),
            height: dom.getAttribute('height'),
            controls: dom.hasAttribute('controls'),
            autoplay: dom.hasAttribute('autoplay'),
            muted: dom.hasAttribute('muted'),
            loop: dom.hasAttribute('loop')
          })
        }],
        toDOM: (node) => ['video', node.attrs]
      },
      component: VideoBlock
    });

    // Layout blocks
    this.registerBlock({
      type: 'columns',
      name: 'Columns',
      description: 'Multi-column layout',
      icon: 'columns',
      category: 'layout',
      schema: {
        attrs: {
          columns: { default: 2 },
          gap: { default: 'medium' }
        },
        content: 'column+',
        group: 'block',
        defining: true,
        parseDOM: [{ tag: 'div[data-type="columns"]' }],
        toDOM: () => ['div', { 'data-type': 'columns' }, 0]
      },
      component: ColumnsBlock,
      settings: {
        columns: {
          type: 'range',
          label: 'Number of Columns',
          min: 2,
          max: 6,
          step: 1
        },
        gap: {
          type: 'select',
          label: 'Column Gap',
          options: [
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' }
          ]
        }
      }
    });

    // Interactive blocks
    this.registerBlock({
      type: 'codeblock',
      name: 'Code Block',
      description: 'Syntax highlighted code',
      icon: 'code',
      category: 'interactive',
      schema: {
        attrs: {
          language: { default: 'javascript' },
          filename: { default: null },
          showLineNumbers: { default: true },
          highlightLines: { default: null }
        },
        content: 'text*',
        marks: '',
        group: 'block',
        code: true,
        defining: true,
        parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
        toDOM: () => ['pre', ['code', 0]]
      },
      component: CodeBlock,
      settings: {
        language: {
          type: 'select',
          label: 'Language',
          options: [
            { value: 'javascript', label: 'JavaScript' },
            { value: 'typescript', label: 'TypeScript' },
            { value: 'python', label: 'Python' },
            { value: 'css', label: 'CSS' },
            { value: 'html', label: 'HTML' },
            { value: 'json', label: 'JSON' }
          ]
        },
        showLineNumbers: {
          type: 'checkbox',
          label: 'Show Line Numbers'
        }
      }
    });

    this.registerBlock({
      type: 'callout',
      name: 'Callout',
      description: 'Highlighted information box',
      icon: 'alert-circle',
      category: 'interactive',
      schema: {
        attrs: {
          type: { default: 'info' },
          title: { default: null },
          icon: { default: null }
        },
        content: 'block+',
        group: 'block',
        defining: true,
        parseDOM: [{ tag: 'div[data-type="callout"]' }],
        toDOM: (node) => ['div', { 
          'data-type': 'callout', 
          'data-callout-type': node.attrs.type 
        }, 0]
      },
      component: CalloutBlock,
      settings: {
        type: {
          type: 'select',
          label: 'Callout Type',
          options: [
            { value: 'info', label: 'Info' },
            { value: 'warning', label: 'Warning' },
            { value: 'error', label: 'Error' },
            { value: 'success', label: 'Success' },
            { value: 'tip', label: 'Tip' }
          ]
        },
        title: {
          type: 'text',
          label: 'Title'
        }
      }
    });
  }
}

interface BlockSchema {
  content?: string;
  marks?: string;
  group?: string;
  attrs?: Record<string, AttributeSpec>;
  parseDOM?: ParseRule[];
  toDOM?: (node: EditorNode) => DOMOutputSpec;
  defaultAttrs?: Record<string, any>;
}

interface AttributeSpec {
  default?: any;
  validate?: (value: any) => boolean;
  serialize?: (value: any) => string;
  parse?: (value: string) => any;
}

interface BlockProps {
  node: EditorNode;
  view: EditorView;
  getPos: () => number;
  decorations: Decoration[];
  selected: boolean;
  extension: Extension;
  updateAttributes: (attrs: Record<string, any>) => void;
  deleteNode: () => void;
}
```

### **3. 🤖 AI Assistant Integration**

#### **Smart Content Assistance:**
```typescript
export class AIAssistantService {
  private aiClient: AIClient;
  private contextAnalyzer: ContextAnalyzer;
  private suggestionEngine: SuggestionEngine;

  async initializeAI(config: AIConfig): Promise<void> {
    this.aiClient = new AIClient({
      apiKey: config.apiKey,
      model: config.model || 'gpt-4',
      maxTokens: config.maxTokens || 2048,
      temperature: config.temperature || 0.7
    });

    this.contextAnalyzer = new ContextAnalyzer();
    this.suggestionEngine = new SuggestionEngine();
  }

  async getContentSuggestions(context: EditorContext): Promise<AISuggestion[]> {
    const analysis = await this.contextAnalyzer.analyze(context);
    const suggestions: AISuggestion[] = [];

    // Grammar and style suggestions
    const grammarSuggestions = await this.getGrammarSuggestions(context.text);
    suggestions.push(...grammarSuggestions);

    // Content completion suggestions
    const completionSuggestions = await this.getCompletionSuggestions(context);
    suggestions.push(...completionSuggestions);

    // Structure improvement suggestions
    const structureSuggestions = await this.getStructureSuggestions(context.html);
    suggestions.push(...structureSuggestions);

    // SEO optimization suggestions
    const seoSuggestions = await this.getSEOSuggestions(context);
    suggestions.push(...seoSuggestions);

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  async enhanceContent(content: string, enhancement: ContentEnhancement): Promise<string> {
    const prompt = this.buildEnhancementPrompt(content, enhancement);
    
    const response = await this.aiClient.complete({
      prompt,
      maxTokens: 1024,
      temperature: 0.5
    });

    return this.processEnhancementResponse(response, enhancement);
  }

  async generateOutline(topic: string, requirements: OutlineRequirements): Promise<ContentOutline> {
    const prompt = this.buildOutlinePrompt(topic, requirements);
    
    const response = await this.aiClient.complete({
      prompt,
      maxTokens: 800,
      temperature: 0.6
    });

    return this.parseOutlineResponse(response);
  }

  async improveReadability(content: string): Promise<ReadabilityImprovement> {
    // Analyze current readability
    const analysis = await this.analyzeReadability(content);
    
    if (analysis.score > 70) {
      return {
        originalScore: analysis.score,
        improvedContent: content,
        improvedScore: analysis.score,
        changes: [],
        suggestions: ['Content readability is already good']
      };
    }

    // Generate improvements
    const prompt = this.buildReadabilityPrompt(content, analysis);
    
    const response = await this.aiClient.complete({
      prompt,
      maxTokens: Math.min(content.length * 1.5, 2048),
      temperature: 0.4
    });

    const improvedContent = this.extractImprovedContent(response);
    const improvedAnalysis = await this.analyzeReadability(improvedContent);

    return {
      originalScore: analysis.score,
      improvedContent,
      improvedScore: improvedAnalysis.score,
      changes: this.identifyChanges(content, improvedContent),
      suggestions: this.generateReadabilitySuggestions(analysis, improvedAnalysis)
    };
  }

  async detectTone(content: string): Promise<ToneAnalysis> {
    const prompt = `Analyze the tone of the following content and provide a detailed assessment:

Content: "${content}"

Please analyze:
1. Overall tone (formal, casual, professional, friendly, etc.)
2. Emotional sentiment (positive, negative, neutral)
3. Target audience appropriateness
4. Consistency throughout the content
5. Suggestions for improvement

Provide your analysis in JSON format.`;

    const response = await this.aiClient.complete({
      prompt,
      maxTokens: 512,
      temperature: 0.3
    });

    return this.parseToneAnalysis(response);
  }

  private async getGrammarSuggestions(text: string): Promise<AISuggestion[]> {
    const prompt = `Please review the following text for grammar, spelling, and style issues. Provide specific suggestions for improvement:

"${text}"

Format your response as a JSON array of suggestions, each with:
- type: "grammar" | "spelling" | "style"
- position: { start: number, end: number }
- original: string
- suggestion: string
- reason: string
- confidence: number (0-1)`;

    const response = await this.aiClient.complete({
      prompt,
      maxTokens: 1024,
      temperature: 0.2
    });

    try {
      const suggestions = JSON.parse(response);
      return suggestions.map(s => ({
        ...s,
        id: this.generateSuggestionId(),
        category: 'grammar'
      }));
    } catch (error) {
      console.error('Failed to parse grammar suggestions:', error);
      return [];
    }
  }

  private async getCompletionSuggestions(context: EditorContext): Promise<AISuggestion[]> {
    if (context.text.length < 50) {
      return []; // Not enough context for completion
    }

    const prompt = `Based on the following content context, suggest 3 possible continuations:

Context: "${context.text.slice(-200)}" // Last 200 characters

Provide completions that:
1. Flow naturally from the existing content
2. Maintain the same tone and style
3. Add value to the discussion

Format as JSON array with: text, confidence, reasoning`;

    const response = await this.aiClient.complete({
      prompt,
      maxTokens: 512,
      temperature: 0.7
    });

    try {
      const completions = JSON.parse(response);
      return completions.map(c => ({
        id: this.generateSuggestionId(),
        type: 'completion',
        category: 'content',
        text: c.text,
        confidence: c.confidence,
        reasoning: c.reasoning,
        position: { start: context.text.length, end: context.text.length }
      }));
    } catch (error) {
      console.error('Failed to parse completion suggestions:', error);
      return [];
    }
  }

  private buildEnhancementPrompt(content: string, enhancement: ContentEnhancement): string {
    const basePrompt = `Please enhance the following content according to these requirements:

Original Content:
"${content}"

Enhancement Type: ${enhancement.type}
`;

    switch (enhancement.type) {
      case 'expand':
        return basePrompt + `
Please expand this content by:
- Adding more detailed explanations
- Including relevant examples
- Providing additional context
- Maintaining the original tone and style

Target length: ${enhancement.targetLength || 'significantly longer'}`;

      case 'summarize':
        return basePrompt + `
Please create a concise summary that:
- Captures all key points
- Maintains essential information
- Uses clear, direct language
- Fits within ${enhancement.targetLength || '100'} words`;

      case 'improve_clarity':
        return basePrompt + `
Please improve the clarity by:
- Simplifying complex sentences
- Using more precise language
- Improving logical flow
- Removing unnecessary jargon`;

      case 'adjust_tone':
        return basePrompt + `
Please adjust the tone to be more ${enhancement.targetTone}:
- Modify word choices appropriately
- Adjust sentence structure
- Maintain factual accuracy
- Keep the core message intact`;

      default:
        return basePrompt + `Please improve the overall quality of this content.`;
    }
  }

  private async analyzeReadability(content: string): Promise<ReadabilityAnalysis> {
    // Implement readability analysis (Flesch-Kincaid, etc.)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);

    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Flesch Reading Ease Score
    const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);

    return {
      score: Math.max(0, Math.min(100, fleschScore)),
      grade: this.getReadingGrade(fleschScore),
      sentences: sentences.length,
      words: words.length,
      syllables,
      avgSentenceLength,
      avgSyllablesPerWord,
      issues: this.identifyReadabilityIssues(content, fleschScore)
    };
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }
}

interface AISuggestion {
  id: string;
  type: 'grammar' | 'completion' | 'structure' | 'seo' | 'style';
  category: 'grammar' | 'content' | 'optimization';
  position: { start: number; end: number };
  original?: string;
  suggestion: string;
  reasoning: string;
  confidence: number; // 0-1
  action?: 'replace' | 'insert' | 'delete' | 'restructure';
}

interface ContentEnhancement {
  type: 'expand' | 'summarize' | 'improve_clarity' | 'adjust_tone' | 'optimize_seo';
  targetLength?: number | string;
  targetTone?: 'formal' | 'casual' | 'professional' | 'friendly' | 'academic';
  targetAudience?: string;
  keywords?: string[];
}

interface ToneAnalysis {
  overallTone: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  formality: number; // 0-1, 0 = very casual, 1 = very formal
  emotionalIntensity: number; // 0-1
  consistency: number; // 0-1
  targetAudienceMatch: boolean;
  suggestions: string[];
}

interface ReadabilityImprovement {
  originalScore: number;
  improvedContent: string;
  improvedScore: number;
  changes: ContentChange[];
  suggestions: string[];
}
```

### **4. 🔄 Real-time Collaboration**

#### **Multi-user Editing System:**
```typescript
export class RealTimeCollaborationService {
  private yDoc: Y.Doc;
  private provider: WebsocketProvider;
  private awareness: Awareness;
  private editor: Editor;

  async initializeCollaboration(config: CollaborationConfig): Promise<void> {
    // Initialize Yjs document
    this.yDoc = new Y.Doc();
    
    // Setup WebSocket provider
    this.provider = new WebsocketProvider(
      config.websocketUrl,
      config.roomId,
      this.yDoc
    );

    // Initialize awareness for cursor tracking
    this.awareness = this.provider.awareness;
    
    // Setup user information
    this.awareness.setLocalStateField('user', {
      id: config.user.id,
      name: config.user.name,
      color: config.user.color || this.generateUserColor(config.user.id),
      avatar: config.user.avatar
    });

    // Listen for awareness changes
    this.awareness.on('change', this.handleAwarenessChange.bind(this));
    
    // Setup document sync
    this.setupDocumentSync();
  }

  async joinCollaborationSession(sessionId: string, user: CollaborationUser): Promise<void> {
    // Update user presence
    this.awareness.setLocalStateField('user', {
      ...user,
      lastSeen: Date.now(),
      status: 'active'
    });

    // Broadcast join event
    this.broadcastEvent('user_joined', { user, timestamp: Date.now() });
  }

  async leaveCollaborationSession(): Promise<void> {
    const user = this.awareness.getLocalState()?.user;
    
    if (user) {
      // Update user status
      this.awareness.setLocalStateField('user', {
        ...user,
        status: 'offline',
        lastSeen: Date.now()
      });

      // Broadcast leave event
      this.broadcastEvent('user_left', { user, timestamp: Date.now() });
    }

    // Cleanup
    this.provider.disconnect();
    this.yDoc.destroy();
  }

  getActiveCollaborators(): ActiveCollaborator[] {
    const collaborators: ActiveCollaborator[] = [];
    
    this.awareness.getStates().forEach((state, clientId) => {
      if (state.user && state.user.status === 'active' && clientId !== this.awareness.clientID) {
        collaborators.push({
          id: state.user.id,
          name: state.user.name,
          color: state.user.color,
          avatar: state.user.avatar,
          cursor: state.cursor,
          selection: state.selection,
          lastSeen: state.user.lastSeen
        });
      }
    });

    return collaborators;
  }

  async handleSelectionChange(selection: EditorSelection): Promise<void> {
    // Update local awareness state
    this.awareness.setLocalStateField('selection', {
      from: selection.from,
      to: selection.to,
      timestamp: Date.now()
    });

    // Update cursor position
    this.awareness.setLocalStateField('cursor', {
      position: selection.head,
      timestamp: Date.now()
    });
  }

  async broadcastComment(comment: CollaborationComment): Promise<void> {
    // Add comment to shared data
    const commentsArray = this.yDoc.getArray('comments');
    commentsArray.push([{
      id: comment.id,
      author: comment.author,
      content: comment.content,
      position: comment.position,
      timestamp: comment.timestamp,
      resolved: false
    }]);

    // Broadcast comment event
    this.broadcastEvent('comment_added', comment);
  }

  async resolveComment(commentId: string): Promise<void> {
    const commentsArray = this.yDoc.getArray('comments');
    const comments = commentsArray.toArray();
    
    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex !== -1) {
      const comment = comments[commentIndex];
      comment.resolved = true;
      comment.resolvedAt = Date.now();
      
      // Update in shared document
      commentsArray.delete(commentIndex, 1);
      commentsArray.insert(commentIndex, [comment]);

      // Broadcast resolution event
      this.broadcastEvent('comment_resolved', { commentId, timestamp: Date.now() });
    }
  }

  private setupDocumentSync(): void {
    // Get shared type for editor content
    const yXmlFragment = this.yDoc.getXmlFragment('prosemirror');

    // Setup ProseMirror collaboration
    const ydoc = this.yDoc;
    const type = yXmlFragment;

    // Create collaboration extension
    const collaborationExtension = Collaboration.configure({
      document: ydoc,
      field: 'prosemirror'
    });

    // Create cursor extension
    const cursorExtension = CollaborationCursor.configure({
      provider: this.provider,
      user: this.awareness.getLocalState()?.user || {}
    });

    // Add extensions to editor
    this.editor.extensionManager.addExtension(collaborationExtension);
    this.editor.extensionManager.addExtension(cursorExtension);
  }

  private handleAwarenessChange(changes: AwarenessChangeEvent): void {
    const { added, updated, removed } = changes;

    // Handle new collaborators
    added.forEach(clientId => {
      const state = this.awareness.getStates().get(clientId);
      if (state?.user) {
        this.onCollaboratorJoined(state.user);
      }
    });

    // Handle collaborator updates
    updated.forEach(clientId => {
      const state = this.awareness.getStates().get(clientId);
      if (state?.user) {
        this.onCollaboratorUpdated(state.user, state);
      }
    });

    // Handle collaborators leaving
    removed.forEach(clientId => {
      this.onCollaboratorLeft(clientId);
    });
  }

  private onCollaboratorJoined(user: CollaborationUser): void {
    // Show notification
    this.showNotification(`${user.name} joined the session`, 'info');
    
    // Update UI
    this.updateCollaboratorsList();
  }

  private onCollaboratorUpdated(user: CollaborationUser, state: any): void {
    // Update cursor position
    if (state.cursor) {
      this.updateCollaboratorCursor(user.id, state.cursor);
    }

    // Update selection
    if (state.selection) {
      this.updateCollaboratorSelection(user.id, state.selection);
    }
  }

  private onCollaboratorLeft(clientId: number): void {
    // Remove cursor and selection
    this.removeCollaboratorCursor(clientId);
    
    // Update UI
    this.updateCollaboratorsList();
  }

  private broadcastEvent(event: string, data: any): void {
    const eventData = {
      type: event,
      data,
      timestamp: Date.now(),
      user: this.awareness.getLocalState()?.user
    };

    // Use awareness to broadcast custom events
    this.awareness.setLocalStateField('lastEvent', eventData);
  }

  private generateUserColor(userId: string): string {
    // Generate consistent color based on user ID
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  }
}

interface CollaborationConfig {
  websocketUrl: string;
  roomId: string;
  user: CollaborationUser;
  maxCollaborators?: number;
  features?: CollaborationFeature[];
}

interface CollaborationUser {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
  role?: 'owner' | 'editor' | 'viewer';
}

interface ActiveCollaborator extends CollaborationUser {
  cursor?: { position: number; timestamp: number };
  selection?: { from: number; to: number; timestamp: number };
  lastSeen: number;
}

interface CollaborationComment {
  id: string;
  author: CollaborationUser;
  content: string;
  position: number;
  timestamp: number;
  resolved?: boolean;
  resolvedAt?: number;
}

type CollaborationFeature = 'cursors' | 'selections' | 'comments' | 'suggestions' | 'chat';
```

---

## 🎨 **Editor Interface**

### **Rich Text Editor:**
```
┌─────────────────────────────────────────────────────────┐
│ ✏️ Content Editor                      [Save] [Preview] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Toolbar ──────────────────────────────────────────┐   │
│ │ [B] [I] [U] [Link] [Image] │ [H1▼] [•] [1.] [{}]   │   │
│ │ [AI✨] [Blocks+] [Collab👥] │ [📊] [🔍] [⚙️]      │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Editor Content ───────────────────────────────────┐   │
│ │ # Getting Started with React Hooks                 │   │
│ │                                                   │   │
│ │ React Hooks revolutionized how we write React     │   │
│ │ components by allowing us to use state and other   │   │
│ │ React features in functional components.           │   │
│ │                                                   │   │
│ │ ## useState Hook                                   │   │
│ │                                                   │   │
│ │ The useState hook is the most basic hook...        │   │
│ │                                                   │   │
│ │ ```javascript                                      │   │
│ │ const [count, setCount] = useState(0);            │   │
│ │ ```                                               │   │
│ │                                                   │   │
│ │ 💡 This is a callout box with important info      │   │
│ │                                                   │   │
│ │ [Insert Block ▼]                                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Sidebar ──────────────────────────────────────────┐   │
│ │ 🤖 AI Assistant                                    │   │
│ │ • Grammar check: 2 suggestions                     │   │
│ │ • SEO optimization: Add meta description           │   │
│ │ • Readability: Score 78/100 (Good)                │   │
│ │                                                   │   │
│ │ 👥 Collaborators (2 active)                       │   │
│ │ • Sarah Wilson (editing)                           │   │
│ │ • Mike Johnson (viewing)                           │   │
│ │                                                   │   │
│ │ 📊 Content Stats                                   │   │
│ │ • Words: 1,247                                     │   │
│ │ • Characters: 6,891                                │   │
│ │ • Reading time: 5 min                              │   │
│ │ • Last saved: 2 min ago                            │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Block Selector:**
```
┌─────────────────────────────────────────────────────────┐
│ 🧱 Insert Block                              [Search...] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Text Blocks ──────────────────────────────────────┐   │
│ │ 📝 Paragraph    📄 Heading      📋 List            │   │
│ │ 💬 Quote        📊 Table        ➖ Divider         │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Media Blocks ─────────────────────────────────────┐   │
│ │ 🖼️ Image        🎥 Video        🎵 Audio           │   │
│ │ 📁 File         🖼️ Gallery      📷 Slideshow       │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Layout Blocks ────────────────────────────────────┐   │
│ │ 📰 Columns      📦 Container    🔲 Spacer          │   │
│ │ 📋 Tabs         🪗 Accordion    📄 Page Break       │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Interactive Blocks ───────────────────────────────┐   │
│ │ 💻 Code Block   💡 Callout      🔗 Button          │   │
│ │ 📊 Chart        🗺️ Map          📝 Form            │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Embed Blocks ─────────────────────────────────────┐   │
│ │ 🐦 Twitter      📺 YouTube      📘 CodePen         │   │
│ │ 📸 Instagram    🎵 Spotify      📊 Figma           │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Editor management
POST   /api/editor/sessions                // Create editor session
GET    /api/editor/sessions/{id}           // Get editor session
PUT    /api/editor/sessions/{id}           // Update editor session
DELETE /api/editor/sessions/{id}           // Delete editor session

// Content operations
POST   /api/editor/autosave                // Auto-save content
POST   /api/editor/transform               // Transform content
GET    /api/editor/analysis                // Get content analysis
POST   /api/editor/validate                // Validate content

// AI assistance
POST   /api/editor/ai/suggestions          // Get AI suggestions
POST   /api/editor/ai/enhance              // Enhance content with AI
POST   /api/editor/ai/complete             // Auto-complete text
POST   /api/editor/ai/analyze              // Analyze content with AI

// Collaboration
POST   /api/editor/collaborate             // Start collaboration
GET    /api/editor/collaborators           // Get active collaborators
POST   /api/editor/comments                // Add comment
PUT    /api/editor/comments/{id}           // Update comment

// Block system
GET    /api/editor/blocks                  // List available blocks
POST   /api/editor/blocks/validate         // Validate block content
GET    /api/editor/templates               // Get content templates
```

### **Database Schema:**
```sql
-- Editor sessions
CREATE TABLE editor_sessions (
  id UUID PRIMARY KEY,
  content_id UUID NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_data JSONB,
  last_activity TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Auto-saved content
CREATE TABLE autosaved_content (
  id UUID PRIMARY KEY,
  content_id UUID NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_data JSONB NOT NULL,
  version_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_id, user_id)
);

-- Editor comments
CREATE TABLE editor_comments (
  id UUID PRIMARY KEY,
  content_id UUID NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  position_data JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Block usage analytics
CREATE TABLE block_usage_analytics (
  id UUID PRIMARY KEY,
  block_type VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES users(id),
  content_id UUID,
  usage_count INTEGER DEFAULT 1,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(block_type, user_id, date)
);

-- Content analysis cache
CREATE TABLE content_analysis_cache (
  id UUID PRIMARY KEY,
  content_hash VARCHAR(64) NOT NULL,
  analysis_type VARCHAR(50) NOT NULL,
  analysis_result JSONB NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_hash, analysis_type)
);

-- Indexes for performance
CREATE INDEX idx_editor_sessions_content ON editor_sessions(content_id);
CREATE INDEX idx_editor_sessions_user ON editor_sessions(user_id);
CREATE INDEX idx_editor_sessions_activity ON editor_sessions(last_activity);
CREATE INDEX idx_autosaved_content_content_user ON autosaved_content(content_id, user_id);
CREATE INDEX idx_editor_comments_content ON editor_comments(content_id);
CREATE INDEX idx_block_usage_date ON block_usage_analytics(date);
CREATE INDEX idx_content_analysis_hash ON content_analysis_cache(content_hash);
```

---

## 🔗 **Related Documentation**

- **[Content Posts](./posts.md)** - Editor integration with posts
- **[Content Pages](./pages.md)** - Editor integration with pages
- **[Media Library](../03_media/)** - Media integration in editor
- **[User Management](../05_users/)** - User permissions and collaboration

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
