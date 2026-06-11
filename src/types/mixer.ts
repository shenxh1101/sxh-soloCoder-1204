export interface TrackState {
  id: string;
  name: string;
  volume: number;
  pan: number;
  isMuted: boolean;
  isSolo: boolean;
  isCustomAudio: boolean;
  customAudioName?: string;
}

export interface MasterEqState {
  lowGain: number;
  highGain: number;
}

export interface MixerState {
  tracks: TrackState[];
  bpm: number;
  isPlaying: boolean;
  masterEq: MasterEqState;
}

export interface Preset {
  id: string;
  name: string;
  state: Omit<MixerState, 'isPlaying'>;
  createdAt: string;
}

export const DEFAULT_TRACKS: TrackState[] = [
  { id: 'drums', name: 'DRUMS', volume: 75, pan: 0, isMuted: false, isSolo: false, isCustomAudio: false },
  { id: 'bass', name: 'BASS', volume: 70, pan: 0, isMuted: false, isSolo: false, isCustomAudio: false },
  { id: 'chords', name: 'CHORDS', volume: 65, pan: -0.2, isMuted: false, isSolo: false, isCustomAudio: false },
  { id: 'melody', name: 'LEAD', volume: 70, pan: 0.2, isMuted: false, isSolo: false, isCustomAudio: false },
];

export const DEFAULT_MIXER_STATE: MixerState = {
  tracks: DEFAULT_TRACKS,
  bpm: 120,
  isPlaying: false,
  masterEq: {
    lowGain: 0,
    highGain: 0,
  },
};