/**
 * Mock US visa (DS-160) form data — dev-mode one-click fill
 *
 * ALL fields filled (no empty strings).
 * ALL yes/no conditionals set to 'yes' to expose maximum fields.
 * ALL repeatable groups have ≥2 entries.
 * ALL address_type / type selectors set to values that trigger derived fields.
 * Field IDs match USVisaFormData (snake_case, v2).
 * Arrays use '_arrays.' prefix → populated into usVisaArrays reactive refs.
 */

import type { USVisaFormData } from '@/views/USVisaForm.vue'

// ponytail: generate 32 security answers — every 5th is 'yes' with explanation to test derived fields
const securityAnswers: Record<number, { answer: string; explain: string }> = {}
for (let i = 1; i <= 32; i++) {
  if (i % 5 === 0) {
    securityAnswers[i] = { answer: 'yes', explain: `Explanation for question ${i}: this is a test scenario.` }
  } else {
    securityAnswers[i] = { answer: 'no', explain: '' }
  }
}

export const mockUSFormData: USVisaFormData = {
  // ---- Step 1: Personal 1 ----
  surname: 'Wang',
  given_name: 'Xiaoming',
  native_name: '王小明',
  native_name_not_applicable: false,
  has_other_names: 'yes',
  other_surname: 'Li',
  other_given_name: 'Xiaoming',
  has_telecode: 'yes',
  telecode_surname: '1234',
  telecode_given_name: '5678',
  sex: 'M',
  marital_status: 'MARRIED',
  marital_status_explain: '',
  date_of_birth: '1990-01-15',
  birth_city: 'Beijing',
  birth_state: 'Beijing',
  birth_country: 'CN',

  // ---- Step 2: Personal 2 ----
  nationality: 'CN',
  has_other_nationality: 'yes',           // was 'no' → triggers other_nationality
  other_nationality: 'US',
  has_other_nationality_passport: 'yes',  // was 'no' → triggers other_nationality_passport_no
  other_nationality_passport_no: '534892710',
  is_permanent_resident: 'yes',           // was 'no' → triggers permanent_resident_country
  permanent_resident_country: 'CA',
  national_id_number: '110101199001150011',
  social_security_number: '078-05-1120',
  tax_id_number: '91-1234567',

  // ---- Step 3: Travel ----
  purpose_of_trip: 'B',
  visa_category: 'B1-B2',
  arrival_date: '2027-06-15',
  length_of_stay: '15',
  length_of_stay_period: 'D',
  us_address: {
    state: 'NY',
    city: 'New York',
    street_addr1: '123 Main Street',
    zip_code: '10001',
  },
  paying_person_type: 'O',                // 'O'=个人 → 显示 paying_person；'C'=组织 → 显示 paying_org（互斥）
  paying_person: {
    surname: 'Li',
    given_name: 'Dawei',
    tel: '13700137000',
    email: 'li.dawei@example.com',
    relationship: 'P',                      // C=子女 P=父母 S=配偶 R=其他亲属 F=朋友 O=其他
    address_same: 'no',
    address: { country: 'CN', state: 'Beijing', city: 'Beijing', street_addr1: 'No. 5 Haidian Road', zip_code: '100080' },
  },
  paying_org: {
    name: 'Beijing Tech Solutions Co., Ltd.',
    tel: '01088886666',
    relationship: 'EMPLOYER',
    address: { country: 'CN', state: 'Beijing', city: 'Beijing', street_addr1: 'No. 88 Science Park Road', zip_code: '100080' },
  },

  // ---- Step 4: Travel Companions ----
  has_travel_companions: 'yes',
  is_group_travel: 'yes',                 // was 'no' → triggers group_name
  group_name: 'Beijing Tech Travel Group',

  // ---- Step 5: Previous U.S. Travel ----
  has_been_in_us: 'yes',
  has_us_drivers_license: 'yes',          // was 'no' → triggers drivers_license fields
  drivers_license_number: 'D1234567890123',
  drivers_license_state: 'CA',
  has_us_visa: 'yes',
  last_visa_date: '2020-03-15',
  last_visa_number: 'R12345678',
  applying_same_type: 'yes',
  applying_same_country: 'yes',
  has_been_ten_printed: 'yes',
  visa_lost_or_stolen: 'yes',             // was 'no' → triggers lost_passports array
  visa_cancelled: 'yes',                  // was 'no'
  has_been_refused: 'yes',                // was 'no' → triggers refusal_explain
  refusal_explain: 'Previous B2 application refused in 2018 due to insufficient ties to home country.',
  has_esta_refused: 'yes',                // was 'no' → triggers esta_refusal_explain
  esta_refusal_explain: 'ESTA application denied in 2019 under VWP eligibility review.',
  has_immigrant_petition: 'yes',          // was 'no' → triggers immigrant_petition_explain
  immigrant_petition_explain: 'I-140 petition filed by employer in 2022, currently pending.',

  // ---- Step 6: Address & Phone ----
  home_addr: {
    country: 'CN',
    state: 'Beijing',
    city: 'Beijing',
    street_addr1: 'Room 101, Building 2, Chaoyang District',
    zip_code: '100020',
  },
  phone_primary: '13800138000',
  phone_secondary: '01012345678',
  phone_work: '01087654321',
  email: 'wang.xiaoming@example.com',
  email_confirm: 'wang.xiaoming@example.com',
  has_other_phones: 'yes',
  has_other_emails: 'yes',
  mailing_different: true,
  mailing_addr: {
    country: 'CN',
    state: 'Beijing',
    city: 'Beijing',
    street_addr1: 'P.O. Box 1234',
    zip_code: '100020',
  },
  has_other_social_media: 'yes',          // was 'no' → triggers other_social array

  // ---- Step 7: Passport ----
  doc_type: 'OTHER',                      // was 'REGULAR' → triggers doc_type_explain
  doc_type_explain: 'Previously held official passport, now using regular passport.',
  doc_number: 'E12345678',
  book_number: '1234567890',
  doc_authority: 'CN',
  issued_location: { city: 'Beijing', state: 'Beijing', country: 'CN' },
  issuance_date: '2020-03-10',
  expiration_date: '2030-03-09',
  no_expiration: false,
  has_lost_passport: 'yes',               // was 'no' → triggers lost_passports array

  // ---- Step 8: U.S. Contact ----
  us_relationship: 'FRIEND',
  us_contact: {
    surname: 'Smith',
    given_name: 'John',
    organization: 'Global Tech Inc.',     // was empty
    address: {
      state: 'CA',
      city: 'Los Angeles',
      street_addr1: '456 Oak Avenue',
      zip_code: '90001',
    },
    phone: '+12135551234',
    email: 'john.smith@example.com',
  },

  // ---- Step 9: Family ----
  father: {
    surname: 'Wang',
    given_name: 'Guoqiang',
    date_of_birth: '1960-05-20',
    in_us: 'yes',
    status: 'LPR',
  },
  mother: {
    surname: 'Li',
    given_name: 'Xiuying',
    date_of_birth: '1962-09-08',
    in_us: 'yes',
    status: 'US_CITIZEN',
  },
  has_immediate_relatives: 'yes',
  spouse: {
    surname: 'Li',                        // was empty — marital_status=MARRIED triggers spouse
    given_name: 'Xiaohong',
    date_of_birth: '1991-06-20',
    nationality: 'CN',
    birth_city: 'Shanghai',
    birth_country: 'CN',
    address_type: 'OTHER',                // triggers spouse.address fields
    address: { country: 'CN', state: 'Shanghai', city: 'Shanghai', street_addr1: 'No. 100 Nanjing Road', zip_code: '200001' },
  },

  // ---- Step 10: Present Work/Education ----
  occupation: 'COMPUTER_SCIENCE',
  current_employer: 'Beijing Tech Solutions Co., Ltd.',
  current_address: {
    country: 'CN',
    state: 'Beijing',
    city: 'Beijing',
    street_addr1: 'No. 88 Science Park Road',
    zip_code: '100080',
    tel: '01012345678',
  },
  start_date: '2015-07-01',
  monthly_income: '25000',
  job_description: 'Software development, system architecture design, team management',

  // ---- Step 11: Previous Work/Education ----
  was_previously_employed: 'yes',         // was 'no' → triggers previous_work array
  has_education: 'yes',

  // ---- Step 12: Additional Work/Education ----
  has_clan: 'yes',                        // was 'no' → triggers clan_name
  clan_name: 'Wang Clan Association of Fujian',
  has_traveled_5yr: 'yes',
  has_organization: 'yes',
  has_military_service: 'yes',            // was 'no' → triggers military_service array
  has_taliban: 'yes',                     // was 'no' → triggers taliban_explain
  taliban_explain: 'No affiliation with Taliban. Visited Pakistan for tourism in 2018 near border region.',
  has_special_skills: 'yes',              // was 'no' → triggers special_skills_explain
  special_skills_explain: 'Proficient in cybersecurity, penetration testing, and cryptographic systems.',
  has_paramilitary: 'yes',                // was 'no' → triggers paramilitary_explain
  paramilitary_explain: 'No paramilitary affiliation. Completed university reserve officer training.',

  // ---- Step 13: Security and Background ----
  securityAnswers,
}

