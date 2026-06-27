<script setup lang="ts">
// UKVisaForm — 英国标准访客签证申请表
// 使用 Accordion 分组，接入已有字段组件，所有可见文字通过 i18n 引用

import { computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import TextField from '@/components/fields/TextField.vue'
import DateField from '@/components/fields/DateField.vue'
import SelectField from '@/components/fields/SelectField.vue'
import type { SelectOption } from '@/components/fields/SelectField.vue'
import RadioField from '@/components/fields/RadioField.vue'
import type { RadioOption } from '@/components/fields/RadioField.vue'
import type { PreviewSection } from '@/composables/usePdfExport'
import { useApplicantName } from '@/composables/useApplicantName'
import FormActions from '@/components/FormActions.vue'

const { t, locale } = useI18n()

// 申请人姓名（公共能力）
const { buildPdfTitle, buildPdfFilename } = useApplicantName(
  () => (formData.lastName + formData.firstName).trim(),
)

// ---- 预览数据构建（通用 PreviewSection[] 格式） ----

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  if (locale.value === 'zh-CN') {
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }
  return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function resolveOption(options: Array<{ value: string; labelKey: string }>, value: string): string {
  const opt = options.find((o) => o.value === value)
  return opt ? t(opt.labelKey) : ''
}

const previewSections = computed<PreviewSection[]>(() => [
  {
    title: t('ukVisa.sections.personalInfo'),
    fields: [
      { label: t('ukVisa.fields.lastName.label'), value: formData.lastName, required: true },
      { label: t('ukVisa.fields.firstName.label'), value: formData.firstName, required: true },
      { label: t('ukVisa.fields.dateOfBirth.label'), value: formatDate(formData.dateOfBirth), required: true },
      { label: t('ukVisa.fields.nationality.label'), value: resolveOption(nationalityOptions, formData.nationality), required: true },
      { label: t('ukVisa.fields.gender.label'), value: resolveOption(genderOptions, formData.gender), required: true },
    ],
  },
  {
    title: t('ukVisa.sections.passportInfo'),
    fields: [
      { label: t('ukVisa.fields.passportNumber.label'), value: formData.passportNumber, required: true },
      { label: t('ukVisa.fields.passportIssueDate.label'), value: formatDate(formData.passportIssueDate), required: true },
      { label: t('ukVisa.fields.passportExpiryDate.label'), value: formatDate(formData.passportExpiryDate), required: true },
      { label: t('ukVisa.fields.issuingAuthority.label'), value: formData.issuingAuthority, required: true },
    ],
  },
  {
    title: t('ukVisa.sections.travelPlan'),
    fields: [
      { label: t('ukVisa.fields.purposeOfVisit.label'), value: resolveOption(purposeOptions, formData.purposeOfVisit), required: true },
      { label: t('ukVisa.fields.intendedArrivalDate.label'), value: formatDate(formData.intendedArrivalDate), required: true },
      { label: t('ukVisa.fields.intendedDepartureDate.label'), value: formatDate(formData.intendedDepartureDate), required: true },
      { label: t('ukVisa.fields.ukAddress.label'), value: formData.ukAddress },
    ],
  },
  {
    title: t('ukVisa.sections.contactInfo'),
    fields: [
      { label: t('ukVisa.fields.email.label'), value: formData.email, required: true },
      { label: t('ukVisa.fields.phone.label'), value: formData.phone, required: true },
    ],
  },
])

useHead({
  title: () => t('ukVisa.title'),
})

// localStorage key
const STORAGE_KEY = 'ws-visa-uk-form-data'

// 表单默认结构（key 的集合决定 schema 版本）
const defaultData = {
  // 个人信息
  lastName: '',
  firstName: '',
  dateOfBirth: '',
  nationality: '',
  gender: '',

  // 护照信息
  passportNumber: '',
  passportIssueDate: '',
  passportExpiryDate: '',
  issuingAuthority: '',

  // 旅行计划
  purposeOfVisit: '',
  intendedArrivalDate: '',
  intendedDepartureDate: '',
  ukAddress: '',

  // 联系方式
  email: '',
  phone: '',
}

// 从全部 key 计算 schema 版本：字段增删或重命名时版本自动变化
const SCHEMA_VERSION = Object.keys(defaultData).sort().join('|')

// 从 localStorage 加载已保存的表单数据（版本不匹配则丢弃）
function loadSavedData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed._schemaVersion === SCHEMA_VERSION) {
        return parsed.data
      }
      // 版本不匹配，清除旧数据
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // 解析失败时忽略
  }
  return null
}

