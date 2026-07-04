<script setup lang="ts">
// UKVisaForm — 英国标准访客签证补充信息表
// 13 分组，含条件联动和动态可重复组（add/remove rows）
// Section 顺序按 UX 重要性排列：身份 → 家庭 → 旅行 → 财力 → 历史 → 安全

import { computed, nextTick, provide, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { ArrowUp, Plus, Trash2 } from '@lucide/vue'
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
import NationalityField from '@/components/fields/NationalityField.vue'
import PhoneField from '@/components/fields/PhoneField.vue'
import RadioField from '@/components/fields/RadioField.vue'
import type { RadioOption } from '@/components/fields/RadioField.vue'
import NumberField from '@/components/fields/NumberField.vue'
import { nationalityOptions, phoneCountryCodeOptions } from '@/config/countryOptions'
import type { PreviewSection } from '@/composables/usePdfExport'
import { useApplicantName } from '@/composables/useApplicantName'
import FormActions from '@/components/FormActions.vue'
import { mockFormData } from '@/dev/mockFormData'

const { t, locale } = useI18n()

// 申请人姓名（公共能力）
const { buildPdfTitle, buildPdfFilename } = useApplicantName(
  () => (formData.lastName + formData.firstName).trim(),
)

// ---- 辅助函数 ----

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

// ---- 可重复组工厂函数 ----

function createCompanion() {
  return { name: '', dob: '', nationality: '', otherNationality: '', passport: '', relation: '' }
}
function createChild() {
  return { name: '', nationality: '', changedNationality: '', otherNationality: '', relation: '', dob: '', goingToUK: '', country: '', address: '' }
}
function createUkVisit() {
  return { date: '', duration: '', purpose: '' }
}
function createRefusal() {
  return { date: '', country: '', reason: '', refNumber: '' }
}
function createOtherCountry() {
  return { name: '', date: '', duration: '', purpose: '' }
}

// ---- 选项数组（必须在 previewSections 之前定义） ----

const genderOptions: RadioOption[] = [
  { value: 'male', labelKey: 'ukVisa.options.gender.male' },
  { value: 'female', labelKey: 'ukVisa.options.gender.female' },
  { value: 'other', labelKey: 'ukVisa.options.gender.other' },
]

// ---- 预览数据构建（13 个分组） ----

const previewSections = computed(() => [
  // 1. 基本信息
  {
    title: t('ukVisa.sections.personalInfo'),
    fields: [
      { label: t('ukVisa.fields.lastName.label'), value: formData.lastName, required: true, type: 'text', name: 'lastName', span: 'third' },
      { label: t('ukVisa.fields.firstName.label'), value: formData.firstName, required: true, type: 'text', name: 'firstName', span: 'third' },
      { label: t('ukVisa.fields.formerName.label'), value: formData.formerName, type: 'text', name: 'formerName', span: 'third' },
      { label: t('ukVisa.fields.dateOfBirth.label'), value: formatDate(formData.dateOfBirth), required: true, type: 'date', name: 'dateOfBirth' },
      { label: t('ukVisa.fields.gender.label'), value: resolveOption(genderOptions, formData.gender), required: true, type: 'radio', name: 'gender' },
      { label: t('ukVisa.fields.phoneCountryCode.label'), value: resolveOption(phoneCountryCodeOptions, formData.phoneCountryCode) || formData.phoneCountryCode, required: true, type: 'select', name: 'phoneCountryCode', span: 'third' },
      { label: t('ukVisa.fields.phone.label'), value: formData.phone, required: true, type: 'text', name: 'phone', span: 'third' },
      { label: t('ukVisa.fields.email.label'), value: formData.email, required: true, type: 'text', name: 'email', span: 'third' },
    ],
  },
  // 2. 证件与护照
  {
    title: t('ukVisa.sections.passportInfo'),
    fields: [
      { label: t('ukVisa.fields.nationality.label'), value: resolveOption(nationalityOptions, formData.nationality) || formData.nationality, required: true, type: 'select', name: 'nationality', span: 'third' },
      { label: t('ukVisa.fields.idCardNumber.label'), value: formData.idCardNumber, required: true, type: 'text', name: 'idCardNumber', span: 'third' },
      { label: t('ukVisa.fields.idCardAuthority.label'), value: formData.idCardAuthority, required: true, type: 'text', name: 'idCardAuthority', span: 'third' },
      { label: t('ukVisa.fields.idCardExpiry.label'), value: formData.idCardExpiry, required: true, type: 'date', name: 'idCardExpiry' },
      { label: t('ukVisa.fields.passportNumber.label'), value: formData.passportNumber, required: true, type: 'text', name: 'passportNumber', span: 'third' },
      { label: t('ukVisa.fields.passportIssueDate.label'), value: formatDate(formData.passportIssueDate), required: true, type: 'date', name: 'passportIssueDate' },
      { label: t('ukVisa.fields.passportExpiryDate.label'), value: formatDate(formData.passportExpiryDate), required: true, type: 'date', name: 'passportExpiryDate' },
      { label: t('ukVisa.fields.issuingAuthority.label'), value: resolveOption(nationalityOptions, formData.issuingAuthority), required: true, type: 'select', name: 'issuingAuthority', span: 'third' },
      { label: t('ukVisa.fields.isFirstPassport.label'), value: resolveOption(yesNoOptions, formData.isFirstPassport), required: true, type: 'radio', name: 'isFirstPassport' },
      { label: t('ukVisa.fields.hasOtherPassport.label'), value: resolveOption(yesNoOptions, formData.hasOtherPassport), required: true, type: 'radio', name: 'hasOtherPassport' },
      ...(formData.hasOtherPassport === 'yes'
        ? [
            { label: t('ukVisa.fields.otherPassportCountry.label'), value: resolveOption(nationalityOptions, formData.otherPassportCountry) || formData.otherPassportCountry, required: true, type: 'select', name: 'otherPassportCountry' as const, span: 'third' },
            { label: t('ukVisa.fields.otherPassportDetail.label'), value: formData.otherPassportDetail, required: true, type: 'text', name: 'otherPassportDetail' as const },
          ]
        : []),
    ],
  },
  // 3. 居住地址
  {
    title: t('ukVisa.sections.addressInfo'),
    fields: [
      { label: t('ukVisa.fields.currentCountry.label'), value: resolveOption(nationalityOptions, formData.currentCountry), required: true, type: 'select', name: 'currentCountry', span: 'third' },
      { label: t('ukVisa.fields.currentAddress.label'), value: formData.currentAddress, required: true, type: 'text', name: 'currentAddress' },
      { label: t('ukVisa.fields.postalCode.label'), value: formData.postalCode, type: 'text', name: 'postalCode', span: 'third' },
      { label: t('ukVisa.fields.housingStatus.label'), value: resolveOption(housingStatusOptions, formData.housingStatus), required: true, type: 'select', name: 'housingStatus', span: 'third' },
      { label: t('ukVisa.fields.residenceStartDate.label'), value: formatDate(formData.residenceStartDate), required: true, type: 'date', name: 'residenceStartDate' },
      ...(formData.housingStatus === 'tenant'
        ? [{ label: t('ukVisa.fields.houseOwner.label'), value: formData.houseOwner, required: true, type: 'text', name: 'houseOwner' as const, span: 'third' as const }]
        : []),
    ],
  },
  // 4. 婚姻与配偶
  {
    title: t('ukVisa.sections.marriageInfo'),
    fields: [
      { label: t('ukVisa.fields.maritalStatus.label'), value: resolveOption(maritalStatusOptions, formData.maritalStatus), required: true, type: 'radio', name: 'maritalStatus' },
      ...(formData.maritalStatus === 'married'
        ? [
            { label: t('ukVisa.fields.spouseName.label'), value: formData.spouseName, required: true, type: 'text', name: 'spouseName', span: 'third' as const },
            { label: t('ukVisa.fields.spouseNationality.label'), value: resolveOption(nationalityOptions, formData.spouseNationality) || formData.spouseNationality, required: true, type: 'select', name: 'spouseNationality', span: 'third' as const },
            { label: t('ukVisa.fields.spouseDob.label'), value: formatDate(formData.spouseDob), required: true, name: 'spouseDob', type: 'date' },
            { label: t('ukVisa.fields.spouseChangedNationality.label'), value: resolveOption(yesNoOptions, formData.spouseChangedNationality), required: true, type: 'radio', name: 'spouseChangedNationality' },
            { label: t('ukVisa.fields.spouseBirthCity.label'), value: formData.spouseBirthCity, required: true, type: 'text', name: 'spouseBirthCity' as const, span: 'third' as const },
            { label: t('ukVisa.fields.spouseCountry.label'), value: resolveOption(nationalityOptions, formData.spouseCountry), required: true, type: 'select', name: 'spouseCountry' as const, span: 'third' as const },
            { label: t('ukVisa.fields.spouseAddress.label'), value: formData.spouseAddress, required: true, type: 'text', name: 'spouseAddress' as const },
          ]
        : []),
    ],
  },
  // 5. 父母信息
  {
    title: t('ukVisa.sections.parentInfo'),
    fields: [
      { label: t('ukVisa.subLabels.father') + ' - ' + t('ukVisa.fields.father_name.label'), value: formData.father_name, required: true, type: 'text', name: 'father_name', span: 'third' },
      { label: t('ukVisa.fields.father_nationality.label'), value: resolveOption(nationalityOptions, formData.father_nationality) || formData.father_nationality, required: true, type: 'select', name: 'father_nationality', span: 'third' },
      { label: t('ukVisa.fields.father_dob.label'), value: formatDate(formData.father_dob), required: true, type: 'date', name: 'father_dob' },
      { label: t('ukVisa.fields.father_changed_nationality.label'), value: resolveOption(yesNoOptions, formData.father_changed_nationality), type: 'radio', name: 'father_changed_nationality' },
      { label: t('ukVisa.fields.father_going_to_uk.label'), value: resolveOption(yesNoOptions, formData.father_going_to_uk), required: true, type: 'radio', name: 'father_going_to_uk' },
      { label: t('ukVisa.fields.father_country.label'), value: resolveOption(nationalityOptions, formData.father_country), required: true, type: 'select', name: 'father_country', span: 'third' },
      { label: t('ukVisa.fields.father_address.label'), value: formData.father_address, required: true, type: 'text', name: 'father_address' },
      { label: t('ukVisa.subLabels.mother') + ' - ' + t('ukVisa.fields.mother_name.label'), value: formData.mother_name, required: true, type: 'text', name: 'mother_name', span: 'third' },
      { label: t('ukVisa.fields.mother_nationality.label'), value: resolveOption(nationalityOptions, formData.mother_nationality) || formData.mother_nationality, required: true, type: 'select', name: 'mother_nationality', span: 'third' },
      { label: t('ukVisa.fields.mother_dob.label'), value: formatDate(formData.mother_dob), required: true, type: 'date', name: 'mother_dob' },
      { label: t('ukVisa.fields.mother_changed_nationality.label'), value: resolveOption(yesNoOptions, formData.mother_changed_nationality), type: 'radio', name: 'mother_changed_nationality' },
      { label: t('ukVisa.fields.mother_going_to_uk.label'), value: resolveOption(yesNoOptions, formData.mother_going_to_uk), required: true, type: 'radio', name: 'mother_going_to_uk' },
      { label: t('ukVisa.fields.mother_country.label'), value: resolveOption(nationalityOptions, formData.mother_country), required: true, type: 'select', name: 'mother_country', span: 'third' },
      { label: t('ukVisa.fields.mother_address.label'), value: formData.mother_address, required: true, type: 'text', name: 'mother_address' },
    ],
  },
  // 6. 子女信息
  {
    title: t('ukVisa.sections.childrenInfo'),
    fields: [
      { label: t('ukVisa.fields.hasChildren.label'), value: resolveOption(yesNoOptions, formData.hasChildren), required: true, type: 'radio', name: 'hasChildren' },
      ...children.map((c, i) => [
        { label: `${t('ukVisa.subLabels.child')} ${i + 1} - ${t('ukVisa.fields.child.name.label')}`, value: c.name, required: true, type: 'text', name: `child_${i}_name`, span: 'third' as const, groupStart: true },
        { label: `${t('ukVisa.subLabels.child')} ${i + 1} - ${t('ukVisa.fields.child.nationality.label')}`, value: resolveOption(nationalityOptions, c.nationality) || c.nationality, required: true, type: 'select', name: `child_${i}_nationality`, span: 'third' as const },
        { label: `${t('ukVisa.subLabels.child')} ${i + 1} - ${t('ukVisa.fields.child.dob.label')}`, value: formatDate(c.dob), required: true, type: 'date', name: `child_${i}_dob` as const },
        { label: `${t('ukVisa.subLabels.child')} ${i + 1} - ${t('ukVisa.fields.child.relation.label')}`, value: resolveOption(childRelationOptions, c.relation), required: true, type: 'select', name: `child_${i}_relation` as const, span: 'third' as const },
        { label: `${t('ukVisa.subLabels.child')} ${i + 1} - ${t('ukVisa.fields.child.changedNationality.label')}`, value: resolveOption(yesNoOptions, c.changedNationality), required: true, type: 'radio', name: `child_${i}_changed` },
        { label: `${t('ukVisa.subLabels.child')} ${i + 1} - ${t('ukVisa.fields.child.goingToUK.label')}`, value: resolveOption(yesNoOptions, c.goingToUK), required: true, type: 'radio', name: `child_${i}_going` },
        { label: `${t('ukVisa.subLabels.child')} ${i + 1} - ${t('ukVisa.fields.child.country.label')}`, value: resolveOption(nationalityOptions, c.country) || c.country, required: true, type: 'select', name: `child_${i}_country` as const, span: 'third' as const },
        { label: `${t('ukVisa.subLabels.child')} ${i + 1} - ${t('ukVisa.fields.child.address.label')}`, value: c.address, type: 'text', name: `child_${i}_addr` as const, span: 'half' as const },
      ]).flat(),
    ],
  },
  // 7. 旅行计划
  {
    title: t('ukVisa.sections.travelPlan'),
    fields: [
      { label: t('ukVisa.fields.purposeOfVisit.label'), value: resolveOption(purposeOptions, formData.purposeOfVisit), required: true, type: 'select', name: 'purposeOfVisit', span: 'third' },
      { label: t('ukVisa.fields.intendedArrivalDate.label'), value: formatDate(formData.intendedArrivalDate), required: true, type: 'date', name: 'intendedArrivalDate' },
      { label: t('ukVisa.fields.intendedDepartureDate.label'), value: formatDate(formData.intendedDepartureDate), required: true, type: 'date', name: 'intendedDepartureDate' },
      { label: t('ukVisa.fields.travelPlanDesc.label'), value: formData.travelPlanDesc, type: 'text', name: 'travelPlanDesc', span: 'full' },
    ],
  },
  // 8. 同行人信息
  {
    title: t('ukVisa.sections.companions'),
    fields: [
      { label: t('ukVisa.fields.hasCompanion.label'), value: resolveOption(yesNoOptions, formData.hasCompanion), required: true, type: 'radio', name: 'hasCompanion' },
      ...companions.map((c, i) => [
        { label: `${t('ukVisa.subLabels.companion')} ${i + 1} - ${t('ukVisa.fields.companion.name.label')}`, value: c.name, required: true, type: 'text', name: `comp_${i}_name`, span: 'third' as const, groupStart: true },
        { label: `${t('ukVisa.subLabels.companion')} ${i + 1} - ${t('ukVisa.fields.companion.nationality.label')}`, value: resolveOption(nationalityOptions, c.nationality) || c.nationality, required: true, type: 'select', name: `comp_${i}_nationality`, span: 'third' as const },
        { label: `${t('ukVisa.subLabels.companion')} ${i + 1} - ${t('ukVisa.fields.companion.dob.label')}`, value: formatDate(c.dob), required: true, type: 'date', name: `comp_${i}_dob` as const },
        { label: `${t('ukVisa.subLabels.companion')} ${i + 1} - ${t('ukVisa.fields.companion.relation.label')}`, value: resolveOption(companionRelationOptions, c.relation), required: true, type: 'select', name: `comp_${i}_relation` as const, span: 'third' as const },
        { label: `${t('ukVisa.subLabels.companion')} ${i + 1} - ${t('ukVisa.fields.companion.passport.label')}`, value: c.passport, required: true, type: 'text', name: `comp_${i}_passport` as const },
      ]).flat(),
    ],
  },
  // 9. 工作与收入
  {
    title: t('ukVisa.sections.employmentInfo'),
    fields: [
      { label: t('ukVisa.fields.employmentStatus.label'), value: resolveOption(employmentStatusOptions, formData.employmentStatus), required: true, type: 'radio', name: 'employmentStatus' },
      ...(formData.employmentStatus === 'working' || formData.employmentStatus === 'studying'
        ? [
            { label: t('ukVisa.fields.jobStartDate.label'), value: formatDate(formData.jobStartDate), required: true, name: 'jobStartDate', type: 'date' },
            { label: t(companyNameKey.value), value: formData.companyName, required: true, type: 'text', name: 'companyName' as const, span: 'third' as const },
            { label: t(companyPhoneKey.value), value: formData.companyPhone, type: 'text', name: 'companyPhone', span: 'third' as const },
            { label: t(companyPostalCodeKey.value), value: formData.companyPostalCode, type: 'text', name: 'companyPostalCode', span: 'third' as const },
            { label: t(companyAddressKey.value), value: formData.companyAddress, required: true, type: 'text', name: 'companyAddress', span: 'full' },
            ...(formData.employmentStatus === 'working'
              ? [
                  { label: t('ukVisa.fields.jobTitle.label'), value: formData.jobTitle, required: true, type: 'text', name: 'jobTitle' as const, span: 'third' as const },
                  { label: t('ukVisa.fields.monthlySalary.label'), value: formData.monthlySalary != null ? String(formData.monthlySalary) : '', required: true, type: 'text', name: 'monthlySalary' as const, span: 'third' as const },
                  { label: t('ukVisa.fields.jobDuties.label'), value: formData.jobDuties, type: 'text', name: 'jobDuties' as const, span: 'full' as const },
                  { label: t('ukVisa.fields.otherIncome.label'), value: formData.otherIncome, required: true, type: 'text', name: 'otherIncome' as const, span: 'third' as const },
                ]
              : []),
          ]
        : []),
      ...(formData.employmentStatus === 'unemployed'
        ? [{ label: t('ukVisa.fields.unemployedReason.label'), value: formData.unemployedReason, required: true, type: 'text', name: 'unemployedReason', span: 'full' }]
        : []),
    ],
  },
  // 10. 财务信息
  {
    title: t('ukVisa.sections.financialInfo'),
    fields: [
      { label: t('ukVisa.fields.estimatedUKSpend.label'), value: formData.estimatedUKSpend != null ? String(formData.estimatedUKSpend) : '', required: true, type: 'text', name: 'estimatedUKSpend', span: 'third' },
      { label: t('ukVisa.fields.monthlyExpense.label'), value: formData.monthlyExpense != null ? String(formData.monthlyExpense) : '', required: true, type: 'text', name: 'monthlyExpense', span: 'third' },
      { label: t('ukVisa.fields.hasSponsor.label'), value: resolveOption(yesNoOptions, formData.hasSponsor), type: 'radio', name: 'hasSponsor' },
      ...(formData.hasSponsor === 'yes'
        ? [
            { label: t('ukVisa.fields.sponsorName.label'), value: formData.sponsorName, required: true, type: 'text', name: 'sponsorName' as const, span: 'third' as const },
            { label: t('ukVisa.fields.sponsorAmount.label'), value: formData.sponsorAmount != null ? String(formData.sponsorAmount) : '', required: true, type: 'text', name: 'sponsorAmount', span: 'third' },
            { label: t('ukVisa.fields.sponsorRelation.label'), value: formData.sponsorRelation, required: true, type: 'text', name: 'sponsorRelation' as const, span: 'third' as const },
          ]
        : []),
    ],
  },
  // 11. 英国联系人与住宿
  {
    title: t('ukVisa.sections.ukContacts'),
    fields: [
      { label: t('ukVisa.fields.hasUKContact.label'), value: resolveOption(yesNoOptions, formData.hasUKContact), required: true, type: 'radio', name: 'hasUKContact' },
      ...(formData.hasUKContact === 'yes'
        ? [
            { label: t('ukVisa.fields.ukContactName.label'), value: formData.ukContactName, required: true, type: 'text', name: 'ukContactName' as const, span: 'third' as const },
            { label: t('ukVisa.fields.ukContactStatus.label'), value: formData.ukContactStatus, required: true, type: 'text', name: 'ukContactStatus' as const, span: 'third' as const },
            { label: t('ukVisa.fields.ukContactRelation.label'), value: formData.ukContactRelation, required: true, type: 'text', name: 'ukContactRelation' as const, span: 'third' as const },
            { label: t('ukVisa.fields.ukContactPhone.label'), value: formData.ukContactPhone, required: true, type: 'text', name: 'ukContactPhone' as const, span: 'third' as const },
            { label: t('ukVisa.fields.ukContactPostal.label'), value: formData.ukContactPostal, type: 'text', name: 'ukContactPostal', span: 'third' as const },
            { label: t('ukVisa.fields.ukContactDocNumber.label'), value: formData.ukContactDocNumber, required: true, type: 'text', name: 'ukContactDocNumber' as const, span: 'half' as const },
          ]
        : []),
      { label: t('ukVisa.fields.hasUKAccommodation.label'), value: resolveOption(yesNoOptions, formData.hasUKAccommodation), required: true, type: 'radio', name: 'hasUKAccommodation' },
      ...(formData.hasUKAccommodation === 'yes'
        ? [
            { label: t('ukVisa.fields.ukAccommodationDetail.label'), value: formData.ukAccommodationDetail, required: true, type: 'text', name: 'ukAccommodationDetail', span: 'half' },
            { label: t('ukVisa.fields.ukAccommodationAddress.label'), value: formData.ukAccommodationAddress, required: true, type: 'text', name: 'ukAccommodationAddress', span: 'half' as const },
            { label: t('ukVisa.fields.ukCheckinDate.label'), value: formatDate(formData.ukCheckinDate), required: true, name: 'ukCheckinDate', type: 'date' },
            { label: t('ukVisa.fields.ukCheckoutDate.label'), value: formatDate(formData.ukCheckoutDate), required: true, name: 'ukCheckoutDate', type: 'date' },
            { label: t('ukVisa.fields.ukAccommodationPostal.label'), value: formData.ukAccommodationPostal, type: 'text', name: 'ukAccommodationPostal', span: 'third' as const },
          ]
        : []),
    ],
  },
  // 12. 签证与旅行历史
  {
    title: t('ukVisa.sections.visaHistory'),
    fields: [
      { label: t('ukVisa.fields.hadUKVisa.label'), value: resolveOption(yesNoOptions, formData.hadUKVisa), required: true, type: 'radio', name: 'hadUKVisa' },
      ...(formData.hadUKVisa === 'yes'
        ? [{ label: t('ukVisa.fields.lastUKVisaDate.label'), value: formatDate(formData.lastUKVisaDate), required: true, type: 'date', name: 'lastUKVisaDate' }]
        : []),
      { label: t('ukVisa.fields.visitedUK.label'), value: resolveOption(yesNoOptions, formData.visitedUK), required: true, type: 'radio', name: 'visitedUK' },
      ...ukVisits.map((v, i) => [
        { label: `${t('ukVisa.subLabels.ukVisit', { index: i + 1 })} - ${t('ukVisa.fields.ukVisit.date.label')}`, value: v.date, required: true, type: 'date', name: `visit_${i}_date` as const, groupStart: true },
        { label: `${t('ukVisa.subLabels.ukVisit', { index: i + 1 })} - ${t('ukVisa.fields.ukVisit.duration.label')}`, value: v.duration, required: true, type: 'text', name: `visit_${i}_duration` as const, span: 'third' as const },
        { label: `${t('ukVisa.subLabels.ukVisit', { index: i + 1 })} - ${t('ukVisa.fields.ukVisit.purpose.label')}`, value: v.purpose, required: true, type: 'text', name: `visit_${i}_purpose` as const, span: 'full' as const },
      ]).flat(),
      { label: t('ukVisa.fields.beenRefused.label'), value: resolveOption(yesNoOptions, formData.beenRefused), required: true, type: 'radio', name: 'beenRefused' },
      ...refusals.map((r, i) => [
        { label: `${t('ukVisa.subLabels.refusal', { index: i + 1 })} - ${t('ukVisa.fields.refusal.country.label')}`, value: resolveOption(nationalityOptions, r.country) || r.country, required: true, type: 'select', name: `refusal_${i}_country` as const, span: 'third' as const, groupStart: true },
        { label: `${t('ukVisa.subLabels.refusal', { index: i + 1 })} - ${t('ukVisa.fields.refusal.date.label')}`, value: r.date, required: true, type: 'date', name: `refusal_${i}_date` as const },
        { label: `${t('ukVisa.subLabels.refusal', { index: i + 1 })} - ${t('ukVisa.fields.refusal.refNumber.label')}`, value: r.refNumber, type: 'text', name: `refusal_${i}_ref` as const, span: 'third' as const },
        { label: `${t('ukVisa.subLabels.refusal', { index: i + 1 })} - ${t('ukVisa.fields.refusal.reason.label')}`, value: r.reason, required: true, type: 'text', name: `refusal_${i}_reason` as const, span: 'full' as const },
      ]).flat(),
      { label: t('ukVisa.fields.appliedUKStay.label'), value: resolveOption(yesNoOptions, formData.appliedUKStay), required: true, type: 'radio', name: 'appliedUKStay' },
      ...(formData.appliedUKStay === 'yes'
        ? [
            { label: t('ukVisa.fields.applyDetail_date.label'), value: formData.applyDetail_date, required: true, type: 'date', name: 'applyDetail_date' },
            { label: t('ukVisa.fields.applyDetail_approved.label'), value: resolveOption(yesNoOptions, formData.applyDetail_approved), required: true, type: 'radio', name: 'applyDetail_approved' },
            { label: t('ukVisa.fields.applyDetail_reason.label'), value: formData.applyDetail_reason, required: true, type: 'text', name: 'applyDetail_reason' as const },
          ]
        : []),
      { label: t('ukVisa.fields.visitedOtherCountries.label'), value: resolveOption(yesNoOptions, formData.visitedOtherCountries), required: true, type: 'radio', name: 'visitedOtherCountries' },
      ...otherCountries.map((c, i) => [
        { label: `${t('ukVisa.subLabels.otherCountry', { index: i + 1 })} - ${t('ukVisa.fields.otherCountry.name.label')}`, value: resolveOption(otherCountryOptions, c.name), required: true, type: 'select', name: `oc_${i}_name` as const, span: 'third' as const, groupStart: true },
        { label: `${t('ukVisa.subLabels.otherCountry', { index: i + 1 })} - ${t('ukVisa.fields.otherCountry.date.label')}`, value: c.date, required: true, type: 'date', name: `oc_${i}_date` as const },
        { label: `${t('ukVisa.subLabels.otherCountry', { index: i + 1 })} - ${t('ukVisa.fields.otherCountry.duration.label')}`, value: c.duration, required: true, type: 'text', name: `oc_${i}_duration` as const, span: 'third' as const },
        { label: `${t('ukVisa.subLabels.otherCountry', { index: i + 1 })} - ${t('ukVisa.fields.otherCountry.purpose.label')}`, value: c.purpose, required: true, type: 'text', name: `oc_${i}_purpose`, span: 'full' as const },
      ]).flat(),
    ],
  },
  // 13. 安全与背景
  {
    title: t('ukVisa.sections.securityBackground'),
    fields: [
      { label: t('ukVisa.fields.hasUKInsurance.label'), value: resolveOption(yesNoOptions, formData.hasUKInsurance), required: true, type: 'radio', name: 'hasUKInsurance' },
      ...(formData.hasUKInsurance === 'yes'
        ? [
            { label: t('ukVisa.fields.insuranceNumber.label'), value: formData.insuranceNumber, required: true, type: 'text', name: 'insuranceNumber' as const },
            { label: t('ukVisa.fields.insuranceReason.label'), value: formData.insuranceReason, required: true, type: 'text', name: 'insuranceReason' as const },
          ]
        : []),
      { label: t('ukVisa.fields.hasCriminalRecord.label'), value: resolveOption(yesNoOptions, formData.hasCriminalRecord), required: true, type: 'radio', name: 'hasCriminalRecord' },
      { label: t('ukVisa.fields.hasTerrorism.label'), value: resolveOption(yesNoOptions, formData.hasTerrorism), required: true, type: 'radio', name: 'hasTerrorism' },
      { label: t('ukVisa.fields.hasBeenProsecuted.label'), value: resolveOption(yesNoOptions, formData.hasBeenProsecuted), required: true, type: 'radio', name: 'hasBeenProsecuted' },
      { label: t('ukVisa.fields.hasGenocide.label'), value: resolveOption(yesNoOptions, formData.hasGenocide), required: true, type: 'radio', name: 'hasGenocide' },
      { label: t('ukVisa.fields.hasArmedConflict.label'), value: resolveOption(yesNoOptions, formData.hasArmedConflict), required: true, type: 'radio', name: 'hasArmedConflict' },
      { label: t('ukVisa.fields.hasSpecialIndustry.label'), value: resolveOption(yesNoOptions, formData.hasSpecialIndustry), required: true, type: 'radio', name: 'hasSpecialIndustry' },
      ...(formData.hasSpecialIndustry === 'yes'
        ? [
            { label: t('ukVisa.fields.specialIndustries.label'), value: resolveOption(specialIndustriesOptions, formData.specialIndustries), required: true, type: 'select', name: 'specialIndustries' as const, span: 'third' as const },
            { label: t('ukVisa.fields.specialIndustryDetail.label'), value: formData.specialIndustryDetail, required: true, type: 'text', name: 'specialIndustryDetail', span: 'half' as const },
          ]
        : []),
    ],
  },
] as PreviewSection[])

useHead({
  title: () => t('ukVisa.title'),
})

// localStorage key
const STORAGE_KEY = 'ws-visa-uk-form-data'

// 表单默认结构（key 的集合决定 schema 版本）
const defaultData = {
  // 第1组：基本信息
  lastName: '',
  firstName: '',
  formerName: '',
  gender: '',
  dateOfBirth: '',
  phoneCountryCode: '',
  phoneCountryCodeOther: '',
  phone: '',
  email: '',

  // 第2组：护照与证件
  passportNumber: '',
  passportIssueDate: '',
  passportExpiryDate: '',
  issuingAuthority: '',
  nationality: '',
  nationalityOther: '',
  isFirstPassport: '',
  hasOtherPassport: '',
  otherPassportCountry: '',
  otherPassportDetail: '',
  idCardNumber: '',
  idCardAuthority: '',
  idCardExpiry: '',

  // 第3组：居住地址
  currentCountry: '',
  currentAddress: '',
  postalCode: '',
  housingStatus: '',
  residenceStartDate: '',
  houseOwner: '',

  // 第4组：婚姻与配偶
  maritalStatus: '',
  spouseName: '',
  spouseDob: '',
  spouseNationality: '',
  spouseChangedNationality: '',
  spouseOtherNationality: '',
  spouseBirthCity: '',
  spouseCountry: '',
  spouseAddress: '',

  // 第5组：父母信息
  father_name: '',
  father_nationality: '',
  father_changed_nationality: '',
  father_other_nationality: '',
  father_dob: '',
  father_going_to_uk: '',
  father_country: '',
  father_address: '',
  mother_name: '',
  mother_nationality: '',
  mother_changed_nationality: '',
  mother_other_nationality: '',
  mother_dob: '',
  mother_going_to_uk: '',
  mother_country: '',
  mother_address: '',

  // 第6组：子女信息
  hasChildren: '',

  // 第7组：旅行计划
  purposeOfVisit: '',
  intendedArrivalDate: '',
  intendedDepartureDate: '',
  travelPlanDesc: '',

  // 第8组：同行人信息
  hasCompanion: '',

  // 第9组：工作与收入
  employmentStatus: '',
  jobStartDate: '',
  companyName: '',
  companyAddress: '',
  companyPostalCode: '',
  companyPhone: '',
  jobTitle: '',
  jobDuties: '',
  monthlySalary: undefined,
  otherIncome: '',
  unemployedReason: '',

  // 第10组：财务信息
  estimatedUKSpend: undefined,
  monthlyExpense: undefined,
  hasSponsor: '',
  sponsorName: '',
  sponsorRelation: '',
  sponsorAmount: undefined,

  // 第11组：英国联系人与住宿
  hasUKContact: '',
  ukContactName: '',
  ukContactStatus: '',
  ukContactDocNumber: '',
  ukContactRelation: '',
  ukContactPhone: '',
  ukContactPostal: '',
  hasUKAccommodation: '',
  ukAccommodationDetail: '',
  ukAccommodationCountry: '',
  ukAccommodationAddress: '',
  ukAccommodationPostal: '',
  ukCheckinDate: '',
  ukCheckoutDate: '',

  // 第12组：签证与旅行历史
  hadUKVisa: '',
  lastUKVisaDate: '',
  visitedUK: '',
  beenRefused: '',
  appliedUKStay: '',
  applyDetail_date: '',
  applyDetail_reason: '',
  applyDetail_approved: '',
  visitedOtherCountries: '',

  // 第13组：安全与背景
  hasUKInsurance: '',
  insuranceNumber: '',
  insuranceReason: '',
  hasCriminalRecord: '',
  hasTerrorism: '',
  hasBeenProsecuted: '',
  hasGenocide: '',
  hasArmedConflict: '',
  hasSpecialIndustry: '',
  specialIndustries: '',
  specialIndustryDetail: '',
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
const formData = reactive(
  Object.fromEntries(
    Object.entries(defaultData).map(([key, defaultVal]) => [
      key,
      (savedData as Record<string, unknown>)?.[key] ?? defaultVal,
    ]),
  ) as Record<string, string | number | undefined>,
)

// 一键填充状态：供 DateField 等子组件在填充期间禁用 Popover，防止日期面板被意外展开
const isFormFilling = ref(false)
provide('form-filling', isFormFilling)

// ---- 可重复组（动态数组） ----

const companions = reactive<Array<ReturnType<typeof createCompanion>>>(
  savedData?.companions?.length ? savedData.companions : [],
)
const children = reactive<Array<ReturnType<typeof createChild>>>(
  savedData?.children?.length ? savedData.children : [],
)
const ukVisits = reactive<Array<ReturnType<typeof createUkVisit>>>(
  savedData?.ukVisits?.length ? savedData.ukVisits : [],
)
const refusals = reactive<Array<ReturnType<typeof createRefusal>>>(
  savedData?.refusals?.length ? savedData.refusals : [],
)
const otherCountries = reactive<Array<ReturnType<typeof createOtherCountry>>>(
  savedData?.otherCountries?.length ? savedData.otherCountries : [],
)

// 添加/移除函数
function addCompanion() { companions.push(createCompanion()) }
function removeCompanion(i: number) { companions.splice(i, 1) }
function addChild() { children.push(createChild()) }
function removeChild(i: number) { children.splice(i, 1) }
function addUkVisit() { ukVisits.push(createUkVisit()) }
function removeUkVisit(i: number) { ukVisits.splice(i, 1) }
function addRefusal() { refusals.push(createRefusal()) }
function removeRefusal(i: number) { refusals.splice(i, 1) }
function addOtherCountry() { otherCountries.push(createOtherCountry()) }
function removeOtherCountry(i: number) { otherCountries.splice(i, 1) }

// 自动保存到 localStorage（携带版本号）
watch(
  [formData, companions, children, ukVisits, refusals, otherCountries],
  () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        _schemaVersion: SCHEMA_VERSION,
        data: {
          ...formData,
          companions: [...companions],
          children: [...children],
          ukVisits: [...ukVisits],
          refusals: [...refusals],
          otherCountries: [...otherCountries],
        },
      }))
    } catch {
      // 存储失败时忽略
    }
  },
  { deep: true },
)

