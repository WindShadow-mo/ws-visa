<script setup lang="ts">
// Family — DS-160 Step 9 (v2): 家庭信息
// 父亲/母亲（DNK on 姓名，条件展开生日+在美信息）、直系亲属、配偶/伴侣

import { inject, computed } from 'vue'
import type { USVisaFormData, ImmediateRelative } from '@/views/USVisaForm.vue'
import TextField from '@/components/fields/TextField.vue'
import SelectField from '@/components/fields/SelectField.vue'
import NationalityField from '@/components/fields/NationalityField.vue'
import RadioField from '@/components/fields/RadioField.vue'
import DateField from '@/components/fields/DateField.vue'
import {
  usCountryOptions,
  usSovereignStates,
  immediateRelationOptions,
  familyStatusOptions,
  spouseAddressOptions,
} from '@/config/usCountryOptions'
import { Plus, Trash2 } from '@lucide/vue'
import type { RadioOption } from '@/components/fields/RadioField.vue'

const formData = inject<USVisaFormData>('usVisaFormData')!
const { immediate_relatives } = inject<{
  immediate_relatives: ImmediateRelative[]
}>('usVisaArrays')!

// ponytail: yesNo is used across multiple sections, define once
const yesNoOptions: RadioOption[] = [
  { value: 'yes', labelKey: 'usVisa.options.yesNo.yes' },
  { value: 'no', labelKey: 'usVisa.options.yesNo.no' },
]

// ---- 条件显示：父母生日+在美信息（姓名 DNK 取消勾选时显示）----

const showFatherDetails = computed(() =>
  formData.father.surname !== 'DNC' || formData.father.given_name !== 'DNC',
)
const showMotherDetails = computed(() =>
  formData.mother.surname !== 'DNC' || formData.mother.given_name !== 'DNC',
)

// ---- 直系亲属 可重复组 ----

function createImmediateRelative(): ImmediateRelative {
  return { surname: '', given_name: '', relationship: '', status: '' }
}

function addImmediateRelative() {
  immediate_relatives.push(createImmediateRelative())
}

function removeImmediateRelative(index: number) {
  immediate_relatives.splice(index, 1)
}
</script>

