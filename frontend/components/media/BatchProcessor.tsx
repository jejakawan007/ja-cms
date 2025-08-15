'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Settings, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';

interface BatchJob {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalFiles: number;
  processedFiles: number;
  error?: string;
}

export default function BatchProcessor() {
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const startBatchProcessing = () => {
    setIsProcessing(true);
    // Batch processing logic here
  };

  const pauseProcessing = () => {
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Batch Media Processing
          </CardTitle>
          <CardDescription>
            Process multiple media files simultaneously with advanced options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={startBatchProcessing} disabled={isProcessing}>
              <Play className="h-4 w-4 mr-2" />
              Start Processing
            </Button>
            <Button variant="outline" onClick={pauseProcessing} disabled={!isProcessing}>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          </div>
          
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{job.name}</span>
                    <Badge variant={
                      job.status === 'completed' ? 'default' :
                      job.status === 'failed' ? 'destructive' :
                      job.status === 'processing' ? 'secondary' : 'outline'
                    }>
                      {job.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {job.processedFiles} / {job.totalFiles} files
                  </div>
                </div>
                <Progress value={job.progress} className="mb-2" />
                {job.error && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {job.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
