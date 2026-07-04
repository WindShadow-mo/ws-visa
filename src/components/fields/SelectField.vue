<script setup lang="ts">
// SelectField — 下拉选择字段组件
// 基于 shadcn-vue Select，通过 i18n key 引用所有可见文字
// 支持 filterable 模式：Popover + 搜索框 + 滚动列表

import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check } from '@lucide/vue'
import FormFieldWrapper from '@/components/fields/FormFieldWrapper.vue'

export interface SelectOption {
  value: string
  labelKey: string
}

const props = withDefaults(defineProps<{
  name: string
  labelKey: string
  descriptionKey?: string
  required?: boolean
  options: SelectOption[]
  multiple?: boolean
  modelValue: string | string[]
  error?: string
  /** 网格跨度，默认 half（下拉字段需要更多空间显示选项文本，占1/2行） */
  span?: 'full' | 'half' | 'third'
  filterable?: boolean
}>(), {
  span: 'half',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

const { t } = useI18n()

const label = computed(() => t(props.labelKey))
const description = computed(() =>
  props.descriptionKey ? t(props.descriptionKey) : undefined,
)

// 根据当前值返回翻译后的标签（响应式，语言切换时自动更新）
const selectedLabel = computed(() => {
  const value = props.modelValue
  if (Array.isArray(value)) return ''
  const option = props.options.find(o => o.value === value)
  // ponytail: raw value fallback for values not in options (e.g. custom/OTHER entries)
  return option ? t(option.labelKey) : value
})

// ---- filterable 模式 ----
const searchQuery = ref('')
const popoverOpen = ref(false)

const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter(o => t(o.labelKey).toLowerCase().includes(q))
})

function onSelectOption(value: string) {
  emit('update:modelValue', value)
  popoverOpen.value = false
  searchQuery.value = ''
}

// Popover 关闭时清空搜索
watch(popoverOpen, (open) => {
  if (!open) searchQuery.value = ''
})
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
    <!-- 标准 Select 模式 -->
    <Select
      v-if="!filterable"
      :model-value="modelValue"
      :multiple="multiple"
      @update:model-value="emit('update:modelValue', $event as string | string[])"
    >
      <SelectTrigger :id="name" :name="name" class="bg-muted/30">
        <SelectValue :placeholder="selectedLabel">{{ selectedLabel }}</SelectValue>
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

    <!-- 可搜索 Popover 模式 -->
    <Popover v-else v-model:open="popoverOpen">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          :id="name"
          :name="name"
          type="button"
          class="w-full justify-start text-left font-normal"
          :class="{ 'text-muted-foreground': !selectedLabel }"
        >
          {{ selectedLabel || t('common.placeholders.selectOption') }}
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-[220px] p-0" align="start">
        <div class="p-2 pb-1">
          <Input
            v-model="searchQuery"
            :placeholder="t('common.placeholders.searchOption')"
            class="h-8 text-sm"
          />
        </div>
        <div class="max-h-[200px] overflow-y-auto px-1 pb-1">
          <button
            v-for="option in filteredOptions"
            :key="option.value"
            type="button"
            class="flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
            :class="{ 'bg-accent font-medium': option.value === modelValue }"
            @click="onSelectOption(option.value)"
          >
            <Check v-if="option.value === modelValue" :size="14" class="shrink-0" />
            <span v-else class="w-[14px] shrink-0" />
            {{ t(option.labelKey) }}
          </button>
          <p v-if="filteredOptions.length === 0" class="py-2 text-center text-sm text-muted-foreground">
            {{ t('common.placeholders.enterText') }}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  </FormFieldWrapper>
</template>
