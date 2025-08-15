/**
 * Media Utility Functions
 * Consolidated utility functions for media components
 */

import React from 'react';
import { formatBytes } from './format-helpers';
import {
  Image,
  Video,
  Music,
  FileText,
  Archive,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock
} from 'lucide-react';
import { ReactElement } from 'react';

/**
 * Format file size with consistent behavior across all media components
 * @param bytes - File size in bytes
 * @param precision - Number of decimal places (default: 2)
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number, precision: number = 2): string => {
  return formatBytes(bytes, precision, false); // false = long units (Bytes, KB, MB)
};

/**
 * Get appropriate icon for file type based on MIME type
 * @param mimeType - File MIME type
 * @returns Lucide icon component
 */
export const getFileTypeIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.startsWith('video/')) return Video;
  if (mimeType.startsWith('audio/')) return Music;
  if (mimeType.includes('pdf')) return FileText;
  if (mimeType.includes('document') || mimeType.includes('word')) return FileText;
  return Archive;
};

/**
 * Get status icon based on status string
 * @param status - Status string (success, warning, error, processing, etc.)
 * @returns React element with appropriate icon
 */
export const getStatusIcon = (status: string): ReactElement => {
  switch (status.toLowerCase()) {
    case 'success':
    case 'completed':
      return React.createElement(CheckCircle, { className: "h-4 w-4 text-green-500" });
    case 'warning':
      return React.createElement(AlertTriangle, { className: "h-4 w-4 text-yellow-500" });
    case 'error':
    case 'failed':
      return React.createElement(XCircle, { className: "h-4 w-4 text-red-500" });
    case 'processing':
      return React.createElement(Clock, { className: "h-4 w-4 text-blue-500 animate-spin" });
    case 'pending':
      return React.createElement(Clock, { className: "h-4 w-4 text-gray-500" });
    default:
      return React.createElement(Clock, { className: "h-4 w-4 text-gray-500" });
  }
};

/**
 * Get file type color classes for styling
 * @param mimeType - File MIME type
 * @returns CSS classes for file type styling
 */
export const getFileTypeColor = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (mimeType.startsWith('video/')) return 'bg-red-100 text-red-800 border-red-200';
  if (mimeType.startsWith('audio/')) return 'bg-green-100 text-green-800 border-green-200';
  if (mimeType.includes('pdf')) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'bg-purple-100 text-purple-800 border-purple-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Check if file is an image based on MIME type
 * @param mimeType - File MIME type
 * @returns True if file is an image
 */
export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

/**
 * Check if file is a video based on MIME type
 * @param mimeType - File MIME type
 * @returns True if file is a video
 */
export const isVideoFile = (mimeType: string): boolean => {
  return mimeType.startsWith('video/');
};

/**
 * Check if file is an audio based on MIME type
 * @param mimeType - File MIME type
 * @returns True if file is an audio
 */
export const isAudioFile = (mimeType: string): boolean => {
  return mimeType.startsWith('audio/');
};

/**
 * Get file extension from filename
 * @param filename - File name
 * @returns File extension (without dot)
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Get file type category for grouping
 * @param mimeType - File MIME type
 * @returns File type category (image, video, audio, document, other)
 */
export const getFileTypeCategory = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word')) return 'document';
  return 'other';
};
