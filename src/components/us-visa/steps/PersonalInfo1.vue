<script setup lang="ts">
// PersonalInfo1 — DS-160 Step 1: 个人信息（一）
// v2: 姓名、电码、性别、婚姻状况、出生日期、出生地点
// 字段 ID 对齐 docs/us-visa-ds160-form-design-v2.md §1

import { computed, inject } from 'vue'
import type { USVisaFormData } from '@/views/USVisaForm.vue'
import TextField from '@/components/fields/TextField.vue'
import SelectField from '@/components/fields/SelectField.vue'
import NationalityField from '@/components/fields/NationalityField.vue'
import RadioField from '@/components/fields/RadioField.vue'
import DateField from '@/components/fields/DateField.vue'
import type { RadioOption } from '@/components/fields/RadioField.vue'
import { genderOptions, maritalStatusOptions } from '@/config/usCountryOptions'
import { usCountryOptions } from '@/config/usCountryOptions'

const formData = inject<USVisaFormData>('usVisaFormData')!

// ponytail: native_name shows empty when not_applicable is checked
const nativeNameDisplay = computed(() =>
  formData.native_name_not_applicable ? '' : formData.native_name,
)

// ---- 选项 ----

const yesNoOptions: RadioOption[] = [
  { value: 'yes', labelKey: 'usVisa.options.yesNo.yes' },
  { value: 'no', labelKey: 'usVisa.options.yesNo.no' },
]
</script>

<template>
  <div class="fields-grid">
    <!-- L2: 姓名 -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.name') }}</h4>
    <TextField
      name="surname"
      label-key="usVisa.fields.surname.label"
      :placeholder="$t('usVisa.fields.surname.placeholder')"
      :model-value="formData.surname"
      @update:model-value="formData.surname = $event"
      :required="true"
      span="third"
    />
    <TextField
      name="given_name"
      label-key="usVisa.fields.given_name.label"
      :placeholder="$t('usVisa.fields.given_name.placeholder')"
      :model-value="formData.given_name"
      @update:model-value="formData.given_name = $event"
      :required="true"
      span="third"
    />
    <div class="native-name-col">
      <TextField
        name="native_name"
        label-key="usVisa.fields.native_name.label"
        :placeholder="$t('usVisa.fields.native_name.placeholder')"
        :model-value="nativeNameDisplay"
        @update:model-value="formData.native_name = $event"
        :required="true"
        :disabled="formData.native_name_not_applicable"
        span="half"
      />
      <div class="native-name-checkboxes">
        <label class="inline-checkbox">
          <input
            type="checkbox"
            :checked="formData.native_name_not_applicable"
            @change="
              formData.native_name_not_applicable = ($event.target as HTMLInputElement).checked
            "
          />
          <span>{{ $t('usVisa.fields.native_name_not_applicable') }}</span>
        </label>
      </div>
    </div>

    <!-- has_other_names → 条件字段 -->
    <RadioField
      name="has_other_names"
      label-key="usVisa.fields.has_other_names.label"
      :options="yesNoOptions"
      :model-value="formData.has_other_names"
      @update:model-value="formData.has_other_names = $event"
      :required="true"
    />
    <template v-if="formData.has_other_names === 'yes'">
      <div class="conditional-group">
        <TextField
          name="other_surname"
          label-key="usVisa.fields.other_surname.label"
          :model-value="formData.other_surname"
          @update:model-value="formData.other_surname = $event"
          :required="true"
          span="third"
        />
        <TextField
          name="other_given_name"
          label-key="usVisa.fields.other_given_name.label"
          :model-value="formData.other_given_name"
          @update:model-value="formData.other_given_name = $event"
          :required="true"
          span="third"
        />
      </div>
    </template>

    <!-- L2: 电报码 -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.telecode') }}</h4>
    <RadioField
      name="has_telecode"
      label-key="usVisa.fields.has_telecode.label"
      :options="yesNoOptions"
      :model-value="formData.has_telecode"
      @update:model-value="formData.has_telecode = $event"
      :required="true"
    />
    <template v-if="formData.has_telecode === 'yes'">
      <div class="conditional-group">
        <TextField
          name="telecode_surname"
          label-key="usVisa.fields.telecode_surname.label"
          :model-value="formData.telecode_surname"
          @update:model-value="formData.telecode_surname = $event"
          :required="true"
          span="third"
        />
        <TextField
          name="telecode_given_name"
          label-key="usVisa.fields.telecode_given_name.label"
          :model-value="formData.telecode_given_name"
          @update:model-value="formData.telecode_given_name = $event"
          :required="true"
          span="third"
        />
      </div>
    </template>

    <!-- 性别 -->
    <SelectField
      name="sex"
      label-key="usVisa.fields.sex.label"
      :options="genderOptions"
      :model-value="formData.sex"
      @update:model-value="formData.sex = $event"
      :required="true"
      span="third"
    />

    <!-- 婚姻状况 -->
    <RadioField
      name="marital_status"
      label-key="usVisa.fields.marital_status.label"
      :options="maritalStatusOptions"
      :model-value="formData.marital_status"
      @update:model-value="formData.marital_status = $event"
      :required="true"
    />
    <template v-if="formData.marital_status === 'OTHER'">
      <div class="conditional-group">
        <TextField
          name="marital_status_explain"
          label-key="usVisa.fields.marital_status_explain.label"
          :model-value="formData.marital_status_explain"
          @update:model-value="formData.marital_status_explain = $event"
          textarea
          :required="true"
          span="full"
        />
      </div>
    </template>

    <!-- 出生日期和出生地 -->
    <DateField
      name="date_of_birth"
      label-key="usVisa.fields.date_of_birth.label"
      :model-value="formData.date_of_birth"
      @update:model-value="formData.date_of_birth = $event"
      :required="true"
      span="third"
    />
    <NationalityField
      name="birth_country"
      label-key="usVisa.fields.birth_country.label"
      :options="usCountryOptions"
      :model-value="formData.birth_country"
      @update:model-value="formData.birth_country = $event"
      :required="true"
      span="third"
    />
    <TextField
      name="birth_state"
      label-key="usVisa.fields.birth_state.label"
      :model-value="formData.birth_state"
      @update:model-value="formData.birth_state = $event"
      span="third"
    />
    <TextField
      name="birth_city"
      label-key="usVisa.fields.birth_city.label"
      :model-value="formData.birth_city"
      @update:model-value="formData.birth_city = $event"
      :required="true"
      span="third"
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

.native-name-col {
  grid-column: span 2;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.native-name-checkboxes {
  display: flex;
  gap: 1rem;
  padding: 0 0.25rem;
}

.inline-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  user-select: none;
}

.inline-checkbox input[type="checkbox"] {
  width: 0.875rem;
  height: 0.875rem;
  accent-color: hsl(var(--primary));
  cursor: pointer;
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
