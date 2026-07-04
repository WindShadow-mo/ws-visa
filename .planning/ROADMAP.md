# Roadmap: 青青签证（ws-visa）

**Mode:** MVP (Vertical MVP)
**Granularity:** standard
**Created:** 2026-06-27

## Core Value

让用户能正确、完整、快速地填写签证所需的全部信息，并导出专业格式的 PDF 文件。

## Phases

- [x] **Phase 1: Foundation & i18n** — Schema 类型系统、国际化基础设施、基础字段组件 (completed 2026-06-27)
- [x] **Phase 2: UK Visa Form** — 英国签证申请表完整页面，9个分组，使用已有字段组件 (completed 2026-06-27)
- [x] **Phase 3: Data Persistence** — localStorage 自动保存、数据恢复、数据清除 (completed 2026-06-27)
- [x] **Phase 4: Validation** — 已取消，必填校验已在 Phase 2 通过 useFormValidator + 禁用按钮实现
- [x] **Phase 5: PDF Export** — html2canvas + jsPDF 所见即所得 PDF 生成、中文渲染、自动分页 (completed 2026-06-27)
- [x] **Phase 6: UI Polish** — 已取消
- [x] **Phase 7: 英国签证 — 表单内容重新设计** — 14 分组 180 字段完整签证补充信息表 (completed 2026-06-28)
- [x] **Phase 8: UK Visa Form — UI Redesign** — 全面 UI 排版改版（双列布局 + 视觉层级 + 分组交互 + 响应式） (completed 2026-06-28)
- [ ] **Phase 9: add 优化表单字段设计** — 优化表单字段组件（NationalityField + PhoneField + prefix/suffix + 视觉区分） (3 plans)
- [ ] **Phase 10: add 优化字段、控件** — TextField constraint、NumberField suffix、RadioField/CheckboxField 卡片式 (3 plans)
- [x] **Phase 11: 开发模式增加表单一键填充功能** — DEV 模式填充按钮 + mockFormData 样本数据 (1 plan) (completed 2026-07-03)

## Phase Details

### Phase 1: Foundation & i18n

**Goal**: 建立项目的 Schema 类型系统、国际化基础设施和基础字段组件，为后续所有功能提供地基
**Depends on**: Nothing (first phase)
**Requirements**: FORM-01, FORM-02, FORM-07, I18N-01, I18N-02, I18N-03
**Success Criteria** (what must be TRUE):

  1. 开发者可以通过 TypeScript 类型定义完整的表单 schema，包含字段分组、字段类型、条件规则等全部元信息
  2. 界面所有可见文字（标签、占位符、提示信息）通过 i18n key 引用，代码中无硬编码中英文字符串
  3. 用户切换语言后界面即时切换为中文或英文，刷新页面后语言选择自动恢复
  4. 基础字段组件（文本输入、数字输入、下拉选择、单选、多选、日期选择）可独立渲染并正确显示 i18n 标签
  5. 日期字段根据当前语言显示对应格式（中文 YYYY年MM月DD日 / 英文 MM/DD/YYYY），内部存储统一为 ISO 8601

**Plans**: 3 plans
Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Schema 类型系统 + vue-i18n 实例 + 中英文翻译文件

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — useLanguage composable + 日期格式化工具 + 测试基础设施

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03-PLAN.md — shadcn-vue 组件安装 + 六个字段组件 + 示例 Schema

**UI hint**: yes

### Phase 2: UK Visa Form

**Goal**: 构建英国签证（Standard Visitor Visa）申请表完整页面，使用已有字段组件，分 9 个 Accordion 分组，所有文字支持中英文
**Actual scope expanded**: 还完成了 PDF 导出、localStorage 持久化（含 schema 版本）、必填校验（useFormValidator）、FormActions 组件抽取、开发规范文档
**Depends on**: Phase 1
**Requirements**: UK-01, UK-02, UK-03
**Success Criteria** (what must be TRUE):

  1. 英国签证申请表页面可通过 `/uk-visa` 路由访问
  2. 表单使用 Accordion 折叠分组，用户可在同一页面展开/收起任意分组，不跳页
  3. 所有字段使用 Phase 1 已有的字段组件（TextField、DateField、SelectField 等），无硬编码中英文字符串
  4. 用户切换语言后表单标签即时切换中英文，刷新页面后语言选择自动恢复
  5. 首页有入口链接跳转到 `/uk-visa`

**Plans**: 1 plan
Plans:
**Wave 1**

- [x] 02-01-PLAN.md — UK Visa Form 申请表页面（Accordion + 路由 + i18n）

**UI hint**: yes

### Phase 3: Data Persistence

