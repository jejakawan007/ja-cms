// Auth Service - Business logic untuk authentication
// Menggunakan shared types dan config

import bcrypt from 'bcryptjs';
import { User, CreateUserRequest, UpdateUserRequest, UserRole } from '@shared/types';
import { UserModel } from '../models/user-model';
import { getAuthConfig } from '../config/auth';

export class AuthService {
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findByEmail(email);
  }

  // Find user by email with password (for authentication)
  async findUserByEmailWithPassword(email: string): Promise<(User & { password: string }) | null> {
    return this.userModel.findByEmailWithPassword(email);
  }

  // Find user by ID
  async findUserById(id: string): Promise<User | null> {
    return this.userModel.findById(id);
  }

  // Create new user
  async createUser(userData: CreateUserRequest): Promise<User> {
    const config = getAuthConfig();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, config.bcryptRounds);
    
    // Create user data
    const userToCreate = {
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      isActive: true,
    };

    return this.userModel.create(userToCreate);
  }

  // Update user
  async updateUser(userId: string, updateData: UpdateUserRequest): Promise<User> {
    return this.userModel.update(userId, updateData);
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const config = getAuthConfig();
    
    // Get user with password
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    // Get user with password for verification
    const userWithPassword = await this.userModel.findByEmailWithPassword(user.email);
    if (!userWithPassword) {
      throw new Error('User tidak ditemukan');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userWithPassword.password);
    if (!isCurrentPasswordValid) {
      return false;
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, config.bcryptRounds);

    // Update password
    await this.userModel.updatePassword(userId, hashedNewPassword);
    return true;
  }

  // Generate password reset token
  async generatePasswordResetToken(userId: string): Promise<string> {
    const config = getAuthConfig();
    
    // Generate random token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    
    // Hash token for storage
    const hashedToken = await bcrypt.hash(resetToken, config.bcryptRounds);
    
    // Store hashed token with expiration (1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // TODO: Store reset token in database
    // For now, we'll use a simple in-memory store (not production ready)
    this.resetTokens.set(resetToken, {
      userId,
      hashedToken,
      expiresAt,
    });
    
    return resetToken;
  }

  // Reset password with token
  async resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
    const config = getAuthConfig();
    
    // Get stored reset token data
    const resetData = this.resetTokens.get(token);
    if (!resetData) {
      return false;
    }

    // Check if token is expired
    if (new Date() > resetData.expiresAt) {
      this.resetTokens.delete(token);
      return false;
    }

    // Verify token
    const isValidToken = await bcrypt.compare(token, resetData.hashedToken);
    if (!isValidToken) {
      return false;
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, config.bcryptRounds);

    // Update password
    await this.userModel.updatePassword(resetData.userId, hashedNewPassword);
    
    // Remove used token
    this.resetTokens.delete(token);
    
    return true;
  }

  // In-memory store for reset tokens (replace with database in production)
  private resetTokens = new Map<string, {
    userId: string;
    hashedToken: string;
    expiresAt: Date;
  }>();

  // Verify password
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      return false;
    }

    // For now, we'll use a simple password check
    // In production, this should use bcrypt.compare()
    const userWithPassword = await this.userModel.findByEmailWithPassword(user.email);
    if (!userWithPassword) {
      return false;
    }

    // Simple password comparison (replace with bcrypt in production)
    return userWithPassword.password === password;
  }

  // Get user permissions
  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      return [];
    }

    // Import role permissions function
    const { getRolePermissions } = await import('../config/auth');
    return getRolePermissions(user.role);
  }

  // Check if user has permission
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }

  // Check if user has any of the required permissions
  async hasAnyPermission(userId: string, requiredPermissions: string[]): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return requiredPermissions.some(permission => permissions.includes(permission));
  }

  // Check if user has all required permissions
  async hasAllPermissions(userId: string, requiredPermissions: string[]): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return requiredPermissions.every(permission => permissions.includes(permission));
  }

  // Get users with pagination
  async getUsers(page: number = 1, limit: number = 10, filters?: unknown): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.userModel.findMany(page, limit, filters);
  }

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    await this.userModel.delete(userId);
  }

  // Activate/deactivate user
  async toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
    return this.userModel.update(userId, { isActive });
  }

  // Update user role
  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    return this.userModel.update(userId, { role });
  }
} 