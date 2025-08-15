import { Router } from 'express';
import { DashboardSettingsService } from '@/services/dashboard-settings-service';
import { authenticateToken } from '@/middleware/auth-middleware';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * @swagger
 * /api/dashboard-settings:
 *   get:
 *     summary: Get dashboard settings for authenticated user
 *     tags: [Dashboard Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DashboardSettings'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const settings = await DashboardSettingsService.getOrCreateSettings(userId);
    
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    logger.error('Error getting dashboard settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard settings',
    });
  }
});

/**
 * @swagger
 * /api/dashboard-settings:
 *   put:
 *     summary: Update dashboard settings for authenticated user
 *     tags: [Dashboard Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               layoutMode:
 *                 type: string
 *                 enum: [default, custom]
 *               theme:
 *                 type: string
 *               widgets:
 *                 type: object
 *               layout:
 *                 type: object
 *               appearance:
 *                 type: object
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Dashboard settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DashboardSettings'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const updateData = req.body;
    const settings = await DashboardSettingsService.createOrUpdateSettings(userId, updateData);
    
    res.json({
      success: true,
      data: settings,
      message: 'Dashboard settings updated successfully',
    });
  } catch (error) {
    logger.error('Error updating dashboard settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update dashboard settings',
    });
  }
});

/**
 * @swagger
 * /api/dashboard-settings/grid-layout:
 *   put:
 *     summary: Update grid layout for authenticated user
 *     tags: [Dashboard Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gridLayout:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Grid layout updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DashboardSettings'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/grid-layout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { gridLayout } = req.body;
    if (!gridLayout) {
      return res.status(400).json({ success: false, message: 'Grid layout is required' });
    }

    const settings = await DashboardSettingsService.updateGridLayout(userId, gridLayout);
    
    res.json({
      success: true,
      data: settings,
      message: 'Grid layout updated successfully',
    });
  } catch (error) {
    logger.error('Error updating grid layout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update grid layout',
    });
  }
});

/**
 * @swagger
 * /api/dashboard-settings/reset:
 *   post:
 *     summary: Reset dashboard settings to default for authenticated user
 *     tags: [Dashboard Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard settings reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DashboardSettings'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/reset', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const settings = await DashboardSettingsService.resetSettings(userId);
    
    res.json({
      success: true,
      data: settings,
      message: 'Dashboard settings reset to default successfully',
    });
  } catch (error) {
    logger.error('Error resetting dashboard settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset dashboard settings',
    });
  }
});

export default router;
