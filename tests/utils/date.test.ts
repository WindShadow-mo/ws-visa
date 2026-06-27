// tests/utils/date.test.ts
import { describe, it, expect } from 'vitest'
import { formatDisplayDate, toISODateString } from '@/utils/date'

describe('formatDisplayDate', () => {
  it('should format date in zh-CN locale', () => {
    const result = formatDisplayDate('2026-06-27', 'zh-CN')
    // 中文格式: "2026年06月27日" 或 "2026年6月27日"（月份可能不补零）
    expect(result).toMatch(/2026年/)
    expect(result).toMatch(/月/)
    expect(result).toMatch(/日/)
  })

  it('should format date in en locale', () => {
    const result = formatDisplayDate('2026-06-27', 'en')
    // 英文格式: "06/27/2026"
    expect(result).toMatch(/06\/27\/2026/)
  })

  it('should return empty string for empty input', () => {
    expect(formatDisplayDate('', 'zh-CN')).toBe('')
    expect(formatDisplayDate('', 'en')).toBe('')
  })

  it('should return original value for invalid date', () => {
    expect(formatDisplayDate('invalid', 'zh-CN')).toBe('invalid')
    expect(formatDisplayDate('invalid', 'en')).toBe('invalid')
  })

  it('should fallback to en format for unknown locale', () => {
    const result = formatDisplayDate('2026-06-27', 'fr')
    // 回退到 en 格式
    expect(result).toMatch(/06\/27\/2026/)
  })
})

describe('toISODateString', () => {
  it('should convert Date to ISO date string', () => {
    // new Date(2026, 5, 27) 表示 2026年6月27日（月份从0开始）
    const date = new Date(2026, 5, 27)
    expect(toISODateString(date)).toBe('2026-06-27')
  })

  it('should pad single-digit month and day', () => {
    const date = new Date(2026, 0, 5) // 2026年1月5日
    expect(toISODateString(date)).toBe('2026-01-05')
  })

  it('should handle December correctly', () => {
    const date = new Date(2026, 11, 31) // 2026年12月31日
    expect(toISODateString(date)).toBe('2026-12-31')
  })
})
