import { Router } from 'express';
import { UsersController } from '../controllers/users-controller';
import { asyncHandler } from '../middleware/error-handler';
import { authenticateToken, requirePermission } from '../middleware/auth-middleware';

const router = Router();
const usersController = new UsersController();

// Get all users
router.get('/', 
  authenticateToken, 
  requirePermission('manage_users'),
  asyncHandler(usersController.getAllUsers.bind(usersController))
);

// Get user by ID
router.get('/:id', 
  authenticateToken, 
  requirePermission('manage_users'),
  asyncHandler(usersController.getUserById.bind(usersController))
);

// Create new user
router.post('/', 
  authenticateToken, 
  requirePermission('manage_users'),
  asyncHandler(usersController.createUser.bind(usersController))
);

// Update user
router.put('/:id', 
  authenticateToken, 
  requirePermission('manage_users'),
  asyncHandler(usersController.updateUser.bind(usersController))
);

// Delete user
router.delete('/:id', 
  authenticateToken, 
  requirePermission('manage_users'),
  asyncHandler(usersController.deleteUser.bind(usersController))
);

// Get user statistics
router.get('/stats/overview', 
  authenticateToken, 
  requirePermission('view_analytics'),
  asyncHandler(usersController.getUserStats.bind(usersController))
);

// Get users by role
router.get('/role/:role', 
  authenticateToken, 
  requirePermission('manage_users'),
  asyncHandler(usersController.getUsersByRole.bind(usersController))
);

// Search users
router.get('/search', 
  authenticateToken, 
  requirePermission('manage_users'),
  asyncHandler(usersController.searchUsers.bind(usersController))
);

export default router; 