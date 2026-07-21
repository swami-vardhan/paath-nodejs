import { create } from 'zustand';

export interface AudioItem {
  id: string;
  sourceId: string;
  name: string;
  type: 'BOOK' | 'CHAPTER' | 'CATEGORY' | 'AUDIO';
  path: string;
  relativePath: string;
  parentId: string | null;
  fileUrl?: string | null;
  fileSize?: number | null;
  duration?: number | null;
  mimeType?: string | null;
  sortOrder: number;
  playCount: number;
  isFavorite: boolean;
  _count?: { children: number };
  source?: { id: string; name: string; type: string };
}

export interface AudioSource {
  id: string;
  name: string;
  type: 'GOOGLE_DRIVE' | 'FTP' | 'LOCAL';
  isActive: boolean;
  driveFolderId?: string | null;
  ftpHost?: string | null;
  localPath?: string | null;
  lastScannedAt?: Date | null;
  _count?: { audioItems: number };
}

interface AudioStore {
  // Current playback state
  currentTrack: AudioItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  
  // Queue
  queue: AudioItem[];
  queueIndex: number;
  
  // Library state
  sources: AudioSource[];
  libraryItems: AudioItem[];
  currentPath: AudioItem[]; // Breadcrumb navigation
  
  // UI state
  showAdminPanel: boolean;
  isLoading: boolean;
  
  // Actions
  setCurrentTrack: (track: AudioItem | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  
  setQueue: (tracks: AudioItem[], startIndex?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  addToQueue: (track: AudioItem) => void;
  clearQueue: () => void;
  
  setSources: (sources: AudioSource[]) => void;
  setLibraryItems: (items: AudioItem[]) => void;
  navigateTo: (item: AudioItem | null) => void;
  
  setShowAdminPanel: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  // Initial state
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  
  queue: [],
  queueIndex: -1,
  
  sources: [],
  libraryItems: [],
  currentPath: [],
  
  showAdminPanel: false,
  isLoading: false,
  
  // Playback actions
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  
  // Queue actions
  setQueue: (tracks, startIndex = 0) => set({ 
    queue: tracks, 
    queueIndex: startIndex,
    currentTrack: tracks[startIndex] || null 
  }),
  
  playNext: () => {
    const { queue, queueIndex } = get();
    if (queueIndex < queue.length - 1) {
      const newIndex = queueIndex + 1;
      set({ 
        queueIndex: newIndex, 
        currentTrack: queue[newIndex],
        currentTime: 0 
      });
    }
  },
  
  playPrevious: () => {
    const { queue, queueIndex } = get();
    if (queueIndex > 0) {
      const newIndex = queueIndex - 1;
      set({ 
        queueIndex: newIndex, 
        currentTrack: queue[newIndex],
        currentTime: 0 
      });
    }
  },
  
  addToQueue: (track) => set((state) => ({ 
    queue: [...state.queue, track] 
  })),
  
  clearQueue: () => set({ 
    queue: [], 
    queueIndex: -1,
    currentTrack: null,
    isPlaying: false 
  }),
  
  // Library actions
  setSources: (sources) => set({ sources }),
  setLibraryItems: (items) => set({ libraryItems: items }),
  
  navigateTo: (item) => set((state) => ({
    currentPath: item ? [...state.currentPath, item] : []
  })),
  
  // UI actions
  setShowAdminPanel: (show) => set({ showAdminPanel: show }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
