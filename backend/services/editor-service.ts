import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';

export interface EditorContent {
  id: string;
  type: 'doc';
  content: EditorNode[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EditorNode {
  type: string;
  attrs?: Record<string, any>;
  content?: EditorNode[];
  text?: string;
  marks?: EditorMark[];
}

export interface EditorMark {
  type: string;
  attrs?: Record<string, any>;
}

export interface EditorState {
  content: EditorContent;
  selection: EditorSelection;
  history: EditorHistory;
  metadata: EditorMetadata;
  collaborators: ActiveCollaborator[];
  status: 'idle' | 'typing' | 'saving' | 'saved' | 'error';
}

export interface EditorSelection {
  from: number;
  to: number;
  anchor: number;
  head: number;
}

export interface EditorHistory {
  steps: EditorStep[];
  currentStep: number;
  maxSteps: number;
}

export interface EditorStep {
  id: string;
  type: 'insert' | 'delete' | 'format' | 'structure';
  timestamp: Date;
  description: string;
  data: any;
}

export interface EditorMetadata {
  wordCount: number;
  characterCount: number;
  readingTime: number;
  lastSaved: Date;
  version: number;
}

export interface ActiveCollaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  cursor: EditorSelection;
  selection?: EditorSelection;
  lastActive: Date;
}

export interface EditorConfig {
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

export type EditorFeature = 
  | 'basic_formatting'
  | 'advanced_formatting'
  | 'lists'
  | 'tables'
  | 'images'
  | 'links'
  | 'code'
  | 'quotes'
  | 'headings'
  | 'blocks'
  | 'ai_assistant'
  | 'collaboration'
  | 'history'
  | 'markdown'
  | 'emoji'
  | 'media'
  | 'embeds';

export interface ToolbarConfig {
  items: ToolbarItem[];
  position: 'top' | 'bottom' | 'floating';
  visible: boolean;
}

export interface ToolbarItem {
  type: string;
  icon: string;
  label: string;
  action: string;
  shortcut?: string;
  disabled?: boolean;
}

export interface EditorPlugin {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface KeyboardShortcut {
  key: string;
  action: string;
  description: string;
  category: string;
}

export interface EditorCollaborator {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userColor: string;
  permissions: EditorPermission[];
  joinedAt: Date;
  lastActive: Date;
}

export type EditorPermission = 
  | 'read'
  | 'write'
  | 'comment'
  | 'review'
  | 'publish'
  | 'admin';

export interface EditorComment {
  id: string;
  contentId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  selection?: EditorSelection;
  status: 'active' | 'resolved' | 'archived';
  replies: EditorCommentReply[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EditorCommentReply {
  id: string;
  commentId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: Date;
}

export interface EditorSaveRequest {
  contentId: string;
  content: EditorContent;
  metadata: EditorMetadata;
  autoSave: boolean;
  version: number;
}

export interface EditorSearchParams {
  query: string;
  filters: {
    type?: string;
    author?: string;
    dateRange?: {
      from: Date;
      to: Date;
    };
    tags?: string[];
    status?: string;
  };
  sort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    limit: number;
  };
}

export class EditorService extends EventEmitter {
  private prisma: PrismaClient;
  private cache: Map<string, EditorState> = new Map();
  // private _cacheTimeout = 5 * 60 * 1000; // 5 minutes - TODO: Implement cache timeout

