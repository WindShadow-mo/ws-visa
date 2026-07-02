<script setup lang="ts">
// NumberField — 数字输入字段组件
// 基于 shadcn-vue NumberField，通过 i18n key 引用所有可见文字

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'
import FormFieldWrapper from '@/components/fields/FormFieldWrapper.vue'

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
  span?: 'full' | 'half' | 'third'
  /** 后缀单位文本，显示在输入框右侧（如 '¥', 'kg'） */
  suffix?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | undefined]
}>()

const { t } = useI18n()

const label = computed(() => t(props.labelKey))
const description = computed(() =>
  props.descriptionKey ? t(props.descriptionKey) : undefined,
)
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
    <NumberField
      :id="name"
      :model-value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput :class="suffix ? 'pr-12' : ''" />
        <NumberFieldIncrement />
        <span v-if="suffix" class="absolute right-8 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none z-10">{{ suffix }}</span>
      </NumberFieldContent>
    </NumberField>
  </FormFieldWrapper>
</template>
