import { NextResponse } from 'next/server';
import * as ContentManager from '@/lib/content-manager-clean';

/**
 * API endpoint to load content with HTML for client-side components
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('type');
    const itemId = searchParams.get('id');
    
    if (!contentType || !itemId) {
      return NextResponse.json(
        { success: false, error: 'Missing type or id parameter' },
        { status: 400 }
      );
    }
    
    const itemWithHTML = await ContentManager.getContentWithHTML(contentType, itemId);
    
    return NextResponse.json({
      success: true,
      data: itemWithHTML
    });
    
  } catch (error) {
    console.error('Error loading content with HTML:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}