# 英国签证表单 — 模块设计文档

> 文件：`src/views/UKVisaForm.vue`
> 路由：`/uk-visa`
> i18n 键前缀：`ukVisa`
> 本文档描述英国签证信息收集表的功能设计、字段结构和关键交互逻辑，作为后续迭代的参考依据。

---

## 1. 模块定位

英国签证表单是 ws-visa 应用的首个签证表单模块，用于采集英国签证所需的申请人补充信息。

填写完成后，用户可预览全部数据并导出为带分页的 PDF 文件。表单数据自动保存在浏览器 localStorage 中，刷新页面不丢失。

---

## 2. 分组设计（13 个 Accordion 分组）

### 2.1 排序原则

分组顺序按 **UX 重要性**排列，遵循"身份 → 家庭 → 旅行 → 财力 → 历史 → 安全"的认知逻辑：

| 序号 | value | 分组名 | 设计考量 |
|------|-------|--------|----------|
| 1 | `personal-info` | 基本信息 | 用户最先填写自己的姓名、生日、联系方式，建立填写信心 |
| 2 | `passport-info` | 护照与证件 | 紧跟身份信息，护照号、国籍等是签证申请的核心 |
| 3 | `address-info` | 居住地址 | 身份信息的自然延伸 |
| 4 | `marriage-info` | 婚姻与配偶 | 家庭信息的起点 |
| 5 | `parent-info` | 父母信息 | 家庭信息延续，含父亲/母亲两个子分组 |
| 6 | `children-info` | 子女信息 | 家庭信息收尾，动态行结构 |
| 7 | `travel-plan` | 旅行计划 | 从家庭过渡到此次旅行的目的和安排 |
| 8 | `companions` | 同行人信息 | 与旅行计划直接相关，动态行结构 |
| 9 | `employment-info` | 工作与收入 | 财力证明的起点 |
| 10 | `financial-info` | 财务信息 | 预期花费、经济担保人 |
| 11 | `uk-contacts` | 英国联系人与住宿 | 英国方面的具体安排 |
| 12 | `visa-history` | 签证与旅行历史 | 历史记录，含多个动态行子分组 |
| 13 | `security-background` | 安全与背景 | 最敏感的问题放在最后，降低用户中途放弃的概率 |

### 2.2 默认展开

只默认展开第 1 个分组（`personal-info`），其余折叠，避免页面过长造成认知负担。

### 2.3 三层结构

