<script setup lang="ts">
import { ref } from 'vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { siteConfig } from '@/config/site'
import { useI18n } from 'vue-i18n'
import { HelpCircle, X } from 'lucide-vue-next'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import wechatQr from '@/assets/wechat-qr.jpg'

const route = useRoute()
const { t } = useI18n()
const breadcrumbTitleKey = computed(() => route.meta.titleKey as string | undefined)
const showBreadcrumb = computed(() => !!breadcrumbTitleKey.value)
const showHelpModal = ref(false)
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
          <span class="h-5 w-px mx-3 border-l border-foreground/10" />
          <button type="button" class="nav-help-btn" @click="showHelpModal = true">
            <HelpCircle :size="15" :stroke-width="2" />
            <span>{{ t('helpBanner.navLabel') }}</span>
          </button>
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

  <!-- 帮助弹窗 -->
  <Teleport to="body">
    <Transition name="help-fade">
      <div v-if="showHelpModal" class="help-overlay" @click.self="showHelpModal = false">
        <div class="help-dialog">
          <button type="button" class="help-dialog-close" @click="showHelpModal = false">
            <X :size="18" />
          </button>
          <h3 class="help-dialog-title">{{ t('helpBanner.title') }}</h3>
          <p class="help-dialog-subtitle">{{ t('helpBanner.subtitle') }}</p>
          <div class="help-dialog-steps">
            <div v-for="i in [0, 1, 2]" :key="i" class="help-dialog-step">
              <span class="help-dialog-step-num">{{ i + 1 }}</span>
              <div>
                <div class="help-dialog-step-title">{{ t(`helpBanner.steps.${i}.title`) }}</div>
                <div class="help-dialog-step-desc">{{ t(`helpBanner.steps.${i}.desc`) }}</div>
              </div>
            </div>
          </div>
          <div class="help-dialog-contact">
            <div class="help-dialog-contact-name">{{ t('helpBanner.contactName') }}</div>
            <div class="help-dialog-contact-qr">
              <img :src="wechatQr" :alt="t('helpBanner.contactName')" width="210" height="210" />
              <span class="help-dialog-contact-qr-hint">{{ t('helpBanner.contactWechatHint') }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.nav-help-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid hsl(var(--foreground) / 0.12);
  background: transparent;
  color: hsl(var(--foreground) / 0.6);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.15s;
}

.nav-help-btn:hover {
  background: hsl(var(--accent));
  border-color: hsl(var(--foreground) / 0.2);
  color: hsl(var(--foreground));
}

.help-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  padding: 2rem;
}

.help-dialog {
  position: relative;
  width: 100%;
  max-width: 480px;
  padding: 2rem;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.08);
}

.help-dialog-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: none;
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  transition: all 0.15s;
}

.help-dialog-close:hover {
  background: hsl(var(--accent));
  color: hsl(var(--foreground));
}

.help-dialog-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem;
  letter-spacing: -0.02em;
}

.help-dialog-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1.5rem;
}

.help-dialog-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.help-dialog-step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.help-dialog-step-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #0c4a6e, #0284c7);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 700;
  flex-shrink: 0;
}

.help-dialog-step-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.125rem;
}

.help-dialog-step-desc {
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1.5;
}

.help-dialog-contact {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.25rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 1px solid #bae6fd;
}

.help-dialog-contact-name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #0c4a6e;
  margin-bottom: 0.75rem;
}

.help-dialog-contact-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.help-dialog-contact-qr img {
  width: 210px;
  height: 210px;
  border-radius: 0.5rem;
  background: white;
  padding: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.help-dialog-contact-qr-hint {
  font-size: 0.8125rem;
  color: #64748b;
}

.help-fade-enter-active,
.help-fade-leave-active {
  transition: opacity 0.25s ease;
}

.help-fade-enter-from,
.help-fade-leave-to {
  opacity: 0;
}
</style>
