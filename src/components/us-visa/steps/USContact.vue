<script setup lang="ts">
// USContact — DS-160 Step 8: 美国联系人
// v2: 个人/组织分类逻辑 + 地址始终可见
// 字段 ID 对齐 docs/us-visa-ds160-form-design-v2.md §8

import { inject, computed } from 'vue'
import type { USVisaFormData } from '@/views/USVisaForm.vue'
import TextField from '@/components/fields/TextField.vue'
import SelectField from '@/components/fields/SelectField.vue'
import { relationshipOptions, usStatesOptions } from '@/config/usCountryOptions'

const formData = inject<USVisaFormData>('usVisaFormData')!

// 个人类: RELATIVE, SPOUSE, FRIEND
// 组织类: BUSINESS_ASSOCIATE, EMPLOYER, SCHOOL_OFFICIAL, OTHER
const isPersonalContact = computed(() => {
  const rel = formData.us_relationship
  return rel === 'RELATIVE' || rel === 'SPOUSE' || rel === 'FRIEND'
})

const isOrgContact = computed(() => {
  const rel = formData.us_relationship
  return rel === 'BUSINESS_ASSOCIATE' || rel === 'EMPLOYER' || rel === 'SCHOOL_OFFICIAL' || rel === 'OTHER'
})
</script>

<template>
  <div class="fields-grid">
    <!-- 关系 -->
    <SelectField
      name="us_relationship"
      label-key="usVisa.fields.us_relationship.label"
      :options="relationshipOptions"
      :model-value="formData.us_relationship"
      @update:model-value="formData.us_relationship = $event"
      :required="true"
      span="third"
    />

    <!-- 个人联系人: 姓名 -->
    <template v-if="isPersonalContact">
      <TextField
        name="us_contact_surname"
        label-key="usVisa.fields.us_contact_surname.label"
        :model-value="formData.us_contact.surname"
        @update:model-value="formData.us_contact.surname = $event"
        :required="true"
        span="third"
      />
      <TextField
        name="us_contact_given_name"
        label-key="usVisa.fields.us_contact_given_name.label"
        :model-value="formData.us_contact.given_name"
        @update:model-value="formData.us_contact.given_name = $event"
        :required="true"
        span="third"
      />
    </template>

    <!-- 组织联系人: 组织名 -->
    <template v-if="isOrgContact">
      <TextField
        name="us_contact_organization"
        label-key="usVisa.fields.us_contact_organization.label"
        :model-value="formData.us_contact.organization"
        @update:model-value="formData.us_contact.organization = $event"
        :required="true"
        span="half"
      />
    </template>

    <!-- 地址（始终可见） -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.usContactAddress') }}</h4>
    <SelectField
      name="us_contact_address_state"
      label-key="usVisa.fields.us_contact_address_state.label"
      :options="usStatesOptions"
      :model-value="formData.us_contact.address.state"
      @update:model-value="formData.us_contact.address.state = $event"
      :required="true"
      span="third"
    />
    <TextField
      name="us_contact_address_city"
      label-key="usVisa.fields.us_contact_address_city.label"
      :model-value="formData.us_contact.address.city"
      @update:model-value="formData.us_contact.address.city = $event"
      :required="true"
      span="third"
    />
    <TextField
      name="us_contact_address_street_addr1"
      label-key="usVisa.fields.us_contact_address_street_addr1.label"
      :model-value="formData.us_contact.address.street_addr1"
      @update:model-value="formData.us_contact.address.street_addr1 = $event"
      :required="true"
      span="half"
    />
    <TextField
      name="us_contact_address_zip_code"
      label-key="usVisa.fields.us_contact_address_zip_code.label"
      :model-value="formData.us_contact.address.zip_code"
      @update:model-value="formData.us_contact.address.zip_code = $event"
      :required="true"
      span="third"
    />

    <!-- 电话 + 邮箱 -->
    <TextField
      name="us_contact_phone"
      label-key="usVisa.fields.us_contact_phone.label"
      :model-value="formData.us_contact.phone"
      @update:model-value="formData.us_contact.phone = $event"
      :required="true"
      span="third"
    />
    <TextField
      name="us_contact_email"
      label-key="usVisa.fields.us_contact_email.label"
      :model-value="formData.us_contact.email"
      @update:model-value="formData.us_contact.email = $event"
      span="third"
    />
  </div>
</template>

<style scoped>
.fields-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; padding: 0.25rem; }
:deep(.field-span-full) { grid-column: span 4; }
:deep(.field-span-half) { grid-column: span 2; }
:deep(.field-span-third) { grid-column: span 1; }

.sub-label { grid-column: span 4; font-weight: 600; font-size: 0.875rem; color: #1e40af; margin: 1.25rem 0 0.75rem; padding: 0.375rem 0.75rem; background: linear-gradient(to right, #eff6ff, transparent); border-left: 3px solid #3b82f6; border-radius: 0 0.25rem 0.25rem 0; }

@media (max-width: 1024px) { :deep(.field-span-third) { grid-column: span 2; } }
@media (max-width: 768px) { .fields-grid { grid-template-columns: 1fr; } :deep(.field-span-full), :deep(.field-span-half), :deep(.field-span-third) { grid-column: span 1; } }
</style>
