# 国际化（i18n）

## 概述

基于 vue-i18n 的双语支持系统，覆盖所有界面文字。

## 核心能力

### 1. 语言切换

- 支持语言：简体中文（zh-CN）、英文（en）
- 通过 `useLanguage` composable 管理
- 语言选择持久化到 localStorage，刷新自动恢复

### 2. i18n 键结构

每个表单必须包含以下键：

```jsonc
{
  "{formKey}": {
    "title": "表单主标题",
    "subtitle": "表单副标题",
    "clearForm": "清除数据",
    "clearConfirm": "清除确认提示",
    "exportPdf": "导出 PDF",
    "exporting": "正在生成...",
    "sections": { /* 分组标题 */ },
    "fields": { /* 字段标签、占位符 */ },
    "options": { /* 下拉、单选选项 */ },
    "messages": { /* 提示消息 */ },
    "errors": { /* 错误消息 */ }
  }
}
```

### 3. 翻译文件

| 文件 | 用途 |
|------|------|
| `src/i18n/zh-CN.json` | 中文翻译 |
| `src/i18n/en.json` | 英文翻译 |
| `src/i18n/index.ts` | vue-i18n 实例配置 |

### 4. 使用方式

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <TextField :label="t('ukVisa.fields.lastName.label')" />
</template>
```

## 约束

- 所有可见文字必须通过 i18n key 引用，禁止硬编码
- 新增字段时必须同时添加中英文翻译
- 日期格式根据语言切换（中文 YYYY年MM月DD日 / 英文 MM/DD/YYYY）
