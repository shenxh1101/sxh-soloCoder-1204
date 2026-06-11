import { useRef, useCallback, useEffect } from 'react';
import { Upload, RotateCcw } from 'lucide-react';
import type { TrackState } from '@/types/mixer';
import { useMixerStore } from '@/stores/mixerStore';
import { audioEngine } from '@/lib/audioEngine';
import Knob from './Knob';
import Fader from './Fader';
import LevelMeter from './LevelMeter';

interface ChannelStripProps {
  track: TrackState;
}

export default function ChannelStrip({ track }: ChannelStripProps) {
  const isPlaying = useMixerStore((s) => s.isPlaying);
  const setTrackVolume = useMixerStore((s) => s.setTrackVolume);
  const setTrackPan = useMixerStore((s) => s.setTrackPan);
  const toggleMute = useMixerStore((s) => s.toggleMute);
  const toggleSolo = useMixerStore((s) => s.toggleSolo);
  const setTrackCustomAudio = useMixerStore((s) => s.setTrackCustomAudio);
  const tracks = useMixerStore((s) => s.tracks);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVolumeChange = useCallback(
    (value: number) => {
      setTrackVolume(track.id, value);
      audioEngine.setTrackVolume(track.id, value);
    },
    [track.id, setTrackVolume]
  );

  const handlePanChange = useCallback(
    (value: number) => {
      setTrackPan(track.id, value);
      audioEngine.setTrackPan(track.id, value);
    },
    [track.id, setTrackPan]
  );

  const handleMute = useCallback(() => {
    toggleMute(track.id);
    audioEngine.setTrackMute(track.id, !track.isMuted, tracks);
  }, [track.id, track.isMuted, toggleMute, tracks]);

  const handleSolo = useCallback(() => {
    toggleSolo(track.id);
    audioEngine.setTrackSolo(track.id, !track.isSolo, tracks);
  }, [track.id, track.isSolo, toggleSolo, tracks]);

  useEffect(() => {
    audioEngine.setTrackMute(track.id, track.isMuted, tracks);
    audioEngine.setTrackSolo(track.id, track.isSolo, tracks);
  }, [track.isMuted, track.isSolo, tracks, track.id]);

  const handleFileLoad = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (ev) => {
        const buffer = ev.target?.result as ArrayBuffer;
        if (buffer) {
          await audioEngine.loadCustomAudio(track.id, buffer);
          setTrackCustomAudio(track.id, true, file.name);
        }
      };
      reader.readAsArrayBuffer(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [track.id, setTrackCustomAudio]
  );

  const handleReset = useCallback(() => {
    setTrackCustomAudio(track.id, false, undefined);
    audioEngine.resetToPreset(track.id, { ...track, isCustomAudio: false, customAudioName: undefined });
  }, [track.id, setTrackCustomAudio, track]);

  const hasAnySolo = tracks.some((t) => t.isSolo);
  const isSoloedButNotThis = hasAnySolo && !track.isSolo;

  return (
    <div
      className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
        track.isSolo
          ? 'border-amber-500/50 bg-[#1a1a2e] shadow-[0_0_20px_rgba(232,168,80,0.15)]'
          : 'border-white/5 bg-[#13132b] hover:border-white/10'
      } ${isSoloedButNotThis ? 'opacity-50' : ''}`}
      style={{ width: 140 }}
    >
      <div className="text-center">
        <div
          className="text-xs font-bold tracking-[0.2em] text-amber-400/80 truncate max-w-full"
          style={{ fontFamily: "'Orbitron', monospace" }}
        >
          {track.customAudioName || track.name}
        </div>
        {track.isCustomAudio && (
          <div className="text-[9px] text-amber-500/40 mt-0.5">CUSTOM</div>
        )}
      </div>

      <LevelMeter isPlaying={isPlaying} volume={track.volume} isMuted={track.isMuted || isSoloedButNotThis} />

      <Knob
        value={Math.round(track.pan * 50 + 50)}
        min={0}
        max={100}
        step={1}
        size={40}
        label="PAN"
        valueLabel={track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.abs(Math.round(track.pan * 100))}` : `R${Math.round(track.pan * 100)}`}
        onChange={(v) => handlePanChange((v - 50) / 50)}
        color="#60a5fa"
      />

      <div className="flex gap-2">
        <button
          onClick={handleMute}
          className={`w-8 h-8 rounded text-[10px] font-bold tracking-wider transition-all duration-150 ${
            track.isMuted
              ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(231,76,60,0.5)]'
              : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
          }`}
          aria-label={track.isMuted ? 'Unmute' : 'Mute'}
        >
          M
        </button>
        <button
          onClick={handleSolo}
          className={`w-8 h-8 rounded text-[10px] font-bold tracking-wider transition-all duration-150 ${
            track.isSolo
              ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(232,168,80,0.5)]'
              : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
          }`}
          aria-label={track.isSolo ? 'Unsolo' : 'Solo'}
        >
          S
        </button>
      </div>

      <Fader
        value={track.volume}
        min={0}
        max={100}
        height={160}
        onChange={handleVolumeChange}
      />

      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center w-7 h-7 rounded bg-white/5 text-white/40 hover:bg-white/10 hover:text-amber-400 transition-all duration-150"
          aria-label="Load audio file"
          title="加载音频文件"
        >
          <Upload size={12} />
        </button>
        {track.isCustomAudio && (
          <button
            onClick={handleReset}
            className="flex items-center justify-center w-7 h-7 rounded bg-white/5 text-white/40 hover:bg-white/10 hover:text-red-400 transition-all duration-150"
            aria-label="Reset to preset"
            title="恢复预设"
          >
            <RotateCcw size={12} />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/wav,audio/mpeg,audio/mp3"
        onChange={handleFileLoad}
        className="hidden"
      />
    </div>
  );
}