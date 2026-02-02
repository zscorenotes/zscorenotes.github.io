/**
 * Storage Adapter - Handles local vs GitHub storage automatically
 * Server-side only module
 */

import { promises as fs } from 'fs';
import path from 'path';
import { getAllContentFromGitHub, saveContentToGitHub } from './github-storage.js';

/**
 * Check if we should use local storage (development) or GitHub (production)
 */
function shouldUseLocalStorage() {
  // Use local storage if:
  // 1. No GitHub token available, OR
  // 2. Explicitly in development mode
  const hasGitHubToken = !!process.env.GITHUB_TOKEN;
  const isDevelopment = process.env.NODE_ENV === 'development';
  const contentRepo = process.env.CONTENT_GITHUB_REPO;
  const contentOwner = process.env.CONTENT_GITHUB_OWNER;
  
  // Debug logging for production issues
  console.log('🔍 Storage Adapter Debug:', {
    NODE_ENV: process.env.NODE_ENV,
    isDevelopment,
    hasGitHubToken,
    CONTENT_GITHUB_REPO: contentRepo,
    CONTENT_GITHUB_OWNER: contentOwner,
    VERCEL_ENV: process.env.VERCEL_ENV
  });
  
  // In development, prefer local storage even if GitHub token exists
  if (isDevelopment) {
    console.log('📁 Using local file storage (development mode)');
    return true;
  }
  
  // In production, use GitHub if token is available
  if (!hasGitHubToken) {
    console.log('📁 Using local file storage (no GitHub token)');
    console.error('❌ GITHUB_TOKEN not found in environment variables');
    return true;
  }
  
  // Check if content repository variables are set
  if (!contentRepo || !contentOwner) {
    console.log('📁 Using local file storage (missing content repo config)');
    console.error('❌ CONTENT_GITHUB_REPO or CONTENT_GITHUB_OWNER not set');
    return true;
  }
  
  console.log('☁️ Using GitHub storage (production mode)');
  return false;
}

/**
 * Get local content directory path
 */
function getLocalContentPath() {
  return path.join(process.cwd(), 'content-data');
}

/**
 * Read content from local file system
 */
async function readLocalContent(filename) {
  try {
    const filePath = path.join(getLocalContentPath(), filename);
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return null
      return null;
    }
    throw error;
  }
}

/**
 * Write content to local file system
 */
async function writeLocalContent(filename, data) {
  try {
    const contentDir = getLocalContentPath();
    const filePath = path.join(contentDir, filename);
    
    // Ensure directory exists
    await fs.mkdir(contentDir, { recursive: true });
    
    // Write content
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`✅ Content saved locally: ${filename}`);
    return true;
  } catch (error) {
    console.error('❌ Error saving content locally:', error);
    return false;
  }
}

/**
 * Get all content (local or GitHub)
 */
export async function getAllContent() {
  if (shouldUseLocalStorage()) {
    // Load from local files
    const contentTypes = ['projects', 'services', 'portfolio', 'about', 'settings', 'categories'];
    const content = {};
    
    for (const contentType of contentTypes) {
      const filename = `${contentType}.json`;
      const data = await readLocalContent(filename);
      
      if (data) {
        content[contentType] = data;
      } else {
        // Provide empty defaults
        if (['projects', 'services', 'portfolio'].includes(contentType)) {
          content[contentType] = [];
        } else if (contentType === 'categories') {
          content[contentType] = {
            services: [],
            portfolio: [],
            projects: [],
            updated_at: new Date().toISOString()
          };
        } else {
          content[contentType] = { updated_at: new Date().toISOString() };
        }
      }
    }
    
    return content;
  } else {
    // Load from GitHub
    return await getAllContentFromGitHub();
  }
}

/**
 * Save content (local or GitHub)
 */
export async function saveContent(contentType, data) {
  if (shouldUseLocalStorage()) {
    // Save to local file
    const filename = `${contentType}.json`;
    return await writeLocalContent(filename, data);
  } else {
    // Save to GitHub
    return await saveContentToGitHub(contentType, data);
  }
}