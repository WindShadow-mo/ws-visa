// src/utils/date.ts
// 日期格式化工具函数 — 使用 Intl.DateTimeFormat 根据 locale 格式化日期显示

/**
 * 将 ISO 8601 日期字符串按 locale 格式化为显示文本
 *
 * 中文: "2026年06月27日" (zh-CN)
 * 英文: "06/27/2026" (en)
 *
 * @param isoStr - ISO 8601 日期字符串（如 "2026-06-27"）
 * @param locale - 目标 locale（如 "zh-CN" 或 "en"）
 * @returns 格式化后的日期字符串；空字符串输入返回空字符串；无效日期返回原值
 */
export function formatDisplayDate(isoStr: string, locale: string): string {
  if (!isoStr) return ''

  // 添加时间部分以避免 UTC 时区偏移导致日期前移一天
  const date = new Date(isoStr + 'T00:00:00')
  if (isNaN(date.getTime())) return isoStr // 无效日期返回原值

  const formatMap: Record<string, Intl.DateTimeFormatOptions> = {
    'zh-CN': { year: 'numeric', month: 'long', day: 'numeric' },
    'en': { year: 'numeric', month: '2-digit', day: '2-digit' },
  }

  const options = formatMap[locale] || formatMap['en']
  const effectiveLocale = formatMap[locale] ? locale : 'en'
  return new Intl.DateTimeFormat(effectiveLocale, options).format(date)
}

/**
 * 将 Date 对象转为 ISO 8601 日期字符串 (YYYY-MM-DD)
 *
 * @param date - JavaScript Date 对象
 * @returns "YYYY-MM-DD" 格式字符串（如 "2026-06-27"）
 */
export function toISODateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 将 YYYY-MM 格式的年月字符串按 locale 格式化为显示文本
 *
 * 中文: "2026年06月" (zh-CN)
 * 英文: "06/2026" (en)
 *
 * @param monthStr - YYYY-MM 格式字符串（如 "2026-06"）
 * @param locale - 目标 locale（如 "zh-CN" 或 "en"）
 * @returns 格式化后的年月字符串；空字符串输入返回空字符串
 */
export function formatDisplayMonth(monthStr: string, locale: string): string {
  if (!monthStr) return ''
  const [year, month] = monthStr.split('-')
  if (!year || !month) return ''
  if (locale === 'zh-CN') return `${year}年${month}月`
  return `${month}/${year}`
}
