import { useAppStore } from '@renderer/state/store'
import { useShallow } from 'zustand/react/shallow'
import { Badge } from '@renderer/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@renderer/components/ui/tooltip'

function getBadgeClass(ratio: number | null): string {
  if (ratio === null) return 'bg-zinc-700 text-zinc-300 border-zinc-600'
  if (ratio < 0.8) return 'bg-green-800 text-green-200 border-green-700'
  if (ratio < 1.0) return 'bg-amber-800 text-amber-200 border-amber-700'
  return 'bg-red-800 text-red-200 border-red-700'
}

function getLabel(
  estimatedVramMB: number | null,
  vramMB: number | null | undefined
): string {
  if (estimatedVramMB === null) {
    return 'VRAM: unknown — select model'
  }
  const estimatedGB = (estimatedVramMB / 1024).toFixed(1)
  if (vramMB === null || vramMB === undefined) {
    return `~${estimatedGB} GB estimated (no GPU detected)`
  }
  return `~${estimatedGB} GB / ${(vramMB / 1024).toFixed(1)} GB`
}

export default function FitBadge(): JSX.Element {
  const { estimatedVramMB, ratio } = useAppStore(
    useShallow((s) => s.fitEstimate())
  )
  const hardware = useAppStore((s) => s.hardware)

  const label = getLabel(estimatedVramMB, hardware?.gpu.vramMB)
  const badgeClass = getBadgeClass(ratio)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`cursor-default ${badgeClass}`}>{label}</Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            Estimated from model size and quantization. Includes ~15% overhead
            for KV cache. Actual usage may vary.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
