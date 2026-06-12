/**
 * 噪音记录状态管理
 * 使用 Zustand 实现全局状态管理，并通过 localStorage 进行数据持久化
 */

import { create } from 'zustand';
import type {
  NoiseRecord,
  Evidence,
  Filters,
  FilterPreset,
} from '@/types';
import { generateId } from '@/utils/idUtils';

// ==================== Store 状态类型 ====================

export interface RecordsState {
  records: NoiseRecord[];
  evidence: Evidence[];

  isFormModalOpen: boolean;
  editingRecordId: string | null;
  previewEvidenceId: string | null;

  filters: Filters;
  filterPresets: FilterPreset[];
  activePresetId: string | null;

  addRecord: (record: Omit<NoiseRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecord: (id: string, partial: Partial<NoiseRecord>) => void;
  deleteRecord: (id: string) => void;

  addEvidence: (evidence: Omit<Evidence, 'id' | 'createdAt'>) => void;
  deleteEvidence: (id: string) => void;

  openNewForm: () => void;
  openEditForm: (id: string) => void;
  closeForm: () => void;
  setPreviewEvidence: (id: string | null) => void;

  setFilters: (partial: Partial<Filters>) => void;
  resetFilters: () => void;

  addFilterPreset: (name: string, filters: Filters) => void;
  updateFilterPreset: (id: string, data: Partial<Pick<FilterPreset, 'name' | 'filters'>>) => void;
  deleteFilterPreset: (id: string) => void;
  reorderFilterPresets: (orderedIds: string[]) => void;
  applyFilterPreset: (id: string) => void;

  hydrateFromStorage: () => void;
}

// ==================== LocalStorage Key ====================
const STORAGE_KEYS = {
  RECORDS: 'noise_records',
  EVIDENCE: 'noise_evidence',
  FILTERS: 'noise_filters',
  FILTER_PRESETS: 'noise_filter_presets',
} as const;

// ==================== 默认筛选条件 ====================
const DEFAULT_FILTERS: Filters = {
  dateRange: {
    start: null,
    end: null,
  },
  noiseTypes: [],
  impactTagIds: [],
  keyword: '',
};

// ==================== Mock 初始数据 ====================

const generateMockRecords = (): NoiseRecord[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dayBeforeYesterday = new Date(today);
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const formatDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const toISO = (d: Date) => d.toISOString();

  return [
    {
      id: 'mock_record_001',
      title: '楼上深夜脚步声',
      date: formatDateStr(yesterday),
      startTime: '23:15',
      endTime: '23:58',
      durationMinutes: 43,
      noiseType: 'footsteps',
      intensity: 4,
      description: '昨晚11点多，楼上住户来回走动，脚步声清晰可闻，持续了将近一个小时，中间还有重物落地的声音，严重影响休息。',
      location: 'upstairs',
      impactTagIds: ['sleep_interruption', 'emotion_irritable'],
      evidenceIds: ['mock_evidence_001'],
      createdAt: toISO(new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 60 * 1000)),
      updatedAt: toISO(new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 60 * 1000)),
    },
    {
      id: 'mock_record_002',
      title: '隔壁装修电钻声',
      date: formatDateStr(dayBeforeYesterday),
      startTime: '09:00',
      endTime: '12:30',
      durationMinutes: 210,
      noiseType: 'decoration',
      intensity: 5,
      description: '隔壁邻居开始装修，电钻声、敲击声不断，持续一整个上午，完全无法在家办公，头痛欲裂。',
      location: 'next_door',
      impactTagIds: ['work_interruption', 'work_distraction', 'health_headache', 'emotion_anger'],
      evidenceIds: [],
      createdAt: toISO(new Date(dayBeforeYesterday.getTime() + 12 * 60 * 60 * 1000 + 35 * 60 * 1000)),
      updatedAt: toISO(new Date(dayBeforeYesterday.getTime() + 12 * 60 * 60 * 1000 + 35 * 60 * 1000)),
    },
    {
      id: 'mock_record_003',
      title: '楼下音乐派对',
      date: formatDateStr(threeDaysAgo),
      startTime: '20:30',
      endTime: '23:45',
      durationMinutes: 195,
      noiseType: 'music',
      intensity: 4,
      description: '楼下住户开派对，音乐声很大，低音炮震得地板都在抖，一直持续到将近午夜。已向物业投诉。',
      location: 'downstairs',
      impactTagIds: ['sleep_insomnia', 'emotion_anxiety'],
      evidenceIds: ['mock_evidence_002'],
      createdAt: toISO(new Date(threeDaysAgo.getTime() + 23 * 60 * 60 * 1000 + 50 * 60 * 1000)),
      updatedAt: toISO(new Date(threeDaysAgo.getTime() + 23 * 60 * 60 * 1000 + 50 * 60 * 1000)),
    },
    {
      id: 'mock_record_004',
      title: '宠物狗持续吠叫',
      date: formatDateStr(today),
      startTime: '07:20',
      endTime: '08:05',
      durationMinutes: 45,
      noiseType: 'animals',
      intensity: 3,
      description: '早晨准备出门上班时，听到走廊里有狗一直在叫，主人不在家，大概持续了半个多小时才安静下来。',
      location: 'hallway',
      impactTagIds: ['emotion_irritable'],
      evidenceIds: [],
      createdAt: toISO(new Date(today.getTime() + 8 * 60 * 60 * 1000 + 10 * 60 * 1000)),
      updatedAt: toISO(new Date(today.getTime() + 8 * 60 * 60 * 1000 + 10 * 60 * 1000)),
    },
    {
      id: 'mock_record_005',
      title: '管道漏水敲击声',
      date: formatDateStr(yesterday),
      startTime: '14:10',
      endTime: '15:00',
      durationMinutes: 50,
      noiseType: 'plumbing',
      intensity: 3,
      description: '卫生间管道传出规律性敲击声，疑似水管共振或漏水问题，已联系维修师傅上门检查。',
      location: 'same_room',
      impactTagIds: ['work_distraction', 'health_palpitations'],
      evidenceIds: [],
      createdAt: toISO(new Date(yesterday.getTime() + 15 * 60 * 60 * 1000 + 5 * 60 * 1000)),
      updatedAt: toISO(new Date(yesterday.getTime() + 15 * 60 * 60 * 1000 + 5 * 60 * 1000)),
    },
  ];
};

