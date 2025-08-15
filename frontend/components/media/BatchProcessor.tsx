'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Upload, 
  Play,
  Pause,
  Square,
  Settings,
  Trash2,
  CheckCircle,
  Zap,
  Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatFileSize, getFileTypeIcon, getStatusIcon } from '@/lib/utils/media-utils';
import { MediaAdvancedService } from '@/lib/services/media-advanced-service';

interface BatchFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  progress: number;
  error?: string;
  result?: {
    originalSize: number;
    newSize: number;
    savedSpace: number;
    url?: string;
  };
}

interface BatchPreset {
  id: string;
  name: string;
  description: string;
  settings: {
    resize: boolean;
    maxWidth: number;
    maxHeight: number;
    quality: number;
    format: string;
    optimize: boolean;
    watermark: boolean;
  };
}

const mockPresets: BatchPreset[] = [
  {
    id: '1',
    name: 'Web Optimization',
    description: 'Optimize images for web with 80% quality and max 1920px width',
    settings: {
      resize: true,
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 80,
      format: 'webp',
      optimize: true,
      watermark: false,
    }
  },
  {
    id: '2',
    name: 'Thumbnail Generation',
    description: 'Create thumbnails with 300px max dimension',
    settings: {
      resize: true,
      maxWidth: 300,
      maxHeight: 300,
      quality: 70,
      format: 'jpg',
      optimize: true,
      watermark: false,
    }
  },
  {
    id: '3',
    name: 'High Quality',
    description: 'Maintain high quality with minimal compression',
    settings: {
      resize: false,
      maxWidth: 0,
      maxHeight: 0,
      quality: 95,
      format: 'png',
      optimize: false,
      watermark: false,
    }
  }
];

