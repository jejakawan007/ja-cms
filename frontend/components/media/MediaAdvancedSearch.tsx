'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Calendar, FileText, Image, Video } from 'lucide-react';

export default function MediaAdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    dateRange: '',
    size: '',
    tags: [] as string[]
  });

  const handleSearch = () => {
    // Search logic here
    console.log('Searching with:', { searchQuery, filters });
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      dateRange: '',
      size: '',
      tags: []
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Advanced Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search media files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
          <Badge variant="outline" className="cursor-pointer" onClick={clearFilters}>
            Clear All
            <X className="h-3 w-3 ml-1" />
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">File Type</label>
            <div className="flex gap-2">
              <Button
                variant={filters.type === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, type: 'image' }))}
              >
                <Image className="h-4 w-4 mr-1" />
                Images
              </Button>
              <Button
                variant={filters.type === 'video' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, type: 'video' }))}
              >
                <Video className="h-4 w-4 mr-1" />
                Videos
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Input
              type="date"
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
