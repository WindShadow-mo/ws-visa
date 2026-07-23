# 英国签证表单（UK Visa）

## 概述

英国签证（Standard Visitor Visa）信息收集表，14 个 Accordion 分组，约 180 个字段。

## 基本信息

| 属性 | 值 |
|------|-----|
| 文件 | `src/views/UKVisaForm.vue` |
| 路由 | `/uk-visa` |
| i18n 键前缀 | `ukVisa` |
| 分组数 | 14 |
| 字段数 | ~180 |

## 分组结构（14 个）

| 序号 | value | 分组名 |
|------|-------|--------|
| 1 | `personal-info` | 基本信息 |
| 2 | `passport-info` | 护照与证件 |
| 3 | `address-info` | 居住地址 |
| 4 | `marriage-info` | 婚姻与配偶 |
| 5 | `parent-info` | 父母信息 |
| 6 | `children-info` | 子女信息（v-for） |
| 7 | `travel-plan` | 旅行计划 |
| 8 | `companions` | 同行人信息（v-for） |
| 9 | `employment-info` | 工作与收入 |
| 10 | `financial-info` | 财务信息 |
| 11 | `uk-contacts` | 英国联系人与住宿 |
| 12 | `visa-history` | 签证与旅行历史（含 v-for 子分组） |
| 13 | `security-background` | 安全与背景 |

## 关键条件联动

| 触发条件 | 显示字段 |
|----------|----------|
| `hasOtherPassport = yes` | 其他护照详情 |
| `housingStatus = tenant` | 房东姓名 |
| `maritalStatus = married` | 配偶信息组 |
| `employmentStatus = employed/self-employed` | 雇主/公司信息 |
| `hasFinancialSponsor = yes` | 经济担保人信息 |

## 可重复组

- 子女信息（children）
- 同行人（companions）
- 过去 10 年出入境记录（travel history）
- 过去 10 年签证/拒签记录（visa refusals）

## 布局特点

- 双列布局（短文本字段并排）
- CSS Grid 6 列基础
- 移动端降级为单列
