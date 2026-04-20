import { app } from 'electron'
import { join } from 'path'

export function presetsPath(): string {
  return join(app.getPath('userData'), 'presets.json')
}

export function settingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}
