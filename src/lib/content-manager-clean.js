/**
 * Clean Content Manager - Single source of truth for all content operations
 * Simple, consistent, no legacy baggage
 */

const CONTENT_TYPES = {
  news: { key: 'news', isArray: true },
  services: { key: 'services', isArray: true },
  portfolio: { key: 'portfolio', isArray: true },
  about: { key: 'about', isArray: false },
  settings: { key: 'settings', isArray: false },
  categories: { key: 'categories', isArray: false },
};

/**
 * Get all content from API
 */
export async function getAllContent() {
  try {
    const response = await fetch('/api/content-clean');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    
    return result.data;
  } catch (error) {
    console.error('Failed to load content:', error);
    return getEmptyContent();
  }
}

/**
 * Save content type to API
 */
export async function saveContent(contentType, data) {
  try {
    const response = await fetch('/api/content-clean', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: contentType, data })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    
    return true;
  } catch (error) {
    console.error('Failed to save content:', error);
    return false;
  }
}

/**
 * Add new item to array-type content
 */
export async function addItem(contentType, item) {
  const config = CONTENT_TYPES[contentType];
  if (!config?.isArray) throw new Error(`${contentType} is not an array type`);
  
  const allContent = await getAllContent();
  const items = allContent[contentType] || [];
  
  // Generate ID and timestamps
  const newItem = {
    ...item,
    id: `${contentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  items.push(newItem);
  const success = await saveContent(contentType, items);
  
  return success ? newItem : null;
}

/**
 * Update existing item in array-type content
 */
export async function updateItem(contentType, itemId, updatedItem) {
  const config = CONTENT_TYPES[contentType];
  if (!config?.isArray) throw new Error(`${contentType} is not an array type`);
  
  const allContent = await getAllContent();
  const items = allContent[contentType] || [];
  
  const index = items.findIndex(item => item.id === itemId);
  if (index === -1) throw new Error(`Item ${itemId} not found`);
  
  items[index] = {
    ...updatedItem,
    id: itemId,
    updated_at: new Date().toISOString()
  };
  
  return await saveContent(contentType, items);
}

/**
 * Delete item from array-type content and associated images
 */
export async function deleteItem(contentType, itemId) {
  const config = CONTENT_TYPES[contentType];
  if (!config?.isArray) throw new Error(`${contentType} is not an array type`);
  
  const allContent = await getAllContent();
  const items = allContent[contentType] || [];
  
  // Find the item to delete and extract image URLs
  const itemToDelete = items.find(item => item.id === itemId);
  if (itemToDelete) {
    await deleteItemImages(itemToDelete);
  }
  
  const filteredItems = items.filter(item => item.id !== itemId);
  
  return await saveContent(contentType, filteredItems);
}

/**
 * Delete all images associated with an item from GitHub
 */
async function deleteItemImages(item) {
  try {
    const imageUrls = [];
    
    // Collect all image URLs from the item
    if (item.image_urls && Array.isArray(item.image_urls)) {
      imageUrls.push(...item.image_urls);
    }
    
    // Delete each image from GitHub repository
    for (const imageUrl of imageUrls) {
      if (imageUrl && typeof imageUrl === 'string') {
        try {
          await deleteImageFromGitHub(imageUrl);
        } catch (error) {
          console.warn('Error deleting image:', imageUrl, error);
        }
      }
    }
  } catch (error) {
    console.warn('Error deleting item images:', error);
  }
}

/**
 * Delete an image file from GitHub repository
 */
async function deleteImageFromGitHub(imageUrl) {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.warn('No GitHub token found for image deletion');
      return;
    }

    // Extract filename from URL (e.g., https://zscorenotes.github.io/images/filename.jpg)
    const urlParts = imageUrl.split('/');
    const filename = urlParts.pop();
    const folder = urlParts.pop();
    
    if (!filename || !folder) {
      console.warn('Invalid image URL format:', imageUrl);
      return;
    }

    const path = `public/${folder}/${filename}`;
    const GITHUB_REPO = 'zscorenotes.github.io';
    const GITHUB_OWNER = 'zscorenotes';

    // First, get the file to get its SHA (required for deletion)
    const getUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
    
    const getResponse = await fetch(getUrl, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!getResponse.ok) {
      if (getResponse.status === 404) {
        console.warn('Image file not found for deletion:', path);
        return;
      }
      throw new Error(`Failed to get file info: ${getResponse.status}`);
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
        message: `Delete image: ${filename}`,
        sha: fileData.sha,
        branch: 'main',
      }),
    });

    if (!deleteResponse.ok) {
      throw new Error(`Failed to delete image: ${deleteResponse.status}`);
    }

    console.log('Successfully deleted image:', path);
  } catch (error) {
    console.error('Error deleting image from GitHub:', error);
    throw error;
  }
}

/**
 * Update object-type content (about, settings)
 */
export async function updateObject(contentType, data) {
  const config = CONTENT_TYPES[contentType];
  if (config?.isArray) throw new Error(`${contentType} is an array type`);
  
  const updatedData = {
    ...data,
    updated_at: new Date().toISOString()
  };
  
  return await saveContent(contentType, updatedData);
}

/**
 * Get empty content structure
 */
function getEmptyContent() {
  return {
    news: [],
    services: [],
    portfolio: [],
    about: { updated_at: new Date().toISOString() },
    settings: { updated_at: new Date().toISOString() },
    categories: { 
      services: [],
      portfolio: [],
      news: [],
      updated_at: new Date().toISOString() 
    }
  };
}