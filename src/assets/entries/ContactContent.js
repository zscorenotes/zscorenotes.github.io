import contactData from './ContactContent.json';

/**
 * ContactContent entity class for managing contact section content
 */
export class ContactContent {
  constructor(data) {
    this.id = data.id;
    this.version = data.version;
    this.updated_date = data.updated_date;
    this.section_title = data.section_title;
    this.section_subtitle = data.section_subtitle;
    this.contact_info = data.contact_info;
    this.social_links = data.social_links;
    this.form_config = data.form_config;
    this.working_hours = data.working_hours;
  }

  /**
   * Gets the main contact content
   * @returns {Promise<ContactContent>} The contact content instance
   */
  static async getMain() {
    try {
      const mainContent = contactData.find(item => item.id === 'contact_main');
      return mainContent ? new ContactContent(mainContent) : null;
    } catch (error) {
      console.error('Error loading contact content:', error);
      return null;
    }
  }

  /**
   * Gets form fields configuration
   * @returns {Array} Form fields array
   */
  getFormFields() {
    return this.form_config.fields;
  }

  /**
   * Gets a specific form field by name
   * @param {string} fieldName - The field name
   * @returns {Object|null} The form field or null if not found
   */
  getFormField(fieldName) {
    return this.form_config.fields.find(field => field.name === fieldName) || null;
  }

  /**
   * Gets social links
   * @returns {Array} Social links array
   */
  getSocialLinks() {
    return this.social_links;
  }

  /**
   * Checks if the contact form is enabled
   * @returns {boolean} True if form is enabled
   */
  isFormEnabled() {
    return this.form_config.enabled;
  }
}