#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function viewUploadsFiles() {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  
  console.log('📁 === FILE FISIK DI UPLOADS ===\n');
  console.log(`📂 Direktori: ${uploadsDir}\n`);
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('❌ Direktori uploads tidak ditemukan');
    return;
  }
  
  try {
    const files = fs.readdirSync(uploadsDir);
    
    if (files.length === 0) {
      console.log('❌ Tidak ada file di direktori uploads');
    } else {
      console.log(`✅ Ditemukan ${files.length} file:\n`);
      
      let totalSize = 0;
      
      files.forEach((file, index) => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        totalSize += stats.size;
        
        console.log(`${index + 1}. 📄 ${file}`);
        console.log(`   Ukuran: ${sizeInMB} MB`);
        console.log(`   Dibuat: ${stats.birthtime.toLocaleString('id-ID')}`);
        console.log(`   Dimodifikasi: ${stats.mtime.toLocaleString('id-ID')}`);
        console.log('');
      });
      
      const totalSizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
      console.log(`📊 Total ukuran semua file: ${totalSizeInMB} MB`);
    }
    
  } catch (error) {
    console.error('❌ Error membaca direktori:', error.message);
  }
}

// Jalankan script
viewUploadsFiles();
