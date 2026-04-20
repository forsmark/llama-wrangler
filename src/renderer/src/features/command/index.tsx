import { useState } from 'react'
import { useAppStore } from '@renderer/state/store'
import { llamaParams } from '@renderer/data/llama-params'
import { validateParam } from '@renderer/lib/validate'
import { Button } from '@renderer/components/ui/button'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@renderer/components/ui/tabs'

function hasInvalidParams(params: Record<string, import('@shared/types').ParamValue>): boolean {
  for (const def of llamaParams) {
    const value = params[def.flag]
    const result = validateParam(def, value ?? null)
    if (!result.valid) return true
  }
  return false
}

export default function CommandPanel(): JSX.Element {
  const params = useAppStore((s) => s.params)
  const hardware = useAppStore((s) => s.hardware)
  const singleCommand = useAppStore((s) => s.builtCommand('single'))
  const multiCommand = useAppStore((s) => s.builtCommand('multi'))

  const [activeTab, setActiveTab] = useState<'single' | 'multi'>('single')
  const [copied, setCopied] = useState(false)

  const invalid = hasInvalidParams(params)
  const currentCommand = activeTab === 'single' ? singleCommand : multiCommand
  const llamaServerMissing = hardware?.llamaServerPath === null

  async function handleCopy(): Promise<void> {
    await window.api.copyToClipboard(currentCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
        Command Preview
      </h2>

      {llamaServerMissing && (
        <div className="rounded-md bg-amber-900/40 border border-amber-700 px-3 py-2 text-xs text-amber-300">
          llama-server not found in PATH — command uses &apos;llama-server&apos;. Set binary
          path in Hardware panel.
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'single' | 'multi')}
      >
        <div className="flex items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="single">Single Line</TabsTrigger>
            <TabsTrigger value="multi">Multi Line</TabsTrigger>
          </TabsList>

          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            disabled={invalid}
            className="shrink-0"
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>

        <TabsContent value="single">
          <pre className="mt-2 overflow-x-auto rounded-md bg-zinc-900 p-3 text-xs font-mono text-zinc-200 whitespace-pre">
            {singleCommand || <span className="text-zinc-500 italic">No command generated yet</span>}
          </pre>
        </TabsContent>

        <TabsContent value="multi">
          <pre className="mt-2 overflow-x-auto rounded-md bg-zinc-900 p-3 text-xs font-mono text-zinc-200 whitespace-pre">
            {multiCommand || <span className="text-zinc-500 italic">No command generated yet</span>}
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  )
}
