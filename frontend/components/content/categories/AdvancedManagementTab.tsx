'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { 
  FileText, 
  Download, 
  Upload, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Activity, 
  Plus, 
  Edit, 
  FolderOpen,
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CategoryTemplate {
  id: string;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  settings: any;
}

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  parentId?: string;
  _count: {
    posts: number;
    children: number;
  };
}

export default function AdvancedManagementTab() {
  const [templates, setTemplates] = useState<CategoryTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    isActive: true,
    settings: {
      allowPosts: true,
      allowSubcategories: true,
      requireApproval: false,
      autoPublish: true,
      seoOptimization: true,
      socialSharing: true
    }
  });

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoadingTemplates(true);
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please login to access Advanced Management features', variant: 'destructive' });
        return;
      }

      const response = await fetch('/api/category-templates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        toast({ title: 'Authentication Error', description: 'Please login again to continue', variant: 'destructive' });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTemplates(data.data);
        } else {
          throw new Error('Failed to fetch templates');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to fetch templates', variant: 'destructive' });
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplate = async () => {
    if (!templateForm.name.trim()) {
      toast({ title: 'Validation Error', description: 'Template name is required', variant: 'destructive' });
      return;
    }

    try {
      setIsCreatingTemplate(true);
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please login to access Advanced Management features', variant: 'destructive' });
        return;
      }

      const response = await fetch('/api/category-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(templateForm)
      });

      if (response.status === 401) {
        toast({ title: 'Authentication Error', description: 'Please login again to continue', variant: 'destructive' });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({ title: 'Success', description: 'Template created successfully' });
          setTemplateForm({
            name: '',
            description: '',
            isActive: true,
            settings: {
              allowPosts: true,
              allowSubcategories: true,
              requireApproval: false,
              autoPublish: true,
              seoOptimization: true,
              socialSharing: true
            }
          });
          fetchTemplates();
        } else {
          throw new Error(data.message || 'Failed to create template');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to create template', variant: 'destructive' });
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  const bulkDeleteCategories = async () => {
    if (selectedCategories.length === 0) {
      toast({ title: 'Selection Required', description: 'Please select categories to delete', variant: 'destructive' });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedCategories.length} categories? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsBulkProcessing(true);
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please login to access Advanced Management features', variant: 'destructive' });
        return;
      }

      const response = await fetch('/api/category-templates/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ categoryIds: selectedCategories })
      });

      if (response.status === 401) {
        toast({ title: 'Authentication Error', description: 'Please login again to continue', variant: 'destructive' });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({ title: 'Success', description: `${data.data.deleted} categories deleted successfully` });
          setSelectedCategories([]);
          fetchCategories();
        } else {
          throw new Error(data.message || 'Failed to delete categories');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete categories');
      }
    } catch (error) {
      console.error('Error deleting categories:', error);
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to delete categories', variant: 'destructive' });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const bulkToggleCategories = async (action: 'activate' | 'deactivate') => {
    if (selectedCategories.length === 0) {
      toast({ title: 'Selection Required', description: 'Please select categories to update', variant: 'destructive' });
      return;
    }

    try {
      setIsBulkProcessing(true);
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please login to access Advanced Management features', variant: 'destructive' });
        return;
      }

      const response = await fetch('/api/category-templates/bulk-toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          categoryIds: selectedCategories, 
          action 
        })
      });

      if (response.status === 401) {
        toast({ title: 'Authentication Error', description: 'Please login again to continue', variant: 'destructive' });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({ title: 'Success', description: `${data.data.updated} categories ${action}d successfully` });
          setSelectedCategories([]);
          fetchCategories();
        } else {
          throw new Error(data.message || `Failed to ${action} categories`);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${action} categories`);
      }
    } catch (error) {
      console.error(`Error ${action}ing categories:`, error);
      toast({ title: 'Error', description: error instanceof Error ? error.message : `Failed to ${action} categories`, variant: 'destructive' });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const exportCategories = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please login to access Advanced Management features', variant: 'destructive' });
        return;
      }

      const response = await fetch('/api/category-templates/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        toast({ title: 'Authentication Error', description: 'Please login again to continue', variant: 'destructive' });
        return;
      }

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'categories-export.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({ title: 'Success', description: 'Categories exported successfully' });
      } else {
        throw new Error('Failed to export categories');
      }
    } catch (error) {
      console.error('Error exporting categories:', error);
      toast({ title: 'Error', description: 'Failed to export categories', variant: 'destructive' });
    }
  };

  const handleCategorySelection = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(cat => cat.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Category Templates</span>
          </CardTitle>
          <CardDescription>
            Create and manage reusable category templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Create Template Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
            <div>
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                placeholder="Enter template name..."
                value={templateForm.name}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="templateDescription">Description</Label>
              <Input
                id="templateDescription"
                placeholder="Enter template description..."
                value={templateForm.description}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Button 
                onClick={createTemplate} 
                disabled={isCreatingTemplate || !templateForm.name.trim()}
                className="w-full"
              >
                {isCreatingTemplate ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Templates List */}
          {isLoadingTemplates ? (
            <div className="flex items-center justify-center h-32">
              <Activity className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading templates...</span>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No templates found</h3>
              <p className="text-sm text-muted-foreground">Create your first template to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground">{template.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Bulk Operations</span>
          </CardTitle>
          <CardDescription>
            Perform bulk operations on selected categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedCategories.length === categories.length ? 'Deselect All' : 'Select All'}
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedCategories.length} of {categories.length} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => bulkToggleCategories('activate')}
                disabled={isBulkProcessing || selectedCategories.length === 0}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => bulkToggleCategories('deactivate')}
                disabled={isBulkProcessing || selectedCategories.length === 0}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Deactivate
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={bulkDeleteCategories}
                disabled={isBulkProcessing || selectedCategories.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Categories List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Activity className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No categories found</h3>
              <p className="text-sm text-muted-foreground">Create some categories to get started</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategorySelection(category.id)}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {category._count.posts} posts • {category._count.children} subcategories
                    </div>
                  </div>
                  <Badge variant={category.isActive ? "default" : "secondary"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import/Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Import & Export</span>
          </CardTitle>
          <CardDescription>
            Import categories from CSV or export existing categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="importFile">Import Categories</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="importFile"
                  type="file"
                  accept=".csv"
                  className="flex-1"
                />
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload a CSV file with category data
              </p>
            </div>
            <div className="space-y-2">
              <Label>Export Categories</Label>
              <Button onClick={exportCategories} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
              <p className="text-xs text-muted-foreground">
                Download all categories as CSV file
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
