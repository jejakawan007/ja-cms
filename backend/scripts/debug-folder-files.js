#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugFolderFiles() {
  try {
    console.log('🔍 === DEBUG FOLDER FILES ===\n');
    
    // Ambil folder "new"
    const folder = await prisma.mediaFolder.findFirst({
      where: { name: 'new' },
      include: {
        _count: {
          select: { files: true }
        }
      }
    });
    
    if (!folder) {
      console.log('❌ Folder "new" tidak ditemukan');
      return;
    }
    
    console.log(`📁 Folder: ${folder.name}`);
    console.log(`   ID: ${folder.id}`);
    console.log(`   Path: ${folder.path}`);
    console.log(`   File Count: ${folder._count.files}\n`);
    
    // Cari file yang terkait dengan folder ini
    const files = await prisma.mediaFile.findMany({
      where: {
        folderId: folder.id
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    console.log(`📄 Files in folder "${folder.name}":`);
    if (files.length === 0) {
      console.log('   ❌ Tidak ada file ditemukan');
    } else {
      files.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.originalName}`);
        console.log(`      ID: ${file.id}`);
        console.log(`      Filename: ${file.filename}`);
        console.log(`      Folder ID: ${file.folderId}`);
        console.log(`      Folder Name: ${file.folder?.name || 'Unknown'}`);
        console.log(`      URL: ${file.url}`);
        console.log('');
      });
    }
    
    // Cari semua file tanpa filter folder
    console.log('🔍 === ALL FILES (NO FOLDER FILTER) ===\n');
    const allFiles = await prisma.mediaFile.findMany({
      include: {
        folder: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    console.log(`📄 Total files in database: ${allFiles.length}`);
    allFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.originalName}`);
      console.log(`      ID: ${file.id}`);
      console.log(`      Folder ID: ${file.folderId || 'NULL'}`);
      console.log(`      Folder Name: ${file.folder?.name || 'No Folder'}`);
      console.log('');
    });
    
    // Test query dengan folderId
    console.log('🔍 === TEST QUERY WITH FOLDER ID ===\n');
    const testQuery = await prisma.mediaFile.findMany({
      where: {
        folderId: folder.id
      }
    });
    
    console.log(`Query result for folderId "${folder.id}": ${testQuery.length} files`);
    testQuery.forEach(file => {
      console.log(`   - ${file.originalName} (${file.id})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan script
debugFolderFiles();
