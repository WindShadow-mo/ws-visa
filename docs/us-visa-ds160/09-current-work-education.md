# 第9节：当前工作/教育/培训信息 (Current Work/Education/Training)

## 页面标题
当前工作/教育/培训信息

---

## 字段列表

### 1. 职业 / Occupation
- **字段ID**: `data.occupation`
- **字段类型**: 下拉选择框 (select dropdown, Ant Design Select)
- **必填**: 是 (标记 *)
- **布局**: 第1个字段
- **选项值** (22个):
  1. 农业
  2. 艺术家/表演者
  3. 商业
  4. 传媒
  5. 计算机科学
  6. 烹饪/餐饮服务
  7. 教育
  8. 工程
  9. 政府
  10. 家庭主妇/家庭主夫
  11. 法律职业
  12. 医疗/保健
  13. 军事
  14. 自然科学
  15. 失业
  16. 物理科学
  17. 宗教职业
  18. 研究
  19. 退休
  20. 社会科学
  21. 学生
  22. 其他
- **衍生字段**: 无——职业选择不影响其他字段的显示

### 2. 当前工作单位或学校名称 / Current Employer/School Name
- **字段ID**: `data.current_employer`
- **字段类型**: 文本输入框 (text input)
- **必填**: 是 (标记 *)
- **布局**: 第2个字段

### 3. 地址 / Address
- **字段类型**: 地址表单组
- **布局**: 第3-7个字段
- **子字段**:
  - **国家** (ID: `data.current_address.country`) - 下拉选择框，必填
  - **州/省/地区** (ID: `data.current_address.state`) - 文本输入框，必填
  - **市** (ID: `data.current_address.city`) - 文本输入框，必填
  - **街道地址** (ID: `data.current_address.street_addr1`) - 文本输入框，必填
  - **邮编/邮政编码** (ID: `data.current_address.zip_code`) - 文本输入框，必填

### 4. 电话 / Phone Number
- **字段ID**: `data.current_address.tel_number`
- **字段类型**: 文本输入框 (text input)
- **必填**: 是 (标记 *)
- **布局**: 第9个字段

### 5. 工作开始日期 / Start Date
- **字段类型**: 日期选择器 (3个下拉框组合)
- **必填**: 是 (标记 *)
- **布局**: 第10个字段
- **子字段**:
  - **DAY** (ID: `data.start_date_v2.DD`) - 下拉选择框，选项：01-31
  - **MONTH** (ID: `data.start_date_v2.MMM`) - 下拉选择框，选项：一月至十二月
  - **YEAR** (ID: `data.start_date_v2.YYYY`) - 文本输入框，4位数字

### 6. 以当地货币计的月收入（如果有的话）/ Monthly Income
- **字段ID**: `data.monthly_income`
- **字段类型**: 文本输入框 (text input)
- **必填**: 否
- **布局**: 第11个字段
- **说明**: 如果没有收入，请留空

### 7. 工作职责描述 / Job Description
- **字段ID**: `data.job_description`
- **字段类型**: 文本域 (textarea)
- **必填**: 是 (标记 *)
- **布局**: 第12个字段

---

## 字段交互逻辑

### 条件字段显示规则
- 无——所有选项都不产生衍生字段
- 职业下拉框选择不影响其他字段的显示

---

## 技术细节

- Ant Design Select 组件用于职业下拉框
- 地址表单组包含多个输入框
- 日期选择器由3个 ant-select 组合
- 表单验证在点击"下一个"时触发

---

## 导航按钮

- **上一个**: 返回"亲属信息"页
- **下一个**: 提交当前页并进入下一页（以前的工作/教育/培训信息）
- **保存并稍后继续**: 保存当前填写内容
