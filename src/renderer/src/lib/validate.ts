import type { ParamDef, ParamValue } from '../../../shared/types'

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateParam(def: ParamDef, value: ParamValue): ValidationResult {
  // null → always valid (use default, omit from command)
  if (value === null) {
    return { valid: true }
  }

  switch (def.type) {
    case 'boolean': {
      if (typeof value !== 'boolean') {
        return { valid: false, error: `Expected boolean for ${def.flag}` }
      }
      return { valid: true }
    }

    case 'number': {
      if (typeof value !== 'number' || isNaN(value)) {
        return { valid: false, error: `Expected number for ${def.flag}` }
      }
      if (def.min !== undefined && value < def.min) {
        return { valid: false, error: `${def.flag} must be ≥ ${def.min}` }
      }
      if (def.max !== undefined && value > def.max) {
        return { valid: false, error: `${def.flag} must be ≤ ${def.max}` }
      }
      return { valid: true }
    }

    case 'string': {
      if (typeof value !== 'string') {
        return { valid: false, error: `Expected string for ${def.flag}` }
      }
      // Non-empty required unless default is "" (empty string default = optional)
      if (value === '' && def.default !== '') {
        return { valid: false, error: `${def.flag} must not be empty` }
      }
      return { valid: true }
    }

    case 'select': {
      if (!def.options || !def.options.includes(String(value))) {
        return {
          valid: false,
          error: `${def.flag} must be one of: ${def.options?.join(', ')}`,
        }
      }
      return { valid: true }
    }

    default:
      return { valid: true }
  }
}
