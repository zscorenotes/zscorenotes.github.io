import { NextResponse } from 'next/server';
import { fetchData, uploadData, DATA_KEYS } from '@/lib/blob-storage';

/**
 * POST /api/migrate-data
 * Migrate data from the old nested site-content.json structure to individual files
 */
export async function POST() {
  try {
    console.log('Starting data migration from nested structure to individual files...');
    
    // Fetch the old nested site-content
    const siteContent = await fetchData(DATA_KEYS.SITE_CONTENT);
    
    if (!siteContent) {
      return NextResponse.json({
        success: false,
        error: 'No site-content found to migrate'
      });
    }
    
    console.log('Found site-content with keys:', Object.keys(siteContent));
    
    const migrationResults = [];
    
    // Check if there's nested site_content structure
    const dataToMigrate = siteContent.site_content || siteContent;
    
    // Map of content types to migrate
    const contentTypeMapping = {
      'services': 'SERVICES',
      'news': 'NEWS_ITEMS', 
      'portfolio': 'PORTFOLIO_ITEMS',
      'about': 'ABOUT_CONTENT',
      'settings': 'SITE_SETTINGS',
      'hero': 'HERO_CONTENT',
      'contact': 'CONTACT_CONTENT',
      'categories': 'CATEGORIES'
    };
    
    // Migrate each content type to its individual file
    for (const [contentKey, dataKeyName] of Object.entries(contentTypeMapping)) {
      try {
        const data = dataToMigrate[contentKey];
        
        if (data !== undefined) {
          const dataKey = DATA_KEYS[dataKeyName];
          
          if (dataKey) {
            console.log(`Migrating ${contentKey} to ${dataKey}...`);
            
            // Add metadata if it doesn't exist
            const enrichedData = Array.isArray(data) ? data : {
              ...data,
              lastUpdated: new Date().toISOString(),
              version: (data.version || 0) + 1,
            };
            
            await uploadData(dataKey, enrichedData);
            
            migrationResults.push({
              contentType: contentKey,
              dataKey,
              status: 'success',
              itemCount: Array.isArray(data) ? data.length : 1
            });
            
            console.log(`Successfully migrated ${contentKey}`);
          } else {
            migrationResults.push({
              contentType: contentKey,
              status: 'skipped',
              reason: 'No matching data key'
            });
          }
        } else {
          migrationResults.push({
            contentType: contentKey,
            status: 'skipped', 
            reason: 'No data found'
          });
        }
      } catch (error) {
        console.error(`Failed to migrate ${contentKey}:`, error);
        migrationResults.push({
          contentType: contentKey,
          status: 'error',
          error: error.message
        });
      }
    }
    
    const successful = migrationResults.filter(r => r.status === 'success');
    const failed = migrationResults.filter(r => r.status === 'error');
    
    console.log(`Migration complete: ${successful.length} successful, ${failed.length} failed`);
    
    return NextResponse.json({
      success: true,
      message: `Migration completed: ${successful.length} successful, ${failed.length} failed`,
      results: migrationResults,
      summary: {
        total: migrationResults.length,
        successful: successful.length,
        failed: failed.length,
        skipped: migrationResults.filter(r => r.status === 'skipped').length
      }
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * GET /api/migrate-data
 * Check migration status and what data is available
 */
export async function GET() {
  try {
    const siteContent = await fetchData(DATA_KEYS.SITE_CONTENT);
    
    const status = {
      hasSiteContent: !!siteContent,
      hasNestedStructure: !!(siteContent && siteContent.site_content),
      siteContentKeys: siteContent ? Object.keys(siteContent) : [],
      nestedKeys: siteContent && siteContent.site_content ? Object.keys(siteContent.site_content) : []
    };
    
    // Check individual files
    const individualFiles = {};
    for (const [key, dataKey] of Object.entries(DATA_KEYS)) {
      try {
        const data = await fetchData(dataKey);
        individualFiles[key.toLowerCase()] = {
          exists: !!data,
          itemCount: Array.isArray(data) ? data.length : (data ? Object.keys(data).length : 0)
        };
      } catch (error) {
        individualFiles[key.toLowerCase()] = { exists: false, error: error.message };
      }
    }
    
    return NextResponse.json({
      success: true,
      status,
      individualFiles,
      recommendation: status.hasNestedStructure ? 'Migration needed' : 'Migration not needed'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}