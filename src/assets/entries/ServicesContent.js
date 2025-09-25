/**
 * Services Content Entity
 * Manages service items and section metadata
 */
export class ServicesContent {
  constructor(data = {}) {
    // Section metadata
    this.section_title = data.section_title || "Core Services";
    this.section_description = data.section_description || "Comprehensive solutions for contemporary music notation, and engraving, combining deep musical knowledge with custom technical workflows.";
    this.section_id = data.section_id || "services";
    
    // Services array
    this.services = data.services || [];
    
    // Metadata
    this.updated_date = data.updated_date || new Date().toISOString();
    this.version = data.version || "1.0";
  }

  // Load main services content
  static async getMain() {
    try {
      // For browser environment, we'll return mock data
      // In production, this would load from the actual Services.json
      const mockData = {
        section_title: "Core Services",
        section_description: "Comprehensive solutions for contemporary music notation, and engraving, combining deep musical knowledge with custom technical workflows.",
        services: [
          {
            id: "music-engraving",
            title: "Music Engraving",
            category: "Engraving",
            description: "Professional music notation and scoring using industry-standard software",
            detailed_description: "<p>We provide comprehensive music engraving services using professional notation software...</p>",
            features: ["Professional notation", "Multiple formats", "Quick turnaround"],
            pricing: "Starting at $50/page",
            image_url: "",
            created_date: new Date().toISOString()
          },
          {
            id: "composition-services",
            title: "Composition Services", 
            category: "Creative",
            description: "Original compositions and arrangements for various ensembles",
            detailed_description: "<p>Custom composition services for all types of musical projects...</p>",
            features: ["Original compositions", "Arrangements", "Orchestration"],
            pricing: "Custom quote",
            image_url: "",
            created_date: new Date().toISOString()
          }
        ]
      };
      
      return new ServicesContent(mockData);
    } catch (error) {
      console.error('Error loading services content:', error);
      return new ServicesContent();
    }
  }

  // Save services content
  async save() {
    try {
      // In a real implementation, this would save to the server
      console.log('Saving services content:', this);
      return true;
    } catch (error) {
      console.error('Error saving services content:', error);
      return false;
    }
  }

  // Add new service
  addService(serviceData = {}) {
    const newService = {
      id: serviceData.id || `service-${Date.now()}`,
      title: serviceData.title || "New Service",
      category: serviceData.category || "General",
      description: serviceData.description || "",
      detailed_description: serviceData.detailed_description || "",
      features: serviceData.features || [],
      pricing: serviceData.pricing || "",
      image_url: serviceData.image_url || "",
      created_date: new Date().toISOString(),
      ...serviceData
    };
    
    this.services.push(newService);
    this.updated_date = new Date().toISOString();
    return newService;
  }

  // Update service
  updateService(serviceId, updates) {
    const index = this.services.findIndex(s => s.id === serviceId);
    if (index !== -1) {
      this.services[index] = { ...this.services[index], ...updates };
      this.updated_date = new Date().toISOString();
      return this.services[index];
    }
    return null;
  }

  // Remove service
  removeService(serviceId) {
    const index = this.services.findIndex(s => s.id === serviceId);
    if (index !== -1) {
      const removed = this.services.splice(index, 1)[0];
      this.updated_date = new Date().toISOString();
      return removed;
    }
    return null;
  }

  // Get service by ID
  getService(serviceId) {
    return this.services.find(s => s.id === serviceId);
  }

  // Export to JSON format
  toJSON() {
    return {
      section_title: this.section_title,
      section_description: this.section_description,
      section_id: this.section_id,
      services: this.services,
      updated_date: this.updated_date,
      version: this.version
    };
  }
}

export default ServicesContent;