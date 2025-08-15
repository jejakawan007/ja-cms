'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  FolderOpen, 
  Tag,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatFileSize } from '@/lib/utils/media-utils';
import { MediaAdvancedService } from '@/lib/services/media-advanced-service';
import { useToast } from '@/hooks/useToast';


interface MediaCollection {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  totalSize: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export function MediaCollections() {
  const [collections, setCollections] = useState<MediaCollection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data until API is fully integrated
      const mockCollections: MediaCollection[] = [
        {
          id: '1',
          name: 'Product Images',
          description: 'All product-related images and photos',
          fileCount: 156,
          totalSize: 245 * 1024 * 1024, // 245 MB
          tags: ['products', 'ecommerce', 'marketing'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          name: 'Blog Media',
          description: 'Images and videos for blog posts',
          fileCount: 89,
          totalSize: 156 * 1024 * 1024, // 156 MB
          tags: ['blog', 'content', 'articles'],
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-14T15:20:00Z',
        },
        {
          id: '3',
          name: 'Social Media Assets',
          description: 'Graphics and videos for social media campaigns',
          fileCount: 234,
          totalSize: 567 * 1024 * 1024, // 567 MB
          tags: ['social', 'marketing', 'campaigns'],
          createdAt: '2024-01-10T00:00:00Z',
          updatedAt: '2024-01-15T09:15:00Z',
        },
      ];
      
      setCollections(mockCollections);
      
      // Real API call
      const response = await MediaAdvancedService.getCollections(1, 50, searchTerm);
      if (response.success && response.data) {
        const transformedCollections: MediaCollection[] = response.data.map(collection => ({
          id: collection.id,
          name: collection.name,
          description: collection.description || '',
          fileCount: collection.files?.length || 0,
          totalSize: collection.files?.reduce((sum, file) => sum + file.size, 0) || 0,
          tags: collection.tags || [],
          createdAt: collection.createdAt,
          updatedAt: collection.updatedAt,
        }));
        setCollections(transformedCollections);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collections');
      toast({
        title: "Error",
        description: "Failed to load collections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, toast]);

  // Load collections from API
  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );



  const handleCreateCollection = () => {
    // TODO: Implement create collection modal
    console.log('Create new collection');
    // For now, add a mock collection to demonstrate setCollections usage
    const newCollection: MediaCollection = {
      id: Date.now().toString(),
      name: 'New Collection',
      description: 'A newly created collection',
      fileCount: 0,
      totalSize: 0,
      tags: ['new'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCollections(prev => [...prev, newCollection]);
  };

  const handleEditCollection = (collectionId: string) => {
    // TODO: Implement edit collection
    console.log('Edit collection:', collectionId);
    // For now, just update the name to demonstrate setCollections usage
    setCollections(prev => prev.map(collection => 
      collection.id === collectionId 
        ? { ...collection, name: `${collection.name} (Edited)`, updatedAt: new Date().toISOString() }
        : collection
    ));
  };

  const handleDeleteCollection = (collectionId: string) => {
    // TODO: Implement delete collection with confirmation
    console.log('Delete collection:', collectionId);
    // For now, just remove the collection to demonstrate setCollections usage
    setCollections(prev => prev.filter(collection => collection.id !== collectionId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Collections</h2>
          <p className="text-muted-foreground">
            Organize your media files into collections and tag them for easy discovery
          </p>
        </div>
        <Button onClick={handleCreateCollection}>
          <Plus className="h-4 w-4 mr-2" />
          Create Collection
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search collections, descriptions, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-muted-foreground">Loading collections...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-destructive mb-2">Failed to load collections</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadCollections}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Collections Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection) => (
          <Card key={collection.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">{collection.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditCollection(collection.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Collection
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteCollection(collection.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Collection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-muted-foreground">
                {collection.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Files:</span>
                <span className="font-medium">{collection.fileCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Size:</span>
                <span className="font-medium">{formatFileSize(collection.totalSize)}</span>
              </div>
              
              {/* Tags */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {collection.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Files
                </Button>
                <Button variant="outline" size="sm">
                  Add Files
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCollections.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No collections found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'No collections match your search criteria.'
                : 'Create your first collection to organize your media files.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateCollection}>
                <Plus className="h-4 w-4 mr-2" />
                Create Collection
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
