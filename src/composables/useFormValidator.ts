import { computed } from 'vue'
import type { PreviewSection } from '@/composables/usePdfExport'

export interface MissingField {
  /** 字段标签 */
  label: string
  /** 所属分组标题 */
  section: string
}

/**
 * 表单必填字段校验 composable
 *
 * 扫描 PreviewSection[] 中 required=true 的字段，找出值为空的字段。
 * 用于在导出前禁用按钮，提示用户先完成必填字段。
 *
 * @example
 * const { hasMissingFields, missingFields } = useFormValidator(
 *   () => previewSections.value,
 * )
 *
 * // 按钮禁用
 * <button :disabled="hasMissingFields" @click="openPreview">导出 PDF</button>
 */
export function useFormValidator(
  getSections: () => PreviewSection[],
) {
  const sectionsRef = computed(getSections)

  /** 当前缺失的必填字段列表 */
  const missingFields = computed<MissingField[]>(() => {
    const missing: MissingField[] = []
    for (const section of sectionsRef.value) {
      for (const field of section.fields) {
        if (field.required && !String(field.value ?? '').trim()) {
          missing.push({ label: field.label, section: section.title })
        }
      }
    }
    return missing
  })

  /** 是否存在缺失的必填字段 */
  const hasMissingFields = computed(() => missingFields.value.length > 0)

  /** 返回校验结果：ok 表示全部必填字段已填写，missing 为缺失字段列表 */
  function validate(): { ok: boolean; missing: MissingField[] } {
    return { ok: !hasMissingFields.value, missing: missingFields.value }
  }

  return { missingFields, hasMissingFields, validate }
}
