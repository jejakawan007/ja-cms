# 🖼️ Media Processing System

> **Advanced Image & Video Processing JA-CMS**  
> Comprehensive media processing dengan AI enhancement dan optimization

---

## 📋 **Deskripsi**

Media Processing System menyediakan capabilities yang powerful untuk memproses, mengoptimasi, dan mentransformasi berbagai jenis media files. Sistem ini dilengkapi dengan image processing, video transcoding, audio processing, dan AI-powered enhancement features.

---

## ⭐ **Core Features**

### **1. 🎨 Image Processing Engine**

#### **Image Processing Pipeline:**
```typescript
interface ImageProcessingConfig {
  formats: {
    webp: boolean;
    avif: boolean;
    jpeg: { quality: number; progressive: boolean };
    png: { compression: number; palette: boolean };
  };
  sizes: ImageSize[];
  optimization: {
    autoOptimize: boolean;
    lossless: boolean;
    quality: number; // 1-100
    stripMetadata: boolean;
  };
  transformations: {
    autoOrient: boolean;
    sharpen: boolean;
    denoise: boolean;
    colorCorrection: boolean;
  };
  watermark: {
    enabled: boolean;
    image: string;
    position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    opacity: number; // 0-1
    scale: number; // 0-1
  };
}

interface ImageSize {
  name: string;
  width: number;
  height?: number;
  fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position: string;
  background?: string;
  quality?: number;
}

interface ProcessingJob {
  id: string;
  fileId: string;
  type: 'image' | 'video' | 'audio';
  operations: ProcessingOperation[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: ProcessingResult;
}

interface ProcessingOperation {
  type: 'resize' | 'crop' | 'rotate' | 'flip' | 'enhance' | 'watermark' | 'convert';
  params: Record<string, any>;
  order: number;
}

interface ProcessingResult {
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
  variants: ProcessedVariant[];
  metadata: MediaMetadata;
  processingTime: number;
}

interface ProcessedVariant {
  name: string;
  url: string;
  width: number;
  height: number;
  size: number;
  format: string;
  quality: number;
}
```

