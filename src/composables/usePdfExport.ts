import { ref } from 'vue'
import { siteConfig } from '@/config/site'
import pdfMake from 'pdfmake/build/pdfmake'

// ---- 通用预览/导出类型 ----

/** 字段控件类型，用于预览/PDF 渲染时推断默认跨度 */
export type PreviewFieldType = 'text' | 'date' | 'month' | 'select' | 'radio'

/** 各控件类型的默认 span（与字段组件的 withDefaults 保持一致） */
export const DEFAULT_FIELD_SPAN: Record<PreviewFieldType, 'full' | 'half' | 'third'> = {
  date: 'third',   // 日期格式固定且短
  month: 'third',  // 年月格式固定且短
  text: 'half',    // 文本长度不确定，取中位
  select: 'half',  // 下拉选项文本较长
  radio: 'full',   // 单选项需要横向空间
}

/** 预览中单个字段的展示数据 */
export interface PreviewField {
  /** 字段标签（已翻译的文本） */
  label: string
  /** 字段值（已解析的展示文本） */
  value: string
  /** 字段控件类型（用于推断默认 span，不写 span 时按 type 取默认值） */
  type?: PreviewFieldType
  /** 字段在 Grid 中的列跨度（不指定时按 type 取默认值） */
  span?: 'full' | 'half' | 'third'
  /** 是否为必填字段（用于导出前校验） */
  required?: boolean
  /** 对应 DOM 元素的 name 属性（用于聚焦到缺失字段） */
  name?: string
  /** 可重复组中每组起始标记，预览中在此字段上方加分隔线 */
  groupStart?: boolean
  /** 可重复组卡片头标题（仅在 groupStart 字段上设置，不再从 label 中拆分） */
  cardName?: string
}

/** 预览中一个分组 */
export interface PreviewSection {
  /** 分组标题（已翻译的文本） */
  title: string
  /** 分组内的字段列表 */
  fields: PreviewField[]
}

// ---- pdfmake 矢量 PDF 导出 ----

const SPAN_COLS: Record<string, number> = { full: 4, half: 2, third: 1 }

/** 将字段 span 映射为表格列数 */
function fieldCols(field: PreviewField): number {
  if (field.span) return SPAN_COLS[field.span]
  if (field.type) return SPAN_COLS[DEFAULT_FIELD_SPAN[field.type]]
  return 4
}

/** 可重复组分组结果 */
interface FieldGroup {
  cardName: string | null
  fields: PreviewField[]
}

/** 按 groupStart 标记将字段分为卡片组（与 PreviewModal 逻辑一致） */
function groupFields(fields: PreviewField[]): FieldGroup[] {
  if (fields.length === 0) return []
  const groups: FieldGroup[] = []
  let current: FieldGroup = { cardName: fields[0].cardName ?? null, fields: [fields[0]] }

  for (let i = 1; i < fields.length; i++) {
    const field = fields[i]
    if (field.groupStart) {
      groups.push(current)
      current = { cardName: field.cardName ?? null, fields: [field] }
    } else {
      current.fields.push(field)
    }
  }
  groups.push(current)
  return groups
}

/**
 * 构建字段内层表格（4 列网格，与 PreviewModal 的 fields-grid 对应）
 */
function buildFieldsTable(fields: PreviewField[]): any {
  const body: any[][] = []
  let i = 0

  while (i < fields.length) {
    // 统一使用竖向布局（label 在上，value 在下），通过 colSpan 控制宽度
    const row: any[] = []
    let rowCols = 0
    while (i < fields.length) {
      const c = fieldCols(fields[i])
      if (rowCols + c > 4) break
      row.push({
        stack: [
          { text: fields[i].label, fontSize: 9, color: '#6b7280', margin: [0, 0, 0, 6] },
          { text: fields[i].value || '—', fontSize: 11, color: '#111827', bold: true },
        ],
        colSpan: c,
        margin: [4, 6, 4, 6] as [number, number, number, number],
      })
      for (let j = 1; j < c; j++) row.push({ text: '' })
      rowCols += c
      i++
    }
    while (row.length < 4) row.push({ text: '' })
    body.push(row)
  }

  return {
    table: { widths: ['*', '*', '*', '*'], body },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0,
      hLineColor: () => '#e5e7eb',
      vLineColor: () => '#ffffff',
      paddingTop: () => 3,
      paddingBottom: () => 3,
    },
  }
}

