import { NextResponse } from 'next/server';
import { uploadData, fetchData, DATA_KEYS } from '@/lib/blob-storage';

/**
 * GET /api/content
 * Fetch all website content from blob storage
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    console.log('API Content GET - Requested type:', type);

    // Map admin panel content types to DATA_KEYS
    const typeMapping = {
      'news': 'NEWS_ITEMS',
      'portfolio': 'PORTFOLIO_ITEMS', 
      'about': 'ABOUT_CONTENT',
      'services': 'SERVICES',
      'categories': 'CATEGORIES',
      'site_settings': 'SITE_SETTINGS',
      'hero_content': 'HERO_CONTENT',
      'contact_content': 'CONTACT_CONTENT'
    };

    if (type) {
      const mappedType = typeMapping[type] || type.toUpperCase();
      const dataKey = DATA_KEYS[mappedType];
      
      if (dataKey) {
        // Fetch specific content type
      console.log('Fetching from blob storage:', { type, dataKey });
      
      const data = await fetchData(dataKey);
      console.log('Fetched data result:', { type, hasData: !!data, dataKeys: data ? Object.keys(data) : null });
      
      return NextResponse.json({
        success: true,
        data: data || getDefaultData(type),
        source: data ? 'blob' : 'default',
      });
      }
    }

    // Fetch all content as individual files
    console.log('Fetching all content from individual blob files...');
    let allContent = {};
    
    for (const [key, dataKey] of Object.entries(DATA_KEYS)) {
      try {
        console.log(`📥 Fetching ${key} from ${dataKey}...`);
        const data = await fetchData(dataKey);
        allContent[key.toLowerCase()] = data || getDefaultData(key.toLowerCase());
        console.log(`${data ? 'FOUND' : 'DEFAULT'} ${key}: ${data ? 'found in blob' : 'using default'}`);
      } catch (error) {
        console.warn(`Failed to fetch ${key}:`, error.message);
        allContent[key.toLowerCase()] = getDefaultData(key.toLowerCase());
      }
    }

    console.log('📦 All content fetched:', Object.keys(allContent));

    return NextResponse.json({
      success: true,
      data: allContent,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Content fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch content',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/content
 * Save content to blob storage
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log('API Content POST - Received:', { 
      type, 
      dataKeys: Object.keys(data || {}),
      dataSize: JSON.stringify(data).length,
      hasCircular: checkForCircularReferences(data)
    });

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type and data are required' },
        { status: 400 }
      );
    }

    // Map admin panel content types to DATA_KEYS
    const typeMapping = {
      'news': 'NEWS_ITEMS',
      'portfolio': 'PORTFOLIO_ITEMS', 
      'about': 'ABOUT_CONTENT',
      'services': 'SERVICES',
      'categories': 'CATEGORIES',
      'site_settings': 'SITE_SETTINGS',
      'hero_content': 'HERO_CONTENT',
      'contact_content': 'CONTACT_CONTENT'
    };

    const mappedType = typeMapping[type] || type.toUpperCase();
    const dataKey = DATA_KEYS[mappedType];
    
    if (!dataKey) {
      console.log('Invalid content type:', type, 'Mapped to:', mappedType, 'Available keys:', Object.keys(DATA_KEYS));
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // Add metadata - handle arrays vs objects differently
    let enrichedData;
    if (Array.isArray(data)) {
      // For arrays, don't spread - preserve array structure
      enrichedData = [...data]; // Copy the array
      // Add metadata as properties on the array object (arrays are objects in JS)
      enrichedData.lastUpdated = new Date().toISOString();
      enrichedData.version = (data.version || 0) + 1;
    } else {
      // For objects, spread normally
      enrichedData = {
        ...data,
        lastUpdated: new Date().toISOString(),
        version: (data.version || 0) + 1,
      };
    }

    console.log('Saving to blob storage:', { 
      dataKey, 
      type, 
      dataSize: JSON.stringify(enrichedData).length,
      token: process.env.BLOB_READ_WRITE_TOKEN ? 'present' : 'missing'
    });

    // Upload to blob storage
    const result = await uploadData(dataKey, enrichedData);

    console.log('Blob storage save result:', result);

    return NextResponse.json({
      success: true,
      result,
      message: `${type} content saved successfully`,
    });

  } catch (error) {
    console.error('Content save error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { 
        error: 'Failed to save content',
        details: error.message,
        type: error.name
      },
      { status: 500 }
    );
  }
}

// Helper function to check for circular references
function checkForCircularReferences(obj, seen = new WeakSet()) {
  if (obj !== null && typeof obj === 'object') {
    if (seen.has(obj)) {
      return true;
    }
    seen.add(obj);
    for (let key in obj) {
      if (checkForCircularReferences(obj[key], seen)) {
        return true;
      }
    }
    seen.delete(obj);
  }
  return false;
}

/**
 * Default data fallbacks
 */
function getDefaultData(type) {
  switch (type.toLowerCase()) {
    case 'site_content':
      return {
        lastUpdated: new Date().toISOString(),
        version: 1,
        news: [],
        portfolio: [],
        services: [],
      };
    
    case 'news_items':
      return [];
    
    case 'portfolio_items':
      return [];
    
    case 'services':
      return [];
    
    case 'categories':
      return {
        services: [],
        portfolio: [],
        news: [],
        technologies: [],
      };
    
    case 'site_settings':
      return {
        lastUpdated: new Date().toISOString(),
        version: 1,
      };
    
    case 'about_content':
      return {
        lastUpdated: new Date().toISOString(),
        version: 1,
      };
    
    case 'hero_content':
      return {
        lastUpdated: new Date().toISOString(),
        version: 1,
      };
    
    case 'contact_content':
      return {
        lastUpdated: new Date().toISOString(),
        version: 1,
      };
    
    default:
      return {
        lastUpdated: new Date().toISOString(),
        version: 1,
      };
  }
}