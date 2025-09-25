/**
 * Portfolio Content Entity
 * Manages portfolio items and section metadata
 */
export class PortfolioContent {
  constructor(data = {}) {
    // Section metadata
    this.section_title = data.section_title || "Selected Works";
    this.section_subtitle = data.section_subtitle || "Portfolio";
    this.section_description = data.section_description || "A curated collection of our most impactful music engraving and audio programming projects for composers, publishers, and ensembles.";
    this.section_id = data.section_id || "portfolio";
    
    // Portfolio items array
    this.portfolio_items = data.portfolio_items || [];
    
    // Categories for filtering
    this.categories = data.categories || ["all", "engraving", "orchestration", "audio", "automation"];
    
    // Display settings
    this.items_per_page = data.items_per_page || 3;
    this.enable_filtering = data.enable_filtering !== false;
    this.enable_pagination = data.enable_pagination !== false;
    
    // Metadata
    this.updated_date = data.updated_date || new Date().toISOString();
    this.version = data.version || "1.0";
  }

  // Load main portfolio content
  static async getMain() {
    try {
      // For browser environment, we'll return mock data
      // In production, this would load from actual portfolio data
      const mockData = {
        section_title: "Selected Works",
        section_subtitle: "Portfolio",
        section_description: "A curated collection of our most impactful music engraving and audio programming projects for composers, publishers, and ensembles.",
        categories: ["all", "engraving", "orchestration", "audio", "automation"],
        portfolio_items: [
          {
            id: "impact-symphony",
            title: "IMPACT Symphony Project",
            composer: "Contemporary Composer",
            instrumentation: "Full Orchestra",
            project_type: ["engraving", "orchestration"],
            description: "Complete music engraving and orchestration for a modern symphony work",
            detailed_description: "<p>This comprehensive project involved complete music engraving and orchestration services for a contemporary symphony...</p>",
            completion_year: 2024,
            image_urls: [],
            tags: ["symphony", "orchestra", "contemporary"],
            featured: true,
            created_date: new Date().toISOString()
          },
          {
            id: "chamber-work-collection",
            title: "Chamber Work Collection",
            composer: "Various Artists",
            instrumentation: "Chamber Ensembles",
            project_type: ["engraving"],
            description: "Professional notation for a series of chamber music works",
            detailed_description: "<p>A collection of meticulously engraved chamber works for various ensemble configurations...</p>",
            completion_year: 2024,
            image_urls: [],
            tags: ["chamber", "ensemble", "notation"],
            featured: false,
            created_date: new Date().toISOString()
          }
        ]
      };
      
      return new PortfolioContent(mockData);
    } catch (error) {
      console.error('Error loading portfolio content:', error);
      return new PortfolioContent();
    }
  }

  // Save portfolio content
  async save() {
    try {
      // In a real implementation, this would save to the server
      console.log('Saving portfolio content:', this);
      return true;
    } catch (error) {
      console.error('Error saving portfolio content:', error);
      return false;
    }
  }

  // Add new portfolio item
  addPortfolioItem(itemData = {}) {
    const newItem = {
      id: itemData.id || `portfolio-${Date.now()}`,
      title: itemData.title || "New Project",
      composer: itemData.composer || "",
      instrumentation: itemData.instrumentation || "",
      project_type: itemData.project_type || ["engraving"],
      description: itemData.description || "",
      detailed_description: itemData.detailed_description || "",
      completion_year: itemData.completion_year || new Date().getFullYear(),
      image_urls: itemData.image_urls || [],
      tags: itemData.tags || [],
      featured: itemData.featured || false,
      created_date: new Date().toISOString(),
      ...itemData
    };
    
    this.portfolio_items.push(newItem);
    this.updated_date = new Date().toISOString();
    return newItem;
  }

  // Update portfolio item
  updatePortfolioItem(itemId, updates) {
    const index = this.portfolio_items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.portfolio_items[index] = { ...this.portfolio_items[index], ...updates };
      this.updated_date = new Date().toISOString();
      return this.portfolio_items[index];
    }
    return null;
  }

  // Remove portfolio item
  removePortfolioItem(itemId) {
    const index = this.portfolio_items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      const removed = this.portfolio_items.splice(index, 1)[0];
      this.updated_date = new Date().toISOString();
      return removed;
    }
    return null;
  }

  // Get portfolio item by ID
  getPortfolioItem(itemId) {
    return this.portfolio_items.find(item => item.id === itemId);
  }

  // Get items by project type
  getItemsByType(projectType) {
    if (projectType === 'all') return this.portfolio_items;
    return this.portfolio_items.filter(item => {
      return Array.isArray(item.project_type) 
        ? item.project_type.includes(projectType)
        : item.project_type === projectType;
    });
  }

  // Get featured items
  getFeaturedItems() {
    return this.portfolio_items.filter(item => item.featured);
  }

  // Export to JSON format
  toJSON() {
    return {
      section_title: this.section_title,
      section_subtitle: this.section_subtitle,
      section_description: this.section_description,
      section_id: this.section_id,
      portfolio_items: this.portfolio_items,
      categories: this.categories,
      items_per_page: this.items_per_page,
      enable_filtering: this.enable_filtering,
      enable_pagination: this.enable_pagination,
      updated_date: this.updated_date,
      version: this.version
    };
  }
}

export default PortfolioContent;