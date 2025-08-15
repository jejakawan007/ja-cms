import express from 'express';
import performanceOptimizationController from '../controllers/performance-optimization-controller';
import { authenticateToken } from '../middleware/auth-middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Cache Management routes
router.post('/cache', performanceOptimizationController.setCache);
router.get('/cache/:key', performanceOptimizationController.getCache);
router.delete('/cache/:key', performanceOptimizationController.deleteCache);
router.delete('/cache', performanceOptimizationController.clearCache);
router.get('/cache/stats', performanceOptimizationController.getCacheStats);

// Performance Monitoring routes
router.post('/metrics', performanceOptimizationController.recordMetric);
router.get('/metrics', performanceOptimizationController.getPerformanceMetrics);
router.get('/performance/summary', performanceOptimizationController.getPerformanceSummary);

// Rate Limiting routes
router.post('/rate-limit/log', performanceOptimizationController.logRateLimitAttempt);
router.get('/rate-limit/stats', performanceOptimizationController.getRateLimitStats);

// Optimization routes
router.post('/cache/optimize', performanceOptimizationController.optimizeCache);
router.get('/recommendations', performanceOptimizationController.getPerformanceRecommendations);

// System Health routes
router.get('/health', performanceOptimizationController.getSystemHealth);

export default router;
