<script setup lang="ts">
// RadioField — 单选字段组件
// 基于 shadcn-vue RadioGroup，通过 i18n key 引用所有可见文字

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import FormFieldWrapper from '@/components/fields/FormFieldWrapper.vue'

export interface RadioOption {
  value: string
  labelKey: string
}

const props = defineProps<{
  name: string
  labelKey: string
  descriptionKey?: string
  required?: boolean
  options: RadioOption[]
  modelValue: string
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
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
    <RadioGroup
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <!-- 隐藏 input 用于校验聚焦定位 -->
      <input type="hidden" :name="name" :value="modelValue" />
      <div
        v-for="option in options"
        :key="option.value"
        class="flex items-center space-x-2"
      >
        <RadioGroupItem :id="`${name}-${option.value}`" :value="option.value" />
        <Label :for="`${name}-${option.value}`">{{ t(option.labelKey) }}</Label>
      </div>
    </RadioGroup>
  </FormFieldWrapper>
</template>
