<script setup lang="ts">
// FormFieldWrapper — 统一 label + slot + error + description 包裹器
// 所有字段组件内部使用，保证布局一致

import { computed } from 'vue'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  /** 已翻译的标签文本 */
  label: string
  /** 关联的 input id */
  htmlFor?: string
  /** 是否显示必填标记 * */
  required?: boolean
  /** 错误信息文本 */
  error?: string
  /** 帮助文本 */
  description?: string
  /** 网格跨度：full=6列, half=3列, third=2列 */
  span?: 'full' | 'half' | 'third'
}>()

const spanClass = computed(() => {
  if (props.span === 'half') return 'field-span-half'
  if (props.span === 'third') return 'field-span-third'
  return 'field-span-full'
})
</script>

<template>
  <div class="space-y-2" :class="spanClass">
    <Label :for="htmlFor">
      {{ label }}
      <span v-if="required" class="text-destructive">*</span>
    </Label>
    <slot />
    <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
    <p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p>
  </div>
</template>
