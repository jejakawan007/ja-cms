// Integration Test Setup untuk JA-CMS
// Setup untuk cross-service testing

import { PrismaClient } from '@prisma/client';

// Test database configuration
const testDatabaseUrl = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/ja_cms_test';

// Create test Prisma client
const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: testDatabaseUrl,
    },
  },
});

// Global test setup
beforeAll(async () => {
  // Setup test database
  await testPrisma.$connect();
  
  // Clean test database
  await testPrisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  await testPrisma.$executeRaw`TRUNCATE TABLE "Post" CASCADE`;
  await testPrisma.$executeRaw`TRUNCATE TABLE "Category" CASCADE`;
  await testPrisma.$executeRaw`TRUNCATE TABLE "Tag" CASCADE`;
  await testPrisma.$executeRaw`TRUNCATE TABLE "Session" CASCADE`;
});

afterAll(async () => {
  // Cleanup test database
  await testPrisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  await testPrisma.$executeRaw`TRUNCATE TABLE "Post" CASCADE`;
  await testPrisma.$executeRaw`TRUNCATE TABLE "Category" CASCADE`;
  await testPrisma.$executeRaw`TRUNCATE TABLE "Tag" CASCADE`;
  await testPrisma.$executeRaw`TRUNCATE TABLE "Session" CASCADE`;
  
  // Disconnect from test database
  await testPrisma.$disconnect();
});

beforeEach(async () => {
  // Reset test database before each test
  await testPrisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  await testPrisma.$executeRaw`TRUNCATE TABLE "Post" CASCADE`;
  await testPrisma.$executeRaw`TRUNCATE TABLE "Category" CASCADE`;
  await testPrisma.$executeRaw`TRUNCATE TABLE "Tag" CASCADE`;
  await testPrisma.$executeRaw`TRUNCATE TABLE "Session" CASCADE`;
});

// Export test Prisma client
export { testPrisma };

// Test utilities
export const createTestUser = async (userData: any) => {
  return await testPrisma.user.create({
    data: userData,
  });
};

export const createTestPost = async (postData: any) => {
  return await testPrisma.post.create({
    data: postData,
  });
};

export const createTestCategory = async (categoryData: any) => {
  return await testPrisma.category.create({
    data: categoryData,
  });
};

export const createTestTag = async (tagData: any) => {
  return await testPrisma.tag.create({
    data: tagData,
  });
}; 