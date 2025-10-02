/**
 * GitHub Image Storage - Free alternative to Vercel Blob for images
 */

// Content repository configuration - can be overridden with environment variables
const GITHUB_REPO = process.env.CONTENT_GITHUB_REPO || 'zscore-content';
const GITHUB_OWNER = process.env.CONTENT_GITHUB_OWNER || 'zscorenotes';
const CONTENT_BRANCH = 'main';

/**
 * Get GitHub token from environment variables
 */
function getGitHubToken() {
  return process.env.GITHUB_TOKEN;
}

/**
 * Upload an image to GitHub repository using Git LFS for large files
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

    // Validate file size (50MB limit - GitHub's file size limit)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File size must be less than 50MB');
    }

    const token = getGitHubToken();
    if (!token) {
      throw new Error('GitHub token required for image upload');
    }

    // Get file extension and create unique filename
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const filename = `${timestamp}-${randomId}.${extension}`;
    const path = `${folder}/${filename}`;

    // Convert file to base64 (required by GitHub API)
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64 in chunks to avoid stack overflow
    let binaryString = '';
    const chunkSize = 8192; // Process 8KB at a time
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, chunk);
    }
    const base64Content = btoa(binaryString);

    // Create the file in GitHub repository
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
    
    const payload = {
      message: `Upload image: ${filename}`,
      content: base64Content,
      branch: CONTENT_BRANCH,
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      throw new Error(`GitHub API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    
    // Use raw GitHub URL for direct file access from content repository
    const publicUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${CONTENT_BRANCH}/${folder}/${filename}`;

    return {
      success: true,
      url: publicUrl,
      filename: filename,
      size: file.size,
      type: file.type,
      path: path,
      sha: result.content.sha, // Store SHA for potential future operations
    };
  } catch (error) {
    console.error('GitHub image upload error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      error: error
    });
    
    // Preserve the original error message for better debugging
    const errorMessage = error.message || 'Unknown upload error';
    throw new Error(`GitHub upload failed: ${errorMessage}`);
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

    const path = `${folder}`;
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
        url: `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${CONTENT_BRANCH}/${folder}/${file.name}`,
        pathname: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(), // GitHub doesn't provide upload time in this API
      }));
  } catch (error) {
    console.error('List files error:', error);
    return [];
  }
}