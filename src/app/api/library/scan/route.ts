import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { readdir, stat, access } from 'fs/promises';
import { join, extname } from 'path';

// Supported audio formats
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.wma'];

// Check if file is an audio file
function isAudioFile(filename: string): boolean {
  const ext = extname(filename).toLowerCase();
  return AUDIO_EXTENSIONS.includes(ext);
}

// Get MIME type based on extension
function getMimeType(filename: string): string {
  const ext = extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.flac': 'audio/flac',
    '.aac': 'audio/aac',
    '.wma': 'audio/x-ms-wma',
  };
  return mimeTypes[ext] || 'audio/mpeg';
}

// Scan local directory and build library structure
async function scanLocalDirectory(
  sourceId: string,
  localPath: string,
  parentId: string | null = null,
  currentPath: string = '',
  depth: number = 0
): Promise<{ books: number; chapters: number; categories: number; audios: number }> {
  const stats = { books: 0, chapters: 0, categories: 0, audios: 0 };
  
  try {
    // Check if path exists and is accessible
    await access(localPath);
    
    const entries = await readdir(localPath, { withFileTypes: true });
    
    // Separate directories and files
    const directories = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));
    const files = entries.filter(e => e.isFile() && isAudioFile(e.name));
    
    // Determine structure type based on content
    const hasSubDirs = directories.length > 0;
    const hasAudioFiles = files.length > 0;
    
    // Process directories (could be books, chapters, or categories)
    for (const dir of directories) {
      const dirPath = join(localPath, dir.name);
      const relativePath = currentPath ? `${currentPath}/${dir.name}` : dir.name;
      
      let itemType: string;
      
      if (depth === 0) {
        // First level - determine if it's a book or category based on sub-content
        try {
          const subEntries = await readdir(dirPath, { withFileTypes: true });
          const hasNestedDirs = subEntries.some(e => e.isDirectory());
          const hasNestedAudio = subEntries.some(e => e.isFile() && isAudioFile(e.name));
          
          if (hasNestedDirs) {
            itemType = 'BOOK'; // Has subdirectories - treat as book with chapters
            stats.books++;
          } else if (hasNestedAudio) {
            itemType = 'CATEGORY'; // Only audio files - category
            stats.categories++;
          } else {
            itemType = 'CATEGORY'; // Default to category
            stats.categories++;
          }
        } catch {
          itemType = 'CATEGORY';
          stats.categories++;
        }
      } else if (depth === 1) {
        // Second level - typically chapters or sub-categories
        itemType = 'CHAPTER';
        stats.chapters++;
      } else {
        // Deeper levels
        itemType = 'CHAPTER';
        stats.chapters++;
      }
      
      // Create database entry for this directory
      const item = await db.audioItem.create({
        data: {
          sourceId,
          name: formatDisplayName(dir.name),
          type: itemType,
          path: dirPath,
          relativePath,
          parentId,
          sortOrder: 0,
        }
      });
      
      // Recursively scan subdirectory
      const childStats = await scanLocalDirectory(sourceId, dirPath, item.id, relativePath, depth + 1);
      stats.books += childStats.books;
      stats.chapters += childStats.chapters;
      stats.categories += childStats.categories;
      stats.audios += childStats.audios;
    }
    
    // Process audio files at current level
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = join(localPath, file.name);
      const relativePath = currentPath ? `${currentPath}/${file.name}` : file.name;
      
      try {
        const fileStat = await stat(filePath);
        
        await db.audioItem.create({
          data: {
            sourceId,
            name: formatDisplayName(file.name),
            type: 'AUDIO',
            path: filePath,
            relativePath,
            parentId,
            fileUrl: `/api/audio/stream?sourceId=${sourceId}&path=${encodeURIComponent(relativePath)}`,
            fileSize: fileStat.size,
            mimeType: getMimeType(file.name),
            sortOrder: i,
          }
        });
        stats.audios++;
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }
    
    // If we're at root level with only audio files (no folders), create a default category
    if (depth === 0 && !hasSubDirs && hasAudioFiles && !parentId) {
      const source = await db.audioSource.findUnique({ where: { id: sourceId } });
      await db.audioItem.create({
        data: {
          sourceId,
          name: source?.name || 'Audio Collection',
          type: 'CATEGORY',
          path: localPath,
          relativePath: '',
          parentId: null,
          sortOrder: 0,
        }
      });
      stats.categories++;
    }
    
  } catch (error) {
    console.error(`Error scanning directory ${localPath}:`, error);
  }
  
  return stats;
}

// Format display name (remove extensions, replace hyphens/underscores with spaces)
function formatDisplayName(name: string): string {
  return name
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[-_]/g, ' ')   // Replace hyphens and underscores
    .replace(/\b\w/g, l => l.toUpperCase()); // Title case
}

// POST - Trigger library scan for a specific source
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceId } = body;
    
    if (!sourceId) {
      return NextResponse.json(
        { success: false, error: 'Source ID is required' },
        { status: 400 }
      );
    }
    
    const source = await db.audioSource.findUnique({ where: { id: sourceId } });
    
    if (!source) {
      return NextResponse.json(
        { success: false, error: 'Source not found' },
        { status: 404 }
      );
    }
    
    if (!source.isActive) {
      return NextResponse.json(
        { success: false, error: 'Source is not active' },
        { status: 400 }
      );
    }
    
    // Clear existing items for this source
    await db.audioItem.deleteMany({ where: { sourceId } });
    
    let scanResult;
    
    // Scan based on source type
    if (source.type === 'LOCAL' && source.localPath) {
      scanResult = await scanLocalDirectory(sourceId, source.localPath);
    } else if (source.type === 'GOOGLE_DRIVE') {
      scanResult = await scanGoogleDrive(sourceId, source);
    } else if (source.type === 'FTP') {
      scanResult = await scanFTP(sourceId, source);
    } else {
      return NextResponse.json(
        { success: false, error: `Unsupported source type: ${source.type}` },
        { status: 400 }
      );
    }
    
    // Update last scanned timestamp
    await db.audioSource.update({
      where: { id: sourceId },
      data: { lastScannedAt: new Date() }
    });
    
    return NextResponse.json({
      success: true,
      message: `Library scanned successfully.`,
      ...scanResult
    });
  } catch (error) {
    console.error('Error scanning library:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to scan library: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// Placeholder for Google Drive scanning
async function scanGoogleDrive(sourceId: string, source: any): Promise<any> {
  // In production, implement with googleapis package
  console.log('Google Drive scanning for folder:', source.driveFolderId);
  return { books: 0, chapters: 0, categories: 0, audios: 0, note: 'Google Drive integration requires API setup' };
}

// Placeholder for FTP scanning
async function scanFTP(sourceId: string, source: any): Promise<any> {
  // In production, implement with basic-ftp package
  console.log('FTP scanning for:', source.ftpHost);
  return { books: 0, chapters: 0, categories: 0, audios: 0, note: 'FTP integration requires client setup' };
}
