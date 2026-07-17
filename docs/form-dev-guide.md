# 签证表单开发规范

本文档定义新增签证表单时必须遵循的命名规范、文件结构、i18n 键设计和公共能力接入要求。

---

## 1. 文件命名

| 用途 | 路径格式 | 示例 |
|------|----------|------|
| 表单页面 | `src/views/{Country}VisaForm.vue` | `UKVisaForm.vue` |
| 表单路由 | `/kebab-case` | `/uk-visa` |
| i18n 顶层键 | `formKey`（camelCase） | `ukVisa` |

**命名对应关系**：

```
文件名        : UKVisaForm.vue
路由 path     : /uk-visa
路由 name     : uk-visa
i18n key      : ukVisa.*
页面 title    : 由 useHead + t('ukVisa.title') 设置
```

---

## 2. 路由注册

在 `src/router/index.ts` 的 `DefaultLayout` children 中追加：

```typescript
{
  path: '/{country-visa}',           // kebab-case
  name: '{country-visa}',            // kebab-case，与 path 一致
  component: () => import('@/views/{Country}VisaForm.vue'),
  meta: { titleKey: '{formKey}.title' },  // DefaultLayout 面包屑显示用
},
```

---

## 3. i18n 键结构

每个表单必须包含以下键，以 `ukVisa` 为参考：

```jsonc
{
  "{formKey}": {
    // 必须 ----
    "title":        "表单主标题（如：英国签证）",
    "subtitle":     "表单副标题（如：签证信息收集）",
    "clearForm":    "清除数据",
    "clearConfirm": "清除确认提示文案（如：确定要清除所有已填写的数据吗？此操作无法撤销。）",
    "exportPdf":    "导出 PDF",
    "exporting":    "正在生成...",

    // 分组标题（当前 UK 表单有 14 个分组） ----
    "sections": {
      "personalInfo": "个人信息",
      "passportInfo": "护照信息",
      // 按需增加，UK 表单共 14 个分组...
    },

    // 字段 ----
    "fields": {
      "{fieldName}": {
        "label":       "字段标签（必填）",
        "placeholder": "输入提示（文本类字段必填）"
      }
      // 日期类字段无 placeholder
    },

    // 选项（下拉、单选等） ----
    "options": {
      "{optionGroup}": {
        "{value}": "显示文本"
      }
    },

    // 子标题（用于可重复组和嵌套分组的子标签） ----
    "subLabels": {
      "father": "父亲",
      "mother": "母亲",
      "companion1": "同行人 1",
      "companion2": "同行人 2",
      "child1": "子女 1",
      "ukVisit1": "第1次访问",
      "refusal1": "第1次拒签",
      "otherCountry1": "第1个国家",
      // 按需增加...
    }
  }
}
```

**规则**：

- 所有 UI 文字必须通过 `t()` 引用，禁止硬编码
- `label` 用于字段标签和 PDF 预览，`placeholder` 仅文本类字段需要
- 日期字段（DateField）无 placeholder，只有 label
- 选项值（value）用英文/代码，显示文本放 i18n

**zh-CN 和 en 必须同步**：新增键时两个语言文件都要更新，en 文件对应值用英文。

---

## 4. 表单页面结构

### 4.1 script 部分（按顺序）

```typescript
<script setup lang="ts">
// 1. Vue 核心
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { ArrowUp, Plus, Trash2 } from '@lucide/vue'  // 回到顶部 + 动态行增删

// 2. UI 组件
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import TextField from '@/components/fields/TextField.vue'
import DateField from '@/components/fields/DateField.vue'
import SelectField from '@/components/fields/SelectField.vue'
import type { SelectOption } from '@/components/fields/SelectField.vue'
import RadioField from '@/components/fields/RadioField.vue'
import type { RadioOption } from '@/components/fields/RadioField.vue'

// 3. 公共能力
import type { PreviewSection } from '@/composables/usePdfExport'
import { useApplicantName } from '@/composables/useApplicantName'
import FormActions from '@/components/FormActions.vue'

// 4. i18n
const { t, locale } = useI18n()

// 5. 申请人姓名（供 FormActions 生成 PDF 标题/文件名）
const { buildPdfTitle, buildPdfFilename } = useApplicantName(
  () => /* 姓名提取逻辑 */
)

// 6. 辅助函数（formatDate、resolveOption）

// 7. 可重复组工厂函数（见第 4.4 节）

// 8. 预览数据构建（previewSections computed，见第 9 节）

// 9. useHead

// 10. localStorage key + defaultData + SCHEMA_VERSION + loadSavedData()

// 11. 表单数据（reactive）

// 12. 自动保存（watch formData → localStorage）

// 13. clearForm()（带 confirm 二次确认）

// 14. 校验与导出（见第 10 节 handleExportClick）

// 15. 回到顶部（见第 14 节）

// 16. 选项数组（SelectOption[] / RadioOption[]）
//     注意：所有 yes/no 类型的 RadioField 共用同一个 yesNoOptions 数组
</script>
```

### 4.2 template 结构

```vue
<template>
  <div class="form-page">
    <div class="form-container">

      <!-- 标题区域 + 操作栏，包裹在 sticky wrapper 内（不在 glass-card 内） -->
      <!-- FormActions 统一渲染标题栏、导出按钮、清除按钮、PreviewModal -->
      <div class="sticky-header-wrapper">
        <FormActions
          ref="formActionsRef"
          :sections="previewSections"
          :form-title="t('{formKey}.title')"
          :form-subtitle="t('{formKey}.subtitle')"
          :build-pdf-title="buildPdfTitle"
          :build-pdf-filename="buildPdfFilename"
          i18n-prefix="{formKey}"
          @clear="clearForm"
          @export="handleExportClick"
        />
      </div>

      <!-- 表单主体（毛玻璃卡片），Accordion 加 accordion-layer class -->
      <div class="glass-card">
        <Accordion type="multiple" class="w-full accordion-layer" :default-value="['第一个section的value']">
          <!-- 每个 AccordionItem 必须加 data-accordion-value，供校验聚焦时查找 -->
          <AccordionItem
            v-for="section in accordionSections"
            :key="section.value"
            :value="section.value"
            :data-accordion-value="section.value"
          >
            <AccordionTrigger>{{ t(section.titleKey) }}</AccordionTrigger>
            <AccordionContent>
              <div class="fields-grid">
                <!-- 各字段组件 -->
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>

    <!-- 回到顶部按钮 -->
    <Transition name="fade">
      <button
        v-if="showBackToTop"
        type="button"
        class="back-to-top-btn"
        :title="t('{formKey}.backToTop')"
        @click="scrollToTop"
      >
        <ArrowUp :size="20" />
      </button>
    </Transition>
  </div>
</template>
```

> **面包屑**：由 `DefaultLayout` 通过 `route.meta.titleKey` 统一渲染，表单页面无需自行处理。路由注册时在 `meta` 中加 `titleKey` 即可。

> **FormActions 职责**：导出按钮（点击后 emit `@export`，由父组件校验）、清除数据按钮（二次确认）、PreviewModal 弹窗。表单页面通过 `ref` 获取实例，校验通过后调用 `formActionsRef.value?.openPreview()` 打开预览。

> **Sticky header 约束**：`FormActions` 必须放在 `.sticky-header-wrapper` 内、`glass-card` 外。`backdrop-filter` 和 `transform` 会创建 containing block，导致其内部 `position: sticky` 子元素失效（详见 §12.3）。

### 4.3 条件显示（v-if）与条件必填

对于 yes/no 类 RadioField，选 no 时应隐藏后续相关字段，使用 `v-if` 控制。
条件显示的字段如果业务上必填，应加上 `required`：

```vue
<!-- 条件显示 + 条件必填 -->
<RadioField name="hasOtherPassport" label-key="ukVisa.fields.hasOtherPassport.label"
  :options="yesNoOptions" v-model="formData.hasOtherPassport" required />
<div v-if="formData.hasOtherPassport === 'yes'">
  <TextField name="otherPassportDetail" label-key="ukVisa.fields.otherPassportDetail.label"
    placeholder-key="ukVisa.fields.otherPassportDetail.placeholder"
    v-model="formData.otherPassportDetail" required />
</div>
```

### 4.4 可重复组（动态行）

对于同行人、子女、访问记录等可重复数据，采用 **reactive 数组 + v-for** 模式，取代旧版链式 v-if 固定插槽方式。

