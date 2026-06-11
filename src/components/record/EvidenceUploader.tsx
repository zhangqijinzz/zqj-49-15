import * as React from 'react';
import {
  Image,
  Mic,
  FileText,
  X,
  Play,
  Pause,
  Plus,
} from 'lucide-react';
import type { Evidence } from '@/types';
import { useRecordsStore } from '@/store/useRecordsStore';
import { Button } from '@/components/ui/Button';
import { formatKBSize } from '@/utils/formatUtils';
import { cn } from '@/lib/utils';

export interface EvidenceUploaderProps {
  recordId: string;
  onUploaded?: () => void;
  className?: string;
}

export const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({
  recordId,
  onUploaded,
  className,
}) => {
  const addEvidence = useRecordsStore((s) => s.addEvidence);
  const deleteEvidence = useRecordsStore((s) => s.deleteEvidence);
  const allEvidence = useRecordsStore((s) => s.evidence);

  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const audioInputRef = React.useRef<HTMLInputElement>(null);
  const [textNote, setTextNote] = React.useState('');
  const [playingAudioId, setPlayingAudioId] = React.useState<string | null>(null);
  const audioRefs = React.useRef<Record<string, HTMLAudioElement | null>>({});

  const evidenceList = React.useMemo(
    () => allEvidence.filter((e) => e.recordId === recordId),
    [allEvidence, recordId],
  );

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const dataUrl = await fileToDataUrl(file);
        const sizeKB = Math.round(file.size / 1024);

        addEvidence({
          recordId,
          type: 'image',
          name: file.name || `图片_${Date.now()}`,
          dataUrl,
          mimeType: file.type || 'image/*',
          sizeKB,
        });
      } catch (err) {
        console.error('图片上传失败:', err);
      }
    }

    e.target.value = '';
    onUploaded?.();
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const dataUrl = await fileToDataUrl(file);
        const sizeKB = Math.round(file.size / 1024);

        addEvidence({
          recordId,
          type: 'audio',
          name: file.name || `录音_${Date.now()}`,
          dataUrl,
          mimeType: file.type || 'audio/*',
          sizeKB,
        });
      } catch (err) {
        console.error('录音上传失败:', err);
      }
    }

    e.target.value = '';
    onUploaded?.();
  };

  const handleAddTextNote = () => {
    const text = textNote.trim();
    if (!text) return;

    const encoder = new TextEncoder();
    const sizeKB = Math.round(encoder.encode(text).length / 1024);

    addEvidence({
      recordId,
      type: 'text',
      name: `文字说明_${Date.now()}`,
      dataUrl: text,
      mimeType: 'text/plain',
      sizeKB,
    });

    setTextNote('');
    onUploaded?.();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条证据吗？')) {
      deleteEvidence(id);
      if (playingAudioId === id) {
        setPlayingAudioId(null);
      }
      if (audioRefs.current[id]) {
        audioRefs.current[id]?.pause();
        audioRefs.current[id] = null;
      }
    }
  };

  const toggleAudioPlay = (id: string) => {
    const audio = audioRefs.current[id];
    if (!audio) return;

    if (playingAudioId === id) {
      audio.pause();
      setPlayingAudioId(null);
    } else {
      if (playingAudioId && audioRefs.current[playingAudioId]) {
        audioRefs.current[playingAudioId]?.pause();
      }
      audio.play();
      setPlayingAudioId(id);
      audio.onended = () => setPlayingAudioId(null);
    }
  };

  const renderEvidenceItem = (item: Evidence) => {
    if (item.type === 'image') {
      return (
        <div
          key={item.id}
          className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
        >
          <img
            src={item.dataUrl}
            alt={item.name}
            className="w-full max-h-24 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              onClick={() => handleDelete(item.id)}
              className="p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-2 py-1.5 text-xs text-slate-500 bg-white border-t border-slate-100">
            <div className="truncate">{item.name}</div>
            <div className="text-slate-400">{formatKBSize(item.sizeKB)}</div>
          </div>
        </div>
      );
    }

    if (item.type === 'audio') {
      const isPlaying = playingAudioId === item.id;
      return (
        <div
          key={item.id}
          className="relative flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white"
        >
          <audio
            ref={(el) => {
              audioRefs.current[item.id] = el;
            }}
            src={item.dataUrl}
            preload="metadata"
          />
          <button
            onClick={() => toggleAudioPlay(item.id)}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors',
              isPlaying
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-700 truncate">
              {item.name}
            </div>
            <div className="text-xs text-slate-400">
              <Mic className="w-3 h-3 inline mr-1" />
              录音 · {formatKBSize(item.sizeKB)}
            </div>
          </div>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    if (item.type === 'text') {
      return (
        <div
          key={item.id}
          className="relative p-4 rounded-lg border border-slate-200 bg-white"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-400 mb-1">文字说明</div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {item.dataUrl}
              </p>
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const images = evidenceList.filter((e) => e.type === 'image');
  const audios = evidenceList.filter((e) => e.type === 'audio');
  const texts = evidenceList.filter((e) => e.type === 'text');

  return (
    <div className={cn('space-y-5', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            fullWidth
            icon={<Image className="w-4 h-4" />}
            onClick={() => imageInputRef.current?.click()}
          >
            上传图片
          </Button>
        </div>
        <div>
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            fullWidth
            icon={<Mic className="w-4 h-4" />}
            onClick={() => audioInputRef.current?.click()}
          >
            上传录音
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          添加文字说明
        </label>
        <div className="flex gap-2">
          <textarea
            value={textNote}
            onChange={(e) => setTextNote(e.target.value)}
            placeholder="输入补充说明、备注信息等..."
            rows={3}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
          <Button
            type="button"
            variant="primary"
            onClick={handleAddTextNote}
            disabled={!textNote.trim()}
            className="self-end"
            icon={<Plus className="w-4 h-4" />}
          >
            添加
          </Button>
        </div>
      </div>

      {evidenceList.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <div className="text-sm font-medium text-slate-700 mb-3">
            已上传证据 ({evidenceList.length})
          </div>

          <div className="space-y-3">
            {images.length > 0 && (
              <div>
                <div className="text-xs text-slate-400 mb-2">
                  图片 ({images.length})
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                  {images.map(renderEvidenceItem)}
                </div>
              </div>
            )}

            {audios.length > 0 && (
              <div>
                <div className="text-xs text-slate-400 mb-2">
                  录音 ({audios.length})
                </div>
                <div className="space-y-2">
                  {audios.map(renderEvidenceItem)}
                </div>
              </div>
            )}

            {texts.length > 0 && (
              <div>
                <div className="text-xs text-slate-400 mb-2">
                  文字 ({texts.length})
                </div>
                <div className="space-y-2">
                  {texts.map(renderEvidenceItem)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

EvidenceUploader.displayName = 'EvidenceUploader';

export interface EvidenceGridProps {
  evidence: Evidence[];
  className?: string;
}

export const EvidenceGrid: React.FC<EvidenceGridProps> = ({ evidence, className }) => {
  const deleteEvidence = useRecordsStore((s) => s.deleteEvidence);
  const [playingAudioId, setPlayingAudioId] = React.useState<string | null>(null);
  const audioRefs = React.useRef<Record<string, HTMLAudioElement | null>>({});

  if (evidence.length === 0) {
    return (
      <div
        className={cn(
          'py-10 text-center rounded-xl border-2 border-dashed border-slate-200',
          className,
        )}
      >
        <div className="text-slate-400 text-sm">暂无证据材料</div>
      </div>
    );
  }

  const toggleAudioPlay = (id: string) => {
    const audio = audioRefs.current[id];
    if (!audio) return;

    if (playingAudioId === id) {
      audio.pause();
      setPlayingAudioId(null);
    } else {
      if (playingAudioId && audioRefs.current[playingAudioId]) {
        audioRefs.current[playingAudioId]?.pause();
      }
      audio.play();
      setPlayingAudioId(id);
      audio.onended = () => setPlayingAudioId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条证据吗？')) {
      deleteEvidence(id);
      if (playingAudioId === id) {
        setPlayingAudioId(null);
      }
      if (audioRefs.current[id]) {
        audioRefs.current[id]?.pause();
        audioRefs.current[id] = null;
      }
    }
  };

  const images = evidence.filter((e) => e.type === 'image');
  const audios = evidence.filter((e) => e.type === 'audio');
  const texts = evidence.filter((e) => e.type === 'text');

  return (
    <div className={cn('space-y-5', className)}>
      {images.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            图片 ({images.length})
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((item) => (
              <div
                key={item.id}
                className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
              >
                <img
                  src={item.dataUrl}
                  alt={item.name}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="px-2.5 py-2 text-xs bg-white border-t border-slate-100">
                  <div className="text-slate-700 font-medium truncate">{item.name}</div>
                  <div className="text-slate-400 mt-0.5">{formatKBSize(item.sizeKB)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {audios.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            录音 ({audios.length})
          </div>
          <div className="space-y-2.5">
            {audios.map((item) => {
              const isPlaying = playingAudioId === item.id;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white"
                >
                  <audio
                    ref={(el) => {
                      audioRefs.current[item.id] = el;
                    }}
                    src={item.dataUrl}
                    preload="metadata"
                  />
                  <button
                    onClick={() => toggleAudioPlay(item.id)}
                    className={cn(
                      'w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors',
                      isPlaying
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    )}
                  >
                    {isPlaying ? (
                      <Pause className="w-4.5 h-4.5" />
                    ) : (
                      <Play className="w-4.5 h-4.5 ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Mic className="w-3 h-3" />
                      录音 · {formatKBSize(item.sizeKB)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {texts.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            文字 ({texts.length})
          </div>
          <div className="space-y-2.5">
            {texts.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-400 mb-1.5">{item.name}</div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {item.dataUrl}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

EvidenceGrid.displayName = 'EvidenceGrid';

export default EvidenceUploader;
