<script setup lang="ts">
// PersonalInfo2 — DS-160 Step 2: 个人信息（二）
// v2: 国籍、其他国籍（嵌套条件）、永久居民、证件号码
// 字段 ID 对齐 docs/us-visa-ds160-form-design-v2.md §2

import { inject } from 'vue'
import type { USVisaFormData } from '@/views/USVisaForm.vue'
import TextField from '@/components/fields/TextField.vue'
import NationalityField from '@/components/fields/NationalityField.vue'
import RadioField from '@/components/fields/RadioField.vue'
import type { RadioOption } from '@/components/fields/RadioField.vue'
import { usCountryOptions, usSovereignStates } from '@/config/usCountryOptions'

const formData = inject<USVisaFormData>('usVisaFormData')!

// ---- 选项 ----

const yesNoOptions: RadioOption[] = [
  { value: 'yes', labelKey: 'usVisa.options.yesNo.yes' },
  { value: 'no', labelKey: 'usVisa.options.yesNo.no' },
]
</script>

<template>
  <div class="fields-grid">
    <!-- L2: 国籍 -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.nationality') }}</h4>
    <NationalityField
      name="nationality"
      label-key="usVisa.fields.nationality.label"
      :options="usSovereignStates"
      :model-value="formData.nationality"
      @update:model-value="formData.nationality = $event"
      :required="true"
      span="third"
    />

    <!-- has_other_nationality → 嵌套条件 -->
    <RadioField
      name="has_other_nationality"
      label-key="usVisa.fields.has_other_nationality.label"
      :options="yesNoOptions"
      :model-value="formData.has_other_nationality"
      @update:model-value="formData.has_other_nationality = $event"
      :required="true"
    />
    <template v-if="formData.has_other_nationality === 'yes'">
      <div class="conditional-group">
        <NationalityField
          name="other_nationality"
          label-key="usVisa.fields.other_nationality.label"
          :options="usSovereignStates"
          :model-value="formData.other_nationality"
          @update:model-value="formData.other_nationality = $event"
          :required="true"
          span="third"
        />

        <!-- has_other_nationality_passport → 嵌套条件 -->
        <RadioField
          name="has_other_nationality_passport"
          label-key="usVisa.fields.has_other_nationality_passport.label"
          :options="yesNoOptions"
          :model-value="formData.has_other_nationality_passport"
          @update:model-value="formData.has_other_nationality_passport = $event"
          :required="true"
        />
        <template v-if="formData.has_other_nationality_passport === 'yes'">
          <TextField
            name="other_nationality_passport_no"
            label-key="usVisa.fields.other_nationality_passport_no.label"
            :model-value="formData.other_nationality_passport_no"
            @update:model-value="formData.other_nationality_passport_no = $event"
            :required="true"
            span="third"
          />
        </template>
      </div>
    </template>

    <!-- is_permanent_resident -->
    <RadioField
      name="is_permanent_resident"
      label-key="usVisa.fields.is_permanent_resident.label"
      :options="yesNoOptions"
      :model-value="formData.is_permanent_resident"
      @update:model-value="formData.is_permanent_resident = $event"
      :required="true"
    />
    <template v-if="formData.is_permanent_resident === 'yes'">
      <div class="conditional-group">
        <NationalityField
          name="permanent_resident_country"
          label-key="usVisa.fields.permanent_resident_country.label"
          :options="usCountryOptions"
          :model-value="formData.permanent_resident_country"
          @update:model-value="formData.permanent_resident_country = $event"
          :required="false"
          span="third"
        />
      </div>
    </template>

    <!-- L2: 证件号码 -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.idNumbers') }}</h4>
    <TextField
      name="national_id_number"
      label-key="usVisa.fields.national_id_number.label"
      :model-value="formData.national_id_number"
      @update:model-value="formData.national_id_number = $event"
      :does-not-apply="true"
      :required="true"
      span="half"
    />
    <TextField
      name="social_security_number"
      label-key="usVisa.fields.social_security_number.label"
      :model-value="formData.social_security_number"
      @update:model-value="formData.social_security_number = $event"
      :does-not-apply="true"
      :required="true"
      span="third"
    />
    <TextField
      name="tax_id_number"
      label-key="usVisa.fields.tax_id_number.label"
      :model-value="formData.tax_id_number"
      @update:model-value="formData.tax_id_number = $event"
      :does-not-apply="true"
      :required="true"
      span="half"
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
  grid-column: span 4;
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
  :deep(.field-span-third) {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .fields-grid,
  .conditional-group {
    grid-template-columns: 1fr;
  }

  :deep(.field-span-full),
  :deep(.field-span-half),
  :deep(.field-span-third) {
    grid-column: span 1;
  }
}
</style>
