import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Volume2,
  Star,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NoiseRecord } from '@/types';
import { getNoiseTypeConfig } from '@/constants/noiseTypes';
import { getLocationConfig } from '@/constants/locations';
import { getImpactTagById } from '@/constants/impactTags';
import {
  formatNoiseType,
  formatLocation,
  truncateText,
} from '@/utils/formatUtils';
import { getDurationText } from '@/utils/dateUtils';

export interface RecordTimelineItemProps {
  record: NoiseRecord;
  showConnector?: boolean;
  className?: string;
}

export const RecordTimelineItem: React.FC<RecordTimelineItemProps> = ({
  record,
  showConnector = true,
  className,
}) => {
  const navigate = useNavigate();
  const noiseConfig = getNoiseTypeConfig(record.noiseType);

  const impactTags = record.impactTagIds
    .map((id) => getImpactTagById(id))
    .filter(Boolean)
    .slice(0, 3);

  const handleClick = () => {
    navigate(`/log/${record.id}`);
  };

  return (
    <div className={cn('relative group', className)}>
      {showConnector && (
        <div className="absolute left-[22px] top-14 bottom-[-16px] w-px bg-slate-200 group-last:hidden" />
      )}

      <div
        onClick={handleClick}
        className={cn(
          'relative flex gap-4 p-4 rounded-xl',
          'bg-white border border-slate-100 shadow-sm',
          'cursor-pointer transition-all duration-200',
          'hover:shadow-md hover:translate-y-[-1px] hover:border-slate-200',
          'animate-fade-in-up',
        )}
      >
        <div
          className={cn(
            'relative z-10 shrink-0 w-11 h-11 rounded-xl flex items-center justify-center',
            noiseConfig.color,
          )}
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <Volume2 className="w-4 h-4" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-semibold text-slate-900 text-sm truncate group-hover:text-primary transition-colors">
                {record.title}
              </h4>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {record.startTime} - {record.endTime}
                  <span className="text-slate-400 mx-1">·</span>
                  {getDurationText(record.durationMinutes)}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" />
                  {formatLocation(record.location)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={cn(
                  'inline-flex items-center gap-0.5 text-amber-500',
                  'text-xs font-medium',
                )}
                title={`强度 ${record.intensity} / 5`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>{record.intensity}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </div>

          {record.description && (
            <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {truncateText(record.description, 80)}
            </p>
          )}

          {(impactTags.length > 0 || record.evidenceIds.length > 0) && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border',
                  noiseConfig.color,
                )}
              >
                {formatNoiseType(record.noiseType)}
              </span>
              {impactTags.map((tag) =>
                tag ? (
                  <span
                    key={tag.id}
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border',
                      tag.color,
                    )}
                  >
                    {tag.name}
                  </span>
                ) : null,
              )}
              {record.evidenceIds.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  {record.evidenceIds.length} 份证据
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

RecordTimelineItem.displayName = 'RecordTimelineItem';

export default RecordTimelineItem;
