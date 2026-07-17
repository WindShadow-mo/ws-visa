# 第8节：亲属信息 (Family Information)

## 页面标题
亲属信息：您的父母

---

## 子标题1：父亲信息

### 1. 父亲的姓（姓）/ Father's Surname
- **字段ID**: `data.father.surname`
- **字段类型**: 文本输入框 (text input)
- **必填**: 是 (标记 *)
- **布局**: 第1个字段
- **配套复选框**: "不知道" (ID: `data.father.surname_NA`) - **默认勾选**，勾选后禁用文本输入框

### 2. 父亲的名（名）/ Father's Given Name
- **字段ID**: `data.father.given_name`
- **字段类型**: 文本输入框 (text input)
- **必填**: 是 (标记 *)
- **布局**: 第2个字段
- **配套复选框**: "不知道" (ID: `data.father.given_name_NA`) - **默认勾选**，勾选后禁用文本输入框

### 3. 父亲的生日 / Father's Date of Birth (条件显示)
- **字段类型**: 日期选择器 (3个下拉框组合)
- **必填**: 是 (标记 *)
- **布局**: 第3个字段
- **条件显示**: 当 surname_NA 或 given_name_NA 任一取消勾选时显示
- **子字段**:
  - **DAY** (ID: `data.father.birthday_v2.DD`) - 下拉选择框，选项：01-31
  - **MONTH** (ID: `data.father.birthday_v2.MMM`) - 下拉选择框，选项：一月至十二月
  - **YEAR** (ID: `data.father.birthday_v2.YYYY`) - 文本输入框，4位数字
- **配套复选框**: "不知道" (ID: `data.father.birthday_NA`) - 勾选后禁用日期选择器

### 4. 你父亲在美国吗？/ Is your father in the US? (条件显示)
- **字段类型**: 单选按钮组 (radio group)
- **必填**: 是 (标记 *)
- **布局**: 第4个字段
- **条件显示**: 当 surname_NA 或 given_name_NA 任一取消勾选时显示
- **选项值**:
  - `true` - 有
  - `false` - 没有
- **衍生字段**: 当选择"有"(true)时，显示：
  - 父亲的身份 (ID: `data.father.status`) - 下拉选择框，必填，选项：
    1. 美国公民
    2. 美国合法永久居民
    3. 非移民
    4. 其他/我不知道

---

## 子标题2：母亲信息

### 5. 母亲的姓（姓）/ Mother's Surname
- **字段ID**: `data.mother.surname`
- **字段类型**: 文本输入框 (text input)
- **必填**: 是 (标记 *)
- **布局**: 第5个字段
- **配套复选框**: "不知道" (ID: `data.mother.surname_NA`) - **默认勾选**，勾选后禁用文本输入框

### 6. 母亲的名（名）/ Mother's Given Name
- **字段ID**: `data.mother.given_name`
- **字段类型**: 文本输入框 (text input)
- **必填**: 是 (标记 *)
- **布局**: 第6个字段
- **配套复选框**: "不知道" (ID: `data.mother.given_name_NA`) - **默认勾选**，勾选后禁用文本输入框

### 7. 母亲的生日 / Mother's Date of Birth (条件显示)
- **字段类型**: 日期选择器 (3个下拉框组合)
- **必填**: 是 (标记 *)
- **布局**: 第7个字段
- **条件显示**: 当 surname_NA 或 given_name_NA 任一取消勾选时显示
- **子字段**:
  - **DAY** (ID: `data.mother.birthday_v2.DD`) - 下拉选择框
  - **MONTH** (ID: `data.mother.birthday_v2.MMM`) - 下拉选择框
  - **YEAR** (ID: `data.mother.birthday_v2.YYYY`) - 文本输入框
- **配套复选框**: "不知道" (ID: `data.mother.birthday_NA`) - 勾选后禁用日期选择器

### 8. 你妈妈在美国吗？/ Is your mother in the US? (条件显示)
- **字段类型**: 单选按钮组 (radio group)
- **必填**: 是 (标记 *)
- **布局**: 第8个字段
- **条件显示**: 当 surname_NA 或 given_name_NA 任一取消勾选时显示
- **选项值**:
  - `true` - 有
  - `false` - 没有
- **衍生字段**: 当选择"有"(true)时，显示：
  - 母亲的身分 (ID: `data.mother.status`) - 下拉选择框，必填，选项：
    1. 美国公民
    2. 美国合法永久居民
    3. 非移民
    4. 其他/我不知道

---

## 子标题3：您的亲戚 (Other Relatives)

### 9. 您在美国境内，是否还有其他直系亲属（除父母以外）?
- **字段类型**: 单选按钮组 (radio group)
- **必填**: 是 (标记 *)
- **布局**: 第9个字段
- **选项值**:
  - `true` - 有
  - `false` - 没有
- **说明**: 指未婚夫/未婚妻，配偶（丈夫/妻子），孩子（儿子/女儿）或兄弟姐妹（兄弟/姐妹）
- **衍生字段**: 当选择"有"(true)时，显示：
  - 姓 (ID: `data.others[0].surname`) - 文本输入框，必填
  - 名字 (ID: `data.others[0].given_name`) - 文本输入框，非必填
  - 与你的关系 (ID: `data.others[0].relationship`) - 下拉选择框，必填
  - 移民身份 (ID: `data.others[0].immigration_status`) - 下拉选择框，必填
  - "加上另一个"按钮 - 可添加多个直系亲属

**"与你的关系"选项（美国境内直系亲属专用，4个）**:
| 值 | 标签 |
|----|------|
| SPOUSE | 配偶 (Spouse) |
| ENGAGED | 未婚夫/未婚妻 (Fiancé/Fiancée) |
| CHILD | 孩子 (Child) |
| SIBLING | 兄弟姐妹 (Brother/Sister) |

