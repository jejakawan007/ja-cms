import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/content/stats - Get content statistics
router.get('/stats', authenticateToken, async (_req, res) => {
  try {
    // Get total posts
    const totalPosts = await prisma.post.count();
    
    // Get published and draft posts
    const publishedPosts = await prisma.post.count({
      where: { status: 'PUBLISHED' }
    });
    
    const draftPosts = await prisma.post.count({
      where: { status: 'DRAFT' }
    });
    
    // Get total pages (placeholder - would need page model)
    const totalPages = 0;
    
    // Get total categories
    const totalCategories = await prisma.category.count();
    
    // Get total comments (placeholder - would need comment model)
    const totalComments = 0;
    
    // Get recent activity (posts created in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivity = await prisma.post.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });
    
    // Get content views (placeholder - would need analytics integration)
    const contentViews = totalPosts * 8; // Mock calculation
    
    const stats = {
      totalPosts,
      totalPages,
      totalCategories,
      totalComments,
      publishedContent: publishedPosts,
      draftContent: draftPosts,
      recentActivity,
      contentViews
    };
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching content stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
