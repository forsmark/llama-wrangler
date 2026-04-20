import { describe, it, expect } from 'vitest'
import { parseGgufFilename } from '../parse-gguf-name'

describe('parseGgufFilename', () => {
  it('parses gemma-4-26B-A4B-it-Q4_K_M.gguf', () => {
    const result = parseGgufFilename('gemma-4-26B-A4B-it-Q4_K_M.gguf')
    expect(result.sizeBillion).toBe(26)
    expect(result.quant).toBe('Q4_K_M')
  })

  it('parses Meta-Llama-3.1-8B-Instruct-Q6_K.gguf', () => {
    const result = parseGgufFilename('Meta-Llama-3.1-8B-Instruct-Q6_K.gguf')
    expect(result.sizeBillion).toBe(8)
    expect(result.quant).toBe('Q6_K')
  })

  it('parses mistral-7b-instruct-v0.2.Q4_0.gguf', () => {
    const result = parseGgufFilename('mistral-7b-instruct-v0.2.Q4_0.gguf')
    expect(result.sizeBillion).toBe(7)
    expect(result.quant).toBe('Q4_0')
  })

  it('parses Mixtral-8x7B-Instruct-v0.1-Q5_K_M.gguf (MoE: 8×7=56)', () => {
    const result = parseGgufFilename('Mixtral-8x7B-Instruct-v0.1-Q5_K_M.gguf')
    expect(result.sizeBillion).toBe(56)
    expect(result.quant).toBe('Q5_K_M')
  })

  it('parses phi-3-mini-4k-instruct-q4.gguf (no clear size)', () => {
    const result = parseGgufFilename('phi-3-mini-4k-instruct-q4.gguf')
    expect(result.sizeBillion).toBeNull()
    expect(result.quant).toBe('Q4')
  })

  it('parses model.gguf (no size, no quant)', () => {
    const result = parseGgufFilename('model.gguf')
    expect(result.sizeBillion).toBeNull()
    expect(result.quant).toBeNull()
  })

  it('strips directory path and parses basename only', () => {
    const result = parseGgufFilename('/home/user/models/gemma-4-26B-A4B-it-Q4_K_M.gguf')
    expect(result.sizeBillion).toBe(26)
    expect(result.quant).toBe('Q4_K_M')
  })
})
