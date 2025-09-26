import { NextResponse } from 'next/server';
import { getAllContentFromGitHub, saveContentToGitHub } from '@/lib/github-storage';

/**
 * Clean Content API - Simple, consistent data handling
 */

const CONTENT_FILES = ['news', 'services', 'portfolio', 'about', 'settings', 'categories'];

/**
 * GET - Fetch all content
 */
export async function GET() {
  try {
    const allContent = await getAllContentFromGitHub();
    
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
    
    const success = await saveContentToGitHub(type, data);
    
    if (!success) {
      throw new Error('Failed to save to GitHub');
    }
    
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

// GitHub storage functions are now in @/lib/github-storage