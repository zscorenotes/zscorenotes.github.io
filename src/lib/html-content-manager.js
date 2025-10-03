/**
 * HTML Content Manager - Manages separation of JSON metadata and HTML content files
 * 
 * Architecture:
 * - JSON files contain metadata (title, excerpt, dates, etc.)
 * - HTML files contain rich content (stored separately for better SEO)
 * - Each content item has a content_file field pointing to its HTML file
 */

// Server-side only: fs and path imports (these will be tree-shaken on client side)
let fs, path;
if (typeof window === 'undefined') {
  fs = require('fs').promises;
  path = require('path');
}

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
 * Save HTML content to local file system (server-side only)
 */
async function saveHTMLFileLocallyDirect(contentType, itemId, htmlContent) {
  if (!fs || !path) {
    throw new Error('File system operations only available on server side');
  }
  
  const filename = `${itemId}.html`;
  const dirPath = path.join(process.cwd(), 'content-data', 'content', contentType);
  const filePath = path.join(dirPath, filename);
  
  // Ensure directory exists
  await fs.mkdir(dirPath, { recursive: true });
  
  // Write HTML content to file
  await fs.writeFile(filePath, htmlContent, 'utf8')
  
  console.log(`✅ HTML content saved locally: ${filePath}`);
  
  // For local development, use local path
  const content_file = `/content-data/content/${contentType}/${filename}`;
  
  return {
    success: true,
    content_file: content_file,
  };
}

/**
 * Load HTML content from local file system (server-side only)
 */
async function loadHTMLFileLocallyDirect(contentFilePath) {
  if (!fs || !path) {
    throw new Error('File system operations only available on server side');
  }
  
  // Remove leading slash and convert to local path
  const relativePath = contentFilePath.startsWith('/') ? contentFilePath.slice(1) : contentFilePath;
  const filePath = path.join(process.cwd(), relativePath);
  
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`HTML content file not found locally: ${contentFilePath}`);
      return '';
    }
    throw error;
  }
}

/**
 * Delete HTML content from local file system (server-side only)
 */
