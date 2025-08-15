import express from 'express';
import { EditorController } from '../controllers/editor-controller';
import { authenticateToken } from '../middleware/auth-middleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     EditorContent:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         type:
 *           type: string
 *           enum: [doc]
 *         content:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EditorNode'
 *         version:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     EditorNode:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *         attrs:
 *           type: object
 *         content:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EditorNode'
 *         text:
 *           type: string
 *         marks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EditorMark'
 *     
 *     EditorMark:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *         attrs:
 *           type: object
 *     
 *     EditorConfig:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         mode:
 *           type: string
 *           enum: [wysiwyg, markdown, hybrid]
 *         theme:
 *           type: string
 *           enum: [light, dark, auto]
 *         language:
 *           type: string
 *         features:
 *           type: array
 *           items:
 *             type: string
 *         toolbar:
 *           $ref: '#/components/schemas/ToolbarConfig'
 *         plugins:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EditorPlugin'
 *         shortcuts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/KeyboardShortcut'
 *         autoSave:
 *           type: object
 *           properties:
 *             enabled:
 *               type: boolean
 *             interval:
 *               type: number
 *             strategy:
 *               type: string
 *               enum: [local, server, both]
 *         collaboration:
 *           type: object
 *           properties:
 *             enabled:
 *               type: boolean
 *             showCursors:
 *               type: boolean
 *             showSelections:
 *               type: boolean
 *             maxCollaborators:
 *               type: number
 *     
 *     ToolbarConfig:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ToolbarItem'
 *         position:
 *           type: string
 *           enum: [top, bottom, floating]
 *         visible:
 *           type: boolean
 *     
 *     ToolbarItem:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *         icon:
 *           type: string
 *         label:
 *           type: string
 *         action:
 *           type: string
 *         shortcut:
 *           type: string
 *         disabled:
 *           type: boolean
 *     
 *     EditorPlugin:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         version:
 *           type: string
 *         enabled:
 *           type: boolean
 *         config:
 *           type: object
 *     
 *     KeyboardShortcut:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *         action:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *     
 *     EditorCollaborator:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         userName:
 *           type: string
 *         userAvatar:
 *           type: string
 *         userColor:
 *           type: string
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *             enum: [read, write, comment, review, publish, admin]
 *         joinedAt:
 *           type: string
 *           format: date-time
 *         lastActive:
 *           type: string
 *           format: date-time
 *     
 *     EditorComment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         contentId:
 *           type: string
 *         authorId:
 *           type: string
 *         authorName:
 *           type: string
 *         authorAvatar:
 *           type: string
 *         text:
 *           type: string
 *         selection:
 *           $ref: '#/components/schemas/EditorSelection'
 *         status:
 *           type: string
 *           enum: [active, resolved, archived]
 *         replies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EditorCommentReply'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     EditorCommentReply:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         commentId:
 *           type: string
 *         authorId:
 *           type: string
 *         authorName:
 *           type: string
 *         authorAvatar:
 *           type: string
 *         text:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     EditorSelection:
 *       type: object
 *       properties:
 *         from:
 *           type: number
 *         to:
 *           type: number
 *         anchor:
 *           type: number
 *         head:
 *           type: number
 */

/**
 * @swagger
 * /api/editor/config:
 *   get:
 *     summary: Get editor configuration
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Editor configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EditorConfig'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/config', authenticateToken, EditorController.getConfig);

/**
 * @swagger
 * /api/editor/content:
 *   post:
 *     summary: Create new content
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Content title
 *               type:
 *                 type: string
 *                 description: Content type (post, page, etc.)
 *                 default: post
 *     responses:
 *       201:
 *         description: Content created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EditorContent'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/content', authenticateToken, EditorController.createContent);

/**
 * @swagger
 * /api/editor/content/{contentId}:
 *   get:
 *     summary: Get content by ID
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EditorContent'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 *       500:
 *         description: Internal server error
 */
router.get('/content/:contentId', authenticateToken, EditorController.getContent);

/**
 * @swagger
 * /api/editor/content/{contentId}:
 *   put:
 *     summary: Update content
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 $ref: '#/components/schemas/EditorContent'
 *     responses:
 *       200:
 *         description: Content updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EditorContent'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/content/:contentId', authenticateToken, EditorController.updateContent);

/**
 * @swagger
 * /api/editor/content/{contentId}/autosave:
 *   post:
 *     summary: Auto-save content
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 $ref: '#/components/schemas/EditorContent'
 *     responses:
 *       200:
 *         description: Content auto-saved successfully
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
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/content/:contentId/autosave', authenticateToken, EditorController.autoSave);

/**
 * @swagger
 * /api/editor/content/{contentId}/publish:
 *   post:
 *     summary: Publish content
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content published successfully
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
 *       500:
 *         description: Internal server error
 */
router.post('/content/:contentId/publish', authenticateToken, EditorController.publishContent);

/**
 * @swagger
 * /api/editor/content/{contentId}/unpublish:
 *   post:
 *     summary: Unpublish content
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content unpublished successfully
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
 *       500:
 *         description: Internal server error
 */
router.post('/content/:contentId/unpublish', authenticateToken, EditorController.unpublishContent);

/**
 * @swagger
 * /api/editor/content/{contentId}:
 *   delete:
 *     summary: Delete content
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content deleted successfully
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
 *       500:
 *         description: Internal server error
 */
router.delete('/content/:contentId', authenticateToken, EditorController.deleteContent);