#### **Image Processing Service:**
```typescript
export class ImageProcessingService {
  private sharp: Sharp;
  private jobQueue: ProcessingQueue;
  private aiEnhancer: AIImageEnhancer;
  private qualityAnalyzer: ImageQualityAnalyzer;

  constructor() {
    this.sharp = Sharp();
    this.jobQueue = new ProcessingQueue();
    this.aiEnhancer = new AIImageEnhancer();
    this.qualityAnalyzer = new ImageQualityAnalyzer();
  }

  async processImage(fileId: string, config: ImageProcessingConfig): Promise<ProcessingJob> {
    const file = await this.getMediaFile(fileId);
    if (!file || !file.mimeType.startsWith('image/')) {
      throw new Error('Invalid image file');
    }

    // Create processing job
    const job: ProcessingJob = {
      id: this.generateJobId(),
      fileId,
      type: 'image',
      operations: this.buildProcessingOperations(config),
      priority: 'normal',
      status: 'queued',
      progress: 0
    };

    // Add to queue
    await this.jobQueue.add(job);

    // Start processing if queue is not busy
    this.processNextJob();

    return job;
  }

  async processImageSync(buffer: Buffer, operations: ProcessingOperation[]): Promise<ProcessingResult> {
    let image = this.sharp(buffer);
    const originalMetadata = await image.metadata();
    const variants: ProcessedVariant[] = [];
    const startTime = Date.now();

    // Sort operations by order
    const sortedOperations = operations.sort((a, b) => a.order - b.order);

    // Apply operations sequentially
    for (const operation of sortedOperations) {
      image = await this.applyOperation(image, operation);
    }

    // Generate variants for different sizes
    const config = this.getDefaultImageConfig();
    for (const size of config.sizes) {
      const variant = await this.generateVariant(image, size);
      variants.push(variant);
    }

    // Generate WebP and AVIF versions if enabled
    if (config.formats.webp) {
      const webpVariant = await this.generateWebPVariant(image);
      variants.push(webpVariant);
    }

    if (config.formats.avif) {
      const avifVariant = await this.generateAVIFVariant(image);
      variants.push(avifVariant);
    }

    const processedBuffer = await image.toBuffer();
    const processingTime = Date.now() - startTime;

    return {
      originalSize: buffer.length,
      processedSize: processedBuffer.length,
      compressionRatio: buffer.length / processedBuffer.length,
      variants,
      metadata: await this.extractImageMetadata(image),
      processingTime
    };
  }

  private async applyOperation(image: Sharp, operation: ProcessingOperation): Promise<Sharp> {
    switch (operation.type) {
      case 'resize':
        return image.resize({
          width: operation.params.width,
          height: operation.params.height,
          fit: operation.params.fit || 'cover',
          position: operation.params.position || 'center',
          background: operation.params.background || { r: 255, g: 255, b: 255, alpha: 1 }
        });

      case 'crop':
        return image.extract({
          left: operation.params.x,
          top: operation.params.y,
          width: operation.params.width,
          height: operation.params.height
        });

      case 'rotate':
        return image.rotate(operation.params.angle, {
          background: operation.params.background || { r: 255, g: 255, b: 255, alpha: 0 }
        });

      case 'flip':
        if (operation.params.horizontal) {
          image = image.flop();
        }
        if (operation.params.vertical) {
          image = image.flip();
        }
        return image;

      case 'enhance':
        return this.applyEnhancements(image, operation.params);

      case 'watermark':
        return this.applyWatermark(image, operation.params);

      case 'convert':
        return this.convertFormat(image, operation.params);

      default:
        return image;
    }
  }

  private async applyEnhancements(image: Sharp, params: any): Promise<Sharp> {
    // Auto-orient
    if (params.autoOrient) {
      image = image.rotate();
    }

    // Sharpen
    if (params.sharpen) {
      image = image.sharpen({
        sigma: params.sharpenSigma || 1,
        flat: params.sharpenFlat || 1,
        jagged: params.sharpenJagged || 2
      });
    }

    // Denoise
    if (params.denoise) {
      image = image.median(params.denoiseSize || 3);
    }

    // Color correction
    if (params.colorCorrection) {
      image = image.modulate({
        brightness: params.brightness || 1,
        saturation: params.saturation || 1,
        hue: params.hue || 0
      });
    }

    // Gamma correction
    if (params.gamma) {
      image = image.gamma(params.gamma);
    }

    // Contrast enhancement
    if (params.contrast) {
      image = image.linear(params.contrast, -(128 * params.contrast) + 128);
    }

    return image;
  }

  private async applyWatermark(image: Sharp, params: any): Promise<Sharp> {
    if (!params.watermarkPath) {
      return image;
    }

    const watermark = this.sharp(params.watermarkPath);
    const imageMetadata = await image.metadata();
    const watermarkMetadata = await watermark.metadata();

    // Calculate watermark size based on image size
    const scale = params.scale || 0.1;
    const watermarkWidth = Math.round(imageMetadata.width! * scale);
    const watermarkHeight = Math.round((watermarkWidth / watermarkMetadata.width!) * watermarkMetadata.height!);

    // Resize watermark
    const resizedWatermark = await watermark
      .resize(watermarkWidth, watermarkHeight)
      .png()
      .toBuffer();

    // Calculate position
    const position = this.calculateWatermarkPosition(
      imageMetadata.width!,
      imageMetadata.height!,
      watermarkWidth,
      watermarkHeight,
      params.position || 'bottom-right'
    );

    return image.composite([{
      input: resizedWatermark,
      top: position.top,
      left: position.left,
      blend: 'over'
    }]);
  }

  async optimizeImage(fileId: string, targetSize?: number): Promise<ProcessingResult> {
    const file = await this.getMediaFile(fileId);
    const buffer = await this.getFileBuffer(file.url);
    
    let image = this.sharp(buffer);
    const metadata = await image.metadata();
    const originalSize = buffer.length;

    // Analyze image quality
    const qualityAnalysis = await this.qualityAnalyzer.analyze(buffer);
    
    // Determine optimal settings based on analysis
    const optimalSettings = this.calculateOptimalSettings(qualityAnalysis, targetSize);

    // Apply optimizations
    if (metadata.format === 'jpeg') {
      image = image.jpeg({
        quality: optimalSettings.quality,
        progressive: true,
        mozjpeg: true
      });
    } else if (metadata.format === 'png') {
      image = image.png({
        compressionLevel: optimalSettings.compression,
        palette: optimalSettings.palette
      });
    } else if (metadata.format === 'webp') {
      image = image.webp({
        quality: optimalSettings.quality,
        effort: 6
      });
    }

    // Strip metadata if configured
    if (optimalSettings.stripMetadata) {
      image = image.withMetadata({
        exif: {},
        icc: 'srgb'
      });
    }

    const optimizedBuffer = await image.toBuffer();
    const compressionRatio = originalSize / optimizedBuffer.length;

    return {
      originalSize,
      processedSize: optimizedBuffer.length,
      compressionRatio,
      variants: [],
      metadata: await this.extractImageMetadata(image),
      processingTime: 0
    };
  }

  async enhanceWithAI(fileId: string, enhancement: AIEnhancement): Promise<ProcessingResult> {
    const file = await this.getMediaFile(fileId);
    const buffer = await this.getFileBuffer(file.url);

    // Use AI service for enhancement
    const enhancedBuffer = await this.aiEnhancer.enhance(buffer, enhancement);

    // Save enhanced version
    const enhancedFile = await this.saveProcessedFile(enhancedBuffer, file, 'ai-enhanced');

    return {
      originalSize: buffer.length,
      processedSize: enhancedBuffer.length,
      compressionRatio: buffer.length / enhancedBuffer.length,
      variants: [{
        name: 'ai-enhanced',
        url: enhancedFile.url,
        width: enhancedFile.width!,
        height: enhancedFile.height!,
        size: enhancedBuffer.length,
        format: enhancedFile.mimeType,
        quality: 95
      }],
      metadata: await this.extractImageMetadata(this.sharp(enhancedBuffer)),
      processingTime: 0
    };
  }

  private calculateOptimalSettings(analysis: QualityAnalysis, targetSize?: number): OptimalSettings {
    let quality = 85;
    let compression = 6;
    let palette = false;

    // Adjust based on image characteristics
    if (analysis.hasTransparency) {
      // PNG with transparency
      compression = 9;
      palette = analysis.colorCount < 256;
    } else if (analysis.isPhoto) {
      // Photographic content
      quality = analysis.hasNoise ? 75 : 85;
    } else if (analysis.isGraphic) {
      // Graphics/illustrations
      quality = 90;
      palette = analysis.colorCount < 256;
    }

    // Adjust for target file size
    if (targetSize) {
      const estimatedSize = analysis.estimatedSize;
      if (estimatedSize > targetSize) {
        const ratio = targetSize / estimatedSize;
        quality = Math.max(50, Math.round(quality * ratio));
      }
    }

    return {
      quality,
      compression,
      palette,
      stripMetadata: true
    };
  }
}

interface AIEnhancement {
  type: 'upscale' | 'denoise' | 'colorize' | 'restore' | 'enhance';
  strength: number; // 0-1
  preserveDetails: boolean;
  targetWidth?: number;
  targetHeight?: number;
}

interface QualityAnalysis {
  hasTransparency: boolean;
  isPhoto: boolean;
  isGraphic: boolean;
  hasNoise: boolean;
  colorCount: number;
  estimatedSize: number;
  complexity: number;
}

interface OptimalSettings {
  quality: number;
  compression: number;
  palette: boolean;
  stripMetadata: boolean;
}
```

