# 美国签证 DS-160 表单（US Visa）

## 概述

美国非移民签证申请表（DS-160），13 步向导模式，约 200+ 字段，含 DNA/DNK 功能。

## 基本信息

| 属性 | 值 |
|------|-----|
| 文件 | `src/views/USVisaForm.vue` |
| 路由 | `/us-visa` |
| i18n 键前缀 | `usVisa` |
| 步骤数 | 13 |
| 字段数 | ~200+ |

## 步骤结构（13 步）

| 步骤 | 名称 | 内容 |
|------|------|------|
| 1 | Personal Info 1 | 姓名、生日、性别 |
| 2 | Personal Info 2 | 出生地、国籍、身份证 |
| 3 | Travel | 旅行目的、到达日期、停留时间 |
| 4 | Travel Companions | 同行人信息（v-for） |
| 5 | Previous US Travel | 之前的美国旅行历史 |
| 6 | Address & Phone | 美国地址、电话号码 |
| 7 | Passport | 护照信息 |
| 8 | US Contact | 美国联系人 |
| 9 | Family | 家庭成员（父母、配偶、子女） |
| 10 | Present Work | 当前工作/教育 |
| 11 | Previous Work | 过去工作（条件显示） |
| 12 | Additional Work | 额外工作（条件显示） |
| 13 | Security Background | 27 题安全审查问题 |

## DNA/DNK 机制

美签特有功能：

- **DNA (Does Not Apply)**: 字段不适用时选择
- **DNK (Do Not Know)**: 不知道答案时选择

```typescript
const dnaFields = ref<Set<string>>(new Set())
const dnkFields = ref<Set<string>>(new Set())

// 标记为 DNA 后，字段值清空并显示为 disabled
function toggleDna(fieldId: string) {
  if (dnaFields.value.has(fieldId)) {
    dnaFields.value.delete(fieldId)
  } else {
    dnaFields.value.add(fieldId)
    formData[fieldId] = ''
  }
}
```

## 关键条件联动

| 触发条件 | 显示字段/步骤 |
|----------|---------------|
| `hasPreviousUSTravel = yes` |  Previous US Travel 步骤详细字段 |
| `isFullTimeStudent = yes` | 教育信息字段 |
| `hasJob = yes` | Present Work 步骤 |
| `hasPreviousJob = yes` | Previous Work 步骤（11） |
| 步骤 10-12 特定条件 | Additional Work 步骤（12） |

## 向导交互

- 步骤导航条显示当前进度
- 可点击已完成步骤回退修改
- 每步独立验证，完成后才能进入下一步
- "下一步" / "上一步" 按钮

## 布局特点

- 分步向导模式（非单页长表单）
- 每步一个 Accordion 或单页
- 响应式适配移动端

## 国家列表

使用 US 签证专用国家列表（与英签不同），位于 `src/data/usCountries.ts`。
