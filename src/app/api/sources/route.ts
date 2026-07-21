import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all audio sources
export async function GET() {
  try {
    const sources = await db.audioSource.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { audioItems: true } }
      }
    });
    
    // Mask sensitive fields for response
    const maskedSources = sources.map(source => ({
      ...source,
      driveApiKey: source.driveApiKey ? '***' : null,
      ftpPassword: source.ftpPassword ? '***' : null,
    }));
    
    return NextResponse.json({ success: true, data: maskedSources });
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}

// POST - Create new audio source
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, ...config } = body;
    
    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: 'Name and type are required' },
        { status: 400 }
      );
    }
    
    if (!['GOOGLE_DRIVE', 'FTP', 'LOCAL'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type must be GOOGLE_DRIVE, FTP, or LOCAL' },
        { status: 400 }
      );
    }
    
    const sourceData: Record<string, any> = { name, type };
    
    // Add type-specific configuration
    if (type === 'GOOGLE_DRIVE') {
      if (!config.driveFolderId) {
        return NextResponse.json(
          { success: false, error: 'Drive folder ID is required for Google Drive sources' },
          { status: 400 }
        );
      }
      sourceData.driveFolderId = config.driveFolderId;
      sourceData.driveApiKey = config.driveApiKey || '';
    } else if (type === 'FTP') {
      if (!config.ftpHost || !config.ftpUsername || !config.ftpPassword) {
        return NextResponse.json(
          { success: false, error: 'FTP host, username, and password are required' },
          { status: 400 }
        );
      }
      sourceData.ftpHost = config.ftpHost;
      sourceData.ftpPort = config.ftpPort || 21;
      sourceData.ftpUsername = config.ftpUsername;
      sourceData.ftpPassword = config.ftpPassword;
      sourceData.ftpBasePath = config.ftpBasePath || '/';
    } else if (type === 'LOCAL') {
      if (!config.localPath) {
        return NextResponse.json(
          { success: false, error: 'Local path is required for local sources' },
          { status: 400 }
        );
      }
      sourceData.localPath = config.localPath;
    }
    
    const source = await db.audioSource.create({
      data: sourceData
    });
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...source,
        driveApiKey: source.driveApiKey ? '***' : null,
        ftpPassword: source.ftpPassword ? '***' : null,
      }
    });
  } catch (error) {
    console.error('Error creating source:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create source' },
      { status: 500 }
    );
  }
}
