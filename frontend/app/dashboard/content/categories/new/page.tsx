'use client';


import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Save, 
  Folder,
  Settings,
  Lock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

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
}

export default function CreateCategoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Error boundary state
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Error boundary handler
  const handleError = (error: Error) => {
    console.error('Component error caught:', error);
    setHasError(true);
    setErrorMessage(error.message);
  };
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



  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      setIsAuthenticated(!!token);
      
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please login to access this page. You will be redirected to login page.',
          variant: 'destructive',
        });
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Authentication check failed'));
    }
  }, [router]);

  // Fetch parent categories
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const token = localStorage.getItem('ja-cms-token');
        if (!token) {
          setParentCategories([]);
          setIsLoadingCategories(false);
          return;
        }

        const response = await fetch('/api/categories/root', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            setParentCategories(data.data);
                  } else {
          setParentCategories([]);
        }
        } else if (response.status === 401) {
          // Don't show toast here to avoid infinite loop
          setParentCategories([]);
        } else {
          setParentCategories([]);
        }
      } catch (error) {
        setParentCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchParentCategories();
  }, []);

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

  const checkSlugAvailability = async (slug: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/categories/slug/${slug}`);

      // If response is 404, slug is available (not found)
      // If response is 200, slug already exists (found)
      const isAvailable = response.status === 404;
      
      return isAvailable;
    } catch (error) {
      return false;
    }
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
    setIsSubmitting(true);

    try {
      // Check authentication first
      const token = localStorage.getItem('ja-cms-token');
      
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please login to create categories. Redirecting to login page...',
          variant: 'destructive',
        });
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return;
      }

      // Client-side validation
      if (!formData.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Category name is required',
          variant: 'destructive',
        });
        return;
      }

      if (!formData.slug.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Category slug is required',
          variant: 'destructive',
        });
        return;
      }

      // Check if slug is available
      const isSlugAvailable = await checkSlugAvailability(formData.slug.trim());
      
      if (!isSlugAvailable) {
        toast({
          title: 'Slug Already Exists',
          description: 'A category with this slug already exists. Please choose a different slug.',
          variant: 'destructive',
        });
        return;
      }

      const requestBody = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description?.trim() || null,
        parentId: formData.parentId === "" ? null : formData.parentId,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
        metaTitle: formData.metaTitle?.trim() || formData.name.trim(),
        metaDescription: formData.metaDescription?.trim() || formData.description?.trim() || null
      };

      const response = await fetch('/api/categories', {
        method: 'POST',
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
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Category created successfully',
        });
        router.push('/dashboard/content/categories');
      } else {
        
        // Handle specific error cases
        if (response.status === 401) {
          toast({
            title: 'Authentication Error',
            description: 'Your session has expired. Please login again.',
            variant: 'destructive',
          });
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }
        
        // Show validation errors if available
        if (data.error?.details && Array.isArray(data.error.details)) {
          const validationErrors = data.error.details.map((err: any) => `${err.field}: ${err.message}`).join(', ');
          toast({
            title: 'Validation Error',
            description: validationErrors,
            variant: 'destructive',
          });
          return;
        }

        // Handle slug already exists error
        if (data.error?.message && data.error.message.includes('Slug kategori sudah ada')) {
          toast({
            title: 'Slug Already Exists',
            description: 'A category with this slug already exists. Please choose a different slug or let us generate one for you.',
            variant: 'destructive',
          });
          // Auto-generate new slug
          const newSlug = generateSlug(formData.name) + '-' + Date.now();
          setFormData(prev => ({
            ...prev,
            slug: newSlug
          }));
          return;
        }
        
        const errorMessage = data.error?.message || data.error?.details || data.message || 'Failed to create category';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create category',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    router.push('/dashboard/content/categories');
  };

  // Show error boundary
  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            {errorMessage || 'An unexpected error occurred. Please try again.'}
          </p>
          <div className="space-y-2">
            <Button onClick={() => window.location.reload()} className="w-full">
              Reload Page
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading or authentication message
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">
            You need to login to access this page. Redirecting to login page...
          </p>
          <Button onClick={() => router.push('/login')} className="w-full">
            Go to Login
          </Button>
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
            <h1 className="text-2xl font-semibold text-foreground">Create New Category</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add a new category to organize your content
            </p>
          </div>
        </div>
        <Button 
          type="submit"
          form="create-category-form"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Creating...' : 'Create Category'}
        </Button>
      </div>

      <form id="create-category-form" onSubmit={handleSubmit} className="space-y-6">
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
