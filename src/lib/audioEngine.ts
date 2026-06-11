import * as Tone from 'tone';
import type { TrackState } from '@/types/mixer';

const VOLUME_MIN = -40;
const VOLUME_MAX = 6;

function volumeToDb(volume: number): number {
  return VOLUME_MIN + (volume / 100) * (VOLUME_MAX - VOLUME_MIN);
}

class AudioEngine {
  private masterChannel: Tone.Channel | null = null;
  private masterEq: Tone.EQ3 | null = null;
  private trackChannels: Map<string, Tone.Channel> = new Map();
  private trackPlayers: Map<string, Tone.Player | null> = new Map();
  private trackLoops: Map<string, Tone.Loop | null> = new Map();
  private trackSynths: Map<string, Tone.ToneAudioNode | null> = new Map();
  private customPlayer: Map<string, Tone.Player | null> = new Map();
  private isInitialized = false;
  private hasAnySolo = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;
    await Tone.start();

    this.masterChannel = new Tone.Channel(0, 0).toDestination();
    this.masterEq = new Tone.EQ3(0, 0, 0).connect(this.masterChannel);

    this.isInitialized = true;
  }

  createTrack(track: TrackState): void {
    if (!this.masterEq) return;

    const channel = new Tone.Channel(volumeToDb(track.volume), track.pan).connect(this.masterEq);
    this.trackChannels.set(track.id, channel);

    if (track.isCustomAudio) {
      return;
    }

    this.createPresetSynth(track);
  }

  private createPresetSynth(track: TrackState): void {
    const channel = this.trackChannels.get(track.id);
    if (!channel) return;

    switch (track.id) {
      case 'drums':
        this.createDrums(channel);
        break;
      case 'bass':
        this.createBass(channel);
        break;
      case 'chords':
        this.createChords(channel);
        break;
      case 'melody':
        this.createMelody(channel);
        break;
    }
  }

  private createDrums(channel: Tone.Channel): void {
    const kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 5,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.1 },
    }).connect(channel);

    const snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.01 },
    }).connect(channel);

    const hihat = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 },
    }).connect(channel);

    const loop = new Tone.Loop((time) => {
      kick.triggerAttackRelease('C2', '8n', time);
      snare.triggerAttackRelease('8n', time + Tone.Time('4n').toSeconds());
      hihat.triggerAttackRelease('32n', time + Tone.Time('8n').toSeconds() * 0.5);
      hihat.triggerAttackRelease('32n', time + Tone.Time('8n').toSeconds() * 1.5);
      hihat.triggerAttackRelease('32n', time + Tone.Time('8n').toSeconds() * 2.5);
      hihat.triggerAttackRelease('32n', time + Tone.Time('8n').toSeconds() * 3.5);
      kick.triggerAttackRelease('C2', '8n', time + Tone.Time('2n').toSeconds());
      snare.triggerAttackRelease('8n', time + Tone.Time('4n').toSeconds() * 3);
      hihat.triggerAttackRelease('32n', time + Tone.Time('8n').toSeconds() * 4.5);
      hihat.triggerAttackRelease('32n', time + Tone.Time('8n').toSeconds() * 5.5);
      hihat.triggerAttackRelease('32n', time + Tone.Time('8n').toSeconds() * 6.5);
      hihat.triggerAttackRelease('32n', time + Tone.Time('8n').toSeconds() * 7.5);
    }, '1m').start(0);

    this.trackLoops.set('drums', loop);
    this.trackSynths.set('drums_kick', kick);
    this.trackSynths.set('drums_snare', snare);
    this.trackSynths.set('drums_hihat', hihat);
  }

  private createBass(channel: Tone.Channel): void {
    const bass = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      filter: {
        type: 'lowpass',
        frequency: 400,
        rolloff: -12,
      },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.5,
        release: 0.3,
      },
      volume: -6,
    }).connect(channel);

    const notes = ['C2', 'C2', 'G2', 'G2', 'A2', 'A2', 'F2', 'F2'];
    let step = 0;

    const loop = new Tone.Loop((time) => {
      bass.triggerAttackRelease(notes[step % 8], '8n', time);
      step++;
    }, '4n').start(0);

    this.trackLoops.set('bass', loop);
    this.trackSynths.set('bass', bass);
  }

  private createChords(channel: Tone.Channel): void {
    const chords = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.4,
        release: 0.5,
      },
      volume: -10,
    }).connect(channel);

    const chordProgression = [
      ['C4', 'E4', 'G4'],
      ['A3', 'C4', 'E4'],
      ['F3', 'A3', 'C4'],
      ['G3', 'B3', 'D4'],
    ];
    let step = 0;

    const loop = new Tone.Loop((time) => {
      chords.triggerAttackRelease(chordProgression[step % 4], '2n', time);
      step++;
    }, '2n').start(0);

    this.trackLoops.set('chords', loop);
    this.trackSynths.set('chords', chords);
  }

  private createMelody(channel: Tone.Channel): void {
    const melody = new Tone.MonoSynth({
      oscillator: { type: 'square' },
      filter: {
        type: 'lowpass',
        frequency: 800,
      },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.3,
        release: 0.2,
      },
      volume: -8,
    }).connect(channel);

    const notes = ['E5', 'D5', 'C5', 'E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5', 'E5', 'C5', 'A4', 'G4', 'E4'];
    let step = 0;

    const loop = new Tone.Loop((time) => {
      melody.triggerAttackRelease(notes[step % 16], '8n', time);
      step++;
    }, '8n').start(0);

    this.trackLoops.set('melody', loop);
    this.trackSynths.set('melody', melody);
  }

  async loadCustomAudio(trackId: string, arrayBuffer: ArrayBuffer): Promise<void> {
    const channel = this.trackChannels.get(trackId);
    if (!channel) return;

    this.removeTrackAudio(trackId);

    const blob = new Blob([arrayBuffer]);
    const url = URL.createObjectURL(blob);

    const player = new Tone.Player({
      url,
      loop: true,
      onload: () => {
        player.sync().start(0);
      },
    }).connect(channel);

    this.customPlayer.set(trackId, player);
    this.trackPlayers.set(trackId, player);
  }

  removeTrackAudio(trackId: string): void {
    const player = this.customPlayer.get(trackId);
    if (player) {
      player.stop();
      player.dispose();
      this.customPlayer.delete(trackId);
    }

    const loop = this.trackLoops.get(trackId);
    if (loop) {
      loop.stop();
      loop.dispose();
      this.trackLoops.delete(trackId);
    }

    const synth = this.trackSynths.get(trackId);
    if (synth) {
      synth.dispose();
      this.trackSynths.delete(trackId);
    }

    this.trackPlayers.delete(trackId);
  }

  resetToPreset(trackId: string, track: TrackState): void {
    this.removeTrackAudio(trackId);
    if (!track.isCustomAudio) {
      this.createPresetSynth(track);
    }
  }

  play(): void {
    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
    }
  }

  stop(): void {
    Tone.Transport.stop();
  }

  setBpm(bpm: number): void {
    Tone.Transport.bpm.value = bpm;
  }

  setTrackVolume(trackId: string, volume: number): void {
    const channel = this.trackChannels.get(trackId);
    if (channel) {
      channel.volume.value = volumeToDb(volume);
    }
  }

  setTrackPan(trackId: string, pan: number): void {
    const channel = this.trackChannels.get(trackId);
    if (channel) {
      channel.pan.value = pan;
    }
  }

  setTrackMute(trackId: string, muted: boolean, tracks: TrackState[]): void {
    const channel = this.trackChannels.get(trackId);
    if (!channel) return;

    const hasAnySolo = tracks.some((t) => t.isSolo);
    this.hasAnySolo = hasAnySolo;

    if (hasAnySolo) {
      this.updateSoloState(tracks);
    } else {
      channel.mute = muted;
    }
  }

  setTrackSolo(trackId: string, solo: boolean, tracks: TrackState[]): void {
    this.updateSoloState(tracks);
  }

  private updateSoloState(tracks: TrackState[]): void {
    const hasAnySolo = tracks.some((t) => t.isSolo);

    tracks.forEach((track) => {
      const channel = this.trackChannels.get(track.id);
      if (!channel) return;

      if (hasAnySolo) {
        channel.mute = !track.isSolo;
      } else {
        channel.mute = track.isMuted;
      }
    });
  }

  setMasterEqLow(gain: number): void {
    if (this.masterEq) {
      this.masterEq.low.value = gain;
    }
  }

  setMasterEqHigh(gain: number): void {
    if (this.masterEq) {
      this.masterEq.high.value = gain;
    }
  }

  getMasterVolume(): number {
    return this.masterChannel?.volume.value ?? 0;
  }

  dispose(): void {
    this.trackLoops.forEach((loop) => {
      loop?.stop();
      loop?.dispose();
    });
    this.trackSynths.forEach((synth) => {
      synth?.dispose();
    });
    this.customPlayer.forEach((player) => {
      player?.stop();
      player?.dispose();
    });
    this.trackChannels.forEach((channel) => {
      channel.dispose();
    });
    this.masterEq?.dispose();
    this.masterChannel?.dispose();
    this.trackLoops.clear();
    this.trackSynths.clear();
    this.customPlayer.clear();
    this.trackPlayers.clear();
    this.trackChannels.clear();
    this.isInitialized = false;
  }
}

export const audioEngine = new AudioEngine();