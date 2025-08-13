'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MediaUpload } from '@/components/media/MediaUpload';

export default function MediaUploadPage() {
  const handleUploadComplete = (files: any[]) => {
    console.log('Upload completed:', files);
    // TODO: Redirect to library or show success message
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Media</h1>
        <p className="text-muted-foreground">
          Upload and manage your media files
        </p>
      </div>

      {/* Upload Component */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New Files</CardTitle>
        </CardHeader>
        <CardContent>
          <MediaUpload 
            onUploadComplete={handleUploadComplete}
            multiple={true}
            maxFiles={20}
            maxSize={50 * 1024 * 1024} // 50MB
          />
        </CardContent>
      </Card>

      {/* Upload Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Supported Formats</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Images: JPG, PNG, GIF, WebP, SVG</li>
                <li>• Videos: MP4, MOV, AVI, WebM</li>
                <li>• Documents: PDF, DOC, DOCX, PPT, PPTX</li>
                <li>• Audio: MP3, WAV, AAC, OGG</li>
                <li>• Archives: ZIP, RAR, 7Z</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">File Size Limits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Images: Up to 10MB</li>
                <li>• Videos: Up to 100MB</li>
                <li>• Documents: Up to 25MB</li>
                <li>• Audio: Up to 50MB</li>
                <li>• Archives: Up to 100MB</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Tips for Better Uploads</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use descriptive filenames for better organization</li>
              <li>• Optimize images before uploading for faster loading</li>
              <li>• Add alt text to images for accessibility</li>
              <li>• Organize files in folders for better management</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

