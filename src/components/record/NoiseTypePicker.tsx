import * as React from 'react';
import * as LucideIcons from 'lucide-react';
import type { NoiseType } from '@/types';
import { noiseTypes } from '@/constants/noiseTypes';
import { cn } from '@/lib/utils';

const LucideIcon = (name: string): React.ComponentType<{ className?: string }> => {
  const Icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  return Icons[name] ?? LucideIcons.HelpCircle;
};

const selectedBgMap: Record<string, string> = {
  footsteps: 'bg-amber-50 border-amber-400 ring-2 ring-amber-200',
  furniture: 'bg-orange-50 border-orange-400 ring-2 ring-orange-200',
  decoration: 'bg-red-50 border-red-400 ring-2 ring-red-200',
  music: 'bg-purple-50 border-purple-400 ring-2 ring-purple-200',
  talking: 'bg-blue-50 border-blue-400 ring-2 ring-blue-200',
  animals: 'bg-pink-50 border-pink-400 ring-2 ring-pink-200',
  plumbing: 'bg-cyan-50 border-cyan-400 ring-2 ring-cyan-200',
  door: 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-200',
  outdoor: 'bg-green-50 border-green-400 ring-2 ring-green-200',
  other: 'bg-gray-50 border-gray-400 ring-2 ring-gray-200',
};

const selectedTextMap: Record<string, string> = {
  footsteps: 'text-amber-800',
  furniture: 'text-orange-800',
  decoration: 'text-red-800',
  music: 'text-purple-800',
  talking: 'text-blue-800',
  animals: 'text-pink-800',
  plumbing: 'text-cyan-800',
  door: 'text-yellow-800',
  outdoor: 'text-green-800',
  other: 'text-gray-800',
};

export interface NoiseTypePickerProps {
  value: NoiseType;
  onChange: (type: NoiseType) => void;
  className?: string;
}

export const NoiseTypePicker: React.FC<NoiseTypePickerProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-2 lg:grid-cols-3 gap-2.5',
        className,
      )}
    >
      {noiseTypes.map((type) => {
        const isSelected = value === type.key;
        const TypeIcon = LucideIcon(type.icon);
        const selectedBg = selectedBgMap[type.key] ?? '';
        const selectedText = selectedTextMap[type.key] ?? '';

        return (
          <button
            key={type.key}
            type="button"
            onClick={() => onChange(type.key)}
            className={cn(
              'flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2',
              'transition-all duration-200 ease-out',
              'hover:scale-[1.02] active:scale-[0.97]',
              isSelected
                ? cn(selectedBg, selectedText, 'font-semibold')
                : cn(
                    'bg-white border-slate-200 text-slate-600',
                    'hover:border-slate-300 hover:bg-slate-50',
                  ),
            )}
          >
            <TypeIcon
              className={cn(
                'w-6 h-6 shrink-0',
                isSelected ? selectedText : 'text-slate-500',
              )}
            />
            <span className="text-sm">{type.name}</span>
          </button>
        );
      })}
    </div>
  );
};

NoiseTypePicker.displayName = 'NoiseTypePicker';

export default NoiseTypePicker;
