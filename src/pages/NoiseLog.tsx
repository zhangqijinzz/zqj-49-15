import * as React from 'react';
import {
  Search,
  Calendar,
  Filter,
  ChevronDown,
  X,
  RotateCcw,
  Volume2,
  FileText,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useRecordsStore, selectFilteredRecords } from '@/store/useRecordsStore';
import { noiseTypes, getNoiseTypeConfig } from '@/constants/noiseTypes';
import { impactTags, getImpactTagById } from '@/constants/impactTags';
import { groupRecordsByDate, getDurationText } from '@/utils/dateUtils';
import { formatNoiseType } from '@/utils/formatUtils';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RecordTimelineItem } from '@/components/record/RecordTimelineItem';
import type { NoiseType } from '@/types';

/**
 * NoiseLog 噪音日志页面
 * 支持筛选、搜索、分组展示所有噪音记录
 */
const NoiseLog: React.FC = () => {
  const records = useRecordsStore((s) => s.records);
  const filters = useRecordsStore((s) => s.filters);
  const setFilters = useRecordsStore((s) => s.setFilters);
  const resetFilters = useRecordsStore((s) => s.resetFilters);
  const openNewForm = useRecordsStore((s) => s.openNewForm);

  const [showNoiseTypeDropdown, setShowNoiseTypeDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowNoiseTypeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredRecords = React.useMemo(() => {
    return selectFilteredRecords(records, filters);
  }, [records, filters]);

  const groupedRecords = React.useMemo(() => {
    return groupRecordsByDate(filteredRecords);
  }, [filteredRecords]);

  const sortedDates = React.useMemo(() => {
    return Object.keys(groupedRecords).sort((a, b) => b.localeCompare(a));
  }, [groupedRecords]);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ keyword: e.target.value });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      dateRange: { ...filters.dateRange, start: e.target.value || null },
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      dateRange: { ...filters.dateRange, end: e.target.value || null },
    });
  };

  const toggleNoiseType = (type: NoiseType) => {
    const exists = filters.noiseTypes.includes(type);
    setFilters({
      noiseTypes: exists
        ? filters.noiseTypes.filter((t) => t !== type)
        : [...filters.noiseTypes, type],
    });
  };

  const toggleImpactTag = (tagId: string) => {
    const exists = filters.impactTagIds.includes(tagId);
    setFilters({
      impactTagIds: exists
        ? filters.impactTagIds.filter((id) => id !== tagId)
        : [...filters.impactTagIds, tagId],
    });
  };

  const hasActiveFilters =
    filters.keyword.trim() !== '' ||
    filters.dateRange.start !== null ||
    filters.dateRange.end !== null ||
    filters.noiseTypes.length > 0 ||
    filters.impactTagIds.length > 0;

  const formatDateHeader = (dateStr: string) => {
    const date = parseISO(dateStr);
    const weekday = format(date, 'EEEE', { locale: zhCN });
    const dateDisplay = format(date, 'M月d日', { locale: zhCN });
    const dayRecords = groupedRecords[dateStr];
    const totalCount = dayRecords.length;
    const totalMinutes = dayRecords.reduce(
      (sum, r) => sum + r.durationMinutes,
      0,
    );

    return {
      weekday,
      dateDisplay,
      totalCount,
      totalMinutes,
      isToday: dateStr === format(new Date(), 'yyyy-MM-dd'),
    };
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up" style={{ opacity: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              噪音日志
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              共 {filteredRecords.length} 条记录
              {hasActiveFilters && ' (已筛选)'}
            </p>
          </div>
          <Button icon={<FileText className="w-4 h-4" />} onClick={openNewForm}>
            新增记录
          </Button>
        </div>

        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={filters.keyword}
                    onChange={handleKeywordChange}
                    placeholder="搜索标题或描述..."
                    className={cn(
                      'w-full h-10 pl-10 pr-4 rounded-lg',
                      'border border-slate-200 bg-white',
                      'text-sm text-slate-900 placeholder:text-slate-400',
                      'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
                      'transition-all',
                    )}
                  />
                </div>

                <div className="flex gap-2">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      value={filters.dateRange.start || ''}
                      onChange={handleStartDateChange}
                      className={cn(
                        'h-10 pl-10 pr-3 rounded-lg',
                        'border border-slate-200 bg-white',
                        'text-sm text-slate-900',
                        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
                        'transition-all',
                      )}
                    />
                  </div>

                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      value={filters.dateRange.end || ''}
                      onChange={handleEndDateChange}
                      className={cn(
                        'h-10 pl-10 pr-3 rounded-lg',
                        'border border-slate-200 bg-white',
                        'text-sm text-slate-900',
                        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
                        'transition-all',
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowNoiseTypeDropdown(!showNoiseTypeDropdown)}
                    className={cn(
                      'inline-flex items-center gap-2 h-10 px-4 rounded-lg',
                      'border border-slate-200 bg-white',
                      'text-sm font-medium text-slate-700',
                      'hover:border-slate-300 hover:bg-slate-50',
                      'focus:outline-none focus:ring-2 focus:ring-primary/30',
                      'transition-all',
                    )}
                  >
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span>
                      噪音类型
                      {filters.noiseTypes.length > 0 && (
                        <span className="ml-1 text-primary">
                          ({filters.noiseTypes.length})
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-slate-400 transition-transform',
                        showNoiseTypeDropdown && 'rotate-180',
                      )}
                    />
                  </button>

                  {showNoiseTypeDropdown && (
                    <div
                      className={cn(
                        'absolute top-full left-0 z-20 mt-2',
                        'w-64 p-2 rounded-xl',
                        'bg-white border border-slate-200 shadow-lg',
                        'animate-scale-in',
                      )}
                    >
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        {noiseTypes.map((item) => {
                          const checked = filters.noiseTypes.includes(item.key);
                          return (
                            <label
                              key={item.key}
                              className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer',
                                'hover:bg-slate-50 transition-colors',
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleNoiseType(item.key)}
                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                              />
                              <span className="text-sm text-slate-700">
                                {item.name}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2">
                    {impactTags.map((tag) => {
                      const active = filters.impactTagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => toggleImpactTag(tag.id)}
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border',
                            'text-xs font-medium transition-all',
                            active
                              ? tag.color
                              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-600',
                          )}
                        >
                          {tag.name}
                          {active && (
                            <X
                              className="w-3 h-3 ml-0.5 opacity-70"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleImpactTag(tag.id);
                              }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<RotateCcw className="w-4 h-4" />}
                    onClick={resetFilters}
                  >
                    重置
                  </Button>
                )}
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  {filters.keyword.trim() && (
                    <Badge variant="neutral" size="sm">
                      搜索: {filters.keyword}
                      <button
                        onClick={() => setFilters({ keyword: '' })}
                        className="ml-1.5 opacity-60 hover:opacity-100"
                      >
                        <X className="w-3 h-3 inline" />
                      </button>
                    </Badge>
                  )}
                  {filters.dateRange.start && (
                    <Badge variant="neutral" size="sm">
                      开始: {filters.dateRange.start}
                      <button
                        onClick={() =>
                          setFilters({
                            dateRange: { ...filters.dateRange, start: null },
                          })
                        }
                        className="ml-1.5 opacity-60 hover:opacity-100"
                      >
                        <X className="w-3 h-3 inline" />
                      </button>
                    </Badge>
                  )}
                  {filters.dateRange.end && (
                    <Badge variant="neutral" size="sm">
                      结束: {filters.dateRange.end}
                      <button
                        onClick={() =>
                          setFilters({
                            dateRange: { ...filters.dateRange, end: null },
                          })
                        }
                        className="ml-1.5 opacity-60 hover:opacity-100"
                      >
                        <X className="w-3 h-3 inline" />
                      </button>
                    </Badge>
                  )}
                  {filters.noiseTypes.map((type) => (
                    <Badge key={type} variant="neutral" size="sm">
                      {formatNoiseType(type)}
                      <button
                        onClick={() => toggleNoiseType(type)}
                        className="ml-1.5 opacity-60 hover:opacity-100"
                      >
                        <X className="w-3 h-3 inline" />
                      </button>
                    </Badge>
                  ))}
                  {filters.impactTagIds.map((id) => {
                    const tag = getImpactTagById(id);
                    return tag ? (
                      <Badge key={id} variant="neutral" size="sm">
                        {tag.name}
                        <button
                          onClick={() => toggleImpactTag(id)}
                          className="ml-1.5 opacity-60 hover:opacity-100"
                        >
                          <X className="w-3 h-3 inline" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        {sortedDates.length > 0 ? (
          sortedDates.map((dateStr, dateIndex) => {
            const { weekday, dateDisplay, totalCount, totalMinutes, isToday } =
              formatDateHeader(dateStr);
            const dayRecords = groupedRecords[dateStr];

            return (
              <div
                key={dateStr}
                className="animate-fade-in-up"
                style={{ opacity: 0, animationDelay: `${dateIndex * 80}ms` }}
              >
                <div className="flex items-end justify-between mb-4 px-1">
                  <div className="flex items-baseline gap-3">
                    <h2
                      className={cn(
                        'font-serif font-bold text-2xl tracking-tight',
                        isToday ? 'text-primary' : 'text-slate-900',
                      )}
                    >
                      {weekday}
                    </h2>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isToday ? 'text-primary/70' : 'text-slate-500',
                      )}
                    >
                      {dateDisplay}
                      {isToday && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          今天
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      {totalCount} 次
                    </span>
                    <span>{getDurationText(totalMinutes)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {dayRecords.map((record, index) => (
                    <RecordTimelineItem
                      key={record.id}
                      record={record}
                      showConnector={index < dayRecords.length - 1}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div
            className={cn(
              'animate-fade-in-up',
              'rounded-2xl border-2 border-dashed border-slate-200',
              'py-16 px-8 text-center',
              'bg-white/50',
            )}
            style={{ opacity: 0 }}
          >
            <div className="mx-auto w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-5">
              <div className="relative">
                <Volume2 className="w-8 h-8 text-slate-400" />
                <div className="absolute -top-1 -right-1">
                  <FileText className="w-5 h-5 text-slate-300" />
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {hasActiveFilters ? '没有找到匹配的记录' : '还没有记录'}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
              {hasActiveFilters
                ? '尝试调整筛选条件，或重置所有筛选器查看全部记录'
                : '点击右上角"新增记录"按钮，开始记录你的第一次噪音事件'}
            </p>
            <div className="flex items-center justify-center gap-3">
              {hasActiveFilters && (
                <Button variant="secondary" onClick={resetFilters}>
                  重置筛选
                </Button>
              )}
              <Button onClick={openNewForm} icon={<Volume2 className="w-4 h-4" />}>
                新增记录
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

NoiseLog.displayName = 'NoiseLog';

export default NoiseLog;
