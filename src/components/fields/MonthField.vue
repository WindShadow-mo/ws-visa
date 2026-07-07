<script setup lang="ts">
// MonthField — 年月选择字段组件
// Popover 弹出年份导航 + 4×3 月份网格，存储 YYYY-MM 格式

import { computed, inject, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import * as icons from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDisplayMonth } from '@/utils/date'
import FormFieldWrapper from '@/components/fields/FormFieldWrapper.vue'

const props = withDefaults(defineProps<{
  name: string
  labelKey: string
  descriptionKey?: string
  required?: boolean
  modelValue: string  // YYYY-MM string like "2026-06"
  minValue?: string   // YYYY-MM min constraint
  maxValue?: string   // YYYY-MM max constraint
  error?: string
  /** 网格跨度，默认 third */
  span?: 'full' | 'half' | 'third'
  /** Lucide 图标名称，显示在文本左侧 */
  prefixIcon?: string
}>(), {
  span: 'third',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t, locale } = useI18n()

// 注入父组件的一键填充状态：填充期间强制关闭面板
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

// 当前面板显示的年份
const now = new Date()
const viewYear = ref<number>(
  props.modelValue ? parseInt(props.modelValue.split('-')[0], 10) || now.getFullYear() : now.getFullYear(),
)

// 年份下拉选项范围：当前年 ± 80 年
const currentYear = now.getFullYear()
const yearRange = Array.from({ length: 161 }, (_, i) => currentYear - 80 + i)

// 月份常量
const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const

// 显示文本
const displayText = computed(() => {
  if (!props.modelValue) return t('common.placeholders.selectDate')
  return formatDisplayMonth(props.modelValue, locale.value)
})

// 判断月份是否禁用（YYYY-MM 字符串字典序比较）
function isMonthDisabled(year: number, month: number): boolean {
  const ym = `${year}-${String(month).padStart(2, '0')}`
  if (props.minValue && ym < props.minValue) return true
  if (props.maxValue && ym > props.maxValue) return false
  return false
}

// 选择月份
function onMonthSelect(year: number, month: number) {
  if (isMonthDisabled(year, month)) return
  emit('update:modelValue', `${year}-${String(month).padStart(2, '0')}`)
  popoverOpen.value = false
}

function prevYear() { viewYear.value-- }
function nextYear() { viewYear.value++ }
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
        <!-- 年份导航 -->
        <div class="flex items-center justify-between px-3 py-2 border-b">
          <button type="button" class="p-1 hover:bg-accent rounded-md" @click="prevYear">
            <ChevronLeft :size="16" />
          </button>
          <Select :model-value="String(viewYear)" @update:model-value="(v) => viewYear = Number(v)">
            <SelectTrigger class="h-8 w-[120px] text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="y in yearRange" :key="y" :value="String(y)">
                {{ y }}
              </SelectItem>
            </SelectContent>
          </Select>
          <button type="button" class="p-1 hover:bg-accent rounded-md" @click="nextYear">
            <ChevronRight :size="16" />
          </button>
        </div>
        <!-- 4×3 月份网格 -->
        <div class="grid grid-cols-4 gap-1 p-3">
          <button
            v-for="m in months"
            :key="m"
            type="button"
            class="px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors"
            :class="{
              'bg-primary text-primary-foreground hover:bg-primary/90': modelValue && modelValue === `${viewYear}-${String(m).padStart(2, '0')}`,
              'text-muted-foreground opacity-50 cursor-not-allowed hover:bg-transparent': isMonthDisabled(viewYear, m),
            }"
            :disabled="isMonthDisabled(viewYear, m)"
            @click="onMonthSelect(viewYear, m)"
          >
            {{ t('common.months.' + m) }}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  </FormFieldWrapper>
</template>
