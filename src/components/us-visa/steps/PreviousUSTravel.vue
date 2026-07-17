<script setup lang="ts">
// PreviousUSTravel — DS-160 Step 5: 以往赴美记录
// v2: 赴美历史 + 驾照 + 签证历史 + 拒签 + ESTA + 移民请愿
// 字段 ID 对齐 docs/us-visa-ds160-form-design-v2.md §5

import { inject } from 'vue'
import type { USVisaFormData, USVisit } from '@/views/USVisaForm.vue'
import TextField from '@/components/fields/TextField.vue'
import SelectField from '@/components/fields/SelectField.vue'
import DateField from '@/components/fields/DateField.vue'
import RadioField from '@/components/fields/RadioField.vue'
import type { RadioOption } from '@/components/fields/RadioField.vue'
import type { SelectOption } from '@/components/fields/SelectField.vue'
import { usStatesOptions, stayPeriodOptions } from '@/config/usCountryOptions'
import { Plus, Trash2 } from '@lucide/vue'

const formData = inject<USVisaFormData>('usVisaFormData')!
const arrays = inject<{ us_visits: USVisit[] }>('usVisaArrays')!

const yesNoOptions: RadioOption[] = [
  { value: 'yes', labelKey: 'usVisa.options.yesNo.yes' },
  { value: 'no', labelKey: 'usVisa.options.yesNo.no' },
]

function createVisit(): USVisit {
  return { arrival_date: '', length_of_stay: '', stay_period: '' }
}

function addVisit() {
  if (arrays.us_visits.length < 5) {
    arrays.us_visits.push(createVisit())
  }
}

function removeVisit(index: number) {
  arrays.us_visits.splice(index, 1)
}
</script>

