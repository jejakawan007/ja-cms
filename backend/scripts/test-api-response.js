#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAPIResponse() {
  try {
    console.log('🧪 === TEST API RESPONSE FORMAT ===\n');
    
    // Simulasi response dari MediaService.getAllMedia
    const mockMediaServiceResponse = {
      data: [
        {
          id: "cmeaa0z8i002p15cx427pmvta",
          filename: "d6e18cf6-76ea-4532-afc6-b76252d23d28.JPG",
          originalName: "BPPK-Lt. 2 R02_page-0001.JPG",
          mimeType: "image/jpeg",
          size: 301521,
          url: "/uploads/d6e18cf6-76ea-4532-afc6-b76252d23d28.JPG",
          alt: null,
          description: null,
          folderId: "cmea981fh000515cx3opjcxao",
          createdAt: "2025-08-13T18:01:06.403Z",
          uploader: {
            firstName: "Super",
            lastName: "Admin"
          },
          folder: {
            name: "new"
          }
        }
      ],
      pagination: {
        page: 1,
        limit: 100,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    };
    
    console.log('📡 MediaService Response:');
    console.log(JSON.stringify(mockMediaServiceResponse, null, 2));
    
    // Simulasi response dari MediaController (SEBELUM perbaikan)
    const oldControllerResponse = {
      success: true,
      data: mockMediaServiceResponse,  // Object dengan data dan pagination
      message: 'Media files retrieved successfully'
    };
    
    console.log('\n❌ OLD Controller Response (BROKEN):');
    console.log(JSON.stringify(oldControllerResponse, null, 2));
    
    // Simulasi response dari MediaController (SETELAH perbaikan)
    const newControllerResponse = {
      success: true,
      data: mockMediaServiceResponse.data,  // Array file langsung
      pagination: mockMediaServiceResponse.pagination,
      message: 'Media files retrieved successfully'
    };
    
    console.log('\n✅ NEW Controller Response (FIXED):');
    console.log(JSON.stringify(newControllerResponse, null, 2));
    
    // Test parsing di frontend
    console.log('\n🔍 === FRONTEND PARSING TEST ===\n');
    
    // Simulasi parsing di frontend
    const result = newControllerResponse;
    
    if (result.success && result.data) {
      const mediaArray = Array.isArray(result.data) ? result.data : (result.data.data || result.data.media || []);
      
      console.log('📄 Parsed media array length:', mediaArray.length);
      console.log('📄 First file:', mediaArray[0]?.originalName || 'No file');
      
      const files = mediaArray.map((file) => ({
        id: file.id || '',
        filename: file.filename || '',
        originalName: file.originalName || file.filename || '',
        mimeType: file.mimeType || 'application/octet-stream',
        size: file.size || 0,
        url: file.url || '',
        alt: file.alt || '',
        description: file.description || '',
        uploadedBy: file.uploader?.firstName || 'Unknown',
        createdAt: file.createdAt || new Date().toISOString(),
        folderId: file.folderId || null,
      }));
      
      console.log('📁 Final files array length:', files.length);
      console.log('📁 First file name:', files[0]?.originalName || 'No file');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan script
testAPIResponse();
