'use client';

import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Folder,
  FolderOpen,
  FileText,
  MoreHorizontal,
  Edit,
  Eye,
  EyeOff,
  Trash2,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Save,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
    children: number;
  };
  children?: Category[];
}

interface CategoryTableProps {
  categories: Category[];
  onCategoryAction: (categoryId: string, action: string, data?: any) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onUpdateHierarchy: (categoryId: string, newParentId: string | null) => Promise<void>;
  isKeyboardMode?: boolean;
  focusedIndex?: number;
}

// Sortable Category Row Component
function SortableCategoryRow({ 
  category, 
  level = 0,
  onCategoryAction,
  onDeleteCategory,
  isExpanded,
  onToggleExpand,
  hasChildren,
  isEditing,
  editForm,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditFormChange,
  isKeyboardFocused = false,
}: {
  category: Category;
  level?: number;
  onCategoryAction: (categoryId: string, action: string, data?: any) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  hasChildren?: boolean;
  isEditing?: boolean;
  editForm?: { name: string; slug: string; description: string };
  onStartEdit?: (category: Category) => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
  onEditFormChange?: (field: string, value: string) => void;
  isKeyboardFocused?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "hover:bg-muted/50 transition-colors",
        isDragging && "opacity-50",
        isKeyboardFocused && "bg-muted/50"
      )}
    >
      <TableCell className="w-12">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted/50 rounded transition-colors"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          {hasChildren && (
            <button
              onClick={onToggleExpand}
              className="p-1 hover:bg-muted/50 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div 
          className="flex items-center space-x-3"
          style={{ paddingLeft: `${level * 20}px` }}
        >
          <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            {isEditing ? (
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <Input
                  value={editForm?.name || ''}
                  onChange={(e) => onEditFormChange?.('name', e.target.value)}
                  className="h-8 text-sm flex-1 min-w-0"
                  placeholder="Category name"
                />
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Button
                    size="sm"
                    onClick={onSaveEdit}
                    className="h-7 px-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancelEdit}
                    className="h-7 px-2 border-border text-foreground hover:bg-muted/50 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <span className="font-medium text-foreground">{category.name}</span>
                <Badge 
                  variant={category.isActive ? "default" : "secondary"} 
                  className="text-xs font-medium"
                >
                  {category.isActive ? "Active" : "Inactive"}
                </Badge>
              </>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editForm?.slug || ''}
            onChange={(e) => onEditFormChange?.('slug', e.target.value)}
            className="h-8 text-sm font-mono"
            placeholder="category-slug"
          />
        ) : (
          <div className="font-mono text-sm text-muted-foreground">
            /{category.slug}
          </div>
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editForm?.description || ''}
            onChange={(e) => onEditFormChange?.('description', e.target.value)}
            className="h-8 text-sm"
            placeholder="Category description"
          />
        ) : (
          category.description ? (
            <span className="text-sm text-muted-foreground line-clamp-2">
              {category.description}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">No description</span>
          )
        )}
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm">
            <FileText className="h-3 w-3 text-muted-foreground" />
            <span className="text-foreground">{category._count?.posts || 0} posts</span>
          </div>
          {category._count?.children && category._count.children > 0 && (
            <div className="flex items-center space-x-2 text-sm">
              <FolderOpen className="h-3 w-3 text-muted-foreground" />
              <span className="text-foreground">{category._count.children} subcategories</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {formatDate(category.createdAt)}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {formatDate(category.updatedAt)}
        </span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={() => onStartEdit?.(category)}
              className="flex items-center"
            >
              <Edit className="h-4 w-4 mr-2 text-muted-foreground" />
              Quick Edit
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/content/categories/${category.id}/edit`} className="flex items-center">
                <Edit className="h-4 w-4 mr-2 text-muted-foreground" />
                Full Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onCategoryAction(
                category.id,
                category.isActive ? 'deactivate' : 'activate'
              )}
              className="flex items-center"
            >
              {category.isActive ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2 text-muted-foreground" />
                  Deactivate
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDeleteCategory(category.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function CategoryTable({ 
  categories, 
  onCategoryAction, 
  onDeleteCategory,
  onUpdateHierarchy,
  isKeyboardMode = false,
  focusedIndex = -1
}: CategoryTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    slug: string;
    description: string;
  }>({
    name: '',
    slug: '',
    description: ''
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Build hierarchical structure
  const buildHierarchy = (items: Category[], parentId: string | null = null): Category[] => {
    // If we have filtered data (all items have the same parentId), just return them as flat list
    if (items.length > 0 && items.every(item => item.parentId === items[0]?.parentId)) {
      return items.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    
    // Otherwise, build normal hierarchy
    return items
      .filter(item => item.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(item => ({
        ...item,
        children: buildHierarchy(items, item.id)
      }));
  };

  // Flatten hierarchy for display
  const flattenHierarchy = (items: Category[], level = 0): Array<{ category: Category; level: number }> => {
    const result: Array<{ category: Category; level: number }> = [];
    
    items.forEach(item => {
      result.push({ category: item, level });
      
      // Show children if they exist and parent is expanded
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedCategories.has(item.id);
      
      if (hasChildren && isExpanded) {
        result.push(...flattenHierarchy(item.children || [], level + 1));
      }
    });
    
    return result;
  };

  const hierarchicalCategories = useMemo(() => buildHierarchy(categories), [categories]);
  const flattenedCategories = useMemo(() => flattenHierarchy(hierarchicalCategories), [hierarchicalCategories, expandedCategories]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const category = categories.find(cat => cat.id === active.id);
    setDraggedCategory(category || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setDraggedCategory(null);

    if (over && active.id !== over.id) {
      const draggedCategory = categories.find(cat => cat.id === active.id);
      const targetCategory = categories.find(cat => cat.id === over.id);
      
      if (draggedCategory && targetCategory) {
        let newParentId: string | null = null;
        
        if (targetCategory._count?.children && targetCategory._count.children > 0 && expandedCategories.has(targetCategory.id)) {
          newParentId = targetCategory.id;
        } else {
          newParentId = targetCategory.parentId || null;
        }
        
        await onUpdateHierarchy(draggedCategory.id, newParentId);
      }
    }
  };

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Quick edit functions
  const startEdit = (category: Category) => {
    setEditingCategory(category.id);
    setEditForm({
      name: category.name,
      slug: category.slug,
      description: category.description || ''
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditForm({
      name: '',
      slug: '',
      description: ''
    });
  };

  const saveEdit = async () => {
    if (!editingCategory) return;
    
    try {
      await onCategoryAction(editingCategory, 'update', editForm);
      setEditingCategory(null);
      setEditForm({
        name: '',
        slug: '',
        description: ''
      });
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-4">
      {isKeyboardMode && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border border-border">
          <strong>Keyboard Mode Active</strong> - Use arrow keys to navigate, Enter to edit, Escape to exit
        </div>
      )}
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-12 text-muted-foreground font-medium">Actions</TableHead>
                <TableHead className="text-muted-foreground font-medium">Name & Status</TableHead>
                <TableHead className="text-muted-foreground font-medium">Slug</TableHead>
                <TableHead className="text-muted-foreground font-medium">Description</TableHead>
                <TableHead className="text-muted-foreground font-medium">Posts & Subcategories</TableHead>
                <TableHead className="text-muted-foreground font-medium">Created</TableHead>
                <TableHead className="text-muted-foreground font-medium">Updated</TableHead>
                <TableHead className="w-12 text-muted-foreground font-medium">Menu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext
                items={flattenedCategories.map(item => item.category.id)}
                strategy={verticalListSortingStrategy}
              >
                {flattenedCategories.map(({ category, level }) => (
                  <SortableCategoryRow
                    key={category.id}
                    category={category}
                    level={level}
                    onCategoryAction={onCategoryAction}
                    onDeleteCategory={onDeleteCategory}
                    isExpanded={expandedCategories.has(category.id)}
                    onToggleExpand={() => toggleExpand(category.id)}
                    hasChildren={!!(category._count?.children && category._count.children > 0)}
                    isEditing={editingCategory === category.id}
                    editForm={editForm}
                    onStartEdit={startEdit}
                    onCancelEdit={cancelEdit}
                    onSaveEdit={saveEdit}
                    onEditFormChange={handleEditFormChange}
                    isKeyboardFocused={focusedIndex === flattenedCategories.findIndex(item => item.category.id === category.id)}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </div>

        <DragOverlay>
          {draggedCategory ? (
            <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <Folder className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{draggedCategory.name}</span>
                <Badge 
                  variant={draggedCategory.isActive ? "default" : "secondary"} 
                  className="text-xs font-medium"
                >
                  {draggedCategory.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
