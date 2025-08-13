'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Search, 
  Grid3X3,
  List,
  Star,
  Plus,
  Download
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

interface TemplateGalleryProps {
  onSelectTemplate: (template: Template) => void;
  onClose: () => void;
  className?: string;
}

const templateCategories = [
  'All',
  'Blog Posts',
  'Landing Pages',
  'Product Pages',
  'News Articles',
  'Tutorials',
  'Reviews',
  'Interviews'
];

const sampleTemplates: Template[] = [
  {
    id: '1',
    name: 'Modern Blog Post',
    description: 'Clean and modern blog post template with hero section and content blocks',
    category: 'Blog Posts',
    thumbnail: '/api/placeholder/400/300',
    rating: 4.8,
    downloads: 1247,
    isNew: true,
    tags: ['modern', 'blog', 'hero'],
    blocks: [
      { id: '1', type: 'text', content: 'Hero Title', order: 0 },
      { id: '2', type: 'text', content: 'Introduction paragraph...', order: 1 },
      { id: '3', type: 'image', content: '', order: 2 },
      { id: '4', type: 'text', content: 'Main content...', order: 3 }
    ]
  },
  {
    id: '2',
    name: 'Product Review',
    description: 'Comprehensive product review template with pros/cons and rating',
    category: 'Reviews',
    thumbnail: '/api/placeholder/400/300',
    rating: 4.6,
    downloads: 892,
    isPopular: true,
    tags: ['review', 'product', 'rating'],
    blocks: [
      { id: '1', type: 'text', content: 'Product Review Title', order: 0 },
      { id: '2', type: 'image', content: '', order: 1 },
      { id: '3', type: 'text', content: 'Product overview...', order: 2 },
      { id: '4', type: 'list', content: 'Pros and cons...', order: 3 }
    ]
  },
  {
    id: '3',
    name: 'Tutorial Guide',
    description: 'Step-by-step tutorial template with code blocks and screenshots',
    category: 'Tutorials',
    thumbnail: '/api/placeholder/400/300',
    rating: 4.9,
    downloads: 1563,
    tags: ['tutorial', 'guide', 'code'],
    blocks: [
      { id: '1', type: 'text', content: 'Tutorial Title', order: 0 },
      { id: '2', type: 'text', content: 'Prerequisites...', order: 1 },
      { id: '3', type: 'code', content: 'Code example...', order: 2 },
      { id: '4', type: 'image', content: '', order: 3 }
    ]
  },
  {
    id: '4',
    name: 'Landing Page',
    description: 'High-converting landing page with call-to-action sections',
    category: 'Landing Pages',
    thumbnail: '/api/placeholder/400/300',
    rating: 4.7,
    downloads: 2034,
    isPopular: true,
    tags: ['landing', 'conversion', 'cta'],
    blocks: [
      { id: '1', type: 'text', content: 'Hero Section', order: 0 },
      { id: '2', type: 'text', content: 'Features...', order: 1 },
      { id: '3', type: 'quote', content: 'Testimonial...', order: 2 },
      { id: '4', type: 'text', content: 'Call to action...', order: 3 }
    ]
  },
  {
    id: '5',
    name: 'News Article',
    description: 'Professional news article template with structured layout',
    category: 'News Articles',
    thumbnail: '/api/placeholder/400/300',
    rating: 4.5,
    downloads: 678,
    tags: ['news', 'article', 'professional'],
    blocks: [
      { id: '1', type: 'text', content: 'News Headline', order: 0 },
      { id: '2', type: 'text', content: 'Lead paragraph...', order: 1 },
      { id: '3', type: 'image', content: '', order: 2 },
      { id: '4', type: 'text', content: 'Article body...', order: 3 }
    ]
  },
  {
    id: '6',
    name: 'Interview Q&A',
    description: 'Interview template with question-answer format',
    category: 'Interviews',
    thumbnail: '/api/placeholder/400/300',
    rating: 4.4,
    downloads: 445,
    tags: ['interview', 'qa', 'conversation'],
    blocks: [
      { id: '1', type: 'text', content: 'Interview Title', order: 0 },
      { id: '2', type: 'text', content: 'Introduction...', order: 1 },
      { id: '3', type: 'quote', content: 'Q&A content...', order: 2 },
      { id: '4', type: 'text', content: 'Conclusion...', order: 3 }
    ]
  }
];

export function TemplateGallery({
  onSelectTemplate,
  onClose,
  className
}: TemplateGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const filteredTemplates = sampleTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleTemplateSelect = useCallback((template: Template) => {
    setSelectedTemplate(template);
  }, []);

  const handleUseTemplate = useCallback(() => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
    }
  }, [selectedTemplate, onSelectTemplate]);

  return (
    <Card className={cn('border border-border bg-card shadow-sm', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Template Gallery
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="h-8"
            >
              {viewMode === 'grid' ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid3X3 className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8"
            >
              Close
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {templateCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="h-8 whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search terms or category filter
            </p>
          </div>
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
          )}>
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-md border border-border',
                  selectedTemplate?.id === template.id && 'ring-2 ring-primary'
                )}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">{template.name}</p>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-medium text-sm">{template.name}</h3>
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

                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Template Preview Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {selectedTemplate.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Template Preview</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.description}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Blocks ({selectedTemplate.blocks.length})</h4>
                  <div className="space-y-1">
                    {selectedTemplate.blocks.map((block, index) => (
                      <div key={block.id} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {index + 1}
                        </Badge>
                        <span className="capitalize">{block.type} Block</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current" />
                      <span>{selectedTemplate.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>{selectedTemplate.downloads} downloads</span>
                    </div>
                  </div>
                  
                  <Button onClick={handleUseTemplate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Use This Template
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
