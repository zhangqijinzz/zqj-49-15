/**
 * 格式化工具函数集合
 * 提供噪音强度、类型、位置等的格式化显示，以及文本截断、标题生成等功能
 */

import type { NoiseType, LocationTag } from '@/types';
import { noiseTypes, getNoiseTypeConfig } from '@/constants/noiseTypes';
import { getLocationConfig } from '@/constants/locations';
import { formatDisplayDate } from './dateUtils';

/**
 * 噪音强度级别定义
 * 1级：轻微 - 5级：严重
 */
const intensityLevels: Record<number, { text: string; color: string }> = {
  1: { text: '轻微', color: 'text-success' },
  2: { text: '较轻', color: 'text-green-600' },
  3: { text: '中等', color: 'text-warning' },
  4: { text: '较重', color: 'text-orange-600' },
  5: { text: '严重', color: 'text-danger' },
};

/**
 * 将数字强度级别转换为文字描述
 *
 * @param level 强度级别（1-5）
 * @returns 对应的文字描述，如 "轻微"、"中等"、"严重"
 */
export const formatIntensity = (level: 1 | 2 | 3 | 4 | 5): string => {
  return intensityLevels[level]?.text ?? '未知';
};

/**
 * 获取强度级别的颜色类名
 *
 * @param level 强度级别（1-5）
 * @returns Tailwind 颜色类名
 */
export const getIntensityColor = (level: 1 | 2 | 3 | 4 | 5): string => {
  return intensityLevels[level]?.color ?? 'text-gray-500';
};

/**
 * 生成强度星级显示（使用★符号）
 *
 * @param level 强度级别（1-5）
 * @returns 星级字符串，如 "★★★☆☆"
 */
export const formatIntensityStars = (level: 1 | 2 | 3 | 4 | 5): string => {
  const filledStars = '★'.repeat(level);
  const emptyStars = '☆'.repeat(5 - level);
  return filledStars + emptyStars;
};

/**
 * 将噪音类型标识转换为中文显示名称
 *
 * @param type 噪音类型标识
 * @returns 中文名称
 */
export const formatNoiseType = (type: NoiseType): string => {
  const config = getNoiseTypeConfig(type);
  return config.name;
};

/**
 * 获取所有噪音类型选项（用于下拉选择等组件）
 *
 * @returns 噪音类型选项数组，包含 value 和 label
 */
export const getNoiseTypeOptions = (): { value: NoiseType; label: string }[] => {
  return noiseTypes.map((item) => ({
    value: item.key,
    label: item.name,
  }));
};

/**
 * 将位置标识转换为中文显示名称
 *
 * @param location 位置标签标识
 * @returns 中文名称
 */
export const formatLocation = (location: LocationTag): string => {
  const config = getLocationConfig(location);
  return config.name;
};

/**
 * 截断过长的文本，超出部分用省略号表示
 *
 * @param text 原始文本
 * @param maxLength 最大长度（字符数），默认100
 * @returns 截断后的文本
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  // 截断并添加省略号
  return text.slice(0, maxLength).trimEnd() + '...';
};

/**
 * 生成报告标题（根据日期范围）
 *
 * @param startDate 起始日期（YYYY-MM-DD格式）
 * @param endDate 结束日期（YYYY-MM-DD格式）
 * @returns 格式化的报告标题，如 "2024年01月01日 至 2024年01月07日 噪音记录报告"
 */
export const generateReportTitle = (startDate: string, endDate: string): string => {
  // 如果起止日期相同，只显示一个日期
  if (startDate === endDate) {
    return `${formatDisplayDate(startDate)} 噪音记录报告`;
  }

  // 否则显示日期范围
  return `${formatDisplayDate(startDate)} 至 ${formatDisplayDate(endDate)} 噪音记录报告`;
};

/**
 * 格式化文件大小（字节数转可读文本）
 *
 * @param bytes 文件大小（字节）
 * @returns 格式化的大小文本，如 "1.5 MB"
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * 格式化KB大小为可读文本
 *
 * @param sizeKB 文件大小（KB）
 * @returns 格式化的大小文本
 */
export const formatKBSize = (sizeKB: number): string => {
  if (sizeKB < 1024) {
    return `${sizeKB.toFixed(1)} KB`;
  }
  return `${(sizeKB / 1024).toFixed(1)} MB`;
};

/**
 * 格式化统计数字（大数字简化显示）
 *
 * @param num 数字
 * @returns 格式化后的文本，如 "1.2k"、"3.5万"
 */
export const formatNumber = (num: number): string => {
  if (num < 1000) {
    return num.toString();
  }
  if (num < 10000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return `${(num / 10000).toFixed(1)}万`;
};
