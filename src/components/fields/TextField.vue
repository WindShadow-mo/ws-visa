<script setup lang="ts">
// TextField — 文本输入字段组件
// 基于 shadcn-vue Input，通过 i18n key 引用所有可见文字

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Input } from '@/components/ui/input'
import FormFieldWrapper from '@/components/fields/FormFieldWrapper.vue'

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
    <Input
      :id="name"
      :name="name"
      type="text"
      :model-value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxLength"
      :inputmode="inputmode"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </FormFieldWrapper>
</template>
