import * as React from 'react';
import * as LucideIcons from 'lucide-react';
import {
  impactTagsByCategory,
  impactCategoryNames,
} from '@/constants/impactTags';
import type { ImpactCategory } from '@/types';
import { cn } from '@/lib/utils';

const LucideIcon = (name: string): React.ComponentType<{ className?: string }> => {
  const Icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  return Icons[name] ?? LucideIcons.HelpCircle;
};

const categoryStyles: Record<ImpactCategory, { selected: string; outline: string; title: string }> = {
  sleep: {
    selected: 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200',
    outline: 'border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50',
    title: 'text-indigo-700',
  },
  work: {
    selected: 'bg-cyan-600 text-white border-cyan-600 shadow-cyan-200',
    outline: 'border-cyan-200 text-cyan-700 bg-white hover:bg-cyan-50',
    title: 'text-cyan-700',
  },
  emotion: {
    selected: 'bg-orange-600 text-white border-orange-600 shadow-orange-200',
    outline: 'border-orange-200 text-orange-700 bg-white hover:bg-orange-50',
    title: 'text-orange-700',
  },
  health: {
    selected: 'bg-lime-600 text-white border-lime-600 shadow-lime-200',
    outline: 'border-lime-200 text-lime-700 bg-white hover:bg-lime-50',
    title: 'text-lime-700',
  },
};

export interface ImpactTagPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}

export const ImpactTagPicker: React.FC<ImpactTagPickerProps> = ({
  selectedIds,
  onChange,
  className,
}) => {
  const handleToggle = (tagId: string) => {
    if (selectedIds.includes(tagId)) {
      onChange(selectedIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedIds, tagId]);
    }
  };

  const categories = Object.keys(impactTagsByCategory) as ImpactCategory[];

  return (
    <div className={cn('space-y-5', className)}>
      {categories.map((category) => {
        const tags = impactTagsByCategory[category];
        const styles = categoryStyles[category];
        if (!tags || tags.length === 0) return null;

        return (
          <div key={category}>
            <h4 className={cn('text-sm font-semibold mb-2.5', styles.title)}>
              {impactCategoryNames[category]}
            </h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = selectedIds.includes(tag.id);
                const TagIcon = LucideIcon(tag.icon);

                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleToggle(tag.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border',
                      'transition-all duration-200 ease-out',
                      'active:scale-95',
                      isSelected
                        ? cn(styles.selected, 'shadow-sm scale-105')
                        : styles.outline,
                    )}
                  >
                    <TagIcon className="w-4 h-4 shrink-0" />
                    <span>{tag.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

ImpactTagPicker.displayName = 'ImpactTagPicker';

export default ImpactTagPicker;