**步骤 1：定义工厂函数**

```typescript
function createCompanion() {
  return { name: '', dob: '', nationality: '', passport: '', relation: '' }
}
```

**步骤 2：在 reactive 中声明数组（与 formData 平级，不嵌套）**

```typescript
const companions = reactive<Array<ReturnType<typeof createCompanion>>>([])
```

> 动态数组与 `formData` 平级声明，不放在 `formData` 内部，避免 reactive 嵌套带来的响应式丢失问题。
> 从 localStorage 恢复时：`reactive(savedData?.companions?.length ? savedData.companions : [])`

**步骤 3：模板中 v-for 渲染 + 增删按钮**

```vue
<RadioField name="hasCompanion" label-key="ukVisa.fields.hasCompanion.label"
  :options="yesNoOptions" v-model="formData.hasCompanion" required />

<div v-if="formData.hasCompanion === 'yes'">
  <div v-for="(c, i) in companions" :key="'comp-' + i" class="repeatable-group">
    <div class="repeatable-header">
      <h4 class="sub-label">{{ t('{formKey}.subLabels.companion') }} {{ i + 1 }}</h4>
      <button type="button" class="remove-btn" @click="companions.splice(i, 1)">
        <Trash2 :size="14" /> {{ t('{formKey}.removeRow') }}
      </button>
    </div>
    <div class="fields-grid">
      <TextField :name="`comp_${i}_name`" label-key="{formKey}.fields.companion.name.label"
        placeholder-key="{formKey}.fields.companion.name.placeholder"
        v-model="c.name" required />
      <DateField :name="`comp_${i}_dob`" label-key="{formKey}.fields.companion.dob.label"
        v-model="c.dob" required />
      <!-- 更多字段... -->
    </div>
  </div>
  <button type="button" class="add-btn" @click="companions.push(createCompanion())">
    <Plus :size="16" /> {{ t('{formKey}.addRow') }}
  </button>
</div>
```

**要点**：
- `name` 属性使用索引模板（如 `comp_${i}_name`），确保 DOM 唯一性，供校验聚焦使用
- `previewSections` 中直接遍历 `companions`（顶层 reactive），动态生成字段条目
- 新增行默认所有字段为空字符串，删除行直接 `splice`
- 自动保存时，将各数组与 `formData` 合并写入 localStorage；清除时分别调用 `splice(0)` 清空

### 4.5 三层数据结构：数据板块 → 数据分组 → 衍生字段域

表单数据按三层结构组织，每层有各自的视觉呈现和交互规则：

| 层级 | 概念 | 视觉呈现 | CSS / 实现 |
|------|------|----------|-----------|
| **L1 — 数据板块** | 顶层数据分类（如个人信息、旅行计划） | Accordion 手风琴面板，点击标题展开/折叠 | `<AccordionItem>` |
| **L2 — 数据分组** | 板块内始终可见的逻辑分区（如"身份证"/"护照"） | `sub-label` 标题（蓝色渐变条+蓝色左边框）+ `fields-grid` | `<h4 class="sub-label">` + `<div class="fields-grid">` |
| **L3 — 衍生字段域** | 由条件触发（通常是 yes/no）的子区域，条件不满足时隐藏 | `conditional-group`（青色背景+青色左边框圆角卡片） | `<div v-if="..." class="conditional-group">` |

> **L2 与 L3 的视觉层次**：L2 使用**深蓝色**（`#3b82f6` 左边框 + `#1e40af` 文字 + `#eff6ff` 渐变背景），视觉重量较重；L3 使用**青色**（`hsl(188 70% 42%)` 左边框 + 半透明青色背景），颜色较浅、像嵌入在 L2 内部。两者色相差异（蓝 vs 青）形成明显的层级嵌入感。

#### 布局规则的递归性

**L2 和 L3 内部的字段排版规则完全一致**——都遵循 §5.0 的七步流程（语义分组 → 组内排序 → 分行 → 列对齐）。L3 衍生字段域内部可以继续进行语义分组、可以有自己的衍生域，**无限递归，布局规则不变**。

#### L2 数据分组

板块内语义相近的字段归为一个数据分组。两种呈现方式：

1. **有 `sub-label`**：板块内有多个数据分组时，用 `<h4 class="sub-label">` 为每个分组命名（如"身份证"/"护照"、"父亲"/"母亲"）。
2. **无 `sub-label`**：板块内只有一个数据分组，直接用一个 `fields-grid` 包含所有字段。

L2 数据分组始终可见，不依赖任何条件触发。

#### L3 衍生字段域

由某个字段的值（通常是 yes/no 的 RadioField）控制显隐：

```vue
<RadioField name="hasXxx" :options="yesNoOptions" v-model="formData.hasXxx" required />
<div v-if="formData.hasXxx === 'yes'" class="conditional-group">
  <div class="fields-grid">
    <!-- 衍生字段：排版规则与 L2 完全一致 -->
  </div>
</div>
```

**规则**：

- 衍生域内的字段仅在条件满足时才显示、才参与校验和预览
- `previewSections` 中用展开运算符 `...(condition ? [{ ... }] : [])` 按条件包含
- 衍生域可以包含 `v-for` 动态行（如子女列表、访问记录）
- **衍生域可继续衍生**：L3 内部的条件字段可以触发新的衍生域，布局规则与 L2→L3 相同，无限递归

#### L3 可重复行（动态行）

衍生字段域内可包含 `v-for` 动态行，每行有独立的 `fields-grid`：

```vue
<div v-if="formData.hasXxx === 'yes'" class="conditional-group">
  <div v-for="(item, i) in items" :key="'item-' + i" class="repeatable-group">
    <div class="repeatable-header">
      <h4 class="sub-label">{{ t('xxx.subLabels.item') }} {{ i + 1 }}</h4>
      <button type="button" class="remove-btn" @click="items.splice(i, 1)">
        <Trash2 :size="14" /> {{ t('xxx.removeRow') }}
      </button>
    </div>
    <div class="fields-grid">
      <!-- 每行的字段：排版规则与 L2 完全一致 -->
    </div>
  </div>
  <button type="button" class="add-btn" @click="items.push(createItem())">
    <Plus :size="16" /> {{ t('xxx.addRow') }}
  </button>
</div>
```

#### 三种视觉容器对照

| 容器 | 外观 | 用途 | 示例 |
|------|------|------|------|
| `sub-label` | 蓝色渐变背景（`#eff6ff` → 透明）+ 蓝色左边框（`#3b82f6`）+ 深蓝文字（`#1e40af`）+ 加粗小标题 | L2 数据分组标题，始终可见，视觉重量较重 | "身份证"、"护照"、"父亲"、"母亲" |
| `conditional-group` | 青色半透明背景（`hsl(188 70% 42% / 0.14)`）+ 青色边框 + 青色粗左边框（`/ 0.72`），颜色较浅 | L3 衍生字段域，条件触发显示，嵌入在 L2 中 | "配偶信息"、"工作/学习详情" |
| `repeatable-group` | 白色半透明背景 + 青色淡边框（`hsl(188 40% 65% / 0.22)`），悬停时加深 | L3 内动态行，每个可增删 | 每个子女、每条访问记录 |

---

## 5. 字段组件使用规范

| 字段类型 | 组件 | 需要 placeholder | v-model |
|----------|------|-----------------|---------|
| 单行文本 | `TextField` | ✅ | `string` |
| 日期 | `DateField` | ❌ | `string`（YYYY-MM-DD） |
| 下拉选择 | `SelectField` | ❌ | `string`（选项 value） |
| 单选按钮 | `RadioField` | ❌ | `string`（选项 value） |

**所有字段共用的 Props**：

```vue
<字段组件
  name="fieldName"              <!-- 唯一标识，camelCase 或带索引模板 -->
  label-key="{formKey}.fields.fieldName.label"
  v-model="formData.fieldName"
/>
```

**TextField 额外**：`placeholder-key="{formKey}.fields.fieldName.placeholder"`

**SelectField 额外**：`:options="xxxOptions"`（SelectOption[]）

**RadioField 额外**：`:options="xxxOptions"`（RadioOption[]）

**可选性**：需要必填的字段加 `required`

**默认布局跨度**：每种控件有各自的默认 `span` 值（详见 §5.2.1），表单中通常无需显式指定，除非需要覆盖默认布局。

### 5.0 表单字段设计流程

