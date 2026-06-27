// tests/fields/fields.test.ts
// 字段组件渲染测试 — 覆盖全部 6 个字段组件

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import zhCN from '@/locales/zh-CN.json'
import en from '@/locales/en.json'

import TextField from '@/components/fields/TextField.vue'
import NumberField from '@/components/fields/NumberField.vue'
import SelectField from '@/components/fields/SelectField.vue'
import RadioField from '@/components/fields/RadioField.vue'
import CheckboxField from '@/components/fields/CheckboxField.vue'
import DateField from '@/components/fields/DateField.vue'

import type {
  TextFieldDef,
  NumberFieldDef,
  SelectFieldDef,
  RadioFieldDef,
  CheckboxFieldDef,
  DateFieldDef,
} from '@/types/schema'

// 创建测试用 i18n 实例（使用真实翻译文件）
function createTestI18n(locale: 'zh-CN' | 'en' = 'en') {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'zh-CN',
    messages: {
      'zh-CN': zhCN,
      en: en,
    },
  })
}

// 字段定义 fixtures
const textFieldDef: TextFieldDef = {
  name: 'lastName',
  type: 'text',
  labelKey: 'schema.fields.lastName',
  placeholderKey: 'common.placeholders.enterText',
  required: true,
}

const numberFieldDef: NumberFieldDef = {
  name: 'age',
  type: 'number',
  labelKey: 'schema.fields.firstName', // 复用现有 key
  min: 0,
  max: 150,
}

const selectFieldDef: SelectFieldDef = {
  name: 'nationality',
  type: 'select',
  labelKey: 'schema.fields.nationality',
  required: true,
  options: [
    { value: 'CN', labelKey: 'options.nationality.CN' },
    { value: 'US', labelKey: 'options.nationality.US' },
  ],
}

const radioFieldDef: RadioFieldDef = {
  name: 'gender',
  type: 'radio',
  labelKey: 'schema.fields.nationality', // 复用现有 key
  options: [
    { value: 'male', labelKey: 'options.nationality.CN' },
    { value: 'female', labelKey: 'options.nationality.US' },
  ],
}

const checkboxFieldDef: CheckboxFieldDef = {
  name: 'hobbies',
  type: 'checkbox',
  labelKey: 'schema.fields.nationality', // 复用现有 key
  options: [
    { value: 'reading', labelKey: 'options.nationality.CN' },
    { value: 'sports', labelKey: 'options.nationality.US' },
  ],
}

const dateFieldDef: DateFieldDef = {
  name: 'dateOfBirth',
  type: 'date',
  labelKey: 'schema.fields.dateOfBirth',
  required: true,
}

describe('TextField', () => {
  it('should render with translated label', () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(TextField, {
      props: { field: textFieldDef, modelValue: '' },
      global: { plugins: [i18n] },
    })
    expect(wrapper.text()).toContain('Last Name')
  })

  it('should render with zh-CN translated label', () => {
    const i18n = createTestI18n('zh-CN')
    const wrapper = mount(TextField, {
      props: { field: textFieldDef, modelValue: '' },
      global: { plugins: [i18n] },
    })
    expect(wrapper.text()).toContain('姓')
  })

  it('should emit update:modelValue on input', async () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(TextField, {
      props: { field: textFieldDef, modelValue: '' },
      global: { plugins: [i18n] },
    })
    const input = wrapper.find('input')
    await input.setValue('Zhang')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['Zhang'])
  })

  it('should show required marker when required', () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(TextField, {
      props: { field: textFieldDef, modelValue: '' },
      global: { plugins: [i18n] },
    })
    expect(wrapper.text()).toContain('*')
  })

  it('should show error message when error is provided', () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(TextField, {
      props: { field: textFieldDef, modelValue: '', error: 'This field is required' },
      global: { plugins: [i18n] },
    })
    expect(wrapper.text()).toContain('This field is required')
  })
})

describe('NumberField', () => {
  it('should render with translated label', () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(NumberField, {
      props: { field: numberFieldDef, modelValue: undefined },
      global: { plugins: [i18n] },
    })
    expect(wrapper.text()).toContain('First Name')
  })

  it('should accept number value', () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(NumberField, {
      props: { field: numberFieldDef, modelValue: 25 },
      global: { plugins: [i18n] },
    })
    const input = wrapper.find('input')
    expect(input.element.value).toBe('25')
  })
})

