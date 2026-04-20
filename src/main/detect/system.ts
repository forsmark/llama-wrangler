import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface SystemInfo {
  ramMB: number
  cpuThreads: number
  llamaServerPath: string | null
}

export async function detectSystem(): Promise<SystemInfo> {
  const isMac = process.platform === 'darwin'

  const [ramResult, cpuResult, whichLlama] = await Promise.allSettled([
    execAsync(isMac ? 'sysctl -n hw.memsize' : 'cat /proc/meminfo', { timeout: 5000 }),
    execAsync(isMac ? 'sysctl -n hw.logicalcpu' : 'nproc', { timeout: 5000 }),
    execAsync('which llama-server', { timeout: 5000 })
  ])

  let ramMB = 0
  if (ramResult.status === 'fulfilled') {
    if (isMac) {
      const bytes = parseInt(ramResult.value.stdout.trim(), 10)
      if (!isNaN(bytes)) ramMB = Math.round(bytes / (1024 * 1024))
    } else {
      const match = ramResult.value.stdout.match(/MemTotal:\s+(\d+)\s+kB/)
      if (match) ramMB = Math.round(parseInt(match[1], 10) / 1024)
    }
  }

  let cpuThreads = 1
  if (cpuResult.status === 'fulfilled') {
    const parsed = parseInt(cpuResult.value.stdout.trim(), 10)
    if (!isNaN(parsed)) cpuThreads = parsed
  }

  let llamaServerPath: string | null = null
  if (whichLlama.status === 'fulfilled') {
    const trimmed = whichLlama.value.stdout.trim()
    if (trimmed) llamaServerPath = trimmed
  }

  return { ramMB, cpuThreads, llamaServerPath }
}
