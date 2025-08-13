'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical,
  Settings,
  Trash2,
  Type,
  Image,
  Video,
  Quote,
  Code,
  Table,
  List,
  Minus,
  Edit3
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { ContentBlock } from './VisualBuilder';

interface SortableBlockProps {
  block: ContentBlock;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onDelete: () => void;
}

const blockIcons = {
  text: Type,
  image: Image,
  video: Video,
  quote: Quote,
  code: Code,
  table: Table,
  list: List,
  divider: Minus
};

const blockColors = {
  text: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
  image: 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400',
  video: 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
  quote: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400',
  code: 'bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-400',
  table: 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400',
  list: 'bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400',
  divider: 'bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-400'
};

export function SortableBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete
}: SortableBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(block.content);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const Icon = blockIcons[block.type];
  const colorClass = blockColors[block.type];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    onUpdate({ content: editContent });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(block.content);
    setIsEditing(false);
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'text':
        return (
          <div className="prose prose-sm max-w-none">
            {block.content || <span className="text-muted-foreground">Click to add text content...</span>}
          </div>
        );
      
      case 'image':
        return (
          <div className="text-center">
            {block.content ? (
              <img 
                src={block.content} 
                alt="Block content" 
                className="max-w-full h-auto rounded-lg"
              />
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-8">
                <Image className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to add image URL</p>
              </div>
            )}
          </div>
        );
      
      case 'video':
        return (
          <div className="text-center">
            {block.content ? (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Video className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground ml-2">Video: {block.content}</span>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-8">
                <Video className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to add video URL</p>
              </div>
            )}
          </div>
        );
      
      case 'quote':
        return (
          <blockquote className="border-l-4 border-primary pl-4 italic">
            {block.content || <span className="text-muted-foreground">Click to add quote...</span>}
          </blockquote>
        );
      
      case 'code':
        return (
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code className="text-sm">
              {block.content || <span className="text-muted-foreground">Click to add code...</span>}
            </code>
          </pre>
        );
      
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full border border-border">
              <tbody>
                <tr>
                  <td className="border border-border p-2 text-center text-muted-foreground">
                    {block.content || 'Click to add table data...'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      
      case 'list':
        return (
          <ul className="list-disc list-inside space-y-1">
            <li>{block.content || <span className="text-muted-foreground">Click to add list items...</span>}</li>
          </ul>
        );
      
      case 'divider':
        return <hr className="border-border" />;
      
      default:
        return <div>{block.content}</div>;
    }
  };

  const renderEditForm = () => {
    switch (block.type) {
      case 'text':
      case 'quote':
      case 'code':
      case 'list':
        return (
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder={`Enter ${block.type} content...`}
            className="min-h-[100px]"
          />
        );
      
      case 'image':
      case 'video':
        return (
          <Input
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder={`Enter ${block.type} URL...`}
          />
        );
      
      case 'table':
        return (
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Enter table data (CSV format)..."
            className="min-h-[100px]"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative',
        isDragging && 'opacity-50'
      )}
    >
      <Card 
        className={cn(
          'border border-border bg-card shadow-sm transition-all duration-200',
          isSelected && 'ring-2 ring-primary',
          'hover:shadow-md'
        )}
        onClick={onSelect}
      >
        <CardContent className="p-4">
          {/* Block Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab hover:cursor-grabbing p-1 rounded"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className={cn('p-1 rounded', colorClass)}>
                <Icon className="h-4 w-4" />
              </div>
              
              <Badge variant="secondary" className="text-xs capitalize">
                {block.type} Block
              </Badge>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(!isEditing);
                }}
                className="h-6 w-6 p-0"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Add settings modal
                }}
                className="h-6 w-6 p-0"
              >
                <Settings className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Block Content */}
          <div className="min-h-[60px]">
            {isEditing ? (
              <div className="space-y-3">
                {renderEditForm()}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div onClick={() => setIsEditing(true)} className="cursor-pointer">
                {renderBlockContent()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
