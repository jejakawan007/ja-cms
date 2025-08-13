import express from 'express';
import { MenuController } from '../controllers/menu-controller';
import { authenticateToken } from '../middleware/auth-middleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Menu:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         location:
 *           type: string
 *           enum: [HEADER, FOOTER, SIDEBAR, MOBILE]
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MenuItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     MenuItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         label:
 *           type: string
 *         url:
 *           type: string
 *         order:
 *           type: number
 *         isActive:
 *           type: boolean
 *         parentId:
 *           type: string
 *         menuId:
 *           type: string
 */

/**
 * @swagger
 * /api/menus:
 *   get:
 *     summary: Get all menus
 *     tags: [Menus]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *           enum: [HEADER, FOOTER, SIDEBAR, MOBILE]
 *         description: Filter by menu location
 *     responses:
 *       200:
 *         description: Menus retrieved successfully
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
 *                     $ref: '#/components/schemas/Menu'
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.get('/', MenuController.getAllMenus);

/**
 * @swagger
 * /api/menus/{id}:
 *   get:
 *     summary: Get menu by ID
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu ID
 *     responses:
 *       200:
 *         description: Menu retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Menu'
 *                 message:
 *                   type: string
 *       404:
 *         description: Menu not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', MenuController.getMenuById);

/**
 * @swagger
 * /api/menus:
 *   post:
 *     summary: Create menu
 *     tags: [Menus]
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
 *               location:
 *                 type: string
 *                 enum: [HEADER, FOOTER, SIDEBAR, MOBILE]
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                     url:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     parentId:
 *                       type: string
 *     responses:
 *       201:
 *         description: Menu created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Menu'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, MenuController.createMenu);

/**
 * @swagger
 * /api/menus/{id}:
 *   put:
 *     summary: Update menu
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *                 enum: [HEADER, FOOTER, SIDEBAR, MOBILE]
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                     url:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     parentId:
 *                       type: string
 *     responses:
 *       200:
 *         description: Menu updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Menu'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Menu not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateToken, MenuController.updateMenu);

/**
 * @swagger
 * /api/menus/{id}:
 *   delete:
 *     summary: Delete menu
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu ID
 *     responses:
 *       200:
 *         description: Menu deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Menu not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, MenuController.deleteMenu);

/**
 * @swagger
 * /api/menus/location/{location}:
 *   get:
 *     summary: Get menu by location
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *           enum: [HEADER, FOOTER, SIDEBAR, MOBILE]
 *         description: Menu location
 *     responses:
 *       200:
 *         description: Menu by location retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Menu'
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.get('/location/:location', MenuController.getMenuByLocation);

export default router; 