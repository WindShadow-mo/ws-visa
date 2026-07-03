# PDF 导出 & 预览 — 公共能力文档

本文档描述签证表单应用中 **PDF 导出** 和 **表单预览** 的公共能力，供各签证表单页面复用。

---

## 架构概览

```
┌─────────────────────────────────────────────────────────┐
│  签证表单页面 (如 UKVisaForm.vue)                          │
│                                                         │
│  1. 构建 previewSections: PreviewSection[]               │
│     （必填字段带 required: true + name）                   │
│  2. useApplicantName(() => 姓名提取逻辑)                   │
│  3. handleExportClick() 校验 + 聚焦缺失字段               │
│  4. <FormActions ref="formActionsRef"                    │
│       :sections ... @export="handleExportClick" />       │
└───────────────────────────────┬─────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │  FormActions (标题+操作栏)      │
                │                               │
                │  导出按钮（emit @export）        │
                │  清除按钮（二次确认）            │
                │  PreviewModal                 │
                │  usePdfExport                 │
                │  defineExpose({ openPreview })│
                └───────────────┬───────────────┘
                                │
         ┌──────────────────────┼──────────────────┐
         ▼                      ▼                  ▼
  ┌─────────────┐   ┌────────────────┐  ┌──────────────────┐
  │ usePdfExport │   │ PreviewModal   │  │ 父组件校验逻辑    │
  │              │   │ (通用组件)      │  │ handleExportClick│
  │ html2canvas  │   │                │  │                  │
  │ + jsPDF      │   │ 接收 sections  │  │ 扫描 required    │
  │ 智能分页      │   │ 展示+标记      │  │ 展开手风琴+聚焦  │
  └─────────────┘   └────────────────┘  └──────────────────┘

  useApplicantName — 姓名提取 + PDF 标题/文件名生成（表单页面直接调用后传给 FormActions）
```

---

## 核心类型

定义在 `src/composables/usePdfExport.ts`：

```typescript
/** 预览中单个字段的展示数据 */
export interface PreviewField {
  /** 字段标签（已翻译的文本） */
  label: string
  /** 字段值（已解析的展示文本） */
  value: string
  /** 是否为必填字段（校验时检查 value 是否为空） */
  required?: boolean
  /** 字段 name（与组件 name prop 一致，供校验聚焦定位 DOM 元素） */
  name?: string
}

/** 预览中一个分组 */
export interface PreviewSection {
  /** 分组标题（已翻译的文本） */
  title: string
  /** 分组内的字段列表 */
  fields: PreviewField[]
}
```

> **关键设计**：所有文本在表单侧完成翻译和解析，PreviewModal 只负责展示，不做任何 i18n 或选项查找。

---

## usePdfExport

**文件**: `src/composables/usePdfExport.ts`

```typescript
const { exportPdf, isExporting } = usePdfExport()
```

### `exportPdf(target?, filename?, docTitle?)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `target` | `HTMLElement \| null` | PDF 捕获目标元素。传 PreviewModal 的 `.preview-pdf-data` 元素 |
| `filename` | `string` | PDF 文件名（含 .pdf 后缀） |
| `docTitle` | `string` | PDF 文档元数据标题 |

**分页逻辑**：
1. 查找 `[data-pdf-section]` 元素，逐个 html2canvas 捕获
2. 依次放入 PDF 页面，当前页放不下时自动开新页
3. 单个 section 超过一页高度时才做固定裁切
4. 无 section 标记时退回整体捕获 + 智能裁切

**依赖**：html2canvas + jspdf（动态 import，不影响首屏）

---

## PreviewModal

**文件**: `src/components/PreviewModal.vue`

通用预览弹窗组件，基于 reka-ui Dialog。

### Props

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `open` | `boolean` | ✅ | 控制弹窗显隐 |
| `formTitle` | `string` | ✅ | 表单标题（如"英国签证"） |
| `formSubtitle` | `string` | | 表单副标题 |
| `sections` | `PreviewSection[]` | ✅ | 预览分组数据 |

### Slots

| Slot | 说明 |
|------|------|
| `#footer` | 底部操作栏（通常放"导出 PDF"按钮） |

### DOM 标记（供 PDF 分页使用）

- `data-pdf-break` — 标注在标题区域，作为分页锚点
- `data-pdf-section` — 标注在每个分组容器上，PDF 导出逐个捕获

### 使用示例

```vue
<PreviewModal
  :open="showPreview"
  :form-title="t('form.title')"
  :form-subtitle="t('form.subtitle')"
  :sections="previewSections"
  @update:open="showPreview = $event"
>
  <template #footer>
    <button :disabled="isExporting" @click="handleExport">
      导出 PDF
    </button>
  </template>
</PreviewModal>
```

---

## useApplicantName

**文件**: `src/composables/useApplicantName.ts`

通用申请人姓名提取 + PDF 标题生成。

