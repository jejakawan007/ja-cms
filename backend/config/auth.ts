// Authentication configuration untuk backend
// Menggunakan shared config

import { AUTH_CONFIG } from '@shared/config';

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenExpiresIn: string;
  passwordMinLength: number;
  sessionTimeout: number;
  bcryptRounds: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
}

export const getAuthConfig = (): AuthConfig => {
  return {
    jwtSecret: AUTH_CONFIG.JWT_SECRET,
    jwtExpiresIn: AUTH_CONFIG.JWT_EXPIRES_IN,
    refreshTokenExpiresIn: AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
    passwordMinLength: AUTH_CONFIG.PASSWORD_MIN_LENGTH,
    sessionTimeout: AUTH_CONFIG.SESSION_TIMEOUT,
    bcryptRounds: 12,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  };
};

export const validateAuthConfig = (): void => {
  const config = getAuthConfig();
  
  if (!config.jwtSecret || config.jwtSecret === 'your-secret-key') {
    throw new Error('JWT_SECRET must be set in environment variables');
  }
  
  if (config.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
};

// Import shared types and utils
import { JWTPayload } from '@shared/types';
import { validatePassword as sharedValidatePassword } from '@shared/utils';

// Token validation (backend-specific)
export const validateToken = (token: string): boolean => {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload;
  } catch {
    return null;
  }
};

// Password validation (backend-specific with additional requirements)
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const sharedValidation = sharedValidatePassword(password);
  const errors = [...sharedValidation.errors];
  const config = getAuthConfig();
  
  // Additional backend-specific validation
  if (password.length < config.passwordMinLength) {
    errors.push(`Password minimal ${config.passwordMinLength} karakter`);
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password harus mengandung karakter khusus');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Role permissions
export const getRolePermissions = (role: string): string[] => {
  const permissions: Record<string, string[]> = {
    SUPER_ADMIN: [
      'manage_users',
      'manage_posts',
      'publish_posts',
      'manage_categories',
      'manage_tags',
      'manage_media',
      'manage_settings',
      'view_analytics',
      'manage_menus',
      'manage_system',
    ],
    ADMIN: [
      'manage_users',
      'manage_posts',
      'publish_posts',
      'manage_categories',
      'manage_tags',
      'manage_media',
      'manage_settings',
      'view_analytics',
      'manage_menus',
    ],
    EDITOR: [
      'manage_posts',
      'publish_posts',
      'manage_categories',
      'manage_tags',
      'manage_media',
      'view_analytics',
    ],
    USER: [
      'view_posts',
      'view_analytics',
    ],
  };
  
  return permissions[role] || [];
};

export const hasPermission = (userRole: string, permission: string): boolean => {
  const permissions = getRolePermissions(userRole);
  return permissions.includes(permission);
};

export const hasAnyPermission = (userRole: string, requiredPermissions: string[]): boolean => {
  const permissions = getRolePermissions(userRole);
  return requiredPermissions.some(permission => permissions.includes(permission));
};

export const hasAllPermissions = (userRole: string, requiredPermissions: string[]): boolean => {
  const permissions = getRolePermissions(userRole);
  return requiredPermissions.every(permission => permissions.includes(permission));
}; 