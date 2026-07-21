import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Browse library structure
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get('sourceId');
    const parentId = searchParams.get('parentId');
    const type = searchParams.get('type'); // Filter by type: BOOK, CHAPTER, CATEGORY, AUDIO
    const search = searchParams.get('search'); // Search query
    
    // Build where clause
    const whereClause: Record<string, any> = {};
    
    if (sourceId) {
      whereClause.sourceId = sourceId;
    }
    
    if (parentId !== null && parentId !== undefined) {
      if (parentId === 'null' || parentId === '') {
        whereClause.parentId = null;
      } else {
        whereClause.parentId = parentId;
      }
    } else {
      // Default to root level items
      whereClause.parentId = null;
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    if (search) {
      whereClause.name = { contains: search };
    }
    
    // Fetch items with children count
    const items = await db.audioItem.findMany({
      where: whereClause,
      orderBy: [
        { type: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      include: {
        _count: { select: { children: true } },
        source: {
          select: { id: true, name: true, type: true }
        }
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: items,
      count: items.length
    });
  } catch (error) {
    console.error('Error browsing library:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to browse library' },
      { status: 500 }
    );
  }
}
