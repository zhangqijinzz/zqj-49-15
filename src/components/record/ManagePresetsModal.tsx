import * as React from 'react';
import { Pencil, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { FilterPreset } from '@/types';

export interface ManagePresetsModalProps {
  open: boolean;
  onClose: () => void;
  presets: FilterPreset[];
  activePresetId: string | null;
  onEdit: (preset: FilterPreset) => void;
  onDelete: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onApply: (id: string) => void;
}

export const ManagePresetsModal: React.FC<ManagePresetsModalProps> = ({
  open,
  onClose,
  presets,
  activePresetId,
  onEdit,
  onDelete,
  onReorder,
  onApply,
}) => {
  const [localPresets, setLocalPresets] = React.useState<FilterPreset[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setLocalPresets([...presets].sort((a, b) => a.order - b.order));
      setDeleteConfirmId(null);
    }
  }, [open, presets]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newList = [...localPresets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;

    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    setLocalPresets(newList);
  };

  const handleClose = () => {
    const orderedIds = localPresets.map((p) => p.id);
    const originalOrder = [...presets].sort((a, b) => a.order - b.order).map((p) => p.id);
    const orderChanged = orderedIds.length !== originalOrder.length ||
      orderedIds.some((id, i) => id !== originalOrder[i]);

    if (orderChanged) {
      onReorder(orderedIds);
    }
    onClose();
  };

  const handleDelete = (id: string) => {
    if (deleteConfirmId === id) {
      setLocalPresets((prev) => prev.filter((p) => p.id !== id));
      onDelete(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => {
        setDeleteConfirmId((current) => (current === id ? null : current));
      }, 3000);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="管理筛选方案"
      subtitle="编辑、删除或调整方案顺序"
      size="lg"
      footer={
        <Button onClick={handleClose}>
          完成
        </Button>
      }
    >
      {localPresets.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-slate-500">还没有保存任何筛选方案</p>
          <p className="text-xs text-slate-400 mt-1">
            在日志页调整筛选条件后，点击"保存方案"即可创建
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {localPresets.map((preset, index) => (
            <div
              key={preset.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border transition-all',
                activePresetId === preset.id
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-slate-200 bg-white hover:border-slate-300',
              )}
            >
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className={cn(
                    'p-0.5 rounded transition-colors',
                    index === 0
                      ? 'text-slate-200 cursor-not-allowed'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
                  )}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === localPresets.length - 1}
                  className={cn(
                    'p-0.5 rounded transition-colors',
                    index === localPresets.length - 1
                      ? 'text-slate-200 cursor-not-allowed'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
                  )}
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-slate-300 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5" />
              </div>

              <button
                onClick={() => onApply(preset.id)}
                className="flex-1 min-w-0 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-800 truncate">
                    {preset.name}
                  </span>
                  {activePresetId === preset.id && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      当前
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {preset.filters.noiseTypes.length > 0 && (
                    <span className="text-xs text-slate-500">
                      {preset.filters.noiseTypes.length} 种噪音类型
                    </span>
                  )}
                  {preset.filters.impactTagIds.length > 0 && (
                    <span className="text-xs text-slate-500">
                      {preset.filters.impactTagIds.length} 个影响标签
                    </span>
                  )}
                  {preset.filters.keyword && (
                    <span className="text-xs text-slate-500 truncate max-w-[120px]">
                      关键词: {preset.filters.keyword}
                    </span>
                  )}
                  {preset.filters.dateRange.start && (
                    <span className="text-xs text-slate-500">
                      从 {preset.filters.dateRange.start}
                    </span>
                  )}
                  {preset.filters.dateRange.end && (
                    <span className="text-xs text-slate-500">
                      到 {preset.filters.dateRange.end}
                    </span>
                  )}
                  {preset.filters.noiseTypes.length === 0 &&
                    preset.filters.impactTagIds.length === 0 &&
                    !preset.filters.keyword &&
                    !preset.filters.dateRange.start &&
                    !preset.filters.dateRange.end && (
                    <span className="text-xs text-slate-400">无筛选条件</span>
                  )}
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onEdit(preset)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="编辑"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(preset.id)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    deleteConfirmId === preset.id
                      ? 'text-white bg-rose-500 hover:bg-rose-600'
                      : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50',
                  )}
                  title={deleteConfirmId === preset.id ? '再次点击确认删除' : '删除'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

ManagePresetsModal.displayName = 'ManagePresetsModal';

export default ManagePresetsModal;
