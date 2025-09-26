/**
 * GitHub Image Storage - Free alternative to Vercel Blob for images
 */

const GITHUB_REPO = 'zscorenotes.github.io';
const GITHUB_OWNER = 'zscorenotes';
const CONTENT_BRANCH = 'main';

/**
 * Get GitHub token from environment variables
 */
function getGitHubToken() {
  return process.env.GITHUB_TOKEN;
}

/**
 * Upload an image to GitHub repository
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

    // Validate file size (10MB limit - GitHub has 100MB limit but let's be conservative)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }

    const token = getGitHubToken();
    if (!token) {
      throw new Error('GitHub token required for image upload');
    }

    // Get file extension and create filename
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;
    const path = `public/${folder}/${filename}`;

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Content = buffer.toString('base64');

    // Upload to GitHub
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload image: ${filename}`,
        content: base64Content,
        branch: CONTENT_BRANCH,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API error: ${response.status} - ${errorData.message}`);
    }

    const result = await response.json();
    
    // GitHub Pages serves files from public/ at the root
    const publicUrl = `https://zscorenotes.github.io/${folder}/${filename}`;

    return {
      success: true,
      url: publicUrl,
      filename: filename,
      size: file.size,
      type: file.type,
      path: path,
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
 * List all files in a folder from GitHub
 */
export async function listFiles(folder = 'images') {
  try {
    const token = getGitHubToken();
    if (!token) {
      console.warn('No GitHub token found for listing files');
      return [];
    }

    const path = `public/${folder}`;
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (response.status === 404) {
      // Folder doesn't exist yet
      return [];
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const files = await response.json();
    
    // Filter only files (not directories) and map to expected format
    return files
      .filter(item => item.type === 'file' && item.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i))
      .map(file => ({
        url: `https://zscorenotes.github.io/${folder}/${file.name}`,
        pathname: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(), // GitHub doesn't provide upload time in this API
      }));
  } catch (error) {
    console.error('List files error:', error);
    return [];
  }
}