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
                    <div
                      v-for="field in section.fields"
                      :key="field.label"
                      :class="[fieldSpanClass(field), 'preview-field']"
                    >
                      <span class="preview-field-label">{{ field.label }}</span>
                      <span class="preview-field-value">{{ field.value || '—' }}</span>
                    </div>
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

.preview-field-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.preview-field-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}
</style>
