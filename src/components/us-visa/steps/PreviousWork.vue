<script setup lang="ts">
// PreviousWork — DS-160 Step 11 (v2): 近5年工作经历

import { inject } from 'vue'
import type { USVisaFormData, PreviousWorkRecord, EducationRecord } from '@/views/USVisaForm.vue'
import TextField from '@/components/fields/TextField.vue'
import NationalityField from '@/components/fields/NationalityField.vue'
import RadioField from '@/components/fields/RadioField.vue'
import DateField from '@/components/fields/DateField.vue'
import { usCountryOptions } from '@/config/usCountryOptions'
import { Plus, Trash2 } from '@lucide/vue'
import type { RadioOption } from '@/components/fields/RadioField.vue'

const formData = inject<USVisaFormData>('usVisaFormData')!
const { previous_work, education } = inject<{
  previous_work: PreviousWorkRecord[]
  education: EducationRecord[]
}>('usVisaArrays')!

const yesNoOptions: RadioOption[] = [
  { value: 'yes', labelKey: 'usVisa.options.yesNo.yes' },
  { value: 'no', labelKey: 'usVisa.options.yesNo.no' },
]

function createWork(): PreviousWorkRecord {
  return {
    employer_name: '', address: { country: '', state: '', city: '', street_addr1: '', zip_code: '' },
    phone: '', job_title: '', supervisor_surname: '', supervisor_given_name: '',
    date_from: '', date_to: '', job_description: '',
  }
}
function addWork() { previous_work.push(createWork()) }
function removeWork(i: number) { previous_work.splice(i, 1) }

function createEdu(): EducationRecord {
  return {
    name: '', address: { country: '', state: '', city: '', street_addr1: '', zip_code: '' },
    course: '', date_from: '', date_to: '',
  }
}
function addEdu() { education.push(createEdu()) }
function removeEdu(i: number) { education.splice(i, 1) }
</script>

<template>
  <div class="fields-grid">
    <!-- ======== 11.1 近5年工作 ======== -->
    <RadioField
      name="was_previously_employed"
      label-key="usVisa.fields.was_previously_employed.label"
      :options="yesNoOptions"
      :model-value="formData.was_previously_employed"
      @update:model-value="formData.was_previously_employed = $event"
    />

    <div v-if="formData.was_previously_employed === 'yes'" class="conditional-group">
      <div v-for="(w, i) in previous_work" :key="`pw-${i}`" class="repeatable-group">
        <div class="repeatable-header">
          <h4 class="sub-label">{{ $t('usVisa.subLabelsRepeat.previousWork', { N: i + 1 }) }}</h4>
          <button type="button" class="remove-btn" @click="removeWork(i)"><Trash2 :size="16" /></button>
        </div>
        <div class="fields-grid">
          <TextField :name="`pw_employer_${i}`" label-key="usVisa.fields.pw_employer_name.label" :model-value="w.employer_name" @update:model-value="w.employer_name = $event" span="half" />
          <div class="field-span-full"></div>
          <NationalityField :name="`pw_country_${i}`" label-key="usVisa.fields.pw_address_country.label" :options="usCountryOptions" :model-value="w.address.country" @update:model-value="w.address.country = $event" span="third" />
          <TextField :name="`pw_state_${i}`" label-key="usVisa.fields.pw_address_state.label" :model-value="w.address.state" @update:model-value="w.address.state = $event" span="third" />
          <TextField :name="`pw_city_${i}`" label-key="usVisa.fields.pw_address_city.label" :model-value="w.address.city" @update:model-value="w.address.city = $event" span="third" />
          <TextField :name="`pw_addr1_${i}`" label-key="usVisa.fields.pw_address_street_addr1.label" :model-value="w.address.street_addr1" @update:model-value="w.address.street_addr1 = $event" span="third" />
          <TextField :name="`pw_zip_${i}`" label-key="usVisa.fields.pw_address_zip_code.label" :model-value="w.address.zip_code" @update:model-value="w.address.zip_code = $event" span="third" />
          <TextField :name="`pw_phone_${i}`" label-key="usVisa.fields.pw_phone.label" :model-value="w.phone" @update:model-value="w.phone = $event" span="third" />
          <TextField :name="`pw_title_${i}`" label-key="usVisa.fields.pw_job_title.label" :model-value="w.job_title" @update:model-value="w.job_title = $event" span="third" />
          <TextField :name="`pw_sup_surname_${i}`" label-key="usVisa.fields.pw_supervisor_surname.label" :model-value="w.supervisor_surname" @update:model-value="w.supervisor_surname = $event" span="third" />
          <TextField :name="`pw_sup_given_${i}`" label-key="usVisa.fields.pw_supervisor_given_name.label" :model-value="w.supervisor_given_name" @update:model-value="w.supervisor_given_name = $event" span="third" />
          <DateField :name="`pw_from_${i}`" label-key="usVisa.fields.pw_date_from.label" :model-value="w.date_from" @update:model-value="w.date_from = $event" span="third" />
          <DateField :name="`pw_to_${i}`" label-key="usVisa.fields.pw_date_to.label" :model-value="w.date_to" @update:model-value="w.date_to = $event" span="third" />
          <TextField :name="`pw_desc_${i}`" label-key="usVisa.fields.pw_job_description.label" :model-value="w.job_description" @update:model-value="w.job_description = $event" :rows="3" span="full" />
        </div>
      </div>
      <button type="button" class="add-btn" @click="addWork"><Plus :size="16" /> {{ $t('usVisa.addRow') }}</button>
    </div>

    <!-- ======== 11.2 教育经历 ======== -->
    <RadioField
      name="has_education"
      label-key="usVisa.fields.has_education.label"
      :options="yesNoOptions"
      :model-value="formData.has_education"
      @update:model-value="formData.has_education = $event"
    />

    <div v-if="formData.has_education === 'yes'" class="conditional-group">
      <div v-for="(e, i) in education" :key="`edu-${i}`" class="repeatable-group">
        <div class="repeatable-header">
          <h4 class="sub-label">{{ $t('usVisa.subLabelsRepeat.education', { N: i + 1 }) }}</h4>
          <button type="button" class="remove-btn" @click="removeEdu(i)"><Trash2 :size="16" /></button>
        </div>
        <div class="fields-grid">
          <TextField :name="`edu_name_${i}`" label-key="usVisa.fields.edu_name.label" :model-value="e.name" @update:model-value="e.name = $event" span="half" />
          <div class="field-span-full"></div>
          <NationalityField :name="`edu_country_${i}`" label-key="usVisa.fields.edu_address_country.label" :options="usCountryOptions" :model-value="e.address.country" @update:model-value="e.address.country = $event" span="third" />
          <TextField :name="`edu_state_${i}`" label-key="usVisa.fields.edu_address_state.label" :model-value="e.address.state" @update:model-value="e.address.state = $event" span="third" />
          <TextField :name="`edu_city_${i}`" label-key="usVisa.fields.edu_address_city.label" :model-value="e.address.city" @update:model-value="e.address.city = $event" span="third" />
          <TextField :name="`edu_addr1_${i}`" label-key="usVisa.fields.edu_address_street_addr1.label" :model-value="e.address.street_addr1" @update:model-value="e.address.street_addr1 = $event" span="third" />
          <TextField :name="`edu_zip_${i}`" label-key="usVisa.fields.edu_address_zip_code.label" :model-value="e.address.zip_code" @update:model-value="e.address.zip_code = $event" span="third" />
          <TextField :name="`edu_course_${i}`" label-key="usVisa.fields.edu_course.label" :model-value="e.course" @update:model-value="e.course = $event" span="half" />
          <DateField :name="`edu_from_${i}`" label-key="usVisa.fields.edu_date_from.label" :model-value="e.date_from" @update:model-value="e.date_from = $event" span="third" />
          <DateField :name="`edu_to_${i}`" label-key="usVisa.fields.edu_date_to.label" :model-value="e.date_to" @update:model-value="e.date_to = $event" span="third" />
        </div>
      </div>
      <button type="button" class="add-btn" @click="addEdu"><Plus :size="16" /> {{ $t('usVisa.addRow') }}</button>
    </div>
  </div>
