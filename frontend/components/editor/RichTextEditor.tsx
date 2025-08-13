'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Underline as UnderlineIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  maxLength?: number
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing your content...',
  className,
  maxLength = 50000
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link,
      TextAlign,
      Underline,
      CharacterCount.configure({
        limit: maxLength,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-neutral max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  })

  if (!editor) {
    return null
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className={cn('border border-border rounded-lg bg-background shadow-sm', className)}>
      {/* Toolbar */}
      <div className="border-b border-border bg-muted/30 p-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('bold') && 'bg-primary text-primary-foreground'
            )}
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('italic') && 'bg-primary text-primary-foreground'
            )}
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('underline') && 'bg-primary text-primary-foreground'
            )}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Headings */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn(
              'h-8 px-2 text-xs',
              editor.isActive('heading', { level: 1 }) && 'bg-primary text-primary-foreground'
            )}
          >
            H1
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(
              'h-8 px-2 text-xs',
              editor.isActive('heading', { level: 2 }) && 'bg-primary text-primary-foreground'
            )}
          >
            H2
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn(
              'h-8 px-2 text-xs',
              editor.isActive('heading', { level: 3 }) && 'bg-primary text-primary-foreground'
            )}
          >
            H3
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Lists */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('bulletList') && 'bg-primary text-primary-foreground'
            )}
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('orderedList') && 'bg-primary text-primary-foreground'
            )}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Block Elements */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('blockquote') && 'bg-primary text-primary-foreground'
            )}
          >
            <Quote className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('codeBlock') && 'bg-primary text-primary-foreground'
            )}
          >
            <Code className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Text Alignment */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive({ textAlign: 'left' }) && 'bg-primary text-primary-foreground'
            )}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive({ textAlign: 'center' }) && 'bg-primary text-primary-foreground'
            )}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive({ textAlign: 'right' }) && 'bg-primary text-primary-foreground'
            )}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive({ textAlign: 'justify' }) && 'bg-primary text-primary-foreground'
            )}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Media */}
          <Button
            variant="ghost"
            size="sm"
            onClick={addLink}
            className="h-8 w-8 p-0"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={addImage}
            className="h-8 w-8 p-0"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* History */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8 p-0"
          >
            <Undo className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8 p-0"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent 
          editor={editor} 
          className="editor-content"
        />
        
        {/* Character Count */}
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded border border-border">
          {editor.storage['characterCount'].characters()}/{maxLength.toLocaleString()}
        </div>
      </div>
    </div>
  )
}