<template>
  <div class="fields-grid">
    <!-- 5.1 赴美历史 -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.usVisits') }}</h4>
    <RadioField
      name="has_been_in_us"
      label-key="usVisa.fields.has_been_in_us.label"
      :options="yesNoOptions"
      :model-value="formData.has_been_in_us"
      @update:model-value="formData.has_been_in_us = $event"
      :required="true"
    />
    <template v-if="formData.has_been_in_us === 'yes'">
      <div class="conditional-group">
        <div
          v-for="(visit, index) in arrays.us_visits"
          :key="index"
          class="repeatable-group"
        >
          <div class="repeatable-header">
            <h4 class="sub-label">{{ $t('usVisa.subLabelsRepeat.usVisit', { N: index + 1 }) }}</h4>
            <button type="button" class="remove-btn" @click="removeVisit(index)">
              <Trash2 :size="16" />
            </button>
          </div>
          <div class="fields-grid">
            <DateField
              :name="`visit_arrival_date_${index}`"
              label-key="usVisa.fields.visit_arrival_date.label"
              :model-value="visit.arrival_date"
              @update:model-value="visit.arrival_date = $event"
              :required="true"
              span="third"
            />
            <TextField
              :name="`visit_length_of_stay_${index}`"
              label-key="usVisa.fields.visit_length_of_stay.label"
              :model-value="visit.length_of_stay"
              @update:model-value="visit.length_of_stay = $event"
              :required="true"
              span="third"
            />
            <SelectField
              :name="`visit_stay_period_${index}`"
              label-key="usVisa.fields.visit_stay_period.label"
              :options="stayPeriodOptions"
              :model-value="visit.stay_period"
              @update:model-value="visit.stay_period = $event"
              :required="true"
              span="third"
            />
          </div>
        </div>
        <button v-if="arrays.us_visits.length < 5" type="button" class="add-btn" @click="addVisit">
          <Plus :size="16" />
          {{ $t('usVisa.addRow') }}
        </button>
      </div>
    </template>

    <!-- 5.2 美国驾照 -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.usDriversLicense') }}</h4>
    <RadioField
      name="has_us_drivers_license"
      label-key="usVisa.fields.has_us_drivers_license.label"
      :options="yesNoOptions"
      :model-value="formData.has_us_drivers_license"
      @update:model-value="formData.has_us_drivers_license = $event"
      :required="true"
    />
    <template v-if="formData.has_us_drivers_license === 'yes'">
      <div class="conditional-group">
        <TextField
          name="drivers_license_number"
          label-key="usVisa.fields.drivers_license_number.label"
          :model-value="formData.drivers_license_number"
          @update:model-value="formData.drivers_license_number = $event"
          :required="true"
          span="third"
        />
        <SelectField
          name="drivers_license_state"
          label-key="usVisa.fields.drivers_license_state.label"
          :options="usStatesOptions"
          :model-value="formData.drivers_license_state"
          @update:model-value="formData.drivers_license_state = $event"
          :required="true"
          span="third"
        />
      </div>
    </template>

    <!-- 5.3 签证历史 -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.usVisaHistory') }}</h4>
    <RadioField
      name="has_us_visa"
      label-key="usVisa.fields.has_us_visa.label"
      :options="yesNoOptions"
      :model-value="formData.has_us_visa"
      @update:model-value="formData.has_us_visa = $event"
      :required="true"
    />
    <template v-if="formData.has_us_visa === 'yes'">
      <div class="conditional-group">
        <DateField
          name="last_visa_date"
          label-key="usVisa.fields.last_visa_date.label"
          :model-value="formData.last_visa_date"
          @update:model-value="formData.last_visa_date = $event"
          :required="true"
          span="third"
        />
        <TextField
          name="last_visa_number"
          label-key="usVisa.fields.last_visa_number.label"
          :model-value="formData.last_visa_number"
          @update:model-value="formData.last_visa_number = $event"
          :required="true"
          span="third"
        />
        <RadioField
          name="applying_same_type"
          label-key="usVisa.fields.applying_same_type.label"
          :options="yesNoOptions"
          :model-value="formData.applying_same_type"
          @update:model-value="formData.applying_same_type = $event"
          :required="true"
        />
        <RadioField
          name="applying_same_country"
          label-key="usVisa.fields.applying_same_country.label"
          :options="yesNoOptions"
          :model-value="formData.applying_same_country"
          @update:model-value="formData.applying_same_country = $event"
          :required="true"
        />
        <RadioField
          name="has_been_ten_printed"
          label-key="usVisa.fields.has_been_ten_printed.label"
          :options="yesNoOptions"
          :model-value="formData.has_been_ten_printed"
          @update:model-value="formData.has_been_ten_printed = $event"
          :required="true"
        />
        <RadioField
          name="visa_lost_or_stolen"
          label-key="usVisa.fields.visa_lost_or_stolen.label"
          :options="yesNoOptions"
          :model-value="formData.visa_lost_or_stolen"
          @update:model-value="formData.visa_lost_or_stolen = $event"
          :required="true"
        />
        <RadioField
          name="visa_cancelled"
          label-key="usVisa.fields.visa_cancelled.label"
          :options="yesNoOptions"
          :model-value="formData.visa_cancelled"
          @update:model-value="formData.visa_cancelled = $event"
          :required="true"
        />
      </div>
    </template>

    <!-- 5.4 拒签 -->
    <RadioField
      name="has_been_refused"
      label-key="usVisa.fields.has_been_refused.label"
      :options="yesNoOptions"
      :model-value="formData.has_been_refused"
      @update:model-value="formData.has_been_refused = $event"
      :required="true"
    />
    <template v-if="formData.has_been_refused === 'yes'">
      <div class="conditional-group">
        <TextField
          name="refusal_explain"
          label-key="usVisa.fields.refusal_explain.label"
          :model-value="formData.refusal_explain"
          @update:model-value="formData.refusal_explain = $event"
          textarea
          :required="true"
          span="full"
        />
      </div>
    </template>

    <!-- 5.5 ESTA 拒绝 -->
    <RadioField
      name="has_esta_refused"
      label-key="usVisa.fields.has_esta_refused.label"
      :options="yesNoOptions"
      :model-value="formData.has_esta_refused"
      @update:model-value="formData.has_esta_refused = $event"
      :required="true"
    />
    <template v-if="formData.has_esta_refused === 'yes'">
      <div class="conditional-group">
        <TextField
          name="esta_refusal_explain"
          label-key="usVisa.fields.esta_refusal_explain.label"
          :model-value="formData.esta_refusal_explain"
          @update:model-value="formData.esta_refusal_explain = $event"
          textarea
          :required="true"
          span="full"
        />
      </div>
    </template>

    <!-- 5.6 移民请愿 -->
    <RadioField
      name="has_immigrant_petition"
      label-key="usVisa.fields.has_immigrant_petition.label"
      :options="yesNoOptions"
      :model-value="formData.has_immigrant_petition"
      @update:model-value="formData.has_immigrant_petition = $event"
      :required="true"
    />
    <template v-if="formData.has_immigrant_petition === 'yes'">
      <div class="conditional-group">
        <TextField
          name="immigrant_petition_explain"
          label-key="usVisa.fields.immigrant_petition_explain.label"
          :model-value="formData.immigrant_petition_explain"
          @update:model-value="formData.immigrant_petition_explain = $event"
          textarea
          :required="true"
          span="full"
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

.repeatable-group {
  grid-column: span 4;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid hsl(188 40% 65% / 0.22);
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
}

.repeatable-group:hover {
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
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
  grid-column: span 4;
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
}

.add-btn:hover {
  background: hsl(var(--muted));
  border-color: hsl(var(--primary));
}

.remove-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  color: hsl(var(--destructive, 0 84% 60%));
  background: hsl(var(--destructive, 0 84% 60%) / 0.08);
  border: 1px solid hsl(var(--destructive, 0 84% 60%) / 0.3);
  border-radius: 0.375rem;
  cursor: pointer;
}

.remove-btn:hover {
  background: hsl(var(--destructive, 0 84% 60%) / 0.15);
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