**"移民身份"选项**:
| 值 | 标签 |
|----|------|
| US_CITIZEN | 美国公民 |
| PERMANENT_RESIDENT | 美国合法永久居民 |
| NON_IMMIGRANT | 非移民 |
| OTHER | 其他/我不知道 |

### 10. 您在美国境内，是否还有其他亲戚（除父母和直系亲属以外）？
- **字段类型**: 单选按钮组 (radio group)
- **必填**: 是 (标记 *)
- **布局**: 第10个字段
- **选项值**:
  - `true` - 有
  - `false` - 没有
- **衍生字段**: 当选择"有"(true)时，显示与上面相同的字段结构（姓、名字、关系、移民身份 + "加上另一个"按钮）

---

## 子标题4：配偶/伴侣信息 (Spouse/Partner Information)

### 11. 配偶/合伙人的姓氏 / Spouse's Surname
- **字段ID**: `data.spouse.surname`
- **字段类型**: 文本输入框 (text input)
- **必填**: 是 (标记 *)
- **布局**: 第11个字段

### 12. 配偶/合伙人的名字 / Spouse's Given Name
- **字段ID**: `data.spouse.given_name`
- **字段类型**: 文本输入框 (text input)
- **必填**: 是 (标记 *)
- **布局**: 第12个字段

### 13. 配偶/伴侣的生日 / Spouse's Date of Birth
- **字段类型**: 日期选择器 (3个下拉框组合)
- **必填**: 是 (标记 *)
- **布局**: 第13个字段
- **子字段**:
  - **DAY** (ID: `data.spouse.birthday_v2.DD`) - 下拉选择框
  - **MONTH** (ID: `data.spouse.birthday_v2.MMM`) - 下拉选择框
  - **YEAR** (ID: `data.spouse.birthday_v2.YYYY`) - 文本输入框

### 14. 国籍 / Nationality
- **字段ID**: `data.spouse.nationality`
- **字段类型**: 下拉选择框 (combobox, Ant Design Select)
- **必填**: 是 (标记 *)
- **布局**: 第14个字段
- **选项**: 约280个国家/地区，中文显示，支持搜索

### 15. 出生地 / Place of Birth
- **字段类型**: 地址表单组
- **布局**: 第15-16个字段
- **子字段**:
  - **市** (ID: `data.spouse.place_of_birth.city`) - 文本输入框，必填
  - **国家** (ID: `data.spouse.place_of_birth.country`) - 下拉选择框，必填

### 16. 地址 / Address
- **字段ID**: `data.spouse.address_type`
- **字段类型**: 下拉选择框 (combobox, Ant Design Select)
- **必填**: 是 (标记 *)
- **布局**: 第17个字段
- **选项值** (5个):
  - `与家庭住址相同` - 无衍生字段
  - `与邮寄地址相同` - 无衍生字段
  - `与美国联系地址相同` - 无衍生字段
  - `不知道` - 无衍生字段
  - `其他 (指定地址)` - 显示完整地址表单：
    - 国家 - 下拉选择框，必填
    - 州/省/地区 (ID: `data.spouse.address.state`) - 文本输入框，必填
    - 市 (ID: `data.spouse.address.city`) - 文本输入框，必填
    - 街道地址 (ID: `data.spouse.address.street_addr1`) - 文本输入框，必填
    - 邮编/邮政编码 (ID: `data.spouse.address.zip_code`) - 文本输入框，必填

---

## 字段交互逻辑

### 条件字段显示规则

1. **父亲"不知道"复选框**:
   - 默认状态: surname_NA 和 given_name_NA 都默认勾选
   - 触发条件: 取消勾选任一姓名的"不知道"复选框
   - 影响: 显示生日日期选择器 + "在美国吗"单选按钮

2. **父亲在美国**:
   - 触发条件: "你父亲在美国吗" 选择 "有"(true)
   - 衍生字段: 父亲的身份 - 下拉选择框（美国公民/合法永久居民/非移民/其他）

3. **母亲"不知道"复选框**:
   - 与父亲相同的逻辑
   - 默认状态: surname_NA 和 given_name_NA 都默认勾选
   - 触发条件: 取消勾选任一姓名的"不知道"复选框
   - 影响: 显示生日日期选择器 + "在美国吗"单选按钮

4. **母亲在美国**:
   - 触发条件: "你妈妈在美国吗" 选择 "有"(true)
   - 衍生字段: 母亲的身分 - 下拉选择框（美国公民/合法永久居民/非移民/其他）

5. **直系亲属**:
   - 触发条件: 选择 "有"(true)
   - 衍生字段: 姓 + 名字 + 关系 + 移民身份 + "加上另一个"按钮

6. **其他亲戚**:
   - 触发条件: 选择 "有"(true)
   - 衍生字段: 与直系亲属相同的字段结构

7. **配偶地址**:
   - 触发条件: "地址"选择 "其他 (指定地址)"
   - 衍生字段: 完整地址表单（街道、城市、州、邮编、国家）

---

## 技术细节

- 复选框使用 `ant-checkbox` 组件，勾选后禁用对应输入框
- 日期选择器由3个 ant-select 组合
- 配偶地址有5个选项，只有"其他"触发衍生字段
- 亲属信息支持动态添加（"加上另一个"按钮）
- 表单验证在点击"下一个"时触发

---

## 导航按钮

- **上一个**: 返回"美国联系点"页
- **下一个**: 提交当前页并进入下一页（当前工作/教育/培训信息）
- **保存并稍后继续**: 保存当前填写内容
