# 表单引擎（Form Engine）

## 概述

基于模板的签证表单渲染系统。每个签证类型一个 SFC 文件，直接在 template 中内联字段调用，不抽取 JSON schema。

## 核心能力

### 1. 字段组件系统

所有字段组件位于 `src/components/fields/`，基于 shadcn-vue 封装：

| 组件 | 用途 | 关键 props |
|------|------|-----------|
| `TextField` | 文本输入 | modelValue, label, placeholder, constraint?, prefix?, suffix? |
| `NumberField` | 数字输入 | modelValue, label, suffix? |
| `DateField` | 日期选择 | modelValue, label |
| `MonthField` | 年月选择 | modelValue, label |
| `SelectField` | 下拉选择 | modelValue, label, options[] |
| `RadioField` | 单选（卡片式） | modelValue, label, options[] |
| `CheckboxField` | 多选 | modelValue, label, options[] |
| `CountrySelectField` | 国家选择 | modelValue, label, includeRegions? |
| `NationalityField` | 国籍选择 | modelValue, label |
| `PhoneField` | 电话号码 | modelValue, label |

### 2. DNA/DNK 机制

美签特有：`Does Not Apply` / `Do Not Know` 选项，通过 `dnaFields` / `dnkFields` Set 追踪。

```typescript
const dnaFields = ref<Set<string>>(new Set())

function isDna(fieldId: string): boolean {
  return dnaFields.value.has(fieldId)
}
```

### 3. 三层表单结构

```
L1 Section（分组）
  └── L2 Domain（数据域，sub-label 分隔）
        └── L3 Subdomain（条件数据子域，[条件] 触发）
```

- L1 对应 Accordion 分组
- L2 用 `FormSubLabel` 分隔
- L3 用 `v-if` 条件渲染

### 4. 可重复组（Repeatable Groups）

同行人、子女、出入境记录等使用 `v-for` + 索引绑定：

```vue
<TextField v-model="formData.companions[i].lastName" />
<Button @click="addCompanion">+ 添加</Button>
<Button @click="removeCompanion(i)">删除</Button>
```

### 5. 条件联动

字段的显隐由其他字段值控制：

```vue
<DateField v-if="formData.maritalStatus === 'married'"
           v-model="formData.spouseDob" />
```

### 6. 布局系统

- CSS Grid 6 列基础（`grid-cols-6`）
- 字段通过 `span` prop 控制宽度（1-6）
- 响应式：移动端降级为单列

## 文件约定

| 用途 | 路径 |
|------|------|
| 表单页面 | `src/views/{Country}VisaForm.vue` |
| 路由 | `src/router/index.ts` |
| 字段组件 | `src/components/fields/*.vue` |
| 通用表单组件 | `src/components/form/*.vue` |

## 路由注册

```typescript
{
  path: '/{country-visa}',
  name: '{country-visa}',
  component: () => import('@/views/{Country}VisaForm.vue'),
  meta: { titleKey: '{formKey}.title' },
}
```

## 约束

- 不抽取 JSON schema，字段直接在 template 中声明
- `components/ui/` 由 shadcn CLI 生成，不手动编辑
- 新字段组件必须先评估是否可复用已有组件