const generateMockEvidence = (): Evidence[] => {
  return [
    {
      id: 'mock_evidence_001',
      recordId: 'mock_record_001',
      type: 'text',
      name: '文字描述记录',
      dataUrl: '记录了楼上脚步声的大致时间和频率，从23:15开始，每5-10分钟走动一次，每次持续约2-3分钟。期间有两次明显的重物放下的声音，时间分别在23:32和23:47左右。',
      mimeType: 'text/plain',
      sizeKB: 0.5,
      note: '详细记录了噪音出现的时间点',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock_evidence_002',
      recordId: 'mock_record_003',
      type: 'text',
      name: '物业投诉记录',
      dataUrl: '2024年X月X日，因楼下噪音问题致电物业投诉，物业记录编号：WL2024XXXX。物业表示将上门沟通协调。',
      mimeType: 'text/plain',
      sizeKB: 0.3,
      note: '已备案',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

// ==================== 持久化辅助方法 ====================

const persistRecords = (records: NoiseRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('保存记录失败:', e);
  }
};

const persistEvidence = (evidence: Evidence[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(evidence));
  } catch (e) {
    console.error('保存证据失败:', e);
  }
};

const persistFilters = (filters: Filters) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
  } catch (e) {
    console.error('保存筛选条件失败:', e);
  }
};

const persistFilterPresets = (presets: FilterPreset[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FILTER_PRESETS, JSON.stringify(presets));
  } catch (e) {
    console.error('保存筛选方案失败:', e);
  }
};

const loadRecords = (): NoiseRecord[] | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (data) {
      return JSON.parse(data) as NoiseRecord[];
    }
  } catch (e) {
    console.error('加载记录失败:', e);
  }
  return null;
};

const loadEvidence = (): Evidence[] | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EVIDENCE);
    if (data) {
      return JSON.parse(data) as Evidence[];
    }
  } catch (e) {
    console.error('加载证据失败:', e);
  }
  return null;
};

