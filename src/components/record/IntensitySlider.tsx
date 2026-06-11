import * as React from 'react';
import { cn } from '@/lib/utils';

type IntensityLevel = 1 | 2 | 3 | 4 | 5;

const intensityConfig: Record<IntensityLevel, { label: string; desc: string; color: string; ring: string }> = {
  1: {
    label: '1级',
    desc: '轻微',
    color: 'bg-emerald-500',
    ring: 'ring-emerald-200',
  },
  2: {
    label: '2级',
    desc: '轻度',
    color: 'bg-lime-500',
    ring: 'ring-lime-200',
  },
  3: {
    label: '3级',
    desc: '中度',
    color: 'bg-amber-500',
    ring: 'ring-amber-200',
  },
  4: {
    label: '4级',
    desc: '重度',
    color: 'bg-orange-500',
    ring: 'ring-orange-200',
  },
  5: {
    label: '5级',
    desc: '极重',
    color: 'bg-rose-500',
    ring: 'ring-rose-200',
  },
};

export interface IntensitySliderProps {
  value: IntensityLevel;
  onChange: (value: IntensityLevel) => void;
  className?: string;
}

export const IntensitySlider: React.FC<IntensitySliderProps> = ({
  value,
  onChange,
  className,
}) => {
  const [hoveredLevel, setHoveredLevel] = React.useState<IntensityLevel | null>(null);
  const displayLevel = hoveredLevel ?? value;
  const config = intensityConfig[displayLevel];

  const levels: IntensityLevel[] = [1, 2, 3, 4, 5];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-center gap-6">
        {levels.map((level) => {
          const isSelected = value === level;
          const levelConfig = intensityConfig[level];

          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              onMouseEnter={() => setHoveredLevel(level)}
              onMouseLeave={() => setHoveredLevel(null)}
              className={cn(
                'w-12 h-12 rounded-full shrink-0',
                'transition-all duration-200 ease-out',
                'hover:scale-110 active:scale-95',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
                isSelected
                  ? cn(levelConfig.color, 'ring-4', levelConfig.ring, 'scale-110 shadow-lg shadow-black/10')
                  : cn(
                      'bg-slate-100 border-2 border-slate-200',
                      'hover:border-slate-300',
                    ),
              )}
              title={`${levelConfig.label} - ${levelConfig.desc}`}
            >
              <span
                className={cn(
                  'block text-xs font-bold',
                  isSelected ? 'text-white' : 'text-slate-500',
                )}
              >
                {level}
              </span>
            </button>
          );
        })}
      </div>

      <div className="text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50">
          <span className={cn('w-2.5 h-2.5 rounded-full', config.color)} />
          <span className="text-sm font-medium text-slate-700">
            {config.label}
          </span>
          <span className="text-sm text-slate-500">
            · {config.desc}
          </span>
        </span>
      </div>
    </div>
  );
};

IntensitySlider.displayName = 'IntensitySlider';

export default IntensitySlider;
