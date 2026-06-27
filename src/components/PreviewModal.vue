<script setup lang="ts">
import {
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import type { PreviewSection } from '@/composables/usePdfExport'

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
</script>

<template>
  <DialogRoot :open="open" @update:open="$emit('update:open', $event)">
    <DialogPortal>
      <template v-if="open">
        <DialogOverlay class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
          <DialogContent
            class="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl focus:outline-none"
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
                  <div class="space-y-2">
                    <div
                      v-for="field in section.fields"
                      :key="field.label"
                      class="flex items-baseline gap-3 py-1.5"
                    >
                      <span class="w-36 shrink-0 text-right text-sm text-gray-400">
                        {{ field.label }}
                      </span>
                      <span class="min-w-0 flex-1 border-b border-dashed border-gray-200 pb-0.5 text-sm font-medium text-gray-900">
                        {{ field.value || '—' }}
                      </span>
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
}
</style>