// 清除数据（二次确认）
function clearForm() {
  for (const key of Object.keys(formData)) {
    formData[key] = (defaultData as Record<string, unknown>)[key] ?? ''
  }
  companions.splice(0)
  children.splice(0)
  ukVisits.splice(0)
  refusals.splice(0)
  otherCountries.splice(0)
  localStorage.removeItem(STORAGE_KEY)
}

// ---- 填充测试数据（仅开发环境） ----

function fillTestData() {
  if (!import.meta.env.DEV) return
  isFormFilling.value = true
  // 先清空所有字段，避免残留旧数据与测试数据合并
  for (const key of Object.keys(formData)) {
    formData[key] = (defaultData as Record<string, unknown>)[key] ?? ''
  }
  companions.splice(0)
  children.splice(0)
  ukVisits.splice(0)
  refusals.splice(0)
  otherCountries.splice(0)
  // 填入样本数据
  for (const key of Object.keys(mockFormData.formData)) {
    formData[key] = mockFormData.formData[key]
  }
  // 填充可重复组
  companions.push(...mockFormData.companions)
  children.push(...mockFormData.children)
  ukVisits.push(...mockFormData.ukVisits)
  refusals.push(...mockFormData.refusals)
  otherCountries.push(...mockFormData.otherCountries)
  // 展开所有分组（最大化字段可见性，便于测试）
  // 临时禁用 transition 避免 13 个 accordion 同时动画导致卡顿
  // 记录当前滚动位置，展开后恢复，避免页面跳到最后一条 accordion
  nextTick(() => {
    const card = document.querySelector('.glass-card')
    card?.classList.add('no-transition')
    const scrollYBefore = window.scrollY
    document.querySelectorAll<HTMLElement>('[data-accordion-value] button[data-state="closed"]')
      .forEach((trigger) => trigger.click())
    window.scrollTo({ top: scrollYBefore })
    setTimeout(() => {
      card?.classList.remove('no-transition')
      isFormFilling.value = false
      ;(document.activeElement as HTMLElement)?.blur()
    }, 300)
  })
}

