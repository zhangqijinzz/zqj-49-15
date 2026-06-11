import * as React from 'react';
import * as LucideIcons from 'lucide-react';
import type { LocationTag } from '@/types';
import { locations } from '@/constants/locations';
import { cn } from '@/lib/utils';

const LucideIcon = (name: string): React.ComponentType<{ className?: string }> => {
  const Icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  return Icons[name] ?? LucideIcons.HelpCircle;
};

export interface LocationPickerProps {
  value: LocationTag;
  onChange: (location: LocationTag) => void;
  className?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-2',
        className,
      )}
    >
      {locations.map((loc) => {
        const isSelected = value === loc.key;
        const LocIcon = LucideIcon(loc.icon);

        return (
          <button
            key={loc.key}
            type="button"
            onClick={() => onChange(loc.key)}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border',
              'transition-all duration-200 ease-out',
              'hover:scale-[1.03] active:scale-[0.97]',
              isSelected
                ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
            )}
          >
            <LocIcon className="w-4 h-4 shrink-0" />
            <span>{loc.name}</span>
          </button>
        );
      })}
    </div>
  );
};

LocationPicker.displayName = 'LocationPicker';

export default LocationPicker;
