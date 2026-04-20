import type { HardwareInfo, Preset } from '@shared/types'

declare global {
  interface Window {
    api: {
      detectHardware(): Promise<HardwareInfo>
      openFileDialog(): Promise<{ canceled: boolean; filePaths: string[] }>
      readPresets(): Promise<Preset[]>
      writePresets(presets: Preset[]): Promise<void>
      readSettings(): Promise<Record<string, unknown>>
      writeSettings(settings: Record<string, unknown>): Promise<void>
      copyToClipboard(text: string): Promise<void>
    }
  }
}

export {}
