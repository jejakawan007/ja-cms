/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { SeededUsers } from './01-users-seeder';

export async function seedTools(prisma: PrismaClient, users: SeededUsers) {
  console.log('  🔧 Creating tools data...');
  
  // Create backup job
  const backups = await Promise.all([
    prisma.backupJob.create({
      data: {
        name: 'Daily Backup',
        type: 'full',
        status: 'completed',
        size: BigInt(1024000000),
        location: '/backups/daily-2024.sql',
        storageType: 'local',
        createdBy: users[0].id
      }
    })
  ]);

  return { jobs: 0, backups: backups.length };
}

export type SeededTools = Awaited<ReturnType<typeof seedTools>>;
