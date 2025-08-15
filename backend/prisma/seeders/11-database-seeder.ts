/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { SeededUsers } from './01-users-seeder';

export async function seedDatabase(prisma: PrismaClient, users: SeededUsers) {
  console.log('  🗄️ Creating database management data...');
  
  const optimizations = await Promise.all([
    prisma.databaseOptimizationJob.create({
      data: {
        name: 'Index Optimization',
        type: 'index_optimization',
        targets: JSON.stringify(['posts', 'users', 'media']),
        status: 'completed',
        progress: 100,
        createdBy: users[0].id
      }
    })
  ]);

  const metrics = await Promise.all([
    prisma.databaseMetric.create({
      data: {
        performanceMetrics: JSON.stringify({
          avgQueryTime: 45.2,
          slowQueries: 3,
          connections: 25
        }),
        storageMetrics: JSON.stringify({
          totalSize: '2.5GB',
          indexSize: '512MB'
        }),
        connectionMetrics: JSON.stringify({
          active: 25,
          idle: 10,
          max: 100
        })
      }
    })
  ]);

  return { optimizations: optimizations.length, metrics: metrics.length };
}

export type SeededDatabase = Awaited<ReturnType<typeof seedDatabase>>;
