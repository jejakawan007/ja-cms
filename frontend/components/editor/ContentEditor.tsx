'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code, 
  Link, 
  Image, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Quote, 
  Table, 
  Plus, 
  Save, 
  Eye, 
  Settings, 
  Sparkles,
  Type,
  Video,
  FileText,
  Layout,
  Zap
} from 'lucide-react'
import { useEditor } from '@/hooks/useEditor'
import { cn } from '@/lib/cn'

interface EditorState {
  content: string
  wordCount: number
  characterCount: number
  readingTime: number
  lastSaved: Date | null
  status: 'idle' | 'typing' | 'saving' | 'saved' | 'error'
}

interface ContentEditorProps {
  contentId?: string
  initialContent?: string
  onSave?: (content: string) => Promise<void>
  onPreview?: (content: string) => void
  onPublish?: () => Promise<void>
  onUnpublish?: () => Promise<void>
  className?: string
}

export function ContentEditor({ 
  contentId,
  initialContent = '', 
  onSave, 
  onPreview, 
  className 
}: ContentEditorProps) {
  // Editor API integration
  const {
    content,
    updateContent,
    setContent,
    setDirty
  } = useEditor({ contentId, autoSave: true, autoSaveInterval: 30000 })

  const [editorState, setEditorState] = useState<EditorState>({
    content: content?.content || initialContent,
    wordCount: 0,
    characterCount: 0,
    readingTime: 0,
    lastSaved: null,
    status: 'idle'
  })
  
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const [isBlockPickerOpen, setIsBlockPickerOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'visual' | 'markdown'>('visual')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()

  // Calculate content statistics
  useEffect(() => {
    const text = editorState.content
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
    const characterCount = text.length
    const readingTime = Math.ceil(wordCount / 200) // Average reading speed

    setEditorState(prev => ({
      ...prev,
      wordCount,
      characterCount,
      readingTime
    }))
  }, [editorState.content])

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    if (editorState.content && editorState.content !== initialContent) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave()
      }, 30000) // Auto-save after 30 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [editorState.content, initialContent])

    const handleContentChange = (value: string) => {
    setEditorState(prev => ({ 
      ...prev, 
      content: value,
      status: 'typing'
    }))
    
    // Update API state
    if (content) {
      setContent({ content: value })
      setDirty(true)
    }
  }

  const handleAutoSave = async () => {
    if (!onSave) return

    setEditorState(prev => ({ ...prev, status: 'saving' }))

    try {
      await onSave(editorState.content)
      setEditorState(prev => ({
        ...prev,
        status: 'saved',
        lastSaved: new Date()
      }))
      
      setTimeout(() => {
        setEditorState(prev => ({ ...prev, status: 'idle' }))
      }, 2000)
    } catch (error) {
      setEditorState(prev => ({ ...prev, status: 'error' }))
      console.error('Auto-save failed:', error)
    }
  }

  const handleManualSave = async () => {
    setEditorState(prev => ({ ...prev, status: 'saving' }))

    try {
      if (contentId && content) {
        // Use API to save content
        await updateContent({ content: editorState.content })
      } else if (onSave) {
        // Fallback to prop callback
        await onSave(editorState.content)
      }
      
      setEditorState(prev => ({
        ...prev,
        status: 'saved',
        lastSaved: new Date()
      }))
      
      setTimeout(() => {
        setEditorState(prev => ({ ...prev, status: 'idle' }))
      }, 2000)
    } catch (error) {
      setEditorState(prev => ({ ...prev, status: 'error' }))
      console.error('Save failed:', error)
    }
  }



  const insertText = (text: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = editorState.content.substring(0, start) + text + editorState.content.substring(end)
    
    handleContentChange(newContent)
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  const formatText = (format: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = editorState.content.substring(start, end)

    let formattedText = ''
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`
        break
      case 'italic':
        formattedText = `*${selectedText}*`
        break
      case 'underline':
        formattedText = `__${selectedText}__`
        break
      case 'strikethrough':
        formattedText = `~~${selectedText}~~`
        break
      case 'code':
        formattedText = `\`${selectedText}\``
        break
      case 'link':
        formattedText = `[${selectedText}](url)`
        break
      case 'image':
        formattedText = `![${selectedText}](image-url)`
        break
      case 'heading1':
        formattedText = `# ${selectedText}`
        break
      case 'heading2':
        formattedText = `## ${selectedText}`
        break
      case 'quote':
        formattedText = `> ${selectedText}`
        break
      case 'list':
        formattedText = `- ${selectedText}`
        break
      case 'orderedList':
        formattedText = `1. ${selectedText}`
        break
    }

    const newContent = editorState.content.substring(0, start) + formattedText + editorState.content.substring(end)
    handleContentChange(newContent)
  }

  const insertBlock = (blockType: string) => {
    let blockContent = ''
    switch (blockType) {
      case 'paragraph':
        blockContent = '\n\n'
        break
      case 'heading1':
        blockContent = '\n\n# '
        break
      case 'heading2':
        blockContent = '\n\n## '
        break
      case 'quote':
        blockContent = '\n\n> '
        break
      case 'code':
        blockContent = '\n\n```\n\n```'
        break
      case 'table':
        blockContent = '\n\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |'
        break
      case 'image':
        blockContent = '\n\n![Alt text](image-url)'
        break
      case 'video':
        blockContent = '\n\n[Video](video-url)'
        break
      case 'divider':
        blockContent = '\n\n---\n\n'
        break
    }

    insertText(blockContent)
    setIsBlockPickerOpen(false)
  }

  const getStatusIcon = () => {
    switch (editorState.status) {
      case 'saving':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
      case 'saved':
        return <div className="h-4 w-4 rounded-full bg-green-500" />
      case 'error':
        return <div className="h-4 w-4 rounded-full bg-red-500" />
      default:
        return null
    }
  }

  const formatLastSaved = () => {
    if (!editorState.lastSaved) return 'Never'
    return editorState.lastSaved.toLocaleTimeString()
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Editor
            {editorState.status !== 'idle' && getStatusIcon()}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {editorState.wordCount} words
            </Badge>
            <Badge variant="outline" className="text-xs">
              {editorState.readingTime} min read
            </Badge>
            <Badge variant="outline" className="text-xs">
              Last saved: {formatLastSaved()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-2 border rounded-lg bg-muted/50">
          {/* Mode Toggle */}
          <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as 'visual' | 'markdown')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="visual">Visual</TabsTrigger>
              <TabsTrigger value="markdown">Markdown</TabsTrigger>
            </TabsList>
          </Tabs>

          <Separator orientation="vertical" className="h-6" />

          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('bold')}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('italic')}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('underline')}
              title="Underline (Ctrl+U)"
            >
              <Underline className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('strikethrough')}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('code')}
              title="Code"
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Links and Media */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('link')}
              title="Insert Link"
            >
              <Link className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('image')}
              title="Insert Image"
            >
              <Image className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Headings */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('heading1')}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('heading2')}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Lists and Quotes */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('list')}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('orderedList')}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('quote')}
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('table')}
              title="Insert Table"
            >
              <Table className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Blocks */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBlockPickerOpen(!isBlockPickerOpen)}
              title="Insert Block"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            {isBlockPickerOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-background border rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Text</div>
                  <div className="grid grid-cols-2 gap-1 mb-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertBlock('paragraph')}
                      className="justify-start"
                    >
                      <Type className="h-3 w-3 mr-2" />
                      Paragraph
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertBlock('heading1')}
                      className="justify-start"
                    >
                      <Heading1 className="h-3 w-3 mr-2" />
                      Heading 1
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertBlock('heading2')}
                      className="justify-start"
                    >
                      <Heading2 className="h-3 w-3 mr-2" />
                      Heading 2
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertBlock('quote')}
                      className="justify-start"
                    >
                      <Quote className="h-3 w-3 mr-2" />
                      Quote
                    </Button>
                  </div>
                  
                  <div className="text-xs font-medium text-muted-foreground mb-2">Media</div>
                  <div className="grid grid-cols-2 gap-1 mb-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertBlock('image')}
                      className="justify-start"
                    >
                      <Image className="h-3 w-3 mr-2" />
                      Image
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertBlock('video')}
                      className="justify-start"
                    >
                      <Video className="h-3 w-3 mr-2" />
                      Video
                    </Button>
                  </div>
                  
                  <div className="text-xs font-medium text-muted-foreground mb-2">Layout</div>
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertBlock('table')}
                      className="justify-start"
                    >
                      <Table className="h-3 w-3 mr-2" />
                      Table
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertBlock('divider')}
                      className="justify-start"
                    >
                      <Layout className="h-3 w-3 mr-2" />
                      Divider
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* AI Assistant */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
            title="AI Assistant"
            className={cn(isAIAssistantOpen && "bg-primary/10 text-primary")}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>

        {/* AI Assistant Panel */}
        {isAIAssistantOpen && (
          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium">AI Assistant</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <Zap className="h-3 w-3 mr-2" />
                  Improve Writing
                </Button>
                <Button variant="outline" size="sm">
                  <Type className="h-3 w-3 mr-2" />
                  Fix Grammar
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-3 w-3 mr-2" />
                  Generate Summary
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-3 w-3 mr-2" />
                  Optimize SEO
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Editor Content */}
        <TabsContent value="visual" className="mt-0">
          <div className="min-h-[400px] p-4 border rounded-lg bg-background">
            <textarea
              ref={textareaRef}
              value={editorState.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start writing your content..."
              className="w-full h-full min-h-[400px] resize-none border-none outline-none bg-transparent"
            />
          </div>
        </TabsContent>

        <TabsContent value="markdown" className="mt-0">
          <div className="min-h-[400px] p-4 border rounded-lg bg-background font-mono text-sm">
            <textarea
              value={editorState.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Write your markdown content..."
              className="w-full h-full min-h-[400px] resize-none border-none outline-none bg-transparent"
            />
          </div>
        </TabsContent>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onPreview?.(editorState.content)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
          
          <Button
            onClick={handleManualSave}
            disabled={editorState.status === 'saving'}
            className="min-w-[100px]"
          >
            {editorState.status === 'saving' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
