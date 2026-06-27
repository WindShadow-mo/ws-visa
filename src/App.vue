<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { siteConfig } from '@/config/site'

useHead({
  title: siteConfig.name,
  meta: [
    { name: 'description', content: siteConfig.description },
  ],
})
</script>

<template>
  <RouterView />
</template>
