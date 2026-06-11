import * as React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TagStats } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

/** TagDistribution 组件属性接口 */
export interface TagDistributionProps {
  /** 标签统计数据 */
  data: TagStats[];
  /** 自定义类名 */
  className?: string;
}

/** 从 Tailwind 颜色类提取十六进制颜色的辅助函数 */
const colorClassToHex: Record<string, string> = {
  'bg-indigo-100': '#6366f1',
  'bg-blue-100': '#3b82f6',
  'bg-orange-100': '#f97316',
  'bg-red-100': '#ef4444',
  'bg-rose-100': '#f43f5e',
  'bg-purple-100': '#a855f7',
  'bg-pink-100': '#ec4899',
  'bg-cyan-100': '#06b6d4',
  'bg-amber-100': '#f59e0b',
  'bg-yellow-100': '#eab308',
  'bg-green-100': '#22c55e',
  'bg-gray-100': '#6b7280',
  'bg-emerald-100': '#10b981',
  'bg-teal-100': '#14b8a6',
  'bg-sky-100': '#0ea5e9',
  'bg-violet-100': '#8b5cf6',
  'bg-fuchsia-100': '#d946ef',
};

/** 获取扇区颜色 */
const getPieColor = (colorClass: string, index: number): string => {
  for (const key of Object.keys(colorClassToHex)) {
    if (colorClass.includes(key)) {
      return colorClassToHex[key];
    }
  }
  const fallbackColors = [
    '#6366f1',
    '#f97316',
    '#10b981',
    '#f59e0b',
    '#ec4899',
    '#3b82f6',
    '#ef4444',
    '#8b5cf6',
    '#14b8a6',
    '#8b5cf6',
  ];
  return fallbackColors[index % fallbackColors.length];
};

/** 自定义 Tooltip */
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
}) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload as TagStats;

  return (
    <div
      className={cn(
        'rounded-xl p-3 shadow-lg',
        'bg-white border border-slate-100',
        'min-w-[140px]',
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: getPieColor(data.color, 0) }}
        />
        <p className="text-xs font-medium text-slate-900">{data.tagName}</p>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-slate-500">出现次数</span>
        <span className="text-xs font-semibold text-slate-900">
          {data.count} 次
        </span>
      </div>
    </div>
  );
};

/** 自定义 Legend */
const CustomLegend: React.FC<{ payload?: Array<{ value: string; color: string; payload: TagStats }> }> = ({
  payload,
}) => {
  if (!payload) return null;

  const total = payload.reduce((sum, item) => sum + item.payload.count, 0);

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
      {payload.map((entry, index) => {
        const percentage = total > 0
          ? Math.round((entry.payload.count / total) * 100)
          : 0;
        return (
          <div key={index} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[11px] text-slate-600">
              {entry.value}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {percentage}%
            </span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * TagDistribution 影响标签分布环形图组件
 * 展示各影响标签的分布情况
 */
export const TagDistribution: React.FC<TagDistributionProps> = ({
  data,
  className,
}) => {
  const total = React.useMemo(
    () => data.reduce((sum, d) => sum + d.count, 0),
    [data],
  );

  const hasData = total > 0;

  const pieData = React.useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      fill: getPieColor(item.color, index),
    }));
  }, [data]);

  return (
    <Card className={cn('animate-fade-in-up', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <PieChartIcon className="w-4 h-4 text-accent" />
            </div>
            <CardTitle className="text-base">影响分布</CardTitle>
          </div>
          <span className="text-xs text-slate-400">共 {total} 次影响</span>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 260 }}>
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="42%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="tagName"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
                <text
                  x="50%"
                  y="38%"
                  textAnchor="middle"
                  className="fill-slate-900"
                  style={{ fontSize: 24, fontWeight: 700 }}
                >
                  {total}
                </text>
                <text
                  x="50%"
                  y="48%"
                  textAnchor="middle"
                  className="fill-slate-400"
                  style={{ fontSize: 11 }}
                >
                  总次数
                </text>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div
              className={cn(
                'w-full h-full flex flex-col items-center justify-center',
                'text-center',
              )}
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <PieChartIcon className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 font-medium">暂无数据</p>
              <p className="text-xs text-slate-400 mt-1">
                还没有足够的记录来生成分布图
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

TagDistribution.displayName = 'TagDistribution';

export default TagDistribution;
