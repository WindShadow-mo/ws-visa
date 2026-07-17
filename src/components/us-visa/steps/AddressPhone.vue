<script setup lang="ts">
// AddressPhone — DS-160 Step 6: 地址与联系方式
// v2: 家庭住址 + 电话 + 邮箱 + 其他联系方式 + 邮寄地址 + 社交媒体
// 字段 ID 对齐 docs/us-visa-ds160-form-design-v2.md §6

import { inject } from 'vue'
import type { USVisaFormData, OtherPhone, OtherEmail, SocialMediaEntry } from '@/views/USVisaForm.vue'
import TextField from '@/components/fields/TextField.vue'
import SelectField from '@/components/fields/SelectField.vue'
import NationalityField from '@/components/fields/NationalityField.vue'
import RadioField from '@/components/fields/RadioField.vue'
import type { RadioOption } from '@/components/fields/RadioField.vue'
import { usCountryOptions, socialMediaOptions } from '@/config/usCountryOptions'
import { Plus, Trash2 } from '@lucide/vue'

const formData = inject<USVisaFormData>('usVisaFormData')!
const arrays = inject<{
  other_phones: OtherPhone[]
  other_emails: OtherEmail[]
  social_media: SocialMediaEntry[]
  other_social: SocialMediaEntry[]
}>('usVisaArrays')!

const yesNoOptions: RadioOption[] = [
  { value: 'yes', labelKey: 'usVisa.options.yesNo.yes' },
  { value: 'no', labelKey: 'usVisa.options.yesNo.no' },
]

function addOtherPhone() { arrays.other_phones.push({ number: '' }) }
function removeOtherPhone(i: number) { arrays.other_phones.splice(i, 1) }
function addOtherEmail() { arrays.other_emails.push({ email: '' }) }
function removeOtherEmail(i: number) { arrays.other_emails.splice(i, 1) }
function addSocialMedia() { arrays.social_media.push({ platform: '', username: '' }) }
function removeSocialMedia(i: number) { arrays.social_media.splice(i, 1) }
function addOtherSocial() { arrays.other_social.push({ platform: '', username: '' }) }
function removeOtherSocial(i: number) { arrays.other_social.splice(i, 1) }
</script>