async function deleteHTMLFileLocallyDirect(contentFilePath) {
  if (!fs || !path) {
    throw new Error('File system operations only available on server side');
  }
  
  // Remove leading slash and convert to local path
  const relativePath = contentFilePath.startsWith('/') ? contentFilePath.slice(1) : contentFilePath;
  const filePath = path.join(process.cwd(), relativePath);
  
  try {
    await fs.unlink(filePath);
    console.log(`✅ HTML content deleted locally: ${filePath}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`HTML content file not found for deletion: ${contentFilePath}`);
      return;
    }
    throw error;
  }
}

/**
 * Save HTML content to a separate file
 */
export async function saveHTMLContent(contentType, itemId, htmlContent) {
  try {
    console.log(`🔄 Saving HTML content for ${contentType}/${itemId}`);
    
    // Check if we're on client side - if so, return failure to let content manager handle fallback
    if (typeof window !== 'undefined') {
      console.warn('⚠️ Cannot save HTML content: Running on client side');
      return {
        success: false,
        error: 'HTML content saving only available on server side'
      };
    }
    
    // We're on server side - check environment
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      console.log('📁 Using local file system (development mode)');
      // Use local file operations directly (only on server side)
      return await saveHTMLFileLocallyDirect(contentType, itemId, htmlContent);
    }
    
    // For production, use GitHub API
    const token = getGitHubToken();
    if (!token) {
      console.error('❌ No GitHub token found in production environment');
      console.error('❌ HTML content separation requires GitHub token in production');
      return {
        success: false,
        error: 'GitHub token required for HTML content storage in production'
      };
    }

    // Create filename for HTML content
    const filename = `${itemId}.html`;
    const path = `content/${contentType}/${filename}`;

    // Get current file SHA if it exists (required for updates)
    let currentSha = null;
    try {
      const getUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
      const getResponse = await fetch(getUrl, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      if (getResponse.ok) {
        const existingFile = await getResponse.json();
        currentSha = existingFile.sha;
      }
    } catch (error) {
      // File doesn't exist yet, that's fine
    }

    // Convert HTML content to base64 (handle UTF-8 properly in Node.js)
    const base64Content = Buffer.from(htmlContent, 'utf8').toString('base64');

    // Create/update the HTML file
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
    
    const payload = {
      message: `Update ${contentType} content: ${itemId}`,
      content: base64Content,
      branch: CONTENT_BRANCH,
    };

    // Include SHA for updates
    if (currentSha) {
      payload.sha = currentSha;
    }

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
      
      // Enhanced error logging for debugging
      console.error('🚨 GitHub API Error Details:');
      console.error('  Status:', response.status);
      console.error('  URL:', url);
      console.error('  Path:', path);
      console.error('  Response:', errorData);
      
      throw new Error(`GitHub API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    
    console.log(`✅ HTML content saved successfully: ${path}`);

    // Return the URL to the HTML file - use raw GitHub URL for production
    const content_file = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${CONTENT_BRANCH}/content/${contentType}/${filename}`;
    
    return {
      success: true,
      content_file: content_file,
      sha: result.content.sha,
    };
  } catch (error) {
    console.error('Error saving HTML content:', error);
    throw error;
  }
}

/**
 * Load HTML content from a separate file
 */
export async function loadHTMLContent(contentFilePath) {
  try {
    console.log('🔍 Loading HTML content:', contentFilePath);
    
    // Check if we're on client side - if so, return empty
    if (typeof window !== 'undefined') {
      console.warn('⚠️ Cannot load HTML content: Running on client side');
      return '';
    }
    
    // Check if contentFilePath is a raw GitHub URL (from production) or local path (from development)
    const isGitHubURL = contentFilePath.startsWith('https://raw.githubusercontent.com/');
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment && !isGitHubURL) {
      console.log('📁 Loading from local file system (development mode)');
      return await loadHTMLFileLocallyDirect(contentFilePath);
    }
    
    // For production or GitHub URLs, fetch from GitHub
    if (isGitHubURL) {
      // Direct fetch from raw GitHub URL
      console.log('🌐 Loading from raw GitHub URL:', contentFilePath);
      const response = await fetch(contentFilePath);
      
      console.log('📡 Raw GitHub fetch response:', {
        url: contentFilePath,
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('HTML content file not found at URL:', contentFilePath);
          return '';
        }
        const errorText = await response.text();
        console.error('❌ Raw GitHub fetch error:', errorText);
        throw new Error(`HTTP error: ${response.status} - ${errorText}`);
      }
      
      const htmlContent = await response.text();
      console.log('✅ Successfully loaded HTML content:', {
        url: contentFilePath,
        contentLength: htmlContent.length,
        preview: htmlContent.substring(0, 100) + '...'
      });
      
      return htmlContent;
    }
    
    // Fallback: Use GitHub API for older local-style paths in production
    const token = getGitHubToken();
    if (!token) {
      console.error('❌ No GitHub token found in production environment');
      console.error('❌ HTML content loading requires GitHub token in production');
      return ''; // Return empty content instead of failing
    }

    // Remove leading slash if present
    const path = contentFilePath.startsWith('/') ? contentFilePath.substring(1) : contentFilePath;

    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (response.status === 404) {
      console.warn('HTML content file not found:', contentFilePath);
      return '';
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    // Decode base64 content properly (handle UTF-8)
    const htmlContent = Buffer.from(data.content, 'base64').toString('utf8');
    
    return htmlContent;
  } catch (error) {
    console.error('Error loading HTML content:', error);
    return '';
  }
}

/**
 * Delete HTML content file
 */
export async function deleteHTMLContent(contentFilePath) {
  try {
    // Check if we're on client side - if so, return false
    if (typeof window !== 'undefined') {
      console.warn('⚠️ Cannot delete HTML content: Running on client side');
      return false;
    }
    
    // We're on server side - check environment
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      console.log('📁 Deleting from local file system (development mode)');
      await deleteHTMLFileLocallyDirect(contentFilePath);
      return true;
    }
    
    // For production, use GitHub API
    const token = getGitHubToken();
    if (!token) {
      console.error('❌ No GitHub token found in production environment');
      console.error('❌ HTML content deletion requires GitHub token in production');
      return false; // Cannot delete without GitHub access
    }

    // Remove leading slash if present
    const path = contentFilePath.startsWith('/') ? contentFilePath.substring(1) : contentFilePath;

    // First, get the file to get its SHA (required for deletion)
    const getUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
    
    const getResponse = await fetch(getUrl, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (getResponse.status === 404) {
      console.warn('HTML content file not found for deletion:', contentFilePath);
      return true; // Consider it deleted if it doesn't exist
    }

    if (!getResponse.ok) {
      throw new Error(`Failed to get HTML file info: ${getResponse.status}`);
    }

    const fileData = await getResponse.json();

    // Delete the file
    const deleteUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
    
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Delete HTML content: ${path}`,
        sha: fileData.sha,
        branch: CONTENT_BRANCH,
      }),
    });

    if (!deleteResponse.ok) {
      throw new Error(`Failed to delete HTML content: ${deleteResponse.status}`);
    }

    console.log('Successfully deleted HTML content:', path);
    return true;
  } catch (error) {
    console.error('Error deleting HTML content:', error);
    return false;
  }
}

/**
 * Migrate existing content with embedded HTML to the new structure
 */
export async function migrateContentToHTMLFiles(contentType, items) {
  const migratedItems = [];
  
  for (const item of items) {
    try {
      // If item already has content_file, skip migration
      if (item.content_file) {
        migratedItems.push(item);
        continue;
      }

      // If item has content field, migrate it to HTML file
      if (item.content && typeof item.content === 'string') {
        const htmlResult = await saveHTMLContent(contentType, item.id, item.content);
        
        if (htmlResult.success) {
          // Create new item without the content field, but with content_file
          const migratedItem = {
            ...item,
            content_file: htmlResult.content_file,
          };
          
          // Remove the old content field
          delete migratedItem.content;
          
          migratedItems.push(migratedItem);
          
          console.log(`Migrated ${contentType} item ${item.id} to HTML file`);
        } else {
          // Keep original item if migration failed
          migratedItems.push(item);
          console.warn(`Failed to migrate ${contentType} item ${item.id}`);
        }
      } else {
        // No content to migrate, keep as is
        migratedItems.push(item);
      }
    } catch (error) {
      console.error(`Error migrating ${contentType} item ${item.id}:`, error);
      // Keep original item if migration failed
      migratedItems.push(item);
    }
  }
  
  return migratedItems;
}

/**
 * Create excerpt from HTML content
 */
export function createExcerptFromHTML(htmlContent, maxLength = 150) {
  try {
    // Remove HTML tags and get plain text
    const plainText = htmlContent.replace(/<[^>]*>/g, '');
    
    // Trim and truncate
    const trimmed = plainText.trim();
    
    if (trimmed.length <= maxLength) {
      return trimmed;
    }
    
    // Find the last complete word within the limit
    const truncated = trimmed.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > 0) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  } catch (error) {
    console.error('Error creating excerpt:', error);
    return '';
  }
}

// Local file system functions are now in ./server-file-operations.js
// and are imported dynamically only when running on server side