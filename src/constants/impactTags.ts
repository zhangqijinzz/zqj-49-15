import type { ImpactTag, ImpactCategory } from '@/types';

// 影响标签配置：定义噪音对生活各方面的具体影响
export const impactTags: ImpactTag[] = [
  // ===== 睡眠类影响 =====
  {
    id: 'sleep_insomnia',
    name: '失眠',
    category: 'sleep' as ImpactCategory,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: 'Moon',
  },
  {
    id: 'sleep_interruption',
    name: '睡眠中断',
    category: 'sleep' as ImpactCategory,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: 'AlarmClockOff',
  },
  {
    id: 'sleep_early_wake',
    name: '早醒',
    category: 'sleep' as ImpactCategory,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: 'Sunrise',
  },

  // ===== 工作类影响 =====
  {
    id: 'work_interruption',
    name: '工作中断',
    category: 'work' as ImpactCategory,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: 'Briefcase',
  },
  {
    id: 'work_distraction',
    name: '注意力分散',
    category: 'work' as ImpactCategory,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: 'BrainCircuit',
  },
  {
    id: 'work_meeting',
    name: '会议受扰',
    category: 'work' as ImpactCategory,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: 'Users',
  },

  // ===== 情绪类影响 =====
  {
    id: 'emotion_irritable',
    name: '情绪烦躁',
    category: 'emotion' as ImpactCategory,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: 'Frown',
  },
  {
    id: 'emotion_anxiety',
    name: '焦虑不安',
    category: 'emotion' as ImpactCategory,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: 'AlertTriangle',
  },
  {
    id: 'emotion_anger',
    name: '愤怒生气',
    category: 'emotion' as ImpactCategory,
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: 'Angry',
  },

  // ===== 健康类影响 =====
  {
    id: 'health_headache',
    name: '头痛头晕',
    category: 'health' as ImpactCategory,
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    icon: 'Headphones',
  },
  {
    id: 'health_palpitations',
    name: '心悸心慌',
    category: 'health' as ImpactCategory,
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    icon: 'HeartPulse',
  },
  {
    id: 'health_hearing',
    name: '听力不适',
    category: 'health' as ImpactCategory,
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    icon: 'Ear',
  },
];

// 按类别分组的影响标签
export const impactTagsByCategory: Record<ImpactCategory, ImpactTag[]> = {
  sleep: impactTags.filter((tag) => tag.category === 'sleep'),
  work: impactTags.filter((tag) => tag.category === 'work'),
  emotion: impactTags.filter((tag) => tag.category === 'emotion'),
  health: impactTags.filter((tag) => tag.category === 'health'),
};

// 影响类别名称映射
export const impactCategoryNames: Record<ImpactCategory, string> = {
  sleep: '睡眠影响',
  work: '工作影响',
  emotion: '情绪影响',
  health: '健康影响',
};

// 根据 ID 查找影响标签
export const getImpactTagById = (id: string): ImpactTag | undefined => {
  return impactTags.find((tag) => tag.id === id);
};
