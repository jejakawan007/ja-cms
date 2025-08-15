import { Router } from 'express';
import { categoryTemplateController } from '../controllers/category-template-controller';
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();

// Apply authentication middleware to all category template routes
router.use(authenticateToken);

// Template Management
router.post('/', categoryTemplateController.createTemplate.bind(categoryTemplateController));
router.get('/', categoryTemplateController.getTemplates.bind(categoryTemplateController));
router.get('/:id', categoryTemplateController.getTemplateById.bind(categoryTemplateController));
router.put('/:id', categoryTemplateController.updateTemplate.bind(categoryTemplateController));
router.delete('/:id', categoryTemplateController.deleteTemplate.bind(categoryTemplateController));

// Template Operations
router.post('/:templateId/create-categories', categoryTemplateController.createFromTemplate.bind(categoryTemplateController));

// Bulk Operations
router.post('/bulk/update', categoryTemplateController.bulkUpdateCategories.bind(categoryTemplateController));
router.post('/bulk/delete', categoryTemplateController.bulkDeleteCategories.bind(categoryTemplateController));
router.post('/bulk/toggle', categoryTemplateController.bulkToggleCategories.bind(categoryTemplateController));

// Import/Export
router.post('/import/csv', categoryTemplateController.importFromCSV.bind(categoryTemplateController));
router.get('/export/csv', categoryTemplateController.exportToCSV.bind(categoryTemplateController));

// Statistics & Advanced Queries
router.get('/stats/overview', categoryTemplateController.getCategoryStats.bind(categoryTemplateController));
router.get('/categories/advanced', categoryTemplateController.getCategoriesAdvanced.bind(categoryTemplateController));

export default router;
