// 噪音类型枚举：定义系统支持的所有噪音分类
export type NoiseType =
  | 'footsteps'    // 脚步声
  | 'furniture'    // 家具移动
  | 'decoration'   // 装修施工
  | 'music'        // 音乐/娱乐
  | 'talking'      // 说话喧哗
  | 'animals'      // 宠物动物
  | 'plumbing'     // 水暖管道
  | 'door'         // 门窗开关
  | 'outdoor'      // 室外噪音
  | 'other';       // 其他类型

// 位置标签枚举：定义噪音来源的位置分类
export type LocationTag =
  | 'upstairs'     // 楼上
  | 'downstairs'   // 楼下
  | 'next_door'    // 隔壁
  | 'same_room'    // 同室
  | 'hallway'      // 走廊
  | 'outdoor'      // 室外
  | 'unknown';     // 未知

// 影响类别枚举：定义噪音对生活的影响方面
export type ImpactCategory =
  | 'sleep'        // 睡眠影响
  | 'work'         // 工作影响
  | 'emotion'      // 情绪影响
  | 'health';      // 健康影响

// 影响标签：描述具体的影响内容
export interface ImpactTag {
  id: string;          // 标签唯一标识
  name: string;        // 标签显示名称
  category: ImpactCategory;  // 所属影响类别
  color: string;       // 标签颜色（Tailwind 颜色类）
  icon: string;        // 图标名称（Lucide icon name）
}

// 证据材料：支持的证据类型，包括图片、音频和文字描述
export interface Evidence {
  id: string;                  // 证据唯一标识
  recordId: string;            // 关联的噪音记录ID
  type: 'image' | 'audio' | 'text';  // 证据类型
  name: string;                // 文件名称或标题
  dataUrl: string;             // 数据URL（base64编码或文本内容）
  mimeType: string;            // MIME类型
  sizeKB: number;              // 文件大小（KB）
  note?: string;               // 可选备注说明
  createdAt: string;           // 创建时间（ISO格式）
}

// 噪音记录：用户创建的单条噪音记录
export interface NoiseRecord {
  id: string;                   // 记录唯一标识
  title: string;                // 记录标题
  date: string;                 // 发生日期（YYYY-MM-DD格式）
  startTime: string;            // 开始时间（HH:mm格式）
  endTime: string;              // 结束时间（HH:mm格式）
  durationMinutes: number;      // 持续时长（分钟）
  noiseType: NoiseType;         // 噪音类型
  intensity: 1 | 2 | 3 | 4 | 5; // 噪音强度（1-5级）
  description: string;          // 详细描述
  location: LocationTag;        // 来源位置
  impactTagIds: string[];       // 关联的影响标签ID列表
  evidenceIds: string[];        // 关联的证据ID列表
  createdAt: string;            // 创建时间（ISO格式）
  updatedAt: string;            // 更新时间（ISO格式）
}

// 每日统计数据：按日期汇总的统计信息
export interface DailyStats {
  date: string;           // 日期（YYYY-MM-DD）
  count: number;          // 当天记录总数
  totalMinutes: number;   // 当天噪音总时长（分钟）
  avgIntensity: number;   // 当天平均噪音强度
}

// 标签统计：按影响标签汇总的统计信息
export interface TagStats {
  tagId: string;     // 标签ID
  tagName: string;   // 标签名称
  count: number;     // 出现次数
  color: string;     // 标签颜色
}

// 时间段统计：按时段汇总的统计信息
export interface TimeRangeStats {
  morning: number;    // 早晨时段（6:00-12:00）记录数
  afternoon: number;  // 下午时段（12:00-18:00）记录数
  evening: number;    // 傍晚时段（18:00-22:00）记录数
  night: number;      // 夜间时段（22:00-6:00）记录数
}
