import * as React from 'react';
import {
  FileText,
  Calendar,
  Printer,
  Download,
  Clock,
  Volume2,
  Tag,
  MapPin,
  AlertCircle,
  ChevronDown,
  CheckCircle2,
  BarChart3,
  ListOrdered,
  Star,
  Moon,
  Sun,
  Sunset,
  Sunrise,
} from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWithinInterval,
  parseISO,
  differenceInMinutes,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useRecordsStore } from '@/store/useRecordsStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { NoiseRecord, NoiseType, DailyStats, TagStats, TimeRangeStats } from '@/types';
import { noiseTypes } from '@/constants/noiseTypes';
import { impactTags } from '@/constants/impactTags';
import { locations } from '@/constants/locations';
import { cn } from '@/lib/utils';
import { getDurationText } from '@/utils/dateUtils';
import { formatIntensity } from '@/utils/formatUtils';

type RangeType = 'day' | 'week' | 'month' | 'custom';

interface ReportData {
  records: NoiseRecord[];
  startDate: string;
  endDate: string;
  totalCount: number;
  totalMinutes: number;
  avgIntensity: number;
  dailyStats: DailyStats[];
  tagStats: TagStats[];
  noiseTypeStats: { type: NoiseType; name: string; count: number; color: string }[];
  locationStats: { key: string; name: string; count: number }[];
  timeRangeStats: TimeRangeStats;
  nightCount: number;
}

/**
 * 汇总导出页面
 * 支持按天/周/月/自定义日期范围生成报告
 * 含统计分析、详细记录列表、可打印预览、一键导出HTML
 */
