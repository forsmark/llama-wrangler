import { useAppStore } from '@renderer/state/store'
import { parseGgufFilename } from '@renderer/lib/parse-gguf-name'
import { quantBytesPerParam } from '@renderer/data/quant-map'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@renderer/components/ui/select'
import { FolderOpen, FileText, AlertCircle } from 'lucide-react'

const QUANT_OPTIONS = Object.keys(quantBytesPerParam)

function basename(filePath: string): string {
  return filePath.replace(/^.*[\\/]/, '')
}

export default function ModelPicker(): JSX.Element {
  const selectedModel = useAppStore((s) => s.selectedModel)
  const setSelectedModel = useAppStore((s) => s.setSelectedModel)

  const hasModel = selectedModel.path != null
  const needsManualSize = hasModel && selectedModel.sizeBillion == null
  const needsManualQuant = hasModel && selectedModel.quant == null

  async function handlePickFile(): Promise<void> {
    const result = await window.api.openFileDialog()
    if (result.canceled || result.filePaths.length === 0) return

    const filePath = result.filePaths[0]
    const { sizeBillion, quant } = parseGgufFilename(filePath)

    setSelectedModel({ path: filePath, sizeBillion, quant })
  }

  function handleSizeChange(value: string): void {
    const current = useAppStore.getState().selectedModel
    const parsed = parseFloat(value)
    setSelectedModel({
      ...current,
      sizeBillion: isNaN(parsed) ? null : parsed,
    })
  }

  function handleQuantChange(value: string): void {
    const current = useAppStore.getState().selectedModel
    setSelectedModel({
      ...current,
      quant: value || null,
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
        Model
      </h2>

      <Button
        onClick={handlePickFile}
        variant="outline"
        className="w-full gap-2"
      >
        <FolderOpen className="h-4 w-4" />
        Pick GGUF Model
      </Button>

      {!hasModel && (
        <div className="flex items-center gap-2 text-sm text-zinc-500 italic">
          <FileText className="h-4 w-4 shrink-0" />
          No model selected
        </div>
      )}

      {hasModel && (
        <div className="space-y-3">
          {/* Filename */}
          <div className="bg-zinc-800 rounded-md p-3">
            <div className="text-xs text-zinc-400 mb-0.5">File</div>
            <div className="font-mono text-xs text-zinc-100 truncate">
              {basename(selectedModel.path!)}
            </div>
          </div>

          {/* Parsed info row */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {/* Size */}
            <div className="bg-zinc-800 rounded-md p-3">
              <div className="text-xs text-zinc-400 mb-0.5">Size</div>
              {selectedModel.sizeBillion != null ? (
                <div className="font-medium">{selectedModel.sizeBillion}B</div>
              ) : (
                <div className="text-zinc-500 italic text-xs">Not detected</div>
              )}
            </div>

            {/* Quant */}
            <div className="bg-zinc-800 rounded-md p-3">
              <div className="text-xs text-zinc-400 mb-0.5">Quantization</div>
              {selectedModel.quant != null ? (
                <div className="font-mono font-medium">
                  {selectedModel.quant}
                </div>
              ) : (
                <div className="text-zinc-500 italic text-xs">Not detected</div>
              )}
            </div>
          </div>

          {/* Manual overrides if parse failed */}
          {(needsManualSize || needsManualQuant) && (
            <div className="space-y-3 border border-amber-800 rounded-md p-3 bg-amber-950/20">
              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                <AlertCircle className="h-3.5 w-3.5" />
                Could not parse from filename — please set manually
              </div>

              {needsManualSize && (
                <div className="space-y-1">
                  <Label htmlFor="manual-size" className="text-xs text-zinc-400">
                    Model size (billions of parameters)
                  </Label>
                  <Input
                    id="manual-size"
                    type="number"
                    min={0}
                    step={0.1}
                    value={selectedModel.sizeBillion != null ? String(selectedModel.sizeBillion) : ''}
                    placeholder="e.g. 7"
                    className="h-8 text-sm"
                    onChange={(e) => handleSizeChange(e.target.value)}
                  />
                </div>
              )}

              {needsManualQuant && (
                <div className="space-y-1">
                  <Label htmlFor="manual-quant" className="text-xs text-zinc-400">Quantization</Label>
                  <Select onValueChange={handleQuantChange}>
                    <SelectTrigger id="manual-quant" className="h-8 text-sm">
                      <SelectValue placeholder="Select quant…" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUANT_OPTIONS.map((q) => (
                        <SelectItem key={q} value={q}>
                          {q}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