/**
 * 构建卡片表格（可重复组 → 带标题头的灰色卡片；普通字段 → 无头卡片）
 *
 * 外层单列表格提供灰色背景 (#fafbfc)，内层为字段网格。
 * 有 cardName 时顶部插入标题行 (#f0f2f5 背景)。
 */
function buildCardTable(cardName: string | null, fields: PreviewField[]): any {
  const outerBody: any[] = []

  if (cardName) {
    outerBody.push([
      {
        text: cardName,
        fontSize: 10,
        bold: true,
        color: '#1f2937',
        fillColor: '#e5e7eb',
        margin: [10, 8, 10, 6],
      },
    ])
  }

  outerBody.push([
    {
      ...buildFieldsTable(fields),
      margin: cardName ? [4, 2, 4, 4] : [4, 4, 4, 4],
    },
  ])

  return {
    table: {
      widths: ['*'],
      body: outerBody.map((row) => [...row.map((cell: any) => ({ ...cell, unbreakable: true }))]),
    },
    layout: {
      hLineWidth: (_i: number, _node: any) => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#d1d5db',
      vLineColor: () => '#d1d5db',
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
    fillColor: '#fafbfc',
  }
}

/**
 * 估算一个分组渲染后的近似高度（pt），用于分页合并策略
 * 实测：每字段行约 35-40pt（含 padding + 字号 + 行间距），卡片额外开销约 40pt
 */
function groupHeight(group: FieldGroup): number {
  const base = group.fields.length * 28
  return group.cardName ? base + 40 : base
}

/** 将一个分组的内容推入 stack 数组 */
function pushGroupToStack(stack: any[], group: FieldGroup) {
  if (group.cardName) {
    stack.push({ ...buildCardTable(group.cardName, group.fields), margin: [0, 0, 0, 12] })
  } else {
    stack.push({ ...buildFieldsTable(group.fields), margin: [0, 0, 0, 6] })
  }
}

/**
 * A4 页面可用高度（含 margin 后）约 756pt。
 * 为保证块在任何页面位置都能显示（含标题行 overhead），单块内容上限取 520pt。
 * 超过此阈值的块将不设置 unbreakable，允许 pdfmake 自然跨页。
 */
const MAX_UNBREAKABLE_HEIGHT = 520

/**
 * 将 sections 构建为 pdfmake 文档定义
 */
function buildDocDefinition(
  sections: PreviewSection[],
  formTitle?: string,
  formSubtitle?: string,
): any[] {
  const content: any[] = []

  // ---- 标题 ----
  if (formTitle) {
    content.push({
      text: formTitle,
      fontSize: 20,
      bold: true,
      color: '#111827',
      alignment: 'center',
      margin: [0, 0, 0, 6],
    })
    if (formSubtitle) {
      content.push({
        text: formSubtitle,
        fontSize: 13,
        color: '#6b7280',
        alignment: 'center',
        margin: [0, 0, 0, 14],
      })
    } else {
      content.push({ text: '', margin: [0, 0, 0, 10] })
    }
  }

  // ---- 各分组 ----
  for (const section of sections) {
    const groups = groupFields(section.fields)
    if (groups.length === 0) continue

    // section 标题 + 分隔线（始终与第一个内容块保持在一起）
    const headerItems: any[] = [
      {
        text: section.title.toUpperCase(),
        fontSize: 12,
        bold: true,
        color: '#374151',
        margin: [0, 20, 0, 4],
      },
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, lineColor: '#9ca3af' }],
        margin: [0, 0, 0, 10],
      },
    ]

    // 第一个组加入 header
    pushGroupToStack(headerItems, groups[0])
    let headerHeight = groupHeight(groups[0])

    // 如果第一个组是 standalone（触发问题），按高度上限合并紧跟的卡片组
    let g = 1
    if (!groups[0].cardName) {
      while (g < groups.length) {
        const addH = groupHeight(groups[g])
        if (headerHeight + addH > MAX_UNBREAKABLE_HEIGHT) break
        pushGroupToStack(headerItems, groups[g])
        headerHeight += addH
        g++
        // 遇到下一个 standalone 触发问题时停止合并（它应和后续卡片自成一块）
        if (g < groups.length && !groups[g].cardName) break
      }
    }

    // 超过阈值则不设为 unbreakable，允许 pdfmake 跨页
    content.push({ stack: headerItems, unbreakable: headerHeight <= MAX_UNBREAKABLE_HEIGHT })

    // 剩余组：按高度上限贪心合并，超过阈值时自动切换为可分页
    let currentBlock: any[] = []
    let currentHeight = 0
    let lastGroup: FieldGroup | null = null

    for (; g < groups.length; g++) {
      const group = groups[g]
      const h = groupHeight(group)

      // standalone 触发问题：刷新当前块，开启新块
      if (!group.cardName) {
        if (currentBlock.length > 0) {
          content.push({ stack: currentBlock, unbreakable: currentHeight <= MAX_UNBREAKABLE_HEIGHT })
          currentBlock = []
          currentHeight = 0
          lastGroup = null
        }
        pushGroupToStack(currentBlock, group)
        currentHeight = h
        lastGroup = group
        continue
      }

      // cardName 组：尝试合并到当前块
      if (currentBlock.length === 0) {
        pushGroupToStack(currentBlock, group)
        currentHeight = h
        lastGroup = group
      } else if (lastGroup && !lastGroup.cardName && currentHeight + h <= MAX_UNBREAKABLE_HEIGHT) {
        // 当前块以 standalone 开头，合并此卡片（不超过阈值）
        pushGroupToStack(currentBlock, group)
        currentHeight += h
        lastGroup = group
      } else {
        // 超出阈值或当前块已是卡片，先输出旧块再开新块
        content.push({ stack: currentBlock, unbreakable: currentHeight <= MAX_UNBREAKABLE_HEIGHT })
        currentBlock = []
        currentHeight = 0
        lastGroup = null
        pushGroupToStack(currentBlock, group)
        currentHeight = h
        lastGroup = group
      }
    }

    // 输出最后一块
    if (currentBlock.length > 0) {
      content.push({ stack: currentBlock, unbreakable: currentHeight <= MAX_UNBREAKABLE_HEIGHT })
    }
  }

  return content
}

