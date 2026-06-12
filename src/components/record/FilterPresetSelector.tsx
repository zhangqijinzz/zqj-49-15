import * as React from 'react';
import { BookMarked, ChevronDown, Plus, Settings, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { FilterPreset } from '@/types';

export interface FilterPresetSelectorProps {
  presets: FilterPreset[];
  activePresetId: string | null;
  onSelectPreset: (id: string) => void;
  onSavePreset: () => void;
  onManagePresets: () => void;
}

export const FilterPresetSelector: React.FC<FilterPresetSelectorProps> = ({
  presets,
  activePresetId,
  onSelectPreset,
  onSavePreset,
  onManagePresets,
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const sortedPresets = React.useMemo(() => {
    return [...presets].sort((a, b) => a.order - b.order);
  }, [presets]);

  const activePreset = presets.find((p) => p.id === activePresetId);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={cn(
            'inline-flex items-center gap-2 h-10 px-4 rounded-lg',
            'border border-slate-200 bg-white',
            'text-sm font-medium text-slate-700',
            'hover:border-slate-300 hover:bg-slate-50',
            'focus:outline-none focus:ring-2 focus:ring-primary/30',
            'transition-all',
          )}
        >
          <BookMarked className="w-4 h-4 text-slate-400" />
          <span className="max-w-[140px] truncate">
            {activePreset ? activePreset.name : '筛选方案'}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-slate-400 transition-transform',
              showDropdown && 'rotate-180',
            )}
          />
        </button>

        <Button
          size="sm"
          variant="secondary"
          icon={<Plus className="w-4 h-4" />}
          onClick={onSavePreset}
        >
          保存方案
        </Button>
      </div>

      {showDropdown && (
        <div
          className={cn(
            'absolute top-full left-0 z-20 mt-2',
            'w-64 rounded-xl',
            'bg-white border border-slate-200 shadow-lg',
            'animate-scale-in',
          )}
        >
          {sortedPresets.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-slate-500">还没有保存方案</p>
              <p className="text-xs text-slate-400 mt-1">
                点击「保存方案」创建一个
              </p>
            </div>
          ) : (
            <div className="py-1 max-h-64 overflow-y-auto">
              {sortedPresets.map((preset) => {
                const isActive = preset.id === activePresetId;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset.id);
                      setShowDropdown(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left',
                      'hover:bg-slate-50 transition-colors',
                      isActive && 'bg-primary/5',
                    )}
                  >
                    <span className="w-4 shrink-0">
                      {isActive && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span
                        className={cn(
                          'block text-sm truncate',
                          isActive ? 'text-primary font-medium' : 'text-slate-700',
                        )}
                      >
                        {preset.name}
                      </span>
                      <span className="block text-xs text-slate-400 truncate">
                        {preset.filters.noiseTypes.length} 种类型 ·{' '}
                        {preset.filters.impactTagIds.length} 个标签
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="border-t border-slate-100 py-1">
            <button
              onClick={() => {
                onManagePresets();
                setShowDropdown(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">管理方案</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

FilterPresetSelector.displayName = 'FilterPresetSelector';

export default FilterPresetSelector;