从需求到排版，按以下顺序逐步完成。每一步的输出是下一步的输入。

#### 第一步：字段清单梳理

列出表单所有字段，标注每个字段的：
- **语义**：这个字段表达什么信息
- **数据类型**：文本 / 日期 / 固定选项 / 是或否
- **是否必填**
- **条件依赖**：是否由其他字段触发显示

> 输出：一张字段清单表，每行一个字段。

#### 第二步：确定控件类型（§5.1）

根据字段的数据类型，查表确定控件：

| 数据特征 | 控件 | 示例 |
|---------|------|------|
| 自由文本输入 | `TextField` | 姓名、公司名、地址 |
| 固定格式日期 | `DateField` | 出生日期、有效期 |
| 有限选项（≤10 项） | `SelectField` | 国籍、目的、签证类型 |
| 二选一 / 多选一 | `RadioField` | 性别、是/否问题 |
| 国籍（特殊） | `SelectField` + `nationalityOptions` | 所有国籍字段 |
| 是/否（特殊） | `RadioField` + `yesNoOptions` | 所有 yes/no 问题 |

> 规则：同类语义的字段必须使用同一种控件（§5.1 控件标准化规则）。

#### 第三步：确定字段长度 span（§5.2.1）

根据字段**内容本身的自然长度**决定 span，不得为凑行而调整：

| 内容长度 | span | 典型字段 |
|---------|------|---------|
| 极短（≤4字符） | `third` | 邮编、区号、日期 |
| 短（选项≤3字） | `third` | 国籍、性别、关系 |
| 中等 | `half`（TextField/SelectField 默认） | 姓名、电话、公司名 |
| 长 | `full` | 详细地址、工作职责 |

> **字段长度不可迁就布局**（§5.2.1）：span 由内容决定，布局编排只调顺序和位置，不改宽度。

#### 第四步：语义分组（§5.2.2 规则 1）

在每个 L1 数据板块内部，将属于同一概念的字段归为一个 L2 数据分组。判断标准：**这些字段是否在描述"同一个东西"的不同侧面**。

| 同一概念 → 同组 | 不同概念 → 不同组 |
|----------------|-----------------|
| 姓 + 名 + 曾用名 | 姓名组 vs 出生日期 |
| 出生年 + 月 + 日 | 出生日期组 vs 国籍 |
| 国家 + 城市 + 邮编 | 地址组 vs 联系方式 |
| 职务 + 起始年 + 起始月 | 工作信息组 vs 教育背景 |

> 输出：若干个 L2 语义分组，每组包含若干字段。
>
> **递归适用**：L3 衍生字段域内部的字段同样需要语义分组，规则一致。

#### 第五步：组内排序（§5.2.2 规则 8）

每个语义组内的字段按**语义逻辑**排序：

- 有自然顺序的按自然顺序：姓→名→曾用名、年→月→日
- 主字段在前、细节在后：国家→城市→邮编
- **语义顺序不明确时，必须提问用户确认**，不得自行猜测

#### 第六步：分行（§5.2.2 规则 8）

对每个语义组，按优先级执行：

1. **强制独占检查**：问题类字段（RadioField）、长文本字段 → 独占一行
2. **组内总跨度计算**：将组内所有字段的 span 列数相加
3. **≤ 4 → 同一行**：组内字段全部放在一行
4. **> 4 → 拆行**：按语义顺序从左往右依次排列，累计占满 4 列后换行继续
5. **新组新行**：每个语义组从新的一行开始，前组剩余空列不混入下一组

> **递归适用**：L2 和 L3（含无限衍生的子域）内部都按相同的分行规则执行。

#### 第七步：列对齐（§5.2.2 规则 8）

行内字段不满 4 列时，按场景确定位置：

| 场景 | 排列 | 网格 |
|------|------|------|
| 1个 half | 左对齐 | `[X][X][ ][ ]` |
| 1个 quarter | 放 A 列 | `[X][ ][ ][ ]` |
| 2个 quarter | 分散隔1列 | `[X][ ][Y][ ]` |
| 3个 quarter | 靠左连续 | `[X][Y][Z][ ]` |
| 1个 half + 2个 quarter | 按语义主次排序 | 视语义而定 |

> **递归适用**：L2 和 L3（含无限衍生的子域）内部都按相同的列对齐规则执行。

### 5.1 控件标准化规则

同类语义的数据必须使用同一种控件，保证用户体验一致：

| 语义类型 | 必须使用 | 示例字段 |
|----------|----------|----------|
| 日期（年月日） | `DateField` | 出生日期、证件有效期、入境日期 |
| 国籍 | `SelectField` + `nationalityOptions` | 本人国籍、配偶国籍、父母国籍 |
| 性别 | `RadioField` + `genderOptions` | 申请人性别 |
| 是/否 | `RadioField` + `yesNoOptions` | 是否有其他护照、是否有同行人 |

**国籍统一选项**（所有签证表单共用）：

```typescript
const nationalityOptions: SelectOption[] = [
  { value: 'CN', labelKey: '{formKey}.options.nationality.CN' },
  { value: 'US', labelKey: '{formKey}.options.nationality.US' },
  { value: 'GB', labelKey: '{formKey}.options.nationality.GB' },
  { value: 'OTHER', labelKey: '{formKey}.options.nationality.OTHER' },
]
```

> **注意**：日期类字段（DateField）没有 `placeholder`，i18n 中也不需要定义 placeholder 键。

### 5.2 字段布局系统（4列网格 + span 属性）

所有字段组件支持 `span` 属性，控制字段在网格中占用的宽度。

```vue
<字段组件 span="full | half | third" />
```

| 值 | 宽度 | 占列数 |
|----|------|--------|
| `full` | 占满整行 | 4/4 列 |
| `half` | 占半行 | 2/4 列 |
| `third` | 占 1/4 行 | 1/4 列 |

#### 5.2.1 控件默认跨度

每种控件根据其**输入内容的自然长度**有各自的默认 `span`，表单中**无需显式指定**，除非内容长度与默认跨度不符时需要覆盖。

| 控件 | 默认 span | 理由 | 何时覆盖 |
|------|----------|------|----------|
| `DateField` | `third`（1列） | 日期格式固定且短（如 2026-06-28） | 一般无需覆盖，保持默认即可 |
| `TextField` | `half`（2列） | 文本长度不确定，取中位 | 见下方"按内容长度决策"表 |
| `SelectField` | `half`（2列） | 下拉选项文本长度中等 | 见下方"按内容长度决策"表 |
| `RadioField` | `full`（整行） | 单选项需要横向排列空间；**问题类字段必须独占一行**（见规则 7） | 不要覆盖为 `half`/`third`——即使是/否二选项也应独占整行，避免 L3 条件子域归属混乱 |

> **设计原则**：控件自身最了解自己的"自然长度"，默认值由控件决定。表单只需关注**布局编排**（哪些字段并排、哪些独立成行），按内容长度覆盖。
>
> **⚠️ 字段长度不可迁就布局**：字段的 `span` 由其内容本身的自然长度决定，**不得**为了凑齐一行而放大或缩小。布局编排只调整排列顺序和位置（见规则 8），不改字段宽度。
>
> **⚠️ 优先使用 `third`**：当字段内容长度在 `third` 和 `half` 之间难以判定时，优先选 `third`（1列）。更紧凑的布局能在一行内塞下更多字段，视觉信息密度更高；而 `half` 用于短内容会造成大量空白浪费。只有当内容**确实可能超过 1 列宽度**（如姓名、电话、公司名）时才升到 `half`。

##### 按内容长度决策

| 内容长度 | span | 典型字段 | 说明 |
|---------|------|---------|------|
| **极短**（≤4字符） | `third`（1列） | 邮编、区号、金额、证件号、日期 | 内容固定格式，长度可预测 |
| **短**（选项≤3字） | `third`（1列） | 国籍/国家、性别（Radio+`half`）、关系（儿子/女儿）、访问目的（旅游/商务） | 选项或输入内容极短，1列足够显示 |
| **中等** | `half`（2列） | 姓名、电话、公司名、职位、地址（非长地址） | 内容长度不确定，给2列留余量 |
| **长** | `full`（整行） | 详细地址、工作职责、行程描述 | 内容可能很长，需要完整行宽 |

> **特别注意**：国籍/国家（`nationalityOptions`）在签证申请中是同一概念，选项名称均≤3字（如"中国""日本""美国"），统一使用 `span="third"`。

