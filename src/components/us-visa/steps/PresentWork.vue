<script setup lang="ts">
// PresentWork — DS-160 Step 10 (v2): 当前工作/教育/培训

import { inject } from 'vue'
import type { USVisaFormData } from '@/views/USVisaForm.vue'
import TextField from '@/components/fields/TextField.vue'
import SelectField from '@/components/fields/SelectField.vue'
import NationalityField from '@/components/fields/NationalityField.vue'
import DateField from '@/components/fields/DateField.vue'
import { occupationOptions, usCountryOptions } from '@/config/usCountryOptions'

const formData = inject<USVisaFormData>('usVisaFormData')!
</script>

<template>
  <div class="fields-grid">
    <SelectField
      name="occupation"
      label-key="usVisa.fields.occupation.label"
      :options="occupationOptions"
      :model-value="formData.occupation"
      @update:model-value="formData.occupation = $event as string"
      span="third"
    />
    <TextField
      name="current_employer"
      label-key="usVisa.fields.current_employer.label"
      :model-value="formData.current_employer"
      @update:model-value="formData.current_employer = $event"
      span="third"
    />

    <div class="field-span-full"></div>

    <NationalityField
      name="current_address_country"
      label-key="usVisa.fields.current_address_country.label"
      :options="usCountryOptions"
      :model-value="formData.current_address.country"
      @update:model-value="formData.current_address.country = $event"
      span="third"
    />
    <TextField
      name="current_address_state"
      label-key="usVisa.fields.current_address_state.label"
      :model-value="formData.current_address.state"
      @update:model-value="formData.current_address.state = $event"
      span="third"
    />
    <TextField
      name="current_address_city"
      label-key="usVisa.fields.current_address_city.label"
      :model-value="formData.current_address.city"
      @update:model-value="formData.current_address.city = $event"
      span="third"
    />
    <TextField
      name="current_address_street_addr1"
      label-key="usVisa.fields.current_address_street_addr1.label"
      :model-value="formData.current_address.street_addr1"
      @update:model-value="formData.current_address.street_addr1 = $event"
      span="half"
    />
    <TextField
      name="current_address_zip_code"
      label-key="usVisa.fields.current_address_zip_code.label"
      :model-value="formData.current_address.zip_code"
      @update:model-value="formData.current_address.zip_code = $event"
      span="third"
    />

    <TextField
      name="current_address_tel"
      label-key="usVisa.fields.current_address_tel.label"
      :model-value="formData.current_address.tel"
      @update:model-value="formData.current_address.tel = $event"
      span="third"
    />

    <DateField
      name="start_date"
      label-key="usVisa.fields.start_date.label"
      :model-value="formData.start_date"
      @update:model-value="formData.start_date = $event"
      span="third"
    />
    <TextField
      name="monthly_income"
      label-key="usVisa.fields.monthly_income.label"
      :model-value="formData.monthly_income"
      @update:model-value="formData.monthly_income = $event"
      suffix="$"
      span="third"
    />

    <TextField
      name="job_description"
      label-key="usVisa.fields.job_description.label"
      :model-value="formData.job_description"
      @update:model-value="formData.job_description = $event"
      :rows="3"
      span="full"
    />
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
@media (max-width: 1024px) {
  :deep(.field-span-third) { grid-column: span 2; }
}
@media (max-width: 768px) {
  .fields-grid { grid-template-columns: 1fr; }
  :deep(.field-span-full),
  :deep(.field-span-half),
  :deep(.field-span-third) { grid-column: span 1; }
}
</style>
