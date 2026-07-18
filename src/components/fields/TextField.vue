<script setup lang="ts">
// TextField — 文本输入字段组件
// 基于 shadcn-vue Input，通过 i18n key 引用所有可见文字

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import * as icons from '@lucide/vue'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import FormFieldWrapper from '@/components/fields/FormFieldWrapper.vue'
import { useDnaDnk } from '@/composables/useDnaDnk'

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
  /** 网格跨度，默认 half（文本字段中等长度，占1/2行；长文本描述用 full，短字段用 quarter） */
  span?: 'full' | 'half' | 'third' | 'quarter'
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
  /** 是否显示"不适用"复选框 */
  doesNotApply?: boolean
  /** 是否显示"不知道"复选框 */
  doNotKnow?: boolean
  /** 外部禁用（由父组件控制，与 DNA/DNK 的 isDisabled 取并集） */
  disabled?: boolean
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

// ponytail: when DNA/DNK active, modelValue is 'N/A'|'DNC' — show empty input
const displayValue = computed(() =>
  props.modelValue === 'N/A' || props.modelValue === 'DNC' ? '' : props.modelValue,
)

// DNA/DNK — ponytail: cast needed because modelValue is always string for TextField
const { isDnaChecked, isDnkChecked, isDisabled, toggleDna, toggleDnk } =
  useDnaDnk(computed(() => props.modelValue) as any, emit as any, props)
</script>

<template>
  <FormFieldWrapper
    :label="label"
    :html-for="name"
    :required="required"
    :error="error"
    :description="description"
    :span="span"
    :field-name="name"
  >
    <div class="flex items-start gap-3">
      <div class="relative flex-1">
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
          :value="displayValue"
          :placeholder="placeholder"
          :maxlength="maxLength"
          :disabled="isDisabled || disabled"
          :class="['flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', IconComponent ? 'pl-10' : '']"
          @input="($event: Event) => emit('update:modelValue', filterByConstraint(constraint, ($event.target as HTMLTextAreaElement).value))"
        />
        <!-- ponytail: when constraint is set, use native <input> with :value/@input —
             shadcn Input uses v-model which can't sync DOM when filter produces same value -->
        <input
          v-else-if="constraint"
          :id="name"
          :name="name"
          type="text"
          :value="displayValue"
          :placeholder="placeholder"
          :maxlength="maxLength"
          :inputmode="inputmode"
          :disabled="isDisabled || disabled"
          :pattern="CONSTRAINT_HTML_PATTERNS[constraint]"
          :class="['flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-foreground file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', IconComponent ? 'pl-10' : '', suffix ? 'pr-8' : '']"
          @input="($event: Event) => { const t = $event.target as HTMLInputElement; const filtered = filterByConstraint(constraint, t.value); t.value = filtered; emit('update:modelValue', filtered) }"
        />
        <Input
          v-else
          :id="name"
          :name="name"
          type="text"
          :model-value="displayValue"
          :placeholder="placeholder"
          :maxlength="maxLength"
          :inputmode="inputmode"
          :disabled="isDisabled || disabled"
          :class="[IconComponent ? 'pl-10' : '', suffix ? 'pr-8' : '']"
          @update:model-value="(v: string | number) => emit('update:modelValue', filterByConstraint(constraint, String(v)))"
        />
        <span v-if="suffix" class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">{{ suffix }}</span>
      </div>
      <div v-if="doesNotApply || doNotKnow" class="flex flex-col gap-1.5 pt-1.5">
        <span v-if="doesNotApply" class="inline-flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap cursor-pointer" @click="toggleDna(!isDnaChecked)">
          <Checkbox :checked="isDnaChecked" />
          {{ t('common.labels.doesNotApply') }}
        </span>
        <span v-if="doNotKnow" class="inline-flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap cursor-pointer" @click="toggleDnk(!isDnkChecked)">
          <Checkbox :checked="isDnkChecked" />
          {{ t('common.labels.doNotKnow') }}
        </span>
      </div>
    </div>
  </FormFieldWrapper>
</template>
