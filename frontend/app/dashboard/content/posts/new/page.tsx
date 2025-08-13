'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
// RichTextEditor is now used in EnhancedClassicEditor
import { EditorSelectionModal, type EditorType } from '@/components/editor/EditorSelectionModal';
import { EnhancedClassicEditor } from '@/components/editor/EnhancedClassicEditor';
import { VisualBuilder, type ContentBlock } from '@/components/editor/VisualBuilder';
import { TemplateGallery } from '@/components/themes/templates/TemplateGallery';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Tag,
  Image,
  Settings,
  Plus,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export default function CreatePostPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Editor state
  const [selectedEditor, setSelectedEditor] = useState<EditorType | null>(null);
  const [showEditorModal, setShowEditorModal] = useState(true);
  const [visualBlocks, setVisualBlocks] = useState<ContentBlock[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED',
    categoryId: '',
    tags: [] as string[],
    featuredImage: '',
    publishedAt: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editor handlers
  const handleEditorSelect = (editorType: EditorType) => {
    setSelectedEditor(editorType);
    setShowEditorModal(false);
  };

  const handleContentChange = (newContent: string) => {
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  const handleBlocksChange = (blocks: ContentBlock[]) => {
    setVisualBlocks(blocks);
    // Convert blocks to content string for storage
    const content = blocks.map(block => block.content).join('\n\n');
    setFormData(prev => ({ ...prev, content }));
  };

  const handleTemplateSelect = (template: any) => {
    setVisualBlocks(template.blocks);
    const content = template.blocks.map((block: ContentBlock) => block.content).join('\n\n');
    setFormData(prev => ({ ...prev, content }));
  };

  const handleAutoSave = async (content: string) => {
    // TODO: Implement auto-save to backend
    console.log('Auto-saving content:', content);
  };

  const handleBlocksSave = async (blocks: ContentBlock[]) => {
    // TODO: Implement auto-save to backend
    console.log('Auto-saving blocks:', blocks);
  };

  // Real data from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/categories', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('ja-cms-token') || ''}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCategories(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const availableTags: Tag[] = [
    { id: '1', name: 'Next.js', slug: 'nextjs' },
    { id: '2', name: 'React', slug: 'react' },
    { id: '3', name: 'TypeScript', slug: 'typescript' },
    { id: '4', name: 'JavaScript', slug: 'javascript' },
    { id: '5', name: 'Web Development', slug: 'web-development' },
    { id: '6', name: 'CSS', slug: 'css' },
    { id: '7', name: 'API', slug: 'api' },
    { id: '8', name: 'Backend', slug: 'backend' }
  ];

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: generateSlug(value)
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitPost();
  };

  const submitPost = async () => {
    setIsSubmitting(true);
    
    try {
      // Check if editor is selected
      if (!selectedEditor) {
        toast({
          title: 'Error',
          description: 'Please select an editor type first',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Check if user is authenticated
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({
          title: 'Authentication Error',
          description: 'Please login to create a post',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        router.push('/auth/login');
        return;
      }

      // Validate required fields
      if (!formData.title.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Title is required',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare post data
      const postData: any = {
        title: formData.title.trim(),
        slug: formData.slug.trim() || generateSlug(formData.title),
        excerpt: formData.excerpt.trim(),
        content: formData.content || '',
        status: formData.status || 'draft',
        categoryId: formData.categoryId || null,
        metaTitle: formData.seoTitle || formData.title,
        metaDescription: formData.seoDescription || formData.excerpt,
        metaKeywords: formData.seoKeywords || '',
        tags: formData.tags || []
      };

      // Only include featuredImage if it has a value
      if (formData.featuredImage && formData.featuredImage.trim()) {
        postData.featuredImage = formData.featuredImage.trim();
      }

      console.log('Submitting post data:', postData);

      // Use the posts API service
      const response = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Post created successfully',
        });
        router.push('/dashboard/content/posts');
      } else {
        const errorMessage = data.error?.message || data.message || 'Failed to create post';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create post',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    router.push('/dashboard/content/posts');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Editor Selection Modal */}
      <EditorSelectionModal
        isOpen={showEditorModal}
        onClose={() => setShowEditorModal(false)}
        onSelect={handleEditorSelect}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleBackClick}
            className="border-border text-foreground hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Posts
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Create New Post</h1>
            <p className="text-sm text-muted-foreground">
              Write and publish your content
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="border-border text-foreground hover:bg-muted/50 transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={submitPost} 
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Post'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Slug */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-foreground">Post Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-foreground">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter post title..."
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-medium text-foreground">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="post-url-slug"
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="excerpt" className="text-sm font-medium text-foreground">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief description of your post..."
                    rows={3}
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-foreground">Content</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEditor === 'classic' && (
                  <EnhancedClassicEditor
                    content={formData.content}
                    onContentChange={handleContentChange}
                    onSave={handleAutoSave}
                    autoSaveInterval={30000}
                  />
                )}
                
                {selectedEditor === 'visual' && (
                  <VisualBuilder
                    blocks={visualBlocks}
                    onBlocksChange={handleBlocksChange}
                    onSave={handleBlocksSave}
                  />
                )}
                
                {selectedEditor === 'template' && (
                  <TemplateGallery
                    onSelectTemplate={handleTemplateSelect}
                    onClose={() => setSelectedEditor('classic')}
                  />
                )}
                
                {!selectedEditor && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Please select an editor type to continue</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-medium text-foreground">
                  <Settings className="h-5 w-5" />
                  Publish Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-foreground">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      status: e.target.value as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' 
                    }))}
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="SCHEDULED">Scheduled</option>
                  </select>
                </div>
                
                {formData.status === 'SCHEDULED' && (
                  <div className="space-y-2">
                    <Label htmlFor="publishedAt" className="text-sm font-medium text-foreground">Publish Date</Label>
                    <Input
                      id="publishedAt"
                      type="datetime-local"
                      value={formData.publishedAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                      className="border-border bg-background text-foreground focus:border-primary"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-medium text-foreground">
                  <Tag className="h-5 w-5" />
                  Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium text-foreground">Select Category</Label>
                  <select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoadingCategories}
                  >
                    <option value="">
                      {isLoadingCategories ? 'Loading categories...' : 'Select a category'}
                    </option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-medium text-foreground">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newTag" className="text-sm font-medium text-foreground">Add Tag</Label>
                  <div className="flex gap-2">
                    <Input
                      id="newTag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Enter tag name..."
                      className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddTag} 
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Selected Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1 bg-muted text-muted-foreground">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-500 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Available Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags
                      .filter(tag => !formData.tags.includes(tag.name))
                      .map(tag => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="cursor-pointer border-border text-foreground hover:bg-muted/50 transition-colors"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            tags: [...prev.tags, tag.name] 
                          }))}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-medium text-foreground">
                  <Image className="h-5 w-5" />
                  Featured Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="featuredImage" className="text-sm font-medium text-foreground">Image URL</Label>
                  <Input
                    id="featuredImage"
                    value={formData.featuredImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
                
                {formData.featuredImage && (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={formData.featuredImage}
                      alt="Featured"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full border-border text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Image className="h-4 w-4 mr-2" />
                  Choose Image
                </Button>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-foreground">SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle" className="text-sm font-medium text-foreground">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                    placeholder="SEO optimized title..."
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="seoDescription" className="text-sm font-medium text-foreground">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                    placeholder="Meta description for search engines..."
                    rows={3}
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="seoKeywords" className="text-sm font-medium text-foreground">SEO Keywords</Label>
                  <Input
                    id="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoKeywords: e.target.value }))}
                    placeholder="keyword1, keyword2, keyword3"
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
