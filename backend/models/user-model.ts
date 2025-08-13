// User Model - Data access layer untuk user
// Menggunakan shared types dan config

import { PrismaClient } from '@prisma/client';
import { User, CreateUserRequest, UpdateUserRequest, UserRole } from '@shared/types';
import { PAGINATION_CONFIG } from '@shared/config';

export class UserModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Find user by ID
  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          posts: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });

      return user as User | null;
    } catch (error) {
      // Log error silently in production
      return null;
    }
  }

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          posts: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });

      return user as User | null;
    } catch (error) {
      // Log error silently in production
      return null;
    }
  }

  // Find user by email with password (for authentication)
  async findByEmailWithPassword(email: string): Promise<(User & { password: string }) | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          password: true,
          firstName: true,
          lastName: true,
          avatar: true,
          bio: true,
          isActive: true,
          isVerified: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          posts: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });

      return user as (User & { password: string }) | null;
    } catch (error) {
      // Log error silently in production
      return null;
    }
  }

  // Create new user
  async create(userData: CreateUserRequest): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: userData.email,
          password: userData.password, // Should be hashed before calling this
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          isActive: true,
        },
        include: {
          posts: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });

      return user as User;
    } catch (error) {
      // Log error silently in production
      throw new Error('Gagal membuat user');
    }
  }

  // Update user
  async update(id: string, updateData: UpdateUserRequest): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
        include: {
          posts: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });

      return user as User;
    } catch (error) {
      // Log error silently in production
      throw new Error('Gagal memperbarui user');
    }
  }

  // Update password
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    } catch (error) {
      throw new Error('Failed to update password');
    }
  }

  // Delete user
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      // Log error silently in production
      throw new Error('Gagal menghapus user');
    }
  }

  // Find many users with pagination and filters
  async findMany(
    page: number = PAGINATION_CONFIG.DEFAULT_PAGE,
    limit: number = PAGINATION_CONFIG.DEFAULT_LIMIT,
    filters?: {
      role?: UserRole;
      isActive?: boolean;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      // Build where clause
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};
      
      if (filters?.role) {
        where.role = filters.role;
      }
      
      if (filters?.isActive !== undefined) {
        where.isActive = filters.isActive;
      }
      
      if (filters?.search) {
        where.OR = [
          { email: { contains: filters.search, mode: 'insensitive' } },
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      // Build order by
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orderBy: any = {};
      if (filters?.sortBy) {
        orderBy[filters.sortBy] = filters.sortOrder || 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get users and total count
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            posts: {
              select: {
                id: true,
                title: true,
                status: true,
                createdAt: true,
              },
            },
          },
        }),
        this.prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        users: users as User[],
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      // Log error silently in production
      throw new Error('Gagal mengambil data users');
    }
  }

  // Count users by role
  async countByRole(role: UserRole): Promise<number> {
    try {
      return await this.prisma.user.count({
        where: { role },
      });
    } catch (error) {
      // Log error silently in production
      return 0;
    }
  }

  // Count active users
  async countActive(): Promise<number> {
    try {
      return await this.prisma.user.count({
        where: { isActive: true },
      });
    } catch (error) {
      // Log error silently in production
      return 0;
    }
  }

  // Get users created in date range
  async findUsersInDateRange(startDate: Date, endDate: Date): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          posts: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });

      return users as User[];
    } catch (error) {
      // Log error silently in production
      return [];
    }
  }

  // Check if email exists
  async emailExists(email: string): Promise<boolean> {
    try {
      const count = await this.prisma.user.count({
        where: { email },
      });
      return count > 0;
    } catch (error) {
      // Log error silently in production
      return false;
    }
  }

  // Get user statistics
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
  }> {
    try {
      const [total, active, inactive, byRole] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.user.count({ where: { isActive: false } }),
        this.prisma.user.groupBy({
          by: ['role'],
          _count: { role: true },
        }),
      ]);

      const roleStats: Record<string, number> = {};
      byRole.forEach((item) => {
        roleStats[item.role] = item._count.role;
      });

      return {
        total,
        active,
        inactive,
        byRole: roleStats,
      };
    } catch (error) {
      // Log error silently in production
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byRole: {},
      };
    }
  }
} 