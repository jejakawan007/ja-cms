'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Download, 
  RotateCw, 
  RotateCcw,
  Palette,
  Image as ImageIcon,
  Video,
  Undo,
  Redo,
  Save,
  X,
  Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MediaAdvancedService } from '@/lib/services/media-advanced-service';

interface EditHistory {
  id: string;
  action: string;
  timestamp: Date;
  data: any;
}

export function MediaEditor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [editHistory, setEditHistory] = useState<EditHistory[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Image editing states
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(100);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      resetEdits();
      
      // Load image to canvas for editing
      setTimeout(() => {
        loadImageToCanvas(url);
      }, 100);
    }
  };

  const loadImageToCanvas = (imageUrl: string) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageUrl;
  };

  const resetEdits = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setRotation(0);
    setScale(100);
    setEditHistory([]);
    setCurrentStep(-1);
  };

  const addToHistory = (action: string, data: any) => {
    const newStep: EditHistory = {
      id: Date.now().toString(),
      action,
      timestamp: new Date(),
      data
    };
    
    // Remove any steps after current position if we're not at the end
    const updatedHistory = editHistory.slice(0, currentStep + 1);
    updatedHistory.push(newStep);
    
    setEditHistory(updatedHistory);
    setCurrentStep(updatedHistory.length - 1);
  };

  const undo = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // TODO: Apply previous state
    }
  };

  const redo = () => {
    if (currentStep < editHistory.length - 1) {
      setCurrentStep(currentStep + 1);
      // TODO: Apply next state
    }
  };

  const applyFilters = () => {
    if (!canvasRef.current || !previewUrl) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Apply filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
      ctx.drawImage(img, 0, 0);
      
      addToHistory('filters', { brightness, contrast, saturation, blur });
    };
    img.src = previewUrl;
  };

  // Apply filters when values change
  useEffect(() => {
    if (selectedFile && fileType === 'image') {
      applyFilters();
    }
  }, [brightness, contrast, saturation, blur, rotation, scale]);

  const rotateImage = (direction: 'left' | 'right') => {
    const newRotation = direction === 'left' ? rotation - 90 : rotation + 90;
    setRotation(newRotation);
    addToHistory('rotation', { rotation: newRotation });
  };

  const saveImage = async () => {
    if (!canvasRef.current || !selectedFile) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const canvas = canvasRef.current;
      
      // Convert canvas to blob with current filters applied
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to convert canvas to blob'));
        }, 'image/png', 0.9);
      });
      
      // Create file from blob
      const editedFile = new File([blob], selectedFile.name, { type: 'image/png' });
      
      try {
        // Real API call (optional - can be skipped for now)
        const response = await MediaAdvancedService.optimizeMedia(
          'temp-id', // This would be the actual media ID
          {
            quality: 90,
            format: 'png',
          }
        );
        
        console.log('Optimization response:', response);
      } catch (apiError) {
        // If API call fails, continue with local download
        console.warn('API optimization failed, proceeding with local download:', apiError);
      }
      
      // Download the edited file
      const link = document.createElement('a');
      link.download = `edited_${selectedFile.name}`;
      link.href = URL.createObjectURL(editedFile);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(link.href);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save image');
      console.error('Failed to save image:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getFileType = () => {
    if (!selectedFile) return null;
    return selectedFile.type.startsWith('image/') ? 'image' : 'video';
  };

  const fileType = getFileType();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Media Editor</h2>
          <p className="text-muted-foreground">
            Edit and enhance your media files with professional tools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSaving}
          >
            <Upload className="h-4 w-4 mr-2" />
            Select File
          </Button>
          <Button
            onClick={saveImage}
            disabled={!selectedFile || isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <X className="h-4 w-4" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedFile ? (
        /* Upload Area */
        <Card className="border-2 border-dashed border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No file selected</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Select an image or video file to start editing
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Editor Interface */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview Area */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {fileType === 'image' ? (
                      <ImageIcon className="h-5 w-5" />
                    ) : (
                      <Video className="h-5 w-5" />
                    )}
                    Preview
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {selectedFile.name}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                        resetEdits();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-muted rounded-lg overflow-hidden min-h-96 flex items-center justify-center">
                  {fileType === 'image' ? (
                    <canvas
                      ref={canvasRef}
                      className="max-w-full max-h-96 object-contain border border-border rounded"
                      style={{
                        filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`,
                        transform: `rotate(${rotation}deg) scale(${scale / 100})`
                      }}
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* History Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Edit History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={undo}
                    disabled={currentStep <= 0}
                  >
                    <Undo className="h-4 w-4 mr-2" />
                    Undo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={redo}
                    disabled={currentStep >= editHistory.length - 1}
                  >
                    <Redo className="h-4 w-4 mr-2" />
                    Redo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetEdits}
                  >
                    Reset
                  </Button>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {editHistory.length} changes made
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tools Panel */}
          <div className="space-y-4">
            {/* Transform Tools */}
            <Card>
              <CardHeader>
                <CardTitle>Transform</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rotateImage('left')}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rotateImage('right')}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="scale">Scale: {scale}%</Label>
                  <Slider
                    id="scale"
                    value={[scale]}
                    onValueChange={([value]) => setScale(value || 100)}
                    min={10}
                    max={200}
                    step={1}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brightness">Brightness: {brightness}%</Label>
                  <Slider
                    id="brightness"
                    value={[brightness]}
                    onValueChange={([value]) => setBrightness(value || 100)}
                    min={0}
                    max={200}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contrast">Contrast: {contrast}%</Label>
                  <Slider
                    id="contrast"
                    value={[contrast]}
                    onValueChange={([value]) => setContrast(value || 100)}
                    min={0}
                    max={200}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saturation">Saturation: {saturation}%</Label>
                  <Slider
                    id="saturation"
                    value={[saturation]}
                    onValueChange={([value]) => setSaturation(value || 100)}
                    min={0}
                    max={200}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blur">Blur: {blur}px</Label>
                  <Slider
                    id="blur"
                    value={[blur]}
                    onValueChange={([value]) => setBlur(value || 0)}
                    min={0}
                    max={20}
                    step={0.5}
                  />
                </div>

                <Button
                  onClick={applyFilters}
                  className="w-full"
                  disabled={fileType !== 'image'}
                >
                  Apply Filters
                </Button>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Format</Label>
                  <Select defaultValue="png">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpg">JPEG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quality">Quality</Label>
                  <Slider
                    id="quality"
                    defaultValue={[90]}
                    min={1}
                    max={100}
                    step={1}
                  />
                </div>

                <Button
                  onClick={saveImage}
                  className="w-full"
                  disabled={!selectedFile || isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