<template>
  <div class="fields-grid">
    <!-- L2: 家庭住址 -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.homeAddress') }}</h4>
    <NationalityField name="home_addr_country" label-key="usVisa.fields.home_addr_country.label" :options="usCountryOptions" :model-value="formData.home_addr.country" @update:model-value="formData.home_addr.country = $event" :required="true" span="third" />
    <TextField name="home_addr_state" label-key="usVisa.fields.home_addr_state.label" :model-value="formData.home_addr.state" @update:model-value="formData.home_addr.state = $event" :required="true" span="third" />
    <TextField name="home_addr_city" label-key="usVisa.fields.home_addr_city.label" :model-value="formData.home_addr.city" @update:model-value="formData.home_addr.city = $event" :required="true" span="third" />
    <TextField name="home_addr_street_addr1" label-key="usVisa.fields.home_addr_street_addr1.label" :model-value="formData.home_addr.street_addr1" @update:model-value="formData.home_addr.street_addr1 = $event" :required="true" span="half" />
    <TextField name="home_addr_zip_code" label-key="usVisa.fields.home_addr_zip_code.label" :model-value="formData.home_addr.zip_code" @update:model-value="formData.home_addr.zip_code = $event" :required="true" span="third" />

    <!-- L2: 联系电话 -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.phone') }}</h4>
    <TextField name="phone_primary" label-key="usVisa.fields.phone_primary.label" :model-value="formData.phone_primary" @update:model-value="formData.phone_primary = $event" :required="true" span="third" />
    <TextField name="phone_secondary" label-key="usVisa.fields.phone_secondary.label" :model-value="formData.phone_secondary" @update:model-value="formData.phone_secondary = $event" span="third" />
    <TextField name="phone_work" label-key="usVisa.fields.phone_work.label" :model-value="formData.phone_work" @update:model-value="formData.phone_work = $event" span="third" />

    <!-- L2: 电子邮箱 -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.emailSection') }}</h4>
    <TextField name="email" label-key="usVisa.fields.email.label" :model-value="formData.email" @update:model-value="formData.email = $event" :required="true" span="third" />
    <TextField name="email_confirm" label-key="usVisa.fields.email_confirm.label" :model-value="formData.email_confirm" @update:model-value="formData.email_confirm = $event" :required="true" span="third" />

    <!-- L2: 其他联系方式 -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.otherContact') }}</h4>
    <RadioField name="has_other_phones" label-key="usVisa.fields.has_other_phones.label" :options="yesNoOptions" :model-value="formData.has_other_phones" @update:model-value="formData.has_other_phones = $event" :required="true" />
    <template v-if="formData.has_other_phones === 'yes'">
      <div class="conditional-group">
        <div v-for="(phone, i) in arrays.other_phones" :key="i" class="repeatable-group">
          <div class="repeatable-header">
            <span class="repeatable-label">{{ i + 1 }}</span>
            <button type="button" class="remove-btn" @click="removeOtherPhone(i)"><Trash2 :size="16" /></button>
          </div>
          <div class="fields-grid">
            <TextField :name="`other_phone_number_${i}`" label-key="usVisa.fields.other_phone_number.label" :model-value="phone.number" @update:model-value="phone.number = $event" :required="true" span="third" />
          </div>
        </div>
        <button type="button" class="add-btn" @click="addOtherPhone"><Plus :size="16" />{{ $t('usVisa.addRow') }}</button>
      </div>
    </template>

    <RadioField name="has_other_emails" label-key="usVisa.fields.has_other_emails.label" :options="yesNoOptions" :model-value="formData.has_other_emails" @update:model-value="formData.has_other_emails = $event" :required="true" />
    <template v-if="formData.has_other_emails === 'yes'">
      <div class="conditional-group">
        <div v-for="(em, i) in arrays.other_emails" :key="i" class="repeatable-group">
          <div class="repeatable-header">
            <span class="repeatable-label">{{ i + 1 }}</span>
            <button type="button" class="remove-btn" @click="removeOtherEmail(i)"><Trash2 :size="16" /></button>
          </div>
          <div class="fields-grid">
            <TextField :name="`other_email_${i}`" label-key="usVisa.fields.other_email.label" :model-value="em.email" @update:model-value="em.email = $event" :required="true" span="third" />
          </div>
        </div>
        <button type="button" class="add-btn" @click="addOtherEmail"><Plus :size="16" />{{ $t('usVisa.addRow') }}</button>
      </div>
    </template>

    <!-- L2: 邮寄地址 -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.mailingAddress') }}</h4>
    <div class="conditional-group">
      <label class="checkbox-label">
        <input
          type="checkbox"
          :checked="formData.mailing_different"
          @change="formData.mailing_different = ($event.target as HTMLInputElement).checked"
        />
        <span>{{ $t('usVisa.fields.mailing_different.label') }}</span>
      </label>
      <template v-if="formData.mailing_different">
        <NationalityField name="mailing_addr_country" label-key="usVisa.fields.mailing_addr_country.label" :options="usCountryOptions" :model-value="formData.mailing_addr.country" @update:model-value="formData.mailing_addr.country = $event" :required="true" span="third" />
        <TextField name="mailing_addr_state" label-key="usVisa.fields.mailing_addr_state.label" :model-value="formData.mailing_addr.state" @update:model-value="formData.mailing_addr.state = $event" :required="true" span="third" />
        <TextField name="mailing_addr_city" label-key="usVisa.fields.mailing_addr_city.label" :model-value="formData.mailing_addr.city" @update:model-value="formData.mailing_addr.city = $event" :required="true" span="third" />
        <TextField name="mailing_addr_street_addr1" label-key="usVisa.fields.mailing_addr_street_addr1.label" :model-value="formData.mailing_addr.street_addr1" @update:model-value="formData.mailing_addr.street_addr1 = $event" :required="true" span="half" />
        <TextField name="mailing_addr_zip_code" label-key="usVisa.fields.mailing_addr_zip_code.label" :model-value="formData.mailing_addr.zip_code" @update:model-value="formData.mailing_addr.zip_code = $event" :required="true" span="third" />
      </template>
    </div>

    <!-- L2: 社交媒体 -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.socialMedia') }}</h4>
    <div v-for="(sm, i) in arrays.social_media" :key="i" class="repeatable-group">
      <div class="repeatable-header">
        <span class="repeatable-label">{{ i + 1 }}</span>
        <button type="button" class="remove-btn" @click="removeSocialMedia(i)"><Trash2 :size="16" /></button>
      </div>
      <div class="fields-grid">
        <SelectField :name="`social_media_platform_${i}`" label-key="usVisa.fields.social_media_platform.label" :options="socialMediaOptions" :model-value="sm.platform" @update:model-value="sm.platform = $event" :required="true" span="third" />
        <TextField v-if="sm.platform && sm.platform !== 'NONE'" :name="`social_media_username_${i}`" label-key="usVisa.fields.social_media_username.label" :model-value="sm.username" @update:model-value="sm.username = $event" :required="true" span="half" />
      </div>
    </div>
    <button type="button" class="add-btn" @click="addSocialMedia"><Plus :size="16" />{{ $t('usVisa.addRow') }}</button>

    <RadioField name="has_other_social_media" label-key="usVisa.fields.has_other_social_media.label" :options="yesNoOptions" :model-value="formData.has_other_social_media" @update:model-value="formData.has_other_social_media = $event" :required="true" />
    <template v-if="formData.has_other_social_media === 'yes'">
      <div class="conditional-group">
        <div v-for="(os, i) in arrays.other_social" :key="i" class="repeatable-group">
          <div class="repeatable-header">
            <span class="repeatable-label">{{ i + 1 }}</span>
            <button type="button" class="remove-btn" @click="removeOtherSocial(i)"><Trash2 :size="16" /></button>
          </div>
          <div class="fields-grid">
          <TextField :name="`other_social_platform_${i}`" label-key="usVisa.fields.other_social_platform.label" :model-value="os.platform" @update:model-value="os.platform = $event" :required="true" span="third" />
          <TextField :name="`other_social_username_${i}`" label-key="usVisa.fields.other_social_username.label" :model-value="os.username" @update:model-value="os.username = $event" :required="true" span="half" />
          </div>
        </div>
        <button type="button" class="add-btn" @click="addOtherSocial"><Plus :size="16" />{{ $t('usVisa.addRow') }}</button>
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
.repeatable-label { font-size: 0.8125rem; color: hsl(var(--muted-foreground)); }

