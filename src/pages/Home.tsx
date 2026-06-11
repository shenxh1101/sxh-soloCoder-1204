import { useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { useMixerStore } from '@/stores/mixerStore';
import { audioEngine } from '@/lib/audioEngine';
import TransportBar from '@/components/TransportBar';
import ChannelStrip from '@/components/ChannelStrip';
import PresetManager from '@/components/PresetManager';

export default function Home() {
  const tracks = useMixerStore((s) => s.tracks);
  const isPlaying = useMixerStore((s) => s.isPlaying);

  useEffect(() => {
    audioEngine.init().then(() => {
      tracks.forEach((track) => {
        audioEngine.createTrack(track);
      });
    });

    return () => {
      audioEngine.dispose();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0a0a16] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(232,168,80,0.03) 0%, transparent 60%)',
        }}
      />

      <TransportBar />

      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <div className="flex gap-4 px-8">
          {tracks.map((track) => (
            <ChannelStrip key={track.id} track={track} />
          ))}
        </div>

        {!isPlaying && (
          <div className="mt-8 flex flex-col items-center gap-2 text-white/15 animate-pulse">
            <Volume2 size={32} />
            <span className="text-xs tracking-[0.3em] uppercase">点击播放开始混音</span>
          </div>
        )}
      </div>

      <PresetManager />
    </div>
  );
}