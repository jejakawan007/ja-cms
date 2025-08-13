/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { SeededUsers } from './01-users-seeder';

export async function seedExtensions(prisma: PrismaClient, users: SeededUsers) {
  console.log('  🔌 Creating plugins...');
  
  // Create sample plugin
  const plugins = await Promise.all([
    prisma.plugin.create({
      data: {
        name: 'SEO Optimizer',
        slug: 'seo-optimizer',
        version: '1.0.0',
        description: 'Advanced SEO optimization plugin',
        author: 'JA-CMS Team',
        status: 'active',
        type: 'plugin',
        category: 'seo',
        manifest: JSON.stringify({
          name: 'SEO Optimizer',
          version: '1.0.0',
          main: 'index.js'
        }),
        installPath: '/plugins/seo-optimizer',
        installedBy: users[0].id
      }
    })
  ]);

  return { plugins: plugins.length, marketplace: 0 };
}

export type SeededExtensions = Awaited<ReturnType<typeof seedExtensions>>;