// ---- 其余选项数组 ----

const purposeOptions: SelectOption[] = [
  { value: 'tourism', labelKey: 'ukVisa.options.purposeOfVisit.tourism' },
  { value: 'business', labelKey: 'ukVisa.options.purposeOfVisit.business' },
  { value: 'familyVisit', labelKey: 'ukVisa.options.purposeOfVisit.familyVisit' },
  { value: 'study', labelKey: 'ukVisa.options.purposeOfVisit.study' },
  { value: 'medical', labelKey: 'ukVisa.options.purposeOfVisit.medical' },
  { value: 'other', labelKey: 'ukVisa.options.purposeOfVisit.other' },
]

const yesNoOptions: RadioOption[] = [
  { value: 'yes', labelKey: 'ukVisa.options.yesNo.yes' },
  { value: 'no', labelKey: 'ukVisa.options.yesNo.no' },
]

const housingStatusOptions: SelectOption[] = [
  { value: 'own', labelKey: 'ukVisa.options.housingStatus.own' },
  { value: 'tenant', labelKey: 'ukVisa.options.housingStatus.tenant' },
  { value: 'other', labelKey: 'ukVisa.options.housingStatus.other' },
]

const maritalStatusOptions: RadioOption[] = [
  { value: 'unmarried', labelKey: 'ukVisa.options.maritalStatus.unmarried' },
  { value: 'married', labelKey: 'ukVisa.options.maritalStatus.married' },
  { value: 'divorced', labelKey: 'ukVisa.options.maritalStatus.divorced' },
  { value: 'widowed', labelKey: 'ukVisa.options.maritalStatus.widowed' },
  { value: 'separated', labelKey: 'ukVisa.options.maritalStatus.separated' },
]

