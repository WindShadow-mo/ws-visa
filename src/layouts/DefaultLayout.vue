<script setup lang="ts">
import { siteConfig } from '@/config/site'
import { useLanguage } from '@/composables/useLanguage'
import { useI18n } from 'vue-i18n'

const { toggleLanguage, currentLocale } = useLanguage()
const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container mx-auto flex h-14 items-center px-4">
        <RouterLink to="/" class="text-lg font-semibold hover:opacity-80 transition-opacity">
          {{ siteConfig.name }}
        </RouterLink>
        <nav class="ml-auto flex gap-4 text-sm">
          <RouterLink to="/" class="text-foreground/70 hover:text-foreground transition-colors">
            {{ t('common.home') }}
          </RouterLink>
          <button
            class="text-foreground/70 hover:text-foreground transition-colors"
            @click="toggleLanguage"
          >
            {{ currentLocale === 'zh-CN' ? 'EN' : '中文' }}
          </button>
        </nav>
      </div>
    </header>

    <main class="flex-1 container mx-auto px-4 py-6">
      <RouterView />
    </main>

    <footer class="border-t border-border py-4 text-center text-sm text-muted-foreground">
      <div class="container mx-auto px-4">
        {{ siteConfig.name }} &copy; {{ new Date().getFullYear() }}
      </div>
    </footer>
  </div>
</template>
