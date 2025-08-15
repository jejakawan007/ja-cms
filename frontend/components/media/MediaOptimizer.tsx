'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Settings, 
  Play,
  FileImage,
  Trash2,
  CheckCircle,
  Zap,
  BarChart3,
  Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatFileSize, getStatusIcon } from '@/lib/utils/media-utils';
import { MediaAdvancedService } from '@/lib/services/media-advanced-service';

interface OptimizationJob {
  id: string;
  fileName: string;
  originalSize: number;
  optimizedSize?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  savings?: number;
  quality?: number;
}

interface OptimizationPreset {
  id: string;
  name: string;
  description: string;
  quality: number;
  format: string;
  resize: boolean;
  maxWidth: number;
  maxHeight: number;
  compression: 'lossy' | 'lossless';
}

const mockPresets: OptimizationPreset[] = [
  {
    id: '1',
    name: 'Web Optimized',
    description: 'Best for web with good quality and small size',
    quality: 85,
    format: 'webp',
    resize: true,
    maxWidth: 1920,
    maxHeight: 1080,
    compression: 'lossy'
  },
  {
    id: '2',
    name: 'High Quality',
    description: 'Maintain high quality with moderate compression',
    quality: 95,
    format: 'jpg',
    resize: false,
    maxWidth: 0,
    maxHeight: 0,
    compression: 'lossy'
  },
  {
    id: '3',
    name: 'Lossless',
    description: 'No quality loss, larger file size',
    quality: 100,
    format: 'png',
    resize: false,
    maxWidth: 0,
    maxHeight: 0,
    compression: 'lossless'
  }
];

