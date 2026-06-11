import type { LocationTag } from '@/types';

// 位置标签配置：定义噪音来源的各种位置
export interface LocationConfig {
  key: LocationTag;      // 位置标识（对应 LocationTag 枚举）
  name: string;          // 显示名称
  icon: string;          // Lucide 图标名称
  description: string;   // 位置描述说明
}

export const locations: LocationConfig[] = [
  {
    key: 'upstairs',
    name: '楼上',
    icon: 'ArrowUpFromLine',
    description: '来自上方楼层的噪音，如脚步声、家具拖动等',
  },
  {
    key: 'downstairs',
    name: '楼下',
    icon: 'ArrowDownFromLine',
    description: '来自下方楼层的噪音',
  },
  {
    key: 'next_door',
    name: '隔壁',
    icon: 'Columns2',
    description: '来自相邻单元或房间的噪音',
  },
  {
    key: 'same_room',
    name: '同室',
    icon: 'Home',
    description: '同一房间或空间内产生的噪音',
  },
  {
    key: 'hallway',
    name: '走廊',
    icon: 'RectangleHorizontal',
    description: '来自公共走廊或楼道的噪音',
  },
  {
    key: 'outdoor',
    name: '室外',
    icon: 'TreePine',
    description: '来自室外环境的噪音，如交通、施工等',
  },
  {
    key: 'unknown',
    name: '未知',
    icon: 'HelpCircle',
    description: '无法确定具体来源位置',
  },
];

// 根据 key 查找位置配置
export const getLocationConfig = (key: LocationTag): LocationConfig => {
  return locations.find((item) => item.key === key) ?? locations[locations.length - 1];
};
