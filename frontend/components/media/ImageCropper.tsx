'use client';

import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Crop, 
  RotateCcw, 
  RotateCw, 
  ZoomIn, 
  ZoomOut,
  Download,
  X
} from 'lucide-react';
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

interface ImageCropperProps {
  image: MediaFile;
  onCrop?: (croppedImage: Blob) => void;
  onCancel?: () => void;
  trigger?: React.ReactNode;
  aspectRatio?: number;
  className?: string;
}

export function ImageCropper({
  image,
  onCrop,
  onCancel,
  trigger,
  aspectRatio = 16/9,
  className
}: ImageCropperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - rect.left - dragStart.x;
    const deltaY = e.clientY - rect.top - dragStart.y;
    
    setCropArea(prev => ({
      ...prev,
      x: Math.max(0, Math.min(100 - prev.width, prev.x + deltaX / rect.width * 100)),
      y: Math.max(0, Math.min(100 - prev.height, prev.y + deltaY / rect.height * 100))
    }));
    
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleRotate = (direction: 'left' | 'right') => {
    setRotation(prev => prev + (direction === 'left' ? -90 : 90));
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => {
      const newZoom = direction === 'in' ? prev * 1.1 : prev / 1.1;
      return Math.max(0.5, Math.min(3, newZoom));
    });
  };

  const handleCrop = async () => {
    if (!imageRef.current) return;

    try {
      // Create canvas for cropping
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = imageRef.current;
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      // Calculate crop dimensions
      const cropX = (cropArea.x / 100) * img.naturalWidth;
      const cropY = (cropArea.y / 100) * img.naturalHeight;
      const cropWidth = (cropArea.width / 100) * img.naturalWidth;
      const cropHeight = (cropArea.height / 100) * img.naturalHeight;

      // Set canvas size to crop area
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // Apply rotation and zoom
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Draw cropped image
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );

      ctx.restore();

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          onCrop?.(blob);
          setIsOpen(false);
        }
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const resetCrop = () => {
    setRotation(0);
    setZoom(1);
    setCropArea({ x: 0, y: 0, width: 100, height: 100 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Crop className="h-4 w-4 mr-2" />
            Crop Image
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRotate('left')}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRotate('right')}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleZoom('out')}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleZoom('in')}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={resetCrop}
              >
                Reset
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {aspectRatio}:1 ratio
              </Badge>
              <Button variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleCrop}>
                <Download className="h-4 w-4 mr-2" />
                Apply Crop
              </Button>
            </div>
          </div>

          {/* Image Cropper */}
          <div className="flex-1 p-4">
            <div 
              ref={containerRef}
              className="relative w-full h-full bg-black rounded-lg overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                ref={imageRef}
                src={image.url}
                alt={image.alt || image.filename}
                className="absolute inset-0 w-full h-full object-contain"
                style={{
                  transform: `rotate(${rotation}deg) scale(${zoom})`,
                  transformOrigin: 'center'
                }}
                draggable={false}
              />
              
              {/* Crop Overlay */}
              <div
                className="absolute border-2 border-white shadow-lg"
                style={{
                  left: `${cropArea.x}%`,
                  top: `${cropArea.y}%`,
                  width: `${cropArea.width}%`,
                  height: `${cropArea.height}%`,
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
              >
                {/* Corner Handles */}
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full cursor-nw-resize" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full cursor-ne-resize" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full cursor-sw-resize" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full cursor-se-resize" />
              </div>
              
              {/* Grid Lines */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/3 top-0 bottom-0 border-l border-white/30" />
                <div className="absolute left-2/3 top-0 bottom-0 border-l border-white/30" />
                <div className="absolute top-1/3 left-0 right-0 border-t border-white/30" />
                <div className="absolute top-2/3 left-0 right-0 border-t border-white/30" />
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="p-4 border-t bg-muted/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <Label className="text-xs font-medium">Original Size</Label>
                <p>{image.dimensions?.width} × {image.dimensions?.height}px</p>
              </div>
              <div>
                <Label className="text-xs font-medium">Crop Size</Label>
                <p>{Math.round((cropArea.width / 100) * (image.dimensions?.width || 0))} × {Math.round((cropArea.height / 100) * (image.dimensions?.height || 0))}px</p>
              </div>
              <div>
                <Label className="text-xs font-medium">Rotation</Label>
                <p>{rotation}°</p>
              </div>
              <div>
                <Label className="text-xs font-medium">Zoom</Label>
                <p>{Math.round(zoom * 100)}%</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
