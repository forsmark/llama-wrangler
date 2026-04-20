import { readFile, writeFile, rename } from 'fs/promises'

export async function readJson<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const contents = await readFile(filePath, 'utf-8')
    try {
      return JSON.parse(contents) as T
    } catch {
      // Corrupt JSON — back up and return default
      await rename(filePath, `${filePath}.bak`).catch(() => {})
      return defaultValue
    }
  } catch (err: unknown) {
    // File not found or other read error — return default
    if (isNodeError(err) && err.code === 'ENOENT') {
      return defaultValue
    }
    return defaultValue
  }
}

export async function writeJson<T>(filePath: string, data: T): Promise<void> {
  const tmpPath = `${filePath}.tmp`
  await writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8')
  await rename(tmpPath, filePath)
}

function isNodeError(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && 'code' in err
}
