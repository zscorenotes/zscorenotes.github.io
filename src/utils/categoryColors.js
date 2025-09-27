/**
 * Unified Category Color System
 * 
 * This replaces the fragmented tag color system with a centralized approach.
 * Colors are loaded from the categories.json database and cached properly.
 * Special handling for # tags (always gray) vs regular categories (custom colors).
 */

import * as ContentManager from '@/lib/content-manager-clean';

// Tailwind color classes mapped to color names
const COLOR_CLASSES = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200', 
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  pink: 'bg-pink-100 text-pink-800 border-pink-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200', 
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  teal: 'bg-teal-100 text-teal-800 border-teal-200',
  cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

// Cache for category data to avoid repeated API calls
let categoriesCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Load categories from the centralized database
 * Uses caching to avoid repeated loads
 */
async function loadCategories() {
  // Check if cache is still valid
  if (categoriesCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return categoriesCache;
  }

  try {
    const allContent = await ContentManager.getAllContent();
    const categories = allContent.categories || {};
    
    // Update cache
    categoriesCache = categories;
    cacheTimestamp = Date.now();
    
    return categories;
  } catch (error) {
    console.error('Error loading categories:', error);
    // Return empty structure on error
    return {
      services: [],
      news: [],
      portfolio: [],
      portfolio_technologies: []
    };
  }
}

/**
 * Get category color for a given tag/category name and section type
 * Handles # tags specially (always gray)
 * 
 * @param {string} tagName - The category/tag name to get color for
 * @param {string} sectionType - Section type (services, news, portfolio, etc.)
 * @returns {string} Tailwind CSS classes for the tag
 */
export async function getCategoryColor(tagName, sectionType) {
  // Special handling for # tags - always gray
  if (tagName && tagName.startsWith('#')) {
    return COLOR_CLASSES.gray;
  }

  try {
    const categories = await loadCategories();
    const sectionCategories = categories[sectionType] || [];
    
    // Find category by exact match on label, displayName, or id
    const category = sectionCategories.find(cat => {
      if (!cat) return false;
      
      const normalizedTag = tagName?.toLowerCase?.() || '';
      return (
        cat.label?.toLowerCase() === normalizedTag ||
        cat.displayName?.toLowerCase() === normalizedTag ||
        cat.id?.toLowerCase() === normalizedTag
      );
    });
    
    if (category && category.color && COLOR_CLASSES[category.color]) {
      return COLOR_CLASSES[category.color];
    }
    
    // Fallback to default colors based on section and tag name
    return getDefaultCategoryColor(tagName, sectionType);
    
  } catch (error) {
    console.error('Error getting category color:', error);
    return getDefaultCategoryColor(tagName, sectionType);
  }
}

/**
 * Synchronous version for immediate use (when categories are already cached)
 * Falls back to default colors if categories not cached
 */
export function getCategoryColorSync(tagName, sectionType) {
  // Special handling for # tags - always gray
  if (tagName && tagName.startsWith('#')) {
    return COLOR_CLASSES.gray;
  }

  // Use cached categories if available
  if (categoriesCache) {
    const sectionCategories = categoriesCache[sectionType] || [];
    
    const category = sectionCategories.find(cat => {
      if (!cat) return false;
      
      const normalizedTag = tagName?.toLowerCase?.() || '';
      return (
        cat.label?.toLowerCase() === normalizedTag ||
        cat.displayName?.toLowerCase() === normalizedTag ||
        cat.id?.toLowerCase() === normalizedTag
      );
    });
    
    if (category && category.color && COLOR_CLASSES[category.color]) {
      return COLOR_CLASSES[category.color];
    }
  }
  
  // Fallback to defaults
  return getDefaultCategoryColor(tagName, sectionType);
}

/**
 * Get default color for a category when not found in database
 * Provides consistent fallback colors based on common category patterns
 */
function getDefaultCategoryColor(tagName, sectionType) {
  if (!tagName) return COLOR_CLASSES.gray;
  
  const normalizedTag = tagName.toLowerCase();
  
  // Default color mappings based on common patterns
  const defaultMappings = {
    // Services
    'engraving': COLOR_CLASSES.blue,
    'editorial': COLOR_CLASSES.green,
    'orchestration': COLOR_CLASSES.purple,
    'design': COLOR_CLASSES.orange,
    'printing': COLOR_CLASSES.teal,
    'automations': COLOR_CLASSES.cyan,
    
    // News
    'announcement': COLOR_CLASSES.blue,
    'performance': COLOR_CLASSES.green,
    'collaboration': COLOR_CLASSES.purple,
    'release': COLOR_CLASSES.orange,
    'update': COLOR_CLASSES.yellow,
    
    // Portfolio
    'score_engraving': COLOR_CLASSES.blue,
    'audio_programming': COLOR_CLASSES.green,
    'consultation': COLOR_CLASSES.purple,
    
    // Technologies
    'sibelius': COLOR_CLASSES.blue,
    'finale': COLOR_CLASSES.green,
    'dorico': COLOR_CLASSES.purple,
    'musescore': COLOR_CLASSES.orange,
    'lilypond': COLOR_CLASSES.teal,
    'custom_software': COLOR_CLASSES.cyan,
  };
  
  // Check exact match first
  if (defaultMappings[normalizedTag]) {
    return defaultMappings[normalizedTag];
  }
  
  // Check if tag contains any of the keywords
  for (const [keyword, color] of Object.entries(defaultMappings)) {
    if (normalizedTag.includes(keyword)) {
      return color;
    }
  }
  
  // Ultimate fallback: deterministic color based on string hash
  return getHashBasedColor(tagName);
}

/**
 * Generate a consistent color based on string hash
 * Ensures the same tag always gets the same color
 */
function getHashBasedColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const colors = [
    COLOR_CLASSES.blue,
    COLOR_CLASSES.green, 
    COLOR_CLASSES.purple,
    COLOR_CLASSES.orange,
    COLOR_CLASSES.teal,
    COLOR_CLASSES.cyan,
    COLOR_CLASSES.pink,
    COLOR_CLASSES.indigo,
    COLOR_CLASSES.yellow,
  ];
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Clear the category cache (useful for admin panel updates)
 */
export function clearCategoryCache() {
  categoriesCache = null;
  cacheTimestamp = null;
}

/**
 * Pre-load categories into cache
 * Useful for SSR or initial page load optimization
 */
export async function preloadCategories() {
  return await loadCategories();
}

// Export the sync version as the main export for backward compatibility
export { getCategoryColorSync as getTagColorSync };
export { getCategoryColor as getTagColor };