<script setup lang="ts">
// USVisaForm — DS-160 非移民签证申请表向导
// 13 步向导：左侧导航（桌面）/ 顶部导航（手机） + 右侧内容区
// 每步对应一个异步加载的子组件，通过 provide/inject 共享 formData
// v2: 字段 ID 对齐 docs/us-visa-ds160-form-design-v2.md

import { reactive, ref, computed, provide, watch, onMounted, nextTick, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { Check, ChevronRight } from '@lucide/vue'
import FormActions from '@/components/FormActions.vue'
import type { PreviewField, PreviewSection } from '@/composables/usePdfExport'
import { useApplicantName } from '@/composables/useApplicantName'
// ponytail: dev-only import, Vite tree-shakes in production build
import { mockUSFormData, _arrays as mockArrays } from '@/dev/mockUSFormData'
import {
  usCountryOptions, usStatesOptions, occupationOptions,
  purposeOfTripOptions, stayPeriodOptions, periodOptions,
  maritalStatusOptions, genderOptions, docTypeOptions,
  relationshipOptions, payerRelationOptions, payerTypeOptions,
  spouseAddressOptions, immediateRelationOptions, familyStatusOptions,
  socialMediaOptions,
} from '@/config/usCountryOptions'

const { t, locale } = useI18n()

// ---- 可重复条目类型 ----

export interface Companion {
  surname: string
  given_name: string
  relationship: string
}

export interface USVisit {
  arrival_date: string
  length_of_stay: string
  stay_period: string
}

export interface OtherPhone {
  number: string
}

export interface OtherEmail {
  email: string
}

export interface SocialMediaEntry {
  platform: string
  username: string
}

export interface LostPassport {
  number: string
  country: string
  explain: string
}

export interface ImmediateRelative {
  surname: string
  given_name: string
  relationship: string
  status: string
}

export interface PreviousWorkRecord {
  employer_name: string
  address: { country: string; state: string; city: string; street_addr1: string; zip_code: string }
  phone: string
  job_title: string
  supervisor_surname: string
  supervisor_given_name: string
  date_from: string
  date_to: string
  job_description: string
}

export interface EducationRecord {
  name: string
  address: { country: string; state: string; city: string; street_addr1: string; zip_code: string }
  course: string
  date_from: string
  date_to: string
}

export interface LanguageEntry {
  name: string
}

export interface TraveledCountry {
  country: string
}

export interface OrganizationEntry {
  name: string
}

export interface MilitaryServiceRecord {
  country: string
  branch: string
  rank: string
  specialty: string
  date_from: string
  date_to: string
}

// ---- 表单数据类型（对齐 v2 字段 ID） ----

export interface USVisaFormData {
  // Step 1: Personal 1
  surname: string
  given_name: string
  native_name: string
  native_name_not_applicable: boolean
  has_other_names: string
  other_surname: string
  other_given_name: string
  has_telecode: string
  telecode_surname: string
  telecode_given_name: string
  sex: string
  marital_status: string
  marital_status_explain: string
  date_of_birth: string
  birth_city: string
  birth_state: string
  birth_country: string
  // Step 2: Personal 2
  nationality: string
  has_other_nationality: string
  other_nationality: string
  has_other_nationality_passport: string
  other_nationality_passport_no: string
  is_permanent_resident: string
  permanent_resident_country: string
  national_id_number: string
  social_security_number: string
  tax_id_number: string
  // Step 3: Travel
  purpose_of_trip: string
  visa_category: string
  arrival_date: string
  length_of_stay: string
  length_of_stay_period: string
  us_address: { state: string; city: string; street_addr1: string; zip_code: string }
  paying_person_type: string
  paying_person: { surname: string; given_name: string; tel: string; email: string; relationship: string; address_same: string; address: { country: string; state: string; city: string; street_addr1: string; zip_code: string } }
  paying_org: { name: string; tel: string; relationship: string; address: { country: string; state: string; city: string; street_addr1: string; zip_code: string } }
  // Step 4: Travel Companions
  has_travel_companions: string
  is_group_travel: string
  group_name: string
  // Step 5: Previous U.S. Travel
  has_been_in_us: string
  has_us_drivers_license: string
  drivers_license_number: string
  drivers_license_state: string
  has_us_visa: string
  last_visa_date: string
  last_visa_number: string
  applying_same_type: string
  applying_same_country: string
  has_been_ten_printed: string
  visa_lost_or_stolen: string
  visa_cancelled: string
  has_been_refused: string
  refusal_explain: string
  has_esta_refused: string
  esta_refusal_explain: string
  has_immigrant_petition: string
  immigrant_petition_explain: string
  // Step 6: Address & Phone
  home_addr: { country: string; state: string; city: string; street_addr1: string; zip_code: string }
  phone_primary: string
  phone_secondary: string
  phone_work: string
  email: string
  email_confirm: string
  has_other_phones: string
  has_other_emails: string
  mailing_different: boolean
  mailing_addr: { country: string; state: string; city: string; street_addr1: string; zip_code: string }
  has_other_social_media: string
  // Step 7: Passport
  doc_type: string
  doc_type_explain: string
  doc_number: string
  book_number: string
  doc_authority: string
  issued_location: { city: string; state: string; country: string }
  issuance_date: string
  expiration_date: string
  no_expiration: boolean
  has_lost_passport: string
  // Step 8: U.S. Contact
  us_relationship: string
  us_contact: { surname: string; given_name: string; organization: string; address: { state: string; city: string; street_addr1: string; zip_code: string }; phone: string; email: string }
  // Step 9: Family
  father: { surname: string; given_name: string; date_of_birth: string; in_us: string; status: string }
  mother: { surname: string; given_name: string; date_of_birth: string; in_us: string; status: string }
  has_immediate_relatives: string
  spouse: { surname: string; given_name: string; date_of_birth: string; nationality: string; birth_city: string; birth_country: string; address_type: string; address: { country: string; state: string; city: string; street_addr1: string; zip_code: string } }
  // Step 10: Present Work/Education
  occupation: string
  current_employer: string
  current_address: { country: string; state: string; city: string; street_addr1: string; zip_code: string; tel: string }
  start_date: string
  monthly_income: string
  job_description: string
  // Step 11: Previous Work/Education
  was_previously_employed: string
  has_education: string
  // Step 12: Additional Work/Education
  has_clan: string
  clan_name: string
  has_traveled_5yr: string
  has_organization: string
  has_military_service: string
  has_taliban: string
  taliban_explain: string
  has_special_skills: string
  special_skills_explain: string
  has_paramilitary: string
  paramilitary_explain: string
  // Step 13: Security and Background
  securityAnswers: Record<number, { answer: string; explain: string }>
}

// ---- 默认数据 ----

const emptyAddr = () => ({ country: '', state: '', city: '', street_addr1: '', zip_code: '' })
const emptyUSAddr = () => ({ state: '', city: '', street_addr1: '', zip_code: '' })

const defaultData: USVisaFormData = {
  // Step 1
  surname: '', given_name: '', native_name: '', native_name_not_applicable: false, has_other_names: '',
  other_surname: '', other_given_name: '',
  has_telecode: '', telecode_surname: '', telecode_given_name: '',
  sex: '', marital_status: '', marital_status_explain: '',
  date_of_birth: '', birth_city: '', birth_state: '', birth_country: '',
  // Step 2
  nationality: '', has_other_nationality: '', other_nationality: '',
  has_other_nationality_passport: '', other_nationality_passport_no: '',
  is_permanent_resident: '', permanent_resident_country: '',
  national_id_number: '', social_security_number: '', tax_id_number: '',
  // Step 3
  purpose_of_trip: '', visa_category: '',
  arrival_date: '', length_of_stay: '', length_of_stay_period: '',
  us_address: emptyUSAddr(),
  paying_person_type: '',
  paying_person: { surname: '', given_name: '', tel: '', email: '', relationship: '', address_same: '', address: emptyAddr() },
  paying_org: { name: '', tel: '', relationship: '', address: emptyAddr() },
  // Step 4
  has_travel_companions: '', is_group_travel: '', group_name: '',
  // Step 5
  has_been_in_us: '', has_us_drivers_license: '',
  drivers_license_number: '', drivers_license_state: '',
  has_us_visa: '', last_visa_date: '', last_visa_number: '',
  applying_same_type: '', applying_same_country: '',
  has_been_ten_printed: '', visa_lost_or_stolen: '', visa_cancelled: '',
  has_been_refused: '', refusal_explain: '',
  has_esta_refused: '', esta_refusal_explain: '',
  has_immigrant_petition: '', immigrant_petition_explain: '',
  // Step 6
  home_addr: emptyAddr(),
  phone_primary: '', phone_secondary: '', phone_work: '',
  email: '', email_confirm: '',
  has_other_phones: '', has_other_emails: '',
  mailing_different: false, mailing_addr: emptyAddr(),
  has_other_social_media: '',
  // Step 7
  doc_type: '', doc_type_explain: '', doc_number: '', book_number: '',
  doc_authority: '', issued_location: { city: '', state: '', country: '' },
  issuance_date: '', expiration_date: '', no_expiration: false,
  has_lost_passport: '',
  // Step 8
  us_relationship: '',
  us_contact: { surname: '', given_name: '', organization: '', address: emptyUSAddr(), phone: '', email: '' },
  // Step 9
  father: { surname: 'DNC', given_name: 'DNC', date_of_birth: '', in_us: '', status: '' },
  mother: { surname: 'DNC', given_name: 'DNC', date_of_birth: '', in_us: '', status: '' },
  has_immediate_relatives: '',
  spouse: { surname: '', given_name: '', date_of_birth: '', nationality: '', birth_city: '', birth_country: '', address_type: '', address: emptyAddr() },
  // Step 10
  occupation: '', current_employer: '',
  current_address: { country: '', state: '', city: '', street_addr1: '', zip_code: '', tel: '' },
  start_date: '', monthly_income: '', job_description: '',
  // Step 11
  was_previously_employed: '', has_education: '',
  // Step 12
  has_clan: '', clan_name: '', has_traveled_5yr: '',
  has_organization: '', has_military_service: '',
  has_taliban: '', taliban_explain: '',
  has_special_skills: '', special_skills_explain: '',
  has_paramilitary: '', paramilitary_explain: '',
  // Step 13
  securityAnswers: {},
}

// ---- Schema 版本 & localStorage ----

const STORAGE_KEY = 'ws-visa-us-form-data'
// ponytail: bump version to invalidate old data — field IDs changed from camelCase to snake_case; r2: mailing_different string→boolean
const SCHEMA_VERSION = 'us-visa-v2:r2'

function loadSavedData(): Partial<USVisaFormData> | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed._schemaVersion === SCHEMA_VERSION) {
        return parsed.data
      }
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch { /* ignore */ }
  return null
}

const savedData = loadSavedData()

// ---- 表单数据 ----

function buildDefaultFormData(): USVisaFormData {
  return {
    ...defaultData,
    us_address: { ...emptyUSAddr() },
    paying_person: { surname: '', given_name: '', tel: '', email: '', relationship: '', address_same: '', address: emptyAddr() },
    paying_org: { name: '', tel: '', relationship: '', address: { ...emptyAddr() } },
    home_addr: { ...emptyAddr() },
    mailing_addr: { ...emptyAddr() },
    issued_location: { city: '', state: '', country: '' },
    us_contact: { surname: '', given_name: '', organization: '', address: { ...emptyUSAddr() }, phone: '', email: '' },
    father: { surname: 'DNC', given_name: 'DNC', date_of_birth: '', in_us: '', status: '' },
    mother: { surname: 'DNC', given_name: 'DNC', date_of_birth: '', in_us: '', status: '' },
    spouse: { surname: '', given_name: '', date_of_birth: '', nationality: '', birth_city: '', birth_country: '', address_type: '', address: { ...emptyAddr() } },
    current_address: { country: '', state: '', city: '', street_addr1: '', zip_code: '', tel: '' },
    securityAnswers: {},
  }
}

const formData = reactive<USVisaFormData>({
  ...buildDefaultFormData(),
  ...savedData,
  // Restore nested objects
  us_address: { ...emptyUSAddr(), ...(savedData?.us_address ?? {}) },
  paying_person: { surname: '', given_name: '', tel: '', email: '', relationship: '', address_same: '', address: { ...emptyAddr(), ...(savedData?.paying_person?.address ?? {}) }, ...(savedData?.paying_person ?? { address: {} }) },
  paying_org: { name: '', tel: '', relationship: '', address: { ...emptyAddr(), ...(savedData?.paying_org?.address ?? {}) }, ...(savedData?.paying_org ?? { address: {} }) },
  home_addr: { ...emptyAddr(), ...(savedData?.home_addr ?? {}) },
  mailing_addr: { ...emptyAddr(), ...(savedData?.mailing_addr ?? {}) },
  issued_location: { city: '', state: '', country: '', ...(savedData?.issued_location ?? {}) },
  us_contact: { surname: '', given_name: '', organization: '', address: { ...emptyUSAddr(), ...(savedData?.us_contact?.address ?? {}) }, phone: '', email: '', ...(savedData?.us_contact ?? { address: {} }) },
  father: { surname: 'DNC', given_name: 'DNC', date_of_birth: '', in_us: '', status: '', ...(savedData?.father ?? {}) },
  mother: { surname: 'DNC', given_name: 'DNC', date_of_birth: '', in_us: '', status: '', ...(savedData?.mother ?? {}) },
  spouse: { surname: '', given_name: '', date_of_birth: '', nationality: '', birth_city: '', birth_country: '', address_type: '', address: { ...emptyAddr(), ...(savedData?.spouse?.address ?? {}) }, ...(savedData?.spouse ?? { address: {} }) },
  current_address: { country: '', state: '', city: '', street_addr1: '', zip_code: '', tel: '', ...(savedData?.current_address ?? {}) },
  securityAnswers: savedData?.securityAnswers ?? {},
})

