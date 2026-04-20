import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '../../state/store'
import { llamaParams } from '../../data/llama-params'

// Build the expected initial params from the schema (mirrors initDefaultParams in store.ts)
function defaultParams(): Record<string, import('@shared/types').ParamValue> {
  const params: Record<string, import('@shared/types').ParamValue> = {}
  for (const def of llamaParams) {
    params[def.flag] = def.default
  }
  return params
}

const initialSelectedModel = { path: null, sizeBillion: null, quant: null }

describe('AppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      params: defaultParams(),
      selectedModel: initialSelectedModel,
      hardware: null,
      presets: [],
    })
  })

  it('initializes params from llamaParams defaults', () => {
    const { params } = useAppStore.getState()
    // Spot-check a few known defaults
    expect(params['--ctx-size']).toBe(2048)
    expect(params['--host']).toBe('127.0.0.1')
    expect(params['--port']).toBe(8080)
    expect(params['--n-gpu-layers']).toBe(0)
    expect(params['--model']).toBe('')
    // All keys from schema should be present
    for (const def of llamaParams) {
      expect(params).toHaveProperty(def.flag)
      expect(params[def.flag]).toBe(def.default)
    }
  })

  it('setParam updates a single param without affecting others', () => {
    const { setParam } = useAppStore.getState()
    setParam('--ctx-size', 8192)

    const { params } = useAppStore.getState()
    expect(params['--ctx-size']).toBe(8192)
    // Other params untouched
    expect(params['--host']).toBe('127.0.0.1')
    expect(params['--port']).toBe(8080)
    expect(params['--model']).toBe('')
  })

  it('resetParams restores all defaults', () => {
    const { setParam, resetParams } = useAppStore.getState()
    // Mutate several params
    setParam('--ctx-size', 16384)
    setParam('--host', '0.0.0.0')
    setParam('--n-gpu-layers', 35)

    resetParams()

    const { params } = useAppStore.getState()
    expect(params['--ctx-size']).toBe(2048)
    expect(params['--host']).toBe('127.0.0.1')
    expect(params['--n-gpu-layers']).toBe(0)
  })

  it('builtCommand returns correct command string', () => {
    const { setParam, builtCommand } = useAppStore.getState()
    setParam('--ctx-size', 4096)

    const cmd = builtCommand('single')
    // Falls back to 'llama-server' when no llamaServerPath (hardware is null)
    expect(cmd).toContain('llama-server')
    expect(cmd).toContain('--ctx-size 4096')
  })

  it('builtCommand includes model path when selectedModel.path is set', () => {
    useAppStore.setState({
      selectedModel: { path: '/models/llama.gguf', sizeBillion: 7, quant: 'Q4_K_M' },
    })

    const { builtCommand } = useAppStore.getState()
    const cmd = builtCommand('single')
    expect(cmd).toContain('--model /models/llama.gguf')
  })

  it('fitEstimate returns null when no model selected', () => {
    const { fitEstimate } = useAppStore.getState()
    const result = fitEstimate()
    expect(result.estimatedVramMB).toBeNull()
    expect(result.ratio).toBeNull()
  })

  it('fitEstimate returns ratio when model and hardware are set', () => {
    useAppStore.setState({
      selectedModel: { path: '/models/llama.gguf', sizeBillion: 7, quant: 'Q4_K_M' },
      hardware: {
        gpu: { name: 'RTX 4090', vramMB: 24576, arch: 'nvidia', computeCap: '8.9' },
        ramMB: 65536,
        cpuThreads: 16,
        llamaServerPath: '/usr/local/bin/llama-server',
      },
    })

    const { fitEstimate } = useAppStore.getState()
    const result = fitEstimate()
    expect(result.estimatedVramMB).not.toBeNull()
    expect(result.estimatedVramMB).toBeGreaterThan(0)
    expect(result.ratio).not.toBeNull()
    expect(result.ratio).toBeGreaterThan(0)
    // 7B Q4_K_M on a 24GB card should fit (ratio < 1)
    expect(result.ratio).toBeLessThan(1.0)
  })
})
