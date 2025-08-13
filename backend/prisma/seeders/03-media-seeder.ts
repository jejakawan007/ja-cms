/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { SeededUsers } from './01-users-seeder';

/**
 * Seed Media Management System
 * - Media files with processing
 * - Media folders and organization
 * - CDN cache and analytics
 */
export async function seedMedia(prisma: PrismaClient, users: SeededUsers) {
  console.log('  🖼️ Creating media files...');
  
  // TODO: Implement comprehensive media seeding
  // For now, create basic media files
  const mediaFiles = await Promise.all([
    prisma.mediaFile.create({
      data: {
        filename: 'hero-nextjs.jpg',
        originalName: 'hero-nextjs.jpg',
        mimeType: 'image/jpeg',
        size: 1024000,
        width: 1200,
        height: 600,
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=150&fit=crop',
        alt: 'Next.js Development',
        caption: 'Modern web development with Next.js',
        uploadedBy: users[0].id,
        processingStatus: 'completed'
      }
    }),
    prisma.mediaFile.create({
      data: {
        filename: 'react-architecture.jpg',
        originalName: 'react-architecture.jpg', 
        mimeType: 'image/jpeg',
        size: 856000,
        width: 1200,
        height: 600,
        url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=150&fit=crop',
        alt: 'React Application Architecture',
        uploadedBy: users[2].id,
        processingStatus: 'completed'
      }
    })
  ]);

  return {
    files: mediaFiles.length,
    folders: 0,
    processing: 0
  };
}

export type SeededMedia = Awaited<ReturnType<typeof seedMedia>>;
