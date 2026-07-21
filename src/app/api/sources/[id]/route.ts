import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET single source
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const source = await db.audioSource.findUnique({
      where: { id },
      include: {
        _count: { select: { audioItems: true } }
      }
    });
    
    if (!source) {
      return NextResponse.json(
        { success: false, error: 'Source not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...source,
        driveApiKey: source.driveApiKey ? '***' : null,
        ftpPassword: source.ftpPassword ? '***' : null,
      }
    });
  } catch (error) {
    console.error('Error fetching source:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch source' },
      { status: 500 }
    );
  }
}

// PUT - Update source
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const existingSource = await db.audioSource.findUnique({ where: { id } });
    if (!existingSource) {
      return NextResponse.json(
        { success: false, error: 'Source not found' },
        { status: 404 }
      );
    }
    
    const updateData: Record<string, any> = {};
    
    // Update basic fields if provided
    if (body.name !== undefined) updateData.name = body.name;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    
    // Update type-specific fields
    if (existingSource.type === 'GOOGLE_DRIVE') {
      if (body.driveFolderId !== undefined) updateData.driveFolderId = body.driveFolderId;
      if (body.driveApiKey !== undefined && body.driveApiKey !== '***') {
        updateData.driveApiKey = body.driveApiKey;
      }
    } else if (existingSource.type === 'FTP') {
      if (body.ftpHost !== undefined) updateData.ftpHost = body.ftpHost;
      if (body.ftpPort !== undefined) updateData.ftpPort = body.ftpPort;
      if (body.ftpUsername !== undefined) updateData.ftpUsername = body.ftpUsername;
      if (body.ftpPassword !== undefined && body.ftpPassword !== '***') {
        updateData.ftpPassword = body.ftpPassword;
      }
      if (body.ftpBasePath !== undefined) updateData.ftpBasePath = body.ftpBasePath;
    } else if (existingSource.type === 'LOCAL') {
      if (body.localPath !== undefined) updateData.localPath = body.localPath;
    }
    
    const source = await db.audioSource.update({
      where: { id },
      data: updateData
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
    console.error('Error updating source:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update source' },
      { status: 500 }
    );
  }
}

// DELETE source
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existingSource = await db.audioSource.findUnique({ where: { id } });
    
    if (!existingSource) {
      return NextResponse.json(
        { success: false, error: 'Source not found' },
        { status: 404 }
      );
    }
    
    // Delete all associated audio items first
    await db.audioItem.deleteMany({ where: { sourceId: id } });
    
    // Delete the source
    await db.audioSource.delete({ where: { id } });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Source deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting source:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete source' },
      { status: 500 }
    );
  }
}
