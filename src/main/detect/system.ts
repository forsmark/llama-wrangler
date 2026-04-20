import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface SystemInfo {
  ramMB: number
  cpuThreads: number
  llamaServerPath: string | null
}

export async function detectSystem(): Promise<SystemInfo> {
  const [meminfo, nproc, whichLlama] = await Promise.allSettled([
    execAsync('cat /proc/meminfo'),
    execAsync('nproc'),
    execAsync('which llama-server')
  ])

  // Parse RAM from /proc/meminfo
  let ramMB = 0
  if (meminfo.status === 'fulfilled') {
    const match = meminfo.value.stdout.match(/MemTotal:\s+(\d+)\s+kB/)
    if (match) {
      ramMB = Math.round(parseInt(match[1], 10) / 1024)
    }
  }

  // Parse CPU thread count
  let cpuThreads = 1
  if (nproc.status === 'fulfilled') {
    const parsed = parseInt(nproc.value.stdout.trim(), 10)
    if (!isNaN(parsed)) cpuThreads = parsed
  }

  // Resolve llama-server path
  let llamaServerPath: string | null = null
  if (whichLlama.status === 'fulfilled') {
    const trimmed = whichLlama.value.stdout.trim()
    if (trimmed) llamaServerPath = trimmed
  }

  return { ramMB, cpuThreads, llamaServerPath }
}