#### 5.2.2 布局规则

1. **概念归属原则** — 语义上属于同一范畴的字段才并排排列（如同一人的姓名+生日+国籍、同一事件的日期+地点）

2. **3合1规则（3个短字段并排）** — 3个短字段属于同一概念时，都设为 `span="third"`，并排占 3/4 行（右侧留1列空白）：
   ```vue
   <!-- DateField 默认就是 third，无需显式指定 -->
   <DateField name="dateOfBirth" ... />
   <!-- TextField 默认是 half，需要覆盖为 third -->
   <TextField name="phone" ... span="third" />
   <TextField name="email" ... span="third" />

   <!-- 姓名组：短文本覆盖为 third -->
   <TextField name="lastName" ... span="third" />
   <TextField name="firstName" ... span="third" />
   <TextField name="formerName" ... span="third" />
   ```

3. **2合1规则（2个半宽字段并排）** — 2个 `half` 字段属于同一概念时，各占半行并排（默认即可，无需指定 span）：
   ```vue
   <!-- SelectField 和 TextField 默认都是 half，无需显式指定 -->
   <SelectField name="country" ... />
   <TextField name="address" ... />
   ```

4. **field-row 包裹器** — 2个数据字段需要并排且各自占满半行时，用 `field-row` div 包裹（占2列，内部分2子列）：
   ```vue
   <!-- 2个 half 数据字段并排 -->
   <div class="field-row">
     <SelectField name="country" ... />
     <TextField name="address" ... />
   </div>
   ```
   > 适用场景：短左长右（如 SelectField+TextField 各占半行）、2个半宽数据字段并排且各自占满子列。**问题类字段（RadioField）不适用此包裹器**（见规则 7）。

5. **field-pair 包裹器** — 2个短字段（`span="third"` 或 `span="half"`）需要并排但中间留1列空白时，用 `field-pair` div 包裹（占满4列，内部分4子列，子字段分别落位到第1列和第3列，第2、4列留空）：
   ```vue
   <!-- 两个短数据字段占 AC 列，BD 列留空 -->
   <div class="field-pair">
     <TextField ... span="third" />
     <SelectField ... span="third" />
   </div>
   ```
   > 与 `field-row` 的区别：`field-row` 子字段各占子列的一半（AB 和 CD），`field-pair` 子字段落在奇数列（A 和 C），偶数列留空，视觉更疏朗。**问题类字段（RadioField）不适用此包裹器**（见规则 7）。
   > **注意**：语义紧密的短字段对（如姓+名、年+月）不需要 `field-pair`，直接连续落位 A+B 列即可（见规则 8 场景 C 例外）。

6. **长文本字段** — 地址、描述等需要完整行宽时，覆盖为 `span="full"`：
   ```vue
   <TextField name="companyAddress" ... span="full" />
   <TextField name="jobDuties" ... span="full" />
   ```

7. **问题类字段独占一行** — 提问型字段（yes/no 等 RadioField）必须独占一行，不得与其他字段（尤其是其他问题字段）共享同一视觉行。原因：若问题字段与数据字段并排，L3 条件子域的归属关系容易混淆（用户不清楚条件展开的字段属于哪个问题的分支）。
   ```vue
   <!-- ✅ 正确：每个问题独占一个 fields-grid -->
   <div class="fields-grid">
     <RadioField name="changedNationality" ... />
   </div>
   <div class="fields-grid">
     <RadioField name="goingToUk" ... />
   </div>

   <!-- ❌ 错误：两个问题并排（即使 span="half" 也不行） -->
   <RadioField name="changedNationality" ... span="half" />
   <RadioField name="goingToUk" ... span="half" />
   ```
   > **注意**：此规则优先级高于规则 4、5（`field-row` / `field-pair` 不适用于问题类字段）。RadioField 默认 `span="full"`，已天然独占一行，只需避免显式覆盖为 `half`/`third` 即可。

8. **分行与列对齐规则**

   **第一步：分行** — 决定哪些字段在同一行、哪些独占一行。

   | 优先级 | 步骤 | 说明 |
   |--------|------|------|
   | ① | 语义分组 | 属于同一概念的字段归为一组（如姓名的姓+名、日期的年+月+日） |
   | ② | 组内排序 | 组内字段的顺序由**语义**决定（如"姓→名"而非"名→姓"）。语义顺序不明确时，**必须提问用户**确认，不得自行猜测 |
   | ③ | 换行判定 | 组内字段总跨度 ≤ 4 列 → 同行；> 4 列 → 组内也拆为多行 |
   | ④ | 新组新行 | 每个语义组从新的一行开始，前一组剩余的空列**不混入**下一组的字段 |

   > **强制独占**：问题类字段（规则 7）和长文本字段（规则 6）无论能否塞下，都单独一行。

   **第二步：列对齐** — 行内字段不满 4 列时，确定各字段在网格中的位置。

   | 场景 | 字段组合 | 排列规则 | 网格示意 |
   |------|---------|---------|---------|
   | A | 1个 `half` | 左对齐，占 AB 列 | `[X][X][ ][ ]` |
   | B | 1个 `quarter`/`third` | 放 A 列 | `[X][ ][ ][ ]` |
   | C | 2个 `quarter`/`third` | 分散隔1列，占 AC 列 | `[X][ ][Y][ ]` |
   | D | 3个 `quarter`/`third` | 靠左连续，占 ABC 列，空 D 列 | `[X][Y][Z][ ]` |
   | E | 1个 `half` + 2个 `quarter`/`third` | 不固定位置，按字段**语义主次**排序 | 视语义而定 |

   > **场景 C** 与 `field-pair` 包裹器对应：`field-pair` 的子字段落位到第 1、3 列，第 2、4 列留空。
   >
   > **场景 C 例外 — 语义紧密对**：若两个 `third`/`quarter` 字段语义高度耦合（如"姓+名"、"区号+号码"、"年+月"），可连续落位到 A+B 列 `[X][Y][ ][ ]`，无需 `field-pair` 包裹。**判断标准**：两个字段去掉任一个则信息不完整或语义断裂；此时视觉紧凑优先于留白疏朗。
   >
   > **场景 E** 不强制 `half` 在左或 `quarter` 在右——按语义主次决定位置。例如"国家（half）+ 城市（quarter）+ 邮编（quarter）"中国家是主字段放左侧合理；但"职务（half）+ 起始年（quarter）+ 起始月（quarter）"中时间细节放左侧更符合阅读顺序。

#### 5.2.3 CSS Grid 实现（4列基础网格）

```css
.fields-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

/* field-row：占2列，内部再分2子列（用于2个独立短字段并排） */
.field-row {
  grid-column: span 2;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

/* field-row--triple：占2列，内部再分3子列（预留，当前未使用） */
.field-row--triple {
  grid-column: span 2;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* field-pair：占满4列，内部再分4子列；子字段分别落位到第1、3列，第2、4列留空 */
.field-pair {
  grid-column: span 4;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
/* field-pair 内 half/full 子字段强制落位到第1列 */
.field-pair > :deep(.field-span-full),
.field-pair > :deep(.field-span-half) {
  grid-column: 1 / 2;
}
/* field-pair 内第2个 third 子字段落位到第3列 */
.field-pair > :deep(.field-span-third):nth-child(2) {
  grid-column: 3 / 4;
}

/* 字段跨度类（由 FormFieldWrapper 的 span prop 映射） */
.field-span-full { grid-column: span 4; }
.field-span-half { grid-column: span 2; }
.field-span-third { grid-column: span 1; }
```

#### 5.2.3.1 CSS Grid Auto-Place 陷阱（实战教训）

**症状**：代码注释写了"Row 2: XXX"，但浏览器里该字段跑到了 Row 1 的末尾列。

**根因**：CSS Grid `auto-placement` 按源码顺序逐个填满行内空位，不关心注释里的"行号"。同一 `fields-grid` 内，前几个 `third`（1列）字段填满 Row 1 后，下一个 `third` 字段会留在 Row 1 最后一列，而非跳到 Row 2。

**案例**：父亲信息 Row 1 = name(third) + nationality(third) + dob(third) = 3列，剩余 D 列空位。country(third) 紧跟在同一 grid 内 → auto-place 填入 D 列 → 实际效果是 country 在 Row 1，而非预期的 Row 2。

