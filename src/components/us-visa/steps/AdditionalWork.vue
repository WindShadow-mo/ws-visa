<script setup lang="ts">
// AdditionalWork — DS-160 Step 12 (v2): 附加工作/教育/培训

import { inject } from 'vue'
import type { USVisaFormData, LanguageEntry, TraveledCountry, OrganizationEntry, MilitaryServiceRecord } from '@/views/USVisaForm.vue'
import TextField from '@/components/fields/TextField.vue'
import NationalityField from '@/components/fields/NationalityField.vue'
import RadioField from '@/components/fields/RadioField.vue'
import DateField from '@/components/fields/DateField.vue'
import { usCountryOptions } from '@/config/usCountryOptions'
import { Plus, Trash2 } from '@lucide/vue'
import type { RadioOption } from '@/components/fields/RadioField.vue'

const formData = inject<USVisaFormData>('usVisaFormData')!
const { languages, traveled_countries, organizations, military_service } = inject<{
  languages: LanguageEntry[]
  traveled_countries: TraveledCountry[]
  organizations: OrganizationEntry[]
  military_service: MilitaryServiceRecord[]
}>('usVisaArrays')!

const yesNoOptions: RadioOption[] = [
  { value: 'yes', labelKey: 'usVisa.options.yesNo.yes' },
  { value: 'no', labelKey: 'usVisa.options.yesNo.no' },
]

function addLang() { languages.push({ name: '' }) }
function removeLang(i: number) { languages.splice(i, 1) }
function addCountry() { traveled_countries.push({ country: '' }) }
function removeCountry(i: number) { traveled_countries.splice(i, 1) }
function addOrg() { organizations.push({ name: '' }) }
function removeOrg(i: number) { organizations.splice(i, 1) }
function addMil() { military_service.push({ country: '', branch: '', rank: '', specialty: '', date_from: '', date_to: '' }) }
function removeMil(i: number) { military_service.splice(i, 1) }
</script>

