import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

/** 面包屑项类型 */
interface BreadcrumbItem {
  /** 显示名称 */
  label: string;
  /** 是否为当前页 */
  active?: boolean;
}

/** Topbar 组件属性接口 */
export interface TopbarProps {
  /** 自定义类名 */
  className?: string;
  /** 新增记录按钮点击回调 */
  onNewRecord?: () => void;
  /** 自定义页面标题（覆盖自动推导） */
  title?: string;
  /** 自定义面包屑（覆盖自动推导） */
  breadcrumbs?: BreadcrumbItem[];
}

/** 路由路径与页面标题的映射表 */
const PATH_TITLE_MAP: Record<string, string> = {
  '/': '首页仪表盘',
  '/log': '噪音日志',
  '/export': '汇总导出',
};

/**
 * 根据当前路由路径自动推导面包屑
 * @param pathname 当前路由路径
 */
function deriveBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const title = PATH_TITLE_MAP[pathname] ?? '未知页面';

  return [
    {
      label: '首页',
      active: pathname === '/',
    },
    ...(pathname !== '/'
      ? [
          {
            label: title,
            active: true,
          },
        ]
      : []),
  ];
}

/**
 * Topbar 顶部工具栏组件
 * 左侧显示面包屑风格的页面标题，右侧为新增记录按钮
 *
 * @example
 * ```tsx
 * <Topbar onNewRecord={() => setFormOpen(true)} />
 * ```
 */
export const Topbar: React.FC<TopbarProps> = ({
  className,
  onNewRecord,
  title,
  breadcrumbs,
}) => {
  const location = useLocation();

  // 计算面包屑数据
  const crumbs = breadcrumbs ?? deriveBreadcrumbs(location.pathname);
  // 计算当前页标题（取最后一个激活项的 label）
  const currentTitle =
    title ??
    (crumbs.find((c) => c.active)?.label ||
      PATH_TITLE_MAP[location.pathname] ||
      '页面');

  return (
    <header
      className={cn(
        // 固定定位 + 尺寸
        'sticky top-0 z-20 h-16 w-full',
        // 背景 + 阴影
        'bg-white/80 backdrop-blur shadow-sm',
        // 边框（仅底部）
        'border-b border-slate-100',
        className,
      )}
    >
      <div className="h-full px-4 md:px-8 flex items-center justify-between gap-4">
        {/* ============== 左侧：页面标题（面包屑风格） ============== */}
        <div className="flex-1 min-w-0">
          {/* 面包屑导航（仅桌面端显示完整路径） */}
          <nav
            className="hidden md:flex items-center gap-1 text-sm mb-0.5"
            aria-label="面包屑"
          >
            {crumbs.map((crumb, index) => (
              <React.Fragment key={`${crumb.label}-${index}`}>
                {/* 分隔符（除第一个外） */}
                {index > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                )}
                <span
                  className={cn(
                    'truncate',
                    crumb.active
                      ? 'text-slate-900 font-medium'
                      : 'text-slate-400',
                  )}
                >
                  {crumb.label}
                </span>
              </React.Fragment>
            ))}
          </nav>

          {/* 页面主标题（移动端 + 桌面端） */}
          <h2 className="font-serif text-lg md:text-xl font-semibold text-slate-900 truncate">
            {currentTitle}
          </h2>
        </div>

        {/* ============== 右侧：操作按钮 ============== */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 新增记录按钮 */}
          <Button
            variant="accent"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={onNewRecord}
            className="shadow-sm shadow-accent/20"
          >
            <span className="hidden sm:inline">新增记录</span>
            <span className="sm:hidden">新增</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

Topbar.displayName = 'Topbar';

export default Topbar;
