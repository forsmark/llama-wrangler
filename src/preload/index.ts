import { contextBridge, ipcRenderer } from 'electron'

// Expose a minimal API to the renderer process.
// Additional methods will be added here as features are implemented.
contextBridge.exposeInMainWorld('api', {
  ping: () => ipcRenderer.invoke('ping')
})