  constructor(prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  /**
   * Get editor configuration
   */
  async getConfig(_userId: string): Promise<EditorConfig> {
    // TODO: Use user role for role-based editor configuration
    // const _user = await this.prisma.user.findUnique({
    //   where: { id: userId },
    //   select: { role: true }
    // });

    const defaultConfig: EditorConfig = {
      id: 'default',
      mode: 'wysiwyg',
      theme: 'light',
      language: 'en',
      features: [
        'basic_formatting',
        'advanced_formatting',
        'lists',
        'tables',
        'images',
        'links',
        'code',
        'quotes',
        'headings',
        'blocks',
        'ai_assistant',
        'collaboration',
        'history',
        'markdown',
        'emoji',
        'media',
        'embeds'
      ],
      toolbar: {
        items: [
          { type: 'bold', icon: 'bold', label: 'Bold', action: 'format.bold', shortcut: 'Ctrl+B' },
          { type: 'italic', icon: 'italic', label: 'Italic', action: 'format.italic', shortcut: 'Ctrl+I' },
          { type: 'underline', icon: 'underline', label: 'Underline', action: 'format.underline', shortcut: 'Ctrl+U' },
          { type: 'separator', icon: 'separator', label: 'Separator', action: 'separator' },
          { type: 'heading', icon: 'heading', label: 'Heading', action: 'format.heading' },
          { type: 'list', icon: 'list', label: 'List', action: 'format.list' },
          { type: 'quote', icon: 'quote', label: 'Quote', action: 'format.quote' },
          { type: 'code', icon: 'code', label: 'Code', action: 'format.code' },
          { type: 'separator', icon: 'separator', label: 'Separator', action: 'separator' },
          { type: 'link', icon: 'link', label: 'Link', action: 'insert.link' },
          { type: 'image', icon: 'image', label: 'Image', action: 'insert.image' },
          { type: 'table', icon: 'table', label: 'Table', action: 'insert.table' },
          { type: 'separator', icon: 'separator', label: 'Separator', action: 'separator' },
          { type: 'ai', icon: 'ai', label: 'AI Assistant', action: 'ai.assist' },
          { type: 'preview', icon: 'eye', label: 'Preview', action: 'view.preview' }
        ],
        position: 'top',
        visible: true
      },
      plugins: [
        {
          id: 'ai-assistant',
          name: 'AI Assistant',
          version: '1.0.0',
          enabled: true,
          config: {
            apiKey: process.env['AI_API_KEY'],
            model: 'gpt-4',
            features: ['completion', 'suggestion', 'grammar', 'tone']
          }
        },
        {
          id: 'collaboration',
          name: 'Real-time Collaboration',
          version: '1.0.0',
          enabled: true,
          config: {
            maxCollaborators: 10,
            showCursors: true,
            showSelections: true
          }
        }
      ],
      shortcuts: [
        { key: 'Ctrl+B', action: 'format.bold', description: 'Bold text', category: 'formatting' },
        { key: 'Ctrl+I', action: 'format.italic', description: 'Italic text', category: 'formatting' },
        { key: 'Ctrl+U', action: 'format.underline', description: 'Underline text', category: 'formatting' },
        { key: 'Ctrl+K', action: 'insert.link', description: 'Insert link', category: 'insert' },
        { key: 'Ctrl+S', action: 'save', description: 'Save content', category: 'file' },
        { key: 'Ctrl+Z', action: 'undo', description: 'Undo', category: 'edit' },
        { key: 'Ctrl+Y', action: 'redo', description: 'Redo', category: 'edit' }
      ],
      autoSave: {
        enabled: true,
        interval: 30, // 30 seconds
        strategy: 'server'
      },
      collaboration: {
        enabled: true,
        showCursors: true,
        showSelections: true,
        maxCollaborators: 10
      }
    };

    // Override with user preferences if available
    // TODO: Implement user preferences when User model is updated
    // if (user?.preferences?.editor) {
    //   return { ...defaultConfig, ...user.preferences.editor };
    // }

    return defaultConfig;
  }

  /**
   * Create new content
   */
  async createContent(userId: string, title: string, type: string = 'post'): Promise<EditorContent> {
    const defaultContent: EditorContent = {
      id: '',
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: title }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '' }]
        }
      ],
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const content = await this.prisma.content.create({
      data: {
        title,
        type,
        content: defaultContent as any,
        authorId: userId,
        status: 'draft',
        version: 1
      }
    });

    return {
      ...defaultContent,
      id: content.id
    };
  }