### **2. 🎬 Video Processing Engine**

#### **Video Processing Pipeline:**
```typescript
interface VideoProcessingConfig {
  formats: {
    mp4: { codec: string; quality: string };
    webm: { codec: string; quality: string };
    hls: { enabled: boolean; segmentDuration: number };
  };
  resolutions: VideoResolution[];
  optimization: {
    bitrate: 'auto' | number;
    framerate: 'auto' | number;
    keyframeInterval: number;
    twoPass: boolean;
  };
  thumbnails: {
    count: number;
    timestamps: number[]; // seconds
    width: number;
    height: number;
    format: 'jpg' | 'png' | 'webp';
  };
  subtitles: {
    extract: boolean;
    generate: boolean;
    languages: string[];
  };
}

interface VideoResolution {
  name: string;
  width: number;
  height: number;
  bitrate: number;
  framerate?: number;
}

export class VideoProcessingService {
  private ffmpeg: FFmpeg;
  private jobQueue: ProcessingQueue;
  private thumbnailGenerator: ThumbnailGenerator;

  async processVideo(fileId: string, config: VideoProcessingConfig): Promise<ProcessingJob> {
    const file = await this.getMediaFile(fileId);
    if (!file || !file.mimeType.startsWith('video/')) {
      throw new Error('Invalid video file');
    }

    const job: ProcessingJob = {
      id: this.generateJobId(),
      fileId,
      type: 'video',
      operations: this.buildVideoOperations(config),
      priority: 'normal',
      status: 'queued',
      progress: 0
    };

    await this.jobQueue.add(job);
    this.processNextJob();

    return job;
  }

  async transcodeVideo(inputPath: string, outputPath: string, options: TranscodeOptions): Promise<void> {
    const command = this.ffmpeg(inputPath);

    // Video codec settings
    command
      .videoCodec(options.videoCodec || 'libx264')
      .videoBitrate(options.videoBitrate || '1000k')
      .fps(options.framerate || 30)
      .size(options.resolution || '1280x720');

    // Audio codec settings
    if (options.audioCodec) {
      command
        .audioCodec(options.audioCodec)
        .audioBitrate(options.audioBitrate || '128k')
        .audioFrequency(options.audioFrequency || 44100);
    } else {
      command.noAudio();
    }

    // Advanced options
    if (options.twoPass) {
      command.addOption('-pass', '1');
      command.addOption('-f', 'null');
      await this.runFFmpegCommand(command, '/dev/null');

      command.addOption('-pass', '2');
    }

    // Custom filters
    if (options.filters && options.filters.length > 0) {
      command.videoFilters(options.filters);
    }

    // Output format
    command.format(options.format || 'mp4');

    return this.runFFmpegCommand(command, outputPath);
  }

  async generateThumbnails(videoPath: string, config: ThumbnailConfig): Promise<string[]> {
    const thumbnails: string[] = [];
    const videoInfo = await this.getVideoInfo(videoPath);
    const duration = videoInfo.duration;

    // Calculate thumbnail timestamps
    const timestamps = config.timestamps.length > 0 
      ? config.timestamps 
      : this.calculateThumbnailTimestamps(duration, config.count);

    for (let i = 0; i < timestamps.length; i++) {
      const timestamp = timestamps[i];
      const outputPath = `${config.outputDir}/thumb_${i + 1}.${config.format}`;

      await this.ffmpeg(videoPath)
        .seekInput(timestamp)
        .frames(1)
        .size(`${config.width}x${config.height}`)
        .output(outputPath)
        .run();

      thumbnails.push(outputPath);
    }

    return thumbnails;
  }

  async createVideoPreview(videoPath: string, duration: number = 10): Promise<string> {
    const videoInfo = await this.getVideoInfo(videoPath);
    const totalDuration = videoInfo.duration;
    
    // Create preview from multiple segments
    const segments = Math.min(5, Math.floor(totalDuration / 10));
    const segmentDuration = duration / segments;
    const intervalDuration = totalDuration / segments;

    const outputPath = `${path.dirname(videoPath)}/preview_${path.basename(videoPath)}`;

    const command = this.ffmpeg();

    // Add input segments
    for (let i = 0; i < segments; i++) {
      const startTime = i * intervalDuration;
      command.input(videoPath).seekInput(startTime).duration(segmentDuration);
    }

    // Concatenate segments
    command
      .complexFilter([
        `concat=n=${segments}:v=1:a=1[outv][outa]`
      ])
      .outputOptions(['-map', '[outv]', '-map', '[outa]'])
      .videoCodec('libx264')
      .audioCodec('aac')
      .output(outputPath);

    await this.runFFmpegCommand(command, outputPath);
    return outputPath;
  }

  async extractAudio(videoPath: string, outputPath: string, format: string = 'mp3'): Promise<void> {
    const command = this.ffmpeg(videoPath)
      .noVideo()
      .audioCodec(format === 'mp3' ? 'libmp3lame' : 'aac')
      .audioBitrate('192k')
      .format(format)
      .output(outputPath);

    return this.runFFmpegCommand(command, outputPath);
  }

  async addSubtitles(videoPath: string, subtitlePath: string, outputPath: string): Promise<void> {
    const command = this.ffmpeg(videoPath)
      .input(subtitlePath)
      .outputOptions([
        '-c:v', 'copy',
        '-c:a', 'copy',
        '-c:s', 'mov_text',
        '-metadata:s:s:0', 'language=eng'
      ])
      .output(outputPath);

    return this.runFFmpegCommand(command, outputPath);
  }

  async generateHLS(videoPath: string, outputDir: string): Promise<HLSOutput> {
    const resolutions = [
      { name: '720p', width: 1280, height: 720, bitrate: '2500k' },
      { name: '480p', width: 854, height: 480, bitrate: '1000k' },
      { name: '360p', width: 640, height: 360, bitrate: '600k' }
    ];

    const masterPlaylist = path.join(outputDir, 'master.m3u8');
    const playlists: HLSPlaylist[] = [];

    for (const resolution of resolutions) {
      const playlistName = `${resolution.name}.m3u8`;
      const playlistPath = path.join(outputDir, playlistName);
      const segmentPattern = path.join(outputDir, `${resolution.name}_%03d.ts`);

      await this.ffmpeg(videoPath)
        .size(`${resolution.width}x${resolution.height}`)
        .videoBitrate(resolution.bitrate)
        .videoCodec('libx264')
        .audioCodec('aac')
        .audioBitrate('128k')
        .format('hls')
        .outputOptions([
          '-hls_time', '10',
          '-hls_list_size', '0',
          '-hls_segment_filename', segmentPattern
        ])
        .output(playlistPath)
        .run();

      playlists.push({
        name: resolution.name,
        path: playlistName,
        resolution: `${resolution.width}x${resolution.height}`,
        bandwidth: parseInt(resolution.bitrate.replace('k', '')) * 1000
      });
    }

    // Create master playlist
    await this.createMasterPlaylist(masterPlaylist, playlists);

    return {
      masterPlaylist,
      playlists
    };
  }

  private async createMasterPlaylist(outputPath: string, playlists: HLSPlaylist[]): Promise<void> {
    let content = '#EXTM3U\n#EXT-X-VERSION:3\n\n';

    for (const playlist of playlists) {
      content += `#EXT-X-STREAM-INF:BANDWIDTH=${playlist.bandwidth},RESOLUTION=${playlist.resolution}\n`;
      content += `${playlist.path}\n\n`;
    }

    await fs.writeFile(outputPath, content);
  }

  private calculateThumbnailTimestamps(duration: number, count: number): number[] {
    const timestamps: number[] = [];
    const interval = duration / (count + 1);

    for (let i = 1; i <= count; i++) {
      timestamps.push(i * interval);
    }

    return timestamps;
  }

  private async runFFmpegCommand(command: any, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      command
        .on('end', resolve)
        .on('error', reject)
        .on('progress', (progress: any) => {
          // Emit progress event
          this.emit('progress', progress);
        })
        .run();
    });
  }
}

