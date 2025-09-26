/**
 * Vercel Blob Storage Utility
 * Handles file uploads, data persistence, and blob management
 */
import { put, list, del, head } from '@vercel/blob';

// Storage configuration
const BLOB_CONFIG = {
  access: 'public',
  addRandomSuffix: true,
  cacheControlMaxAge: 60 * 60 * 24 * 365, // 1 year for images
};

// Content type mappings
const CONTENT_TYPES = {
  json: 'application/json',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

/**
 * Upload an image to Vercel Blob Storage
 */
export async function uploadImage(file, folder = 'images') {
  try {
    if (!file || typeof file.arrayBuffer !== 'function') {
      throw new Error('Invalid file object');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }

    // Get file extension
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;

    // Upload to blob storage
    const blob = await put(filename, file, {
      ...BLOB_CONFIG,
      contentType: CONTENT_TYPES[extension] || 'image/jpeg',
    });

    return {
      success: true,
      url: blob.url,
      filename: blob.pathname,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
}

/**
 * Upload JSON data to Vercel Blob Storage
 */
export async function uploadData(dataKey, data) {
  try {
    console.log('🔍 uploadData called:', { dataKey, dataSize: JSON.stringify(data).length });
    
    const filename = `data/${dataKey}.json`;
    const jsonString = JSON.stringify(data, null, 2);
    const jsonBlob = new Blob([jsonString], { type: 'application/json' });

    console.log('📤 Uploading to blob storage:', { filename, size: jsonBlob.size });

    const blob = await put(filename, jsonBlob, {
      access: 'public',
      addRandomSuffix: false, // Keep consistent filename for data
      contentType: 'application/json',
    });

    console.log('✅ Blob upload successful:', { url: blob.url, pathname: blob.pathname });

    return {
      success: true,
      url: blob.url,
      filename: blob.pathname,
      dataKey,
    };
  } catch (error) {
    console.error('❌ Data upload error:', error);
    throw new Error(`Data upload failed: ${error.message}`);
  }
}

/**
 * Fetch JSON data from Vercel Blob Storage
 */
export async function fetchData(dataKey) {
  try {
    console.log('🔍 fetchData called:', { dataKey });
    
    const filename = `data/${dataKey}.json`;
    console.log('📥 Listing blobs with prefix:', filename);
    
    const blobs = await list({ prefix: filename });
    console.log('📦 Found blobs:', { count: blobs.blobs.length, blobs: blobs.blobs.map(b => b.pathname) });
    
    if (blobs.blobs.length === 0) {
      console.log('🔄 No blob found for:', filename);
      return null; // Data doesn't exist
    }

    const blob = blobs.blobs[0];
    console.log('📥 Fetching blob content from:', blob.url);
    
    const response = await fetch(blob.url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Blob data fetched successfully:', { dataKey, dataKeys: Object.keys(data) });
    return data;
  } catch (error) {
    console.error('❌ Data fetch error:', error);
    return null; // Return null on error, let caller handle fallback
  }
}

/**
 * List all files in a folder
 */
export async function listFiles(folder = '') {
  try {
    const blobs = await list({ prefix: folder });
    return blobs.blobs.map(blob => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    }));
  } catch (error) {
    console.error('List files error:', error);
    return [];
  }
}

/**
 * Delete a file from Vercel Blob Storage
 */
export async function deleteFile(url) {
  try {
    await del(url);
    return { success: true };
  } catch (error) {
    console.error('Delete file error:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Check if a file exists in blob storage
 */
export async function fileExists(pathname) {
  try {
    await head(pathname);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Upload multiple images in batch
 */
export async function uploadImages(files, folder = 'images') {
  const results = [];
  
  for (const file of files) {
    try {
      const result = await uploadImage(file, folder);
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        error: error.message,
        filename: file.name,
      });
    }
  }
  
  return results;
}

// Data keys for different content types
export const DATA_KEYS = {
  SITE_CONTENT: 'site-content',
  NEWS_ITEMS: 'news-items', 
  PORTFOLIO_ITEMS: 'portfolio-items',
  SERVICES: 'services',
  CATEGORIES: 'categories',
  SITE_SETTINGS: 'site-settings',
  ABOUT_CONTENT: 'about-content',
  HERO_CONTENT: 'hero-content',
  CONTACT_CONTENT: 'contact-content',
};