import { useRef, useCallback, useEffect, useState } from 'react';

interface FaderProps {
  value: number;
  min?: number;
  max?: number;
  height?: number;
  onChange: (value: number) => void;
  color?: string;
  trackColor?: string;
}

export default function Fader({
  value,
  min = 0,
  max = 100,
  height = 200,
  onChange,
  color = '#e8a850',
  trackColor = '#2d3a5c',
}: FaderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const percent = ((value - min) / (max - min)) * 100;
  const thumbPosition = 100 - percent;

  const calcValue = useCallback(
    (clientY: number) => {
      const track = trackRef.current;
      if (!track) return value;
      const rect = track.getBoundingClientRect();
      const relativeY = clientY - rect.top;
      const ratio = 1 - Math.max(0, Math.min(1, relativeY / rect.height));
      return Math.round(min + ratio * (max - min));
    },
    [min, max, value]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      onChange(calcValue(e.clientY));
    },
    [calcValue, onChange]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(true);
      onChange(calcValue(e.touches[0].clientY));
    },
    [calcValue, onChange]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      onChange(calcValue(e.clientY));
    };

    const handleTouchMove = (e: TouchEvent) => {
      onChange(calcValue(e.touches[0].clientY));
    };

    const handleUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, calcValue, onChange]);

  return (
    <div
      ref={trackRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className="relative cursor-pointer group"
      style={{ height, width: 44 }}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label="Volume fader"
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[4px] rounded-full"
        style={{
          height: '100%',
          background: `linear-gradient(to top, ${color}, ${color} ${percent}%, ${trackColor} ${percent}%)`,
          boxShadow: `0 0 8px ${color}40`,
        }}
      />

      {[0, 25, 50, 75, 100].map((mark) => (
        <div
          key={mark}
          className="absolute left-0 w-[8px] h-[1px] bg-white/10"
          style={{ bottom: `${mark}%` }}
        />
      ))}

      <div
        className="absolute left-1/2 -translate-x-1/2 w-8 h-4 rounded-sm transition-shadow duration-150"
        style={{
          bottom: `calc(${thumbPosition}% - 8px)`,
          background: `linear-gradient(180deg, ${color} 0%, ${color}dd 100%)`,
          boxShadow: isDragging
            ? `0 0 16px ${color}, 0 0 32px ${color}80`
            : `0 0 8px ${color}60, 0 2px 4px rgba(0,0,0,0.5)`,
        }}
      />
    </div>
  );
}