// ---- 可重复数组（与 formData 平级） ----

const companions = reactive<Companion[]>(savedData ? [] : [])
const us_visits = reactive<USVisit[]>([])
const other_phones = reactive<OtherPhone[]>([])
const other_emails = reactive<OtherEmail[]>([])
const social_media = reactive<SocialMediaEntry[]>([])
const other_social = reactive<SocialMediaEntry[]>([])
const lost_passports = reactive<LostPassport[]>([])
const immediate_relatives = reactive<ImmediateRelative[]>([])
const previous_work = reactive<PreviousWorkRecord[]>([])
const education = reactive<EducationRecord[]>([])
const languages = reactive<LanguageEntry[]>([])
const traveled_countries = reactive<TraveledCountry[]>([])
const organizations = reactive<OrganizationEntry[]>([])
const military_service = reactive<MilitaryServiceRecord[]>([])

// Restore saved arrays
if (savedData) {
  // Arrays were stored alongside formData in v1, but in v2 they're separate
  // On first load after schema change, these will all be empty (correct behavior)
}

// ---- Provide ----

provide('usVisaFormData', formData)
provide('usVisaArrays', {
  companions, us_visits, other_phones, other_emails,
  social_media, other_social, lost_passports,
  immediate_relatives,
  previous_work, education, languages,
  traveled_countries, organizations, military_service,
})

// 数组查找表：供 validateStep 按 key 取数组（数组是独立 reactive 变量，不在 formData 中）
const arrayLookup: Record<string, unknown[]> = {
  companions, us_visits, other_phones, other_emails,
  social_media, other_social, lost_passports,
  immediate_relatives,
  previous_work, education, languages,
  traveled_countries, organizations, military_service,
}

// 字段名 → formData 路径映射（组件用扁平 name，formData 用嵌套对象）
const fieldPathMap: Record<string, string> = {
  // travel
  us_address_state: 'us_address.state', us_address_city: 'us_address.city',
  us_address_street_addr1: 'us_address.street_addr1', us_address_zip_code: 'us_address.zip_code',
  paying_person_surname: 'paying_person.surname', paying_person_given_name: 'paying_person.given_name',
  paying_person_tel: 'paying_person.tel', paying_person_relationship: 'paying_person.relationship',
  paying_person_address_same: 'paying_person.address_same',
  paying_person_address_country: 'paying_person.address.country',
  paying_person_address_state: 'paying_person.address.state',
  paying_person_address_city: 'paying_person.address.city',
  paying_person_address_street_addr1: 'paying_person.address.street_addr1',
  paying_person_address_zip_code: 'paying_person.address.zip_code',
  paying_org_name: 'paying_org.name', paying_org_tel: 'paying_org.tel',
  paying_org_relationship: 'paying_org.relationship',
  paying_org_address_country: 'paying_org.address.country',
  paying_org_address_state: 'paying_org.address.state',
  paying_org_address_city: 'paying_org.address.city',
  paying_org_address_street_addr1: 'paying_org.address.street_addr1',
  paying_org_address_zip_code: 'paying_org.address.zip_code',
  // addressPhone
  home_addr_country: 'home_addr.country', home_addr_state: 'home_addr.state',
  home_addr_city: 'home_addr.city', home_addr_street_addr1: 'home_addr.street_addr1',
  home_addr_zip_code: 'home_addr.zip_code',
  mailing_addr_country: 'mailing_addr.country', mailing_addr_state: 'mailing_addr.state',
  mailing_addr_city: 'mailing_addr.city', mailing_addr_street_addr1: 'mailing_addr.street_addr1',
  mailing_addr_zip_code: 'mailing_addr.zip_code',
  // presentWork
  current_address_country: 'current_address.country', current_address_state: 'current_address.state',
  current_address_city: 'current_address.city', current_address_street_addr1: 'current_address.street_addr1',
  current_address_zip_code: 'current_address.zip_code', current_address_tel: 'current_address.tel',
  // passport
  issued_location_city: 'issued_location.city', issued_location_country: 'issued_location.country',
  // usContact
  us_contact_address_state: 'us_contact.address.state',
  us_contact_address_city: 'us_contact.address.city',
  us_contact_address_street_addr1: 'us_contact.address.street_addr1',
  us_contact_address_zip_code: 'us_contact.address.zip_code',
  us_contact_phone: 'us_contact.phone',
  // family
  father_surname: 'father.surname', father_given_name: 'father.given_name',
  father_date_of_birth: 'father.date_of_birth', father_in_us: 'father.in_us',
  father_status: 'father.status',
  mother_surname: 'mother.surname', mother_given_name: 'mother.given_name',
  mother_date_of_birth: 'mother.date_of_birth', mother_in_us: 'mother.in_us',
  mother_status: 'mother.status',
}

function getFieldValue(fd: Record<string, unknown>, field: string): unknown {
  const path = fieldPathMap[field] || field
  const parts = path.split('.')
  let obj: unknown = fd
  for (const p of parts) {
    if (obj == null || typeof obj !== 'object') return undefined
    obj = (obj as Record<string, unknown>)[p]
  }
  return obj
}

// ---- 申请人姓名 ----

const { buildPdfTitle, buildPdfFilename } = useApplicantName(
  () => (formData.surname + ' ' + formData.given_name).trim(),
)

// ---- 步骤定义 ----

const stepComponents = {
  PersonalInfo1: defineAsyncComponent(() => import('@/components/us-visa/steps/PersonalInfo1.vue')),
  PersonalInfo2: defineAsyncComponent(() => import('@/components/us-visa/steps/PersonalInfo2.vue')),
  Travel: defineAsyncComponent(() => import('@/components/us-visa/steps/Travel.vue')),
  TravelCompanions: defineAsyncComponent(() => import('@/components/us-visa/steps/TravelCompanions.vue')),
  PreviousUSTravel: defineAsyncComponent(() => import('@/components/us-visa/steps/PreviousUSTravel.vue')),
  AddressPhone: defineAsyncComponent(() => import('@/components/us-visa/steps/AddressPhone.vue')),
  Passport: defineAsyncComponent(() => import('@/components/us-visa/steps/Passport.vue')),
  USContact: defineAsyncComponent(() => import('@/components/us-visa/steps/USContact.vue')),
  Family: defineAsyncComponent(() => import('@/components/us-visa/steps/Family.vue')),
  PresentWork: defineAsyncComponent(() => import('@/components/us-visa/steps/PresentWork.vue')),
  PreviousWork: defineAsyncComponent(() => import('@/components/us-visa/steps/PreviousWork.vue')),
  AdditionalWork: defineAsyncComponent(() => import('@/components/us-visa/steps/AdditionalWork.vue')),
  SecurityBackground: defineAsyncComponent(() => import('@/components/us-visa/steps/SecurityBackground.vue')),
}

interface StepDef {
  key: string
  labelKey: string
  component: ReturnType<typeof defineAsyncComponent>
  requiredFields: string[]
  /** 数组字段校验规则：校验数组内每个条目的必填子字段 */
  arrayFieldRules?: { arrayKey: string; required: string[]; domPrefix: Record<string, string> }[]
  /** 条件字段：仅当 when() 返回 true 时才校验 */
  conditionalFields?: { field: string; when: () => boolean }[]
  /** 条件数组：当 when() 为 true 时，数组必须至少有 1 条记录 */
  conditionalArrays?: { arrayKey: string; when: () => boolean; flagField: string }[]
}

