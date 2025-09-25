import heroData from './HeroContent.json';

/**
 * HeroContent entity class for managing hero section content
 */
export class HeroContent {
  constructor(data) {
    this.id = data.id;
    this.version = data.version;
    this.updated_date = data.updated_date;
    this.title = data.title;
    this.subtitle = data.subtitle;
    this.background_type = data.background_type;
    this.background_color = data.background_color;
    this.background_image = data.background_image;
    this.text_color = data.text_color;
    this.primary_cta = data.primary_cta;
    this.secondary_cta = data.secondary_cta;
    this.animations_enabled = data.animations_enabled;
    this.stagger_delays = data.stagger_delays;
  }

  /**
   * Gets the main hero content
   * @returns {Promise<HeroContent>} The hero content instance
   */
  static async getMain() {
    try {
      const mainContent = heroData.find(item => item.id === 'hero_main');
      return mainContent ? new HeroContent(mainContent) : null;
    } catch (error) {
      console.error('Error loading hero content:', error);
      return null;
    }
  }

  /**
   * Gets all hero content variations
   * @returns {Promise<HeroContent[]>} Array of hero content instances
   */
  static async getAll() {
    try {
      return heroData.map(item => new HeroContent(item));
    } catch (error) {
      console.error('Error loading hero content:', error);
      return [];
    }
  }
}