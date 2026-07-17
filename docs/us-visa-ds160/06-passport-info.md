# 第6节：护照信息 (Passport Information)

## 页面标题
护照信息

---

## 字段列表

### 1. 护照/旅行证件类型 / Passport/Travel Document Type
- **字段ID**: `data.doc_type`
- **字段类型**: 下拉选择框 (select dropdown, Ant Design Select)
- **必填**: 是 (标记 *)
- **布局**: 第1个字段
- **选项值**:
  - `普通` - 普通
  - `公务` - 公务
  - `外交` - 外交
  - `来往通行证` - 来往通行证
  - `其他` - 其他
- **衍生字段**: 当选择"其他"时，显示：
  - 说明 - 文本域 (textarea)，必填

### 2. 护照/旅行证件号码 / Passport/Travel Document Number
- **字段ID**: `data.doc_number`
- **字段类型**: 文本输入框 (text input)
- **必填**: 是 (标记 *)
- **布局**: 第2个字段

### 3. 护照号码 / Passport Book Number
- **字段ID**: `data.book_number`
- **字段类型**: 文本输入框 (text input)
- **必填**: 否
- **布局**: 第3个字段
- **说明**: 如果不适用，请留空

### 4. 签发护照/旅行证件的国家/当局 / Country/Authority That Issued Passport
- **字段ID**: `data.doc_authority`
- **字段类型**: 下拉选择框 (select dropdown, Ant Design Select)
- **必填**: 是 (标记 *)
- **布局**: 第4个字段
- **选项**: 约217个国家/地区，中文显示，支持搜索（从阿富汗到津巴布韦）

### 5. 发行城市 / Issuance City
- **字段ID**: `data.issued_location.city`
- **字段类型**: 文本输入框 (text input)
- **必填**: 是 (标记 *)
- **布局**: 第5个字段

### 6. 州/省*如果护照上显示 / State/Province (if shown on passport)
- **字段ID**: `data.issued_location.state`
- **字段类型**: 文本输入框 (text input)
- **必填**: 否
- **布局**: 第6个字段

### 7. 国家/地区 / Country/Region
- **字段ID**: `data.issued_location.country`
- **字段类型**: 下拉选择框 (select dropdown, Ant Design Select)
- **必填**: 是 (标记 *)
- **布局**: 第7个字段
- **选项**: 约217个国家/地区，中文显示，支持搜索（从阿富汗到津巴布韦）

### 8. 发行日期 / Issuance Date
- **字段类型**: 日期选择器 (3个下拉框组合)
- **必填**: 是 (标记 *)
- **布局**: 第8个字段
- **子字段**:
  - **DAY** (ID: `data.issuance_date_v2.DD`) - 下拉选择框，选项：01-31
  - **MONTH** (ID: `data.issuance_date_v2.MMM`) - 下拉选择框，选项：一月至十二月
  - **YEAR** (ID: `data.issuance_date_v2.YYYY`) - 文本输入框，4位数字

### 9. 截止日期 / Expiration Date
- **字段类型**: 日期选择器 (3个下拉框组合)
- **必填**: 是 (标记 *)
- **布局**: 第9个字段
- **子字段**:
  - **DAY** (ID: `data.expiration_date_v2.DD`) - 下拉选择框，选项：01-31
  - **MONTH** (ID: `data.expiration_date_v2.MMM`) - 下拉选择框，选项：一月至十二月
  - **YEAR** (ID: `data.expiration_date_v2.YYYY`) - 文本输入框，4位数字

### 10. 没有到期 / No Expiration Date
- **字段ID**: `data.expiration_date_NA`
- **字段类型**: 复选框 (checkbox)
- **必填**: 否
- **布局**: 第10个字段
- **标签**: 没有到期
- **功能**: 勾选后，截止日期字段被清空并禁用（月/日下拉框清空，年份输入框disabled）；取消勾选恢复

### 11. 你有丢过或被偷过护照吗？ / Have you lost or had a passport stolen?
- **字段类型**: 单选按钮组 (radio group)
- **必填**: 是 (标记 *)
- **布局**: 第11个字段
- **选项值**:
  - `true` - 有
  - `false` - 没有
- **衍生字段**: 当选择"有"(true)时，显示"护照丢失或被盗"子表单：
  - 护照号码丢失或被盗 - 文本输入框，必填
  - 不知道 - 复选框（勾选后可能跳过护照号码）
  - 签发国家 - 下拉选择框，必填
  - 说明 - 文本域 (textarea)，可添加多个

---

## 字段交互逻辑

### 条件字段显示规则

1. **没有到期**:
   - 触发条件: 勾选"没有到期"复选框
   - 影响: 截止日期字段被清空并禁用（月/日下拉框清空，年份输入框disabled）；取消勾选恢复

2. **护照类型"其他"**:
   - 触发条件: "护照/旅行证件类型" 选择 "其他"
   - 衍生字段: 说明 - 文本域 (textarea)，必填

3. **丢失/被盗护照**:
   - 触发条件: "你有丢过或被偷过护照吗" 选择 "有"(true)
   - 衍生字段: "护照丢失或被盗"子表单：
     - 护照号码丢失或被盗 - 文本输入框，必填
     - 不知道 - 复选框
     - 签发国家 - 下拉选择框，必填
     - 说明 - 文本域，可添加多个

---

## 技术细节

- Ant Design Select 组件用于下拉框
- 日期选择器由3个 ant-select 组合
- 复选框使用 `ant-checkbox` 组件
- 表单验证在点击"下一个"时触发

---

## 导航按钮

- **上一个**: 返回"申请人联系方式"页
- **下一个**: 提交当前页并进入下一页（美国联系点）
- **保存并稍后继续**: 保存当前填写内容