/**
 * PDF 导出 composable — pdfmake 矢量方案
 *
 * 直接构建矢量 PDF，文字可选可搜索。
 * 需要 CJK 字体文件：将 .ttf 放到 public/fonts/NotoSansSC-Regular.ttf
 */
export function usePdfExport() {
  const isExporting = ref(false)

  async function exportPdf(
    sections: PreviewSection[],
    filename?: string,
    docTitle?: string,
    formTitle?: string,
    formSubtitle?: string,
  ): Promise<void> {
    if (isExporting.value) return
    isExporting.value = true

    try {
      // 加载 CJK 字体（首次加载后浏览器缓存）
      const fontResp = await fetch(`${import.meta.env.BASE_URL}fonts/NotoSansSC-Regular.ttf`)
      if (!fontResp.ok) throw new Error('CJK 字体加载失败，请确保 /fonts/NotoSansSC-Regular.ttf 存在')
      const fontBuffer = await fontResp.arrayBuffer()

      // ArrayBuffer → base64（分块避免大文件栈溢出）
      const fontBase64 = arrayBufferToBase64(fontBuffer)

      // 写入 pdfmake 虚拟文件系统，再用文件名引用（浏览器版标准做法）
      const fontFilename = 'NotoSansSC-Regular.ttf'
      ;(pdfMake as any).virtualfs.writeFileSync(fontFilename, fontBase64, 'base64')

      pdfMake.setFonts({
        NotoSansSC: {
          normal: fontFilename,
          bold: fontFilename,
          italics: fontFilename,
          bolditalics: fontFilename,
        },
      })

      const content = buildDocDefinition(sections, formTitle, formSubtitle)

      const docDefinition = {
        defaultStyle: {
          font: 'NotoSansSC',
          fontSize: 10,
        },
        info: docTitle ? { title: docTitle, author: siteConfig.name } : undefined,
        watermark: {
          text: siteConfig.name,
          color: '#b0b0b0',
          opacity: 0.3,
          bold: true,
          fontSize: 43,
          rotate: 45,
        },
        content,
      }

      const pdfDoc = pdfMake.createPdf(docDefinition)
      const buffer = await pdfDoc.getBuffer()
      const blob = new Blob([buffer as unknown as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename ?? `UK-Visa-Application-${Date.now()}.pdf`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (err) {
      console.error('PDF export failed:', err)
      const msg = err instanceof Error ? err.message : String(err)
      alert(`PDF 导出失败：${msg}`)
    } finally {
      isExporting.value = false
    }
  }

  return { exportPdf, isExporting }
}

// ---- 工具函数 ----

/** ArrayBuffer → base64 字符串（分块避免大文件栈溢出） */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 8192
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}
