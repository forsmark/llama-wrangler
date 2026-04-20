import { create } from 'zustand'
import type { HardwareInfo, ParamValue, Preset } from '../../../shared/types'
import { llamaParams } from '../data/llama-params'
import { estimateVramMB, fitRatio } from '../data/fit-table'
import { buildCommand } from '../lib/build-command'

export interface SelectedModel {
  path: string | null
  sizeBillion: number | null
  quant: string | null
}

export interface AppState {
  // Slices
  params: Record<string, ParamValue>
  selectedModel: SelectedModel
  hardware: HardwareInfo | null
  presets: Preset[]

  // Actions
  setParam(flag: string, value: ParamValue): void
  resetParams(): void
  setSelectedModel(model: SelectedModel): void
  setHardware(hardware: HardwareInfo): void
  setPresets(presets: Preset[]): void

  // Derived (computed selectors)
  builtCommand(format: 'single' | 'multi'): string
  fitEstimate(): { estimatedVramMB: number | null; ratio: number | null }
}

// Initialize default params from llamaParams schema
const initDefaultParams = (): Record<string, ParamValue> => {
  const defaultParams: Record<string, ParamValue> = {}
  for (const def of llamaParams) {
    defaultParams[def.flag] = def.default
  }
  return defaultParams
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  params: initDefaultParams(),
  selectedModel: {
    path: null,
    sizeBillion: null,
    quant: null,
  },
  hardware: null,
  presets: [],

  // Actions
  setParam: (flag: string, value: ParamValue) =>
    set((state) => ({
      params: {
        ...state.params,
        [flag]: value,
      },
    })),

  resetParams: () =>
    set(() => ({
      params: initDefaultParams(),
    })),

  setSelectedModel: (model: SelectedModel) =>
    set(() => ({
      selectedModel: model,
    })),

  setHardware: (hardware: HardwareInfo) =>
    set(() => ({
      hardware,
    })),

  setPresets: (presets: Preset[]) =>
    set(() => ({
      presets,
    })),

  // Derived selectors
  builtCommand: (format: 'single' | 'multi'): string => {
    const { params, hardware, selectedModel } = get()
    const binaryPath = hardware?.llamaServerPath ?? ''

    // Merge selectedModel.path into params as '--model' value
    const mergedParams = { ...params }
    if (selectedModel.path) {
      mergedParams['--model'] = selectedModel.path
    }

    return buildCommand(binaryPath, mergedParams, llamaParams, format)
  },

  fitEstimate: (): { estimatedVramMB: number | null; ratio: number | null } => {
    const { selectedModel, hardware } = get()

    if (!selectedModel.sizeBillion || !selectedModel.quant) {
      return { estimatedVramMB: null, ratio: null }
    }

    const estimatedVramMB = estimateVramMB(
      selectedModel.sizeBillion,
      selectedModel.quant
    )
    const availableVramMB = hardware?.gpu.vramMB ?? null
    const ratio = availableVramMB
      ? fitRatio(estimatedVramMB, availableVramMB)
      : null

    return { estimatedVramMB, ratio }
  },
}))
