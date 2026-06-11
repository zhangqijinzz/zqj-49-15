import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MoreHorizontal,
  Trash2,
  Clock,
  Star,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { NoiseRecord } from '@/types';
import { getNoiseTypeConfig } from '@/constants/noiseTypes';
import { getLocationConfig } from '@/constants/locations';
import { getImpactTagById } from '@/constants/impactTags';
import { formatDisplayDate, getDurationText } from '@/utils/dateUtils';
import { formatIntensityStars } from '@/utils/formatUtils';
import { Badge } from '@/components/ui/Badge';
import { useRecordsStore } from '@/store/useRecordsStore';
import { cn } from '@/lib/utils';

const LucideIcon = (name: string): React.ComponentType<{ className?: string }> => {
  const Icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  return Icons[name] ?? LucideIcons.HelpCircle;
};

const sidebarColorMap: Record<string, string> = {
  footsteps: 'bg-amber-500',
  furniture: 'bg-orange-500',
  decoration: 'bg-red-500',
  music: 'bg-purple-500',
  talking: 'bg-blue-500',
  animals: 'bg-pink-500',
  plumbing: 'bg-cyan-500',
  door: 'bg-yellow-500',
  outdoor: 'bg-green-500',
  other: 'bg-gray-500',
};

export interface RecordCardProps {
  record: NoiseRecord;
  compact?: boolean;
  className?: string;
}

export const RecordCard: React.FC<RecordCardProps> = ({
  record,
  compact = false,
  className,
}) => {
  const navigate = useNavigate();
  const deleteRecord = useRecordsStore((s) => s.deleteRecord);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const locationConfig = getLocationConfig(record.location);
  const sidebarColor = sidebarColorMap[record.noiseType] ?? 'bg-gray-500';

  const LocationIcon = LucideIcon(locationConfig.icon);
  const impactTags = record.impactTagIds
    .map((id) => getImpactTagById(id))
    .filter(Boolean);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardClick = () => {
    navigate(`/log/${record.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这条记录吗？')) {
      deleteRecord(record.id);
    }
    setMenuOpen(false);
  };

  const stars = formatIntensityStars(record.intensity);

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'card-base relative overflow-hidden cursor-pointer',
        'transition-all duration-200 ease-out',
        'hover:translate-y-[-2px] hover:shadow-md',
        compact ? 'p-3' : 'p-0',
        className,
      )}
    >
      <div className="flex">
        <div className={cn('w-1.5 shrink-0 rounded-l-xl', sidebarColor)} />

        <div className={cn('flex-1 min-w-0', compact ? 'pl-3 pr-2 py-1' : 'p-5')}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3
                className={cn(
                  'font-semibold text-slate-900 truncate',
                  compact ? 'text-sm' : 'text-base mb-2',
                )}
              >
                {record.title}
              </h3>

              {!compact && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    {formatDisplayDate(record.date)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {record.startTime} - {record.endTime}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    {getDurationText(record.durationMinutes)}
                  </span>
                </div>
              )}

              {compact && (
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>{record.startTime}</span>
                  <span>·</span>
                  <span>{getDurationText(record.durationMinutes)}</span>
                </div>
              )}
            </div>

            <div className="relative shrink-0" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1 z-10 w-32 bg-white rounded-lg shadow-lg border border-slate-100 py-1 animate-scale-in"
                >
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 inline-flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                </div>
              )}
            </div>
          </div>

          {!compact && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1 text-amber-500">
                {stars.split('').map((s, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      s === '★' ? 'fill-current' : 'fill-transparent stroke-current opacity-40',
                    )}
                  />
                ))}
              </div>

              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs">
                <LocationIcon className="w-3.5 h-3.5" />
                {locationConfig.name}
              </div>

              {impactTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {impactTags.slice(0, 3).map((tag) =>
                    tag ? (
                      <Badge key={tag.id} variant="neutral" size="sm">
                        {tag.name}
                      </Badge>
                    ) : null,
                  )}
                  {impactTags.length > 3 && (
                    <Badge variant="gray" size="sm">
                      +{impactTags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

RecordCard.displayName = 'RecordCard';

export default RecordCard;
