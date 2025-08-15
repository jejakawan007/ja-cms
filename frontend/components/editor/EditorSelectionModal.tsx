'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Type, 
  LayoutGrid, 
  FileText, 
  Sparkles, 
  Clock,
  Check,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/cn';

export type EditorType = 'classic' | 'visual' | 'template';

interface EditorOption {
  id: EditorType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  isRecommended?: boolean;
  isNew?: boolean;
}

interface EditorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (editorType: EditorType) => void;
  className?: string;
}

const editorOptions: EditorOption[] = [
  {
    id: 'classic',
    title: 'Classic Editor',
    description: 'Traditional rich text editor with advanced formatting options',
    icon: Type,
    features: [
      'Rich text formatting',
      'Image and media support',
      'Table creation',
      'Code blocks with syntax highlighting',
      'Auto-save functionality',
      'Real-time preview'
    ],
    isRecommended: true
  },
  {
    id: 'visual',
    title: 'Visual Builder',
    description: 'Drag & drop interface with modular blocks',
    icon: LayoutGrid,
    features: [
      'Drag & drop blocks',
      'Pre-built content blocks',
      'Live visual editing',
      'Block customization',
      'Responsive preview',
      'Template system'
    ],
    isNew: true
  },
  {
    id: 'template',
    title: 'Template Gallery',
    description: 'Choose from pre-designed templates and customize',
    icon: FileText,
    features: [
      'Professional templates',
      'Category-based browsing',
      'Template preview',
      'Easy customization',
      'Save custom templates',
      'Recent templates'
    ]
  }
];

export function EditorSelectionModal({ 
  isOpen, 
  onClose, 
  onSelect,
  className 
}: EditorSelectionModalProps) {
  const [selectedEditor, setSelectedEditor] = useState<EditorType | null>(null);

  const handleSelect = (editorType: EditorType) => {
    setSelectedEditor(editorType);
    onSelect(editorType);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn('max-w-4xl', className)}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Choose Your Editor
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Select the editor that best fits your content creation workflow
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          {editorOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedEditor === option.id;
            
            return (
              <Card 
                key={option.id}
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-md',
                  isSelected && 'ring-2 ring-primary',
                  'border border-border bg-card'
                )}
                onClick={() => setSelectedEditor(option.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'p-2 rounded-lg',
                        option.id === 'classic' && 'bg-blue-50 dark:bg-blue-950',
                        option.id === 'visual' && 'bg-green-50 dark:bg-green-950',
                        option.id === 'template' && 'bg-purple-50 dark:bg-purple-950'
                      )}>
                        <Icon className={cn(
                          'h-5 w-5',
                          option.id === 'classic' && 'text-blue-600 dark:text-blue-400',
                          option.id === 'visual' && 'text-green-600 dark:text-green-400',
                          option.id === 'template' && 'text-purple-600 dark:text-purple-400'
                        )} />
                      </div>
                      <div>
                        <CardTitle className="text-base font-medium">
                          {option.title}
                        </CardTitle>
                        {option.isRecommended && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            <Check className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                        {option.isNew && (
                          <Badge variant="default" className="text-xs mt-1">
                            <Sparkles className="h-3 w-3 mr-1" />
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <CardDescription className="text-sm mb-4">
                    {option.description}
                  </CardDescription>

                  <Separator className="mb-4" />

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Features:</h4>
                    <ul className="space-y-1">
                      {option.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    className="w-full mt-4"
                    onClick={() => handleSelect(option.id)}
                  >
                    Select {option.title}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>You can change this later in editor settings</span>
          </div>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
