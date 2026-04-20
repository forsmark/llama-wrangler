import { describe, it, expect } from 'vitest'
import { validateParam } from '../validate'
import type { ParamDef } from '@shared/types'

// Helper factories
function numberDef(overrides: Partial<ParamDef> = {}): ParamDef {
  return {
    flag: '--ctx-size',
    label: 'Context size',
    description: 'Test',
    type: 'number',
    default: 2048,
    min: 512,
    max: 131072,
    group: 'essential',
    advanced: false,
    ...overrides,
  }
}

function boolDef(overrides: Partial<ParamDef> = {}): ParamDef {
  return {
    flag: '--flash-attn',
    label: 'Flash attention',
    description: 'Test',
    type: 'boolean',
    default: false,
    group: 'performance',
    advanced: false,
    ...overrides,
  }
}

function stringDef(overrides: Partial<ParamDef> = {}): ParamDef {
  return {
    flag: '--host',
    label: 'Host',
    description: 'Test',
    type: 'string',
    default: '127.0.0.1',
    group: 'server',
    advanced: false,
    ...overrides,
  }
}

function selectDef(overrides: Partial<ParamDef> = {}): ParamDef {
  return {
    flag: '--cache-type-k',
    label: 'K cache type',
    description: 'Test',
    type: 'select',
    default: 'f16',
    options: ['f32', 'f16', 'q8_0', 'q4_0'],
    group: 'cache',
    advanced: false,
    ...overrides,
  }
}

describe('validateParam', () => {
  describe('null values', () => {
    it('null is always valid for number param', () => {
      expect(validateParam(numberDef(), null)).toEqual({ valid: true })
    })

    it('null is always valid for boolean param', () => {
      expect(validateParam(boolDef(), null)).toEqual({ valid: true })
    })

    it('null is always valid for string param', () => {
      expect(validateParam(stringDef(), null)).toEqual({ valid: true })
    })

    it('null is always valid for select param', () => {
      expect(validateParam(selectDef(), null)).toEqual({ valid: true })
    })
  })

  describe('number validation', () => {
    it('valid number within range', () => {
      expect(validateParam(numberDef(), 4096)).toEqual({ valid: true })
    })

    it('number below min is invalid', () => {
      const result = validateParam(numberDef(), 100)
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('number above max is invalid', () => {
      const result = validateParam(numberDef(), 999999)
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('NaN is invalid', () => {
      const result = validateParam(numberDef(), NaN)
      expect(result.valid).toBe(false)
    })

    it('float param valid within range (no integer check)', () => {
      const def = numberDef({ flag: '--temp', min: 0, max: 2, default: 0.8 })
      expect(validateParam(def, 1.5)).toEqual({ valid: true })
    })
  })

  describe('select validation', () => {
    it('valid option is valid', () => {
      expect(validateParam(selectDef(), 'f16')).toEqual({ valid: true })
    })

    it('invalid option is invalid', () => {
      const result = validateParam(selectDef(), 'invalid-option')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('boolean validation', () => {
    it('true is valid', () => {
      expect(validateParam(boolDef(), true)).toEqual({ valid: true })
    })

    it('false is valid', () => {
      expect(validateParam(boolDef(), false)).toEqual({ valid: true })
    })

    it('string instead of boolean is invalid', () => {
      const result = validateParam(boolDef(), 'true')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('number instead of boolean is invalid', () => {
      const result = validateParam(boolDef(), 1)
      expect(result.valid).toBe(false)
    })
  })

  describe('string validation', () => {
    it('non-empty string is valid', () => {
      expect(validateParam(stringDef(), '0.0.0.0')).toEqual({ valid: true })
    })

    it('empty string is invalid when default is non-empty', () => {
      const result = validateParam(stringDef({ default: '127.0.0.1' }), '')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('empty string is valid when default is empty (optional field)', () => {
      // e.g. --api-key has default ''
      const def = stringDef({ flag: '--api-key', default: '' })
      expect(validateParam(def, '')).toEqual({ valid: true })
    })
  })
})
