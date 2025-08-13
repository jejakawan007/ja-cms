// Database configuration untuk backend
// Menggunakan shared config

import { DATABASE_CONFIG } from '@shared/config';

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  dialect: 'mysql' | 'postgresql' | 'sqlite';
  logging: boolean;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

export const getDatabaseConfig = (): DatabaseConfig => {
  const isDevelopment = process.env['NODE_ENV'] === 'development';
  
  return {
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432'),
    username: process.env['DB_USERNAME'] || 'postgres',
    password: process.env['DB_PASSWORD'] || '',
    database: process.env['DB_NAME'] || 'ja_cms',
    dialect: (process.env['DB_DIALECT'] as 'mysql' | 'postgresql' | 'sqlite') || 'postgresql',
    logging: isDevelopment,
    pool: {
      max: DATABASE_CONFIG.CONNECTION_LIMIT,
      min: 0,
      acquire: DATABASE_CONFIG.ACQUIRE_TIMEOUT,
      idle: DATABASE_CONFIG.TIMEOUT,
    },
  };
};

export const getDatabaseUrl = (): string => {
  const config = getDatabaseConfig();
  
  if (config.dialect === 'sqlite') {
    return `file:./dev.db`;
  }
  
  return `${config.dialect}://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
};

export const validateDatabaseConfig = (): void => {
  const requiredEnvVars = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required database environment variables: ${missingVars.join(', ')}`);
  }
}; 