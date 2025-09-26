/**
 * Content Manager V2 - Vercel Blob Storage Integration
 * Replaces localStorage with persistent blob storage
 */

// Cache for client-side performance
let contentCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all content from API/blob storage
 */
export async function getAllContent(forceRefresh = false) {
  // Check cache first (client-side only)
  if (typeof window !== 'undefined' && !forceRefresh && contentCache && cacheTimestamp) {
    const now = Date.now();
    if (now - cacheTimestamp < CACHE_DURATION) {
      return contentCache;
    }
  }

  try {
    const response = await fetch('/api/content', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch content');
    }

    // Update cache
    if (typeof window !== 'undefined') {
      contentCache = result.data;
      cacheTimestamp = Date.now();
    }

    return result.data;

  } catch (error) {
    console.error('Failed to fetch content:', error);
    
    // Return fallback data structure
    return getFallbackContent();
  }
}

/**
 * Save content to blob storage
 */
export async function saveContent(type, data) {
  try {
    console.log('🔍 ContentManagerV2.saveContent called:', { type, dataKeys: Object.keys(data || {}), dataType: typeof data });
    
    const response = await fetch('/api/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        data,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save content');
    }

    // Invalidate cache
    if (typeof window !== 'undefined') {
      contentCache = null;
      cacheTimestamp = null;
    }

    // Dispatch update event for UI reactivity
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('content-updated', {
        detail: { type, data }
      }));
    }

    return result;

  } catch (error) {
    console.error('Failed to save content:', error);
    throw error;
  }
}

/**
 * Upload image to blob storage
 */
export async function uploadImage(file, folder = 'images') {
  try {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to upload image');
    }

    return result;

  } catch (error) {
    console.error('Failed to upload image:', error);
    throw error;
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(files, folder = 'images') {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to upload images');
    }

    return result;

  } catch (error) {
    console.error('Failed to upload images:', error);
    throw error;
  }
}

/**
 * Get specific content type
 */
export async function getContent(type) {
  try {
    const response = await fetch(`/api/content?type=${type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch content');
    }

    return result.data;

  } catch (error) {
    console.error(`Failed to fetch ${type} content:`, error);
    return getFallbackContentByType(type);
  }
}

/**
 * Update specific content item
 */
export async function updateContentItem(contentType, itemId, updatedItem) {
  try {
    // Get current content
    const allContent = await getAllContent();
    
    if (!allContent[contentType]) {
      allContent[contentType] = [];
    }

    // Handle array vs object content types
    if (Array.isArray(allContent[contentType])) {
      // For array types (news, services, portfolio)
      const itemIndex = allContent[contentType].findIndex(item => item.id === itemId);
      
      if (itemIndex !== -1) {
        // Update existing item
        allContent[contentType][itemIndex] = { 
          ...updatedItem,
          updated_at: new Date().toISOString()
        };
      } else {
        // Add new item if not found
        allContent[contentType].push({ 
          ...updatedItem,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } else {
      // For object types (about, settings)
      allContent[contentType] = { 
        ...allContent[contentType], 
        ...updatedItem,
        updated_at: new Date().toISOString()
      };
    }

    // Save the specific content type to blob storage
    const result = await saveContent(contentType, allContent[contentType]);
    return result;

  } catch (error) {
    console.error(`Error updating ${contentType}:`, error);
    throw error;
  }
}

/**
 * Add new content item
 */
export async function addContentItem(contentType, newItem) {
  try {
    // Generate ID if not provided
    if (!newItem.id) {
      newItem.id = `${contentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Add timestamps
    newItem.created_at = new Date().toISOString();
    newItem.updated_at = new Date().toISOString();

    return await updateContentItem(contentType, newItem.id, newItem);

  } catch (error) {
    console.error(`Error adding ${contentType}:`, error);
    throw error;
  }
}

/**
 * Delete content item
 */
export async function deleteContentItem(contentType, itemId) {
  try {
    // Get current content
    const allContent = await getAllContent();
    
    if (!allContent[contentType]) {
      return false;
    }

    if (Array.isArray(allContent[contentType])) {
      // For array types
      const itemIndex = allContent[contentType].findIndex(item => item.id === itemId);
      
      if (itemIndex !== -1) {
        allContent[contentType].splice(itemIndex, 1);
        
        // Save the specific content type to blob storage
        await saveContent(contentType, allContent[contentType]);
        return true;
      }
    }

    return false;

  } catch (error) {
    console.error(`Error deleting ${contentType}:`, error);
    throw error;
  }
}

/**
 * Generate SEO-friendly slug from title
 */
export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
}

/**
 * Search content across all types
 */
export async function searchContent(query, contentTypes = null) {
  try {
    const allContent = await getAllContent();
    const results = [];
    
    const typesToSearch = contentTypes || Object.keys(allContent);
    
    for (const typeKey of typesToSearch) {
      const content = allContent[typeKey];
      
      if (Array.isArray(content)) {
        const matches = content.filter(item => {
          const searchText = JSON.stringify(item).toLowerCase();
          return searchText.includes(query.toLowerCase());
        });
        
        matches.forEach(match => {
          results.push({
            type: typeKey,
            item: match,
            relevance: calculateRelevance(match, query)
          });
        });
      }
    }
    
    return results.sort((a, b) => b.relevance - a.relevance);

  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

/**
 * Calculate search relevance score
 */
function calculateRelevance(item, query) {
  const lowerQuery = query.toLowerCase();
  let score = 0;
  
  // Check title/name fields for exact matches
  if (item.title && item.title.toLowerCase().includes(lowerQuery)) {
    score += 10;
  }
  if (item.name && item.name.toLowerCase().includes(lowerQuery)) {
    score += 10;
  }
  
  // Check other text fields
  Object.values(item).forEach(value => {
    if (typeof value === 'string' && value.toLowerCase().includes(lowerQuery)) {
      score += 1;
    }
  });
  
  return score;
}

/**
 * Fallback content structure
 */
function getFallbackContent() {
  return {
    site_content: {
      lastUpdated: new Date().toISOString(),
      version: 1,
      news: [],
      portfolio: [],
      services: [],
    },
    news_items: [],
    portfolio_items: [],
    services: [],
    categories: {
      services: [],
      portfolio: [],
      news: [],
      technologies: [],
    },
    site_settings: {
      lastUpdated: new Date().toISOString(),
      version: 1,
    },
    about_content: {
      lastUpdated: new Date().toISOString(),
      version: 1,
    },
    hero_content: {
      lastUpdated: new Date().toISOString(),
      version: 1,
    },
    contact_content: {
      lastUpdated: new Date().toISOString(),
      version: 1,
    },
  };
}

/**
 * Get fallback content by type
 */
function getFallbackContentByType(type) {
  const fallback = getFallbackContent();
  return fallback[type.toLowerCase()] || {};
}