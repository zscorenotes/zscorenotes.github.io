/**
 * Tag Color Management Utility
 * Provides functions to get tag colors from the ContentManager system
 */
import * as ContentManager from '@/lib/content-manager-clean';

// Color mapping from color names to Tailwind classes
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

export const getTagColor = async (tagName, sectionType) => {
  try {
    // First try localStorage (same as sync version)
    const storageKey = `categories_${sectionType}`;
    const categoriesJson = localStorage.getItem(storageKey);
    
    if (categoriesJson) {
      const categories = JSON.parse(categoriesJson);
      if (Array.isArray(categories)) {
        // Find the category by label or id (case-insensitive)
        const category = categories.find(cat => {
          if (typeof cat === 'string') return cat.toLowerCase() === tagName.toLowerCase();
          return (cat.label && cat.label.toLowerCase() === tagName.toLowerCase()) || 
                 (cat.id && cat.id.toLowerCase() === tagName.toLowerCase());
        });

        if (category && typeof category === 'object' && category.color) {
          return COLOR_CLASSES[category.color.toLowerCase()] || getDefaultTagColor(tagName, sectionType);
        }
      }
    }

    // Fallback to ContentManager (for server-side or if localStorage fails)
    const content = await ContentManager.getAllContent();
    const settings = content.settings?.[0];
    
    if (settings?.categories) {
      let categories = [];
      switch (sectionType) {
        case 'services':
          categories = settings.categories.service_categories || [];
          break;
        case 'portfolio':
          categories = settings.categories.project_types || [];
          break;
        case 'news':
          categories = settings.categories.news_categories || [];
          break;
        case 'technologies':
        case 'portfolio_technologies':
          categories = settings.categories.technologies || [];
          break;
        default:
          categories = [];
      }

      // Find the category by label
      const category = categories.find(cat => {
        if (typeof cat === 'string') return cat.toLowerCase() === tagName.toLowerCase();
        return (cat.label && cat.label.toLowerCase() === tagName.toLowerCase()) || 
               (cat.id && cat.id.toLowerCase() === tagName.toLowerCase());
      });

      if (category && typeof category === 'object' && category.color) {
        return COLOR_CLASSES[category.color.toLowerCase()] || getDefaultTagColor(tagName, sectionType);
      }
    }

    return getDefaultTagColor(tagName, sectionType);
  } catch (error) {
    console.error('Error getting tag color:', error);
    return getDefaultTagColor(tagName, sectionType);
  }
};

// Synchronous version for immediate use
export const getTagColorSync = (tagName, sectionType) => {
  try {
    // Use the same storage key pattern as InlineCategorySelector
    const storageKey = `categories_${sectionType}`;

    const categoriesJson = localStorage.getItem(storageKey);
    if (!categoriesJson) {
      return getDefaultTagColor(tagName, sectionType);
    }

    const categories = JSON.parse(categoriesJson);
    if (!Array.isArray(categories)) {
      return getDefaultTagColor(tagName, sectionType);
    }

    // Find the category by label or id (case-insensitive)
    const category = categories.find(cat => {
      if (typeof cat === 'string') return cat.toLowerCase() === tagName.toLowerCase();
      return (cat.label && cat.label.toLowerCase() === tagName.toLowerCase()) || 
             (cat.id && cat.id.toLowerCase() === tagName.toLowerCase());
    });

    if (category && typeof category === 'object' && category.color) {
      return COLOR_CLASSES[category.color.toLowerCase()] || getDefaultTagColor(tagName, sectionType);
    }

    return getDefaultTagColor(tagName, sectionType);
  } catch (error) {
    console.error('Error getting tag color:', error);
    return getDefaultTagColor(tagName, sectionType);
  }
};

export const getDefaultTagColor = (tagName, sectionType) => {
  // Fallback colors for common tags
  const defaultColors = {
    services: {
      // Lowercase versions
      music_engraving: "bg-blue-100 text-blue-800 border-blue-200",
      score_preparation: "bg-green-100 text-green-800 border-green-200",
      consultation: "bg-purple-100 text-purple-800 border-purple-200",
      digital_publishing: "bg-orange-100 text-orange-800 border-orange-200",
      // Uppercase versions (matching actual content)
      ENGRAVING: "bg-blue-100 text-blue-800 border-blue-200",
      PREPARATION: "bg-green-100 text-green-800 border-green-200",
      CONSULTATION: "bg-purple-100 text-purple-800 border-purple-200",
      PUBLISHING: "bg-orange-100 text-orange-800 border-orange-200",
    },
    portfolio: {
      score_engraving: "bg-blue-100 text-blue-800 border-blue-200",
      audio_programming: "bg-green-100 text-green-800 border-green-200",
      orchestration: "bg-yellow-100 text-yellow-800 border-yellow-200",
      consultation: "bg-purple-100 text-purple-800 border-purple-200",
      // Legacy support
      'Engraving': "bg-blue-100 text-blue-800 border-blue-200",
      'Orchestration': "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    portfolio_technologies: {
      sibelius: "bg-blue-100 text-blue-800 border-blue-200",
      finale: "bg-green-100 text-green-800 border-green-200",
      dorico: "bg-purple-100 text-purple-800 border-purple-200",
      musescore: "bg-orange-100 text-orange-800 border-orange-200",
      lilypond: "bg-teal-100 text-teal-800 border-teal-200",
      custom_software: "bg-cyan-100 text-cyan-800 border-cyan-200",
    },
    news: {
      release: "bg-blue-100 text-blue-800 border-blue-200",
      performance: "bg-green-100 text-green-800 border-green-200",
      collaboration: "bg-purple-100 text-purple-800 border-purple-200",
      update: "bg-orange-100 text-orange-800 border-orange-200",
      // Uppercase versions
      RELEASE: "bg-blue-100 text-blue-800 border-blue-200",
      PERFORMANCE: "bg-green-100 text-green-800 border-green-200",
      COLLABORATION: "bg-purple-100 text-purple-800 border-purple-200",
      UPDATE: "bg-orange-100 text-orange-800 border-orange-200",
      ANNOUNCEMENT: "bg-indigo-100 text-indigo-800 border-indigo-200",
    }
  };

  const sectionColors = defaultColors[sectionType] || {};
  // Try exact match first, then lowercase, then uppercase
  return sectionColors[tagName] || 
         sectionColors[tagName?.toLowerCase()] || 
         sectionColors[tagName?.toUpperCase()] || 
         "bg-gray-100 text-gray-800 border-gray-200";
};

export const getAllTags = (sectionType) => {
  try {
    const storedTags = localStorage.getItem(`zscore_tags_${sectionType}`);
    if (!storedTags) {
      return [];
    }
    return JSON.parse(storedTags);
  } catch (error) {
    console.error('Error getting all tags:', error);
    return [];
  }
};

export const getTagOptions = (sectionType) => {
  const tags = getAllTags(sectionType);
  return tags.map(tag => ({
    value: tag.name,
    label: tag.displayName,
    color: tag.color
  }));
};