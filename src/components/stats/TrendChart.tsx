import * as React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  type TooltipProps,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DailyStats } from '@/types';
import { getDurationText } from '@/utils/dateUtils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart3 } from 'lucide-react';

/** TrendChart 组件属性接口 */
export interface TrendChartProps {
  /** 近7天统计数据 */
  data: DailyStats[];
  /** 自定义类名 */
  className?: string;
}

/** 自定义 Tooltip 内容 */
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
}) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload as DailyStats & { displayDate: string };

  return (
    <div
      className={cn(
        'rounded-xl p-3 shadow-lg',
        'bg-white border border-slate-100',
        'min-w-[180px]',
      )}
    >
      <p className="text-xs font-medium text-slate-900 mb-2">
        {data.displayDate}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">事件次数</span>
          <span className="text-xs font-semibold text-slate-900">
            {data.count} 次
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">总时长</span>
          <span className="text-xs font-semibold text-slate-900">
            {getDurationText(data.totalMinutes)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">平均强度</span>
          <span className="text-xs font-semibold text-slate-900">
            {data.avgIntensity > 0 ? data.avgIntensity.toFixed(1) : '-'} / 5
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * TrendChart 7天趋势柱状图组件
 * 展示最近7天的噪音事件统计趋势
 */
export const TrendChart: React.FC<TrendChartProps> = ({ data, className }) => {
  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      displayDate: format(parseISO(item.date), 'M月d日 EEEE', {
        locale: zhCN,
      }),
      shortDate: format(parseISO(item.date), 'MM/dd'),
    }));
  }, [data]);

  const hasData = data.some((d) => d.count > 0);

  return (
    <Card className={cn('animate-fade-in-up', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-base">近7天趋势</CardTitle>
          </div>
          <span className="text-xs text-slate-400">
            共 {data.reduce((sum, d) => sum + d.count, 0)} 次事件
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 260 }}>
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a3a4a" />
                    <stop offset="100%" stopColor="#ff7a45" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="shortDate"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar
                  dataKey="count"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              className={cn(
                'w-full h-full flex flex-col items-center justify-center',
                'text-center',
              )}
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 font-medium">暂无数据</p>
              <p className="text-xs text-slate-400 mt-1">
                还没有足够的记录来生成趋势图
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

TrendChart.displayName = 'TrendChart';

export default TrendChart;
