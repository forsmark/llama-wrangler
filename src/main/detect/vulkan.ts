import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface VulkanInfo {
  name: string
  vramMB: number
}

export async function detectVulkan(): Promise<VulkanInfo | null> {
  try {
    const { stdout } = await execAsync('vulkaninfo --summary', { timeout: 5000 })

    const lines = stdout.split('\n')

    // Find deviceName — appears on a line like:
    //         deviceName     = NVIDIA GeForce RTX 4090
    let name: string | null = null
    for (const line of lines) {
      const deviceNameMatch = line.match(/deviceName\s*=\s*(.+)/)
      if (deviceNameMatch) {
        name = deviceNameMatch[1].trim()
        break
      }
    }

    // Parse memory heaps using multi-line format:
    //   memHeaps[0]:
    //     size   = 8589934592
    //     budget = ...
    //     flags  = { DEVICE_LOCAL_BIT }
    let currentSize: number | null = null
    let currentIsDeviceLocal = false
    let deviceLocalBytes: number | null = null

    for (const line of lines) {
      if (/memHeaps\[\d+\]:/.test(line)) {
        // New heap section — reset tracking state
        currentSize = null
        currentIsDeviceLocal = false
        continue
      }

      const sizeMatch = line.match(/size\s*=\s*(\d+)/)
      if (sizeMatch) {
        currentSize = parseInt(sizeMatch[1], 10)
        continue
      }

      const flagsMatch = line.match(/flags\s*=/)
      if (flagsMatch) {
        if (/DEVICE_LOCAL/i.test(line)) {
          currentIsDeviceLocal = true
        }
        // flags line is the last field we care about — check if this heap qualifies
        if (currentIsDeviceLocal && currentSize !== null && !isNaN(currentSize)) {
          deviceLocalBytes = currentSize
          break
        }
      }
    }

    if (!name || deviceLocalBytes === null) return null

    const vramMB = Math.round(deviceLocalBytes / (1024 * 1024))
    return { name, vramMB }
  } catch {
    return null
  }
}
