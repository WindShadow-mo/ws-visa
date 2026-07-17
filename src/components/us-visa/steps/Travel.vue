<script setup lang="ts">
// Travel — DS-160 Step 3: 旅行信息
// v2: 旅行目的、行程计划、美国住宿地址、费用支付三分支
// 字段 ID 对齐 docs/us-visa-ds160-form-design-v2.md §3

import { inject, computed } from 'vue'
import type { USVisaFormData } from '@/views/USVisaForm.vue'
import TextField from '@/components/fields/TextField.vue'
import SelectField from '@/components/fields/SelectField.vue'
import DateField from '@/components/fields/DateField.vue'
import NationalityField from '@/components/fields/NationalityField.vue'
import RadioField from '@/components/fields/RadioField.vue'
import type { SelectOption } from '@/components/fields/SelectField.vue'
import type { RadioOption } from '@/components/fields/RadioField.vue'
import {
  purposeOfTripOptions,
  usStatesOptions,
  payerTypeOptions,
  payerRelationOptions,
  usCountryOptions,
} from '@/config/usCountryOptions'

const formData = inject<USVisaFormData>('usVisaFormData')!

// ---- 选项 ----

const yesNoOptions: RadioOption[] = [
  { value: 'yes', labelKey: 'usVisa.options.yesNo.yes' },
  { value: 'no', labelKey: 'usVisa.options.yesNo.no' },
]

// ---- visa_category 动态选项（按目的过滤） ----

const visaCategoryMap: Record<string, SelectOption[]> = {
  'B': [
    { value: 'B1-B2', labelKey: 'usVisa.options.visaCategory.B1B2' },
    { value: 'B1-CF', labelKey: 'usVisa.options.visaCategory.B1CF' },
    { value: 'B2-TM', labelKey: 'usVisa.options.visaCategory.B2TM' },
  ],
  'C': [
    { value: 'C1-D', labelKey: 'usVisa.options.visaCategory.C1D' },
    { value: 'C1-TR', labelKey: 'usVisa.options.visaCategory.C1TR' },
    { value: 'C2-UN', labelKey: 'usVisa.options.visaCategory.C2UN' },
  ],
  'D': [
    { value: 'C1-D', labelKey: 'usVisa.options.visaCategory.C1D' },
    { value: 'C1-TR', labelKey: 'usVisa.options.visaCategory.C1TR' },
    { value: 'C2-UN', labelKey: 'usVisa.options.visaCategory.C2UN' },
  ],
  'F': [
    { value: 'F1', labelKey: 'usVisa.options.visaCategory.F1' },
    { value: 'F2-CH', labelKey: 'usVisa.options.visaCategory.F2CH' },
    { value: 'F2-SP', labelKey: 'usVisa.options.visaCategory.F2SP' },
  ],
  'H': [
    { value: 'H1B', labelKey: 'usVisa.options.visaCategory.H1B' },
    { value: 'H1B1-CHL', labelKey: 'usVisa.options.visaCategory.H1B1CHL' },
    { value: 'H1B1-SGP', labelKey: 'usVisa.options.visaCategory.H1B1SGP' },
    { value: 'H1C', labelKey: 'usVisa.options.visaCategory.H1C' },
    { value: 'H2A', labelKey: 'usVisa.options.visaCategory.H2A' },
    { value: 'H2B', labelKey: 'usVisa.options.visaCategory.H2B' },
    { value: 'H3-TR', labelKey: 'usVisa.options.visaCategory.H3TR' },
  ],
  'I': [
    { value: 'I-FR', labelKey: 'usVisa.options.visaCategory.IFR' },
    { value: 'I-CH', labelKey: 'usVisa.options.visaCategory.ICH' },
    { value: 'I-SP', labelKey: 'usVisa.options.visaCategory.ISP' },
  ],
  'J': [
    { value: 'J1', labelKey: 'usVisa.options.visaCategory.J1' },
    { value: 'J2-CH', labelKey: 'usVisa.options.visaCategory.J2CH' },
    { value: 'J2-SP', labelKey: 'usVisa.options.visaCategory.J2SP' },
  ],
  'L': [
    { value: 'L1', labelKey: 'usVisa.options.visaCategory.L1' },
    { value: 'L2-CH', labelKey: 'usVisa.options.visaCategory.L2CH' },
    { value: 'L2-SP', labelKey: 'usVisa.options.visaCategory.L2SP' },
  ],
  'M': [
    { value: 'M1', labelKey: 'usVisa.options.visaCategory.M1' },
    { value: 'M2-CH', labelKey: 'usVisa.options.visaCategory.M2CH' },
    { value: 'M2-SP', labelKey: 'usVisa.options.visaCategory.M2SP' },
  ],
}

