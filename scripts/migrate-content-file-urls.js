#!/usr/bin/env node

/**
 * Migration Script: Update content_file URLs to use raw GitHub URLs
 * 
 * This script updates all existing content_file references from local paths
 * to raw GitHub URLs for production compatibility.
 * 
 * Usage: node scripts/migrate-content-file-urls.js
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GITHUB_OWNER = 'zscorenotes';
const GITHUB_REPO = 'zscore-content';
const CONTENT_BRANCH = 'main';

/**
 * Convert local content_file path to raw GitHub URL
 */
function convertToGitHubURL(localPath) {
  // Remove leading slash and content-data prefix if present
  let cleanPath = localPath.replace(/^\/?(content-data\/)?/, '');
  
  // Ensure it starts with content/
  if (!cleanPath.startsWith('content/')) {
    cleanPath = `content/${cleanPath}`;
  }
  
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${CONTENT_BRANCH}/${cleanPath}`;
}

/**
 * Update content_file URLs in JSON content files
 */
async function migrateContentFileURLsInJSON(filePath) {
  try {
    console.log(`📝 Processing JSON file: ${filePath}`);
    
    const content = await fs.readFile(filePath, 'utf8');
    let data;
    
    try {
      data = JSON.parse(content);
    } catch (error) {
      console.warn(`⚠️  Invalid JSON in ${filePath}, skipping...`);
      return { updated: false, changes: 0 };
    }
    
    let changes = 0;
    
    // Function to recursively update content_file URLs in any object/array
    function updateContentFileURLsRecursively(obj) {
      if (Array.isArray(obj)) {
        obj.forEach(updateContentFileURLsRecursively);
      } else if (obj && typeof obj === 'object') {
        for (const key in obj) {
          if (key === 'content_file' && typeof obj[key] === 'string') {
            // Check if it's a local path that needs conversion
            if (!obj[key].startsWith('https://')) {
              const oldPath = obj[key];
              const newURL = convertToGitHubURL(oldPath);
              console.log(`  🔄 Updating content_file: ${oldPath} → ${newURL}`);
              obj[key] = newURL;
              changes++;
            }
          } else {
            updateContentFileURLsRecursively(obj[key]);
          }
        }
      }
    }
    
    updateContentFileURLsRecursively(data);
    
    if (changes > 0) {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Updated ${changes} content_file URLs in ${filePath}`);
      return { updated: true, changes };
    } else {
      console.log(`✨ No content_file URLs to update in ${filePath}`);
      return { updated: false, changes: 0 };
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { updated: false, changes: 0 };
  }
}

/**
 * Find all content files to migrate
 */
async function findContentFiles() {
  const contentDataDir = path.join(__dirname, '..', 'content-data');
  const files = [];
  
  try {
    // JSON files in content-data root
    const jsonFiles = await fs.readdir(contentDataDir);
    for (const file of jsonFiles) {
      if (file.endsWith('.json')) {
        files.push({
          path: path.join(contentDataDir, file),
          type: 'json'
        });
      }
    }
  } catch (error) {
    console.error('❌ Error finding content files:', error.message);
    process.exit(1);
  }
  
  return files;
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting content_file URL Migration...');
  console.log(`📍 Converting local paths to: https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${CONTENT_BRANCH}/content/...`);
  console.log('');
  
  const files = await findContentFiles();
  
  if (files.length === 0) {
    console.log('⚠️  No content files found to migrate.');
    return;
  }
  
  console.log(`📁 Found ${files.length} content files to check:`);
  files.forEach(file => console.log(`   - ${file.path}`));
  console.log('');
  
  let totalUpdated = 0;
  let totalChanges = 0;
  
  for (const file of files) {
    const result = await migrateContentFileURLsInJSON(file.path);
    
    if (result.updated) {
      totalUpdated++;
      totalChanges += result.changes;
    }
  }
  
  console.log('');
  console.log('🎉 Migration Complete!');
  console.log(`📊 Updated ${totalUpdated} files with ${totalChanges} total changes`);
  
  if (totalChanges > 0) {
    console.log('');
    console.log('⚠️  Important: Review the changes and commit them to your repository');
    console.log('💡 Tip: You can use `git diff` to see what was changed');
    console.log('🔄 New content created after this migration will automatically use GitHub URLs');
  }
}

// Run the migration
main().catch(error => {
  console.error('💥 Migration failed:', error);
  process.exit(1);
});