/**
 * @swagger
 * /api/editor/search:
 *   get:
 *     summary: Search content
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Content type filter
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Author filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Status filter
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *         description: Sort field
 *       - in: query
 *         name: sortDirection
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort direction
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Content search completed successfully
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
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/EditorContent'
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/search', authenticateToken, EditorController.searchContent);

/**
 * @swagger
 * /api/editor/content/{contentId}/history:
 *   get:
 *     summary: Get content history
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content history retrieved successfully
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
 *                     steps:
 *                       type: array
 *                       items:
 *                         type: object
 *                     currentStep:
 *                       type: number
 *                     maxSteps:
 *                       type: number
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/content/:contentId/history', authenticateToken, EditorController.getContentHistory);

/**
 * @swagger
 * /api/editor/content/{contentId}/restore/{version}:
 *   post:
 *     summary: Restore content version
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *       - in: path
 *         name: version
 *         required: true
 *         schema:
 *           type: number
 *         description: Version number to restore
 *     responses:
 *       200:
 *         description: Content version restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EditorContent'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/content/:contentId/restore/:version', authenticateToken, EditorController.restoreVersion);

/**
 * @swagger
 * /api/editor/content/{contentId}/collaborators:
 *   get:
 *     summary: Get collaborators for content
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Collaborators retrieved successfully
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
 *                     $ref: '#/components/schemas/EditorCollaborator'
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.get('/content/:contentId/collaborators', authenticateToken, EditorController.getCollaborators);

/**
 * @swagger
 * /api/editor/content/{contentId}/collaborators:
 *   post:
 *     summary: Add collaborator to content
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to add as collaborator
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [read, write, comment, review, publish, admin]
 *                 description: Permissions for the collaborator
 *     responses:
 *       200:
 *         description: Collaborator added successfully
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
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/content/:contentId/collaborators', authenticateToken, EditorController.addCollaborator);

/**
 * @swagger
 * /api/editor/content/{contentId}/collaborators/{collaboratorId}:
 *   delete:
 *     summary: Remove collaborator from content
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *       - in: path
 *         name: collaboratorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Collaborator ID to remove
 *     responses:
 *       200:
 *         description: Collaborator removed successfully
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
 *       500:
 *         description: Internal server error
 */
router.delete('/content/:contentId/collaborators/:collaboratorId', authenticateToken, EditorController.removeCollaborator);

/**
 * @swagger
 * /api/editor/content/{contentId}/comments:
 *   get:
 *     summary: Get comments for content
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
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
 *                     $ref: '#/components/schemas/EditorComment'
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.get('/content/:contentId/comments', authenticateToken, EditorController.getComments);

/**
 * @swagger
 * /api/editor/content/{contentId}/comments:
 *   post:
 *     summary: Add comment to content
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Comment text
 *               selection:
 *                 $ref: '#/components/schemas/EditorSelection'
 *                 description: Text selection for the comment
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EditorComment'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/content/:contentId/comments', authenticateToken, EditorController.addComment);

/**
 * @swagger
 * /api/editor/comments/{commentId}:
 *   put:
 *     summary: Update comment
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Updated comment text
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EditorComment'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/comments/:commentId', authenticateToken, EditorController.updateComment);

/**
 * @swagger
 * /api/editor/comments/{commentId}:
 *   delete:
 *     summary: Delete comment
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
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
 *       500:
 *         description: Internal server error
 */
router.delete('/comments/:commentId', authenticateToken, EditorController.deleteComment);

/**
 * @swagger
 * /api/editor/comments/{commentId}/resolve:
 *   post:
 *     summary: Resolve comment
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment resolved successfully
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
 *       500:
 *         description: Internal server error
 */
router.post('/comments/:commentId/resolve', authenticateToken, EditorController.resolveComment);

/**
 * @swagger
 * /api/editor/content/{contentId}/export:
 *   get:
 *     summary: Export content
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [html, markdown, pdf, docx]
 *         description: Export format
 *         default: html
 *     responses:
 *       200:
 *         description: Content exported successfully
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
 *                     content:
 *                       type: string
 *                     format:
 *                       type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/content/:contentId/export', authenticateToken, EditorController.exportContent);

/**
 * @swagger
 * /api/editor/import:
 *   post:
 *     summary: Import content
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Content to import
 *               format:
 *                 type: string
 *                 enum: [html, markdown]
 *                 description: Import format
 *                 default: markdown
 *     responses:
 *       200:
 *         description: Content imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EditorContent'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/import', authenticateToken, EditorController.importContent);

/**
 * @swagger
 * /api/editor/content/{contentId}/duplicate:
 *   post:
 *     summary: Duplicate content
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content duplicated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EditorContent'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/content/:contentId/duplicate', authenticateToken, EditorController.duplicateContent);

/**
 * @swagger
 * /api/editor/content/{contentId}/analytics:
 *   get:
 *     summary: Get content analytics
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content analytics retrieved successfully
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
 *                     wordCount:
 *                       type: number
 *                     characterCount:
 *                       type: number
 *                     readingTime:
 *                       type: number
 *                     lastModified:
 *                       type: string
 *                       format: date-time
 *                     version:
 *                       type: number
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/content/:contentId/analytics', authenticateToken, EditorController.getContentAnalytics);

/**
 * @swagger
 * /api/editor/content/{contentId}/seo-suggestions:
 *   get:
 *     summary: Get SEO suggestions
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: SEO suggestions retrieved successfully
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
 *                     type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/content/:contentId/seo-suggestions', authenticateToken, EditorController.getSEOSuggestions);

/**
 * @swagger
 * /api/editor/content/{contentId}/social-preview:
 *   get:
 *     summary: Get social preview
 *     tags: [Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Social preview retrieved successfully
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
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     image:
 *                       type: string
 *                     url:
 *                       type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/content/:contentId/social-preview', authenticateToken, EditorController.getSocialPreview);

export default router;
