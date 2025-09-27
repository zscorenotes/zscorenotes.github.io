import { NextResponse } from 'next/server';
import { uploadImage, uploadImages } from '@/lib/image-storage';

/**
 * POST /api/upload
 * Handle image uploads to Vercel Blob Storage
 */
export async function POST(request) {
  try {
    console.log('=== UPLOAD REQUEST START ===');
    const formData = await request.formData();
    const files = formData.getAll('files');
    const folder = formData.get('folder') || 'images';
    
    console.log('Upload request details:', {
      fileCount: files.length,
      files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
      folder,
      hasGitHubToken: !!process.env.GITHUB_TOKEN
    });

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Handle single file upload
    if (files.length === 1) {
      const file = files[0];
      
      if (!file || !file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'File must be an image' },
          { status: 400 }
        );
      }

      const result = await uploadImage(file, folder);
      
      return NextResponse.json({
        success: true,
        ...result,
        message: 'Image uploaded successfully',
      });
    }

    // Handle multiple file uploads
    const results = await uploadImages(files, folder);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
      },
      message: `Uploaded ${successful.length} of ${results.length} images`,
    });

  } catch (error) {
    console.error('Upload error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      error: error
    });
    
    return NextResponse.json(
      { 
        error: error.message || 'Upload failed',
        details: error.stack || 'No additional details available',
        type: error.name || 'UnknownError'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload
 * List uploaded files
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'images';

    const { listFiles } = await import('@/lib/image-storage');
    const files = await listFiles(folder);

    return NextResponse.json({
      success: true,
      files,
      count: files.length,
    });

  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to list files',
        details: error.message 
      },
      { status: 500 }
    );
  }
}