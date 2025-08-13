'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Undo,
  Redo,
  Type,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Table,
  Image,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface EnhancedClassicEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onSave?: (content: string) => Promise<void>;
  autoSaveInterval?: number; // in milliseconds
  className?: string;
}

interface SaveStatus {
  status: 'saved' | 'saving' | 'error' | 'unsaved';
  message: string;
  timestamp?: Date;
}

export function EnhancedClassicEditor({
  content,
  onContentChange,
  onSave,
  autoSaveInterval = 30000, // 30 seconds
  className
}: EnhancedClassicEditorProps) {
  const { toast } = useToast();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    status: 'saved',
    message: 'All changes saved'
  });
  const [lastSavedContent, setLastSavedContent] = useState(content);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastContentRef = useRef(content);

  // Auto-save functionality
  const saveContent = useCallback(async (contentToSave: string) => {
    if (!onSave) return;

    try {
      setSaveStatus({
        status: 'saving',
        message: 'Saving...'
      });

      await onSave(contentToSave);
      
      setLastSavedContent(contentToSave);
      setHasUnsavedChanges(false);
      setSaveStatus({
        status: 'saved',
        message: 'All changes saved',
        timestamp: new Date()
      });

      toast({
        title: 'Auto-saved',
        description: 'Your content has been automatically saved',
        duration: 2000
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus({
        status: 'error',
        message: 'Failed to save'
      });

      toast({
        title: 'Save failed',
        description: 'Failed to auto-save your content',
        variant: 'destructive',
        duration: 3000
      });
    }
  }, [onSave, toast]);

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    onContentChange(newContent);
    
    const hasChanges = newContent !== lastSavedContent;
    setHasUnsavedChanges(hasChanges);

    if (hasChanges) {
      setSaveStatus({
        status: 'unsaved',
        message: 'Unsaved changes'
      });

      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new auto-save timeout
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveContent(newContent);
      }, autoSaveInterval);
    }
  }, [onContentChange, lastSavedContent, autoSaveInterval, saveContent]);

  // Manual save
  const handleManualSave = async () => {
    if (hasUnsavedChanges) {
      await saveContent(content);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Update last content ref
  useEffect(() => {
    lastContentRef.current = content;
  }, [content]);

  // Save status indicator
  const getSaveStatusIcon = () => {
    switch (saveStatus.status) {
      case 'saved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'saving':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'unsaved':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className={cn('border border-border bg-card shadow-sm', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Type className="h-5 w-5" />
            Classic Editor
          </CardTitle>
          
          <div className="flex items-center gap-3">
            {/* Save Status */}
            <div className="flex items-center gap-2 text-sm">
              {getSaveStatusIcon()}
              <span className={cn(
                'text-xs',
                saveStatus.status === 'saved' && 'text-green-600 dark:text-green-400',
                saveStatus.status === 'saving' && 'text-blue-600 dark:text-blue-400',
                saveStatus.status === 'error' && 'text-red-600 dark:text-red-400',
                saveStatus.status === 'unsaved' && 'text-yellow-600 dark:text-yellow-400'
              )}>
                {saveStatus.message}
              </span>
              {saveStatus.timestamp && (
                <span className="text-xs text-muted-foreground">
                  {saveStatus.timestamp.toLocaleTimeString()}
                </span>
              )}
            </div>

            <Separator orientation="vertical" className="h-4" />

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSave}
                disabled={!hasUnsavedChanges || saveStatus.status === 'saving'}
                className="h-8"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                title="Preview"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Toolbar */}
        <div className="flex items-center gap-1 pt-2 border-t">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Underline className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-4" />

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Quote className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-4" />

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Code className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Table className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Image className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Link className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-4" />

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-4" />

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="min-h-[400px] border border-border rounded-lg">
          <RichTextEditor
            content={content}
            onChange={handleContentChange}
            placeholder="Start writing your content..."
            className="min-h-[400px]"
          />
        </div>

        {/* Editor Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Auto-save every {autoSaveInterval / 1000}s</span>
            <span>•</span>
            <span>{content.length} characters</span>
            <span>•</span>
            <span>{Math.ceil(content.split(' ').length)} words</span>
          </div>

          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="text-xs">
                Unsaved changes
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
