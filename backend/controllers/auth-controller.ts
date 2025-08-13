// Auth Controller - Business logic untuk authentication
// Menggunakan shared types dan config

import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { LoginResponse, CreateUserRequest, JWTPayload } from '@shared/types';
import { getAuthConfig, validatePassword, getRolePermissions } from '../config/auth';
import { AuthService } from '../services/auth-service';
import { createValidationError, createUnauthorizedError, createConflictError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  firstName: z.string().min(2, 'Nama depan minimal 2 karakter'),
  lastName: z.string().min(2, 'Nama belakang minimal 2 karakter'),
  username: z.string().min(3, 'Username minimal 3 karakter').optional(),
  role: z.enum(['USER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN']).default('USER'),
});

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Login user
  async login(req: Request, res: Response): Promise<void> {
    logger.info('Login request received', { email: req.body.email });
    
    // Validate input
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      logger.warn('Login validation failed', { errors: validation.error.errors });
      throw createValidationError(validation.error.errors[0]?.message || 'Data tidak valid');
    }

    const { email, password } = validation.data;

    // Find user with password
    const userWithPassword = await this.authService.findUserByEmailWithPassword(email);
    if (!userWithPassword || !userWithPassword.isActive) {
      throw createUnauthorizedError('Email atau password salah');
    }

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, userWithPassword.password);
    if (!isValidPassword) {
      throw createUnauthorizedError('Email atau password salah');
    }

    // Remove password from user object
    const { password: _, ...user } = userWithPassword;

    // Generate tokens
    const config = getAuthConfig();
    const permissions = getRolePermissions(user.role);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokenOptions: SignOptions = { expiresIn: config.jwtExpiresIn as any };
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions,
      },
      config.jwtSecret,
      tokenOptions
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const refreshTokenOptions: SignOptions = { expiresIn: config.refreshTokenExpiresIn as any };
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        type: 'refresh',
      },
      config.jwtSecret,
      refreshTokenOptions
    );

    // Include permissions and default preferences in user object for frontend
    const userWithExtras = {
      ...user,
      permissions,
      preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
          desktop: true,
        },
        dashboard: {
          layout: 'grid',
          widgets: ['stats', 'recent-posts', 'recent-activity'],
        },
      },
    };

    const response: LoginResponse = {
      user: userWithExtras,
      token,
      refreshToken,
    };

    res.json({
      success: true,
      data: response,
      message: 'Login berhasil',
    });
  }

  // Register user
  async register(req: Request, res: Response): Promise<void> {
    // Validate input
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      throw createValidationError(validation.error.errors[0]?.message || 'Data tidak valid');
    }

    const userData: CreateUserRequest = {
      email: validation.data.email,
      password: validation.data.password,
      firstName: validation.data.firstName,
      lastName: validation.data.lastName,
      role: validation.data.role,
    };

    // Validate password
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      throw createValidationError(passwordValidation.errors.join(', '));
    }

    // Check if user already exists
    const existingUser = await this.authService.findUserByEmail(userData.email);
    if (existingUser) {
      throw createConflictError('Email sudah terdaftar');
    }

    // Create user
    const user = await this.authService.createUser(userData);

    // Auto-login user after registration
    const config = getAuthConfig();
    const permissions = getRolePermissions(user.role);
    
    // Generate tokens for the new user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokenOptions: SignOptions = { expiresIn: config.jwtExpiresIn as any };
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions,
      },
      config.jwtSecret,
      tokenOptions
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const refreshTokenOptions: SignOptions = { expiresIn: config.refreshTokenExpiresIn as any };
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        type: 'refresh',
      },
      config.jwtSecret,
      refreshTokenOptions
    );

    // Include permissions and default preferences in user object for frontend
    const userWithExtras = {
      ...user,
      permissions,
      preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
          desktop: true,
        },
        dashboard: {
          layout: 'grid',
          widgets: ['stats', 'recent-posts', 'recent-activity'],
        },
      },
    };

    const response: LoginResponse = {
      user: userWithExtras,
      token,
      refreshToken,
    };

    res.status(201).json({
      success: true,
      data: response,
      message: 'User berhasil dibuat dan login otomatis',
    });
  }

  // Logout user
  async logout(_req: Request, res: Response): Promise<void> {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success response
    res.json({
      success: true,
      message: 'Logout berhasil',
    });
  }

  // Refresh token
  async refreshToken(req: Request, res: Response): Promise<void> {
    logger.info('Refresh token request received');
    
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw createValidationError('Refresh token diperlukan');
    }

    try {
      const config = getAuthConfig();
      const decoded = jwt.verify(refreshToken, config.jwtSecret) as JWTPayload;
      
      if (decoded.type !== 'refresh') {
        throw createUnauthorizedError('Invalid refresh token');
      }

      const user = await this.authService.findUserById(decoded.userId);
      if (!user || !user.isActive) {
        throw createUnauthorizedError('User tidak ditemukan atau tidak aktif');
      }

      const permissions = getRolePermissions(user.role);
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          permissions,
        },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: { token },
      });
    } catch (error) {
      throw createUnauthorizedError('Invalid refresh token');
    }
  }

  // Request password reset
  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    logger.info('Password reset request received', { email: req.body.email });
    
    const { email } = req.body;
    if (!email) {
      throw createValidationError('Email diperlukan');
    }

    const user = await this.authService.findUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      res.json({
        success: true,
        message: 'Jika email terdaftar, link reset password akan dikirim',
      });
      return;
    }

    // Generate reset token
    const resetToken = await this.authService.generatePasswordResetToken(user.id);
    
    // TODO: Send email with reset link
    // For now, just return the token (in production, send via email)
    res.json({
      success: true,
      message: 'Link reset password telah dikirim ke email Anda',
      data: { resetToken }, // Remove this in production
    });
  }

  // Reset password
  async resetPassword(req: Request, res: Response): Promise<void> {
    logger.info('Password reset attempt');
    
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      throw createValidationError('Token dan password baru diperlukan');
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw createValidationError(passwordValidation.errors[0] || 'Password tidak valid');
    }

    const success = await this.authService.resetPasswordWithToken(token, newPassword);
    if (!success) {
      throw createUnauthorizedError('Token reset password tidak valid atau sudah kadaluarsa');
    }

    res.json({
      success: true,
      message: 'Password berhasil diubah',
    });
  }

  // Change password (for logged in users)
  async changePassword(req: Request, res: Response): Promise<void> {
    logger.info('Password change request', { userId: req.user?.userId });
    
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw createValidationError('Password lama dan baru diperlukan');
    }

    const userId = req.user?.userId;
    if (!userId) {
      throw createUnauthorizedError('User tidak terautentikasi');
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw createValidationError(passwordValidation.errors[0] || 'Password tidak valid');
    }

    const success = await this.authService.changePassword(userId, currentPassword, newPassword);
    if (!success) {
      throw createUnauthorizedError('Password lama tidak benar');
    }

    res.json({
      success: true,
      message: 'Password berhasil diubah',
    });
  }

  // Get current user
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    const userId = (req as Request & { user?: { userId: string } }).user?.userId;
    if (!userId) {
      throw createUnauthorizedError('User tidak terautentikasi');
    }

    const user = await this.authService.findUserById(userId);
    if (!user || !user.isActive) {
      throw createUnauthorizedError('User tidak ditemukan');
    }

    // Include permissions and default preferences in user object for frontend
    const permissions = getRolePermissions(user.role);
    const userWithExtras = {
      ...user,
      permissions,
      preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
          desktop: true,
        },
        dashboard: {
          layout: 'grid',
          widgets: ['stats', 'recent-posts', 'recent-activity'],
        },
      },
    };

    res.json({
      success: true,
      data: userWithExtras,
      message: 'User ditemukan',
    });
  }

  // Update user profile
  async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = (req as Request & { user?: { userId: string } }).user?.userId;
    if (!userId) {
      throw createUnauthorizedError('User tidak terautentikasi');
    }

    const user = await this.authService.updateUser(userId, req.body);

    res.json({
      success: true,
      data: user,
      message: 'Profile berhasil diperbarui',
    });
  }
} 