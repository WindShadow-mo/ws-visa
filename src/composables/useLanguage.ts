// src/composables/useLanguage.ts
// 语言切换 composable — 封装 vue-i18n locale 管理 + localStorage 持久化

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStorage } from '@vueuse/core'
import type { SupportedLocale } from '@/i18n'

const STORAGE_KEY = 'ws-visa-locale'
const SUPPORTED_LOCALES: SupportedLocale[] = ['zh-CN', 'en']

/**
 * 语言切换 composable
 *
 * - currentLocale: 响应式当前语言（读写均同步 localStorage 和 vue-i18n）
 * - switchLanguage: 切换到指定语言
 * - toggleLanguage: 在中英文之间切换
 * - supportedLocales: 支持的语言列表
 */
export function useLanguage() {
  const { locale } = useI18n({ useScope: 'global' })

  // useStorage 自动同步 localStorage 和响应式状态
  const storedLocale = useStorage<SupportedLocale>(
    STORAGE_KEY,
    locale.value as SupportedLocale,
  )

  const currentLocale = computed({
    get: () => storedLocale.value,
    set: (val: SupportedLocale) => {
      storedLocale.value = val
      locale.value = val // 同步更新 vue-i18n 的 locale
    },
  })

  function switchLanguage(lang: SupportedLocale) {
    currentLocale.value = lang
  }

  function toggleLanguage() {
    const next = currentLocale.value === 'zh-CN' ? 'en' : 'zh-CN'
    switchLanguage(next)
  }

  return {
    currentLocale,
    switchLanguage,
    toggleLanguage,
    supportedLocales: SUPPORTED_LOCALES,
  }
}
