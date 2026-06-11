import Knob from './Knob';
import { useMixerStore } from '@/stores/mixerStore';
import { audioEngine } from '@/lib/audioEngine';

export default function MasterEQ() {
  const masterEq = useMixerStore((s) => s.masterEq);
  const setMasterEq = useMixerStore((s) => s.setMasterEq);

  const handleLowChange = (value: number) => {
    setMasterEq({ lowGain: value });
    audioEngine.setMasterEqLow(value);
  };

  const handleHighChange = (value: number) => {
    setMasterEq({ highGain: value });
    audioEngine.setMasterEqHigh(value);
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-[10px] font-bold tracking-widest text-amber-400/60 uppercase">MASTER EQ</span>
      <div className="flex gap-1">
        <Knob
          value={masterEq.lowGain}
          min={-12}
          max={12}
          step={0.5}
          size={44}
          label="LOW"
          valueLabel={`${masterEq.lowGain > 0 ? '+' : ''}${masterEq.lowGain.toFixed(1)}dB`}
          onChange={handleLowChange}
          color="#e8a850"
        />
        <Knob
          value={masterEq.highGain}
          min={-12}
          max={12}
          step={0.5}
          size={44}
          label="HIGH"
          valueLabel={`${masterEq.highGain > 0 ? '+' : ''}${masterEq.highGain.toFixed(1)}dB`}
          onChange={handleHighChange}
          color="#e8a850"
        />
      </div>
    </div>
  );
}