</template>

<style scoped>
.fields-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; padding: 0.25rem; }
:deep(.field-span-full) { grid-column: span 4; }
:deep(.field-span-half) { grid-column: span 2; }
:deep(.field-span-third) { grid-column: span 1; }
.sub-label { grid-column: span 4; font-size: 0.9rem; font-weight: 600; color: hsl(var(--foreground)); margin: 0.75rem 0 0; padding: 0; border: none; background: none; }
.conditional-group { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; background: hsl(188 70% 42% / 0.14); border: 1px solid hsl(188 70% 42% / 0.38); border-left: 3px solid hsl(188 70% 42% / 0.72); border-radius: 0.5rem; padding: 1rem; margin-top: 0.25rem; }
.repeatable-group { grid-column: span 4; background: rgba(255, 255, 255, 0.65); border: 1px solid hsl(188 40% 65% / 0.22); border-radius: 0.5rem; padding: 1rem 1.25rem; margin-bottom: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: box-shadow 0.2s, border-color 0.2s, background 0.2s; }
.repeatable-group:hover { background: rgba(255, 255, 255, 0.85); box-shadow: 0 2px 8px rgba(0,0,0,0.07); border-color: hsl(188 40% 60% / 0.38); }
.repeatable-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.repeatable-header .sub-label { margin: 0; padding: 0; border: none; background: none; font-size: 0.9rem; color: hsl(var(--foreground)); }
.remove-btn { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.625rem; font-size: 0.75rem; color: hsl(var(--destructive, 0 84% 60%)); background: hsl(var(--destructive, 0 84% 60%) / 0.08); border: 1px solid hsl(var(--destructive, 0 84% 60%) / 0.3); border-radius: 0.375rem; cursor: pointer; transition: background 0.15s, border-color 0.15s; }
.remove-btn:hover { background: hsl(var(--destructive, 0 84% 60%) / 0.15); border-color: hsl(var(--destructive, 0 84% 60%)); }
.add-btn { grid-column: span 4; display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; font-size: 0.8125rem; font-weight: 500; color: hsl(var(--primary)); background: hsl(var(--muted) / 0.5); border: 1px dashed hsl(var(--primary) / 0.4); border-radius: 0.5rem; cursor: pointer; margin-top: 0.5rem; transition: background 0.15s, border-color 0.15s; }
.add-btn:hover { background: hsl(var(--muted)); border-color: hsl(var(--primary)); }
@media (max-width: 1024px) { .conditional-group { grid-template-columns: repeat(2, 1fr); } :deep(.field-span-third) { grid-column: span 2; } }
@media (max-width: 768px) { .fields-grid, .conditional-group { grid-template-columns: 1fr; } :deep(.field-span-full), :deep(.field-span-half), :deep(.field-span-third) { grid-column: span 1; } }
</style>
