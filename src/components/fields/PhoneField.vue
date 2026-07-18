<script setup lang="ts">
// PhoneField — 电话号码字段组件
// 将国家区号选择器（紧凑显示：国旗 + 区号 + 下拉箭头）与电话号码输入合并为一行
// 区号选择复用 CountrySelectField 的拼音/字母索引 Popover 模式

import { computed, inject, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDown } from '@lucide/vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import FormFieldWrapper from '@/components/fields/FormFieldWrapper.vue'
import type { SelectOption } from '@/components/fields/SelectField.vue'
import { phoneCountryCodeOptions } from '@/config/countryOptions'

const props = defineProps<{
  name: string
  labelKey: string
  placeholderKey?: string
  required?: boolean
  modelValue: string        // phone number (v-model)
  countryCode: string       // phone country code ISO2 like 'CN'
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]    // phone number
  'update:countryCode': [value: string]   // ISO2 country code
}>()

const { t, locale } = useI18n()

const label = computed(() => t(props.labelKey))
const placeholder = computed(() =>
  props.placeholderKey ? t(props.placeholderKey) : undefined,
)

// ---- 区号相关 ----
const options = computed(() => phoneCountryCodeOptions)

// 按当前 locale 排序
const sortedOptions = computed(() => {
  const collator = new Intl.Collator(locale.value.startsWith('zh') ? 'zh-CN' : 'en', { sensitivity: 'base' })
  return [...options.value].sort((a, b) => collator.compare(t(a.labelKey), t(b.labelKey)))
})

// 从翻译文本中提取区号数字（"+86 中国" → "86"）
const dialCode = computed(() => {
  const opt = phoneCountryCodeOptions.find(o => o.value === props.countryCode)
  if (!opt) return ''
  const text = t(opt.labelKey)
  const match = text.match(/^\+(\d[\d-]*)/)
  return match ? match[1] : ''
})

// 中文首字符 → 拼音首字母映射
const zhCharMap: Record<string, string> = {
  '澳': 'A', '安': 'A', '阿': 'A', '奥': 'A', '爱': 'A', '埃': 'A',
  '巴': 'B', '白': 'B', '保': 'B', '北': 'B', '贝': 'B', '比': 'B', '玻': 'B', '不': 'B', '布': 'B', '波': 'B', '伯': 'B', '博': 'B', '冰': 'B',
  '查': 'C', '朝': 'C', '赤': 'C',
  '丹': 'D', '德': 'D', '第': 'D', '多': 'D', '东': 'D', '厄': 'E', '俄': 'E',
  '发': 'F', '法': 'F', '芬': 'F', '佛': 'F', '斐': 'F', '菲': 'F',
  '冈': 'G', '刚': 'G', '哥': 'G', '格': 'G', '古': 'G', '瓜': 'G', '圭': 'G',
  '哈': 'H', '海': 'H', '韩': 'H', '荷': 'H', '黑': 'H', '洪': 'H',
  '吉': 'J', '加': 'J', '柬': 'J', '几': 'J', '捷': 'J', '津': 'J',
  '喀': 'K', '科': 'K', '肯': 'K', '克': 'K', '库': 'K', '卡': 'K',
  '拉': 'L', '莱': 'L', '老': 'L', '黎': 'L', '立': 'L', '利': 'L', '列': 'L', '卢': 'L', '罗': 'L',
  '马': 'M', '毛': 'M', '美': 'M', '蒙': 'M', '孟': 'M', '秘': 'M', '摩': 'M', '莫': 'M', '墨': 'M', '缅': 'M',
  '纳': 'N', '南': 'N', '尼': 'N', '鸟': 'N', '挪': 'N',
  '帕': 'P', '培': 'P', '佩': 'P', '批': 'P', '皮': 'P', '婆': 'P', '葡': 'P',
  '其': 'Q', '千': 'Q', '前': 'Q', '强': 'Q', '琴': 'Q', '青': 'Q', '庆': 'Q', '秋': 'Q', '丘': 'Q', '曲': 'Q', '全': 'Q', '权': 'Q',
  '日': 'R', '瑞': 'R',
  '萨': 'S', '塞': 'S', '三': 'S', '桑': 'S', '沙': 'S', '山': 'S', '上': 'S', '圣': 'S', '斯': 'S', '苏': 'S', '索': 'S',
  '塔': 'T', '泰': 'T', '坦': 'T', '汤': 'T', '特': 'T', '突': 'T', '土': 'T', '图': 'T', '脱': 'T',
  '瓦': 'W', '外': 'W', '危': 'W', '委': 'W', '乌': 'W', '文': 'W',
  '西': 'X', '希': 'X', '新': 'X', '匈': 'X', '叙': 'X',
  '牙': 'Y', '亚': 'Y', '也': 'Y', '伊': 'Y', '以': 'Y', '意': 'Y', '印': 'Y', '英': 'Y', '约': 'Y', '越': 'Y',
  '赞': 'Z', '乍': 'Z', '智': 'Z', '中': 'Z',
}

// 根据翻译文本提取分组字母（locale-aware）
function getGroupLetter(opt: SelectOption): string {
  const text = t(opt.labelKey)
  const name = text.replace(/^\+\d+\s*/, '')
  const firstChar = name.charAt(0)
  if (/^[A-Za-z]/.test(firstChar)) return firstChar.toUpperCase()
  return zhCharMap[firstChar] || '#'
}

