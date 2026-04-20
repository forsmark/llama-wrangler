import { useAppStore } from '@renderer/state/store'
import { validateParam } from '@renderer/lib/validate'
import type { ParamDef, ParamValue } from '@shared/types'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@renderer/components/ui/select'

interface ParamFieldProps {
  def: ParamDef
}

export default function ParamField({ def }: ParamFieldProps): JSX.Element {
  const value = useAppStore((s) => s.params[def.flag])

  function handleChange(newValue: ParamValue): void {
    useAppStore.getState().setParam(def.flag, newValue)
  }

  const validation = validateParam(def, value)
  const fieldId = `param-${def.flag.replace(/^-+/, '').replace(/-/g, '_')}`

  return (
    <div className="space-y-1">
      {def.type === 'boolean' ? (
        <div className="flex items-start gap-2">
          <Checkbox
            id={fieldId}
            checked={typeof value === 'boolean' ? value : Boolean(def.default)}
            onCheckedChange={(checked) => handleChange(Boolean(checked))}
            className="mt-0.5"
          />
          <div className="space-y-0.5">
            <Label htmlFor={fieldId} className="text-sm font-medium leading-none cursor-pointer">
              {def.label}
            </Label>
            <p className="text-xs text-zinc-500">{def.description}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <Label htmlFor={fieldId} className="text-xs font-medium text-zinc-300">
            {def.label}
          </Label>

          {def.type === 'number' && (
            <Input
              id={fieldId}
              type="number"
              min={def.min}
              max={def.max}
              value={value != null ? String(value) : ''}
              onChange={(e) => {
                const raw = e.target.value
                if (raw === '') {
                  handleChange(null)
                } else {
                  const n = parseFloat(raw)
                  handleChange(isNaN(n) ? null : n)
                }
              }}
              placeholder={def.default != null ? String(def.default) : ''}
              className="h-8 text-sm"
            />
          )}

          {def.type === 'string' && (
            <Input
              id={fieldId}
              type="text"
              value={typeof value === 'string' ? value : String(def.default ?? '')}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={typeof def.default === 'string' ? def.default : ''}
              className="h-8 text-sm"
            />
          )}

          {def.type === 'select' && (
            <Select
              value={value != null ? String(value) : String(def.default)}
              onValueChange={(v) => handleChange(v)}
            >
              <SelectTrigger id={fieldId} className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {def.options?.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <p className="text-xs text-zinc-500">{def.description}</p>
        </div>
      )}

      {!validation.valid && validation.error && (
        <p className="text-xs text-red-400">{validation.error}</p>
      )}
    </div>
  )
}