<template>
  <div class="fields-grid">
    <!-- ======== L2: 父亲信息 ======== -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.father') }}</h4>

    <TextField
      name="father_surname"
      label-key="usVisa.fields.father_surname.label"
      :model-value="formData.father.surname"
      @update:model-value="formData.father.surname = $event"
      :do-not-know="true"
      :required="true"
      span="third"
    />
    <TextField
      name="father_given_name"
      label-key="usVisa.fields.father_given_name.label"
      :model-value="formData.father.given_name"
      @update:model-value="formData.father.given_name = $event"
      :do-not-know="true"
      :required="true"
      span="third"
    />

    <!-- 姓名 DNK 取消勾选时显示：生日、在美、身份 -->
    <div v-if="showFatherDetails" class="conditional-group">
      <DateField
        name="father_date_of_birth"
        label-key="usVisa.fields.father_date_of_birth.label"
        :model-value="formData.father.date_of_birth"
        @update:model-value="formData.father.date_of_birth = $event"
        :do-not-know="true"
        :required="true"
        span="third"
      />

      <RadioField
        name="father_in_us"
        label-key="usVisa.fields.father_in_us.label"
        :options="yesNoOptions"
        :model-value="formData.father.in_us"
        @update:model-value="formData.father.in_us = $event"
        :required="true"
      />

      <!-- L3 nested: in_us=yes 时显示身份 -->
      <SelectField
        v-if="formData.father.in_us === 'yes'"
        name="father_status"
        label-key="usVisa.fields.father_status.label"
        :options="familyStatusOptions"
        :model-value="formData.father.status"
        @update:model-value="formData.father.status = $event as string"
        :required="true"
        span="third"
      />
    </div>

    <!-- ======== L2: 母亲信息 ======== -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.mother') }}</h4>

    <TextField
      name="mother_surname"
      label-key="usVisa.fields.mother_surname.label"
      :model-value="formData.mother.surname"
      @update:model-value="formData.mother.surname = $event"
      :do-not-know="true"
      :required="true"
      span="third"
    />
    <TextField
      name="mother_given_name"
      label-key="usVisa.fields.mother_given_name.label"
      :model-value="formData.mother.given_name"
      @update:model-value="formData.mother.given_name = $event"
      :do-not-know="true"
      :required="true"
      span="third"
    />

    <div v-if="showMotherDetails" class="conditional-group">
      <DateField
        name="mother_date_of_birth"
        label-key="usVisa.fields.mother_date_of_birth.label"
        :model-value="formData.mother.date_of_birth"
        @update:model-value="formData.mother.date_of_birth = $event"
        :do-not-know="true"
        :required="true"
        span="third"
      />

      <RadioField
        name="mother_in_us"
        label-key="usVisa.fields.mother_in_us.label"
        :options="yesNoOptions"
        :model-value="formData.mother.in_us"
        @update:model-value="formData.mother.in_us = $event"
        :required="true"
      />

      <SelectField
        v-if="formData.mother.in_us === 'yes'"
        name="mother_status"
        label-key="usVisa.fields.mother_status.label"
        :options="familyStatusOptions"
        :model-value="formData.mother.status"
        @update:model-value="formData.mother.status = $event as string"
        :required="true"
        span="third"
      />
    </div>

    <!-- ======== L2: 在美直系亲属 ======== -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.immediateRelatives') }}</h4>

    <RadioField
      name="has_immediate_relatives"
      label-key="usVisa.fields.has_immediate_relatives.label"
      :options="yesNoOptions"
      :model-value="formData.has_immediate_relatives"
      @update:model-value="formData.has_immediate_relatives = $event"
      :required="true"
    />

    <div v-if="formData.has_immediate_relatives === 'yes'" class="conditional-group">
      <div
        v-for="(rel, index) in immediate_relatives"
        :key="`ir-${index}`"
        class="repeatable-group"
      >
        <div class="repeatable-header">
          <h4 class="sub-label">{{ $t('usVisa.subLabelsRepeat.relative', { N: index + 1 }) }}</h4>
          <button type="button" class="remove-btn" @click="removeImmediateRelative(index)">
            <Trash2 :size="16" />
          </button>
        </div>
        <div class="fields-grid">
          <TextField
            :name="`ir_surname_${index}`"
            label-key="usVisa.fields.immediate_relatives_surname.label"
            :model-value="rel.surname"
            @update:model-value="rel.surname = $event"
            :required="true"
            span="third"
          />
          <TextField
            :name="`ir_given_name_${index}`"
            label-key="usVisa.fields.immediate_relatives_given_name.label"
            :model-value="rel.given_name"
            @update:model-value="rel.given_name = $event"
            :required="true"
            span="third"
          />
          <SelectField
            :name="`ir_relationship_${index}`"
            label-key="usVisa.fields.immediate_relatives_relationship.label"
            :options="immediateRelationOptions"
            :model-value="rel.relationship"
            @update:model-value="rel.relationship = $event as string"
            :required="true"
            span="third"
          />
          <SelectField
            :name="`ir_status_${index}`"
            label-key="usVisa.fields.immediate_relatives_status.label"
            :options="familyStatusOptions"
            :model-value="rel.status"
            @update:model-value="rel.status = $event as string"
            :required="true"
            span="third"
          />
        </div>
      </div>
      <button type="button" class="add-btn" @click="addImmediateRelative">
        <Plus :size="16" />
        {{ $t('usVisa.addRow') }}
      </button>
    </div>

    <!-- ======== L2: 配偶/伴侣信息（仅已婚/民事结合时显示）======== -->
    <template v-if="formData.marital_status === 'MARRIED' || formData.marital_status === 'CIVIL_UNION'">
    <h4 class="sub-label">{{ $t('usVisa.subLabels.spouse') }}</h4>

    <TextField
      name="spouse_surname"
      label-key="usVisa.fields.spouse_surname.label"
      :model-value="formData.spouse.surname"
      @update:model-value="formData.spouse.surname = $event"
      span="third"
    />
    <TextField
      name="spouse_given_name"
      label-key="usVisa.fields.spouse_given_name.label"
      :model-value="formData.spouse.given_name"
      @update:model-value="formData.spouse.given_name = $event"
      span="third"
    />

    <DateField
      name="spouse_date_of_birth"
      label-key="usVisa.fields.spouse_date_of_birth.label"
      :model-value="formData.spouse.date_of_birth"
      @update:model-value="formData.spouse.date_of_birth = $event"
      span="third"
    />
    <NationalityField
      name="spouse_nationality"
      label-key="usVisa.fields.spouse_nationality.label"
      :options="usSovereignStates"
      :model-value="formData.spouse.nationality"
      @update:model-value="formData.spouse.nationality = $event"
      span="third"
    />

    <NationalityField
      name="spouse_birth_country"
      label-key="usVisa.fields.spouse_birth_country.label"
      :options="usCountryOptions"
      :model-value="formData.spouse.birth_country"
      @update:model-value="formData.spouse.birth_country = $event"
      span="third"
    />
    <TextField
      name="spouse_birth_city"
      label-key="usVisa.fields.spouse_birth_city.label"
      :model-value="formData.spouse.birth_city"
      @update:model-value="formData.spouse.birth_city = $event"
      span="third"
    />

    <div class="field-span-full"></div>
    <SelectField
      name="spouse_address_type"
      label-key="usVisa.fields.spouse_address_type.label"
      :options="spouseAddressOptions"
      :model-value="formData.spouse.address_type"
      @update:model-value="formData.spouse.address_type = $event as string"
      span="third"
    />

    <!-- L3: address_type=OTHER 时显示完整地址 -->
    <template v-if="formData.spouse.address_type === 'OTHER'">
      <NationalityField
        name="spouse_address_country"
        label-key="usVisa.fields.spouse_address_country.label"
        :options="usCountryOptions"
        :model-value="formData.spouse.address.country"
        @update:model-value="formData.spouse.address.country = $event"
        span="third"
      />
      <TextField
        name="spouse_address_state"
        label-key="usVisa.fields.spouse_address_state.label"
        :model-value="formData.spouse.address.state"
        @update:model-value="formData.spouse.address.state = $event"
        span="third"
      />
      <TextField
        name="spouse_address_city"
        label-key="usVisa.fields.spouse_address_city.label"
        :model-value="formData.spouse.address.city"
        @update:model-value="formData.spouse.address.city = $event"
        span="third"
      />
      <TextField
        name="spouse_address_street_addr1"
        label-key="usVisa.fields.spouse_address_street_addr1.label"
        :model-value="formData.spouse.address.street_addr1"
        @update:model-value="formData.spouse.address.street_addr1 = $event"
        span="half"
      />
      <TextField
        name="spouse_address_zip_code"
        label-key="usVisa.fields.spouse_address_zip_code.label"
        :model-value="formData.spouse.address.zip_code"
        @update:model-value="formData.spouse.address.zip_code = $event"
        span="third"
      />
    </template>
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
}