interface TranscodeOptions {
  videoCodec?: string;
  audioCodec?: string;
  videoBitrate?: string;
  audioBitrate?: string;
  framerate?: number;
  resolution?: string;
  audioFrequency?: number;
  twoPass?: boolean;
  filters?: string[];
  format?: string;
}

interface ThumbnailConfig {
  count: number;
  timestamps: number[];
  width: number;
  height: number;
  format: 'jpg' | 'png' | 'webp';
  outputDir: string;
}

interface HLSOutput {
  masterPlaylist: string;
  playlists: HLSPlaylist[];
}

interface HLSPlaylist {
  name: string;
  path: string;
  resolution: string;
  bandwidth: number;
}
```

### **3. 🎵 Audio Processing Engine**

#### **Audio Processing Service:**
```typescript
export class AudioProcessingService {
  private audioContext: AudioContext;
  private jobQueue: ProcessingQueue;

  async processAudio(fileId: string, config: AudioProcessingConfig): Promise<ProcessingJob> {
    const file = await this.getMediaFile(fileId);
    if (!file || !file.mimeType.startsWith('audio/')) {
      throw new Error('Invalid audio file');
    }

    const job: ProcessingJob = {
      id: this.generateJobId(),
      fileId,
      type: 'audio',
      operations: this.buildAudioOperations(config),
      priority: 'normal',
      status: 'queued',
      progress: 0
    };

    await this.jobQueue.add(job);
    this.processNextJob();

    return job;
  }

