import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface VulkanInfo {
  name: string
  vramMB: number
}

export async function detectVulkan(): Promise<VulkanInfo | null> {
  try {
    const { stdout } = await execAsync('vulkaninfo --summary')

    const lines = stdout.split('\n')

    let name: string | null = null
    let vramMB: number | null = null

    // Find deviceName
    for (const line of lines) {
      const deviceNameMatch = line.match(/deviceName\s*=\s*(.+)/)
      if (deviceNameMatch) {
        name = deviceNameMatch[1].trim()
        break
      }
    }

    // Find memory heaps section: look for a heap with DEVICE_LOCAL flag and get its size
    // vulkaninfo --summary output looks like:
    //   Heaps:
    //     memHeaps[0] = 8192 MiB (size = 8589934592, flags = DEVICE_LOCAL_BIT)
    let inHeapsSection = false
    let deviceLocalBytes: number | null = null

    for (const line of lines) {
      if (/Heaps:/i.test(line)) {
        inHeapsSection = true
        continue
      }

      if (inHeapsSection) {
        // Match heap entry with size and flags
        const heapMatch = line.match(/memHeaps\[\d+\].*size\s*=\s*(\d+).*DEVICE_LOCAL/i)
        if (heapMatch) {
          deviceLocalBytes = parseInt(heapMatch[1], 10)
          break
        }

        // Stop if we hit another top-level section
        if (/^\S/.test(line) && !/memHeaps/.test(line)) {
          inHeapsSection = false
        }
      }
    }

    if (!name || deviceLocalBytes === null || isNaN(deviceLocalBytes)) return null

    vramMB = Math.round(deviceLocalBytes / (1024 * 1024))
    return { name, vramMB }
  } catch {
    return null
  }
}
