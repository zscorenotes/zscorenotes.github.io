#!/usr/bin/env node

/**
 * Migration Script: Update Image URLs for Content Repository Separation
 * 
 * This script updates all existing image URLs to point to the new content repository
 * instead of the main codebase repository.
 * 
 * Usage: node scripts/migrate-image-urls.js
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const OLD_BASE_URL = 'https://raw.githubusercontent.com/zscorenotes/zscorenotes.github.io/main/public/images/';
const NEW_BASE_URL = 'https://raw.githubusercontent.com/zscorenotes/zscore-content/main/images/';

/**
 * Update image URLs in JSON content files
 */
async function migrateImageURLsInJSON(filePath) {
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
    const originalContent = JSON.stringify(data);
    
    // Function to recursively update URLs in any object/array
    function updateURLsRecursively(obj) {
      if (Array.isArray(obj)) {
        obj.forEach(updateURLsRecursively);
      } else if (obj && typeof obj === 'object') {
        for (const key in obj) {
          if (typeof obj[key] === 'string' && obj[key].includes(OLD_BASE_URL)) {
            console.log(`  🔄 Updating ${key}: ${obj[key]} → ${obj[key].replace(OLD_BASE_URL, NEW_BASE_URL)}`);
            obj[key] = obj[key].replace(OLD_BASE_URL, NEW_BASE_URL);
            changes++;
          } else if (Array.isArray(obj[key])) {
            // Handle arrays like image_urls
            obj[key] = obj[key].map(item => {
              if (typeof item === 'string' && item.includes(OLD_BASE_URL)) {
                console.log(`  🔄 Updating array item: ${item} → ${item.replace(OLD_BASE_URL, NEW_BASE_URL)}`);
                changes++;
                return item.replace(OLD_BASE_URL, NEW_BASE_URL);
              }
              return item;
            });
          } else {
            updateURLsRecursively(obj[key]);
          }
        }
      }
    }
    
    updateURLsRecursively(data);
    
    if (changes > 0) {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Updated ${changes} image URLs in ${filePath}`);
      return { updated: true, changes };
    } else {
      console.log(`✨ No image URLs to update in ${filePath}`);
      return { updated: false, changes: 0 };
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { updated: false, changes: 0 };
  }
}

/**
 * Update image URLs in HTML content files
 */
async function migrateImageURLsInHTML(filePath) {
  try {
    console.log(`📝 Processing HTML file: ${filePath}`);
    
    const content = await fs.readFile(filePath, 'utf8');
    let changes = 0;
    
    // Replace old URLs with new URLs
    const updatedContent = content.replace(
      new RegExp(OLD_BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      (match) => {
        changes++;
        console.log(`  🔄 Updating HTML image URL: ${match} → ${NEW_BASE_URL}`);
        return NEW_BASE_URL;
      }
    );
    
    if (changes > 0) {
      await fs.writeFile(filePath, updatedContent);
      console.log(`✅ Updated ${changes} image URLs in ${filePath}`);
      return { updated: true, changes };
    } else {
      console.log(`✨ No image URLs to update in ${filePath}`);
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
    
    // HTML files in content subdirectories
    const contentDir = path.join(contentDataDir, 'content');
    try {
      const contentTypes = await fs.readdir(contentDir);
      
      for (const contentType of contentTypes) {
        const typeDir = path.join(contentDir, contentType);
        const stat = await fs.stat(typeDir);
        
        if (stat.isDirectory()) {
          const htmlFiles = await fs.readdir(typeDir);
          for (const file of htmlFiles) {
            if (file.endsWith('.html')) {
              files.push({
                path: path.join(typeDir, file),
                type: 'html'
              });
            }
          }
        }
      }
    } catch (error) {
      console.warn('⚠️  Content directory not found, skipping HTML files...');
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
  console.log('🚀 Starting Image URL Migration...');
  console.log(`📍 From: ${OLD_BASE_URL}`);
  console.log(`📍 To: ${NEW_BASE_URL}`);
  console.log('');
  
  const files = await findContentFiles();
  
  if (files.length === 0) {
    console.log('⚠️  No content files found to migrate.');
    return;
  }
  
  console.log(`📁 Found ${files.length} content files to check:`);
  files.forEach(file => console.log(`   - ${file.path} (${file.type})`));
  console.log('');
  
  let totalUpdated = 0;
  let totalChanges = 0;
  
  for (const file of files) {
    const result = file.type === 'json' 
      ? await migrateImageURLsInJSON(file.path)
      : await migrateImageURLsInHTML(file.path);
    
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
  }
}

// Run the migration
main().catch(error => {
  console.error('💥 Migration failed:', error);
  process.exit(1);
});