import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedUncategorizedCategory() {
  try {
    console.log('🌱 Seeding Uncategorized category...');

    // Check if Uncategorized category already exists
    const existingUncategorized = await prisma.category.findFirst({
      where: {
        slug: 'uncategorized'
      }
    });

    if (existingUncategorized) {
      console.log('✅ Uncategorized category already exists, skipping...');
      return;
    }

    // Create Uncategorized category
    const uncategorizedCategory = await prisma.category.create({
      data: {
        name: 'Uncategorized',
        slug: 'uncategorized',
        description: 'Default category for content without specific categorization',
        isActive: true,
        sortOrder: 999, // High sort order to appear at the bottom
        metaTitle: 'Uncategorized - Default Category',
        metaDescription: 'Default category for content without specific categorization',
        parentId: null, // Root category
      }
    });

    console.log('✅ Uncategorized category created successfully:', {
      id: uncategorizedCategory.id,
      name: uncategorizedCategory.name,
      slug: uncategorizedCategory.slug
    });

  } catch (error) {
    console.error('❌ Error seeding Uncategorized category:', error);
    throw error;
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedUncategorizedCategory()
    .then(() => {
      console.log('✅ Uncategorized category seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Uncategorized category seeding failed:', error);
      process.exit(1);
    });
}
