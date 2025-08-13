# ⬆️ Media Upload System

> **Advanced File Upload & Processing JA-CMS**  
> Modern upload system dengan drag-drop, bulk processing, dan real-time progress

---

## 📋 **Deskripsi**

Media Upload System menyediakan interface yang modern dan powerful untuk mengupload berbagai jenis file media. Sistem ini mendukung drag-drop, bulk upload, resume upload, real-time progress tracking, dan automatic processing dengan validation yang comprehensive.

---

## ⭐ **Core Features**

### **1. 📤 Advanced Upload Interface**

#### **Upload Methods:**
```typescript
interface UploadMethod {
  dragDrop: {
    enabled: boolean;
    dropZone: string;
    highlightOnDrag: boolean;
    acceptMultiple: boolean;
  };
  filePicker: {
    enabled: boolean;
    acceptMultiple: boolean;
    directoryUpload: boolean;
  };
  urlImport: {
    enabled: boolean;
    supportedProtocols: string[];
    bulkImport: boolean;
  };
  clipboard: {
    enabled: boolean;
    pasteImages: boolean;
    pasteFiles: boolean;
  };
}

interface UploadConfig {
  maxFileSize: number; // bytes
  maxTotalSize: number; // bytes for bulk upload
  maxFiles: number;
  allowedTypes: string[];
  blockedTypes: string[];
  chunkSize: number; // for chunked upload
  concurrent: number; // simultaneous uploads
  autoStart: boolean;
  autoRetry: boolean;
  retryAttempts: number;
  timeout: number; // milliseconds
}

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'queued' | 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  uploadedBytes: number;
  totalBytes: number;
  speed: number; // bytes per second
  timeRemaining: number; // seconds
  error?: string;
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    thumbnail?: string;
  };
  chunks?: UploadChunk[];
}

interface UploadChunk {
  index: number;
  start: number;
  end: number;
  size: number;
  uploaded: boolean;
  retries: number;
}
```