  /**
   * Get content by ID
   */
  async getContent(contentId: string, userId: string): Promise<EditorContent | null> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        }
      }
    });

    if (!content) {
      return null;
    }

    // Check permissions
    if (content.authorId !== userId && content.status === 'private') {
      return null;
    }

    return content.content as unknown as EditorContent;
  }

  /**
   * Update content
   */
  async updateContent(contentId: string, content: EditorContent, userId: string): Promise<EditorContent> {
    const existingContent = await this.prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!existingContent) {
      throw new Error('Content not found');
    }

    // Check permissions
    if (existingContent.authorId !== userId) {
      throw new Error('Permission denied');
    }

    const updatedContent = await this.prisma.content.update({
      where: { id: contentId },
      data: {
        content: content as any,
        version: { increment: 1 },
        updatedAt: new Date()
      }
    });

    // Clear cache
    this.cache.delete(contentId);

    // Emit update event
    this.emit('content:updated', {
      contentId,
      userId,
      version: updatedContent.version
    });

    return content;
  }

  /**
   * Auto-save content
   */
  async autoSave(contentId: string, content: EditorContent, userId: string): Promise<void> {
    try {
      await this.updateContent(contentId, content, userId);
      this.emit('content:autosaved', { contentId, userId });
    } catch (error) {
      this.emit('content:autosave_error', { contentId, userId, error });
    }
  }

  /**
   * Publish content
   */
  async publishContent(contentId: string, userId: string): Promise<void> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      throw new Error('Content not found');
    }

    if (content.authorId !== userId) {
      throw new Error('Permission denied');
    }

    await this.prisma.content.update({
      where: { id: contentId },
              data: {
          status: 'published',
          updatedAt: new Date()
        }
    });

    this.emit('content:published', { contentId, userId });
  }

  /**
   * Unpublish content
   */
  async unpublishContent(contentId: string, userId: string): Promise<void> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      throw new Error('Content not found');
    }

    if (content.authorId !== userId) {
      throw new Error('Permission denied');
    }

    await this.prisma.content.update({
      where: { id: contentId },
              data: {
          status: 'draft',
          updatedAt: new Date()
        }
    });

    this.emit('content:unpublished', { contentId, userId });
  }

  /**
   * Delete content
   */
  async deleteContent(contentId: string, userId: string): Promise<void> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      throw new Error('Content not found');
    }

    if (content.authorId !== userId) {
      throw new Error('Permission denied');
    }

    await this.prisma.content.delete({
      where: { id: contentId }
    });

    // Clear cache
    this.cache.delete(contentId);

    this.emit('content:deleted', { contentId, userId });
  }

  /**
   * Search content
   */
  async searchContent(params: EditorSearchParams, _userId: string): Promise<{
    results: EditorContent[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { query, filters, sort, pagination } = params;

    const where: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.author) {
      where.authorId = filters.author;
    }

    if (filters.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.from,
        lte: filters.dateRange.to
      };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const [results, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy: { [sort.field]: sort.direction },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, avatar: true }
          }
        }
      }),
      this.prisma.post.count({ where })
    ]);

    return {
      results: results.map(r => ({
        id: r.id,
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: r.content }] }],
        version: 1,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      })),
      total,
      page: pagination.page,
      limit: pagination.limit
    };
  }

  /**
   * Get content history
   */
  async getContentHistory(contentId: string, userId: string): Promise<EditorHistory> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      throw new Error('Content not found');
    }

    if (content.authorId !== userId) {
      throw new Error('Permission denied');
    }

    // For now, return mock history
    // In a real implementation, you'd store version history
    return {
      steps: [
        {
          id: '1',
          type: 'insert',
          timestamp: content.createdAt,
          description: 'Content created',
          data: { version: 1 }
        }
      ],
      currentStep: 0,
      maxSteps: 100
    };
  }

  /**
   * Restore content version
   */
  async restoreVersion(contentId: string, _version: number, userId: string): Promise<EditorContent> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      throw new Error('Content not found');
    }

    if (content.authorId !== userId) {
      throw new Error('Permission denied');
    }

    // For now, just return current content
    // In a real implementation, you'd restore from version history
    return content.content as unknown as EditorContent;
  }

  /**
   * Get collaborators for content
   */
  async getCollaborators(contentId: string): Promise<EditorCollaborator[]> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        }
      }
    });

    if (!content) {
      return [];
    }

    // For now, return just the author
    // In a real implementation, you'd have a collaborators table
    return [
      {
        id: content.author.id,
        userId: content.author.id,
        userName: `${content.author.firstName} ${content.author.lastName}`,
        userAvatar: content.author.avatar || '',
        userColor: '#3B82F6',
        permissions: ['read', 'write', 'admin'],
        joinedAt: content.createdAt,
        lastActive: content.updatedAt
      }
    ];
  }

  /**
   * Add collaborator to content
   */
  async addCollaborator(contentId: string, userId: string, permissions: EditorPermission[]): Promise<void> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      throw new Error('Content not found');
    }

    // In a real implementation, you'd add to collaborators table
    this.emit('collaborator:added', { contentId, userId, permissions });
  }

  /**
   * Remove collaborator from content
   */
  async removeCollaborator(contentId: string, userId: string): Promise<void> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      throw new Error('Content not found');
    }

    // In a real implementation, you'd remove from collaborators table
    this.emit('collaborator:removed', { contentId, userId });
  }

  /**
   * Get comments for content
   */
  async getComments(_contentId: string): Promise<EditorComment[]> {
    // In a real implementation, you'd query comments table
    return [];
  }

  /**
   * Add comment to content
   */
  async addComment(contentId: string, comment: Omit<EditorComment, 'id' | 'createdAt' | 'updatedAt'>): Promise<EditorComment> {
    // In a real implementation, you'd save to comments table
    const newComment: EditorComment = {
      ...comment,
      id: `comment_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.emit('comment:added', { contentId, comment: newComment });
    return newComment;
  }

  /**
   * Update comment
   */
  async updateComment(commentId: string, text: string, userId: string): Promise<EditorComment> {
    // In a real implementation, you'd update in comments table
    const comment: EditorComment = {
      id: commentId,
      contentId: '',
      authorId: userId,
      authorName: '',
      authorAvatar: '',
      text,
      status: 'active',
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.emit('comment:updated', { commentId, comment });
    return comment;
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId: string, userId: string): Promise<void> {
    // In a real implementation, you'd delete from comments table
    this.emit('comment:deleted', { commentId, userId });
  }

  /**
   * Resolve comment
   */
  async resolveComment(commentId: string, userId: string): Promise<void> {
    // In a real implementation, you'd update comment status
    this.emit('comment:resolved', { commentId, userId });
  }

  /**
   * Export content
   */
  async exportContent(contentId: string, format: 'html' | 'markdown' | 'pdf' | 'docx', userId: string): Promise<string> {
    const content = await this.getContent(contentId, userId);
    if (!content) {
      throw new Error('Content not found');
    }

    // In a real implementation, you'd convert content to requested format
    switch (format) {
      case 'html':
        return this.convertToHTML(content);
      case 'markdown':
        return this.convertToMarkdown(content);
      case 'pdf':
        return this.convertToPDF(content);
      case 'docx':
        return this.convertToDOCX(content);
      default:
        throw new Error('Unsupported format');
    }
  }

  /**
   * Import content
   */
  async importContent(content: string, _format: 'html' | 'markdown', _userId: string): Promise<EditorContent> {
    // In a real implementation, you'd parse content from format
    const parsedContent: EditorContent = {
      id: '',
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: content }]
        }
      ],
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return parsedContent;
  }

  /**
   * Duplicate content
   */
  async duplicateContent(contentId: string, userId: string): Promise<EditorContent> {
    const content = await this.getContent(contentId, userId);
    if (!content) {
      throw new Error('Content not found');
    }

    const originalContent = await this.prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!originalContent) {
      throw new Error('Content not found');
    }

    const duplicatedContent = await this.prisma.content.create({
      data: {
        title: `${originalContent.title} (Copy)`,
        type: originalContent.type,
        content: content as any,
        authorId: userId,
        status: 'draft',
        version: 1
      }
    });

    return {
      ...content,
      id: duplicatedContent.id
    };
  }

  /**
   * Get content analytics
   */
  async getContentAnalytics(contentId: string, userId: string): Promise<any> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      throw new Error('Content not found');
    }

    if (content.authorId !== userId) {
      throw new Error('Permission denied');
    }

    // In a real implementation, you'd calculate analytics
    return {
      wordCount: this.calculateWordCount(content.content as unknown as EditorContent),
      characterCount: this.calculateCharacterCount(content.content as unknown as EditorContent),
      readingTime: this.calculateReadingTime(content.content as unknown as EditorContent),
      lastModified: content.updatedAt,
      version: content.version
    };
  }

  /**
   * Get SEO suggestions
   */
  async getSEOSuggestions(contentId: string, userId: string): Promise<string[]> {
    const content = await this.getContent(contentId, userId);
    if (!content) {
      return [];
    }

    const suggestions: string[] = [];
    const text = this.extractText(content);

    if (text.length < 300) {
      suggestions.push('Content is too short. Aim for at least 300 words for better SEO.');
    }

    if (!this.hasHeadings(content)) {
      suggestions.push('Add headings to improve content structure and SEO.');
    }

    if (!this.hasImages(content)) {
      suggestions.push('Consider adding relevant images to improve engagement.');
    }

    return suggestions;
  }

  /**
   * Get social preview
   */
  async getSocialPreview(contentId: string, _userId: string): Promise<{
    title: string;
    description: string;
    image: string;
    url: string;
  }> {
    const content = await this.prisma.post.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      throw new Error('Content not found');
    }

    return {
      title: content.title,
      description: this.extractDescription({
        id: content.id,
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: content.content }] }],
        version: 1,
        createdAt: content.createdAt,
        updatedAt: content.updatedAt
      }),
      image: '', // In real implementation, extract from content or use default
      url: `${process.env['FRONTEND_URL']}/content/${contentId}`
    };
  }

  // Private helper methods

  private convertToHTML(_content: EditorContent): string {
    // In real implementation, convert EditorContent to HTML
    return '<div>Converted HTML content</div>';
  }

  private convertToMarkdown(_content: EditorContent): string {
    // In real implementation, convert EditorContent to Markdown
    return '# Converted Markdown content';
  }

  private convertToPDF(_content: EditorContent): string {
    // In real implementation, convert EditorContent to PDF
    return 'PDF content';
  }

  private convertToDOCX(_content: EditorContent): string {
    // In real implementation, convert EditorContent to DOCX
    return 'DOCX content';
  }

  private calculateWordCount(content: EditorContent): number {
    const text = this.extractText(content);
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private calculateCharacterCount(content: EditorContent): number {
    return this.extractText(content).length;
  }

  private calculateReadingTime(content: EditorContent): number {
    const wordCount = this.calculateWordCount(content);
    return Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute
  }

  private extractText(content: EditorContent): string {
    const extractNodeText = (node: EditorNode): string => {
      if (node.text) {
        return node.text;
      }
      if (node.content) {
        return node.content.map(extractNodeText).join(' ');
      }
      return '';
    };

    return content.content.map(extractNodeText).join(' ');
  }

  private hasHeadings(content: EditorContent): boolean {
    return content.content.some(node => node.type === 'heading');
  }

  private hasImages(content: EditorContent): boolean {
    return content.content.some(node => node.type === 'image');
  }

  private extractDescription(content: EditorContent): string {
    const text = this.extractText(content);
    return text.substring(0, 160) + (text.length > 160 ? '...' : '');
  }
}
