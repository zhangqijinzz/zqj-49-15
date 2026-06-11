import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  Tag,
  Moon,
  Plus,
  Sparkles,
  ArrowRight,
  Volume2,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useRecordsStore } from '@/store/useRecordsStore';
import { getImpactTagById } from '@/constants/impactTags';
import {
  getDateRangeByWeek,
  getLast7Days,
  getDatesInRange,
  isNightTime,
  getDurationText,
  formatDisplayDate,
} from '@/utils/dateUtils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/stats/StatCard';
import { TrendChart } from '@/components/stats/TrendChart';
import { TagDistribution } from '@/components/stats/TagDistribution';
import { RecordTimelineItem } from '@/components/record/RecordTimelineItem';
import type { DailyStats, TagStats } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Dashboard 首页仪表盘页面
 * 展示统计概览、趋势图表和最近记录
 */
const Dashboard: React.FC = () => {
  const records = useRecordsStore((s) => s.records);
  const openNewForm = useRecordsStore((s) => s.openNewForm);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const { start: weekStart, end: weekEnd } = getDateRangeByWeek(today);
  const lastWeekStart = format(
    new Date(parseISO(weekStart).getTime() - 7 * 24 * 60 * 60 * 1000),
    'yyyy-MM-dd',
  );
  const lastWeekEnd = format(
    new Date(parseISO(weekEnd).getTime() - 7 * 24 * 60 * 60 * 1000),
    'yyyy-MM-dd',
  );

  const weekRecords = React.useMemo(
    () =>
      records.filter(
        (r) => r.date >= weekStart && r.date <= weekEnd,
      ),
    [records, weekStart, weekEnd],
  );

  const lastWeekRecords = React.useMemo(
    () =>
      records.filter(
        (r) => r.date >= lastWeekStart && r.date <= lastWeekEnd,
      ),
    [records, lastWeekStart, lastWeekEnd],
  );

  const calWeekEvents = weekRecords.length;
  const lastWeekEvents = lastWeekRecords.length;

  const totalWeekMinutes = weekRecords.reduce(
    (sum, r) => sum + r.durationMinutes,
    0,
  );

  const eventChange =
    lastWeekEvents > 0
      ? Math.round(((calWeekEvents - lastWeekEvents) / lastWeekEvents) * 100)
      : calWeekEvents > 0
        ? 100
        : 0;
  const eventDirection: 'up' | 'down' | 'flat' =
    eventChange > 0 ? 'up' : eventChange < 0 ? 'down' : 'flat';

  const tagCountMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    weekRecords.forEach((r) => {
      r.impactTagIds.forEach((id) => {
        map[id] = (map[id] || 0) + 1;
      });
    });
    return map;
  }, [weekRecords]);

  let topNoiseTag = '暂无';
  let maxCount = 0;
  Object.entries(tagCountMap).forEach(([id, count]) => {
    if (count > maxCount) {
      maxCount = count;
      const tag = getImpactTagById(id);
      if (tag) topNoiseTag = tag.name;
    }
  });

  const nightEventCount = weekRecords.filter((r) =>
    isNightTime(r.startTime),
  ).length;

  const dailyStats: DailyStats[] = React.useMemo(() => {
    const { start, end } = getLast7Days();
    const dates = getDatesInRange(start, end);

    return dates.map((date) => {
      const dayRecords = records.filter((r) => r.date === date);
      const count = dayRecords.length;
      const totalMinutes = dayRecords.reduce(
        (sum, r) => sum + r.durationMinutes,
        0,
      );
      const avgIntensity =
        count > 0
          ? dayRecords.reduce((sum, r) => sum + r.intensity, 0) / count
          : 0;

      return {
        date,
        count,
        totalMinutes,
        avgIntensity,
      };
    });
  }, [records]);

  const tagStats: TagStats[] = React.useMemo(() => {
    const map: Record<string, { count: number; color: string; name: string }> =
      {};
    records.forEach((r) => {
      r.impactTagIds.forEach((id) => {
        const tag = getImpactTagById(id);
        if (tag) {
          if (!map[id]) {
            map[id] = { count: 0, color: tag.color, name: tag.name };
          }
          map[id].count++;
        }
      });
    });

    return Object.entries(map).map(([tagId, data]) => ({
      tagId,
      tagName: data.name,
      count: data.count,
      color: data.color,
    }));
  }, [records]);

  const recentRecords = React.useMemo(() => {
    return [...records]
      .sort((a, b) => {
        const timeA = `${a.date} ${a.startTime}`;
        const timeB = `${b.date} ${b.startTime}`;
        return timeB.localeCompare(timeA);
      })
      .slice(0, 5);
  }, [records]);

  const displayDate = format(today, 'yyyy年M月d日 EEEE', { locale: zhCN });
  const greetingHour = today.getHours();
  const greeting =
    greetingHour < 6
      ? '夜深了'
      : greetingHour < 12
        ? '早上好'
        : greetingHour < 18
          ? '下午好'
          : '晚上好';

  return (
    <div className="space-y-6">
      <section
        className="animate-fade-in-up"
        style={{ opacity: 0, animationDelay: '0ms' }}
      >
        <div
          className={cn(
            'rounded-2xl overflow-hidden relative',
            'bg-gradient-to-br from-primary-800 via-primary-700 to-accent-600',
            'p-6 md:p-8 text-white',
            'shadow-lg',
          )}
        >
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <div className="absolute top-8 right-8 w-48 h-48 rounded-full bg-white blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                <Sparkles className="w-4 h-4" />
                <span>{displayDate}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {greeting}，今天感觉安静吗？
              </h1>
              <p className="mt-2 text-white/70 text-sm md:text-base">
                本周已记录 {calWeekEvents} 次噪音事件，希望你能拥有更多宁静时光。
              </p>
            </div>
            <Button
              size="lg"
              variant="accent"
              icon={<Plus className="w-5 h-5" />}
              onClick={openNewForm}
              className="shadow-lg shadow-accent/30 shrink-0"
            >
              新增记录
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<CalendarDays className="w-5 h-5" />}
          title="本周事件次数"
          value={calWeekEvents}
          subValue="次"
          trend={{
            value: `${Math.abs(eventChange)}%`,
            direction: eventDirection,
          }}
          colorScheme="primary"
          animationDelay={80}
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          title="累计受扰时长"
          value={getDurationText(totalWeekMinutes)}
          colorScheme="accent"
          animationDelay={160}
        />
        <StatCard
          icon={<Tag className="w-5 h-5" />}
          title="最频繁干扰"
          value={topNoiseTag}
          colorScheme="success"
          animationDelay={240}
        />
        <StatCard
          icon={<Moon className="w-5 h-5" />}
          title="夜间打扰次数"
          value={nightEventCount}
          subValue="次"
          colorScheme="warning"
          animationDelay={320}
        />
      </section>

      <section
        className="animate-fade-in-up"
        style={{ opacity: 0, animationDelay: '400ms' }}
      >
        <Card className="border-dashed">
          <CardContent className="py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl shrink-0',
                    'bg-gradient-to-br from-primary to-accent',
                    'flex items-center justify-center',
                    'shadow-md',
                  )}
                >
                  <Volume2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    快速记录噪音
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    记录每一次干扰，帮助维护自己的权益
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button variant="secondary" onClick={openNewForm}>
                  快速录入
                </Button>
                <Button
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={openNewForm}
                  className="shadow-md shadow-primary/20"
                >
                  开始记录
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          style={{ opacity: 0, animationDelay: '480ms' }}
          className="animate-fade-in-up"
        >
          <TrendChart data={dailyStats} />
        </div>
        <div
          style={{ opacity: 0, animationDelay: '560ms' }}
          className="animate-fade-in-up"
        >
          <TagDistribution data={tagStats} />
        </div>
      </section>

      <section
        className="animate-fade-in-up"
        style={{ opacity: 0, animationDelay: '640ms' }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>最近记录</CardTitle>
              <Link
                to="/log"
                className={cn(
                  'inline-flex items-center gap-1',
                  'text-sm font-medium text-primary hover:text-primary/80',
                  'transition-colors',
                )}
              >
                查看全部
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentRecords.length > 0 ? (
              <div className="space-y-3">
                {recentRecords.map((record, index) => (
                  <RecordTimelineItem
                    key={record.id}
                    record={record}
                    showConnector={index < recentRecords.length - 1}
                  />
                ))}
              </div>
            ) : (
              <div
                className={cn(
                  'py-12 text-center',
                  'rounded-xl border-2 border-dashed border-slate-200',
                )}
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Volume2 className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">
                  还没有噪音记录
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  点击上方按钮开始记录
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

Dashboard.displayName = 'Dashboard';

export default Dashboard;
