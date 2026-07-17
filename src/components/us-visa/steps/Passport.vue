<script setup lang="ts">
// Passport — DS-160 Step 7: 护照信息
// v2: 护照类型/号码/本号 + 签发信息（含日期） + 遗失护照
// 字段 ID 对齐 docs/us-visa-ds160-form-design-v2.md §7

import { inject, watch } from 'vue'
import type { USVisaFormData, LostPassport } from '@/views/USVisaForm.vue'
import TextField from '@/components/fields/TextField.vue'
import SelectField from '@/components/fields/SelectField.vue'
import NationalityField from '@/components/fields/NationalityField.vue'
import RadioField from '@/components/fields/RadioField.vue'
import DateField from '@/components/fields/DateField.vue'
import type { RadioOption } from '@/components/fields/RadioField.vue'
import { docTypeOptions, usCountryOptions, usAuthorityOptions } from '@/config/usCountryOptions'
import { Plus, Trash2 } from '@lucide/vue'

const formData = inject<USVisaFormData>('usVisaFormData')!
const arrays = inject<{ lost_passports: LostPassport[] }>('usVisaArrays')!

const yesNoOptions: RadioOption[] = [
  { value: 'yes', labelKey: 'usVisa.options.yesNo.yes' },
  { value: 'no', labelKey: 'usVisa.options.yesNo.no' },
]

// no_expiration checkbox: when checked, clear expiration_date
watch(() => formData.no_expiration, (val) => {
  if (val) formData.expiration_date = ''
})

function createLostPassport(): LostPassport {
  return { number: '', country: '', explain: '' }
}

function addLostPassport() {
  arrays.lost_passports.push(createLostPassport())
}

function removeLostPassport(index: number) {
  arrays.lost_passports.splice(index, 1)
}
</script>

<template>
  <div class="fields-grid">
    <!-- L2: 护照基本信息 -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.passportBasic') }}</h4>
    <SelectField
      name="doc_type"
      label-key="usVisa.fields.doc_type.label"
      :options="docTypeOptions"
      :model-value="formData.doc_type"
      @update:model-value="formData.doc_type = $event"
      :required="true"
      span="third"
    />
    <TextField
      name="doc_number"
      label-key="usVisa.fields.doc_number.label"
      :model-value="formData.doc_number"
      @update:model-value="formData.doc_number = $event"
      :required="true"
      span="third"
    />
    <template v-if="formData.doc_type === 'OTHER'">
      <div class="conditional-group">
        <TextField
          name="doc_type_explain"
          label-key="usVisa.fields.doc_type_explain.label"
          :model-value="formData.doc_type_explain"
          @update:model-value="formData.doc_type_explain = $event"
          textarea
          :required="true"
          span="full"
        />
      </div>
    </template>
    <TextField
      name="book_number"
      label-key="usVisa.fields.book_number.label"
      :model-value="formData.book_number"
      @update:model-value="formData.book_number = $event"
      span="third"
    />

    <!-- L2: 签发信息 -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.issuanceInfo') }}</h4>
    <NationalityField
      name="doc_authority"
      label-key="usVisa.fields.doc_authority.label"
      :options="usAuthorityOptions"
      :model-value="formData.doc_authority"
      @update:model-value="formData.doc_authority = $event"
      :required="true"
      span="third"
    />
    <TextField
      name="issued_location_city"
      label-key="usVisa.fields.issued_location_city.label"
      :model-value="formData.issued_location.city"
      @update:model-value="formData.issued_location.city = $event"
      :required="true"
      span="third"
    />
    <TextField
      name="issued_location_state"
      label-key="usVisa.fields.issued_location_state.label"
      :model-value="formData.issued_location.state"
      @update:model-value="formData.issued_location.state = $event"
      span="third"
    />
    <NationalityField
      name="issued_location_country"
      label-key="usVisa.fields.issued_location_country.label"
      :options="usCountryOptions"
      :model-value="formData.issued_location.country"
      @update:model-value="formData.issued_location.country = $event"
      :required="true"
      span="third"
    />

    <!-- L2: 日期（合入签发信息） -->
    <DateField
      name="issuance_date"
      label-key="usVisa.fields.issuance_date.label"
      :model-value="formData.issuance_date"
      @update:model-value="formData.issuance_date = $event"
      :required="true"
      span="third"
    />
    <DateField
      name="expiration_date"
      label-key="usVisa.fields.expiration_date.label"
      :model-value="formData.expiration_date"
      @update:model-value="formData.expiration_date = $event"
      :required="!formData.no_expiration"
      :disabled="formData.no_expiration"
      span="third"
    />
    <label class="checkbox-label">
      <input
        type="checkbox"
        :checked="formData.no_expiration"
        @change="formData.no_expiration = ($event.target as HTMLInputElement).checked"
      />
      <span>{{ $t('usVisa.fields.no_expiration.label') }}</span>
    </label>

    <!-- L2: 遗失护照 -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.lostPassport') }}</h4>
    <RadioField
      name="has_lost_passport"
      label-key="usVisa.fields.has_lost_passport.label"
      :options="yesNoOptions"
      :model-value="formData.has_lost_passport"
      @update:model-value="formData.has_lost_passport = $event"
      :required="true"
    />
    <template v-if="formData.has_lost_passport === 'yes'">
      <div class="conditional-group">
        <div
          v-for="(lp, index) in arrays.lost_passports"
          :key="index"
          class="repeatable-group"
        >
          <div class="repeatable-header">
            <h4 class="sub-label">{{ $t('usVisa.subLabelsRepeat.lostPassport', { N: index + 1 }) }}</h4>
            <button type="button" class="remove-btn" @click="removeLostPassport(index)">
              <Trash2 :size="16" />
            </button>
          </div>
          <div class="fields-grid">
            <TextField
              :name="`lost_passport_number_${index}`"
              label-key="usVisa.fields.lost_passport_number.label"
              :model-value="lp.number"
              @update:model-value="lp.number = $event"
              :do-not-know="true"
              :required="true"
              span="third"
            />
            <NationalityField
              :name="`lost_passport_country_${index}`"
              label-key="usVisa.fields.lost_passport_country.label"
              :options="usCountryOptions"
              :model-value="lp.country"
              @update:model-value="lp.country = $event"
              :required="true"
              span="third"
            />
            <TextField
              :name="`lost_passport_explain_${index}`"
              label-key="usVisa.fields.lost_passport_explain.label"
              :model-value="lp.explain"
              @update:model-value="lp.explain = $event"
              textarea
              :required="true"
            />
          </div>
        </div>
        <button type="button" class="add-btn" @click="addLostPassport">
          <Plus :size="16" />
          {{ $t('usVisa.addRow') }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.fields-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; padding: 0.25rem; }