const groupedOptions = computed(() => {
  const groups = new Map<string, SelectOption[]>()
  for (const opt of sortedOptions.value) {
    const letter = getGroupLetter(opt)
    if (!groups.has(letter)) groups.set(letter, [])
    groups.get(letter)!.push(opt)
  }
  return Array.from(groups.entries()).sort((a, b) => {
    if (a[0] === '#') return 1
    if (b[0] === '#') return -1
    return a[0].localeCompare(b[0])
  })
})

// 侧栏字母表
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const activeLetters = computed(() => new Set(groupedOptions.value.map(([l]) => l)))

// ---- Popover 状态 ----
const codePopoverOpen = ref(false)
const searchQuery = ref('')

// 注入父组件的一键填充状态：填充期间强制关闭区号选择面板
const isFormFilling = inject<Ref<boolean>>('form-filling', ref(false))
watch([isFormFilling, () => codePopoverOpen.value], ([filling, open]) => {
  if (filling && open) codePopoverOpen.value = false
})

const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return sortedOptions.value
  return sortedOptions.value.filter(o => t(o.labelKey).toLowerCase().includes(q))
})

const filteredGroupedOptions = computed(() => {
  const groups = new Map<string, SelectOption[]>()
  for (const opt of filteredOptions.value) {
    const letter = getGroupLetter(opt)
    if (!groups.has(letter)) groups.set(letter, [])
    groups.get(letter)!.push(opt)
  }
  return Array.from(groups.entries()).sort((a, b) => {
    if (a[0] === '#') return 1
    if (b[0] === '#') return -1
    return a[0].localeCompare(b[0])
  })
})

function onSelectCode(value: string) {
  emit('update:countryCode', value)
  codePopoverOpen.value = false
  searchQuery.value = ''
}

function jumpToLetter(letter: string) {
  const el = document.getElementById(`phone-letter-${letter}-${props.name}`)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(codePopoverOpen, (open) => {
  if (!open) searchQuery.value = ''
})
</script>

<template>
  <FormFieldWrapper :label="label" :html-for="name" :required="required" :error="error" span="third">
    <div class="flex gap-1">
      <!-- 国家区号按钮（紧凑：国旗 + 区号 + 下拉箭头） -->
      <Popover v-model:open="codePopoverOpen">
        <PopoverTrigger as-child>
          <button type="button" class="flex items-center gap-1 h-10 px-2 border border-input rounded-md bg-background hover:bg-accent shrink-0 transition-colors">
            <span class="fi shrink-0" :class="`fi-${countryCode.toLowerCase()}`" style="width:20px;height:15px" />
            <span class="text-sm tabular-nums shrink-0">+{{ dialCode }}</span>
            <ChevronDown :size="14" class="opacity-50 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent class="w-[600px] p-0" side="bottom" align="start" :side-offset="4" :avoid-collisions="false">
          <div class="flex">
            <!-- 主内容区：搜索 + 分块网格 -->
            <div class="flex-1 min-w-0">
              <div class="p-2 pb-1.5 border-b">
                <Input
                  v-model="searchQuery"
                  :placeholder="t('common.placeholders.searchOption')"
                  class="h-8 text-sm"
                />
              </div>
              <div class="max-h-[400px] overflow-y-auto px-2 py-1.5">
                <template v-if="filteredGroupedOptions.length">
                  <div
                    v-for="[letter, items] in filteredGroupedOptions"
                    :key="letter"
                    class="flex items-stretch gap-2 mb-2"
                  >
                    <!-- 左侧字母列 -->
                    <div
                      :id="`phone-letter-${letter}-${name}`"
                      class="flex w-6 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-xs font-bold text-primary"
                    >
                      {{ letter }}
                    </div>
                    <!-- 右侧 3 列网格 -->
                    <div class="grid flex-1 grid-cols-3 gap-x-1 gap-y-0.5">
                      <button
                        v-for="opt in items"
                        :key="opt.value"
                        type="button"
                        class="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[13px] leading-tight transition-colors hover:bg-accent hover:text-accent-foreground"
                        :class="{ 'bg-primary/10 text-primary font-medium hover:bg-primary/15': opt.value === countryCode }"
                        @click="onSelectCode(opt.value)"
                      >
                        <span class="fi shrink-0" :class="`fi-${opt.value.toLowerCase()}`" style="width:20px;height:15px" />
                        <span class="truncate">{{ t(opt.labelKey) }}</span>
                      </button>
                    </div>
                  </div>
                </template>
                <p v-else class="py-4 text-center text-sm text-muted-foreground">
                  {{ t('common.placeholders.enterText') }}
                </p>
              </div>
            </div>
            <!-- 字母索引侧栏 -->
            <div class="flex w-6 flex-col items-center border-l py-1 overflow-y-auto">
              <button
                v-for="letter in alphabet"
                :key="letter"
                type="button"
                class="my-px flex h-4 w-4 items-center justify-center rounded text-[10px] leading-none"
                :class="activeLetters.has(letter)
                  ? 'font-bold text-foreground hover:bg-muted hover:text-primary'
                  : 'text-muted-foreground/40'"
                @click="jumpToLetter(letter)"
              >
                {{ letter }}
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <!-- 电话号码输入 -->
      <Input
        :id="name"
        :name="name"
        type="tel"
        :model-value="modelValue"
        :placeholder="placeholder"
        class="flex-1 min-w-0"
        inputmode="tel"
        @update:model-value="emit('update:modelValue', String($event))"
      />
    </div>
  </FormFieldWrapper>
</template>
