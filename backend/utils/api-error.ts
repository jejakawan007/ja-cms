/**
 * API Error Handler
 * Centralized error handling for JA-CMS Backend API
 */

import { ApiError, ValidationError } from '@/types/api';

export class ApiErrorHandler extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_SERVER_ERROR',
    details?: unknown,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown): ApiErrorHandler {
    return new ApiErrorHandler(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message: string = 'Unauthorized', details?: unknown): ApiErrorHandler {
    return new ApiErrorHandler(message, 401, 'UNAUTHORIZED', details);
  }

  static forbidden(message: string = 'Forbidden', details?: unknown): ApiErrorHandler {
    return new ApiErrorHandler(message, 403, 'FORBIDDEN', details);
  }

  static notFound(message: string = 'Resource not found', details?: unknown): ApiErrorHandler {
    return new ApiErrorHandler(message, 404, 'NOT_FOUND', details);
  }

  static conflict(message: string, details?: unknown): ApiErrorHandler {
    return new ApiErrorHandler(message, 409, 'CONFLICT', details);
  }

  static validationError(errors: ValidationError[]): ApiErrorHandler {
    return new ApiErrorHandler(
      'Validation failed',
      422,
      'VALIDATION_ERROR',
      { errors }
    );
  }

  static validation(message: string, details?: unknown): ApiErrorHandler {
    return new ApiErrorHandler(message, 422, 'VALIDATION_ERROR', details);
  }

  static tooManyRequests(message: string = 'Too many requests', details?: unknown): ApiErrorHandler {
    return new ApiErrorHandler(message, 429, 'TOO_MANY_REQUESTS', details);
  }

  static internalServerError(message: string = 'Internal server error', details?: unknown): ApiErrorHandler {
    return new ApiErrorHandler(message, 500, 'INTERNAL_SERVER_ERROR', details);
  }

  static database(message: string = 'Database operation failed', details?: unknown): ApiErrorHandler {
    return new ApiErrorHandler(message, 500, 'DATABASE_ERROR', details);
  }

  static serviceUnavailable(message: string = 'Service unavailable', details?: unknown): ApiErrorHandler {
    return new ApiErrorHandler(message, 503, 'SERVICE_UNAVAILABLE', details);
  }

  toJSON(): ApiError {
    return {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

// Error codes for consistent error handling
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Resource Management
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  RESOURCE_IN_USE: 'RESOURCE_IN_USE',

  // File Operations
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',

  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',

  // External Services
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  API_RATE_LIMIT_EXCEEDED: 'API_RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // General
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
} as const;

// Error messages for consistent messaging
export const ErrorMessages = {
  // Authentication
  UNAUTHORIZED: 'You are not authorized to access this resource',
  FORBIDDEN: 'You do not have permission to perform this action',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Authentication token has expired',
  INVALID_TOKEN: 'Invalid authentication token',

  // Validation
  VALIDATION_FAILED: 'Validation failed',
  MISSING_REQUIRED_FIELD: (field: string) => `${field} is required`,
  INVALID_FORMAT: (field: string, format: string) => `${field} must be in ${format} format`,
  INVALID_LENGTH: (field: string, min: number, max: number) => 
    `${field} must be between ${min} and ${max} characters`,

  // Resources
  NOT_FOUND: (resource: string) => `${resource} not found`,
  ALREADY_EXISTS: (resource: string) => `${resource} already exists`,
  RESOURCE_IN_USE: (resource: string) => `${resource} is currently in use`,

  // Files
  FILE_TOO_LARGE: (maxSize: string) => `File size exceeds maximum allowed size of ${maxSize}`,
  INVALID_FILE_TYPE: (allowedTypes: string[]) => 
    `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
  FILE_UPLOAD_FAILED: 'Failed to upload file',

  // General
  INTERNAL_SERVER_ERROR: 'An internal server error occurred',
  BAD_REQUEST: 'Invalid request',
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',
} as const;

// Helper function to create validation errors
export function createValidationError(field: string, message: string, value?: unknown): ValidationError {
  return {
    field,
    message,
    value,
  };
}

// Helper function to check if error is operational
export function isOperationalError(error: Error): boolean {
  if (error instanceof ApiErrorHandler) {
    return error.isOperational;
  }
  return false;
}
