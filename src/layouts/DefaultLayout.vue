<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { siteConfig } from '@/config/site'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const route = useRoute()
const { t } = useI18n()
const breadcrumbTitleKey = computed(() => route.meta.titleKey as string | undefined)
const showBreadcrumb = computed(() => !!breadcrumbTitleKey.value)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container mx-auto flex h-14 items-center px-4">
        <RouterLink to="/" class="text-lg font-semibold hover:opacity-80 transition-opacity">
          {{ siteConfig.name }}
        </RouterLink>
        <nav class="ml-auto flex items-center text-sm">
          <RouterLink to="/" class="text-foreground/70 hover:text-foreground transition-colors">
            {{ t('common.home') }}
          </RouterLink>
          <span class="h-5 w-px mx-3 border-l border-foreground/10" />
          <LanguageSwitcher />
        </nav>
      </div>
    </header>

    <div v-if="showBreadcrumb" class="bg-muted/30 border-b">
      <div class="max-w-6xl mx-auto flex items-center gap-2 text-sm px-4 py-2">
        <RouterLink to="/" class="text-muted-foreground hover:text-foreground transition-colors">
          ← {{ t('common.home') }}
        </RouterLink>
        <span class="text-muted-foreground/50">/</span>
        <span class="font-semibold text-foreground">{{ t(breadcrumbTitleKey!) }}</span>
      </div>
    </div>

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