export function BatchProcessor() {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<BatchPreset | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Processing settings
  const [settings, setSettings] = useState({
    resize: false,
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 80,
    format: 'webp',
    optimize: true,
    watermark: false,
    outputFolder: 'processed',
    overwrite: false,
    createBackup: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const newBatchFiles: BatchFile[] = selectedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0,
    }));
    
    setFiles(prev => [...prev, ...newBatchFiles]);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const clearAll = () => {
    setFiles([]);
    setCurrentFileIndex(0);
    setOverallProgress(0);
  };

  const applyPreset = (preset: BatchPreset) => {
    setSelectedPreset(preset);
    setSettings(prev => ({
      ...prev,
      ...preset.settings,
    }));
  };

  const startProcessing = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    setCurrentFileIndex(0);
    setOverallProgress(0);

    try {
      // Real API call
      const response = await MediaAdvancedService.uploadBatchFiles(
        files.map(f => f.file),
        {
          ...settings,
          preset: selectedPreset?.name || 'custom',
        }
      );
      
      // TODO: Use response data for real processing
      console.log('Batch upload response:', response);
      
      // For now, simulate processing
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;
        
        setCurrentFileIndex(i);
        
        // Update file status to processing
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'processing', progress: 0 }
            : f
        ));

        try {
          // Simulate processing
          await processFile(file, i);
          
          // Update file status to completed
          setFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { 
                  ...f, 
                  status: 'completed', 
                  progress: 100,
                  result: {
                    originalSize: file.size,
                    newSize: Math.floor(file.size * 0.7), // Simulate 30% reduction
                    savedSpace: Math.floor(file.size * 0.3),
                  }
                }
              : f
          ));
        } catch (error) {
          // Update file status to failed
          setFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { 
                  ...f, 
                  status: 'failed', 
                  progress: 0,
                  error: error instanceof Error ? error.message : 'Unknown error'
                }
              : f
          ));
        }

        // Update overall progress
        const progress = ((i + 1) / files.length) * 100;
        setOverallProgress(progress);
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start batch processing');
    } finally {
      setIsProcessing(false);
    }
  };

  const processFile = async (file: BatchFile, _index: number) => {
    // Simulate file processing with progress updates
    for (let progress = 0; progress <= 100; progress += 10) {
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, progress }
          : f
      ));
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const pauseProcessing = () => {
    setIsProcessing(false);
  };

  const stopProcessing = () => {
    setIsProcessing(false);
    setCurrentFileIndex(0);
    setOverallProgress(0);
    setFiles(prev => prev.map(f => 
      f.status === 'processing' 
        ? { ...f, status: 'pending', progress: 0 }
        : f
    ));
  };

  const completedFiles = files.filter(f => f.status === 'completed').length;
  const failedFiles = files.filter(f => f.status === 'failed').length;
  const totalSavedSpace = files
    .filter(f => f.result)
    .reduce((sum, f) => sum + (f.result?.savedSpace || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Batch Processor</h2>
          <p className="text-muted-foreground">
            Process multiple files simultaneously with automated workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            <Upload className="h-4 w-4 mr-2" />
            Add Files
          </Button>
          <Button
            onClick={startProcessing}
            disabled={files.length === 0 || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isProcessing ? 'Processing...' : 'Start Processing'}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-4 w-4" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Processing Settings */}
        <div className="space-y-4">
          {/* Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Processing Presets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockPresets.map((preset) => (
                <div
                  key={preset.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPreset?.id === preset.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => applyPreset(preset)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{preset.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {preset.description}
                      </p>
                    </div>
                    {selectedPreset?.id === preset.id && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Custom Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Custom Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="resize"
                  checked={settings.resize}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, resize: checked as boolean }))
                  }
                />
                <Label htmlFor="resize">Resize images</Label>
              </div>

              {settings.resize && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxWidth">Max Width (px)</Label>
                    <Input
                      id="maxWidth"
                      type="number"
                      value={settings.maxWidth}
                      onChange={(e) => 
                        setSettings(prev => ({ ...prev, maxWidth: parseInt(e.target.value) }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxHeight">Max Height (px)</Label>
                    <Input
                      id="maxHeight"
                      type="number"
                      value={settings.maxHeight}
                      onChange={(e) => 
                        setSettings(prev => ({ ...prev, maxHeight: parseInt(e.target.value) }))
                      }
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="quality">Quality: {settings.quality}%</Label>
                <Slider
                  id="quality"
                  value={[settings.quality]}
                  onValueChange={([value]) => 
                    setSettings(prev => ({ ...prev, quality: value || 80 }))
                  }
                  min={1}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Output Format</Label>
                <Select
                  value={settings.format}
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, format: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webp">WebP</SelectItem>
                    <SelectItem value="jpg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="optimize"
                  checked={settings.optimize}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, optimize: checked as boolean }))
                  }
                />
                <Label htmlFor="optimize">Optimize for web</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* File List & Progress */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progress Overview */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Processing Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm">
                      {completedFiles} completed, {failedFiles} failed
                    </span>
                    {totalSavedSpace > 0 && (
                      <Badge variant="secondary">
                        Saved {formatFileSize(totalSavedSpace)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isProcessing ? (
                      <>
                        <Button variant="outline" size="sm" onClick={pauseProcessing}>
                          <Pause className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={stopProcessing}>
                          <Square className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" onClick={clearAll}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <Progress value={overallProgress} className="h-2" />
                
                {isProcessing && currentFileIndex < files.length && files[currentFileIndex] && (
                  <div className="text-sm text-muted-foreground">
                    Processing: {files[currentFileIndex]?.name}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* File List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Files ({files.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <div className="text-center py-8">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No files added</h3>
                  <p className="text-muted-foreground mb-4">
                    Add files to start batch processing
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Add Files
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {files.map((file) => {
                    const FileTypeIcon = getFileTypeIcon(file.type);
                    return (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <FileTypeIcon className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">
                              {file.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </span>
                              {getStatusIcon(file.status)}
                            </div>
                          </div>
                          
                          {file.status === 'processing' && (
                            <Progress value={file.progress} className="h-1 mt-1" />
                          )}
                          
                          {file.status === 'completed' && file.result && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {formatFileSize(file.result.newSize)}
                              </Badge>
                              <span className="text-xs text-green-600">
                                -{Math.round((file.result.savedSpace / file.size) * 100)}%
                              </span>
                            </div>
                          )}
                          
                          {file.status === 'failed' && file.error && (
                            <p className="text-xs text-red-600 mt-1">
                              {file.error}
                            </p>
                          )}
                        </div>
                        
                        {!isProcessing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
