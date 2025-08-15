const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    console.log('🌱 Starting user seeding...');
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: 'admin@ja-cms.com'
      }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@ja-cms.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
        isVerified: true
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@ja-cms.com');
    console.log('🔑 Password: admin123');
    console.log('🆔 User ID:', adminUser.id);

    // Create a regular user
    const regularUser = await prisma.user.create({
      data: {
        email: 'user@ja-cms.com',
        password: hashedPassword,
        firstName: 'Regular',
        lastName: 'User',
        role: 'USER',
        isActive: true,
        isVerified: true
      }
    });

    console.log('✅ Regular user created successfully!');
    console.log('📧 Email: user@ja-cms.com');
    console.log('🔑 Password: admin123');
    console.log('🆔 User ID:', regularUser.id);

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedUsers();
