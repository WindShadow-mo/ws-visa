<script setup lang="ts">
import { siteConfig } from '@/config/site'
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20">
    <h1 class="text-3xl font-bold tracking-tight mb-4">{{ siteConfig.description }}</h1>
    <p class="text-muted-foreground text-center max-w-md">
      欢迎使用{{ siteConfig.name }}，请从导航菜单选择功能开始使用。
    </p>
  </div>
</template>
