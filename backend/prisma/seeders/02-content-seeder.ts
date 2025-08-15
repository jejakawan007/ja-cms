/* eslint-disable no-console */
// @ts-ignore - Prisma client regeneration issue
import { PrismaClient } from '@prisma/client';
import { SeededUsers } from './01-users-seeder';

/**
 * Seed Content Management System
 * - Categories and Tags
 * - Posts with content
 * - Content Workflows (basic)
 */
export async function seedContent(prisma: PrismaClient, users: SeededUsers) {
  console.log('  📂 Creating categories...');

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Technology',
        slug: 'technology',
        description: 'Latest technology trends, tutorials, and insights'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Business',
        slug: 'business',
        description: 'Business strategies, entrepreneurship, and market insights'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Design',
        slug: 'design',
        description: 'UI/UX design, creative processes, and design thinking'
      }
    })
  ]);

  console.log('  🏷️ Creating tags...');

  // Create Tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'JavaScript', slug: 'javascript' } }),
    prisma.tag.create({ data: { name: 'React', slug: 'react' } }),
    prisma.tag.create({ data: { name: 'Next.js', slug: 'nextjs' } }),
    prisma.tag.create({ data: { name: 'TypeScript', slug: 'typescript' } }),
    prisma.tag.create({ data: { name: 'Business', slug: 'business' } }),
    prisma.tag.create({ data: { name: 'Design', slug: 'design' } })
  ]);

  console.log('  📝 Creating content workflows...');

  // Create Content Workflows - temporarily disabled due to Prisma client issue
  // const workflows = await Promise.all([
  //   prisma.contentWorkflow.create({
  //     data: {
  //       name: 'Standard Publishing',
  //       description: 'Standard workflow for publishing content',
  //       steps: JSON.stringify([
  //         { id: 1, name: 'Draft', description: 'Create initial draft' },
  //         { id: 2, name: 'Review', description: 'Editorial review' },
  //         { id: 3, name: 'Publish', description: 'Publish content' }
  //       ]),
  //       isActive: true,
  //       createdBy: users[1].id // Admin
  //     }
  //   })
  // ]);
  const workflows: never[] = [];

  console.log('  📝 Creating posts...');

  // Create Posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Getting Started with Next.js 14',
        slug: 'getting-started-with-nextjs-14',
        content: `# Getting Started with Next.js 14

Next.js 14 introduces many new features that make building modern web applications easier and more efficient.

## Key Features

### 1. App Router
The new App Router provides a more intuitive way to organize your application routes.

### 2. Server Components
Server Components allow you to write components that run on the server, reducing the JavaScript bundle size.

### 3. Improved Performance
Next.js 14 includes various performance improvements and optimizations.

## Getting Started

To create a new Next.js 14 project:

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

This will create a new Next.js project with all the latest features enabled.`,
        excerpt: 'Learn how to get started with Next.js 14 and its new features.',
        status: 'PUBLISHED',
        authorId: users[0].id,
        categoryId: categories[0].id,
        featuredImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
        publishedAt: new Date(),
        tags: {
          connect: [tags[0].id, tags[1].id, tags[2].id].map(id => ({ id }))
        }
      }
    }),
    prisma.post.create({
      data: {
        title: 'Modern Web Development with TypeScript',
        slug: 'modern-web-development-with-typescript',
        content: `# Modern Web Development with TypeScript

TypeScript has become essential for modern web development. It provides type safety and better developer experience.

## Benefits of TypeScript

### 1. Type Safety
TypeScript catches errors at compile time, reducing runtime errors.

### 2. Better IDE Support
Enhanced autocomplete and refactoring capabilities.

### 3. Improved Code Quality
Type annotations serve as documentation and help maintain code quality.`,
        excerpt: 'Discover how TypeScript improves your web development workflow.',
        status: 'PUBLISHED',
        authorId: users[2].id,
        categoryId: categories[0].id,
        featuredImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop',
        publishedAt: new Date(),
        tags: {
          connect: [tags[0].id, tags[3].id].map(id => ({ id }))
        }
      }
    }),
    prisma.post.create({
      data: {
        title: 'Building Scalable Business Strategies',
        slug: 'building-scalable-business-strategies',
        content: `# Building Scalable Business Strategies

Starting a business requires careful planning and strategic thinking. Here are some key strategies for startup success.

## Market Research

### 1. Identify Your Target Market
Understand who your customers are and what they need.

### 2. Analyze Competitors
Study your competition to find opportunities and gaps.

### 3. Validate Your Idea
Test your product or service with potential customers.`,
        excerpt: 'Essential business strategies for startup success.',
        status: 'DRAFT',
        authorId: users[1].id,
        categoryId: categories[1].id,
        featuredImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop',
        tags: {
          connect: [tags[4].id].map(id => ({ id }))
        }
      }
    })
  ]);

  console.log(`  ✅ Created ${posts.length} posts`);
  console.log(`  ✅ Created ${categories.length} categories`);
  console.log(`  ✅ Created ${tags.length} tags`);
  console.log(`  ✅ Created ${workflows.length} workflows`);

  return {
    posts: posts.length,
    categories: categories.length,
    tags: tags.length,
    workflows: workflows.length,
    templates: 0
  };
}

export type SeededContent = Awaited<ReturnType<typeof seedContent>>;