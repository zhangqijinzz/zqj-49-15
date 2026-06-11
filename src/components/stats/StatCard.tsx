import * as React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

/** 颜色方案类型 */
export type StatColorScheme = 'primary' | 'accent' | 'success' | 'warning';

/** 趋势数据接口 */
export interface StatTrend {
  /** 趋势数值（百分比或绝对值） */
  value: string | number;
  /** 趋势方向 */
  direction: 'up' | 'down' | 'flat';
}

/** StatCard 组件属性接口 */
export interface StatCardProps {
  /** 图标（lucide ReactNode） */
  icon: React.ReactNode;
  /** 标题 */
  title: string;
  /** 主要数值 */
  value: string | number;
  /** 副标题数值 */
  subValue?: string;
  /** 趋势数据 */
  trend?: StatTrend;
  /** 颜色方案 */
  colorScheme: StatColorScheme;
  /** 自定义类名 */
  className?: string;
  /** 动画延迟（毫秒） */
  animationDelay?: number;
}

/** 颜色方案对应的样式映射 */
const colorSchemeStyles: Record<
  StatColorScheme,
  {
    bar: string;
    iconBg: string;
    iconColor: string;
    trendUp: string;
    trendDown: string;
  }
> = {
  primary: {
    bar: 'bg-gradient-to-r from-primary-600 to-primary-400',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    trendUp: 'text-primary',
    trendDown: 'text-rose-600',
  },
  accent: {
    bar: 'bg-gradient-to-r from-accent-600 to-accent-400',
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
    trendUp: 'text-accent',
    trendDown: 'text-rose-600',
  },
  success: {
    bar: 'bg-gradient-to-r from-success-600 to-success-400',
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    trendUp: 'text-success',
    trendDown: 'text-rose-600',
  },
  warning: {
    bar: 'bg-gradient-to-r from-warning-600 to-warning-400',
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    trendUp: 'text-warning',
    trendDown: 'text-success',
  },
};

/**
 * StatCard 统计卡片组件
 * 展示关键统计数据，支持图标、趋势、副标题等
 */
export const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  subValue,
  trend,
  colorScheme,
  className,
  animationDelay = 0,
}) => {
  const styles = colorSchemeStyles[colorScheme];

  const renderTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="w-3.5 h-3.5 shrink-0" />;
      case 'down':
        return <TrendingDown className="w-3.5 h-3.5 shrink-0" />;
      default:
        return <Minus className="w-3.5 h-3.5 shrink-0" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.direction === 'flat') return 'text-slate-500';
    return trend.direction === 'up' ? styles.trendUp : styles.trendDown;
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl',
        'bg-white border border-slate-100',
        'shadow-sm hover:shadow-md',
        'transition-all duration-300 ease-out',
        'hover:translate-y-[-2px]',
        'animate-fade-in-up',
        className,
      )}
      style={{
        animationDelay: `${animationDelay}ms`,
        opacity: 0,
      }}
    >
      <div className={cn('h-1 w-full', styles.bar)} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'shrink-0 w-12 h-12 rounded-xl',
              'flex items-center justify-center',
              styles.iconBg,
              styles.iconColor,
            )}
          >
            {icon}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-500 truncate">
              {title}
            </p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {value}
              </span>
              {subValue && (
                <span className="text-xs text-slate-400">{subValue}</span>
              )}
            </div>
          </div>
        </div>

        {trend && (
          <div className="mt-4 pt-4 border-t border-slate-50">
            <div
              className={cn(
                'inline-flex items-center gap-1',
                'text-xs font-medium',
                getTrendColor(),
              )}
            >
              {renderTrendIcon()}
              <span>{trend.value}</span>
              <span className="text-slate-400 font-normal ml-1">较上周</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

StatCard.displayName = 'StatCard';

export default StatCard;
