// Validation Middleware - Request validation menggunakan Zod

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
}

export const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> => {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error,
      };
    }
    throw error;
  }
};

export const validateBody = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validateRequest(schema, req.body);
    
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Data tidak valid',
          details: result.errors?.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
      });
      return;
    }
    
    req.body = result.data;
    next();
  };
};

export const validateQuery = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validateRequest(schema, req.query);
    
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Query parameters tidak valid',
          details: result.errors?.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
      });
      return;
    }
    
    req.query = result.data as Record<string, string | string[] | undefined>;
    next();
  };
};

export const validateParams = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validateRequest(schema, req.params);
    
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Parameter tidak valid',
          details: result.errors?.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
      });
      return;
    }
    
    req.params = result.data as Record<string, string>;
    next();
  };
};