#### **Upload Service:**
```typescript
export class MediaUploadService {
  private uploadQueue: UploadFile[] = [];
  private activeUploads: Map<string, AbortController> = new Map();
  private config: UploadConfig;
  private eventEmitter: EventEmitter;

  constructor(config: UploadConfig) {
    this.config = config;
    this.eventEmitter = new EventEmitter();
    this.setupEventHandlers();
  }

  async addFiles(files: FileList | File[]): Promise<UploadFile[]> {
    const uploadFiles: UploadFile[] = [];
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      // Validate file
      const validation = await this.validateFile(file);
      if (!validation.valid) {
        this.emit('fileRejected', { file, errors: validation.errors });
        continue;
      }

      // Check for duplicates
      const duplicate = await this.checkDuplicate(file);
      if (duplicate && !this.config.allowDuplicates) {
        this.emit('duplicateDetected', { file, existing: duplicate });
        continue;
      }

      // Create upload file
      const uploadFile: UploadFile = {
        id: this.generateFileId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'queued',
        progress: 0,
        uploadedBytes: 0,
        totalBytes: file.size,
        speed: 0,
        timeRemaining: 0,
        metadata: await this.extractMetadata(file),
        chunks: this.config.chunkSize ? this.createChunks(file) : undefined
      };

      uploadFiles.push(uploadFile);
      this.uploadQueue.push(uploadFile);
    }

    // Auto-start if enabled
    if (this.config.autoStart && uploadFiles.length > 0) {
      this.startQueue();
    }

    return uploadFiles;
  }

  async startQueue(): Promise<void> {
    const queuedFiles = this.uploadQueue.filter(f => f.status === 'queued');
    const activeCount = this.activeUploads.size;
    const availableSlots = this.config.concurrent - activeCount;

    if (availableSlots <= 0 || queuedFiles.length === 0) {
      return;
    }

    // Start uploads up to concurrent limit
    const filesToStart = queuedFiles.slice(0, availableSlots);
    
    for (const file of filesToStart) {
      this.startFileUpload(file);
    }
  }

  private async startFileUpload(uploadFile: UploadFile): Promise<void> {
    uploadFile.status = 'uploading';
    const abortController = new AbortController();
    this.activeUploads.set(uploadFile.id, abortController);

    try {
      // Pre-upload processing
      await this.preProcessFile(uploadFile);

      // Upload file
      if (uploadFile.chunks) {
        await this.uploadChunked(uploadFile, abortController.signal);
      } else {
        await this.uploadDirect(uploadFile, abortController.signal);
      }

      // Post-upload processing
      await this.postProcessFile(uploadFile);

      uploadFile.status = 'completed';
      uploadFile.progress = 100;
      this.emit('fileCompleted', uploadFile);

    } catch (error) {
      if (error.name === 'AbortError') {
        uploadFile.status = 'cancelled';
        this.emit('fileCancelled', uploadFile);
      } else {
        uploadFile.status = 'failed';
        uploadFile.error = error.message;
        
        // Retry if configured
        if (this.config.autoRetry && uploadFile.retries < this.config.retryAttempts) {
          uploadFile.retries = (uploadFile.retries || 0) + 1;
          uploadFile.status = 'queued';
          setTimeout(() => this.startFileUpload(uploadFile), 2000 * uploadFile.retries);
        } else {
          this.emit('fileFailed', uploadFile);
        }
      }
    } finally {
      this.activeUploads.delete(uploadFile.id);
      
      // Continue with next files in queue
      setTimeout(() => this.startQueue(), 100);
    }
  }

  private async uploadDirect(uploadFile: UploadFile, signal: AbortSignal): Promise<void> {
    const formData = new FormData();
    formData.append('file', uploadFile.file);
    formData.append('metadata', JSON.stringify({
      originalName: uploadFile.name,
      folder: this.getCurrentFolder(),
      tags: this.getCurrentTags(),
      alt: '',
      title: uploadFile.name,
      description: ''
    }));

    const xhr = new XMLHttpRequest();
    
    // Setup progress tracking
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        uploadFile.progress = (event.loaded / event.total) * 100;
        uploadFile.uploadedBytes = event.loaded;
        
        // Calculate speed and time remaining
        const now = Date.now();
        if (uploadFile.startTime) {
          const elapsed = (now - uploadFile.startTime) / 1000;
          uploadFile.speed = event.loaded / elapsed;
          uploadFile.timeRemaining = uploadFile.speed > 0 ? 
            (event.total - event.loaded) / uploadFile.speed : 0;
        }
        
        this.emit('fileProgress', uploadFile);
      }
    });

    // Setup abort handling
    signal.addEventListener('abort', () => {
      xhr.abort();
    });

    return new Promise((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          uploadFile.metadata = { ...uploadFile.metadata, ...response };
          resolve();
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.ontimeout = () => reject(new Error('Upload timeout'));

      uploadFile.startTime = Date.now();
      xhr.timeout = this.config.timeout;
      xhr.open('POST', '/api/media/upload');
      xhr.send(formData);
    });
  }

  private async uploadChunked(uploadFile: UploadFile, signal: AbortSignal): Promise<void> {
    const chunks = uploadFile.chunks!;
    const uploadId = await this.initializeChunkedUpload(uploadFile);

    // Upload chunks in parallel (with concurrency limit)
    const chunkQueue = [...chunks];
    const activeChunks = new Set<number>();
    const maxConcurrentChunks = Math.min(3, chunks.length);

    return new Promise(async (resolve, reject) => {
      const uploadNextChunk = async () => {
        if (chunkQueue.length === 0 && activeChunks.size === 0) {
          // All chunks uploaded, finalize
          try {
            await this.finalizeChunkedUpload(uploadId, uploadFile);
            resolve();
          } catch (error) {
            reject(error);
          }
          return;
        }

        if (chunkQueue.length === 0 || activeChunks.size >= maxConcurrentChunks) {
          return;
        }

        const chunk = chunkQueue.shift()!;
        activeChunks.add(chunk.index);

        try {
          await this.uploadChunk(uploadId, chunk, uploadFile, signal);
          chunk.uploaded = true;
          
          // Update overall progress
          const uploadedChunks = chunks.filter(c => c.uploaded).length;
          uploadFile.progress = (uploadedChunks / chunks.length) * 100;
          this.emit('fileProgress', uploadFile);

        } catch (error) {
          chunk.retries++;
          if (chunk.retries < 3) {
            chunkQueue.push(chunk); // Retry
          } else {
            reject(error);
            return;
          }
        } finally {
          activeChunks.delete(chunk.index);
          uploadNextChunk();
        }
      };

      // Start initial chunks
      for (let i = 0; i < maxConcurrentChunks; i++) {
        uploadNextChunk();
      }
    });
  }

  private createChunks(file: File): UploadChunk[] {
    const chunks: UploadChunk[] = [];
    const chunkSize = this.config.chunkSize;
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      
      chunks.push({
        index: i,
        start,
        end,
        size: end - start,
        uploaded: false,
        retries: 0
      });
    }

    return chunks;
  }

  private async validateFile(file: File): Promise<ValidationResult> {
    const errors: string[] = [];

    // Check file size
    if (file.size > this.config.maxFileSize) {
      errors.push(`File too large. Maximum size: ${this.formatFileSize(this.config.maxFileSize)}`);
    }

    // Check file type
    if (this.config.allowedTypes.length > 0) {
      const isAllowed = this.config.allowedTypes.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.replace('*', ''));
        }
        return file.type === type;
      });

      if (!isAllowed) {
        errors.push(`File type not allowed: ${file.type}`);
      }
    }

    // Check blocked types
    if (this.config.blockedTypes.includes(file.type)) {
      errors.push(`File type blocked: ${file.type}`);
    }

    // Security scan
    const securityCheck = await this.performSecurityScan(file);
    if (!securityCheck.safe) {
      errors.push('File failed security scan');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private async extractMetadata(file: File): Promise<Record<string, any>> {
    const metadata: Record<string, any> = {};

    if (file.type.startsWith('image/')) {
      const dimensions = await this.getImageDimensions(file);
      metadata.width = dimensions.width;
      metadata.height = dimensions.height;
      
      // Generate thumbnail
      metadata.thumbnail = await this.generateThumbnail(file);
    } else if (file.type.startsWith('video/')) {
      const videoMetadata = await this.getVideoMetadata(file);
      metadata.duration = videoMetadata.duration;
      metadata.width = videoMetadata.width;
      metadata.height = videoMetadata.height;
      metadata.thumbnail = await this.generateVideoThumbnail(file);
    } else if (file.type.startsWith('audio/')) {
      const audioMetadata = await this.getAudioMetadata(file);
      metadata.duration = audioMetadata.duration;
      metadata.bitrate = audioMetadata.bitrate;
      metadata.sampleRate = audioMetadata.sampleRate;
    }

    return metadata;
  }

  private async checkDuplicate(file: File): Promise<MediaFile | null> {
    // Generate file hash
    const hash = await this.calculateFileHash(file);
    
    // Check against existing files
    const response = await fetch(`/api/media/check-duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash, filename: file.name, size: file.size })
    });

    if (response.ok) {
      const result = await response.json();
      return result.duplicate || null;
    }

    return null;
  }

  async pauseUpload(fileId: string): Promise<void> {
    const controller = this.activeUploads.get(fileId);
    if (controller) {
      controller.abort();
      this.activeUploads.delete(fileId);
    }

    const uploadFile = this.uploadQueue.find(f => f.id === fileId);
    if (uploadFile && uploadFile.status === 'uploading') {
      uploadFile.status = 'queued';
      this.emit('filePaused', uploadFile);
    }
  }

  async resumeUpload(fileId: string): Promise<void> {
    const uploadFile = this.uploadQueue.find(f => f.id === fileId);
    if (uploadFile && uploadFile.status === 'queued') {
      this.startFileUpload(uploadFile);
    }
  }

  async cancelUpload(fileId: string): Promise<void> {
    const controller = this.activeUploads.get(fileId);
    if (controller) {
      controller.abort();
    }

    const uploadFile = this.uploadQueue.find(f => f.id === fileId);
    if (uploadFile) {
      uploadFile.status = 'cancelled';
      this.emit('fileCancelled', uploadFile);
    }

    // Remove from queue
    this.uploadQueue = this.uploadQueue.filter(f => f.id !== fileId);
  }

  async retryUpload(fileId: string): Promise<void> {
    const uploadFile = this.uploadQueue.find(f => f.id === fileId);
    if (uploadFile && uploadFile.status === 'failed') {
      uploadFile.status = 'queued';
      uploadFile.progress = 0;
      uploadFile.uploadedBytes = 0;
      uploadFile.error = undefined;
      
      // Reset chunks if chunked upload
      if (uploadFile.chunks) {
        uploadFile.chunks.forEach(chunk => {
          chunk.uploaded = false;
          chunk.retries = 0;
        });
      }

      this.startFileUpload(uploadFile);
    }
  }

  getUploadStats(): UploadStats {
    const stats = {
      total: this.uploadQueue.length,
      queued: this.uploadQueue.filter(f => f.status === 'queued').length,
      uploading: this.uploadQueue.filter(f => f.status === 'uploading').length,
      completed: this.uploadQueue.filter(f => f.status === 'completed').length,
      failed: this.uploadQueue.filter(f => f.status === 'failed').length,
      cancelled: this.uploadQueue.filter(f => f.status === 'cancelled').length,
      totalSize: this.uploadQueue.reduce((sum, f) => sum + f.size, 0),
      uploadedSize: this.uploadQueue.reduce((sum, f) => sum + f.uploadedBytes, 0),
      overallProgress: 0,
      averageSpeed: 0
    };

    if (stats.totalSize > 0) {
      stats.overallProgress = (stats.uploadedSize / stats.totalSize) * 100;
    }

    const activeUploads = this.uploadQueue.filter(f => f.status === 'uploading' && f.speed > 0);
    if (activeUploads.length > 0) {
      stats.averageSpeed = activeUploads.reduce((sum, f) => sum + f.speed, 0) / activeUploads.length;
    }

    return stats;
  }

  private emit(event: string, data: any): void {
    this.eventEmitter.emit(event, data);
  }

  on(event: string, callback: Function): void {
    this.eventEmitter.on(event, callback);
  }

  off(event: string, callback: Function): void {
    this.eventEmitter.off(event, callback);
  }
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface UploadStats {
  total: number;
  queued: number;
  uploading: number;
  completed: number;
  failed: number;
  cancelled: number;
  totalSize: number;
  uploadedSize: number;
  overallProgress: number;
  averageSpeed: number;
}
```

### **2. 🎛️ Upload Configuration System**

#### **Dynamic Upload Settings:**
```typescript
export class UploadConfigService {
  private config: UploadConfig;
  private presets: Map<string, UploadPreset> = new Map();

