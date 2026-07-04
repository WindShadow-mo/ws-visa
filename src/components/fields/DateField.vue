<script setup lang="ts">
// DateField — 日期选择字段组件
// 基于 shadcn-vue Calendar + Popover，通过 i18n key 引用所有可见文字
// 使用 @internationalized/date 的 parseDate 实现 CalendarDate 互操作

import { computed, inject, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import * as icons from '@lucide/vue'
import { parseDate, type CalendarDate, type DateValue } from '@internationalized/date'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { formatDisplayDate } from '@/utils/date'
import FormFieldWrapper from '@/components/fields/FormFieldWrapper.vue'

const props = withDefaults(defineProps<{
  name: string
  labelKey: string
  descriptionKey?: string
  required?: boolean
  modelValue: string  // ISO 8601 string like "2026-06-27"
  minValue?: string   // ISO 8601 min date constraint
  maxValue?: string   // ISO 8601 max date constraint
  error?: string
  /** 网格跨度，默认 third（日期是短字段，占1/4行） */
  span?: 'full' | 'half' | 'third'
  /** Lucide 图标名称，显示在日期文本左侧（如 'Calendar'） */
  prefixIcon?: string
}>(), {
  span: 'third',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t, locale } = useI18n()

// 注入父组件的一键填充状态：填充期间强制关闭日历面板，防止被意外展开
const isFormFilling = inject<Ref<boolean>>('form-filling', ref(false))
const popoverOpen = ref(false)
watch([isFormFilling, popoverOpen], ([filling, open]) => {
  if (filling && open) popoverOpen.value = false
})
function onPopoverUpdateOpen(val: boolean) {
  popoverOpen.value = val
}

const label = computed(() => t(props.labelKey))
const description = computed(() =>
  props.descriptionKey ? t(props.descriptionKey) : undefined,
)

const IconComponent = computed(() => {
  if (!props.prefixIcon) return null
  return (icons as Record<string, unknown>)[props.prefixIcon] as typeof icons.Calendar | undefined
})

// 将 ISO string 转为 CalendarDate（shadcn-vue Calendar 需要）
const calendarValue = computed(() => {
  if (!props.modelValue) return undefined
  return parseDate(props.modelValue)
})

// min/max 约束转 CalendarDate
const calendarMin = computed(() => props.minValue ? parseDate(props.minValue) : undefined)
const calendarMax = computed(() => props.maxValue ? parseDate(props.maxValue) : undefined)

// 显示文本：按当前 locale 格式化
const displayText = computed(() => {
  if (!props.modelValue) return t('common.placeholders.selectDate')
  return formatDisplayDate(props.modelValue, locale.value)
})

function onDateSelect(date: DateValue | undefined) {
  if (!date || !('year' in date)) return
  // CalendarDate → ISO string: 直接拼接
  const d = date as CalendarDate
  const iso = `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
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
    <Popover :open="popoverOpen" @update:open="onPopoverUpdateOpen">
      <PopoverTrigger as-child>
        <Button variant="outline" :id="name" :name="name" class="w-full justify-start text-left font-normal">
          <component :is="IconComponent" v-if="IconComponent" :size="16" class="mr-2 shrink-0 text-muted-foreground" />
          {{ displayText }}
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0">
        <Calendar
          :model-value="calendarValue"
          :min-value="calendarMin"
          :max-value="calendarMax"
          :locale="locale"
          @update:model-value="onDateSelect"
        />
      </PopoverContent>
    </Popover>
  </FormFieldWrapper>
</template>
