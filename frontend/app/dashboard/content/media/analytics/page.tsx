'use client';

import { MediaAnalytics } from '@/components/media/MediaAnalytics';

export default function MediaAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Media Analytics</h1>
        <p className="text-muted-foreground">
          Advanced analytics and insights for media management
        </p>
      </div>

      {/* Analytics Component */}
      <MediaAnalytics />
    </div>
  );
}