  constructor() {
    this.loadDefaultPresets();
    this.config = this.getDefaultConfig();
  }

  async updateConfig(updates: Partial<UploadConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };
    
    // Validate configuration
    const validation = this.validateConfig(this.config);
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    // Save to database
    await this.saveConfig(this.config);

    // Notify listeners
    this.emit('configUpdated', this.config);
  }

  async createPreset(name: string, config: Partial<UploadConfig>): Promise<UploadPreset> {
    const preset: UploadPreset = {
      id: this.generateId(),
      name,
      description: `Custom preset: ${name}`,
      config: { ...this.config, ...config },
      createdAt: new Date(),
      isDefault: false
    };

    this.presets.set(preset.id, preset);
    await this.savePreset(preset);

    return preset;
  }

  async applyPreset(presetId: string): Promise<void> {
    const preset = this.presets.get(presetId);
    if (!preset) {
      throw new Error(`Preset ${presetId} not found`);
    }

    await this.updateConfig(preset.config);
  }

  getConfigForFileType(fileType: string): UploadConfig {
    // Return specialized config based on file type
    const baseConfig = { ...this.config };

    if (fileType.startsWith('image/')) {
      return {
        ...baseConfig,
        maxFileSize: baseConfig.imageMaxSize || baseConfig.maxFileSize,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
        autoProcess: true,
        generateThumbnails: true
      };
    } else if (fileType.startsWith('video/')) {
      return {
        ...baseConfig,
        maxFileSize: baseConfig.videoMaxSize || baseConfig.maxFileSize,
        allowedTypes: ['video/mp4', 'video/webm', 'video/avi', 'video/mov'],
        chunkSize: 5 * 1024 * 1024, // 5MB chunks for large videos
        autoProcess: true,
        generateThumbnails: true
      };
    } else if (fileType.startsWith('audio/')) {
      return {
        ...baseConfig,
        maxFileSize: baseConfig.audioMaxSize || baseConfig.maxFileSize,
        allowedTypes: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'],
        autoProcess: true
      };
    }

    return baseConfig;
  }

  private loadDefaultPresets(): void {
    // Image preset
    this.presets.set('images', {
      id: 'images',
      name: 'Images Only',
      description: 'Optimized for image uploads',
      config: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 50,
        allowedTypes: ['image/*'],
        chunkSize: 0, // No chunking for images
        concurrent: 5,
        autoProcess: true,
        generateThumbnails: true,
        autoResize: true
      },
      createdAt: new Date(),
      isDefault: true
    });

    // Video preset
    this.presets.set('videos', {
      id: 'videos',
      name: 'Videos Only',
      description: 'Optimized for video uploads',
      config: {
        maxFileSize: 500 * 1024 * 1024, // 500MB
        maxFiles: 10,
        allowedTypes: ['video/*'],
        chunkSize: 5 * 1024 * 1024, // 5MB chunks
        concurrent: 2,
        autoProcess: true,
        generateThumbnails: true
      },
      createdAt: new Date(),
      isDefault: true
    });

    // Documents preset
    this.presets.set('documents', {
      id: 'documents',
      name: 'Documents Only',
      description: 'Optimized for document uploads',
      config: {
        maxFileSize: 50 * 1024 * 1024, // 50MB
        maxFiles: 20,
        allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.*'],
        chunkSize: 2 * 1024 * 1024, // 2MB chunks
        concurrent: 3,
        autoProcess: false,
        generateThumbnails: false
      },
      createdAt: new Date(),
      isDefault: true
    });
  }

  private getDefaultConfig(): UploadConfig {
    return {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxTotalSize: 1024 * 1024 * 1024, // 1GB
      maxFiles: 100,
      allowedTypes: ['*'],
      blockedTypes: ['application/x-executable', 'application/x-msdownload'],
      chunkSize: 1024 * 1024, // 1MB
      concurrent: 3,
      autoStart: true,
      autoRetry: true,
      retryAttempts: 3,
      timeout: 300000, // 5 minutes
      allowDuplicates: false,
      autoProcess: true,
      generateThumbnails: true,
      virusScan: true,
      watermark: false
    };
  }
}

