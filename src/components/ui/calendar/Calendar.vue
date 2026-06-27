<script lang="ts" setup>
import type { CalendarRootEmits, CalendarRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { computed, ref } from "vue"
import { CalendarDate } from "@internationalized/date"
import { CalendarRoot, useForwardPropsEmits } from "reka-ui"
import { cn } from "@/lib/utils"
import { CalendarCell, CalendarCellTrigger, CalendarGrid, CalendarGridBody, CalendarGridHead, CalendarGridRow, CalendarHeadCell, CalendarHeader, CalendarNextButton, CalendarPrevButton } from "."

const props = defineProps<CalendarRootProps & { class?: HTMLAttributes["class"], locale?: string }>()

const emits = defineEmits<CalendarRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, locale: _l, ...rest } = props
  return rest
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)

// 控制当前显示的年月
const now = new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, 1)
const placeholder = ref<CalendarDate>(props.placeholder ?? now)

function handlePlaceholderUpdate(date: CalendarDate) {
  placeholder.value = date
}

const displayedMonth = computed(() => placeholder.value.month)
const displayedYear = computed(() => placeholder.value.year)
</script>

<template>
  <CalendarRoot
    v-slot="{ grid, weekDays }"
    :class="cn('p-3', props.class)"
    :locale="locale"
    :placeholder="placeholder"
    @update:placeholder="handlePlaceholderUpdate"
    v-bind="forwarded"
  >
    <CalendarHeader :month="displayedMonth" :year="displayedYear" :locale="locale" @update:placeholder="handlePlaceholderUpdate">
      <CalendarPrevButton />
      <CalendarNextButton />
    </CalendarHeader>

    <div class="flex flex-col gap-y-4 mt-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
      <CalendarGrid v-for="month in grid" :key="month.value.toString()">
        <CalendarGridHead>
          <CalendarGridRow>
            <CalendarHeadCell
              v-for="day in weekDays" :key="day"
            >
              {{ day }}
            </CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody>
          <CalendarGridRow v-for="(weekDates, index) in month.rows" :key="`weekDate-${index}`" class="mt-2 w-full">
            <CalendarCell
              v-for="weekDate in weekDates"
              :key="weekDate.toString()"
              :date="weekDate"
            >
              <CalendarCellTrigger
                :day="weekDate"
                :month="month.value"
              />
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </div>
  </CalendarRoot>
</template>
