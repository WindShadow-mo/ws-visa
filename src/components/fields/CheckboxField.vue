<script setup lang="ts">
// CheckboxField — 多选字段组件
// 基于 shadcn-vue Checkbox，通过 i18n key 引用所有可见文字

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import FormFieldWrapper from '@/components/fields/FormFieldWrapper.vue'

export interface CheckboxOption {
  value: string
  labelKey: string
}

const props = defineProps<{
  name: string
  labelKey: string
  descriptionKey?: string
  required?: boolean
  options: CheckboxOption[]
  modelValue: string[]
  error?: string
  span?: 'full' | 'half' | 'third'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const { t } = useI18n()

const label = computed(() => t(props.labelKey))
const description = computed(() =>
  props.descriptionKey ? t(props.descriptionKey) : undefined,
)

function isChecked(value: string): boolean {
  return props.modelValue.includes(value)
}

function toggleOption(value: string) {
  const newValue = isChecked(value)
    ? props.modelValue.filter((v) => v !== value)
    : [...props.modelValue, value]
  emit('update:modelValue', newValue)
}
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
    <div class="flex flex-wrap gap-2">
      <label
        v-for="option in options"
        :key="option.value"
        :class="[
          'flex items-center gap-2 rounded-lg border-2 px-4 py-1.5 cursor-pointer transition-colors backdrop-blur-sm',
          isChecked(option.value)
            ? 'border-primary bg-primary/20 shadow-sm'
            : 'bg-primary/10 border-primary/30 hover:bg-primary/15 hover:border-primary/45 shadow-sm'
        ]"
      >
        <Checkbox
          :id="`${name}-${option.value}`"
          :checked="isChecked(option.value)"
          @update:checked="toggleOption(option.value)"
        />
        <Label :for="`${name}-${option.value}`" class="cursor-pointer font-normal">
          {{ t(option.labelKey) }}
        </Label>
      </label>
    </div>
  </FormFieldWrapper>
</template>
