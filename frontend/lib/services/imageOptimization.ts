/**
 * Image Optimization Service
 * Handles image compression, resizing, and format conversion
 */

export interface ImageOptimizationOptions {
  quality?: number; // 0-100
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'webp' | 'png';
  progressive?: boolean;
  stripMetadata?: boolean;
}

export interface OptimizedImage {
  blob: Blob;
  width: number;
  height: number;
  size: number;
  format: string;
  url: string;
}

export class ImageOptimizer {
  private static instance: ImageOptimizer;
  
  private constructor() {}
  
  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  /**
   * Optimize image with compression and resizing
   */
  async optimizeImage(
    file: File | Blob,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImage> {
    const {
      quality = 85,
      maxWidth = 1920,
      maxHeight = 1080,
      format = 'jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions
          const { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight
          );

          // Set canvas size
          canvas.width = width;
          canvas.height = height;

          // Apply optimization settings
          if (ctx) {
            // Enable image smoothing for better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw resized image
            ctx.drawImage(img, 0, 0, width, height);
          }

          // Convert to blob with specified format and quality
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                resolve({
                  blob,
                  width,
                  height,
                  size: blob.size,
                  format,
                  url
                });
              } else {
                reject(new Error('Failed to create optimized image'));
              }
            },
            `image/${format}`,
            quality / 100
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      // Load image from file/blob
      if (file instanceof File) {
        img.src = URL.createObjectURL(file);
      } else {
        img.src = URL.createObjectURL(file);
      }
    });
  }

  /**
   * Generate multiple sizes for responsive images
   */
  async generateResponsiveSizes(
    file: File | Blob,
    sizes: { width: number; height?: number }[],
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImage[]> {
    const results: OptimizedImage[] = [];

    for (const size of sizes) {
      const optimized = await this.optimizeImage(file, {
        ...options,
        maxWidth: size.width,
        maxHeight: size.height
      });
      results.push(optimized);
    }

    return results;
  }

  /**
   * Create thumbnail from image
   */
  async createThumbnail(
    file: File | Blob,
    width: number = 300,
    height: number = 200,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImage> {
    return this.optimizeImage(file, {
      ...options,
      maxWidth: width,
      maxHeight: height,
      quality: 80
    });
  }

  /**
   * Convert image to WebP format
   */
  async convertToWebP(
    file: File | Blob,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImage> {
    return this.optimizeImage(file, {
      ...options,
      format: 'webp',
      quality: 85
    });
  }

  /**
   * Calculate optimal dimensions maintaining aspect ratio
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Calculate aspect ratio
    const aspectRatio = width / height;

    // Resize if image is larger than max dimensions
    if (width > maxWidth || height > maxHeight) {
      if (width > height) {
        // Landscape
        width = maxWidth;
        height = width / aspectRatio;
        
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
      } else {
        // Portrait
        height = maxHeight;
        width = height * aspectRatio;
        
        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }
      }
    }

    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  /**
   * Get file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Calculate compression ratio
   */
  static calculateCompressionRatio(originalSize: number, optimizedSize: number): number {
    return ((originalSize - optimizedSize) / originalSize) * 100;
  }

  /**
   * Check if WebP is supported
   */
  static isWebPSupported(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Get recommended image format based on browser support
   */
  static getRecommendedFormat(): 'jpeg' | 'webp' | 'png' {
    if (this.isWebPSupported()) {
      return 'webp';
    }
    return 'jpeg';
  }
}

// Export singleton instance
export const imageOptimizer = ImageOptimizer.getInstance();
