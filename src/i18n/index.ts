// src/i18n/index.ts
// vue-i18n v11 实例创建与导出

import { createI18n } from 'vue-i18n'
import zhCN from '@/locales/zh-CN.json'
import en from '@/locales/en.json'

export type SupportedLocale = 'zh-CN' | 'en'

/**
 * 检测初始 locale
 * 优先级：localStorage → navigator.language → 默认 'en'
 */
function detectLocale(): SupportedLocale {
  // 优先从 localStorage 读取（由 useLanguage composable 写入）
  try {
    const stored = localStorage.getItem('ws-visa-locale')
    if (stored === 'zh-CN' || stored === 'en') return stored
  } catch {
    // localStorage 不可用时静默回退
  }

  // 其次检测浏览器语言
  const browserLang = navigator.language
  if (browserLang.startsWith('zh')) return 'zh-CN'

  return 'en'
}

export const i18n = createI18n({
  legacy: false,           // 必须：v11 中 Legacy API 已废弃
  locale: detectLocale(),  // 初始 locale
  fallbackLocale: 'zh-CN', // 回退语言：中文
  messages: {
    'zh-CN': zhCN,
    'en': en,
  },
})