const companionRelationOptions: SelectOption[] = [
  { value: 'spouse', labelKey: 'ukVisa.options.companionRelation.spouse' },
  { value: 'parent', labelKey: 'ukVisa.options.companionRelation.parent' },
  { value: 'child', labelKey: 'ukVisa.options.companionRelation.child' },
  { value: 'sibling', labelKey: 'ukVisa.options.companionRelation.sibling' },
  { value: 'friend', labelKey: 'ukVisa.options.companionRelation.friend' },
  { value: 'other', labelKey: 'ukVisa.options.companionRelation.other' },
]


const childRelationOptions: SelectOption[] = [
  { value: 'son', labelKey: 'ukVisa.options.childRelation.son' },
  { value: 'daughter', labelKey: 'ukVisa.options.childRelation.daughter' },
]

const employmentStatusOptions: RadioOption[] = [
  { value: 'working', labelKey: 'ukVisa.options.employmentStatus.working' },
  { value: 'studying', labelKey: 'ukVisa.options.employmentStatus.studying' },
  { value: 'unemployed', labelKey: 'ukVisa.options.employmentStatus.unemployed' },
]

const specialIndustriesOptions: SelectOption[] = [
  { value: 'military', labelKey: 'ukVisa.options.specialIndustries.military' },
  { value: 'media', labelKey: 'ukVisa.options.specialIndustries.media' },
  { value: 'government', labelKey: 'ukVisa.options.specialIndustries.government' },
  { value: 'judicial', labelKey: 'ukVisa.options.specialIndustries.judicial' },
  { value: 'police', labelKey: 'ukVisa.options.specialIndustries.police' },
  { value: 'publicAdministration', labelKey: 'ukVisa.options.specialIndustries.publicAdministration' },
]

const otherCountryOptions: SelectOption[] = [
  { value: 'AU', labelKey: 'ukVisa.options.otherCountry.AU' },
  { value: 'CA', labelKey: 'ukVisa.options.otherCountry.CA' },
  { value: 'NZ', labelKey: 'ukVisa.options.otherCountry.NZ' },
  { value: 'US', labelKey: 'ukVisa.options.otherCountry.US' },
  { value: 'SCHENGEN', labelKey: 'ukVisa.options.otherCountry.SCHENGEN' },
]

// ---- 动态 i18n keys（工作/学生切换） ----
// 在职时显示"公司/..."，学生时显示"学校/..."

const companyNameKey = computed(() =>
  formData.employmentStatus === 'studying' ? 'ukVisa.fields.schoolName.label' : 'ukVisa.fields.companyName.label',
)
const companyNamePlaceholder = computed(() =>
  formData.employmentStatus === 'studying' ? 'ukVisa.fields.schoolName.placeholder' : 'ukVisa.fields.companyName.placeholder',
)
const companyPhoneKey = computed(() =>
  formData.employmentStatus === 'studying' ? 'ukVisa.fields.schoolPhone.label' : 'ukVisa.fields.companyPhone.label',
)
const companyPhonePlaceholder = computed(() =>
  formData.employmentStatus === 'studying' ? 'ukVisa.fields.schoolPhone.placeholder' : 'ukVisa.fields.companyPhone.placeholder',
)
const companyAddressKey = computed(() =>
  formData.employmentStatus === 'studying' ? 'ukVisa.fields.schoolAddress.label' : 'ukVisa.fields.companyAddress.label',
)
const companyAddressPlaceholder = computed(() =>
  formData.employmentStatus === 'studying' ? 'ukVisa.fields.schoolAddress.placeholder' : 'ukVisa.fields.companyAddress.placeholder',
)
const companyPostalCodeKey = computed(() =>
  formData.employmentStatus === 'studying' ? 'ukVisa.fields.schoolPostalCode.label' : 'ukVisa.fields.companyPostalCode.label',
)
const companyPostalCodePlaceholder = computed(() =>
  formData.employmentStatus === 'studying' ? 'ukVisa.fields.schoolPostalCode.placeholder' : 'ukVisa.fields.companyPostalCode.placeholder',
)

// ---- 校验 & 聚焦第一个缺失字段 ----

const formActionsRef = ref<InstanceType<typeof FormActions> | null>(null)

function handleExportClick() {
  const missingFields: { name: string; label: string; section: string }[] = []
  const groupErrors: { name: string; label: string; section: string }[] = []

  // 1. 校验普通必填字段
  for (const section of previewSections.value) {
    for (const field of section.fields) {
      if (field.required && (!field.value || !field.value.trim())) {
        missingFields.push({ name: (field as any).name ?? '', label: field.label, section: section.title })
      }
    }
  }

  // 2. 校验可重复组（选"是"后至少添加 1 条）
  const repeatableChecks = [
    { condition: formData.hasChildren === 'yes', items: children, name: '_add_child', label: t('ukVisa.addRow') + ' - ' + t('ukVisa.subLabels.child'), section: t('ukVisa.sections.childrenInfo') },
    { condition: formData.hasCompanion === 'yes', items: companions, name: '_add_companion', label: t('ukVisa.addRow') + ' - ' + t('ukVisa.subLabels.companion'), section: t('ukVisa.sections.companions') },
    { condition: formData.visitedUK === 'yes', items: ukVisits, name: '_add_visit', label: t('ukVisa.addRow') + ' - ' + t('ukVisa.subLabels.ukVisit', { index: 1 }), section: t('ukVisa.sections.visaHistory') },
    { condition: formData.beenRefused === 'yes', items: refusals, name: '_add_refusal', label: t('ukVisa.addRow') + ' - ' + t('ukVisa.subLabels.refusal', { index: 1 }), section: t('ukVisa.sections.visaHistory') },
    { condition: formData.visitedOtherCountries === 'yes', items: otherCountries, name: '_add_other_country', label: t('ukVisa.addRow') + ' - ' + t('ukVisa.subLabels.otherCountry', { index: 1 }), section: t('ukVisa.sections.visaHistory') },
  ]
  for (const check of repeatableChecks) {
    if (check.condition && check.items.length === 0) {
      groupErrors.push({ name: check.name, label: check.label, section: check.section })
    }
  }

  const allErrors = [...missingFields, ...groupErrors]

  if (allErrors.length > 0) {
    const firstError = allErrors[0]
    // 找到对应的 accordion section 并展开
    const sectionMap: Record<string, string> = {
      [t('ukVisa.sections.personalInfo')]: 'personal-info',
      [t('ukVisa.sections.passportInfo')]: 'passport-info',
      [t('ukVisa.sections.addressInfo')]: 'address-info',
      [t('ukVisa.sections.marriageInfo')]: 'marriage-info',
      [t('ukVisa.sections.parentInfo')]: 'parent-info',
      [t('ukVisa.sections.childrenInfo')]: 'children-info',
      [t('ukVisa.sections.travelPlan')]: 'travel-plan',
      [t('ukVisa.sections.companions')]: 'companions',
      [t('ukVisa.sections.employmentInfo')]: 'employment-info',
      [t('ukVisa.sections.financialInfo')]: 'financial-info',
      [t('ukVisa.sections.ukContacts')]: 'uk-contacts',
      [t('ukVisa.sections.visaHistory')]: 'visa-history',
      [t('ukVisa.sections.securityBackground')]: 'security-background',
    }
    const accordionValue = sectionMap[firstError.section]
    if (accordionValue) {
      const accordionItem = document.querySelector(`[data-accordion-value="${accordionValue}"]`)
      // 尝试多种选择器找到 accordion trigger
      const trigger = (accordionItem?.querySelector('[data-radix-collection-item]')
        ?? accordionItem?.querySelector('button[aria-expanded]')) as HTMLElement | null
      if (trigger && trigger.getAttribute('data-state') !== 'open') {
        trigger.click()
      }
    }
    // 聚焦到第一个错误字段（等待 accordion 动画完成）
    nextTick(() => {
      setTimeout(() => {
        const el = document.querySelector(`[name="${firstError.name}"]`) as HTMLElement
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          // 只对可见、可聚焦的元素调用 focus
          if (el.offsetParent !== null && el.tabIndex >= 0) {
            el.focus()
          }
          el.classList.add('field-error-flash')
          setTimeout(() => el.classList.remove('field-error-flash'), 2000)
        }
      }, 400)
    })
    return
  }

  // 全部通过，打开预览
  formActionsRef.value?.openPreview()
}

