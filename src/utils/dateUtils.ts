/**
 * 日期时间工具函数集合
 * 基于 date-fns 库实现，提供日期格式化、计算等常用功能
 */

import {
  format,
  parse,
  addDays,
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
import type { NoiseRecord } from '@/types';

// 常用日期时间格式常量
const DATE_FORMAT = 'yyyy-MM-dd';
const TIME_FORMAT = 'HH:mm';
const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm';
const DISPLAY_DATE_FORMAT = 'yyyy年MM月dd日';
const DISPLAY_TIME_FORMAT = 'HH:mm';
const DISPLAY_DATETIME_FORMAT = 'yyyy年MM月dd日 HH:mm';

/**
 * 格式化日期为 YYYY-MM-DD 格式
 *
 * @param date 日期对象或可解析的日期字符串
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, DATE_FORMAT);
};

/**
 * 格式化时间为 HH:mm 格式
 *
 * @param date 日期对象或可解析的日期字符串
 * @returns 格式化后的时间字符串
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, TIME_FORMAT);
};

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm 格式
 *
 * @param date 日期对象或可解析的日期字符串
 * @returns 格式化后的日期时间字符串
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, DATETIME_FORMAT);
};

/**
 * 格式化日期为中文显示格式（yyyy年MM月dd日）
 *
 * @param date 日期对象或可解析的日期字符串
 * @returns 中文格式日期
 */
export const formatDisplayDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, DISPLAY_DATE_FORMAT, { locale: zhCN });
};

/**
 * 格式化日期时间为中文显示格式
 *
 * @param date 日期对象或可解析的日期字符串
 * @returns 中文格式日期时间
 */
export const formatDisplayDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, DISPLAY_DATETIME_FORMAT, { locale: zhCN });
};

/**
 * 将分钟数转换为友好的时长文本
 *
 * @param minutes 分钟数
 * @returns 格式化的时长文本，如 "2小时15分钟"、"45分钟"
 */
export const getDurationText = (minutes: number): string => {
  if (minutes <= 0) return '0分钟';
  if (minutes < 60) return `${minutes}分钟`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}小时`;
  }
  return `${hours}小时${remainingMinutes}分钟`;
};

/**
 * 计算两个时间之间的分钟数差
 *
 * @param startTime 开始时间（HH:mm格式）
 * @param endTime 结束时间（HH:mm格式）
 * @returns 分钟数差值（如果结束时间早于开始时间，会自动加一天）
 */
export const calculateDuration = (startTime: string, endTime: string): number => {
  // 解析时间字符串，使用任意日期作为基准
  const baseDate = '2000-01-01';
  const start = parse(`${baseDate} ${startTime}`, `${DATE_FORMAT} ${TIME_FORMAT}`, new Date());
  let end = parse(`${baseDate} ${endTime}`, `${DATE_FORMAT} ${TIME_FORMAT}`, new Date());

  // 如果结束时间早于开始时间，说明跨天了，结束时间加一天
  if (end < start) {
    end = addDays(end, 1);
  }

  return Math.max(0, differenceInMinutes(end, start));
};

/**
 * 判断是否为夜间时段
 * 夜间定义：22:00 - 次日06:00
 *
 * @param time 时间字符串（HH:mm格式）
 * @returns 是否为夜间
 */
export const isNightTime = (time: string): boolean => {
  const [hours] = time.split(':').map(Number);
  // 22点及以后，或6点以前
  return hours >= 22 || hours < 6;
};

/**
 * 获取指定日期所在周的日期范围
 *
 * @param date 参考日期，默认为今天
 * @returns { start: string, end: string } 起止日期（YYYY-MM-DD格式）
 */
export const getDateRangeByWeek = (date: Date = new Date()): { start: string; end: string } => {
  // 周的起始日为周一（符合中文习惯）
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return {
    start: formatDate(start),
    end: formatDate(end),
  };
};

/**
 * 获取指定日期所在月的日期范围
 *
 * @param date 参考日期，默认为今天
 * @returns { start: string, end: string } 起止日期（YYYY-MM-DD格式）
 */
export const getDateRangeByMonth = (date: Date = new Date()): { start: string; end: string } => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return {
    start: formatDate(start),
    end: formatDate(end),
  };
};

/**
 * 获取最近7天的日期范围
 *
 * @returns { start: string, end: string } 起止日期（YYYY-MM-DD格式）
 */
export const getLast7Days = (): { start: string; end: string } => {
  const end = new Date();
  const start = addDays(end, -6); // 包含今天共7天
  return {
    start: formatDate(start),
    end: formatDate(end),
  };
};

/**
 * 按日期对噪音记录进行分组
 *
 * @param records 噪音记录数组
 * @returns 按日期分组的记录对象，key为日期（YYYY-MM-DD）
 */
export const groupRecordsByDate = (
  records: NoiseRecord[]
): Record<string, NoiseRecord[]> => {
  const result: Record<string, NoiseRecord[]> = {};

  for (const record of records) {
    if (!result[record.date]) {
      result[record.date] = [];
    }
    result[record.date].push(record);
  }

  // 按日期降序排列每个分组内的记录（最新的在前）
  for (const date in result) {
    result[date].sort((a, b) => {
      const timeA = `${a.date} ${a.startTime}`;
      const timeB = `${b.date} ${b.startTime}`;
      return timeB.localeCompare(timeA);
    });
  }

  return result;
};

/**
 * 判断日期是否在指定范围内
 *
 * @param date 待判断日期（YYYY-MM-DD）
 * @param startDate 范围起始日期（YYYY-MM-DD）
 * @param endDate 范围结束日期（YYYY-MM-DD）
 * @returns 是否在范围内
 */
export const isDateInRange = (
  date: string,
  startDate: string,
  endDate: string
): boolean => {
  const target = parse(date, DATE_FORMAT, new Date());
  const start = parse(startDate, DATE_FORMAT, new Date());
  const end = parse(endDate, DATE_FORMAT, new Date());

  return isWithinInterval(target, { start, end });
};

/**
 * 获取日期范围内所有日期的数组
 *
 * @param startDate 起始日期（YYYY-MM-DD）
 * @param endDate 结束日期（YYYY-MM-DD）
 * @returns 日期字符串数组（YYYY-MM-DD）
 */
export const getDatesInRange = (startDate: string, endDate: string): string[] => {
  const start = parse(startDate, DATE_FORMAT, new Date());
  const end = parse(endDate, DATE_FORMAT, new Date());
  const days = eachDayOfInterval({ start, end });
  return days.map((day) => formatDate(day));
};
