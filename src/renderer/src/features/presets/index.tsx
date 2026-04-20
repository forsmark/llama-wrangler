import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@renderer/state/store'
import type { Preset } from '@shared/types'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'

function ggufBasename(ggufPath: string): string {
  return ggufPath.split('/').pop() ?? ggufPath
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString()
  } catch {
    return iso
  }
}

export default function PresetsPanel(): JSX.Element {
  const presets = useAppStore((s) => s.presets)
  const setPresets = useAppStore((s) => s.setPresets)
  const params = useAppStore((s) => s.params)
  const selectedModel = useAppStore((s) => s.selectedModel)
  const setParam = useAppStore((s) => s.setParam)
  const setSelectedModel = useAppStore((s) => s.setSelectedModel)

  const [presetName, setPresetName] = useState('')
  const importRef = useRef<HTMLInputElement>(null)

  // Load presets on mount
  useEffect(() => {
    window.api.readPresets().then(setPresets).catch(console.error)
  }, [setPresets])

  function handleSave(): void {
    const name = presetName.trim()
    if (!name) return

    const preset: Preset = {
      id: Date.now().toString(),
      name,
      ggufPath: selectedModel.path ?? '',
      params: { ...params },
      createdAt: new Date().toISOString(),
    }

    const updated = [...presets, preset]
    setPresets(updated)
    window.api.writePresets(updated).catch(console.error)
    setPresetName('')
  }

  function handleLoad(preset: Preset): void {
    for (const [flag, value] of Object.entries(preset.params)) {
      setParam(flag, value)
    }
    setSelectedModel({ path: preset.ggufPath, sizeBillion: null, quant: null })
  }

  function handleDelete(id: string): void {
    const updated = presets.filter((p) => p.id !== id)
    setPresets(updated)
    window.api.writePresets(updated).catch(console.error)
  }

  function handleExport(): void {
    const json = JSON.stringify(presets, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'llama-presets.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (!Array.isArray(parsed)) {
          console.error('Import failed: expected JSON array')
          return
        }
        const merged = [...presets, ...(parsed as Preset[])]
        setPresets(merged)
        window.api.writePresets(merged).catch(console.error)
      } catch (err) {
        console.error('Import failed:', err)
      }
    }
    reader.readAsText(file)
    // Reset input so the same file can be imported again
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
        Presets
      </h2>

      {/* Save preset */}
      <div className="space-y-2">
        <Label htmlFor="preset-name" className="text-xs text-zinc-400">
          Preset Name
        </Label>
        <div className="flex gap-2">
          <Input
            id="preset-name"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="e.g. Llama 3 8B fast"
            className="h-8 text-sm flex-1"
          />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!presetName.trim()}
            className="shrink-0"
          >
            Save
          </Button>
        </div>
      </div>

      {/* Preset list */}
      <div className="space-y-2">
        {presets.length === 0 ? (
          <p className="text-xs text-zinc-500 italic">No presets saved yet.</p>
        ) : (
          presets.map((preset) => (
            <div
              key={preset.id}
              className="rounded-md bg-zinc-800 px-3 py-2 flex items-start justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{preset.name}</div>
                <div className="text-xs text-zinc-400 truncate">
                  {ggufBasename(preset.ggufPath)}
                </div>
                <div className="text-xs text-zinc-500">
                  {formatDate(preset.createdAt)}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleLoad(preset)}
                  className="h-7 px-2 text-xs"
                >
                  Load
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(preset.id)}
                  className="h-7 px-2 text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Import / Export */}
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          onClick={handleExport}
          disabled={presets.length === 0}
          className="flex-1"
        >
          Export
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => importRef.current?.click()}
          className="flex-1"
        >
          Import
        </Button>
        <input
          ref={importRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImport}
        />
      </div>
    </div>
  )
}
