# 第10节：以前的工作/教育/培训信息 (Previous Work/Education/Training)

## 页面标题
以前的工作/教育/培训信息

---

## 字段列表

### 1. 你以前工作过吗？
- **字段类型**: 单选按钮组 (radio group)
- **必填**: 是 (标记 *)
- **布局**: 第1个字段
- **选项值**:
  - `true` - 有
  - `false` - 没有
- **衍生字段**: 当选择"有"(true)时，显示以下字段（可添加多条工作记录）：

| 字段ID | 类型 | 标签 | 必填 |
|--------|------|------|------|
| `data.previous_work[0].employer_name` | text | 以前的雇主名称 | 是 |
| `data.previous_work[0].address.country` | select | 国家 | 是 |
| `data.previous_work[0].address.state` | text | 州/省/地区 | 否 |
| `data.previous_work[0].address.city` | text | 市 | 是 |
| `data.previous_work[0].address.street_addr1` | text | 街道地址 | 是 |
| `data.previous_work[0].address.zip_code` | text | 邮编 | 否 |
| `data.previous_work[0].phone_number` | text | 电话号码 | 是 |
| `data.previous_work[0].job_title` | text | 职称 | 是 |
| `data.previous_work[0].supervisor_surname` | text | 主管的姓 | 否 |
| `data.previous_work[0].supervisor_given_name` | text | 主管的名 | 否 |
| `data.previous_work[0].date_from_v2.DD` | select | 入职日期（日） | 是 |
| `data.previous_work[0].date_from_v2.MMM` | select | 入职日期（月） | 是 |
| `data.previous_work[0].date_from_v2.YYYY` | text | 入职日期（年） | 是 |
| `data.previous_work[0].date_to_v2.DD` | select | 离职日期（日） | 是 |
| `data.previous_work[0].date_to_v2.MMM` | select | 离职日期（月） | 是 |
| `data.previous_work[0].date_to_v2.YYYY` | text | 离职日期（年） | 是 |
| `data.previous_work[0].job_description` | textarea | 工作职责描述 | 是 |

### 2. 您是否曾上过中学或以上的任何教育机构？
- **字段类型**: 单选按钮组 (radio group)
- **必填**: 是 (标记 *)
- **布局**: 第2个字段
- **选项值**:
  - `true` - 有
  - `false` - 没有
- **衍生字段**: 当选择"有"(true)时，显示以下字段：

| 字段ID | 类型 | 标签 | 必填 |
|--------|------|------|------|
| `data.education.name` | text | 机构名称 | 是 |
| `data.education.address.country` | select | 国家 | 是 |
| `data.education.address.state` | text | 州/省/地区 | 否 |
| `data.education.address.city` | text | 市 | 是 |
| `data.education.address.street_addr1` | text | 街道地址 | 是 |
| `data.education.address.zip_code` | text | 邮编 | 否 |
| `data.education.course` | text | 研究课程 | 是 |
| `data.education.date_from_v2.DD` | select | 起始日期（日） | 是 |
| `data.education.date_from_v2.MMM` | select | 起始日期（月） | 是 |
| `data.education.date_from_v2.YYYY` | text | 起始日期（年） | 是 |
| `data.education.date_to_v2.DD` | select | 结束日期（日） | 是 |
| `data.education.date_to_v2.MMM` | select | 结束日期（月） | 是 |
| `data.education.date_to_v2.YYYY` | text | 结束日期（年） | 是 |

---

## 字段交互逻辑

### 条件字段显示规则

1. **以前工作经历**:
   - 触发条件: "你以前工作过吗" 选择 "有"(true)
   - 衍生字段: 完整的工作经历表单（18个字段），支持添加多条记录
   - 包含: 雇主名称、地址、电话、职称、主管姓名、入离职日期、工作描述

2. **教育经历**:
   - 触发条件: "您是否曾上过中学或以上的任何教育机构" 选择 "有"(true)
   - 衍生字段: 完整的教育经历表单（14个字段）
   - 包含: 机构名称、地址、研究课程、起止日期

---

## 技术细节

- 全部为单选按钮组（有/没有）
- 条件字段在选择"有"时动态显示
- 工作经历支持添加多条记录（数组结构 `data.previous_work[N]`）
- 表单验证在点击"下一个"时触发

---

## 导航按钮

- **上一个**: 返回"当前工作/教育/培训信息"页
- **下一个**: 提交当前页并进入下一页（附加工作/教育/培训信息）
- **保存并稍后继续**: 保存当前填写内容
