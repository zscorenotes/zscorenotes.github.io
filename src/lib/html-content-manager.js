/**
 * HTML Content Manager - Manages separation of JSON metadata and HTML content files
 * 
 * Architecture:
 * - JSON files contain metadata (title, excerpt, dates, etc.)
 * - HTML files contain rich content (stored separately for better SEO)
 * - Each content item has a content_file field pointing to its HTML file
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
 * Save HTML content to a separate file
 */
export async function saveHTMLContent(contentType, itemId, htmlContent) {
  try {
    const token = getGitHubToken();
    if (!token) {
      throw new Error('GitHub token required for saving HTML content');
    }

    // Create filename for HTML content
    const filename = `${itemId}.html`;
    const path = `content-data/content/${contentType}/${filename}`;

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

    // Convert HTML content to base64
    const base64Content = btoa(htmlContent);

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
      throw new Error(`GitHub API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();

    // Return the path to the HTML file
    return {
      success: true,
      content_file: `/content-data/content/${contentType}/${filename}`,
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
    const token = getGitHubToken();
    if (!token) {
      console.warn('No GitHub token found for loading HTML content');
      return '';
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
    const htmlContent = atob(data.content);
    
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
    const token = getGitHubToken();
    if (!token) {
      console.warn('No GitHub token found for deleting HTML content');
      return false;
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