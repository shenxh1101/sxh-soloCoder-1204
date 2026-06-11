import { useRef, useCallback, useEffect, useState } from 'react';

interface KnobProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  size?: number;
  label: string;
  valueLabel?: string;
  onChange: (value: number) => void;
  color?: string;
  trackColor?: string;
}

export default function Knob({
  value,
  min,
  max,
  step = 1,
  size = 56,
  label,
  valueLabel,
  onChange,
  color = '#e8a850',
  trackColor = '#2d3a5c',
}: KnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startValue = useRef(0);

  const angle = ((value - min) / (max - min)) * 270 - 135;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startY.current = e.clientY;
      startValue.current = value;
    },
    [value]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startY.current = e.touches[0].clientY;
      startValue.current = value;
    },
    [value]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = (startY.current - e.clientY) * 0.005;
      const range = max - min;
      const newValue = startValue.current + delta * range;
      const clamped = Math.round(newValue / step) * step;
      onChange(Math.max(min, Math.min(max, clamped)));
    };

    const handleTouchMove = (e: TouchEvent) => {
      const delta = (startY.current - e.touches[0].clientY) * 0.005;
      const range = max - min;
      const newValue = startValue.current + delta * range;
      const clamped = Math.round(newValue / step) * step;
      onChange(Math.max(min, Math.min(max, clamped)));
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
  }, [isDragging, min, max, step, onChange]);

  const displayValue = valueLabel ?? (typeof value === 'number' ? value.toFixed(step < 1 ? 1 : 0) : String(value));

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div
        ref={knobRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="relative rounded-full cursor-pointer"
        style={{ width: size, height: size }}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
      >
        <svg width={size} height={size} viewBox="0 0 56 56" className="absolute inset-0">
          <circle cx="28" cy="28" r="24" fill="none" stroke={trackColor} strokeWidth="4" />
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${(angle + 135) / 360 * 150.8} 150.8`}
            transform="rotate(-135 28 28)"
            style={{ transition: isDragging ? 'none' : 'stroke-dasharray 0.1s ease' }}
          />
          <line
            x1="28"
            y1="28"
            x2="28"
            y2="8"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            transform={`rotate(${angle} 28 28)`}
            style={{ transition: isDragging ? 'none' : 'transform 0.1s ease' }}
          />
        </svg>
      </div>
      <span className="text-[10px] font-medium tracking-widest text-amber-400/60 uppercase">{label}</span>
      <span className="text-xs font-bold text-amber-300 tabular-nums">{displayValue}</span>
    </div>
  );
}