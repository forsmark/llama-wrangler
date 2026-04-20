import { useEffect, useState } from 'react'
import { useAppStore } from '@renderer/state/store'
import { TooltipProvider } from '@renderer/components/ui/tooltip'
import HardwarePanel from '@renderer/features/hardware'
import ModelPicker from '@renderer/features/model'
import ParamsPanel from '@renderer/features/params'
import FitBadge from '@renderer/features/fit'
import CommandPanel from '@renderer/features/command'
import PresetsPanel from '@renderer/features/presets'

export default function App(): JSX.Element {
  const setHardware = useAppStore((s) => s.setHardware)
  const setPresets = useAppStore((s) => s.setPresets)
  const hardware = useAppStore((s) => s.hardware)

  const [detectingHardware, setDetectingHardware] = useState(true)

  useEffect(() => {
    // 1. Detect hardware
    window.api
      .detectHardware()
      .then((result) => {
        setHardware(result)
      })
      .catch((err) => {
        console.error('Hardware detection failed:', err)
      })
      .finally(() => {
        setDetectingHardware(false)
      })

    // 2. Load presets
    window.api
      .readPresets()
      .then((result) => {
        setPresets(result)
      })
      .catch((err) => {
        console.error('Failed to read presets:', err)
      })

    // 3. Load settings (not fully implemented — log only)
    window.api
      .readSettings()
      .then((settings) => {
        console.log('App settings loaded:', settings)
      })
      .catch((err) => {
        console.error('Failed to read settings:', err)
      })
  }, [setHardware, setPresets])

  const noGpu =
    !detectingHardware &&
    hardware !== null &&
    hardware.gpu.name === null &&
    hardware.gpu.vramMB === null

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            llama-cpp-cmd-builder
          </h1>
          <FitBadge />
        </header>

        {/* Body: sidebar + main */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT SIDEBAR */}
          <aside className="w-72 shrink-0 border-r border-border overflow-y-auto p-4 space-y-6">
            {/* Hardware section */}
            <div>
              {detectingHardware ? (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    Hardware
                  </h2>
                  <p className="text-xs text-zinc-500 italic animate-pulse">
                    Detecting hardware&hellip;
                  </p>
                </div>
              ) : (
                <>
                  <HardwarePanel />
                  {noGpu && (
                    <p className="mt-2 text-xs text-zinc-500 italic">
                      No GPU detected — running in CPU-only mode.
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Model section */}
            <ModelPicker />

            {/* Presets section */}
            <PresetsPanel />
          </aside>

          {/* RIGHT MAIN */}
          <main className="flex-1 overflow-y-auto p-4 space-y-6">
            <CommandPanel />
            <ParamsPanel />
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
