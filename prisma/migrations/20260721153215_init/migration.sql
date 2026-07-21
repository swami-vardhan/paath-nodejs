-- CreateTable
CREATE TABLE "AudioSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "driveFolderId" TEXT,
    "driveApiKey" TEXT,
    "ftpHost" TEXT,
    "ftpPort" INTEGER NOT NULL DEFAULT 21,
    "ftpUsername" TEXT,
    "ftpPassword" TEXT,
    "ftpBasePath" TEXT,
    "localPath" TEXT,
    "lastScannedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudioSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioItem" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "relativePath" TEXT NOT NULL,
    "parentId" TEXT,
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "duration" INTEGER,
    "mimeType" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistItem" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "audioItemId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AudioItem_sourceId_idx" ON "AudioItem"("sourceId");

-- CreateIndex
CREATE INDEX "AudioItem_parentId_idx" ON "AudioItem"("parentId");

-- CreateIndex
CREATE INDEX "AudioItem_type_idx" ON "AudioItem"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistItem_playlistId_audioItemId_key" ON "PlaylistItem"("playlistId", "audioItemId");

-- AddForeignKey
ALTER TABLE "AudioItem" ADD CONSTRAINT "AudioItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "AudioSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioItem" ADD CONSTRAINT "AudioItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AudioItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistItem" ADD CONSTRAINT "PlaylistItem_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistItem" ADD CONSTRAINT "PlaylistItem_audioItemId_fkey" FOREIGN KEY ("audioItemId") REFERENCES "AudioItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
