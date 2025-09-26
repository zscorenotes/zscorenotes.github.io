import { NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

/**
 * Clean Content API - Simple, consistent data handling
 */

const CONTENT_FILES = ['news', 'services', 'portfolio', 'about', 'settings', 'categories'];

/**
 * GET - Fetch all content
 */
export async function GET() {
  try {
    const allContent = {};
    
    for (const contentType of CONTENT_FILES) {
      try {
        const data = await fetchContentFile(contentType);
        allContent[contentType] = data;
      } catch (error) {
        console.warn(`No data found for ${contentType}:`, error.message);
        allContent[contentType] = getDefaultData(contentType);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: allContent
    });
    
  } catch (error) {
    console.error('Content fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

/**
 * POST - Save content
 */
export async function POST(request) {
  try {
    const { type, data } = await request.json();
    
    if (!type || data === undefined) {
      return NextResponse.json(
        { success: false, error: 'Type and data are required' },
        { status: 400 }
      );
    }
    
    if (!CONTENT_FILES.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid content type: ${type}` },
        { status: 400 }
      );
    }
    
    await saveContentFile(type, data);
    
    return NextResponse.json({
      success: true,
      message: `${type} saved successfully`
    });
    
  } catch (error) {
    console.error('Content save error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save content' },
      { status: 500 }
    );
  }
}

/**
 * Fetch content file from blob storage
 */
async function fetchContentFile(contentType) {
  const filename = `clean-data/${contentType}.json`;
  
  const blobs = await list({ prefix: filename });
  if (blobs.blobs.length === 0) {
    throw new Error(`No file found: ${filename}`);
  }
  
  const response = await fetch(blobs.blobs[0].url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Save content file to blob storage
 */
async function saveContentFile(contentType, data) {
  const filename = `clean-data/${contentType}.json`;
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  await put(filename, blob, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    allowOverwrite: true
  });
}

/**
 * Get default data for content type
 */
function getDefaultData(contentType) {
  switch (contentType) {
    case 'news':
    case 'services':
    case 'portfolio':
      return [];
    
    case 'about':
    case 'settings':
      return { updated_at: new Date().toISOString() };
    
    case 'categories':
      return {
        services: [],
        portfolio: [],
        news: [],
        updated_at: new Date().toISOString()
      };
    
    default:
      return {};
  }
}