import { NextResponse } from 'next/server';
import { del, list } from '@vercel/blob';

export async function POST() {
  try {
    console.log('Clearing all data from blob storage...');
    
    // List all blobs first
    const blobs = await list();
    console.log('Found blobs:', blobs.blobs.map(b => b.pathname));
    
    // Delete all blobs
    for (const blob of blobs.blobs) {
      try {
        console.log('Deleting:', blob.url);
        await del(blob.url);
        console.log('Successfully deleted:', blob.pathname);
      } catch (error) {
        console.error('Failed to delete:', blob.pathname, error);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `All data cleared from blob storage - deleted ${blobs.blobs.length} files`
    });
    
  } catch (error) {
    console.error('Failed to clear data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to clear data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}