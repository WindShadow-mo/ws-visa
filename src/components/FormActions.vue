<script setup lang="ts">
/**
 * FormActions — 表单通用操作栏 + 标题区域
 *
 * 包含：表单标题/副标题、导出 PDF 按钮（触发外部校验 + 预览弹窗）、
 * 清除数据按钮（二次确认）、PreviewModal。
 * 各签证表单页面只需传入数据和回调，无需关心标题渲染和导出逻辑。
 *
 * 导出按钮点击时 emit('export')，由父组件负责校验逻辑：
 * - 若校验通过，调用 formActionsRef.openPreview() 打开预览
 * - 若校验失败，父组件自行处理（如聚焦到第一个缺失字段）
 */

import { nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { FileDown, Loader2, Database } from 'lucide-vue-next'
import { usePdfExport, type PreviewSection } from '@/composables/usePdfExport'
import PreviewModal from '@/components/PreviewModal.vue'

interface Props {
  /** 预览数据（驱动预览弹窗） */
  sections: PreviewSection[]
  /** 表单标题（如"英国签证申请"） */
  formTitle: string
  /** 表单副标题 */
  formSubtitle?: string
  /** 生成 PDF 文档标题（含申请人姓名） */
  buildPdfTitle: (base: string) => string
  /** 生成 PDF 文件名（含申请人姓名） */
  buildPdfFilename: (base: string) => string
  /** i18n 键前缀，用于读取 clearForm / clearConfirm / exportPdf / exporting */
  i18nPrefix: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'clear'): void
  (e: 'export'): void
  (e: 'fill'): void
}>()

const { t } = useI18n()
const isDev = import.meta.env.DEV

// ---- PDF 导出 ----

const { exportPdf, isExporting } = usePdfExport()
const showPreview = ref(false)
const previewContentRef = ref<HTMLElement | null>(null)

async function openPreview() {
  showPreview.value = true
  await nextTick()
  // 等待 Dialog 动画完成后获取预览内容元素
  await new Promise((r) => setTimeout(r, 300))
  previewContentRef.value = document.querySelector('.preview-pdf-data')
}

async function handleExportFromPreview() {
  const docTitle = props.buildPdfTitle(props.formTitle)
  const filename = props.buildPdfFilename(props.formTitle)
  await exportPdf(previewContentRef.value ?? undefined, filename, docTitle, props.formTitle, props.formSubtitle)
  showPreview.value = false
}

// ---- 清除数据 ----

function clearData() {
  if (!confirm(t(`${props.i18nPrefix}.clearConfirm`))) return
  emit('clear')
}

// 暴露 openPreview 供父组件调用
defineExpose({ openPreview })
</script>

<template>
  <div>
    <div class="form-header">
      <div>
        <h1 class="form-title">{{ formTitle }}</h1>
        <p v-if="formSubtitle" class="form-subtitle">{{ formSubtitle }}</p>
      </div>
      <div class="flex gap-2">
        <button
          v-if="isDev"
          class="fill-btn"
          @click="emit('fill')"
        >
          <Database class="inline h-4 w-4 mr-1" />
          {{ t(`${i18nPrefix}.fillTestData`) }}
        </button>
        <button
          class="clear-btn"
          @click="emit('export')"
        >
          <FileDown class="inline h-4 w-4 mr-1" />
          {{ t(`${i18nPrefix}.exportPdf`) }}
        </button>
        <button class="danger-btn" @click="clearData">
          {{ t(`${i18nPrefix}.clearForm`) }}
        </button>
      </div>
    </div>

    <PreviewModal
      :open="showPreview"
      :form-title="formTitle"
      :form-subtitle="formSubtitle"
      :sections="sections"
      @update:open="showPreview = $event"
    >
      <template #footer>
        <button
          class="export-confirm-btn"
          :disabled="isExporting"
          @click="handleExportFromPreview"
        >
          <Loader2 v-if="isExporting" class="inline h-4 w-4 animate-spin mr-1.5" />
          <FileDown v-else class="inline h-4 w-4 mr-1.5" />
          {{ isExporting ? t(`${i18nPrefix}.exporting`) : t(`${i18nPrefix}.exportPdf`) }}
        </button>
      </template>
    </PreviewModal>
  </div>

  <Teleport to="body">
    <div v-if="isExporting" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div class="flex flex-col items-center gap-3 text-white">
        <Loader2 class="h-8 w-8 animate-spin" />
        <span class="text-lg font-medium">导出中</span>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* 标题区域 */
.form-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #fff;
  line-height: 1.2;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-subtitle {
  color: rgba(255, 255, 255, 0.9);
  margin-top: 0.5rem;
  font-size: 1rem;
  font-weight: 400;
}

/* 导出按钮 — 毛玻璃风格 */
.clear-btn {
  flex-shrink: 0;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.clear-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* 填充测试数据按钮 — 绿色/success 风格，仅开发模式显示 */
.fill-btn {
  flex-shrink: 0;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(200, 255, 200, 0.9);
  border: 2px solid rgba(34, 197, 94, 0.45);
  border-radius: 0.75rem;
  background: rgba(34, 197, 94, 0.12);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.fill-btn:hover {
  color: #fff;
  border-color: rgba(34, 197, 94, 0.85);
  background: rgba(22, 163, 74, 0.6);
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.35);
  transform: translateY(-2px);
}

/* 清除数据按钮 — 明显的危险操作样式 */
.danger-btn {
  flex-shrink: 0;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 200, 200, 0.9);
  border: 2px solid rgba(239, 68, 68, 0.45);
  border-radius: 0.75rem;
  background: rgba(239, 68, 68, 0.12);
  backdrop-filter: blur(10px);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.danger-btn:hover {
  color: #fff;
  border-color: rgba(239, 68, 68, 0.85);
  background: rgba(220, 38, 38, 0.6);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.35);
  transform: translateY(-2px);
}

/* 预览弹窗中的导出确认按钮 */
.export-confirm-btn {
  border-radius: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  background: #4f46e5;
  transition: all 0.2s;
}

.export-confirm-btn:hover:not(:disabled) {
  background: #4338ca;
}

.export-confirm-btn:disabled {
  opacity: 0.5;
}
</style>
