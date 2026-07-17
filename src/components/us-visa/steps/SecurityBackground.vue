<script setup lang="ts">
// SecurityBackground — DS-160 Step 13: 安全与背景审查
// 32 个 Yes/No 问题，分 5 个 Part，选 Yes 时显示 Explain textarea

import { inject } from 'vue'
import type { USVisaFormData } from '@/views/USVisaForm.vue'
import TextField from '@/components/fields/TextField.vue'
import RadioField from '@/components/fields/RadioField.vue'
import type { RadioOption } from '@/components/fields/RadioField.vue'

const formData = inject<USVisaFormData>('usVisaFormData')!

// ---- 选项 ----

const yesNoOptions: RadioOption[] = [
  { value: 'yes', labelKey: 'usVisa.options.yesNo.yes' },
  { value: 'no', labelKey: 'usVisa.options.yesNo.no' },
]

// ---- 32 个安全问题，分 5 个 Part ----

interface SecurityQuestion {
  num: number
  part: number
  key: string
  partLabelKey?: string
}

const securityQuestions: SecurityQuestion[] = [
  // Part 1 — 健康相关（3 题）
  { num: 1, part: 1, key: 'usVisa.security.q1', partLabelKey: 'usVisa.security.part1' },
  { num: 2, part: 1, key: 'usVisa.security.q2' },
  { num: 3, part: 1, key: 'usVisa.security.q3' },
  // Part 2 — 犯罪/贩运（7 题）
  { num: 4, part: 2, key: 'usVisa.security.q4', partLabelKey: 'usVisa.security.part2' },
  { num: 5, part: 2, key: 'usVisa.security.q5' },
  { num: 6, part: 2, key: 'usVisa.security.q6' },
  { num: 7, part: 2, key: 'usVisa.security.q7' },
  { num: 8, part: 2, key: 'usVisa.security.q8' },
  { num: 9, part: 2, key: 'usVisa.security.q9' },
  { num: 10, part: 2, key: 'usVisa.security.q10' },
  // Part 3 — 恐怖主义/人权（12 题）
  { num: 11, part: 3, key: 'usVisa.security.q11', partLabelKey: 'usVisa.security.part3' },
  { num: 12, part: 3, key: 'usVisa.security.q12' },
  { num: 13, part: 3, key: 'usVisa.security.q13' },
  { num: 14, part: 3, key: 'usVisa.security.q14' },
  { num: 15, part: 3, key: 'usVisa.security.q15' },
  { num: 16, part: 3, key: 'usVisa.security.q16' },
  { num: 17, part: 3, key: 'usVisa.security.q17' },
  { num: 18, part: 3, key: 'usVisa.security.q18' },
  { num: 19, part: 3, key: 'usVisa.security.q19' },
  { num: 20, part: 3, key: 'usVisa.security.q20' },
  { num: 21, part: 3, key: 'usVisa.security.q21' },
  { num: 22, part: 3, key: 'usVisa.security.q22' },
  // Part 4 — 移民违规（5 题）
  { num: 23, part: 4, key: 'usVisa.security.q23', partLabelKey: 'usVisa.security.part4' },
  { num: 24, part: 4, key: 'usVisa.security.q24' },
  { num: 25, part: 4, key: 'usVisa.security.q25' },
  { num: 26, part: 4, key: 'usVisa.security.q26' },
  { num: 27, part: 4, key: 'usVisa.security.q27' },
  // Part 5 — 公民身份/监护权/投票/学生/交流访问者（5 题）
  { num: 28, part: 5, key: 'usVisa.security.q28', partLabelKey: 'usVisa.security.part5' },
  { num: 29, part: 5, key: 'usVisa.security.q29' },
  { num: 30, part: 5, key: 'usVisa.security.q30' },
  { num: 31, part: 5, key: 'usVisa.security.q31' },
  { num: 32, part: 5, key: 'usVisa.security.q32' },
]

// ---- 初始化 securityAnswers ----

function ensureAnswer(num: number) {
  if (!formData.securityAnswers[num]) {
    formData.securityAnswers[num] = { answer: '', explain: '' }
  }
  return formData.securityAnswers[num]
}
</script>

<template>
  <div class="fields-grid">
    <template v-for="q in securityQuestions" :key="q.num">
      <!-- Part sub-heading -->
      <h4 v-if="q.partLabelKey" class="sub-label">
        {{ $t(q.partLabelKey) }}
      </h4>

      <!-- Question with Yes/No radio -->
      <RadioField
        :name="`securityQ${q.num}`"
        :label-key="q.key"
        :options="yesNoOptions"
        :model-value="ensureAnswer(q.num).answer"
        @update:model-value="ensureAnswer(q.num).answer = $event"
        :required="true"
      />

      <!-- Explain textarea when answer is 'yes' -->
      <div v-if="ensureAnswer(q.num).answer === 'yes'" class="conditional-group">
        <TextField
          :name="`securityExplain${q.num}`"
          label-key="usVisa.fields.securityExplain.label"
          :model-value="ensureAnswer(q.num).explain"
          @update:model-value="ensureAnswer(q.num).explain = $event"
          :rows="3"
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

:deep(.field-span-full) {
  grid-column: span 4;
}

.sub-label {
  grid-column: span 4;
  font-size: 0.9rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0.75rem 0 0;
  padding: 0;
  border: none;
  background: none;
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
  :deep(.field-span-full) {
    grid-column: span 4;
  }
}

@media (max-width: 768px) {
  .fields-grid,
  .conditional-group { grid-template-columns: 1fr; }
  :deep(.field-span-full) { grid-column: span 1; }
}
</style>
