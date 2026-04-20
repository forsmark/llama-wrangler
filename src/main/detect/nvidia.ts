import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface NvidiaInfo {
  name: string
  vramMB: number
  computeCap: string
}

export async function detectNvidia(): Promise<NvidiaInfo | null> {
  try {
    const { stdout } = await execAsync(
      'nvidia-smi --query-gpu=name,memory.total,compute_cap --format=csv,noheader,nounits'
    )

    const firstLine = stdout.trim().split('\n')[0]
    if (!firstLine) return null

    const parts = firstLine.split(',').map((s) => s.trim())
    if (parts.length < 3) return null

    const [name, memStr, computeCap] = parts
    const vramMB = parseInt(memStr, 10)

    if (!name || isNaN(vramMB) || !computeCap) return null

    return { name, vramMB, computeCap }
  } catch {
    return null
  }
}
