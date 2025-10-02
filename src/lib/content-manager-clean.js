/**
 * Clean Content Manager - Single source of truth for all content operations
 * Enhanced with HTML content separation for better SEO and performance
 */

import { 
  saveHTMLContent, 
  loadHTMLContent, 
  deleteHTMLContent, 
  migrateContentToHTMLFiles,
  createExcerptFromHTML 
} from './html-content-manager.js';

const CONTENT_TYPES = {
  news: { key: 'news', isArray: true },
  services: { key: 'services', isArray: true },
  portfolio: { key: 'portfolio', isArray: true },
  about: { key: 'about', isArray: false },
  settings: { key: 'settings', isArray: false },
  categories: { key: 'categories', isArray: false },
};

/**
 * Get all content (API or direct storage)
 */
export async function getAllContent() {
  try {
    // Check if we're running on server side (in API routes)
    if (typeof window === 'undefined') {
      // Import storage adapter dynamically to avoid client-side issues
      const { getAllContent: getAllContentDirect } = await import('./storage-adapter.js');
      return await getAllContentDirect();
    } else {
      // On client side, use API call
      const response = await fetch('/api/content-clean');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      return result.data;
    }
  } catch (error) {
    console.error('Failed to load content:', error);
    return getEmptyContent();
  }
}

/**
 * Save content type (API or direct storage)
 */
export async function saveContent(contentType, data) {
  try {
    // Check if we're running on server side (in API routes)
    if (typeof window === 'undefined') {
      // Import storage adapter dynamically to avoid client-side issues
      const { saveContent: saveContentDirect } = await import('./storage-adapter.js');
      return await saveContentDirect(contentType, data);
    } else {
      // On client side, use API call
      const response = await fetch('/api/content-clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: contentType, data })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      return true;
    }
  } catch (error) {
    console.error('Failed to save content:', error);
    return false;
  }
}

/**
 * Add new item to array-type content
 */
export async function addItem(contentType, item) {
  console.log(`🔄 Adding new ${contentType} item...`, { hasContent: !!item.content, contentLength: item.content?.length });
  
  const config = CONTENT_TYPES[contentType];
  if (!config?.isArray) throw new Error(`${contentType} is not an array type`);
  
  const allContent = await getAllContent();
  const items = allContent[contentType] || [];
  
  // Calculate next order value (highest + 10)
  const orderValues = items.map(i => i.order).filter(order => typeof order === 'number');
  const maxOrder = orderValues.length > 0 ? Math.max(...orderValues) : 0;
  const nextOrder = maxOrder + 10;
  
  // Generate ID and timestamps
  const itemId = `${contentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Prepare the new item (without HTML content)
  const newItem = {
    ...item,
    id: itemId,
    order: nextOrder,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Handle HTML content separation
  if (item.content && typeof item.content === 'string') {
    console.log(`🔄 Found HTML content for new ${contentType} item, saving to separate file...`);
    try {
      // Save HTML content to separate file
      const htmlResult = await saveHTMLContent(contentType, itemId, item.content);
      
      if (htmlResult.success) {
        // Add content_file reference
        newItem.content_file = htmlResult.content_file;
        
        // Remove the content field from the item (it's now in a separate file)
        delete newItem.content;
      } else {
        throw new Error('Failed to save HTML content');
      }
    } catch (error) {
      console.error('❌ CRITICAL: Failed to save HTML content for new item:', error);
      console.error('❌ HTML content separation system is not working properly');
      console.error('❌ This should be investigated and fixed');
      
      // Check if we're in production or client side
      const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV;
      const isClientSide = typeof window !== 'undefined';
      
      if (isProduction || isClientSide) {
        console.error('⚠️ FALLBACK: Keeping content in JSON due to HTML saving failure');
        console.error('⚠️ This is a temporary fallback - the HTML separation system needs to be fixed');
        console.error('⚠️ Error details:', error.message);
        // Keep content in JSON as fallback in production or client side
      } else {
        // In development server-side, fail fast to force fixing the issue
        throw new Error(`HTML content separation failed: ${error.message}`);
      }
    }
  }
  
  items.push(newItem);
  const success = await saveContent(contentType, items);
  
  return success ? newItem : null;
}

/**
 * Update existing item in array-type content with HTML content separation
 */
export async function updateItem(contentType, itemId, updatedItem) {
  const config = CONTENT_TYPES[contentType];
  if (!config?.isArray) throw new Error(`${contentType} is not an array type`);
  
  // Check if we're running on server side (direct operation) or client side (API call)
  if (typeof window === 'undefined') {
    // Server-side: perform operation directly with HTML content separation
    const allContent = await getAllContent();
    const items = allContent[contentType] || [];
    
    const index = items.findIndex(item => item.id === itemId);
    if (index === -1) throw new Error(`Item ${itemId} not found`);
    
    const existingItem = items[index];
    
    // Prepare updated item
    const itemToUpdate = {
      ...updatedItem,
      id: itemId,
      updated_at: new Date().toISOString()
    };
    
    // Handle HTML content separation
    if (updatedItem.content && typeof updatedItem.content === 'string') {
      console.log(`🔄 Found HTML content for updated ${contentType} item, saving to separate file...`);
      try {
        // Save HTML content to separate file
        const htmlResult = await saveHTMLContent(contentType, itemId, updatedItem.content);
        console.log(`📝 HTML save result:`, htmlResult);
        
        if (htmlResult.success) {
          // Add content_file reference
          itemToUpdate.content_file = htmlResult.content_file;
          
          // Remove the content field from the item (it's now in a separate file)
          delete itemToUpdate.content;
        } else {
          throw new Error('Failed to save HTML content');
        }
      } catch (error) {
        console.error('❌ CRITICAL: Failed to save HTML content for updated item:', error);
        console.error('❌ HTML content separation system is not working properly');
        console.error('❌ This should be investigated and fixed');
        
        // Check if we're in production or client side
        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV;
        const isClientSide = typeof window !== 'undefined';
        
        if (isProduction || isClientSide) {
          console.error('⚠️ FALLBACK: Keeping content in JSON due to HTML saving failure');
          console.error('⚠️ This is a temporary fallback - the HTML separation system needs to be fixed');
          console.error('⚠️ Error details:', error.message);
          // Keep content in JSON as fallback in production or client side
        } else {
          // In development server-side, fail fast to force fixing the issue
          throw new Error(`HTML content separation failed: ${error.message}`);
        }
      }
    } else if (existingItem.content_file && !updatedItem.content) {
      // Preserve existing content_file if no new content provided
      itemToUpdate.content_file = existingItem.content_file;
    }
    
    items[index] = itemToUpdate;
    
    return await saveContent(contentType, items);
  } else {
    // Client-side: use API call
    const response = await fetch('/api/content-clean', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        operation: 'updateItem',
        contentType,
        itemId,
        item: updatedItem
      })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    
    return result.data;
  }
}

/**
 * Delete item from array-type content and associated images
 */
export async function deleteItem(contentType, itemId) {
  try {
    const response = await fetch('/api/content-clean', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'deleteItem',
        contentType,
        itemId
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      // Emit event for UI updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('zscore-content-updated', {
          detail: { contentType, action: 'delete', itemId }
        }));
      }
      return true;
    } else {
      throw new Error('Delete operation failed');
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    return false;
  }
}

/**
 * Internal function to delete an item (used by API route)
 */
export async function deleteItemInternal(contentType, itemId) {
  const config = CONTENT_TYPES[contentType];
  if (!config?.isArray) throw new Error(`${contentType} is not an array type`);
  
  const allContent = await getAllContent();
  const items = allContent[contentType] || [];
  
  // Find the item to delete and clean up associated resources
  const itemToDelete = items.find(item => item.id === itemId);
  if (itemToDelete) {
    // Delete associated images
    await deleteItemImages(itemToDelete);
    
    // Delete associated HTML content file
    if (itemToDelete.content_file) {
      try {
        await deleteHTMLContent(itemToDelete.content_file);
        console.log(`Deleted HTML content file: ${itemToDelete.content_file}`);
      } catch (error) {
        console.warn('Error deleting HTML content file:', error);
      }
    }
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

    // Extract filename from URL (e.g., https://raw.githubusercontent.com/zscorenotes/zscore-content/main/images/filename.jpg)
    const urlParts = imageUrl.split('/');
    const filename = urlParts.pop();
    const folder = urlParts.pop(); // Should be 'images'
    
    if (!filename || folder !== 'images') {
      console.warn('Invalid image URL format:', imageUrl);
      return;
    }

    const path = `images/${filename}`;
    const GITHUB_REPO = process.env.CONTENT_GITHUB_REPO || 'zscore-content';
    const GITHUB_OWNER = process.env.CONTENT_GITHUB_OWNER || 'zscorenotes';

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
 * Load content with HTML content included (for admin panel editing)
 */
export async function getContentWithHTML(contentType, itemId) {
  try {
    // Check if we're running on server side or client side
    if (typeof window === 'undefined') {
      // Server side - direct file operations
      const allContent = await getAllContent();
      const items = allContent[contentType] || [];
      
      const item = items.find(i => i.id === itemId);
      if (!item) {
        throw new Error(`Item ${itemId} not found in ${contentType}`);
      }
      
      // If item has a content_file, load the HTML content
      if (item.content_file) {
        const htmlContent = await loadHTMLContent(item.content_file);
        return {
          ...item,
          content: htmlContent
        };
      }
      
      return item;
    } else {
      // Client side - use API
      const response = await fetch(`/api/content-html?type=${contentType}&id=${itemId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      return result.data;
    }
  } catch (error) {
    console.error('Error loading content with HTML:', error);
    throw error;
  }
}

