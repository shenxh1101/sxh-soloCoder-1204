import { useRef, useCallback, useEffect, useState } from 'react';

interface BPMSliderProps {
  bpm: number;
  onChange: (bpm: number) => void;
}

export default function BPMSlider({ bpm, onChange }: BPMSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const percent = ((bpm - 60) / 140) * 100;

  const calcBpm = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return bpm;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(60 + ratio * 140);
    },
    [bpm]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      onChange(calcBpm(e.clientX));
    },
    [calcBpm, onChange]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      onChange(calcBpm(e.clientX));
    };
    const handleUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, calcBpm, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-[10px] font-bold tracking-widest text-amber-400/60 uppercase min-w-[28px]">BPM</span>
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        className="relative h-2 flex-1 min-w-[120px] cursor-pointer rounded-full bg-[#2d3a5c]"
      >
        <div
          className="absolute h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
          style={{ width: `${percent}%`, boxShadow: '0 0 8px rgba(232,168,80,0.4)' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-300 border-2 border-amber-600 transition-shadow duration-150"
          style={{
            left: `calc(${percent}% - 8px)`,
            boxShadow: isDragging
              ? '0 0 16px rgba(232,168,80,0.8), 0 0 32px rgba(232,168,80,0.4)'
              : '0 0 8px rgba(232,168,80,0.4)',
          }}
        />
        <input
          type="range"
          min={60}
          max={200}
          value={bpm}
          onChange={handleChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          aria-label="BPM"
        />
      </div>
      <span
        className="text-2xl font-bold text-amber-300 tabular-nums min-w-[56px] text-center"
        style={{ fontFamily: "'Orbitron', monospace" }}
      >
        {bpm}
      </span>
    </div>
  );
}