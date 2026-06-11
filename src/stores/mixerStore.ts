import { create } from 'zustand';
import type { MixerState, MasterEqState } from '@/types/mixer';
import { DEFAULT_MIXER_STATE } from '@/types/mixer';

interface MixerActions {
  setBpm: (bpm: number) => void;
  setPlaying: (playing: boolean) => void;
  setTrackVolume: (trackId: string, volume: number) => void;
  setTrackPan: (trackId: string, pan: number) => void;
  toggleMute: (trackId: string) => void;
  toggleSolo: (trackId: string) => void;
  setTrackCustomAudio: (trackId: string, isCustom: boolean, name?: string) => void;
  setMasterEq: (eq: Partial<MasterEqState>) => void;
  loadState: (state: Omit<MixerState, 'isPlaying'>) => void;
  resetAll: () => void;
}

export const useMixerStore = create<MixerState & MixerActions>((set) => ({
  ...DEFAULT_MIXER_STATE,

  setBpm: (bpm) => set({ bpm: Math.max(60, Math.min(200, bpm)) }),

  setPlaying: (playing) => set({ isPlaying: playing }),

  setTrackVolume: (trackId, volume) =>
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId ? { ...t, volume: Math.max(0, Math.min(100, volume)) } : t
      ),
    })),

  setTrackPan: (trackId, pan) =>
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId ? { ...t, pan: Math.max(-1, Math.min(1, pan)) } : t
      ),
    })),

  toggleMute: (trackId) =>
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId ? { ...t, isMuted: !t.isMuted } : t
      ),
    })),

  toggleSolo: (trackId) =>
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId ? { ...t, isSolo: !t.isSolo } : t
      ),
    })),

  setTrackCustomAudio: (trackId, isCustom, name) =>
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId ? { ...t, isCustomAudio: isCustom, customAudioName: name } : t
      ),
    })),

  setMasterEq: (eq) =>
    set((state) => ({
      masterEq: { ...state.masterEq, ...eq },
    })),

  loadState: (loadedState) =>
    set((state) => ({
      bpm: loadedState.bpm,
      tracks: loadedState.tracks,
      masterEq: loadedState.masterEq,
      isPlaying: state.isPlaying,
    })),

  resetAll: () => set({ ...DEFAULT_MIXER_STATE, isPlaying: false }),
}));