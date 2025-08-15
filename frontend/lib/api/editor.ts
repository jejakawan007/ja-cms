import { apiClient } from './client'

export interface EditorContent {
  id: string
  title: string
  content: string
  excerpt?: string
  status: 'draft' | 'published' | 'archived'
  type: 'post' | 'page' | 'custom'
  authorId: string
  authorName: string
  tags: string[]
  categories: string[]
  featuredImage?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  publishedAt?: string
  createdAt: string
  updatedAt: string
  version: number
  isPublic: boolean
  allowComments: boolean
  readingTime?: number
  wordCount?: number
  viewCount: number
  likeCount: number
  commentCount: number
}

export interface EditorState {
  content: EditorContent
  isDirty: boolean
  isSaving: boolean
  lastSaved?: string
  autoSaveEnabled: boolean
  autoSaveInterval: number
  version: number
  collaborators: EditorCollaborator[]
  comments: EditorComment[]
  history: EditorHistory[]
}

export interface EditorCollaborator {
  id: string
  name: string
  email: string
  role: 'viewer' | 'editor' | 'admin'
  joinedAt: string
  lastActive: string
}

export interface EditorComment {
  id: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  createdAt: string
  updatedAt: string
  resolved: boolean
  replies: EditorComment[]
}

export interface EditorHistory {
  id: string
  version: number
  content: string
  authorId: string
  authorName: string
  createdAt: string
  message?: string
}

export interface EditorConfig {
  autoSave: boolean
  autoSaveInterval: number
  spellCheck: boolean
  grammarCheck: boolean
  wordCount: boolean
  readingTime: boolean
  seoAnalysis: boolean
  socialPreview: boolean
  versioning: boolean
  collaboration: boolean
  comments: boolean
  history: boolean
  exportFormats: string[]
  importFormats: string[]
  maxFileSize: number
  allowedFileTypes: string[]
}

export interface EditorSaveRequest {
  content: string
  title: string
  excerpt?: string
  status?: 'draft' | 'published' | 'archived'
  tags?: string[]
  categories?: string[]
  featuredImage?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  allowComments?: boolean
  isPublic?: boolean
}

