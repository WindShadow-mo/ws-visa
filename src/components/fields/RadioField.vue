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

const props = withDefaults(defineProps<{
  name: string
  labelKey: string
  descriptionKey?: string
  required?: boolean
  options: RadioOption[]
  modelValue: string
  error?: string
  /** 网格跨度，默认 full（单选按钮需要横向空间，占整行） */
  span?: 'full' | 'half' | 'third'
}>(), {
  span: 'full',
})

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
    :span="span"
  >
    <RadioGroup
      :model-value="modelValue"
      class="flex flex-wrap gap-2"
      @update:model-value="emit('update:modelValue', $event as string)"
    >
      <!-- 隐藏 input 用于校验聚焦定位 -->
      <input type="hidden" :name="name" :value="modelValue" />
      <label
        v-for="option in options"
        :key="option.value"
        :class="[
          'flex items-center gap-2 rounded-lg border-2 px-4 py-1.5 cursor-pointer transition-colors backdrop-blur-sm',
          modelValue === option.value
            ? 'border-[hsl(188,70%,42%)] bg-[hsl(188,70%,42%/0.20)] shadow-sm'
            : 'bg-[hsl(188,70%,42%/0.08)] border-[hsl(188,70%,42%/0.30)] hover:bg-[hsl(188,70%,42%/0.14)] hover:border-[hsl(188,70%,42%/0.50)] shadow-sm'
        ]"
      >
        <RadioGroupItem :id="`${name}-${option.value}`" :value="option.value" />
        <Label :for="`${name}-${option.value}`" class="cursor-pointer font-normal">
          {{ t(option.labelKey) }}
        </Label>
      </label>
    </RadioGroup>
  </FormFieldWrapper>
</template>

<style scoped>
/* 单选指示器覆盖为青色 */
:deep([data-radix-collection-item]),
:deep([role='radio']) {
  border-color: hsl(188 70% 42%) !important;
  color: hsl(188 70% 42%) !important;
}
</style>
