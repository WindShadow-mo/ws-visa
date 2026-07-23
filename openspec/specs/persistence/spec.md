# 数据持久化（Persistence）

## 概述

基于 localStorage 的表单数据自动保存系统，防止用户填写内容丢失。

## 核心能力

### 1. 自动保存

- 每次数据变更自动写入 localStorage
- 存储 key 按签证类型区分（如 `ukVisaFormData`、`usVisaFormData`）
- 无需用户手动操作

### 2. 数据恢复

- 页面加载时自动从 localStorage 读取已保存数据
- 刷新页面或关闭浏览器后数据不丢失

### 3. 数据清除

- 用户可一键清除所有已保存数据
- 清除前弹出二次确认对话框
- 确认后数据完全清除

### 4. Schema 版本控制

- 存储时包含 `schemaVersion` 字段
- 版本不匹配时自动清除旧数据，防止结构变更导致的问题

## 实现

```typescript
// composable: useFormPersistence
const STORAGE_KEY = 'ukVisaFormData'

function save(formData: object) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    schemaVersion: 2,
    data: formData,
  }))
}

function load(): object | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null
  const parsed = JSON.parse(stored)
  if (parsed.schemaVersion !== CURRENT_VERSION) {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
  return parsed.data
}

function clear() {
  localStorage.removeItem(STORAGE_KEY)
}
```

## 约束

- 仅使用 localStorage，不引入 IndexedDB
- 单个签证类型的数据量控制在 5MB 以内
