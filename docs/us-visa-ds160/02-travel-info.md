# 第2节：出行信息 (Travel Information)

## 页面标题
出行信息

---

## 基础字段列表（始终可见）

### 1. 这次来美国的目的 / Purpose of Trip
- **字段ID**: `data.purpose_of_trip`
- **字段类型**: 下拉选择框 (select dropdown, Ant Design Select)
- **必填**: 是 (标记 *)
- **布局**: 第1个字段
- **选项值** (9个):
  - `临时商务访问者 (B)` - 临时商务访问者 (B)
  - `过境外国人 (C)` - 过境外国人 (C)
  - `机组人员 (D)` - 机组人员 (D)
  - `学术或语言学生 (F)` - 学术或语言学生 (F)
  - `临时工人 (H)` - 临时工人 (H)
  - `外国媒体代表 (I)` - 外国媒体代表 (I)
  - `交流访问学者 (J)` - 交流访问学者 (J)
  - `跨国公司内部调动人员 (L)` - 跨国公司内部调动人员 (L)
  - `职业/非学术学生 (M)` - 职业/非学术学生 (M)
- **衍生字段**: 选择后显示"请选择签证类别"下拉框，选项根据目的动态变化

### 2. 请选择签证类别 / Visa Category (条件显示)
- **字段ID**: `data.other_purpose_of_trip`
- **字段类型**: 下拉选择框 (select dropdown, Ant Design Select)
- **必填**: 是
- **布局**: 第2个字段（条件显示）
- **触发条件**: 当"这次来美国的目的"选择了某个选项后显示
- **选项值根据出行目的动态变化**:

| 出行目的 | 签证类别选项 |
|---------|------------|
| **临时商务访问者 (B)** | B1-B2 商务及旅游, B1-CF 商务/会议, B2-TM 旅游/医疗 |
| **过境外国人 (C)** | C1-D 机组人员过境, C1-TR 过境, C2-UN 联合国总部过境, C3-CH/C3-EM/C3-FR/C3-SP C3系列 |
| **机组人员 (D)** | C1-D 机组人员过境, C1-TR 过境, C2-UN 联合国总部过境, C3-CH/C3-EM/C3-FR/C3-SP C3系列 |
| **学术或语言学生 (F)** | F1-F1 学生, F2-CH F1子女, F2-SP F1配偶 |
| **临时工人 (H)** | H1B-H1B 专业职业, H1B1-CHL 智利, H1B1-SGP 新加坡, H1C-NR 护理人员, H2A-AG 农业工人, H2B-NA 非农业工人, H3-TR 实习生, H4-CH 子女, H4-SP 配偶 |
| **外国媒体代表 (I)** | I-CH 子女, I-FR 外国媒体代表, I-SP 配偶 |
| **交流访问学者 (J)** | I-CH 子女, I-FR 外国媒体代表, I-SP 配偶 |
| **跨国公司内部调动人员 (L)** | L1-L1 跨国公司内部调动人员, L2-CH 子女, L2-SP 配偶 |
| **职业/非学术学生 (M)** | L1-L1 跨国公司内部调动人员, L2-CH 子女, L2-SP 配偶 |

- **注意**: 更换出行目的时，签证类别重置为"请选择"

### 3. 预计抵达美国的日期 / Intended Date of Arrival
- **字段类型**: 日期选择器 (3个下拉框组合)
- **必填**: 是 (标记 *)
- **布局**: 第3个字段
- **子字段**:
  - **DAY** (ID: `data.travel_plan.date_of_arrival_v2.DD`) - 下拉选择框，选项：1-31
  - **MONTH** (ID: `data.travel_plan.date_of_arrival_v2.MMM`) - 下拉选择框，选项：一月至十二月
  - **YEAR** (ID: `data.travel_plan.date_of_arrival_v2.YYYY`) - 文本输入框，4位数字
- **验证**: 日期不能等于或早于今天

### 4. 在美国的预期停留时间 / Expected Length of Stay
- **字段ID**: `data.travel_plan.length_of_stay.length`
- **字段类型**: 数字输入框 (spinbutton/number input)
- **必填**: 是 (标记 *)
- **布局**: 第4个字段
- **属性**:
  - 最小值: 1
  - 最大值: 100

### 5. 请明确说明（时间单位）/ Period
- **字段ID**: `data.travel_plan.length_of_stay.period`
- **字段类型**: 下拉选择框 (select dropdown, Ant Design Select)
- **必填**: 是 (标记 *)
- **布局**: 第5个字段
- **选项值**:
  - `Y` - 年 (Years)
  - `M` - 月 (Months)
  - `W` - 周 (Weeks)
  - `D` - 天 (Days)
  - `H` - 少于24小时 (Less than 24 hours)
- **衍生字段**: "解决您将在美国居住的地方"地址表单组（条件显示：当值 ≠ `H` 时显示，= `H` 时隐藏）

### 6. 解决您将在美国居住的地方 / Address Where You Will Stay（条件显示）
- **显示条件**: `data.travel_plan.length_of_stay.period` ≠ `H`（少于24小时）时显示；= `H` 时整个区域隐藏
- **字段类型**: 地址表单组
- **布局**: 第6-11个字段
- **子字段**:
  - **州** (ID: `data.address_you_will_stay.state`) - 下拉选择框，必填，56个选项（美国各州+领地）
  - **市** (ID: `data.address_you_will_stay.city`) - 文本输入框，必填
  - **街道地址** (ID: `data.address_you_will_stay.street_addr1`) - 文本输入框，必填
  - **邮编/邮政编码** (ID: `data.address_you_will_stay.zip_code`) - 文本输入框
