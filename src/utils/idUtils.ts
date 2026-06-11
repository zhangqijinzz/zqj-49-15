/**
 * ID生成工具函数集合
 * 提供生成唯一标识的工具方法
 */

/**
 * 生成简化版UUID（RFC4122 v4格式的简化实现）
 * 使用时间戳 + 随机数组合确保唯一性
 *
 * @returns 格式为 xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx 的UUID字符串
 */
export const generateId = (): string => {
  // 使用 Date.now() 作为前缀，提高唯一性
  const timestamp = Date.now().toString(16);

  // 生成随机部分：替换模板中的 x 和 y
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  const randomPart = template.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });

  // 将时间戳拼接到前面，使ID具有一定的时间有序性
  return `${timestamp}-${randomPart}`;
};

/**
 * 生成基于时间的ID
 * 格式：前缀 + 时间戳 + 随机数，适用于需要按时间排序的场景
 *
 * @param prefix 可选前缀，默认为 'id'
 * @returns 格式为 {prefix}_{timestamp}_{random} 的ID字符串
 */
export const generateTimeBasedId = (prefix: string = 'id'): string => {
  // 获取当前时间戳（毫秒级）
  const timestamp = Date.now();

  // 生成4位随机数，防止同一毫秒内冲突
  const randomSuffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  // 组合生成最终ID
  return `${prefix}_${timestamp}_${randomSuffix}`;
};

/**
 * 生成短ID（8位字符）
 * 适用于不需要全局唯一但需要简短标识的场景
 *
 * @returns 8位随机字符串
 */
export const generateShortId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
