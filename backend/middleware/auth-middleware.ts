// Auth Middleware - Authentication dan Authorization
// Menggunakan shared types dan config

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '@shared/types';
import { getAuthConfig, hasPermission, hasAnyPermission } from '../config/auth';
import { createUnauthorizedError, createForbiddenError } from './error-handler';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// Authenticate JWT token
export const authenticateToken = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    throw createUnauthorizedError('Token diperlukan');
  }

  try {
    const config = getAuthConfig();
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    
    // Add user to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createUnauthorizedError('Token telah kadaluarsa');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw createUnauthorizedError('Token tidak valid');
    } else {
      throw createUnauthorizedError('Token tidak valid');
    }
  }
};

// Optional authentication - doesn't throw error if no token
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const config = getAuthConfig();
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    req.user = decoded;
  } catch (error) {
    // Don't throw error, just continue without user
  }

  next();
};

// Check if user has specific permission
export const requirePermission = (permission: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createUnauthorizedError('Autentikasi diperlukan');
    }

    if (!hasPermission(req.user.role, permission)) {
      throw createForbiddenError('Anda tidak memiliki izin untuk mengakses resource ini');
    }

    next();
  };
};

// Check if user has any of the required permissions
export const requireAnyPermission = (permissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createUnauthorizedError('Autentikasi diperlukan');
    }

    if (!hasAnyPermission(req.user.role, permissions)) {
      throw createForbiddenError('Anda tidak memiliki izin untuk mengakses resource ini');
    }

    next();
  };
};

// Check if user has all required permissions
export const requireAllPermissions = (permissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createUnauthorizedError('Autentikasi diperlukan');
    }

    const hasAllPermissions = permissions.every(permission => 
      hasPermission(req.user?.role || '', permission)
    );

    if (!hasAllPermissions) {
      throw createForbiddenError('Anda tidak memiliki izin untuk mengakses resource ini');
    }

    next();
  };
};

// Check if user has specific role
export const requireRole = (role: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createUnauthorizedError('Autentikasi diperlukan');
    }

    if (req.user.role !== role) {
      throw createForbiddenError('Anda tidak memiliki role yang diperlukan');
    }

    next();
  };
};

// Check if user has any of the required roles
export const requireAnyRole = (roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createUnauthorizedError('Autentikasi diperlukan');
    }

    if (!roles.includes(req.user.role)) {
      throw createForbiddenError('Anda tidak memiliki role yang diperlukan');
    }

    next();
  };
};

// Check if user has minimum required role
export const requireMinRole = (minRole: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createUnauthorizedError('Autentikasi diperlukan');
    }

    const roleHierarchy = {
      'SUPER_ADMIN': 4,
      'ADMIN': 3,
      'EDITOR': 2,
      'USER': 1,
    };

    const userRoleLevel = roleHierarchy[req.user.role as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel = roleHierarchy[minRole as keyof typeof roleHierarchy] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      throw createForbiddenError('Anda tidak memiliki role yang cukup');
    }

    next();
  };
};

// Rate limiting middleware
export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, _res: Response, next: NextFunction): void => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const userRequests = requests.get(ip);

    if (!userRequests || now > userRequests.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
    } else {
      userRequests.count++;
      if (userRequests.count > maxRequests) {
        throw createForbiddenError('Terlalu banyak request');
      }
    }

    next();
  };
};

// API Key authentication
export const authenticateApiKey = (req: Request, _res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    throw createUnauthorizedError('API key diperlukan');
  }

  const validApiKeys = process.env['VALID_API_KEYS']?.split(',') || [];

  if (!validApiKeys.includes(apiKey)) {
    throw createUnauthorizedError('API key tidak valid');
  }

  next();
};

// Authentication logger
export const authLogger = (_req: Request, _res: Response, next: NextFunction): void => {
  // const startTime = Date.now();
  
  next();
  
  // const duration = Date.now() - startTime;
  // Log authentication info silently in production
}; 