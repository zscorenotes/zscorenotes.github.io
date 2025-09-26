/**
 * Clean Image Storage - Only for image uploads
 */
import { put, list, del } from '@vercel/blob';

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
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
      allowOverwrite: true,
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