**Goal**: 表单数据自动持久化到 localStorage，支持数据恢复和清除，防止用户填写内容丢失
**Depends on**: Phase 2
**Requirements**: DATA-01, DATA-02, DATA-05
**Success Criteria** (what must be TRUE):

  1. 用户在表单中输入的每一次变更（ keystroke / selection / upload）自动保存到 localStorage，无需手动操作
  2. 刷新页面或关闭浏览器后重新打开，所有已填写数据自动恢复到表单对应字段中
  3. 用户可一键清除所有已保存数据，操作前弹出二次确认对话框，确认后数据完全清除

**Plans**: TBD

### Phase 4: Validation

**Goal**: 基于 Zod 的实时验证系统确保用户填写数据的完整性和正确性，引导用户发现并修正错误
**Depends on**: Phase 2
**Requirements**: VAL-01, VAL-02, VAL-03
**Success Criteria** (what must be TRUE):

  1. 用户在字段中输入或失焦时即时显示验证错误信息（如格式错误、必填未填、超出范围），无需等到提交
  2. 导出 PDF 前执行全表单验证，若存在未通过项则阻止导出并滚动/高亮所有错误字段
  3. 折叠面板标题上显示该分组的验证错误状态（如红点或错误计数），用户一眼可知哪些分组需要修正

**Plans**: TBD
**UI hint**: yes

### Phase 5: PDF Export

**Goal**: 将填写完成的签证表单导出为专业格式的 PDF 文件，中文字符正确显示，支持长表单自动分页
**Depends on**: Phase 4
**Requirements**: PDF-01, PDF-02, PDF-03, PDF-04
**Success Criteria** (what must be TRUE):

  1. 用户点击导出按钮后，系统生成包含全部已填内容的 PDF 文件并触发浏览器自动下载
  2. PDF 中所有中文字符正常渲染，无乱码、方块或空白（html2canvas 捕获渲染 DOM 天然支持 CJK）
  3. 长表单内容自动分页，分页处不在字段内容中间截断，每个字段完整显示在一页内
  4. 生成 PDF 过程中显示加载进度指示（如 loading spinner 或进度条），用户知道系统正在处理

**Plans**: TBD

### Phase 6: UI Polish

**Goal**: 提升整体用户体验，适配多种设备尺寸和用户偏好，使应用达到可交付的专业品质
**Depends on**: Phase 5
**Requirements**: UI-01, UI-02, UI-03, UI-04
**Success Criteria** (what must be TRUE):

  1. 页面在桌面端（>=1024px）和移动端（<768px）均正常显示和可操作，布局自适应无溢出
  2. 页面顶部或侧边显示填写进度指示（如"已完成 15/42 个字段"或进度条），用户随时了解填写完成度
  3. 用户可切换暗色/亮色主题，主题选择被记住并在下次访问时自动恢复
  4. 验证错误以清晰的红色提示文字展示，包含具体可操作的修正建议（而非仅显示错误代码）

**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & i18n | 4/4 | Complete    | 2026-06-27 |
| 2. Form Engine | 1/1 | Complete    | 2026-06-27 |
| 3. Data Persistence | 0/1 | Complete    | 2026-06-27 |
| 4. Validation | - | Canceled  | - |
| 5. PDF Export | 0/1 | Complete    | 2026-06-27 |
| 6. UI Polish | - | Canceled  | - |
| 7. UK Form Content Redesign | 2/2 | Complete | 2026-06-28 |
| 8. UK Visa Form UI Redesign | 2/2 | Complete   | 2026-06-28 |
| 9. add 优化表单字段设计 | 0/3 | Not started | - |
| 10. add 优化字段、控件 | 0/3 | Not started | - |
| 11. 开发模式增加表单一键填充功能 | 1/1 | Complete    | 2026-07-03 |

## Coverage

| Category | Requirements | Phase |
|----------|-------------|-------|
| Form Engine | FORM-01, FORM-02, FORM-07 | Phase 1 |
| Form Engine | FORM-03, FORM-04, FORM-05, FORM-06 | Phase 2 |
| Data Management | DATA-01, DATA-02, DATA-05 | Phase 3 |
| Validation | VAL-01, VAL-02, VAL-03 | Canceled |
| PDF Export | PDF-01, PDF-02, PDF-03, PDF-04 | Phase 5 |
| UI/UX | UI-01, UI-02, UI-03, UI-04 | Canceled |
| i18n | I18N-01, I18N-02, I18N-03 | Phase 1 |
| UK Form UI | UKUI-01, UKUI-02, UKUI-03, UKUI-04 | Phase 8 |

**Total v1: 17 requirements → 17 mapped ✓ → 0 unmapped**

