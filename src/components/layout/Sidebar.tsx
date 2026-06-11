import * as React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileBarChart,
  Volume2,
  Plus,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

/** 导航菜单项配置类型 */
interface NavItem {
  /** 路由路径 */
  to: string;
  /** 菜单图标 */
  icon: React.ComponentType<{ className?: string }>;
  /** 菜单名称 */
  label: string;
  /** 提示说明 */
  hint?: string;
}

/** Sidebar 组件属性接口 */
export interface SidebarProps {
  /** 自定义类名 */
  className?: string;
  /** 是否移动端折叠 */
  collapsed?: boolean;
  /** 折叠状态切换回调 */
  onToggleCollapsed?: () => void;
  /** 新增记录按钮点击回调 */
  onNewRecord?: () => void;
}

/** 导航菜单项配置 */
const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    icon: LayoutDashboard,
    label: '首页仪表盘',
    hint: '数据总览与统计',
  },
  {
    to: '/log',
    icon: BookOpen,
    label: '噪音日志',
    hint: '记录与管理',
  },
  {
    to: '/export',
    icon: FileBarChart,
    label: '汇总导出',
    hint: '报告与数据导出',
  },
];

/**
 * Sidebar 左侧导航栏组件
 * 桌面端固定宽度 240px，移动端折叠后显示底部 tab
 *
 * @example
 * ```tsx
 * <Sidebar onNewRecord={() => setFormOpen(true)} />
 * ```
 */
export const Sidebar: React.FC<SidebarProps> = ({
  className,
  collapsed = false,
  onToggleCollapsed,
  onNewRecord,
}) => {
  return (
    <>
      {/* ============== 桌面端侧边栏 ============== */}
      <aside
        className={cn(
          // 固定定位 + 尺寸
          'hidden md:flex md:flex-col',
          'fixed left-0 top-0 bottom-0 z-30',
          'w-60',
          // 背景 + 边框
          'bg-white border-r border-slate-100',
          // 过渡
          'transition-transform duration-300 ease-out',
          // 折叠状态（移动端适配）
          collapsed && '-translate-x-full',
          className,
        )}
      >
        {/* 顶部 Logo 区域 */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-100 shrink-0">
          {/* Logo 图标容器 */}
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <Volume2 className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          {/* 标题文字 */}
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-base font-semibold text-slate-900 leading-tight">
              噪音记录册
            </h1>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
              Noise Journal
            </p>
          </div>
        </div>

        {/* 导航菜单区域 */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        // 基础样式
                        'group flex items-center gap-3 rounded-lg px-3 py-2.5',
                        'text-sm font-medium transition-all duration-200',
                        // 默认状态
                        'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                        // 激活状态
                        isActive && [
                          'bg-primary/10 text-primary',
                          'hover:bg-primary/15 hover:text-primary',
                        ],
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* 图标 */}
                        <Icon
                          className={cn(
                            'w-5 h-5 shrink-0 transition-colors',
                            isActive
                              ? 'text-primary'
                              : 'text-slate-400 group-hover:text-slate-600',
                          )}
                        />
                        {/* 文字 */}
                        <span className="flex-1 truncate">{item.label}</span>
                        {/* 激活指示器 */}
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-pulse-soft" />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 底部卡片区域 */}
        <div className="p-4 shrink-0 border-t border-slate-100">
          <div className="card-base p-4 bg-gradient-to-br from-primary/5 to-accent/5">
            {/* 标题 */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse-soft" />
              <span className="text-xs font-medium text-slate-700">
                今日记录
              </span>
            </div>
            {/* 提示文字 */}
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              坚持每天记录，追踪噪音环境变化趋势
            </p>
            {/* 快捷按钮 */}
            <Button
              variant="accent"
              size="sm"
              fullWidth
              icon={<Plus className="w-4 h-4" />}
              onClick={onNewRecord}
            >
              新增记录
            </Button>
          </div>
        </div>
      </aside>

      {/* ============== 移动端底部 Tab 栏 ============== */}
      <nav
        className={cn(
          // 固定底部
          'md:hidden fixed bottom-0 left-0 right-0 z-40',
          // 背景 + 边框
          'bg-white/95 backdrop-blur border-t border-slate-100',
          // 安全区
          'pb-safe',
          // 折叠控制（预留）
          'transition-transform duration-300',
          collapsed && 'translate-y-full',
        )}
      >
        <ul className="flex items-stretch h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to} className="flex-1">
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      // 基础布局
                      'flex flex-col items-center justify-center gap-1 h-full w-full',
                      // 文字样式
                      'text-[11px] font-medium transition-colors',
                      // 默认状态
                      'text-slate-500',
                      // 激活状态
                      isActive && 'text-primary',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn(
                          'w-5 h-5 transition-colors',
                          isActive ? 'text-primary' : 'text-slate-400',
                        )}
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}

          {/* 新增记录按钮（移动端居中突出） */}
          <li className="flex-1">
            <button
              type="button"
              onClick={onNewRecord}
              className={cn(
                'flex flex-col items-center justify-center gap-1 h-full w-full',
                'text-[11px] font-medium text-accent',
              )}
            >
              <span className="w-10 h-10 -mt-5 rounded-full bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/30 transition-transform active:scale-95">
                <Plus className="w-5 h-5" />
              </span>
              <span>记录</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
};

Sidebar.displayName = 'Sidebar';

export default Sidebar;