export interface EditorSearchParams {
  query?: string
  status?: string
  type?: string
  authorId?: string
  tags?: string[]
  categories?: string[]
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export class EditorAPI {
  private client: typeof apiClient

  constructor(client: typeof apiClient = apiClient) {
    this.client = client
  }

  /**
   * Get editor configuration
   */
  async getConfig(): Promise<EditorConfig> {
    const response = await this.client.get<EditorConfig>('/editor/config')
    return response.data! as EditorConfig
  }

  /**
   * Create new content
   */
  async createContent(data: EditorSaveRequest): Promise<EditorContent> {
    const response = await this.client.post<EditorContent>('/editor/content', data)
    return response.data! as EditorContent
  }

  /**
   * Get content by ID
   */
  async getContent(id: string): Promise<EditorContent> {
    const response = await this.client.get<EditorContent>(`/editor/content/${id}`)
    return response.data! as EditorContent
  }

  /**
   * Update content
   */
  async updateContent(id: string, data: EditorSaveRequest): Promise<EditorContent> {
    const response = await this.client.put<EditorContent>(`/editor/content/${id}`, data)
    return response.data! as EditorContent
  }

  /**
   * Auto-save content (draft)
   */
  async autoSave(id: string, content: string): Promise<EditorContent> {
    const response = await this.client.post<EditorContent>(`/editor/content/${id}/autosave`, {
      content
    })
    return response.data! as EditorContent
  }

  /**
   * Publish content
   */
  async publishContent(id: string): Promise<EditorContent> {
    const response = await this.client.post<EditorContent>(`/editor/content/${id}/publish`)
    return response.data! as EditorContent
  }

  /**
   * Unpublish content
   */
  async unpublishContent(id: string): Promise<EditorContent> {
    const response = await this.client.post<EditorContent>(`/editor/content/${id}/unpublish`)
    return response.data! as EditorContent
  }

  /**
   * Delete content
   */
  async deleteContent(id: string): Promise<void> {
    await this.client.delete(`/editor/content/${id}`)
  }

  /**
   * Search content
   */
  async searchContent(params: Record<string, unknown>): Promise<{
    content: EditorContent[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const response = await this.client.get<{
      content: EditorContent[]
      total: number
      page: number
      limit: number
      totalPages: number
    }>('/editor/content/search', { params })
    return response.data!
  }

  /**
   * Get content history
   */
  async getContentHistory(id: string): Promise<EditorHistory[]> {
    const response = await this.client.get<EditorHistory[]>(`/editor/content/${id}/history`)
    return response.data!
  }

  /**
   * Restore content version
   */
  async restoreVersion(id: string, versionId: string): Promise<EditorContent> {
    const response = await this.client.post<EditorContent>(`/editor/content/${id}/restore/${versionId}`)
    return response.data!
  }

  /**
   * Get content collaborators
   */
  async getCollaborators(id: string): Promise<EditorCollaborator[]> {
    const response = await this.client.get<EditorCollaborator[]>(`/api/editor/content/${id}/collaborators`)
    return response.data!
  }

  /**
   * Add collaborator
   */
  async addCollaborator(id: string, email: string, role: string): Promise<EditorCollaborator> {
    const response = await this.client.post<EditorCollaborator>(`/api/editor/content/${id}/collaborators`, {
      email,
      role
    })
    return response.data!
  }

  /**
   * Remove collaborator
   */
  async removeCollaborator(id: string, collaboratorId: string): Promise<void> {
    await this.client.delete(`/api/editor/content/${id}/collaborators/${collaboratorId}`)
  }

  /**
   * Get content comments
   */
  async getComments(id: string): Promise<EditorComment[]> {
    const response = await this.client.get<EditorComment[]>(`/api/editor/content/${id}/comments`)
    return response.data!
  }

  /**
   * Add comment
   */
  async addComment(id: string, content: string): Promise<EditorComment> {
    const response = await this.client.post<EditorComment>(`/api/editor/content/${id}/comments`, {
      content
    })
    return response.data!
  }

  /**
   * Update comment
   */
  async updateComment(id: string, commentId: string, content: string): Promise<EditorComment> {
    const response = await this.client.put<EditorComment>(`/api/editor/content/${id}/comments/${commentId}`, {
      content
    })
    return response.data!
  }

  /**
   * Delete comment
   */
  async deleteComment(id: string, commentId: string): Promise<void> {
    await this.client.delete(`/api/editor/content/${id}/comments/${commentId}`)
  }

  /**
   * Resolve comment
   */
  async resolveComment(id: string, commentId: string): Promise<EditorComment> {
    const response = await this.client.post<EditorComment>(`/api/editor/content/${id}/comments/${commentId}/resolve`)
    return response.data!
  }

  /**
   * Export content
   */
  async exportContent(id: string, format: string): Promise<Blob> {
    const response = await this.client.get<Blob>(`/editor/content/${id}/export`, {
      params: { format },
      responseType: 'blob'
    })
    return response.data!
  }

  /**
   * Import content
   */
  async importContent(file: File, format: string): Promise<EditorContent> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('format', format)
    
    const response = await this.client.post<EditorContent>('/editor/content/import', formData)
    return response.data!
  }

  /**
   * Duplicate content
   */
  async duplicateContent(id: string): Promise<EditorContent> {
    const response = await this.client.post<EditorContent>(`/editor/content/${id}/duplicate`)
    return response.data!
  }

  /**
   * Get content analytics
   */
  async getContentAnalytics(id: string): Promise<{
    views: number
    likes: number
    comments: number
    shares: number
    readingTime: number
    bounceRate: number
    engagementRate: number
  }> {
    const response = await this.client.get<{
      views: number
      likes: number
      comments: number
      shares: number
      readingTime: number
      bounceRate: number
      engagementRate: number
    }>(`/editor/content/${id}/analytics`)
    return response.data!
  }

  /**
   * Get SEO suggestions
   */
  async getSEOSuggestions(id: string): Promise<{
    title: string
    description: string
    keywords: string[]
    score: number
    suggestions: string[]
  }> {
    const response = await this.client.get<{
      title: string
      description: string
      keywords: string[]
      score: number
      suggestions: string[]
    }>(`/editor/content/${id}/seo-suggestions`)
    return response.data!
  }

  /**
   * Get social preview
   */
  async getSocialPreview(id: string, platform: string): Promise<{
    title: string
    description: string
    image: string
    url: string
  }> {
    const response = await this.client.get<{
      title: string
      description: string
      image: string
      url: string
    }>(`/editor/content/${id}/social-preview`, {
      params: { platform }
    })
    return response.data!
  }
}

// Default editor API instance
export const editorAPI = new EditorAPI(apiClient)
