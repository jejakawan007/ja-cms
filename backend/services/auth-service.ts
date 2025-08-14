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
  async changePassword(userId: string, _currentPassword: string, _newPassword: string): Promise<void> {
    // Get current user with password (using raw query or separate method)
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    // Note: Password verification should be handled by a separate method
    // that can access the password field from the database
    // For now, we'll skip password verification in this method
    
    // Hash new password
    // const config = getAuthConfig();
    // const _hashedPassword = await bcrypt.hash(newPassword, config.bcryptRounds);

    // Update password using a separate method that can handle password updates
    // This would require extending the UserModel to handle password updates
    throw new Error('Password update not implemented - requires UserModel extension');
  }

  // Verify password
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      return false;
    }

    const userWithPassword = await this.userModel.findByEmailWithPassword(user.email);
    if (!userWithPassword) {
      return false;
    }

    return await bcrypt.compare(password, userWithPassword.password);
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