const savedData = loadSavedData()

// 表单数据
const formData = reactive({
  lastName: savedData?.lastName ?? defaultData.lastName,
  firstName: savedData?.firstName ?? defaultData.firstName,
  dateOfBirth: savedData?.dateOfBirth ?? defaultData.dateOfBirth,
  nationality: savedData?.nationality ?? defaultData.nationality,
  gender: savedData?.gender ?? defaultData.gender,
  passportNumber: savedData?.passportNumber ?? defaultData.passportNumber,
  passportIssueDate: savedData?.passportIssueDate ?? defaultData.passportIssueDate,
  passportExpiryDate: savedData?.passportExpiryDate ?? defaultData.passportExpiryDate,
  issuingAuthority: savedData?.issuingAuthority ?? defaultData.issuingAuthority,
  purposeOfVisit: savedData?.purposeOfVisit ?? defaultData.purposeOfVisit,
  intendedArrivalDate: savedData?.intendedArrivalDate ?? defaultData.intendedArrivalDate,
  intendedDepartureDate: savedData?.intendedDepartureDate ?? defaultData.intendedDepartureDate,
  ukAddress: savedData?.ukAddress ?? defaultData.ukAddress,
  email: savedData?.email ?? defaultData.email,
  phone: savedData?.phone ?? defaultData.phone,
})

// 自动保存到 localStorage（携带版本号）
watch(
  formData,
  (newVal) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        _schemaVersion: SCHEMA_VERSION,
        data: newVal,
      }))
    } catch {
      // 存储失败时忽略
    }
  },
  { deep: true },
)

// 清除数据（二次确认）
function clearForm() {
  if (!confirm(t('ukVisa.clearConfirm'))) return
  for (const key of Object.keys(formData) as Array<keyof typeof formData>) {
    formData[key] = ''
  }
  localStorage.removeItem(STORAGE_KEY)
}

// 国籍选项
const nationalityOptions: SelectOption[] = [
  { value: 'CN', labelKey: 'ukVisa.options.nationality.CN' },
  { value: 'US', labelKey: 'ukVisa.options.nationality.US' },
  { value: 'GB', labelKey: 'ukVisa.options.nationality.GB' },
  { value: 'OTHER', labelKey: 'ukVisa.options.nationality.OTHER' },
]

// 性别选项
const genderOptions: RadioOption[] = [
  { value: 'male', labelKey: 'ukVisa.options.gender.male' },
  { value: 'female', labelKey: 'ukVisa.options.gender.female' },
  { value: 'other', labelKey: 'ukVisa.options.gender.other' },
]

// 访问目的选项
const purposeOptions: SelectOption[] = [
  { value: 'tourism', labelKey: 'ukVisa.options.purposeOfVisit.tourism' },
  { value: 'business', labelKey: 'ukVisa.options.purposeOfVisit.business' },
  { value: 'familyVisit', labelKey: 'ukVisa.options.purposeOfVisit.familyVisit' },
  { value: 'study', labelKey: 'ukVisa.options.purposeOfVisit.study' },
  { value: 'medical', labelKey: 'ukVisa.options.purposeOfVisit.medical' },
  { value: 'other', labelKey: 'ukVisa.options.purposeOfVisit.other' },
]
</script>

