import express from 'express';
import multer from 'multer';
import { MediaAdvancedController } from '../controllers/media-advanced-controller';
import { authenticateToken } from '../middleware/auth-middleware';

const router = express.Router();

// Configure multer for batch uploads
const batchUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
    files: 20 // Max 20 files at once
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/avi',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     BatchJob:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *         totalFiles:
 *           type: number
 *         processedFiles:
 *           type: number
 *         settings:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     MediaCollection:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         mediaIds:
 *           type: array
 *           items:
 *             type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// ============================================================================
// BATCH PROCESSING ROUTES
// ============================================================================

/**
 * @swagger
 * /api/media-advanced/batch/upload:
 *   post:
 *     summary: Upload multiple files for batch processing
 *     tags: [Media Advanced]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               settings:
 *                 type: string
 *                 description: JSON string of processing settings
 *     responses:
 *       201:
 *         description: Files uploaded for batch processing
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/batch/upload', authenticateToken, batchUpload.array('files', 20), MediaAdvancedController.uploadBatchFiles);

/**
 * @swagger
 * /api/media-advanced/batch/jobs:
 *   get:
 *     summary: Get all batch processing jobs
 *     tags: [Media Advanced]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *     responses:
 *       200:
 *         description: Batch jobs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/batch/jobs', authenticateToken, MediaAdvancedController.getBatchJobs);

/**
 * @swagger
 * /api/media-advanced/batch/jobs/{id}:
 *   get:
 *     summary: Get batch job by ID
 *     tags: [Media Advanced]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Batch job retrieved successfully
 *       404:
 *         description: Batch job not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/batch/jobs/:id', authenticateToken, MediaAdvancedController.getBatchJobById);

/**
 * @swagger
 * /api/media-advanced/batch/jobs/{id}/start:
 *   post:
 *     summary: Start batch processing job
 *     tags: [Media Advanced]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Batch processing started
 *       404:
 *         description: Batch job not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/batch/jobs/:id/start', authenticateToken, MediaAdvancedController.startBatchJob);

/**
 * @swagger
 * /api/media-advanced/batch/jobs/{id}/cancel:
 *   post:
 *     summary: Cancel batch processing job
 *     tags: [Media Advanced]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Batch processing cancelled
 *       404:
 *         description: Batch job not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/batch/jobs/:id/cancel', authenticateToken, MediaAdvancedController.cancelBatchJob);

// ============================================================================
// MEDIA OPTIMIZATION ROUTES
// ============================================================================

/**
 * @swagger
 * /api/media-advanced/optimize:
 *   post:
 *     summary: Optimize single media file
 *     tags: [Media Advanced]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mediaId:
 *                 type: string
 *               settings:
 *                 type: object
 *                 properties:
 *                   quality:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 100
 *                   format:
 *                     type: string
 *                     enum: [webp, jpg, png]
 *                   resize:
 *                     type: boolean
 *                   maxWidth:
 *                     type: number
 *                   maxHeight:
 *                     type: number
 *     responses:
 *       200:
 *         description: Media optimized successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Media not found
 *       500:
 *         description: Internal server error
 */
router.post('/optimize', authenticateToken, MediaAdvancedController.optimizeMedia);

/**
 * @swagger
 * /api/media-advanced/optimize/bulk:
 *   post:
 *     summary: Optimize multiple media files
 *     tags: [Media Advanced]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mediaIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               settings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Bulk optimization started
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/optimize/bulk', authenticateToken, MediaAdvancedController.optimizeBulk);

// ============================================================================
// MEDIA COLLECTIONS ROUTES
// ============================================================================

/**
 * @swagger
 * /api/media-advanced/collections:
 *   get:
 *     summary: Get all media collections
 *     tags: [Media Advanced]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *     responses:
 *       200:
 *         description: Collections retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/collections', authenticateToken, MediaAdvancedController.getCollections);

/**
 * @swagger
 * /api/media-advanced/collections:
 *   post:
 *     summary: Create new media collection
 *     tags: [Media Advanced]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               mediaIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Collection created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/collections', authenticateToken, MediaAdvancedController.createCollection);

/**
 * @swagger
 * /api/media-advanced/collections/{id}:
 *   get:
 *     summary: Get collection by ID
 *     tags: [Media Advanced]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection retrieved successfully
 *       404:
 *         description: Collection not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/collections/:id', authenticateToken, MediaAdvancedController.getCollectionById);

/**
 * @swagger
 * /api/media-advanced/collections/{id}:
 *   put:
 *     summary: Update collection
 *     tags: [Media Advanced]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               mediaIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Collection updated successfully
 *       404:
 *         description: Collection not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/collections/:id', authenticateToken, MediaAdvancedController.updateCollection);

/**
 * @swagger
 * /api/media-advanced/collections/{id}:
 *   delete:
 *     summary: Delete collection
 *     tags: [Media Advanced]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection deleted successfully
 *       404:
 *         description: Collection not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/collections/:id', authenticateToken, MediaAdvancedController.deleteCollection);

// ============================================================================
// ADVANCED SEARCH ROUTES
// ============================================================================

/**
 * @swagger
 * /api/media-advanced/search:
 *   post:
 *     summary: Advanced media search
 *     tags: [Media Advanced]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *               filters:
 *                 type: object
 *                 properties:
 *                   types:
 *                     type: array
 *                     items:
 *                       type: string
 *                   sizeRange:
 *                     type: object
 *                     properties:
 *                       min:
 *                         type: number
 *                       max:
 *                         type: number
 *                   dateRange:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       end:
 *                         type: string
 *                         format: date
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                   collections:
 *                     type: array
 *                     items:
 *                       type: string
 *               sort:
 *                 type: object
 *                 properties:
 *                   field:
 *                     type: string
 *                   order:
 *                     type: string
 *                     enum: [asc, desc]
 *               pagination:
 *                 type: object
 *                 properties:
 *                   page:
 *                     type: number
 *                   limit:
 *                     type: number
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/search', authenticateToken, MediaAdvancedController.advancedSearch);

// ============================================================================
// MEDIA ANALYTICS ROUTES
// ============================================================================

/**
 * @swagger
 * /api/media-advanced/analytics:
 *   get:
 *     summary: Get media analytics
 *     tags: [Media Advanced]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/analytics', authenticateToken, MediaAdvancedController.getAnalytics);

export default router;
