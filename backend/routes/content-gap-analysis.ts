import express from 'express';
import contentGapAnalysisController from '../controllers/content-gap-analysis-controller';
import { authenticateToken } from '../middleware/auth-middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Analysis routes
router.post('/analyze/:categoryId', contentGapAnalysisController.analyzeCategoryGaps);
router.get('/results', contentGapAnalysisController.getAnalysisResults);
router.get('/statistics', contentGapAnalysisController.getAnalysisStatistics);
router.get('/export', contentGapAnalysisController.exportAnalysisResults);

// Recommendation routes
router.post('/recommendations', contentGapAnalysisController.createRecommendation);
router.get('/recommendations', contentGapAnalysisController.getRecommendations);
router.put('/recommendations/:id/status', contentGapAnalysisController.updateRecommendationStatus);

// Management routes
router.delete('/results/:id', contentGapAnalysisController.deleteAnalysisResult);
router.delete('/results/bulk', contentGapAnalysisController.bulkDeleteAnalysisResults);

export default router;