const steps: StepDef[] = [
  { key: 'personal1', labelKey: 'usVisa.sections.personal1', component: stepComponents.PersonalInfo1, requiredFields: ['surname', 'given_name', 'native_name', 'sex', 'marital_status', 'date_of_birth', 'birth_city', 'birth_country', 'has_other_names', 'has_telecode'],
    conditionalFields: [
      { field: 'marital_status_explain', when: () => (formData as any).marital_status === 'OTHER' },
      { field: 'other_surname', when: () => (formData as any).has_other_names === 'yes' },
      { field: 'other_given_name', when: () => (formData as any).has_other_names === 'yes' },
      { field: 'telecode_surname', when: () => (formData as any).has_telecode === 'yes' },
      { field: 'telecode_given_name', when: () => (formData as any).has_telecode === 'yes' },
    ],
  },
  { key: 'personal2', labelKey: 'usVisa.sections.personal2', component: stepComponents.PersonalInfo2, requiredFields: ['nationality', 'has_other_nationality', 'is_permanent_resident', 'national_id_number', 'social_security_number', 'tax_id_number'],
    conditionalFields: [
      { field: 'other_nationality', when: () => (formData as any).has_other_nationality === 'yes' },
      { field: 'has_other_nationality_passport', when: () => (formData as any).has_other_nationality === 'yes' },
      { field: 'other_nationality_passport_no', when: () => (formData as any).has_other_nationality_passport === 'yes' },
      { field: 'permanent_resident_country', when: () => (formData as any).is_permanent_resident === 'yes' },
    ],
  },
  { key: 'travel', labelKey: 'usVisa.sections.travel', component: stepComponents.Travel, requiredFields: ['purpose_of_trip', 'visa_category', 'arrival_date', 'length_of_stay', 'length_of_stay_period', 'paying_person_type'],
    conditionalFields: [
      { field: 'us_address_state', when: () => (formData as any).length_of_stay_period !== 'H' },
      { field: 'us_address_city', when: () => (formData as any).length_of_stay_period !== 'H' },
      { field: 'us_address_street_addr1', when: () => (formData as any).length_of_stay_period !== 'H' },
      { field: 'paying_person_surname', when: () => (formData as any).paying_person_type === 'O' },
      { field: 'paying_person_given_name', when: () => (formData as any).paying_person_type === 'O' },
      { field: 'paying_person_tel', when: () => (formData as any).paying_person_type === 'O' },
      { field: 'paying_person_relationship', when: () => (formData as any).paying_person_type === 'O' },
      { field: 'paying_person_address_same', when: () => (formData as any).paying_person_type === 'O' },
      { field: 'paying_org_name', when: () => (formData as any).paying_person_type === 'C' },
      { field: 'paying_org_tel', when: () => (formData as any).paying_person_type === 'C' },
      { field: 'paying_org_relationship', when: () => (formData as any).paying_person_type === 'C' },
      { field: 'paying_org_address_country', when: () => (formData as any).paying_person_type === 'C' },
    ],
  },
  { key: 'travelCompanions', labelKey: 'usVisa.sections.travelCompanions', component: stepComponents.TravelCompanions, requiredFields: ['has_travel_companions'],
    conditionalFields: [
      { field: 'is_group_travel', when: () => (formData as any).has_travel_companions === 'yes' },
      { field: 'group_name', when: () => (formData as any).has_travel_companions === 'yes' && (formData as any).is_group_travel === 'yes' },
    ],
    arrayFieldRules: [
      { arrayKey: 'companions', required: ['surname', 'given_name', 'relationship'], domPrefix: { surname: 'companion_surname', given_name: 'companion_given_name', relationship: 'companion_relationship' } },
    ],
    conditionalArrays: [
      { arrayKey: 'companions', when: () => (formData as any).has_travel_companions === 'yes' && (formData as any).is_group_travel !== 'yes', flagField: 'has_travel_companions' },
    ],
  },
  { key: 'previousUSTravel', labelKey: 'usVisa.sections.previousUSTravel', component: stepComponents.PreviousUSTravel, requiredFields: ['has_been_in_us', 'has_us_drivers_license', 'has_us_visa', 'has_been_refused', 'has_esta_refused', 'has_immigrant_petition'],
    conditionalFields: [
      { field: 'drivers_license_number', when: () => (formData as any).has_us_drivers_license === 'yes' },
      { field: 'drivers_license_state', when: () => (formData as any).has_us_drivers_license === 'yes' },
      { field: 'last_visa_date', when: () => (formData as any).has_us_visa === 'yes' },
      { field: 'last_visa_number', when: () => (formData as any).has_us_visa === 'yes' },
      { field: 'applying_same_type', when: () => (formData as any).has_us_visa === 'yes' },
      { field: 'applying_same_country', when: () => (formData as any).has_us_visa === 'yes' },
      { field: 'has_been_ten_printed', when: () => (formData as any).has_us_visa === 'yes' },
      { field: 'visa_lost_or_stolen', when: () => (formData as any).has_us_visa === 'yes' },
      { field: 'visa_cancelled', when: () => (formData as any).has_us_visa === 'yes' },
      { field: 'refusal_explain', when: () => (formData as any).has_been_refused === 'yes' },
      { field: 'esta_refusal_explain', when: () => (formData as any).has_esta_refused === 'yes' },
      { field: 'immigrant_petition_explain', when: () => (formData as any).has_immigrant_petition === 'yes' },
    ],
    arrayFieldRules: [
      { arrayKey: 'us_visits', required: ['arrival_date', 'length_of_stay', 'stay_period'], domPrefix: { arrival_date: 'visit_arrival_date', length_of_stay: 'visit_length_of_stay', stay_period: 'visit_stay_period' } },
    ],
    conditionalArrays: [
      { arrayKey: 'us_visits', when: () => (formData as any).has_been_in_us === 'yes', flagField: 'has_been_in_us' },
    ],
  },
  { key: 'addressPhone', labelKey: 'usVisa.sections.addressPhone', component: stepComponents.AddressPhone, requiredFields: ['home_addr_country', 'home_addr_state', 'home_addr_city', 'home_addr_street_addr1', 'home_addr_zip_code', 'phone_primary', 'email', 'email_confirm', 'has_other_phones', 'has_other_emails', 'has_other_social_media'],
    conditionalFields: [
      { field: 'mailing_addr_country', when: () => (formData as any).mailing_different === true },
      { field: 'mailing_addr_state', when: () => (formData as any).mailing_different === true },
      { field: 'mailing_addr_city', when: () => (formData as any).mailing_different === true },
      { field: 'mailing_addr_street_addr1', when: () => (formData as any).mailing_different === true },
      { field: 'mailing_addr_zip_code', when: () => (formData as any).mailing_different === true },
    ],
    arrayFieldRules: [
      { arrayKey: 'other_phones', required: ['number'], domPrefix: { number: 'other_phone_number' } },
      { arrayKey: 'other_emails', required: ['email'], domPrefix: { email: 'other_email' } },
      { arrayKey: 'social_media', required: ['platform'], domPrefix: { platform: 'social_media_platform' } },
      { arrayKey: 'other_social', required: ['platform', 'username'], domPrefix: { platform: 'other_social_platform', username: 'other_social_username' } },
    ],
  },
  { key: 'passport', labelKey: 'usVisa.sections.passport', component: stepComponents.Passport, requiredFields: ['doc_type', 'doc_number', 'doc_authority', 'issued_location_city', 'issued_location_country', 'issuance_date', 'expiration_date', 'has_lost_passport'],
    arrayFieldRules: [
      { arrayKey: 'lost_passports', required: ['number', 'country', 'explain'], domPrefix: { number: 'lost_passport_number', country: 'lost_passport_country', explain: 'lost_passport_explain' } },
    ],
    conditionalArrays: [
      { arrayKey: 'lost_passports', when: () => (formData as any).has_lost_passport === 'yes', flagField: 'has_lost_passport' },
    ],
  },
  { key: 'usContact', labelKey: 'usVisa.sections.usContact', component: stepComponents.USContact, requiredFields: ['us_relationship', 'us_contact_address_state', 'us_contact_address_city', 'us_contact_address_street_addr1', 'us_contact_address_zip_code', 'us_contact_phone'] },
  { key: 'family', labelKey: 'usVisa.sections.family', component: stepComponents.Family, requiredFields: ['father_surname', 'father_given_name', 'mother_surname', 'mother_given_name', 'has_immediate_relatives'],
    conditionalFields: [
      { field: 'father_date_of_birth', when: () => (formData as any).father?.surname !== 'DNC' || (formData as any).father?.given_name !== 'DNC' },
      { field: 'father_in_us', when: () => (formData as any).father?.surname !== 'DNC' || (formData as any).father?.given_name !== 'DNC' },
      { field: 'father_status', when: () => (formData as any).father?.in_us === 'yes' },
      { field: 'mother_date_of_birth', when: () => (formData as any).mother?.surname !== 'DNC' || (formData as any).mother?.given_name !== 'DNC' },
      { field: 'mother_in_us', when: () => (formData as any).mother?.surname !== 'DNC' || (formData as any).mother?.given_name !== 'DNC' },
      { field: 'mother_status', when: () => (formData as any).mother?.in_us === 'yes' },
    ],
    arrayFieldRules: [
      { arrayKey: 'immediate_relatives', required: ['surname', 'relationship', 'status'], domPrefix: { surname: 'ir_surname', relationship: 'ir_relationship', status: 'ir_status' } },
    ],
    conditionalArrays: [
      { arrayKey: 'immediate_relatives', when: () => (formData as any).has_immediate_relatives === 'yes', flagField: 'has_immediate_relatives' },
    ],
  },
  { key: 'presentWork', labelKey: 'usVisa.sections.presentWork', component: stepComponents.PresentWork, requiredFields: ['occupation', 'current_employer', 'current_address_country', 'current_address_state', 'current_address_city', 'current_address_street_addr1', 'current_address_zip_code', 'current_address_tel', 'start_date', 'job_description'] },
  { key: 'previousWork', labelKey: 'usVisa.sections.previousWork', component: stepComponents.PreviousWork, requiredFields: [],
    arrayFieldRules: [
      { arrayKey: 'previous_work', required: ['employer_name', 'address.country', 'address.city', 'address.street_addr1', 'phone', 'job_title', 'date_from', 'date_to', 'job_description'], domPrefix: { employer_name: 'pw_employer', 'address.country': 'pw_country', 'address.city': 'pw_city', 'address.street_addr1': 'pw_addr1', phone: 'pw_phone', job_title: 'pw_title', date_from: 'pw_from', date_to: 'pw_to', job_description: 'pw_desc' } },
      { arrayKey: 'education', required: ['name', 'address.country', 'address.city', 'address.street_addr1', 'course', 'date_from', 'date_to'], domPrefix: { name: 'edu_name', 'address.country': 'edu_country', 'address.city': 'edu_city', 'address.street_addr1': 'edu_addr1', course: 'edu_course', date_from: 'edu_from', date_to: 'edu_to' } },
    ],
    conditionalArrays: [
      { arrayKey: 'previous_work', when: () => (formData as any).was_previously_employed === 'yes', flagField: 'was_previously_employed' },
      { arrayKey: 'education', when: () => (formData as any).has_education === 'yes', flagField: 'has_education' },
    ],
  },
  { key: 'additionalWork', labelKey: 'usVisa.sections.additionalWork', component: stepComponents.AdditionalWork, requiredFields: [], arrayFieldRules: [
    { arrayKey: 'languages', required: ['name'], domPrefix: { name: 'lang_name' } },
    { arrayKey: 'traveled_countries', required: ['country'], domPrefix: { country: 'tc_country' } },
    { arrayKey: 'organizations', required: ['name'], domPrefix: { name: 'org_name' } },
    { arrayKey: 'military_service', required: ['country', 'branch', 'rank', 'specialty', 'date_from', 'date_to'], domPrefix: { country: 'mil_country', branch: 'mil_branch', rank: 'mil_rank', specialty: 'mil_specialty', date_from: 'mil_from', date_to: 'mil_to' } },
  ],
    conditionalArrays: [
      { arrayKey: 'traveled_countries', when: () => (formData as any).has_traveled_5yr === 'yes', flagField: 'has_traveled_5yr' },
      { arrayKey: 'organizations', when: () => (formData as any).has_organization === 'yes', flagField: 'has_organization' },
      { arrayKey: 'military_service', when: () => (formData as any).has_military_service === 'yes', flagField: 'has_military_service' },
    ],
  },
  { key: 'securityBackground', labelKey: 'usVisa.sections.securityBackground', component: stepComponents.SecurityBackground, requiredFields: [] },
]

// ---- 步骤导航 ----

const currentStep = ref(0)
const completedSteps = reactive(new Set<number>())
const shakeNav = ref(false)
const showValidationMsg = ref(false)
const invalidFields = reactive(new Set<string>())
provide('usVisaInvalidFields', invalidFields)
let validationTimer: ReturnType<typeof setTimeout> | null = null
let clearTimer: ReturnType<typeof setTimeout> | null = null

function triggerShake() {
  shakeNav.value = true
  showValidationMsg.value = true
  setTimeout(() => { shakeNav.value = false }, 500)
  if (validationTimer) clearTimeout(validationTimer)
  validationTimer = setTimeout(() => { showValidationMsg.value = false }, 3000)
}

// 用户编辑后，只清除已填好字段的红边，未填的保留
watch(formData, () => {
  if (invalidFields.size === 0) return
  if (clearTimer) clearTimeout(clearTimer)
  clearTimer = setTimeout(() => {
    const fd = formData as unknown as Record<string, unknown>
    const step = steps[currentStep.value]
    for (const field of [...invalidFields]) {
      // _not_applicable 跳过
      const naKey = `${field}_not_applicable`
      const naPath = fieldPathMap[naKey] || naKey
      const isNA = naPath.includes('.')
        ? getFieldValue(fd, naKey) === true
        : naKey in fd && fd[naKey] === true
      if (isNA || isFieldFilled(getFieldValue(fd, field))) {
        invalidFields.delete(field)
      }
    }
    // 条件字段：条件不满足时也清除
    if (step.conditionalFields) {
      for (const cf of step.conditionalFields) {
        if (!cf.when() || isFieldFilled(getFieldValue(fd, cf.field))) {
          invalidFields.delete(cf.field)
        }
      }
    }
    // 条件数组：条件不满足时清除标记字段
    if (step.conditionalArrays) {
      for (const rule of step.conditionalArrays) {
        if (!rule.when()) {
          invalidFields.delete(rule.flagField)
        }
      }
    }
    // 数组子字段：已填好时清除红边
    if (step.arrayFieldRules) {
      for (const rule of step.arrayFieldRules) {
        const arr = arrayLookup[rule.arrayKey]
        if (!arr) continue
        for (const field of [...invalidFields]) {
          for (const [key, domKey] of Object.entries(rule.domPrefix || {})) {
            const match = field.match(new RegExp(`^${domKey}_(\\d+)$`))
            if (match) {
              const idx = parseInt(match[1])
              const entry = arr[idx]
              if (entry) {
                const parts = key.split('.')
                let val: unknown = entry
                for (const p of parts) {
                  if (val == null || typeof val !== 'object') { val = undefined; break }
                  val = (val as Record<string, unknown>)[p]
                }
                if (isFieldFilled(val)) invalidFields.delete(field)
              }
            }
          }
        }
      }
    }
    if (invalidFields.size === 0) showValidationMsg.value = false
  }, 150)
}, { deep: true })

function isFieldFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 || trimmed === 'N/A' || trimmed === 'DNC'
  }
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value as object).length > 0
  return false
}

function validateStep(stepIndex: number): boolean {
  const step = steps[stepIndex]
  const fd = formData as unknown as Record<string, unknown>
  invalidFields.clear()

  let allValid = true

  const checkField = (field: string) => {
    // _not_applicable 标记跳过
    const naKey = `${field}_not_applicable`
    const isNA = getFieldValue(fd, naKey) === true
    if (!isNA && !isFieldFilled(getFieldValue(fd, field))) {
      invalidFields.add(field)
      allValid = false
    }
  }

  // 固定必填字段
  for (const field of step.requiredFields) checkField(field)

  // 条件字段
  if (step.conditionalFields) {
    for (const cf of step.conditionalFields) {
      if (cf.when()) checkField(cf.field)
    }
  }

  // 安全背景题（32 道）
  if (step.key === 'securityBackground') {
    const answers = fd.securityAnswers as Record<number, { answer: string; explain: string }> | undefined
    if (answers) {
      for (let q = 1; q <= 32; q++) {
        const ans = answers[q]?.answer
        if (!isFieldFilled(ans)) {
          invalidFields.add(`securityQ${q}`)
          allValid = false
        }
      }
    } else {
      for (let q = 1; q <= 32; q++) {
        invalidFields.add(`securityQ${q}`)
      }
      allValid = false
    }
  }

  // 数组条目校验：每个已存在的条目中，required 子字段都必须已填
  // 注意：数组是独立 reactive 变量，不在 formData 中，从数组查找表取值
  if (step.arrayFieldRules) {
    for (const rule of step.arrayFieldRules) {
      const arr = arrayLookup[rule.arrayKey]
      if (!arr) continue
      arr.forEach((entry, idx) => {
        for (const key of rule.required) {
          // 直接解析点路径（如 address.country），不走 fieldPathMap
          const parts = key.split('.')
          let val: unknown = entry
          for (const p of parts) {
            if (val == null || typeof val !== 'object') { val = undefined; break }
            val = (val as Record<string, unknown>)[p]
          }
          if (!isFieldFilled(val)) {
            const domKey = rule.domPrefix?.[key] || key
            invalidFields.add(`${domKey}_${idx}`)
            allValid = false
          }
        }
      })
    }
  }

  // 条件数组校验：当条件满足时，数组必须至少有 1 条记录
  if (step.conditionalArrays) {
    for (const rule of step.conditionalArrays) {
      if (rule.when()) {
        const arr = arrayLookup[rule.arrayKey]
        if (!arr || arr.length === 0) {
          invalidFields.add(rule.flagField)
          allValid = false
        }
      }
    }
  }

  return allValid
}