/**
 * Migrate existing content to new HTML file structure
 */
export async function migrateAllContentToHTML() {
  try {
    // Skip migration on client side
    if (typeof window !== 'undefined') {
      console.log('Skipping migration on client side');
      return false;
    }
    
    console.log('Starting migration to HTML file structure...');
    
    const allContent = await getAllContent();
    let hasChanges = false;
    
    for (const contentType of ['news', 'services', 'portfolio']) {
      const items = allContent[contentType] || [];
      
      if (items.length > 0) {
        console.log(`Migrating ${contentType} (${items.length} items)...`);
        
        const migratedItems = await migrateContentToHTMLFiles(contentType, items);
        
        // Check if any items were actually migrated
        const wasMigrated = migratedItems.some((item, index) => {
          const original = items[index];
          return item.content_file && !original.content_file;
        });
        
        if (wasMigrated) {
          allContent[contentType] = migratedItems;
          hasChanges = true;
          console.log(`Migrated ${contentType} successfully`);
        }
      }
    }
    
    // Save the updated content if there were changes
    if (hasChanges) {
      for (const contentType of ['news', 'services', 'portfolio']) {
        await saveContent(contentType, allContent[contentType]);
      }
      console.log('Migration completed successfully!');
      return true;
    } else {
      console.log('No migration needed - content already uses HTML files');
      return false;
    }
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
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