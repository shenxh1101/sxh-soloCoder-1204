import { Play, Square } from 'lucide-react';
import { useMixerStore } from '@/stores/mixerStore';
import { audioEngine } from '@/lib/audioEngine';
import BPMSlider from './BPMSlider';
import MasterEQ from './MasterEQ';

export default function TransportBar() {
  const isPlaying = useMixerStore((s) => s.isPlaying);
  const bpm = useMixerStore((s) => s.bpm);
  const setPlaying = useMixerStore((s) => s.setPlaying);
  const setBpm = useMixerStore((s) => s.setBpm);

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioEngine.stop();
      setPlaying(false);
    } else {
      audioEngine.play();
      setPlaying(true);
    }
  };

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
    audioEngine.setBpm(newBpm);
  };

  return (
    <div className="flex items-center gap-6 px-6 py-4 bg-[#0d0d1a] border-b border-white/5">
      <button
        onClick={handleTogglePlay}
        className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
          isPlaying
            ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(39,174,96,0.5)] hover:shadow-[0_0_30px_rgba(39,174,96,0.7)]'
            : 'bg-amber-600 text-white shadow-[0_0_20px_rgba(232,168,80,0.4)] hover:shadow-[0_0_30px_rgba(232,168,80,0.6)]'
        }`}
        aria-label={isPlaying ? 'Stop' : 'Play'}
      >
        {isPlaying ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        {isPlaying && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-emerald-400" />
        )}
      </button>

      <div className="flex-1 max-w-[400px]">
        <BPMSlider bpm={bpm} onChange={handleBpmChange} />
      </div>

      <div className="flex-1" />

      <MasterEQ />
    </div>
  );
}