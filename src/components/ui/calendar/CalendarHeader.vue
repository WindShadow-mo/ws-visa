<script lang="ts" setup>
import type { CalendarHeaderProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { CalendarDate } from "@internationalized/date"
import { CalendarHeader, useForwardProps } from "reka-ui"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const props = defineProps<CalendarHeaderProps & {
  class?: HTMLAttributes["class"]
  month?: number
  year?: number
  locale?: string
}>()

const emit = defineEmits<{
  "update:placeholder": [date: CalendarDate]
}>()

const delegatedProps = reactiveOmit(props, "class", "month", "year", "locale")
const forwardedProps = useForwardProps(delegatedProps)

// 生成本地化的月份名称列表
const monthNames = computed(() => {
  const locale = props.locale || "en"
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2000, i, 1)
    return new Intl.DateTimeFormat(locale, { month: "short" }).format(date)
  })
})

// 年份范围：从 1900 年到当前年份往后 20 年
const yearRange = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: currentYear - 1900 + 21 }, (_, i) => 1900 + i)
})

function onMonthChange(month: string) {
  const m = Number(month)
  const date = new CalendarDate(props.year ?? new Date().getFullYear(), m, 1)
  emit("update:placeholder", date)
}

function onYearChange(year: string) {
  const y = Number(year)
  const date = new CalendarDate(y, props.month ?? new Date().getMonth() + 1, 1)
  emit("update:placeholder", date)
}
</script>

<template>
  <CalendarHeader :class="cn('relative flex w-full items-center justify-between pt-1', props.class)" v-bind="forwardedProps">
    <slot />
    <div class="flex items-center gap-1">
      <Select :model-value="String(year ?? new Date().getFullYear())" @update:model-value="onYearChange">
        <SelectTrigger class="h-7 w-[80px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="y in yearRange" :key="y" :value="String(y)">
            {{ y }}
          </SelectItem>
        </SelectContent>
      </Select>
      <Select :model-value="String(month ?? 1)" @update:model-value="onMonthChange">
        <SelectTrigger class="h-7 w-[90px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="(name, i) in monthNames" :key="i + 1" :value="String(i + 1)">
            {{ name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </CalendarHeader>
</template>