interface UploadPreset {
  id: string;
  name: string;
  description: string;
  config: UploadConfig;
  createdAt: Date;
  isDefault: boolean;
}
```

### **3. 🔒 Security & Validation**

#### **Comprehensive Security System:**
```typescript
export class UploadSecurityService {
  private virusScanner: VirusScanner;
  private contentAnalyzer: ContentAnalyzer;
  private rateLimiter: RateLimiter;

  async performSecurityScan(file: File): Promise<SecurityScanResult> {
    const results: SecurityCheck[] = [];

    // File type validation
    const typeCheck = await this.validateFileType(file);
    results.push(typeCheck);

    // Content validation
    const contentCheck = await this.validateFileContent(file);
    results.push(contentCheck);

    // Virus scan
    if (this.virusScanner.isEnabled()) {
      const virusCheck = await this.virusScanner.scan(file);
      results.push(virusCheck);
    }

    // Malicious content detection
    const malwareCheck = await this.detectMaliciousContent(file);
    results.push(malwareCheck);

    // Rate limiting check
    const rateLimitCheck = await this.checkRateLimit(file);
    results.push(rateLimitCheck);

    const failedChecks = results.filter(r => !r.passed);
    
    return {
      safe: failedChecks.length === 0,
      score: this.calculateSecurityScore(results),
      checks: results,
      threats: failedChecks.map(c => c.threat),
      recommendations: this.generateSecurityRecommendations(failedChecks)
    };
  }

