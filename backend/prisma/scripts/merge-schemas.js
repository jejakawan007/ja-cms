#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SCHEMAS_DIR = path.join(__dirname, '..', 'schemas');
const OUTPUT_FILE = path.join(__dirname, '..', 'schema.prisma');

/**
 * Merge all schema files into one main schema.prisma
 */
function mergeSchemas() {
  console.log('🔄 Merging Prisma schemas...');

  // Schema files in order of dependency
  const schemaFiles = [
    'base.prisma',                // Core models and enums first
    'analytics.prisma',           // Analytics models
    'content.prisma',             // Content models
    'system.prisma',              // System models
    'media.prisma',               // Media management models
    'security.prisma',            // Security models
    'tools.prisma',               // Tools & utilities models
    'extensions.prisma',          // Extensions system models
    'diagnostics.prisma',         // Advanced diagnostics models
    'database.prisma',            // Database management models
    'advanced-extensions.prisma', // Advanced extensions & development models
    'dashboard.prisma'            // Dashboard system models
  ];

  let mergedContent = '';
  let hasGenerator = false;
  let hasDatasource = false;

  for (const file of schemaFiles) {
    const filePath = path.join(SCHEMAS_DIR, file);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Warning: ${file} not found, skipping...`);
      continue;
    }

    console.log(`📄 Processing ${file}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove duplicate generator and datasource blocks (keep only from base.prisma)
    if (file !== 'base.prisma') {
      // Remove generator and datasource blocks from non-base files
      content = content.replace(/generator\s+\w+\s*\{[^}]*\}/gs, '');
      content = content.replace(/datasource\s+\w+\s*\{[^}]*\}/gs, '');
    } else {
      hasGenerator = content.includes('generator client');
      hasDatasource = content.includes('datasource db');
    }
    
    // Clean up extra whitespace
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    mergedContent += content + '\n\n';
  }

  // Validate that we have generator and datasource
  if (!hasGenerator) {
    throw new Error('❌ No generator block found in base.prisma');
  }
  if (!hasDatasource) {
    throw new Error('❌ No datasource block found in base.prisma');
  }

  // Write merged content
  fs.writeFileSync(OUTPUT_FILE, mergedContent.trim() + '\n');
  
  console.log('✅ Schema merged successfully!');
  console.log(`📁 Output: ${OUTPUT_FILE}`);
  
  // Show statistics
  const modelCount = (mergedContent.match(/^model\s+\w+/gm) || []).length;
  const enumCount = (mergedContent.match(/^enum\s+\w+/gm) || []).length;
  
  console.log(`📊 Statistics:`);
  console.log(`   - Models: ${modelCount}`);
  console.log(`   - Enums: ${enumCount}`);
  console.log(`   - Files merged: ${schemaFiles.length}`);
}

// Run the merger
try {
  mergeSchemas();
} catch (error) {
  console.error('❌ Error merging schemas:', error.message);
  process.exit(1);
}
