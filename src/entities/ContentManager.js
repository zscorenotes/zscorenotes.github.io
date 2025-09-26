// Unified Content Management API
import { NewsItem } from '@/assets/entries/NewsItem';
import { AboutContent } from '@/assets/entries/AboutContent';
import { SiteSettings } from '@/assets/entries/SiteSettings';
import { ServicesContent } from '@/assets/entries/ServicesContent';
import { PortfolioContent } from '@/assets/entries/PortfolioContent';

// Import new blob storage system
import * as ContentManagerV2 from '@/lib/content-manager-v2';

// Import fallback data files
import servicesDefaultData from '@/assets/entries/Services.default.json';
import portfolioDefaultData from '@/assets/entries/PortfolioItem.default.json';

// Initialize data with defaults - will be replaced by dynamic loading if files exist
let servicesData = servicesDefaultData;
let portfolioData = portfolioDefaultData;
let contactInquiryData = [];

/**
 * Centralized Content Management System
 * Provides unified access to all website content
 */
export class ContentManager {
  
  // Content type definitions for the admin panel
  static CONTENT_TYPES = {
    ABOUT: {
      key: 'about',
      name: 'About Section',
      description: 'About page content and team information',
      entity: AboutContent,
      editable: true,
      fields: [
        { name: 'section_title', type: 'text', label: 'Section Title' },
        { name: 'section_subtitle', type: 'text', label: 'Section Subtitle' },
        { name: 'philosophy_paragraphs', type: 'array', label: 'Philosophy Text' },
        { name: 'team_members', type: 'array', label: 'Team Members' },
        { name: 'technical_expertise', type: 'array', label: 'Technical Skills' },
        { name: 'musical_background', type: 'array', label: 'Musical Background' }
      ]
    },
    SITE_SETTINGS: {
      key: 'settings',
      name: 'Site Settings',
      description: 'Global site configuration and SEO',
      entity: SiteSettings,
      editable: true,
      fields: [
        { name: 'site_title', type: 'text', label: 'Site Title' },
        { name: 'site_description', type: 'textarea', label: 'Site Description' },
        { name: 'site_keywords', type: 'text', label: 'SEO Keywords' },
        { name: 'logo', type: 'object', label: 'Logo Configuration' },
        { name: 'footer', type: 'object', label: 'Footer Content' },
        { name: 'seo', type: 'object', label: 'SEO Settings' }
      ]
    },
    NEWS: {
      key: 'news',
      name: 'News/Feed Items',
      description: 'News articles and blog posts',
      entity: NewsItem,
      editable: true,
      fields: [
        { name: 'title', type: 'text', label: 'Title' },
        { name: 'content', type: 'html', label: 'Content (HTML)' },
        { name: 'excerpt', type: 'textarea', label: 'Excerpt' },
        { name: 'category', type: 'select', label: 'Category', options: ['project_update', 'technology', 'industry_news', 'announcement', 'tutorial'] },
        { name: 'featured', type: 'boolean', label: 'Featured' },
        { name: 'publication_date', type: 'date', label: 'Publication Date' },
        { name: 'tags', type: 'array', label: 'Tags' },
        { name: 'image_urls', type: 'array', label: 'Images' }
      ]
    },
    SERVICES: {
      key: 'services',
      name: 'Services Section',
      description: 'Service offerings and section configuration',
      entity: ServicesContent,
      editable: true,
      fields: [
        { name: 'section_title', type: 'text', label: 'Section Title' },
        { name: 'section_description', type: 'textarea', label: 'Section Description' },
        { name: 'services', type: 'array', label: 'Service Items' }
      ]
    },
    PORTFOLIO: {
      key: 'portfolio',
      name: 'Portfolio Items',
      description: 'Individual portfolio projects',
      entity: PortfolioContent,
      editable: true,
      fields: [
        { name: 'title', type: 'text', label: 'Project Title' },
        { name: 'composer', type: 'text', label: 'Composer' },
        { name: 'instrumentation', type: 'text', label: 'Instrumentation' },
        { name: 'project_type', type: 'array', label: 'Project Types' },
        { name: 'description', type: 'textarea', label: 'Short Description' },
        { name: 'detailed_description', type: 'html', label: 'Detailed Description' },
        { name: 'completion_year', type: 'number', label: 'Completion Year' },
        { name: 'image_urls', type: 'array', label: 'Images' },
        { name: 'tags', type: 'array', label: 'Tags' },
        { name: 'featured', type: 'boolean', label: 'Featured Project' },
        { name: 'publisher', type: 'text', label: 'Publisher' }
      ]
    },
    BRANDS: {
      key: 'brands',
      name: 'Trusted Brands',
      description: 'Manage trusted brands and institutions section',
      editable: true,
      fields: [
        { name: 'section_title', type: 'text', label: 'Section Title' },
        { name: 'section_subtitle', type: 'textarea', label: 'Section Subtitle' },
        { name: 'brands', type: 'array', label: 'Brand List' }
      ]
    },
    CONTACT_INQUIRIES: {
      key: 'inquiries',
      name: 'Contact Inquiries',
      description: 'Contact form submissions',
      data: contactInquiryData,
      editable: false,
      fields: [
        { name: 'name', type: 'text', label: 'Name' },
        { name: 'email', type: 'email', label: 'Email' },
        { name: 'message', type: 'textarea', label: 'Message' },
        { name: 'date', type: 'datetime', label: 'Submission Date' }
      ]
    }
  };

