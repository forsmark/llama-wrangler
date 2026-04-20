import { useState } from 'react'
import { useAppStore } from '@renderer/state/store'
import { llamaParams } from '@renderer/data/llama-params'
import type { ParamDef } from '@shared/types'
import ParamField from './ParamField'
import { Button } from '@renderer/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@renderer/components/ui/collapsible'
import { ChevronDown, ChevronRight, RotateCcw, Settings2 } from 'lucide-react'

type GroupKey = ParamDef['group']

const GROUP_ORDER: GroupKey[] = [
  'essential',
  'performance',
  'sampling',
  'server',
  'cache',
  'misc',
]

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const curatedParams = llamaParams.filter((p) => !p.advanced)
const advancedParams = llamaParams.filter((p) => p.advanced)
const advancedByGroup = GROUP_ORDER.reduce<Record<string, ParamDef[]>>(
  (acc, group) => {
    const inGroup = advancedParams.filter((p) => p.group === group)
    if (inGroup.length > 0) acc[group] = inGroup
    return acc
  },
  {}
)

interface GroupSectionProps {
  group: GroupKey
  params: ParamDef[]
}

function GroupSection({ group, params }: GroupSectionProps): JSX.Element {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-1.5 w-full text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider py-1 hover:text-zinc-200 transition-colors">
          {open ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          {capitalizeFirst(group)}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-4 pl-3 border-l border-zinc-700 ml-1.5 mt-1 pb-2">
          {params.map((def) => (
            <ParamField key={def.flag} def={def} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function ParamsPanel(): JSX.Element {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const resetParams = useAppStore((s) => s.resetParams)

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Parameters
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetParams}
          className="gap-1.5 text-zinc-400 hover:text-zinc-100 h-7 px-2"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      {/* Curated params */}
      <div className="space-y-4">
        {curatedParams.map((def) => (
          <ParamField key={def.flag} def={def} />
        ))}
      </div>

      {/* Advanced toggle */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-100"
          >
            <Settings2 className="h-3.5 w-3.5" />
            {advancedOpen ? 'Hide Advanced' : 'Show Advanced'}
            {advancedOpen ? (
              <ChevronDown className="h-3.5 w-3.5 ml-auto" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 ml-auto" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-2 pt-3 border-t border-zinc-700 mt-2">
            {GROUP_ORDER.filter((g) => advancedByGroup[g]).map((group) => (
              <GroupSection
                key={group}
                group={group}
                params={advancedByGroup[group]}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
