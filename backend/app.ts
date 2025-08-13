import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

// Import middleware
import { errorHandler } from '@/middleware/error-handler';
import { requestLogger } from '@/middleware/requestLogger';
import { authenticateToken } from '@/middleware/auth-middleware';

// Import routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import postRoutes from '@/routes/posts';
import categoryRoutes from '@/routes/categories';
import tagRoutes from '@/routes/tags';
import mediaRoutes from '@/routes/media';
import menuRoutes from '@/routes/menus';
import settingRoutes from '@/routes/settings';
import editorRoutes from '@/routes/editor';
import analyticsRoutes from '@/routes/analytics';
import themeRoutes from '@/routes/theme-routes';
import dashboardRoutes from '@/routes/dashboard';
import dashboardSettingsRoutes from '@/routes/dashboard-settings';
import notificationRoutes from '@/routes/notifications';
import aiCategorizationRoutes from '@/routes/ai-categorization';
import categoryTemplateRoutes from '@/routes/category-templates';
import categoryRulesRoutes from '@/routes/category-rules';
import contentGapAnalysisRoutes from '@/routes/content-gap-analysis';
import enhancedSEORoutes from '@/routes/enhanced-seo';
import performanceOptimizationRoutes from '@/routes/performance-optimization';
import contentStatsRoutes from '@/routes/content-stats';
import advancedStatsRoutes from '@/routes/advanced-stats';
import aiPoweredStatsRoutes from '@/routes/ai-powered-stats';

// Import utils
import { logger } from '@/utils/logger';
import { connectDatabase } from '@/utils/database';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3001;
const HOST = process.env['HOST'] || 'localhost';

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: process.env['SWAGGER_TITLE'] || 'JA-CMS API',
      description: process.env['SWAGGER_DESCRIPTION'] || 'Modern Content Management System API',
      version: process.env['SWAGGER_VERSION'] || '1.0.0',
      contact: {
        name: 'JA-CMS Team',
        email: 'support@jacms.com',
      },
    },
    servers: [
      {
        url: `http://${HOST}:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '60000'), // 1 minute for development
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '1000'), // 1000 requests per minute for development
  message: {
    error: 'Terlalu banyak request dari IP ini, silakan coba lagi nanti.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check in development
    return process.env['NODE_ENV'] === 'development' && req.path === '/health';
  },
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);
app.use(requestLogger);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'],
  });
});

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/posts', authenticateToken, postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/media', authenticateToken, mediaRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/editor', editorRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dashboard-settings', dashboardSettingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai-categorization', aiCategorizationRoutes);
app.use('/api/category-templates', categoryTemplateRoutes);
app.use('/api/category-rules', categoryRulesRoutes);
app.use('/api/content-gap-analysis', contentGapAnalysisRoutes);
app.use('/api/enhanced-seo', enhancedSEORoutes);
app.use('/api/performance', performanceOptimizationRoutes);
app.use('/api/content', contentStatsRoutes);
app.use('/api/advanced', advancedStatsRoutes);
app.use('/api/ai-powered', aiPoweredStatsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint tidak ditemukan',
    message: `Route ${req.originalUrl} tidak tersedia`,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server berjalan di http://${HOST}:${PORT}`);
      logger.info(`📚 API Documentation: http://${HOST}:${PORT}/api/docs`);
      logger.info(`🔍 Health Check: http://${HOST}:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Gagal memulai server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise);
  logger.error('Reason:', reason);
  if (reason instanceof Error) {
    logger.error('Stack:', reason.stack);
  }
  // Don't exit in development, just log the error
  if (process.env['NODE_ENV'] === 'production') {
    process.exit(1);
  }
});

startServer();

export default app; 