  // Dynamic data loading flag
  static _dataLoaded = false;

  /**
   * Dynamically load real data files if they exist (client-side only)
   * This allows the build to succeed with defaults while using real data when available
   */
  static async loadRealDataIfAvailable() {
    if (this._dataLoaded || typeof window === 'undefined') return;
    
    this._dataLoaded = true;
    
    try {
      // Try to dynamically import real Services.json
      const servicesModule = await import('@/assets/entries/Services.json');
      if (servicesModule.default && Array.isArray(servicesModule.default)) {
        servicesData = servicesModule.default;
        console.log('Loaded real Services.json data');
      }
    } catch (e) {
      console.log('Using default Services data (real file not found)');
    }

    try {
      // Try to dynamically import real PortfolioItem.json
      const portfolioModule = await import('@/assets/entries/PortfolioItem.json');
      if (portfolioModule.default && Array.isArray(portfolioModule.default)) {
        portfolioData = portfolioModule.default;
        console.log('Loaded real PortfolioItem.json data');
      }
    } catch (e) {
      console.log('Using default Portfolio data (real file not found)');
    }

    try {
      // Try to dynamically import ContactInquiry.json
      const contactModule = await import('@/assets/entries/ContactInquiry.json');
      if (contactModule.default && Array.isArray(contactModule.default)) {
        contactInquiryData = contactModule.default;
        console.log('Loaded ContactInquiry.json data');
      }
    } catch (e) {
      console.log('No contact inquiry data found');
    }
  }

  /**
   * Get all available content types
   * @returns {Array} Array of content type definitions
   */
  static getContentTypes() {
    return Object.values(this.CONTENT_TYPES);
  }

  /**
   * Get a specific content type by key
   * @param {string} key - Content type key
   * @returns {Object|null} Content type definition or null
   */
  static getContentType(key) {
    return Object.values(this.CONTENT_TYPES).find(type => type.key === key) || null;
  }

  /**
   * Load content for a specific type
   * @param {string} contentType - The content type key
   * @returns {Promise<Array|Object>} The content data
   */
  static async loadContent(contentType) {
    const type = this.getContentType(contentType);
    if (!type) throw new Error(`Unknown content type: ${contentType}`);

    try {
      if (type.entity) {
        // Use entity class methods
        if (type.entity.getAll) {
          return await type.entity.getAll();
        } else if (type.entity.getMain) {
          return await type.entity.getMain();
        } else if (type.entity.list) {
          return await type.entity.list();
        }
      } else if (type.data) {
        // Use direct data
        return Array.isArray(type.data) ? type.data : [type.data];
      }
      
      throw new Error(`No data source available for ${contentType}`);
    } catch (error) {
      console.error(`Error loading content for ${contentType}:`, error);
      return [];
    }
  }