<template>
  <div class="fields-grid">
    <!-- ======== 语言能力（始终可见）======== -->
    <h4 class="sub-label">{{ $t('usVisa.subLabels.languageList') }}</h4>
    <div v-for="(lang, i) in languages" :key="`lang-${i}`" class="repeatable-group">
      <div class="repeatable-header">
        <h4 class="sub-label">{{ $t('usVisa.subLabels.languageList') }} {{ i + 1 }}</h4>
        <button type="button" class="remove-btn" @click="removeLang(i)"><Trash2 :size="16" /></button>
      </div>
      <div class="fields-grid">
        <TextField :name="`lang_name_${i}`" label-key="usVisa.fields.languages_name.label" :model-value="lang.name" @update:model-value="lang.name = $event" :required="true" span="third" />
      </div>
    </div>
    <button type="button" class="add-btn" @click="addLang"><Plus :size="16" /> {{ $t('usVisa.addRow') }}</button>

    <!-- ======== 氏族/部落 ======== -->
    <RadioField name="has_clan" label-key="usVisa.fields.has_clan.label" :options="yesNoOptions" :model-value="formData.has_clan" @update:model-value="formData.has_clan = $event" />
    <div v-if="formData.has_clan === 'yes'" class="conditional-group">
      <TextField name="clan_name" label-key="usVisa.fields.clan_name.label" :model-value="formData.clan_name" @update:model-value="formData.clan_name = $event" :required="true" span="third" />
    </div>

    <!-- ======== 过去5年访问国家 ======== -->
    <RadioField name="has_traveled_5yr" label-key="usVisa.fields.has_traveled_5yr.label" :options="yesNoOptions" :model-value="formData.has_traveled_5yr" @update:model-value="formData.has_traveled_5yr = $event" />
    <div v-if="formData.has_traveled_5yr === 'yes'" class="conditional-group">
      <div v-for="(c, i) in traveled_countries" :key="`tc-${i}`" class="repeatable-group">
        <div class="repeatable-header">
          <h4 class="sub-label">{{ $t('usVisa.fields.traveled_countries_country.label') }} {{ i + 1 }}</h4>
          <button type="button" class="remove-btn" @click="removeCountry(i)"><Trash2 :size="16" /></button>
        </div>
        <div class="fields-grid">
          <NationalityField :name="`tc_country_${i}`" label-key="usVisa.fields.traveled_countries_country.label" :options="usCountryOptions" :model-value="c.country" @update:model-value="c.country = $event" :required="true" span="third" />
        </div>
      </div>
      <button type="button" class="add-btn" @click="addCountry"><Plus :size="16" /> {{ $t('usVisa.addRow') }}</button>
    </div>

    <!-- ======== 组织 ======== -->
    <RadioField name="has_organization" label-key="usVisa.fields.has_organization.label" :options="yesNoOptions" :model-value="formData.has_organization" @update:model-value="formData.has_organization = $event" />
    <div v-if="formData.has_organization === 'yes'" class="conditional-group">
      <div v-for="(org, i) in organizations" :key="`org-${i}`" class="repeatable-group">
        <div class="repeatable-header">
          <h4 class="sub-label">{{ $t('usVisa.fields.organizations_name.label') }} {{ i + 1 }}</h4>
          <button type="button" class="remove-btn" @click="removeOrg(i)"><Trash2 :size="16" /></button>
        </div>
        <div class="fields-grid">
          <TextField :name="`org_name_${i}`" label-key="usVisa.fields.organizations_name.label" :model-value="org.name" @update:model-value="org.name = $event" :required="true" span="third" />
        </div>
      </div>
      <button type="button" class="add-btn" @click="addOrg"><Plus :size="16" /> {{ $t('usVisa.addRow') }}</button>
    </div>

    <!-- ======== 军事服役 ======== -->
    <RadioField name="has_military_service" label-key="usVisa.fields.has_military_service.label" :options="yesNoOptions" :model-value="formData.has_military_service" @update:model-value="formData.has_military_service = $event" />
    <div v-if="formData.has_military_service === 'yes'" class="conditional-group">
      <div v-for="(m, i) in military_service" :key="`mil-${i}`" class="repeatable-group">
        <div class="repeatable-header">
          <h4 class="sub-label">{{ $t('usVisa.subLabelsRepeat.military', { N: i + 1 }) }}</h4>
          <button type="button" class="remove-btn" @click="removeMil(i)"><Trash2 :size="16" /></button>
        </div>
        <div class="fields-grid">
          <NationalityField :name="`mil_country_${i}`" label-key="usVisa.fields.mil_country.label" :options="usCountryOptions" :model-value="m.country" @update:model-value="m.country = $event" :required="true" span="third" />
          <TextField :name="`mil_branch_${i}`" label-key="usVisa.fields.mil_branch.label" :model-value="m.branch" @update:model-value="m.branch = $event" :required="true" span="third" />
          <TextField :name="`mil_rank_${i}`" label-key="usVisa.fields.mil_rank.label" :model-value="m.rank" @update:model-value="m.rank = $event" :required="true" span="third" />
          <TextField :name="`mil_specialty_${i}`" label-key="usVisa.fields.mil_specialty.label" :model-value="m.specialty" @update:model-value="m.specialty = $event" :required="true" span="third" />
          <DateField :name="`mil_from_${i}`" label-key="usVisa.fields.mil_date_from.label" :model-value="m.date_from" @update:model-value="m.date_from = $event" :required="true" span="third" />
          <DateField :name="`mil_to_${i}`" label-key="usVisa.fields.mil_date_to.label" :model-value="m.date_to" @update:model-value="m.date_to = $event" :required="true" span="third" />
        </div>
      </div>
      <button type="button" class="add-btn" @click="addMil"><Plus :size="16" /> {{ $t('usVisa.addRow') }}</button>
    </div>

    <!-- ======== 塔利班 ======== -->
    <RadioField name="has_taliban" label-key="usVisa.fields.has_taliban.label" :options="yesNoOptions" :model-value="formData.has_taliban" @update:model-value="formData.has_taliban = $event" />
    <div v-if="formData.has_taliban === 'yes'" class="conditional-group">
      <TextField name="taliban_explain" label-key="usVisa.fields.taliban_explain.label" :model-value="formData.taliban_explain" @update:model-value="formData.taliban_explain = $event" :rows="3" :required="true" span="full" />
    </div>

    <!-- ======== 专门技能 ======== -->
    <RadioField name="has_special_skills" label-key="usVisa.fields.has_special_skills.label" :options="yesNoOptions" :model-value="formData.has_special_skills" @update:model-value="formData.has_special_skills = $event" />
    <div v-if="formData.has_special_skills === 'yes'" class="conditional-group">
      <TextField name="special_skills_explain" label-key="usVisa.fields.special_skills_explain.label" :model-value="formData.special_skills_explain" @update:model-value="formData.special_skills_explain = $event" :rows="3" :required="true" span="full" />
    </div>

    <!-- ======== 准军事组织 ======== -->
    <RadioField name="has_paramilitary" label-key="usVisa.fields.has_paramilitary.label" :options="yesNoOptions" :model-value="formData.has_paramilitary" @update:model-value="formData.has_paramilitary = $event" />
    <div v-if="formData.has_paramilitary === 'yes'" class="conditional-group">
      <TextField name="paramilitary_explain" label-key="usVisa.fields.paramilitary_explain.label" :model-value="formData.paramilitary_explain" @update:model-value="formData.paramilitary_explain = $event" :rows="3" :required="true" span="full" />
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
