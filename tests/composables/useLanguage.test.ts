// tests/composables/useLanguage.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { defineComponent, h, nextTick } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

// 创建测试用 i18n 实例
function createTestI18n(initialLocale: 'zh-CN' | 'en' = 'en') {
  return createI18n({
    legacy: false,
    locale: initialLocale,
    fallbackLocale: 'zh-CN',
    messages: {
      'zh-CN': { test: '测试' },
      en: { test: 'Test' },
    },
  })
}

// 辅助组件：在 i18n 上下文中调用 useLanguage
function createTestComponent() {
  let composableResult: ReturnType<typeof useLanguage> | undefined
  const TestComp = defineComponent({
    setup() {
      composableResult = useLanguage()
      return () => h('div')
    },
  })
  return { TestComp, getResult: () => composableResult! }
}

describe('useLanguage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return currentLocale matching i18n initial locale', () => {
    const i18n = createTestI18n('en')
    const { TestComp, getResult } = createTestComponent()
    mount(TestComp, {
      global: { plugins: [i18n] },
    })
    const result = getResult()
    expect(result.currentLocale.value).toBe('en')
  })

  it('should switch language with switchLanguage()', async () => {
    const i18n = createTestI18n('en')
    const { TestComp, getResult } = createTestComponent()
    mount(TestComp, {
      global: { plugins: [i18n] },
    })
    const result = getResult()

    expect(result.currentLocale.value).toBe('en')
    result.switchLanguage('zh-CN')
    await nextTick()

    expect(result.currentLocale.value).toBe('zh-CN')
    expect(i18n.global.locale.value).toBe('zh-CN')
  })

  it('should toggle language with toggleLanguage()', async () => {
    const i18n = createTestI18n('en')
    const { TestComp, getResult } = createTestComponent()
    mount(TestComp, {
      global: { plugins: [i18n] },
    })
    const result = getResult()

    expect(result.currentLocale.value).toBe('en')

    result.toggleLanguage()
    await nextTick()
    expect(result.currentLocale.value).toBe('zh-CN')

    result.toggleLanguage()
    await nextTick()
    expect(result.currentLocale.value).toBe('en')
  })

  it('should persist locale to localStorage', async () => {
    const i18n = createTestI18n('en')
    const { TestComp, getResult } = createTestComponent()
    mount(TestComp, {
      global: { plugins: [i18n] },
    })
    const result = getResult()

    result.switchLanguage('zh-CN')
    await nextTick()

    const stored = localStorage.getItem('ws-visa-locale')
    expect(stored).toBe('zh-CN')
  })

  it('should return supportedLocales array', () => {
    const i18n = createTestI18n('en')
    const { TestComp, getResult } = createTestComponent()
    mount(TestComp, {
      global: { plugins: [i18n] },
    })
    const result = getResult()

    expect(result.supportedLocales).toEqual(['zh-CN', 'en'])
  })

  it('should sync vue-i18n locale when currentLocale is set', async () => {
    const i18n = createTestI18n('en')
    const { TestComp, getResult } = createTestComponent()
    mount(TestComp, {
      global: { plugins: [i18n] },
    })
    const result = getResult()

    result.currentLocale.value = 'zh-CN'
    await nextTick()

    expect(i18n.global.locale.value).toBe('zh-CN')
  })
})