> 三层结构的通用定义见 [签证表单开发规范 §4.5](./form-dev-guide.md#45-三层表单结构分组--数据域--数据子域)。本节仅列出英国签证表单的具体结构清单。

#### 完整结构清单

> 格式：`L1 Section` → `L2 数据域` → `L3 条件数据子域`
> `[条件]` 表示触发该子域的前置条件；`v-for` 表示可重复动态行。

**1. 基本信息 `personal-info`**

```
L2 个人信息（无 sub-label，独立 fields-grid）
  ├── lastName / firstName / formerName  ← 同行（各 third）
  ├── dateOfBirth / phone / email        ← 同行（各 third）
  └── gender                             ← 独占一行（full）
```

**2. 证件与护照 `passport-info`**

```
L2 身份证 [sub-label: idCard]
  ├── nationality / idCardNumber / idCardAuthority  ← 同行（各 third）
  └── idCardExpiry                                   ← 独占一行（third）
L2 护照 [sub-label: passport]
  ├── issuingAuthority / passportNumber / passportIssueDate  ← 同行（各 third）
  ├── passportExpiryDate                                      ← 独占一行（third）
  ├── isFirstPassport                                         ← 独占一行（full，问题类字段）
  └── hasOtherPassport                                        ← 独占一行（full，问题类字段）
L3 其他护照 [conditional-group, 触发: hasOtherPassport = yes]
  └── otherPassportCountry / otherPassportDetail
```

**3. 居住地址 `address-info`**

```
L2 当前住址（独立 fields-grid）
  ├── currentCountry / currentAddress / postalCode
  └── housingStatus / residenceStartDate
L3 房东姓名 [conditional-group, 触发: housingStatus = tenant]
  └── houseOwner
```

**4. 婚姻与配偶 `marriage-info`**

```
L2 婚姻状态（独立 fields-grid）
  └── maritalStatus
L3 配偶信息 [conditional-group, 触发: maritalStatus = married]
  ├── spouseName / spouseNationality / spouseDob / spouseBirthCity  ← 同行（各 third）
  ├── spouseCountry / spouseAddress                                  ← 同行（third + half）
  └── spouseChangedNationality                                       ← 独占一行（full）
```

**5. 父母信息 `parent-info`**

```
L2 父亲 [sub-label: father]
  ├── father_name / father_nationality / father_dob  ← 同行（各 third）
  ├── father_country / father_address                ← 同行（third + half）
  ├── father_changed_nationality                      ← 独占一行（full，问题类字段）
  └── father_going_to_uk                              ← 独占一行（full，问题类字段）
L2 母亲 [sub-label: mother]
  ├── mother_name / mother_nationality / mother_dob  ← 同行（各 third）
  ├── mother_country / mother_address                ← 同行（third + half）
  ├── mother_changed_nationality                      ← 独占一行（full，问题类字段）
  └── mother_going_to_uk                              ← 独占一行（full，问题类字段）
```

**6. 子女信息 `children-info`**

```
L2 是否有子女（独立 fields-grid）
  └── hasChildren
L3 子女列表 [conditional-group, 触发: hasChildren = yes, v-for]
  每个子女（repeatable-group）:
    ├── name / relation / nationality / dob  ← 同行（各 third）
    ├── country / address                    ← 同行（third + half）
    ├── changedNationality                   ← 独占一行（full，问题类字段）
    └── goingToUK                            ← 独占一行（full，问题类字段）
```

**7. 旅行计划 `travel-plan`**

```
L2 旅行信息（独立 fields-grid）
  ├── purposeOfVisit / intendedArrivalDate / intendedDepartureDate
  └── travelPlanDesc（multiline）
```

**8. 同行人信息 `companions`**

```
L2 是否有同行人（独立 fields-grid）
  └── hasCompanion
L3 同行人列表 [conditional-group, 触发: hasCompanion = yes, v-for]
  每个同行人（repeatable-group）:
    └── name / relation / nationality / dob / passport
```

**9. 工作与收入 `employment-info`**

```
L2 就业状态（独立 fields-grid）
  └── employmentStatus
L3 工作/学习详情 [conditional-group, 触发: employmentStatus = working|studying]
  ├── jobStartDate / jobTitle / monthlySalary
  ├── companyName（label 动态: "公司名称" / "学校名称"）
  ├── companyPhone（label 动态: "公司电话" / "学校电话"）
  ├── companyPostalCode / companyAddress
  └── jobDuties（multiline）
L3 失业原因 [conditional-group, 触发: employmentStatus = unemployed]
  └── unemployedReason
L2 其他收入（独立 fields-grid, 触发: employmentStatus = working）
  └── otherIncome
```

**10. 财务信息 `financial-info`**

```
L2 收支情况（独立 fields-grid）
  ├── estimatedUKSpend / monthlyExpense
  └── hasSponsor
L3 经济担保人 [conditional-group, 触发: hasSponsor = yes]
  └── sponsorName / sponsorRelation / sponsorAmount
```

**11. 英国联系人与住宿 `uk-contacts`**

```
L2 英国联系人（独立 fields-grid）
  └── hasUKContact
L3 联系人详情 [conditional-group, 触发: hasUKContact = yes]
  └── ukContactName / ukContactRelation / ukContactStatus
      ukContactPhone / ukContactPostal / ukContactDocNumber
L2 英国住宿（独立 fields-grid）
  └── hasUKAccommodation
L3 住宿详情 [conditional-group, 触发: hasUKAccommodation = yes]
  ├── ukAccommodationDetail / ukAccommodationAddress
  └── ukCheckinDate / ukCheckoutDate / ukAccommodationPostal
```

**12. 签证与旅行历史 `visa-history`**

```
L2 英国签证（独立 fields-grid）
  ├── hadUKVisa
L3 最近签证日期 [conditional-group, 触发: hadUKVisa = yes]
  └── lastUKVisaDate
L2 去过英国（独立 fields-grid）
  ├── visitedUK
L3 访问记录 [conditional-group, 触发: visitedUK = yes, v-for]
  每条记录（repeatable-group）:
    └── date / duration / purpose
L2 曾被拒签（独立 fields-grid）
  ├── beenRefused
L3 拒签记录 [conditional-group, 触发: beenRefused = yes, v-for]
  每条记录（repeatable-group）:
    └── country（NationalityField）/ date / refNumber
    └── reason
L2 向英国内政部申请（独立 fields-grid）
  ├── appliedUKStay
L3 申请详情 [conditional-group, 触发: appliedUKStay = yes]
  └── applyDetail_date / applyDetail_approved / applyDetail_reason
L2 去过其他国家（独立 fields-grid）
  ├── visitedOtherCountries
L3 其他国家记录 [conditional-group, 触发: visitedOtherCountries = yes, v-for]
  每条记录（repeatable-group）:
    └── name（SelectField）/ date / duration
    └── purpose
```

**13. 安全与背景 `security-background`**

```
L2 保险与安全（独立 fields-grid）
  ├── hasUKInsurance
L3 保险信息 [conditional-group, 触发: hasUKInsurance = yes]
  └── insuranceNumber / insuranceReason
  ├── hasCriminalRecord
  ├── hasTerrorism
  ├── hasBeenProsecuted
  ├── hasGenocide
  ├── hasArmedConflict
  └── hasSpecialIndustry
L3 特殊行业 [conditional-group, 触发: hasSpecialIndustry = yes]
  └── specialIndustries（SelectField）/ specialIndustryDetail
```

### 2.5 各板块详细规格

> 缩写说明：**R** = required（必填），**Icon** = prefix-icon，**ML** = multiline（多行文本域）。
> span 未标注 = 控件默认值（DateField→third, TextField→half, SelectField→half, RadioField→full, NationalityField→third, PhoneField→third）。
> 网格 4 列：A B C D。`third` 占 1 列，`half` 占 2 列，`full` 占 4 列。
> **排版规则：问题类字段（yes/no 等 RadioField）必须独占一行**，避免与数据字段同行导致 L3 条件子域归属混乱。

#### §1 基本信息 `personal-info`

| 行 | 字段 | 控件 | span | 落位 | R | Icon | 备注 |
|----|------|------|------|------|---|------|------|
| 1 | lastName | TextField | third | A | ✅ | User | |
| 1 | firstName | TextField | third | B | ✅ | User | |
| 1 | formerName | TextField | third | C | | User | 曾用名，选填 |
| 2 | dateOfBirth | DateField | third | A | ✅ | Calendar | |
| 2 | phone | PhoneField | third | B | ✅ | — | 合并区号+号码 |
| 2 | email | TextField | third | C | ✅ | Mail | |
| 3 | gender | RadioField | full | A-D | ✅ | — | 男/女/其他 |

**联动**：无。

---

#### §2 证件与护照 `passport-info`

**L2 身份证** `[sub-label: idCard]`

| 行 | 字段 | 控件 | span | 落位 | R | Icon |
|----|------|------|------|------|---|------|
| 1 | nationality | NationalityField | third | A | ✅ | — |
| 1 | idCardNumber | TextField | third | B | ✅ | CreditCard |
| 1 | idCardAuthority | TextField | third | C | ✅ | Building |
| 2 | idCardExpiry | DateField | third | A | ✅ | Calendar |

**L2 护照** `[sub-label: passport]`

| 行 | 字段 | 控件 | span | 落位 | R | Icon |
|----|------|------|------|------|---|------|
| 1 | issuingAuthority | NationalityField | third | A | ✅ | — | 签发国家/地区 |
| 1 | passportNumber | TextField | third | B | ✅ | BookOpen |
| 1 | passportIssueDate | DateField | third | C | ✅ | Calendar |
| 2 | passportExpiryDate | DateField | third | A | ✅ | Calendar | min=passportIssueDate |
| 3 | isFirstPassport | RadioField | full | A-D | ✅ | — | 是否首本护照 |
| 4 | hasOtherPassport | RadioField | full | A-D | ✅ | — | 是否有其他护照 |

**L3 其他护照** `[conditional-group]` 触发：`hasOtherPassport = yes`

| 字段 | 控件 | span | R | Icon |
|------|------|------|---|------|
| otherPassportCountry | NationalityField | third | ✅ | — |
| otherPassportDetail | TextField | half | ✅ | BookOpen |

---

#### §3 居住地址 `address-info`

| 行 | 字段 | 控件 | span | 落位 | R | Icon |
|----|------|------|------|------|---|------|
| 1 | currentCountry | NationalityField | third | A | ✅ | — |
| 1 | currentAddress | TextField | half | B-C | ✅ | MapPin |
| 1 | postalCode | TextField | third | D | | Mailbox | |
| 2 | housingStatus | SelectField | third | A | ✅ | — | 自有/租房/其他 |
| 2 | residenceStartDate | DateField | third | B | ✅ | Calendar | |
| 2 | houseOwner | TextField | third | C | ✅ | Home | ⚠️ 仅 `housingStatus = tenant` 时显示（`v-if` 内联，无 conditional-group） |

---

#### §4 婚姻与配偶 `marriage-info`

| 行 | 字段 | 控件 | span | R | 备注 |
|----|------|------|------|---|------|
| 1 | maritalStatus | RadioField | full | ✅ | 未婚/已婚/离异/丧偶/分居 |

**L3 配偶信息** `[conditional-group]` 触发：`maritalStatus = married`

| 行 | 字段 | 控件 | span | 落位 | R | Icon |
|----|------|------|------|------|---|------|
| 1 | spouseName | TextField | third | A | ✅ | User |
| 1 | spouseNationality | NationalityField | third | B | ✅ | — |
| 1 | spouseDob | DateField | third | C | ✅ | Calendar |
| 1 | spouseBirthCity | TextField | third | D | ✅ | MapPin |
| 2 | spouseCountry | NationalityField | third | A | ✅ | — | 居住国家/地区 |
| 2 | spouseAddress | TextField | half | B-C | ✅ | MapPin | |
| 3 | spouseChangedNationality | RadioField | full | A-D | ✅ | — | 是/否 |

---

#### §5 父母信息 `parent-info`

父亲和母亲结构完全对称，以下用 `{parent}` 代指 `father` / `mother`。

**L2 父亲** `[sub-label: father]` / **L2 母亲** `[sub-label: mother]`

| 行 | 字段 | 控件 | span | 落位 | R | Icon |
|----|------|------|------|------|---|------|
| 1 | {parent}_name | TextField | third | A | ✅ | User |
| 1 | {parent}_nationality | NationalityField | third | B | ✅ | — |
| 1 | {parent}_dob | DateField | third | C | ✅ | Calendar |
| 2 | {parent}_country | NationalityField | third | A | ✅ | — | 居住国家/地区 |
| 2 | {parent}_address | TextField | half | B-C | ✅ | MapPin | |
| 3 | {parent}_changed_nationality | RadioField | full | A-D | | — | 是否更换过国籍（问题类字段独占一行） |
| 4 | {parent}_going_to_uk | RadioField | full | A-D | ✅ | — | 是否一起去英国（问题类字段独占一行） |

> ⚠️ Row 1（name+nationality+dob）和 Row 2（country+address）必须在**不同的 `fields-grid`** 中。若放在同一 grid，CSS auto-place 会将 country 填入 Row 1 剩余的第 D 列，导致排版错位。

**联动**：无。决策字段为 RadioField（yes/no），各自独占一行，不包裹 conditional-group。

---

#### §6 子女信息 `children-info`

| 行 | 字段 | 控件 | span | R | 备注 |
|----|------|------|------|---|------|
| 1 | hasChildren | RadioField | full | ✅ | 是/否 |

**L3 子女列表** `[conditional-group]` 触发：`hasChildren = yes`，`v-for` 动态行。

每个子女（`repeatable-group`，标题：`子女 {i+1}`）：

| 行 | 字段 | 控件 | span | 落位 | R | Icon |
|----|------|------|------|------|---|------|
| 1 | name | TextField | third | A | ✅ | User |
| 1 | relation | SelectField | third | B | ✅ | — | 儿子/女儿 |
| 1 | nationality | NationalityField | third | C | ✅ | — |
| 1 | dob | DateField | third | D | ✅ | Calendar |
| 2 | country | NationalityField | third | A | ✅ | — | 居住国家/地区 |
| 2 | address | TextField | half | B-C | ✅ | MapPin | |
| 3 | changedNationality | RadioField | full | A-D | ✅ | — | 是否更换过国籍（问题类字段独占一行） |
| 4 | goingToUK | RadioField | full | A-D | ✅ | — | 是否一起去英国（问题类字段独占一行） |

**联动**：无嵌套 conditional-group。决策字段为 RadioField（yes/no），各自独占一行。

---

#### §7 旅行计划 `travel-plan`

| 行 | 字段 | 控件 | span | 落位 | R | Icon | 备注 |
|----|------|------|------|------|---|------|------|
| 1 | purposeOfVisit | SelectField | third | A | ✅ | — | 旅游/商务/探亲/学习/就医/其他 |
| 1 | intendedArrivalDate | DateField | third（默认） | B | ✅ | Calendar | |
| 1 | intendedDepartureDate | DateField | third（默认） | C | ✅ | Calendar | min=arrivalDate |
| 2 | travelPlanDesc | TextField | full | A-D | ✅ | Plane | ML |

> *三个短字段（出行目的 + 到达日期 + 离开日期）同行各占 1 列（third），D 列留空；行程描述独占第二行。

**联动**：`intendedDepartureDate` 的 `min-value` 绑定 `intendedArrivalDate`，不可选早于到达的日期。

---

#### §8 同行人信息 `companions`

| 行 | 字段 | 控件 | span | R | 备注 |
|----|------|------|------|---|------|
| 1 | hasCompanion | RadioField | full | ✅ | 是/否 |

**L3 同行人列表** `[conditional-group]` 触发：`hasCompanion = yes`，`v-for` 动态行。

每个同行人（`repeatable-group`，标题：`同行人 {i+1}`）：

| 行 | 字段 | 控件 | span | 落位 | R | Icon |
|----|------|------|------|------|---|------|
| 1 | name | TextField | third | A | ✅ | User |
| 1 | nationality | NationalityField | third | B | ✅ | — |
| 1 | dob | DateField | third | C | ✅ | Calendar |
| 1 | relation | SelectField | third | D | ✅ | — |
| 2 | passport | TextField | half | A-B | ✅ | BookOpen |

> *同行人字段顺序：姓名 → 国籍 → 出生日期 → 与申请人关系（relation 移至第一行末尾）。

**联动**：无。

---

#### §9 工作与收入 `employment-info`

| 行 | 字段 | 控件 | span | R | 备注 |
|----|------|------|------|---|------|
| 1 | employmentStatus | RadioField | full | ✅ | 在职/学生/无业 |

**L3 工作/学习详情** `[conditional-group]` 触发：`employmentStatus = working | studying`

| 行 | 字段 | 控件 | span | 落位 | R | Icon | 备注 |
|----|------|------|------|------|---|------|------|
| 1 | jobStartDate | DateField | third | A | ✅ | Calendar | |
| 1 | jobTitle | TextField | third | B | ✅ | Briefcase | ⚠️ 仅 `working` 时显示 |
| 1 | monthlySalary | TextField | third | C | ✅ | Banknote | suffix=¥；⚠️ 仅 `working` 时显示 |
| 2 | companyName | TextField | half | A-B | ✅ | Building | ⚡ 动态 label |
| 2 | companyPhone | TextField | half | C-D | | Phone | ⚡ 动态 label |
| 3 | companyPostalCode | TextField | third | A | | Mailbox | ⚡ 动态 label |
| 3 | companyAddress | TextField | half | B-C | ✅ | MapPin | ⚡ 动态 label |
| 4 | jobDuties | TextField | full | A-D | | ClipboardList | ML；⚠️ 仅 `employmentStatus = working` 时显示 |
| 5 | otherIncome | TextField | third | A | ✅ | Wallet | ⚠️ 仅 `employmentStatus = working` 时显示（`v-if` 内联包裹） |

**⚡ 动态 label 切换**（computed）：

| 字段 | 在职（working） | 学生（studying） |
|------|----------------|-----------------|
| companyName | 公司名称 | 学校名称 |
| companyPhone | 公司/学校联系电话 | 学校联系电话 |
| companyPostalCode | 公司/学校邮政编码 | 学校邮政编码 |
| companyAddress | 公司/学校地址 | 学校地址 |

> 实现：`:label-key="companyNameKey"` 绑定 computed，根据 `employmentStatus` 返回不同 i18n key。

**L3 失业原因** `[conditional-group]` 触发：`employmentStatus = unemployed`

| 字段 | 控件 | span | R | Icon |
|------|------|------|---|------|
| unemployedReason | TextField | full | ✅ | FileQuestion |

---

#### §10 财务信息 `financial-info`

| 行 | 字段 | 控件 | span | 落位 | R | Icon |
|----|------|------|------|------|---|------|
| 1 | estimatedUKSpend | TextField | third | A | ✅ | Banknote | suffix=¥ |
| 1 | monthlyExpense | TextField | third | B | ✅ | Banknote | suffix=¥ |
| 1 | hasSponsor | RadioField | full（默认） | A-D | | — | 是/否 |

**L3 经济担保人** `[conditional-group]` 触发：`hasSponsor = yes`

| 行 | 字段 | 控件 | span | 落位 | R | Icon |
|----|------|------|------|------|---|------|
| 1 | sponsorName | TextField | third | A | ✅ | UserCheck | |
| 1 | sponsorRelation | TextField | third | B | ✅ | Users | |
| 1 | sponsorAmount | TextField | third | C | ✅ | Banknote | suffix=¥ |

---

#### §11 英国联系人与住宿 `uk-contacts`

**L2 英国联系人**

| 行 | 字段 | 控件 | span | R | 备注 |
|----|------|------|------|---|------|
| 1 | hasUKContact | RadioField | full | ✅ | 是/否 |

**L3 联系人详情** `[conditional-group]` 触发：`hasUKContact = yes`

| 行 | 字段 | 控件 | span | 落位 | R | Icon |
|----|------|------|------|------|---|------|
| 1 | ukContactName | TextField | third | A | ✅ | User |
| 1 | ukContactRelation | TextField | third | B | ✅ | Users |
| 1 | ukContactStatus | TextField | third | C | ✅ | Shield | 在英身份 |
| 2 | ukContactPhone | TextField | third | A | ✅ | Phone | 在英国的电话 |
| 2 | ukContactPostal | TextField | third | B | | Mailbox | 在英国的邮编 |
| 2 | ukContactDocNumber | TextField | half | C-D | ✅ | CreditCard | 护照/居留卡号码，占2列 |

**L2 英国住宿**

| 行 | 字段 | 控件 | span | R | 备注 |
|----|------|------|------|---|------|
| 1 | hasUKAccommodation | RadioField | full | ✅ | 是/否 |

**L3 住宿详情** `[conditional-group]` 触发：`hasUKAccommodation = yes`

| 行 | 字段 | 控件 | span | 落位 | R | Icon |
|----|------|------|------|------|---|------|
| 1 | ukAccommodationDetail | TextField | half | A-B | ✅ | Home | |
| 1 | ukAccommodationAddress | TextField | half | C-D | ✅ | MapPin | |
| 2 | ukCheckinDate | DateField | third | A | ✅ | Calendar | |
| 2 | ukCheckoutDate | DateField | third | B | ✅ | Calendar | min=checkinDate |
| 2 | ukAccommodationPostal | TextField | third | C | | Mailbox | 在英国的邮编 |

---

#### §12 签证与旅行历史 `visa-history`

本板块含 **5 个子分组**，其中 3 个有 `v-for` 动态行。

**L2-1 英国签证历史**

| 行 | 字段 | 控件 | R | 备注 |
|----|------|------|---|------|
| 1 | hadUKVisa | RadioField | ✅ | 是/否 |

**L3 最近签证日期** `[conditional-group]` 触发：`hadUKVisa = yes`

| 字段 | 控件 | R | Icon |
|------|------|---|------|
| lastUKVisaDate | DateField | ✅ | Calendar |

**L2-2 去过英国**

| 行 | 字段 | 控件 | R |
|----|------|------|---|
| 1 | visitedUK | RadioField | ✅ |

**L3 访问记录** `[conditional-group]` 触发：`visitedUK = yes`，`v-for` 动态行。

每条记录（`repeatable-group`，标题：`第{i+1}次访问`）：

| 行 | 字段 | 控件 | span | 落位 | R | Icon |
|----|------|------|------|------|---|------|
| 1 | date | DateField | third | A | ✅ | Calendar |
| 1 | duration | TextField | third | B | ✅ | Clock | 停留时长 |
| 2 | purpose | TextField | full | A-D | ✅ | ClipboardList | |

**L2-3 曾被拒签**

| 行 | 字段 | 控件 | R | 备注 |
|----|------|------|---|------|
| 1 | beenRefused | RadioField | ✅ | 是否曾被英国或其他国家拒签过 |

**L3 拒签记录** `[conditional-group]` 触发：`beenRefused = yes`，`v-for` 动态行。

每条记录（`repeatable-group`，标题：`第{i+1}次拒签`）：

| 行 | 字段 | 控件 | span | 落位 | R | Icon |
|----|------|------|------|------|---|------|
| 1 | country | NationalityField | third | A | ✅ | — | 拒签国家 |
| 1 | date | DateField | third | B | ✅ | Calendar | |
| 1 | refNumber | TextField | third | C | | Hash | 受理号，选填 |
| 2 | reason | TextField | full | A-D | ✅ | FileQuestion | |

**L2-4 向英国内政部申请**

| 行 | 字段 | 控件 | R |
|----|------|------|---|
| 1 | appliedUKStay | RadioField | ✅ |

**L3 申请详情** `[conditional-group]` 触发：`appliedUKStay = yes`

| 行 | 字段 | 控件 | span | 落位 | R | Icon |
|----|------|------|------|------|---|------|
| 1 | applyDetail_date | DateField | third | A | ✅ | Calendar | |
| 2 | applyDetail_approved | RadioField | full（默认） | A-D | ✅ | — | 是否批准（问题类字段独占一行） |
| 3 | applyDetail_reason | TextField | full | A-D | ✅ | FileQuestion | |

**L2-5 去过其他国家**

| 行 | 字段 | 控件 | R |
|----|------|------|---|
| 1 | visitedOtherCountries | RadioField | ✅ |

**L3 其他国家记录** `[conditional-group]` 触发：`visitedOtherCountries = yes`，`v-for` 动态行。

每条记录（`repeatable-group`，标题：`第{i+1}个国家`）：

| 行 | 字段 | 控件 | span | 落位 | R | Icon |
|----|------|------|------|------|---|------|
| 1 | name | SelectField | third | A | ✅ | — | 美/加/澳/新/申根 |
| 1 | date | DateField | third | B | ✅ | Calendar | |
| 1 | duration | TextField | third | C | ✅ | Clock | 停留时长 |
| 2 | purpose | TextField | full | A-D | ✅ | ClipboardList | |

---

#### §13 安全与背景 `security-background`

全部字段在同一个 `fields-grid` 中，条件子域内嵌其中。

| 行 | 字段 | 控件 | R | 备注 |
|----|------|------|---|------|
| 1 | hasUKInsurance | RadioField | ✅ | 是否有英国国家保险 |

**L3 保险信息** `[conditional-group]` 触发：`hasUKInsurance = yes`

| 字段 | 控件 | span | R | Icon |
|------|------|------|---|------|
| insuranceNumber | TextField | half | ✅ | Hash |
| insuranceReason | TextField | half | ✅ | FileQuestion |

继续独立 RadioField 行：

| 行 | 字段 | 控件 | R |
|----|------|------|---|
| — | hasCriminalRecord | RadioField | ✅ | 是否有犯罪记录 |
| — | hasTerrorism | RadioField | ✅ | 是否涉及恐怖主义 |
| — | hasBeenProsecuted | RadioField | ✅ | 是否曾被起诉 |
| — | hasGenocide | RadioField | ✅ | 是否涉及种族灭绝 |
| — | hasArmedConflict | RadioField | ✅ | 是否参与武装冲突 |
| — | hasSpecialIndustry | RadioField | ✅ | 是否从事过特殊行业 |

**L3 特殊行业** `[conditional-group]` 触发：`hasSpecialIndustry = yes`

| 字段 | 控件 | span | 落位 | R | Icon |
|------|------|------|------|---|------|
| specialIndustries | SelectField | third | A | ✅ | — | 行业类型 |
| specialIndustryDetail | TextField | half | B-C | ✅ | Factory | 从业详情 |

> 两者在同一行：类型占 A 列（third），详情占 B-C 列（half），D 列留空。

---

## 3. 字段组件与分类

### 3.1 使用的组件类型

| 组件 | 用途 | 示例字段 |
|------|------|----------|
| `TextField` | 文本输入（姓名、地址、说明等） | `lastName`、`companyName`、`otherPassportDetail` |
| `DateField` | 日期选择（年月日，无 placeholder） | `dateOfBirth`、`passportExpiryDate`、`intendedArrivalDate` |
| `SelectField` | 下拉选择（固定选项集合） | `nationality`、`housingStatus`、`purposeOfVisit` |
| `RadioField` | 单选按钮（是/否、性别、婚姻状态等） | `gender`、`hasOtherPassport`、`maritalStatus` |

### 3.2 共用选项数组

以下选项被多个字段复用，保证全站一致：

| 选项数组 | 类型 | 复用位置 |
|----------|------|----------|
| `nationalityOptions`（CN/US/GB/OTHER） | SelectField | 本人国籍、配偶国籍、父亲国籍、母亲国籍、同行人国籍 |
| `yesNoOptions`（yes/no） | RadioField | 全部"是否有…"类型字段（约 20 处） |
| `genderOptions`（male/female/other） | RadioField | 申请人性别 |

### 3.3 字段统计

- 固定字段（始终显示）：约 70 个
- 条件字段（v-if 控制）：约 30 个
- 动态行字段（v-for，按行展开）：5 类 × N 行
- 必填字段（`required: true`）：111 个（含动态行展开后）

---

## 4. 条件联动规则

### 4.1 字段级条件（v-if）

条件字段在其触发条件为真时才显示，同时加入 `previewSections`（仅当条件满足时，使用展开运算符 `...`），并标注 `required: true` 参与校验。

| 触发字段 | 触发值 | 显示字段 | 是否必填 |
|----------|--------|----------|----------|
| `hasOtherPassport` | `yes` | `otherPassportCountry`、`otherPassportDetail` | ✅ 必填 |
| `housingStatus` | `tenant` | `houseOwner` | ✅ 必填 |
| `maritalStatus` | `married` | `spouseName`、`spouseDob`、`spouseNationality`、`spouseChangedNationality`、`spouseBirthCity`、`spouseAddress` | ✅ 全部必填 |
| `spouseChangedNationality` | `yes` | `spouseOtherNationality` | ✅ 必填 |
| `father_changed_nationality` | `yes` | `father_other_nationality` | ✅ 必填 |
| `mother_changed_nationality` | `yes` | `mother_other_nationality` | ✅ 必填 |
| `hasChildren` | `yes` | 子女动态行区域 | — |
| `hasCompanion` | `yes` | 同行人动态行区域 | — |
| `employmentStatus` | `working` 或 `studying` | 工作/学业详情字段组 | ✅ 必填 |
| `employmentStatus` | `unemployed` | `unemployedReason` | ✅ 必填 |
| `hasSponsor` | `yes` | `sponsorName`、`sponsorRelation`、`sponsorAmount` | ✅ 必填 |
| `hasUKContact` | `yes` | 英国联系人详情字段组 | ✅ 必填 |
| `hasUKAccommodation` | `yes` | 英国住宿详情字段组 | ✅ 必填 |
| `hadUKVisa` | `yes` | `lastUKVisaDate` | ✅ 必填 |
| `visitedUK` | `yes` | 英国访问记录动态行区域 | — |
| `beenRefused` | `yes` | 拒签记录动态行区域 | — |
| `appliedUKStay` | `yes` | `applyDetail_date`、`applyDetail_reason`、`applyDetail_approved` | ✅ 必填 |
| `visitedOtherCountries` | `yes` | 其他国家旅行记录动态行区域 | — |
| `hasUKInsurance` | `yes` | `insuranceNumber`、`insuranceReason` | ✅ 必填 |
| `hasSpecialIndustry` | `yes` | `specialIndustries`、`specialIndustryDetail` | ✅ 必填 |
| `child.changedNationality`（动态行内） | `yes` | `child.otherNationality`（当前行） | ✅ 必填 |

### 4.2 联动设计原则

- 条件字段的 `required` 只在其显示时生效（通过 previewSections 的条件展开控制）
- 条件不满足时，字段值不参与校验，也不在 PDF 预览中显示
- 嵌套条件（如 `spouseChangedNationality` 在 `maritalStatus === 'married'` 内）通过嵌套 `v-if` 实现

---

## 5. 动态可重复组

5 类数据采用 **reactive 数组 + v-for** 模式，用户可自由添加/删除行：

| 动态组 | reactive 变量 | 工厂函数 | 每行字段数 |
|--------|--------------|----------|----------|
| 同行人 | `companions` | `createCompanion()` | 5 字段（姓名、生日、国籍、护照号、与申请人关系） |
| 子女 | `children` | `createChild()` | 7 字段（姓名、国籍、是否改国籍、关系、生日、是否赴英、地址） |
| 英国访问记录 | `ukVisits` | `createUkVisit()` | 3 字段（日期、停留时长、目的） |
| 拒签记录 | `refusals` | `createRefusal()` | 4 字段（日期、国家、原因、参考号） |
| 其他国家旅行 | `otherCountries` | `createOtherCountry()` | 4 字段（国家、日期、停留时长、目的） |

### 设计要点

- 动态数组与 `formData` **平级声明**（不嵌套），避免 reactive 嵌套的响应式问题
- `name` 使用索引模板（如 `comp_${i}_name`），保证 DOM 唯一性，供校验聚焦定位
- 每行有独立的移除按钮（`.remove-btn`），底部有"添加"按钮（`.add-btn`）
- 动态行的 `previewSections` 构建使用 `map().flat()` 展开，行内条件字段用 `...()` 展开运算符

---

## 6. 校验与交互设计

### 6.1 校验流程

导出按钮**始终可点击**（不禁用）。点击后执行完整校验，失败时引导用户修正：

```
点击"导出 PDF"
       │
       ▼
handleExportClick()
       │
  扫描 previewSections
  收集所有 required=true 且 value 为空的字段
       │
       ├── 有缺失字段
       │     │
       │     ├─ 1. 找到第一个缺失字段所在的 Accordion 分组
       │     ├─ 2. 通过 data-accordion-value 查找 AccordionItem DOM
       │     ├─ 3. 如果该分组处于折叠状态，模拟点击展开
       │     ├─ 4. nextTick 后，通过 name 属性定位字段 DOM
       │     ├─ 5. scrollIntoView({ block: 'center' }) 滚动到视野中心
       │     ├─ 6. el.focus() 聚焦字段
       │     └─ 7. 添加 field-error-flash 类，闪烁红色边框 2 秒
       │
       └── 全部通过
             └─ formActionsRef.value?.openPreview() 打开预览弹窗
```

### 6.2 sectionMap 映射

`handleExportClick` 内部维护一个 sectionTitle → accordionValue 的映射对象（13 个条目），key 是已翻译的分组标题（`t('ukVisa.sections.xxx')`），value 是 AccordionItem 的 `value` 属性。

### 6.3 错误闪烁动画

```css
:global(.field-error-flash) {
  animation: errorFlash 0.6s ease-in-out 3;  /* 闪烁 3 次，共 1.8 秒 */
}
@keyframes errorFlash {
  0%, 100% { box-shadow: none; }
  50% { box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.8); }
}
```

---

## 7. PDF 导出流程

```
用户在预览弹窗中点击"导出 PDF"
       │
       ▼
handleExportFromPreview()（FormActions 内部）
       │
  buildPdfTitle()  → "英国签证 - 张三"
  buildPdfFilename() → "英国签证 - 张三.pdf"
       │
  exportPdf(previewContentRef, filename, docTitle)
       │
  html2canvas 逐个捕获 [data-pdf-section] 元素
       │
  jsPDF 按页高度依次排布，超出自动分页
       │
  下载 PDF 文件，关闭预览弹窗
```

`useApplicantName` 根据 `formData.lastName + formData.firstName` 拼接姓名；姓名为空时自动退化为不含姓名的标题格式。

---

## 8. 数据持久化设计

### 8.1 存储结构

```
localStorage key: ws-visa-uk-form-data

value (JSON):
{
  "_schemaVersion": "applyDetail_approved|applyDetail_date|...|...",  // 所有 key 排序后 | 拼接
  "data": {
    "lastName": "张",
    "firstName": "三",
    ...（formData 所有字段）,
    "companions": [{ name: "李四", ... }],
    "children": [],
    "ukVisits": [...],
    "refusals": [...],
    "otherCountries": [...]
  }
}
```

### 8.2 Schema 版本控制

`SCHEMA_VERSION` 由 `Object.keys(defaultData).sort().join('|')` 自动计算。只要 `defaultData` 中的字段增删或重命名，版本就会变化，加载时版本不匹配则丢弃旧数据，防止脏数据导致字段错位。

### 8.3 自动保存

`watch([formData, companions, children, ukVisits, refusals, otherCountries], ..., { deep: true })` 监听所有数据源的变化，每次变化都写入 localStorage。

### 8.4 清除数据

二次确认后，遍历 `formData` 所有 key 重置为空字符串，各动态数组调用 `splice(0)` 清空，同时删除 localStorage 记录。

---

## 9. 回到顶部按钮

滚动超过 300px 时在右下角显示圆形按钮，点击平滑滚动到顶部，带淡入淡出过渡动画。

```
window.scrollY > 300  →  显示按钮（.back-to-top-btn）
点击按钮               →  window.scrollTo({ top: 0, behavior: 'smooth' })
```

---

## 10. 关键实现细节

### 10.1 AccordionItem 的 data 属性

每个 `<AccordionItem>` 都带有 `data-accordion-value` 属性（与 `:value` 相同），供校验聚焦时通过 `querySelector` 查找 DOM 并判断展开状态：

```html
<AccordionItem value="personal-info" data-accordion-value="personal-info">
```

### 10.2 previewSections 的 name 字段

所有 `required: true` 的预览字段都带有 `name`，与对应字段组件的 `name` prop 完全一致。这是校验聚焦能够定位 DOM 的关键桥梁。

动态行的 name 使用与模板中 `:name` 相同的索引模板（如 `comp_${i}_name`），确保一一对应。

### 10.3 条件字段在 previewSections 中的处理

条件字段**不是始终存在于 previewSections**，而是通过展开运算符按条件动态包含：

```typescript
// 条件满足时才纳入校验和预览
...(formData.hasOtherPassport === 'yes'
  ? [{ label: ..., value: formData.otherPassportDetail, required: true, name: 'otherPassportDetail' }]
  : [])
```

这样做的好处：
- 条件不满足时字段不参与校验（不会因为"看不见但空"而报错）
- 条件不满足时字段不在预览中显示（预览更干净）

### 10.4 FormActions 与父组件的职责分工

| 职责 | 负责方 |
|------|--------|
| 渲染标题/副标题 | FormActions |
| 渲染导出/清除按钮 | FormActions |
| 清除二次确认 | FormActions |
| 管理 PreviewModal | FormActions |
| 执行 PDF 生成 | FormActions（usePdfExport） |
| 必填校验逻辑 | **父组件**（handleExportClick） |
| 聚焦缺失字段 | **父组件** |
| 展开 Accordion | **父组件** |
| 打开预览弹窗 | 父组件通过 `formActionsRef.openPreview()` 触发 |

### 10.5 控件标准化决策

| 数据类型 | 选用组件 | 决策理由 |
|----------|----------|----------|
| 日期 | DateField（日历选择器） | 避免格式输入错误，统一输出 YYYY-MM-DD |
| 国籍/国家 | SelectField + nationalityOptions + `span="third"` | 国籍与国家在签证申请中是同一概念（选项来源均为 nationalityOptions），统一使用短字段（占1列），与其他短字段并排时视觉一致 |
| 性别 | RadioField | 选项少且互斥，单选按钮直观 |
| 是/否 | RadioField + yesNoOptions + `span="half"`（并排时） | 全站统一的二选一交互，复用同一个选项数组；与其他短字段并排时覆盖为 `half` |

### 10.6 字段跨度（span）完整清单

> 网格为 4 列。`third` = 1列，`half` = 2列，`full` = 4列。
> 未标注 `span` 的字段使用控件默认值：DateField → `third`，TextField → `half`，SelectField → `half`，RadioField → `full`，NationalityField → `third`，PhoneField → `third`（1列）。
> 以下清单中 **显式标注** 的 span 为覆盖默认值的字段；使用默认的字段注明"默认"。

#### 1. 基本信息

| 字段 | 控件 | span | 说明 |
|------|------|------|------|
| lastName | TextField | `third` | 姓名短字段 |
| firstName | TextField | `third` | |
| formerName | TextField | `third` | |
| dateOfBirth | DateField | `third`（默认） | 第二行，与 phone/email 同行 |
| phone | PhoneField | `third`（默认） | 合并区号+号码，与 dateOfBirth/email 同行 |
| email | TextField | `third` | 与 dateOfBirth/phone 同行 |
| gender | RadioField | `full`（默认） | 三选项需整行 |

#### 2. 证件与护照

| 字段 | 控件 | span | 说明 |
|------|------|------|------|
| nationality（身份证区第一列） | NationalityField | `third`（显式） | 与 idCardNumber + idCardAuthority 同行 |
| idCardNumber | TextField | `third` | |
| idCardAuthority | TextField | `third` | |
| idCardExpiry | DateField | `third`（默认） | |
| issuingAuthority（护照区第一列） | NationalityField | `third`（显式） | 与 passportNumber + passportIssueDate 同行 |
| passportNumber | TextField | `third` | |
| passportIssueDate | DateField | `third`（默认） | |
| passportExpiryDate | DateField | `third`（默认） | 独占一行 |
| isFirstPassport | RadioField | `full`（默认） | 是/否问题类字段，独占一行 |
| hasOtherPassport | RadioField | `full`（默认） | 是/否问题类字段，独占一行 |
| otherPassportCountry（条件） | NationalityField | `third` | conditional-group 内 |
| otherPassportDetail（条件） | TextField | `half`（默认） | |

#### 3. 居住地址

| 字段 | 控件 | span | 说明 |
|------|------|------|------|
| currentCountry | NationalityField | `third` | |
| currentAddress | TextField | `half`（默认） | 中等长度 |
| postalCode | TextField | `third` | |
| housingStatus | SelectField | `third` | |
| residenceStartDate | DateField | `third`（默认） | |
| houseOwner（条件：tenant） | TextField | `half`（默认） | conditional-group 内 |

#### 4. 婚姻与配偶

| 字段 | 控件 | span | 说明 |
|------|------|------|------|
| maritalStatus | RadioField | `full`（默认） | 五选项需整行 |
| spouseName（条件：married） | TextField | `third` | |
| spouseNationality | NationalityField | `third`（默认） | |
| spouseDob | DateField | `third`（默认） | |
| spouseBirthCity | TextField | `third` | |
| spouseCountry | NationalityField | `third` | |
| spouseAddress | TextField | `half`（默认） | |
| spouseChangedNationality | RadioField | `full`（默认） | 是/否独占一行 |

#### 5. 父母信息（father / mother 对称）

| 字段 | 控件 | span | 说明 |
|------|------|------|------|
| {parent}_name | TextField | `third` | |
| {parent}_nationality | NationalityField | `third`（默认） | |
| {parent}_dob | DateField | `third`（默认） | |
| {parent}_country | NationalityField | `third` | |
| {parent}_address | TextField | `half`（默认） | |
| {parent}_changed_nationality | RadioField | `full`（默认） | 是/否问题类字段，独占一行，无 conditional-group |
| {parent}_going_to_uk | RadioField | `full`（默认） | 是/否问题类字段，独占一行 |

#### 6. 子女信息（动态行，每个 child）

| 字段 | 控件 | span | 说明 |
|------|------|------|------|
| name | TextField | `third` | |
| relation | SelectField | `third` | 仅儿子/女儿 |
| nationality | NationalityField | `third`（默认） | |
| dob | DateField | `third`（默认） | |
| country | NationalityField | `third` | |
| address | TextField | `half`（默认） | |
| changedNationality | RadioField | `full`（默认） | 是/否问题类字段，独占一行 |
| goingToUK | RadioField | `full`（默认） | 是/否问题类字段，独占一行 |

#### 7. 旅行计划

| 字段 | 控件 | span | 说明 |
|------|------|------|------|
| purposeOfVisit | SelectField | `third` | 与两个日期同行 |
| intendedArrivalDate | DateField | `third`（默认） | 与目的、离开日期同行 |
| intendedDepartureDate | DateField | `third`（默认） | 与目的、到达日期同行 |
| travelPlanDesc | TextField | `full` | multiline 长文本，独占一行 |

#### 8. 同行人（动态行，每个 comp）

| 字段 | 控件 | span | 说明 |
|------|------|------|------|
| name | TextField | `third` | |
| relation | SelectField | `third` | |
| nationality | NationalityField | `third`（默认） | |
| dob | DateField | `third`（默认） | |
| passport | TextField | `half`（默认） | |

#### 9. 工作与收入

| 字段 | 控件 | span | 说明 |
|------|------|------|------|
| employmentStatus | RadioField | `full`（默认） | |
| jobStartDate（条件：working/studying） | DateField | `third`（默认） | |
| jobTitle | TextField | `third` | |
| monthlySalary | TextField | `third` | |
| companyName（label 动态切换） | TextField | `half` | |
| companyPhone（label 动态切换） | TextField | `half` | |
| companyPostalCode（label 动态切换） | TextField | `third` | |
| companyAddress（label 动态切换） | TextField | `half`（默认） | |
| jobDuties | TextField | `full` | multiline |
| unemployedReason（条件：unemployed） | TextField | `full` | |
| otherIncome（条件：working） | TextField | `third` | 仅在职时显示 |

#### 10. 财务信息

| 字段 | 控件 | span | 说明 |
|------|------|------|------|
| estimatedUKSpend | TextField | `third` | |
| monthlyExpense | TextField | `third` | |
| hasSponsor | RadioField | `full`（默认） | |
| sponsorName（条件：yes） | TextField | `third` | |
| sponsorRelation | TextField | `third` | |
| sponsorAmount | TextField | `third` | |

#### 11. 英国联系人与住宿

| 字段 | 控件 | span | 说明 |
|------|------|------|------|
| hasUKContact | RadioField | `full`（默认） | |
| ukContactName（条件：yes） | TextField | `third` | |
| ukContactRelation | TextField | `third` | |
| ukContactStatus | TextField | `third` | |
| ukContactPhone | TextField | `third` | |
| ukContactPostal | TextField | `third` | |
| ukContactDocNumber | TextField | `third` | |
| hasUKAccommodation | RadioField | `full`（默认） | |
| ukAccommodationDetail（条件：yes） | TextField | `half` | |
| ukAccommodationAddress | TextField | `half` | |
| ukCheckinDate | DateField | `third`（默认） | |
| ukCheckoutDate | DateField | `third`（默认） | |
| ukAccommodationPostal | TextField | `third` | |

#### 12. 签证与旅行历史

| 字段 | 控件 | span | 说明 |
|------|------|------|------|
| hadUKVisa | RadioField | `full`（默认） | |
| lastUKVisaDate（条件：yes） | DateField | `third`（默认） | |
| visitedUK | RadioField | `full`（默认） | |
| visit_{i}_date（动态行） | DateField | `third`（默认） | |
| visit_{i}_duration | TextField | `half`（默认） | |
| visit_{i}_purpose | TextField | `full` | |
| beenRefused | RadioField | `full`（默认） | |
| refusal_{i}_country（动态行） | NationalityField | `third` | |
| refusal_{i}_date | DateField | `third`（默认） | |
| refusal_{i}_refNumber | TextField | `half`（默认） | |
| refusal_{i}_reason | TextField | `full` | |
| appliedUKStay | RadioField | `full`（默认） | |
| applyDetail_date（条件：yes） | DateField | `third`（默认） | |
| applyDetail_approved | RadioField | `full`（默认） | |
| applyDetail_reason | TextField | `full` | |
| visitedOtherCountries | RadioField | `full`（默认） | |
| oc_{i}_name（动态行） | SelectField | `third` | |
| oc_{i}_date | DateField | `third`（默认） | |
| oc_{i}_duration | TextField | `half`（默认） | |
| oc_{i}_purpose | TextField | `full` | |

#### 13. 安全与背景

| 字段 | 控件 | span | 说明 |
|------|------|------|------|
| hasUKInsurance | RadioField | `full`（默认） | |
| insuranceNumber（条件：yes） | TextField | `half` | |
| insuranceReason | TextField | `half` | |
| hasCriminalRecord | RadioField | `full`（默认） | |
| hasTerrorism | RadioField | `full`（默认） | |
| hasBeenProsecuted | RadioField | `full`（默认） | |
| hasGenocide | RadioField | `full`（默认） | |
| hasArmedConflict | RadioField | `full`（默认） | |
| hasSpecialIndustry | RadioField | `full`（默认） | |
| specialIndustries（条件：yes） | SelectField | `third` | 与 detail 同行 |
| specialIndustryDetail | TextField | `half` | 与类型同行 |

---

## 11. 样式结构

### 11.1 三层视觉配色

表单采用蓝-青双色层级体系，通过色相差异建立 L1 > L2 > L3 的视觉嵌入感：

| 层级 | 色相 | 左边框 | 背景 | 文字/其他 |
|------|------|--------|------|-----------|
| **L2**（数据域） | 蓝色（重） | `#3b82f6`（3px） | `linear-gradient(to right, #eff6ff, transparent)` | 文字 `#1e40af` |
| **L3**（条件子域） | 青色（轻） | `hsl(188 70% 42% / 0.72)`（3px） | `hsl(188 70% 42% / 0.14)` | 边框 `hsl(188 70% 42% / 0.38)` |
| **L3 动态行** | 青色（淡） | `hsl(188 40% 65% / 0.22)`（1px） | `rgba(255, 255, 255, 0.65)` | 悬停时背景加深、边框加深 |

> 设计原则：L2 蓝色视觉重量重，L3 青色视觉重量轻，形成 L3 嵌入 L2 的层次感。

### 11.2 输入控件配色

所有字段组件的边框和聚焦环颜色由全局 CSS 变量控制（`src/style.css`）：

| 状态 | 颜色 | 实现 |
|------|------|------|
| 默认边框 | 淡青色 `hsl(188 40% 78%)` | `--input` CSS 变量 → `border-input` Tailwind 类 |
| 聚焦环 | 青色 `hsl(188 70% 42%)` | `--ring` CSS 变量 → `ring-ring` Tailwind 类 |
| 单选按钮选中 | 青色 `accent-color` | RadioField 组件内设置 |

### 11.3 布局容器样式表

| Class | 用途 |
|-------|------|
| `.form-page` | 最外层容器，渐变背景 + 装饰动画 |
| `.form-container` | 内容区居中，max-width: 720px |
| `.form-breadcrumb` | 面包屑导航 |
| `.glass-card` | 毛玻璃主卡片（表单主体容器） |
| `.fields-grid` | 字段网格（4列 grid，gap: 1rem） |
| `.field-row` | 并排包裹器（占2列，内部再分2子列）—— 短左长右、2个半宽字段并排 |
| `.field-pair` | 短字段对包裹器（占满4列，内部分4子列）—— 2个短字段分别落位第1、3列，第2、4列留空 |
| `.sub-label` | L2 子分组标题（蓝色渐变背景+蓝色左边框，视觉重量较重） |
| `.conditional-group` | L3 条件子域（青色背景+青色左边框，嵌入在 L2 中） |
| `.repeatable-group` | 动态行容器（白色半透明背景+青色淡边框，悬停加深） |
| `.repeatable-header` | 动态行头部（flex，子标题 + 删除按钮） |
| `.add-btn` | 添加新行动按钮 |
| `.remove-btn` | 删除当前行按钮 |
| `.back-to-top-btn` | 回到顶部按钮（fixed 右下角，圆形毛玻璃） |
| `:global(.field-error-flash)` | 校验错误闪烁动画（全局，跨组件） |
| `.fade-enter-active/leave-active` | 回到顶部按钮淡入淡出 |

---

## 12. 迭代注意事项

1. **新增字段**：同时在 `defaultData`、模板、`previewSections`、`zh-CN.json`、`en.json` 五处添加；必填字段在 previewSections 加 `required: true` 和 `name`
2. **删除字段**：上述五处同步删除；localStorage 旧数据会因 schema 版本变化自动失效
3. **修改条件逻辑**：同步修改模板 `v-if` 和 `previewSections` 的展开运算符条件
4. **修改分组**：同步更新 `sectionMap`（handleExportClick 内部）和 AccordionItem 的 `data-accordion-value`
5. **动态行结构变化**：修改对应工厂函数，所有行的 name 索引模板保持一致

---

## 相关文档

- [签证表单开发规范](./form-dev-guide.md) — 通用的字段组件、i18n 结构、持久化规范
- [PDF 导出 & 预览](./pdf-export-preview.md) — `usePdfExport`、`PreviewModal` 接口说明
