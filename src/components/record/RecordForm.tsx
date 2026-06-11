import * as React from 'react';
import {
  Calendar,
  Clock,
  Timer,
  FileText,
  AlertCircle,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import type { NoiseRecord, NoiseType, LocationTag } from '@/types';
import { getNoiseTypeConfig } from '@/constants/noiseTypes';
import { formatNoiseType } from '@/utils/formatUtils';
import { calculateDuration, formatDate } from '@/utils/dateUtils';
import { useRecordsStore } from '@/store/useRecordsStore';
import { Button } from '@/components/ui/Button';
import { NoiseTypePicker } from './NoiseTypePicker';
import { IntensitySlider } from './IntensitySlider';
import { LocationPicker } from './LocationPicker';
import { ImpactTagPicker } from './ImpactTagPicker';
import { EvidenceUploader } from './EvidenceUploader';
import { cn } from '@/lib/utils';

type IntensityLevel = 1 | 2 | 3 | 4 | 5;

export interface RecordFormProps {
  editingRecord?: NoiseRecord | null;
  onCancel?: () => void;
  onSuccess?: () => void;
  className?: string;
}

interface FormState {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  noiseType: NoiseType;
  intensity: IntensityLevel;
  location: LocationTag;
  impactTagIds: string[];
  description: string;
}

interface FormErrors {
  title?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: string;
  noiseType?: string;
  description?: string;
}

const getDefaultState = (): FormState => {
  const now = new Date();
  const startH = String(now.getHours()).padStart(2, '0');
  const startM = String(now.getMinutes()).padStart(2, '0');
  const endDate = new Date(now.getTime() + 30 * 60 * 1000);
  const endH = String(endDate.getHours()).padStart(2, '0');
  const endM = String(endDate.getMinutes()).padStart(2, '0');

  return {
    title: '',
    date: formatDate(now),
    startTime: `${startH}:${startM}`,
    endTime: `${endH}:${endM}`,
    durationMinutes: 30,
    noiseType: 'other',
    intensity: 3,
    location: 'unknown',
    impactTagIds: [],
    description: '',
  };
};

const generateDefaultTitle = (noiseType: NoiseType, date: string, startTime: string): string => {
  const typeName = formatNoiseType(noiseType);
  const dateStr = date.replace(/-/g, '/').slice(5);
  return `${dateStr} ${startTime} ${typeName}记录`;
};

const SectionHeader: React.FC<{ title: string; required?: boolean }> = ({ title, required }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="w-1 h-4 rounded-full bg-primary shrink-0" />
    <h4 className="text-sm font-semibold text-slate-800">
      {title}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </h4>
  </div>
);

const FieldError: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1 mt-1.5 text-xs text-rose-600">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {message}
    </div>
  );
};

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({
  message,
  type,
  onClose,
}) => {
  React.useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-scale-in">
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border',
          type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200',
        )}
      >
        {type === 'success' ? (
          <Check className="w-4 h-4 shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 shrink-0" />
        )}
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 p-0.5 rounded hover:bg-black/5 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const RecordForm: React.FC<RecordFormProps> = ({
  editingRecord,
  onCancel,
  onSuccess,
  className,
}) => {
  const addRecord = useRecordsStore((s) => s.addRecord);
  const updateRecord = useRecordsStore((s) => s.updateRecord);
  const closeForm = useRecordsStore((s) => s.closeForm);

  const isEditing = !!editingRecord;

  const [formState, setFormState] = React.useState<FormState>(() => {
    if (editingRecord) {
      return {
        title: editingRecord.title,
        date: editingRecord.date,
        startTime: editingRecord.startTime,
        endTime: editingRecord.endTime,
        durationMinutes: editingRecord.durationMinutes,
        noiseType: editingRecord.noiseType,
        intensity: editingRecord.intensity,
        location: editingRecord.location,
        impactTagIds: [...editingRecord.impactTagIds],
        description: editingRecord.description,
      };
    }
    return getDefaultState();
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [autoGenerateTitle, setAutoGenerateTitle] = React.useState(!isEditing);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [titleGeneratedFrom, setTitleGeneratedFrom] = React.useState<{
    noiseType: NoiseType;
    date: string;
    startTime: string;
  } | null>(null);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormState((prev) => {
      const next = { ...prev, [key]: value };

      if (
        autoGenerateTitle &&
        !isEditing &&
        (key === 'noiseType' || key === 'date' || key === 'startTime')
      ) {
        const nt = key === 'noiseType' ? (value as NoiseType) : prev.noiseType;
        const dt = key === 'date' ? (value as string) : prev.date;
        const st = key === 'startTime' ? (value as string) : prev.startTime;
        next.title = generateDefaultTitle(nt, dt, st);
        setTitleGeneratedFrom({ noiseType: nt, date: dt, startTime: st });
      }

      return next;
    });
  };

  React.useEffect(() => {
    if (formState.startTime && formState.endTime) {
      const calculated = calculateDuration(formState.startTime, formState.endTime);
      if (calculated !== formState.durationMinutes) {
        setFormState((prev) => ({ ...prev, durationMinutes: calculated }));
      }
    }
  }, [formState.startTime, formState.endTime]);

  React.useEffect(() => {
    if (autoGenerateTitle && !isEditing && !titleGeneratedFrom) {
      const defaultTitle = generateDefaultTitle(
        formState.noiseType,
        formState.date,
        formState.startTime,
      );
      setFormState((prev) => ({ ...prev, title: defaultTitle }));
      setTitleGeneratedFrom({
        noiseType: formState.noiseType,
        date: formState.date,
        startTime: formState.startTime,
      });
    }
  }, [autoGenerateTitle, isEditing, titleGeneratedFrom, formState.noiseType, formState.date, formState.startTime]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    updateField('title', newTitle);

    if (!isEditing) {
      const expected = titleGeneratedFrom
        ? generateDefaultTitle(
            titleGeneratedFrom.noiseType,
            titleGeneratedFrom.date,
            titleGeneratedFrom.startTime,
          )
        : '';
      if (newTitle !== expected && autoGenerateTitle) {
        setAutoGenerateTitle(false);
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formState.title.trim()) {
      newErrors.title = '请输入记录标题';
    }

    if (!formState.date) {
      newErrors.date = '请选择发生日期';
    }

    if (!formState.startTime) {
      newErrors.startTime = '请选择开始时间';
    }

    if (!formState.endTime) {
      newErrors.endTime = '请选择结束时间';
    }

    if (formState.startTime && formState.endTime) {
      if (formState.durationMinutes <= 0) {
        newErrors.durationMinutes = '结束时间必须晚于开始时间';
      }
    }

    if (formState.durationMinutes < 0) {
      newErrors.durationMinutes = '持续时长不能为负数';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      setToast({ message: '请检查并完善必填项', type: 'error' });
      return;
    }

    try {
      const recordData = {
        title: formState.title.trim(),
        date: formState.date,
        startTime: formState.startTime,
        endTime: formState.endTime,
        durationMinutes: formState.durationMinutes,
        noiseType: formState.noiseType,
        intensity: formState.intensity,
        description: formState.description.trim(),
        location: formState.location,
        impactTagIds: formState.impactTagIds,
        evidenceIds: editingRecord?.evidenceIds ?? [],
      };

      if (isEditing && editingRecord) {
        updateRecord(editingRecord.id, recordData);
        setToast({ message: '记录更新成功！', type: 'success' });
      } else {
        addRecord(recordData);
        setToast({ message: '记录保存成功！', type: 'success' });
      }

      setTimeout(() => {
        closeForm();
        onSuccess?.();
      }, 800);
    } catch (err) {
      console.error('保存失败:', err);
      setToast({ message: '保存失败，请重试', type: 'error' });
    }
  };

  const handleCancel = () => {
    onCancel?.();
    closeForm();
  };

  const regenerateTitle = () => {
    const newTitle = generateDefaultTitle(formState.noiseType, formState.date, formState.startTime);
    updateField('title', newTitle);
    setAutoGenerateTitle(true);
    setTitleGeneratedFrom({
      noiseType: formState.noiseType,
      date: formState.date,
      startTime: formState.startTime,
    });
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <form onSubmit={handleSubmit} className={cn('space-y-6', className)} noValidate>
        <div className="card-base p-5 space-y-5">
          <SectionHeader title="基本信息" required />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              记录标题
              <span className="text-rose-500 ml-0.5">*</span>
              {!isEditing && (
                <button
                  type="button"
                  onClick={regenerateTitle}
                  className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-primary hover:text-primary/80 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  自动生成
                </button>
              )}
            </label>
            <input
              type="text"
              value={formState.title}
              onChange={handleTitleChange}
              placeholder="请输入记录标题"
              className={cn(
                'w-full px-3 py-2.5 text-sm rounded-lg border bg-white text-slate-700 placeholder:text-slate-400',
                'focus:outline-none focus:ring-2 transition-all',
                errors.title
                  ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400'
                  : 'border-slate-200 focus:ring-primary/20 focus:border-primary',
              )}
            />
            <FieldError message={errors.title} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                发生日期
                <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input
                type="date"
                value={formState.date}
                onChange={(e) => updateField('date', e.target.value)}
                className={cn(
                  'w-full px-3 py-2.5 text-sm rounded-lg border bg-white text-slate-700',
                  'focus:outline-none focus:ring-2 transition-all',
                  errors.date
                    ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400'
                    : 'border-slate-200 focus:ring-primary/20 focus:border-primary',
                )}
              />
              <FieldError message={errors.date} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                开始时间
                <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input
                type="time"
                value={formState.startTime}
                onChange={(e) => updateField('startTime', e.target.value)}
                className={cn(
                  'w-full px-3 py-2.5 text-sm rounded-lg border bg-white text-slate-700',
                  'focus:outline-none focus:ring-2 transition-all',
                  errors.startTime
                    ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400'
                    : 'border-slate-200 focus:ring-primary/20 focus:border-primary',
                )}
              />
              <FieldError message={errors.startTime} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                结束时间
                <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input
                type="time"
                value={formState.endTime}
                onChange={(e) => updateField('endTime', e.target.value)}
                className={cn(
                  'w-full px-3 py-2.5 text-sm rounded-lg border bg-white text-slate-700',
                  'focus:outline-none focus:ring-2 transition-all',
                  errors.endTime
                    ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400'
                    : 'border-slate-200 focus:ring-primary/20 focus:border-primary',
                )}
              />
              <FieldError message={errors.endTime} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Timer className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              持续时长（分钟）
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                value={formState.durationMinutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  updateField('durationMinutes', Math.max(0, val));
                }}
                className={cn(
                  'w-32 px-3 py-2.5 text-sm rounded-lg border bg-white text-slate-700',
                  'focus:outline-none focus:ring-2 transition-all',
                  errors.durationMinutes
                    ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400'
                    : 'border-slate-200 focus:ring-primary/20 focus:border-primary',
                )}
              />
              <span className="text-sm text-slate-500">
                约 {Math.floor(formState.durationMinutes / 60) > 0 ? `${Math.floor(formState.durationMinutes / 60)}小时` : ''}
                {formState.durationMinutes % 60 > 0 ? `${formState.durationMinutes % 60}分钟` : (formState.durationMinutes === 0 ? '0分钟' : '')}
              </span>
            </div>
            <FieldError message={errors.durationMinutes} />
          </div>
        </div>

        <div className="card-base p-5 space-y-5">
          <SectionHeader title="噪音类型" required />
          <NoiseTypePicker
            value={formState.noiseType}
            onChange={(t) => updateField('noiseType', t)}
          />
        </div>

        <div className="card-base p-5 space-y-5">
          <SectionHeader title="噪音强度" required />
          <IntensitySlider
            value={formState.intensity}
            onChange={(n) => updateField('intensity', n)}
          />
        </div>

        <div className="card-base p-5 space-y-5">
          <SectionHeader title="来源位置" />
          <LocationPicker
            value={formState.location}
            onChange={(l) => updateField('location', l)}
          />
        </div>

        <div className="card-base p-5 space-y-5">
          <SectionHeader title="生活影响" />
          <ImpactTagPicker
            selectedIds={formState.impactTagIds}
            onChange={(ids) => updateField('impactTagIds', ids)}
          />
        </div>

        <div className="card-base p-5 space-y-5">
          <SectionHeader title="详细描述" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <FileText className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              情况描述
            </label>
            <textarea
              value={formState.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="请详细描述噪音的情况，如具体发生了什么、对您造成了哪些影响等..."
              rows={4}
              className={cn(
                'w-full px-3 py-2.5 text-sm rounded-lg border bg-white text-slate-700 placeholder:text-slate-400',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all',
              )}
            />
          </div>
        </div>

        {isEditing && editingRecord && (
          <div className="card-base p-5 space-y-5">
            <SectionHeader title="证据材料" />
            <EvidenceUploader recordId={editingRecord.id} />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            取消
          </Button>
          <Button type="submit" variant="primary">
            {isEditing ? '更新记录' : '保存记录'}
          </Button>
        </div>
      </form>
    </>
  );
};

RecordForm.displayName = 'RecordForm';

export default RecordForm;