  /**
   * Get all content for the admin panel
   * @returns {Promise<Object>} Object with all content types and their data
   */
  static async getAllContent() {
    // Always try blob storage first in browser environment (for testing)
    if (typeof window !== 'undefined') {
      // Try blob storage (both development and production)
      try {
        console.log('Trying blob storage for content...');
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
        console.warn('Blob storage unavailable, falling back to legacy system:', error);
      }
    }

    // Development or fallback: Use legacy localStorage system
    // For SSR/SSG, always return mock data immediately
    if (typeof window === 'undefined') {
      return this.getMockData();
    }

    // Load real data files if available (client-side only)
    await this.loadRealDataIfAvailable();

    // Try to load from localStorage first, but ensure mock data structure is preserved
    const STORAGE_KEY = 'zscore_cms_content';
    
    try {
      if (window.localStorage) {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          const mockData = this.getMockData();
          
          // Intelligent merge: for each section, merge stored items with mock data structure
          const mergedData = { ...mockData };
          
          Object.keys(parsedData).forEach(section => {
            if (Array.isArray(mockData[section]) && Array.isArray(parsedData[section])) {
              // For arrays (services, portfolio, news), merge items while preserving mock structure
              const mockItems = mockData[section];
              const storedItems = parsedData[section];
              
              // Start with mock items and update with any stored versions
              mergedData[section] = mockItems.map(mockItem => {
                const storedItem = storedItems.find(stored => stored.id === mockItem.id);
                return storedItem ? { ...mockItem, ...storedItem } : mockItem;
              });
              
              // Add any new stored items that don't exist in mock data
              const newStoredItems = storedItems.filter(stored => 
                !mockItems.find(mock => mock.id === stored.id)
              );
              mergedData[section].push(...newStoredItems);
            } else {
              // For objects (about, settings), merge properties
              mergedData[section] = { ...mockData[section], ...parsedData[section] };
            }
          });
          
          // Ensure all news items have slugs
          if (mergedData.news && Array.isArray(mergedData.news)) {
            mergedData.news = mergedData.news.map(item => ({
              ...item,
              slug: item.slug || this.generateSlug(item.title)
            }));
          }
          
          return mergedData;
        }
      }
    } catch (error) {
      console.warn('Error loading data from localStorage:', error);
    }
    
    // Return mock data as fallback
    const mockData = this.getMockData();
    
    // Ensure all news items in mock data have slugs
    if (mockData.news && Array.isArray(mockData.news)) {
      mockData.news = mockData.news.map(item => ({
        ...item,
        slug: item.slug || this.generateSlug(item.title)
      }));
    }
    
