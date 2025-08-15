/**
 * Utility Functions for JA-CMS Frontend
 * Central export for all utility functions
 */

// Date and time utilities
export * from './date-helpers';

// Validation utilities
export * from './validation-helpers';

// Format utilities
export * from './format-helpers';

// Common utilities
export * from './common-helpers';

// Storage utilities
export * from './storage-helpers';

// Class names utility
export * from './class-names';

// URL utilities
export * from './url-helpers';

// Media utilities - explicitly re-export to resolve naming conflicts
export {
  formatFileSize as formatFileSizeFromMedia,
  getFileExtension as getFileExtensionFromMedia,
  getFileTypeIcon,
  getStatusIcon,
  getFileTypeColor,
  isImageFile,
  isVideoFile,
  isAudioFile,
  getFileTypeCategory
} from './media-utils';
