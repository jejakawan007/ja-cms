import { Router } from 'express';
import { analyticsController } from '../controllers/analytics-controller';
import { authenticateToken } from '../middleware/auth-middleware';

// Import category analytics routes
import categoryAnalyticsRoutes from './category-analytics';

const router = Router();

// Apply authentication middleware to all analytics routes
router.use(authenticateToken);

// Mount category analytics routes
router.use('/categories', categoryAnalyticsRoutes);

// Legacy analytics endpoints (keeping for backward compatibility)
router.get('/legacy', analyticsController.getAnalytics.bind(analyticsController));
router.get('/legacy/realtime', analyticsController.getRealTimeAnalytics.bind(analyticsController));
router.get('/legacy/content', analyticsController.getContentAnalytics.bind(analyticsController));
router.get('/legacy/users', analyticsController.getUserAnalytics.bind(analyticsController));
router.get('/legacy/export', analyticsController.exportAnalytics.bind(analyticsController));

export default router; 