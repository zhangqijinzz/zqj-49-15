import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * 模态弹窗尺寸类型
 * - md: 中等尺寸（适合表单）
 * - lg: 大尺寸（适合详情展示）
 * - xl: 超大尺寸（适合复杂内容）
 */
export type ModalSize = 'md' | 'lg' | 'xl';

/** Modal 组件属性接口 */
export interface ModalProps {
  /** 是否打开弹窗 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 弹窗标题 */
  title?: React.ReactNode;
  /** 弹窗副标题 */
  subtitle?: React.ReactNode;
  /** 弹窗尺寸 */
  size?: ModalSize;
  /** 底部操作区内容 */
  footer?: React.ReactNode;
  /** 主体内容 */
  children?: React.ReactNode;
  /** 遮罩层自定义类名 */
  overlayClassName?: string;
  /** 内容卡片自定义类名 */
  className?: string;
  /** 是否点击遮罩关闭，默认 true */
  closeOnOverlayClick?: boolean;
}

/** 不同尺寸对应的 Tailwind 宽度映射 */
const sizeStyles: Record<ModalSize, string> = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

/**
 * Modal 模态弹窗组件
 * 带背景遮罩、入场动画、内部滚动
 *
 * @example
 * ```tsx
 * <Modal
 *   open={isOpen}
 *   onClose={() => setOpen(false)}
 *   title="新增记录"
 *   size="lg"
 *   footer={<Button onClick={handleSubmit}>保存</Button>}
 * >
 *   <p>表单内容...</p>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  footer,
  children,
  overlayClassName,
  className,
  closeOnOverlayClick = true,
}) => {
  /** 处理 ESC 键关闭 */
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  /** 打开时锁定 body 滚动 */
  React.useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  /** 处理遮罩层点击 */
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  // 弹窗未打开时不渲染任何内容（必须在所有 Hooks 之后）
  if (!open) return null;

  return (
    // 遮罩层
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      onClick={handleOverlayClick}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-slate-900/50 backdrop-blur-sm',
        'animate-fade-in',
        overlayClassName,
      )}
    >
      {/* 内容卡片 */}
      <div
        className={cn(
          // 基础尺寸 + 定位
          'relative w-full mx-4',
          sizeStyles[size],
          // 卡片样式
          'bg-white rounded-2xl shadow-xl',
          // 入场动画
          'animate-scale-in',
          className,
        )}
      >
        {/* 头部区域 */}
        {(title || subtitle) && (
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {title && (
                  <h2
                    id="modal-title"
                    className="text-lg font-semibold text-slate-900 truncate"
                  >
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                )}
              </div>
              {/* 关闭按钮 */}
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'shrink-0 p-1.5 -m-1.5 rounded-lg',
                  'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                )}
                aria-label="关闭弹窗"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* 无标题时的独立关闭按钮 */}
        {!title && !subtitle && (
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'absolute top-4 right-4 z-10',
              'p-1.5 rounded-lg',
              'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            )}
            aria-label="关闭弹窗"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* 主体内容区 - 可滚动 */}
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(100vh-200px)]">
          {children}
        </div>

        {/* 底部操作区 */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';

export default Modal;
