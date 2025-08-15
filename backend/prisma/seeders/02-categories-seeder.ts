/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

/**
 * Seed 20 Categories with diverse and realistic data
 */
export async function seedCategories(prisma: PrismaClient) {
  console.log('  📂 Creating 20 categories...');

  const categoriesData = [
    // Technology Categories
    {
      name: 'Technology',
      slug: 'technology',
      description: 'Latest technology trends, innovations, and digital advancements',
      isActive: true,
      sortOrder: 1,
      metaTitle: 'Technology News and Trends',
      metaDescription: 'Stay updated with the latest technology news, trends, and innovations in the digital world.'
    },
    {
      name: 'Programming',
      slug: 'programming',
      description: 'Programming languages, coding tutorials, and software development',
      isActive: true,
      sortOrder: 2,
      metaTitle: 'Programming Tutorials and Guides',
      metaDescription: 'Learn programming languages, coding best practices, and software development techniques.'
    },
    {
      name: 'Web Development',
      slug: 'web-development',
      description: 'Frontend, backend, and full-stack web development resources',
      isActive: true,
      sortOrder: 3,
      metaTitle: 'Web Development Resources',
      metaDescription: 'Comprehensive web development tutorials, tools, and best practices.'
    },
    {
      name: 'Mobile Development',
      slug: 'mobile-development',
      description: 'iOS, Android, and cross-platform mobile app development',
      isActive: true,
      sortOrder: 4,
      metaTitle: 'Mobile App Development',
      metaDescription: 'Learn mobile app development for iOS, Android, and cross-platform solutions.'
    },
    {
      name: 'Artificial Intelligence',
      slug: 'artificial-intelligence',
      description: 'AI, machine learning, and data science insights',
      isActive: true,
      sortOrder: 5,
      metaTitle: 'AI and Machine Learning',
      metaDescription: 'Explore artificial intelligence, machine learning, and data science technologies.'
    },

    // Business Categories
    {
      name: 'Business',
      slug: 'business',
      description: 'Business strategies, entrepreneurship, and market insights',
      isActive: true,
      sortOrder: 6,
      metaTitle: 'Business Strategies and Insights',
      metaDescription: 'Business strategies, entrepreneurship tips, and market analysis.'
    },
    {
      name: 'Marketing',
      slug: 'marketing',
      description: 'Digital marketing, SEO, and growth strategies',
      isActive: true,
      sortOrder: 7,
      metaTitle: 'Digital Marketing Strategies',
      metaDescription: 'Digital marketing techniques, SEO optimization, and growth strategies.'
    },
    {
      name: 'Finance',
      slug: 'finance',
      description: 'Personal finance, investment, and financial planning',
      isActive: true,
      sortOrder: 8,
      metaTitle: 'Finance and Investment',
      metaDescription: 'Personal finance tips, investment strategies, and financial planning advice.'
    },
    {
      name: 'Startup',
      slug: 'startup',
      description: 'Startup advice, funding, and entrepreneurial journey',
      isActive: true,
      sortOrder: 9,
      metaTitle: 'Startup Resources',
      metaDescription: 'Startup advice, funding strategies, and entrepreneurial success stories.'
    },
    {
      name: 'Leadership',
      slug: 'leadership',
      description: 'Leadership skills, management, and team building',
      isActive: true,
      sortOrder: 10,
      metaTitle: 'Leadership and Management',
      metaDescription: 'Leadership development, management skills, and team building strategies.'
    },

    // Design Categories
    {
      name: 'Design',
      slug: 'design',
      description: 'UI/UX design, creative processes, and design thinking',
      isActive: true,
      sortOrder: 11,
      metaTitle: 'Design and Creativity',
      metaDescription: 'UI/UX design principles, creative processes, and design thinking methodologies.'
    },
    {
      name: 'Graphic Design',
      slug: 'graphic-design',
      description: 'Visual design, branding, and creative graphics',
      isActive: true,
      sortOrder: 12,
      metaTitle: 'Graphic Design and Branding',
      metaDescription: 'Visual design techniques, branding strategies, and creative graphics.'
    },
    {
      name: 'Product Design',
      slug: 'product-design',
      description: 'Product design, user experience, and design systems',
      isActive: true,
      sortOrder: 13,
      metaTitle: 'Product Design and UX',
      metaDescription: 'Product design principles, user experience optimization, and design systems.'
    },

    // Lifestyle Categories
    {
      name: 'Lifestyle',
      slug: 'lifestyle',
      description: 'Personal development, wellness, and life balance',
      isActive: true,
      sortOrder: 14,
      metaTitle: 'Lifestyle and Wellness',
      metaDescription: 'Personal development tips, wellness advice, and life balance strategies.'
    },
    {
      name: 'Health & Fitness',
      slug: 'health-fitness',
      description: 'Physical health, mental wellness, and fitness tips',
      isActive: true,
      sortOrder: 15,
      metaTitle: 'Health and Fitness',
      metaDescription: 'Physical health tips, mental wellness advice, and fitness strategies.'
    },
    {
      name: 'Travel',
      slug: 'travel',
      description: 'Travel guides, destinations, and adventure stories',
      isActive: true,
      sortOrder: 16,
      metaTitle: 'Travel and Adventure',
      metaDescription: 'Travel guides, destination recommendations, and adventure stories.'
    },

    // Education Categories
    {
      name: 'Education',
      slug: 'education',
      description: 'Learning resources, online courses, and educational content',
      isActive: true,
      sortOrder: 17,
      metaTitle: 'Education and Learning',
      metaDescription: 'Educational resources, online learning platforms, and skill development.'
    },
    {
      name: 'Career',
      slug: 'career',
      description: 'Career development, job search, and professional growth',
      isActive: true,
      sortOrder: 18,
      metaTitle: 'Career Development',
      metaDescription: 'Career advancement tips, job search strategies, and professional growth.'
    },

    // Entertainment Categories
    {
      name: 'Entertainment',
      slug: 'entertainment',
      description: 'Movies, music, games, and entertainment news',
      isActive: true,
      sortOrder: 19,
      metaTitle: 'Entertainment and Media',
      metaDescription: 'Latest entertainment news, movie reviews, music, and gaming content.'
    },
    {
      name: 'News',
      slug: 'news',
      description: 'Current events, breaking news, and world updates',
      isActive: true,
      sortOrder: 20,
      metaTitle: 'Latest News and Updates',
      metaDescription: 'Breaking news, current events, and world updates from around the globe.'
    }
  ];

  const categories = await Promise.all(
    categoriesData.map(categoryData =>
      prisma.category.create({
        data: categoryData
      })
    )
  );

  console.log(`  ✅ Created ${categories.length} categories successfully`);
  return categories;
}

export type SeededCategories = Awaited<ReturnType<typeof seedCategories>>;
