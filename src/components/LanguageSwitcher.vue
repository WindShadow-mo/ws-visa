<script setup lang="ts">
import { Globe } from 'lucide-vue-next'
import { useLanguage } from '@/composables/useLanguage'

const { currentLocale, toggleLanguage } = useLanguage()
</script>

<template>
  <button
    class="lang-switcher"
    :title="currentLocale === 'zh-CN' ? 'English' : '中文'"
    @click="toggleLanguage"
  >
    <Globe :size="14" :stroke-width="1.75" />
    <span class="lang-label" aria-live="polite">
      <span class="lang-text" :class="{ active: currentLocale === 'zh-CN' }">中</span>
      <span class="lang-text" :class="{ active: currentLocale === 'en' }">EN</span>
    </span>
  </button>
</template>

<style scoped>
.lang-switcher {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 1.75rem;
  padding: 0 0.625rem;
  border: 1px solid hsl(var(--border) / 0.4);
  border-radius: 9999px;
  color: hsl(var(--foreground) / 0.55);
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  transition: all 0.25s ease;
}

.lang-switcher:hover {
  color: hsl(var(--foreground) / 0.85);
  border-color: hsl(var(--border) / 0.7);
  background: hsl(var(--muted) / 0.3);
}

.lang-label {
  display: grid;
  /* ponytail: grid stack — both labels occupy one cell, height = max(中, EN). Only active one is visible. */
  min-width: 1.15em;
  text-align: center;
  line-height: 1;
}

.lang-text {
  grid-area: 1 / 1;
  opacity: 0;
  transform: translateY(3px);
  transition: opacity 0.22s ease, transform 0.22s ease;
  pointer-events: none;
}

.lang-text.active {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
</style>
