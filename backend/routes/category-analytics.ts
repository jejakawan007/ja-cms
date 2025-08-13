import { Router } from 'express';
import { categoryAnalyticsController } from '../controllers/category-analytics-controller';
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();

// Apply authentication middleware to all category analytics routes
router.use(authenticateToken);

// Get category analytics overview
router.get('/', categoryAnalyticsController.getCategoryAnalytics.bind(categoryAnalyticsController));

// Get detailed analytics for specific category
router.get('/:categoryId', categoryAnalyticsController.getCategoryDetailAnalytics.bind(categoryAnalyticsController));

// Get category performance metrics
router.get('/:categoryId/performance', categoryAnalyticsController.getCategoryPerformance.bind(categoryAnalyticsController));

// Get content gaps analysis for category
router.get('/:categoryId/content-gaps', categoryAnalyticsController.getCategoryContentGaps.bind(categoryAnalyticsController));

export default router;
