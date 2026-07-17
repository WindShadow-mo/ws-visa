<script setup lang="ts">
import {
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import type { PreviewSection, PreviewField } from '@/composables/usePdfExport'
import { DEFAULT_FIELD_SPAN } from '@/composables/usePdfExport'

interface Props {
  open: boolean
  /** 表单标题（如 "英国签证申请"） */
  formTitle: string
  /** 表单副标题（如 "标准访客签证"） */
  formSubtitle?: string
  /** 预览分组数据（由调用方构建，所有文本已翻译/解析） */
  sections: PreviewSection[]
}

defineProps<Props>()
defineEmits<{ (e: 'update:open', value: boolean): void }>()

/** 计算字段的有效 span：优先用显式 span，否则按 type 取默认值 */
function effectiveSpan(field: PreviewField): string {
  if (field.span) return field.span
  if (field.type) return DEFAULT_FIELD_SPAN[field.type]
  return 'full'
}

/** 将有效 span 映射为 CSS class */
function fieldSpanClass(field: PreviewField): string {
  const span = effectiveSpan(field)
  if (span === 'half') return 'field-span-half'
  if (span === 'third') return 'field-span-third'
  return 'field-span-full'
}

interface FieldGroup {
  cardName: string | null
  fields: PreviewField[]
}

/** 将 N/A / DNC 哨兵值转为空字符串（预览中字段保留但值显示为 '—'） */
function sanitizeValue(fields: PreviewField[]): PreviewField[] {
  return fields.map(f =>
    f.value === 'N/A' || f.value === 'DNC' ? { ...f, value: '' } : f,
  )
}

/** 将 section.fields 按 groupStart 分成卡片组 */
function groupFields(fields: PreviewField[]): FieldGroup[] {
  const visible = sanitizeValue(fields)
  if (visible.length === 0) return []
  const groups: FieldGroup[] = []
  let current: FieldGroup = { cardName: visible[0].cardName ?? null, fields: [visible[0]] }

  for (let i = 1; i < visible.length; i++) {
    const field = visible[i]
    if (field.titleOnly) {
      groups.push(current)
      current = { cardName: null, fields: [field] }
      continue
    }
    if (field.groupStart) {
      groups.push(current)
      current = { cardName: field.cardName ?? null, fields: [field] }
    } else {
      current.fields.push(field)
    }
  }
  groups.push(current)
  return groups.filter(g => g.fields.length > 0)
}
</script>

<template>
  <DialogRoot :open="open" @update:open="$emit('update:open', $event)">
    <DialogPortal>
      <template v-if="open">
        <DialogOverlay class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
          <DialogContent
            class="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-xl bg-white shadow-2xl focus:outline-none"
            style="width: min(960px, 95vw)"
            :aria-describedby="undefined"
          >
            <DialogTitle class="sr-only">{{ formTitle }}</DialogTitle>

            <!-- 预览头部 -->
            <div class="shrink-0 flex items-center justify-between border-b border-gray-100 px-6 py-4 rounded-t-xl">
              <h2 class="text-lg font-semibold text-gray-800">{{ formTitle }}</h2>
            </div>

            <!-- 预览内容区域（可滚动，PDF 导出捕获此区域） -->
            <div class="preview-pdf-data flex-1 overflow-y-auto px-6 py-6">
              <!-- 表单标题 -->
              <div data-pdf-break class="mb-6 border-b-2 border-gray-200 pb-4 text-center">
                <h3 class="text-xl font-bold text-gray-900">{{ formTitle }}</h3>
                <p v-if="formSubtitle" class="mt-1 text-sm text-gray-500">{{ formSubtitle }}</p>
              </div>

              <!-- 各分组 -->
              <div class="space-y-5">
                <div
                  v-for="section in sections"
                  :key="section.title"
                  data-pdf-section
                  class="rounded-lg border border-gray-100 bg-gray-50/50 p-4"
                >
                  <h4 class="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                    {{ section.title }}
                  </h4>
                  <div class="fields-grid">
                    <template
                      v-for="group in groupFields(section.fields)"
                      :key="group.fields[0].label"
                    >
                      <!-- 可重复组：卡片包裹 -->
                      <div v-if="group.cardName" class="preview-card">
                        <div class="preview-card-header">{{ group.cardName }}</div>
                        <div class="field-group-grid">
                          <div
                            v-for="field in group.fields"
                            :key="field.label"
                            :class="[fieldSpanClass(field), 'preview-field']"
                          >
                            <span class="preview-field-label">{{ field.label }}</span>
                            <span class="preview-field-value">{{ field.value || '—' }}</span>
                          </div>
                        </div>
                      </div>
                      <!-- 独立字段组 -->
                      <template v-else>
                        <template
                          v-for="field in group.fields"
                          :key="field.label"
                        >
                          <!-- titleOnly: 仅渲染 L2 标题，不渲染数据 -->
                          <div
                            v-if="field.titleOnly"
                            class="preview-sub-label"
                          >
                            {{ field.subGroupTitle || field.label }}
                          </div>
                          <!-- 普通字段（含 subGroupTitle 的数据字段：先渲染标题再渲染数据） -->
                          <div
                            v-else
                            :class="[fieldSpanClass(field), 'preview-field']"
                          >
                            <div
                              v-if="field.subGroupTitle"
                              class="preview-sub-label"
                            >
                              {{ field.subGroupTitle }}
                            </div>
                            <span class="preview-field-label">{{ field.label }}</span>
                            <span class="preview-field-value">{{ field.value || '—' }}</span>
                          </div>
                        </template>
                      </template>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <!-- 底部操作栏 -->
            <div class="shrink-0 flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 rounded-b-xl">
              <slot name="footer" />
            </div>
          </DialogContent>
        </div>
      </template>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.preview-pdf-data {
  font-family: system-ui, -apple-system, sans-serif;
  width: 920px;
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.field-row {
  grid-column: span 2;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.field-row--triple {
  grid-column: span 2;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.field-span-full {
  grid-column: span 4;
}

.field-span-half {
  grid-column: span 2;
}

.field-span-third {
  grid-column: span 1;
}

.preview-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0;
  border-bottom: 1px dashed #e5e7eb;
}

/* 可重复组卡片 */
.preview-card {
  grid-column: span 4;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: #fafbfc;
  overflow: hidden;
}

.preview-card-header {
  padding: 0.375rem 0.75rem;
  background: #f0f2f5;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.025em;
}

.field-group-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  padding: 0.75rem;
}

.preview-field-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.preview-field-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

/* L2 子组标题（蓝色左边框 + 浅蓝渐变背景，与表单页 sub-label 一致） */
.preview-sub-label {
  grid-column: span 4;
  font-weight: 600;
  font-size: 0.875rem;
  color: #1e40af;
  margin: 1.25rem 0 0.75rem;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(to right, #eff6ff, transparent);
  border-left: 3px solid #3b82f6;
  border-radius: 0 0.25rem 0.25rem 0;
  letter-spacing: 0.025em;
}

</style>
