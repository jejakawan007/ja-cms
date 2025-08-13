#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function viewMediaData() {
  try {
    console.log('📁 === DATA FOLDER MEDIA ===\n');
    
    // Ambil semua folder
    const folders = await prisma.mediaFolder.findMany({
      include: {
        _count: {
          select: { files: true }
        },
        creator: {
          select: {
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (folders.length === 0) {
      console.log('❌ Tidak ada folder yang ditemukan');
    } else {
      console.log(`✅ Ditemukan ${folders.length} folder:\n`);
      
      folders.forEach((folder, index) => {
        console.log(`${index + 1}. 📁 ${folder.name}`);
        console.log(`   ID: ${folder.id}`);
        console.log(`   Path: ${folder.path}`);
        console.log(`   Deskripsi: ${folder.description || 'Tidak ada'}`);
        console.log(`   Jumlah File: ${folder._count.files}`);
        console.log(`   Dibuat oleh: ${folder.creator?.firstName || 'Unknown'} ${folder.creator?.lastName || ''}`);
        console.log(`   Dibuat pada: ${folder.createdAt.toLocaleString('id-ID')}`);
        console.log(`   Public: ${folder.isPublic ? 'Ya' : 'Tidak'}`);
        console.log('');
      });
    }

    console.log('📄 === DATA FILE MEDIA ===\n');
    
    // Ambil semua file
    const files = await prisma.mediaFile.findMany({
      include: {
        folder: {
          select: {
            name: true,
            path: true
          }
        },
        uploader: {
          select: {
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Batasi 20 file terbaru
    });

    if (files.length === 0) {
      console.log('❌ Tidak ada file yang ditemukan');
    } else {
      console.log(`✅ Ditemukan ${files.length} file terbaru:\n`);
      
      files.forEach((file, index) => {
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        console.log(`${index + 1}. 📄 ${file.originalName}`);
        console.log(`   ID: ${file.id}`);
        console.log(`   Filename: ${file.filename}`);
        console.log(`   URL: ${file.url}`);
        console.log(`   Ukuran: ${sizeInMB} MB`);
        console.log(`   Tipe: ${file.mimeType}`);
        console.log(`   Folder: ${file.folder?.name || 'Root (Tidak ada folder)'}`);
        console.log(`   Upload oleh: ${file.uploader?.firstName || 'Unknown'} ${file.uploader?.lastName || ''}`);
        console.log(`   Status: ${file.processingStatus}`);
        console.log(`   Upload pada: ${file.createdAt.toLocaleString('id-ID')}`);
        console.log('');
      });
    }

    // Statistik
    console.log('📊 === STATISTIK ===\n');
    
    const totalFiles = await prisma.mediaFile.count();
    const totalFolders = await prisma.mediaFolder.count();
    const totalSize = await prisma.mediaFile.aggregate({
      _sum: { size: true }
    });
    
    const totalSizeInMB = totalSize._sum.size ? (totalSize._sum.size / (1024 * 1024)).toFixed(2) : 0;
    
    console.log(`📁 Total Folder: ${totalFolders}`);
    console.log(`📄 Total File: ${totalFiles}`);
    console.log(`💾 Total Ukuran: ${totalSizeInMB} MB`);
    
    // File per folder
    const filesPerFolder = await prisma.mediaFolder.findMany({
      include: {
        _count: {
          select: { files: true }
        }
      }
    });
    
    if (filesPerFolder.length > 0) {
      console.log('\n📈 File per Folder:');
      filesPerFolder
        .sort((a, b) => b._count.files - a._count.files)
        .forEach(folder => {
          if (folder._count.files > 0) {
            console.log(`   ${folder.name}: ${folder._count.files} file`);
          }
        });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan script
viewMediaData();
