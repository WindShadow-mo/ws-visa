<script setup lang="ts">
// TravelCompanions — DS-160 Step 4: 同行人员
// v2: companions[] 可重复组 + is_group_travel 条件
// 字段 ID 对齐 docs/us-visa-ds160-form-design-v2.md §4

import { inject } from 'vue'
import type { USVisaFormData, Companion } from '@/views/USVisaForm.vue'
import TextField from '@/components/fields/TextField.vue'
import SelectField from '@/components/fields/SelectField.vue'
import RadioField from '@/components/fields/RadioField.vue'
import type { RadioOption } from '@/components/fields/RadioField.vue'
import type { SelectOption } from '@/components/fields/SelectField.vue'
import { relationshipOptions } from '@/config/usCountryOptions'
import { Plus, Trash2 } from '@lucide/vue'

const formData = inject<USVisaFormData>('usVisaFormData')!
const arrays = inject<{ companions: Companion[] }>('usVisaArrays')!

const yesNoOptions: RadioOption[] = [
  { value: 'yes', labelKey: 'usVisa.options.yesNo.yes' },
  { value: 'no', labelKey: 'usVisa.options.yesNo.no' },
]

function createCompanion(): Companion {
  return { surname: '', given_name: '', relationship: '' }
}

function addCompanion() {
  arrays.companions.push(createCompanion())
}

function removeCompanion(index: number) {
  arrays.companions.splice(index, 1)
}
</script>

<template>
  <div class="fields-grid">
    <!-- has_travel_companions -->
    <RadioField
      name="has_travel_companions"
      label-key="usVisa.fields.has_travel_companions.label"
      :options="yesNoOptions"
      :model-value="formData.has_travel_companions"
      @update:model-value="formData.has_travel_companions = $event"
      :required="true"
    />

    <template v-if="formData.has_travel_companions === 'yes'">
      <div class="conditional-group">
        <!-- is_group_travel（始终显示） -->
        <RadioField
          name="is_group_travel"
          label-key="usVisa.fields.is_group_travel.label"
          :options="yesNoOptions"
          :model-value="formData.is_group_travel"
          @update:model-value="formData.is_group_travel = $event"
          :required="true"
        />

        <!-- =yes → 团体名称 -->
        <template v-if="formData.is_group_travel === 'yes'">
          <TextField
            name="group_name"
            label-key="usVisa.fields.group_name.label"
            :model-value="formData.group_name"
            @update:model-value="formData.group_name = $event"
            :required="true"
            span="half"
          />
        </template>

        <!-- =no → 同行人员列表 -->
        <template v-if="formData.is_group_travel === 'no'">
          <p class="companion-help-text">{{ $t('usVisa.fields.companion_list_help.helpText') }}</p>
          <!-- companions[] 可重复组 -->
          <div
            v-for="(companion, index) in arrays.companions"
            :key="index"
            class="repeatable-group"
          >
            <div class="repeatable-header">
              <h4 class="sub-label">{{ $t('usVisa.subLabelsRepeat.companion') }} {{ index + 1 }}</h4>
              <button type="button" class="remove-btn" @click="removeCompanion(index)">
                <Trash2 :size="16" />
              </button>
            </div>
            <div class="fields-grid">
              <TextField
                :name="`companion_surname_${index}`"
                label-key="usVisa.fields.companion_surname.label"
                :model-value="companion.surname"
                @update:model-value="companion.surname = $event"
                :required="true"
                span="third"
              />
              <TextField
                :name="`companion_given_name_${index}`"
                label-key="usVisa.fields.companion_given_name.label"
                :model-value="companion.given_name"
                @update:model-value="companion.given_name = $event"
                :required="true"
                span="third"
              />
              <SelectField
                :name="`companion_relationship_${index}`"
                label-key="usVisa.fields.companion_relationship.label"
                :options="relationshipOptions"
                :model-value="companion.relationship"
                @update:model-value="companion.relationship = $event"
                :required="true"
                span="third"
              />
            </div>
          </div>
          <button type="button" class="add-btn" @click="addCompanion">
            <Plus :size="16" />
            {{ $t('usVisa.addRow') }}
          </button>
        </template>
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

.companion-help-text {
  grid-column: 1 / -1;
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground, 215 16% 47%));
  margin: 0;
  padding: 0.25rem 0;
}

@media (max-width: 768px) {
  .fields-grid,
  .conditional-group { grid-template-columns: 1fr; }
  :deep(.field-span-full),
  :deep(.field-span-half),
  :deep(.field-span-third) { grid-column: span 1; }
}
</style>
