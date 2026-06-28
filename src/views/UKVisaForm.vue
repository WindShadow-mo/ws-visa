<script setup lang="ts">
// UKVisaForm — 英国标准访客签证补充信息表
// 13 分组，含条件联动和动态可重复组（add/remove rows）
// Section 顺序按 UX 重要性排列：身份 → 家庭 → 旅行 → 财力 → 历史 → 安全

import { computed, nextTick, reactive, ref, watch } from 'vue'
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
  return { name: '', dob: '', nationality: '', passport: '', relation: '' }
}
function createChild() {
  return { name: '', nationality: '', changedNationality: '', otherNationality: '', relation: '', dob: '', goingToUK: '', address: '' }
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

// ---- 预览数据构建（13 个分组） ----

const previewSections = computed<PreviewSection[]>(() => [
  // 1. 基本信息
  {
    title: t('ukVisa.sections.personalInfo'),
    fields: [
      { label: t('ukVisa.fields.lastName.label'), value: formData.lastName, required: true, name: 'lastName' },
      { label: t('ukVisa.fields.firstName.label'), value: formData.firstName, required: true, name: 'firstName' },
      { label: t('ukVisa.fields.formerName.label'), value: formData.formerName },
      { label: t('ukVisa.fields.gender.label'), value: resolveOption(genderOptions, formData.gender), required: true, name: 'gender' },
      { label: t('ukVisa.fields.dateOfBirth.label'), value: formatDate(formData.dateOfBirth), required: true, name: 'dateOfBirth' },
      { label: t('ukVisa.fields.phone.label'), value: formData.phone, required: true, name: 'phone' },
      { label: t('ukVisa.fields.email.label'), value: formData.email, required: true, name: 'email' },
    ],
  },
  // 2. 护照与证件
  {
    title: t('ukVisa.sections.passportInfo'),
    fields: [
      { label: t('ukVisa.fields.passportNumber.label'), value: formData.passportNumber, required: true, name: 'passportNumber' },
      { label: t('ukVisa.fields.passportIssueDate.label'), value: formatDate(formData.passportIssueDate), required: true, name: 'passportIssueDate' },
      { label: t('ukVisa.fields.passportExpiryDate.label'), value: formatDate(formData.passportExpiryDate), required: true, name: 'passportExpiryDate' },
      { label: t('ukVisa.fields.issuingAuthority.label'), value: formData.issuingAuthority, required: true, name: 'issuingAuthority' },
      { label: t('ukVisa.fields.nationality.label'), value: resolveOption(nationalityOptions, formData.nationality), required: true, name: 'nationality' },
      { label: t('ukVisa.fields.hasOtherPassport.label'), value: resolveOption(yesNoOptions, formData.hasOtherPassport), required: true, name: 'hasOtherPassport' },
      ...(formData.hasOtherPassport === 'yes'
        ? [{ label: t('ukVisa.fields.otherPassportDetail.label'), value: formData.otherPassportDetail, required: true, name: 'otherPassportDetail' }]
        : []),
      { label: t('ukVisa.fields.isFirstPassport.label'), value: resolveOption(yesNoOptions, formData.isFirstPassport), required: true, name: 'isFirstPassport' },
      { label: t('ukVisa.fields.idCardNumber.label'), value: formData.idCardNumber, required: true, name: 'idCardNumber' },
      { label: t('ukVisa.fields.idCardAuthority.label'), value: formData.idCardAuthority, required: true, name: 'idCardAuthority' },
      { label: t('ukVisa.fields.idCardExpiry.label'), value: formData.idCardExpiry, required: true, name: 'idCardExpiry' },
    ],
  },
  // 3. 居住地址
  {
    title: t('ukVisa.sections.addressInfo'),
    fields: [
      { label: t('ukVisa.fields.currentAddress.label'), value: formData.currentAddress, required: true, name: 'currentAddress' },
      { label: t('ukVisa.fields.postalCode.label'), value: formData.postalCode },
      { label: t('ukVisa.fields.housingStatus.label'), value: resolveOption(housingStatusOptions, formData.housingStatus), required: true, name: 'housingStatus' },
      { label: t('ukVisa.fields.residenceStartDate.label'), value: formatDate(formData.residenceStartDate), required: true, name: 'residenceStartDate' },
      ...(formData.housingStatus === 'tenant'
        ? [{ label: t('ukVisa.fields.houseOwner.label'), value: formData.houseOwner, required: true, name: 'houseOwner' }]
        : []),
    ],
  },
  // 4. 婚姻与配偶
  {
    title: t('ukVisa.sections.marriageInfo'),
    fields: [
      { label: t('ukVisa.fields.maritalStatus.label'), value: resolveOption(maritalStatusOptions, formData.maritalStatus), required: true, name: 'maritalStatus' },
      ...(formData.maritalStatus === 'married'
        ? [
            { label: t('ukVisa.fields.spouseName.label'), value: formData.spouseName, required: true, name: 'spouseName' },
            { label: t('ukVisa.fields.spouseDob.label'), value: formatDate(formData.spouseDob), required: true, name: 'spouseDob' },
            { label: t('ukVisa.fields.spouseNationality.label'), value: resolveOption(nationalityOptions, formData.spouseNationality), required: true, name: 'spouseNationality' },
            { label: t('ukVisa.fields.spouseChangedNationality.label'), value: resolveOption(yesNoOptions, formData.spouseChangedNationality), required: true, name: 'spouseChangedNationality' },
            ...(formData.spouseChangedNationality === 'yes'
              ? [{ label: t('ukVisa.fields.spouseOtherNationality.label'), value: formData.spouseOtherNationality, required: true, name: 'spouseOtherNationality' }]
              : []),
            { label: t('ukVisa.fields.spouseBirthCity.label'), value: formData.spouseBirthCity, required: true, name: 'spouseBirthCity' },
            { label: t('ukVisa.fields.spouseAddress.label'), value: formData.spouseAddress, required: true, name: 'spouseAddress' },
          ]
        : []),
    ],
  },
  // 5. 父母信息
  {
    title: t('ukVisa.sections.parentInfo'),
    fields: [
      { label: t('ukVisa.subLabels.father') + ' - ' + t('ukVisa.fields.father_name.label'), value: formData.father_name, required: true, name: 'father_name' },
      { label: t('ukVisa.fields.father_nationality.label'), value: resolveOption(nationalityOptions, formData.father_nationality), required: true, name: 'father_nationality' },
      { label: t('ukVisa.fields.father_changed_nationality.label'), value: resolveOption(yesNoOptions, formData.father_changed_nationality) },
      ...(formData.father_changed_nationality === 'yes'
        ? [{ label: t('ukVisa.fields.father_other_nationality.label'), value: formData.father_other_nationality, required: true, name: 'father_other_nationality' }]
        : []),
      { label: t('ukVisa.fields.father_dob.label'), value: formatDate(formData.father_dob), required: true, name: 'father_dob' },
      { label: t('ukVisa.fields.father_going_to_uk.label'), value: resolveOption(yesNoOptions, formData.father_going_to_uk), required: true, name: 'father_going_to_uk' },
      { label: t('ukVisa.fields.father_address.label'), value: formData.father_address, required: true, name: 'father_address' },
      { label: t('ukVisa.subLabels.mother') + ' - ' + t('ukVisa.fields.mother_name.label'), value: formData.mother_name, required: true, name: 'mother_name' },
      { label: t('ukVisa.fields.mother_nationality.label'), value: resolveOption(nationalityOptions, formData.mother_nationality), required: true, name: 'mother_nationality' },
      { label: t('ukVisa.fields.mother_changed_nationality.label'), value: resolveOption(yesNoOptions, formData.mother_changed_nationality) },
      ...(formData.mother_changed_nationality === 'yes'
        ? [{ label: t('ukVisa.fields.mother_other_nationality.label'), value: formData.mother_other_nationality, required: true, name: 'mother_other_nationality' }]
        : []),
      { label: t('ukVisa.fields.mother_dob.label'), value: formatDate(formData.mother_dob), required: true, name: 'mother_dob' },
      { label: t('ukVisa.fields.mother_going_to_uk.label'), value: resolveOption(yesNoOptions, formData.mother_going_to_uk), required: true, name: 'mother_going_to_uk' },
      { label: t('ukVisa.fields.mother_address.label'), value: formData.mother_address, required: true, name: 'mother_address' },
    ],
  },
  // 6. 子女信息
  {
    title: t('ukVisa.sections.childrenInfo'),
    fields: [
      { label: t('ukVisa.fields.hasChildren.label'), value: resolveOption(yesNoOptions, formData.hasChildren), required: true, name: 'hasChildren' },
      ...children.map((c, i) => [
        { label: `${t('ukVisa.subLabels.child')} ${i + 1} - ${t('ukVisa.fields.child.name.label')}`, value: c.name, required: true, name: `child_${i}_name` },
        { label: `${t('ukVisa.subLabels.child')} ${i + 1} - ${t('ukVisa.fields.child.nationality.label')}`, value: resolveOption(nationalityOptions, c.nationality), required: true, name: `child_${i}_nationality` },
        { label: `${t('ukVisa.subLabels.child')} ${i + 1} - ${t('ukVisa.fields.child.changedNationality.label')}`, value: resolveOption(yesNoOptions, c.changedNationality), required: true, name: `child_${i}_changed` },
        ...(c.changedNationality === 'yes'
          ? [{ label: `${t('ukVisa.subLabels.child')} ${i + 1} - ${t('ukVisa.fields.child.otherNationality.label')}`, value: c.otherNationality, required: true, name: `child_${i}_otherNat` }]
          : []),
        { label: `${t('ukVisa.subLabels.child')} ${i + 1} - ${t('ukVisa.fields.child.relation.label')}`, value: resolveOption(childRelationOptions, c.relation), required: true, name: `child_${i}_relation` },
        { label: `${t('ukVisa.subLabels.child')} ${i + 1} - ${t('ukVisa.fields.child.dob.label')}`, value: formatDate(c.dob), required: true, name: `child_${i}_dob` },
        { label: `${t('ukVisa.subLabels.child')} ${i + 1} - ${t('ukVisa.fields.child.goingToUK.label')}`, value: resolveOption(yesNoOptions, c.goingToUK), required: true, name: `child_${i}_going` },
        { label: `${t('ukVisa.subLabels.child')} ${i + 1} - ${t('ukVisa.fields.child.address.label')}`, value: c.address },
      ]).flat(),
    ],
  },
  // 7. 旅行计划
  {
    title: t('ukVisa.sections.travelPlan'),
    fields: [
      { label: t('ukVisa.fields.purposeOfVisit.label'), value: resolveOption(purposeOptions, formData.purposeOfVisit), required: true, name: 'purposeOfVisit' },
      { label: t('ukVisa.fields.intendedArrivalDate.label'), value: formatDate(formData.intendedArrivalDate), required: true, name: 'intendedArrivalDate' },
      { label: t('ukVisa.fields.intendedDepartureDate.label'), value: formatDate(formData.intendedDepartureDate), required: true, name: 'intendedDepartureDate' },
      { label: t('ukVisa.fields.travelPlanDesc.label'), value: formData.travelPlanDesc },
    ],
  },
  // 8. 同行人信息
  {
    title: t('ukVisa.sections.companions'),
    fields: [
      { label: t('ukVisa.fields.hasCompanion.label'), value: resolveOption(yesNoOptions, formData.hasCompanion), required: true, name: 'hasCompanion' },
      ...companions.map((c, i) => [
        { label: `${t('ukVisa.subLabels.companion')} ${i + 1} - ${t('ukVisa.fields.companion.name.label')}`, value: c.name, required: true, name: `comp_${i}_name` },
        { label: `${t('ukVisa.subLabels.companion')} ${i + 1} - ${t('ukVisa.fields.companion.dob.label')}`, value: formatDate(c.dob), required: true, name: `comp_${i}_dob` },
        { label: `${t('ukVisa.subLabels.companion')} ${i + 1} - ${t('ukVisa.fields.companion.nationality.label')}`, value: resolveOption(nationalityOptions, c.nationality), required: true, name: `comp_${i}_nationality` },
        { label: `${t('ukVisa.subLabels.companion')} ${i + 1} - ${t('ukVisa.fields.companion.passport.label')}`, value: c.passport, required: true, name: `comp_${i}_passport` },
        { label: `${t('ukVisa.subLabels.companion')} ${i + 1} - ${t('ukVisa.fields.companion.relation.label')}`, value: resolveOption(companionRelationOptions, c.relation), required: true, name: `comp_${i}_relation` },
      ]).flat(),
    ],
  },
  // 9. 工作与收入
  {
    title: t('ukVisa.sections.employmentInfo'),
    fields: [
      { label: t('ukVisa.fields.employmentStatus.label'), value: resolveOption(employmentStatusOptions, formData.employmentStatus), required: true, name: 'employmentStatus' },
      ...(formData.employmentStatus === 'working' || formData.employmentStatus === 'studying'
        ? [
            { label: t('ukVisa.fields.jobStartDate.label'), value: formatDate(formData.jobStartDate), required: true, name: 'jobStartDate' },
            { label: t('ukVisa.fields.companyName.label'), value: formData.companyName, required: true, name: 'companyName' },
            { label: t('ukVisa.fields.companyAddress.label'), value: formData.companyAddress, required: true, name: 'companyAddress' },
            { label: t('ukVisa.fields.companyPostalCode.label'), value: formData.companyPostalCode },
            { label: t('ukVisa.fields.companyPhone.label'), value: formData.companyPhone },
            { label: t('ukVisa.fields.jobTitle.label'), value: formData.jobTitle, required: true, name: 'jobTitle' },
            { label: t('ukVisa.fields.jobDuties.label'), value: formData.jobDuties },
            { label: t('ukVisa.fields.monthlySalary.label'), value: formData.monthlySalary, required: true, name: 'monthlySalary' },
          ]
        : []),
      ...(formData.employmentStatus === 'unemployed'
        ? [{ label: t('ukVisa.fields.unemployedReason.label'), value: formData.unemployedReason, required: true, name: 'unemployedReason' }]
        : []),
      { label: t('ukVisa.fields.otherIncome.label'), value: formData.otherIncome, required: true, name: 'otherIncome' },
    ],
  },
  // 10. 财务信息
  {
    title: t('ukVisa.sections.financialInfo'),
    fields: [
      { label: t('ukVisa.fields.estimatedUKSpend.label'), value: formData.estimatedUKSpend, required: true, name: 'estimatedUKSpend' },
      { label: t('ukVisa.fields.monthlyExpense.label'), value: formData.monthlyExpense, required: true, name: 'monthlyExpense' },
      { label: t('ukVisa.fields.hasSponsor.label'), value: resolveOption(yesNoOptions, formData.hasSponsor), name: 'hasSponsor' },
      ...(formData.hasSponsor === 'yes'
        ? [
            { label: t('ukVisa.fields.sponsorName.label'), value: formData.sponsorName, required: true, name: 'sponsorName' },
            { label: t('ukVisa.fields.sponsorRelation.label'), value: formData.sponsorRelation, required: true, name: 'sponsorRelation' },
            { label: t('ukVisa.fields.sponsorAmount.label'), value: formData.sponsorAmount, required: true, name: 'sponsorAmount' },
          ]
        : []),
    ],
  },
  // 11. 英国联系人与住宿
  {
    title: t('ukVisa.sections.ukContacts'),
    fields: [
      { label: t('ukVisa.fields.hasUKContact.label'), value: resolveOption(yesNoOptions, formData.hasUKContact), required: true, name: 'hasUKContact' },
      ...(formData.hasUKContact === 'yes'
        ? [
            { label: t('ukVisa.fields.ukContactName.label'), value: formData.ukContactName, required: true, name: 'ukContactName' },
            { label: t('ukVisa.fields.ukContactStatus.label'), value: formData.ukContactStatus, required: true, name: 'ukContactStatus' },
            { label: t('ukVisa.fields.ukContactDocNumber.label'), value: formData.ukContactDocNumber, required: true, name: 'ukContactDocNumber' },
            { label: t('ukVisa.fields.ukContactRelation.label'), value: formData.ukContactRelation, required: true, name: 'ukContactRelation' },
            { label: t('ukVisa.fields.ukContactPhone.label'), value: formData.ukContactPhone, required: true, name: 'ukContactPhone' },
            { label: t('ukVisa.fields.ukContactPostal.label'), value: formData.ukContactPostal },
          ]
        : []),
      { label: t('ukVisa.fields.hasUKAccommodation.label'), value: resolveOption(yesNoOptions, formData.hasUKAccommodation), required: true, name: 'hasUKAccommodation' },
      ...(formData.hasUKAccommodation === 'yes'
        ? [
            { label: t('ukVisa.fields.ukAccommodationDetail.label'), value: formData.ukAccommodationDetail, required: true, name: 'ukAccommodationDetail' },
            { label: t('ukVisa.fields.ukAccommodationAddress.label'), value: formData.ukAccommodationAddress, required: true, name: 'ukAccommodationAddress' },
            { label: t('ukVisa.fields.ukAccommodationPostal.label'), value: formData.ukAccommodationPostal },
            { label: t('ukVisa.fields.ukCheckinDate.label'), value: formatDate(formData.ukCheckinDate), required: true, name: 'ukCheckinDate' },
            { label: t('ukVisa.fields.ukCheckoutDate.label'), value: formatDate(formData.ukCheckoutDate), required: true, name: 'ukCheckoutDate' },
          ]
        : []),
    ],
  },
  // 12. 签证与旅行历史
  {
    title: t('ukVisa.sections.visaHistory'),
    fields: [
      { label: t('ukVisa.fields.hadUKVisa.label'), value: resolveOption(yesNoOptions, formData.hadUKVisa), required: true, name: 'hadUKVisa' },
      ...(formData.hadUKVisa === 'yes'
        ? [{ label: t('ukVisa.fields.lastUKVisaDate.label'), value: formatDate(formData.lastUKVisaDate), required: true, name: 'lastUKVisaDate' }]
        : []),
      { label: t('ukVisa.fields.visitedUK.label'), value: resolveOption(yesNoOptions, formData.visitedUK), required: true, name: 'visitedUK' },
      ...ukVisits.map((v, i) => [
        { label: `${t('ukVisa.subLabels.ukVisit', { index: i + 1 })} - ${t('ukVisa.fields.ukVisit.date.label')}`, value: v.date, required: true, name: `visit_${i}_date` },
        { label: `${t('ukVisa.subLabels.ukVisit', { index: i + 1 })} - ${t('ukVisa.fields.ukVisit.duration.label')}`, value: v.duration, required: true, name: `visit_${i}_duration` },
        { label: `${t('ukVisa.subLabels.ukVisit', { index: i + 1 })} - ${t('ukVisa.fields.ukVisit.purpose.label')}`, value: v.purpose, required: true, name: `visit_${i}_purpose` },
      ]).flat(),
      { label: t('ukVisa.fields.beenRefused.label'), value: resolveOption(yesNoOptions, formData.beenRefused), required: true, name: 'beenRefused' },
      ...refusals.map((r, i) => [
        { label: `${t('ukVisa.subLabels.refusal', { index: i + 1 })} - ${t('ukVisa.fields.refusal.date.label')}`, value: r.date, required: true, name: `refusal_${i}_date` },
        { label: `${t('ukVisa.subLabels.refusal', { index: i + 1 })} - ${t('ukVisa.fields.refusal.country.label')}`, value: r.country, required: true, name: `refusal_${i}_country` },
        { label: `${t('ukVisa.subLabels.refusal', { index: i + 1 })} - ${t('ukVisa.fields.refusal.reason.label')}`, value: r.reason, required: true, name: `refusal_${i}_reason` },
        { label: `${t('ukVisa.subLabels.refusal', { index: i + 1 })} - ${t('ukVisa.fields.refusal.refNumber.label')}`, value: r.refNumber },
      ]).flat(),
      { label: t('ukVisa.fields.appliedUKStay.label'), value: resolveOption(yesNoOptions, formData.appliedUKStay), required: true, name: 'appliedUKStay' },
      ...(formData.appliedUKStay === 'yes'
        ? [
            { label: t('ukVisa.fields.applyDetail_date.label'), value: formData.applyDetail_date, required: true, name: 'applyDetail_date' },
            { label: t('ukVisa.fields.applyDetail_reason.label'), value: formData.applyDetail_reason, required: true, name: 'applyDetail_reason' },
            { label: t('ukVisa.fields.applyDetail_approved.label'), value: resolveOption(yesNoOptions, formData.applyDetail_approved), required: true, name: 'applyDetail_approved' },
          ]
        : []),
      { label: t('ukVisa.fields.visitedOtherCountries.label'), value: resolveOption(yesNoOptions, formData.visitedOtherCountries), required: true, name: 'visitedOtherCountries' },
      ...otherCountries.map((c, i) => [
        { label: `${t('ukVisa.subLabels.otherCountry', { index: i + 1 })} - ${t('ukVisa.fields.otherCountry.name.label')}`, value: resolveOption(otherCountryOptions, c.name), required: true, name: `oc_${i}_name` },
        { label: `${t('ukVisa.subLabels.otherCountry', { index: i + 1 })} - ${t('ukVisa.fields.otherCountry.date.label')}`, value: c.date, required: true, name: `oc_${i}_date` },
        { label: `${t('ukVisa.subLabels.otherCountry', { index: i + 1 })} - ${t('ukVisa.fields.otherCountry.duration.label')}`, value: c.duration, required: true, name: `oc_${i}_duration` },
        { label: `${t('ukVisa.subLabels.otherCountry', { index: i + 1 })} - ${t('ukVisa.fields.otherCountry.purpose.label')}`, value: c.purpose, required: true, name: `oc_${i}_purpose` },
      ]).flat(),
    ],
  },
  // 13. 安全与背景
  {
    title: t('ukVisa.sections.securityBackground'),
    fields: [
      { label: t('ukVisa.fields.hasUKInsurance.label'), value: resolveOption(yesNoOptions, formData.hasUKInsurance), required: true, name: 'hasUKInsurance' },
      ...(formData.hasUKInsurance === 'yes'
        ? [
            { label: t('ukVisa.fields.insuranceNumber.label'), value: formData.insuranceNumber, required: true, name: 'insuranceNumber' },
            { label: t('ukVisa.fields.insuranceReason.label'), value: formData.insuranceReason, required: true, name: 'insuranceReason' },
          ]
        : []),
      { label: t('ukVisa.fields.hasCriminalRecord.label'), value: resolveOption(yesNoOptions, formData.hasCriminalRecord), required: true, name: 'hasCriminalRecord' },
      { label: t('ukVisa.fields.hasTerrorism.label'), value: resolveOption(yesNoOptions, formData.hasTerrorism), required: true, name: 'hasTerrorism' },
      { label: t('ukVisa.fields.hasBeenProsecuted.label'), value: resolveOption(yesNoOptions, formData.hasBeenProsecuted), required: true, name: 'hasBeenProsecuted' },
      { label: t('ukVisa.fields.hasGenocide.label'), value: resolveOption(yesNoOptions, formData.hasGenocide), required: true, name: 'hasGenocide' },
      { label: t('ukVisa.fields.hasArmedConflict.label'), value: resolveOption(yesNoOptions, formData.hasArmedConflict), required: true, name: 'hasArmedConflict' },
      { label: t('ukVisa.fields.hasSpecialIndustry.label'), value: resolveOption(yesNoOptions, formData.hasSpecialIndustry), required: true, name: 'hasSpecialIndustry' },
      ...(formData.hasSpecialIndustry === 'yes'
        ? [
            { label: t('ukVisa.fields.specialIndustries.label'), value: resolveOption(specialIndustriesOptions, formData.specialIndustries), required: true, name: 'specialIndustries' },
            { label: t('ukVisa.fields.specialIndustryDetail.label'), value: formData.specialIndustryDetail, required: true, name: 'specialIndustryDetail' },
          ]
        : []),
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
  // 第1组：基本信息
  lastName: '',
  firstName: '',
  formerName: '',
  gender: '',
  dateOfBirth: '',
  phone: '',
  email: '',

  // 第2组：护照与证件
  passportNumber: '',
  passportIssueDate: '',
  passportExpiryDate: '',
  issuingAuthority: '',
  nationality: '',
  hasOtherPassport: '',
  otherPassportDetail: '',
  isFirstPassport: '',
  idCardNumber: '',
  idCardAuthority: '',
  idCardExpiry: '',

  // 第3组：居住地址
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
  spouseAddress: '',

  // 第5组：父母信息
  father_name: '',
  father_nationality: '',
  father_changed_nationality: '',
  father_other_nationality: '',
  father_dob: '',
  father_going_to_uk: '',
  father_address: '',
  mother_name: '',
  mother_nationality: '',
  mother_changed_nationality: '',
  mother_other_nationality: '',
  mother_dob: '',
  mother_going_to_uk: '',
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
  monthlySalary: '',
  otherIncome: '',
  unemployedReason: '',

  // 第10组：财务信息
  estimatedUKSpend: '',
  monthlyExpense: '',
  hasSponsor: '',
  sponsorName: '',
  sponsorRelation: '',
  sponsorAmount: '',

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
      (savedData as Record<string, string>)?.[key] ?? defaultVal,
    ]),
  ) as Record<string, string>,
)

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
  if (!confirm(t('ukVisa.clearConfirm'))) return
  for (const key of Object.keys(formData)) {
    formData[key] = ''
  }
  companions.splice(0)
  children.splice(0)
  ukVisits.splice(0)
  refusals.splice(0)
  otherCountries.splice(0)
  localStorage.removeItem(STORAGE_KEY)
}