  private async validateFileType(file: File): Promise<SecurityCheck> {
    // Check file extension vs MIME type
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const expectedMimeTypes = this.getMimeTypesForExtension(extension);

    if (expectedMimeTypes.length > 0 && !expectedMimeTypes.includes(file.type)) {
      return {
        name: 'File Type Validation',
        passed: false,
        threat: 'file_type_mismatch',
        message: `File extension ${extension} doesn't match MIME type ${file.type}`,
        severity: 'high'
      };
    }

    // Check for dangerous extensions
    const dangerousExtensions = [
      'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar',
      'php', 'asp', 'aspx', 'jsp', 'py', 'rb', 'pl', 'sh'
    ];

    if (dangerousExtensions.includes(extension)) {
      return {
        name: 'File Type Validation',
        passed: false,
        threat: 'dangerous_extension',
        message: `Potentially dangerous file extension: ${extension}`,
        severity: 'high'
      };
    }

    return {
      name: 'File Type Validation',
      passed: true,
      message: 'File type is valid',
      severity: 'info'
    };
  }

  private async validateFileContent(file: File): Promise<SecurityCheck> {
    // Read file header to verify actual file type
    const header = await this.readFileHeader(file, 512);
    const actualType = this.identifyFileTypeFromHeader(header);

    if (actualType && actualType !== file.type) {
      return {
        name: 'Content Validation',
        passed: false,
        threat: 'content_type_spoofing',
        message: `File content doesn't match declared type. Expected: ${file.type}, Actual: ${actualType}`,
        severity: 'high'
      };
    }

    // Check for embedded scripts in images
    if (file.type.startsWith('image/')) {
      const hasScript = await this.detectEmbeddedScript(file);
      if (hasScript) {
        return {
          name: 'Content Validation',
          passed: false,
          threat: 'embedded_script',
          message: 'Embedded script detected in image file',
          severity: 'high'
        };
      }
    }

    // Check file size consistency
    const declaredSize = file.size;
    const actualSize = await this.calculateActualFileSize(file);
    
    if (Math.abs(declaredSize - actualSize) > 1024) { // 1KB tolerance
      return {
        name: 'Content Validation',
        passed: false,
        threat: 'size_mismatch',
        message: 'File size mismatch detected',
        severity: 'medium'
      };
    }

    return {
      name: 'Content Validation',
      passed: true,
      message: 'File content is valid',
      severity: 'info'
    };
  }

