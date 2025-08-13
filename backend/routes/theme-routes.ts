import { Router } from 'express';
import { ThemeController } from '../controllers/theme-controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Theme:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - category
 *         - colors
 *         - typography
 *         - spacing
 *         - borderRadius
 *       properties:
 *         id:
 *           type: string
 *           description: Unique theme identifier
 *         name:
 *           type: string
 *           description: Theme name
 *         description:
 *           type: string
 *           description: Theme description
 *         category:
 *           type: string
 *           enum: [dashboard, creative, light, dark]
 *           description: Theme category
 *         isActive:
 *           type: boolean
 *           description: Whether theme is currently active
 *         isDefault:
 *           type: boolean
 *           description: Whether theme is default
 *         colors:
 *           type: object
 *           properties:
 *             primary:
 *               type: string
 *               pattern: '^#[0-9A-F]{6}$'
 *             secondary:
 *               type: string
 *               pattern: '^#[0-9A-F]{6}$'
 *             accent:
 *               type: string
 *               pattern: '^#[0-9A-F]{6}$'
 *             background:
 *               type: string
 *               pattern: '^#[0-9A-F]{6}$'
 *             surface:
 *               type: string
 *               pattern: '^#[0-9A-F]{6}$'
 *             text:
 *               type: string
 *               pattern: '^#[0-9A-F]{6}$'
 *             textSecondary:
 *               type: string
 *               pattern: '^#[0-9A-F]{6}$'
 *             border:
 *               type: string
 *               pattern: '^#[0-9A-F]{6}$'
 *             success:
 *               type: string
 *               pattern: '^#[0-9A-F]{6}$'
 *             warning:
 *               type: string
 *               pattern: '^#[0-9A-F]{6}$'
 *             error:
 *               type: string
 *               pattern: '^#[0-9A-F]{6}$'
 *         typography:
 *           type: object
 *           properties:
 *             fontFamily:
 *               type: string
 *             fontSize:
 *               type: object
 *               properties:
 *                 xs:
 *                   type: string
 *                 sm:
 *                   type: string
 *                 base:
 *                   type: string
 *                 lg:
 *                   type: string
 *                 xl:
 *                   type: string
 *                 '2xl':
 *                   type: string
 *                 '3xl':
 *                   type: string
 *         spacing:
 *           type: object
 *           properties:
 *             xs:
 *               type: string
 *             sm:
 *               type: string
 *             md:
 *               type: string
 *             lg:
 *               type: string
 *             xl:
 *               type: string
 *         borderRadius:
 *           type: object
 *           properties:
 *             sm:
 *               type: string
 *             md:
 *               type: string
 *             lg:
 *               type: string
 *             full:
 *               type: string
 *         metadata:
 *           type: object
 *           properties:
 *             author:
 *               type: string
 *             version:
 *               type: string
 *             tags:
 *               type: array
 *               items:
 *                 type: string
 *             previewImage:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/themes:
 *   get:
 *     summary: Get all themes
 *     tags: [Themes]
 *     responses:
 *       200:
 *         description: List of themes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Theme'
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.get('/', ThemeController.getThemes);

/**
 * @swagger
 * /api/themes/active:
 *   get:
 *     summary: Get active theme
 *     tags: [Themes]
 *     responses:
 *       200:
 *         description: Active theme
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Theme'
 *                 message:
 *                   type: string
 *       404:
 *         description: No active theme found
 *       500:
 *         description: Server error
 */
router.get('/active', ThemeController.getActiveTheme);

/**
 * @swagger
 * /api/themes/category/{category}:
 *   get:
 *     summary: Get themes by category
 *     tags: [Themes]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [dashboard, creative, light, dark]
 *         description: Theme category
 *     responses:
 *       200:
 *         description: List of themes in category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Theme'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid category
 *       500:
 *         description: Server error
 */
router.get('/category/:category', ThemeController.getThemesByCategory);

/**
 * @swagger
 * /api/themes/stats:
 *   get:
 *     summary: Get theme statistics
 *     tags: [Themes]
 *     responses:
 *       200:
 *         description: Theme statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     active:
 *                       type: number
 *                     byCategory:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.get('/stats', ThemeController.getThemeStats);

/**
 * @swagger
 * /api/themes/validate:
 *   post:
 *     summary: Validate theme data
 *     tags: [Themes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Theme'
 *     responses:
 *       200:
 *         description: Validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     isValid:
 *                       type: boolean
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/validate', ThemeController.validateTheme);

/**
 * @swagger
 * /api/themes:
 *   post:
 *     summary: Create new theme
 *     tags: [Themes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Theme'
 *     responses:
 *       201:
 *         description: Theme created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Theme'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       409:
 *         description: Theme name already exists
 *       500:
 *         description: Server error
 */
router.post('/', ThemeController.createTheme);

/**
 * @swagger
 * /api/themes/{id}:
 *   get:
 *     summary: Get theme by ID
 *     tags: [Themes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Theme ID
 *     responses:
 *       200:
 *         description: Theme details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Theme'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Theme not found
 *       500:
 *         description: Server error
 */
router.get('/:id', ThemeController.getThemeById);

/**
 * @swagger
 * /api/themes/{id}:
 *   put:
 *     summary: Update theme
 *     tags: [Themes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Theme ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Theme'
 *     responses:
 *       200:
 *         description: Theme updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Theme'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Theme not found
 *       409:
 *         description: Theme name already exists
 *       500:
 *         description: Server error
 */
router.put('/:id', ThemeController.updateTheme);

/**
 * @swagger
 * /api/themes/{id}/active:
 *   put:
 *     summary: Set theme as active
 *     tags: [Themes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Theme ID
 *     responses:
 *       200:
 *         description: Theme set as active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Theme not found
 *       500:
 *         description: Server error
 */
router.put('/:id/active', ThemeController.setActiveTheme);

/**
 * @swagger
 * /api/themes/{id}/export:
 *   get:
 *     summary: Export theme
 *     tags: [Themes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Theme ID
 *     responses:
 *       200:
 *         description: Theme export data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: string
 *                     exportDate:
 *                       type: string
 *                       format: date-time
 *                     theme:
 *                       $ref: '#/components/schemas/Theme'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Theme not found
 *       500:
 *         description: Server error
 */
router.get('/:id/export', ThemeController.exportTheme);

/**
 * @swagger
 * /api/themes/{id}:
 *   delete:
 *     summary: Delete theme
 *     tags: [Themes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Theme ID
 *     responses:
 *       200:
 *         description: Theme deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Cannot delete default theme
 *       404:
 *         description: Theme not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', ThemeController.deleteTheme);

/**
 * @swagger
 * /api/themes/import:
 *   post:
 *     summary: Import theme
 *     tags: [Themes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               version:
 *                 type: string
 *               exportDate:
 *                 type: string
 *                 format: date-time
 *               theme:
 *                 $ref: '#/components/schemas/Theme'
 *     responses:
 *       201:
 *         description: Theme imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Theme'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid import data
 *       500:
 *         description: Server error
 */
router.post('/import', ThemeController.importTheme);

export default router;
