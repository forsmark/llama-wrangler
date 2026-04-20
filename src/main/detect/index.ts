import type { HardwareInfo } from '../../../shared/types'
import { detectNvidia } from './nvidia'
import { detectRocm } from './rocm'
import { detectVulkan } from './vulkan'
import { detectSystem } from './system'
import { detectApple } from './apple'

export async function detect(): Promise<HardwareInfo> {
  const system = await detectSystem()

  const [nvidia, rocm, vulkan, apple] = await Promise.all([
    detectNvidia(),
    detectRocm(),
    detectVulkan(),
    detectApple(system.ramMB)
  ])

  let gpu: HardwareInfo['gpu']

  if (nvidia) {
    gpu = { name: nvidia.name, vramMB: nvidia.vramMB, arch: 'nvidia', computeCap: nvidia.computeCap }
  } else if (rocm) {
    gpu = { name: rocm.name, vramMB: rocm.vramMB, arch: 'amd', computeCap: null }
  } else if (vulkan) {
    gpu = { name: vulkan.name, vramMB: vulkan.vramMB, arch: 'vulkan', computeCap: null }
  } else if (apple) {
    gpu = { name: apple.name, vramMB: apple.vramMB, arch: 'apple', computeCap: null }
  } else {
    gpu = { name: null, vramMB: null, arch: 'none', computeCap: null }
  }

  return {
    gpu,
    ramMB: system.ramMB,
    cpuThreads: system.cpuThreads,
    llamaServerPath: system.llamaServerPath
  }
}
