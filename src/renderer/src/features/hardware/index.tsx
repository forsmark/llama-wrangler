import { useState } from 'react'
import { useAppStore } from '@renderer/state/store'
import type { HardwareInfo } from '@shared/types'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@renderer/components/ui/collapsible'
import { ChevronDown, ChevronRight } from 'lucide-react'

const ARCH_LABELS: Record<HardwareInfo['gpu']['arch'], string> = {
  nvidia: 'NVIDIA',
  amd: 'AMD',
  vulkan: 'Vulkan',
  none: 'CPU',
}

const ARCH_COLORS: Record<HardwareInfo['gpu']['arch'], string> = {
  nvidia: 'bg-green-700 text-green-100',
  amd: 'bg-red-700 text-red-100',
  vulkan: 'bg-purple-700 text-purple-100',
  none: 'bg-zinc-600 text-zinc-100',
}

export default function HardwarePanel(): JSX.Element {
  const hardware = useAppStore((s) => s.hardware)
  const setHardware = useAppStore((s) => s.setHardware)
  const [overrideOpen, setOverrideOpen] = useState(false)

  // Local override state — mirrors HardwareInfo fields as strings for inputs
  const [gpuName, setGpuName] = useState('')
  const [vramMB, setVramMB] = useState('')
  const [cpuThreads, setCpuThreads] = useState('')
  const [serverPath, setServerPath] = useState('')

  function applyOverrides(): void {
    const base: HardwareInfo = hardware ?? {
      gpu: { name: null, vramMB: null, arch: 'none', computeCap: null },
      ramMB: 0,
      cpuThreads: 0,
      llamaServerPath: null,
    }
    setHardware({
      ...base,
      gpu: {
        ...base.gpu,
        name: gpuName.trim() !== '' ? gpuName.trim() : base.gpu.name,
        vramMB:
          vramMB.trim() !== ''
            ? Number(vramMB)
            : base.gpu.vramMB,
      },
      cpuThreads:
        cpuThreads.trim() !== '' ? Number(cpuThreads) : base.cpuThreads,
      llamaServerPath:
        serverPath.trim() !== '' ? serverPath.trim() : base.llamaServerPath,
    })
    setGpuName('')
    setVramMB('')
    setCpuThreads('')
    setServerPath('')
  }

  const gpuName_display = hardware?.gpu.name ?? 'No GPU detected'
  const vramGB_display =
    hardware?.gpu.vramMB != null
      ? `${(hardware.gpu.vramMB / 1024).toFixed(1)} GB`
      : '—'
  const arch = hardware?.gpu.arch ?? 'none'
  const ramGB_display =
    hardware != null ? `${Math.round(hardware.ramMB / 1024)} GB` : '—'
  const threads_display = hardware?.cpuThreads ?? '—'
  const serverPath_display = hardware?.llamaServerPath ?? 'Not found in PATH'

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
        Hardware
      </h2>

      {/* Detected stats grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {/* GPU */}
        <div className="col-span-2 bg-zinc-800 rounded-md p-3 flex items-center justify-between gap-2">
          <div>
            <div className="text-xs text-zinc-400 mb-0.5">GPU</div>
            <div className="font-medium">{gpuName_display}</div>
            <div className="text-zinc-400 text-xs mt-0.5">
              VRAM: {vramGB_display}
            </div>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded font-mono ${ARCH_COLORS[arch]}`}
          >
            {ARCH_LABELS[arch]}
          </span>
        </div>

        {/* RAM */}
        <div className="bg-zinc-800 rounded-md p-3">
          <div className="text-xs text-zinc-400 mb-0.5">RAM</div>
          <div className="font-medium">{ramGB_display}</div>
        </div>

        {/* CPU Threads */}
        <div className="bg-zinc-800 rounded-md p-3">
          <div className="text-xs text-zinc-400 mb-0.5">CPU Threads</div>
          <div className="font-medium">{threads_display}</div>
        </div>

        {/* llama-server path */}
        <div className="col-span-2 bg-zinc-800 rounded-md p-3">
          <div className="text-xs text-zinc-400 mb-0.5">llama-server path</div>
          <div
            className={`font-mono text-xs truncate ${
              hardware?.llamaServerPath
                ? 'text-green-400'
                : 'text-zinc-500 italic'
            }`}
          >
            {serverPath_display}
          </div>
        </div>
      </div>

      {/* Manual Override collapsible */}
      <Collapsible open={overrideOpen} onOpenChange={setOverrideOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between text-zinc-400 hover:text-zinc-100 px-0"
          >
            Manual Override
            {overrideOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="space-y-1">
            <Label htmlFor="override-gpu-name" className="text-xs text-zinc-400">GPU Name</Label>
            <Input
              id="override-gpu-name"
              value={gpuName}
              onChange={(e) => setGpuName(e.target.value)}
              placeholder={hardware?.gpu.name ?? 'e.g. NVIDIA RTX 4090'}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="override-vram" className="text-xs text-zinc-400">VRAM (MB)</Label>
            <Input
              id="override-vram"
              type="number"
              value={vramMB}
              onChange={(e) => setVramMB(e.target.value)}
              placeholder={
                hardware?.gpu.vramMB != null
                  ? String(hardware.gpu.vramMB)
                  : 'e.g. 24576'
              }
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="override-threads" className="text-xs text-zinc-400">CPU Threads</Label>
            <Input
              id="override-threads"
              type="number"
              value={cpuThreads}
              onChange={(e) => setCpuThreads(e.target.value)}
              placeholder={
                hardware?.cpuThreads != null
                  ? String(hardware.cpuThreads)
                  : 'e.g. 16'
              }
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="override-path" className="text-xs text-zinc-400">llama-server path</Label>
            <Input
              id="override-path"
              value={serverPath}
              onChange={(e) => setServerPath(e.target.value)}
              placeholder={
                hardware?.llamaServerPath ?? '/usr/local/bin/llama-server'
              }
              className="h-8 text-sm font-mono"
            />
          </div>
          <Button
            size="sm"
            onClick={applyOverrides}
            className="w-full"
          >
            Apply Overrides
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
