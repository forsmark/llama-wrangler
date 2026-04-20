import type { ParamDef, ParamValue } from '../../../shared/types'

export function buildCommand(
  binaryPath: string,
  params: Record<string, ParamValue>,
  schema: ParamDef[],
  format: 'single' | 'multi',
): string {
  const binary = binaryPath.trim() === '' ? 'llama-server' : binaryPath

  const parts: string[] = []

  for (const def of schema) {
    const value = params[def.flag]

    // Skip null/undefined
    if (value === null || value === undefined) continue

    // Skip if value equals the param's default
    if (value === def.default) continue

    if (def.type === 'boolean') {
      // Emit bare flag when true, skip when false
      if (value === true) {
        parts.push(def.flag)
      }
    } else {
      // String or number (or select)
      let strValue = String(value)

      // For --model flag: wrap path in quotes if it contains spaces
      if (def.flag === '--model' && strValue.includes(' ')) {
        strValue = `"${strValue}"`
      }

      parts.push(`${def.flag} ${strValue}`)
    }
  }

  const separator = format === 'multi' ? ' \\\n  ' : ' '
  const allParts = [binary, ...parts]

  return allParts.join(separator)
}