  private async detectMaliciousContent(file: File): Promise<SecurityCheck> {
    const threats: string[] = [];

    // Check for suspicious patterns
    const content = await this.readFileAsText(file);
    
    // Common malicious patterns
    const maliciousPatterns = [
      /eval\s*\(/gi,
      /exec\s*\(/gi,
      /system\s*\(/gi,
      /shell_exec\s*\(/gi,
      /<script\s*>/gi,
      /javascript\s*:/gi,
      /vbscript\s*:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(content)) {
        threats.push(`Suspicious pattern detected: ${pattern.source}`);
      }
    }

    // Check for base64 encoded content (potential payload)
    const base64Pattern = /[A-Za-z0-9+\/]{50,}={0,2}/g;
    const base64Matches = content.match(base64Pattern);
    
    if (base64Matches && base64Matches.length > 3) {
      threats.push('Multiple base64 encoded strings detected');
    }

    return {
      name: 'Malicious Content Detection',
      passed: threats.length === 0,
      threat: threats.length > 0 ? 'malicious_content' : undefined,
      message: threats.length > 0 ? threats.join(', ') : 'No malicious content detected',
      severity: threats.length > 0 ? 'high' : 'info'
    };
  }

  private async checkRateLimit(file: File): Promise<SecurityCheck> {
    const clientId = this.getClientIdentifier();
    const isAllowed = await this.rateLimiter.checkLimit(clientId, {
      fileSize: file.size,
      fileType: file.type
    });

    if (!isAllowed) {
      return {
        name: 'Rate Limiting',
        passed: false,
        threat: 'rate_limit_exceeded',
        message: 'Upload rate limit exceeded',
        severity: 'medium'
      };
    }

    return {
      name: 'Rate Limiting',
      passed: true,
      message: 'Rate limit check passed',
      severity: 'info'
    };
  }

  async quarantineFile(fileId: string, reason: string): Promise<void> {
    await this.moveFileToQuarantine(fileId);
    await this.logSecurityEvent({
      type: 'file_quarantined',
      fileId,
      reason,
      timestamp: new Date()
    });
    
    // Notify administrators
    await this.notifyAdministrators({
      type: 'security_alert',
      message: `File ${fileId} has been quarantined: ${reason}`,
      severity: 'high'
    });
  }

  private calculateSecurityScore(checks: SecurityCheck[]): number {
    const totalChecks = checks.length;
    const passedChecks = checks.filter(c => c.passed).length;
    const highSeverityFailures = checks.filter(c => !c.passed && c.severity === 'high').length;
    
    let score = (passedChecks / totalChecks) * 100;
    
    // Penalize high severity failures more heavily
    score -= highSeverityFailures * 25;
    
    return Math.max(0, Math.min(100, score));
  }
}

interface SecurityScanResult {
  safe: boolean;
  score: number; // 0-100
  checks: SecurityCheck[];
  threats: string[];
  recommendations: string[];
}

interface SecurityCheck {
  name: string;
  passed: boolean;
  threat?: string;
  message: string;
  severity: 'info' | 'low' | 'medium' | 'high';
}
```

---

## 🎨 **Upload Interface**

### **Drag & Drop Upload:**
```
┌─────────────────────────────────────────────────────────┐
│ ⬆️ Media Upload                        [Browse Files] [URL Import] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Drop Zone ────────────────────────────────────────┐   │
│ │                                                   │   │
│ │              📁 Drag files here                    │   │
│ │                    or                             │   │
│ │              [Click to browse]                     │   │
│ │                                                   │   │
│ │  Supported: Images, Videos, Audio, Documents      │   │
│ │  Max size: 100MB per file                         │   │
│ │  Max files: 50 at once                            │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Upload Queue ─────────────────────────────────────┐   │
│ │ 📄 document.pdf (2.3MB) ████████████░░ 85%        │   │
│ │    ⏱️ 00:12 remaining • 📶 1.2MB/s                 │   │
│ │    [Pause] [Cancel]                               │   │
│ │                                                   │   │
│ │ 🖼️ image.jpg (856KB) ██████████████ 100% ✅       │   │
│ │    ✅ Upload complete • 📊 Processing...            │   │
│ │                                                   │   │
│ │ 🎥 video.mp4 (45MB) ████░░░░░░░░░░ 32%            │   │
│ │    ⏱️ 02:45 remaining • 📶 850KB/s                 │   │
│ │    [Pause] [Cancel]                               │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Upload Settings ──────────────────────────────────┐   │
│ │ Folder: [📁 Images ▼]  Quality: [High ▼]          │   │
│ │ ☑ Auto-resize images   ☑ Generate thumbnails      │   │
│ │ ☑ Add watermark        ☑ Virus scan               │   │
│ │ [Preset: Images ▼] [Save as Preset]               │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ Overall Progress: ████████░░░░ 67% (3 of 5 files)      │
│ Total: 48.2MB • Uploaded: 32.1MB • Speed: 1.8MB/s     │
│                                                         │
│ [Pause All] [Cancel All] [Add More Files]              │
└─────────────────────────────────────────────────────────┘
```

### **Upload Analytics Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Upload Analytics                     [Export] [Settings] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Upload Statistics ────────────────────────────────┐   │
│ │ 📤 Total Uploads: 1,234 (+15.2% vs last month)    │   │
│ │ 📁 Total Size: 15.6GB (+22.8%)                    │   │
│ │ ⚡ Avg Speed: 2.3MB/s (+8.5%)                      │   │
│ │ ✅ Success Rate: 98.7% (+1.2%)                     │   │
│ │ 🔒 Security Blocks: 23 (-5 from last month)       │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ File Type Breakdown ──┐ ┌─ Upload Sources ──────────┐ │
│ │ 🖼️ Images: 65.2%        │ │ 🖱️ Drag & Drop: 78.3%    │ │
│ │ 📄 Documents: 18.7%     │ │ 📁 File Browser: 15.2%   │ │
│ │ 🎥 Videos: 12.4%        │ │ 🔗 URL Import: 4.8%      │ │
│ │ 🎵 Audio: 3.7%          │ │ 📋 Clipboard: 1.7%       │ │
│ └─────────────────────────┘ └───────────────────────────┘ │
│                                                         │
│ ┌─ Performance Trends ───────────────────────────────┐   │
│ │ Upload ┌─────────────────────────────────────────┐  │   │
│ │ Speed  │               ╭─╮                       │  │   │
│ │ (MB/s) │             ╭─╯ ╰─╮                     │  │   │
│ │   3.0  │           ╭─╯     ╰─╮                   │  │   │
│ │   2.0  │         ╭─╯         ╰─╮                 │  │   │
│ │   1.0  │       ╭─╯             ╰─╮               │  │   │
│ │   0.0  └─────────────────────────────────────────┘  │   │
│ │        Jan 1    Jan 15    Jan 30                    │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Recent Security Events ───────────────────────────┐   │
│ │ 🚨 Malware detected in upload.exe (Quarantined)    │   │
│ │ ⚠️ Rate limit exceeded for IP 192.168.1.100       │   │
│ │ 🔍 Suspicious file extension blocked: .scr         │   │
│ │ ✅ Virus scan completed: 156 files clean           │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Upload operations
POST   /api/media/upload                  // Direct file upload
POST   /api/media/upload/chunked          // Initialize chunked upload
PUT    /api/media/upload/chunked/{id}     // Upload chunk
POST   /api/media/upload/chunked/{id}/finalize // Finalize chunked upload
POST   /api/media/upload/url              // Import from URL

// Upload management
GET    /api/media/upload/progress/{id}    // Get upload progress
POST   /api/media/upload/{id}/pause       // Pause upload
POST   /api/media/upload/{id}/resume      // Resume upload
DELETE /api/media/upload/{id}             // Cancel upload

// Upload configuration
GET    /api/media/upload/config           // Get upload config
PUT    /api/media/upload/config           // Update upload config
GET    /api/media/upload/presets          // List upload presets
POST   /api/media/upload/presets          // Create upload preset

// Security & validation
POST   /api/media/upload/validate         // Validate file
POST   /api/media/upload/scan             // Security scan
POST   /api/media/check-duplicate         // Check for duplicates
GET    /api/media/upload/analytics        // Upload analytics
```

### **Database Schema:**
```sql
-- Upload sessions
CREATE TABLE upload_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_data JSONB NOT NULL,
  total_files INTEGER DEFAULT 0,
  completed_files INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,
  uploaded_size BIGINT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Upload chunks
CREATE TABLE upload_chunks (
  id UUID PRIMARY KEY,
  upload_id VARCHAR(255) NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_size INTEGER NOT NULL,
  uploaded BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(upload_id, chunk_index)
);

-- Security scans
CREATE TABLE security_scans (
  id UUID PRIMARY KEY,
  file_hash VARCHAR(64) NOT NULL,
  scan_result JSONB NOT NULL,
  threats TEXT[],
  score INTEGER NOT NULL,
  scanned_at TIMESTAMP DEFAULT NOW()
);

-- Upload analytics
CREATE TABLE upload_analytics (
  id UUID PRIMARY KEY,
  date DATE NOT NULL,
  total_uploads INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,
  avg_speed DECIMAL(10,2) DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  file_types JSONB,
  upload_sources JSONB,
  security_blocks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date)
);

-- Indexes for performance
CREATE INDEX idx_upload_sessions_user ON upload_sessions(user_id);
CREATE INDEX idx_upload_sessions_status ON upload_sessions(status);
CREATE INDEX idx_upload_chunks_upload ON upload_chunks(upload_id);
CREATE INDEX idx_security_scans_hash ON security_scans(file_hash);
CREATE INDEX idx_upload_analytics_date ON upload_analytics(date);
```

---

## 🔗 **Related Documentation**

- **[Media Library](./library.md)** - File organization and management
- **[Media Processing](./processing.md)** - Image and video processing
- **[CDN Integration](./cdn.md)** - Content delivery optimization
- **[Security Monitoring](../06_security/)** - Upload security and monitoring

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
