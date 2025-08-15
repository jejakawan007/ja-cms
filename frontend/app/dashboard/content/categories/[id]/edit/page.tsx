'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Folder, 
  Settings
} from 'lucide-react';

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
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const categoryId = params['id'] as string;


  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    isActive: true,
    sortOrder: 0,
    metaTitle: '',
    metaDescription: ''
  });



  // Fetch category data
  const fetchCategory = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        setHasError(true);
        return;
      }

      const response = await fetch(`/api/categories/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setHasError(true);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setFormData({
          name: data.data.name || '',
          slug: data.data.slug || '',
          description: data.data.description || '',
          parentId: data.data.parentId || '',
          isActive: data.data.isActive ?? true,
          sortOrder: data.data.sortOrder || 0,
          metaTitle: data.data.metaTitle || '',
          metaDescription: data.data.metaDescription || ''
        });
      } else {
        throw new Error(data.message || 'Failed to fetch category');
      }
    } catch (error) {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch parent categories
  const fetchParentCategories = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          // Filter out current category and its children to prevent circular references
          const filteredCategories = data.data.filter((cat: Category) => 
            cat.id !== categoryId && cat.parentId !== categoryId
          );
          setParentCategories(filteredCategories);
        }
      }
    } catch (error) {
      // Error handling for parent categories
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategory();
    fetchParentCategories();
  }, [categoryId]);

  const generateSlug = (name: string) => {
    if (!name.trim()) return '';
    
    const slug = name
      .toLowerCase()
      .trim()
      // Replace special characters and spaces with hyphens
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      // Remove multiple consecutive hyphens
      .replace(/-+/g, '-')
      // Remove leading and trailing hyphens
      .replace(/^-+|-+$/g, '')
      // Limit length to 60 characters for SEO
      .substring(0, 60);
    
    return slug;
  };

  const generateMetaTitle = (name: string, parentName?: string) => {
    if (!name.trim()) return '';
    
    let title = name.trim();
    if (parentName && parentName.trim()) {
      title = `${name} - ${parentName}`;
    }
    
    // Limit to 60 characters for SEO
    return title.length > 60 ? title.substring(0, 57) + '...' : title;
  };

  const generateMetaDescription = (description: string, name: string) => {
    if (description && description.trim()) {
      // Use description if available, limit to 160 characters
      return description.length > 160 ? description.substring(0, 157) + '...' : description;
    }
    
    // Generate from name if no description
    const generatedDesc = `Explore ${name} category. Find related content, articles, and resources about ${name.toLowerCase()}.`;
    return generatedDesc.length > 160 ? generatedDesc.substring(0, 157) + '...' : generatedDesc;
  };

  const generateDescription = (name: string, parentName?: string) => {
    if (!name.trim()) return '';
    
    let description = `A comprehensive collection of ${name.toLowerCase()} content, articles, and resources.`;
    
    if (parentName && parentName.trim()) {
      description = `A curated selection of ${name.toLowerCase()} content within the ${parentName.toLowerCase()} category. Discover articles, guides, and resources related to ${name.toLowerCase()}.`;
    }
    
    return description;
  };

  const handleNameChange = (value: string) => {
    const newSlug = generateSlug(value);
    const selectedParent = parentCategories.find(cat => cat.id === formData.parentId);
    const parentName = selectedParent?.name;
    
    setFormData(prev => {
      const updatedData = {
        ...prev,
        name: value,
        slug: newSlug, // Always update slug when name changes
        description: generateDescription(value, parentName), // Always generate description
        metaTitle: generateMetaTitle(value, parentName), // Always generate meta title
        metaDescription: generateMetaDescription(generateDescription(value, parentName), value) // Always generate meta description
      };
      return updatedData;
    });
  };

  const handleParentChange = (value: string) => {
    const selectedParent = parentCategories.find(cat => cat.id === value);
    const parentName = selectedParent?.name;
    
    setFormData(prev => ({
      ...prev,
      parentId: value,
      description: generateDescription(prev.name, parentName), // Always regenerate description
      metaTitle: generateMetaTitle(prev.name, parentName), // Always regenerate meta title
      metaDescription: generateMetaDescription(generateDescription(prev.name, parentName), prev.name) // Always regenerate meta description
    }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      description: value,
      metaDescription: generateMetaDescription(value, prev.name) // Always generate meta description
    }));
  };

  // Auto-fill SEO fields when they are empty
  const handleMetaTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      metaTitle: value
    }));
  };

  const handleMetaDescriptionChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      metaDescription: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Category name is required',
        variant: 'destructive',
      });
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        console.error('No authentication token found');
        setHasError(true);
        return;
      }

      const requestBody = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || generateSlug(formData.name.trim()),
        description: formData.description?.trim() || null,
        parentId: formData.parentId === "" ? null : formData.parentId,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
        metaTitle: formData.metaTitle?.trim() || formData.name.trim(),
        metaDescription: formData.metaDescription?.trim() || formData.description?.trim() || null
      };

      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Invalid response from server');
      }

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Category updated successfully',
        });
        
        // Use setTimeout to ensure toast is displayed before navigation
        setTimeout(() => {
          router.push('/dashboard/content/categories');
        }, 100);
      } else {
        const errorMessage = data?.error?.message || data?.error?.details || data?.message || `HTTP ${response.status}`;
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update category',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        setHasError(true);
        return;
      }

      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Category deleted successfully',
        });
        
        setTimeout(() => {
          router.push('/dashboard/content/categories');
        }, 100);
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.message || 'Failed to delete category',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackClick = () => {
    try {
      router.push('/dashboard/content/categories');
    } catch (error) {
      window.location.href = '/dashboard/content/categories';
    }
  };

  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-destructive">Error</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Something went wrong. Please try again.
            </p>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              An error occurred while loading the category.
            </p>
            <Button 
              onClick={() => {
                setHasError(false);
                window.location.reload();
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Edit Category</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Loading category data...
            </p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <div className="h-6 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            Back to Categories
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Edit Category</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Update category information and settings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
            className="border-destructive text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
          <Button 
            type="submit"
            form="edit-category-form"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <form id="edit-category-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border border-border bg-card shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-lg font-medium mb-6">
                  <Folder className="h-5 w-5 text-muted-foreground" />
                  Basic Information
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-foreground">Category Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Enter category name..."
                      className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-border/80 transition-colors"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-medium text-foreground">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="category-slug"
                      className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-border/80 transition-colors"
                    />
                    <p className="text-xs text-muted-foreground">
                      The slug is used in the URL. Leave empty to auto-generate from the name.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-foreground">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleDescriptionChange(e.target.value)}
                      placeholder="Brief description of this category..."
                      rows={3}
                      className="resize-none border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-border/80 transition-colors"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Settings */}
            <Card className="border border-border bg-card shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-lg font-medium mb-6">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  Category Settings
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="parentId" className="text-sm font-medium text-foreground">Parent Category</Label>
                    <Select
                      value={formData.parentId || "none"}
                      onValueChange={(value) => {
                        handleParentChange(value === "none" ? "" : value);
                      }}
                      disabled={isLoadingCategories}
                    >
                      <SelectTrigger className="border-border bg-background text-foreground">
                        <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select parent category"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Parent (Root Category)</SelectItem>
                        {Array.isArray(parentCategories) && parentCategories.length > 0 && parentCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sortOrder" className="text-sm font-medium text-foreground">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                      className="border-border bg-background text-foreground focus:border-border/80 transition-colors"
                    />
                    <p className="text-xs text-muted-foreground">
                      Lower numbers appear first in lists.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="isActive" className="text-sm font-medium text-foreground">Status</Label>
                    <Select
                      value={formData.isActive ? "true" : "false"}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value === 'true' }))}
                    >
                      <SelectTrigger className="border-border bg-background text-foreground">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card className="border border-border bg-card shadow-sm">
              <CardContent className="p-6">
                <div className="text-lg font-medium mb-6">SEO Settings</div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle" className="text-sm font-medium text-foreground">SEO Title</Label>
                    <Input
                      id="metaTitle"
                      value={formData.metaTitle}
                      onChange={(e) => handleMetaTitleChange(e.target.value)}
                      placeholder="SEO optimized title..."
                      className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-border/80 transition-colors"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Recommended: 50-60 characters</span>
                      <span>{formData.metaTitle?.length || 0}/60</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="metaDescription" className="text-sm font-medium text-foreground">SEO Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={formData.metaDescription}
                      onChange={(e) => handleMetaDescriptionChange(e.target.value)}
                      placeholder="Meta description for search engines..."
                      rows={3}
                      className="resize-none border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-border/80 transition-colors"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Recommended: 150-160 characters</span>
                      <span>{formData.metaDescription?.length || 0}/160</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