**规则**：
- 若文档规定某字段在"Row N"，而它前面同行的字段总 span **小于 4**，则该字段必须放在**新的 `fields-grid`** 中，强制换行。
- 不要相信 HTML 注释的"Row 2"——注释不约束 CSS 布局。
- 改动排版后**必须用浏览器验证**，纯读代码无法发现 auto-place 错位。

#### 5.2.3.2 `conditional-group` 不要用于行内条件字段

**症状**：某个条件字段（如"房东"）只出现了1个，但视觉上撑满了整行（4列宽），与旁边字段不对齐。

**根因**：`conditional-group` 的 CSS 设了 `grid-column: 1 / -1`（占满父 grid 整行宽度）。如果条件字段需要与同行其他字段并排，套 `conditional-group` 会强制它独占整行。

**案例**：Row 2 = housingStatus(third) + residenceStartDate(third) + houseOwner(条件)。houseOwner 用 `<div class="conditional-group"><TextField .../></div>` 包裹 → conditional-group 占满整行 → houseOwner 视觉宽度变成4列，而非预期的 half(2列)。

**规则**：
- 条件字段需要与同行其他字段**并排**时，用 `v-if` 直接挂在字段上，**不要**套 `conditional-group`。
- `conditional-group` 只用于条件子域需要**独立视觉区块**（背景色+边框）且独占整行的场景。

#### 5.2.4 响应式降级规则（三档）

| 屏幕宽度 | 行为 |
|---------|------|
| ≥1024px（桌面端）| 按 `span` 属性正常显示（full / half / third）|
| 768–1024px（平板端）| `third` 降级为 `half`（span 2列），`field-row` 扩展为整行；`field-pair` 降级为2列（子字段各占1列，不留空）|
| <768px（手机端）| 所有字段降级为 `span="full"`（单列），`field-pair` 内子字段也单列排列 |

```css
/* 平板端：third 降级为 half，field-row 扩展为整行，field-pair 降级为2列 */
@media (max-width: 1024px) {
  .field-row,
  .field-row--triple {
    grid-column: span 4;
    grid-template-columns: repeat(2, 1fr);
  }
  .field-pair {
    grid-column: span 4;
    grid-template-columns: repeat(2, 1fr);
  }
  .field-pair > :deep(.field-span-third):nth-child(2) {
    grid-column: 2 / 3;
  }
  .field-span-third { grid-column: span 2; }
}

/* 手机端：全部单列 */
@media (max-width: 768px) {
  .fields-grid { grid-template-columns: 1fr; }
  .field-row,
  .field-row--triple {
    grid-column: span 1;
    grid-template-columns: 1fr;
  }
  .field-pair {
    grid-column: span 1;
    grid-template-columns: 1fr;
  }
  .field-pair > :deep(.field-span-full),
  .field-pair > :deep(.field-span-half),
  .field-pair > :deep(.field-span-third):nth-child(2) {
    grid-column: span 1;
  }
  .field-span-full,
  .field-span-half,
  .field-span-third { grid-column: span 1; }
}
```

> **PDF 导出**：预览和 PDF 导出必须按 PC 桌面端（≥1024px）排版渲染，不受响应式降级影响。详见第 9 节。

#### 5.2.5 下拉/弹窗组件抖动问题（实战教训）

**症状**：点击下拉选择器（SelectField、NationalityField、PhoneField）时，整个页面左右抖动。

**根因（两类，分别影响不同组件）**：

| 组件 | 根因 | 机制 |
|------|------|------|
| **SelectField**（标准 Select 模式） | Reka UI 的 `bodyLock` 默认为 `true` | 打开时设 `body { overflow: hidden }` + `padding-right: 滚动条宽度`，与 `scrollbar-gutter: stable` **双倍补偿** → 居中布局偏移 |
| **NationalityField / PhoneField**（Popover 模式） | `PopoverContent` 的 `updatePositionStrategy` 默认 `"always"` | 每帧都重算 Popover 位置，与入场 CSS 动画（`animate-in` 的 scale/translate）互相干扰 → 视觉抖动 |

**修复（已应用到项目）**：

```typescript
// src/components/ui/select/SelectContent.vue — 禁用 Reka UI 的 body scroll lock
// scrollbar-gutter: stable 已独立处理滚动条预留，不需要 Reka UI 再做 body overflow/padding 补偿
withDefaults(defineProps<SelectContentProps & { class?: ... }>(), {
  position: "popper",
  bodyLock: false,  // ← 新增
})
```

```typescript
// src/components/ui/popover/PopoverContent.vue — 位置更新策略改为 optimized
withDefaults(defineProps<PopoverContentProps & { class?: ... }>(), {
  align: "center",
  sideOffset: 4,
  updatePositionStrategy: "optimized",  // ← 原为 "always"
})
```

**防御性措施**（`src/style.css`）：

```css
html {
  overflow-y: auto;
  overflow-x: clip; /* 阻止 portal 弹出层溢出 viewport 时产生水平滚动条 */
  scrollbar-gutter: stable;
}
```

> **原理**：`overflow-y: auto` 会让 `overflow-x` 的计算值从 `visible` 变成 `auto`（CSS Overflow 规范），导致 portal 内容（NationalityField 640px / PhoneField 600px 宽 Popover，且 `:avoid-collisions="false"`）溢出时产生水平滚动条。显式设 `overflow-x: clip` 可阻止此行为，且 `clip` 不会被 `overflow-y` 的计算规则改写。

**涉及组件速查**：

| 组件 | Portal 方式 | 抖动类型 | 修复位置 |
|------|------------|---------|---------|
| SelectField（标准 Select） | `SelectPortal` → body | bodyLock 双倍补偿 | `SelectContent.vue` |
| SelectField（filterable Popover） | `PopoverPortal` → body | updatePositionStrategy | `PopoverContent.vue`（全局生效） |
| NationalityField | `PopoverPortal` → body | updatePositionStrategy + 溢出 | `PopoverContent.vue` + `style.css` |
| PhoneField | `PopoverPortal` → body | updatePositionStrategy + 溢出 | 同上 |
| DateField | `PopoverPortal` → body | 无问题（不涉及 scroll lock） | — |

> **教训**：`scrollbar-gutter: stable` 和 Reka UI 的 `bodyLock` 都在处理滚动条空间预留，同时启用会双倍补偿。选择一种机制即可——本项目用 `scrollbar-gutter: stable`（纯 CSS、无需 JS 介入）。

---

## 6. 选项定义规范

```typescript
// 下拉选择（SelectField）
const xxxOptions: SelectOption[] = [
  { value: 'value1', labelKey: '{formKey}.options.xxx.value1' },
  { value: 'value2', labelKey: '{formKey}.options.xxx.value2' },
]

// 单选按钮（RadioField）
const xxxOptions: RadioOption[] = [
  { value: 'value1', labelKey: '{formKey}.options.xxx.value1' },
  { value: 'value2', labelKey: '{formKey}.options.xxx.value2' },
]
```

`labelKey` 指向 i18n 键，组件内部自动调用 `t()`。

---

## 7. 表单数据持久化

```typescript
const STORAGE_KEY = 'ws-visa-{formKey}-form-data'

// 1. 先定义表单结构
const defaultData = {
  field1: '',
  field2: '',
  field3: '',
}

// 2. 从全部 key 计算 schema 版本（排序后用 | 拼接）
//    只要字段增删或重命名，版本就会变化
const SCHEMA_VERSION = Object.keys(defaultData).sort().join('|')

// 3. 加载时比对版本，版本不匹配则丢弃旧数据
function loadSavedData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed._schemaVersion === SCHEMA_VERSION) {
        return parsed.data
      }
      // 版本不匹配，清除旧数据
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch { /* ignore */ }
  return null
}

const savedData = loadSavedData()

// 4. 用 savedData 覆盖默认值
const formData = reactive({
  field1: savedData?.field1 ?? defaultData.field1,
  field2: savedData?.field2 ?? defaultData.field2,
  field3: savedData?.field3 ?? defaultData.field3,
})

// 5. 自动保存（携带版本号）
watch(formData, (newVal) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      _schemaVersion: SCHEMA_VERSION,
      data: newVal,
    }))
  } catch { /* ignore */ }
}, { deep: true })

// 6. 清除（二次确认）
function clearForm() {
  if (!confirm(t('{formKey}.clearConfirm'))) return
  doClearForm()
}

function doClearForm() {
  for (const key of Object.keys(formData) as Array<keyof typeof formData>) {
    formData[key] = ''
  }
  localStorage.removeItem(STORAGE_KEY)
}
```