- **州选项**: AL, AK, AS, AZ, AR, CA, CO, CT, DE, DC, FL, GA, GU, HI, ID, IL, IN, IA, KS, KY, LA, ME, MD, MA, MI, MN, MS, MO, MT, NE, NV, NH, NJ, NM, NY, NC, ND, MP, OH, OK, OR, PA, PR, RI, SC, SD, TN, TX, UT, VT, VI, VA, WA, WV, WI, WY（共56个）
- **衍生字段**: 无（州下拉框不触发任何条件字段）

### 7. 个人/实体支付您的行程 / Who Will Pay for Your Trip
- **字段ID**: `data.paying_person_for_trip`
- **字段类型**: 下拉选择框 (select dropdown, Ant Design Select)
- **必填**: 是 (标记 *)
- **布局**: 第13个字段
- **选项值**:
  - `本人 (S)` - 本人
  - `他人 (O)` - 他人
  - `其他公司/组织 (C)` - 其他公司/组织
- **衍生字段**: 根据选择显示不同的支付信息表单（详见下方）

---

## 隐藏字段

| 字段ID | 说明 |
|--------|------|
| `data.purpose_info_type` | 始终隐藏，hidden input |

---

## 字段交互逻辑

### 条件字段显示规则

1. **签证类别选择**:
   - 触发条件: "这次来美国的目的" 选择了任意一个选项
   - 衍生字段: "请选择签证类别" 下拉框
   - 选项内容: 取决于所选的出行目的（见上方映射表）
   - 更换出行目的时，签证类别重置为"请选择"

2. **"解决您将在美国居住的地方"地址区域**:
   - 触发条件: "请明确说明" 选择了 `Y`/`M`/`W`/`D`（年/月/周/天）时显示
   - 隐藏条件: "请明确说明" 选择了 `H`（少于24小时）时隐藏
   - 衍生字段: 州（下拉）、市、街道地址、邮编/邮政编码

3. **支付者为"他人"(O)时** - 显示6个字段 + 条件地址字段:

| 字段ID | 标签 | 类型 | 必填 |
|--------|------|------|------|
| `data.paying_person_info.surname` | 支付旅行的人的姓氏 | text | 是 |
| `data.paying_person_info.given_name` | 支付旅行的人的名字 | text | 是 |
| `data.paying_person_info.tel_number` | 支付旅行费用的人的电话号码 | text | 是 |
| `data.paying_person_info.email` | 付款人的电子邮件 | text | 否（提示"如果不适用，请留空"） |
| `data.paying_person_info.relationship` | 与你的关系 | select | 是 |
| `data.paying_person_info.address_same` | 支付旅行费用的一方的地址与您的家庭住址或邮寄地址是否相同？ | radio | 是 |

**"与你的关系"选项**:
| 值 | 标签 |
|----|------|
| C | 子女 (Child) |
| P | 父母 (Parent) |
| S | 配偶 (Spouse) |
| R | 其他亲属 (Other relative) |
| F | 朋友 (Friend) |
| O | 其他 (Other) |

**"地址是否相同"条件字段**:
- 选"有"(相同) → 无额外字段
- 选"没有"(不同) → 显示完整地址表单:

| 字段ID | 标签 | 类型 | 必填 |
|--------|------|------|------|
| `data.paying_person_info.address.country` | 国家 | select | 是 |
| `data.paying_person_info.address.state` | 州/省/地区 | text | 是 |
| `data.paying_person_info.address.city` | 市 | text | 是 |
| `data.paying_person_info.address.street_addr1` | 街道地址 | text | 是 |
| `data.paying_person_info.address.zip_code` | 邮编/邮政编码 | text | 是 |

4. **支付者为"其他公司/组织"(C)时** - 显示10个字段:

| 字段ID | 标签 | 类型 | 必填 |
|--------|------|------|------|
| `data.paying_org_info.name` | 出差旅行的公司/组织名称 | text | 是 |
| `data.paying_org_info.tel_number` | 电话号码 | text | 是 |
| `data.paying_org_info.relationship` | 与你的关系 | text | 是 |
| `data.paying_person_info.address.country` | 公司/组织付款地址 - 国家 | select (252国家) | 是 |
| `data.paying_person_info.address.state` | 公司/组织付款地址 - 州/省 | text | 是 |
| `data.paying_person_info.address.city` | 公司/组织付款地址 - 市 | text | 是 |
| `data.paying_person_info.address.street_addr1` | 公司/组织付款地址 - 街道 | text | 是 |
| `data.paying_person_info.address.zip_code` | 公司/组织付款地址 - 邮编 | text | 是 |

5. **支付者为"本人"(S)时**: 无衍生字段

---

## 验证规则

1. **抵达日期**: 不能等于或早于今天
2. **电话号码**: 只接受数字（0-9），不接受连字符等特殊字符

---

## 技术细节

- Ant Design Select 组件用于下拉框，支持搜索功能
- Spinbutton 组件用于数字输入（带增减按钮）
- 签证类别下拉框根据出行目的动态过滤选项
- 支付者信息根据选择动态显示不同的表单组
- 表单验证在点击"下一个"时触发
- 错误信息以内联方式显示在字段下方

---

## 导航按钮

- **上一个**: 返回"个人信息"页
- **下一个**: 提交当前页并进入下一页（旅行伴侣）
- **保存并稍后继续**: 保存当前填写内容
