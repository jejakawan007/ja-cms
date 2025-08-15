const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Sample data arrays
const titles = [
  'Getting Started with Next.js 14',
  'Understanding TypeScript Generics',
  'Building Scalable APIs with Express',
  'Database Design Best Practices',
  'React Hooks Deep Dive',
  'CSS Grid Layout Mastery',
  'JavaScript ES2023 Features',
  'Docker for Development',
  'Git Workflow Strategies',
  'Performance Optimization Tips',
  'Security Best Practices',
  'Testing with Jest and React Testing Library',
  'State Management with Zustand',
  'Tailwind CSS Advanced Techniques',
  'GraphQL vs REST APIs',
  'Microservices Architecture',
  'CI/CD Pipeline Setup',
  'Web Accessibility Guidelines',
  'SEO Optimization Strategies',
  'Mobile-First Design Principles'
];

const excerpts = [
  'Learn the fundamentals and advanced concepts of modern web development.',
  'Discover best practices for building robust and maintainable applications.',
  'Explore the latest trends and technologies in software development.',
  'Master the art of creating user-friendly and performant web applications.',
  'Understand the principles of clean code and software architecture.',
  'Dive deep into modern JavaScript frameworks and libraries.',
  'Learn about database optimization and query performance.',
  'Explore cloud computing and deployment strategies.',
  'Master responsive design and cross-browser compatibility.',
  'Understand authentication and authorization systems.'
];

const content = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
  'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.'
];

const statuses = ['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'];

async function seedPosts() {
  try {
    console.log('🌱 Starting post seeding...');
    
    // Get the first user for author assignment
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    const posts = [];
    const now = new Date();
    
    for (let i = 1; i <= 100; i++) {
      const title = titles[i % titles.length] + ` - Part ${Math.floor(i / titles.length) + 1}`;
      const excerpt = excerpts[i % excerpts.length];
      const contentText = content[i % content.length];
      const status = statuses[i % statuses.length];
      
      // Create varied dates for published posts
      let publishedAt = null;
      
      if (status === 'PUBLISHED') {
        publishedAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date in last 30 days
      }
      
      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-') + `-${i}`;
      
      const post = {
        title,
        slug,
        excerpt,
        content: contentText,
        status,
        publishedAt,
        authorId: user.id,
        isHidden: Math.random() > 0.8, // 20% chance of being hidden
        createdAt: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date in last 90 days
        updatedAt: new Date(),
        // Add default values for optional fields
        featuredImage: null,
        metaTitle: null,
        metaDescription: null,
        metaKeywords: null,
        canonicalUrl: null
      };
      
      posts.push(post);
    }

    // Insert all posts
    const createdPosts = await prisma.post.createMany({
      data: posts,
      skipDuplicates: true
    });

    console.log(`✅ Successfully seeded ${createdPosts.count} posts!`);
    console.log(`📊 Status distribution:`);
    
    // Count posts by status
    const statusCounts = await prisma.post.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
    
    statusCounts.forEach(count => {
      console.log(`   ${count.status}: ${count._count.status}`);
    });

  } catch (error) {
    console.error('❌ Error seeding posts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedPosts();