<template>
  <div class="form-page">
    <div class="form-container">
      <!-- 面包屑导航 -->
      <nav class="form-breadcrumb">
        <RouterLink to="/" class="hover:text-foreground transition-colors">
          ← {{ t('common.home') }}
        </RouterLink>
        <span class="text-muted-foreground/50">/</span>
        <span class="text-foreground font-medium">{{ t('ukVisa.title') }}</span>
      </nav>

      <!-- 标题区域 + 操作栏 -->
      <FormActions
        :sections="previewSections"
        :form-title="t('ukVisa.title')"
        :form-subtitle="t('ukVisa.subtitle')"
        :build-pdf-title="buildPdfTitle"
        :build-pdf-filename="buildPdfFilename"
        i18n-prefix="ukVisa"
        @clear="clearForm"
      />

      <!-- 表单容器 - 毛玻璃效果 -->
      <div class="glass-card">
        <Accordion type="multiple" class="w-full" :default-value="['personal-info']">
          <!-- 个人信息 -->
          <AccordionItem value="personal-info">
            <AccordionTrigger>{{ t('ukVisa.sections.personalInfo') }}</AccordionTrigger>
            <AccordionContent>
              <div class="fields-grid">
                <TextField
                  name="lastName"
                  label-key="ukVisa.fields.lastName.label"
                  placeholder-key="ukVisa.fields.lastName.placeholder"
                  v-model="formData.lastName"
                  required
                />
                <TextField
                  name="firstName"
                  label-key="ukVisa.fields.firstName.label"
                  placeholder-key="ukVisa.fields.firstName.placeholder"
                  v-model="formData.firstName"
                  required
                />
                <DateField
                  name="dateOfBirth"
                  label-key="ukVisa.fields.dateOfBirth.label"
                  v-model="formData.dateOfBirth"
                  required
                />
                <SelectField
                  name="nationality"
                  label-key="ukVisa.fields.nationality.label"
                  :options="nationalityOptions"
                  v-model="formData.nationality"
                  required
                />
                <RadioField
                  name="gender"
                  label-key="ukVisa.fields.gender.label"
                  :options="genderOptions"
                  v-model="formData.gender"
                  required
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <!-- 护照信息 -->
          <AccordionItem value="passport-info">
            <AccordionTrigger>{{ t('ukVisa.sections.passportInfo') }}</AccordionTrigger>
            <AccordionContent>
              <div class="fields-grid">
                <TextField
                  name="passportNumber"
                  label-key="ukVisa.fields.passportNumber.label"
                  placeholder-key="ukVisa.fields.passportNumber.placeholder"
                  v-model="formData.passportNumber"
                  required
                />
                <DateField
                  name="passportIssueDate"
                  label-key="ukVisa.fields.passportIssueDate.label"
                  v-model="formData.passportIssueDate"
                  required
                />
                <DateField
                  name="passportExpiryDate"
                  label-key="ukVisa.fields.passportExpiryDate.label"
                  v-model="formData.passportExpiryDate"
                  required
                />
                <TextField
                  name="issuingAuthority"
                  label-key="ukVisa.fields.issuingAuthority.label"
                  placeholder-key="ukVisa.fields.issuingAuthority.placeholder"
                  v-model="formData.issuingAuthority"
                  required
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <!-- 旅行计划 -->
          <AccordionItem value="travel-plan">
            <AccordionTrigger>{{ t('ukVisa.sections.travelPlan') }}</AccordionTrigger>
            <AccordionContent>
              <div class="fields-grid">
                <SelectField
                  name="purposeOfVisit"
                  label-key="ukVisa.fields.purposeOfVisit.label"
                  :options="purposeOptions"
                  v-model="formData.purposeOfVisit"
                  required
                />
                <DateField
                  name="intendedArrivalDate"
                  label-key="ukVisa.fields.intendedArrivalDate.label"
                  v-model="formData.intendedArrivalDate"
                  required
                />
                <DateField
                  name="intendedDepartureDate"
                  label-key="ukVisa.fields.intendedDepartureDate.label"
                  v-model="formData.intendedDepartureDate"
                  required
                />
                <TextField
                  name="ukAddress"
                  label-key="ukVisa.fields.ukAddress.label"
                  placeholder-key="ukVisa.fields.ukAddress.placeholder"
                  v-model="formData.ukAddress"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <!-- 联系方式 -->
          <AccordionItem value="contact-info">
            <AccordionTrigger>{{ t('ukVisa.sections.contactInfo') }}</AccordionTrigger>
            <AccordionContent>
              <div class="fields-grid">
                <TextField
                  name="email"
                  label-key="ukVisa.fields.email.label"
                  placeholder-key="ukVisa.fields.email.placeholder"
                  v-model="formData.email"
                  required
                />
                <TextField
                  name="phone"
                  label-key="ukVisa.fields.phone.label"
                  placeholder-key="ukVisa.fields.phone.placeholder"
                  v-model="formData.phone"
                  required
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 页面背景 - 柔和渐变 */
.form-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.form-page::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: rotate 30s linear infinite;
  pointer-events: none;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.form-container {
  max-width: 720px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* 面包屑 */
.form-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.form-breadcrumb :deep(a) {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: all 0.2s;
}

.form-breadcrumb :deep(a:hover) {
  color: #fff;
  transform: translateX(-2px);
}

.form-breadcrumb :deep(span) {
  color: rgba(255, 255, 255, 0.4);
}

/* 毛玻璃卡片 - 优化版 */
.glass-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  padding: 0.75rem 2rem 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  box-shadow:
    0 12px 48px rgba(0, 0, 0, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

/* Accordion 触发器 */
.glass-card :deep(button[aria-expanded]) {
  padding: 1.25rem 0;
  font-weight: 600;
  font-size: 1.0625rem;
  color: #1a1a2e;
  transition: all 0.2s;
}

.glass-card :deep(button[aria-expanded]:hover) {
  color: #667eea;
}

.glass-card :deep(button[aria-expanded="true"]) {
  color: #667eea;
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, transparent 100%);
  padding-left: 0.5rem;
  margin-left: -0.5rem;
  border-radius: 0.5rem;
}

/* 字段区域 */
.fields-grid {
  display: grid;
  gap: 1.25rem;
  padding: 0.75rem 0;
}

/* 覆盖输入框样式 — 更精致 */
.glass-card :deep(input),
.glass-card :deep([role="combobox"]),
.glass-card :deep(select) {
  background: rgba(248, 250, 252, 0.8) !important;
  border: 1.5px solid rgba(226, 232, 240, 0.8) !important;
  border-radius: 0.75rem !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.9375rem;
}

.glass-card :deep(input:hover),
.glass-card :deep([role="combobox"]:hover),
.glass-card :deep(select:hover) {
  background: rgba(255, 255, 255, 0.95) !important;
  border-color: rgba(203, 213, 225, 0.9) !important;
}

.glass-card :deep(input:focus),
.glass-card :deep([role="combobox"]:focus),
.glass-card :deep(select:focus) {
  background: #fff !important;
  border-color: #667eea !important;
  box-shadow:
    0 0 0 4px rgba(102, 126, 234, 0.12),
    0 2px 8px rgba(102, 126, 234, 0.08) !important;
}

.glass-card :deep(input::placeholder) {
  color: rgba(148, 163, 184, 0.8) !important;
}

/* 标签 */
.glass-card :deep(label) {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  letter-spacing: -0.01em;
}

/* Radio 按钮区域 */
.glass-card :deep([role="radiogroup"]) {
  display: flex;
  gap: 1.5rem;
  padding-top: 0.5rem;
}

/* Radio 按钮样式优化 */
.glass-card :deep([role="radio"]) {
  transition: all 0.2s;
}

.glass-card :deep([role="radio"][aria-checked="true"]) {
  border-color: #667eea;
  background: #667eea;
}
</style>