const loadFilters = (): Filters | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FILTERS);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_FILTERS,
        ...parsed,
        dateRange: {
          ...DEFAULT_FILTERS.dateRange,
          ...(parsed.dateRange ?? {}),
        },
      };
    }
  } catch (e) {
    console.error('加载筛选条件失败:', e);
  }
  return null;
};

const loadFilterPresets = (): FilterPreset[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FILTER_PRESETS);
    if (data) {
      return JSON.parse(data) as FilterPreset[];
    }
  } catch (e) {
    console.error('加载筛选方案失败:', e);
  }
  return [];
};

// ==================== 深拷贝辅助方法 ====================
const deepCloneFilters = (filters: Filters): Filters => {
  return {
    ...filters,
    dateRange: { ...filters.dateRange },
    noiseTypes: [...filters.noiseTypes],
    impactTagIds: [...filters.impactTagIds],
  };
};

// ==================== 创建 Store ====================

export const useRecordsStore = create<RecordsState>((set, get) => ({
  records: generateMockRecords(),
  evidence: generateMockEvidence(),
  isFormModalOpen: false,
  editingRecordId: null,
  previewEvidenceId: null,
  filters: { ...DEFAULT_FILTERS },
  filterPresets: [],
  activePresetId: null,

  addRecord: (recordData) => {
    const now = new Date().toISOString();
    const newRecord: NoiseRecord = {
      ...recordData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const newRecords = [newRecord, ...get().records];
    set({ records: newRecords });
    persistRecords(newRecords);
  },

  updateRecord: (id, partial) => {
    const newRecords = get().records.map((record) =>
      record.id === id
        ? { ...record, ...partial, updatedAt: new Date().toISOString() }
        : record
    );
    set({ records: newRecords });
    persistRecords(newRecords);
  },

  deleteRecord: (id) => {
    const state = get();
    const targetRecord = state.records.find((r) => r.id === id);
    const evidenceIdsToDelete = targetRecord?.evidenceIds ?? [];

    const newRecords = state.records.filter((r) => r.id !== id);
    const newEvidence = state.evidence.filter(
      (e) => !evidenceIdsToDelete.includes(e.id)
    );

    set({ records: newRecords, evidence: newEvidence });
    persistRecords(newRecords);
    persistEvidence(newEvidence);
  },

  addEvidence: (evidenceData) => {
    const newEvidenceItem: Evidence = {
      ...evidenceData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const newEvidence = [newEvidenceItem, ...get().evidence];

    const newRecords = get().records.map((record) =>
      record.id === evidenceData.recordId
        ? {
            ...record,
            evidenceIds: [...record.evidenceIds, newEvidenceItem.id],
            updatedAt: new Date().toISOString(),
          }
        : record
    );

    set({ evidence: newEvidence, records: newRecords });
    persistEvidence(newEvidence);
    persistRecords(newRecords);
  },

  deleteEvidence: (id) => {
    const state = get();
    const targetEvidence = state.evidence.find((e) => e.id === id);
    if (!targetEvidence) return;

    const newEvidence = state.evidence.filter((e) => e.id !== id);

    const newRecords = state.records.map((record) =>
      record.id === targetEvidence.recordId
        ? {
            ...record,
            evidenceIds: record.evidenceIds.filter((eid) => eid !== id),
            updatedAt: new Date().toISOString(),
          }
        : record
    );

    set({ evidence: newEvidence, records: newRecords });
    persistEvidence(newEvidence);
    persistRecords(newRecords);
  },

  openNewForm: () => {
    set({
      isFormModalOpen: true,
      editingRecordId: null,
    });
  },

  openEditForm: (id) => {
    set({
      isFormModalOpen: true,
      editingRecordId: id,
    });
  },

  closeForm: () => {
    set({
      isFormModalOpen: false,
      editingRecordId: null,
    });
  },

  setPreviewEvidence: (id) => {
    set({ previewEvidenceId: id });
  },

  setFilters: (partial) => {
    set((state) => {
      const newFilters = {
        ...state.filters,
        ...partial,
        dateRange: {
          ...state.filters.dateRange,
          ...(partial.dateRange ?? {}),
        },
      };
      persistFilters(newFilters);
      return {
        filters: newFilters,
        activePresetId: null,
      };
    });
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS }, activePresetId: null });
    persistFilters(DEFAULT_FILTERS);
  },

  addFilterPreset: (name, filters) => {
    const state = get();
    const newPreset: FilterPreset = {
      id: generateId(),
      name,
      filters: deepCloneFilters(filters),
      createdAt: new Date().toISOString(),
      order: state.filterPresets.length,
    };
    const newPresets = [...state.filterPresets, newPreset];
    set({ filterPresets: newPresets });
    persistFilterPresets(newPresets);
  },

  updateFilterPreset: (id, data) => {
    const state = get();
    const newPresets = state.filterPresets.map((preset) =>
      preset.id === id
        ? {
            ...preset,
            ...(data.name ? { name: data.name } : {}),
            ...(data.filters ? { filters: deepCloneFilters(data.filters) } : {}),
          }
        : preset
    );
    set({ filterPresets: newPresets });
    persistFilterPresets(newPresets);
  },

  deleteFilterPreset: (id) => {
    const state = get();
    const newPresets = state.filterPresets.filter((p) => p.id !== id);
    set({
      filterPresets: newPresets,
      activePresetId: state.activePresetId === id ? null : state.activePresetId,
    });
    persistFilterPresets(newPresets);
  },

  reorderFilterPresets: (orderedIds) => {
    const state = get();
    const idToPreset = new Map(state.filterPresets.map((p) => [p.id, p]));
    const newPresets = orderedIds
      .map((id, index) => {
        const preset = idToPreset.get(id);
        return preset ? { ...preset, order: index } : null;
      })
      .filter((p): p is FilterPreset => p !== null);

    state.filterPresets.forEach((p) => {
      if (!orderedIds.includes(p.id)) {
        newPresets.push({ ...p, order: newPresets.length });
      }
    });

    set({ filterPresets: newPresets });
    persistFilterPresets(newPresets);
  },

  applyFilterPreset: (id) => {
    const state = get();
    const preset = state.filterPresets.find((p) => p.id === id);
    if (preset) {
      const newFilters = deepCloneFilters(preset.filters);
      set({ filters: newFilters, activePresetId: id });
      persistFilters(newFilters);
    }
  },

  hydrateFromStorage: () => {
    const storedRecords = loadRecords();
    const storedEvidence = loadEvidence();
    const storedFilters = loadFilters();
    const storedPresets = loadFilterPresets();

    if (storedRecords && storedRecords.length > 0) {
      set({ records: storedRecords });
    } else {
      persistRecords(get().records);
    }

    if (storedEvidence && storedEvidence.length > 0) {
      set({ evidence: storedEvidence });
    } else {
      persistEvidence(get().evidence);
    }

    if (storedFilters) {
      set({ filters: storedFilters });
    } else {
      persistFilters(get().filters);
    }

    set({ filterPresets: storedPresets });
  },
}));

