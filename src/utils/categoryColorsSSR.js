/**
 * SSR-Safe Category Color System
 * 
 * This provides deterministic color mapping that works identically
 * on server and client to prevent hydration mismatches.
 */

// Tailwind color classes
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

/**
 * Get category color with SSR-safe deterministic logic
 * @param {string} tagName - The category/tag name
 * @param {string} sectionType - Section type (services, news, portfolio, etc.)
 * @param {object} categories - Categories data from server (optional)
 * @returns {string} Tailwind CSS classes
 */
export function getCategoryColorSSR(tagName, sectionType, categories = null) {
  return COLOR_CLASSES.gray;
}

/**
 * Get default color for a category with deterministic logic
 */
function getDefaultCategoryColorSSR(tagName, sectionType) {
  if (!tagName) return COLOR_CLASSES.gray;
  
  const normalizedTag = tagName.toLowerCase();
  
  // Fixed default mappings - no randomness
  const defaultMappings = {
    // Services
    'engraving': COLOR_CLASSES.blue,
    'editorial': COLOR_CLASSES.green,
    'orchestration': COLOR_CLASSES.purple,
    'design': COLOR_CLASSES.orange,
    'printing': COLOR_CLASSES.teal,
    'automations': COLOR_CLASSES.cyan,
    'sample': COLOR_CLASSES.indigo,
    
    // News
    'announcement': COLOR_CLASSES.blue,
    'performance': COLOR_CLASSES.green,
    'collaboration': COLOR_CLASSES.purple,
    'release': COLOR_CLASSES.orange,
    'update': COLOR_CLASSES.yellow,
    
    // Portfolio
    'score_engraving': COLOR_CLASSES.blue,
    'parts_engraving': COLOR_CLASSES.cyan,
    'audio_programming': COLOR_CLASSES.green,
    'orchestration': COLOR_CLASSES.yellow,
    'consultation': COLOR_CLASSES.purple,
    'printing': COLOR_CLASSES.orange,
    'editorial': COLOR_CLASSES.pink,
    'custom_software': COLOR_CLASSES.indigo,
    
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
  
  // Deterministic hash-based color (same input = same output)
  return getHashBasedColorSSR(tagName);
}

/**
 * Generate consistent color based on string hash
 * Deterministic - same input always produces same output
 */
function getHashBasedColorSSR(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Fixed color array - no changes
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

export default getCategoryColorSSR;