import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { readJson, writeJson } from '../../../../main/storage/json-store'
import { join } from 'path'
import { tmpdir } from 'os'
import { rm, writeFile, access } from 'fs/promises'

describe('json-store', () => {
  let testFile: string

  beforeEach(() => {
    testFile = join(tmpdir(), `test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`)
  })

  afterEach(async () => {
    await rm(testFile, { force: true })
    await rm(`${testFile}.tmp`, { force: true })
    await rm(`${testFile}.bak`, { force: true })
  })

  it('writes and reads back the same data', async () => {
    const data = { name: 'llama', value: 42, nested: { ok: true } }
    await writeJson(testFile, data)
    const result = await readJson(testFile, null)
    expect(result).toEqual(data)
  })

  it('returns defaultValue when file does not exist', async () => {
    const defaultValue = { missing: true }
    const result = await readJson('/tmp/definitely-does-not-exist-abc123.json', defaultValue)
    expect(result).toEqual(defaultValue)
  })

  it('returns defaultValue and creates .bak file when JSON is corrupt', async () => {
    // Write corrupt JSON directly
    await writeFile(testFile, '{ this is not valid json !!!', 'utf-8')

    const defaultValue = { fallback: true }
    const result = await readJson(testFile, defaultValue)
    expect(result).toEqual(defaultValue)

    // The .bak file should have been created
    await expect(access(`${testFile}.bak`)).resolves.toBeUndefined()
  })

  it('atomic write: temp file does not remain after write', async () => {
    await writeJson(testFile, { hello: 'world' })

    // .tmp file should be gone after successful write
    const tmpExists = await access(`${testFile}.tmp`).then(() => true).catch(() => false)
    expect(tmpExists).toBe(false)
  })

  it('handles complex nested objects', async () => {
    const complex = {
      params: { '--ctx-size': 4096, '--model': '/path/to/model.gguf', '--flash-attn': true },
      presets: [{ id: '1', name: 'fast', ggufPath: '/a.gguf', params: {}, createdAt: '2026-01-01' }],
      hardware: null,
      meta: { version: 2, tags: ['a', 'b', 'c'] },
    }
    await writeJson(testFile, complex)
    const result = await readJson(testFile, null)
    expect(result).toEqual(complex)
  })
})
