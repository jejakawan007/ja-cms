'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Upload, 
  X, 
  Crop, 
  Download,
  ExternalLink,
  Eye
} from 'lucide-react';
import { MediaPicker } from './MediaPicker';
import { cn } from '@/lib/cn';

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  description?: string;
  uploadedBy: string;
  createdAt: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

interface FeaturedImagePickerProps {
  value?: MediaFile | null;
  onChange?: (media: MediaFile | null) => void;
  onAltChange?: (alt: string) => void;
  alt?: string;
  className?: string;
  required?: boolean;
  aspectRatio?: number; // width/height ratio
  maxWidth?: number;
  maxHeight?: number;
}

export function FeaturedImagePicker({
  value,
  onChange,
  onAltChange,
  alt = '',
  className,
  required = false,
  aspectRatio = 16/9,
  maxWidth = 1200,
  maxHeight = 675
}: FeaturedImagePickerProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleImageSelect = (files: MediaFile[]) => {
    if (files.length > 0) {
      onChange?.(files[0] || null);
    }
  };

  const handleRemoveImage = () => {
    onChange?.(null);
    onAltChange?.('');
  };

  const handleAltChange = (newAlt: string) => {
    onAltChange?.(newAlt);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Featured Image {required && <span className="text-red-500">*</span>}
        </Label>
        {value && (
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {value.dimensions?.width} × {value.dimensions?.height}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {formatFileSize(value.size)}
            </Badge>
          </div>
        )}
      </div>

      {!value ? (
        <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Image className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">No featured image</h3>
                <p className="text-sm text-muted-foreground">
                  Add a featured image to make your content more engaging
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <MediaPicker
                  onSelect={handleImageSelect}
                  multiple={false}
                  acceptedTypes={['image/*']}
                  trigger={
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Select Image
                    </Button>
                  }
                />
                <span className="text-xs text-muted-foreground">
                  or drag & drop
                </span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Recommended: {maxWidth}×{maxHeight}px ({aspectRatio}:1 ratio)</p>
                <p>Max file size: 5MB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <Card 
            className="overflow-hidden group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <CardContent className="p-0">
              <div className="relative">
                <div 
                  className="w-full bg-muted"
                  style={{ 
                    aspectRatio: `${aspectRatio}`,
                    maxHeight: `${maxHeight}px`
                  }}
                >
                  <img
                    src={value.url}
                    alt={value.alt || value.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Overlay Actions */}
                {isHovered && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-2">
                    <Button variant="secondary" size="sm">
                      <Crop className="h-4 w-4 mr-2" />
                      Crop
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Image Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Alt Text</Label>
              <Input
                placeholder="Describe this image for accessibility..."
                value={alt}
                onChange={(e) => handleAltChange(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Important for SEO and accessibility
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Image Details</Label>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">File:</span> {value.filename}</p>
                <p><span className="font-medium">Size:</span> {formatFileSize(value.size)}</p>
                <p><span className="font-medium">Dimensions:</span> {value.dimensions?.width} × {value.dimensions?.height}px</p>
                <p><span className="font-medium">Uploaded:</span> {new Date(value.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Crop className="h-4 w-4 mr-2" />
                Crop Image
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Original
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4 mr-2" />
              Remove Image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
