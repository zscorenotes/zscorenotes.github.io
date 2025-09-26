import { NextResponse } from 'next/server';
import { uploadImage, uploadImages } from '@/lib/blob-storage';

/**
 * POST /api/upload
 * Handle image uploads to Vercel Blob Storage
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    const folder = formData.get('folder') || 'images';

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
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Upload failed',
        details: error.message 
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

    const { listFiles } = await import('@/lib/blob-storage');
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