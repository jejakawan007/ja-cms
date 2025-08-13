'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Tag,
  FileText,
  TrendingUp,
  Activity
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TagStats {
  totalTags: number;
  activeTags: number;
  unusedTags: number;
  averagePostsPerTag: number;
}

export default function TagsTab() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<TagStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  });

  useEffect(() => {
    fetchTags();
    fetchTagStats();
  }, []);

  const fetchTags = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please login to access tags', variant: 'destructive' });
        return;
      }
      const response = await fetch('/api/tags', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTags(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast({ title: 'Error', description: 'Failed to fetch tags', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTagStats = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;
      const response = await fetch('/api/tags/stats', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching tag stats:', error);
    }
  };

  const handleCreateTag = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;
      
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({ title: 'Success', description: 'Tag created successfully' });
          setIsCreateDialogOpen(false);
          setFormData({ name: '', description: '', color: '#3b82f6' });
          fetchTags();
          fetchTagStats();
        }
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({ title: 'Error', description: 'Failed to create tag', variant: 'destructive' });
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag) return;
    
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;
      
      const response = await fetch(`/api/tags/${editingTag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({ title: 'Success', description: 'Tag updated successfully' });
          setIsEditDialogOpen(false);
          setEditingTag(null);
          setFormData({ name: '', description: '', color: '#3b82f6' });
          fetchTags();
          fetchTagStats();
        }
      }
    } catch (error) {
      console.error('Error updating tag:', error);
      toast({ title: 'Error', description: 'Failed to update tag', variant: 'destructive' });
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;
    
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;
      
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Tag deleted successfully' });
        fetchTags();
        fetchTagStats();
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({ title: 'Error', description: 'Failed to delete tag', variant: 'destructive' });
    }
  };

  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tag.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && tag.postCount > 0) ||
                         (filterStatus === 'unused' && tag.postCount === 0);
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading tags...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tag Management</h2>
          <p className="text-muted-foreground">Manage content tags and their relationships</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
              <DialogDescription>
                Add a new tag to organize your content
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tag-name">Tag Name</Label>
                <Input
                  id="tag-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter tag name"
                />
              </div>
              <div>
                <Label htmlFor="tag-description">Description</Label>
                <Input
                  id="tag-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter tag description"
                />
              </div>
              <div>
                <Label htmlFor="tag-color">Color</Label>
                <Input
                  id="tag-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTag}>Create Tag</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTags}</div>
              <p className="text-xs text-muted-foreground">
                All tags in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tags</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTags}</div>
              <p className="text-xs text-muted-foreground">
                Tags with posts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unused Tags</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unusedTags}</div>
              <p className="text-xs text-muted-foreground">
                Tags without posts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Posts/Tag</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averagePostsPerTag.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Average usage
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Tags</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="filter">Filter Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  <SelectItem value="active">Active Tags</SelectItem>
                  <SelectItem value="unused">Unused Tags</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tags ({filteredTags.length})</CardTitle>
          <CardDescription>
            Manage your content tags and their usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Posts</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: tag.color || '#3b82f6' }}
                      />
                      <span className="font-medium">{tag.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {tag.description || 'No description'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tag.postCount > 0 ? 'default' : 'secondary'}>
                      {tag.postCount} posts
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {new Date(tag.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingTag(tag);
                          setFormData({
                            name: tag.name,
                            description: tag.description || '',
                            color: tag.color || '#3b82f6'
                          });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTag(tag.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update tag information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-tag-name">Tag Name</Label>
              <Input
                id="edit-tag-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter tag name"
              />
            </div>
            <div>
              <Label htmlFor="edit-tag-description">Description</Label>
              <Input
                id="edit-tag-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter tag description"
              />
            </div>
            <div>
              <Label htmlFor="edit-tag-color">Color</Label>
              <Input
                id="edit-tag-color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTag}>Update Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