// ---- 回到顶部 ----

const showBackToTop = ref(false)

function handleScroll() {
  showBackToTop.value = window.scrollY > 300
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 监听滚动
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', handleScroll, { passive: true })
}
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
        ref="formActionsRef"
        :sections="previewSections"
        :form-title="t('ukVisa.title')"
        :form-subtitle="t('ukVisa.subtitle')"
        :build-pdf-title="buildPdfTitle"
        :build-pdf-filename="buildPdfFilename"
        i18n-prefix="ukVisa"
        @clear="clearForm"
        @export="handleExportClick"
        @fill="fillTestData"
      />

      <!-- 表单容器 -->
      <div class="glass-card">
        <Accordion type="multiple" class="w-full" :default-value="['personal-info']">

          <!-- 1. 基本信息 -->
          <AccordionItem value="personal-info" data-accordion-value="personal-info">
            <AccordionTrigger>{{ t('ukVisa.sections.personalInfo') }}</AccordionTrigger>
            <AccordionContent>
              <div class="fields-grid">
                <!-- Row 1: 姓名组 (3短字段 → 占ABC列，D列留空) -->
                <TextField name="lastName" label-key="ukVisa.fields.lastName.label" placeholder-key="ukVisa.fields.lastName.placeholder" v-model="formData.lastName" span="third" required prefix-icon="User" constraint="alpha" />
                <TextField name="firstName" label-key="ukVisa.fields.firstName.label" placeholder-key="ukVisa.fields.firstName.placeholder" v-model="formData.firstName" span="third" required prefix-icon="User" constraint="alpha" />
                <TextField name="formerName" label-key="ukVisa.fields.formerName.label" placeholder-key="ukVisa.fields.formerName.placeholder" v-model="formData.formerName" span="third" prefix-icon="User" constraint="alpha" />
                <!-- Row 2: 出生日期 + 电话 -->
                <DateField name="dateOfBirth" label-key="ukVisa.fields.dateOfBirth.label" v-model="formData.dateOfBirth" required prefix-icon="Calendar" />
                <PhoneField name="phone" label-key="ukVisa.fields.phone.label"
                  placeholder-key="ukVisa.fields.phone.placeholder"
                  v-model="formData.phone"
                  :country-code="formData.phoneCountryCode"
                  @update:country-code="formData.phoneCountryCode = $event"
                  required />
                <!-- 邮箱 (当"其他区号"未显示时紧接电话号码；显示时自然换行) -->
                <TextField name="email" label-key="ukVisa.fields.email.label" placeholder-key="ukVisa.fields.email.placeholder" v-model="formData.email" span="third" inputmode="email" required prefix-icon="Mail" constraint="email" />
                <!-- Row 3: 性别 (radio → 全宽) -->
                <RadioField name="gender" label-key="ukVisa.fields.gender.label" :options="genderOptions" v-model="formData.gender" required />
              </div>
            </AccordionContent>
          </AccordionItem>

          <!-- 2. 证件与护照 -->
          <AccordionItem value="passport-info" data-accordion-value="passport-info">
            <AccordionTrigger>{{ t('ukVisa.sections.passportInfo') }}</AccordionTrigger>
            <AccordionContent>
              <h4 class="sub-label">{{ t('ukVisa.subLabels.idCard') }}</h4>
              <div class="fields-grid">
                <!-- Row 1: 国籍 + 身份证号 + 签发机关 -->
                <NationalityField name="nationality" label-key="ukVisa.fields.nationality.label" v-model="formData.nationality" required span="third" />
                <TextField name="idCardNumber" label-key="ukVisa.fields.idCardNumber.label" placeholder-key="ukVisa.fields.idCardNumber.placeholder" v-model="formData.idCardNumber" span="third" required prefix-icon="CreditCard" />
                <TextField name="idCardAuthority" label-key="ukVisa.fields.idCardAuthority.label" placeholder-key="ukVisa.fields.idCardAuthority.placeholder" v-model="formData.idCardAuthority" span="third" required prefix-icon="Building" />
                <!-- Row 2: 身份证到期日 -->
                <DateField name="idCardExpiry" label-key="ukVisa.fields.idCardExpiry.label" v-model="formData.idCardExpiry" required prefix-icon="Calendar" />
              </div>
              <h4 class="sub-label">{{ t('ukVisa.subLabels.passport') }}</h4>
              <div class="fields-grid">
                <!-- Row 1: 国籍(签发国) + 护照号 + 签发日期 -->
                <NationalityField name="issuingAuthority" label-key="ukVisa.fields.issuingAuthority.label" v-model="formData.issuingAuthority" required span="third" />
                <TextField name="passportNumber" label-key="ukVisa.fields.passportNumber.label" placeholder-key="ukVisa.fields.passportNumber.placeholder" v-model="formData.passportNumber" span="third" required prefix-icon="BookOpen" constraint="alphanumeric" />
                <DateField name="passportIssueDate" label-key="ukVisa.fields.passportIssueDate.label" v-model="formData.passportIssueDate" required prefix-icon="Calendar" />
                <!-- Row 2: 到期日 -->
                <DateField name="passportExpiryDate" label-key="ukVisa.fields.passportExpiryDate.label" v-model="formData.passportExpiryDate" :min-value="formData.passportIssueDate" required prefix-icon="Calendar" />
                <!-- Row 3: 是否首本护照 -->
                <RadioField name="isFirstPassport" label-key="ukVisa.fields.isFirstPassport.label" :options="yesNoOptions" v-model="formData.isFirstPassport" required />
              </div>
              <!-- Row 4: 是否有其他护照 -->
              <div class="fields-grid">
                <RadioField name="hasOtherPassport" label-key="ukVisa.fields.hasOtherPassport.label" :options="yesNoOptions" v-model="formData.hasOtherPassport" required />
              </div>
              <!-- 其他护照条件字段 -->
              <div v-if="formData.hasOtherPassport === 'yes'" class="conditional-group">
                <div class="fields-grid">
                  <NationalityField name="otherPassportCountry" label-key="ukVisa.fields.otherPassportCountry.label" v-model="formData.otherPassportCountry" required span="third" />
                  <TextField name="otherPassportDetail" label-key="ukVisa.fields.otherPassportDetail.label" placeholder-key="ukVisa.fields.otherPassportDetail.placeholder" v-model="formData.otherPassportDetail" required prefix-icon="BookOpen" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <!-- 3. 居住地址 -->
          <AccordionItem value="address-info" data-accordion-value="address-info">
            <AccordionTrigger>{{ t('ukVisa.sections.addressInfo') }}</AccordionTrigger>
            <AccordionContent>
              <div class="fields-grid">
                <!-- Row 1: 国家 + 地址 + 邮编 -->
                <NationalityField name="currentCountry" label-key="ukVisa.fields.currentCountry.label" v-model="formData.currentCountry" required span="third" />
                <TextField name="currentAddress" label-key="ukVisa.fields.currentAddress.label" placeholder-key="ukVisa.fields.currentAddress.placeholder" v-model="formData.currentAddress" required prefix-icon="MapPin" />
                <TextField name="postalCode" label-key="ukVisa.fields.postalCode.label" placeholder-key="ukVisa.fields.postalCode.placeholder" v-model="formData.postalCode" inputmode="numeric" span="third" prefix-icon="Mailbox" />
                <!-- Row 2: 住房状况 + 居住开始日期 + 房东(条件) -->
                <SelectField name="housingStatus" label-key="ukVisa.fields.housingStatus.label" :options="housingStatusOptions" v-model="formData.housingStatus" span="third" required />
                <DateField name="residenceStartDate" label-key="ukVisa.fields.residenceStartDate.label" v-model="formData.residenceStartDate" required prefix-icon="Calendar" />
                <TextField v-if="formData.housingStatus === 'tenant'" name="houseOwner" label-key="ukVisa.fields.houseOwner.label" placeholder-key="ukVisa.fields.houseOwner.placeholder" v-model="formData.houseOwner" required span="third" prefix-icon="Home" />
              </div>
            </AccordionContent>
          </AccordionItem>

          <!-- 4. 婚姻与配偶 -->
          <AccordionItem value="marriage-info" data-accordion-value="marriage-info">
            <AccordionTrigger>{{ t('ukVisa.sections.marriageInfo') }}</AccordionTrigger>
            <AccordionContent>
              <div class="fields-grid">
                <RadioField name="maritalStatus" label-key="ukVisa.fields.maritalStatus.label" :options="maritalStatusOptions" v-model="formData.maritalStatus" required />
              </div>
              <div v-if="formData.maritalStatus === 'married'" class="conditional-group">
                <div class="fields-grid">
                  <!-- Row 1: 姓名 + 国籍 + 出生日期 + 出生城市（四个短字段各 third） -->
                  <TextField name="spouseName" label-key="ukVisa.fields.spouseName.label" placeholder-key="ukVisa.fields.spouseName.placeholder" v-model="formData.spouseName" span="third" required prefix-icon="User" constraint="alpha" />
                  <NationalityField name="spouseNationality" label-key="ukVisa.fields.spouseNationality.label" v-model="formData.spouseNationality" required span="third" />
                  <DateField name="spouseDob" label-key="ukVisa.fields.spouseDob.label" v-model="formData.spouseDob" required span="third" prefix-icon="Calendar" />
                  <TextField name="spouseBirthCity" label-key="ukVisa.fields.spouseBirthCity.label" placeholder-key="ukVisa.fields.spouseBirthCity.placeholder" v-model="formData.spouseBirthCity" span="third" required prefix-icon="MapPin" />
                  <!-- Row 2: 国家 + 地址 -->
                  <NationalityField name="spouseCountry" label-key="ukVisa.fields.spouseCountry.label" v-model="formData.spouseCountry" required span="third" />
                  <TextField name="spouseAddress" label-key="ukVisa.fields.spouseAddress.label" placeholder-key="ukVisa.fields.spouseAddress.placeholder" v-model="formData.spouseAddress" required prefix-icon="MapPin" />
                  <!-- Row 3: 是否更换国籍 -->
                  <RadioField name="spouseChangedNationality" label-key="ukVisa.fields.spouseChangedNationality.label" :options="yesNoOptions" v-model="formData.spouseChangedNationality" required />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <!-- 5. 父母信息 -->
          <AccordionItem value="parent-info" data-accordion-value="parent-info">
            <AccordionTrigger>{{ t('ukVisa.sections.parentInfo') }}</AccordionTrigger>
            <AccordionContent>
              <h4 class="sub-label">{{ t('ukVisa.subLabels.father') }}</h4>
              <div class="fields-grid">
                <!-- Row 1: 姓名 + 国籍 + 出生日期 -->
                <TextField name="father_name" label-key="ukVisa.fields.father_name.label" placeholder-key="ukVisa.fields.father_name.placeholder" v-model="formData.father_name" span="third" required prefix-icon="User" constraint="alpha" />
                <NationalityField name="father_nationality" label-key="ukVisa.fields.father_nationality.label" v-model="formData.father_nationality" required />
                <DateField name="father_dob" label-key="ukVisa.fields.father_dob.label" v-model="formData.father_dob" required prefix-icon="Calendar" />
              </div>
              <div class="fields-grid">
                <!-- Row 2: 国家 + 地址 -->
                <NationalityField name="father_country" label-key="ukVisa.fields.father_country.label" v-model="formData.father_country" required span="third" />
                <TextField name="father_address" label-key="ukVisa.fields.father_address.label" placeholder-key="ukVisa.fields.father_address.placeholder" v-model="formData.father_address" required prefix-icon="MapPin" />
              </div>
              <div class="fields-grid">
                <RadioField name="father_changed_nationality" label-key="ukVisa.fields.father_changed_nationality.label" :options="yesNoOptions" v-model="formData.father_changed_nationality" />
              </div>
              <div class="fields-grid">
                <RadioField name="father_going_to_uk" label-key="ukVisa.fields.father_going_to_uk.label" :options="yesNoOptions" v-model="formData.father_going_to_uk" required />
              </div>
              <h4 class="sub-label">{{ t('ukVisa.subLabels.mother') }}</h4>
              <div class="fields-grid">
                <!-- Row 1: 姓名 + 国籍 + 出生日期 -->
                <TextField name="mother_name" label-key="ukVisa.fields.mother_name.label" placeholder-key="ukVisa.fields.mother_name.placeholder" v-model="formData.mother_name" span="third" required prefix-icon="User" constraint="alpha" />
                <NationalityField name="mother_nationality" label-key="ukVisa.fields.mother_nationality.label" v-model="formData.mother_nationality" required />
                <DateField name="mother_dob" label-key="ukVisa.fields.mother_dob.label" v-model="formData.mother_dob" required prefix-icon="Calendar" />
              </div>
              <div class="fields-grid">
                <!-- Row 2: 国家 + 地址 -->
                <NationalityField name="mother_country" label-key="ukVisa.fields.mother_country.label" v-model="formData.mother_country" required span="third" />
                <TextField name="mother_address" label-key="ukVisa.fields.mother_address.label" placeholder-key="ukVisa.fields.mother_address.placeholder" v-model="formData.mother_address" required prefix-icon="MapPin" />
              </div>
              <div class="fields-grid">
                <RadioField name="mother_changed_nationality" label-key="ukVisa.fields.mother_changed_nationality.label" :options="yesNoOptions" v-model="formData.mother_changed_nationality" />
              </div>
              <div class="fields-grid">
                <RadioField name="mother_going_to_uk" label-key="ukVisa.fields.mother_going_to_uk.label" :options="yesNoOptions" v-model="formData.mother_going_to_uk" required />
              </div>
            </AccordionContent>
          </AccordionItem>

          <!-- 6. 子女信息（动态添加行） -->
          <AccordionItem value="children-info" data-accordion-value="children-info">
            <AccordionTrigger>{{ t('ukVisa.sections.childrenInfo') }}</AccordionTrigger>
            <AccordionContent>
              <div class="fields-grid">
                <RadioField name="hasChildren" label-key="ukVisa.fields.hasChildren.label" :options="yesNoOptions" v-model="formData.hasChildren" required />
              </div>
              <div v-if="formData.hasChildren === 'yes'" class="conditional-group">
                <div v-for="(child, index) in children" :key="'child-' + index" class="repeatable-group">
                  <div class="repeatable-header">
                    <h4 class="sub-label">{{ t('ukVisa.subLabels.child') }} {{ index + 1 }}</h4>
                    <button type="button" class="remove-btn" @click="removeChild(index)">
                      <Trash2 :size="14" /> {{ t('ukVisa.removeRow') }}
                    </button>
                  </div>
                  <div class="fields-grid">
                    <!-- Row 1: 姓名 + 国籍 + 出生日期 + 关系 -->
                    <TextField :name="'child_' + index + '_name'" label-key="ukVisa.fields.child.name.label" placeholder-key="ukVisa.fields.child.name.placeholder" v-model="child.name" span="third" required prefix-icon="User" constraint="alpha" />
                    <NationalityField :name="'child_' + index + '_nationality'" label-key="ukVisa.fields.child.nationality.label" v-model="child.nationality" required />
                    <DateField :name="'child_' + index + '_dob'" label-key="ukVisa.fields.child.dob.label" v-model="child.dob" required prefix-icon="Calendar" />
                    <SelectField :name="'child_' + index + '_relation'" label-key="ukVisa.fields.child.relation.label" :options="childRelationOptions" v-model="child.relation" span="third" required />
                    <!-- Row 2: 国家 + 地址 -->
                    <NationalityField :name="'child_' + index + '_country'" label-key="ukVisa.fields.child.country.label" v-model="child.country" required span="third" />
                    <TextField :name="'child_' + index + '_addr'" label-key="ukVisa.fields.child.address.label" placeholder-key="ukVisa.fields.child.address.placeholder" v-model="child.address" prefix-icon="MapPin" />
                    <!-- 决策字段 -->
                  </div>
                  <div class="fields-grid">
                    <RadioField :name="'child_' + index + '_changed'" label-key="ukVisa.fields.child.changedNationality.label" :options="yesNoOptions" v-model="child.changedNationality" required />
                  </div>
                  <div class="fields-grid">
                    <RadioField :name="'child_' + index + '_going'" label-key="ukVisa.fields.child.goingToUK.label" :options="yesNoOptions" v-model="child.goingToUK" required />
                  </div>
                </div>
                <button type="button" class="add-btn" @click="addChild">
                  <Plus :size="16" /> {{ t('ukVisa.addRow') }}
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <!-- 7. 旅行计划 -->
          <AccordionItem value="travel-plan" data-accordion-value="travel-plan">
            <AccordionTrigger>{{ t('ukVisa.sections.travelPlan') }}</AccordionTrigger>
            <AccordionContent>
              <div class="fields-grid">
                <!-- Row 1: 出行目的 + 到达日期 + 离开日期（同行，各 third） -->
                <SelectField name="purposeOfVisit" label-key="ukVisa.fields.purposeOfVisit.label" :options="purposeOptions" v-model="formData.purposeOfVisit" required span="third" />
                <DateField name="intendedArrivalDate" label-key="ukVisa.fields.intendedArrivalDate.label" v-model="formData.intendedArrivalDate" required prefix-icon="Calendar" />
                <DateField name="intendedDepartureDate" label-key="ukVisa.fields.intendedDepartureDate.label" v-model="formData.intendedDepartureDate" :min-value="formData.intendedArrivalDate" required prefix-icon="Calendar" />
                <!-- Row 2: 行程描述 (多行文本域) -->
                <TextField name="travelPlanDesc" label-key="ukVisa.fields.travelPlanDesc.label" placeholder-key="ukVisa.fields.travelPlanDesc.placeholder" v-model="formData.travelPlanDesc" span="full" prefix-icon="Plane" multiline />
              </div>
            </AccordionContent>
          </AccordionItem>

          <!-- 8. 同行人信息（动态添加行） -->
          <AccordionItem value="companions" data-accordion-value="companions">
            <AccordionTrigger>{{ t('ukVisa.sections.companions') }}</AccordionTrigger>
            <AccordionContent>
              <div class="fields-grid">
                <RadioField name="hasCompanion" label-key="ukVisa.fields.hasCompanion.label" :options="yesNoOptions" v-model="formData.hasCompanion" required />
              </div>
              <div v-if="formData.hasCompanion === 'yes'" class="conditional-group">
                <div v-for="(comp, index) in companions" :key="'comp-' + index" class="repeatable-group">
                  <div class="repeatable-header">
                    <h4 class="sub-label">{{ t('ukVisa.subLabels.companion') }} {{ index + 1 }}</h4>
                    <button type="button" class="remove-btn" @click="removeCompanion(index)">
                      <Trash2 :size="14" /> {{ t('ukVisa.removeRow') }}
                    </button>
                  </div>
                  <div class="fields-grid">
                    <!-- Row 1: 姓名 + 国籍 + 出生日期 + 与申请人关系 -->
                    <TextField :name="'comp_' + index + '_name'" label-key="ukVisa.fields.companion.name.label" placeholder-key="ukVisa.fields.companion.name.placeholder" v-model="comp.name" span="third" required prefix-icon="User" constraint="alpha" />
                    <NationalityField :name="'comp_' + index + '_nationality'" label-key="ukVisa.fields.companion.nationality.label" v-model="comp.nationality" required />
                    <DateField :name="'comp_' + index + '_dob'" label-key="ukVisa.fields.companion.dob.label" v-model="comp.dob" required prefix-icon="Calendar" />
                    <SelectField :name="'comp_' + index + '_relation'" label-key="ukVisa.fields.companion.relation.label" :options="companionRelationOptions" v-model="comp.relation" span="third" required />
                    <!-- Row 2: 护照号 -->
                    <TextField :name="'comp_' + index + '_passport'" label-key="ukVisa.fields.companion.passport.label" placeholder-key="ukVisa.fields.companion.passport.placeholder" v-model="comp.passport" required prefix-icon="BookOpen" constraint="alphanumeric" />
                  </div>
                </div>
                <button type="button" class="add-btn" @click="addCompanion">
                  <Plus :size="16" /> {{ t('ukVisa.addRow') }}
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <!-- 9. 工作与收入 -->
          <AccordionItem value="employment-info" data-accordion-value="employment-info">
            <AccordionTrigger>{{ t('ukVisa.sections.employmentInfo') }}</AccordionTrigger>
            <AccordionContent>
              <div class="fields-grid">
                <RadioField name="employmentStatus" label-key="ukVisa.fields.employmentStatus.label" :options="employmentStatusOptions" v-model="formData.employmentStatus" required />
              </div>
              <div v-if="formData.employmentStatus === 'working' || formData.employmentStatus === 'studying'" class="conditional-group">
                <div class="fields-grid">
                  <!-- Row 1: 入职/入学日期 + 职位 + 薪资 -->
                  <DateField name="jobStartDate" label-key="ukVisa.fields.jobStartDate.label" v-model="formData.jobStartDate" required prefix-icon="Calendar" />
                  <!-- 工作职位 + 月薪 (仅在职时显示) -->
                  <div v-if="formData.employmentStatus === 'working'" style="display: contents">
                    <TextField name="jobTitle" label-key="ukVisa.fields.jobTitle.label" placeholder-key="ukVisa.fields.jobTitle.placeholder" v-model="formData.jobTitle" span="third" required prefix-icon="Briefcase" />
                    <NumberField name="monthlySalary" label-key="ukVisa.fields.monthlySalary.label" :model-value="formData.monthlySalary as number | undefined" @update:model-value="v => formData.monthlySalary = v" span="third" required :min="0" suffix="¥" />
                  </div>
                  <!-- Row 2: 公司/学校名 + 联系电话 (动态 i18n) -->
                  <TextField name="companyName" :label-key="companyNameKey" :placeholder-key="companyNamePlaceholder" v-model="formData.companyName" span="half" required prefix-icon="Building" />
                  <TextField name="companyPhone" :label-key="companyPhoneKey" :placeholder-key="companyPhonePlaceholder" v-model="formData.companyPhone" span="half" inputmode="tel" prefix-icon="Phone" />
                  <!-- Row 3: 邮编 + 地址 (动态 i18n) -->
                  <TextField name="companyPostalCode" :label-key="companyPostalCodeKey" :placeholder-key="companyPostalCodePlaceholder" v-model="formData.companyPostalCode" span="third" inputmode="numeric" prefix-icon="Mailbox" />
                  <TextField name="companyAddress" :label-key="companyAddressKey" :placeholder-key="companyAddressPlaceholder" v-model="formData.companyAddress" required prefix-icon="MapPin" />
                  <!-- 工作职责 (仅在职时显示) -->
                  <div v-if="formData.employmentStatus === 'working'" style="display: contents">
                    <TextField name="jobDuties" label-key="ukVisa.fields.jobDuties.label" placeholder-key="ukVisa.fields.jobDuties.placeholder" v-model="formData.jobDuties" span="full" prefix-icon="ClipboardList" multiline />
                  </div>
                  <!-- 其他收入 (仅在职时显示，放在工作/学习数据子域内) -->
                  <div v-if="formData.employmentStatus === 'working'" style="display: contents">
                    <TextField name="otherIncome" label-key="ukVisa.fields.otherIncome.label" placeholder-key="ukVisa.fields.otherIncome.placeholder" v-model="formData.otherIncome" span="third" required prefix-icon="Wallet" />
                  </div>
                </div>
              </div>
              <div v-if="formData.employmentStatus === 'unemployed'" class="conditional-group">
                <div class="fields-grid">
                  <TextField name="unemployedReason" label-key="ukVisa.fields.unemployedReason.label" placeholder-key="ukVisa.fields.unemployedReason.placeholder" v-model="formData.unemployedReason" required span="full" prefix-icon="FileQuestion" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <!-- 10. 财务信息 -->
          <AccordionItem value="financial-info" data-accordion-value="financial-info">
            <AccordionTrigger>{{ t('ukVisa.sections.financialInfo') }}</AccordionTrigger>
            <AccordionContent>
              <div class="fields-grid">
                <!-- 预计花费 + 月支出 -->
                <NumberField name="estimatedUKSpend" label-key="ukVisa.fields.estimatedUKSpend.label" :model-value="formData.estimatedUKSpend as number | undefined" @update:model-value="v => formData.estimatedUKSpend = v" :min="0" required span="third" suffix="¥" />
                <NumberField name="monthlyExpense" label-key="ukVisa.fields.monthlyExpense.label" :model-value="formData.monthlyExpense as number | undefined" @update:model-value="v => formData.monthlyExpense = v" :min="0" required span="third" suffix="¥" />
                <!-- 是否有赞助人 -->
                <RadioField name="hasSponsor" label-key="ukVisa.fields.hasSponsor.label" :options="yesNoOptions" v-model="formData.hasSponsor" />
              </div>
              <div v-if="formData.hasSponsor === 'yes'" class="conditional-group">
                <div class="fields-grid">
                  <TextField name="sponsorName" label-key="ukVisa.fields.sponsorName.label" placeholder-key="ukVisa.fields.sponsorName.placeholder" v-model="formData.sponsorName" required span="third" prefix-icon="UserCheck" />
                  <NumberField name="sponsorAmount" label-key="ukVisa.fields.sponsorAmount.label" :model-value="formData.sponsorAmount as number | undefined" @update:model-value="v => formData.sponsorAmount = v" :min="0" required span="third" suffix="¥" />
                  <TextField name="sponsorRelation" label-key="ukVisa.fields.sponsorRelation.label" placeholder-key="ukVisa.fields.sponsorRelation.placeholder" v-model="formData.sponsorRelation" required span="third" prefix-icon="Users" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <!-- 11. 英国联系人与住宿 -->
          <AccordionItem value="uk-contacts" data-accordion-value="uk-contacts">
            <AccordionTrigger>{{ t('ukVisa.sections.ukContacts') }}</AccordionTrigger>
            <AccordionContent>
              <div class="fields-grid">
                <RadioField name="hasUKContact" label-key="ukVisa.fields.hasUKContact.label" :options="yesNoOptions" v-model="formData.hasUKContact" required />
              </div>
              <div v-if="formData.hasUKContact === 'yes'" class="conditional-group">
                <div class="fields-grid">
                  <!-- Row 1: 姓名 + 身份 + 关系 -->
                  <TextField name="ukContactName" label-key="ukVisa.fields.ukContactName.label" placeholder-key="ukVisa.fields.ukContactName.placeholder" v-model="formData.ukContactName" span="third" required prefix-icon="User" />
                  <TextField name="ukContactStatus" label-key="ukVisa.fields.ukContactStatus.label" placeholder-key="ukVisa.fields.ukContactStatus.placeholder" v-model="formData.ukContactStatus" span="third" required prefix-icon="Shield" />
                  <TextField name="ukContactRelation" label-key="ukVisa.fields.ukContactRelation.label" placeholder-key="ukVisa.fields.ukContactRelation.placeholder" v-model="formData.ukContactRelation" span="third" required prefix-icon="Users" />
                  <!-- Row 2: 电话 + 邮编 + 证件号 (占2列) -->
                  <TextField name="ukContactPhone" label-key="ukVisa.fields.ukContactPhone.label" placeholder-key="ukVisa.fields.ukContactPhone.placeholder" v-model="formData.ukContactPhone" inputmode="tel" span="third" required prefix-icon="Phone" />
                  <TextField name="ukContactPostal" label-key="ukVisa.fields.ukContactPostal.label" placeholder-key="ukVisa.fields.ukContactPostal.placeholder" v-model="formData.ukContactPostal" span="third" prefix-icon="Mailbox" />
                  <TextField name="ukContactDocNumber" label-key="ukVisa.fields.ukContactDocNumber.label" placeholder-key="ukVisa.fields.ukContactDocNumber.placeholder" v-model="formData.ukContactDocNumber" span="half" required prefix-icon="CreditCard" />
                </div>
              </div>
              <div class="fields-grid">
                <RadioField name="hasUKAccommodation" label-key="ukVisa.fields.hasUKAccommodation.label" :options="yesNoOptions" v-model="formData.hasUKAccommodation" required />
              </div>
              <div v-if="formData.hasUKAccommodation === 'yes'" class="conditional-group">
                <div class="fields-grid">
                  <!-- Row 1: 住宿详情 + 住宿地址 (各占半) -->
                  <TextField name="ukAccommodationDetail" label-key="ukVisa.fields.ukAccommodationDetail.label" placeholder-key="ukVisa.fields.ukAccommodationDetail.placeholder" v-model="formData.ukAccommodationDetail" required span="half" prefix-icon="Home" />
                  <TextField name="ukAccommodationAddress" label-key="ukVisa.fields.ukAccommodationAddress.label" placeholder-key="ukVisa.fields.ukAccommodationAddress.placeholder" v-model="formData.ukAccommodationAddress" required span="half" prefix-icon="MapPin" />
                  <!-- Row 2: 入住日期 + 离开日期 + 邮编 -->
                  <DateField name="ukCheckinDate" label-key="ukVisa.fields.ukCheckinDate.label" v-model="formData.ukCheckinDate" required prefix-icon="Calendar" />
                  <DateField name="ukCheckoutDate" label-key="ukVisa.fields.ukCheckoutDate.label" v-model="formData.ukCheckoutDate" :min-value="formData.ukCheckinDate" required prefix-icon="Calendar" />
                  <TextField name="ukAccommodationPostal" label-key="ukVisa.fields.ukAccommodationPostal.label" placeholder-key="ukVisa.fields.ukAccommodationPostal.placeholder" v-model="formData.ukAccommodationPostal" span="third" inputmode="numeric" prefix-icon="Mailbox" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <!-- 12. 签证与旅行历史 -->
          <AccordionItem value="visa-history" data-accordion-value="visa-history">
            <AccordionTrigger>{{ t('ukVisa.sections.visaHistory') }}</AccordionTrigger>
            <AccordionContent>
              <!-- 英国签证历史 -->
              <div class="fields-grid">
                <RadioField name="hadUKVisa" label-key="ukVisa.fields.hadUKVisa.label" :options="yesNoOptions" v-model="formData.hadUKVisa" required />
              </div>
              <div v-if="formData.hadUKVisa === 'yes'" class="conditional-group">
                <div class="fields-grid">
                  <DateField name="lastUKVisaDate" label-key="ukVisa.fields.lastUKVisaDate.label" v-model="formData.lastUKVisaDate" required prefix-icon="Calendar" />
                </div>
              </div>

              <!-- 去过英国（动态添加行） -->
              <div class="fields-grid">
                <RadioField name="visitedUK" label-key="ukVisa.fields.visitedUK.label" :options="yesNoOptions" v-model="formData.visitedUK" required />
              </div>
              <div v-if="formData.visitedUK === 'yes'" class="conditional-group">
                <div v-for="(visit, index) in ukVisits" :key="'visit-' + index" class="repeatable-group">
                  <div class="repeatable-header">
                    <h4 class="sub-label">{{ t('ukVisa.subLabels.ukVisit', { index: index + 1 }) }}</h4>
                    <button type="button" class="remove-btn" @click="removeUkVisit(index)">
                      <Trash2 :size="14" /> {{ t('ukVisa.removeRow') }}
                    </button>
                  </div>
                  <div class="fields-grid">
                    <!-- 日期 + 停留时长 + 目的(全宽) -->
                    <DateField :name="'visit_' + index + '_date'" label-key="ukVisa.fields.ukVisit.date.label" v-model="visit.date" required prefix-icon="Calendar" />
                    <TextField :name="'visit_' + index + '_duration'" label-key="ukVisa.fields.ukVisit.duration.label" placeholder-key="ukVisa.fields.ukVisit.duration.placeholder" v-model="visit.duration" required span="third" prefix-icon="Clock" />
                    <TextField :name="'visit_' + index + '_purpose'" label-key="ukVisa.fields.ukVisit.purpose.label" placeholder-key="ukVisa.fields.ukVisit.purpose.placeholder" v-model="visit.purpose" required span="full" prefix-icon="ClipboardList" />
                  </div>
                </div>
                <button type="button" class="add-btn" @click="addUkVisit">
                  <Plus :size="16" /> {{ t('ukVisa.addRow') }}
                </button>
              </div>

              <!-- 拒签历史（动态添加行） -->
              <div class="fields-grid">
                <RadioField name="beenRefused" label-key="ukVisa.fields.beenRefused.label" :options="yesNoOptions" v-model="formData.beenRefused" required />
              </div>
              <div v-if="formData.beenRefused === 'yes'" class="conditional-group">
                <div v-for="(ref, index) in refusals" :key="'refusal-' + index" class="repeatable-group">
                  <div class="repeatable-header">
                    <h4 class="sub-label">{{ t('ukVisa.subLabels.refusal', { index: index + 1 }) }}</h4>
                    <button type="button" class="remove-btn" @click="removeRefusal(index)">
                      <Trash2 :size="14" /> {{ t('ukVisa.removeRow') }}
                    </button>
                  </div>
                  <div class="fields-grid">
                    <!-- Row 1: 国家 + 日期 + 受理号 -->
                    <NationalityField :name="'refusal_' + index + '_country'" label-key="ukVisa.fields.refusal.country.label" v-model="ref.country" required span="third" />
                    <DateField :name="'refusal_' + index + '_date'" label-key="ukVisa.fields.refusal.date.label" v-model="ref.date" required prefix-icon="Calendar" />
                    <TextField :name="'refusal_' + index + '_ref'" label-key="ukVisa.fields.refusal.refNumber.label" placeholder-key="ukVisa.fields.refusal.refNumber.placeholder" v-model="ref.refNumber" span="third" prefix-icon="Hash" />
                    <!-- Row 2: 原因 (全宽) -->
                    <TextField :name="'refusal_' + index + '_reason'" label-key="ukVisa.fields.refusal.reason.label" placeholder-key="ukVisa.fields.refusal.reason.placeholder" v-model="ref.reason" required span="full" prefix-icon="FileQuestion" />
                  </div>
                </div>
                <button type="button" class="add-btn" @click="addRefusal">
                  <Plus :size="16" /> {{ t('ukVisa.addRow') }}
                </button>
              </div>

              <!-- 向英国内政部申请 -->
              <div class="fields-grid">
                <RadioField name="appliedUKStay" label-key="ukVisa.fields.appliedUKStay.label" :options="yesNoOptions" v-model="formData.appliedUKStay" required />
              </div>
              <div v-if="formData.appliedUKStay === 'yes'" class="conditional-group">
                <div class="fields-grid">
                  <!-- 申请日期 + 是否批准 -->
                  <DateField name="applyDetail_date" label-key="ukVisa.fields.applyDetail_date.label" v-model="formData.applyDetail_date" required prefix-icon="Calendar" />
                  <RadioField name="applyDetail_approved" label-key="ukVisa.fields.applyDetail_approved.label" :options="yesNoOptions" v-model="formData.applyDetail_approved" required />
                  <!-- 申请原因 (全宽) -->
                  <TextField name="applyDetail_reason" label-key="ukVisa.fields.applyDetail_reason.label" placeholder-key="ukVisa.fields.applyDetail_reason.placeholder" v-model="formData.applyDetail_reason" required span="full" prefix-icon="FileQuestion" />
                </div>
              </div>

              <!-- 其他国家旅行（动态添加行） -->
              <div class="fields-grid">
                <RadioField name="visitedOtherCountries" label-key="ukVisa.fields.visitedOtherCountries.label" :options="yesNoOptions" v-model="formData.visitedOtherCountries" required />
              </div>
              <div v-if="formData.visitedOtherCountries === 'yes'" class="conditional-group">
                <div v-for="(oc, index) in otherCountries" :key="'oc-' + index" class="repeatable-group">
                  <div class="repeatable-header">
                    <h4 class="sub-label">{{ t('ukVisa.subLabels.otherCountry', { index: index + 1 }) }}</h4>
                    <button type="button" class="remove-btn" @click="removeOtherCountry(index)">
                      <Trash2 :size="14" /> {{ t('ukVisa.removeRow') }}
                    </button>
                  </div>
                  <div class="fields-grid">
                    <!-- Row 1: 国家 + 日期 + 停留时长 -->
                    <SelectField :name="'oc_' + index + '_name'" label-key="ukVisa.fields.otherCountry.name.label" :options="otherCountryOptions" v-model="oc.name" required span="third" />
                    <DateField :name="'oc_' + index + '_date'" label-key="ukVisa.fields.otherCountry.date.label" v-model="oc.date" required prefix-icon="Calendar" />
                    <TextField :name="'oc_' + index + '_duration'" label-key="ukVisa.fields.otherCountry.duration.label" placeholder-key="ukVisa.fields.otherCountry.duration.placeholder" v-model="oc.duration" required span="third" prefix-icon="Clock" />
                    <!-- Row 2: 目的 (全宽) -->
                    <TextField :name="'oc_' + index + '_purpose'" label-key="ukVisa.fields.otherCountry.purpose.label" placeholder-key="ukVisa.fields.otherCountry.purpose.placeholder" v-model="oc.purpose" required span="full" prefix-icon="ClipboardList" />
                  </div>
                </div>
                <button type="button" class="add-btn" @click="addOtherCountry">
                  <Plus :size="16" /> {{ t('ukVisa.addRow') }}
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <!-- 13. 安全与背景 -->
          <AccordionItem value="security-background" data-accordion-value="security-background">
            <AccordionTrigger>{{ t('ukVisa.sections.securityBackground') }}</AccordionTrigger>
            <AccordionContent>
              <div class="fields-grid">
                <RadioField name="hasUKInsurance" label-key="ukVisa.fields.hasUKInsurance.label" :options="yesNoOptions" v-model="formData.hasUKInsurance" required />
              </div>
              <!-- 保险条件字段 -->
              <div v-if="formData.hasUKInsurance === 'yes'" class="conditional-group">
                <div class="fields-grid">
                  <TextField name="insuranceNumber" label-key="ukVisa.fields.insuranceNumber.label" placeholder-key="ukVisa.fields.insuranceNumber.placeholder" v-model="formData.insuranceNumber" required span="half" prefix-icon="Hash" />
                  <TextField name="insuranceReason" label-key="ukVisa.fields.insuranceReason.label" placeholder-key="ukVisa.fields.insuranceReason.placeholder" v-model="formData.insuranceReason" required span="half" prefix-icon="FileQuestion" />
                </div>
              </div>
              <div class="fields-grid">
                <RadioField name="hasCriminalRecord" label-key="ukVisa.fields.hasCriminalRecord.label" :options="yesNoOptions" v-model="formData.hasCriminalRecord" required />
                <RadioField name="hasTerrorism" label-key="ukVisa.fields.hasTerrorism.label" :options="yesNoOptions" v-model="formData.hasTerrorism" required />
                <RadioField name="hasBeenProsecuted" label-key="ukVisa.fields.hasBeenProsecuted.label" :options="yesNoOptions" v-model="formData.hasBeenProsecuted" required />
                <RadioField name="hasGenocide" label-key="ukVisa.fields.hasGenocide.label" :options="yesNoOptions" v-model="formData.hasGenocide" required />
                <RadioField name="hasArmedConflict" label-key="ukVisa.fields.hasArmedConflict.label" :options="yesNoOptions" v-model="formData.hasArmedConflict" required />
                <RadioField name="hasSpecialIndustry" label-key="ukVisa.fields.hasSpecialIndustry.label" :options="yesNoOptions" v-model="formData.hasSpecialIndustry" required />
              </div>
              <!-- 特殊行业条件字段 -->
              <div v-if="formData.hasSpecialIndustry === 'yes'" class="conditional-group">
                <div class="fields-grid">
                  <SelectField name="specialIndustries" label-key="ukVisa.fields.specialIndustries.label" :options="specialIndustriesOptions" v-model="formData.specialIndustries" required span="third" />
                  <TextField name="specialIndustryDetail" label-key="ukVisa.fields.specialIndustryDetail.label" placeholder-key="ukVisa.fields.specialIndustryDetail.placeholder" v-model="formData.specialIndustryDetail" required span="half" prefix-icon="Factory" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </div>
    </div>

    <!-- 回到顶部按钮 -->
    <Transition name="fade">
      <button
        v-if="showBackToTop"
        type="button"
        class="back-to-top-btn"
        :title="t('ukVisa.backToTop')"
        @click="scrollToTop"
      >
        <ArrowUp :size="20" />
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.form-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  padding: 2rem 1rem;
  position: relative;
  overflow: clip; /* 裁剪 ::before 溢出，不产生滚动条（hidden 会强制 overflow-y: auto） */
}

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
  max-width: 960px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.form-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  /* ponytail: isolate compositing layer so accordion height animation
     doesn't trigger backdrop-filter recomputation per frame (= jitter) */
  transform: translateZ(0);
}

