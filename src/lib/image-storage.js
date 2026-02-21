/**
 * GitHub Image Storage - Free alternative to Vercel Blob for images
 */
import sharp from 'sharp';

const THUMBNAIL_WIDTH = 600; // px — wide enough for retina listing cards

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
 * Push a raw buffer to a GitHub repo path. Returns the public raw URL.
 */
async function pushBufferToGitHub(buffer, path, commitMessage, token) {
  const base64Content = buffer.toString('base64');
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: commitMessage, content: base64Content, branch: CONTENT_BRANCH }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`GitHub API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
  }

  const result = await response.json();
  return {
    publicUrl: `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${CONTENT_BRANCH}/${path}`,
    sha: result.content.sha,
  };
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

    // Read file into a Buffer (used for both original upload and thumbnail generation)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload original to GitHub
    const { publicUrl, sha } = await pushBufferToGitHub(
      buffer,
      path,
      `Upload image: ${filename}`,
      token
    );

    // Generate and upload thumbnail (600px wide, JPEG, quality 85)
    let thumbnailUrl = null;
    try {
      const thumbBuffer = await sharp(buffer)
        .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();

      const thumbPath = `thumbnails/${filename.replace(/\.[^.]+$/, '.jpg')}`;
      const { publicUrl: thumbPublicUrl } = await pushBufferToGitHub(
        thumbBuffer,
        thumbPath,
        `Upload thumbnail: ${filename}`,
        token
      );
      thumbnailUrl = thumbPublicUrl;
    } catch (thumbError) {
      // Thumbnail failure should not block the original upload
      console.warn('Thumbnail generation failed:', thumbError.message);
    }

    return {
      success: true,
      url: publicUrl,
      thumbnail_url: thumbnailUrl,
      filename: filename,
      size: file.size,
      type: file.type,
      path: path,
      sha,
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