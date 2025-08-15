import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/advanced/stats - Get advanced content management statistics
router.get('/stats', authenticateToken, async (_req, res) => {
  try {
    // Calculate SEO score based on content optimization
    const totalPosts = await prisma.post.count();
    // Placeholder data for SEO metrics
    const postsWithMetaDescription = Math.floor(totalPosts * 0.7); // 70% of posts have meta description
    const postsWithKeywords = Math.floor(totalPosts * 0.5); // 50% of posts have keywords
    
    // Calculate SEO score (0-100)
    let seoScore = 0;
    if (totalPosts > 0) {
      const metaScore = (postsWithMetaDescription / totalPosts) * 50;
      const keywordScore = (postsWithKeywords / totalPosts) * 50;
      seoScore = Math.round(metaScore + keywordScore);
    }
    
    // Calculate content gaps (posts without categories)
    const postsWithoutCategories = Math.floor(totalPosts * 0.2); // 20% of posts without categories
    
    // Get active workflows (placeholder - would need workflow system)
    const activeWorkflows = 3; // Mock data
    
    // Calculate optimization opportunities
    const optimizationOpportunities = Math.max(0, postsWithoutCategories + (totalPosts - postsWithMetaDescription));
    
    const stats = {
      seoScore,
      contentGaps: postsWithoutCategories,
      activeWorkflows,
      optimizationOpportunities
    };
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching advanced stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advanced statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
