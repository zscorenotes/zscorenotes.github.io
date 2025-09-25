import aboutData from './AboutContent.json';

/**
 * AboutContent entity class for managing about section content
 */
export class AboutContent {
  constructor(data) {
    this.id = data.id;
    this.version = data.version;
    this.updated_date = data.updated_date;
    this.section_title = data.section_title;
    this.section_subtitle = data.section_subtitle;
    this.philosophy_paragraphs = data.philosophy_paragraphs;
    this.main_image = data.main_image;
    this.excellence_section = data.excellence_section;
    this.team_members = data.team_members;
    this.why_matters_points = data.why_matters_points;
    this.technical_expertise = data.technical_expertise;
    this.musical_background = data.musical_background;
  }

  /**
   * Gets the main about content
   * @returns {Promise<AboutContent>} The about content instance
   */
  static async getMain() {
    try {
      const mainContent = aboutData.find(item => item.id === 'about_main');
      return mainContent ? new AboutContent(mainContent) : null;
    } catch (error) {
      console.error('Error loading about content:', error);
      return null;
    }
  }

  /**
   * Gets all team members sorted by order
   * @returns {Array} Sorted team members
   */
  getTeamMembers() {
    return this.team_members.sort((a, b) => a.sort_order - b.sort_order);
  }

  /**
   * Gets a specific team member by ID
   * @param {string} memberId - The team member ID
   * @returns {Object|null} The team member or null if not found
   */
  getTeamMember(memberId) {
    return this.team_members.find(member => member.id === memberId) || null;
  }
}