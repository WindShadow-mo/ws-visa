// tests/types/schema.test.ts
// Schema 类型编译验证测试
// 验证 exampleSchema 符合 FormSchema 类型定义

import { describe, it, expect } from 'vitest'
import { exampleSchema } from '@/schemas/example'

describe('exampleSchema', () => {
  it('should be defined and have correct id', () => {
    expect(exampleSchema.id).toBe('example-visa')
  })

  it('should have correct version', () => {
    expect(exampleSchema.version).toBe('1.0.0')
  })

  it('should have non-empty groups array', () => {
    expect(exampleSchema.groups).toBeDefined()
    expect(Array.isArray(exampleSchema.groups)).toBe(true)
    expect(exampleSchema.groups.length).toBeGreaterThan(0)
  })

  it('should have fields in the first group', () => {
    const firstGroup = exampleSchema.groups[0]
    expect(firstGroup.name).toBe('personalInfo')
    expect(firstGroup.titleKey).toBe('schema.groups.personalInfo')
    expect(firstGroup.fields).toBeDefined()
    expect(firstGroup.fields.length).toBe(4)
  })

  it('should have correct field types (discriminated union)', () => {
    const fields = exampleSchema.groups[0].fields

    const lastName = fields.find((f) => f.name === 'lastName')
    expect(lastName).toBeDefined()
    expect(lastName!.type).toBe('text')

    const firstName = fields.find((f) => f.name === 'firstName')
    expect(firstName).toBeDefined()
    expect(firstName!.type).toBe('text')

    const dateOfBirth = fields.find((f) => f.name === 'dateOfBirth')
    expect(dateOfBirth).toBeDefined()
    expect(dateOfBirth!.type).toBe('date')

    const nationality = fields.find((f) => f.name === 'nationality')
    expect(nationality).toBeDefined()
    expect(nationality!.type).toBe('select')
  })

  it('should have required fields marked correctly', () => {
    const fields = exampleSchema.groups[0].fields

    const lastName = fields.find((f) => f.name === 'lastName')
    expect(lastName!.required).toBe(true)

    const firstName = fields.find((f) => f.name === 'firstName')
    expect(firstName!.required).toBe(true)

    const dateOfBirth = fields.find((f) => f.name === 'dateOfBirth')
    expect(dateOfBirth!.required).toBe(true)

    const nationality = fields.find((f) => f.name === 'nationality')
    expect(nationality!.required).toBe(true)
  })

  it('should have select options for nationality field', () => {
    const fields = exampleSchema.groups[0].fields
    const nationality = fields.find((f) => f.name === 'nationality')
    expect(nationality).toBeDefined()

    if (nationality!.type === 'select') {
      expect(nationality!.options).toBeDefined()
      expect(nationality!.options.length).toBe(2)
      expect(nationality!.options[0].value).toBe('CN')
      expect(nationality!.options[0].labelKey).toBe('options.nationality.CN')
      expect(nationality!.options[1].value).toBe('US')
      expect(nationality!.options[1].labelKey).toBe('options.nationality.US')
    }
  })

  it('should satisfy FormSchema type (compilation-time check)', () => {
    // This test validates at runtime that the structure matches FormSchema.
    // The `as const satisfies FormSchema` in example.ts provides compile-time validation.
    // Here we verify the expected shape:
    expect(typeof exampleSchema.id).toBe('string')
    expect(typeof exampleSchema.version).toBe('string')
    expect(Array.isArray(exampleSchema.groups)).toBe(true)

    for (const group of exampleSchema.groups) {
      expect(typeof group.name).toBe('string')
      expect(typeof group.titleKey).toBe('string')
      expect(Array.isArray(group.fields)).toBe(true)

      for (const field of group.fields) {
        expect(typeof field.name).toBe('string')
        expect(typeof field.labelKey).toBe('string')
        expect(typeof field.type).toBe('string')
      }
    }
  })
})
