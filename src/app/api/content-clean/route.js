import { NextResponse } from 'next/server';
import * as ContentManager from '@/lib/content-manager-clean';

/**
 * Clean Content API - Simple, consistent data handling
 */

const CONTENT_FILES = ['news', 'services', 'portfolio', 'about', 'settings', 'categories'];

/**
 * GET - Fetch all content
 */
export async function GET() {
  try {
    // Use content manager which handles local vs GitHub storage automatically
    const allContent = await ContentManager.getAllContent();
    
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
    const body = await request.json();
    
    // Handle different types of operations
    if (body.operation === 'updateItem') {
      const { contentType, itemId, item } = body;
      console.log(`🔄 API: Updating ${contentType} item ${itemId}`);
      
      const result = await ContentManager.updateItem(contentType, itemId, item);
      
      return NextResponse.json({
        success: !!result,
        data: result
      });
    } else if (body.operation === 'addItem') {
      const { contentType, item } = body;
      console.log(`🔄 API: Adding ${contentType} item`);
      
      const result = await ContentManager.addItem(contentType, item);
      
      return NextResponse.json({
        success: !!result,
        data: result
      });
    } else if (body.operation === 'deleteItem') {
      const { contentType, itemId } = body;
      console.log(`🔄 API: Deleting ${contentType} item ${itemId}`);
      
      const result = await ContentManager.deleteItem(contentType, itemId);
      
      return NextResponse.json({
        success: result
      });
    } else {
      // Legacy bulk save operation
      const { type, data } = body;
      
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
      
      // Use content manager which handles local vs GitHub storage automatically
      const success = await ContentManager.saveContent(type, data);
      
      if (!success) {
        throw new Error('Failed to save content');
      }
      
      return NextResponse.json({
        success: true,
        message: `${type} saved successfully`
      });
    }
    
  } catch (error) {
    console.error('Content operation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

// GitHub storage functions are now in @/lib/github-storage