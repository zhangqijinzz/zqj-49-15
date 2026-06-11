import * as React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Star,
  Clock,
  MapPin,
  Calendar,
  FileText,
  Volume2,
  AlertTriangle,
  Tag,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useRecordsStore, selectEvidenceByRecordId } from '@/store/useRecordsStore';
import { getNoiseTypeConfig } from '@/constants/noiseTypes';
import { getLocationConfig } from '@/constants/locations';
import {
  impactTagsByCategory,
  impactCategoryNames,
  getImpactTagById,
} from '@/constants/impactTags';
import {
  formatDisplayDate,
  getDurationText,
} from '@/utils/dateUtils';
import {
  formatIntensityStars,
  formatNoiseType,
  formatLocation,
} from '@/utils/formatUtils';
import type { ImpactCategory } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { EvidenceUploader, EvidenceGrid } from '@/components/record/EvidenceUploader';
import type { NoiseRecord, Evidence } from '@/types';

/**
 * RecordDetail 记录详情页面
 * 展示单条噪音记录的完整详情，支持编辑、删除和补充证据
 */
const RecordDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const records = useRecordsStore((s) => s.records);
  const evidence = useRecordsStore((s) => s.evidence);
  const deleteRecord = useRecordsStore((s) => s.deleteRecord);
  const openEditForm = useRecordsStore((s) => s.openEditForm);

  const record = React.useMemo(() => {
    return records.find((r) => r.id === id);
  }, [records, id]);

  const recordEvidence = React.useMemo<Evidence[]>(() => {
    if (!record) return [];
    return evidence.filter((e) => e.recordId === record.id);
  }, [record, evidence]);

  const impactTagsByGroup = React.useMemo(() => {
    if (!record) return {} as Record<ImpactCategory, typeof record.impactTagIds>;
    const grouped: Record<ImpactCategory, string[]> = {
      sleep: [],
      work: [],
      emotion: [],
      health: [],
    };
    record.impactTagIds.forEach((tagId) => {
      const tag = getImpactTagById(tagId);
      if (tag) {
        grouped[tag.category].push(tagId);
      }
    });
    return grouped;
  }, [record]);

  const handleDelete = () => {
    if (
      window.confirm(
        '确定要删除这条记录吗？此操作不可撤销，关联的证据也会被删除。',
      )
    ) {
      if (record) {
        deleteRecord(record.id);
        navigate('/log');
      }
    }
  };

  if (!record) {
    return (
      <div className="animate-fade-in-up min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              记录不存在
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              您访问的记录可能已被删除，或者ID不正确
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate(-1)}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                返回上页
              </Button>
              <Link to="/log">
                <Button>查看日志</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const noiseConfig = getNoiseTypeConfig(record.noiseType);
  const locationConfig = getLocationConfig(record.location);

  const displayDateTime = format(
    parseISO(`${record.date}T${record.startTime}:00`),
    'yyyy年M月d日 EEEE HH:mm',
    { locale: zhCN },
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div
        className="flex items-center justify-between animate-fade-in-up"
        style={{ opacity: 0 }}
      >
        <button
          onClick={() => navigate(-1)}
          className={cn(
            'inline-flex items-center gap-2 h-10 px-3 rounded-lg',
            'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
            'transition-colors',
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">返回</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Edit2 className="w-4 h-4" />}
            onClick={() => openEditForm(record.id)}
          >
            编辑
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={handleDelete}
          >
            删除
          </Button>
        </div>
      </div>

      <section
        className="animate-fade-in-up"
        style={{ opacity: 0, animationDelay: '80ms' }}
      >
        <Card className="overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-primary-600 via-accent-500 to-accent-400" />
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
                      noiseConfig.color,
                    )}
                  >
                    <Volume2 className="w-3 h-3 mr-1" />
                    {formatNoiseType(record.noiseType)}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-100 text-slate-600 border-slate-200">
                    <MapPin className="w-3 h-3 mr-1" />
                    {formatLocation(record.location)}
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-4">
                  {record.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {displayDateTime}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {record.startTime} - {record.endTime}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-end gap-6 shrink-0">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">强度等级</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-5 h-5',
                            i < record.intensity
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200',
                          )}
                        />
                      ))}
                      <span className="ml-2 text-lg font-bold text-slate-900">
                        {record.intensity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatIntensityStars(record.intensity)}
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    'sm:text-right px-5 py-4 rounded-xl',
                    'bg-gradient-to-br from-primary/5 to-accent/5',
                    'border border-slate-100',
                  )}
                >
                  <p className="text-xs text-slate-400 mb-1">持续时长</p>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">
                    {getDurationText(record.durationMinutes)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section
        className="animate-fade-in-up"
        style={{ opacity: 0, animationDelay: '160ms' }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Tag className="w-4 h-4 text-indigo-600" />
              </div>
              <CardTitle className="text-base">受到的影响</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {record.impactTagIds.length > 0 ? (
              <div className="space-y-5">
                {(Object.keys(impactTagsByGroup) as ImpactCategory[]).map(
                  (category) => {
                    const tagIds = impactTagsByGroup[category];
                    if (tagIds.length === 0) return null;

                    return (
                      <div key={category}>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                          {impactCategoryNames[category]}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {tagIds.map((tagId) => {
                            const tag = getImpactTagById(tagId);
                            if (!tag) return null;
                            return (
                              <span
                                key={tagId}
                                className={cn(
                                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border',
                                  tag.color,
                                )}
                              >
                                {tag.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            ) : (
              <div
                className={cn(
                  'py-8 text-center rounded-xl',
                  'border-2 border-dashed border-slate-200',
                )}
              >
                <p className="text-sm text-slate-500">未标记影响标签</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section
        className="animate-fade-in-up"
        style={{ opacity: 0, animationDelay: '240ms' }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-base">详细描述</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {record.description ? (
              <div
                className={cn(
                  'p-5 rounded-xl bg-slate-50/50 border border-slate-100',
                )}
              >
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {record.description}
                </p>
              </div>
            ) : (
              <div
                className={cn(
                  'py-8 text-center rounded-xl',
                  'border-2 border-dashed border-slate-200',
                )}
              >
                <p className="text-sm text-slate-500">暂无详细描述</p>
                <p className="text-xs text-slate-400 mt-1">
                  点击编辑按钮补充描述信息
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section
        className="animate-fade-in-up"
        style={{ opacity: 0, animationDelay: '320ms' }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-base">证据材料</CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    共 {recordEvidence.length} 份
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                补充证据
              </h5>
              <EvidenceUploader recordId={record.id} />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <EvidenceGrid evidence={recordEvidence} />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

RecordDetail.displayName = 'RecordDetail';

export default RecordDetail;