    return mockData;
  }

  /**
   * Get mock data structure
   * @returns {Object} Mock data object
   */
  static getMockData() {
    return {
      about: {
        section_title: "About ZSCORE",
        section_subtitle: "Founded by active composers who understand the intricacies of contemporary music notation",
        philosophy_paragraphs: [
          "ZSCORE emerged from a fundamental need within the contemporary music community: a requirement for truly professional engraving services that not only maintain technical precision but also deeply respect artistic intent.",
          "Our unique approach seamlessly combines generations of traditional music engraving expertise with cutting-edge, custom-built automation tools.",
          "We are steadfast partners to composers, publishers, and ensembles worldwide. Our primary mission is to ensure that even the most intricate and demanding contemporary works are presented with such clarity that performers can focus entirely on the music."
        ]
      },
      services: [
        {
          id: "music-engraving",
          title: "Professional Score Engraving", 
          category: "Engraving",
          description: "Comprehensive music notation services using industry-standard software, ensuring publication-ready scores with optimal readability and professional aesthetic.",
          detailed_description: `<div class="prose prose-lg max-w-none">
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg mb-8">
              <h2 class="text-3xl font-bold mb-6 text-gray-800">Professional Score Engraving</h2>
              <p class="text-lg mb-6">Transform your musical compositions into publication-ready scores with our comprehensive music notation services.</p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-6 mb-8">
              <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
                <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span class="text-2xl">🎼</span>
                </div>
                <h3 class="text-xl font-semibold mb-3">Professional Notation</h3>
                <p class="text-gray-600">Industry-standard engraving with meticulous attention to detail</p>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
                <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span class="text-2xl">📄</span>
                </div>
                <h3 class="text-xl font-semibold mb-3">Multiple Formats</h3>
                <p class="text-gray-600">Full scores, parts, and conductor scores in various formats</p>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
                <div class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span class="text-2xl">⚡</span>
                </div>
                <h3 class="text-xl font-semibold mb-3">Quick Turnaround</h3>
                <p class="text-gray-600">Fast delivery without compromising quality</p>
              </div>
            </div>
            
            <div class="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 class="text-xl font-bold mb-4">What's Included</h3>
              <ul class="space-y-2">
                <li class="flex items-center gap-2">
                  <span class="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm">✓</span>
                  <span>Complete score preparation and formatting</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm">✓</span>
                  <span>Individual instrumental parts extraction</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm">✓</span>
                  <span>Multiple revision rounds included</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm">✓</span>
                  <span>Print-ready PDF and source files</span>
                </li>
              </ul>
            </div>
          </div>`,
          features: ["Professional notation", "Multiple formats", "Quick turnaround"],
          pricing: "Starting at $50/page",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "audio-programming", 
          title: "Audio Programming & Automation",
          category: "Technology",
          description: "Custom software solutions for music creation, including Max/MSP patches, SuperCollider compositions, and workflow automation tools.",
          detailed_description: `<div class="prose prose-lg max-w-none">
            <div class="bg-gradient-to-r from-green-50 to-teal-50 p-8 rounded-lg mb-8">
              <h2 class="text-3xl font-bold mb-6 text-gray-800">Audio Programming & Automation</h2>
              <p class="text-lg mb-6">Cutting-edge software solutions for modern music creation and workflow optimization.</p>
            </div>
            
            <div class="grid md:grid-cols-2 gap-8 mb-8">
              <div class="bg-white p-6 rounded-lg shadow-sm border">
                <h3 class="text-xl font-semibold mb-4 text-green-800">Custom Development</h3>
                <ul class="space-y-3">
                  <li class="flex items-start">
                    <span class="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">•</span>
                    <div>Max/MSP patches and applications</div>
                  </li>
                  <li class="flex items-start">
                    <span class="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">•</span>
                    <div>SuperCollider compositions</div>
                  </li>
                  <li class="flex items-start">
                    <span class="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">•</span>
                    <div>Interactive performance systems</div>
                  </li>
                </ul>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-sm border">
                <h3 class="text-xl font-semibold mb-4 text-teal-800">Automation Tools</h3>
                <p class="text-gray-600">Streamline your workflow with custom automation solutions designed specifically for your needs.</p>
              </div>
            </div>
          </div>`,
          features: ["Custom software", "Automation tools", "Interactive systems"],
          pricing: "Custom quote",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: "orchestration",
          title: "Orchestration & Arrangement",
          category: "Creative", 
          description: "Expert orchestration services for chamber ensembles to full orchestra, with deep understanding of instrumental techniques and contemporary practices.",
          detailed_description: `<div class="prose prose-lg max-w-none">
            <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-lg mb-8">
              <h2 class="text-3xl font-bold mb-6 text-gray-800">Orchestration & Arrangement</h2>
              <p class="text-lg mb-6">Expert orchestration services bringing your musical ideas to life with full orchestral and chamber ensemble arrangements.</p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-6 mb-8">
              <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
                <h3 class="text-xl font-semibold mb-3">Full Orchestra</h3>
                <p class="text-gray-600">Complete symphonic orchestrations</p>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
                <h3 class="text-xl font-semibold mb-3">Chamber Ensembles</h3>
                <p class="text-gray-600">Intimate small group arrangements</p>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
                <h3 class="text-xl font-semibold mb-3">Consulting</h3>
                <p class="text-gray-600">Performance and interpretation guidance</p>
              </div>
            </div>
          </div>`,
          features: ["Full orchestration", "Reduction services", "Performance consulting"],
          pricing: "Contact for pricing",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString()
        }
      ],
      portfolio: [
        {
          id: "impact-symphony",
          title: "IMPACT Symphony Project",
          composer: "Contemporary Composer",
          instrumentation: "Full Orchestra",
          project_type: ["score_engraving", "orchestration"],
          description: "Complete music engraving and orchestration for a modern symphony work featuring extended techniques and multimedia integration.",
          completion_year: 2024,
          image_urls: [],
          featured: true
        },
        {
          id: "chamber-collection",
          title: "Contemporary Chamber Works",
          composer: "Various Artists", 
          instrumentation: "Mixed Ensembles",
          project_type: ["score_engraving"],
          description: "Professional notation for a series of chamber music works featuring complex rhythmic structures and non-traditional notation.",
          completion_year: 2024,
          image_urls: [],
          featured: false
        },
        {
          id: "interactive-system",
          title: "Interactive Performance System",
          composer: "Electroacoustic Composer",
          instrumentation: "Electronics + Ensemble",
          project_type: ["audio_programming"],
          description: "Custom Max/MSP system for real-time audio processing and interactive score following in live performance.",
          completion_year: 2023,
          image_urls: [],
          featured: true
        }
      ],
      news: [
        {
          id: "zscore-launch",
          title: "ZSCORE Studio Launch",
          slug: "zscore-studio-launch",
          content: "We are excited to announce the official launch of ZSCORE, bringing professional music engraving services to composers and publishers worldwide.",
          content_html: `<div class="prose prose-lg max-w-none">
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg mb-8">
              <h2 class="text-3xl font-bold mb-6 text-gray-800">Welcome to ZSCORE Studio</h2>
              <p class="text-lg mb-6">We are thrilled to announce the official launch of ZSCORE Studio, a revolutionary platform bringing professional music engraving services to composers and publishers worldwide.</p>
            </div>
            
            <div class="grid md:grid-cols-2 gap-8 mb-8">
              <div class="bg-white p-6 rounded-lg shadow-sm border">
                <h3 class="text-xl font-semibold mb-4 text-blue-800">Professional Standards</h3>
                <ul class="space-y-3">
                  <li class="flex items-start">
                    <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">✓</span>
                    <div>Industry-leading notation quality</div>
                  </li>
                  <li class="flex items-start">
                    <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">✓</span>
                    <div>Publication-ready scores</div>
                  </li>
                  <li class="flex items-start">
                    <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">✓</span>
                    <div>Fast turnaround times</div>
                  </li>
                </ul>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-sm border">
                <h3 class="text-xl font-semibold mb-4 text-purple-800">Innovation</h3>
                <p class="text-gray-600">Our custom automation tools and modern workflow deliver exceptional results while maintaining the highest artistic standards.</p>
              </div>
            </div>
            
            <div class="text-center mt-8">
              <a href="#contact" class="inline-block bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition-colors font-semibold">Get Started Today</a>
            </div>
          </div>`,
          excerpt: "Professional music engraving services now available",
          category: "announcement",
          featured: true,
          publication_date: new Date().toISOString(),
          tags: ["launch", "announcement"],
          image_urls: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "new-automation-tools",
          title: "Advanced Automation Tools Released",
          content: "Our latest custom automation tools are now available, significantly reducing engraving time while maintaining the highest quality standards.",
          content_html: `<div class="prose prose-lg max-w-none">
            <div class="bg-gradient-to-r from-green-50 to-teal-50 p-8 rounded-lg mb-8">
              <h2 class="text-3xl font-bold mb-6 text-gray-800">Revolutionary Automation Tools</h2>
              <p class="text-lg mb-6">We're excited to unveil our latest suite of custom automation tools that revolutionize music engraving workflows.</p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-6 mb-8">
              <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
                <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span class="text-2xl">⚡</span>
                </div>
                <h3 class="text-xl font-semibold mb-3">50% Faster</h3>
                <p class="text-gray-600">Reduced processing time for complex scores</p>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
                <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span class="text-2xl">🎯</span>
                </div>
                <h3 class="text-xl font-semibold mb-3">Higher Accuracy</h3>
                <p class="text-gray-600">Advanced error detection and correction</p>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-sm border text-center">
                <div class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span class="text-2xl">🔧</span>
                </div>
                <h3 class="text-xl font-semibold mb-3">Smart Tools</h3>
                <p class="text-gray-600">AI-powered layout optimization</p>
              </div>
            </div>
          </div>`,
          excerpt: "Custom automation tools for faster, higher-quality engraving",
          category: "technology",
          featured: false,
          publication_date: new Date(Date.now() - 86400000).toISOString(),
          tags: ["technology", "automation"],
          image_urls: [],
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      settings: [{
        id: "main-settings",
        site_title: "ZSCORE",
        site_description: "Professional music engraving and audio programming services",
        site_keywords: "music engraving, score notation, audio programming, orchestration"
      }],
      brands: {
        section_title: "Trusted By",
        section_subtitle: "Prestigious institutions and organizations worldwide rely on ZSCORE for their most demanding projects",
        brands: [
          {
            name: "RUNDEL Verlag",
            logo: ""
          },
          {
            name: "SWR Symphonieorchester",
            logo: ""
          },
          {
            name: "WDR Symphony Orchestra",
            logo: ""
          },
          {
            name: "Mozarteum Universität",
            logo: ""
          }
        ]
      }
    };
  }

  /**
   * Save content to storage (blob storage in production, localStorage in development)
   * @param {string} contentType - The content type key
   * @param {Object|Array} data - The content data to save
   * @returns {Promise<boolean>} Success status
   */
  static async saveContent(contentType, data) {
    // Always try blob storage first in browser environment (for testing)
    if (typeof window !== 'undefined') {
      // Try blob storage (both development and production)
      try {
        console.log('Trying to save to blob storage:', { contentType, dataType: Array.isArray(data) ? 'array' : typeof data, itemCount: Array.isArray(data) ? data.length : Object.keys(data).length });
        await ContentManagerV2.saveContent(contentType, data);
        console.log('Blob storage save successful');
        return true;
      } catch (error) {
        console.warn('🔄 Blob storage save failed, falling back to localStorage:', error);
        // Fall through to localStorage as backup
      }
    }

    // Development or fallback: Use localStorage
    const STORAGE_KEY = 'zscore_cms_content';
    
    try {
      // Get existing data
      let existingData = {};
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        existingData = JSON.parse(storedData);
      }
      
      // Update the specific content type
      existingData[contentType] = data;
      
      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
      
      // Dispatch a custom event to notify components of data changes
      window.dispatchEvent(new CustomEvent('zscore-content-updated', {
        detail: { contentType, data }
      }));
      
      console.log(`Content saved for ${contentType}`);
      return true;
    } catch (error) {
      console.error(`Error saving content for ${contentType}:`, error);
      return false;
    }
  }

  /**
   * Save all content data to localStorage
   * @param {Object} allData - Complete content data object
   * @returns {Promise<boolean>} Success status
   */
  static async saveAllContent(allData) {
    const STORAGE_KEY = 'zscore_cms_content';
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
      console.log('All content saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving all content:', error);
      return false;
    }
  }

  /**
   * Update a specific content item within a content type
   * @param {string} contentType - The content type key (news, services, portfolio, etc.)
   * @param {string} itemId - The ID of the item to update
   * @param {Object} updatedItem - The updated item data
   * @returns {Promise<boolean>} Success status
   */
  static async updateContent(contentType, itemId, updatedItem) {
    try {
      // Get all current content
      const allContent = await this.getAllContent();
      
      // Ensure the content type exists
      if (!allContent[contentType]) {
        allContent[contentType] = [];
      }
      
      // Handle array vs object content types
      if (Array.isArray(allContent[contentType])) {
        // For array types (news, services, portfolio)
        const itemIndex = allContent[contentType].findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
          // Update existing item
          allContent[contentType][itemIndex] = { ...updatedItem };
        } else {
          // Add new item if not found
          allContent[contentType].push({ ...updatedItem });
        }
      } else {
        // For object types (about, settings)
        allContent[contentType] = { ...allContent[contentType], ...updatedItem };
      }
      
      // Save individual content type instead of entire site content
      const success = await this.saveContent(contentType, allContent[contentType]);
      
      if (success) {
        // Dispatch update event
        window.dispatchEvent(new CustomEvent('zscore-content-updated', {
          detail: { contentType, itemId, item: updatedItem }
        }));
      }
      
      return success;
    } catch (error) {
      console.error(`Error updating content for ${contentType}:`, error);
      return false;
    }
  }

  /**
   * Generate SEO-friendly slug from title
   * @param {string} title - The title to convert to slug
   * @returns {string} URL-friendly slug
   */
  static generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-'); // Remove leading/trailing hyphens
  }

  /**
   * Add a new content item to a content type
   * @param {string} contentType - The content type key
   * @param {Object} newItem - The new item data
   * @returns {Promise<boolean>} Success status
   */
  static async addContent(contentType, newItem) {
    try {
      // Generate ID if not provided
      if (!newItem.id) {
        newItem.id = `${contentType}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      }
      
      // Generate slug for news items
      if (contentType === 'news' && newItem.title && !newItem.slug) {
        newItem.slug = this.generateSlug(newItem.title);
        
        // Ensure slug is unique
        const allContent = await this.getAllContent();
        const existingItems = allContent[contentType] || [];
        let slugCounter = 1;
        let originalSlug = newItem.slug;
        
        while (existingItems.find(item => item.slug === newItem.slug)) {
          newItem.slug = `${originalSlug}-${slugCounter}`;
          slugCounter++;
        }
      }
      
      // Add timestamps
      newItem.created_at = new Date().toISOString();
      newItem.updated_at = new Date().toISOString();
      
      return await this.updateContent(contentType, newItem.id, newItem);
    } catch (error) {
      console.error(`Error adding content to ${contentType}:`, error);
      return false;
    }
  }

  /**
   * Delete a content item from a content type
   * @param {string} contentType - The content type key
   * @param {string} itemId - The ID of the item to delete
   * @returns {Promise<boolean>} Success status
   */
  static async deleteContent(contentType, itemId) {
    try {
      // Get all current content
      const allContent = await this.getAllContent();
      
      if (!allContent[contentType]) {
        return false;
      }
      
      if (Array.isArray(allContent[contentType])) {
        // For array types
        const itemIndex = allContent[contentType].findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
          allContent[contentType].splice(itemIndex, 1);
          
          // Save individual content type instead of entire site content
          const success = await this.saveContent(contentType, allContent[contentType]);
          
          if (success) {
            // Dispatch update event
            window.dispatchEvent(new CustomEvent('zscore-content-updated', {
              detail: { contentType, itemId, action: 'delete' }
            }));
          }
          
          return success;
        }
      }
      
      return false;
    } catch (error) {
      console.error(`Error deleting content from ${contentType}:`, error);
      return false;
    }
  }

  /**
   * Clear all stored content and reset to mock data
   * @returns {Promise<boolean>} Success status
   */
  static async clearStoredContent() {
    const STORAGE_KEY = 'zscore_cms_content';
    
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEY);
        console.log('All stored content cleared, reset to mock data');
        
        // Dispatch update event to refresh all components
        window.dispatchEvent(new CustomEvent('zscore-content-updated', {
          detail: { action: 'reset' }
        }));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing stored content:', error);
      return false;
    }
  }

  /**
   * Search content across all types
   * @param {string} query - Search query
   * @param {Array} contentTypes - Content types to search (optional)
   * @returns {Promise<Array>} Search results
   */
  static async searchContent(query, contentTypes = null) {
    const results = [];
    const typesToSearch = contentTypes || Object.keys(this.CONTENT_TYPES);
    
    for (const typeKey of typesToSearch) {
      try {
        const content = await this.loadContent(typeKey);
        const type = this.getContentType(typeKey);
        
        if (Array.isArray(content)) {
          const matches = content.filter(item => {
            const searchText = JSON.stringify(item).toLowerCase();
            return searchText.includes(query.toLowerCase());
          });
          
          matches.forEach(match => {
            results.push({
              type: type.name,
              typeKey: typeKey,
              item: match,
              relevance: this.calculateRelevance(match, query)
            });
          });
        }
      } catch (error) {
        console.error(`Error searching in ${typeKey}:`, error);
      }
    }
    
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Calculate search relevance score
   * @private
   * @param {Object} item - Content item
   * @param {string} query - Search query
   * @returns {number} Relevance score
   */
  static calculateRelevance(item, query) {
    const lowerQuery = query.toLowerCase();
    let score = 0;
    
    // Check title/name fields for exact matches
    if (item.title && item.title.toLowerCase().includes(lowerQuery)) {
      score += 10;
    }
    if (item.name && item.name.toLowerCase().includes(lowerQuery)) {
      score += 10;
    }
    
    // Check other text fields
    Object.values(item).forEach(value => {
      if (typeof value === 'string' && value.toLowerCase().includes(lowerQuery)) {
        score += 1;
      }
    });
    
    return score;
  }
}

export default ContentManager;