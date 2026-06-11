import { create } from 'zustand';
import type { Preset } from '@/types/mixer';

const STORAGE_KEY = 'mixer-presets';

function loadPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
}

function savePresets(presets: Preset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

interface PresetActions {
  savePreset: (name: string, state: Preset['state']) => void;
  deletePreset: (id: string) => void;
  getAllPresets: () => Preset[];
}

export const usePresetStore = create<{ presets: Preset[] } & PresetActions>((set, get) => ({
  presets: loadPresets(),

  savePreset: (name, state) => {
    const preset: Preset = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      state,
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().presets, preset];
    set({ presets: updated });
    savePresets(updated);
  },

  deletePreset: (id) => {
    const updated = get().presets.filter((p) => p.id !== id);
    set({ presets: updated });
    savePresets(updated);
  },

  getAllPresets: () => get().presets,
}));