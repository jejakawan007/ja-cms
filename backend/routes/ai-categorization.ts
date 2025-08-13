import { Router } from 'express';
import { aiCategorizationController } from '../controllers/ai-categorization-controller';
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();

// Apply authentication middleware to all AI categorization routes
router.use(authenticateToken);

// Get category suggestions for a specific post
router.get('/posts/:postId/suggestions', aiCategorizationController.getCategorySuggestions.bind(aiCategorizationController));

// Auto-categorize all uncategorized posts
router.post('/auto-categorize', aiCategorizationController.autoCategorizePosts.bind(aiCategorizationController));

// Get all category suggestions for manual review
router.get('/suggestions/review', aiCategorizationController.getCategorySuggestionsForReview.bind(aiCategorizationController));

// Apply category suggestion to a post
router.post('/suggestions/apply', aiCategorizationController.applyCategorySuggestion.bind(aiCategorizationController));

// Analyze content and get insights
router.post('/analyze', aiCategorizationController.analyzeContent.bind(aiCategorizationController));

// Get AI categorization statistics
router.get('/stats', aiCategorizationController.getCategorizationStats.bind(aiCategorizationController));

export default router;