  async convertAudio(inputPath: string, outputPath: string, options: AudioConvertOptions): Promise<void> {
    const command = this.ffmpeg(inputPath);

    // Audio codec settings
    command
      .audioCodec(options.codec || 'libmp3lame')
      .audioBitrate(options.bitrate || '192k')
      .audioFrequency(options.sampleRate || 44100);

    // Audio channels
    if (options.channels) {
      command.audioChannels(options.channels);
    }

    // Volume adjustment
    if (options.volume && options.volume !== 1) {
      command.audioFilters([`volume=${options.volume}`]);
    }

    // Normalization
    if (options.normalize) {
      command.audioFilters(['loudnorm']);
    }

    // Format
    command.format(options.format || 'mp3');

    return this.runFFmpegCommand(command, outputPath);
  }

  async generateWaveform(audioPath: string, outputPath: string, options: WaveformOptions): Promise<void> {
    const width = options.width || 1200;
    const height = options.height || 200;
    const color = options.color || '#3b82f6';

    const command = this.ffmpeg(audioPath)
      .complexFilter([
        `[0:a]showwavespic=s=${width}x${height}:colors=${color}[out]`
      ])
      .outputOptions(['-map', '[out]'])
      .frames(1)
      .format('png')
      .output(outputPath);

    return this.runFFmpegCommand(command, outputPath);
  }