### Phase 7: 英国签证 — 表单内容重新设计

**Goal:** 基于真实业务需求（参考签证代理补充信息表），重新设计英国签证表单内容，将现有 15 字段扩展为 14 分组 ~170 字段的完整签证补充信息表。保持现有架构模式（不抽取 schema），直接在 UKVisaForm.vue 中扩展字段和模板。
**Requirements**: FORM-05, FORM-06, DATA-01, DATA-02, DATA-05
**Depends on:** Phase 6
**Plans:** 2/2 plans complete

Plans:
**Wave 1**

- [x] 07-01-PLAN.md — i18n 扩展（zh-CN.json + en.json，14 分组 ~170 字段翻译）

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 07-02-PLAN.md — UKVisaForm.vue 重写（script 层 + template 14 分组 + 条件联动）+ 文档更新

### Phase 8: UK Visa Form — UI Redesign

**Goal:** 全面重新设计英国签证表单的 UI 排版 — 保留现有玻璃拟态风格（渐变背景 + 毛玻璃卡片），优化布局结构：双列字段排布、视觉层级改进、分组交互优化、响应式适配提升
**Requirements**: UKUI-01, UKUI-02, UKUI-03, UKUI-04
**Depends on:** Phase 7
**Success Criteria** (what must be TRUE):

  1. 字段在合适的位置采用双列布局（如短文本字段并排），长文本、地址等字段保持单列
  2. 14 个分组的视觉层级更清晰 — 组标题样式升级，组间分隔更明确
  3. 可重复组（同行人、子女等）的添加/删除交互更直观，视觉反馈更明确
  4. 移动端（<768px）下自动降级为单列布局，无水平溢出
  5. PDF 导出功能不受影响，打印样式与新布局一致

**Plans:** 2/2 plans complete

Plans:
**Wave 1**

- [x] 08-01-PLAN.md — 字段组件 span prop 扩展 + CSS Grid 6列基础 + 响应式 + 容器宽度

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 08-02-PLAN.md — 14 分组 span 分配 + previewSections span + PreviewModal Grid + 分组样式升级

### Phase 9: add 优化表单字段设计

**Goal:** 优化现有表单字段组件设计 — CountrySelectField 拆分为 NationalityField + PhoneField，TextField 增加 prefix icon / suffix 单位，SelectField 增加视觉区分
**Requirements**: OPT-01, OPT-02, OPT-03, OPT-04
**Depends on:** Phase 8
**Plans:** 3 plans

Plans:
**Wave 1**

- [ ] 09-01-PLAN.md — NationalityField.vue（从 CountrySelectField 提取，去除 kind prop）
- [ ] 09-02-PLAN.md — PhoneField.vue + TextField prefix/suffix + SelectField 视觉区分

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 09-03-PLAN.md — UKVisaForm 集成替换 + prefix icon / suffix 分配 + CountrySelectField 删除

### Phase 10: add 优化字段、控件

**Goal:** 优化现有表单字段组件的输入约束和视觉体验 — TextField constraint 预定义规则、NumberField suffix 金额单位、RadioField/CheckboxField 卡片式选项、可重复组条目 UI 轻量化
**Requirements**: —
**Depends on:** Phase 9
**Plans:** 3 plans

Plans:
**Wave 1**

- [ ] 10-01-PLAN.md — TextField constraint prop + NumberField suffix prop
- [ ] 10-02-PLAN.md — RadioField + CheckboxField 卡片式升级

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 10-03-PLAN.md — UKVisaForm 集成（金额字段 NumberField + constraint 分配 + 可重复组 UI）

### Phase 11: 开发模式增加表单一键填充功能

**Goal:** 为开发环境添加一键填充测试数据功能，点击后清空表单并填入覆盖所有条件分支的完整样本数据，加速开发和视觉验证
**Requirements**: —
**Depends on:** Phase 10
**Plans:** 1/1 plans complete

Plans:
**Wave 1**

- [x] 11-01-PLAN.md — mockFormData 样本数据 + FormActions 填充按钮 + UKVisaForm 填充逻辑

### Phase 12: pdf导出时增加水印，水印文件内容为站点名称

**Goal:** PDF 导出时增加平铺斜纹水印（站点名称"青青签证"）+ 导出期间全屏 loading 遮罩
**Requirements**: —
**Depends on:** Phase 11
**Plans:** 1/1 plans complete
**Verification:** ✅ Passed (2026-07-04)

Plans:
**Wave 1**

- [x] 12-01-PLAN.md — usePdfExport 水印函数（pdfmake watermark 属性）+ FormActions loading 遮罩（Teleport + z-[60]）

---
*Roadmap created: 2026-06-27*