.checkbox-label { display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.875rem; grid-column: span 4; }
.checkbox-label input[type="checkbox"] { width: 1rem; height: 1rem; cursor: pointer; }

.add-btn { grid-column: span 4; display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; font-size: 0.8125rem; font-weight: 500; color: hsl(var(--primary)); background: hsl(var(--muted) / 0.5); border: 1px dashed hsl(var(--primary) / 0.4); border-radius: 0.5rem; cursor: pointer; margin-top: 0.5rem; }
.add-btn:hover { background: hsl(var(--muted)); border-color: hsl(var(--primary)); }
.remove-btn { display: inline-flex; align-items: center; padding: 0.25rem 0.625rem; font-size: 0.75rem; color: hsl(var(--destructive, 0 84% 60%)); background: hsl(var(--destructive, 0 84% 60%) / 0.08); border: 1px solid hsl(var(--destructive, 0 84% 60%) / 0.3); border-radius: 0.375rem; cursor: pointer; }
.remove-btn:hover { background: hsl(var(--destructive, 0 84% 60%) / 0.15); }

@media (max-width: 1024px) { .conditional-group { grid-template-columns: repeat(2, 1fr); } :deep(.field-span-third) { grid-column: span 2; } }
@media (max-width: 768px) { .fields-grid, .conditional-group { grid-template-columns: 1fr; } :deep(.field-span-full), :deep(.field-span-half), :deep(.field-span-third) { grid-column: span 1; } }
</style>
