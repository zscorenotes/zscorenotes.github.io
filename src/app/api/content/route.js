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

    if (type && DATA_KEYS[type.toUpperCase()]) {
      // Fetch specific content type
      const data = await fetchData(DATA_KEYS[type.toUpperCase()]);
      return NextResponse.json({
        success: true,
        data: data || getDefaultData(type),
        source: data ? 'blob' : 'default',
      });
    }

    // Fetch all content
    const allContent = {};
    
    for (const [key, dataKey] of Object.entries(DATA_KEYS)) {
      try {
        const data = await fetchData(dataKey);
        allContent[key.toLowerCase()] = data || getDefaultData(key.toLowerCase());
      } catch (error) {
        console.warn(`Failed to fetch ${key}:`, error.message);
        allContent[key.toLowerCase()] = getDefaultData(key.toLowerCase());
      }
    }

    return NextResponse.json({
      success: true,
      data: allContent,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Content fetch error:', error);
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

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type and data are required' },
        { status: 400 }
      );
    }

    const dataKey = DATA_KEYS[type.toUpperCase()];
    if (!dataKey) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // Add metadata
    const enrichedData = {
      ...data,
      lastUpdated: new Date().toISOString(),
      version: (data.version || 0) + 1,
    };

    // Upload to blob storage
    const result = await uploadData(dataKey, enrichedData);

    return NextResponse.json({
      success: true,
      result,
      message: `${type} content saved successfully`,
    });

  } catch (error) {
    console.error('Content save error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save content',
        details: error.message 
      },
      { status: 500 }
    );
  }
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
        site_title: "ZSCORE Studio",
        site_description: "Professional music engraving and audio programming services",
        site_keywords: "music engraving, score notation, audio programming, orchestration",
        lastUpdated: new Date().toISOString(),
        version: 1,
      };
    
    case 'about_content':
      return {
        section_title: "About ZSCORE",
        section_subtitle: "Professional music engraving services",
        philosophy_paragraphs: [],
        lastUpdated: new Date().toISOString(),
        version: 1,
      };
    
    case 'hero_content':
      return {
        title: "ZSCORE Studio", 
        subtitle: "Professional Music Engraving",
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