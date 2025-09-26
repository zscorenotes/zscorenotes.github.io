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
 * Delete item from array-type content
 */
export async function deleteItem(contentType, itemId) {
  const config = CONTENT_TYPES[contentType];
  if (!config?.isArray) throw new Error(`${contentType} is not an array type`);
  
  const allContent = await getAllContent();
  const items = allContent[contentType] || [];
  
  const filteredItems = items.filter(item => item.id !== itemId);
  
  return await saveContent(contentType, filteredItems);
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