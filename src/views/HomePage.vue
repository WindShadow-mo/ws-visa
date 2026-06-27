<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20">
    <h1 class="text-3xl font-bold tracking-tight mb-4">{{ t('home.title') }}</h1>
    <p class="text-muted-foreground text-center max-w-md mb-8">
      {{ t('home.description') }}
    </p>

    <div class="w-full max-w-md">
      <RouterLink
        to="/uk-visa"
        class="block rounded-lg border border-border p-6 transition-shadow hover:shadow-md cursor-pointer"
      >
        <h2 class="text-lg font-semibold mb-1">{{ t('home.startUkVisa') }}</h2>
        <p class="text-sm text-muted-foreground">{{ t('home.startUkVisaDesc') }}</p>
      </RouterLink>
    </div>
  </div>
</template>