export function MediaOptimizer() {
  const [jobs, setJobs] = useState<OptimizationJob[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<OptimizationPreset | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Optimization settings
  const [settings, setSettings] = useState({
    quality: 85,
    format: 'webp',
    resize: true,
    maxWidth: 1920,
    maxHeight: 1080,
    compression: 'lossy' as 'lossy' | 'lossless',
    stripMetadata: true,
    progressive: true,
    interlaced: false,
  });

  const applyPreset = (preset: OptimizationPreset) => {
    setSelectedPreset(preset);
    setSettings(prev => ({
      ...prev,
      quality: preset.quality,
      format: preset.format,
      resize: preset.resize,
      maxWidth: preset.maxWidth,
      maxHeight: preset.maxHeight,
      compression: preset.compression,
    }));
  };

  const addOptimizationJob = (fileName: string, originalSize: number) => {
    const newJob: OptimizationJob = {
      id: Date.now().toString(),
      fileName,
      originalSize,
      status: 'pending',
      progress: 0,
    };
    setJobs(prev => [...prev, newJob]);
  };

  const startOptimization = async () => {
    if (jobs.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    setCurrentJobIndex(0);
    setOverallProgress(0);

    try {
      // Real API call
      const response = await MediaAdvancedService.optimizeBulk(
        jobs.map(job => job.id), // This would be actual media IDs
        {
          quality: settings.quality,
          format: settings.format as 'webp' | 'jpg' | 'png',
          resize: settings.resize,
          maxWidth: settings.maxWidth,
          maxHeight: settings.maxHeight,
        }
      );
      
      // TODO: Use response data for real processing
      console.log('Bulk optimization response:', response);
      
      // For now, simulate optimization
      for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        if (!job) continue;
        
        setCurrentJobIndex(i);
        
        // Update job status to processing
        setJobs(prev => prev.map(j => 
          j.id === job.id 
            ? { ...j, status: 'processing', progress: 0 }
            : j
        ));

        try {
          // Simulate optimization process
          await optimizeFile(job);
          
          // Calculate savings
          const optimizedSize = Math.floor(job.originalSize * (settings.quality / 100));
          const savings = job.originalSize - optimizedSize;
          
          // Update job status to completed
          setJobs(prev => prev.map(j => 
            j.id === job.id 
              ? { 
                  ...j, 
                  status: 'completed', 
                  progress: 100,
                  optimizedSize,
                  savings,
                  quality: settings.quality
                }
              : j
          ));
        } catch (error) {
          // Update job status to failed
          setJobs(prev => prev.map(j => 
            j.id === job.id 
              ? { 
                  ...j, 
                  status: 'failed', 
                  progress: 0,
                  error: error instanceof Error ? error.message : 'Unknown error'
                }
              : j
          ));
        }

        // Update overall progress
        const progress = ((i + 1) / jobs.length) * 100;
        setOverallProgress(progress);
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start optimization');
    } finally {
      setIsProcessing(false);
    }
  };

  const optimizeFile = async (job: OptimizationJob) => {
    // Simulate optimization with progress updates
    for (let progress = 0; progress <= 100; progress += 5) {
      setJobs(prev => prev.map(j => 
        j.id === job.id 
          ? { ...j, progress }
          : j
      ));
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  const removeJob = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const clearAll = () => {
    setJobs([]);
    setCurrentJobIndex(0);
    setOverallProgress(0);
  };



  const completedJobs = jobs.filter(j => j.status === 'completed').length;
  const failedJobs = jobs.filter(j => j.status === 'failed').length;
  const totalSavings = jobs
    .filter(j => j.savings)
    .reduce((sum, j) => sum + (j.savings || 0), 0);

  // Add some mock jobs for demonstration
  const addMockJobs = () => {
    const mockFiles = [
      { name: 'hero-image.jpg', size: 2.5 * 1024 * 1024 },
      { name: 'product-gallery.png', size: 1.8 * 1024 * 1024 },
      { name: 'banner-webp.webp', size: 3.2 * 1024 * 1024 },
    ];
    
    mockFiles.forEach(file => {
      addOptimizationJob(file.name, file.size);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Media Optimizer</h2>
          <p className="text-muted-foreground">
            Optimize your media files for better performance and smaller file sizes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={addMockJobs}
            disabled={isProcessing}
          >
            <FileImage className="h-4 w-4 mr-2" />
            Add Sample Files
          </Button>
          <Button
            onClick={startOptimization}
            disabled={jobs.length === 0 || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isProcessing ? 'Optimizing...' : 'Start Optimization'}
          </Button>
        </div>
      </div>

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
        {/* Optimization Settings */}
        <div className="space-y-4">
          {/* Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Optimization Presets
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
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {preset.quality}% quality
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {preset.format.toUpperCase()}
                        </Badge>
                      </div>
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
              <div className="space-y-2">
                <Label htmlFor="quality">Quality: {settings.quality}%</Label>
                <Slider
                  id="quality"
                  value={[settings.quality]}
                  onValueChange={([value]) => 
                    setSettings(prev => ({ ...prev, quality: value || 85 }))
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
                    <SelectItem value="webp">WebP (Best compression)</SelectItem>
                    <SelectItem value="jpg">JPEG (Widely supported)</SelectItem>
                    <SelectItem value="png">PNG (Lossless)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="compression">Compression Type</Label>
                <Select
                  value={settings.compression}
                  onValueChange={(value: 'lossy' | 'lossless') => 
                    setSettings(prev => ({ ...prev, compression: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lossy">Lossy (Smaller size)</SelectItem>
                    <SelectItem value="lossless">Lossless (No quality loss)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stripMetadata"
                  checked={settings.stripMetadata}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, stripMetadata: checked as boolean }))
                  }
                />
                <Label htmlFor="stripMetadata">Strip metadata</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="progressive"
                  checked={settings.progressive}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, progressive: checked as boolean }))
                  }
                />
                <Label htmlFor="progressive">Progressive loading</Label>
              </div>
            </CardContent>
          </Card>

          {/* Optimization Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Optimization Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Files processed:</span>
                <span className="font-medium">{completedJobs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total savings:</span>
                <span className="font-medium text-green-600">
                  {formatFileSize(totalSavings)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average reduction:</span>
                <span className="font-medium">
                  {completedJobs > 0 
                    ? Math.round((totalSavings / jobs.filter(j => j.originalSize).reduce((sum, j) => sum + j.originalSize, 0)) * 100)
                    : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List & Progress */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progress Overview */}
          {jobs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Optimization Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm">
                      {completedJobs} completed, {failedJobs} failed
                    </span>
                    {totalSavings > 0 && (
                      <Badge variant="secondary" className="text-green-600">
                        Saved {formatFileSize(totalSavings)}
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <Progress value={overallProgress} className="h-2" />
                
                {isProcessing && currentJobIndex < jobs.length && jobs[currentJobIndex] && (
                  <div className="text-sm text-muted-foreground">
                    Optimizing: {jobs[currentJobIndex]?.fileName}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Jobs List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Optimization Jobs ({jobs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No optimization jobs</h3>
                  <p className="text-muted-foreground mb-4">
                    Add files to start optimizing your media
                  </p>
                  <Button onClick={addMockJobs}>
                    <FileImage className="h-4 w-4 mr-2" />
                    Add Sample Files
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <FileImage className="h-4 w-4 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {job.fileName}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(job.originalSize)}
                            </span>
                            {getStatusIcon(job.status)}
                          </div>
                        </div>
                        
                        {job.status === 'processing' && (
                          <Progress value={job.progress} className="h-1 mt-1" />
                        )}
                        
                        {job.status === 'completed' && job.optimizedSize && job.savings && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {formatFileSize(job.optimizedSize)}
                            </Badge>
                            <span className="text-xs text-green-600">
                              -{Math.round((job.savings / job.originalSize) * 100)}%
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {job.quality}% quality
                            </span>
                          </div>
                        )}
                        
                        {job.status === 'failed' && job.error && (
                          <p className="text-xs text-red-600 mt-1">
                            {job.error}
                          </p>
                        )}
                      </div>
                      
                      {!isProcessing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeJob(job.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
