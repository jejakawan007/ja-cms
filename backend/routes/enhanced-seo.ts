import express from 'express';
import enhancedSEOController from '../controllers/enhanced-seo-controller';
import { authenticateToken } from '../middleware/auth-middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// SEO Metadata routes
router.post('/metadata', enhancedSEOController.createSEOMetadata);
router.get('/metadata', enhancedSEOController.getSEOMetadata);
router.delete('/metadata/:id', enhancedSEOController.deleteSEOMetadata);
router.put('/metadata/bulk', enhancedSEOController.bulkUpdateSEOMetadata);

// SEO Audit routes
router.post('/audit', enhancedSEOController.performSEOAudit);
router.get('/audit/history', enhancedSEOController.getSEOAuditHistory);
router.get('/audit/:id', enhancedSEOController.getSEOAuditById);
router.get('/audit/export', enhancedSEOController.exportSEOAuditReport);

// Sitemap and Structured Data routes
router.get('/sitemap', enhancedSEOController.generateSitemap);
router.post('/structured-data', enhancedSEOController.generateStructuredData);

// Statistics routes
router.get('/statistics', enhancedSEOController.getSEOStatistics);

export default router;
