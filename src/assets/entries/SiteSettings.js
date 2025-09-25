import siteData from './SiteSettings.json';

/**
 * SiteSettings entity class for managing global site configuration
 */
export class SiteSettings {
  constructor(data) {
    this.id = data.id;
    this.version = data.version;
    this.updated_date = data.updated_date;
    this.site_title = data.site_title;
    this.site_tagline = data.site_tagline;
    this.site_description = data.site_description;
    this.site_keywords = data.site_keywords;
    this.site_author = data.site_author;
    this.site_url = data.site_url;
    this.logo = data.logo;
    this.navigation = data.navigation;
    this.footer = data.footer;
    this.seo = data.seo;
    this.analytics = data.analytics;
    this.performance = data.performance;
    this.features = data.features;
  }

  /**
   * Gets the main site settings
   * @returns {Promise<SiteSettings>} The site settings instance
   */
  static async getMain() {
    try {
      const mainSettings = siteData.find(item => item.id === 'site_main');
      return mainSettings ? new SiteSettings(mainSettings) : null;
    } catch (error) {
      console.error('Error loading site settings:', error);
      return null;
    }
  }

  /**
   * Gets navigation sections sorted by order
   * @returns {Array} Sorted navigation sections
   */
  getNavigationSections() {
    return this.navigation.sections.sort((a, b) => a.order - b.order);
  }

  /**
   * Gets SEO meta title for a specific page
   * @param {string} pageTitle - The page title
   * @returns {string} Formatted meta title
   */
  getMetaTitle(pageTitle = '') {
    if (!pageTitle) return this.site_title;
    return this.seo.meta_title_template.replace('%s', pageTitle);
  }

  /**
   * Gets all enabled analytics IDs
   * @returns {Object} Object with enabled analytics services
   */
  getEnabledAnalytics() {
    const enabled = {};
    Object.entries(this.analytics).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        enabled[key] = value;
      }
    });
    return enabled;
  }

  /**
   * Checks if a specific feature is enabled
   * @param {string} featureName - The feature name
   * @returns {boolean} True if feature is enabled
   */
  isFeatureEnabled(featureName) {
    return this.features[featureName] === true;
  }

  /**
   * Gets logo configuration
   * @returns {Object} Logo configuration object
   */
  getLogo() {
    return this.logo;
  }

  /**
   * Gets footer configuration
   * @returns {Object} Footer configuration object  
   */
  getFooter() {
    return this.footer;
  }
}