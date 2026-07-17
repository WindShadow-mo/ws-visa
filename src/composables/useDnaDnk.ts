// useDnaDnk — Does Not Apply / Do Not Know 复选框逻辑
// 勾选 DNA 时 emit 'N/A' 并禁用输入；勾选 DNK 时 emit 'DNC' 并禁用输入
// 取消勾选时恢复之前保存的值

import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'

export function useDnaDnk(
  modelValue: Ref<string>,
  emit: (event: 'update:modelValue', value: string) => void,
  props: { doesNotApply?: boolean; doNotKnow?: boolean },
) {
  const isDnaChecked = ref(false)
  const isDnkChecked = ref(false)
  const preservedValue = ref('')

  function toggleDna(checked: boolean | 'indeterminate') {
    const isChecked = checked === true
    if (isChecked) {
      if (isDnkChecked.value) isDnkChecked.value = false
      preservedValue.value = modelValue.value === 'N/A' || modelValue.value === 'DNC'
        ? ''
        : modelValue.value
      isDnaChecked.value = true
      emit('update:modelValue', 'N/A')
    } else {
      isDnaChecked.value = false
      const restored = preservedValue.value || ''
      preservedValue.value = ''
      emit('update:modelValue', restored)
    }
  }

  function toggleDnk(checked: boolean | 'indeterminate') {
    const isChecked = checked === true
    if (isChecked) {
      if (isDnaChecked.value) isDnaChecked.value = false
      preservedValue.value = modelValue.value === 'N/A' || modelValue.value === 'DNC'
        ? ''
        : modelValue.value
      isDnkChecked.value = true
      emit('update:modelValue', 'DNC')
    } else {
      isDnkChecked.value = false
      const restored = preservedValue.value || ''
      preservedValue.value = ''
      emit('update:modelValue', restored)
    }
  }

  const isDisabled: ComputedRef<boolean> = computed(() => isDnaChecked.value || isDnkChecked.value)

  // Sync checkbox state when modelValue changes externally (e.g. test data fill)
  watch(modelValue, (val) => {
    if (val === 'N/A') {
      isDnaChecked.value = true
      isDnkChecked.value = false
    } else if (val === 'DNC') {
      isDnkChecked.value = true
      isDnaChecked.value = false
    } else if (!isDnaChecked.value && !isDnkChecked.value && !preservedValue.value) {
      // ponytail: only capture when no value is already preserved — prevents external
      // fills (e.g. mock data) from overwriting the user's original value that was
      // saved before DNA/DNK was checked
      preservedValue.value = val
    }
  })

  return { isDnaChecked, isDnkChecked, isDisabled, toggleDna, toggleDnk }
}
