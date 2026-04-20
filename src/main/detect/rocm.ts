import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface RocmInfo {
  name: string
  vramMB: number
}

export async function detectRocm(): Promise<RocmInfo | null> {
  try {
    const { stdout } = await execAsync('rocm-smi --showmeminfo vram --showproductname')

    const lines = stdout.split('\n')

    let name: string | null = null
    let vramBytes: number | null = null

    for (const line of lines) {
      // Look for Card series line
      const cardSeriesMatch = line.match(/Card\s+series\s*:\s*(.+)/i)
      if (cardSeriesMatch) {
        name = cardSeriesMatch[1].trim()
        continue
      }

      // Look for Total Memory line (in bytes)
      const memMatch = line.match(/Total\s+Memory\s+\(B\)\s*:\s*(\d+)/i)
      if (memMatch) {
        vramBytes = parseInt(memMatch[1], 10)
        continue
      }
    }

    if (!name || vramBytes === null || isNaN(vramBytes)) return null

    const vramMB = Math.round(vramBytes / (1024 * 1024))
    return { name, vramMB }
  } catch {
    return null
  }
}
