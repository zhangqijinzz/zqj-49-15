import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * 按钮组件变体类型
 * - primary: 主按钮（实心背景）
 * - secondary: 次按钮（边框样式）
 * - accent: 强调按钮（暖色调强调）
 * - ghost: 幽灵按钮（透明背景）
 * - danger: 危险按钮（红色系）
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'ghost'
  | 'danger';

/** 按钮尺寸类型 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/** 图标位置类型 */
export type IconPosition = 'left' | 'right';

/** Button 组件属性接口 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮颜色变体 */
  variant?: ButtonVariant;
  /** 按钮尺寸 */
  size?: ButtonSize;
  /** 是否占据整行宽度 */
  fullWidth?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 图标元素 */
  icon?: React.ReactNode;
  /** 图标位置 */
  iconPosition?: IconPosition;
  /** 点击事件 */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** 自定义类名 */
  className?: string;
  /** 按钮内容 */
  children?: React.ReactNode;
  /** 按钮原生 type */
  type?: 'button' | 'submit' | 'reset';
}

/** 不同变体对应的 Tailwind 样式映射 */
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300',
  accent:
    'bg-accent text-white hover:bg-accent/90 shadow-sm hover:shadow-md',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 shadow-sm hover:shadow-md',
};

/** 不同尺寸对应的 Tailwind 样式映射 */
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 h-8',
  md: 'px-4 py-2 text-sm gap-2 h-10',
  lg: 'px-6 py-2.5 text-base gap-2 h-12',
};

/**
 * Button 按钮组件
 * 支持多种变体、尺寸、加载状态、图标位置等
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" icon={<Plus />}>
 *   新增记录
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      disabled = false,
      loading = false,
      icon,
      iconPosition = 'left',
      onClick,
      className,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    /** 是否禁用（包含加载状态） */
    const isDisabled = disabled || loading;

    /** 处理点击事件 */
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    /** 渲染图标内容 */
    const renderIcon = () => {
      if (loading) {
        return <Loader2 className="animate-spin w-4 h-4 shrink-0" />;
      }
      return icon ? <span className="shrink-0">{icon}</span> : null;
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={handleClick}
        className={cn(
          // 基础样式
          'inline-flex items-center justify-center',
          'font-medium rounded-lg',
          'transition-all duration-200 ease-out',
          'hover:translate-y-[-1px]',
          'active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
          // 禁用状态
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100',
          // 变体 + 尺寸
          variantStyles[variant],
          sizeStyles[size],
          // 宽度
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {/* 图标在左侧 */}
        {iconPosition === 'left' && renderIcon()}
        {/* 文本内容 */}
        {children && <span className="truncate">{children}</span>}
        {/* 图标在右侧 */}
        {iconPosition === 'right' && renderIcon()}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
