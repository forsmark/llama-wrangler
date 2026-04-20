import { ipcMain, dialog, clipboard } from 'electron'
import type { Preset } from '../../../shared/types'
import { detect } from '../detect/index'
import { readJson, writeJson } from '../storage/json-store'
import { presetsPath, settingsPath } from '../storage/paths'

export function registerHandlers(): void {
  ipcMain.handle('detect-hardware', () => {
    return detect()
  })

  ipcMain.handle('open-file-dialog', () => {
    return dialog.showOpenDialog({
      filters: [{ name: 'GGUF', extensions: ['gguf'] }],
      properties: ['openFile']
    })
  })

  ipcMain.handle('read-presets', () => {
    return readJson<Preset[]>(presetsPath(), [])
  })

  ipcMain.handle('write-presets', (_event, presets: Preset[]) => {
    if (!Array.isArray(presets)) return
    return writeJson(presetsPath(), presets)
  })

  ipcMain.handle('read-settings', () => {
    return readJson<Record<string, unknown>>(settingsPath(), {})
  })

  ipcMain.handle('write-settings', (_event, settings: Record<string, unknown>) => {
    if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) return
    return writeJson(settingsPath(), settings)
  })

  ipcMain.handle('copy-to-clipboard', (_event, text: string) => {
    if (typeof text !== 'string') return
    clipboard.writeText(text)
  })
}