  async extractMetadata(audioPath: string): Promise<AudioMetadata> {
    const info = await this.getAudioInfo(audioPath);
    
    return {
      duration: info.duration,
      bitrate: info.bitrate,
      sampleRate: info.sampleRate,
      channels: info.channels,
      format: info.format,
      title: info.tags?.title,
      artist: info.tags?.artist,
      album: info.tags?.album,
      year: info.tags?.year,
      genre: info.tags?.genre,
      track: info.tags?.track,
      albumArt: info.tags?.albumArt
    };
  }

  async trimAudio(inputPath: string, outputPath: string, startTime: number, duration: number): Promise<void> {
    const command = this.ffmpeg(inputPath)
      .seekInput(startTime)
      .duration(duration)
      .audioCodec('copy')
      .output(outputPath);

    return this.runFFmpegCommand(command, outputPath);
  }

  async mergeAudioFiles(inputPaths: string[], outputPath: string): Promise<void> {
    const command = this.ffmpeg();

    // Add all input files
    inputPaths.forEach(path => command.input(path));

    // Create filter for concatenation
    const filterInputs = inputPaths.map((_, i) => `[${i}:a]`).join('');
    const concatFilter = `${filterInputs}concat=n=${inputPaths.length}:v=0:a=1[out]`;

    command
      .complexFilter([concatFilter])
      .outputOptions(['-map', '[out]'])
      .audioCodec('libmp3lame')
      .audioBitrate('192k')
      .output(outputPath);

    return this.runFFmpegCommand(command, outputPath);
  }