function goToStep(index: number) {
  if (index < 0 || index >= steps.length || index === currentStep.value) return

  if (index > currentStep.value) {
    // Validate all steps between current and target
    for (let i = currentStep.value; i < index; i++) {
      if (!validateStep(i)) { triggerShake(); return }
    }
    // Mark intermediate steps as completed
    for (let i = currentStep.value; i < index; i++) {
      completedSteps.add(i)
    }
  }

  currentStep.value = index
}

function goToNext() {
  if (!validateStep(currentStep.value)) { triggerShake(); return }
  completedSteps.add(currentStep.value)
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

function goToBack() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// ---- localStorage 持久化 ----

watch(
  formData,
  () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        _schemaVersion: SCHEMA_VERSION,
        data: { ...formData },
      }))
    } catch { /* ignore */ }
  },
  { deep: true },
)

// ---- 填充测试数据（仅开发模式） ----

function fillMockData() {
  if (!import.meta.env.DEV) return
  const defaults = buildDefaultFormData()
  Object.assign(formData, defaults) // reset to clean state
  for (const key of Object.keys(mockUSFormData)) {
    const val = (mockUSFormData as Record<string, unknown>)[key]
    if (Array.isArray(val)) {
      ;(formData as Record<string, unknown>)[key] = [...val]
    } else if (val !== null && typeof val === 'object') {
      ;(formData as Record<string, unknown>)[key] = { ...val }
    } else {
      ;(formData as Record<string, unknown>)[key] = val
    }
  }
  // Reset all repeatable arrays
  companions.splice(0); us_visits.splice(0); other_phones.splice(0); other_emails.splice(0)
  social_media.splice(0); other_social.splice(0); lost_passports.splice(0)
  immediate_relatives.splice(0)
  previous_work.splice(0); education.splice(0); languages.splice(0)
  traveled_countries.splice(0); organizations.splice(0); military_service.splice(0)
  // Populate from mock arrays
  const mockArrayMap: Record<string, unknown[]> = {
    companions: mockArrays.companions,
    us_visits: mockArrays.us_visits,
    other_phones: mockArrays.other_phones,
    other_emails: mockArrays.other_emails,
    social_media: mockArrays.social_media,
    other_social: mockArrays.other_social,
    lost_passports: mockArrays.lost_passports,
    immediate_relatives: mockArrays.immediate_relatives,
    previous_work: mockArrays.previous_work,
    education: mockArrays.education,
    languages: mockArrays.languages,
    traveled_countries: mockArrays.traveled_countries,
    organizations: mockArrays.organizations,
    military_service: mockArrays.military_service,
  }
  const liveArrays: Record<string, unknown[]> = {
    companions, us_visits, other_phones, other_emails,
    social_media, other_social, lost_passports,
    immediate_relatives,
    previous_work, education, languages,
    traveled_countries, organizations, military_service,
  }
  for (const [key, mockArr] of Object.entries(mockArrayMap)) {
    const arr = liveArrays[key]
    if (arr && Array.isArray(mockArr)) arr.push(...mockArr)
  }
  currentStep.value = 0
  completedSteps.clear()
}

// ---- 清除数据 ----

function clearForm() {
  const defaults = buildDefaultFormData()
  Object.assign(formData, defaults)
  localStorage.removeItem(STORAGE_KEY)
  currentStep.value = 0
  completedSteps.clear()
}

// ---- 辅助函数 ----

const yesNoOptions = [
  { value: 'yes', labelKey: 'usVisa.options.yesNo.yes' },
  { value: 'no', labelKey: 'usVisa.options.yesNo.no' },
]

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  if (locale.value === 'zh-CN') return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function resolveOption(options: Array<{ value: string; labelKey: string }>, value: string): string {
  if (!value) return ''
  const opt = options.find((o) => o.value === value)
  return opt ? t(opt.labelKey) : value
}

function boolStr(val: boolean): string {
  return val ? t('usVisa.options.yesNo.yes') : t('usVisa.options.yesNo.no')
}

const personalRelations = ['RELATIVE', 'SPOUSE', 'FRIEND']

// ---- 预览数据（13 个分组） ----

