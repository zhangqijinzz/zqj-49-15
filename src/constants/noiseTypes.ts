import type { NoiseType } from '@/types';

// 噪音类型配置：定义每种噪音的显示名称、图标和代表颜色
export interface NoiseTypeConfig {
  key: NoiseType;        // 类型标识（对应 NoiseType 枚举）
  name: string;          // 显示名称
  icon: string;          // Lucide 图标名称
  color: string;         // 代表颜色（Tailwind 颜色类）
}

export const noiseTypes: NoiseTypeConfig[] = [
  {
    key: 'footsteps',
    name: '脚步声',
    icon: 'Footprints',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  {
    key: 'furniture',
    name: '家具移动',
    icon: 'Sofa',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  {
    key: 'decoration',
    name: '装修施工',
    icon: 'Hammer',
    color: 'bg-red-100 text-red-700 border-red-200',
  },
  {
    key: 'music',
    name: '音乐娱乐',
    icon: 'Music',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  {
    key: 'talking',
    name: '说话喧哗',
    icon: 'MessageCircle',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    key: 'animals',
    name: '宠物动物',
    icon: 'Cat',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
  },
  {
    key: 'plumbing',
    name: '水暖管道',
    icon: 'Droplets',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  },
  {
    key: 'door',
    name: '门窗开关',
    icon: 'DoorOpen',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  {
    key: 'outdoor',
    name: '室外噪音',
    icon: 'TreePine',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  {
    key: 'other',
    name: '其他类型',
    icon: 'MoreHorizontal',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  },
];

// 根据 key 查找噪音类型配置
export const getNoiseTypeConfig = (key: NoiseType): NoiseTypeConfig => {
  return noiseTypes.find((item) => item.key === key) ?? noiseTypes[noiseTypes.length - 1];
};
