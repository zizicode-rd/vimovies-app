import { create } from 'zustand';
import type {
  BrandPublic,
  ComparisonPublic,
  MonitorListItem,
  MonitorPublic,
  PseoHubPublic,
  PostPublic,
} from '@/types/api';

export interface VimoviesState {
  brands: BrandPublic[];
  monitors: MonitorListItem[];
  selectedMonitor: MonitorPublic | null;
  comparisons: ComparisonPublic[];
  posts: PostPublic[];
  hubs: PseoHubPublic[];
  isLoading: boolean;
  error: string | null;

  setBrands: (brands: BrandPublic[]) => void;
  setMonitors: (monitors: MonitorListItem[]) => void;
  setSelectedMonitor: (monitor: MonitorPublic | null) => void;
  setComparisons: (comparisons: ComparisonPublic[]) => void;
  setPosts: (posts: PostPublic[]) => void;
  setHubs: (hubs: PseoHubPublic[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  clearAll: () => void;
}

export const useVimoviesStore = create<VimoviesState>((set) => ({
  brands: [],
  monitors: [],
  selectedMonitor: null,
  comparisons: [],
  posts: [],
  hubs: [],
  isLoading: false,
  error: null,

  setBrands: (brands) => set({ brands }),
  setMonitors: (monitors) => set({ monitors }),
  setSelectedMonitor: (selectedMonitor) => set({ selectedMonitor }),
  setComparisons: (comparisons) => set({ comparisons }),
  setPosts: (posts) => set({ posts }),
  setHubs: (hubs) => set({ hubs }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  clearAll: () =>
    set({
      brands: [],
      monitors: [],
      selectedMonitor: null,
      comparisons: [],
      posts: [],
      hubs: [],
      isLoading: false,
      error: null,
    }),
}));
