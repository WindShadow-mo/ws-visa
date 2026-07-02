<script setup lang="ts">
// TextField — 文本输入字段组件
// 基于 shadcn-vue Input，通过 i18n key 引用所有可见文字

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import * as icons from '@lucide/vue'
import { Input } from '@/components/ui/input'
import FormFieldWrapper from '@/components/fields/FormFieldWrapper.vue'

export type InputConstraint = 'alpha' | 'alphanumeric' | 'numeric' | 'email'

const CONSTRAINT_PATTERNS: Record<InputConstraint, RegExp> = {
  alpha: /^[a-zA-Z\s]$/,
  alphanumeric: /^[a-zA-Z0-9\s]$/,
  numeric: /^[0-9]$/,
  email: /^[^\s@]$/,
}

const CONSTRAINT_HTML_PATTERNS: Record<InputConstraint, string> = {
  alpha: '[a-zA-Z\\s]+',
  alphanumeric: '[a-zA-Z0-9\\s]+',
  numeric: '[0-9]+',
  email: '[^\\s@]+@[^\\s@]+',
}

function filterByConstraint(constraint: InputConstraint | undefined, value: string): string {
  if (!constraint) return value
  const pattern = CONSTRAINT_PATTERNS[constraint]
  if (!pattern) return value
  return value.split('').filter(c => pattern.test(c)).join('')
}

const props = withDefaults(defineProps<{
  name: string
  labelKey: string
  placeholderKey?: string
  descriptionKey?: string
  required?: boolean
  maxLength?: number
  inputmode?: 'text' | 'numeric' | 'tel' | 'email' | 'url' | 'search' | 'decimal'
  modelValue: string
  error?: string
  /** 网格跨度，默认 half（文本字段中等长度，占1/2行；长文本描述用 full，短字段用 third） */
  span?: 'full' | 'half' | 'third'
  /** Lucide 图标名称，显示在输入框左侧（如 'Phone', 'Mail', 'BookOpen'） */
  prefixIcon?: string
  /** 后缀文本，显示在输入框右侧（如 '¥', 'CNY'） */
  suffix?: string
  /** 是否使用多行文本域 */
  multiline?: boolean
  /** 多行文本域行数，默认 3 */
  rows?: number
  /** 输入约束规则集，实时过滤非法字符 */
  constraint?: InputConstraint
}>(), {
  span: 'half',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()

const label = computed(() => t(props.labelKey))
const placeholder = computed(() =>
  props.placeholderKey ? t(props.placeholderKey) : undefined,
)
const description = computed(() =>
  props.descriptionKey ? t(props.descriptionKey) : undefined,
)

const IconComponent = computed(() => {
  if (!props.prefixIcon) return null
  return (icons as Record<string, unknown>)[props.prefixIcon] as typeof icons.Phone | undefined
})
</script>

<template>
  <FormFieldWrapper
    :label="label"
    :html-for="name"
    :required="required"
    :error="error"
    :description="description"
    :span="span"
  >
    <div class="relative">
      <component
        :is="IconComponent"
        v-if="IconComponent && !multiline"
        :size="16"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <component
        :is="IconComponent"
        v-if="IconComponent && multiline"
        :size="16"
        class="absolute left-3 top-3 text-muted-foreground pointer-events-none"
      />
      <textarea
        v-if="multiline"
        :id="name"
        :name="name"
        :rows="rows || 3"
        :value="modelValue"
        :placeholder="placeholder"
        :maxlength="maxLength"
        :class="['flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', IconComponent ? 'pl-10' : '']"
        @input="($event: Event) => emit('update:modelValue', filterByConstraint(constraint, ($event.target as HTMLTextAreaElement).value))"
      />
      <Input
        v-else
        :id="name"
        :name="name"
        type="text"
        :model-value="modelValue"
        :placeholder="placeholder"
        :maxlength="maxLength"
        :inputmode="inputmode"
        :pattern="constraint ? CONSTRAINT_HTML_PATTERNS[constraint] : undefined"
        :class="[IconComponent ? 'pl-10' : '', suffix ? 'pr-8' : '']"
        @update:model-value="(v: string) => emit('update:modelValue', filterByConstraint(constraint, v))"
      />
      <span v-if="suffix" class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">{{ suffix }}</span>
    </div>
  </FormFieldWrapper>
</template>
