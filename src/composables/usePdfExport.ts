import { ref } from 'vue'
import { siteConfig } from '@/config/site'

// ---- 通用预览/导出类型 ----

/** 字段控件类型，用于预览/PDF 渲染时推断默认跨度 */
export type PreviewFieldType = 'text' | 'date' | 'select' | 'radio'

/** 各控件类型的默认 span（与字段组件的 withDefaults 保持一致） */
export const DEFAULT_FIELD_SPAN: Record<PreviewFieldType, 'full' | 'half' | 'third'> = {
  date: 'third',   // 日期格式固定且短
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
}

/** 预览中一个分组 */
export interface PreviewSection {
  /** 分组标题（已翻译的文本） */
  title: string
  /** 分组内的字段列表 */
  fields: PreviewField[]
}

/**
 * PDF 导出 composable
 *
 * 按 [data-pdf-section] 元素逐个捕获，智能分页避免内容割裂。
 * 若单个 section 超过一页高度，才对该 section 做固定裁切。
 */
export function usePdfExport() {
  const isExporting = ref(false)

  async function exportPdf(target?: HTMLElement | null, filename?: string, docTitle?: string, formTitle?: string, formSubtitle?: string): Promise<void> {
    if (isExporting.value) return

    const needsCssOverride = !target
    const container = target ?? document.querySelector('.glass-card') as HTMLElement | null
    if (!container) return

    isExporting.value = true
    const scrollFix = expandForCapture(container)

    if (needsCssOverride) {
      document.body.classList.add('pdf-exporting')
      await new Promise((r) => setTimeout(r, 400))
    }

    try {
      await new Promise((r) => setTimeout(r, 50))

      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      if (docTitle) {
        pdf.setProperties({ title: docTitle })
      }
      const marginMm = 10
      const usableWidthMm = 190  // 210 - 10*2
      const usableHeightMm = 277 // 297 - 10*2

      // 查找分页锚点
      const sectionEls = container.querySelectorAll<HTMLElement>('[data-pdf-section]')
      const breakEls = container.querySelectorAll<HTMLElement>('[data-pdf-break]')

      if (sectionEls.length > 0) {
        // ---- 按 section 逐个捕获 ----

        // 用 Canvas 2D 渲染表头（避免 DOM 捕获的布局问题）
        let cursorMm = 0
        if (formTitle) {
          const titleCanvas = document.createElement('canvas')
          const titleWPx = 1840
          const dpr = 2
          const hasSub = !!formSubtitle
          const titleHPx = (hasSub ? 140 : 100) * dpr
          titleCanvas.width = titleWPx
          titleCanvas.height = titleHPx
          const tctx = titleCanvas.getContext('2d')!
          tctx.fillStyle = '#ffffff'
          tctx.fillRect(0, 0, titleWPx, titleHPx)
          tctx.fillStyle = '#111827'
          tctx.font = `bold ${36 * dpr}px "Microsoft YaHei", "PingFang SC", sans-serif`
          tctx.textAlign = 'center'
          tctx.textBaseline = 'middle'
          tctx.fillText(formTitle, titleWPx / 2, 60 * dpr)
          if (hasSub) {
            tctx.fillStyle = '#6b7280'
            tctx.font = `${24 * dpr}px "Microsoft YaHei", "PingFang SC", sans-serif`
            tctx.fillText(formSubtitle, titleWPx / 2, 110 * dpr)
          }
          const titleHMm = (titleCanvas.height / titleCanvas.width) * usableWidthMm
          pdf.addImage(titleCanvas.toDataURL('image/png'), 'PNG', marginMm, marginMm, usableWidthMm, titleHMm)
          cursorMm = titleHMm + 4
        }

        // 逐个 section 捕获并放置

        for (const section of Array.from(sectionEls)) {
          const sectionCanvas = await html2canvas(section, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
          })

          const sectionHeightMm = (sectionCanvas.height / sectionCanvas.width) * usableWidthMm

          if (sectionHeightMm <= usableHeightMm) {
            // 整块放得下
            if (cursorMm + sectionHeightMm > usableHeightMm) {
              pdf.addPage()
              cursorMm = 0
            }
            pdf.addImage(sectionCanvas.toDataURL('image/png'), 'PNG', marginMm, marginMm + cursorMm, usableWidthMm, sectionHeightMm)
            cursorMm += sectionHeightMm + 4 // 4mm section 间距
          } else {
            // 单个 section 超过一页，强制裁切
            if (cursorMm > 0) {
              pdf.addPage()
              cursorMm = 0
            }
            addSlicedToPdf(pdf, sectionCanvas, usableWidthMm, usableHeightMm, marginMm)
          }
        }
      } else {
        // ---- 无 section 标记，退回到整体捕获 + 智能裁切 ----
        // 尝试在 [data-pdf-break] 元素处分页
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        })

        if (breakEls.length > 0) {
          addWithBreakPointsToPdf(pdf, canvas, container, breakEls, usableWidthMm, usableHeightMm, marginMm)
        } else {
          addSlicedToPdf(pdf, canvas, usableWidthMm, usableHeightMm, marginMm)
        }
      }

      addWatermark(pdf, siteConfig.name)
      pdf.save(filename ?? `UK-Visa-Application-${Date.now()}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
      alert('PDF 生成失败，请重试。')
    } finally {
      scrollFix()
      if (needsCssOverride) {
        document.body.classList.remove('pdf-exporting')
      }
      isExporting.value = false
    }
  }

  return { exportPdf, isExporting }
}

// ---- PDF 水印 ----

/**
 * 在 PDF 每一页叠加平铺斜纹水印文字。
 * ponytail: jsPDF 默认字体不含 CJK 字形，pdf.text() 无法渲染中文。
 * 用 Canvas 2D（走系统字体）生成水印瓦片位图，再 addImage 叠加到每页。
 */
function addWatermark(pdf: import('jspdf').jsPDF, text: string) {
  const totalPages = pdf.internal.pages.length
  const pageWidthMm = pdf.internal.pageSize.getWidth()
  const pageHeightMm = pdf.internal.pageSize.getHeight()

  const spacingXMm = 44
  const spacingYMm = 46
  const mmToPx = 3.78

  // ponytail: jsPDF 默认字体不含 CJK 字形，pdf.text() 无法渲染中文。
  // 用 Canvas 2D（走系统字体）生成水印瓦片位图，再 addImage 叠加到每页。
  const tileWpx = Math.round(spacingXMm * mmToPx)
  const tileHpx = Math.round(spacingYMm * mmToPx)

  const canvas = document.createElement('canvas')
  canvas.width = tileWpx
  canvas.height = tileHpx
  const ctx = canvas.getContext('2d')!
  // 透明背景，不用 fillRect 填白色
  ctx.fillStyle = '#b0b0b0'
  ctx.font = '16px "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.translate(tileWpx / 2, tileHpx / 2)
  ctx.rotate(-45 * Math.PI / 180)
  ctx.fillText(text, 0, 0)

  const dataUrl = canvas.toDataURL('image/png')

  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    for (let y = 0; y < pageHeightMm + spacingYMm; y += spacingYMm) {
      for (let x = -spacingXMm; x < pageWidthMm + spacingXMm; x += spacingXMm) {
        pdf.addImage(dataUrl, 'PNG', x, y, spacingXMm, spacingYMm)
      }
    }
  }
}

// ---- PDF 页面填充工具函数 ----

/**
 * 将 canvas 按 A4 高度裁切，逐页放入 PDF。
 */
function addSlicedToPdf(
  pdf: import('jspdf').jsPDF,
  canvas: HTMLCanvasElement,
  usableWidthMm: number,
  usableHeightMm: number,
  marginMm: number,
) {
  const imgHeightMm = (canvas.height / canvas.width) * usableWidthMm
  if (imgHeightMm <= usableHeightMm) {
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', marginMm, marginMm, usableWidthMm, imgHeightMm)
    return
  }

  const pagePixelH = (usableHeightMm / usableWidthMm) * canvas.width
  const totalPages = Math.ceil(canvas.height / pagePixelH)

  for (let p = 0; p < totalPages; p++) {
    if (p > 0) pdf.addPage()
    const sliceH = Math.min(pagePixelH, canvas.height - p * pagePixelH)
    const sc = document.createElement('canvas')
    sc.width = canvas.width
    sc.height = Math.ceil(sliceH)
    sc.getContext('2d')!.drawImage(canvas, 0, -(p * pagePixelH))
    const h = (sc.height / sc.width) * usableWidthMm
    pdf.addImage(sc.toDataURL('image/png'), 'PNG', marginMm, marginMm, usableWidthMm, h)
  }
}

/**
 * 利用 data-pdf-break 元素的位置在 PDF 中智能分页。
 */
function addWithBreakPointsToPdf(
  pdf: import('jspdf').jsPDF,
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  breakEls: NodeListOf<HTMLElement>,
  usableWidthMm: number,
  usableHeightMm: number,
  marginMm: number,
) {
  const containerRect = container.getBoundingClientRect()
  const scale = canvas.width / containerRect.width
  const pagePixelH = usableHeightMm / usableWidthMm * canvas.width

  // 收集每个 break 元素底部的 y 坐标（像素）
  const breakYs: number[] = []
  for (const el of Array.from(breakEls)) {
    const rect = el.getBoundingClientRect()
    breakYs.push(Math.round((rect.bottom - containerRect.top) * scale))
  }

  let start = 0
  for (let i = 0; i < breakYs.length; i++) {
    const breakY = breakYs[i]
    const chunkH = breakY - start

    if (chunkH <= pagePixelH) {
      // 这块能放下
      if (i === breakYs.length - 1) {
        // 最后一块：把剩余内容也加上
        addSliceToPdf(pdf, canvas, start, canvas.height - start, usableWidthMm, marginMm)
      } else {
        addSliceToPdf(pdf, canvas, start, chunkH, usableWidthMm, marginMm)
      }
      start = breakY
    } else {
      // 放不下，在 break 处切页
      addSliceToPdf(pdf, canvas, start, chunkH > pagePixelH ? pagePixelH : chunkH, usableWidthMm, marginMm)
      start = breakY
    }
  }

  // 处理最后一个 break 之后的剩余内容
  if (start < canvas.height) {
    const remaining = canvas.height - start
    const remainingMm = (remaining / canvas.width) * usableWidthMm
    if (remainingMm > usableHeightMm) {
      addSlicedToPdf(pdf, cropCanvas(canvas, start, remaining), usableWidthMm, usableHeightMm, marginMm)
    } else {
      pdf.addPage()
      addSliceToPdf(pdf, canvas, start, remaining, usableWidthMm, marginMm)
    }
  }
}

function addSliceToPdf(
  pdf: import('jspdf').jsPDF,
  canvas: HTMLCanvasElement,
  yPx: number,
  hPx: number,
  usableWidthMm: number,
  marginMm: number,
) {
  const sc = cropCanvas(canvas, yPx, hPx)
  const h = (sc.height / sc.width) * usableWidthMm
  pdf.addImage(sc.toDataURL('image/png'), 'PNG', marginMm, marginMm, usableWidthMm, h)
}

function cropCanvas(src: HTMLCanvasElement, y: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = src.width
  c.height = Math.ceil(h)
  c.getContext('2d')!.drawImage(src, 0, -y)
  return c
}

// ---- DOM 展开工具 ----

/**
 * 临时展开可滚动容器及其祖先，使 html2canvas 能捕获完整内容。
 */
function expandForCapture(el: HTMLElement): () => void {
  const saved: Array<{ el: HTMLElement; css: Partial<CSSStyleDeclaration> }> = []

  let node: HTMLElement | null = el
  while (node && node !== document.body) {
    const cs = getComputedStyle(node)
    const needsFix =
      cs.overflowY === 'auto' || cs.overflowY === 'scroll'
      || cs.overflow === 'auto' || cs.overflow === 'scroll'
      || (cs.maxHeight !== 'none' && cs.maxHeight !== '')
      || cs.height !== 'auto'

    if (needsFix) {
      saved.push({
        el: node,
        css: {
          overflow: node.style.overflow,
          overflowY: node.style.overflowY,
          height: node.style.height,
          maxHeight: node.style.maxHeight,
        },
      })
      node.style.overflow = 'visible'
      node.style.overflowY = 'visible'
      node.style.height = 'auto'
      node.style.maxHeight = 'none'
    }
    node = node.parentElement
  }

  return () => {
    for (const s of saved) {
      s.el.style.overflow = s.css.overflow ?? ''
      s.el.style.overflowY = s.css.overflowY ?? ''
      s.el.style.height = s.css.height ?? ''
      s.el.style.maxHeight = s.css.maxHeight ?? ''
    }
  }
}
