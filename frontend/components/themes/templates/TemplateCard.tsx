'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Star, 
  Download, 
  Eye,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { ContentBlock } from '../../editor/VisualBuilder';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  blocks: ContentBlock[];
  rating: number;
  downloads: number;
  isNew?: boolean;
  isPopular?: boolean;
  tags: string[];
}

interface TemplateCardProps {
  template: Template;
  isSelected?: boolean;
  onSelect?: (template: Template) => void;
  onPreview?: (template: Template) => void;
  onUse?: (template: Template) => void;
  className?: string;
}

export function TemplateCard({
  template,
  isSelected = false,
  onSelect,
  onPreview,
  onUse,
  className
}: TemplateCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md border border-border',
        isSelected && 'ring-2 ring-primary',
        className
      )}
      onClick={() => onSelect?.(template)}
    >
      {/* Template Thumbnail */}
      <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center relative overflow-hidden">
        <div className="text-center">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">{template.name}</p>
        </div>
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(template);
            }}
            className="h-8"
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
          
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onUse?.(template);
            }}
            className="h-8"
          >
            <Plus className="h-3 w-3 mr-1" />
            Use
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Template Header */}
          <div>
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-medium text-sm line-clamp-1">{template.name}</h3>
              <div className="flex items-center gap-1">
                {template.isNew && (
                  <Badge variant="default" className="text-xs">
                    New
                  </Badge>
                )}
                {template.isPopular && (
                  <Badge variant="secondary" className="text-xs">
                    Popular
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          </div>

          {/* Template Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              <span>{template.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              <span>{template.downloads}</span>
            </div>
          </div>

          {/* Template Tags */}
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Template Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="capitalize">{template.category}</span>
            <span>{template.blocks.length} blocks</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
