/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { SeededUsers } from './01-users-seeder';

export async function seedSecurity(prisma: PrismaClient, users: SeededUsers) {
  console.log('  🛡️ Creating security events...');
  
  // Create some security events
  const events = await Promise.all([
    prisma.securityEvent.create({
      data: {
        type: 'login_success',
        severity: 'low',
        source: 'login',
        description: 'Successful login',
        ipAddress: '192.168.1.100',
        userId: users[0].id
      }
    })
  ]);

  return { events: events.length, rules: 0 };
}

export type SeededSecurity = Awaited<ReturnType<typeof seedSecurity>>;
