/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { SeededUsers } from './01-users-seeder';

export async function seedSystem(prisma: PrismaClient, users: SeededUsers) {
  console.log('  ⚙️ Creating system settings...');
  
  const settings = await Promise.all([
    prisma.setting.create({
      data: {
        key: 'site_name',
        value: 'JA-CMS Enterprise',
        type: 'STRING',
        isPublic: true
      }
    })
  ]);

  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        title: 'Welcome to JA-CMS',
        message: 'Welcome to JA-CMS Enterprise!',
        type: 'INFO',
        userId: users[0].id
      }
    })
  ]);

  return { settings: settings.length, notifications: notifications.length };
}

export type SeededSystem = Awaited<ReturnType<typeof seedSystem>>;
