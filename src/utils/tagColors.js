/**
 * Tag Color Management Utility
 * Provides functions to get tag colors from the managed tag system
 */

export const getTagColor = (tagName, sectionType) => {
  try {
    const storedTags = localStorage.getItem(`zscore_tags_${sectionType}`);
    if (!storedTags) {
      return getDefaultTagColor(tagName, sectionType);
    }

    const tags = JSON.parse(storedTags);
    const tag = tags.find(t => 
      t.name === tagName || 
      t.id === tagName || 
      t.displayName === tagName ||
      t.name === tagName.toLowerCase() ||
      t.id === tagName.toLowerCase().replace(/\s+/g, '_')
    );

    return tag ? tag.color : getDefaultTagColor(tagName, sectionType);
  } catch (error) {
    console.error('Error getting tag color:', error);
    return getDefaultTagColor(tagName, sectionType);
  }
};

export const getDefaultTagColor = (tagName, sectionType) => {
  // Fallback colors for common tags
  const defaultColors = {
    services: {
      engraving: "bg-blue-100 text-blue-800",
      orchestration: "bg-purple-100 text-purple-800",
      automation: "bg-green-100 text-green-800",
      audio: "bg-pink-100 text-pink-800",
      consulting: "bg-orange-100 text-orange-800",
      editorial: "bg-yellow-100 text-yellow-800",
    },
    portfolio: {
      'Engraving': "bg-blue-100 text-blue-800",
      'Composition': "bg-purple-100 text-purple-800",
      'Arrangement': "bg-green-100 text-green-800",
      'Transcription': "bg-orange-100 text-orange-800",
      'Orchestration': "bg-indigo-100 text-indigo-800",
      'Music Production': "bg-pink-100 text-pink-800",
      'Audio Editing': "bg-teal-100 text-teal-800",
    },
    news: {
      announcement: "bg-blue-100 text-blue-800",
      project_update: "bg-green-100 text-green-800",
      technology: "bg-purple-100 text-purple-800",
      industry_news: "bg-orange-100 text-orange-800",
    }
  };

  const sectionColors = defaultColors[sectionType] || {};
  return sectionColors[tagName] || sectionColors[tagName?.toLowerCase()] || "bg-gray-100 text-gray-800";
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