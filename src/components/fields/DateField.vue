<script setup lang="ts">
// DateField — 日期选择字段组件
// 基于 shadcn-vue Calendar + Popover，通过 i18n key 引用所有可见文字
// 使用 @internationalized/date 的 parseDate 实现 CalendarDate 互操作

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { parseDate, type CalendarDate } from '@internationalized/date'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { formatDisplayDate } from '@/utils/date'
import FormFieldWrapper from '@/components/fields/FormFieldWrapper.vue'

const props = defineProps<{
  name: string
  labelKey: string
  descriptionKey?: string
  required?: boolean
  modelValue: string  // ISO 8601 string like "2026-06-27"
  error?: string
  span?: 'full' | 'half' | 'third'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t, locale } = useI18n()

const label = computed(() => t(props.labelKey))
const description = computed(() =>
  props.descriptionKey ? t(props.descriptionKey) : undefined,
)

// 将 ISO string 转为 CalendarDate（shadcn-vue Calendar 需要）
const calendarValue = computed(() => {
  if (!props.modelValue) return undefined
  return parseDate(props.modelValue)
})

// 显示文本：按当前 locale 格式化
const displayText = computed(() => {
  if (!props.modelValue) return t('common.placeholders.selectDate')
  return formatDisplayDate(props.modelValue, locale.value)
})

function onDateSelect(date: CalendarDate) {
  // CalendarDate → ISO string: 直接拼接
  const iso = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  emit('update:modelValue', iso)
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
    <Popover>
      <PopoverTrigger as-child>
        <Button variant="outline" :id="name" :name="name" class="w-full justify-start text-left font-normal">
          {{ displayText }}
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0">
        <Calendar
          :model-value="calendarValue"
          :locale="locale"
          @update:model-value="onDateSelect"
        />
      </PopoverContent>
    </Popover>
  </FormFieldWrapper>
</template>
