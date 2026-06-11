import { create } from 'zustand';

/** 单条噪音记录类型 */
export interface NoiseRecord {
  /** 唯一 ID */
  id: string;
  /** 记录时间（ISO 字符串） */
  createdAt: string;
  /** 噪音分贝值 */
  decibels?: number;
  /** 噪音类型标签 */
  category?: string;
  /** 位置信息 */
  location?: string;
  /** 心情/感受等级 1-5 */
  mood?: number;
  /** 文字备注 */
  note?: string;
}

/** Records Store 状态接口 */
export interface RecordsState {
  /** 记录列表 */
  records: NoiseRecord[];
  /** 记录表单弹窗是否打开 */
  isFormOpen: boolean;
}

/** Records Store 操作接口 */
export interface RecordsActions {
  /** 打开新增记录表单 */
  openNewForm: () => void;
  /** 关闭记录表单 */
  closeForm: () => void;
  /** 新增一条记录 */
  addRecord: (record: Omit<NoiseRecord, 'id' | 'createdAt'>) => void;
  /** 删除一条记录 */
  deleteRecord: (id: string) => void;
  /** 从本地存储恢复数据 */
  hydrateFromStorage: () => void;
}

/** Records Store 完整类型 */
export type RecordsStore = RecordsState & RecordsActions;

/** 本地存储 Key */
const STORAGE_KEY = 'noise-records:v1';

/**
 * 生成唯一 ID
 * 使用时间戳 + 随机字符串，避免引入额外依赖
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

/**
 * Zustand Store: 噪音记录数据管理
 * - 记录的增删改查
 * - 表单弹窗状态
 * - localStorage 持久化
 */
export const useRecordsStore = create<RecordsStore>((set, get) => ({
  // ===== 初始状态 =====
  records: [],
  isFormOpen: false,

  // ===== 表单弹窗控制 =====
  openNewForm: () => {
    set({ isFormOpen: true });
  },

  closeForm: () => {
    set({ isFormOpen: false });
  },

  // ===== 记录操作 =====
  addRecord: (recordData) => {
    const newRecord: NoiseRecord = {
      ...recordData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    const newRecords = [newRecord, ...get().records];
    set({ records: newRecords, isFormOpen: false });

    // 持久化到 localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
    } catch (e) {
      console.warn('[RecordsStore] 持久化失败:', e);
    }
  },

  deleteRecord: (id) => {
    const newRecords = get().records.filter((r) => r.id !== id);
    set({ records: newRecords });

    // 同步持久化
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
    } catch (e) {
      console.warn('[RecordsStore] 持久化失败:', e);
    }
  },

  // ===== 持久化恢复 =====
  hydrateFromStorage: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as NoiseRecord[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        set({ records: parsed });
      }
    } catch (e) {
      console.warn('[RecordsStore] 从本地存储恢复失败:', e);
    }
  },
}));
