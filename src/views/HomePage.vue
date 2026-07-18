<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const visaTypes = [
  { to: '/us-visa', titleKey: 'home.startUsVisa', descKey: 'home.startUsVisaDesc', flag: 'us', comingSoon: false },
  { to: '/uk-visa', titleKey: 'home.startUkVisa', descKey: 'home.startUkVisaDesc', flag: 'gb', comingSoon: false },
]
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20">
    <h1 class="text-3xl font-bold tracking-tight mb-4">{{ t('home.title') }}</h1>
    <p class="text-muted-foreground text-center max-w-md mb-8">
      {{ t('home.description') }}
    </p>

    <div class="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <template v-for="visa in visaTypes" :key="visa.flag">
        <!-- Active card -->
        <RouterLink
          v-if="!visa.comingSoon"
          :to="visa.to"
          class="flex items-start gap-4 rounded-lg border border-border p-6 transition-shadow hover:shadow-md cursor-pointer"
        >
          <span class="fi shrink-0" :class="'fi-' + visa.flag" style="width:48px;height:36px" />
          <div>
            <h2 class="text-lg font-semibold">{{ t(visa.titleKey) }}</h2>
            <p class="text-sm text-muted-foreground">{{ t(visa.descKey) }}</p>
          </div>
        </RouterLink>

        <!-- Coming soon card -->
        <div
          v-else
          class="relative flex items-start gap-4 rounded-lg border border-dashed border-border/50 p-6 opacity-60 cursor-not-allowed"
        >
          <span class="fi shrink-0 opacity-50" :class="'fi-' + visa.flag" style="width:48px;height:36px" />
          <div>
            <h2 class="text-lg font-semibold text-muted-foreground">{{ t(visa.titleKey) }}</h2>
            <p class="text-sm text-muted-foreground/70">{{ t(visa.descKey) }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
