// Users Controller - Business logic untuk user management
// Menggunakan shared types dan config

import { Request, Response } from 'express';
import { CreateUserRequest, UpdateUserRequest, UserSearchParams, UserRole } from '@shared/types';
import { UserService } from '../services/user-service';
import { createValidationError, createNotFoundError } from '../middleware/error-handler';

export class UsersController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Get all users with pagination and filters
  async getAllUsers(req: Request, res: Response): Promise<void> {
    const { page = 1, limit = 10, search, role, status } = req.query;
    
    const searchParams: UserSearchParams = {
      page: Number(page),
      limit: Number(limit),
      query: search as string,
      role: role as UserRole,
      isActive: status === 'active',
    };

    const result = await this.userService.getAllUsers(searchParams);
    
    res.json({
      success: true,
      data: result.users,
      pagination: result.pagination,
      message: 'Users berhasil diambil',
    });
  }

  // Get user by ID
  async getUserById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const user = await this.userService.getUserById(id);
    
    if (!user) {
      throw createNotFoundError('User tidak ditemukan');
    }
    
    res.json({
      success: true,
      data: user,
      message: 'User berhasil diambil',
    });
  }

  // Create new user
  async createUser(req: Request, res: Response): Promise<void> {
    const userData: CreateUserRequest = req.body;
    
    // Validate required fields
    if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
      throw createValidationError('Email, password, nama depan, dan nama belakang harus diisi');
    }
    
    const user = await this.userService.createUser(userData);
    
    res.status(201).json({
      success: true,
      data: user,
      message: 'User berhasil dibuat',
    });
  }

  // Update user
  async updateUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData: UpdateUserRequest = req.body;
    
    const user = await this.userService.updateUser(id, updateData);
    
    if (!user) {
      throw createNotFoundError('User tidak ditemukan');
    }
    
    res.json({
      success: true,
      data: user,
      message: 'User berhasil diupdate',
    });
  }

  // Delete user
  async deleteUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const success = await this.userService.deleteUser(id);
    
    if (!success) {
      throw createNotFoundError('User tidak ditemukan');
    }
    
    res.json({
      success: true,
      message: 'User berhasil dihapus',
    });
  }

  // Get user statistics
  async getUserStats(_req: Request, res: Response): Promise<void> {
    const stats = await this.userService.getUserStats();
    
    res.json({
      success: true,
      data: stats,
      message: 'Statistik user berhasil diambil',
    });
  }

  // Get users by role
  async getUsersByRole(req: Request, res: Response): Promise<void> {
    const { role } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await this.userService.getUsersByRole(role, {
      page: Number(page),
      limit: Number(limit),
    });
    
    res.json({
      success: true,
      data: result.users,
      pagination: result.pagination,
      message: `Users dengan role ${role} berhasil diambil`,
    });
  }

  // Search users
  async searchUsers(req: Request, res: Response): Promise<void> {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      throw createValidationError('Query pencarian diperlukan');
    }
    
    const users = await this.userService.searchUsers(q);
    
    res.json({
      success: true,
      data: users,
      message: 'Hasil pencarian user',
    });
  }
} 