const visaCategoryOptions = computed(() =>
  visaCategoryMap[formData.purpose_of_trip] ?? [],
)

const showUsAddress = computed(() => formData.length_of_stay_period !== 'H')
const showPayingPerson = computed(() => formData.paying_person_type === 'O')
const showPayingOrg = computed(() => formData.paying_person_type === 'C')
const showPayingPersonAddress = computed(() =>
  formData.paying_person_type === 'O' && formData.paying_person.address_same === 'no',
)
</script>

<template>
  <div class="fields-grid">
    <!-- L2: 旅行目的 -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.travelPurpose') }}</h4>
    <SelectField
      name="purpose_of_trip"
      label-key="usVisa.fields.purpose_of_trip.label"
      :options="purposeOfTripOptions"
      :model-value="formData.purpose_of_trip"
      @update:model-value="formData.purpose_of_trip = $event"
      :required="true"
      span="third"
    />
    <SelectField
      v-if="formData.purpose_of_trip"
      name="visa_category"
      label-key="usVisa.fields.visa_category.label"
      :options="visaCategoryOptions"
      :model-value="formData.visa_category"
      @update:model-value="formData.visa_category = $event"
      :required="true"
      span="third"
    />

    <!-- L2: 行程计划 -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.travelPlan') }}</h4>
    <DateField
      name="arrival_date"
      label-key="usVisa.fields.arrival_date.label"
      :model-value="formData.arrival_date"
      @update:model-value="formData.arrival_date = $event"
      :required="true"
      span="third"
    />
    <TextField
      name="length_of_stay"
      label-key="usVisa.fields.length_of_stay.label"
      :model-value="formData.length_of_stay"
      @update:model-value="formData.length_of_stay = $event"
      :required="true"
      inputmode="numeric"
      constraint="numeric"
      :max-length="3"
      span="third"
    />
    <SelectField
      name="length_of_stay_period"
      label-key="usVisa.fields.length_of_stay_period.label"
      :options="[
        { value: 'Y', labelKey: 'usVisa.options.period.Y' },
        { value: 'M', labelKey: 'usVisa.options.period.M' },
        { value: 'W', labelKey: 'usVisa.options.period.W' },
        { value: 'D', labelKey: 'usVisa.options.period.D' },
        { value: 'H', labelKey: 'usVisa.options.period.H' },
      ]"
      :model-value="formData.length_of_stay_period"
      @update:model-value="formData.length_of_stay_period = $event"
      :required="true"
      span="third"
    />

    <!-- L2: 美国住宿地址（少于24小时时隐藏） -->
    <template v-if="showUsAddress">
    <h4 class="sub-label">{{ $t('usVisa.subLabels.usAddress') }}</h4>
    <SelectField
      name="us_address_state"
      label-key="usVisa.fields.us_address_state.label"
      :options="usStatesOptions"
      :model-value="formData.us_address.state"
      @update:model-value="formData.us_address.state = $event"
      :required="true"
      span="third"
    />
    <TextField
      name="us_address_city"
      label-key="usVisa.fields.us_address_city.label"
      :model-value="formData.us_address.city"
      @update:model-value="formData.us_address.city = $event"
      :required="true"
      span="third"
    />
    <TextField
      name="us_address_street_addr1"
      label-key="usVisa.fields.us_address_street_addr1.label"
      :model-value="formData.us_address.street_addr1"
      @update:model-value="formData.us_address.street_addr1 = $event"
      :required="true"
      span="half"
    />
    <TextField
      name="us_address_zip_code"
      label-key="usVisa.fields.us_address_zip_code.label"
      :model-value="formData.us_address.zip_code"
      @update:model-value="formData.us_address.zip_code = $event"
      span="third"
    />
    </template>

    <!-- L2: 费用支付 -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.payer') }}</h4>
    <SelectField
      name="paying_person_type"
      label-key="usVisa.fields.paying_person_type.label"
      :options="payerTypeOptions"
      :model-value="formData.paying_person_type"
      @update:model-value="formData.paying_person_type = $event"
      :required="true"
      span="third"
    />

    <!-- =O 他人 -->
    <template v-if="showPayingPerson">
      <div class="conditional-group">
        <TextField
          name="paying_person_surname"
          label-key="usVisa.fields.paying_person_surname.label"
          :model-value="formData.paying_person.surname"
          @update:model-value="formData.paying_person.surname = $event"
          :required="true"
          span="third"
        />
        <TextField
          name="paying_person_given_name"
          label-key="usVisa.fields.paying_person_given_name.label"
          :model-value="formData.paying_person.given_name"
          @update:model-value="formData.paying_person.given_name = $event"
          :required="true"
          span="third"
        />
        <TextField
          name="paying_person_tel"
          label-key="usVisa.fields.paying_person_tel.label"
          :model-value="formData.paying_person.tel"
          @update:model-value="formData.paying_person.tel = $event"
          :required="true"
          span="third"
        />
        <TextField
          name="paying_person_email"
          label-key="usVisa.fields.paying_person_email.label"
          :model-value="formData.paying_person.email"
          @update:model-value="formData.paying_person.email = $event"
          span="third"
        />
        <SelectField
          name="paying_person_relationship"
          label-key="usVisa.fields.paying_person_relationship.label"
          :options="payerRelationOptions"
          :model-value="formData.paying_person.relationship"
          @update:model-value="formData.paying_person.relationship = $event"
          :required="true"
          span="third"
        />
      </div>
      <!-- address_same 提升到 L2（青色框外），避免循环依赖 -->
      <RadioField
        name="paying_person_address_same"
        label-key="usVisa.fields.paying_person_address_same.label"
        :options="yesNoOptions"
        :model-value="formData.paying_person.address_same"
        @update:model-value="formData.paying_person.address_same = $event"
        :required="true"
      />
    </template>

    <!-- =O 且 address_same=no → 支付人地址 -->
    <template v-if="showPayingPersonAddress">
      <div class="conditional-group">
        <NationalityField
          name="paying_person_address_country"
          label-key="usVisa.fields.paying_person_address_country.label"
          :options="usCountryOptions"
          :model-value="formData.paying_person.address.country"
          @update:model-value="formData.paying_person.address.country = $event"
          :required="true"
          span="third"
        />
        <TextField
          name="paying_person_address_state"
          label-key="usVisa.fields.paying_person_address_state.label"
          :model-value="formData.paying_person.address.state"
          @update:model-value="formData.paying_person.address.state = $event"
          :required="true"
          span="third"
        />
        <TextField
          name="paying_person_address_city"
          label-key="usVisa.fields.paying_person_address_city.label"
          :model-value="formData.paying_person.address.city"
          @update:model-value="formData.paying_person.address.city = $event"
          :required="true"
          span="third"
        />
        <TextField
          name="paying_person_address_street_addr1"
          label-key="usVisa.fields.paying_person_address_street_addr1.label"
          :model-value="formData.paying_person.address.street_addr1"
          @update:model-value="formData.paying_person.address.street_addr1 = $event"
          :required="true"
          span="third"
        />
        <TextField
          name="paying_person_address_zip_code"
          label-key="usVisa.fields.paying_person_address_zip_code.label"
          :model-value="formData.paying_person.address.zip_code"
          @update:model-value="formData.paying_person.address.zip_code = $event"
          :required="true"
          span="third"
        />
      </div>
    </template>

    <!-- =C 公司/组织 -->
    <template v-if="showPayingOrg">
      <div class="conditional-group">
        <TextField
          name="paying_org_name"
          label-key="usVisa.fields.paying_org_name.label"
          :model-value="formData.paying_org.name"
          @update:model-value="formData.paying_org.name = $event"
          :required="true"
          span="third"
        />
        <TextField
          name="paying_org_tel"
          label-key="usVisa.fields.paying_org_tel.label"
          :model-value="formData.paying_org.tel"
          @update:model-value="formData.paying_org.tel = $event"
          :required="true"
          span="third"
        />
        <TextField
          name="paying_org_relationship"
          label-key="usVisa.fields.paying_org_relationship.label"
          :model-value="formData.paying_org.relationship"
          @update:model-value="formData.paying_org.relationship = $event"
          :required="true"
          span="third"
        />
        <NationalityField
          name="paying_org_address_country"
          label-key="usVisa.fields.paying_org_address_country.label"
          :options="usCountryOptions"
          :model-value="formData.paying_org.address.country"
          @update:model-value="formData.paying_org.address.country = $event"
          :required="true"
          span="third"
        />
        <TextField
          name="paying_org_address_state"
          label-key="usVisa.fields.paying_org_address_state.label"
          :model-value="formData.paying_org.address.state"
          @update:model-value="formData.paying_org.address.state = $event"
          :required="true"
          span="third"
        />
        <TextField
          name="paying_org_address_city"
          label-key="usVisa.fields.paying_org_address_city.label"
          :model-value="formData.paying_org.address.city"
          @update:model-value="formData.paying_org.address.city = $event"
          :required="true"
          span="third"
        />
        <TextField
          name="paying_org_address_street_addr1"
          label-key="usVisa.fields.paying_org_address_street_addr1.label"
          :model-value="formData.paying_org.address.street_addr1"
          @update:model-value="formData.paying_org.address.street_addr1 = $event"
          :required="true"
          span="third"
        />
        <TextField
          name="paying_org_address_zip_code"
          label-key="usVisa.fields.paying_org_address_zip_code.label"
          :model-value="formData.paying_org.address.zip_code"
          @update:model-value="formData.paying_org.address.zip_code = $event"
          :required="true"
          span="third"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.fields-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 0.25rem;
}

:deep(.field-span-full) { grid-column: span 4; }
:deep(.field-span-half) { grid-column: span 2; }
:deep(.field-span-third) { grid-column: span 1; }

.sub-label {
  grid-column: span 4;
  font-weight: 600;
  font-size: 0.875rem;
  color: #1e40af;
  margin: 1.25rem 0 0.75rem;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(to right, #eff6ff, transparent);
  border-left: 3px solid #3b82f6;
  border-radius: 0 0.25rem 0.25rem 0;
}

.conditional-group {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  background: hsl(188 70% 42% / 0.14);
  border: 1px solid hsl(188 70% 42% / 0.38);
  border-left: 3px solid hsl(188 70% 42% / 0.72);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 0.25rem;
}

@media (max-width: 1024px) {
  .conditional-group { grid-template-columns: repeat(2, 1fr); }
  :deep(.field-span-third) { grid-column: span 2; }
}

@media (max-width: 768px) {
  .fields-grid,
  .conditional-group { grid-template-columns: 1fr; }
  :deep(.field-span-full),
  :deep(.field-span-half),
  :deep(.field-span-third) { grid-column: span 1; }
}
</style>
