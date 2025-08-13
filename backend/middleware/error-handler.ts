// Error Handler Middleware
// Menggunakan shared config untuk error messages

import { Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES, STATUS_CODES } from '@shared/config';

// Custom error classes
export class ValidationError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = STATUS_CODES.VALIDATION_ERROR;
    this.code = 'VALIDATION_ERROR';
  }
}

export class UnauthorizedError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = STATUS_CODES.UNAUTHORIZED;
    this.code = 'UNAUTHORIZED';
  }
}

export class ForbiddenError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = STATUS_CODES.FORBIDDEN;
    this.code = 'FORBIDDEN';
  }
}

export class NotFoundError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = STATUS_CODES.NOT_FOUND;
    this.code = 'NOT_FOUND';
  }
}

export class ConflictError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = STATUS_CODES.BAD_REQUEST;
    this.code = 'CONFLICT';
  }
}

// Error factory functions
export const createValidationError = (message: string): ValidationError => {
  return new ValidationError(message);
};

export const createUnauthorizedError = (message: string): UnauthorizedError => {
  return new UnauthorizedError(message);
};

export const createForbiddenError = (message: string): ForbiddenError => {
  return new ForbiddenError(message);
};

export const createNotFoundError = (message: string): NotFoundError => {
  return new NotFoundError(message);
};

export const createConflictError = (message: string): ConflictError => {
  return new ConflictError(message);
};

// Async handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Main error handler middleware
export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error untuk debugging
  if (process.env['NODE_ENV'] === 'development') {
    // eslint-disable-next-line no-console
    console.error('Error:', error);
  }

  // Default error response
  let statusCode: number = STATUS_CODES.INTERNAL_SERVER_ERROR;
  let message: string = ERROR_MESSAGES.INTERNAL_ERROR;
  let code: string = 'INTERNAL_ERROR';

  // Handle custom errors
  if (error instanceof ValidationError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
  } else if (error instanceof UnauthorizedError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
  } else if (error instanceof ForbiddenError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
  } else if (error instanceof NotFoundError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
  } else if (error instanceof ConflictError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
  } else if (error.name === 'PrismaClientKnownRequestError') {
    // Handle Prisma errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        statusCode = STATUS_CODES.BAD_REQUEST;
        message = ERROR_MESSAGES.DUPLICATE_ENTRY;
        code = 'DUPLICATE_ENTRY';
        break;
      case 'P2025':
        statusCode = STATUS_CODES.NOT_FOUND;
        message = ERROR_MESSAGES.RECORD_NOT_FOUND;
        code = 'RECORD_NOT_FOUND';
        break;
      case 'P2003':
        statusCode = STATUS_CODES.BAD_REQUEST;
        message = ERROR_MESSAGES.FOREIGN_KEY_CONSTRAINT;
        code = 'FOREIGN_KEY_CONSTRAINT';
        break;
      default:
        statusCode = STATUS_CODES.BAD_REQUEST;
        message = ERROR_MESSAGES.SOMETHING_WENT_WRONG;
        code = 'DATABASE_ERROR';
    }
  } else if (error.name === 'ZodError') {
    // Handle Zod validation errors
    statusCode = STATUS_CODES.VALIDATION_ERROR;
    message = error.message;
    code = 'VALIDATION_ERROR';
  } else if (error.name === 'JsonWebTokenError') {
    // Handle JWT errors
    statusCode = STATUS_CODES.UNAUTHORIZED;
    message = ERROR_MESSAGES.TOKEN_INVALID;
    code = 'INVALID_TOKEN';
  } else if (error.name === 'TokenExpiredError') {
    // Handle expired token errors
    statusCode = STATUS_CODES.UNAUTHORIZED;
    message = ERROR_MESSAGES.TOKEN_EXPIRED;
    code = 'EXPIRED_TOKEN';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: process.env['NODE_ENV'] === 'development' ? error.stack : undefined,
    },
  });
};

// Not found handler
export const notFoundHandler = (
  _req: Request, 
  res: Response
): void => {
  res.status(STATUS_CODES.NOT_FOUND).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: ERROR_MESSAGES.RECORD_NOT_FOUND,
    },
  });
};

// CORS middleware
export const corsHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.header('Access-Control-Allow-Origin', process.env['FRONTEND_URL'] || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}; 