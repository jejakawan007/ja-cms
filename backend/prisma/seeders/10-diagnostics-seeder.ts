/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { SeededUsers } from './01-users-seeder';

export async function seedDiagnostics(prisma: PrismaClient, users: SeededUsers) {
  console.log('  🔍 Creating diagnostics data...');
  
  const jobs = await Promise.all([
    prisma.diagnosticJob.create({
      data: {
        name: 'System Health Check',
        type: 'system',
        scope: 'full',
        targets: JSON.stringify(['database', 'server', 'cache']),
        status: 'completed',
        progress: 100,
        createdBy: users[0].id
      }
    })
  ]);

  return { jobs: jobs.length, issues: 0 };
}

export type SeededDiagnostics = Awaited<ReturnType<typeof seedDiagnostics>>;
