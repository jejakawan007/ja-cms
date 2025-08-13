#!/usr/bin/env node

const jwt = require('jsonwebtoken');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Fungsi untuk generate token (simulasi)
function generateTestToken() {
  const payload = {
    userId: 'test-user-id',
    email: 'admin@jacms.com',
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 jam
  };
  
  // Gunakan secret yang sama dengan backend
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  
  return jwt.sign(payload, secret);
}

async function testWithToken() {
  try {
    console.log('🧪 === TEST API WITH TOKEN ===\n');
    
    const token = generateTestToken();
    console.log(`🔑 Generated token: ${token.substring(0, 20)}...`);
    
    // Test API dengan token
    const response = await fetch('http://localhost:3001/api/media?folderId=cmea981fh000515cx3opjcxao', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    console.log('📡 API Response:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && result.data) {
      console.log(`\n✅ Success! Found ${result.data.length} files`);
      result.data.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.originalName}`);
      });
    } else {
      console.log('\n❌ Failed to get files');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Jalankan script
testWithToken();
