'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Image, 
  Video, 
  FileText, 
  Music,
  Eye,
  Download,
  Star,
  Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { formatFileSize, getFileTypeIcon } from '@/lib/utils/media-utils';
import { MediaAdvancedService } from '@/lib/services/media-advanced-service';

interface SearchFilters {
  query: string;
  fileTypes: string[];
  dateRange: {
    start: string;
    end: string;
  };
  sizeRange: {
    min: number;
    max: number;
  };
  tags: string[];
  collections: string[];
  uploader: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface SearchResult {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  tags: string[];
  collection?: string;
  uploadedBy: string;
  createdAt: string;
  downloads: number;
  views: number;
  rating?: number;
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    filename: 'hero-image.jpg',
    originalName: 'hero-image.jpg',
    mimeType: 'image/jpeg',
    size: 245 * 1024, // 245 KB
    url: '/api/media/1',
    thumbnailUrl: '/api/media/1/thumbnail',
    alt: 'Hero image for homepage',
    caption: 'Beautiful landscape photography',
    tags: ['hero', 'landscape', 'homepage'],
    collection: 'Marketing Assets',
    uploadedBy: 'John Doe',
    createdAt: '2024-01-15T10:30:00Z',
    downloads: 45,
    views: 234,
    rating: 4.5,
  },
  {
    id: '2',
    filename: 'product-video.mp4',
    originalName: 'product-video.mp4',
    mimeType: 'video/mp4',
    size: 15 * 1024 * 1024, // 15 MB
    url: '/api/media/2',
    thumbnailUrl: '/api/media/2/thumbnail',
    alt: 'Product demonstration video',
    caption: 'How to use our latest product',
    tags: ['product', 'video', 'tutorial'],
    collection: 'Product Media',
    uploadedBy: 'Sarah Wilson',
    createdAt: '2024-01-14T15:20:00Z',
    downloads: 89,
    views: 567,
    rating: 4.8,
  },
];

export function MediaAdvancedSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    fileTypes: [],
    dateRange: { start: '', end: '' },
    sizeRange: { min: 0, max: 100 },
    tags: [],
    collections: [],
    uploader: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [searchResults, setSearchResults] = useState<SearchResult[]>(mockSearchResults);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileTypeOptions = [
    { value: 'image', label: 'Images', icon: Image },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'document', label: 'Documents', icon: FileText },
    { value: 'audio', label: 'Audio', icon: Music },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'updatedAt', label: 'Date Modified' },
    { value: 'filename', label: 'Filename' },
    { value: 'size', label: 'File Size' },
    { value: 'downloads', label: 'Downloads' },
    { value: 'views', label: 'Views' },
    { value: 'rating', label: 'Rating' },
  ];

  const handleSearch = async () => {
    setIsSearching(true);
    setError(null);
    
    try {
      // Real API call
      const response = await MediaAdvancedService.advancedSearch({
        query: filters.query,
        filters: {
          types: filters.fileTypes,
          sizeRange: filters.sizeRange,
          dateRange: filters.dateRange,
          tags: filters.tags,
          collections: filters.collections,
        },
        sort: {
          field: filters.sortBy,
          order: filters.sortOrder,
        },
        pagination: {
          page: 1,
          limit: 50,
        },
      });
      
      // Update search results
      if (response.success && response.data) {
        // TODO: Transform response to match SearchResult interface
        // setSearchResults(response.data);
      }
      setTimeout(() => {
        const filteredResults = mockSearchResults.filter(result => 
          result.originalName.toLowerCase().includes(filters.query.toLowerCase()) ||
          result.tags.some(tag => tag.toLowerCase().includes(filters.query.toLowerCase()))
        );
        setSearchResults(filteredResults);
        setIsSearching(false);
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform search');
      setIsSearching(false);
    }
  };

  const handleFileTypeChange = (type: string) => {
    setFilters(prev => ({
      ...prev,
      fileTypes: prev.fileTypes.includes(type)
        ? prev.fileTypes.filter(t => t !== type)
        : [...prev.fileTypes, type]
    }));
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Advanced Search</h2>
        <p className="text-muted-foreground">
          Find media files using advanced filters, AI-powered search, and metadata
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Query */}
              <div className="space-y-2">
                <Label htmlFor="search-query">Search Query</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="search-query"
                    placeholder="Search files, descriptions, tags..."
                    value={filters.query}
                    onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* File Types */}
              <div className="space-y-2">
                <Label>File Types</Label>
                <div className="space-y-2">
                  {fileTypeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.value}
                          checked={filters.fileTypes.includes(option.value)}
                          onCheckedChange={() => handleFileTypeChange(option.value)}
                        />
                        <Label htmlFor={option.value} className="flex items-center gap-2 text-sm">
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                  />
                  <Input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                  />
                </div>
              </div>

              {/* File Size Range */}
              <div className="space-y-2">
                <Label>File Size (MB)</Label>
                <Slider
                  value={[filters.sizeRange.min, filters.sizeRange.max]}
                  onValueChange={([min, max]) => setFilters(prev => ({ 
                    ...prev, 
                    sizeRange: { min: min || 0, max: max || 100 }
                  }))}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{filters.sizeRange.min} MB</span>
                  <span>{filters.sizeRange.max} MB</span>
                </div>
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value: 'asc' | 'desc') => setFilters(prev => ({ ...prev, sortOrder: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <Button 
                onClick={handleSearch} 
                disabled={isSearching}
                className="w-full"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Search Results</h3>
              <p className="text-sm text-muted-foreground">
                {isSearching ? 'Searching...' : `${searchResults.length} files found`}
              </p>
            </div>
            <Button variant="outline" size="sm" disabled={isSearching}>
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>

          {/* Loading State */}
          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-muted-foreground">Searching files...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isSearching && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-destructive mb-2">Search failed</p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSearch}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {!isSearching && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((result) => {
              const FileTypeIcon = getFileTypeIcon(result.mimeType);
              return (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <FileTypeIcon className="h-8 w-8 text-blue-500" />
                      {result.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{result.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <h4 className="font-medium mb-1 truncate">{result.originalName}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{formatFileSize(result.size)}</p>
                    
                    {result.caption && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {result.caption}
                      </p>
                    )}

                    {/* Tags */}
                    {result.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {result.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {result.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{result.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{result.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        <span>{result.downloads}</span>
                      </div>
                      <span>{new Date(result.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>
          )}

          {/* Empty State */}
          {!isSearching && !error && searchResults.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters to find more files.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