:deep(.field-span-full) { grid-column: span 4; }
:deep(.field-span-half) { grid-column: span 2; }
:deep(.field-span-third) { grid-column: span 1; }

.sub-label { grid-column: span 4; font-weight: 600; font-size: 0.875rem; color: #1e40af; margin: 1.25rem 0 0.75rem; padding: 0.375rem 0.75rem; background: linear-gradient(to right, #eff6ff, transparent); border-left: 3px solid #3b82f6; border-radius: 0 0.25rem 0.25rem 0; }
.conditional-group { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; background: hsl(188 70% 42% / 0.14); border: 1px solid hsl(188 70% 42% / 0.38); border-left: 3px solid hsl(188 70% 42% / 0.72); border-radius: 0.5rem; padding: 1rem; margin-top: 0.25rem; }

.repeatable-group { grid-column: span 4; background: rgba(255,255,255,0.65); border: 1px solid hsl(188 40% 65% / 0.22); border-radius: 0.5rem; padding: 1rem 1.25rem; margin-bottom: 0.75rem; }
.repeatable-group:hover { background: rgba(255,255,255,0.85); box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
.repeatable-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.repeatable-header .sub-label { margin: 0; padding: 0; border: none; background: none; font-size: 0.9rem; color: hsl(var(--foreground)); }

.checkbox-label { display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.875rem; }
.checkbox-label input[type="checkbox"] { width: 1rem; height: 1rem; cursor: pointer; }

.add-btn { grid-column: span 4; display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; font-size: 0.8125rem; font-weight: 500; color: hsl(var(--primary)); background: hsl(var(--muted) / 0.5); border: 1px dashed hsl(var(--primary) / 0.4); border-radius: 0.5rem; cursor: pointer; margin-top: 0.5rem; }
.add-btn:hover { background: hsl(var(--muted)); border-color: hsl(var(--primary)); }
.remove-btn { display: inline-flex; align-items: center; padding: 0.25rem 0.625rem; font-size: 0.75rem; color: hsl(var(--destructive, 0 84% 60%)); background: hsl(var(--destructive, 0 84% 60%) / 0.08); border: 1px solid hsl(var(--destructive, 0 84% 60%) / 0.3); border-radius: 0.375rem; cursor: pointer; }
.remove-btn:hover { background: hsl(var(--destructive, 0 84% 60%) / 0.15); }

@media (max-width: 1024px) { .conditional-group { grid-template-columns: repeat(2, 1fr); } :deep(.field-span-third) { grid-column: span 2; } }
@media (max-width: 768px) { .fields-grid, .conditional-group { grid-template-columns: 1fr; } :deep(.field-span-full), :deep(.field-span-half), :deep(.field-span-third) { grid-column: span 1; } }
</style>
