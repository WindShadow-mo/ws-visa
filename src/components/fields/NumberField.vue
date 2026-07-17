<script setup lang="ts">
// NumberField — 数字输入字段组件
// 基于 shadcn-vue NumberField，通过 i18n key 引用所有可见文字

import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'
import { Checkbox } from '@/components/ui/checkbox'
import FormFieldWrapper from '@/components/fields/FormFieldWrapper.vue'
import { useDnaDnk } from '@/composables/useDnaDnk'

const props = defineProps<{
  name: string
  labelKey: string
  descriptionKey?: string
  required?: boolean
  min?: number
  max?: number
  step?: number
  modelValue: number | undefined
  error?: string
  span?: 'full' | 'half' | 'third' | 'quarter'
  /** 后缀单位文本，显示在输入框右侧（如 '¥', 'kg'） */
  suffix?: string
  /** 是否显示"不适用"复选框 */
  doesNotApply?: boolean
  /** 是否显示"不知道"复选框 */
  doNotKnow?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | undefined]
}>()

const { t } = useI18n()

const label = computed(() => t(props.labelKey))
const description = computed(() =>
  props.descriptionKey ? t(props.descriptionKey) : undefined,
)

// DNA/DNK — ponytail: bridge between number modelValue and string composable
const stringModelValue = computed(() =>
  props.modelValue != null ? String(props.modelValue) : '',
)
function dnaEmit(_event: 'update:modelValue', value: string) {
  if (value === 'N/A' || value === 'DNC') {
    emit('update:modelValue', undefined)
  } else {
    emit('update:modelValue', value === '' ? undefined : Number(value))
  }
}
const { isDnaChecked, isDnkChecked, isDisabled, toggleDna, toggleDnk } =
  useDnaDnk(stringModelValue as any, dnaEmit as any, props)
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
    <div class="flex items-start gap-3">
      <div class="flex-1">
        <NumberField
          :id="name"
          :model-value="modelValue"
          :min="min"
          :max="max"
          :step="step"
          :disabled="isDisabled"
          @update:model-value="emit('update:modelValue', $event)"
        >
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput :class="suffix ? 'pr-12' : ''" />
            <NumberFieldIncrement />
            <span v-if="suffix" class="absolute right-8 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none z-10">{{ suffix }}</span>
          </NumberFieldContent>
        </NumberField>
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