**存储格式**：

```json
{
  "_schemaVersion": "dateOfBirth|email|firstName|lastName|nationality",
  "data": {
    "firstName": "三",
    "lastName": "张",
    ...
  }
}
```

---

## 8. 姓名提取逻辑

每个表单通过 `useApplicantName` 工厂函数定义姓名如何拼接：

```typescript
// 分开的姓+名（如英国签证）
const { buildPdfTitle, buildPdfFilename } = useApplicantName(
  () => (formData.lastName + formData.firstName).trim(),
)

// 单独的 fullName 字段（如其他签证）
const { buildPdfTitle, buildPdfFilename } = useApplicantName(
  () => formData.fullName,
)
```

---

## 9. PreviewSections 构建

`previewSections` 是表单向公共系统提供的数据，**必须**：

- 在 `computed` 中构建，确保实时响应
- 所有文本通过 `t()` 翻译
- Select/Radio 字段的值用 `resolveOption()` 解析为显示文本
- 日期字段的值用 `formatDate()` 格式化
- **必填字段加 `required: true`**（与模板中的 `required` prop 保持一致）
- **必填字段加 `name`**（与字段组件的 `name` prop 一致，供校验聚焦定位 DOM 元素）
- **字段包含 `type`**（`'text' | 'date' | 'select' | 'radio'`，与模板中使用的控件类型一致，供 PreviewModal 推断默认 span）
- **仅当需要覆盖默认 span 时才写 `span`**（如 TextField 默认 `half`，若需 3 合1 布局则写 `span: 'third'`）

> **PDF/预览布局约束：** 预览（阅览）和 PDF 导出必须按 **PC 桌面端（≥1024px）排版**渲染，不受移动端响应式降级影响。`previewSections` 中的 `type` 用于推断默认 span（与字段组件的 withDefaults 一致：date→third, text→half, select→half, radio→full），`span` 仅在覆盖默认值时需要指定。PreviewModal 使用与页面相同的 4列 Grid 渲染字段，保证预览/导出效果与用户在桌面端看到的一致。

```typescript
const previewSections = computed<PreviewSection[]>(() => [
  {
    title: t('{formKey}.sections.personalInfo'),
    fields: [
      // 必填字段：同时带 required、name 和 type
      { label: t('{formKey}.fields.lastName.label'), value: formData.lastName, required: true, type: 'text', name: 'lastName', span: 'third' },
      { label: t('{formKey}.fields.dateOfBirth.label'), value: formatDate(formData.dateOfBirth), required: true, type: 'date', name: 'dateOfBirth' },
      { label: t('{formKey}.fields.nationality.label'), value: resolveOption(nationalityOptions, formData.nationality), required: true, type: 'select', name: 'nationality' },
      // 选填字段：无需 required 和 name，但仍需 type
      { label: t('{formKey}.fields.formerName.label'), value: formData.formerName, type: 'text' },
    ],
  },
  // 条件字段：仅当条件满足时才包含在数组中
  {
    title: t('{formKey}.sections.passportInfo'),
    fields: [
      { label: t('{formKey}.fields.hasOtherPassport.label'), value: resolveOption(yesNoOptions, formData.hasOtherPassport), required: true, name: 'hasOtherPassport' },
      // 条件展开：formData.hasOtherPassport === 'yes' 时才加入，且标记为 required
      ...(formData.hasOtherPassport === 'yes'
        ? [{ label: t('{formKey}.fields.otherPassportDetail.label'), value: formData.otherPassportDetail, required: true, name: 'otherPassportDetail' }]
        : []),
    ],
  },
  // 动态行：遍历 reactive 数组
  // ... 同行人分组中直接遍历 companions（顶层 reactive）
])
```

**动态行的 previewSections 构建**：

```typescript
// 同行人分组
{
  title: t('{formKey}.sections.companions'),
  fields: formData.hasCompanion === 'yes'
    ? companions.flatMap((c, i) => [
        { label: t('{formKey}.fields.companion_name.label'), value: c.name, required: true, type: 'text', name: `companion_${i}_name`, span: 'third' as const },
        { label: t('{formKey}.fields.companion_dob.label'), value: formatDate(c.dob), required: true, type: 'date', name: `companion_${i}_dob` },
      ])
    : [],
}
```

**`required` 规则**：

- 模板中字段组件标了 `required` 的，previewSections 对应条目也必须加 `required: true`
- 校验时检查 `field.value` 是否为空字符串（去空格后）
- 文件上传类字段**不存储**，不放入 previewSections；若为必填则始终视为缺失

**`name` 规则**：

- 所有 `required: true` 的字段必须同时提供 `name`
- `name` 值必须与对应字段组件的 `name` prop 完全一致
- 动态行使用索引模板（如 `companion_${i}_name`），与模板中的 `:name` 一致

**条件字段**：

- 通过展开运算符 `...(condition ? [{ ... required: true, name }] : [])` 按条件包含
- 仅当条件为 true 时才将字段纳入校验范围
- 这样避免条件未满足时误判为"缺失必填"

**可重复组**：遍历 reactive 数组动态生成所有字段条目，未添加的行不参与校验。

**注意**：`previewSections` 的分组顺序必须与 Accordion 中的 `AccordionItem` 顺序一致。

---

## 10. 必填字段校验（父组件驱动）

校验逻辑由**父组件**（表单页面）实现，`FormActions` 只负责触发 `@export` 事件：

### 10.1 校验流程

```
用户点击"导出 PDF"
       │
       ▼
FormActions emit('export')
       │
       ▼
父组件 handleExportClick()
       │
       ├── 扫描 previewSections 中 required=true 且 value 为空的字段
       │
       ├── 有缺失字段？
       │    ├── 是 → 展开第一个缺失字段所在的 Accordion
       │    │       → 滚动到该字段并 focus
       │    │       → 闪烁红色错误动画（2 秒）
       │    │
       │    └── 否 → 调用 formActionsRef.value?.openPreview()
       │
```

### 10.2 实现代码

```typescript
const formActionsRef = ref<InstanceType<typeof FormActions> | null>(null)

function handleExportClick() {
  // 1. 收集所有缺失字段
  const missingFields: { name: string; label: string; section: string }[] = []
  for (const section of previewSections.value) {
    for (const field of section.fields) {
      if (field.required && (!field.value || !field.value.trim())) {
        const name = (field as any).name ?? ''
        missingFields.push({ name, label: field.label, section: section.title })
      }
    }
  }

  // 2. 有缺失：展开对应手风琴 + 聚焦 + 闪烁动画
  if (missingFields.length > 0) {
    const firstMissing = missingFields[0]
    const sectionMap: Record<string, string> = {
      // section title → AccordionItem value 的映射
      // 根据实际 sections 配置填写，如：
      // [t('{formKey}.sections.personalInfo')]: 'personal-info',
    }
    const accordionValue = sectionMap[firstMissing.section]

    if (accordionValue) {
      const accordionItem = document.querySelector(
        `[data-accordion-value="${accordionValue}"]`
      )
      const trigger = accordionItem?.querySelector('[role="button"]') as HTMLElement
      if (trigger && trigger.getAttribute('aria-expanded') === 'false') {
        trigger.click()
      }
    }

    nextTick(() => {
      if (!firstMissing.name) return
      const el = document.querySelector(`[name="${firstMissing.name}"]`) as HTMLElement
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.focus()
        el.classList.add('field-error-flash')
        setTimeout(() => el.classList.remove('field-error-flash'), 2000)
      }
    })
    return
  }

  // 3. 全部通过：打开预览
  formActionsRef.value?.openPreview()
}
```

### 10.3 必要前提

- 每个 `AccordionItem` 必须加 `data-accordion-value` 属性（与 `:value` 相同）
- 每个必填字段的 `previewSections` 条目必须带 `name`，且与组件的 `name` prop 一致
- `sectionMap` 的 key 必须与 `previewSections` 中的 `section.title`（已翻译）完全匹配

### 10.4 错误闪烁动画

在表单页面的 `<style scoped>` 中添加：

```css
:global(.field-error-flash) {
  animation: errorFlash 0.6s ease-in-out 3;
}

@keyframes errorFlash {
  0%, 100% { box-shadow: none; }
  50% { box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.8); }
}
```

