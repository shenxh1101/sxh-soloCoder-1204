import { useState } from 'react';
import { Save, Trash2, Download } from 'lucide-react';
import { useMixerStore } from '@/stores/mixerStore';
import { usePresetStore } from '@/stores/presetStore';
import type { Preset } from '@/types/mixer';

export default function PresetManager() {
  const [name, setName] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const bpm = useMixerStore((s) => s.bpm);
  const tracks = useMixerStore((s) => s.tracks);
  const masterEq = useMixerStore((s) => s.masterEq);
  const loadState = useMixerStore((s) => s.loadState);
  const presets = usePresetStore((s) => s.presets);
  const savePreset = usePresetStore((s) => s.savePreset);
  const deletePreset = usePresetStore((s) => s.deletePreset);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      showMessage('请输入预设名称');
      return;
    }
    savePreset(trimmed, { bpm, tracks, masterEq });
    setName('');
    showMessage(`预设 "${trimmed}" 已保存`);
  };

  const handleLoad = () => {
    if (!selectedPresetId) {
      showMessage('请先选择一个预设');
      return;
    }
    const preset = presets.find((p) => p.id === selectedPresetId);
    if (preset) {
      loadState(preset.state);
      showMessage(`预设 "${preset.name}" 已加载`);
    }
  };

  const handleDelete = () => {
    if (!selectedPresetId) return;
    const preset = presets.find((p) => p.id === selectedPresetId);
    deletePreset(selectedPresetId);
    setSelectedPresetId(null);
    if (preset) {
      showMessage(`预设 "${preset.name}" 已删除`);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(presets, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mixer-presets.json';
    a.click();
    URL.revokeObjectURL(url);
    showMessage('预设已导出');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string) as Preset[];
          if (!Array.isArray(imported)) throw new Error('Invalid format');
          imported.forEach((p) => {
            savePreset(p.name, p.state);
          });
          showMessage(`已导入 ${imported.length} 个预设`);
        } catch {
          showMessage('导入失败：无效的预设文件');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="relative flex items-center gap-4 px-6 py-3 bg-[#0d0d1a] border-t border-white/5">
      <span className="text-[10px] font-bold tracking-widest text-amber-400/60 uppercase whitespace-nowrap">PRESETS</span>

      <select
        value={selectedPresetId ?? ''}
        onChange={(e) => setSelectedPresetId(e.target.value || null)}
        className="bg-[#1a1a2e] border border-white/10 rounded px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:border-amber-500/50 min-w-[140px]"
      >
        <option value="">-- 选择预设 --</option>
        {presets.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        placeholder="预设名称..."
        className="bg-[#1a1a2e] border border-white/10 rounded px-3 py-1.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-amber-500/50 min-w-[120px]"
      />

      <button
        onClick={handleSave}
        className="flex items-center gap-1 px-3 py-1.5 rounded bg-amber-600/20 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-600/30 transition-all duration-150"
      >
        <Save size={12} />
        保存
      </button>

      <button
        onClick={handleLoad}
        className="flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-600/30 transition-all duration-150"
      >
        <Download size={12} />
        加载
      </button>

      <button
        onClick={handleDelete}
        className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-600/30 transition-all duration-150 disabled:opacity-30"
        disabled={!selectedPresetId}
      >
        <Trash2 size={12} />
        删除
      </button>

      <div className="flex-1" />

      <button
        onClick={handleExport}
        className="text-[10px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider"
      >
        导出
      </button>

      <button
        onClick={handleImport}
        className="text-[10px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider"
      >
        导入
      </button>

      {message && (
        <div className="absolute bottom-full left-0 right-0 text-center pb-2">
          <span className="inline-block px-3 py-1 rounded bg-amber-500/20 text-amber-400 text-xs animate-pulse">
            {message}
          </span>
        </div>
      )}
    </div>
  );
}