// ==================== 辅助选择器 ====================

export const selectRecordById = (id: string): NoiseRecord | undefined => {
  return useRecordsStore.getState().records.find((r) => r.id === id);
};

export const selectEvidenceByRecordId = (recordId: string): Evidence[] => {
  return useRecordsStore.getState().evidence.filter((e) => e.recordId === recordId);
};

export const selectFilteredRecords = (
  records: NoiseRecord[],
  filters: Filters
): NoiseRecord[] => {
  return records.filter((record) => {
    if (filters.dateRange.start && record.date < filters.dateRange.start) {
      return false;
    }
    if (filters.dateRange.end && record.date > filters.dateRange.end) {
      return false;
    }

    if (filters.noiseTypes.length > 0 && !filters.noiseTypes.includes(record.noiseType)) {
      return false;
    }

    if (
      filters.impactTagIds.length > 0 &&
      !record.impactTagIds.some((id) => filters.impactTagIds.includes(id))
    ) {
      return false;
    }

    if (filters.keyword.trim()) {
      const keyword = filters.keyword.trim().toLowerCase();
      const inTitle = record.title.toLowerCase().includes(keyword);
      const inDescription = record.description.toLowerCase().includes(keyword);
      if (!inTitle && !inDescription) {
        return false;
      }
    }

    return true;
  });
};
