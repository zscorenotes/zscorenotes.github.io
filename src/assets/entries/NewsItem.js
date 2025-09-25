import newsData from './NewsItem.json';

/**
 * NewsItem entity class for handling news data
 */
export class NewsItem {
  constructor(data) {
    this.id = data.id;
    this.created_date = data.created_date;
    this.updated_date = data.updated_date;
    this.created_by = data.created_by;
    this.title = data.title;
    this.content = data.content;
    this.excerpt = data.excerpt;
    this.category = data.category;
    this.featured = data.featured;
    this.publication_date = data.publication_date;
    this.tags = data.tags || [];
    this.image_urls = data.image_urls || [];
    this.content_blocks = data.content_blocks || [];
    this.external_link = data.external_link;
    this.external_link_text = data.external_link_text;
    this.slug = data.slug;
  }

  /**
   * Fetches all news items and optionally sorts them
   * @param {string} sortBy - Sort criteria (e.g., '-publication_date' for descending)
   * @returns {Promise<NewsItem[]>} Array of NewsItem instances
   */
  static async list(sortBy = null) {
    try {
      // Convert to NewsItem instances
      let newsItems = newsData.map(item => new NewsItem(item));
      
      // Apply sorting if specified
      if (sortBy) {
        const isDescending = sortBy.startsWith('-');
        const field = isDescending ? sortBy.substring(1) : sortBy;
        
        newsItems.sort((a, b) => {
          const aValue = new Date(a[field]);
          const bValue = new Date(b[field]);
          
          if (isDescending) {
            return bValue - aValue;
          } else {
            return aValue - bValue;
          }
        });
      }
      
      return newsItems;
    } catch (error) {
      console.error('Error loading news items:', error);
      return [];
    }
  }

  /**
   * Finds a news item by ID
   * @param {string} id - The news item ID
   * @returns {Promise<NewsItem|null>} The news item or null if not found
   */
  static async findById(id) {
    const allItems = await this.list();
    return allItems.find(item => item.id === id) || null;
  }
}