// User Repository - Data access layer untuk user operations
// Menggunakan base repository dan proper error handling

import { User, CreateUserRequest, UpdateUserRequest, UserRole } from '@shared/types';
import { BaseRepository } from './base-repository';
import { prisma } from '../utils/database';

export class UserRepository extends BaseRepository<User, CreateUserRequest, UpdateUserRequest> {
  constructor() {
    super(prisma, 'User', {
      enableLogging: process.env['NODE_ENV'] === 'development',
      enableSoftDelete: false, // Users should be hard deleted for security
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.executeQuery(() => 
        prisma.user.findUnique({
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
        })
      );

      return user as User | null;
    } catch (error) {
      this.handleError('findByEmail', error);
      return null;
    }
  }

  /**
   * Find user by email with password (for authentication)
   */
  async findByEmailWithPassword(email: string): Promise<(User & { password: string }) | null> {
    try {
      const user = await this.executeQuery(() =>
        prisma.user.findUnique({
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
        })
      );

      return user as (User & { password: string }) | null;
    } catch (error) {
      this.handleError('findByEmailWithPassword', error);
      return null;
    }
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole, options: { page: number; limit: number } = { page: 1, limit: 10 }) {
    try {
      const { page, limit } = options;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        this.executeQuery(() =>
          prisma.user.findMany({
            where: { role },
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
            orderBy: { createdAt: 'desc' },
          })
        ),
        this.executeQuery(() =>
          prisma.user.count({ where: { role } })
        ),
      ]);

      const totalPages = Math.ceil((total as number) / limit);

      return {
        users: users as User[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      this.handleError('findByRole', error);
      throw error;
    }
  }

  /**
   * Search users with filters
   */
  async searchUsers(filters: {
    search?: string;
    role?: UserRole;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    try {
      const { search, role, isActive, page = 1, limit = 10 } = filters;
      const skip = (page - 1) * limit;

      const whereClause: any = {};

      if (search) {
        whereClause.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (role) {
        whereClause.role = role;
      }

      if (typeof isActive === 'boolean') {
        whereClause.isActive = isActive;
      }

      const [users, total] = await Promise.all([
        this.executeQuery(() =>
          prisma.user.findMany({
            where: whereClause,
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
            orderBy: { createdAt: 'desc' },
          })
        ),
        this.executeQuery(() =>
          prisma.user.count({ where: whereClause })
        ),
      ]);

      const totalPages = Math.ceil((total as number) / limit);

      return {
        users: users as User[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      this.handleError('searchUsers', error);
      throw error;
    }
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    try {
      await this.executeQuery(() =>
        prisma.user.update({
          where: { id: userId },
          data: { password: hashedPassword },
        })
      );
    } catch (error) {
      this.handleError('updatePassword', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    try {
      const [total, active, inactive, byRole, recentSignups] = await Promise.all([
        this.executeQuery(() => prisma.user.count()),
        this.executeQuery(() => prisma.user.count({ where: { isActive: true } })),
        this.executeQuery(() => prisma.user.count({ where: { isActive: false } })),
        this.executeQuery(() =>
          prisma.user.groupBy({
            by: ['role'],
            _count: { role: true },
          })
        ),
        this.executeQuery(() =>
          prisma.user.count({
            where: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
              },
            },
          })
        ),
      ]);

      const roleStats = (byRole as any[]).reduce((acc, item) => {
        acc[item.role] = item._count.role;
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        active,
        inactive,
        byRole: roleStats,
        recentSignups,
      };
    } catch (error) {
      this.handleError('getUserStats', error);
      throw error;
    }
  }

  // Abstract method implementations
  protected async findByIdQuery(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
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
  }

  protected async findAllQuery(options: { skip: number; limit: number }): Promise<User[]> {
    const users = await prisma.user.findMany({
      skip: options.skip,
      take: options.limit,
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
      orderBy: { createdAt: 'desc' },
    });

    return users as User[];
  }

  protected async createQuery(data: CreateUserRequest): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'USER',
        isActive: true,
        isVerified: false,
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
  }

  protected async updateQuery(id: string, data: UpdateUserRequest): Promise<User | null> {
    const updateData: any = {};
    
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    
    const user = await prisma.user.update({
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
  }

  protected async deleteQuery(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  protected async countQuery(): Promise<number> {
    return prisma.user.count();
  }
}