const previewSections = computed<PreviewSection[]>(() => {
  // Build security fields programmatically (32 questions)
  const securityFields: PreviewField[] = []
  const partBounds = [
    { start: 1, end: 3, labelKey: 'usVisa.security.part1' },
    { start: 4, end: 10, labelKey: 'usVisa.security.part2' },
    { start: 11, end: 22, labelKey: 'usVisa.security.part3' },
    { start: 23, end: 27, labelKey: 'usVisa.security.part4' },
    { start: 28, end: 32, labelKey: 'usVisa.security.part5' },
  ]
  for (const part of partBounds) {
    for (let q = part.start; q <= part.end; q++) {
      const isFirst = q === part.start
      const answer = formData.securityAnswers[q]?.answer || ''
      securityFields.push({
        label: t(`usVisa.security.q${q}`),
        value: resolveOption(yesNoOptions, answer),
        required: true,
        type: 'radio',
        name: `security_q${q}`,
        ...(isFirst ? { groupStart: true, cardName: t(part.labelKey) } : {}),
      })
      if (answer === 'yes') {
        securityFields.push({
          label: t('usVisa.fields.security_explain.label'),
          value: formData.securityAnswers[q]?.explain || '',
          required: true,
          type: 'text',
          name: `security_q${q}_explain`,
          conditional: true,
        })
      }
    }
  }

  return [
    // 1. Personal Information (I)
    {
      title: t('usVisa.sections.personal1'),
      fields: [
        // L2: 姓名
        { label: t('usVisa.fields.surname.label'), value: formData.surname, required: true, type: 'text', name: 'surname', span: 'third', groupStart: true, cardName: t('usVisa.subLabels.name') },
        { label: t('usVisa.fields.given_name.label'), value: formData.given_name, required: true, type: 'text', name: 'given_name', span: 'third' },
        { label: t('usVisa.fields.native_name.label'), value: formData.native_name_not_applicable ? 'N/A' : formData.native_name, required: true, type: 'text', name: 'native_name', span: 'half' },
        { label: t('usVisa.fields.has_other_names.label'), value: resolveOption(yesNoOptions, formData.has_other_names), required: true, type: 'radio', name: 'has_other_names' },
        ...(formData.has_other_names === 'yes' ? [
          { label: t('usVisa.fields.other_surname.label'), value: formData.other_surname, required: true, type: 'text', name: 'other_surname' as const, span: 'third' as const, conditional: true },
          { label: t('usVisa.fields.other_given_name.label'), value: formData.other_given_name, required: true, type: 'text', name: 'other_given_name' as const, span: 'third' as const, conditional: true },
        ] : []),
        // L2: 电码
        { label: t('usVisa.fields.has_telecode.label'), value: resolveOption(yesNoOptions, formData.has_telecode), required: true, type: 'radio', name: 'has_telecode', groupStart: true, cardName: t('usVisa.subLabels.telecode') },
        ...(formData.has_telecode === 'yes' ? [
          { label: t('usVisa.fields.telecode_surname.label'), value: formData.telecode_surname, required: true, type: 'text', name: 'telecode_surname' as const, span: 'third' as const, conditional: true },
          { label: t('usVisa.fields.telecode_given_name.label'), value: formData.telecode_given_name, required: true, type: 'text', name: 'telecode_given_name' as const, span: 'third' as const, conditional: true },
        ] : []),
        // 独立字段
        { label: t('usVisa.fields.sex.label'), value: resolveOption(genderOptions, formData.sex), required: true, type: 'select', name: 'sex', span: 'third' },
        { label: t('usVisa.fields.marital_status.label'), value: resolveOption(maritalStatusOptions, formData.marital_status), required: true, type: 'radio', name: 'marital_status' },
        ...(formData.marital_status === 'OTHER' ? [
          { label: t('usVisa.fields.marital_status_explain.label'), value: formData.marital_status_explain, required: true, type: 'text', name: 'marital_status_explain' as const, conditional: true },
        ] : []),
        // L2: 出生信息
        { label: t('usVisa.fields.date_of_birth.label'), value: formatDate(formData.date_of_birth), required: true, type: 'date', name: 'date_of_birth' },
        { label: t('usVisa.fields.birth_country.label'), value: resolveOption(usCountryOptions, formData.birth_country) || formData.birth_country, required: true, type: 'select', name: 'birth_country', span: 'third' },
        { label: t('usVisa.fields.birth_state.label'), value: formData.birth_state, type: 'text', name: 'birth_state', span: 'third' },
        { label: t('usVisa.fields.birth_city.label'), value: formData.birth_city, required: true, type: 'text', name: 'birth_city', span: 'half' },
      ],
    },
    // 2. Personal Information (II)
    {
      title: t('usVisa.sections.personal2'),
      fields: [
        // L2: 国籍
        { label: t('usVisa.fields.nationality.label'), value: resolveOption(usCountryOptions, formData.nationality) || formData.nationality, required: true, type: 'select', name: 'nationality', span: 'third', groupStart: true, cardName: t('usVisa.subLabels.nationality') },
        { label: t('usVisa.fields.has_other_nationality.label'), value: resolveOption(yesNoOptions, formData.has_other_nationality), required: true, type: 'radio', name: 'has_other_nationality' },
        ...(formData.has_other_nationality === 'yes' ? [
          { label: t('usVisa.fields.other_nationality.label'), value: resolveOption(usCountryOptions, formData.other_nationality) || formData.other_nationality, required: true, type: 'select', name: 'other_nationality' as const, span: 'third' as const, conditional: true },
          { label: t('usVisa.fields.has_other_nationality_passport.label'), value: resolveOption(yesNoOptions, formData.has_other_nationality_passport), required: true, type: 'radio', name: 'has_other_nationality_passport' as const, conditional: true },
          ...(formData.has_other_nationality_passport === 'yes' ? [
            { label: t('usVisa.fields.other_nationality_passport_no.label'), value: formData.other_nationality_passport_no, required: true, type: 'text', name: 'other_nationality_passport_no' as const, span: 'third' as const, conditional: true },
          ] : []),
        ] : []),
        { label: t('usVisa.fields.is_permanent_resident.label'), value: resolveOption(yesNoOptions, formData.is_permanent_resident), required: true, type: 'radio', name: 'is_permanent_resident' },
        ...(formData.is_permanent_resident === 'yes' ? [
          { label: t('usVisa.fields.permanent_resident_country.label'), value: resolveOption(usCountryOptions, formData.permanent_resident_country) || formData.permanent_resident_country, type: 'select', name: 'permanent_resident_country' as const, span: 'third' as const, conditional: true },
        ] : []),
        // L2: 证件号码
        { label: t('usVisa.fields.national_id_number.label'), value: formData.national_id_number, required: true, type: 'text', name: 'national_id_number', span: 'half', groupStart: true, cardName: t('usVisa.subLabels.idNumbers') },
        { label: t('usVisa.fields.social_security_number.label'), value: formData.social_security_number, type: 'text', name: 'social_security_number', span: 'third' },
        { label: t('usVisa.fields.tax_id_number.label'), value: formData.tax_id_number, required: true, type: 'text', name: 'tax_id_number', span: 'half' },
      ],
    },
    // 3. Travel Information
    {
      title: t('usVisa.sections.travel'),
      fields: [
        // L2: 旅行目的
        { label: t('usVisa.fields.purpose_of_trip.label'), value: resolveOption(purposeOfTripOptions, formData.purpose_of_trip), required: true, type: 'select', name: 'purpose_of_trip', span: 'third', groupStart: true, cardName: t('usVisa.subLabels.travelPurpose') },
        { label: t('usVisa.fields.visa_category.label'), value: formData.visa_category, required: true, type: 'text', name: 'visa_category', span: 'third' },
        // L2: 行程计划
        { label: t('usVisa.fields.arrival_date.label'), value: formatDate(formData.arrival_date), required: true, type: 'date', name: 'arrival_date', groupStart: true, cardName: t('usVisa.subLabels.travelPlan') },
        { label: t('usVisa.fields.length_of_stay.label'), value: formData.length_of_stay, required: true, type: 'text', name: 'length_of_stay', span: 'third' },
        { label: t('usVisa.fields.length_of_stay_period.label'), value: resolveOption(periodOptions, formData.length_of_stay_period), required: true, type: 'select', name: 'length_of_stay_period', span: 'third' },
        ...(formData.length_of_stay_period !== 'H' ? [
          // L2: 美国住宿地址
          { label: t('usVisa.fields.us_address_state.label'), value: resolveOption(usStatesOptions, formData.us_address.state) || formData.us_address.state, required: true, type: 'select', name: 'us_address_state' as const, span: 'third' as const, groupStart: true, cardName: t('usVisa.subLabels.usAddress') },
          { label: t('usVisa.fields.us_address_city.label'), value: formData.us_address.city, required: true, type: 'text', name: 'us_address_city' as const, span: 'third' as const },
          { label: t('usVisa.fields.us_address_street_addr1.label'), value: formData.us_address.street_addr1, required: true, type: 'text', name: 'us_address_street_addr1' as const, span: 'half' as const },
          { label: t('usVisa.fields.us_address_zip_code.label'), value: formData.us_address.zip_code, type: 'text', name: 'us_address_zip_code' as const, span: 'third' as const },
        ] : []),
        // L2: 费用支付
        { label: t('usVisa.fields.paying_person_type.label'), value: resolveOption(payerTypeOptions, formData.paying_person_type), required: true, type: 'select', name: 'paying_person_type', span: 'third', groupStart: true, cardName: t('usVisa.subLabels.payer') },
        ...(formData.paying_person_type === 'O' ? [
          { label: t('usVisa.fields.paying_person_surname.label'), value: formData.paying_person.surname, required: true, type: 'text', name: 'paying_person_surname' as const, span: 'third' as const, conditional: true },
          { label: t('usVisa.fields.paying_person_given_name.label'), value: formData.paying_person.given_name, required: true, type: 'text', name: 'paying_person_given_name' as const, span: 'third' as const, conditional: true },
          { label: t('usVisa.fields.paying_person_tel.label'), value: formData.paying_person.tel, required: true, type: 'text', name: 'paying_person_tel' as const, span: 'half' as const, conditional: true },
          { label: t('usVisa.fields.paying_person_email.label'), value: formData.paying_person.email, type: 'text', name: 'paying_person_email' as const, span: 'half' as const, conditional: true },
          { label: t('usVisa.fields.paying_person_relationship.label'), value: resolveOption(payerRelationOptions, formData.paying_person.relationship), required: true, type: 'select', name: 'paying_person_relationship' as const, span: 'third' as const, conditional: true },
          // address_same 在 conditional-group 外面，不是条件字段
          { label: t('usVisa.fields.paying_person_address_same.label'), value: resolveOption(yesNoOptions, formData.paying_person.address_same), required: true, type: 'radio', name: 'paying_person_address_same' as const },
          ...(formData.paying_person.address_same === 'no' ? [
            { label: t('usVisa.fields.paying_person_address_country.label'), value: resolveOption(usCountryOptions, formData.paying_person.address.country) || formData.paying_person.address.country, required: true, type: 'select', name: 'paying_person_address_country' as const, span: 'third' as const, conditional: true },
            { label: t('usVisa.fields.paying_person_address_state.label'), value: formData.paying_person.address.state, required: true, type: 'text', name: 'paying_person_address_state' as const, span: 'half' as const, conditional: true },
            { label: t('usVisa.fields.paying_person_address_city.label'), value: formData.paying_person.address.city, required: true, type: 'text', name: 'paying_person_address_city' as const, span: 'half' as const, conditional: true },
            { label: t('usVisa.fields.paying_person_address_street_addr1.label'), value: formData.paying_person.address.street_addr1, required: true, type: 'text', name: 'paying_person_address_street_addr1' as const, conditional: true },
            { label: t('usVisa.fields.paying_person_address_zip_code.label'), value: formData.paying_person.address.zip_code, required: true, type: 'text', name: 'paying_person_address_zip_code' as const, span: 'third' as const, conditional: true },
          ] : []),
        ] : []),
        ...(formData.paying_person_type === 'C' ? [
          { label: t('usVisa.fields.paying_org_name.label'), value: formData.paying_org.name, required: true, type: 'text', name: 'paying_org_name' as const, span: 'half' as const, conditional: true },
          { label: t('usVisa.fields.paying_org_tel.label'), value: formData.paying_org.tel, required: true, type: 'text', name: 'paying_org_tel' as const, span: 'half' as const, conditional: true },
          { label: t('usVisa.fields.paying_org_relationship.label'), value: formData.paying_org.relationship, required: true, type: 'text', name: 'paying_org_relationship' as const, span: 'half' as const, conditional: true },
          { label: t('usVisa.fields.paying_org_address_country.label'), value: resolveOption(usCountryOptions, formData.paying_org.address.country) || formData.paying_org.address.country, required: true, type: 'select', name: 'paying_org_address_country' as const, span: 'third' as const, conditional: true },
          { label: t('usVisa.fields.paying_org_address_state.label'), value: formData.paying_org.address.state, required: true, type: 'text', name: 'paying_org_address_state' as const, span: 'half' as const, conditional: true },
          { label: t('usVisa.fields.paying_org_address_city.label'), value: formData.paying_org.address.city, required: true, type: 'text', name: 'paying_org_address_city' as const, span: 'half' as const, conditional: true },
          { label: t('usVisa.fields.paying_org_address_street_addr1.label'), value: formData.paying_org.address.street_addr1, required: true, type: 'text', name: 'paying_org_address_street_addr1' as const, conditional: true },
          { label: t('usVisa.fields.paying_org_address_zip_code.label'), value: formData.paying_org.address.zip_code, required: true, type: 'text', name: 'paying_org_address_zip_code' as const, span: 'third' as const, conditional: true },
        ] : []),
      ],
    },
    // 4. Travel Companions
    {
      title: t('usVisa.sections.travelCompanions'),
      fields: [
        { label: t('usVisa.fields.has_travel_companions.label'), value: resolveOption(yesNoOptions, formData.has_travel_companions), required: true, type: 'radio', name: 'has_travel_companions' },
        ...(formData.has_travel_companions === 'yes' ? [
          { label: t('usVisa.fields.is_group_travel.label'), value: resolveOption(yesNoOptions, formData.is_group_travel), required: true, type: 'radio', name: 'is_group_travel' },
          ...(formData.is_group_travel === 'yes' ? [
            { label: t('usVisa.fields.group_name.label'), value: formData.group_name, required: true, type: 'text', name: 'group_name' as const, span: 'half' as const },
          ] : []),
          ...(formData.is_group_travel === 'no' ? companions.map((c, i) => [
            { label: t('usVisa.fields.companion_surname.label'), value: c.surname, required: true, type: 'text', name: `comp_${i}_surname`, span: 'third' as const, groupStart: i === 0 ? true : undefined, cardName: i === 0 ? t('usVisa.subLabelsRepeat.companion', { N: i + 1 }) : undefined },
            { label: t('usVisa.fields.companion_given_name.label'), value: c.given_name, required: true, type: 'text', name: `comp_${i}_given_name`, span: 'third' as const },
            { label: t('usVisa.fields.companion_relationship.label'), value: resolveOption(relationshipOptions, c.relationship), required: true, type: 'select', name: `comp_${i}_relationship`, span: 'third' as const },
          ]).flat() : []),
        ] : []),
      ],
    },
    // 5. Previous U.S. Travel
    {
      title: t('usVisa.sections.previousUSTravel'),
      fields: [
        // L2: 赴美记录
        { label: t('usVisa.fields.has_been_in_us.label'), value: resolveOption(yesNoOptions, formData.has_been_in_us), required: true, type: 'radio', name: 'has_been_in_us', groupStart: true, cardName: t('usVisa.subLabels.usVisits') },
        ...(formData.has_been_in_us === 'yes' ? us_visits.map((v, i) => [
          { label: t('usVisa.fields.visit_arrival_date.label'), value: formatDate(v.arrival_date), required: true, type: 'date', name: `visit_${i}_arrival_date`, span: 'third' as const, groupStart: i === 0 ? true : undefined, cardName: i === 0 ? t('usVisa.subLabelsRepeat.usVisit', { N: i + 1 }) : undefined },
          { label: t('usVisa.fields.visit_length_of_stay.label'), value: v.length_of_stay, required: true, type: 'text', name: `visit_${i}_length_of_stay`, span: 'third' as const },
          { label: t('usVisa.fields.visit_stay_period.label'), value: resolveOption(stayPeriodOptions, v.stay_period), required: true, type: 'select', name: `visit_${i}_stay_period`, span: 'third' as const },
        ]).flat() : []),
        // L2: 美国驾照
        { label: t('usVisa.fields.has_us_drivers_license.label'), value: resolveOption(yesNoOptions, formData.has_us_drivers_license), required: true, type: 'radio', name: 'has_us_drivers_license', groupStart: true, cardName: t('usVisa.subLabels.usDriversLicense') },
        ...(formData.has_us_drivers_license === 'yes' ? [
          { label: t('usVisa.fields.drivers_license_number.label'), value: formData.drivers_license_number, required: true, type: 'text', name: 'drivers_license_number' as const, span: 'third' as const, conditional: true },
          { label: t('usVisa.fields.drivers_license_state.label'), value: resolveOption(usStatesOptions, formData.drivers_license_state) || formData.drivers_license_state, required: true, type: 'select', name: 'drivers_license_state' as const, span: 'third' as const, conditional: true },
        ] : []),
        // L2: 美国签证历史
        { label: t('usVisa.fields.has_us_visa.label'), value: resolveOption(yesNoOptions, formData.has_us_visa), required: true, type: 'radio', name: 'has_us_visa', groupStart: true, cardName: t('usVisa.subLabels.usVisaHistory') },
        ...(formData.has_us_visa === 'yes' ? [
          { label: t('usVisa.fields.last_visa_date.label'), value: formatDate(formData.last_visa_date), required: true, type: 'date', name: 'last_visa_date', conditional: true },
          { label: t('usVisa.fields.last_visa_number.label'), value: formData.last_visa_number, required: true, type: 'text', name: 'last_visa_number', span: 'third', conditional: true },
          { label: t('usVisa.fields.applying_same_type.label'), value: resolveOption(yesNoOptions, formData.applying_same_type), required: true, type: 'radio', name: 'applying_same_type', conditional: true },
          { label: t('usVisa.fields.applying_same_country.label'), value: resolveOption(yesNoOptions, formData.applying_same_country), required: true, type: 'radio', name: 'applying_same_country', conditional: true },
          { label: t('usVisa.fields.has_been_ten_printed.label'), value: resolveOption(yesNoOptions, formData.has_been_ten_printed), required: true, type: 'radio', name: 'has_been_ten_printed', conditional: true },
          { label: t('usVisa.fields.visa_lost_or_stolen.label'), value: resolveOption(yesNoOptions, formData.visa_lost_or_stolen), required: true, type: 'radio', name: 'visa_lost_or_stolen', conditional: true },
          { label: t('usVisa.fields.visa_cancelled.label'), value: resolveOption(yesNoOptions, formData.visa_cancelled), required: true, type: 'radio', name: 'visa_cancelled', conditional: true },
        ] : []),
        // 拒签记录
        { label: t('usVisa.fields.has_been_refused.label'), value: resolveOption(yesNoOptions, formData.has_been_refused), required: true, type: 'radio', name: 'has_been_refused' },
        ...(formData.has_been_refused === 'yes' ? [
          { label: t('usVisa.fields.refusal_explain.label'), value: formData.refusal_explain, required: true, type: 'text', name: 'refusal_explain', conditional: true },
        ] : []),
        { label: t('usVisa.fields.has_esta_refused.label'), value: resolveOption(yesNoOptions, formData.has_esta_refused), required: true, type: 'radio', name: 'has_esta_refused' },
        ...(formData.has_esta_refused === 'yes' ? [
          { label: t('usVisa.fields.esta_refusal_explain.label'), value: formData.esta_refusal_explain, required: true, type: 'text', name: 'esta_refusal_explain', conditional: true },
        ] : []),
        { label: t('usVisa.fields.has_immigrant_petition.label'), value: resolveOption(yesNoOptions, formData.has_immigrant_petition), required: true, type: 'radio', name: 'has_immigrant_petition' },
        ...(formData.has_immigrant_petition === 'yes' ? [
          { label: t('usVisa.fields.immigrant_petition_explain.label'), value: formData.immigrant_petition_explain, required: true, type: 'text', name: 'immigrant_petition_explain', conditional: true },
        ] : []),
      ],
    },
    // 6. Address & Phone
    {
      title: t('usVisa.sections.addressPhone'),
      fields: [
        // L2: 家庭住址
        { label: t('usVisa.fields.home_addr_country.label'), value: resolveOption(usCountryOptions, formData.home_addr.country) || formData.home_addr.country, required: true, type: 'select', name: 'home_addr_country', span: 'third', groupStart: true, cardName: t('usVisa.subLabels.homeAddress') },
        { label: t('usVisa.fields.home_addr_state.label'), value: formData.home_addr.state, required: true, type: 'text', name: 'home_addr_state', span: 'third' },
        { label: t('usVisa.fields.home_addr_city.label'), value: formData.home_addr.city, required: true, type: 'text', name: 'home_addr_city', span: 'third' },
        { label: t('usVisa.fields.home_addr_street_addr1.label'), value: formData.home_addr.street_addr1, required: true, type: 'text', name: 'home_addr_street_addr1', span: 'half' },
        { label: t('usVisa.fields.home_addr_zip_code.label'), value: formData.home_addr.zip_code, required: true, type: 'text', name: 'home_addr_zip_code', span: 'third' },
        // L2: 联系电话
        { label: t('usVisa.fields.phone_primary.label'), value: formData.phone_primary, required: true, type: 'text', name: 'phone_primary', span: 'third', groupStart: true, cardName: t('usVisa.subLabels.phone') },
        { label: t('usVisa.fields.phone_secondary.label'), value: formData.phone_secondary, type: 'text', name: 'phone_secondary', span: 'third' },
        { label: t('usVisa.fields.phone_work.label'), value: formData.phone_work, type: 'text', name: 'phone_work', span: 'third' },
        // L2: 电子邮箱
        { label: t('usVisa.fields.email.label'), value: formData.email, required: true, type: 'text', name: 'email', span: 'third', groupStart: true, cardName: t('usVisa.subLabels.emailSection') },
        { label: t('usVisa.fields.email_confirm.label'), value: formData.email_confirm, required: true, type: 'text', name: 'email_confirm', span: 'third' },
        // L2: 其他联系方式
        { label: t('usVisa.fields.has_other_phones.label'), value: resolveOption(yesNoOptions, formData.has_other_phones), required: true, type: 'radio', name: 'has_other_phones', groupStart: true, cardName: t('usVisa.subLabels.otherContact') },
        ...(formData.has_other_phones === 'yes' ? other_phones.map((p, i) => [
          { label: t('usVisa.fields.other_phone_number.label'), value: p.number, required: true, type: 'text', name: `other_phone_${i}`, span: 'third' as const, groupStart: true, cardName: `${t('usVisa.fields.phone_primary.label')} ${i + 1}` },
        ]).flat() : []),
        { label: t('usVisa.fields.has_other_emails.label'), value: resolveOption(yesNoOptions, formData.has_other_emails), required: true, type: 'radio', name: 'has_other_emails' },
        ...(formData.has_other_emails === 'yes' ? other_emails.map((e, i) => [
          { label: t('usVisa.fields.other_email.label'), value: e.email, required: true, type: 'text', name: `other_email_${i}`, span: 'half' as const, groupStart: true, cardName: `${t('usVisa.fields.email.label')} ${i + 1}` },
        ]).flat() : []),
        // L2: 邮寄地址
        { label: t('usVisa.fields.mailing_different.label'), value: boolStr(formData.mailing_different), type: 'radio', name: 'mailing_different', groupStart: true, cardName: t('usVisa.subLabels.mailingAddress') },
        ...(formData.mailing_different ? [
          { label: t('usVisa.fields.mailing_addr_country.label'), value: resolveOption(usCountryOptions, formData.mailing_addr.country) || formData.mailing_addr.country, required: true, type: 'select', name: 'mailing_addr_country' as const, span: 'third' as const, conditional: true },
          { label: t('usVisa.fields.mailing_addr_state.label'), value: formData.mailing_addr.state, required: true, type: 'text', name: 'mailing_addr_state' as const, span: 'third' as const, conditional: true },
          { label: t('usVisa.fields.mailing_addr_city.label'), value: formData.mailing_addr.city, required: true, type: 'text', name: 'mailing_addr_city' as const, span: 'third' as const, conditional: true },
          { label: t('usVisa.fields.mailing_addr_street_addr1.label'), value: formData.mailing_addr.street_addr1, required: true, type: 'text', name: 'mailing_addr_street_addr1' as const, span: 'half' as const, conditional: true },
          { label: t('usVisa.fields.mailing_addr_zip_code.label'), value: formData.mailing_addr.zip_code, required: true, type: 'text', name: 'mailing_addr_zip_code' as const, span: 'third' as const, conditional: true },
        ] : []),
        // L2: 社交媒体
        ...social_media.map((s, i) => [
          { label: t('usVisa.fields.social_media_platform.label'), value: resolveOption(socialMediaOptions, s.platform), required: true, type: 'select', name: `social_${i}_platform`, span: 'third' as const, groupStart: true, cardName: `${t('usVisa.subLabels.socialMedia')} ${i + 1}` },
          ...(s.platform !== 'NONE' ? [
            { label: t('usVisa.fields.social_media_username.label'), value: s.username, required: true, type: 'text', name: `social_${i}_username` as const, span: 'half' as const },
          ] : []),
        ]).flat(),
        { label: t('usVisa.fields.has_other_social_media.label'), value: resolveOption(yesNoOptions, formData.has_other_social_media), required: true, type: 'radio', name: 'has_other_social_media' },
        ...(formData.has_other_social_media === 'yes' ? other_social.map((s, i) => [
          { label: t('usVisa.fields.other_social_platform.label'), value: s.platform, required: true, type: 'text', name: `other_social_${i}_platform`, span: 'third' as const, groupStart: true, cardName: `${t('usVisa.fields.other_social_platform.label')} ${i + 1}` },
          { label: t('usVisa.fields.other_social_username.label'), value: s.username, required: true, type: 'text', name: `other_social_${i}_username`, span: 'half' as const },
        ]).flat() : []),
      ],
    },
    // 7. Passport Information
    {
      title: t('usVisa.sections.passport'),
      fields: [
        // L2: 护照基本信息
        { label: t('usVisa.fields.doc_type.label'), value: resolveOption(docTypeOptions, formData.doc_type), required: true, type: 'select', name: 'doc_type', span: 'third', groupStart: true, cardName: t('usVisa.subLabels.passportBasic') },
        ...(formData.doc_type === 'OTHER' ? [
          { label: t('usVisa.fields.doc_type_explain.label'), value: formData.doc_type_explain, required: true, type: 'text', name: 'doc_type_explain', conditional: true },
        ] : []),
        { label: t('usVisa.fields.doc_number.label'), value: formData.doc_number, required: true, type: 'text', name: 'doc_number', span: 'half' },
        { label: t('usVisa.fields.book_number.label'), value: formData.book_number, type: 'text', name: 'book_number', span: 'third' },
        // L2: 签发信息
        { label: t('usVisa.fields.doc_authority.label'), value: resolveOption(usCountryOptions, formData.doc_authority) || formData.doc_authority, required: true, type: 'select', name: 'doc_authority', span: 'third', groupStart: true, cardName: t('usVisa.subLabels.issuanceInfo') },
        { label: t('usVisa.fields.issued_location_city.label'), value: formData.issued_location.city, required: true, type: 'text', name: 'issued_location_city', span: 'half' },
        { label: t('usVisa.fields.issued_location_state.label'), value: formData.issued_location.state, type: 'text', name: 'issued_location_state', span: 'half' },
        { label: t('usVisa.fields.issued_location_country.label'), value: resolveOption(usCountryOptions, formData.issued_location.country) || formData.issued_location.country, required: true, type: 'select', name: 'issued_location_country', span: 'third' },
        // L2: 日期
        { label: t('usVisa.fields.issuance_date.label'), value: formatDate(formData.issuance_date), required: true, type: 'date', name: 'issuance_date', groupStart: true, cardName: t('usVisa.subLabels.passportDates') },
        ...(formData.no_expiration ? [
          { label: t('usVisa.fields.no_expiration.label'), value: boolStr(formData.no_expiration), type: 'radio', name: 'no_expiration' },
        ] : [
          { label: t('usVisa.fields.expiration_date.label'), value: formatDate(formData.expiration_date), required: true, type: 'date', name: 'expiration_date' },
        ]),
        // L2: 遗失护照
        { label: t('usVisa.fields.has_lost_passport.label'), value: resolveOption(yesNoOptions, formData.has_lost_passport), required: true, type: 'radio', name: 'has_lost_passport', groupStart: true, cardName: t('usVisa.subLabels.lostPassport') },
        ...(formData.has_lost_passport === 'yes' ? lost_passports.map((lp, i) => [
          { label: t('usVisa.fields.lost_passport_number.label'), value: lp.number, required: true, type: 'text', name: `lost_pp_${i}_number`, span: 'third' as const, groupStart: true, cardName: t('usVisa.subLabelsRepeat.lostPassport', { N: i + 1 }) },
          { label: t('usVisa.fields.lost_passport_country.label'), value: resolveOption(usCountryOptions, lp.country) || lp.country, required: true, type: 'select', name: `lost_pp_${i}_country`, span: 'third' as const },
          { label: t('usVisa.fields.lost_passport_explain.label'), value: lp.explain, required: true, type: 'text', name: `lost_pp_${i}_explain` },
        ]).flat() : []),
      ],
    },
    // 8. U.S. Contact
    {
      title: t('usVisa.sections.usContact'),
      fields: [
        { label: t('usVisa.fields.us_relationship.label'), value: resolveOption(relationshipOptions, formData.us_relationship), required: true, type: 'select', name: 'us_relationship', span: 'third' },
        ...(personalRelations.includes(formData.us_relationship) ? [
          { label: t('usVisa.fields.us_contact_surname.label'), value: formData.us_contact.surname, required: true, type: 'text', name: 'us_contact_surname', span: 'third' },
          { label: t('usVisa.fields.us_contact_given_name.label'), value: formData.us_contact.given_name, required: true, type: 'text', name: 'us_contact_given_name', span: 'third' },
        ] : []),
        ...(!personalRelations.includes(formData.us_relationship) && formData.us_relationship ? [
          { label: t('usVisa.fields.us_contact_organization.label'), value: formData.us_contact.organization, required: true, type: 'text', name: 'us_contact_organization', span: 'half' },
        ] : []),
        // L2: 美国联系人地址
        { label: t('usVisa.fields.us_contact_address_state.label'), value: resolveOption(usStatesOptions, formData.us_contact.address.state) || formData.us_contact.address.state, required: true, type: 'select', name: 'us_contact_address_state', span: 'third', groupStart: true, cardName: t('usVisa.subLabels.usContactAddress') },
        { label: t('usVisa.fields.us_contact_address_city.label'), value: formData.us_contact.address.city, required: true, type: 'text', name: 'us_contact_address_city', span: 'third' },
        { label: t('usVisa.fields.us_contact_address_street_addr1.label'), value: formData.us_contact.address.street_addr1, required: true, type: 'text', name: 'us_contact_address_street_addr1', span: 'half' },
        { label: t('usVisa.fields.us_contact_address_zip_code.label'), value: formData.us_contact.address.zip_code, required: true, type: 'text', name: 'us_contact_address_zip_code', span: 'third' },
        { label: t('usVisa.fields.us_contact_phone.label'), value: formData.us_contact.phone, required: true, type: 'text', name: 'us_contact_phone', span: 'half' },
        { label: t('usVisa.fields.us_contact_email.label'), value: formData.us_contact.email, type: 'text', name: 'us_contact_email', span: 'half' },
      ],
    },
    // 9. Family Information
    {
      title: t('usVisa.sections.family'),
      fields: [
        // L2: 父亲信息
        { label: t('usVisa.fields.father_surname.label'), value: formData.father.surname, required: true, type: 'text', name: 'father_surname', span: 'third', groupStart: true, cardName: t('usVisa.subLabels.father') },
        { label: t('usVisa.fields.father_given_name.label'), value: formData.father.given_name, required: true, type: 'text', name: 'father_given_name', span: 'third' },
        ...(formData.father.surname !== 'DNC' || formData.father.given_name !== 'DNC' ? [
          { label: t('usVisa.fields.father_date_of_birth.label'), value: formatDate(formData.father.date_of_birth), required: true, type: 'date', name: 'father_date_of_birth' as const },
          { label: t('usVisa.fields.father_in_us.label'), value: resolveOption(yesNoOptions, formData.father.in_us), required: true, type: 'radio', name: 'father_in_us' as const },
          ...(formData.father.in_us === 'yes' ? [
            { label: t('usVisa.fields.father_status.label'), value: resolveOption(familyStatusOptions, formData.father.status), required: true, type: 'select', name: 'father_status' as const, span: 'third' as const, conditional: true },
          ] : []),
        ] : []),
        // L2: 母亲信息
        { label: t('usVisa.fields.mother_surname.label'), value: formData.mother.surname, required: true, type: 'text', name: 'mother_surname', span: 'third', groupStart: true, cardName: t('usVisa.subLabels.mother') },
        { label: t('usVisa.fields.mother_given_name.label'), value: formData.mother.given_name, required: true, type: 'text', name: 'mother_given_name', span: 'third' },
        ...(formData.mother.surname !== 'DNC' || formData.mother.given_name !== 'DNC' ? [
          { label: t('usVisa.fields.mother_date_of_birth.label'), value: formatDate(formData.mother.date_of_birth), required: true, type: 'date', name: 'mother_date_of_birth' as const },
          { label: t('usVisa.fields.mother_in_us.label'), value: resolveOption(yesNoOptions, formData.mother.in_us), required: true, type: 'radio', name: 'mother_in_us' as const },
          ...(formData.mother.in_us === 'yes' ? [
            { label: t('usVisa.fields.mother_status.label'), value: resolveOption(familyStatusOptions, formData.mother.status), required: true, type: 'select', name: 'mother_status' as const, span: 'third' as const, conditional: true },
          ] : []),
        ] : []),
        // L2: 在美直系亲属
        { label: t('usVisa.fields.has_immediate_relatives.label'), value: resolveOption(yesNoOptions, formData.has_immediate_relatives), required: true, type: 'radio', name: 'has_immediate_relatives', groupStart: true, cardName: t('usVisa.subLabels.immediateRelatives') },
        ...(formData.has_immediate_relatives === 'yes' ? immediate_relatives.map((r, i) => [
          { label: t('usVisa.fields.immediate_relatives_surname.label'), value: r.surname, required: true, type: 'text', name: `rel_${i}_surname`, span: 'third' as const, groupStart: true, cardName: t('usVisa.subLabelsRepeat.relative', { N: i + 1 }) },
          { label: t('usVisa.fields.immediate_relatives_given_name.label'), value: r.given_name, type: 'text', name: `rel_${i}_given_name`, span: 'third' as const },
          { label: t('usVisa.fields.immediate_relatives_relationship.label'), value: resolveOption(immediateRelationOptions, r.relationship), required: true, type: 'select', name: `rel_${i}_relationship`, span: 'third' as const },
          { label: t('usVisa.fields.immediate_relatives_status.label'), value: resolveOption(familyStatusOptions, r.status), required: true, type: 'select', name: `rel_${i}_status`, span: 'third' as const },
        ]).flat() : []),
        // L2: 配偶/伴侣信息
        ...(formData.marital_status === 'MARRIED' || formData.marital_status === 'CIVIL_UNION' ? [
          { label: t('usVisa.fields.spouse_surname.label'), value: formData.spouse.surname, required: true, type: 'text', name: 'spouse_surname', span: 'third' as const, groupStart: true, cardName: t('usVisa.subLabels.spouse') },
          { label: t('usVisa.fields.spouse_given_name.label'), value: formData.spouse.given_name, required: true, type: 'text', name: 'spouse_given_name', span: 'third' as const },
          { label: t('usVisa.fields.spouse_date_of_birth.label'), value: formatDate(formData.spouse.date_of_birth), required: true, type: 'date', name: 'spouse_date_of_birth' },
          { label: t('usVisa.fields.spouse_nationality.label'), value: resolveOption(usCountryOptions, formData.spouse.nationality) || formData.spouse.nationality, required: true, type: 'select', name: 'spouse_nationality', span: 'third' as const },
          { label: t('usVisa.fields.spouse_birth_country.label'), value: resolveOption(usCountryOptions, formData.spouse.birth_country) || formData.spouse.birth_country, required: true, type: 'select', name: 'spouse_birth_country', span: 'third' as const },
          { label: t('usVisa.fields.spouse_birth_city.label'), value: formData.spouse.birth_city, required: true, type: 'text', name: 'spouse_birth_city', span: 'third' as const },
          { label: t('usVisa.fields.spouse_address_type.label'), value: resolveOption(spouseAddressOptions, formData.spouse.address_type), required: true, type: 'select', name: 'spouse_address_type', span: 'third' as const },
          ...(formData.spouse.address_type === 'OTHER' ? [
            { label: t('usVisa.fields.spouse_address_country.label'), value: resolveOption(usCountryOptions, formData.spouse.address.country) || formData.spouse.address.country, required: true, type: 'select', name: 'spouse_address_country' as const, span: 'third' as const, conditional: true },
            { label: t('usVisa.fields.spouse_address_state.label'), value: formData.spouse.address.state, required: true, type: 'text', name: 'spouse_address_state' as const, span: 'third' as const, conditional: true },
            { label: t('usVisa.fields.spouse_address_city.label'), value: formData.spouse.address.city, required: true, type: 'text', name: 'spouse_address_city' as const, span: 'third' as const, conditional: true },
            { label: t('usVisa.fields.spouse_address_street_addr1.label'), value: formData.spouse.address.street_addr1, required: true, type: 'text', name: 'spouse_address_street_addr1' as const, span: 'half' as const, conditional: true },
            { label: t('usVisa.fields.spouse_address_zip_code.label'), value: formData.spouse.address.zip_code, required: true, type: 'text', name: 'spouse_address_zip_code' as const, span: 'third' as const, conditional: true },
          ] : []),
        ] : []),
      ],
    },
    // 10. Present Work/Education
    {
      title: t('usVisa.sections.presentWork'),
      fields: [
        { label: t('usVisa.fields.occupation.label'), value: resolveOption(occupationOptions, formData.occupation), required: true, type: 'select', name: 'occupation', span: 'third' },
        { label: t('usVisa.fields.current_employer.label'), value: formData.current_employer, required: true, type: 'text', name: 'current_employer', span: 'third' },
        { label: t('usVisa.fields.current_address_country.label'), value: resolveOption(usCountryOptions, formData.current_address.country) || formData.current_address.country, required: true, type: 'select', name: 'current_address_country', span: 'third' },
        { label: t('usVisa.fields.current_address_state.label'), value: formData.current_address.state, required: true, type: 'text', name: 'current_address_state', span: 'third' },
        { label: t('usVisa.fields.current_address_city.label'), value: formData.current_address.city, required: true, type: 'text', name: 'current_address_city', span: 'third' },
        { label: t('usVisa.fields.current_address_street_addr1.label'), value: formData.current_address.street_addr1, required: true, type: 'text', name: 'current_address_street_addr1', span: 'half' },
        { label: t('usVisa.fields.current_address_zip_code.label'), value: formData.current_address.zip_code, required: true, type: 'text', name: 'current_address_zip_code', span: 'third' },
        { label: t('usVisa.fields.current_address_tel.label'), value: formData.current_address.tel, required: true, type: 'text', name: 'current_address_tel', span: 'third' },
        { label: t('usVisa.fields.start_date.label'), value: formatDate(formData.start_date), required: true, type: 'date', name: 'start_date' },
        { label: t('usVisa.fields.monthly_income.label'), value: formData.monthly_income, type: 'text', name: 'monthly_income', span: 'third' },
        { label: t('usVisa.fields.job_description.label'), value: formData.job_description, required: true, type: 'text', name: 'job_description' },
      ],
    },
    // 11. Previous Work/Education
    {
      title: t('usVisa.sections.previousWork'),
      fields: [
        // L2: 近5年工作记录
        { label: t('usVisa.fields.was_previously_employed.label'), value: resolveOption(yesNoOptions, formData.was_previously_employed), required: true, type: 'radio', name: 'was_previously_employed' },
        ...(formData.was_previously_employed === 'yes' ? previous_work.map((w, i) => [
          { label: t('usVisa.fields.pw_employer_name.label'), value: w.employer_name, required: true, type: 'text', name: `pw_${i}_employer_name`, span: 'half' as const, groupStart: true, cardName: t('usVisa.subLabelsRepeat.previousWork', { N: i + 1 }) },
          { label: t('usVisa.fields.pw_address_country.label'), value: resolveOption(usCountryOptions, w.address.country) || w.address.country, required: true, type: 'select', name: `pw_${i}_country`, span: 'third' as const },
          { label: t('usVisa.fields.pw_address_state.label'), value: w.address.state, type: 'text', name: `pw_${i}_state`, span: 'third' as const },
          { label: t('usVisa.fields.pw_address_city.label'), value: w.address.city, required: true, type: 'text', name: `pw_${i}_city`, span: 'third' as const },
          { label: t('usVisa.fields.pw_address_street_addr1.label'), value: w.address.street_addr1, required: true, type: 'text', name: `pw_${i}_street_addr1`, span: 'third' as const },
          { label: t('usVisa.fields.pw_address_zip_code.label'), value: w.address.zip_code, type: 'text', name: `pw_${i}_zip_code`, span: 'third' as const },
          { label: t('usVisa.fields.pw_phone.label'), value: w.phone, required: true, type: 'text', name: `pw_${i}_phone`, span: 'third' as const },
          { label: t('usVisa.fields.pw_job_title.label'), value: w.job_title, required: true, type: 'text', name: `pw_${i}_job_title`, span: 'third' as const },
          { label: t('usVisa.fields.pw_supervisor_surname.label'), value: w.supervisor_surname, type: 'text', name: `pw_${i}_sup_surname`, span: 'third' as const },
          { label: t('usVisa.fields.pw_supervisor_given_name.label'), value: w.supervisor_given_name, type: 'text', name: `pw_${i}_sup_given_name`, span: 'third' as const },
          { label: t('usVisa.fields.pw_date_from.label'), value: formatDate(w.date_from), required: true, type: 'date', name: `pw_${i}_date_from` },
          { label: t('usVisa.fields.pw_date_to.label'), value: formatDate(w.date_to), required: true, type: 'date', name: `pw_${i}_date_to` },
          { label: t('usVisa.fields.pw_job_description.label'), value: w.job_description, required: true, type: 'text', name: `pw_${i}_job_description` },
        ]).flat() : []),
        // L2: 教育经历
        { label: t('usVisa.fields.has_education.label'), value: resolveOption(yesNoOptions, formData.has_education), required: true, type: 'radio', name: 'has_education' },
        ...(formData.has_education === 'yes' ? education.map((e, i) => [
          { label: t('usVisa.fields.edu_name.label'), value: e.name, required: true, type: 'text', name: `edu_${i}_name`, span: 'half' as const, groupStart: true, cardName: t('usVisa.subLabelsRepeat.education', { N: i + 1 }) },
          { label: t('usVisa.fields.edu_address_country.label'), value: resolveOption(usCountryOptions, e.address.country) || e.address.country, required: true, type: 'select', name: `edu_${i}_country`, span: 'third' as const },
          { label: t('usVisa.fields.edu_address_state.label'), value: e.address.state, type: 'text', name: `edu_${i}_state`, span: 'half' as const },
          { label: t('usVisa.fields.edu_address_city.label'), value: e.address.city, required: true, type: 'text', name: `edu_${i}_city`, span: 'half' as const },
          { label: t('usVisa.fields.edu_address_street_addr1.label'), value: e.address.street_addr1, required: true, type: 'text', name: `edu_${i}_street_addr1` },
          { label: t('usVisa.fields.edu_address_zip_code.label'), value: e.address.zip_code, type: 'text', name: `edu_${i}_zip_code`, span: 'third' as const },
          { label: t('usVisa.fields.edu_course.label'), value: e.course, required: true, type: 'text', name: `edu_${i}_course`, span: 'half' as const },
          { label: t('usVisa.fields.edu_date_from.label'), value: formatDate(e.date_from), required: true, type: 'date', name: `edu_${i}_date_from` },
          { label: t('usVisa.fields.edu_date_to.label'), value: formatDate(e.date_to), required: true, type: 'date', name: `edu_${i}_date_to` },
        ]).flat() : []),
      ],
    },
    // 12. Additional Work/Education
    {
      title: t('usVisa.sections.additionalWork'),
      fields: [
        // L2: 语言能力
        ...languages.map((l, i) => [
          { label: t('usVisa.fields.languages_name.label'), value: l.name, required: true, type: 'text', name: `lang_${i}_name`, span: 'third' as const, ...(i === 0 ? { groupStart: true, cardName: t('usVisa.subLabels.languageList') } : {}) },
        ]).flat(),
        { label: t('usVisa.fields.has_clan.label'), value: resolveOption(yesNoOptions, formData.has_clan), required: true, type: 'radio', name: 'has_clan' },
        ...(formData.has_clan === 'yes' ? [
          { label: t('usVisa.fields.clan_name.label'), value: formData.clan_name, required: true, type: 'text', name: 'clan_name', span: 'third', conditional: true },
        ] : []),
        { label: t('usVisa.fields.has_traveled_5yr.label'), value: resolveOption(yesNoOptions, formData.has_traveled_5yr), required: true, type: 'radio', name: 'has_traveled_5yr' },
        ...(formData.has_traveled_5yr === 'yes' ? traveled_countries.map((tc, i) => [
          { label: t('usVisa.fields.traveled_countries_country.label'), value: resolveOption(usCountryOptions, tc.country) || tc.country, required: true, type: 'select', name: `tc_${i}_country`, span: 'third' as const, ...(i === 0 ? { groupStart: true, cardName: t('usVisa.fields.has_traveled_5yr.label') } : {}) },
        ]).flat() : []),
        { label: t('usVisa.fields.has_organization.label'), value: resolveOption(yesNoOptions, formData.has_organization), required: true, type: 'radio', name: 'has_organization' },
        ...(formData.has_organization === 'yes' ? organizations.map((o, i) => [
          { label: t('usVisa.fields.organizations_name.label'), value: o.name, required: true, type: 'text', name: `org_${i}_name`, span: 'third' as const, ...(i === 0 ? { groupStart: true, cardName: t('usVisa.fields.has_organization.label') } : {}) },
        ]).flat() : []),
        // L2: 军事服役
        { label: t('usVisa.fields.has_military_service.label'), value: resolveOption(yesNoOptions, formData.has_military_service), required: true, type: 'radio', name: 'has_military_service' },
        ...(formData.has_military_service === 'yes' ? military_service.map((m, i) => [
          { label: t('usVisa.fields.mil_country.label'), value: resolveOption(usCountryOptions, m.country) || m.country, required: true, type: 'select', name: `mil_${i}_country`, span: 'third' as const, groupStart: true, cardName: t('usVisa.subLabelsRepeat.military', { N: i + 1 }) },
          { label: t('usVisa.fields.mil_branch.label'), value: m.branch, required: true, type: 'text', name: `mil_${i}_branch`, span: 'third' as const },
          { label: t('usVisa.fields.mil_rank.label'), value: m.rank, required: true, type: 'text', name: `mil_${i}_rank`, span: 'third' as const },
          { label: t('usVisa.fields.mil_specialty.label'), value: m.specialty, required: true, type: 'text', name: `mil_${i}_specialty`, span: 'third' as const },
          { label: t('usVisa.fields.mil_date_from.label'), value: formatDate(m.date_from), required: true, type: 'date', name: `mil_${i}_date_from` },
          { label: t('usVisa.fields.mil_date_to.label'), value: formatDate(m.date_to), required: true, type: 'date', name: `mil_${i}_date_to` },
        ]).flat() : []),
        { label: t('usVisa.fields.has_taliban.label'), value: resolveOption(yesNoOptions, formData.has_taliban), required: true, type: 'radio', name: 'has_taliban' },
        ...(formData.has_taliban === 'yes' ? [
          { label: t('usVisa.fields.taliban_explain.label'), value: formData.taliban_explain, required: true, type: 'text', name: 'taliban_explain', conditional: true },
        ] : []),
        { label: t('usVisa.fields.has_special_skills.label'), value: resolveOption(yesNoOptions, formData.has_special_skills), required: true, type: 'radio', name: 'has_special_skills' },
        ...(formData.has_special_skills === 'yes' ? [
          { label: t('usVisa.fields.special_skills_explain.label'), value: formData.special_skills_explain, required: true, type: 'text', name: 'special_skills_explain', conditional: true },
        ] : []),
        { label: t('usVisa.fields.has_paramilitary.label'), value: resolveOption(yesNoOptions, formData.has_paramilitary), required: true, type: 'radio', name: 'has_paramilitary' },
        ...(formData.has_paramilitary === 'yes' ? [
          { label: t('usVisa.fields.paramilitary_explain.label'), value: formData.paramilitary_explain, required: true, type: 'text', name: 'paramilitary_explain', conditional: true },
        ] : []),
      ],
    },
    // 13. Security and Background
    {
      title: t('usVisa.sections.securityBackground'),
      fields: securityFields,
    },
  ] as PreviewSection[]
})

