/**
 * ContentManager - Main interface for content operations
 * Uses ContentManagerV2 for blob storage
 */
import * as ContentManagerV2 from '@/lib/content-manager-v2';

export class ContentManager {

  /**
   * Get all content for the admin panel
   * @returns {Promise<Object>} Object with all content types and their data
   */
  static async getAllContent() {
    // Always use blob storage (both development and production)
    try {
      console.log('Loading content from blob storage...');
      const content = await ContentManagerV2.getAllContent();
      console.log('Blob storage content loaded:', Object.keys(content));
      
      // Fix any nested structure issues from old data format
      if (content.site_content && typeof content.site_content === 'object') {
        // Merge nested data with root level data, preferring nested data if it has more content
        Object.keys(content.site_content).forEach(key => {
          if (Array.isArray(content.site_content[key]) && content.site_content[key].length > 0) {
            // If nested array has data and root array is empty, use nested data
            if (!content[key] || (Array.isArray(content[key]) && content[key].length === 0)) {
              content[key] = content.site_content[key];
            }
          } else if (typeof content.site_content[key] === 'object' && content.site_content[key] !== null) {
            // For object types, merge if root object is empty
            if (!content[key] || Object.keys(content[key]).length <= 3) { // 3 for version, lastUpdated, etc.
              content[key] = { ...content[key], ...content.site_content[key] };
            }
          }
        });
      }
      
      return content;
    } catch (error) {
      console.error('Blob storage failed:', error);
      // Return empty structure instead of mock data
      return {
        site_content: { news: [], portfolio: [], services: [] },
        news_items: [],
        portfolio_items: [],
        services: [],
        categories: { services: [], portfolio: [], news: [], technologies: [] },
        site_settings: { lastUpdated: new Date().toISOString(), version: 1 },
        about_content: { lastUpdated: new Date().toISOString(), version: 1 },
        hero_content: { lastUpdated: new Date().toISOString(), version: 1 },
        contact_content: { lastUpdated: new Date().toISOString(), version: 1 },
      };
    }
  }

  /**
   * Save content using blob storage
   */
  static async saveContent(contentType, data) {
    try {
      await ContentManagerV2.saveContent(contentType, data);
      return true;
    } catch (error) {
      console.error('Failed to save content:', error);
      return false;
    }
  }

  /**
   * Update content item
   */
  static async updateContent(contentType, itemId, updatedItem) {
    try {
      await ContentManagerV2.updateContentItem(contentType, itemId, updatedItem);
      return true;
    } catch (error) {
      console.error('Failed to update content:', error);
      return false;
    }
  }

  /**
   * Add new content item
   */
  static async addContent(contentType, newItem) {
    try {
      await ContentManagerV2.addContentItem(contentType, newItem);
      return true;
    } catch (error) {
      console.error('Failed to add content:', error);
      return false;
    }
  }

  /**
   * Delete content item
   */
  static async deleteContent(contentType, itemId) {
    try {
      await ContentManagerV2.deleteContentItem(contentType, itemId);
      return true;
    } catch (error) {
      console.error('Failed to delete content:', error);
      return false;
    }
  }

  /**
   * Generate SEO-friendly slug from title
   */
  static generateSlug(title) {
    return ContentManagerV2.generateSlug(title);
  }
}

export default ContentManager;