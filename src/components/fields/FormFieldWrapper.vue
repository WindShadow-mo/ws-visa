<script setup lang="ts">
// FormFieldWrapper — 统一 label + slot + error + description 包裹器
// 所有字段组件内部使用，保证布局一致

import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { Label } from '@/components/ui/label'

const { t } = useI18n()

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
  /** 网格跨度：full=整行, half=1/2行, third=UK 3列网格的1/3, quarter=US 4列网格的1/4 */
  span?: 'full' | 'half' | 'third' | 'quarter'
  /** 字段名，用于从父级 invalidFields 判断校验失败状态 */
  fieldName?: string
}>()

// ponytail: optional inject — UKVisaForm 未提供时无影响；reactive(Set) 直接调用 has 即可
const invalidFields = inject<Set<string> | undefined>('usVisaInvalidFields', undefined)

const isInvalid = computed(() => !!props.fieldName && !!invalidFields?.has(props.fieldName))

const displayError = computed(() => props.error || (isInvalid.value ? t('common.labels.required') : undefined))

const spanClass = computed(() => {
  if (props.span === 'half') return 'field-span-half'
  if (props.span === 'third') return 'field-span-third'
  if (props.span === 'quarter') return 'field-span-quarter'
  return 'field-span-full'
})
</script>

<template>
  <div class="space-y-2" :class="[spanClass, { 'field-invalid': isInvalid }]">
    <Label :for="htmlFor">
      {{ label }}
      <span v-if="required" class="text-destructive">*</span>
    </Label>
    <slot />
    <p v-if="displayError" class="text-sm text-destructive">{{ displayError }}</p>
    <p v-if="description && !displayError" class="text-sm text-muted-foreground">{{ description }}</p>
  </div>
</template>

<style scoped>
.field-invalid :deep(input),
.field-invalid :deep(textarea),
.field-invalid :deep(button) {
  border-color: hsl(var(--destructive, 0 84.2% 60.2%)) !important;
  box-shadow: 0 0 0 1px hsl(var(--destructive, 0 84.2% 60.2%));
}
.field-invalid :deep(label[class*="border-"]) {
  border-color: hsl(var(--destructive, 0 84.2% 60.2%)) !important;
}
</style>