// ---- Page title ----

useHead({
  title: () => t('usVisa.title'),
})

// ---- 校验 & 导出 PDF ----

const formActionsRef = ref<InstanceType<typeof FormActions> | null>(null)

function handleExportClick() {
  const missingFields: { name: string; label: string; section: string }[] = []
  const groupErrors: { name: string; label: string; section: string }[] = []

  // 1. 校验普通必填字段
  for (const section of previewSections.value) {
    for (const field of section.fields) {
      if (field.required && !String(field.value ?? '').trim()) {
        missingFields.push({ name: (field as any).name ?? '', label: field.label, section: section.title })
      }
    }
  }

  // 2. 校验可重复组（选"是"后至少添加 1 条）
  const repeatableChecks = [
    { condition: formData.has_travel_companions === 'yes' && formData.is_group_travel !== 'yes', items: companions, flagField: 'has_travel_companions', label: t('usVisa.addRow') + ' - ' + t('usVisa.subLabelsRepeat.companion'), section: t('usVisa.sections.travelCompanions') },
    { condition: formData.has_been_in_us === 'yes', items: us_visits, flagField: 'has_been_in_us', label: t('usVisa.addRow') + ' - ' + t('usVisa.subLabelsRepeat.usVisit', { N: 1 }), section: t('usVisa.sections.previousUSTravel') },
    { condition: formData.has_lost_passport === 'yes', items: lost_passports, flagField: 'has_lost_passport', label: t('usVisa.addRow') + ' - ' + t('usVisa.subLabels.lostPassport'), section: t('usVisa.sections.passport') },
    { condition: formData.has_immediate_relatives === 'yes', items: immediate_relatives, flagField: 'has_immediate_relatives', label: t('usVisa.addRow') + ' - ' + t('usVisa.subLabels.immediateRelatives'), section: t('usVisa.sections.family') },
    { condition: formData.was_previously_employed === 'yes', items: previous_work, flagField: 'was_previously_employed', label: t('usVisa.addRow') + ' - ' + t('usVisa.subLabelsRepeat.previousWork', { N: 1 }), section: t('usVisa.sections.previousWork') },
    { condition: formData.has_education === 'yes', items: education, flagField: 'has_education', label: t('usVisa.addRow') + ' - ' + t('usVisa.subLabelsRepeat.education', { N: 1 }), section: t('usVisa.sections.previousWork') },
    { condition: formData.has_traveled_5yr === 'yes', items: traveled_countries, flagField: 'has_traveled_5yr', label: t('usVisa.addRow') + ' - ' + t('usVisa.fields.has_traveled_5yr.label'), section: t('usVisa.sections.additionalWork') },
    { condition: formData.has_organization === 'yes', items: organizations, flagField: 'has_organization', label: t('usVisa.addRow') + ' - ' + t('usVisa.fields.has_organization.label'), section: t('usVisa.sections.additionalWork') },
    { condition: formData.has_military_service === 'yes', items: military_service, flagField: 'has_military_service', label: t('usVisa.addRow') + ' - ' + t('usVisa.subLabels.militaryService'), section: t('usVisa.sections.additionalWork') },
  ]
  for (const check of repeatableChecks) {
    if (check.condition && check.items.length === 0) {
      groupErrors.push({ name: check.flagField, label: check.label, section: check.section })
    }
  }

  const allErrors = [...missingFields, ...groupErrors]

  if (allErrors.length > 0) {
    const firstError = allErrors[0]
    const sectionMap: Record<string, string> = {
      [t('usVisa.sections.personal1')]: 'personal1',
      [t('usVisa.sections.personal2')]: 'personal2',
      [t('usVisa.sections.travel')]: 'travel',
      [t('usVisa.sections.travelCompanions')]: 'travelCompanions',
      [t('usVisa.sections.previousUSTravel')]: 'previousUSTravel',
      [t('usVisa.sections.addressPhone')]: 'addressPhone',
      [t('usVisa.sections.passport')]: 'passport',
      [t('usVisa.sections.usContact')]: 'usContact',
      [t('usVisa.sections.family')]: 'family',
      [t('usVisa.sections.presentWork')]: 'presentWork',
      [t('usVisa.sections.previousWork')]: 'previousWork',
      [t('usVisa.sections.additionalWork')]: 'additionalWork',
      [t('usVisa.sections.securityBackground')]: 'securityBackground',
    }
    const stepKey = sectionMap[firstError.section]
    if (stepKey) {
      const idx = steps.findIndex(s => s.key === stepKey)
      if (idx >= 0 && idx !== currentStep.value) {
        completedSteps.add(currentStep.value)
        currentStep.value = idx
      }
      // 触发该步骤的红边校验
      nextTick(() => { validateStep(idx); triggerShake() })
    }
    nextTick(() => {
      setTimeout(() => {
        const el = document.querySelector(`[name="${firstError.name}"]`) as HTMLElement
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
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
</script>

<template>
  <div class="form-page">
    <div class="form-container">
      <!-- 标题区域 + 操作栏（sticky） -->
      <div class="sticky-header-wrapper">
        <FormActions
          ref="formActionsRef"
          :sections="previewSections"
          :form-title="t('usVisa.title')"
          :form-subtitle="t('usVisa.subtitle')"
          :build-pdf-title="buildPdfTitle"
          :build-pdf-filename="buildPdfFilename"
          i18n-prefix="usVisa"
          @fill="fillMockData"
          @clear="clearForm"
          @export="handleExportClick"
        >
          <template #flag>
            <span class="fi fi-us flag-icon" />
          </template>
        </FormActions>
      </div>

      <!-- 向导布局 -->
      <div class="wizard-layout">
        <!-- 左侧导航 -->
        <nav class="wizard-nav">
          <ul>
            <li
              v-for="(step, index) in steps"
              :key="step.key"
              :class="[
                'wizard-step-item',
                { active: index === currentStep },
                { completed: completedSteps.has(index) && index !== currentStep },
              ]"
              @click="goToStep(index)"
            >
              <span class="step-indicator">
                <Check v-if="completedSteps.has(index) && index !== currentStep" :size="14" />
                <span v-else class="step-number">{{ index + 1 }}</span>
              </span>
              <span class="step-label">{{ t(step.labelKey) }}</span>
            </li>
          </ul>
        </nav>

        <!-- 右侧内容 -->
        <div class="wizard-content">
          <div class="step-header">
            <h2 class="step-title">{{ t(steps[currentStep].labelKey) }}</h2>
            <span class="step-counter">{{ currentStep + 1 }} / {{ steps.length }}</span>
          </div>

          <div class="step-body">
            <component :is="steps[currentStep].component" />
          </div>

          <!-- 底部导航 -->
          <div class="step-nav">
            <button
              v-if="currentStep > 0"
              class="nav-btn nav-btn-back"
              @click="goToBack"
            >
              {{ t('usVisa.buttons.back') }}
            </button>
            <span v-else />
            <button
              v-if="currentStep < steps.length - 1"
              class="nav-btn nav-btn-next"
              :class="{ 'nav-shake': shakeNav }"
              @click="goToNext"
            >
              {{ t('usVisa.buttons.next') }}
              <ChevronRight :size="16" />
            </button>
          </div>
          <Transition name="fade">
            <p v-if="showValidationMsg" class="validation-hint">
              {{ t('usVisa.buttons.validation_failed') }}
            </p>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 向导布局 */
.wizard-layout {
  display: flex;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

/* 左侧导航 */
.wizard-nav {
  width: 240px;
  flex-shrink: 0;
  position: sticky;
  top: 1rem;
  align-self: flex-start;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
}

.wizard-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wizard-step-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
  font-size: 0.875rem;
  color: var(--muted-foreground, #6b7280);
  user-select: none;
}

.wizard-step-item:hover {
  background-color: hsl(var(--accent, 240 4.8% 95.9%));
}

.wizard-step-item.active {
  background-color: hsl(var(--primary, 222.2 47.4% 11.2%));
  color: hsl(var(--primary-foreground, 210 40% 98%));
  font-weight: 600;
}

.wizard-step-item.completed {
  color: hsl(var(--foreground, 222.2 84% 4.9%));
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 600;
}

.wizard-step-item.active .step-indicator {
  background-color: rgba(255, 255, 255, 0.2);
}

.wizard-step-item.completed .step-indicator {
  background-color: hsl(var(--primary, 222.2 47.4% 11.2%));
  color: hsl(var(--primary-foreground, 210 40% 98%));
}

.step-number {
  font-size: 0.75rem;
}

.step-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 右侧内容 */
.wizard-content {
  flex: 1;
  min-width: 0;
}

.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.step-counter {
  font-size: 0.875rem;
  color: var(--muted-foreground, #6b7280);
}

.step-body {
  min-height: 200px;
}

/* 底部导航 */
.step-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid hsl(var(--border, 214.3 31.8% 91.4%));
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: opacity 0.2s;
  border: none;
}

.nav-btn-back {
  background-color: hsl(var(--secondary, 210 40% 96.1%));
  color: hsl(var(--secondary-foreground, 222.2 47.4% 11.2%));
}

.nav-btn-back:hover {
  background-color: hsl(var(--accent, 240 4.8% 95.9%));
}

.nav-btn-next {
  background-color: hsl(var(--primary, 222.2 47.4% 11.2%));
  color: hsl(var(--primary-foreground, 210 40% 98%));
}

.nav-btn-next:hover {
  opacity: 0.9;
}

@keyframes nav-shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}
.nav-shake {
  animation: nav-shake 0.4s ease-in-out;
  background-color: hsl(var(--destructive, 0 84.2% 60.2%)) !important;
}

.validation-hint {
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: hsl(var(--destructive, 0 84.2% 60.2%));
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 国旗图标样式 */
.flag-icon {
  width: 56px;
  height: 28px;
  border-radius: 2px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

/* 响应式：< 768px 切换为顶部水平导航 */
@media (max-width: 767px) {
  .wizard-layout {
    flex-direction: column;
    gap: 1rem;
  }

  .wizard-nav {
    width: 100%;
    position: static;
    max-height: none;
    overflow-x: auto;
    overflow-y: hidden;
    border-bottom: 1px solid hsl(var(--border, 214.3 31.8% 91.4%));
    padding-bottom: 0.5rem;
  }

  .wizard-nav ul {
    flex-direction: row;
    gap: 0.5rem;
  }

  .wizard-step-item {
    white-space: nowrap;
    padding: 0.375rem 0.625rem;
    font-size: 0.8125rem;
    border-radius: 9999px;
  }

  .step-title {
    font-size: 1.25rem;
  }

  .flag-icon {
    width: 40px;
    height: 20px;
  }

  .step-nav {
    position: sticky;
    bottom: 0;
    background: hsl(var(--background, 0 0% 100%));
    padding: 1rem 0;
    margin-top: 1.5rem;
  }
}
</style>
