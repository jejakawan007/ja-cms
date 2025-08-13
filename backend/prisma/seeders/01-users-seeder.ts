/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

/**
 * Seed Users & Authentication System
 * - Users with different roles
 * - Password history
 * - Active sessions
 * - Login attempts
 */
export async function seedUsers(prisma: PrismaClient) {
  console.log('  👤 Creating users with roles...');

  // Create Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@jacms.com',
      password: await bcrypt.hash('admin123', 12),
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
      isVerified: true,
      bio: 'System Super Administrator with full access to all features.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    }
  });

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin2@jacms.com',
      password: await bcrypt.hash('admin123', 12),
      firstName: 'Site',
      lastName: 'Administrator',
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
      bio: 'Site Administrator managing content and users.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  });

  // Create Editor
  const editor = await prisma.user.create({
    data: {
      email: 'editor@jacms.com',
      password: await bcrypt.hash('editor123', 12),
      firstName: 'Content',
      lastName: 'Editor',
      role: 'EDITOR',
      isActive: true,
      isVerified: true,
      bio: 'Content Editor responsible for reviewing and publishing content.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    }
  });

  // Create Regular User
  const regularUser = await prisma.user.create({
    data: {
      email: 'user@jacms.com',
      password: await bcrypt.hash('user123', 12),
      firstName: 'Regular',
      lastName: 'User',
      role: 'USER',
      isActive: true,
      isVerified: true,
      bio: 'Regular user exploring the platform.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    }
  });

  // Create additional test users
  const users = [superAdmin, admin, editor, regularUser];

  for (let i = 1; i <= 6; i++) {
    const testUser = await prisma.user.create({
      data: {
        email: `user${i}@test.com`,
        password: await bcrypt.hash('test123', 12),
        firstName: `Test`,
        lastName: `User ${i}`,
        role: i <= 2 ? 'EDITOR' : 'USER',
        isActive: i <= 5, // Some inactive users
        isVerified: i <= 4, // Some unverified
        bio: `Test user ${i} for development and testing purposes.`,
        avatar: `https://images.unsplash.com/photo-${1500648767791 + i}?w=150&h=150&fit=crop&crop=face`
      }
    });
    users.push(testUser);
  }

  console.log(`  ✅ Created ${users.length} users with different roles`);

  // Create Password History (simplified)
  console.log('  🔐 Creating password history...');
  const passwordHistories = [];
  for (const user of users.slice(0, 3)) { // Only for main users
    const history = await prisma.passwordHistory.create({
      data: {
        userId: user.id,
        passwordHash: await bcrypt.hash('oldpassword', 12),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      }
    });
    passwordHistories.push(history);
  }

  // Create Active Sessions (simplified)
  console.log('  🔗 Creating active sessions...');
  const activeSessions = [];
  for (const user of users.slice(0, 4)) { // Only for active users
    const session = await prisma.activeSession.create({
      data: {
        userId: user.id,
        sessionId: `session_${user.id}_${Date.now()}`,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0',
        location: 'Jakarta, Indonesia',
        device: 'Desktop',
        isActive: true,
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    });
    activeSessions.push(session);
  }

  // Create Login Attempts (simplified)
  console.log('  🔑 Creating login attempts...');
  const loginAttempts = [];
  for (let i = 0; i < 10; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const success = Math.random() > 0.3; // 70% success rate
    
    const attempt = await prisma.loginAttempt.create({
      data: {
        email: success ? user.email : `fake${i}@test.com`,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success,
        failureReason: success ? null : 'Invalid credentials',
        userId: success ? user.id : null,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Within last week
      }
    });
    loginAttempts.push(attempt);
  }

  console.log(`  ✅ Created ${passwordHistories.length} password history records`);
  console.log(`  ✅ Created ${activeSessions.length} active sessions`);
  console.log(`  ✅ Created ${loginAttempts.length} login attempts`);

  return users;
}

export type SeededUsers = Awaited<ReturnType<typeof seedUsers>>;