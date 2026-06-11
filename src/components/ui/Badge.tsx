import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * 标签组件变体类型
 * - primary: 主色调（蓝紫色系）
 * - accent: 强调色（暖橙/粉色系）
 * - success: 成功（绿色）
 * - warning: 警告（黄色）
 * - danger: 危险（红色）
 * - neutral: 中性（深蓝灰）
 * - gray: 灰色
 */
export type BadgeVariant =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'gray';

/** 标签尺寸类型 */
export type BadgeSize = 'sm' | 'md' | 'lg';

/** Badge 组件属性接口 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 标签颜色变体 */
  variant?: BadgeVariant;
  /** 标签尺寸 */
  size?: BadgeSize;
  /** 自定义类名 */
  className?: string;
  /** 标签内容 */
  children?: React.ReactNode;
}

/** 不同变体对应的 Tailwind 样式映射 */
const variantStyles: Record<BadgeVariant, string> = {
  primary:
    'bg-primary/10 text-primary border-primary/20',
  accent:
    'bg-accent/10 text-accent border-accent/20',
  success:
    'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning:
    'bg-amber-50 text-amber-700 border-amber-200',
  danger:
    'bg-rose-50 text-rose-700 border-rose-200',
  neutral:
    'bg-slate-50 text-slate-700 border-slate-200',
  gray:
    'bg-slate-100 text-slate-600 border-slate-200',
};

/** 不同尺寸对应的 Tailwind 样式映射 */
const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

/**
 * Badge 标签组件
 * 用于状态标记、分类标识等场景
 *
 * @example
 * ```tsx
 * <Badge variant="primary" size="md">已完成</Badge>
 * ```
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-full border shrink-0',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';

export default Badge;
