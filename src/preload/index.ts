import { contextBridge, ipcRenderer } from 'electron'
import type { HardwareInfo, Preset } from '../shared/types'

// Fully typed IPC API exposed to the renderer process via contextBridge.
// All methods return Promises corresponding to ipcRenderer.invoke() calls.
const api = {
  // Detect GPU, CPU, RAM, and installed llama-server
  detectHardware(): Promise<HardwareInfo> {
    return ipcRenderer.invoke('detect-hardware')
  },

  // Open a file dialog to select a GGUF model file
  openFileDialog(): Promise<{ canceled: boolean; filePaths: string[] }> {
    return ipcRenderer.invoke('open-file-dialog')
  },

  // Read all saved presets from storage
  readPresets(): Promise<Preset[]> {
    return ipcRenderer.invoke('read-presets')
  },

  // Write presets to storage
  writePresets(presets: Preset[]): Promise<void> {
    return ipcRenderer.invoke('write-presets', presets)
  },

  // Read application settings
  readSettings(): Promise<Record<string, unknown>> {
    return ipcRenderer.invoke('read-settings')
  },

  // Write application settings
  writeSettings(settings: Record<string, unknown>): Promise<void> {
    return ipcRenderer.invoke('write-settings', settings)
  },

  // Copy text to system clipboard
  copyToClipboard(text: string): Promise<void> {
    return ipcRenderer.invoke('copy-to-clipboard', text)
  }
}

contextBridge.exposeInMainWorld('api', api)
