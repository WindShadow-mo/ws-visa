# ws-visa

## 技术栈

- **框架**: Vue 3.5 + TypeScript + Vite 8
- **UI**: shadcn-vue (v4) + Reka UI + Tailwind CSS v3
- **路由**: vue-router v4
- **工具**: @vueuse/core, class-variance-authority, clsx, tailwind-merge, @lucide/vue

## 常用命令

```bash
npm run dev       # 启动开发服务器（自动打开浏览器）
npm run build     # 类型检查 + 生产构建
npm run preview   # 预览生产构建
npx shadcn-vue@latest add <组件名>  # 添加 shadcn 组件
```

## 项目结构

```
src/
├── assets/          # 静态资源
├── components/      # 通用组件
│   └── ui/          # shadcn-vue 组件（由 CLI 生成，勿手动修改）
├── composables/     # 组合式函数
├── config/          # 站点配置（site.ts 控制站名、描述等）
├── layouts/         # 页面布局
├── lib/utils.ts     # cn() 工具函数
├── router/          # 路由配置
├── views/           # 页面视图
├── App.vue          # 根组件（通过 @unhead/vue 设置页面 title）
├── main.ts          # 入口文件
└── style.css        # 全局样式 + Tailwind 指令 + CSS 变量
```

## 路径别名

`@/` → `src/`，已在 `tsconfig.app.json` 和 `vite.config.ts` 中配置。

## 操作约束
- 禁止自行执行git commit

## 开发规范

- `components/ui/` 目录下的文件由 shadcn CLI 生成，不要手动编辑，通过 `npx shadcn-vue@latest add` 管理
- 全局 CSS 变量定义在 `src/style.css`，颜色使用 HSL 格式（如 `hsl(var(--primary))`）
- Tailwind 扩展配置在 `tailwind.config.js`，新增颜色/圆角等在此处添加
- 暗色模式通过 `.dark` class 控制（非系统偏好），切换逻辑需手动实现

## 公共能力文档

详见 `docs/` 目录：

- [PDF 导出 & 预览](docs/pdf-export-preview.md) — `usePdfExport`、`PreviewModal`、`useApplicantName` 的接口说明
- [签证表单开发规范](docs/form-dev-guide.md) — 新增签证表单时的文件命名、i18n 结构、字段组件、持久化、`FormActions` 接入清单
- [英国签证表单设计](docs/uk-visa-form-design.md) — 英国签证模块的功能设计、字段结构、条件联动、动态分组逻辑
- [美国签证 DS-160 表单设计](docs/us-visa-ds160-form-design.md) — DS-160 美签模块的功能设计、字段结构、条件联动、安全审查问题

## 经验教训

- **文档冲突时以专项设计文档为准**：`uk-visa-form-design.md`（专项）优先级高于 `form-dev-guide.md`（通用规则）。实现字段布局时先看专项设计的 §2.3 三层结构清单，不要只看通用规则的默认值表。两份文档矛盾时必须向用户指出，不能自行选择一个执行。
- **§2.3 三层结构清单是最终布局依据**：每个分组的 `L1 → L2 → L3` 结构清单中，同行字段用 `/` 分隔并注明 span，这就是实际排版。详细规格表（§1-§13）和 §10.6 span 清单必须与 §2.3 保持一致。
- **`components/ui/` 的 shadcn 组件需要按需调整默认值**：虽然原则上不应手动编辑 shadcn CLI 生成的组件，但 shadcn-vue 的默认值不一定适合本项目。当前已有两处必要的默认值覆盖（详见 `form-dev-guide.md §5.2.5`）：① `SelectContent.vue` 的 `bodyLock: false`（防止与 `scrollbar-gutter: stable` 双倍补偿导致页面抖动）；② `PopoverContent.vue` 的 `updatePositionStrategy: "optimized"`（防止每帧重算位置与入场动画冲突导致抖动）。这些修改在 `npx shadcn-vue add` 重新生成组件后需要重新应用。
- **Sticky header 必须放在 glass-card 外部**：`backdrop-filter` 和 `transform` 会创建隐式 containing block，导致其内部 `position: sticky` 子元素失效。`FormActions` 必须包裹在 `.sticky-header-wrapper`（sticky）内、`.glass-card`（backdrop-filter）外；`translateZ(0)` 隔离手风琴动画抖动放在 `.accordion-layer`（Accordion 元素）而非 `.glass-card` 上。详见 `form-dev-guide.md §12.3`。
- **布局宽度策略**：`DefaultLayout` 的 Tailwind `container` 控制全局最大宽度（1536px @2xl）；表单页额外用 `.form-container`（`max-width: 1440px; width: 100%`）收窄表单区域，不使用百分比固定值，保证各分辨率下自适应居中。
- **lucide-vue-next 图标 `size` 只接受 `number`**：`LucideProps.size` 类型定义为 `24 | number`，不接受字符串（如 `'1.15em'`）。传字符串会导致 `vue-tsc` 编译报错、`npm run build` 失败。需要按像素值传入数字（如 `:size="14"`）。
- **FormActions 手机端需要响应式处理**：操作按钮行（填充测试数据、导出 PDF、清除数据）在 375px 宽度下水平溢出。解决方案：按钮容器加 `flex-wrap` 允许换行；`.form-header` 在 `@media (max-width: 640px)` 下改为 `flex-direction: column` 纵向堆叠；标题缩至 `1.5rem`、国旗图标缩至 `40×20px`。
