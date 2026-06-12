import * as React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Filters, FilterPreset } from '@/types';

export interface SavePresetModalProps {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  editingPreset?: FilterPreset | null;
  onSave: (name: string) => void;
}

export const SavePresetModal: React.FC<SavePresetModalProps> = ({
  open,
  onClose,
  editingPreset,
  onSave,
}) => {
  const [name, setName] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setName(editingPreset?.name ?? '');
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [open, editingPreset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSave(trimmedName);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingPreset ? '编辑筛选方案' : '保存筛选方案'}
      subtitle={editingPreset ? '修改方案名称或更新筛选条件' : '为当前筛选条件命名并保存'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            {editingPreset ? '保存修改' : '保存方案'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              方案名称
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：夜间装修噪音"
              maxLength={30}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              最多 30 个字符，建议简洁描述筛选条件
            </p>
          </div>
        </div>
      </form>
    </Modal>
  );
};

SavePresetModal.displayName = 'SavePresetModal';

export default SavePresetModal;