// ---- Repeatable arrays (prefix '_arrays.' → consumed by fillMockData) ----
// ALL arrays have ≥2 entries

export const _arrays = {
  companions: [
    { surname: 'Li', given_name: 'Xiaohong', relationship: 'SPOUSE' },
    { surname: 'Zhang', given_name: 'Wei', relationship: 'FRIEND' },
  ],
  us_visits: [
    { arrival_date: '2020-03-01', length_of_stay: '14', stay_period: 'D' },
    { arrival_date: '2018-07-15', length_of_stay: '21', stay_period: 'D' },
  ],
  other_phones: [
    { number: '13900139000' },
    { number: '02112345678' },
  ],
  other_emails: [
    { email: 'wxm_work@example.com' },
    { email: 'wangxiaoming_personal@gmail.com' },
  ],
  social_media: [
    { platform: 'SINA_WEIBO', username: 'wxm_xiaoming' },
    { platform: 'DOUBAN', username: 'xiaoming_tech' },
  ],
  other_social: [
    { platform: 'LINKEDIN', username: 'xiaoming-wang-tech' },
    { platform: 'YOUTUBE', username: 'wxm-dev' },
  ],
  lost_passports: [
    { number: 'G88776655', country: 'CN', explain: 'Lost passport during trip to Japan in 2017. Reported to local police and reissued.' },
    { number: 'E99887766', country: 'CN', explain: 'Passport expired and replaced in 2020 during routine renewal.' },
  ],
  immediate_relatives: [
    { surname: 'Wang', given_name: 'Xiaohong', relationship: 'SIBLING', status: 'US_CITIZEN' },
    { surname: 'Li', given_name: 'Meiling', relationship: 'SPOUSE', status: 'LPR' },
  ],
  previous_work: [
    {
      employer_name: 'Shanghai Data Systems Inc.',
      address: { country: 'CN', state: 'Shanghai', city: 'Shanghai', street_addr1: 'No. 200 Pudong Avenue', zip_code: '200120' },
      phone: '02112345678',
      job_title: 'Senior Software Engineer',
      supervisor_surname: 'Chen',
      supervisor_given_name: 'Ming',
      date_from: '2012-07-01',
      date_to: '2015-06-30',
      job_description: 'Backend development using Java and Spring Boot, database optimization, API design.',
    },
    {
      employer_name: 'Beijing Cloud Network Technology Co.',
      address: { country: 'CN', state: 'Beijing', city: 'Beijing', street_addr1: 'No. 55 Zhongguancun Street', zip_code: '100080' },
      phone: '01087654321',
      job_title: 'Software Developer',
      supervisor_surname: 'Liu',
      supervisor_given_name: 'Yang',
      date_from: '2010-03-01',
      date_to: '2012-06-30',
      job_description: 'Frontend development with React and TypeScript, UI component library maintenance.',
    },
  ],
  education: [
    {
      name: 'Tsinghua University',
      address: { country: 'CN', state: 'Beijing', city: 'Beijing', street_addr1: 'Shuangqing Road 30', zip_code: '100084' },
      course: 'Master of Science in Computer Science',
      date_from: '2012-09-01',
      date_to: '2015-06-30',
    },
    {
      name: 'Beihang University',
      address: { country: 'CN', state: 'Beijing', city: 'Beijing', street_addr1: 'Xueyuan Road 37', zip_code: '100191' },
      course: 'Bachelor of Engineering in Software Engineering',
      date_from: '2008-09-01',
      date_to: '2012-06-30',
    },
  ],
  languages: [
    { name: 'Chinese' },
    { name: 'English' },
  ],
  traveled_countries: [
    { country: 'JP' },
    { country: 'KR' },
  ],
  organizations: [
    { name: 'Red Cross Society of China' },
    { name: 'China Computer Federation' },
  ],
  military_service: [
    {
      country: 'CN',
      branch: 'PLA Reserve Force',
      rank: 'Corporal',
      specialty: 'Communications',
      date_from: '2007-09-01',
      date_to: '2009-08-31',
    },
    {
      country: 'CN',
      branch: 'University Reserve Officer Training',
      rank: 'Cadet',
      specialty: 'Information Technology',
      date_from: '2011-09-01',
      date_to: '2012-06-30',
    },
  ],
}
