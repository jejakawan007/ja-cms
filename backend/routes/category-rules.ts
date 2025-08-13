import { Router } from 'express';
import categoryRulesController from '../controllers/category-rules-controller';
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Rule management routes
router.post('/', categoryRulesController.createRule.bind(categoryRulesController));
router.get('/', categoryRulesController.getAllRules.bind(categoryRulesController));
router.get('/category/:categoryId', categoryRulesController.getCategoryRules.bind(categoryRulesController));
router.get('/:id', categoryRulesController.getRuleById.bind(categoryRulesController));
router.put('/:id', categoryRulesController.updateRule.bind(categoryRulesController));
router.delete('/:id', categoryRulesController.deleteRule.bind(categoryRulesController));

// Rule execution routes
router.post('/execute/post/:postId', categoryRulesController.executeRulesForPost.bind(categoryRulesController));
router.get('/analyze/post/:postId', categoryRulesController.analyzePostContent.bind(categoryRulesController));

// Statistics and monitoring routes
router.get('/:ruleId/statistics', categoryRulesController.getRuleStatistics.bind(categoryRulesController));
router.get('/logs/executions', categoryRulesController.getExecutionLogs.bind(categoryRulesController));
router.delete('/logs/cleanup', categoryRulesController.cleanupOldLogs.bind(categoryRulesController));

export default router;
