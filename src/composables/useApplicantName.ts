import { computed } from 'vue'

/**
 * 申请人姓名 composable
 *
 * 为各签证表单提供统一的姓名提取和 PDF 标题生成能力。
 *
 * @param getFullName - 返回当前申请人全名的函数（由各表单实现）
 *
 * @example
 * // UK 签证表单中
 * const { fullName, hasName, buildPdfTitle } = useApplicantName(
 *   () => (formData.lastName + formData.firstName).trim()
 * )
 *
 * // 其他表单可能有不同的姓名结构
 * const { fullName, hasName, buildPdfTitle } = useApplicantName(
 *   () => formData.fullName
 * )
 */
export function useApplicantName(getFullName: () => string = () => '') {
  const fullName = computed(getFullName)
  const hasName = computed(() => fullName.value.trim().length > 0)

  /**
   * 构建 PDF 文档标题：{基础标题} - {姓名}
   * 如果姓名为空，则只返回基础标题。
   */
  function buildPdfTitle(baseTitle: string): string {
    return hasName.value ? `${baseTitle} - ${fullName.value}` : baseTitle
  }

  /**
   * 构建 PDF 文件名：{基础标题} - {姓名}.pdf
   * 如果姓名为空，退化为 {基础标题}.pdf
   */
  function buildPdfFilename(baseTitle: string): string {
    return `${buildPdfTitle(baseTitle)}.pdf`
  }

  return { fullName, hasName, buildPdfTitle, buildPdfFilename }
}
