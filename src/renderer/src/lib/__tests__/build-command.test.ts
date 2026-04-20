import { describe, it, expect } from 'vitest'
import { buildCommand } from '../build-command'
import { llamaParams } from '../../data/llama-params'

// Build a default params map from the schema
function defaultParams(): Record<string, import('@shared/types').ParamValue> {
  const params: Record<string, import('@shared/types').ParamValue> = {}
  for (const def of llamaParams) {
    params[def.flag] = def.default
  }
  return params
}

describe('buildCommand', () => {
  it('emits binary only when all params are default', () => {
    const params = defaultParams()
    const result = buildCommand('/usr/local/bin/llama-server', params, llamaParams, 'single')
    expect(result).toBe('/usr/local/bin/llama-server')
  })

  it('omits default values', () => {
    const params = defaultParams()
    // Set --ctx-size to its default (2048); should not appear
    params['--ctx-size'] = 2048
    const result = buildCommand('llama-server', params, llamaParams, 'single')
    expect(result).not.toContain('--ctx-size')
  })

  it('emits boolean flag bare when true', () => {
    const params = defaultParams()
    params['--flash-attn'] = true // default is false
    const result = buildCommand('llama-server', params, llamaParams, 'single')
    expect(result).toContain('--flash-attn')
    // Bare flag — no value after it
    expect(result).not.toMatch(/--flash-attn\s+\S/)
  })

  it('skips boolean flag when false', () => {
    const params = defaultParams()
    params['--flash-attn'] = false // same as default
    const result = buildCommand('llama-server', params, llamaParams, 'single')
    expect(result).not.toContain('--flash-attn')
  })

  it('quotes model path with spaces', () => {
    const params = defaultParams()
    params['--model'] = '/home/user/my models/llama.gguf'
    const result = buildCommand('llama-server', params, llamaParams, 'single')
    expect(result).toContain('--model "/home/user/my models/llama.gguf"')
  })

  it('single format joins with spaces', () => {
    const params = defaultParams()
    params['--flash-attn'] = true
    params['--ctx-size'] = 4096
    const result = buildCommand('llama-server', params, llamaParams, 'single')
    // Should not contain newlines
    expect(result).not.toContain('\n')
    expect(result).toContain(' ')
  })

  it('multi format uses backslash continuations', () => {
    const params = defaultParams()
    params['--flash-attn'] = true
    params['--ctx-size'] = 4096
    const result = buildCommand('llama-server', params, llamaParams, 'multi')
    expect(result).toContain(' \\\n  ')
  })

  it('falls back to llama-server when binaryPath is empty', () => {
    const params = defaultParams()
    const result = buildCommand('', params, llamaParams, 'single')
    expect(result).toBe('llama-server')
  })

  it('emits non-default number params', () => {
    const params = defaultParams()
    params['--ctx-size'] = 8192 // default is 2048
    const result = buildCommand('llama-server', params, llamaParams, 'single')
    expect(result).toContain('--ctx-size 8192')
  })

  it('emits non-default string params', () => {
    const params = defaultParams()
    params['--host'] = '0.0.0.0' // default is '127.0.0.1'
    const result = buildCommand('llama-server', params, llamaParams, 'single')
    expect(result).toContain('--host 0.0.0.0')
  })
})
