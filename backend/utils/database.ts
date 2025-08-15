import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Create Prisma client instance
export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Log database queries in development
if (process.env['NODE_ENV'] === 'development') {
  prisma.$on('query', (e: { query: string; params: string; duration: number }) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Params: ${e.params}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
}

// Log database errors
prisma.$on('error', (e: { message: string }) => {
  logger.error('Database error:', e);
});

// Log database info
prisma.$on('info', (e: { message: string }) => {
  logger.info('Database info:', e);
});

// Log database warnings
prisma.$on('warn', (e: { message: string }) => {
  logger.warn('Database warning:', e);
});

// Connect to database
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('✅ Database berhasil terhubung');
  } catch (error) {
    logger.error('❌ Gagal terhubung ke database:', error);
    throw error;
  }
};

// Disconnect from database
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('✅ Database berhasil terputus');
  } catch (error) {
    logger.error('❌ Gagal memutuskan koneksi database:', error);
    throw error;
  }
};

// Health check database
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

// Export Prisma client as default
export default prisma; 