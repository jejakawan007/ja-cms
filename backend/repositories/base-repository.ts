// Base Repository - Abstract base class untuk repository pattern
// Menggunakan Prisma client dan proper error handling

import { PrismaClient } from '@prisma/client';
import { ApiErrorHandler } from '../utils/api-error';
import { logger } from '../utils/logger';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface BaseRepositoryOptions {
  enableLogging?: boolean;
  enableSoftDelete?: boolean;
}

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected prisma: PrismaClient;
  protected enableLogging: boolean;
  protected enableSoftDelete: boolean;
  protected modelName: string;

  constructor(
    prisma: PrismaClient,
    modelName: string,
    options: BaseRepositoryOptions = {}
  ) {
    this.prisma = prisma;
    this.modelName = modelName;
    this.enableLogging = options.enableLogging ?? false;
    this.enableSoftDelete = options.enableSoftDelete ?? false;
  }

  /**
   * Find entity by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      if (this.enableLogging) {
        logger.debug(`${this.modelName} findById: ${id}`);
      }

      const result = await this.executeQuery(() => this.findByIdQuery(id));
      return result;
    } catch (error) {
      this.handleError('findById', error);
      return null;
    }
  }

  /**
   * Find all entities with pagination
   */
  async findAll(options: PaginationOptions = { page: 1, limit: 10 }): Promise<PaginationResult<T>> {
    try {
      if (this.enableLogging) {
        logger.debug(`${this.modelName} findAll:`, options);
      }

      const { page, limit } = options;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.executeQuery(() => this.findAllQuery({ skip, limit })),
        this.executeQuery(() => this.countQuery()),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
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
      this.handleError('findAll', error);
      throw error;
    }
  }

  /**
   * Create new entity
   */
  async create(data: CreateInput): Promise<T> {
    try {
      if (this.enableLogging) {
        logger.debug(`${this.modelName} create:`, data);
      }

      const result = await this.executeQuery(() => this.createQuery(data));
      return result;
    } catch (error) {
      this.handleError('create', error);
      throw error;
    }
  }

  /**
   * Update entity by ID
   */
  async update(id: string, data: UpdateInput): Promise<T | null> {
    try {
      if (this.enableLogging) {
        logger.debug(`${this.modelName} update: ${id}`, data);
      }

      const result = await this.executeQuery(() => this.updateQuery(id, data));
      return result;
    } catch (error) {
      this.handleError('update', error);
      throw error;
    }
  }

  /**
   * Delete entity by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      if (this.enableLogging) {
        logger.debug(`${this.modelName} delete: ${id}`);
      }

      if (this.enableSoftDelete) {
        await this.executeQuery(() => this.softDeleteQuery(id));
      } else {
        await this.executeQuery(() => this.hardDeleteQuery(id));
      }

      return true;
    } catch (error) {
      this.handleError('delete', error);
      return false;
    }
  }

  /**
   * Check if entity exists by ID
   */
  async exists(id: string): Promise<boolean> {
    try {
      const result = await this.findById(id);
      return result !== null;
    } catch (error) {
      this.handleError('exists', error);
      return false;
    }
  }

  /**
   * Count total entities
   */
  async count(): Promise<number> {
    try {
      const result = await this.executeQuery(() => this.countQuery());
      return result;
    } catch (error) {
      this.handleError('count', error);
      return 0;
    }
  }

  /**
   * Execute query with proper error handling
   */
  protected async executeQuery<R>(queryFn: () => Promise<R>): Promise<R> {
    try {
      return await queryFn();
    } catch (error) {
      this.handleError('executeQuery', error);
      throw error;
    }
  }

  /**
   * Handle errors with proper logging and error transformation
   */
  protected handleError(operation: string, error: any): void {
    const errorMessage = `${this.modelName} ${operation} failed`;
    
    if (this.enableLogging) {
      logger.error(errorMessage, {
        operation,
        modelName: this.modelName,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
    }

    // Transform Prisma errors to ApiError
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;
      
      switch (prismaError.code) {
        case 'P2002':
          throw ApiErrorHandler.conflict(`${this.modelName} already exists`);
        case 'P2025':
          throw ApiErrorHandler.notFound(`${this.modelName} not found`);
        case 'P2003':
          throw ApiErrorHandler.validation('Foreign key constraint failed');
        case 'P2014':
          throw ApiErrorHandler.validation('The change you are trying to make would violate the required relation');
        default:
          throw ApiErrorHandler.database(`${this.modelName} operation failed`);
      }
    }

    // Re-throw ApiError as is
    if (error instanceof ApiErrorHandler) {
      throw error;
    }

    // Transform unknown errors
    throw ApiErrorHandler.database(`${this.modelName} operation failed`);
  }

  // Abstract methods that must be implemented by subclasses
  protected abstract findByIdQuery(id: string): Promise<T | null>;
  protected abstract findAllQuery(options: { skip: number; limit: number }): Promise<T[]>;
  protected abstract createQuery(data: CreateInput): Promise<T>;
  protected abstract updateQuery(id: string, data: UpdateInput): Promise<T | null>;
  protected abstract deleteQuery(id: string): Promise<void>;
  protected abstract countQuery(): Promise<number>;

  // Soft delete implementation (optional)
  protected async softDeleteQuery(id: string): Promise<void> {
    // Default implementation - override in subclasses
    await this.deleteQuery(id);
  }

  // Hard delete implementation
  protected async hardDeleteQuery(id: string): Promise<void> {
    await this.deleteQuery(id);
  }
}