  async addFadeEffect(inputPath: string, outputPath: string, fadeIn: number, fadeOut: number): Promise<void> {
    const info = await this.getAudioInfo(inputPath);
    const duration = info.duration;

    const filters = [];
    
    if (fadeIn > 0) {
      filters.push(`afade=t=in:ss=0:d=${fadeIn}`);
    }
    
    if (fadeOut > 0) {
      filters.push(`afade=t=out:st=${duration - fadeOut}:d=${fadeOut}`);
    }

    const command = this.ffmpeg(inputPath)
      .audioFilters(filters)
      .audioCodec('libmp3lame')
      .output(outputPath);

    return this.runFFmpegCommand(command, outputPath);
  }
}

interface AudioProcessingConfig {
  formats: {
    mp3: { bitrate: string; quality: number };
    aac: { bitrate: string; profile: string };
    ogg: { quality: number };
    wav: { bitDepth: number; sampleRate: number };
  };
  effects: {
    normalize: boolean;
    denoise: boolean;
    compressor: boolean;
    equalizer: EqualizerSettings;
  };
  waveform: {
    generate: boolean;
    width: number;
    height: number;
    color: string;
  };
}

interface AudioConvertOptions {
  codec?: string;
  bitrate?: string;
  sampleRate?: number;
  channels?: number;
  volume?: number;
  normalize?: boolean;
  format?: string;
}

