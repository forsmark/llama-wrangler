import type { HardwareInfo } from '../../../shared/types'
import { detectNvidia } from './nvidia'
import { detectRocm } from './rocm'
import { detectVulkan } from './vulkan'
import { detectSystem } from './system'

export async function detect(): Promise<HardwareInfo> {
  const [nvidia, rocm, vulkan, system] = await Promise.all([
    detectNvidia(),
    detectRocm(),
    detectVulkan(),
    detectSystem()
  ])

  let gpu: HardwareInfo['gpu']

  if (nvidia) {
    gpu = {
      name: nvidia.name,
      vramMB: nvidia.vramMB,
      arch: 'nvidia',
      computeCap: nvidia.computeCap
    }
  } else if (rocm) {
    gpu = {
      name: rocm.name,
      vramMB: rocm.vramMB,
      arch: 'amd',
      computeCap: null
    }
  } else if (vulkan) {
    gpu = {
      name: vulkan.name,
      vramMB: vulkan.vramMB,
      arch: 'vulkan',
      computeCap: null
    }
  } else {
    gpu = {
      name: null,
      vramMB: null,
      arch: 'none',
      computeCap: null
    }
  }

  return {
    gpu,
    ramMB: system.ramMB,
    cpuThreads: system.cpuThreads,
    llamaServerPath: system.llamaServerPath
  }
}
