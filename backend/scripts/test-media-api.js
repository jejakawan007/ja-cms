#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMediaAPI() {
  try {
    console.log('🧪 === TEST MEDIA API ===\n');
    
    // Ambil user pertama untuk mendapatkan token
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      }
    });
    
    if (!user) {
      console.log('❌ Tidak ada user di database');
      return;
    }
    
    console.log(`👤 User: ${user.firstName} ${user.lastName} (${user.email})`);
    
    // Ambil folder "new"
    const folder = await prisma.mediaFolder.findFirst({
      where: { name: 'new' }
    });
    
    if (!folder) {
      console.log('❌ Folder "new" tidak ditemukan');
      return;
    }
    
    console.log(`📁 Folder: ${folder.name} (ID: ${folder.id})\n`);
    
    // Test query langsung ke database
    console.log('🔍 === DATABASE QUERY TEST ===\n');
    
    const files = await prisma.mediaFile.findMany({
      where: {
        folderId: folder.id
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
      }
    });
    
    console.log(`📄 Files found: ${files.length}`);
    files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.originalName}`);
      console.log(`      ID: ${file.id}`);
      console.log(`      Folder: ${file.folder?.name}`);
      console.log(`      Uploader: ${file.uploader?.firstName} ${file.uploader?.lastName}`);
      console.log(`      URL: ${file.url}`);
      console.log('');
    });
    
    // Simulasi response format yang diharapkan frontend
    console.log('📡 === EXPECTED API RESPONSE FORMAT ===\n');
    
    const expectedResponse = {
      success: true,
      data: files.map(file => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        url: file.url,
        alt: file.alt,
        description: file.description,
        folderId: file.folderId,
        createdAt: file.createdAt,
        uploader: file.uploader,
        folder: file.folder
      })),
      message: 'Media files retrieved successfully'
    };
    
    console.log('Expected response structure:');
    console.log(JSON.stringify(expectedResponse, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan script
testMediaAPI();
