# DS-160 非移民签证申请表 — 表单结构设计（v2）

> **数据来源**：CEAC 官网实际页面采集 + `docs/us-visa-ds160/` 12 份子文档详细规格
> **设计依据**：`docs/form-dev-guide.md`（字段组件、span 布局、三层结构、i18n 规范）
> **i18n 前缀**：`usVisa`
> **字段 ID 约定**：`data.xxx`（与源文档一致），v-model 绑定到 `formData.xxx`

---

## 目录

| # | 步骤 | 来源文档 | 字段数 |
|---|------|---------|--------|
| 1 | [Personal 1 — 个人信息（一）](#1-personal-1--个人信息一) | 01 | 12 + 条件 |
| 2 | [Personal 2 — 个人信息（二）](#2-personal-2--个人信息二) | 01 | 7 + 条件 |
| 3 | [Travel — 旅行信息](#3-travel--旅行信息) | 02 | 13 + 条件 |
| 4 | [Travel Companions — 同行人员](#4-travel-companions--同行人员) | 03 | 4 + 条件 + 每人一行 |
| 5 | [Previous U.S. Travel — 以往赴美记录](#5-previous-us-travel--以往赴美记录) | 04 | 6 + 条件 |
| 6 | [Address & Phone — 地址与联系方式](#6-address--phone--地址与联系方式) | 05 | 13 + 条件 |
| 7 | [Passport — 护照信息](#7-passport--护照信息) | 06 | 12 + 条件 |
| 8 | [U.S. Contact — 美国联系人](#8-us-contact--美国联系人) | 07 | 11 |
| 9 | [Family — 家庭信息](#9-family--家庭信息) | 08 | 14 + 条件 |
| 10 | [Present Work/Education — 当前工作/教育](#10-present-workeducation--当前工作教育) | 09 | 12 |
| 11 | [Previous Work/Education — 以往工作/教育](#11-previous-workeducation--以往工作教育) | 10 | 2 + 条件 |
| 12 | [Additional Work/Education — 附加工作/教育](#12-additional-workeducation--附加工作教育) | 11 | 8 + 条件 |
| 13 | [Security and Background — 安全与背景](#13-security-and-background--安全与背景) | 12 | 32 |

---

## 表单总体特征

### 向导式结构

13 个子步骤（与 CEAC 官网页面一一对应），底部 `Back` / `Save` / `Next` 按钮导航。

### 三层数据结构（L1 → L2 → L3）

| 层级 | 概念 | 视觉呈现 |
|------|------|----------|
| **L1 数据板块** | 每个步骤对应一个 Accordion 面板 | `<AccordionItem>` |
| **L2 数据分组** | 板块内始终可见的语义分组 | `<h4 class="sub-label">` + `<div class="fields-grid">` |
| **L3 衍生字段域** | 由 Yes/No 触发的条件子区域 | `<div class="conditional-group">` |

### 字段组件映射

| 数据类型 | 组件 | 默认 span | 说明 |
|---------|------|----------|------|
| 自由文本 | `TextField` | `half` | 按内容长度覆盖 |
| 多行文本 | `TextField` (textarea) | `full` | 说明、描述类 |
| 日期 | `DateField` | `third` | DD+MMM+YYYY 三组件 |
| 下拉选择 | `SelectField` | `third` | 固定选项集合 |
| 国籍/国家 | `NationalityField` | `third` | 所有国籍/国家字段统一 |
| 单选按钮 | `RadioField` | `full` | 问题类独占一行 |
| 性别 | `SelectField` + `genderOptions` | `third` | 标准化 |
| 是/否 | `RadioField` + `yesNoOptions` | `full` | 标准化，所有 yes/no 共用 |
| 复选框 | `CheckboxField` | — | 勾选触发条件/禁用，无 span 占行 |

### span 决策规则

| 内容长度 | span | 典型字段 |
|---------|------|---------|
| 极短（≤4字符） | `third`（1列） | 邮编、日期、电码 |
| 短（≤3字选项） | `third`（1列） | 国籍、性别、关系 |
| 中等 | `half`（2列） | 姓名、电话、公司名 |
| 长 | `full`（整行） | 地址、职责描述、说明 |

### 特殊复选框

- **"Does Not Apply"**：部分字段可勾选标记为不适用（勾选后禁用输入框）
- **"Do Not Know"**：部分字段可勾选标记为不知道（勾选后禁用输入框）

### 可重复条目

采用 `reactive 数组 + v-for` 模式（与 formData 平级声明），详见 `form-dev-guide.md §4.4`。

---

## 1. Personal 1 — 个人信息（一）

> 来源：`01-personal-info.md`
> 页面描述：此页面上的数据必须与护照上的信息完全匹配

### 字段规格

#### L2: 姓名

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 1 | `data.surname` | Surname | 姓 | TextField | third | ✅ | — | placeholder: e.g., FERNANDEZ GARCIA |
| 2 | `data.given_name` | Given Names | 名 | TextField | third | ✅ | — | placeholder: e.g., JUAN MIGUEL；若无名字填 FNU |
| 3 | `data.native_name` | Name in Native Alphabet | 本国文字姓名 | TextField | half | ✅ | — | 非罗马字母文字；配套"不适用"复选框 |
| 3a | `data.native_name_not_applicable` | Not Applicable | 不适用 | Checkbox | — | — | — | 勾选后禁用 native_name |
| 4 | `data.has_other_names` | Have you ever used other names? | 是否使用过其他名称？ | Radio | full | ✅ | — | yesNoOptions |
| 5 | `data.other_surname` | Other Surname Used | 其他姓氏 | TextField | third | ✅ | =yes | — |
| 6 | `data.other_given_name` | Other Given Names Used | 其他名字 | TextField | third | ✅ | =yes | — |

#### L2: 电码

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 7 | `data.has_telecode` | Do you have a telecode? | 是否有代表名字的电码？ | Radio | full | ✅ | — | yesNoOptions |
| 8 | `data.telecode_surname` | Telecode Surnames | 姓电码 | TextField | third | ✅ | =yes | 4位数字 |
| 9 | `data.telecode_given_name` | Telecode Given Names | 名电码 | TextField | third | ✅ | =yes | 4位数字 |

#### 独立字段

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 10 | `data.sex` | Sex | 性别 | Select | third | ✅ | — | genderOptions: M/F |
| 11 | `data.marital_status` | Marital Status | 婚姻状况 | Radio | full | ✅ | — | maritalStatusOptions（8项） |
| 12 | `data.marital_status_explain` | Explain | 婚姻状况说明 | TextField | full | ✅ | =OTHER | textarea |
| 13 | `data.date_of_birth` | Date of Birth | 出生日期 | DateField | third | ✅ | — | — |
| 14 | `data.birth_country` | Country of Birth | 出生国家 | NationalityField | third | ✅ | — | nationalityOptions |
| 15 | `data.birth_state` | State/Province of Birth | 省份/出生州 | TextField | half | — | — | 选填 |
| 16 | `data.birth_city` | City of Birth | 出生城市 | TextField | half | ✅ | — | — |

### 布局草图

```
═══ L2: 姓名 ═══
┌────────────┬────────────┬────────────┬────────────┐
│ surname    │ given_name │ native_name (half)       │
│            │            │ ☐ 不适用                    │
├────────────┴────────────┴────────────┴────────────┤
│ ○ has_other_names                              ▶  │
├────────────┬────────────┬────────────┬────────────┤
│ other_surname        │ other_given_name        │   │  ← L3 =yes
├────────────┴──────────┴──────────────┴────────────┤

═══ L2: 电码 ═══
│ ○ has_telecode                                 ▶  │
├────────────┬────────────┬────────────┬────────────┤
│ telecode_surname│ telecode_given│            │            │  ← L3 =yes
├────────────┴──────────┴──────────────┴────────────┤

═══ 独立字段 ═══
│ ● sex (M / F)                                     │
├───────────────────────────────────────────────────┤
│ ● marital_status (8 options)                      │
├───────────────────────────────────────────────────┤
│ marital_status_explain (textarea)                 │  ← L3 =OTHER
├────────────┬────────────┬────────────┬────────────┤
│ date_of_birth           │ birth_country           │
├─────────────────────────┬─────────────────────────┤
│ birth_state             │ birth_city              │
└────────────┴──────────────────────────────────────┘
```

---

## 2. Personal 2 — 个人信息（二）

> 来源：`01-personal-info.md` 右侧列部分

### 字段规格

#### L2: 国籍

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 1 | `data.nationality` | Country/Region of Origin (Nationality) | 国籍 | NationalityField | third | ✅ | — | nationalityOptions (~210项) |
| 2 | `data.has_other_nationality` | Do you hold any other nationality? | 是否拥有其他国籍？ | Radio | full | ✅ | — | yesNoOptions |
| 3 | `data.other_nationality` | Other Country/Region of Origin | 其他国籍国家 | NationalityField | third | ✅ | =yes | nationalityOptions |
| 4 | `data.has_other_nationality_passport` | Do you hold a passport for that country? | 是否持有该国护照？ | Radio | full | ✅ | =yes | yesNoOptions |
| 5 | `data.other_nationality_passport_no` | Passport Number | 护照号码 | TextField | third | ✅ | =yes(嵌套) | 嵌套条件 |
| 6 | `data.is_permanent_resident` | Are you a permanent resident of another country? | 是否是其他国家永久居民？ | Radio | full | ✅ | — | yesNoOptions |
| 7 | `data.permanent_resident_country` | Country of permanent residence | 永久居民国家 | NationalityField | third | — | =yes | nationalityOptions，非必填 |

#### L2: 证件号码

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 8 | `data.national_id_number` | National ID Number | 身份证号码 | TextField | half | ✅ | — | — |
| 9 | `data.social_security_number` | U.S. Social Security Number | 美国社会安全号码 | TextField | third | ✅ | — | 选填，格式: XXX-XX-XXXX |
| 10 | `data.tax_id_number` | U.S. Taxpayer ID Number | 美国税号 | TextField | half | ✅ | — | — |

### 布局草图

```
═══ L2: 国籍 ═══
┌────────────┬────────────┬────────────┬────────────┐
│ nationality│            │            │            │
├────────────┴────────────┴────────────┴────────────┤
│ ○ has_other_nationality                        ▶  │
├────────────┬────────────┬────────────┬────────────┤
│ other_nationality(third)│            │            │  ← L3 =yes
├────────────┴────────────┴────────────┴────────────┤
│ ○ has_other_nationality_passport               ▶  │  ← L3 =yes (嵌套)
├────────────┬────────────┬────────────┬────────────┤
│ passport_no│            │            │            │  ← L3 嵌套 =yes
├────────────┴────────────┬────────────┴────────────┤
│ ○ is_permanent_resident                     ▶    │
├────────────┬────────────┼────────────┬────────────┤
│ permanent_resident_country          │            │  ← L3 =yes
├────────────┴────────────┴────────────┴────────────┤

═══ L2: 证件号码 ═══
┌────────────┬────────────┬────────────┬────────────┐
│ national_id_number     │ social_security_number   │
├────────────┬────────────┴────────────┴────────────┤
│ tax_id_number            │                        │
└────────────┴────────────┴─────────────────────────┘
```

---

## 3. Travel — 旅行信息

> 来源：`02-travel-info.md`

### 字段规格

#### L2: 旅行目的

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 1 | `data.purpose_of_trip` | Purpose of Trip | 来美目的 | SelectField | third | ✅ | — | purposeOfTripOptions (9项) |
| 2 | `data.visa_category` | Visa Category | 签证类别 | SelectField | third | ✅ | 选择目的后 | visaCategoryOptions（按目的动态变化） |

#### L2: 行程计划

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 3 | `data.arrival_date` | Intended Date of Arrival | 预计抵达日期 | DateField | third | ✅ | — | 不能等于或早于今天 |
| 4 | `data.length_of_stay` | Expected Length of Stay | 预期停留时间 | TextField | third | ✅ | — | 数字，1-100 |
| 5 | `data.length_of_stay_period` | Period | 时间单位 | SelectField | third | ✅ | — | periodOptions: Y/M/W/D/H；**≠H 时显示下方美国地址区域** |
| 6 | `data.us_address.state` | State | 州 | SelectField | third | ✅ | `period ≠ H` | usStateOptions (56项) |
| 7 | `data.us_address.city` | City | 城市 | TextField | third | ✅ | `period ≠ H` | — |
| 8 | `data.us_address.street_addr1` | Street Address | 街道地址 | TextField | half | ✅ | `period ≠ H` | — |
| 9 | `data.us_address.zip_code` | ZIP Code | 邮编 | TextField | third | — | `period ≠ H` | 选填 |

#### L2: 费用支付

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 11 | `data.paying_person_type` | Who Will Pay for Your Trip | 支付方 | SelectField | third | ✅ | — | payerTypeOptions: S/O/C |

**当 =O（他人）时 L3 衍生字段：**

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 12a | `data.paying_person.surname` | Surname | 支付人姓 | TextField | third | ✅ | =O | — |
| 12b | `data.paying_person.given_name` | Given Name | 支付人名 | TextField | third | ✅ | =O | — |
| 12c | `data.paying_person.tel` | Phone Number | 电话号码 | TextField | half | ✅ | =O | 仅数字 |
| 12d | `data.paying_person.email` | Email | 邮箱 | TextField | half | — | =O | 选填 |
| 12e | `data.paying_person.relationship` | Relationship | 与你的关系 | SelectField | third | ✅ | =O | payerRelationOptions (6项) |
| 12f | `data.paying_person.address_same` | Address same as home/mailing? | 地址与家庭/邮寄地址相同？ | Radio | full | ✅ | =O | yesNoOptions |
| 12g | `data.paying_person.address.country` | Country | 国家 | NationalityField | third | ✅ | =O 且 address_same=no | nationalityOptions |
| 12h | `data.paying_person.address.state` | State/Province | 州/省 | TextField | half | ✅ | =O 且 address_same=no | — |
| 12i | `data.paying_person.address.city` | City | 城市 | TextField | half | ✅ | =O 且 address_same=no | — |
| 12j | `data.paying_person.address.street_addr1` | Street Address | 街道地址 | TextField | full | ✅ | =O 且 address_same=no | — |
| 12k | `data.paying_person.address.zip_code` | ZIP Code | 邮编 | TextField | third | ✅ | =O 且 address_same=no | — |

**当 =C（公司/组织）时 L3 衍生字段：**

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 13a | `data.paying_org.name` | Organization Name | 公司名称 | TextField | half | ✅ | =C | — |
| 13b | `data.paying_org.tel` | Phone Number | 电话号码 | TextField | half | ✅ | =C | 仅数字 |
| 13c | `data.paying_org.relationship` | Relationship | 与你的关系 | TextField | half | ✅ | =C | — |
| 13d | `data.paying_org.address.country` | Country | 国家 | NationalityField | third | ✅ | =C | nationalityOptions |
| 13e | `data.paying_org.address.state` | State/Province | 州/省 | TextField | half | ✅ | =C | — |
| 13f | `data.paying_org.address.city` | City | 城市 | TextField | half | ✅ | =C | — |
| 13g | `data.paying_org.address.street_addr1` | Street Address | 街道地址 | TextField | full | ✅ | =C | — |
| 13h | `data.paying_org.address.zip_code` | ZIP Code | 邮编 | TextField | third | ✅ | =C | — |

### 布局草图

```
═══ L2: 旅行目的 ═══
┌────────────┬────────────┬────────────┬────────────┐
│ purpose_of_trip         │ visa_category           │  ← visa_category 选择目的后显示
├────────────┴────────────┴────────────┴────────────┤

═══ L2: 行程计划 ═══
┌────────────┬────────────┬────────────┬────────────┐
│ arrival_date          │ length       │ period     │  ← 3个 third 同行
├────────────┴────────────┴────────────┴────────────┤
│ us_address.state      │ us_address.city       │            │
├───────────────────────┼───────────────────────┼────────────┤
│ us_address.street_addr1 (half)  │ us_address.zip_code      │            │
├───────────────────────┴───────────────────────┴────────────┤

═══ L2: 费用支付 ═══
┌────────────┬────────────┬────────────┬────────────┐
│ paying_person_type      │            │            │
├────────────┴────────────┴────────────┴────────────┤
  ┌─ L3 =O（他人）─────────────────────────────┐
  │ ┌────────────┬────────────┬──────┬──────┐    │
  │ │ surname            │ given_name         │    │
  │ ├────────────┼────────────┼──────┼──────┤    │
  │ │ tel                │ email             │    │
  │ ├────────────┼────────────┼──────┴──────┘    │
  │ │ relationship       │                       │
  │ └────────────────────────────────────────────┘
├─────────────────────────────────────────────────┤
│ ○ address_same (yes/no)           ← L2（青色框外）│
├────────────┬────────────┬────────────┬────────────┤
  ┌─ L3 =O 且 address_same=no ──────────────┐
  │ ┌────────────┬────────────┬──────┬──────┐ │
  │ │ country    │ state      │ city         │ │
  │ ├────────────┴────────────┼──────┼──────┤ │
  │ │ street_addr1            │ zip_code    │ │
  │ └─────────────────────────┴──────┴──────┘ │
  └────────────────────────────────────────────┘
  ┌─ L3 =C（公司/组织）─────────────────────┐
  │ ┌────────────┬────────────┬──────┬──────┐    │
  │ │ org.name             │ org.tel          │    │
  │ ├────────────┼────────────┼──────┼──────┤    │
  │ │ org.relationship     │            │    │
  │ ├────────────┼────────────┼──────┼──────┤    │
  │ │ org.address.country  │ org.address.state     │    │
  │ ├────────────┴────────────┴──────┴──────┤    │
  │ │ org.address.city                      │    │
  │ ├───────────────────────────────────────┤    │
  │ │ org.address.street_addr1 (full)       │    │
  │ ├────────────┬────────────┬──────┬──────┤    │
  │ │ org.address.zip_code   │            │    │
  │ └────────────┴────────────┴──────┴──────┘    │
  └──────────────────────────────────────────────┘
```

---

## 4. Travel Companions — 同行人员

> 来源：`03-travel-companions.md`

### 字段规格

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 1 | `data.has_travel_companions` | Are there other persons traveling with you? | 是否有其他人与您一起旅行？ | Radio | full | ✅ | — | yesNoOptions |

**=yes 时 L3 衍生字段：**

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 2 | `data.is_group_travel` | Traveling as part of a group? | 是否作为团体旅行？ | Radio | full | ✅ | =yes | yesNoOptions |

**is_group_travel=yes 时 L3 衍生字段（与同行人员列表互斥）：**

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 3 | `data.group_name` | Group/Organization Name | 团体名称 | TextField | half | ✅ | =yes(嵌套) | — |

**is_group_travel=no 时 L3 衍生字段（与团体名称互斥）：**

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 4 | `companions[]` | Companion List | 同行人员列表 | 可重复组 | — | — | =no(嵌套) | reactive 数组，一人一行卡片 |
| 4a | `companions[i].surname` | Surname | 姓 | TextField | third | ✅ | =no(嵌套) | — |
| 4b | `companions[i].given_name` | Given Name | 名 | TextField | third | ✅ | =no(嵌套) | — |
| 4c | `companions[i].relationship` | Relationship | 关系 | SelectField | third | ✅ | =no(嵌套) | relationshipOptions (7项) |

> **关系选项 (relationshipOptions)**：`PARENT` 父母 / `SPOUSE` 配偶 / `CHILD` 子女 / `OTHER_RELATIVE` 其他亲属 / `FRIEND` 朋友 / `BUSINESS_ASSOCIATE` 商业伙伴 / `OTHER` 其他

### 布局草图

```
┌────────────┬────────────┬────────────┬────────────┐
│ ○ has_travel_companions                          │
├────────────┴────────────┴────────────┴────────────┤
  ┌─ L3 =yes ──────────────────────────────────┐
  │ ○ is_group_travel                           │
  ├──────────────────────────────────────────────┤
  │  =yes 时（互斥分支 A）:                       │
  │  ┌──────────────┬──────────┬──────┐         │
  │  │ group_name   │          │      │         │
  │  └──────────────┴──────────┴──────┘         │
  │                                              │
  │  =no 时（互斥分支 B）:                        │
  │  提示: 与您一起旅行的人的清单…                  │
  │  ┌─ 同行人 1 ─────────────────────────┐    │
  │  │ ┌────────┬────────┬────────┐  [✕] │    │
  │  │ │surname │given   │relation│       │    │
  │  │ │(third) │(third) │(third) │       │    │
  │  │ └────────┴────────┴────────┘       │    │
  │  └────────────────────────────────────┘    │
  │  ┌─ 同行人 2 ──────────────────────────    │
  │  │ ...（同上结构，每人一行卡片）          │    │
  │  └────────────────────────────────────┘    │
  │  [＋加上另一个]                                │
  └──────────────────────────────────────────────┘
```

---

## 5. Previous U.S. Travel — 以往赴美记录

> 来源：`04-previous-us-travel.md`

### 字段规格

#### 5.1 赴美历史

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 1 | `data.has_been_in_us` | Have you ever been in the U.S.? | 以前去过美国吗？ | Radio | full | ✅ | — | yesNoOptions |

**=yes 时 L3 衍生字段（可重复，最多 5 条）：**

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 2 | `us_visits[]` | US Visit Records | 赴美记录 | 可重复组 | — | — | =yes | max 5 |
| 2a | `us_visits[i].arrival_date` | Date Arrived | 到达日期 | DateField | third | ✅ | — | — |
| 2b | `us_visits[i].length_of_stay` | Length of Stay | 停留时间 | TextField | third | ✅ | — | 数字 |
| 2c | `us_visits[i].stay_period` | Period | 时间单位 | SelectField | third | ✅ | — | stayPeriodOptions (5项) |

#### 5.2 美国驾照

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 3 | `data.has_us_drivers_license` | Do you hold a U.S. Driver's License? | 是否持有美国驾照？ | Radio | full | ✅ | — | yesNoOptions |
| 4 | `data.drivers_license_number` | Driver's License Number | 驾照号码 | TextField | third | ✅ | =yes | — |
| 5 | `data.drivers_license_state` | Driver's License State | 驾照签发州 | SelectField | third | ✅ | =yes | usStateOptions (56项) |

#### 5.3 美国签证历史

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 6 | `data.has_us_visa` | Have you ever been issued a U.S. Visa? | 曾被核发美国签证吗？ | Radio | full | ✅ | — | yesNoOptions |
| 7 | `data.last_visa_date` | Date Last Visa Was Issued | 上次签证签发日期 | DateField | third | ✅ | =yes | — |
| 8 | `data.last_visa_number` | Visa Number | 签证号码 | TextField | third | ✅ | =yes | 8位红色号码 |
| 9 | `data.applying_same_type` | Applying for same type? | 申请同类型签证？ | Radio | full | ✅ | =yes | yesNoOptions |
| 10 | `data.applying_same_country` | Applying in same country? | 在同一国家申请？ | Radio | full | ✅ | =yes | yesNoOptions |
| 11 | `data.has_been_ten_printed` | Have you been ten-printed? | 进行过十指指纹？ | Radio | full | ✅ | =yes | yesNoOptions |
| 12 | `data.visa_lost_or_stolen` | Has visa been lost or stolen? | 签证丢失或被盗？ | Radio | full | ✅ | =yes | yesNoOptions |
| 13 | `data.visa_cancelled` | Has visa been cancelled or revoked? | 签证被取消或撤销？ | Radio | full | ✅ | =yes | yesNoOptions |

#### 5.4 拒签/拒绝入境

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 14 | `data.has_been_refused` | Have you ever been refused a U.S. Visa or admission? | 曾被拒签或拒绝入境？ | Radio | full | ✅ | — | yesNoOptions |
| 15 | `data.refusal_explain` | Explain | 详细说明 | TextField | full | ✅ | =yes | textarea |

#### 5.5 ESTA 拒绝

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 16 | `data.has_esta_refused` | Have you ever been denied travel authorization under ESTA? | 曾被 ESTA 拒绝旅行授权？ | Radio | full | ✅ | — | yesNoOptions |
| 17 | `data.esta_refusal_explain` | Explain | 详细说明 | TextField | full | ✅ | =yes | textarea |

#### 5.6 移民请愿

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 18 | `data.has_immigrant_petition` | Has anyone filed an immigrant petition on your behalf? | 有人代您填写移民请愿书？ | Radio | full | ✅ | — | yesNoOptions |
| 19 | `data.immigrant_petition_explain` | Explain | 详细说明 | TextField | full | ✅ | =yes | textarea |

### 布局草图

```
┌────────────┬────────────┬────────────┬────────────┐
│ ○ has_been_in_us                               ▶ │
├────────────┴────────────┴────────────┴────────────┤
  ┌─ L3 =yes ─ 可重复组 us_visits[i] (max 5) ──┐
  │  ┌────────┬────────┬────────┬────────┐        │
  │  │ arrival_date │ length │ period   │        │  ← 3个 third 同行
  │  └────────┴────────┴────────┴────────┘        │
  │  [＋加上另一个]                                 │
  └──────────────────────────────────────────────┘
┌────────────┬────────────┬────────────┬────────────┐
│ ○ has_us_drivers_license                      ▶  │
├────────────┬────────────┼────────────┬────────────┤
│ license_number│license_state│        │        │  ← L3 =yes
├────────────┴──────────┴──────────────┴────────────┤
│ ○ has_us_visa                                  ▶  │
├────────────┬────────────┼────────────┬────────────┤
│ last_visa_date │last_visa_num│        │        │  ← L3 =yes
├────────────┴────────────┼────────────┴────────────┤
│ ○ applying_same_type                           ▶  │
├────────────┴────────────┴────────────┴────────────┤
│ ○ applying_same_country                        ▶  │
├────────────┴────────────┬────────────┴────────────┤
│ ○ has_been_ten_printed                         ▶ │
├────────────┴────────────┴────────────┴────────────┤
│ ○ visa_lost_or_stolen                          ▶  │
├────────────┴────────────┬────────────┴────────────┤
│ ○ visa_cancelled                               ▶ │
├────────────┴────────────┴────────────┴────────────┤
│ ○ has_been_refused                             ▶  │
├────────────┬────────────┬────────────┬────────────┤
│ refusal_explain (textarea)                   │    │  ← L3 =yes
├────────────┴────────────┴────────────┴────────────┤
│ ○ has_esta_refused                             ▶  │
├────────────┬────────────┬────────────┬────────────┤
│ esta_refusal_explain (textarea)              │    │  ← L3 =yes
├────────────┴────────────┴────────────┴────────────┤
│ ○ has_immigrant_petition                       ▶  │
├────────────┬────────────┬────────────┬────────────┤
│ immigrant_petition_explain (textarea)        │    │  ← L3 =yes
└────────────┴────────────┴────────────┴────────────┘
```

---

## 6. Address & Phone — 地址与联系方式

> 来源：`05-contact-info-social-media.md`

### 字段规格

#### L2: 家庭住址

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 1 | `data.home_addr.country` | Country/Region | 国家/地区 | NationalityField | third | ✅ | — | nationalityOptions (~252项) |
| 2 | `data.home_addr.state` | State/Province | 州/省 | TextField | third | ✅ | — | — |
| 3 | `data.home_addr.city` | City | 城市 | TextField | third | ✅ | — | — |
| 4 | `data.home_addr.street_addr1` | Street Address | 街道地址 | TextField | half | ✅ | — | — |
| 5 | `data.home_addr.zip_code` | Postal Code | 邮编 | TextField | third | ✅ | — | — |

#### L2: 联系电话

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 6 | `data.phone_primary` | Primary Phone Number | 最常用电话号码 | TextField | half | ✅ | — | 仅数字 |
| 7 | `data.phone_secondary` | Secondary Phone Number | 备用电话号码 | TextField | half | — | — | 仅数字，选填 |
| 8 | `data.phone_work` | Work Phone Number | 工作电话号码 | TextField | half | — | — | 仅数字，选填 |

#### L2: 电子邮箱

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 9 | `data.email` | Email Address | 电子邮件 | TextField | third | ✅ | — | email 格式验证 |
| 10 | `data.email_confirm` | Confirm Email | 确认邮件 | TextField | third | ✅ | — | 必须与 email 一致 |

#### L2: 其他联系方式

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 11 | `data.has_other_phones` | Used other phone numbers in last 5 years? | 5年内使用过其他电话号码？ | Radio | full | ✅ | — | yesNoOptions |
| 12 | `other_phones[]` | Additional Phone Numbers | 其他电话号码 | 可重复组 | — | — | =yes | reactive 数组 |
| 12a | `other_phones[i].number` | Phone Number | 电话号码 | TextField | third | ✅ | =yes | 仅数字 |
| 13 | `data.has_other_emails` | Used other email addresses in last 5 years? | 5年内使用过其他邮箱？ | Radio | full | ✅ | — | yesNoOptions |
| 14 | `other_emails[]` | Additional Email Addresses | 其他邮箱 | 可重复组 | — | — | =yes | reactive 数组 |
| 14a | `other_emails[i].email` | Email Address | 邮箱地址 | TextField | half | ✅ | =yes | — |

#### L2: 邮寄地址

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 15 | `data.mailing_different` | Mailing address different from home? | 邮寄地址与家庭住址不同？ | Checkbox | — | — | — | 勾选后显示邮寄地址表单 |

**=yes 时 L3 衍生字段（与家庭住址同结构）：**

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 16 | `data.mailing_addr.country` | Country/Region | 国家/地区 | NationalityField | third | ✅ | =yes | nationalityOptions |
| 17 | `data.mailing_addr.state` | State/Province | 州/省 | TextField | third | ✅ | =yes | — |
| 18 | `data.mailing_addr.city` | City | 城市 | TextField | third | ✅ | =yes | — |
| 19 | `data.mailing_addr.street_addr1` | Street Address | 街道地址 | TextField | half | ✅ | =yes | — |
| 20 | `data.mailing_addr.zip_code` | Postal Code | 邮编 | TextField | third | ✅ | =yes | — |

#### L2: 社交媒体

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 21 | `social_media[]` | Social Media Accounts | 社交媒体账号 | 可重复组 | — | — | — | 始终可见 |
| 21a | `social_media[i].platform` | Platform | 平台 | SelectField | third | ✅ | — | socialMediaOptions (21项) |
| 21b | `social_media[i].username` | Social Media Identifier | 社交媒体标识符 | TextField | half | ✅ | ≠NONE | 平台选"无"时隐藏 |
| 22 | `data.has_other_social_media` | Wish to provide info about other websites? | 是否提供其他网站信息？ | Radio | full | ✅ | — | yesNoOptions |

**=yes 时 L3 衍生字段（可重复）：**

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 23 | `other_social[]` | Other Social Media | 其他社交媒体 | 可重复组 | — | — | =yes | — |
| 23a | `other_social[i].platform` | Platform Name | 平台名称 | TextField | third | ✅ | =yes | — |
| 23b | `other_social[i].username` | Identifier | 标识符 | TextField | half | ✅ | =yes | — |

### 布局草图

```
═══ L2: 家庭住址 ═══
┌────────────┬────────────┬────────────┬────────────┐
│ country    │ state      │ city       │            │
├────────────┴────────────┼────────────┼────────────┤
│ street_addr1 (half)     │ zip_code   │            │
├─────────────────────────┴────────────┴────────────┤

═══ L2: 联系电话 ═══
┌────────────┬────────────┬────────────┬────────────┐
│ phone_primary           │ phone_secondary         │
├────────────┬────────────┼────────────┬────────────┤
│ phone_work │            │            │            │
├────────────┴────────────┴────────────┴────────────┤

═══ L2: 电子邮箱 ═══
┌────────────┬────────────┬────────────┬────────────┐
│ email      │ email_confirm           │            │
├────────────┴────────────┴────────────┴────────────┤

═══ L2: 其他联系方式 ═══
┌────────────┬────────────┬────────────┬────────────┐
│ ○ has_other_phones                             ▶  │
├────────────┴────────────┴────────────┴────────────┤
  ┌─ L3 =yes ─ 可重复组 other_phones[i] ───────┐
  │  ┌────────────┬────────┬────────┬────────┐    │
  │  │ number     │        │        │        │    │
  │  └────────────┴────────┴────────┴────────┘    │
  └──────────────────────────────────────────────┘
┌────────────┬────────────┬────────────┬────────────┐
│ ○ has_other_emails                             ▶  │
├────────────┴────────────┴────────────┴────────────┤
  ┌─ L3 =yes ─ 可重复组 other_emails[i] ───────┐
  │  ┌────────────┬────────┬────────┬────────┐    │
  │  │ email      │        │        │        │    │
  │  └────────────┴────────┴────────┴────────┘    │
  └──────────────────────────────────────────────┘
├────────────┬────────────┬────────────┬────────────┤

═══ L2: 邮寄地址 ═══
┌────────────┬────────────┬────────────┬────────────┐
│ ☐ mailing_different  邮寄地址与家庭住址不同       │
│ =yes 时显示（同家庭住址结构）：                   │
│  country   state      city       │            │
│  street_addr1 (half)  │ zip_code   │            │
└─────────────────────────┴────────────┴────────────┘

═══ L2: 社交媒体 ═══
┌────────────┬────────────┬────────────┬────────────┐
│  可重复组 social_media[i]（始终可见）              │
│  ┌────────────┬───────────┬────────┬────────┐    │
│  │ platform   │ username (half)  │        │        │
│  └────────────┴──────────────────┴────────┘        │
│  [＋加上另一个]                                    │
├────────────┬────────────┬────────────┬────────────┤
│ ○ has_other_social_media                       ▶  │
├────────────┴────────────┴────────────┴────────────┤
  ┌─ L3 =yes ─ 可重复组 other_social[i] ───────┐
  │  ┌───────────┬───────────────┬────────        │
  │  │platform   │ username(half)│               │
  │  └──────────────────────────┘               │
  └──────────────────────────────────────────────┘
```

---

## 7. Passport — 护照信息

> 来源：`06-passport-info.md`

### 字段规格

#### L2: 护照基本信息

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 1 | `data.doc_type` | Passport/Travel Document Type | 护照/旅行证件类型 | SelectField | third | ✅ | — | docTypeOptions (5项) |
| 2 | `data.doc_type_explain` | Explain | 说明 | TextField | full | ✅ | =OTHER | textarea，仅"其他"时 |
| 3 | `data.doc_number` | Passport Number | 护照号码 | TextField | half | ✅ | — | — |
| 4 | `data.book_number` | Passport Book Number | 护照本号 | TextField | third | — | — | 选填 |

#### L2: 签发信息

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 5 | `data.doc_authority` | Country/Authority That Issued Passport | 签发国家/当局 | NationalityField | third | ✅ | — | nationalityOptions (~218项) |
| 6 | `data.issued_location.city` | Issuance City | 签发城市 | TextField | half | ✅ | — | — |
| 7 | `data.issued_location.state` | State/Province | 州/省 | TextField | half | — | — | 选填（如护照上显示） |
| 8 | `data.issued_location.country` | Country/Region | 国家/地区 | NationalityField | third | ✅ | — | nationalityOptions (~253项) |
| 9 | `data.issuance_date` | Issuance Date | 签发日期 | DateField | third | ✅ | — | — |
| 10 | `data.expiration_date` | Expiration Date | 到期日期 | DateField | third | ✅ | — | — |
| 11 | `data.no_expiration` | No Expiration Date | 无到期日期 | Checkbox | — | — | — | 勾选后禁用 expiration_date |

#### L2: 遗失护照

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 12 | `data.has_lost_passport` | Have you lost or had a passport stolen? | 丢过或被偷过护照吗？ | Radio | full | ✅ | — | yesNoOptions |

**=yes 时 L3 衍生字段（可重复）：**

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 13 | `lost_passports[]` | Lost Passports | 遗失护照列表 | 可重复组 | — | — | =yes | — |
| 13a | `lost_passports[i].number` | Passport Number | 护照号码 | TextField | third | ✅ | =yes | 带"不知道"复选框 |
| 13b | `lost_passports[i].country` | Country/Authority | 签发国家 | NationalityField | third | ✅ | =yes | nationalityOptions |
| 13c | `lost_passports[i].explain` | Explain | 说明 | TextField | full | ✅ | =yes | textarea |

### 布局草图

```
═══ L2: 护照基本信息 ═══
┌────────────┬────────────┬────────────┬────────────┐
│ doc_type   │ doc_number │            │            │
├────────────┴────────────┴────────────┴────────────┤
│ doc_type_explain (textarea)                  │    │  ← L3 =OTHER
├────────────┬────────────┬────────────┬────────────┐
│ book_number│            │            │            │
├────────────┴────────────┴────────────┴────────────┤

═══ L2: 签发信息 ═══
┌────────────┬────────────┬────────────┬────────────┐
│ doc_authority           │            │            │
├────────────┬────────────┼────────────┬────────────┤
│ issued_location.city    │ issued_location.state   │
├────────────────────────┼────────────┬────────────
│ issued_location.country │            │            │
├────────────┬────────────┬────────────┬────────────┤
│ issuance_date           │ expiration_date         │
├────────────┴────────────┴────────────┴────────────┤
│ ☐ no_expiration  (勾选后禁用 expiration_date)     │
├───────────────────────────────────────────────────┤

═══ L2: 遗失护照 ═══
┌────────────┬────────────┬────────────┬────────────┐
│ ○ has_lost_passport                            ▶  │
├────────────┴────────────┴────────────┴────────────┤
  ┌─ L3 =yes ─ 可重复组 lost_passports[i] ────┐
  │  ┌────────────┬──────────┬────────┬────────┐  │
  │  │ number (☐ 不知道)     │ country  │        │  │
  │  ├────────────┴──────────┴────────┴────────┤  │
  │  │ explain (textarea)                      │  │
  │  └─────────────────────────────────────────┘  │
  │  [＋加上另一个]                                 │
  └──────────────────────────────────────────────┘
```

---

## 8. U.S. Contact — 美国联系人

> 来源：`07-us-contact-point.md`
> 页面描述：提供美国的联系人或酒店或组织的名称

### 字段规格

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 1 | `data.us_relationship` | Relationship | 与你的关系 | SelectField | third | ✅ | — | usContactRelationOptions (7项) |
| 2 | `data.us_contact.surname` | Surname | 姓 | TextField | third | ✅ | 个人类 | 亲戚/配偶/朋友时显示 |
| 3 | `data.us_contact.given_name` | Given Name | 名 | TextField | third | ✅ | 个人类 | — |
| 4 | `data.us_contact.organization` | Organization Name | 组织名称 | TextField | half | ✅ | 组织类 | 商业伙伴/雇主/学校官员/其他时显示 |
| 5 | `data.us_contact.address.state` | State | 州 | SelectField | third | ✅ | — | usStateOptions (56项) |
| 6 | `data.us_contact.address.city` | City | 城市 | TextField | third | ✅ | — | — |
| 7 | `data.us_contact.address.street_addr1` | Street Address | 街道地址 | TextField | half | ✅ | — | — |
| 8 | `data.us_contact.address.zip_code` | ZIP Code | 邮编 | TextField | third | ✅ | — | — |
| 9 | `data.us_contact.phone` | Phone Number | 电话号码 | TextField | half | ✅ | — | — |
| 10 | `data.us_contact.email` | Email (if known) | 电子邮件 | TextField | half | — | — | 选填 |

### 联系人分类逻辑

7 个关系选项分为 2 类：

| 类别 | 关系选项 | 显示字段 |
|------|---------|---------|
| **个人联系人** | 亲戚、配偶、朋友 | surname + given_name |
| **组织联系人** | 商业伙伴、雇主、学校官员、其他 | organization |

### 布局草图

```
┌────────────┬────────────┬────────────┬────────────┐
│ us_relationship         │            │            │
├────────────┴────────────┴────────────┴────────────┤
│  个人类:                                          │
│  ┌────────────┬──────────┬────────┬────────┐    │
│  │ surname    │ given_name        │        │    │
│  └────────────┴──────────┴────────┴────────┘    │
│  组织类（互斥显示）:                               │
│  ┌────────────┬──────────┬────────┬────────┐    │
│  │ organization          │        │        │    │
│  └───────────────────────┴────────┴────────┘    │
├────────────┬────────────┬────────────┬────────────┤
│ address.state      │ address.city          │            │
├────────────────────┼───────────────────────┼────────────┤
│ address.street_addr1 (half)  │ address.zip_code        │            │
├────────────────────┴───────────────────────┴────────────┤
│ phone      │ email      │            │            │  ← email 选填
└────────────┴────────────┴────────────┴────────────┘
```

---

## 9. Family — 家庭信息

> 来源：`08-family-info.md`

### 字段规格

#### L2: 父亲信息

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 1 | `data.father.surname` | Father's Surname | 父亲的姓 | TextField | third | ✅ | — | 配套"不知道"复选框（默认勾选） |
| 2 | `data.father.given_name` | Father's Given Name | 父亲的名 | TextField | third | ✅ | — | 配套"不知道"复选框（默认勾选） |
| 3 | `data.father.date_of_birth` | Father's Date of Birth | 父亲的生日 | DateField | third | ✅ | 取消勾选时 | 配套"不知道"复选框 |
| 4 | `data.father.in_us` | Is your father in the U.S.? | 父亲在美国吗？ | Radio | full | ✅ | 取消勾选时 | yesNoOptions |
| 5 | `data.father.status` | Father's Status | 父亲身份 | SelectField | third | ✅ | =yes(嵌套) | familyStatusOptions (4项) |

#### L2: 母亲信息

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 6 | `data.mother.surname` | Mother's Surname | 母亲的姓 | TextField | third | ✅ | — | 配套"不知道"复选框（默认勾选） |
| 7 | `data.mother.given_name` | Mother's Given Name | 母亲的名 | TextField | third | ✅ | — | 配套"不知道"复选框（默认勾选） |
| 8 | `data.mother.date_of_birth` | Mother's Date of Birth | 母亲的生日 | DateField | third | ✅ | 取消勾选时 | 配套"不知道"复选框 |
| 9 | `data.mother.in_us` | Is your mother in the U.S.? | 母亲在美国吗？ | Radio | full | ✅ | 取消勾选时 | yesNoOptions |
| 10 | `data.mother.status` | Mother's Status | 母亲身份 | SelectField | third | ✅ | =yes(嵌套) | familyStatusOptions (4项) |

#### L2: 在美直系亲属

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 11 | `data.has_immediate_relatives` | Do you have immediate relatives in the U.S. (not including parents)? | 在美国有直系亲属（除父母外）？ | Radio | full | ✅ | — | yesNoOptions |

**=yes 时 L3 衍生字段（可重复）：**

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 12 | `immediate_relatives[]` | Immediate Relatives | 直系亲属列表 | 可重复组 | — | — | =yes | — |
| 12a | `immediate_relatives[i].surname` | Surname | 姓 | TextField | third | ✅ | =yes | — |
| 12b | `immediate_relatives[i].given_name` | Given Name | 名 | TextField | third | — | =yes | 非必填 |
| 12c | `immediate_relatives[i].relationship` | Relationship | 关系 | SelectField | third | ✅ | =yes | immediateRelationOptions: SPOUSE/FIANCÉ/CHILD/SIBLING |
| 12d | `immediate_relatives[i].status` | Relative's Status | 移民身份 | SelectField | third | ✅ | =yes | familyStatusOptions (4项) |

#### L2: 配偶/伴侣信息（仅 marital_status = MARRIED / CIVIL_UNION 时显示）

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 13 | `data.spouse.surname` | Spouse's Surname | 配偶姓 | TextField | third | ✅ | — | — |
| 14 | `data.spouse.given_name` | Spouse's Given Name | 配偶名 | TextField | third | ✅ | — | — |
| 15 | `data.spouse.date_of_birth` | Spouse's Date of Birth | 配偶生日 | DateField | third | ✅ | — | — |
| 16 | `data.spouse.nationality` | Spouse's Nationality | 配偶国籍 | NationalityField | third | ✅ | — | nationalityOptions |
| 17 | `data.spouse.birth_country` | Spouse's Birth Country | 配偶出生国家 | NationalityField | third | ✅ | — | nationalityOptions |
| 18 | `data.spouse.birth_city` | Spouse's Birth City | 配偶出生城市 | TextField | third | ✅ | — | — |
| 19 | `data.spouse.address_type` | Spouse's Address | 配偶地址 | SelectField | third | ✅ | — | spouseAddressOptions (5项) |
| 20 | `data.spouse.address.country` | Country/Region | 国家 | NationalityField | third | ✅ | =OTHER | nationalityOptions |
| 21 | `data.spouse.address.state` | State/Province | 州/省 | TextField | third | ✅ | =OTHER | — |
| 22 | `data.spouse.address.city` | City | 城市 | TextField | third | ✅ | =OTHER | — |
| 23 | `data.spouse.address.street_addr1` | Street Address | 街道地址 | TextField | half | ✅ | =OTHER | — |
| 24 | `data.spouse.address.zip_code` | Postal Code | 邮编 | TextField | third | ✅ | =OTHER | — |

**spouseAddressOptions:**
- `SAME_HOME` — 与家庭住址相同
- `SAME_MAILING` — 与邮寄地址相同
- `SAME_US_CONTACT` — 与美国联系地址相同
- `UNKNOWN` — 不知道
- `OTHER` — 其他（指定地址）→ 显示完整地址表单

### 布局草图

```
═══ L2: 父亲信息 ═══
┌────────────┬────────────┬────────────┬────────────┐
│ father.    │ father.    │            │            │  ← 各带 ☐ 不知道（默认勾选）
│ surname    │ given_name │            │            │
├────────────┴────────────┴────────────┴────────────┤  ← 取消勾选姓名时显示:
│ father.date_of_birth (☐ 不知道)                   │
├────────────┬────────────┬────────────┬────────────┤
│ ○ father.in_us                                 ▶  │
├────────────┬────────────┼────────────┬────────────┤
│ father.status             │            │          │  ← L3 =yes (嵌套)
├────────────┴────────────┴────────────┴────────────┤

═══ L2: 母亲信息 ═══  （结构同父亲）
┌────────────┬────────────┬────────────┬────────────┐
│ mother.    │ mother.    │            │            │  ← 各带 ☐ 不知道（默认勾选）
│ surname    │ given_name │            │            │
├────────────┴────────────┴────────────┴────────────┤
│ mother.date_of_birth (☐ 不知道)                   │
├────────────┬────────────┬────────────┬────────────┤
│ ○ mother.in_us                                 ▶  │
├────────────┬────────────┼────────────┬────────────┤
│ mother.status             │            │          │  ← L3 =yes (嵌套)
├────────────┴────────────┴────────────┴────────────┤

═══ L2: 在美直系亲属 ═══
┌────────────┬────────────┬────────────┬────────────┐
│ ○ has_immediate_relatives                      ▶  │
├────────────┴────────────┴────────────┴────────────┤
  ┌─ L3 =yes ─ 可重复组 immediate_relatives[i] ┐
  │  ┌────────────┬──────────┬────────┬────────┐  │
  │  │ surname    │ given_name        │        │  │
  │  ├────────────┼──────────┼────────┼────────┤  │
  │  │ relationship      │ status          │  │
  │  └────────────┴──────────┴────────┴────────┘  │
  └──────────────────────────────────────────────┘

═══ L2: 配偶/伴侣信息 ═══  ← 仅 MARRIED / CIVIL_UNION 时显示
┌────────────┬────────────┬────────────┬────────────┐
│ spouse.    │ spouse.    │            │            │
│ surname    │ given_name │            │            │
├────────────┼────────────┼────────────┼────────────┤
│ spouse.    │ spouse.    │            │            │
│ date_of_birth           │ nationality           │
├────────────┬────────────┼────────────┬────────────┤
│ spouse.    │ spouse.    │            │            │
│ birth_country           │ birth_city (half)       │
├────────────┴────────────┴────────────┴────────────┤
│ spouse.address_type                               │  ← 单独一行
├───────────────────────────────────────────────────┤  ← L3 =OTHER:
│ spouse.address.country    │ spouse.address.state  │ spouse.address.city │
├───────────────────────────┼───────────────────────┼────────────────────┤
│ spouse.address.street_addr1 (half)  │ spouse.address.zip_code          │
└───────────────────────────┴─────────────────────────────────────────────┘
```

---

## 10. Present Work/Education — 当前工作/教育

> 来源：`09-current-work-education.md`

### 字段规格

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 1 | `data.occupation` | Primary Occupation | 职业 | SelectField | third | ✅ | — | occupationOptions (22项) |
| 2 | `data.current_employer` | Employer/School Name | 单位名称 | TextField | third | ✅ | — | — |
| 3 | `data.current_address.country` | Country/Region | 国家 | NationalityField | third | ✅ | — | nationalityOptions |
| 4 | `data.current_address.state` | State/Province | 州/省 | TextField | third | ✅ | — | — |
| 5 | `data.current_address.city` | City | 城市 | TextField | third | ✅ | — | — |
| 6 | `data.current_address.street_addr1` | Street Address | 街道地址 | TextField | half | ✅ | — | — |
| 7 | `data.current_address.zip_code` | Postal Code | 邮编 | TextField | third | ✅ | — | — |
| 8 | `data.current_address.tel` | Phone Number | 电话号码 | TextField | third | ✅ | — | 仅数字 |
| 9 | `data.start_date` | Start Date | 开始日期 | DateField | third | ✅ | — | — |
| 10 | `data.monthly_income` | Monthly Income | 月收入 | TextField | third | ✅ | — | 选填，无收入留空；suffix="$" |
| 11 | `data.job_description` | Job Description | 工作职责描述 | TextField | full | ✅ | — | textarea |

### 布局草图

```
┌────────────┬────────────┬────────────┬────────────┐
│ occupation │current_employer│        │            │
├────────────┴────────────┴────────────┴────────────┤  ← spacer 强制换行
│ country    │ state      │ city       │            │
├────────────┴────────────┼────────────┼────────────┤
│ street_addr1 (half)     │ zip_code   │ tel        │
├────────────┬────────────┼────────────┼────────────┤
│ start_date │monthly_incm│            │            │
├────────────┴────────────┴────────────┴────────────┤
│ job_description (textarea, full)                  │
└───────────────────────────────────────────────────┘
```

---

## 11. Previous Work/Education — 以往工作/教育

> 来源：`10-previous-work-education.md`

### 字段规格

#### 11.1 以往工作

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 1 | `data.was_previously_employed` | Were you previously employed? | 以前工作过吗？ | Radio | full | ✅ | — | yesNoOptions |

**=yes 时 L3 衍生字段（可重复）：**

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 2 | `previous_work[]` | Previous Work Records | 以往工作记录 | 可重复组 | — | — | =yes | — |
| 2a | `previous_work[i].employer_name` | Employer Name | 雇主名称 | TextField | half | ✅ | =yes | — |
| 2b | `previous_work[i].address.country` | Country | 国家 | NationalityField | third | ✅ | =yes | nationalityOptions |
| 2c | `previous_work[i].address.state` | State/Province | 州/省 | TextField | third | — | =yes | — |
| 2d | `previous_work[i].address.city` | City | 城市 | TextField | third | ✅ | =yes | — |
| 2e | `previous_work[i].address.street_addr1` | Street Address | 街道地址 | TextField | third | ✅ | =yes | — |
| 2f | `previous_work[i].address.zip_code` | Postal Code | 邮编 | TextField | third | — | =yes | — |
| 2g | `previous_work[i].phone` | Phone Number | 电话号码 | TextField | third | ✅ | =yes | 仅数字 |
| 2h | `previous_work[i].job_title` | Job Title | 职称 | TextField | third | ✅ | =yes | — |
| 2i | `previous_work[i].supervisor_surname` | Supervisor Surname | 主管姓 | TextField | third | — | =yes | 选填 |
| 2j | `previous_work[i].supervisor_given_name` | Supervisor Given Name | 主管名 | TextField | third | — | =yes | 选填 |
| 2k | `previous_work[i].date_from` | Start Date | 入职日期 | DateField | third | ✅ | =yes | — |
| 2l | `previous_work[i].date_to` | End Date | 离职日期 | DateField | third | ✅ | =yes | — |
| 2m | `previous_work[i].job_description` | Job Description | 工作职责 | TextField | full | ✅ | =yes | textarea |

#### 11.2 教育经历

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 3 | `data.has_education` | Have you attended any educational institutions at secondary level or above? | 上过中学或以上教育机构？ | Radio | full | ✅ | — | yesNoOptions |

**=yes 时 L3 衍生字段（可重复）：**

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 4 | `education[]` | Education Records | 教育经历列表 | 可重复组 | — | — | =yes | — |
| 4a | `education[i].name` | Institution Name | 机构名称 | TextField | half | ✅ | =yes | — |
| 4b | `education[i].address.country` | Country | 国家 | NationalityField | third | ✅ | =yes | nationalityOptions |
| 4c | `education[i].address.state` | State/Province | 州/省 | TextField | half | — | =yes | — |
| 4d | `education[i].address.city` | City | 城市 | TextField | half | ✅ | =yes | — |
| 4e | `education[i].address.street_addr1` | Street Address | 街道地址 | TextField | full | ✅ | =yes | — |
| 4f | `education[i].address.zip_code` | Postal Code | 邮编 | TextField | third | — | =yes | — |
| 4g | `education[i].course` | Course of Study | 研究课程 | TextField | half | ✅ | =yes | — |
| 4h | `education[i].date_from` | From Date | 开始日期 | DateField | third | ✅ | =yes | — |
| 4i | `education[i].date_to` | To Date | 结束日期 | DateField | third | ✅ | =yes | — |

### 布局草图

```
┌────────────┬────────────┬────────────┬────────────┐
│ ○ was_previously_employed                      ▶  │
├────────────┴────────────┴────────────┴────────────┤
  ┌─ L3 =yes ─ 可重复组 previous_work[i] ────┐
  │  ┌────────┬────────┬────────┬────────┐      │
  │  │employer_name(half)     │        │      │
  │  ├────────┬────────┼────────┬────────┤      │  ← 换行
  │  │country │state   │city    │addr1   │      │
  │  ├────────┼────────┼────────┼────────┤      │
  │  │zip_code│phone   │job_title│       │      │
  │  ├────────┼────────┼────────┼────────┤      │
  │  │sup.surname│sup.given│      │       │      │
  │  ├────────┬────────┼────────┬────────┤      │
  │  │date_from│date_to │        │        │      │
  │  ├────────┴────────┴────────┴────────┤      │
  │  │ job_description (textarea, full)  │      │
  │  └───────────────────────────────────────┘    │
  └──────────────────────────────────────────────┘
┌────────────┬────────────┬────────────┬────────────┐
│ ○ has_education                              ▶   │
├────────────┴────────────┴────────────┴────────────┤
  ┌─ L3 =yes ─ 可重复组 education[i] ────────┐
  │  ┌────────────┬────────┬────────┬────────┐    │
  │  │ name(half) │        │        │        │    │
  │  ├────────────┴────────┼────────┴────────┤    │  ← 换行
  │  │ address.country     │ address.state   │    │
  │  ├──────────┬──────────┼────────┬────────┤    │
  │  │ address.city        │        │        │    │
  │  ├──────────┴──────────┼─────────────────┤    │
  │  │ address.street_addr1 (full)           │    │
  │  ├──────────┬──────────┼────────┬────────┤    │
  │  │ address.zip_code    │        │        │    │
  │  ├──────────┼──────────┼────────┼────────┤    │
  │  │ course   │          │        │        │    │
  │  ├──────────┼──────────┼────────┼────────┤    │
  │  │ date_from│ date_to  │        │        │    │
  │  └──────────┴──────────┴────────┴────────┘    │
  └──────────────────────────────────────────────┘
```

---

## 12. Additional Work/Education — 附加工作/教育

> 来源：`11-additional-work-education.md`

### 字段规格

#### L2: 语言能力（始终可见）

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 1 | `languages[]` | Languages You Speak | 你会说的语言 | 可重复组 | — | — | — | 始终可见 |
| 1a | `languages[i].name` | Language Name | 语言名称 | TextField | third | ✅ | — | — |

#### 其他问题

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 2 | `data.has_clan` | Do you belong to a clan or tribe? | 属于氏族或部落？ | Radio | full | ✅ | — | yesNoOptions |
| 3 | `data.clan_name` | Clan/Tribe Name | 氏族/部落名称 | TextField | third | ✅ | =yes | — |
| 4 | `data.has_traveled_5yr` | Traveled to any countries in last 5 years? | 过去5年去过其他国家？ | Radio | full | ✅ | — | yesNoOptions |
| 5 | `traveled_countries[]` | Countries Visited | 访问过的国家 | 可重复组 | — | — | =yes | — |
| 5a | `traveled_countries[i].country` | Country | 国家 | NationalityField | third | ✅ | =yes | nationalityOptions |
| 6 | `data.has_organization` | Belonged to any professional/social/charitable organization? | 隶属于专业/社会/慈善组织？ | Radio | full | ✅ | — | yesNoOptions |
| 7 | `organizations[]` | Organizations | 组织列表 | 可重复组 | — | — | =yes | — |
| 7a | `organizations[i].name` | Organization Name | 组织名称 | TextField | third | ✅ | =yes | — |
| 8 | `data.has_military_service` | Have you ever served in the military? | 曾在军中服役？ | Radio | full | ✅ | — | yesNoOptions |

**=yes 时 L3 衍生字段（可重复）：**

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 9 | `military_service[]` | Military Service Records | 军事服役记录 | 可重复组 | — | — | =yes | — |
| 9a | `military_service[i].country` | Country | 国家 | NationalityField | third | ✅ | =yes | nationalityOptions |
| 9b | `military_service[i].branch` | Branch of Service | 军种/部门 | TextField | third | ✅ | =yes | — |
| 9c | `military_service[i].rank` | Rank/Position | 级别/职务 | TextField | third | ✅ | =yes | — |
| 9d | `military_service[i].specialty` | Military Specialty | 军事专业 | TextField | third | ✅ | =yes | — |
| 9e | `military_service[i].date_from` | Date From | 起始日期 | DateField | third | ✅ | =yes | — |
| 9f | `military_service[i].date_to` | Date To | 结束日期 | DateField | third | ✅ | =yes | — |

| # | 字段 ID | 英文名 | 中文名 | 组件 | span | 必填 | 条件 | 备注 |
|---|---------|--------|--------|------|------|------|------|------|
| 10 | `data.has_taliban` | Have you been a member of the Taliban? | 曾是塔利班成员？ | Radio | full | ✅ | — | yesNoOptions |
| 11 | `data.taliban_explain` | Explain | 详细说明 | TextField | full | ✅ | =yes | textarea |
| 12 | `data.has_special_skills` | Do you have specialized skills (firearms, explosives, etc.)? | 有专门技能？ | Radio | full | ✅ | — | yesNoOptions |
| 13 | `data.special_skills_explain` | Explain | 详细说明 | TextField | full | ✅ | =yes | textarea |
| 14 | `data.has_paramilitary` | Served in paramilitary/rebel/insurgent organization? | 参与准军事/叛乱组织？ | Radio | full | ✅ | — | yesNoOptions |
| 15 | `data.paramilitary_explain` | Explain | 详细说明 | TextField | full | ✅ | =yes | textarea |

### 布局草图

```
═══ L2: 语言能力（始终可见）═══
┌────────────┬────────────┬────────────┬────────────┐
│  可重复组 languages[i]:                              │
│  ┌────────────┬────────┬────────┬────────┐        │
│  │ name       │        │        │        │        │
│  └────────────┴────────┴────────┴────────┘        │
│  [＋加上另一个]                                      │
├────────────┬────────────┬────────────┬────────────┤
│ ○ has_clan                                     ▶  │
├────────────┬────────────┼────────────┬────────────┤
│ clan_name  │            │            │            │  ← L3 =yes
├────────────┴────────────┴────────────┴────────────┤
│ ○ has_traveled_5yr                             ▶  │
├────────────┴────────────┴────────────┴────────────┤
  ┌─ L3 =yes ─ 可重复组 traveled_countries[i] ──┐
  │  ┌────────────┬────────┬────────┬────────┐    │
  │  │ country    │        │        │        │    │
  │  └────────────┴────────┴────────┴────────┘    │
  └──────────────────────────────────────────────┘
├────────────┬────────────┬────────────┬────────────┤
│ ○ has_organization                           ▶   │
├────────────┴────────────┴────────────┴────────────┤
  ┌─ L3 =yes ─ 可重复组 organizations[i] ─────┐
  │  ┌────────────┬────────┬────────┬────────┐    │
  │  │ name       │        │        │        │    │
  │  └────────────┴────────┴────────┴────────┘    │
  └──────────────────────────────────────────────┘
├────────────┬────────────┬────────────┬────────────┤
│ ○ has_military_service                         ▶  │
├────────────┴────────────┴────────────┴────────────┤
  ┌─ L3 =yes ─ 可重复组 military_service[i] ────┐
  │  ┌────────┬────────┬────────┬────────┐      │
  │  │country │branch  │rank    │specalty│      │
  │  ├────────┼────────┼────────┼────────┤      │
  │  │date_from      │date_to │        │      │
  │  └───────────────┴────────┴────────┘      │
  └──────────────────────────────────────────────┘
├────────────┬────────────┬────────────┬────────────┤
│ ○ has_taliban                                ▶   │
├────────────┬────────────┼────────────┬────────────┤
│ taliban_explain (textarea)                   │    │  ← L3 =yes
├────────────┴────────────┴────────────┴────────────┤
│ ○ has_special_skills                           ▶  │
├────────────┬────────────┼────────────┬────────────┤
│ special_skills_explain (textarea)            │    │  ← L3 =yes
├────────────┴────────────┴────────────┴────────────┤
│ ○ has_paramilitary                             ▶  │
├────────────┬────────────┼────────────┬────────────┤
│ paramilitary_explain (textarea)              │    │  ← L3 =yes
└────────────┴────────────┴────────────┴────────────┘
```

---

## 13. Security and Background — 安全与背景

> 来源：`12-security-background.md`
> 共 5 个 Part，**32 个** Yes/No 问题
> **所有问题选择 Yes 时均显示一个 textarea "请详细说明"**

### 数据结构

```typescript
const securityAnswers = reactive<Record<number, { answer: string; explain: string }>>({})

// 初始化（首次访问时）
function ensureAnswer(num: number) {
  if (!securityAnswers[num]) {
    securityAnswers[num] = { answer: '', explain: '' }
  }
}
```

### Part 1 — 健康相关（3 题）

| # | 问题 |
|---|------|
| 1 | Do you have a communicable disease of public health significance? |
| 2 | Do you have a mental or physical disorder that poses or is likely to pose a threat to the safety or welfare of yourself or others? |
| 3 | Are you or have you ever been a drug abuser or addict? |

### Part 2 — 犯罪/贩运（7 题）

| # | 问题 |
|---|------|
| 4 | Have you ever been arrested or convicted for any offense or crime, even though subject of a pardon, amnesty, or other similar action? |
| 5 | Have you ever violated, or engaged in a conspiracy to violate, any law relating to controlled substances? |
| 6 | Are you coming to the United States to engage in prostitution or unlawful commercialized vice or have you been engaged in prostitution or procuring prostitutes within the past 10 years? |
| 7 | Have you ever been involved in, or do you seek to engage in, money laundering? |
| 8 | Have you ever committed or conspired to commit a human trafficking offense in the United States or outside the United States? |
| 9 | Have you ever knowingly aided, abetted, assisted or colluded with an individual who has committed, or conspired to commit a severe human trafficking offense in the United States or outside the United States? |
| 10 | Are you the spouse, son, or daughter of an individual who has committed or conspired to commit a human trafficking offense in the United States or outside the United States and have you within the last five years, knowingly benefited from the trafficking activities? |

### Part 3 — 恐怖主义/人权（12 题）

| # | 问题 |
|---|------|
| 11 | Do you seek to engage in espionage, sabotage, export control violations, or any other illegal activity while in the United States? |
| 12 | Do you seek to engage in terrorist activities while in the United States or have you ever engaged in terrorist activities? |
| 13 | Have you ever or do you intend to provide financial assistance or other support to terrorists or terrorist organizations? |
| 14 | Are you a member or representative of a terrorist organization? |
| 15 | Are you the spouse, son, or daughter of an individual who has engaged in terrorist activity, including providing financial assistance or other support to terrorists or terrorist organizations, in the last five years? |
| 16 | Have you ever ordered, incited, committed, assisted, or otherwise participated in genocide? |
| 17 | Have you ever committed, ordered, incited, assisted, or otherwise participated in torture? |
| 18 | Have you committed, ordered, incited, assisted, or otherwise participated in extrajudicial killings, political killings, or other acts of violence? |
| 19 | Have you ever engaged in the recruitment or the use of child soldiers? |
| 20 | Have you, while serving as a government official, been responsible for or directly carried out, at any time, particularly severe violations of religious freedom? |
| 21 | Have you ever been directly involved in the establishment or enforcement of population controls forcing a woman to undergo an abortion against her free choice or a man or a woman to undergo sterilization against his or her free will? |
| 22 | Have you ever been directly involved in the coercive transplantation of human organs or bodily tissue? |

### Part 4 — 移民违规（5 题）

| # | 问题 |
|---|------|
| 23 | Have you ever been removed or deported from any country? |
| 24 | Have you ever sought to obtain or assist others to obtain a visa, entry into the United States, or any other United States immigration benefit by fraud or willful misrepresentation or other unlawful means? |
| 25 | In the past five years, have you failed to attend a removability or inadmissibility hearing? |
| 26 | Have you ever been unlawfully present, remained in the United States beyond the period authorized by the Secretary of Homeland Security, or otherwise violated the terms of your U.S. visa? |
| 27 | Have you ever been expelled or deported from any country? |

### Part 5 — 公民身份/监护权/投票/学生/交流访问者（5 题）

| # | 问题 |
|---|------|
| 28 | Have you ever withheld custody of a U.S. citizen child outside the United States from a person granted legal custody by a U.S. court? |
| 29 | Have you voted in the United States in violation of any law or regulation? |
| 30 | Have you ever renounced United States citizenship for the purposes of avoiding taxation? |
| 31 | Have you entered the United States as a student (F visa) to attend a public elementary school or publicly funded secondary school after November 30, 1996, without reimbursing the school for the costs of your education? |
| 32 | Are you a former exchange visitor (J) who has not fulfilled the two-year foreign residence requirement? |

### 统一交互模式

所有 32 个问题使用**相同的模板结构**：

```vue
<div v-for="num in partQuestions" :key="num" class="fields-grid">
  <RadioField
    :name="`security_q${num}`"
    :label-key="`usVisa.security.q${num}`"
    :options="yesNoOptions"
    v-model="securityAnswers[num].answer"
    required
  />
</div>
<div v-if="securityAnswers[num]?.answer === 'yes'" class="conditional-group">
  <TextField
    :name="`security_q${num}_explain`"
    label-key="usVisa.security.explain.label"
    v-model="securityAnswers[num].explain"
    required
  />
</div>
```

### 布局草图

```
═══ Part 1 — 健康相关 ═══
┌────────────┬────────────┬────────────┬────────────┐
│ ○ q1  传染病？                           yes/no  │
├────────────┬────────────┼────────────┬────────────┤
│ explain (textarea, full)                    │    │  ← L3 =yes
├────────────┴────────────┴────────────┴────────────┤
│ ○ q2  精神/身体障碍？                      yes/no  │
├────────────┬────────────┼────────────┬────────────┤
│ explain (textarea, full)                    │    │  ← L3 =yes
├────────────┴────────────┴────────────┴────────────┤
│ ○ q3  药物滥用？                           yes/no  │
├────────────┬────────────┼────────────┬────────────┤
│ explain (textarea, full)                    │    │  ← L3 =yes
├════════════╪════════════╪════════════╪════════════┤
  Part 2-5 同上结构，共 32 题（3+7+12+5+5）
  Part 之间用 sub-label 分隔
└────────────┴────────────┴────────────┴────────────┘
```

---

## 附录 A — 条件字段汇总

| 步骤 | 触发条件 | 衍生字段 |
|------|---------|---------|
| §1 Personal 1 | native_name 复选框 | 禁用 native_name 输入框 |
| §1 Personal 1 | has_other_names=yes | other_surname, other_given_name |
| §1 Personal 1 | has_telecode=yes | telecode_surname, telecode_given_name |
| §1 Personal 1 | marital_status=OTHER | marital_status_explain |
| §2 Personal 2 | has_other_nationality=yes | other_nationality, has_other_nationality_passport → passport_no |
| §2 Personal 2 | is_permanent_resident=yes | permanent_resident_country |
| §3 Travel | 选择目的后 | visa_category 下拉（动态选项） |
| §3 Travel | `length_of_stay_period ≠ H` | 美国居住地址区域（4字段：州/市/街道/邮编） |
| §3 Travel | paying_person_type=O | 支付人信息（6字段） + address_same → 条件地址表单 |
| §3 Travel | paying_person_type=O 且 address_same=no | 支付人地址（5字段） |
| §3 Travel | paying_person_type=C | 支付组织信息（8字段） |
| §4 Companions | has_travel_companions=yes | is_group_travel → =yes: group_name（互斥） / =no: companions[] |
| §5 Previous Travel | has_been_in_us=yes | 赴美记录列表（max 5） |
| §5 Previous Travel | has_us_drivers_license=yes | 驾照号码 + 州 |
| §5 Previous Travel | has_us_visa=yes | 签证日期 + 号码 + 5 个 yes/no |
| §5 Previous Travel | has_been_refused=yes | 说明 textarea |
| §5 Previous Travel | has_esta_refused=yes | 说明 textarea |
| §5 Previous Travel | has_immigrant_petition=yes | 说明 textarea |
| §6 Address | has_other_phones=yes | 其他电话号码列表 |
| §6 Address | has_other_emails=yes | 其他邮箱列表 |
| §6 Address | ☑ mailing_different | 完整邮寄地址 |
| §6 Address | 平台≠NONE | 社交媒体标识符 |
| §6 Address | has_other_social_media=yes | 其他社交媒体列表 |
| §7 Passport | doc_type=OTHER | 说明 textarea |
| §7 Passport | has_lost_passport=yes | 遗失护照列表（可重复） |
| §8 US Contact | 关系=个人类 | surname + given_name |
| §8 US Contact | 关系=组织类 | organization |
| §9 Family | 取消父亲姓名"不知道" | father.date_of_birth + father.in_us → father.status |
| §9 Family | 取消母亲姓名"不知道" | mother.date_of_birth + mother.in_us → mother.status |
| §9 Family | has_immediate_relatives=yes | 直系亲属列表 |
| §9 Family | marital_status=MARRIED/CIVIL_UNION | 配偶/伴侣完整信息 |
| §9 Family | spouse.address_type=OTHER | 配偶完整地址 |
| §11 Previous Work | was_previously_employed=yes | 工作记录列表 |
| §11 Previous Work | has_education=yes | 教育经历列表 |
| §12 Additional | has_clan=yes | clan_name |
| §12 Additional | has_traveled_5yr=yes | 访问国家列表 |
| §12 Additional | has_organization=yes | 组织名称列表 |
| §12 Additional | has_military_service=yes | 军事服役记录列表 |
| §12 Additional | has_taliban=yes | 说明 textarea |
| §12 Additional | has_special_skills=yes | 说明 textarea |
| §12 Additional | has_paramilitary=yes | 说明 textarea |
| §13 Security | 所有 32 题 =yes | 说明 textarea |

---

## 附录 B — 可重复条目汇总

| 步骤 | 条目描述 | reactive 数组名 | 最大数量 | 字段数/条 |
|------|---------|----------------|---------|----------|
| §4 | 同行人员 | `companions` | 不限 | 3 |
| §5 | 赴美记录 | `us_visits` | 5 | 3 |
| §6 | 其他电话号码 | `other_phones` | 不限 | 1 |
| §6 | 其他邮箱 | `other_emails` | 不限 | 1 |
| §6 | 社交媒体 | `social_media` | 不限 | 2 |
| §6 | 其他社交媒体 | `other_social` | 不限 | 2 |
| §7 | 遗失护照 | `lost_passports` | 不限 | 3 |
| §9 | 直系亲属 | `immediate_relatives` | 不限 | 4 |
| §11 | 以往工作 | `previous_work` | 不限 | 14 |
| §11 | 教育经历 | `education` | 不限 | 10 |
| §12 | 语言 | `languages` | 不限 | 1 |
| §12 | 访问国家 | `traveled_countries` | 不限 | 1 |
| §12 | 组织 | `organizations` | 不限 | 1 |
| §12 | 军事服役 | `military_service` | 不限 | 6 |

---

## 附录 C — 选项清单

### C.1 genderOptions

| value | zh-CN | en |
|-------|-------|-----|
| M | 男 | Male |
| F | 女 | Female |

### C.2 maritalStatusOptions

| value | zh-CN | en |
|-------|-------|-----|
| MARRIED | 已婚 | Married |
| COMMON_LAW | 普通法婚姻 | Common Law Marriage |
| CIVIL_UNION | 民事结合/家庭伴侣 | Civil Union/Domestic Partnership |
| SINGLE | 单身 | Single |
| WIDOWED | 丧偶 | Widowed |
| DIVORCED | 离婚 | Divorced |
| LEGALLY_SEPARATED | 合法分居 | Legally Separated |
| OTHER | 其他 | Other |

### C.3 relationshipOptions (7项)

| value | zh-CN | en |
|-------|-------|-----|
| RELATIVE | 亲戚 | Relative |
| SPOUSE | 配偶 | Spouse |
| FRIEND | 朋友 | Friend |
| BUSINESS_ASSOCIATE | 商业伙伴 | Business Associate |
| EMPLOYER | 雇主 | Employer |
| SCHOOL_OFFICIAL | 学校官员 | School Official |
| OTHER | 其他 | Other |

### C.4 immediateRelationOptions (4项)

| value | zh-CN | en |
|-------|-------|-----|
| SPOUSE | 配偶 | Spouse |
| FIANCE | 未婚夫/妻 | Fiancé/Fiancée |
| CHILD | 子女 | Child |
| SIBLING | 兄弟姐妹 | Sibling |

### C.5 familyStatusOptions (4项)

| value | zh-CN | en |
|-------|-------|-----|
| US_CITIZEN | 美国公民 | U.S. Citizen |
| LPR | 美国合法永久居民 | U.S. Legal Permanent Resident (LPR) |
| NONIMMIGRANT | 非移民 | Nonimmigrant |
| OTHER | 其他/我不知道 | Other/I Don't Know |

### C.6 purposeOfTripOptions (9项)

| value | zh-CN | en |
|-------|-------|-----|
| B | 临时商务访问者 | Temp. Business or Pleasure Visitor (B) |
| C | 过境外国人 | Alien in Transit (C) |
| D | 机组人员 | Crewmember (D) |
| F | 学术或语言学生 | Academic or Language Student (F) |
| H | 临时工人 | Temporary Worker (H) |
| I | 外国媒体代表 | Foreign Media Representative (I) |
| J | 交流访问学者 | Exchange Visitor (J) |
| L | 跨国公司内部调动人员 | Intracompany Transferee (L) |
| M | 职业/非学术学生 | Vocational/Nonacademic Student (M) |

### C.7 periodOptions (5项)

| value | zh-CN | en |
|-------|-------|-----|
| Y | 年 | Years |
| M | 月 | Months |
| W | 周 | Weeks |
| D | 天 | Days |
| H | 少于24小时 | Less Than 24 Hours |

### C.8 stayPeriodOptions (5项)

| value | zh-CN | en |
|-------|-------|-----|
| Y | 年 | Years |
| M | 月 | Months |
| W | 周 | Weeks |
| D | 天 | Days |
| LT24H | 少于24小时 | Less Than 24 Hours |

### C.9 payerTypeOptions (3项)

| value | zh-CN | en |
|-------|-------|-----|
| S | 本人 | Self |
| O | 他人 | Other Person |
| C | 其他公司/组织 | Other Company/Organization |

### C.10 payerRelationOptions (6项)

| value | zh-CN | en |
|-------|-------|-----|
| C | 子女 | Child |
| P | 父母 | Parent |
| S | 配偶 | Spouse |
| R | 其他亲属 | Other Relative |
| F | 朋友 | Friend |
| O | 其他 | Other |

### C.11 docTypeOptions (5项)

| value | zh-CN | en |
|-------|-------|-----|
| REGULAR | 普通 | Regular |
| OFFICIAL | 公务 | Official |
| DIPLOMATIC | 外交 | Diplomatic |
| LAISSEZ_PASSER | 来往通行证 | Laissez-Passer |
| OTHER | 其他 | Other |

### C.12 occupationOptions (22项)

| value | zh-CN | en |
|-------|-------|-----|
| AGRICULTURE | 农业 | Agriculture |
| ARTIST | 艺术家/表演者 | Artist/Performer |
| BUSINESS | 商业 | Business |
| COMMUNICATIONS | 传媒 | Communications |
| COMPUTER_SCIENCE | 计算机科学 | Computer Science |
| CULINARY | 烹饪/餐饮服务 | Culinary/Food Service |
| EDUCATION | 教育 | Education |
| ENGINEERING | 工程 | Engineering |
| GOVERNMENT | 政府 | Government |
| HOMEMAKER | 家庭主妇/夫 | Homemaker |
| LAW | 法律职业 | Law |
| MEDICAL | 医疗/保健 | Medical/Health |
| MILITARY | 军事 | Military |
| NATURAL_SCIENCE | 自然科学 | Natural Sciences |
| NOT_EMPLOYED | 失业 | Not Employed |
| PHYSICAL_SCIENCE | 物理科学 | Physical Sciences |
| RELIGIOUS | 宗教职业 | Religious Vocation |
| RESEARCH | 研究 | Research |
| RETIRED | 退休 | Retired |
| SOCIAL_SCIENCE | 社会科学 | Social Sciences |
| STUDENT | 学生 | Student |
| OTHER | 其他 | Other |

### C.13 socialMediaOptions (21项)

| value | zh-CN |
|-------|-------|
| ASK_FM | ASK.FM |
| DOUBAN | 豆瓣 |
| FACEBOOK | 脸书 (Facebook) |
| FLICKR | Flickr |
| GOOGLE_PLUS | 谷歌+ (Google Plus) |
| INSTAGRAM | Instagram |
| LINKEDIN | 领英 (LinkedIn) |
| MYSPACE | Myspace |
| PINTEREST | Pinterest |
| QZONE | QQ空间 (QQ) |
| REDDIT | Reddit |
| SINA_WEIBO | 新浪微博 |
| TENCENT_WEIBO | 腾讯微博 |
| TUMBLR | Tumblr |
| TWITTER | 推特 (Twitter) |
| TWOO | TWOO |
| VINE | VINE |
| VKONTAKTE | VKONTAKTE (VK) |
| YOUKU | 优酷 |
| YOUTUBE | YOUTUBE |
| NONE | 无 |

### C.14 spouseAddressOptions (5项)

| value | zh-CN | en |
|-------|-------|-----|
| SAME_HOME | 与家庭住址相同 | Same as Home Address |
| SAME_MAILING | 与邮寄地址相同 | Same as Mailing Address |
| SAME_US_CONTACT | 与美国联系地址相同 | Same as U.S. Contact Address |
| UNKNOWN | 不知道 | Don't Know |
| OTHER | 其他（指定地址） | Other (Specify Address) |

### C.15 usStateOptions (56项)

ALABAMA, ALASKA, AMERICAN SAMOA, ARIZONA, ARKANSAS, CALIFORNIA, COLORADO, CONNECTICUT, DELAWARE, DISTRICT OF COLUMBIA, FLORIDA, GEORGIA, GUAM, HAWAII, IDAHO, ILLINOIS, INDIANA, IOWA, KANSAS, KENTUCKY, LOUISIANA, MAINE, MARYLAND, MASSACHUSETTS, MICHIGAN, MINNESOTA, MISSISSIPPI, MISSOURI, MONTANA, NEBRASKA, NEVADA, NEW HAMPSHIRE, NEW JERSEY, NEW MEXICO, NEW YORK, NORTH CAROLINA, NORTH DAKOTA, NORTHERN MARIANA ISLANDS, OHIO, OKLAHOMA, OREGON, PENNSYLVANIA, PUERTO RICO, RHODE ISLAND, SOUTH CAROLINA, SOUTH DAKOTA, TENNESSEE, TEXAS, UTAH, VERMONT, VIRGIN ISLANDS, VIRGINIA, WASHINGTON, WEST VIRGINIA, WISCONSIN, WYOMING

### C.16 nationalityOptions (~210-280项)

完整国家列表参见 `docs/us-visa-ds160/` 源文档。表单中存在多个略有差异的版本：
- **主国籍列表**（~210项）：用于出生国家、签发国家
- **扩展国籍列表**（~212项）：含 PALESTINIAN AUTHORITY、UNITED STATES OF AMERICA
- **地址列表**（~252项）：含更多领地（ARUBA、GREENLAND 等）
- **军事服役列表**（~210项）：不含美国领地

实现时建议统一使用一份全量列表，按字段需求过滤。

---

## 附录 D — i18n 键结构概览

```jsonc
{
  "usVisa": {
    // 必须
    "title": "美国签证 DS-160",
    "subtitle": "非移民签证申请表",
    "clearForm": "清除数据",
    "clearConfirm": "确定要清除所有已填写的数据吗？此操作无法撤销。",
    "exportPdf": "导出 PDF",
    "exporting": "正在生成...",
    "addRow": "加上另一个",
    "removeRow": "删除",
    "backToTop": "回到顶部",

    // 13 个步骤标题
    "sections": {
      "personal1": "个人信息（一）",
      "personal2": "个人信息（二）",
      "travel": "旅行信息",
      "companions": "同行人员",
      "previousTravel": "以往赴美记录",
      "addressPhone": "地址与联系方式",
      "passport": "护照信息",
      "usContact": "美国联系人",
      "family": "家庭信息",
      "presentWork": "当前工作/教育/培训",
      "previousWork": "以往工作/教育/培训",
      "additionalWork": "附加工作/教育/培训",
      "security": "安全与背景"
    },

    // L2 数据分组标题
    "subLabels": {
      "name": "姓名",
      "nativeName": "本国文字姓名",
      "telecode": "电码",
      "nationality": "国籍",
      "idNumbers": "证件号码",
      "travelPurpose": "旅行目的",
      "travelPlan": "行程计划",
      "payer": "费用支付",
      "companionList": "同行人员",
      "usVisits": "赴美记录",
      "usDriversLicense": "美国驾照",
      "usVisaHistory": "美国签证历史",
      "homeAddress": "家庭住址",
      "phone": "联系电话",
      "emailSection": "电子邮箱",
      "otherContact": "其他联系方式",
      "mailingAddress": "邮寄地址",
      "socialMedia": "社交媒体",
      "passportBasic": "护照基本信息",
      "issuanceInfo": "签发信息",
      "passportDates": "日期",
      "lostPassport": "遗失护照",
      "father": "父亲信息",
      "mother": "母亲信息",
      "immediateRelatives": "在美直系亲属",
      "otherRelatives": "在美其他亲戚",
      "spouse": "配偶/伴侣信息",
      "languageList": "语言能力",
      "militaryService": "军事服役",
      "previousWorkRecords": "以往工作记录",
      "educationRecords": "教育经历",
      "part1": "Part 1 — 健康相关",
      "part2": "Part 2 — 犯罪/贩运",
      "part3": "Part 3 — 恐怖主义/人权",
      "part4": "Part 4 — 移民违规",
      "part5": "Part 5 — 公民身份/监护权/投票/学生/交流访问者"
    },

    // 字段标签和占位符（示例，完整键需覆盖所有字段）
    "fields": {
      "surname": { "label": "姓", "placeholder": "如: FERNANDEZ GARCIA" },
      "givenName": { "label": "名", "placeholder": "如: JUAN MIGUEL" },
      "nativeName": { "label": "本国文字姓名", "placeholder": "非罗马字母文字" },
      // ... 所有字段的 label 和 placeholder
    },

    // 选项文本
    "options": {
      "nationality": { "CN": "中国", "US": "美国", ... },
      "sex": { "M": "男", "F": "女" },
      "maritalStatus": { "MARRIED": "已婚", ... },
      "yesNo": { "yes": "有", "no": "没有" },
      // ... 所有选项组
    },

    // 可重复组子标签
    "subLabelsRepeat": {
      "companion": "同行人",
      "usVisit": "第{N}次访问",
      "previousWork": "第{N}份工作",
      "education": "第{N}段教育",
      "relative": "第{N}位亲属",
      "military": "第{N}段服役",
      "lostPassport": "第{N}本遗失护照"
    },

    // 安全背景 32 题
    "security": {
      "q1": "你是否患有具有公共卫生意义的传染病？",
      "q2": "你是否有对你或他人的安全或福利构成威胁的精神或身体障碍？",
      // ... q3-q32
      "explain": { "label": "请详细说明" }
    }
  }
}
```

---

## 附录 E — 与 v1 的主要变更

| 变更项 | v1 (旧) | v2 (新) |
|--------|---------|---------|
| 步骤数 | 11 | 13（与 CEAC 页面一一对应） |
| 字段类型 | 仅 text/combobox/radio | TextField/DateField/SelectField/RadioField 精确映射 |
| span 布局 | 未指定 | 按内容长度明确指定 full/half/third |
| 三层结构 | 未体现 | L1(Accordion) → L2(sub-label) → L3(conditional-group) 完整定义 |
| 可重复条目 | 仅提及 | 明确 reactive 数组名 + v-for 模式 |
| 条件字段 | 简单描述 | 完整条件链（含嵌套条件），含 L3 衍生域 |
| i18n | 未涉及 | 完整的键结构概览 + 选项文本定义 |
| 数据字段 ID | 未指定 | 统一 `data.xxx` 命名 |
| 本国文字姓名 | 有 | 保留，补充"不适用"复选框（Not Applicable） |
| ESTA 拒绝 | 无 | 新增（源文档 04 包含） |
| 配偶信息 | 无 | 新增完整配偶板块（源文档 08 包含） |
| 塔利班问题 | 无 | 新增（源文档 11 包含） |
| 婚姻"其他" | 无衍生字段 | 新增 explain textarea（源文档 01 包含） |
| "不知道"复选框 | 未指定 | 明确父母姓名字段默认勾选"不知道" |
| 支付方 | 6 个选项 | 3 个选项（Self/Other Person/Company），源文档 02 实际值 |
| 支付人地址 | 无 | 新增 address_same 单选 + 条件地址表单（源文档 02 包含） |
| 安全背景问题数 | 未明确 | 32 题（5 Part：3+7+12+5+5），与源文档 12 完全一致 |
| 停留时间单位 | 4项 | 5项（增加"少于24小时"），与源文档 02 一致 |