.conditional-group {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 0;
  margin-top: 0;
}

.repeatable-group {
  grid-column: span 4;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid hsl(188 40% 65% / 0.22);
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s, border-color 0.2s, background 0.2s;
}
.repeatable-group:hover {
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  border-color: hsl(188 40% 60% / 0.38);
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

.remove-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  color: hsl(var(--destructive, 0 84% 60%));
  background: hsl(var(--destructive, 0 84% 60%) / 0.08);
  border: 1px solid hsl(var(--destructive, 0 84% 60%) / 0.3);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.remove-btn:hover {
  background: hsl(var(--destructive, 0 84% 60%) / 0.15);
  border-color: hsl(var(--destructive, 0 84% 60%));
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
  transition: background 0.15s, border-color 0.15s;
}
.add-btn:hover {
  background: hsl(var(--muted));
  border-color: hsl(var(--primary));
}

/* 平板端 */
@media (max-width: 1024px) {
  .conditional-group { grid-template-columns: repeat(2, 1fr); }
  :deep(.field-span-third) {
    grid-column: span 2;
  }
}
/* 手机端 */
@media (max-width: 768px) {
  .fields-grid,
  .conditional-group { grid-template-columns: 1fr; }
  :deep(.field-span-full),
  :deep(.field-span-half),
  :deep(.field-span-third) { grid-column: span 1; }
}
</style>
