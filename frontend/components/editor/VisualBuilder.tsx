'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Badge is used in SortableBlock component
import { Separator } from '@/components/ui/separator';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  LayoutGrid, 
  Plus, 
  Type,
  Image,
  Video,
  Quote,
  Code,
  Table,
  List,
  Eye,
  Save
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { SortableBlock } from './SortableBlock';
// BlockToolbar component will be implemented later

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'quote' | 'code' | 'table' | 'list' | 'divider';
  content: string;
  settings?: Record<string, any>;
  order: number;
}

interface VisualBuilderProps {
  blocks: ContentBlock[];
  onBlocksChange: (blocks: ContentBlock[]) => void;
  onSave?: (blocks: ContentBlock[]) => Promise<void>;
  className?: string;
}

const blockTypes = [
  { id: 'text', label: 'Text Block', icon: Type, description: 'Rich text content' },
  { id: 'image', label: 'Image Block', icon: Image, description: 'Image with caption' },
  { id: 'video', label: 'Video Block', icon: Video, description: 'Video embed' },
  { id: 'quote', label: 'Quote Block', icon: Quote, description: 'Highlighted quote' },
  { id: 'code', label: 'Code Block', icon: Code, description: 'Code with syntax highlighting' },
  { id: 'table', label: 'Table Block', icon: Table, description: 'Data table' },
  { id: 'list', label: 'List Block', icon: List, description: 'Bulleted or numbered list' },
  { id: 'divider', label: 'Divider Block', icon: Separator, description: 'Visual separator' }
];

export function VisualBuilder({
  blocks,
  onBlocksChange,
  onSave,
  className
}: VisualBuilderProps) {
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(block => block.id === active.id);
      const newIndex = blocks.findIndex(block => block.id === over.id);

      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      onBlocksChange(newBlocks);
    }
  }, [blocks, onBlocksChange]);

  const addBlock = useCallback((type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: '',
      order: blocks.length,
      settings: {}
    };

    const newBlocks = [...blocks, newBlock];
    onBlocksChange(newBlocks);
    setIsAddingBlock(false);
    setSelectedBlock(newBlock.id);
  }, [blocks, onBlocksChange]);

  const updateBlock = useCallback((blockId: string, updates: Partial<ContentBlock>) => {
    const newBlocks = blocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    );
    onBlocksChange(newBlocks);
  }, [blocks, onBlocksChange]);

  const deleteBlock = useCallback((blockId: string) => {
    const newBlocks = blocks.filter(block => block.id !== blockId);
    onBlocksChange(newBlocks);
    setSelectedBlock(null);
  }, [blocks, onBlocksChange]);

  const handleSave = useCallback(async () => {
    if (onSave) {
      try {
        await onSave(blocks);
      } catch (error) {
        console.error('Failed to save blocks:', error);
      }
    }
  }, [blocks, onSave]);

  return (
    <Card className={cn('border border-border bg-card shadow-sm', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Visual Builder
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingBlock(true)}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Block
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              className="h-8"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Block Counter */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{blocks.length} blocks</span>
          <span>•</span>
          <span>Drag to reorder</span>
          <span>•</span>
          <span>Click to edit</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map(block => block.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {blocks.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                  <LayoutGrid className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No blocks yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start building your content by adding blocks
                  </p>
                  <Button
                    onClick={() => setIsAddingBlock(true)}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Block
                  </Button>
                </div>
              ) : (
                blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    isSelected={selectedBlock === block.id}
                    onSelect={() => setSelectedBlock(block.id)}
                    onUpdate={(updates) => updateBlock(block.id, updates)}
                    onDelete={() => deleteBlock(block.id)}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add Block Modal */}
        {isAddingBlock && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Block
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {blockTypes.map((blockType) => {
                    const Icon = blockType.icon;
                    return (
                      <Button
                        key={blockType.id}
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center gap-2 p-4"
                        onClick={() => addBlock(blockType.id as ContentBlock['type'])}
                      >
                        <Icon className="h-6 w-6" />
                        <div className="text-center">
                          <div className="font-medium text-sm">{blockType.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {blockType.description}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingBlock(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
