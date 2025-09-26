/**
 * Data Migration Script
 * Migrates existing localStorage data to Vercel Blob Storage
 */

import { getAllContent, saveContent } from '@/lib/content-manager-v2';

/**
 * Migrate localStorage data to blob storage
 */
export async function migrateLocalStorageToBlob() {
  if (typeof window === 'undefined') {
    console.log('Migration must be run in browser environment');
    return;
  }

  try {
    console.log('🚀 Starting data migration to blob storage...');

    // Check for existing localStorage data
    const STORAGE_KEY = 'zscore_cms_content';
    const storedData = localStorage.getItem(STORAGE_KEY);

    if (!storedData) {
      console.log('✅ No localStorage data found, migration not needed');
      return;
    }

    const localData = JSON.parse(storedData);
    console.log('📦 Found localStorage data:', Object.keys(localData));

    // Migrate each content type
    const migrationResults = [];
    
    for (const [contentType, data] of Object.entries(localData)) {
      try {
        console.log(`📝 Migrating ${contentType}...`);
        await saveContent(contentType, data);
        migrationResults.push({ contentType, status: 'success' });
        console.log(`✅ ${contentType} migrated successfully`);
      } catch (error) {
        console.error(`❌ Failed to migrate ${contentType}:`, error);
        migrationResults.push({ 
          contentType, 
          status: 'error', 
          error: error.message 
        });
      }
    }

    // Summary
    const successful = migrationResults.filter(r => r.status === 'success');
    const failed = migrationResults.filter(r => r.status === 'error');

    console.log(`🎉 Migration complete!`);
    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);

    if (failed.length > 0) {
      console.log('Failed migrations:', failed);
    }

    // Optionally backup localStorage
    if (successful.length > 0) {
      const backupKey = `${STORAGE_KEY}_backup_${Date.now()}`;
      localStorage.setItem(backupKey, storedData);
      console.log(`💾 Created backup at: ${backupKey}`);
    }

    return {
      successful: successful.length,
      failed: failed.length,
      results: migrationResults
    };

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

/**
 * Initialize blob storage with default data
 */
export async function initializeBlobStorage() {
  try {
    console.log('🔧 Initializing blob storage with default data...');

    // Check if data already exists
    const existingData = await getAllContent();
    
    if (existingData && Object.keys(existingData).length > 0) {
      console.log('✅ Blob storage already has data, skipping initialization');
      return existingData;
    }

    // Get default data structure
    const defaultData = getDefaultData();
    
    // Save each content type
    for (const [contentType, data] of Object.entries(defaultData)) {
      try {
        await saveContent(contentType, data);
        console.log(`✅ Initialized ${contentType}`);
      } catch (error) {
        console.error(`❌ Failed to initialize ${contentType}:`, error);
      }
    }

    console.log('🎉 Blob storage initialized successfully');
    return defaultData;

  } catch (error) {
    console.error('💥 Initialization failed:', error);
    throw error;
  }
}

/**
 * Verify blob storage connectivity
 */
export async function verifyBlobStorage() {
  try {
    console.log('🔍 Verifying blob storage connectivity...');

    // Test by trying to fetch content
    const testData = await getAllContent();
    
    if (testData) {
      console.log('✅ Blob storage is accessible');
      console.log('📊 Available content types:', Object.keys(testData));
      return true;
    } else {
      console.log('⚠️ Blob storage returned no data');
      return false;
    }

  } catch (error) {
    console.error('❌ Blob storage verification failed:', error);
    return false;
  }
}

/**
 * Default data structure for initialization
 */
function getDefaultData() {
  return {
    site_content: {
      lastUpdated: new Date().toISOString(),
      version: 1,
      news: [],
      portfolio: [],
      services: [],
    },
    news_items: [],
    portfolio_items: [],
    services: [],
    categories: {
      services: [
        { id: 'engraving', label: 'Engraving', color: 'blue' },
        { id: 'orchestration', label: 'Orchestration', color: 'purple' },
        { id: 'automation', label: 'Automation', color: 'green' },
      ],
      portfolio: [
        { id: 'score_engraving', label: 'Score Engraving', color: 'blue' },
        { id: 'audio_programming', label: 'Audio Programming', color: 'green' },
        { id: 'orchestration', label: 'Orchestration', color: 'purple' },
      ],
      news: [
        { id: 'announcement', label: 'Announcement', color: 'blue' },
        { id: 'project_update', label: 'Project Update', color: 'green' },
        { id: 'technology', label: 'Technology', color: 'purple' },
      ],
      technologies: [
        { id: 'sibelius', label: 'Sibelius', color: 'blue' },
        { id: 'finale', label: 'Finale', color: 'green' },
        { id: 'dorico', label: 'Dorico', color: 'purple' },
      ],
    },
    site_settings: {
      site_title: "ZSCORE Studio",
      site_description: "Professional music engraving and audio programming services",
      site_keywords: "music engraving, score notation, audio programming, orchestration",
      lastUpdated: new Date().toISOString(),
      version: 1,
    },
    about_content: {
      section_title: "About ZSCORE",
      section_subtitle: "Professional music engraving services",
      philosophy_paragraphs: [
        "ZSCORE emerged from a fundamental need within the contemporary music community: professional engraving services that maintain technical precision while respecting artistic intent.",
        "Our approach combines traditional music engraving expertise with cutting-edge automation tools.",
        "We are partners to composers, publishers, and ensembles worldwide, ensuring that complex contemporary works are presented with clarity."
      ],
      lastUpdated: new Date().toISOString(),
      version: 1,
    },
    hero_content: {
      title: "ZSCORE Studio", 
      subtitle: "Professional Music Engraving",
      background_type: "color",
      background_color: "#000000",
      text_color: "#ffffff",
      lastUpdated: new Date().toISOString(),
      version: 1,
    },
    contact_content: {
      lastUpdated: new Date().toISOString(),
      version: 1,
    },
  };
}