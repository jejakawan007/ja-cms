'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderManager } from '@/components/media/FolderManager';
import { FolderPlus, FolderTree } from 'lucide-react';

export default function MediaFoldersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Folders</h1>
          <p className="text-muted-foreground">
            Organize your media files with folders and categories
          </p>
        </div>
        <Button>
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </Button>
      </div>

      {/* Folder Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Folder Tree */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5" />
                Folder Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FolderManager />
            </CardContent>
          </Card>
        </div>

        {/* Folder Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Folders</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Files</span>
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Storage Used</span>
                <span className="font-medium">2.4 GB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Storage Limit</span>
                <span className="font-medium">10 GB</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="font-medium">New folder created</p>
                <p className="text-muted-foreground">&ldquo;Product Photos&rdquo; - 2 minutes ago</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Files moved</p>
                <p className="text-muted-foreground">15 files to &ldquo;Hero Images&rdquo; - 1 hour ago</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Folder renamed</p>
                <p className="text-muted-foreground">&ldquo;Old Photos&rdquo; → &ldquo;Archive&rdquo; - 3 hours ago</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

