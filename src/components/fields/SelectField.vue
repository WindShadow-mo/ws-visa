<script setup lang="ts">
// SelectField — 下拉选择字段组件
// 基于 shadcn-vue Select，通过 i18n key 引用所有可见文字

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import FormFieldWrapper from '@/components/fields/FormFieldWrapper.vue'

export interface SelectOption {
  value: string
  labelKey: string
}

const props = defineProps<{
  name: string
  labelKey: string
  descriptionKey?: string
  required?: boolean
  options: SelectOption[]
  multiple?: boolean
  modelValue: string | string[]
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
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
  >
    <Select
      :model-value="modelValue"
      :multiple="multiple"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <SelectTrigger :id="name">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ t(option.labelKey) }}
        </SelectItem>
      </SelectContent>
    </Select>
  </FormFieldWrapper>
</template>
