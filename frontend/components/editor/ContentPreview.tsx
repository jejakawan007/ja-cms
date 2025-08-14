'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Eye, 
  EyeOff, 
  FileText, 
  Smartphone, 
  Monitor, 
  Tablet, 
  X,
  Share,
  Download,
  Printer
} from 'lucide-react'
import { cn } from '@/lib/cn'
import DOMPurify from 'dompurify'

interface ContentPreviewProps {
  content: string
  title?: string
  onClose?: () => void
  onEdit?: () => void
  className?: string
}

export function ContentPreview({ 
  content, 
  title = 'Content Preview', 
  onClose, 
  onEdit,
  className 
}: ContentPreviewProps) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showRaw, setShowRaw] = useState(false)

  const renderMarkdown = (markdown: string) => {
    // Simple markdown to HTML conversion
    let html = markdown

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')

    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    html = html.replace(/__(.*?)__/g, '<strong class="font-semibold">$1</strong>')
    html = html.replace(/~~(.*?)~~/g, '<del class="line-through">$1</del>')

    // Code
    html = html.replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">$1</code></pre>')

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">$1</blockquote>')

    // Lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
    
    // Wrap lists
    html = html.replace(/(<li class="ml-4">.*<\/li>)/gs, '<ol class="list-decimal my-4">$1</ol>')
    html = html.replace(/(<li class="ml-4">.*<\/li>)/gs, '<ul class="list-disc my-4">$1</ul>')

    // Tables
    html = html.replace(/\|(.+)\|/g, (_, content) => {
      const cells = content.split('|').map((cell: string) => cell.trim())
      return `<tr>${cells.map((cell: string) => `<td class="border px-3 py-2">${cell}</td>`).join('')}</tr>`
    })
    html = html.replace(/(<tr>.*<\/tr>)/gs, '<table class="border-collapse border my-4 w-full">$1</table>')

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr class="my-6 border-t" />')

    // Paragraphs
    html = html.replace(/^(?!<[a-z][1-6]?|<blockquote|<pre|<ul|<ol|<table|<hr)(.+)$/gim, '<p class="mb-4 leading-relaxed">$1</p>')

    // Clean up empty paragraphs
    html = html.replace(/<p class="mb-4 leading-relaxed"><\/p>/g, '')

    return html
  }

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return 'max-w-sm'
      case 'tablet':
        return 'max-w-2xl'
      case 'desktop':
        return 'max-w-4xl'
      default:
        return 'max-w-4xl'
    }
  }



  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const characterCount = content.length
  const readingTime = Math.ceil(wordCount / 200)

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {title}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {wordCount} words
            </Badge>
            <Badge variant="outline" className="text-xs">
              {readingTime} min read
            </Badge>
            <Badge variant="outline" className="text-xs">
              {characterCount} characters
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Preview Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Device Preview */}
            <div className="flex items-center gap-1">
              <Button
                variant={previewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('desktop')}
                title="Desktop View"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('tablet')}
                title="Tablet View"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('mobile')}
                title="Mobile View"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* View Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRaw(!showRaw)}
            >
              {showRaw ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showRaw ? 'Hide Raw' : 'Show Raw'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <FileText className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Preview Content */}
        <div className="border rounded-lg bg-background">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="raw">Raw Content</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="mt-4">
              <div className={cn('mx-auto bg-white', getPreviewWidth())}>
                <div className="p-6">
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(renderMarkdown(content), { ALLOWED_TAGS: ['h1','h2','h3','p','strong','em','del','code','pre','a','img','blockquote','li','ol','ul','table','tr','td','hr','br','span'], ALLOWED_ATTR: ['class','href','alt','target','rel'] }) 
                    }}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="raw" className="mt-4">
              <div className="p-4 bg-muted rounded-lg">
                <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                  {content || 'No content to preview'}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Content Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{wordCount}</div>
            <div className="text-sm text-muted-foreground">Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{characterCount}</div>
            <div className="text-sm text-muted-foreground">Characters</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{readingTime}</div>
            <div className="text-sm text-muted-foreground">Min Read</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
