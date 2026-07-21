'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAudioStore, AudioItem, AudioSource } from '@/lib/audio-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Icons
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Music,
  BookOpen,
  FolderTree,
  Settings,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Home,
  ChevronRight,
  Search,
  Heart,
  ListMusic,
  HardDrive,
  Cloud,
  Server,
  X,
  Loader2,
  Circle
} from 'lucide-react';

// ============ AUDIO PLAYER COMPONENT ============
function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    queue,
    queueIndex,
    setCurrentTrack,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    playNext,
    playPrevious,
  } = useAudioStore();

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (queueIndex < queue.length - 1) {
      playNext();
    } else {
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
  };

  const formatTime = (time: number): string => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-maroon via-maroon/95 to-maroon/90 border-t border-saffron/30 shadow-2xl">
      <audio
        ref={audioRef}
        src={currentTrack.fileUrl || ''}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => toast.error('Error loading audio file')}
        preload="metadata"
      />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
        {/* Track Info & Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Track Info */}
          <div className="hidden sm:block min-w-[200px] max-w-[250px]">
            <p className="text-white font-medium truncate text-sm">
              {currentTrack.name}
            </p>
            <p className="text-saffron-light text-xs truncate opacity-80">
              {currentTrack.source?.name || 'Unknown Source'}
            </p>
          </div>
          
          {/* Main Controls */}
          <div className="flex-1 flex flex-col items-center gap-1">
            {/* Control Buttons */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={playPrevious}
                disabled={queueIndex <= 0}
                className="text-white hover:text-saffron hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
              >
                <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              
              <Button
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-saffron hover:bg-saffron-dark text-white h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Play className="h-5 w-5 sm:h-6 sm:w-6 ml-0.5" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={playNext}
                disabled={queueIndex >= queue.length - 1}
                className="text-white hover:text-saffron hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
              >
                <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full flex items-center gap-2">
              <span className="text-xs text-saffron-light min-w-[35px] text-right hidden sm:block">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="audio-progress flex-1"
              />
              <span className="text-xs text-saffron-light min-w-[35px] hidden sm:block">
                {formatTime(duration)}
              </span>
            </div>
          </div>
          
          {/* Volume Control */}
          <div className="hidden md:flex items-center gap-2 min-w-[120px] justify-end">
            <Volume2 className="h-4 w-4 text-saffron-light" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="audio-progress w-20"
            />
          </div>
          
          {/* Mobile Track Info */}
          <div className="sm:hidden min-w-[100px]">
            <p className="text-white font-medium truncate text-xs">
              {currentTrack.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ LIBRARY BROWSER COMPONENT ============
function LibraryBrowser() {
  const {
    sources,
    libraryItems,
    currentPath,
    isLoading,
    setSources,
    setLibraryItems,
    navigateTo,
    setCurrentTrack,
    setQueue,
    setIsPlaying,
    setIsLoading,
  } = useAudioStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  
  // Fetch sources on mount
  useEffect(() => {
    fetchSources();
  }, []);
  
  // Fetch library when source or path changes
  useEffect(() => {
    if (selectedSourceId) {
      fetchLibrary();
    }
  }, [selectedSourceId, currentPath[currentPath.length - 1]?.id]);

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/sources');
      const data = await response.json();
      if (data.success) {
        setSources(data.data);
        if (data.data.length > 0 && !selectedSourceId) {
          setSelectedSourceId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch sources:', error);
      toast.error('Failed to load sources');
    }
  };

  const fetchLibrary = async () => {
    setIsLoading(true);
    try {
      const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;
      const params = new URLSearchParams({
        sourceId: selectedSourceId,
        parentId: parentId || '',
      });
      
      if (searchQuery) {
        params.set('search', searchQuery);
      }
      
      const response = await fetch(`/api/library?${params}`);
      const data = await response.json();
      if (data.success) {
        setLibraryItems(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch library:', error);
      toast.error('Failed to load library');
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (item: AudioItem) => {
    if (item.type === 'AUDIO') {
      // Play this track and create queue from siblings
      const siblings = libraryItems.filter(i => i.type === 'AUDIO');
      const index = siblings.findIndex(i => i.id === item.id);
      setQueue(siblings, index >= 0 ? index : 0);
      setCurrentTrack(item);
      setIsPlaying(true);
    } else {
      // Navigate into folder
      navigateTo(item);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const newPath = currentPath.slice(0, index);
    useAudioStore.setState({ currentPath: newPath });
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'LOCAL': return <HardDrive className="h-4 w-4" />;
      case 'GOOGLE_DRIVE': return <Cloud className="h-4 w-4" />;
      case 'FTP': return <Server className="h-4 w-4" />;
      default: return <FolderTree className="h-4 w-4" />;
    }
  };

  const getItemIcon = (item: AudioItem) => {
    switch (item.type) {
      case 'BOOK': return <BookOpen className="h-5 w-5 text-maroon" />;
      case 'CHAPTER': return <BookOpen className="h-5 w-5 text-spiritual-orange" />;
      case 'CATEGORY': return <FolderTree className="h-5 w-5 text-peacock-blue" />;
      case 'AUDIO': return <Music className="h-5 w-5 text-saffron" />;
      default: return <Music className="h-5 w-5" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'BOOK': return 'bg-maroon/10 text-maroon border-maroon/20';
      case 'CHAPTER': return 'bg-spiritual-orange/10 text-spiritual-orange border-spiritual-orange/20';
      case 'CATEGORY': return 'bg-peacock-blue/10 text-peacock-blue border-peacock-blue/20';
      case 'AUDIO': return 'bg-saffron/10 text-saffron-dark border-saffron/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <Card className="spiritual-gradient-subtle border-saffron/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-maroon flex items-center gap-2">
                <Circle className="h-6 w-6 om-glow" />
                Spiritual Audio Library
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Bhajan • Paath • Sacred Book Translations
              </p>
            </div>
            
            {/* Source Selector */}
            <div className="w-full sm:w-auto">
              <Select value={selectedSourceId} onValueChange={(v) => {
                setSelectedSourceId(v);
                useAudioStore.setState({ currentPath: [] });
              }}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select Source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      <div className="flex items-center gap-2">
                        {getSourceIcon(source.type)}
                        <span>{source.name}</span>
                        {!source.isActive && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for bhajans, paath, books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLibrary()}
              className="pl-10 pr-4"
            />
          </div>
          
          {/* Breadcrumb Navigation */}
          {currentPath.length > 0 && (
            <div className="mt-3 flex items-center gap-1 flex-wrap text-sm">
              <button
                onClick={() => handleBreadcrumbClick(-1)}
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
              </button>
              {currentPath.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className={`${
                      index === currentPath.length - 1
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground hover:text-primary'
                    } transition-colors`}
                  >
                    {item.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 text-saffron animate-spin mb-4" />
          <p className="text-muted-foreground">Loading sacred content...</p>
        </div>
      ) : libraryItems.length === 0 ? (
        /* Empty State */
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Music className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Content Found
            </h3>
            <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">
              {selectedSourceId
                ? 'No audio files found in this location. Try a different folder or add content.'
                : 'Please select an audio source to browse your spiritual collection.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Items Grid/List */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {libraryItems.map((item) => (
            <Card
              key={item.id}
              className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                item.type === 'AUDIO' ? 'hover:border-saffron/50' : 'hover:border-maroon/50'
              }`}
              onClick={() => handleItemClick(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-accent/10 transition-colors">
                    {getItemIcon(item)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className={`text-xs ${getTypeBadgeColor(item.type)}`}>
                        {item.type}
                      </Badge>
                      
                      {item._count?.children !== undefined && item._count.children > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {item._count.children} items
                        </span>
                      )}
                      
                      {item.fileSize && (
                        <span className="text-xs text-muted-foreground">
                          {(item.fileSize / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {item.type === 'AUDIO' && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item);
                      }}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ ADMIN PANEL COMPONENT ============
function AdminPanel() {
  const { showAdminPanel, setShowAdminPanel, sources, setSources, setIsLoading } = useAudioStore();
  
  const [editingSource, setEditingSource] = useState<AudioSource | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [scanning, setScanning] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'LOCAL' as 'GOOGLE_DRIVE' | 'FTP' | 'LOCAL',
    driveFolderId: '',
    driveApiKey: '',
    ftpHost: '',
    ftpPort: 21,
    ftpUsername: '',
    ftpPassword: '',
    ftpBasePath: '/',
    localPath: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'LOCAL',
      driveFolderId: '',
      driveApiKey: '',
      ftpHost: '',
      ftpPort: 21,
      ftpUsername: '',
      ftpPassword: '',
      ftpBasePath: '/',
      localPath: '',
    });
    setEditingSource(null);
  };

  const handleEdit = (source: AudioSource) => {
    setEditingSource(source);
    setFormData({
      name: source.name,
      type: source.type as any,
      driveFolderId: source.driveFolderId || '',
      driveApiKey: '', // Don't populate password for security
      ftpHost: source.ftpHost || '',
      ftpPort: source.ftpPort || 21,
      ftpUsername: source.ftpUsername || '',
      ftpPassword: '',
      ftpBasePath: source.ftpBasePath || '/',
      localPath: source.localPath || '',
    });
    setShowAddDialog(true);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      let url, method;
      
      if (editingSource) {
        url = `/api/sources/${editingSource.id}`;
        method = 'PUT';
      } else {
        url = '/api/sources';
        method = 'POST';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(editingSource ? 'Source updated successfully!' : 'Source added successfully!');
        resetForm();
        setShowAddDialog(false);
        
        // Refresh sources list
        const sourcesRes = await fetch('/api/sources');
        const sourcesData = await sourcesRes.json();
        if (sourcesData.success) {
          setSources(sourcesData.data);
        }
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving source:', error);
      toast.error('Failed to save source');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (sourceId: string) => {
    if (!confirm('Are you sure you want to delete this source? All associated library data will be removed.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/sources/${sourceId}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        toast.success('Source deleted successfully!');
        
        const sourcesRes = await fetch('/api/sources');
        const sourcesData = await sourcesRes.json();
        if (sourcesData.success) {
          setSources(sourcesData.data);
        }
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting source:', error);
      toast.error('Failed to delete source');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanLibrary = async (sourceId: string) => {
    setScanning(sourceId);
    try {
      const response = await fetch('/api/library/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Scan complete! Found ${data.audios || 0} audio files.`);
      } else {
        toast.error(data.error || 'Scan failed');
      }
    } catch (error) {
      console.error('Error scanning library:', error);
      toast.error('Failed to scan library');
    } finally {
      setScanning(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LOCAL': return <HardDrive className="h-4 w-4" />;
      case 'GOOGLE_DRIVE': return <Cloud className="h-4 w-4" />;
      case 'FTP': return <Server className="h-4 w-4" />;
      default: return <FolderTree className="h-4 w-4" />;
    }
  };

  if (!showAdminPanel) return null;

  return (
    <Dialog open={showAdminPanel} onOpenChange={setShowAdminPanel}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Panel - Manage Sources
          </DialogTitle>
          <DialogDescription>
            Configure Google Drive, FTP, and local file sources for your spiritual audio library.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New Source Button */}
          <div className="flex justify-between items-center">
            <Button
              onClick={() => {
                resetForm();
                setShowAddDialog(true);
              }}
              className="bg-saffron hover:bg-saffron-dark"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Source
            </Button>
          </div>

          {/* Sources Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Name</th>
                  <th className="text-left p-3 text-sm font-medium">Type</th>
                  <th className="text-left p-3 text-sm font-medium hidden sm:table-cell">Details</th>
                  <th className="text-left p-3 text-sm font-medium hidden md:table-cell">Items</th>
                  <th className="text-right p-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sources.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No sources configured yet. Add your first source above.
                    </td>
                  </tr>
                ) : (
                  sources.map((source) => (
                    <tr key={source.id} className="hover:bg-muted/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(source.type)}
                          <span className="font-medium">{source.name}</span>
                          {!source.isActive && (
                            <Badge variant="secondary" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{source.type.replace('_', ' ')}</Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground hidden sm:table-cell">
                        {source.type === 'LOCAL' && source.localPath && (
                          <span title={source.localPath}>
                            {source.localPath.length > 25 
                              ? `...${source.localPath.slice(-22)}` 
                              : source.localPath}
                          </span>
                        )}
                        {source.type === 'GOOGLE_DRIVE' && (
                          <span>{source.driveFolderId?.slice(0, 15)}...</span>
                        )}
                        {source.type === 'FTP' && (
                          <span>{source.ftpHost}:{source.ftpPort}</span>
                        )}
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <span className="text-sm">{source._count?.audioItems || 0}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScanLibrary(source.id)}
                            disabled={scanning === source.id}
                          >
                            {scanning === source.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            ) : (
                              <RefreshCw className="h-3.5 w-3.5 mr-1" />
                            )}
                            Scan
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(source)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(source.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Source Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingSource ? 'Edit Source' : 'Add New Source'}
              </DialogTitle>
              <DialogDescription>
                Configure the connection details for your audio source.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Source Name *</label>
                <Input
                  placeholder="e.g., My Bhajan Collection"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Source Type *</label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOCAL">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4" /> Local Folder
                      </div>
                    </SelectItem>
                    <SelectItem value="GOOGLE_DRIVE">
                      <div className="flex items-center gap-2">
                        <Cloud className="h-4 w-4" /> Google Drive
                      </div>
                    </SelectItem>
                    <SelectItem value="FTP">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4" /> FTP Server
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type-specific fields */}
              {formData.type === 'LOCAL' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Local Path *</label>
                  <Input
                    placeholder="/path/to/audio/files"
                    value={formData.localPath}
                    onChange={(e) => setFormData({ ...formData, localPath: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the full path to your local audio files directory.
                  </p>
                </div>
              )}

              {formData.type === 'GOOGLE_DRIVE' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Drive Folder ID *</label>
                    <Input
                      placeholder="Google Drive folder ID"
                      value={formData.driveFolderId}
                      onChange={(e) => setFormData({ ...formData, driveFolderId: e.target.value })}
                  />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <Input
                      type="password"
                      placeholder="Google API key (optional)"
                      value={formData.driveApiKey}
                      onChange={(e) => setFormData({ ...formData, driveApiKey: e.target.value })}
                    />
                  </div>
                </>
              )}

              {formData.type === 'FTP' && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-2">
                      <label className="text-sm font-medium">Host *</label>
                      <Input
                        placeholder="ftp.example.com"
                        value={formData.ftpHost}
                        onChange={(e) => setFormData({ ...formData, ftpHost: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Port</label>
                      <Input
                        type="number"
                        value={formData.ftpPort}
                        onChange={(e) => setFormData({ ...formData, ftpPort: parseInt(e.target.value) || 21 })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Username *</label>
                      <Input
                        placeholder="username"
                        value={formData.ftpUsername}
                        onChange={(e) => setFormData({ ...formData, ftpUsername: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password *</label>
                      <Input
                        type="password"
                        placeholder="password"
                        value={formData.ftpPassword}
                        onChange={(e) => setFormData({ ...formData, ftpPassword: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Base Path</label>
                    <Input
                      placeholder="/path/on/server"
                      value={formData.ftpBasePath}
                      onChange={(e) => setFormData({ ...formData, ftpBasePath: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.localPath && formData.type === 'LOCAL'}
                className="bg-saffron hover:bg-saffron-dark"
              >
                {editingSource ? 'Update Source' : 'Add Source'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

// ============ MAIN PAGE COMPONENT ============
export default function HomePage() {
  const { showAdminPanel, setShowAdminPanel } = useAudioStore();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 sm:h-16 items-center px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="spiritual-gradient p-1.5 sm:p-2 rounded-lg">
              <Circle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-maroon via-spiritual-orange to-saffron bg-clip-text text-transparent">
                Divine Audio
              </h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Spiritual Sound Experience</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-bold text-maroon">Divine Audio</h1>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="gap-1.5"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-24">
        <LibraryBrowser />
      </main>

      {/* Audio Player */}
      <AudioPlayer />

      {/* Admin Panel */}
      <AdminPanel />

      {/* Toast Container */}
      {/* Sonner Toaster is handled by layout */}
    </div>
  );
}
