<script setup lang="ts">
import { computed, type HTMLAttributes } from "vue"
import { AccordionItem, type AccordionItemProps } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<AccordionItemProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <AccordionItem v-bind="delegatedProps" :class="cn('border-b', props.class)">
    <slot />
  </AccordionItem>
</template>