/* Override accordion's transition-all inside glass-card: only animate height,
   prevents backdrop-filter recomputation per frame (= jitter) */
.glass-card :deep([data-state]) {
  transition: height 0.2s ease !important;
}

/* 一键填充时临时禁用所有 transition，避免同时展开 13 个分组导致卡顿 */
.glass-card.no-transition :deep([data-state]) {
  transition: none !important;
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  /* 给聚焦环留空间，防止被相邻元素裁掉 */
  padding: 0.25rem;
}

.field-row {
  grid-column: span 2;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

/* field-pair: 两个短字段占 AC 列，BD 列留空 */
.field-pair {
  grid-column: span 4;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  /* 给聚焦环留空间 */
  padding: 0.25rem;
}

.field-pair > :deep(.field-span-full),
.field-pair > :deep(.field-span-half) {
  grid-column: 1 / 2;
}

.field-pair > :deep(.field-span-third):nth-child(2) {
  grid-column: 3 / 4;
}

.field-row--triple {
  grid-column: span 2;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

:deep(.field-span-full) {
  grid-column: span 4;
}

:deep(.field-span-half) {
  grid-column: span 2;
}

:deep(.field-span-third) {
  grid-column: span 1;
}

.sub-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1e40af;
  margin: 1.25rem 0 0.75rem;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(to right, #eff6ff, transparent);
  border-left: 3px solid #3b82f6;
  border-radius: 0 0.25rem 0.25rem 0;
  letter-spacing: 0.025em;
}

.conditional-group {
  grid-column: 1 / -1;
  background: hsl(188 70% 42% / 0.14);
  border: 1px solid hsl(188 70% 42% / 0.38);
  border-left: 3px solid hsl(188 70% 42% / 0.72);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 0.25rem;
}

.repeatable-group {
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid hsl(188 40% 65% / 0.22);
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s, border-color 0.2s, background 0.2s;
}

.repeatable-group:hover {
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  border-color: hsl(188 40% 60% / 0.38);
}

.repeatable-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.repeatable-header .sub-label {
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  font-size: 0.9rem;
  color: hsl(var(--foreground));
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: hsl(var(--primary));
  background: hsl(var(--muted) / 0.5);
  border: 1px dashed hsl(var(--primary) / 0.4);
  border-radius: 0.5rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.15s, border-color 0.15s;
}

.add-btn:hover {
  background: hsl(var(--muted));
  border-color: hsl(var(--primary));
}

.remove-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  color: hsl(var(--destructive, 0 84% 60%));
  background: hsl(var(--destructive, 0 84% 60%) / 0.08);
  border: 1px solid hsl(var(--destructive, 0 84% 60%) / 0.3);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.remove-btn:hover {
  background: hsl(var(--destructive, 0 84% 60%) / 0.15);
  border-color: hsl(var(--destructive, 0 84% 60%));
}

/* 回到顶部按钮 */
.back-to-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  color: #4f46e5;
  cursor: pointer;
  transition: all 0.25s;
  z-index: 100;
}

.back-to-top-btn:hover {
  background: #4f46e5;
  color: #fff;
  transform: translateY(-3px);
  box-shadow: 0 6px 24px rgba(79, 70, 229, 0.4);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 错误字段闪烁动画 */
:global(.field-error-flash) {
  animation: errorFlash 2s ease-out;
}

@keyframes errorFlash {
  0%, 20% {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.4);
  }
  100% {
    box-shadow: 0 0 0 0px rgba(239, 68, 68, 0);
  }
}

/* 平板端：field-row 和 third 降级 */
@media (max-width: 1024px) {
  .field-row,
  .field-row--triple {
    grid-column: span 4;
    grid-template-columns: repeat(2, 1fr);
  }

  .field-pair {
    grid-column: span 4;
    grid-template-columns: repeat(2, 1fr);
  }

  .field-pair > :deep(.field-span-third):nth-child(2) {
    grid-column: 2 / 3;
  }

  :deep(.field-span-third) {
    grid-column: span 2;
  }
}

/* 手机端：全部单列 */
@media (max-width: 768px) {
  .fields-grid {
    grid-template-columns: 1fr;
  }

  .field-row,
  .field-row--triple,
  .field-pair {
    grid-column: span 1;
    grid-template-columns: 1fr;
  }

  :deep(.field-span-full),
  :deep(.field-span-half),
  :deep(.field-span-third) {
    grid-column: span 1;
  }
}
</style>
