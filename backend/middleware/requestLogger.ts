import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  // Log request
  logger.info(`📥 ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userId: (req as any).user?.userId || 'anonymous',
  });

  // Override res.end to log response
  const originalEnd = res.end;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res.end = function(chunk?: unknown, encoding?: any): Response {
    const duration = Date.now() - start;
    
    // Log response
    logger.info(`📤 ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId: (req as any).user?.userId || 'anonymous',
    });

    // Call original end
    return originalEnd.call(this, chunk, encoding);
  };

  next();
}; 