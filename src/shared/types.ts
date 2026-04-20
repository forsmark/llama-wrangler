// Shared types used by both main and renderer processes.

// HardwareInfo — result of running GPU/CPU/RAM detection
export interface HardwareInfo {
  gpu: {
    name: string | null
    vramMB: number | null
    arch: 'nvidia' | 'amd' | 'vulkan' | 'none'
    computeCap: string | null  // NVIDIA compute capability, e.g. "8.6"
  }
  ramMB: number
  cpuThreads: number
  llamaServerPath: string | null  // result of `which llama-server`
}

// What a parameter can hold
export type ParamValue = string | number | boolean | null

// A saved preset = GGUF path + param snapshot + human name
export interface Preset {
  id: string           // uuid or timestamp-based
  name: string
  ggufPath: string
  params: Record<string, ParamValue>
  createdAt: string    // ISO date string
}

// One entry in the parameter schema
export interface ParamDef {
  flag: string         // e.g. "--ctx-size"
  shortFlag?: string   // e.g. "-c"
  label: string        // human readable
  description: string
  type: 'number' | 'string' | 'boolean' | 'select'
  default: ParamValue
  min?: number
  max?: number
  options?: string[]   // for 'select' type
  group: 'essential' | 'performance' | 'sampling' | 'server' | 'cache' | 'misc'
  advanced: boolean    // true = hidden unless advanced toggle on
}
