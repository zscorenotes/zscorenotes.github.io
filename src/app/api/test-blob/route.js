import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if blob token is available
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'BLOB_READ_WRITE_TOKEN environment variable not set',
        available: false,
      });
    }

    // Try to import Vercel blob functions
    const { list } = await import('@vercel/blob');
    
    // Try a simple list operation
    const result = await list();
    
    return NextResponse.json({
      success: true,
      message: 'Blob storage is accessible',
      blobCount: result.blobs.length,
      available: true,
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      available: false,
    }, { status: 500 });
  }
}