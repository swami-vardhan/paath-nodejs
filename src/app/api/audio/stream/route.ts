import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { readFile, stat, access } from 'fs/promises';
import { join } from 'path';

// GET - Stream audio file
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get('sourceId');
    const filePath = searchParams.get('path');
    
    if (!sourceId || !filePath) {
      return NextResponse.json(
        { success: false, error: 'Source ID and path are required' },
        { status: 400 }
      );
    }
    
    // Get source configuration
    const source = await db.audioSource.findUnique({ where: { id: sourceId } });
    
    if (!source) {
      return NextResponse.json(
        { success: false, error: 'Source not found' },
        { status: 404 }
      );
    }
    
    let fullPath: string;
    let mimeType = 'audio/mpeg';
    
    if (source.type === 'LOCAL' && source.localPath) {
      // Construct full path for local files
      fullPath = join(source.localPath, decodeURIComponent(filePath));
      
      // Check if file exists
      try {
        await access(fullPath);
      } catch {
        return NextResponse.json(
          { success: false, error: 'Audio file not found' },
          { status: 404 }
        );
      }
      
      // Get file stats
      const fileStat = await stat(fullPath);
      const fileSize = fileStat.size;
      
      // Determine MIME type
      const ext = fullPath.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        ogg: 'audio/ogg',
        m4a: 'audio/mp4',
        flac: 'audio/flac',
        aac: 'audio/aac',
        wma: 'audio/x-ms-wma',
      };
      mimeType = mimeTypes[ext || ''] || 'audio/mpeg';
      
      // Handle range requests for seeking
      const range = request.headers.get('range');
      
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;
        
        const fileBuffer = await readFile(fullPath);
        const audioChunk = fileBuffer.slice(start, end + 1);
        
        return new NextResponse(audioChunk, {
          status: 206,
          headers: {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize.toString(),
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=3600',
          }
        });
      }
      
      // No range request - send entire file
      const fileBuffer = await readFile(fullPath);
      
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Length': fileSize.toString(),
          'Content-Type': mimeType,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-size=3600',
        }
      });
      
    } else if (source.type === 'GOOGLE_DRIVE') {
      // For Google Drive, redirect to direct link or proxy
      // In production, you would use googleapis to get a direct download URL
      return NextResponse.json(
        { success: false, error: 'Google Drive streaming not yet implemented' },
        { status: 501 }
      );
    } else if (source.type === 'FTP') {
      // For FTP, stream through proxy
      // In production, you would use basic-ftp to download and stream
      return NextResponse.json(
        { success: false, error: 'FTP streaming not yet implemented' },
        { status: 501 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported source type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error streaming audio:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to stream audio' },
      { status: 500 }
    );
  }
}
