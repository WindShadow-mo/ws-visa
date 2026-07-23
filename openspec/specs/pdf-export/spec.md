# PDF 导出（PDF Export）

## 概述

基于 html2canvas + jsPDF 的所见即所得 PDF 生成系统，支持中文渲染和自动分页。

## 核心能力

### 1. 导出流程

```
用户点击导出 → 全屏 loading 遮罩 → html2canvas 捕获 → jsPDF 生成 → 自动下载
```

### 2. 水印

- 平铺斜纹水印，内容为站点名称"青青签证"
- 水印覆盖整个 PDF 页面
- 导出时自动添加，无需用户配置

### 3. Loading 遮罩

- 导出期间显示全屏 loading
- z-index: 60，确保覆盖所有内容
- 导出完成后自动关闭

### 4. 自动分页

- 长表单内容自动分页
- 分页处不在字段内容中间截断
- 每个字段完整显示在一页内

### 5. 中文渲染

- html2canvas 捕获渲染 DOM，天然支持 CJK 字符
- 无需额外字体配置

## 实现

```typescript
// composable: usePdfExport
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

async function exportPdf(element: HTMLElement, filename: string) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
  })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // 添加水印
  addWatermark(pdf)

  // 自动分页
  const pageHeight = 297 // A4 高度 mm
  const imgWidth = 210   // A4 宽度 mm
  const imgHeight = canvas.height * imgWidth / canvas.width

  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.save(filename)
}
```

## 约束

- 导出期间禁止用户操作（loading 遮罩）
- PDF 文件大小控制在合理范围（< 10MB）