---

## 11. 公共能力接入清单

每个新表单必须接入以下公共能力：

- [ ] `FormActions` — 表单操作栏（含导出按钮、清除按钮、PreviewModal）
- [ ] `useApplicantName` — 姓名提取 + PDF 标题生成
- [ ] `previewSections` computed — 将表单数据转为 `PreviewSection[]`（必填字段加 `required: true` 和 `name`）
- [ ] `handleExportClick` — 校验 + 聚焦缺失字段 + 打开预览（见第 10 节）
- [ ] 回到顶部按钮（见第 14 节）
- [ ] i18n 添加 `exportPdf`、`exporting`、`clearForm`、`clearConfirm`、`backToTop` 键

---

## 12. 样式规范

### 12.1 主题色变量

全局 CSS 变量（`src/style.css`）定义了表单的主题色系：

| CSS 变量 | 用途 | 亮色值 | 暗色值 |
|---------|------|--------|--------|
| `--ring` | 输入框聚焦环颜色 | `188 70% 42%`（青色） | `188 60% 55%` |
| `--input` | 输入框默认边框颜色 | `188 40% 78%`（淡青色） | `188 30% 25%` |

> 所有字段组件（TextField、DateField、SelectField、RadioField 等）的边框和聚焦环颜色均通过这两个 CSS 变量控制，修改主题色只需调整 `style.css` 中的变量值。

### 12.2 页面布局策略

整体布局分三层，各层职责明确：

```
DefaultLayout
├── <header>  Tailwind container（max-width: 1536px @2xl）— 顶栏
├── breadcrumb（route.meta.titleKey 存在时显示）
├── <main>    Tailwind container（max-width: 1536px @2xl）— 主内容区
│   └── {Country}VisaForm
│       └── .form-container（max-width: 1440px, width: 100%, margin: 0 auto）
│           ├── .sticky-header-wrapper（position: sticky; top: 0）
│           │   └── <FormActions>  ← 蓝色标题栏 + 操作按钮
│           └── .glass-card（backdrop-filter: blur(20px)）
│               └── Accordion.accordion-layer（transform: translateZ(0)）
│                   └── .fields-grid（repeat(4, 1fr)）
└── <footer>  Tailwind container — 页脚
```

**各层职责**：

| 层 | 控制方式 | 职责 |
|----|---------|------|
| `DefaultLayout` `<main>` | Tailwind `container` class（响应式断点，2xl=1536px） | 全局内容宽度约束，保证各分辨率不超出视口 |
| `.form-container` | `max-width: 1440px; width: 100%` | 表单专用宽度，在外层 container 内居中，提供比全局稍窄的表单视觉区域 |
| `.sticky-header-wrapper` | `position: sticky; top: 0; z-index: 20` | 标题栏滚动时固定在视口顶部 |
| `.glass-card` | `backdrop-filter: blur(20px)` | 毛玻璃视觉效果 |

**自适应行为**：`form-container` 用 `max-width: 1440px` + `width: 100%`，不使用百分比或固定值——在 1920px 视口渲染为 1440px 居中，在 1366px 视口渲染为约 1248px，永远不会撑破外层 container，也不会在小屏幕上溢出。

### 12.3 Sticky Header 实现（实战教训）

**问题**：将 `position: sticky` 直接加在 `.form-header`（`FormActions` 内部）上无效。

**根因**：`.glass-card` 的 `backdrop-filter: blur(20px)` 会创建**隐式 containing block**（CSS 规范行为，与 `transform` 效果相同），导致其内部所有 `position: sticky` 子元素相对于 glass-card 定位，而非相对于滚动视口——sticky 失效。

**解决方案**：将 `FormActions` 从 `.glass-card` 内移出，放入独立的 `.sticky-header-wrapper`：

```vue
<div class="form-container">
  <!-- sticky wrapper 在 glass-card 外面 -->
  <div class="sticky-header-wrapper">
    <FormActions ... />
  </div>
  <!-- glass-card 单独包裹表单主体 -->
  <div class="glass-card">
    <Accordion class="w-full accordion-layer" ...>
      ...
    </Accordion>
  </div>
</div>
```

```css
.sticky-header-wrapper {
  position: sticky;
  top: 0;
  z-index: 20;
}
```

**连带约束**：`transform: translateZ(0)` 同样会创建 containing block，不能放在 `.glass-card` 上（否则 sticky 也失效）。改为在 Accordion 元素上加 `.accordion-layer` class 承载 `translateZ(0)`，用于隔离手风琴动画时的 `backdrop-filter` 重绘：

```css
/* translateZ 放在 accordion-layer 而非 glass-card，避免破坏 sticky */
.accordion-layer {
  transform: translateZ(0);
}
```

> **规则**：任何需要 `position: sticky` 的元素，其所有祖先都不能有以下属性（会创建 containing block）：`overflow: hidden/auto`、`transform`、`backdrop-filter`、`contain`、`will-change: transform`。

### 12.4 页面布局样式

- 字段网格使用 `.fields-grid`，**4列基础 CSS Grid**（详见 §5.2）
- 标题区域（form-header / form-title / form-subtitle）和操作按钮样式由 `FormActions` 组件内部维护，表单页面无需关心
- 以上 class 已在 `UKVisaForm.vue` 的 `<style scoped>` 中定义，新表单可复制并调整主色调
- 可重复组和嵌套分组的子标题使用 `.sub-label` 类（小字号、加粗、底部分隔线）
- 动态行容器使用 `.repeatable-group`（背景色+边框+圆角，包裹子标题和操作按钮）
- 动态行头部使用 `.repeatable-header`（flex 布局，左右分布子标题和删除按钮）
- 新增行按钮使用 `.add-btn`，删除行按钮使用 `.remove-btn`
- 回到顶部按钮使用 `.back-to-top-btn`（固定定位右下角，圆形，带阴影）
- 错误闪烁动画使用 `:global(.field-error-flash)`（见第 10.4 节）

**响应式断点：**

```css
/* 平板端（768-1024px）：third 降级为 half，field-row 扩展为整行 */
@media (max-width: 1024px) {
  .field-row,
  .field-row--triple {
    grid-column: span 4;
    grid-template-columns: repeat(2, 1fr);
  }
  .field-span-third { grid-column: span 2; }
}

/* 手机端（<768px）：所有字段单列 */
@media (max-width: 768px) {
  .fields-grid { grid-template-columns: 1fr; }
  .field-row,
  .field-row--triple {
    grid-column: span 1;
    grid-template-columns: 1fr;
  }
  .field-span-full,
  .field-span-half,
  .field-span-third { grid-column: span 1; }
}
```

---

## 13. 回到顶部按钮

所有表单页面必须添加回到顶部按钮：

```typescript
// script 部分
import { ref } from 'vue'
import { ArrowUp } from '@lucide/vue'

const showBackToTop = ref(false)

function handleScroll() {
  showBackToTop.value = window.scrollY > 300
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', handleScroll, { passive: true })
}
```

```vue
<!-- template 末尾，在 .form-page 内部 -->
<Transition name="fade">
  <button
    v-if="showBackToTop"
    type="button"
    class="back-to-top-btn"
    :title="t('{formKey}.backToTop')"
    @click="scrollToTop"
  >
    <ArrowUp :size="20" />
  </button>
</Transition>
```

```css
/* 淡入淡出动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 回到顶部按钮 */
.back-to-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
  z-index: 50;
}

.back-to-top-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: translateY(-3px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
}
```

i18n 中需添加 `backToTop` 键：`{formKey}.backToTop`。

---

## 14. 一键填充测试数据（开发环境）

为每个表单提供 `src/dev/mockFormData.ts`，在开发环境下通过"填充测试数据"按钮一键填充所有字段，用于快速预览 PDF、调试校验逻辑、验证条件联动。

### 14.1 文件位置

```
src/dev/mockFormData.ts
```

仅在开发环境导入（`UKVisaForm.vue` 中 `import { mockFormData } from '@/dev/mockFormData'`），生产构建时 tree-shaking 不会打包。

### 14.2 数据结构

```typescript
export const mockFormData = {
  formData: {
    // 所有 defaultData 中定义的字段，包括必填和非必填
    field1: 'value1',
    field2: 'value2',
  },
  companions: [{ /* 同 createCompanion() 结构 */ }],
  children:   [{ /* 同 createChild() 结构 */ }],
  ukVisits:   [{ /* 同 createUkVisit() 结构 */ }],
  refusals:   [{ /* 同 createRefusal() 结构 */ }],
  otherCountries: [{ /* 同 createOtherCountry() 结构 */ }],
}
```