const ExportReport: React.FC = () => {
  const { records } = useRecordsStore();

  const [rangeType, setRangeType] = React.useState<RangeType>('week');
  const [customStart, setCustomStart] = React.useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [customEnd, setCustomEnd] = React.useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [isPrintMode, setIsPrintMode] = React.useState(false);
  const [showRangeDropdown, setShowRangeDropdown] = React.useState(false);

  // 根据选择的范围类型计算起止日期
  const getDateRange = React.useCallback((): { start: string; end: string } => {
    const today = new Date();
    switch (rangeType) {
      case 'day': {
        const d = format(today, 'yyyy-MM-dd');
        return { start: d, end: d };
      }
      case 'week': {
        const start = startOfWeek(today, { weekStartsOn: 1 });
        const end = endOfWeek(today, { weekStartsOn: 1 });
        return {
          start: format(start, 'yyyy-MM-dd'),
          end: format(end, 'yyyy-MM-dd'),
        };
      }
      case 'month': {
        const start = startOfMonth(today);
        const end = endOfMonth(today);
        return {
          start: format(start, 'yyyy-MM-dd'),
          end: format(end, 'yyyy-MM-dd'),
        };
      }
      case 'custom':
      default:
        return { start: customStart, end: customEnd || customStart };
    }
  }, [rangeType, customStart, customEnd]);

  // 生成报告数据
  const reportData: ReportData = React.useMemo(() => {
    const { start, end } = getDateRange();
    const startDate = parseISO(start);
    const endDate = parseISO(end);

    // 筛选记录
    const filtered = records
      .filter((r) => {
        const d = parseISO(r.date);
        return isWithinInterval(d, { start: startDate, end: endDate });
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });

    // 每日统计
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dailyStats: DailyStats[] = days.map((d) => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayRecords = filtered.filter((r) => r.date === dateStr);
      const totalMinutes = dayRecords.reduce((sum, r) => sum + r.durationMinutes, 0);
      const avgIntensity =
        dayRecords.length > 0
          ? dayRecords.reduce((s, r) => s + r.intensity, 0) / dayRecords.length
          : 0;
      return {
        date: dateStr,
        count: dayRecords.length,
        totalMinutes,
        avgIntensity,
      };
    });

    // 标签统计
    const tagMap = new Map<string, number>();
    filtered.forEach((r) => {
      r.impactTagIds.forEach((tid) => {
        tagMap.set(tid, (tagMap.get(tid) || 0) + 1);
      });
    });
    const tagStats: TagStats[] = impactTags.filter((t) => tagMap.has(t.id))
      .map((t) => ({
        tagId: t.id,
        tagName: t.name,
        count: tagMap.get(t.id) || 0,
        color: t.color,
      }))
      .sort((a, b) => b.count - a.count);

    // 噪音类型统计
    const noiseTypeMap = new Map<NoiseType, number>();
    filtered.forEach((r) => {
      noiseTypeMap.set(r.noiseType, (noiseTypeMap.get(r.noiseType) || 0) + 1);
    });
    const noiseTypeStats = noiseTypes.filter((t) => noiseTypeMap.has(t.key)).map(
      (t) => ({
        type: t.key,
        name: t.name,
        count: noiseTypeMap.get(t.key) || 0,
        color: t.color,
      })
    );

    // 位置统计
    const locMap = new Map<string, number>();
    filtered.forEach((r) => {
      locMap.set(r.location, (locMap.get(r.location) || 0) + 1);
    });
    const locationStats = locations.filter((l) => locMap.has(l.key)).map(
      (l) => ({
        key: l.key,
        name: l.name,
        count: locMap.get(l.key) || 0,
      })
    );

    // 时间段分布
    const timeRangeStats: TimeRangeStats = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    };
    let nightCount = 0;
    filtered.forEach((r) => {
      const [h] = r.startTime.split(':').map(Number);
      if (h >= 6 && h < 12) timeRangeStats.morning++;
      else if (h >= 12 && h < 18) timeRangeStats.afternoon++;
      else if (h >= 18 && h < 22) timeRangeStats.evening++;
      else {
        timeRangeStats.night++;
        nightCount++;
      }
    });

    const totalMinutes = filtered.reduce((s, r) => s + r.durationMinutes, 0);
    const avgIntensity =
      filtered.length > 0
        ? filtered.reduce((s, r) => s + r.intensity, 0) / filtered.length
        : 0;

    return {
      records: filtered,
      startDate: start,
      endDate: end,
      totalCount: filtered.length,
      totalMinutes,
      avgIntensity,
      dailyStats,
      tagStats,
      noiseTypeStats,
      locationStats,
      timeRangeStats,
      nightCount,
    };
  }, [records, getDateRange]);

  // 打印功能
  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
    }, 300);
  };

  // 导出为HTML
  const handleExportHTML = () => {
    const printContent = document.getElementById('report-print-area');
    if (!printContent) return;

    const styles = `
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: "Noto Sans SC", "PingFang SC", -apple-system, sans-serif;
          padding: 40px;
          color: #1e293b;
          line-height: 1.6;
          max-width: 900px;
          margin: 0 auto;
        }
        h1 { font-family: Lora, serif; font-size: 28px; margin: 0 0 8px; color: #1a3a4a; }
        h2 { font-family: Lora, serif; font-size: 20px; margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; color: #1a3a4a; }
        h3 { font-size: 16px; margin: 16px 0 8px; color: #334155; }
        .report-header { text-align: center; padding-bottom: 24px; border-bottom: 3px solid #1a3a4a; margin-bottom: 32px; }
        .report-meta { color: #64748b; font-size: 14px; margin-top: 8px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
        .stat-box { background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .stat-value { font-size: 24px; font-weight: 700; color: #1a3a4a; }
        .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
        th { background: #1a3a4a; color: white; padding: 10px 12px; text-align: left; }
        td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) td { background: #f8fafc; }
        .tag { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px; margin: 2px; }
        .record-card { page-break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 12px 0; }
        .record-title { font-weight: 600; font-size: 15px; color: #1e293b; }
        .record-meta { color: #64748b; font-size: 13px; margin: 6px 0; }
        .record-desc { margin-top: 8px; color: #475569; font-size: 14px; }
        .stars { color: #f59e0b; }
        .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; }
        .bar-row { display: flex; align-items: center; margin: 6px 0; font-size: 14px; }
        .bar-label { width: 100px; color: #475569; }
        .bar-track { flex: 1; height: 16px; background: #f1f5f9; border-radius: 8px; overflow: hidden; margin: 0 12px; }
        .bar-fill { height: 100%; border-radius: 8px; }
        .bar-count { width: 40px; text-align: right; font-weight: 600; color: #1e293b; }
        .time-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
        .time-box { text-align: center; padding: 12px; background: #f8fafc; border-radius: 8px; }
        .time-icon { font-size: 20px; margin-bottom: 4px; }
        .time-value { font-size: 20px; font-weight: 700; }
        .time-label { font-size: 12px; color: #64758b; }
      </style>
    `;

    // 生成报告标题
    const dateRangeText =
      reportData.startDate === reportData.endDate
        ? format(parseISO(reportData.startDate), 'yyyy年MM月dd日', { locale: zhCN })
        : `${format(parseISO(reportData.startDate), 'yyyy.MM.dd', { locale: zhCN })} - ${format(parseISO(reportData.endDate), 'MM.dd', { locale: zhCN })}`;
    const title = `噪音干扰记录报告（${dateRangeText}）`;

    // 生成统计卡片区HTML
    const statsHTML = `
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value">${reportData.totalCount}</div>
          <div class="stat-label">干扰事件（次）</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${getDurationText(reportData.totalMinutes)}</div>
          <div class="stat-label">累计受扰时长</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${reportData.avgIntensity.toFixed(1)}</div>
          <div class="stat-label">平均强度等级</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${reportData.nightCount}</div>
          <div class="stat-label">夜间打扰（次）</div>
        </div>
      </div>
    `;

    // 时间段分布HTML
    const maxTimeRange = Math.max(
      1,
      reportData.timeRangeStats.morning,
      reportData.timeRangeStats.afternoon,
      reportData.timeRangeStats.evening,
      reportData.timeRangeStats.night
    );
    const timeRangeHTML = `
      <div class="time-grid">
        <div class="time-box">
          <div class="time-icon">🌅</div>
          <div class="time-value">${reportData.timeRangeStats.morning}</div>
          <div class="time-label">上午 06-12</div>
        </div>
        <div class="time-box">
          <div class="time-icon">☀️</div>
          <div class="time-value">${reportData.timeRangeStats.afternoon}</div>
          <div class="time-label">下午 12-18</div>
        </div>
        <div class="time-box">
          <div class="time-icon">🌇</div>
          <div class="time-value">${reportData.timeRangeStats.evening}</div>
          <div class="time-label">傍晚 18-22</div>
        </div>
        <div class="time-box" style="background:#fff7ed;border:1px solid #fed7aa">
          <div class="time-icon">🌙</div>
          <div class="time-value" style="color:#c2410c">${reportData.timeRangeStats.night}</div>
          <div class="time-label">夜间 22-06 ⚠️</div>
        </div>
      </div>
    `;

    // 噪音类型分布条形图
    const maxTypeCount = Math.max(1, ...reportData.noiseTypeStats.map((s) => s.count));
    const noiseTypeHTML = reportData.noiseTypeStats.length
      ? reportData.noiseTypeStats
          .map(
            (s) => `
      <div class="bar-row">
        <div class="bar-label">${s.name}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${(s.count / maxTypeCount) * 100}%;background:${s.color}"></div>
        </div>
        <div class="bar-count">${s.count}</div>
      </div>
    `
          )
          .join('')
      : '<p style="color:#94a3b8">暂无数据</p>';

    // 位置分布
    const maxLocCount = Math.max(1, ...reportData.locationStats.map((s) => s.count));
    const locationHTML = reportData.locationStats.length
      ? reportData.locationStats
          .map(
            (s) => `
      <div class="bar-row">
        <div class="bar-label">${s.name}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${(s.count / maxLocCount) * 100}%;background:#1a3a4a"></div>
        </div>
        <div class="bar-count">${s.count}</div>
      </div>
    `
          )
          .join('')
      : '<p style="color:#94a3b8">暂无数据</p>';

    // 标签分布
    const maxTagCount = Math.max(1, ...reportData.tagStats.map((s) => s.count));
    const tagHTML = reportData.tagStats.length
      ? reportData.tagStats
          .map(
            (s) => `
      <div class="bar-row">
        <div class="bar-label">${s.tagName}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${(s.count / maxTagCount) * 100}%;background:${s.color}"></div>
        </div>
        <div class="bar-count">${s.count}</div>
      </div>
    `
          )
          .join('')
      : '<p style="color:#94a3b8">暂无数据</p>';

    // 每日统计表
    const daysWithData = reportData.dailyStats.filter((d) => d.count > 0);
    const dailyTableHTML = daysWithData.length
      ? `<table>
        <thead><tr><th>日期</th><th>星期</th><th>事件数</th><th>累计时长</th><th>平均强度</th></tr></thead>
        <tbody>
          ${reportData.dailyStats
            .filter((d) => d.count > 0)
            .map(
              (d) => `<tr>
              <td>${format(parseISO(d.date), 'yyyy-MM-dd')}</td>
              <td>${format(parseISO(d.date), 'EEEE', { locale: zhCN })}</td>
              <td>${d.count} 次</td>
              <td>${getDurationText(d.totalMinutes)}</td>
              <td>${d.avgIntensity.toFixed(1)} / 5</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>`
      : '<p style="color:#94a3b8">暂无记录</p>';

    // 详细记录列表
    const recordsHTML = reportData.records.length
      ? reportData.records
          .map((r, idx) => {
            const typeInfo = noiseTypes.find((t) => t.key === r.noiseType);
            const locInfo = locations.find((l) => l.key === r.location);
            const tags = r.impactTagIds
              .map((tid) => impactTags.find((t) => t.id === tid))
              .filter(Boolean);
            const isNight = (() => {
              const [h] = r.startTime.split(':').map(Number);
              return h >= 22 || h < 6;
            })();
            return `
      <div class="record-card">
        <div style="display:flex;justify-content:space-between;align-items:start">
          <div>
            <span class="record-title">#${idx + 1} ${r.title}</span>
            ${isNight ? '<span style="background:#fff7ed;color:#c2410c" class="tag">🌙 夜间</span>' : ''}
          </div>
          <span class="stars">${'★'.repeat(r.intensity)}${'☆'.repeat(5 - r.intensity)}</span>
        </div>
        <div class="record-meta">
          📅 ${format(parseISO(r.date), 'yyyy年MM月dd日 EEEE', { locale: zhCN })} &nbsp;|&nbsp;
          ⏰ ${r.startTime} - ${r.endTime} (${getDurationText(r.durationMinutes)}) &nbsp;|&nbsp;
          🔊 ${typeInfo?.name || r.noiseType} &nbsp;|&nbsp;
          📍 ${locInfo?.name || r.location}
        </div>
        ${
          tags.length
            ? `<div style="margin-top:6px">${tags
                .map((t) => `<span class="tag" style="background:${t!.color}20;color:${t!.color}">${t!.name}</span>`)
                .join('')}</div>`
            : ''
        }
        ${r.description ? `<div class="record-desc">📝 ${r.description}</div>` : ''}
      </div>
    `;
          })
          .join('')
      : '<p style="color:#94a3b8;padding:24px 0;text-align:center">此时间段内暂无噪音记录</p>';

    // 组装完整HTML
    const generatedAt = format(new Date(), 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
    const fullHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${title}</title>
${styles}
</head>
<body>
  <div class="report-header">
    <h1>${title}</h1>
    <div class="report-meta">
      报告生成时间：${generatedAt} &nbsp;·&nbsp; 噪音记录册 自动生成
    </div>
  </div>

  <h2>📊 总体统计</h2>
  ${statsHTML}

  <h2>⏰ 时间段分布</h2>
  ${timeRangeHTML}

  <h2>🔊 噪音类型分布</h2>
  ${noiseTypeHTML}

  <h2>📍 干扰来源位置</h2>
  ${locationHTML}

  <h2>💔 受影响分类</h2>
  ${tagHTML}

  <h2>📅 每日汇总</h2>
  ${dailyTableHTML}

  <h2>📝 详细记录清单</h2>
  ${recordsHTML}

  <div class="footer">
    <p>本报告由「噪音记录册」应用自动生成 &nbsp;·&nbsp; 仅供维权参考使用</p>
    <p>生成日期：${generatedAt}</p>
  </div>
</body>
</html>`;

    // 下载文件
    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `噪音记录报告_${reportData.startDate}${reportData.startDate !== reportData.endDate ? '_' + reportData.endDate : ''}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const { start, end } = getDateRange();
  const rangeLabelMap: Record<RangeType, string> = {
    day: '今日',
    week: '本周',
    month: '本月',
    custom: '自定义',
  };

  // 打印区域组件 - 与导出结构一致
  const PrintArea = () => (
    <div id="report-print-area" className={cn('space-y-6', isPrintMode && 'print-area')}>
      {/* 报告标题头 */}
      <div className="text-center pb-6 border-b-[3px] border-primary">
        <h1 className="serif text-3xl font-bold text-primary">
          噪音干扰记录报告
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          {format(parseISO(start), 'yyyy年MM月dd日', { locale: zhCN })}
          {start !== end &&
            ` — ${format(parseISO(end), 'MM月dd日', { locale: zhCN })}`}
          &nbsp;·&nbsp; 共 {reportData.totalCount} 条记录
        </p>
      </div>

      {/* 核心统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
            <ListOrdered className="w-3.5 h-3.5" />
            <span>干扰事件</span>
          </div>
          <div className="text-3xl font-bold text-primary">
            {reportData.totalCount}
            <span className="text-sm font-normal text-slate-500 ml-1">次</span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>累计时长</span>
          </div>
          <div className="text-3xl font-bold text-primary">
            {getDurationText(reportData.totalMinutes)}
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
            <Star className="w-3.5 h-3.5" />
            <span>平均强度</span>
          </div>
          <div className="text-3xl font-bold text-primary">
            {reportData.avgIntensity.toFixed(1)}
            <span className="text-sm font-normal text-slate-500 ml-1">/ 5</span>
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center gap-2 text-orange-600 text-xs mb-2">
            <Moon className="w-3.5 h-3.5" />
            <span>夜间打扰</span>
          </div>
          <div className="text-3xl font-bold text-orange-600">
            {reportData.nightCount}
            <span className="text-sm font-normal text-orange-400 ml-1">次</span>
          </div>
        </div>
      </div>

      {/* 时间段分布 */}
      <div>
        <h3 className="serif text-lg font-semibold text-primary mb-3 flex items-center gap-2 pb-2 border-b border-slate-200">
          <BarChart3 className="w-5 h-5" />
          时间段分布
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              label: '上午',
              sub: '06:00 - 12:00',
              icon: Sunrise,
              value: reportData.timeRangeStats.morning,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
            },
            {
              label: '下午',
              sub: '12:00 - 18:00',
              icon: Sun,
              value: reportData.timeRangeStats.afternoon,
              color: 'text-sky-600',
              bg: 'bg-sky-50',
            },
            {
              label: '傍晚',
              sub: '18:00 - 22:00',
              icon: Sunset,
              value: reportData.timeRangeStats.evening,
              color: 'text-purple-600',
              bg: 'bg-purple-50',
            },
            {
              label: '夜间 ⚠️',
              sub: '22:00 - 06:00',
              icon: Moon,
              value: reportData.timeRangeStats.night,
              color: 'text-orange-600',
              bg: 'bg-orange-50',
            },
          ].map((t) => (
            <div key={t.label} className={`${t.bg} rounded-lg p-3 text-center`}>
              <t.icon className={`w-5 h-5 mx-auto mb-1 ${t.color}`} />
              <div className={`text-2xl font-bold ${t.color}`}>{t.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{t.label}</div>
              <div className="text-[10px] text-slate-400">{t.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 分类统计三栏 */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* 噪音类型 */}
        <div>
          <h3 className="serif text-base font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            噪音类型
          </h3>
          <div className="space-y-2">
            {reportData.noiseTypeStats.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-2">暂无数据</p>
            )}
            {reportData.noiseTypeStats.map((s) => {
              const max = Math.max(...reportData.noiseTypeStats.map((x) => x.count), 1);
              return (
                <div key={s.type} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-16 shrink-0">{s.name}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(s.count / max) * 100}%`,
                        backgroundColor: s.color,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold w-6 text-right">{s.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 位置来源 */}
        <div>
          <h3 className="serif text-base font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            来源位置
          </h3>
          <div className="space-y-2">
            {reportData.locationStats.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-2">暂无数据</p>
            )}
            {reportData.locationStats.map((s) => {
              const max = Math.max(...reportData.locationStats.map((x) => x.count), 1);
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-16 shrink-0">{s.name}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(s.count / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold w-6 text-right">{s.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 影响标签 */}
        <div>
          <h3 className="serif text-base font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            受影响分类
          </h3>
          <div className="space-y-2">
            {reportData.tagStats.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-2">暂无数据</p>
            )}
            {reportData.tagStats.map((s) => {
              const max = Math.max(...reportData.tagStats.map((x) => x.count), 1);
              return (
                <div key={s.tagId} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-16 shrink-0">{s.tagName}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(s.count / max) * 100}%`,
                        backgroundColor: s.color,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold w-6 text-right">{s.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 每日汇总表 */}
      <div>
        <h3 className="serif text-lg font-semibold text-primary mb-3 flex items-center gap-2 pb-2 border-b border-slate-200">
          <Calendar className="w-5 h-5" />
          每日汇总
        </h3>
        {reportData.dailyStats.filter((d) => d.count > 0).length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8 bg-slate-50 rounded-lg">
            此时间段内暂无噪音记录
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="text-left px-4 py-2.5 font-medium">日期</th>
                  <th className="text-left px-4 py-2.5 font-medium">星期</th>
                  <th className="text-center px-4 py-2.5 font-medium">事件数</th>
                  <th className="text-center px-4 py-2.5 font-medium">累计时长</th>
                  <th className="text-center px-4 py-2.5 font-medium">平均强度</th>
                </tr>
              </thead>
              <tbody>
                {reportData.dailyStats
                  .filter((d) => d.count > 0)
                  .map((d, idx) => (
                    <tr
                      key={d.date}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                    >
                      <td className="px-4 py-2.5 text-slate-700">{d.date}</td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {format(parseISO(d.date), 'EEEE', { locale: zhCN })}
                      </td>
                      <td className="px-4 py-2.5 text-center font-medium">{d.count}</td>
                      <td className="px-4 py-2.5 text-center text-slate-600">
                        {getDurationText(d.totalMinutes)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-amber-500">
                          {'★'.repeat(Math.round(d.avgIntensity))}
                          {'☆'.repeat(5 - Math.round(d.avgIntensity))}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">
                          ({d.avgIntensity.toFixed(1)})
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 详细记录清单 */}
      <div>
        <h3 className="serif text-lg font-semibold text-primary mb-3 flex items-center gap-2 pb-2 border-b border-slate-200">
          <FileText className="w-5 h-5" />
          详细记录清单
        </h3>
        {reportData.records.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-lg">
            <Volume2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">此时间段内暂无噪音记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reportData.records.map((r, idx) => {
              const typeInfo = noiseTypes.find((t) => t.key === r.noiseType);
              const locInfo = locations.find((l) => l.key === r.location);
              const isNight = (() => {
                const [h] = r.startTime.split(':').map(Number);
                return h >= 22 || h < 6;
              })();
              const tags = r.impactTagIds
                .map((tid) => impactTags.find((t) => t.id === tid))
                .filter(Boolean);
              return (
                <div
                  key={r.id}
                  className="rounded-lg border border-slate-200 p-4 hover:border-primary/30 transition-colors"
                  style={{
                    borderLeft: `4px solid ${typeInfo?.color || '#94a3b8'}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-xs text-slate-400 mr-2">#{idx + 1}</span>
                      <span className="font-semibold text-slate-800">{r.title}</span>
                      {isNight && (
                        <Badge variant="warning" className="ml-2" size="sm">
                          <Moon className="w-3 h-3 mr-1" />
                          夜间
                        </Badge>
                      )}
                    </div>
                    <div className="text-amber-500 text-sm shrink-0 whitespace-nowrap">
                      {'★'.repeat(r.intensity)}
                      {'☆'.repeat(5 - r.intensity)}
                      <span className="text-xs text-slate-400 ml-1">
                        {formatIntensity(r.intensity)}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                    <span>📅 {format(parseISO(r.date), 'yyyy.MM.dd EEEE', { locale: zhCN })}</span>
                    <span>⏰ {r.startTime} - {r.endTime}</span>
                    <span>⏱ {getDurationText(r.durationMinutes)}</span>
                    <span>🔊 {typeInfo?.name}</span>
                    <span>📍 {locInfo?.name}</span>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tags.map((t) => (
                        <span
                          key={t!.id}
                          className="text-[11px] px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${t!.color}15`,
                            color: t!.color,
                          }}
                        >
                          {t!.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {r.description && (
                    <p className="text-sm text-slate-600 mt-2 pt-2 border-t border-slate-100 leading-relaxed">
                      📝 {r.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 页脚 */}
      <div className="text-center text-xs text-slate-400 pt-6 mt-8 border-t border-slate-200">
        <p>
          本报告由「噪音记录册」应用自动生成 · 仅供维权参考 ·
          生成时间 {format(new Date(), 'yyyy-MM-dd HH:mm')}
        </p>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationDelay: '50ms' }}>
      {/* 页面头部控制栏 - 非打印模式显示 */}
      {!isPrintMode && (
        <div className="mb-6 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-7 h-7 text-primary" />
                汇总导出
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                选择时间范围，生成完整的噪音记录报告用于维权沟通
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-1.5" />
                打印
              </Button>
              <Button variant="accent" onClick={handleExportHTML}>
                <Download className="w-4 h-4 mr-1.5" />
                导出 HTML
              </Button>
            </div>
          </div>

          {/* 时间范围选择器 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => setShowRangeDropdown(!showRangeDropdown)}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:border-primary/40 hover:bg-primary/5 transition-colors bg-white"
                  >
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium text-slate-700">
                      {rangeLabelMap[rangeType]}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-slate-400 transition-transform',
                        showRangeDropdown && 'rotate-180'
                      )}
                    />
                  </button>
                  {showRangeDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 w-36">
                      {(['day', 'week', 'month', 'custom'] as RangeType[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            setRangeType(r);
                            setShowRangeDropdown(false);
                          }}
                          className={cn(
                            'w-full px-4 py-2 text-left text-sm flex items-center gap-2',
                            rangeType === r
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-slate-600 hover:bg-slate-50'
                          )}
                        >
                          {rangeType === r && (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
                          <span className={rangeType !== r ? 'ml-6' : ''}>
                            {rangeLabelMap[r]}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {rangeType === 'custom' ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-slate-500">开始</label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                    <span className="text-slate-400">—</span>
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-slate-500">结束</label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 font-mono text-xs">
                      {start}
                    </span>
                    <span>至</span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 font-mono text-xs">
                      {end}
                    </span>
                  </div>
                )}

                <div className="flex-1" />

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    <span className="text-slate-600">
                      <span className="font-semibold text-primary">
                        {reportData.totalCount}
                      </span>{' '}
                      条记录
                    </span>
                  </div>
                  {reportData.nightCount > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Moon className="w-4 h-4 text-orange-500" />
                      <span className="text-orange-600 font-medium">
                        {reportData.nightCount} 次夜间
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 报告预览区域 - 仿打印纸效果 */}
      <div
        className={cn(
          'transition-all duration-300',
          isPrintMode
            ? ''
            : 'bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-100 relative before:absolute before:inset-0 before:rounded-2xl before:shadow-[0_0_0_1px_rgba(26,58,74,0.05),0_20px_60px_-20px_rgba(26,58,74,0.15)] before:-z-10 before:bg-gradient-to-br before:from-primary/5 before:to-transparent'
        )}
        style={{
          backgroundImage: isPrintMode
            ? 'none'
            : 'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(26,58,74,0.02) 28px, rgba(26,58,74,0.02) 29px)',
        }}
      >
        <PrintArea />
      </div>
    </div>
  );
};

ExportReport.displayName = 'ExportReport';

export default ExportReport;
