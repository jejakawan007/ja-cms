import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seeder untuk CategoryTemplate
 * Menyediakan template kategori default untuk sistem
 */
export async function seedCategoryTemplates() {
  console.log('🌱 Seeding category templates...');

  const templates = [
    {
      name: 'Blog Template',
      description: 'Template untuk kategori blog dengan pengaturan SEO yang optimal',
      slug: 'blog-template',
      metaTitle: '{name} - Blog Category',
      metaDescription: 'Explore {name} articles and insights on our blog',
      metaKeywords: 'blog, articles, {name}, content',
      isActive: true,
      sortOrder: 1,
      icon: '📝',
      color: '#3b82f6',
      settings: {
        allowPosts: true,
        allowSubcategories: true,
        requireApproval: false,
        autoPublish: true,
        seoOptimization: true,
        socialSharing: true
      }
    },
    {
      name: 'News Template',
      description: 'Template untuk kategori berita dengan pengaturan real-time updates',
      slug: 'news-template',
      metaTitle: '{name} - Latest News',
      metaDescription: 'Stay updated with the latest {name} news and updates',
      metaKeywords: 'news, updates, {name}, latest',
      isActive: true,
      sortOrder: 2,
      icon: '📰',
      color: '#ef4444',
      settings: {
        allowPosts: true,
        allowSubcategories: true,
        requireApproval: true,
        autoPublish: false,
        seoOptimization: true,
        socialSharing: true
      }
    },
    {
      name: 'Tutorial Template',
      description: 'Template untuk kategori tutorial dengan pengaturan step-by-step',
      slug: 'tutorial-template',
      metaTitle: '{name} Tutorial - Step by Step Guide',
      metaDescription: 'Learn {name} with our comprehensive step-by-step tutorial',
      metaKeywords: 'tutorial, guide, how-to, {name}, learning',
      isActive: true,
      sortOrder: 3,
      icon: '🎓',
      color: '#10b981',
      settings: {
        allowPosts: true,
        allowSubcategories: true,
        requireApproval: false,
        autoPublish: true,
        seoOptimization: true,
        socialSharing: true
      }
    },
    {
      name: 'Review Template',
      description: 'Template untuk kategori review dengan pengaturan rating system',
      slug: 'review-template',
      metaTitle: '{name} Review - Honest Assessment',
      metaDescription: 'Read our honest review of {name} with detailed analysis',
      metaKeywords: 'review, assessment, {name}, analysis, rating',
      isActive: true,
      sortOrder: 4,
      icon: '⭐',
      color: '#f59e0b',
      settings: {
        allowPosts: true,
        allowSubcategories: false,
        requireApproval: true,
        autoPublish: false,
        seoOptimization: true,
        socialSharing: true
      }
    },
    {
      name: 'Guide Template',
      description: 'Template untuk kategori panduan dengan pengaturan comprehensive content',
      slug: 'guide-template',
      metaTitle: '{name} Guide - Complete Reference',
      metaDescription: 'Complete guide to {name} with comprehensive information',
      metaKeywords: 'guide, reference, {name}, complete, comprehensive',
      isActive: true,
      sortOrder: 5,
      icon: '📚',
      color: '#8b5cf6',
      settings: {
        allowPosts: true,
        allowSubcategories: true,
        requireApproval: false,
        autoPublish: true,
        seoOptimization: true,
        socialSharing: true
      }
    },
    {
      name: 'Product Template',
      description: 'Template untuk kategori produk dengan pengaturan e-commerce',
      slug: 'product-template',
      metaTitle: '{name} Products - Best Selection',
      metaDescription: 'Discover the best {name} products with detailed specifications',
      metaKeywords: 'products, {name}, specifications, features',
      isActive: true,
      sortOrder: 6,
      icon: '🛍️',
      color: '#06b6d4',
      settings: {
        allowPosts: true,
        allowSubcategories: true,
        requireApproval: true,
        autoPublish: false,
        seoOptimization: true,
        socialSharing: true
      }
    }
  ];

  try {
    for (const template of templates) {
      await prisma.categoryTemplate.upsert({
        where: { slug: template.slug },
        update: {
          name: template.name,
          description: template.description,
          metaTitle: template.metaTitle,
          metaDescription: template.metaDescription,
          metaKeywords: template.metaKeywords,
          isActive: template.isActive,
          sortOrder: template.sortOrder,
          icon: template.icon,
          color: template.color,
          settings: template.settings
        },
        create: template
      });
    }

    console.log('✅ Category templates seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding category templates:', error);
    throw error;
  }
}

/**
 * Clean up category templates
 */
export async function cleanupCategoryTemplates() {
  console.log('🧹 Cleaning up category templates...');

  try {
    await prisma.categoryTemplate.deleteMany();
    console.log('✅ Category templates cleaned up successfully');
  } catch (error) {
    console.error('❌ Error cleaning up category templates:', error);
    throw error;
  }
}

/**
 * Get category template statistics
 */
export async function getCategoryTemplateStats() {
  try {
    const total = await prisma.categoryTemplate.count();
    const active = await prisma.categoryTemplate.count({
      where: { isActive: true }
    });

    return {
      total,
      active,
      inactive: total - active
    };
  } catch (error) {
    console.error('❌ Error getting category template stats:', error);
    throw error;
  }
}

// Export untuk penggunaan standalone
if (require.main === module) {
  seedCategoryTemplates()
    .then(() => {
      console.log('🎉 Category template seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Category template seeding failed:', error);
      process.exit(1);
    });
}
