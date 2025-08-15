import { Router } from 'express';
import { CategoryController } from '@/controllers/category-controller';
import { asyncHandler } from '@/middleware/error-handler';
import { authenticateToken } from '@/middleware/auth-middleware';

const router = Router();
const categoryController = new CategoryController();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories with pagination and filtering
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *         description: Filter by parent category
 *     responses:
 *       200:
 *         description: List of categories with pagination
 */
router.get('/', asyncHandler(categoryController.getCategories));

/**
 * @swagger
 * /api/categories/hierarchy:
 *   get:
 *     summary: Get category hierarchy
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Category hierarchy
 */
router.get('/hierarchy', asyncHandler(categoryController.getCategoryHierarchy));

/**
 * @swagger
 * /api/categories/root:
 *   get:
 *     summary: Get root categories only
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Root categories
 */
router.get('/root', asyncHandler(categoryController.getRootCategories));

/**
 * @swagger
 * /api/categories/stats:
 *   get:
 *     summary: Get category statistics
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Category statistics
 */
router.get('/stats', asyncHandler(categoryController.getCategoryStats));

/**
 * @swagger
 * /api/categories/generate-slug:
 *   get:
 *     summary: Generate slug from category name
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: excludeId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Generated slug
 */
router.get('/generate-slug', asyncHandler(categoryController.generateSlug));

/**
 * @swagger
 * /api/categories/slug/{slug}:
 *   get:
 *     summary: Get category by slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
router.get('/slug/:slug', asyncHandler(categoryController.getCategoryBySlug));

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
router.get('/:id', asyncHandler(categoryController.getCategoryById));

// Protected routes (require authentication)
router.use(authenticateToken);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               parentId:
 *                 type: string
 *               order:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Invalid data
 */
router.post('/', asyncHandler(categoryController.createCategory));

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Categories]
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
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               parentId:
 *                 type: string
 *               order:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid data
 *       404:
 *         description: Category not found
 */
router.put('/:id', asyncHandler(categoryController.updateCategory));

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
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
 *         description: Category deleted successfully
 *       400:
 *         description: Cannot delete category with children or posts
 *       404:
 *         description: Category not found
 */
router.delete('/:id', asyncHandler(categoryController.deleteCategory));

export default router; 