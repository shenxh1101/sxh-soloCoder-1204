import { useEffect, useState, useRef } from 'react';

interface LevelMeterProps {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  className?: string;
}

const SEGMENTS = 20;

export default function LevelMeter({ isPlaying, volume, isMuted, className = '' }: LevelMeterProps) {
  const [level, setLevel] = useState(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying || isMuted) {
      setLevel(0);
      return;
    }

    let frameId: number;
    const animate = () => {
      const targetLevel = volume / 100;
      setLevel((prev) => {
        const diff = targetLevel - prev;
        const step = diff * 0.1 + (Math.random() - 0.5) * 0.15;
        const next = prev + step;
        return Math.max(0, Math.min(1, next));
      });
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, volume, isMuted]);

  const activeSegments = Math.floor(level * SEGMENTS);

  return (
    <div className={`flex flex-col-reverse gap-[1px] ${className}`} style={{ width: 8, height: 120 }}>
      {Array.from({ length: SEGMENTS }).map((_, i) => {
        const isActive = i < activeSegments;
        let color = 'bg-emerald-500';
        if (i >= SEGMENTS * 0.8) color = 'bg-red-500';
        else if (i >= SEGMENTS * 0.6) color = 'bg-amber-500';

        return (
          <div
            key={i}
            className={`h-[5px] rounded-sm transition-colors duration-75 ${
              isActive ? color + ' shadow-[0_0_4px] shadow-current' : 'bg-white/10'
            }`}
            style={{ opacity: isActive ? 1 : 0.3 }}
          />
        );
      })}
    </div>
  );
}