```typescript
const { fullName, hasName, buildPdfTitle, buildPdfFilename } = useApplicantName(
  () => /* 返回姓名字符串 */
)
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `getFullName` | `() => string` | 工厂函数，返回当前申请人全名 |

### 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `fullName` | `ComputedRef<string>` | 当前姓名 |
| `hasName` | `ComputedRef<boolean>` | 是否有姓名 |
| `buildPdfTitle(base)` | `(string) => string` | 生成 PDF 标题：`{base} - {姓名}` |
| `buildPdfFilename(base)` | `(string => string` | 生成 PDF 文件名：`{base} - {姓名}.pdf` |

姓名为空时自动退化为不含姓名的格式。

---

## 新表单接入指南

### 步骤 1：构建预览数据

在表单页面中创建 `computed` 属性，将表单数据转为 `PreviewSection[]`：

```typescript
import type { PreviewSection } from '@/composables/usePdfExport'

const previewSections = computed<PreviewSection[]>(() => [
  {
    title: t('myForm.sections.basicInfo'),
    fields: [
      // 必填字段：同时带 required 和 name
      { label: t('myForm.fields.fullName.label'), value: formData.fullName, required: true, name: 'fullName' },
      { label: t('myForm.fields.dob.label'), value: formatDate(formData.dob), required: true, name: 'dob' },
      // select 类型需要解析选项文本
      { label: t('myForm.fields.gender.label'), value: resolveOption(genderOptions, formData.gender), required: true, name: 'gender' },
      // 选填字段：无需 required 和 name
      { label: t('myForm.fields.note.label'), value: formData.note },
      // 条件字段：按条件展开
      ...(formData.hasOtherDoc === 'yes'
        ? [{ label: t('myForm.fields.otherDocDetail.label'), value: formData.otherDocDetail, required: true, name: 'otherDocDetail' }]
        : []),
    ],
  },
  // ... 更多 section
])
```

辅助函数参考：

```typescript
// 日期格式化
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return locale.value === 'zh-CN'
    ? `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
    : d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// 选项值 → 显示文本
function resolveOption(options: Array<{ value: string; labelKey: string }>, value: string): string {
  const opt = options.find((o) => o.value === value)
  return opt ? t(opt.labelKey) : ''
}
```

### 步骤 2：使用 useApplicantName

```typescript
import { useApplicantName } from '@/composables/useApplicantName'

// 根据表单的姓名字段自定义提取逻辑
const { buildPdfTitle, buildPdfFilename } = useApplicantName(
  () => formData.fullName  // 或 () => formData.lastName + formData.firstName
)
```

### 步骤 3：使用 FormActions（推荐）

`FormActions` 封装了导出按钮、清除确认和 PreviewModal，表单页面只需传 props 并处理 `@export` 校验回调：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import FormActions from '@/components/FormActions.vue'

const formActionsRef = ref<InstanceType<typeof FormActions> | null>(null)

function handleExportClick() {
  // 校验逻辑（见 docs/form-dev-guide.md 第 10 节）
  // ...
  // 校验通过后打开预览
  formActionsRef.value?.openPreview()
}
</script>

<template>
  <FormActions
    ref="formActionsRef"
    :sections="previewSections"
    :form-title="t('myForm.title')"
    :form-subtitle="t('myForm.subtitle')"
    :build-pdf-title="buildPdfTitle"
    :build-pdf-filename="buildPdfFilename"
    i18n-prefix="myForm"
    @clear="clearForm"
    @export="handleExportClick"
  />
</template>
```

> `FormActions` 内部处理：表单标题渲染、`usePdfExport` 导出、`PreviewModal` 预览弹窗、清除二次确认。
> 导出按钮点击时 emit `@export`，由父组件执行校验；校验通过后通过 `formActionsRef.value?.openPreview()` 打开预览。

### 步骤 3（备选）：手动集成 PreviewModal + usePdfExport

如需自定义操作栏布局，可跳过 `FormActions`，直接集成底层能力：

```vue
<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { usePdfExport } from '@/composables/usePdfExport'
import PreviewModal from '@/components/PreviewModal.vue'

const { exportPdf, isExporting } = usePdfExport()
const showPreview = ref(false)
const previewContentRef = ref<HTMLElement | null>(null)

async function openPreview() {
  showPreview.value = true
  await nextTick()
  await new Promise((r) => setTimeout(r, 300))
  previewContentRef.value = document.querySelector('.preview-pdf-data')
}

async function handleExport() {
  const docTitle = buildPdfTitle(t('myForm.title'))
  const filename = buildPdfFilename(t('myForm.title'))
  await exportPdf(previewContentRef.value ?? undefined, filename, docTitle)
  showPreview.value = false
}
</script>
```

---

## 注意事项

1. **PreviewModal 的 `v-if="open"`**：DialogPortal 内部使用 `v-if` 控制渲染，避免关闭状态下 overlay 遮挡页面交互
2. **expandForCapture**：PDF 导出前会自动展开所有可滚动容器（移除 overflow/height 约束），导出后自动恢复
3. **动态 import**：html2canvas 和 jspdf 使用 `await import()` 按需加载，不影响首屏 bundle 大小
4. **PDF 中文支持**：html2canvas 捕获已渲染的 DOM，中文字符由浏览器渲染，天然支持
5. **分页不打断内容**：通过 `data-pdf-section` 标记，每个分组不会被切割到两页（除非单个分组本身就超过一页高度）

---

## 相关文档

- [签证表单开发规范](./form-dev-guide.md) — 新增签证表单时的文件命名、i18n 结构、字段组件、持久化、`FormActions` 接入清单
- [英国签证表单设计](./uk-visa-form-design.md) — 英国签证模块的功能设计、字段结构、条件联动、动态分组逻辑
