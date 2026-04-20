import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface AppleGpuInfo {
  name: string
  vramMB: number
}

export async function detectApple(ramMB: number): Promise<AppleGpuInfo | null> {
  if (process.platform !== 'darwin') return null

  try {
    const { stdout } = await execAsync('sysctl -n machdep.cpu.brand_string', { timeout: 5000 })
    const brand = stdout.trim()
    if (!brand.startsWith('Apple')) return null
    // Apple Silicon uses unified memory — GPU can access all system RAM
    return { name: brand, vramMB: ramMB }
  } catch {
    return null
  }
}
