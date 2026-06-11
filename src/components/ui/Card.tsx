import * as React from 'react';
import { cn } from '../../lib/utils';

/* ==================== Card 根组件 ==================== */

/** Card 根组件属性接口 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 自定义类名 */
  className?: string;
  /** 子元素 */
  children?: React.ReactNode;
}

/**
 * Card 卡片根组件
 * 提供基础卡片容器样式
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>标题</CardTitle>
 *   </CardHeader>
 *   <CardContent>内容</CardContent>
 * </Card>
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'card-base',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = 'Card';

/* ==================== CardHeader 头部组件 ==================== */

/** CardHeader 头部组件属性接口 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 自定义类名 */
  className?: string;
  /** 子元素 */
  children?: React.ReactNode;
}

/**
 * CardHeader 卡片头部组件
 * 通常包含 CardTitle 和 CardDescription
 */
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('px-6 pt-6 pb-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CardHeader.displayName = 'CardHeader';

/* ==================== CardTitle 标题组件 ==================== */

/** CardTitle 标题组件属性接口 */
export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  /** 自定义类名 */
  className?: string;
  /** 子元素 */
  children?: React.ReactNode;
}

/**
 * CardTitle 卡片标题组件
 */
export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          'text-lg font-semibold text-slate-900 leading-none tracking-tight',
          className,
        )}
        {...props}
      >
        {children}
      </h3>
    );
  },
);
CardTitle.displayName = 'CardTitle';

/* ==================== CardDescription 描述组件 ==================== */

/** CardDescription 描述组件属性接口 */
export interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  /** 自定义类名 */
  className?: string;
  /** 子元素 */
  children?: React.ReactNode;
}

/**
 * CardDescription 卡片描述组件
 * 通常放置在 CardTitle 下方，提供补充说明
 */
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('mt-1.5 text-sm text-slate-500', className)}
      {...props}
    >
      {children}
    </p>
  );
});
CardDescription.displayName = 'CardDescription';

/* ==================== CardContent 内容组件 ==================== */

/** CardContent 内容组件属性接口 */
export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** 自定义类名 */
  className?: string;
  /** 子元素 */
  children?: React.ReactNode;
}

/**
 * CardContent 卡片内容组件
 * 放置卡片的主要内容区域
 */
export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('px-6 pb-6', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CardContent.displayName = 'CardContent';

/* ==================== CardFooter 底部组件 ==================== */

/** CardFooter 底部组件属性接口 */
export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** 自定义类名 */
  className?: string;
  /** 子元素 */
  children?: React.ReactNode;
}

/**
 * CardFooter 卡片底部组件
 * 通常放置操作按钮、辅助信息等
 */
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-6 py-4 border-t border-slate-100 flex items-center',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CardFooter.displayName = 'CardFooter';