describe('SelectField', () => {
  it('should render with translated label', () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(SelectField, {
      props: { field: selectFieldDef, modelValue: '' },
      global: { plugins: [i18n] },
    })
    expect(wrapper.text()).toContain('Nationality')
  })

  it('should have select trigger with placeholder', () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(SelectField, {
      props: { field: selectFieldDef, modelValue: '' },
      global: { plugins: [i18n] },
    })
    // SelectContent is teleported, so we verify the trigger renders with placeholder
    const trigger = wrapper.find('[role="combobox"]')
    expect(trigger.exists()).toBe(true)
    expect(wrapper.text()).toContain('Select an option')
  })
})

describe('RadioField', () => {
  it('should render with translated label', () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(RadioField, {
      props: { field: radioFieldDef, modelValue: '' },
      global: { plugins: [i18n] },
    })
    expect(wrapper.text()).toContain('Nationality')
  })

  it('should render radio options with translated labels', () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(RadioField, {
      props: { field: radioFieldDef, modelValue: '' },
      global: { plugins: [i18n] },
    })
    expect(wrapper.html()).toContain('China')
    expect(wrapper.html()).toContain('United States')
  })

  it('should have radio buttons for each option', () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(RadioField, {
      props: { field: radioFieldDef, modelValue: '' },
      global: { plugins: [i18n] },
    })
    // reka-ui RadioGroupItem renders as button[role="radio"]
    const radios = wrapper.findAll('[role="radio"]')
    expect(radios.length).toBe(2)
  })

  it('should emit update:modelValue when an option is selected', async () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(RadioField, {
      props: { field: radioFieldDef, modelValue: '' },
      global: { plugins: [i18n] },
    })
    const radios = wrapper.findAll('[role="radio"]')
    await radios[0].trigger('click')
    // RadioGroup emits update:modelValue
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })
})

describe('CheckboxField', () => {
  it('should render with translated label', () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(CheckboxField, {
      props: { field: checkboxFieldDef, modelValue: [] },
      global: { plugins: [i18n] },
    })
    expect(wrapper.text()).toContain('Nationality')
  })

  it('should render checkbox options with translated labels', () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(CheckboxField, {
      props: { field: checkboxFieldDef, modelValue: [] },
      global: { plugins: [i18n] },
    })
    expect(wrapper.html()).toContain('China')
    expect(wrapper.html()).toContain('United States')
  })

  it('should have checkboxes for each option', () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(CheckboxField, {
      props: { field: checkboxFieldDef, modelValue: [] },
      global: { plugins: [i18n] },
    })
    // reka-ui CheckboxRoot renders as button[role="checkbox"]
    const checkboxes = wrapper.findAll('[role="checkbox"]')
    expect(checkboxes.length).toBe(2)
  })

  it('should accept modelValue prop as string array', () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(CheckboxField, {
      props: {
        field: checkboxFieldDef,
        modelValue: ['reading'],
      },
      global: { plugins: [i18n] },
    })
    // Verify component renders correctly with non-empty modelValue
    const checkboxes = wrapper.findAll('[role="checkbox"]')
    expect(checkboxes.length).toBe(2)
    // Component should render without errors
    expect(wrapper.text()).toContain('China')
    expect(wrapper.text()).toContain('United States')
  })
})

describe('DateField', () => {
  it('should render with translated label', () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(DateField, {
      props: { field: dateFieldDef, modelValue: '' },
      global: { plugins: [i18n] },
    })
    expect(wrapper.text()).toContain('Date of Birth')
  })

  it('should display placeholder when no value is set', () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(DateField, {
      props: { field: dateFieldDef, modelValue: '' },
      global: { plugins: [i18n] },
    })
    expect(wrapper.text()).toContain('Select a date')
  })

  it('should display formatted date when value is set', () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(DateField, {
      props: { field: dateFieldDef, modelValue: '2026-06-27' },
      global: { plugins: [i18n] },
    })
    // formatDisplayDate('2026-06-27', 'en') → "06/27/2026"
    expect(wrapper.text()).toContain('06/27/2026')
  })

  it('should display formatted date in zh-CN', () => {
    const i18n = createTestI18n('zh-CN')
    const wrapper = mount(DateField, {
      props: { field: dateFieldDef, modelValue: '2026-06-27' },
      global: { plugins: [i18n] },
    })
    // formatDisplayDate('2026-06-27', 'zh-CN') → "2026年6月27日"
    expect(wrapper.text()).toContain('2026年')
  })

  it('should show required marker when required', () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(DateField, {
      props: { field: dateFieldDef, modelValue: '' },
      global: { plugins: [i18n] },
    })
    expect(wrapper.text()).toContain('*')
  })
})