interface WaveformOptions {
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

interface AudioMetadata {
  duration: number;
  bitrate: number;
  sampleRate: number;
  channels: number;
  format: string;
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  genre?: string;
  track?: string;
  albumArt?: string;
}

interface EqualizerSettings {
  enabled: boolean;
  presets: string;
  customBands?: number[];
}
```

---

## 🎨 **Processing Interface**

### **Image Processing Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 🖼️ Image Processing                    [Batch Process] [AI Enhance] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Processing Queue ─────────────────────────────────┐   │
│ │ 📸 IMG_001.jpg (2.3MB) ████████████░░ 85%         │   │
│ │    🔄 Resizing to 1200x800 • ⏱️ 00:12 remaining    │   │
│ │                                                   │   │
│ │ 🖼️ photo.png (4.1MB) ██████████████ 100% ✅       │   │
│ │    ✅ Processed • 📊 Compressed 67% • 5 variants   │   │
│ │                                                   │   │
│ │ 🎨 artwork.svg (856KB) ████░░░░░░░░░░ 32%          │   │
│ │    🔄 Converting to PNG • ⏱️ 00:08 remaining       │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Processing Settings ──────────────────────────────┐   │
│ │ Output Format: [WebP ▼]  Quality: [85 ████████░░] │   │
│ │ ☑ Generate thumbnails    ☑ Auto-optimize          │   │
│ │ ☑ Strip metadata         ☑ Add watermark          │   │
│ │                                                   │   │
│ │ Sizes to Generate:                                 │   │
│ │ ☑ Thumbnail (150x150)    ☑ Small (400x300)       │   │
│ │ ☑ Medium (800x600)       ☑ Large (1200x900)      │   │
│ │ ☑ Original (maintain)    ☑ WebP variants          │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ AI Enhancement Options ───────────────────────────┐   │
│ │ Enhancement Type: [Super Resolution ▼]             │   │
│ │ Strength: [High ████████░░]                       │   │
│ │ ☑ Preserve details       ☑ Color correction       │   │
│ │ ☑ Noise reduction        ☐ Artistic enhancement   │   │
│ │                                                   │   │
│ │ [Preview Enhancement] [Apply to Selected]          │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Video Processing Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ 🎬 Video Processing                     [Queue] [Settings] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Current Processing ───────────────────────────────┐   │
│ │ 🎥 movie.mp4 (125MB) ████████░░░░ 67%             │   │
│ │    🔄 Transcoding to 720p • ⏱️ 02:15 remaining     │   │
│ │    📊 Speed: 2.3x • 🎯 Target: 45MB               │   │
│ │                                                   │   │
│ │ Current Operation: H.264 encoding                  │   │
│ │ Output: MP4 + WebM + HLS streaming                 │   │
│ │ Thumbnails: 5 generated                           │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Output Settings ──────────────────────────────────┐   │
│ │ Resolutions:                                       │   │
│ │ ☑ 4K (3840x2160)  Bitrate: [8000k ████████░░]    │   │
│ │ ☑ 1080p (1920x1080)  Bitrate: [4000k ██████░░░]  │   │
│ │ ☑ 720p (1280x720)   Bitrate: [2500k █████░░░░]   │   │
│ │ ☑ 480p (854x480)    Bitrate: [1000k ███░░░░░░]   │   │
│ │                                                   │   │
│ │ Formats: ☑ MP4  ☑ WebM  ☑ HLS Streaming          │   │
│ │ Codec: [H.264 ▼]  Audio: [AAC ▼]                 │   │
│ │ ☑ Two-pass encoding   ☑ Generate thumbnails       │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Processing Results ───────────────────────────────┐   │
│ │ Original: 125MB • Processed: 45MB (64% smaller)   │   │
│ │ Variants Generated: 8 files                       │   │
│ │ • movie_4k.mp4 (85MB)    • movie_4k.webm (78MB)  │   │
│ │ • movie_1080p.mp4 (45MB) • movie_1080p.webm (41MB) │   │
│ │ • movie_720p.mp4 (28MB)  • movie_720p.webm (25MB) │   │
│ │ • HLS playlist + 24 segments                      │   │
│ │ • 5 thumbnail images (JPG, 1280x720)              │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Image processing
POST   /api/media/process/image           // Process image
POST   /api/media/optimize/image          // Optimize image
POST   /api/media/enhance/ai              // AI enhancement
POST   /api/media/watermark               // Add watermark
POST   /api/media/resize                  // Resize image

// Video processing
POST   /api/media/process/video           // Process video
POST   /api/media/transcode               // Transcode video
POST   /api/media/thumbnails              // Generate thumbnails
POST   /api/media/hls                     // Generate HLS
POST   /api/media/preview                 // Create preview

// Audio processing
POST   /api/media/process/audio           // Process audio
POST   /api/media/convert/audio           // Convert audio
POST   /api/media/waveform                // Generate waveform
POST   /api/media/metadata/audio          // Extract metadata

// Processing management
GET    /api/media/processing/jobs         // List processing jobs
GET    /api/media/processing/jobs/{id}    // Get job status
POST   /api/media/processing/jobs/{id}/cancel // Cancel job
GET    /api/media/processing/queue        // Get queue status
```

### **Database Schema:**
```sql
-- Processing jobs
CREATE TABLE processing_jobs (
  id UUID PRIMARY KEY,
  file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  operations JSONB NOT NULL,
  priority VARCHAR(10) DEFAULT 'normal',
  status VARCHAR(20) DEFAULT 'queued',
  progress INTEGER DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error TEXT,
  result JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Processing queue
CREATE TABLE processing_queue (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES processing_jobs(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  next_attempt TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Media variants
CREATE TABLE media_variants (
  id UUID PRIMARY KEY,
  original_file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  variant_name VARCHAR(100) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  url VARCHAR(500) NOT NULL,
  width INTEGER,
  height INTEGER,
  size BIGINT NOT NULL,
  format VARCHAR(50) NOT NULL,
  quality INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(original_file_id, variant_name)
);

-- Processing analytics
CREATE TABLE processing_analytics (
  id UUID PRIMARY KEY,
  date DATE NOT NULL,
  total_jobs INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  failed_jobs INTEGER DEFAULT 0,
  avg_processing_time DECIMAL(10,2) DEFAULT 0,
  total_size_processed BIGINT DEFAULT 0,
  compression_ratio DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date)
);

-- Indexes for performance
CREATE INDEX idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX idx_processing_jobs_type ON processing_jobs(type);
CREATE INDEX idx_processing_queue_priority ON processing_queue(priority DESC);
CREATE INDEX idx_media_variants_original ON media_variants(original_file_id);
CREATE INDEX idx_processing_analytics_date ON processing_analytics(date);
```

---

## 🔗 **Related Documentation**

- **[Media Upload](./upload.md)** - File upload and validation
- **[Media Library](./library.md)** - File organization and management
- **[CDN Integration](./cdn.md)** - Processed file delivery
- **[Analytics](./analytics.md)** - Processing performance metrics

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