> `formData` 的 key 必须与 `defaultData` 完全一致，否则 `fillTestData()` 的赋值循环会跳过未定义的 key。

### 14.3 填充原则

目标是**最大化字段可见性**，让所有条件分支和可重复组都能展示出来：

| 原则 | 说明 | 示例 |
|------|------|------|
| **必填字段必填** | 所有 `required: true` 的字段必须有值 | `lastName: 'Zhang'` |
| **非必填也填** | 非必填字段也要提供值，确保 PDF 预览中所有位置都有内容 | `formerName: 'Li'`（曾用名非必填） |
| **L3 条件全开** | 所有 yes/no 条件触发字段设为 `'yes'`，让条件子域全部展开 | `hasSponsor: 'yes'` → 显示赞助人字段 |
| **可重复组至少 1 条** | 每个可重复组至少提供 1 条数据，避免"选了是但没数据"的矛盾状态 | `refusals: [{ date: '...', ... }]` |
| **条件联动链完整** | 如果条件子域内有嵌套的 yes/no 决策，也要触发 | `spouseChangedNationality: 'yes'` → 触发配偶其他国籍字段 |

### 14.4 条件联动覆盖清单

mock 数据必须覆盖所有 L3 条件分支。以 UK 签证为例：

```typescript
// formData 中以下条件字段必须设为 'yes'
hasOtherPassport: 'yes',        // → 显示其他护照国家+详情
housingStatus: 'tenant',        // → 显示房东姓名
maritalStatus: 'married',       // → 显示配偶全部字段
hasChildren: 'yes',             // → 显示子女可重复组
hasCompanion: 'yes',            // → 显示同行人可重复组
employmentStatus: 'working',    // → 显示工作详情（职位、薪资、职责、其他收入）
hasSponsor: 'yes',              // → 显示赞助人字段
hasUKContact: 'yes',            // → 显示英国联系人字段
hasUKAccommodation: 'yes',      // → 显示英国住宿字段
hadUKVisa: 'yes',               // → 显示最后签证日期
visitedUK: 'yes',               // → 显示英国访问记录可重复组
beenRefused: 'yes',             // → 显示拒签记录可重复组
appliedUKStay: 'yes',           // → 显示申请详情
visitedOtherCountries: 'yes',   // → 显示其他国家旅行记录
hasUKInsurance: 'yes',          // → 显示保险号+原因
hasSpecialIndustry: 'yes',      // → 显示特殊行业选择+详情

// 父母/配偶的"是否更换国籍"也要触发
spouseChangedNationality: 'yes',  // → 触发配偶其他国籍字段
father_changed_nationality: 'yes',
mother_changed_nationality: 'yes',
```

### 14.5 fillTestData() 实现要求

`fillTestData()` 函数必须完成以下动作：

```typescript
function fillTestData() {
  if (!import.meta.env.DEV) return

  // 1. 清空 formData 所有字段（恢复默认值）
  for (const key of Object.keys(formData)) {
    formData[key] = (defaultData as Record<string, unknown>)[key] ?? ''
  }

  // 2. 清空所有可重复组
  companions.splice(0)
  children.splice(0)
  // ... 所有 reactive 数组

  // 3. 填入 mock 数据
  for (const key of Object.keys(mockFormData.formData)) {
    formData[key] = mockFormData.formData[key]
  }

  // 4. 填充所有可重复组（不要遗漏任何一个！）
  companions.push(...mockFormData.companions)
  children.push(...mockFormData.children)
  ukVisits.push(...mockFormData.ukVisits)
  refusals.push(...mockFormData.refusals)         // ⚠️ 不要漏掉
  otherCountries.push(...mockFormData.otherCountries)  // ⚠️ 不要漏掉

  // 5. 展开所有 accordion 分组（最大化字段可见性）
  nextTick(() => {
    document.querySelectorAll<HTMLElement>('[data-accordion-value] button[data-state="closed"]')
      .forEach((trigger) => trigger.click())
  })
}
```

> **常见陷阱**：新增可重复组时，只更新了 `mockFormData` 数据但忘记在 `fillTestData()` 中添加对应的 `push` 行。结果：条件开关打开了（如 `beenRefused: 'yes'`），但数组为空 → 校验报错"选了是但没数据"。**每新增一个可重复组，必须同时更新 `fillTestData()` 的 push 行**。

### 14.6 验证清单

开发完成后，按以下步骤验证：

1. 清除所有数据（localStorage）
2. 点击"填充测试数据"
3. 检查所有 accordion 分组都已展开
4. 检查所有条件子域都已显示（L3 青色区块全部可见）
5. 检查所有可重复组都有至少 1 条数据
6. 点击"导出 PDF"，检查预览中所有字段都有值
7. 检查校验不报错（所有必填字段已填 + 可重复组非空）

---

## 15. 新表单开发 Checklist

按此顺序开发：

1. 新建 `src/views/{Country}VisaForm.vue`，复制 UKVisaForm.vue 整体骨架
2. 在 `src/router/index.ts` 添加路由
3. 在 `zh-CN.json` 和 `en.json` 中添加完整 i18n 键（含 `backToTop`）
4. 定义 `defaultData` + `formData` reactive 对象（含所有字段）
   - 可重复组使用工厂函数 + reactive 数组
   - 包含 `unemployedReason` 等条件字段
5. 定义选项数组（SelectOption[] / RadioOption[]）
   - 国籍、性别、是/否等共用选项参照规范
6. 实现 `previewSections` computed
   - 必填字段同时加 `required: true` 和 `name`
   - 条件字段用展开运算符按条件包含
   - 动态行用 `flatMap` 遍历 reactive 数组生成
   - `required` 必须与模板中字段的 `required` prop 保持一致
7. 接入 `useApplicantName`（定义姓名提取逻辑，传给 FormActions）
8. 在模板中配置 `<FormActions>` 的 `ref`、props、`@clear` 和 `@export` 回调，并将其包裹在 `.sticky-header-wrapper` 内（不在 `.glass-card` 内）
9. Accordion 元素加 `class="w-full accordion-layer"`（承载 `translateZ(0)` 隔离手风琴动画抖动，不放在 `.glass-card` 上）
9. 实现 `handleExportClick`（见第 10 节），含 sectionMap 映射
10. 替换模板中的字段组件和 label-key
    - 为条件字段添加 `v-if`，条件字段若必填加 `required`
    - 可重复组用 `v-for` + 工厂函数 + 增删按钮
    - **按需提供 `span` 属性覆盖默认值**（见 §5.2）：控件已有默认跨度（DateField=third, TextField=half, SelectField=half, RadioField=full），仅当需要覆盖默认布局时才显式指定
11. 添加回到顶部按钮（见第 13 节）
12. 创建 `src/dev/mockFormData.ts`（见第 14 节）
    - 所有必填字段 + 非必填字段都填值
    - 所有 L3 条件字段设为 `'yes'` 触发条件子域
    - 所有可重复组至少 1 条数据
    - 在 `fillTestData()` 中 push 所有可重复组（不要遗漏）
13. 在 `previewSections` 中为每个字段添加对应的 `span` 属性（与模板中实际生效的 span 值一致，含默认值，供 PDF 预览按 PC 桌面端排版渲染）
14. 为每个 `AccordionItem` 添加 `data-accordion-value` 属性
15. 验证：
    - 留空必填字段 → 点击导出 → 应展开对应手风琴 + 聚焦 + 闪烁
    - 填写所有必填字段 → 导出 PDF → 检查预览内容和分页
    - **验证 PDF 布局与 PC 桌面端页面一致**（不受移动端响应式降级影响）
    - 在移动端（<768px）下检查字段全部单列，无水平溢出
    - **一键填充测试数据 → 所有分组展开 → 所有条件子域可见 → 导出 PDF 无校验报错**（见 §14.6）

---

## 相关文档

- [英国签证表单设计](./uk-visa-form-design.md) — 英国签证模块的具体功能设计、字段结构、条件联动逻辑（可作为新表单的设计参考范例）
- [PDF 导出 & 预览](./pdf-export-preview.md) — `usePdfExport`、`PreviewModal`、`useApplicantName` 接口说明