// ---- 选项数组 ----

const nationalityOptions: SelectOption[] = [
  { value: 'CN', labelKey: 'ukVisa.options.nationality.CN' },
  { value: 'US', labelKey: 'ukVisa.options.nationality.US' },
  { value: 'GB', labelKey: 'ukVisa.options.nationality.GB' },
  { value: 'OTHER', labelKey: 'ukVisa.options.nationality.OTHER' },
]

const genderOptions: RadioOption[] = [
  { value: 'male', labelKey: 'ukVisa.options.gender.male' },
  { value: 'female', labelKey: 'ukVisa.options.gender.female' },
  { value: 'other', labelKey: 'ukVisa.options.gender.other' },
]

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

// ---- 校验 & 聚焦第一个缺失字段 ----

const formActionsRef = ref<InstanceType<typeof FormActions> | null>(null)

function handleExportClick() {
  const missingFields: { name: string; label: string; section: string }[] = []

  for (const section of previewSections.value) {
    for (const field of section.fields) {
      if (field.required && (!field.value || !field.value.trim())) {
        const name = (field as any).name
        if (name) {
          missingFields.push({ name, label: field.label, section: section.title })
        } else {
          missingFields.push({ name: '', label: field.label, section: section.title })
        }
      }
    }
  }

  if (missingFields.length > 0) {
    const firstMissing = missingFields[0]
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
    const accordionValue = sectionMap[firstMissing.section]
    if (accordionValue) {
      const accordionItem = document.querySelector(`[data-accordion-value="${accordionValue}"]`)
      const trigger = accordionItem?.querySelector('h3 > button') as HTMLElement
      if (trigger && trigger.getAttribute('aria-expanded') === 'false') {
        trigger.click()
      }
    }
    // 聚焦到第一个缺失字段（等待 accordion 动画完成）
    nextTick(() => {
      setTimeout(() => {
        const el = document.querySelector(`[name="${firstMissing.name}"]`) as HTMLElement
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          el.focus()
          el.classList.add('field-error-flash')
          setTimeout(() => el.classList.remove('field-error-flash'), 2000)
        }
      }, 300)
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
      />

      <!-- 表单容器 -->
      <div class="glass-card">
        <Accordion type="multiple" class="w-full" :default-value="['personal-info']">

          <!-- 1. 基本信息 -->
          <AccordionItem value="personal-info" data-accordion-value="personal-info">
            <AccordionTrigger>{{ t('ukVisa.sections.personalInfo') }}</AccordionTrigger>
            <AccordionContent>
              <div class="fields-grid">
                <TextField name="lastName" label-key="ukVisa.fields.lastName.label" placeholder-key="ukVisa.fields.lastName.placeholder" v-model="formData.lastName" required />
                <TextField name="firstName" label-key="ukVisa.fields.firstName.label" placeholder-key="ukVisa.fields.firstName.placeholder" v-model="formData.firstName" required />
                <TextField name="formerName" label-key="ukVisa.fields.formerName.label" placeholder-key="ukVisa.fields.formerName.placeholder" v-model="formData.formerName" />
                <RadioField name="gender" label-key="ukVisa.fields.gender.label" :options="genderOptions" v-model="formData.gender" required />
                <DateField name="dateOfBirth" label-key="ukVisa.fields.dateOfBirth.label" v-model="formData.dateOfBirth" required />
                <TextField name="phone" label-key="ukVisa.fields.phone.label" placeholder-key="ukVisa.fields.phone.placeholder" v-model="formData.phone" required />
                <TextField name="email" label-key="ukVisa.fields.email.label" placeholder-key="ukVisa.fields.email.placeholder" v-model="formData.email" required />
              </div>
            </AccordionContent>
          </AccordionItem>

          <!-- 2. 护照与证件 -->
          <AccordionItem value="passport-info" data-accordion-value="passport-info">
            <AccordionTrigger>{{ t('ukVisa.sections.passportInfo') }}</AccordionTrigger>
            <AccordionContent>
              <h4 class="sub-label">{{ t('ukVisa.sections.passportInfo') }}</h4>
              <div class="fields-grid">
                <TextField name="passportNumber" label-key="ukVisa.fields.passportNumber.label" placeholder-key="ukVisa.fields.passportNumber.placeholder" v-model="formData.passportNumber" required />
                <DateField name="passportIssueDate" label-key="ukVisa.fields.passportIssueDate.label" v-model="formData.passportIssueDate" required />
                <DateField name="passportExpiryDate" label-key="ukVisa.fields.passportExpiryDate.label" v-model="formData.passportExpiryDate" required />
                <TextField name="issuingAuthority" label-key="ukVisa.fields.issuingAuthority.label" placeholder-key="ukVisa.fields.issuingAuthority.placeholder" v-model="formData.issuingAuthority" required />
                <SelectField name="nationality" label-key="ukVisa.fields.nationality.label" :options="nationalityOptions" v-model="formData.nationality" required />
                <RadioField name="hasOtherPassport" label-key="ukVisa.fields.hasOtherPassport.label" :options="yesNoOptions" v-model="formData.hasOtherPassport" required />
                <TextField v-if="formData.hasOtherPassport === 'yes'" name="otherPassportDetail" label-key="ukVisa.fields.otherPassportDetail.label" placeholder-key="ukVisa.fields.otherPassportDetail.placeholder" v-model="formData.otherPassportDetail" required />
                <RadioField name="isFirstPassport" label-key="ukVisa.fields.isFirstPassport.label" :options="yesNoOptions" v-model="formData.isFirstPassport" required />
              </div>
              <h4 class="sub-label">{{ t('ukVisa.fields.idCardNumber.label') }}</h4>
              <div class="fields-grid">
                <TextField name="idCardNumber" label-key="ukVisa.fields.idCardNumber.label" placeholder-key="ukVisa.fields.idCardNumber.placeholder" v-model="formData.idCardNumber" required />
                <TextField name="idCardAuthority" label-key="ukVisa.fields.idCardAuthority.label" placeholder-key="ukVisa.fields.idCardAuthority.placeholder" v-model="formData.idCardAuthority" required />
                <DateField name="idCardExpiry" label-key="ukVisa.fields.idCardExpiry.label" v-model="formData.idCardExpiry" required />
              </div>
            </AccordionContent>
          </AccordionItem>

          <!-- 3. 居住地址 -->
          <AccordionItem value="address-info" data-accordion-value="address-info">
            <AccordionTrigger>{{ t('ukVisa.sections.addressInfo') }}</AccordionTrigger>
            <AccordionContent>
              <div class="fields-grid">
                <TextField name="currentAddress" label-key="ukVisa.fields.currentAddress.label" placeholder-key="ukVisa.fields.currentAddress.placeholder" v-model="formData.currentAddress" required />
                <TextField name="postalCode" label-key="ukVisa.fields.postalCode.label" placeholder-key="ukVisa.fields.postalCode.placeholder" v-model="formData.postalCode" />
                <SelectField name="housingStatus" label-key="ukVisa.fields.housingStatus.label" :options="housingStatusOptions" v-model="formData.housingStatus" required />
                <DateField name="residenceStartDate" label-key="ukVisa.fields.residenceStartDate.label" v-model="formData.residenceStartDate" required />
                <TextField v-if="formData.housingStatus === 'tenant'" name="houseOwner" label-key="ukVisa.fields.houseOwner.label" placeholder-key="ukVisa.fields.houseOwner.placeholder" v-model="formData.houseOwner" required />
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
              <div v-if="formData.maritalStatus === 'married'">
                <div class="fields-grid">
                  <TextField name="spouseName" label-key="ukVisa.fields.spouseName.label" placeholder-key="ukVisa.fields.spouseName.placeholder" v-model="formData.spouseName" required />
                  <DateField name="spouseDob" label-key="ukVisa.fields.spouseDob.label" v-model="formData.spouseDob" required />
                  <SelectField name="spouseNationality" label-key="ukVisa.fields.spouseNationality.label" :options="nationalityOptions" v-model="formData.spouseNationality" required />
                  <RadioField name="spouseChangedNationality" label-key="ukVisa.fields.spouseChangedNationality.label" :options="yesNoOptions" v-model="formData.spouseChangedNationality" required />
                  <TextField v-if="formData.spouseChangedNationality === 'yes'" name="spouseOtherNationality" label-key="ukVisa.fields.spouseOtherNationality.label" placeholder-key="ukVisa.fields.spouseOtherNationality.placeholder" v-model="formData.spouseOtherNationality" required />
                  <TextField name="spouseBirthCity" label-key="ukVisa.fields.spouseBirthCity.label" placeholder-key="ukVisa.fields.spouseBirthCity.placeholder" v-model="formData.spouseBirthCity" required />
                  <TextField name="spouseAddress" label-key="ukVisa.fields.spouseAddress.label" placeholder-key="ukVisa.fields.spouseAddress.placeholder" v-model="formData.spouseAddress" required />
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
                <TextField name="father_name" label-key="ukVisa.fields.father_name.label" placeholder-key="ukVisa.fields.father_name.placeholder" v-model="formData.father_name" required />
                <SelectField name="father_nationality" label-key="ukVisa.fields.father_nationality.label" :options="nationalityOptions" v-model="formData.father_nationality" required />
                <RadioField name="father_changed_nationality" label-key="ukVisa.fields.father_changed_nationality.label" :options="yesNoOptions" v-model="formData.father_changed_nationality" />
                <TextField v-if="formData.father_changed_nationality === 'yes'" name="father_other_nationality" label-key="ukVisa.fields.father_other_nationality.label" placeholder-key="ukVisa.fields.father_other_nationality.placeholder" v-model="formData.father_other_nationality" required />
                <DateField name="father_dob" label-key="ukVisa.fields.father_dob.label" v-model="formData.father_dob" required />
                <RadioField name="father_going_to_uk" label-key="ukVisa.fields.father_going_to_uk.label" :options="yesNoOptions" v-model="formData.father_going_to_uk" required />
                <TextField name="father_address" label-key="ukVisa.fields.father_address.label" placeholder-key="ukVisa.fields.father_address.placeholder" v-model="formData.father_address" required />
              </div>
              <h4 class="sub-label">{{ t('ukVisa.subLabels.mother') }}</h4>
              <div class="fields-grid">
                <TextField name="mother_name" label-key="ukVisa.fields.mother_name.label" placeholder-key="ukVisa.fields.mother_name.placeholder" v-model="formData.mother_name" required />
                <SelectField name="mother_nationality" label-key="ukVisa.fields.mother_nationality.label" :options="nationalityOptions" v-model="formData.mother_nationality" required />
                <RadioField name="mother_changed_nationality" label-key="ukVisa.fields.mother_changed_nationality.label" :options="yesNoOptions" v-model="formData.mother_changed_nationality" />
                <TextField v-if="formData.mother_changed_nationality === 'yes'" name="mother_other_nationality" label-key="ukVisa.fields.mother_other_nationality.label" placeholder-key="ukVisa.fields.mother_other_nationality.placeholder" v-model="formData.mother_other_nationality" required />
                <DateField name="mother_dob" label-key="ukVisa.fields.mother_dob.label" v-model="formData.mother_dob" required />
                <RadioField name="mother_going_to_uk" label-key="ukVisa.fields.mother_going_to_uk.label" :options="yesNoOptions" v-model="formData.mother_going_to_uk" required />
                <TextField name="mother_address" label-key="ukVisa.fields.mother_address.label" placeholder-key="ukVisa.fields.mother_address.placeholder" v-model="formData.mother_address" required />
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
              <div v-if="formData.hasChildren === 'yes'">
                <div v-for="(child, index) in children" :key="'child-' + index" class="repeatable-group">
                  <div class="repeatable-header">
                    <h4 class="sub-label">{{ t('ukVisa.subLabels.child') }} {{ index + 1 }}</h4>
                    <button type="button" class="remove-btn" @click="removeChild(index)">
                      <Trash2 :size="14" /> {{ t('ukVisa.removeRow') }}
                    </button>
                  </div>
                  <div class="fields-grid">
                    <TextField :name="'child_' + index + '_name'" label-key="ukVisa.fields.child.name.label" placeholder-key="ukVisa.fields.child.name.placeholder" v-model="child.name" required />
                    <SelectField :name="'child_' + index + '_nationality'" label-key="ukVisa.fields.child.nationality.label" :options="nationalityOptions" v-model="child.nationality" required />
                    <RadioField :name="'child_' + index + '_changed'" label-key="ukVisa.fields.child.changedNationality.label" :options="yesNoOptions" v-model="child.changedNationality" required />
                    <TextField v-if="child.changedNationality === 'yes'" :name="'child_' + index + '_otherNat'" label-key="ukVisa.fields.child.otherNationality.label" placeholder-key="ukVisa.fields.child.otherNationality.placeholder" v-model="child.otherNationality" required />
                    <SelectField :name="'child_' + index + '_relation'" label-key="ukVisa.fields.child.relation.label" :options="childRelationOptions" v-model="child.relation" required />
                    <DateField :name="'child_' + index + '_dob'" label-key="ukVisa.fields.child.dob.label" v-model="child.dob" required />
                    <RadioField :name="'child_' + index + '_going'" label-key="ukVisa.fields.child.goingToUK.label" :options="yesNoOptions" v-model="child.goingToUK" required />
                    <TextField :name="'child_' + index + '_addr'" label-key="ukVisa.fields.child.address.label" placeholder-key="ukVisa.fields.child.address.placeholder" v-model="child.address" />
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
                <SelectField name="purposeOfVisit" label-key="ukVisa.fields.purposeOfVisit.label" :options="purposeOptions" v-model="formData.purposeOfVisit" required />
                <DateField name="intendedArrivalDate" label-key="ukVisa.fields.intendedArrivalDate.label" v-model="formData.intendedArrivalDate" required />
                <DateField name="intendedDepartureDate" label-key="ukVisa.fields.intendedDepartureDate.label" v-model="formData.intendedDepartureDate" required />
                <TextField name="travelPlanDesc" label-key="ukVisa.fields.travelPlanDesc.label" placeholder-key="ukVisa.fields.travelPlanDesc.placeholder" v-model="formData.travelPlanDesc" />
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
              <div v-if="formData.hasCompanion === 'yes'">
                <div v-for="(comp, index) in companions" :key="'comp-' + index" class="repeatable-group">
                  <div class="repeatable-header">
                    <h4 class="sub-label">{{ t('ukVisa.subLabels.companion') }} {{ index + 1 }}</h4>
                    <button type="button" class="remove-btn" @click="removeCompanion(index)">
                      <Trash2 :size="14" /> {{ t('ukVisa.removeRow') }}
                    </button>
                  </div>
                  <div class="fields-grid">
                    <TextField :name="'comp_' + index + '_name'" label-key="ukVisa.fields.companion.name.label" placeholder-key="ukVisa.fields.companion.name.placeholder" v-model="comp.name" required />
                    <DateField :name="'comp_' + index + '_dob'" label-key="ukVisa.fields.companion.dob.label" v-model="comp.dob" required />
                    <SelectField :name="'comp_' + index + '_nationality'" label-key="ukVisa.fields.companion.nationality.label" :options="nationalityOptions" v-model="comp.nationality" required />
                    <TextField :name="'comp_' + index + '_passport'" label-key="ukVisa.fields.companion.passport.label" placeholder-key="ukVisa.fields.companion.passport.placeholder" v-model="comp.passport" required />
                    <SelectField :name="'comp_' + index + '_relation'" label-key="ukVisa.fields.companion.relation.label" :options="companionRelationOptions" v-model="comp.relation" required />
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
              <div v-if="formData.employmentStatus === 'working' || formData.employmentStatus === 'studying'">
                <div class="fields-grid">
                  <DateField name="jobStartDate" label-key="ukVisa.fields.jobStartDate.label" v-model="formData.jobStartDate" required />
                  <TextField name="companyName" label-key="ukVisa.fields.companyName.label" placeholder-key="ukVisa.fields.companyName.placeholder" v-model="formData.companyName" required />
                  <TextField name="companyAddress" label-key="ukVisa.fields.companyAddress.label" placeholder-key="ukVisa.fields.companyAddress.placeholder" v-model="formData.companyAddress" required />
                  <TextField name="companyPostalCode" label-key="ukVisa.fields.companyPostalCode.label" placeholder-key="ukVisa.fields.companyPostalCode.placeholder" v-model="formData.companyPostalCode" />
                  <TextField name="companyPhone" label-key="ukVisa.fields.companyPhone.label" placeholder-key="ukVisa.fields.companyPhone.placeholder" v-model="formData.companyPhone" />
                  <TextField name="jobTitle" label-key="ukVisa.fields.jobTitle.label" placeholder-key="ukVisa.fields.jobTitle.placeholder" v-model="formData.jobTitle" required />
                  <TextField name="jobDuties" label-key="ukVisa.fields.jobDuties.label" placeholder-key="ukVisa.fields.jobDuties.placeholder" v-model="formData.jobDuties" />
                  <TextField name="monthlySalary" label-key="ukVisa.fields.monthlySalary.label" placeholder-key="ukVisa.fields.monthlySalary.placeholder" v-model="formData.monthlySalary" required />
                </div>
              </div>
              <div v-if="formData.employmentStatus === 'unemployed'">
                <div class="fields-grid">
                  <TextField name="unemployedReason" label-key="ukVisa.fields.unemployedReason.label" placeholder-key="ukVisa.fields.unemployedReason.placeholder" v-model="formData.unemployedReason" required />
                </div>
              </div>
              <div class="fields-grid">
                <TextField name="otherIncome" label-key="ukVisa.fields.otherIncome.label" placeholder-key="ukVisa.fields.otherIncome.placeholder" v-model="formData.otherIncome" required />
              </div>
            </AccordionContent>
          </AccordionItem>

          <!-- 10. 财务信息 -->
          <AccordionItem value="financial-info" data-accordion-value="financial-info">
            <AccordionTrigger>{{ t('ukVisa.sections.financialInfo') }}</AccordionTrigger>
            <AccordionContent>
              <div class="fields-grid">
                <TextField name="estimatedUKSpend" label-key="ukVisa.fields.estimatedUKSpend.label" placeholder-key="ukVisa.fields.estimatedUKSpend.placeholder" v-model="formData.estimatedUKSpend" required />
                <TextField name="monthlyExpense" label-key="ukVisa.fields.monthlyExpense.label" placeholder-key="ukVisa.fields.monthlyExpense.placeholder" v-model="formData.monthlyExpense" required />
                <RadioField name="hasSponsor" label-key="ukVisa.fields.hasSponsor.label" :options="yesNoOptions" v-model="formData.hasSponsor" />
              </div>
              <div v-if="formData.hasSponsor === 'yes'">
                <div class="fields-grid">
                  <TextField name="sponsorName" label-key="ukVisa.fields.sponsorName.label" placeholder-key="ukVisa.fields.sponsorName.placeholder" v-model="formData.sponsorName" required />
                  <TextField name="sponsorRelation" label-key="ukVisa.fields.sponsorRelation.label" placeholder-key="ukVisa.fields.sponsorRelation.placeholder" v-model="formData.sponsorRelation" required />
                  <TextField name="sponsorAmount" label-key="ukVisa.fields.sponsorAmount.label" placeholder-key="ukVisa.fields.sponsorAmount.placeholder" v-model="formData.sponsorAmount" required />
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
              <div v-if="formData.hasUKContact === 'yes'">
                <div class="fields-grid">
                  <TextField name="ukContactName" label-key="ukVisa.fields.ukContactName.label" placeholder-key="ukVisa.fields.ukContactName.placeholder" v-model="formData.ukContactName" required />
                  <TextField name="ukContactStatus" label-key="ukVisa.fields.ukContactStatus.label" placeholder-key="ukVisa.fields.ukContactStatus.placeholder" v-model="formData.ukContactStatus" required />
                  <TextField name="ukContactDocNumber" label-key="ukVisa.fields.ukContactDocNumber.label" placeholder-key="ukVisa.fields.ukContactDocNumber.placeholder" v-model="formData.ukContactDocNumber" required />
                  <TextField name="ukContactRelation" label-key="ukVisa.fields.ukContactRelation.label" placeholder-key="ukVisa.fields.ukContactRelation.placeholder" v-model="formData.ukContactRelation" required />
                  <TextField name="ukContactPhone" label-key="ukVisa.fields.ukContactPhone.label" placeholder-key="ukVisa.fields.ukContactPhone.placeholder" v-model="formData.ukContactPhone" required />
                  <TextField name="ukContactPostal" label-key="ukVisa.fields.ukContactPostal.label" placeholder-key="ukVisa.fields.ukContactPostal.placeholder" v-model="formData.ukContactPostal" />
                </div>
              </div>
              <div class="fields-grid">
                <RadioField name="hasUKAccommodation" label-key="ukVisa.fields.hasUKAccommodation.label" :options="yesNoOptions" v-model="formData.hasUKAccommodation" required />
              </div>
              <div v-if="formData.hasUKAccommodation === 'yes'">
                <div class="fields-grid">
                  <TextField name="ukAccommodationDetail" label-key="ukVisa.fields.ukAccommodationDetail.label" placeholder-key="ukVisa.fields.ukAccommodationDetail.placeholder" v-model="formData.ukAccommodationDetail" required />
                  <TextField name="ukAccommodationAddress" label-key="ukVisa.fields.ukAccommodationAddress.label" placeholder-key="ukVisa.fields.ukAccommodationAddress.placeholder" v-model="formData.ukAccommodationAddress" required />
                  <TextField name="ukAccommodationPostal" label-key="ukVisa.fields.ukAccommodationPostal.label" placeholder-key="ukVisa.fields.ukAccommodationPostal.placeholder" v-model="formData.ukAccommodationPostal" />
                  <DateField name="ukCheckinDate" label-key="ukVisa.fields.ukCheckinDate.label" v-model="formData.ukCheckinDate" required />
                  <DateField name="ukCheckoutDate" label-key="ukVisa.fields.ukCheckoutDate.label" v-model="formData.ukCheckoutDate" required />
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
              <div v-if="formData.hadUKVisa === 'yes'">
                <div class="fields-grid">
                  <DateField name="lastUKVisaDate" label-key="ukVisa.fields.lastUKVisaDate.label" v-model="formData.lastUKVisaDate" required />
                </div>
              </div>

              <!-- 去过英国（动态添加行） -->
              <div class="fields-grid">
                <RadioField name="visitedUK" label-key="ukVisa.fields.visitedUK.label" :options="yesNoOptions" v-model="formData.visitedUK" required />
              </div>
              <div v-if="formData.visitedUK === 'yes'">
                <div v-for="(visit, index) in ukVisits" :key="'visit-' + index" class="repeatable-group">
                  <div class="repeatable-header">
                    <h4 class="sub-label">{{ t('ukVisa.subLabels.ukVisit', { index: index + 1 }) }}</h4>
                    <button type="button" class="remove-btn" @click="removeUkVisit(index)">
                      <Trash2 :size="14" /> {{ t('ukVisa.removeRow') }}
                    </button>
                  </div>
                  <div class="fields-grid">
                    <DateField :name="'visit_' + index + '_date'" label-key="ukVisa.fields.ukVisit.date.label" v-model="visit.date" required />
                    <TextField :name="'visit_' + index + '_duration'" label-key="ukVisa.fields.ukVisit.duration.label" placeholder-key="ukVisa.fields.ukVisit.duration.placeholder" v-model="visit.duration" required />
                    <TextField :name="'visit_' + index + '_purpose'" label-key="ukVisa.fields.ukVisit.purpose.label" placeholder-key="ukVisa.fields.ukVisit.purpose.placeholder" v-model="visit.purpose" required />
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
              <div v-if="formData.beenRefused === 'yes'">
                <div v-for="(ref, index) in refusals" :key="'refusal-' + index" class="repeatable-group">
                  <div class="repeatable-header">
                    <h4 class="sub-label">{{ t('ukVisa.subLabels.refusal', { index: index + 1 }) }}</h4>
                    <button type="button" class="remove-btn" @click="removeRefusal(index)">
                      <Trash2 :size="14" /> {{ t('ukVisa.removeRow') }}
                    </button>
                  </div>
                  <div class="fields-grid">
                    <DateField :name="'refusal_' + index + '_date'" label-key="ukVisa.fields.refusal.date.label" v-model="ref.date" required />
                    <TextField :name="'refusal_' + index + '_country'" label-key="ukVisa.fields.refusal.country.label" placeholder-key="ukVisa.fields.refusal.country.placeholder" v-model="ref.country" required />
                    <TextField :name="'refusal_' + index + '_reason'" label-key="ukVisa.fields.refusal.reason.label" placeholder-key="ukVisa.fields.refusal.reason.placeholder" v-model="ref.reason" required />
                    <TextField :name="'refusal_' + index + '_ref'" label-key="ukVisa.fields.refusal.refNumber.label" placeholder-key="ukVisa.fields.refusal.refNumber.placeholder" v-model="ref.refNumber" />
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
              <div v-if="formData.appliedUKStay === 'yes'">
                <div class="fields-grid">
                  <DateField name="applyDetail_date" label-key="ukVisa.fields.applyDetail_date.label" v-model="formData.applyDetail_date" required />
                  <TextField name="applyDetail_reason" label-key="ukVisa.fields.applyDetail_reason.label" placeholder-key="ukVisa.fields.applyDetail_reason.placeholder" v-model="formData.applyDetail_reason" required />
                  <RadioField name="applyDetail_approved" label-key="ukVisa.fields.applyDetail_approved.label" :options="yesNoOptions" v-model="formData.applyDetail_approved" required />
                </div>
              </div>

              <!-- 其他国家旅行（动态添加行） -->
              <div class="fields-grid">
                <RadioField name="visitedOtherCountries" label-key="ukVisa.fields.visitedOtherCountries.label" :options="yesNoOptions" v-model="formData.visitedOtherCountries" required />
              </div>
              <div v-if="formData.visitedOtherCountries === 'yes'">
                <div v-for="(oc, index) in otherCountries" :key="'oc-' + index" class="repeatable-group">
                  <div class="repeatable-header">
                    <h4 class="sub-label">{{ t('ukVisa.subLabels.otherCountry', { index: index + 1 }) }}</h4>
                    <button type="button" class="remove-btn" @click="removeOtherCountry(index)">
                      <Trash2 :size="14" /> {{ t('ukVisa.removeRow') }}
                    </button>
                  </div>
                  <div class="fields-grid">
                    <SelectField :name="'oc_' + index + '_name'" label-key="ukVisa.fields.otherCountry.name.label" :options="otherCountryOptions" v-model="oc.name" required />
                    <DateField :name="'oc_' + index + '_date'" label-key="ukVisa.fields.otherCountry.date.label" v-model="oc.date" required />
                    <TextField :name="'oc_' + index + '_duration'" label-key="ukVisa.fields.otherCountry.duration.label" placeholder-key="ukVisa.fields.otherCountry.duration.placeholder" v-model="oc.duration" required />
                    <TextField :name="'oc_' + index + '_purpose'" label-key="ukVisa.fields.otherCountry.purpose.label" placeholder-key="ukVisa.fields.otherCountry.purpose.placeholder" v-model="oc.purpose" required />
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
                <TextField v-if="formData.hasUKInsurance === 'yes'" name="insuranceNumber" label-key="ukVisa.fields.insuranceNumber.label" placeholder-key="ukVisa.fields.insuranceNumber.placeholder" v-model="formData.insuranceNumber" required />
                <TextField v-if="formData.hasUKInsurance === 'yes'" name="insuranceReason" label-key="ukVisa.fields.insuranceReason.label" placeholder-key="ukVisa.fields.insuranceReason.placeholder" v-model="formData.insuranceReason" required />
                <RadioField name="hasCriminalRecord" label-key="ukVisa.fields.hasCriminalRecord.label" :options="yesNoOptions" v-model="formData.hasCriminalRecord" required />
                <RadioField name="hasTerrorism" label-key="ukVisa.fields.hasTerrorism.label" :options="yesNoOptions" v-model="formData.hasTerrorism" required />
                <RadioField name="hasBeenProsecuted" label-key="ukVisa.fields.hasBeenProsecuted.label" :options="yesNoOptions" v-model="formData.hasBeenProsecuted" required />
                <RadioField name="hasGenocide" label-key="ukVisa.fields.hasGenocide.label" :options="yesNoOptions" v-model="formData.hasGenocide" required />
                <RadioField name="hasArmedConflict" label-key="ukVisa.fields.hasArmedConflict.label" :options="yesNoOptions" v-model="formData.hasArmedConflict" required />
                <RadioField name="hasSpecialIndustry" label-key="ukVisa.fields.hasSpecialIndustry.label" :options="yesNoOptions" v-model="formData.hasSpecialIndustry" required />
                <SelectField v-if="formData.hasSpecialIndustry === 'yes'" name="specialIndustries" label-key="ukVisa.fields.specialIndustries.label" :options="specialIndustriesOptions" v-model="formData.specialIndustries" required />
                <TextField v-if="formData.hasSpecialIndustry === 'yes'" name="specialIndustryDetail" label-key="ukVisa.fields.specialIndustryDetail.label" placeholder-key="ukVisa.fields.specialIndustryDetail.placeholder" v-model="formData.specialIndustryDetail" required />
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
  overflow: hidden;
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
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

:deep(.field-span-full) {
  grid-column: span 6;
}

:deep(.field-span-half) {
  grid-column: span 3;
}

:deep(.field-span-third) {
  grid-column: span 2;
}

.sub-label {
  font-weight: 600;
  font-size: 0.95rem;
  color: #374151;
  margin: 1rem 0 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 2px solid #e5e7eb;
}

.repeatable-group {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
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
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.08);
  border: 1px dashed #6366f1;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.25rem;
}

.add-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  color: #4f46e5;
}

.remove-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
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

/* 平板端：third 降级为 half */
@media (max-width: 1024px) {
  :deep(.field-span-third) {
    grid-column: span 3;
  }
}

/* 手机端：全部单列 */
@media (max-width: 768px) {
  .fields-grid {
    grid-template-columns: 1fr;
  }

  :deep(.field-span-full),
  :deep(.field-span-half),
  :deep(.field-span-third) {
    grid-column: span 1;
  }
}
</style>
