'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface MediaLoadingStateProps {
  viewMode: 'card' | 'grid' | 'list';
  count?: number;
}

export function MediaLoadingState({ viewMode, count = 12 }: MediaLoadingStateProps) {
  const renderCardSkeleton = () => (
    <Card className="overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderGridSkeleton = () => (
    <div className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center">
      <Skeleton className="h-8 w-8 rounded" />
    </div>
  );

  const renderListSkeleton = () => (
    <div className="flex items-center space-x-4 p-4 border border-border rounded-lg">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );

  const renderSkeleton = () => {
    switch (viewMode) {
      case 'card':
        return renderCardSkeleton();
      case 'grid':
        return renderGridSkeleton();
      case 'list':
        return renderListSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Loading */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      {/* Content Loading */}
      {viewMode === 'list' ? (
        <div className="space-y-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i}>{renderSkeleton()}</div>
          ))}
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'card' 
            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8'
            : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12'
        }`}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i}>{renderSkeleton()}</div>
          ))}
        </div>
      )}

      {/* Loading Indicator */}
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading media files...</span>
        </div>
      </div>
    </div>
  );
}
