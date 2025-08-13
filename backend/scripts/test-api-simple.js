#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAPISimple() {
  try {
    console.log('🧪 === SIMPLE API TEST ===\n');
    
    // Test query langsung seperti yang dilakukan MediaService.getAllMedia
    const files = await prisma.mediaFile.findMany({
      where: {
        folderId: 'cmea981fh000515cx3opjcxao' // folder "new"
      },
      include: {
        uploader: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        folder: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📄 Found ${files.length} files in folder "new":`);
    files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.originalName}`);
      console.log(`      ID: ${file.id}`);
      console.log(`      URL: ${file.url}`);
      console.log(`      Uploader: ${file.uploader?.firstName} ${file.uploader?.lastName}`);
      console.log('');
    });
    
    // Simulasi response yang akan dikirim ke frontend
    const response = {
      success: true,
      data: files,
      message: 'Media files retrieved successfully'
    };
    
    console.log('📡 Response yang akan dikirim ke frontend:');
    console.log(JSON.stringify(response, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan script
testAPISimple();
