export interface ParsedGgufName {
  sizeBillion: number | null
  quant: string | null
}

export function parseGgufFilename(filename: string): ParsedGgufName {
  // Strip directory path — basename only
  const basename = filename.replace(/^.*[\\/]/, '')
  // Remove .gguf extension
  const name = basename.replace(/\.gguf$/i, '')

  // Extract quantization
  // Patterns (case-insensitive, ordered most-specific first):
  //   IQ\d+_[A-Z]+, Q\d+_K_[MSL], Q\d+_K, Q\d+_\d, Q\d+K, Q\d+, BF16, F16, F32
  const quantPattern = /(?:IQ\d+_[A-Z]+|Q\d+_K_[MSL]|Q\d+_K|Q\d+_\d|Q\d+K|Q\d+|BF16|F16|F32)/i
  const quantMatch = name.match(quantPattern)
  const quant = quantMatch ? quantMatch[0].toUpperCase() : null

  // Extract model size in billions
  let sizeBillion: number | null = null

  // MoE pattern: NxMB (e.g. 8x7B → 56)
  const moeMatch = name.match(/(\d+)x(\d+)B/i)
  if (moeMatch) {
    sizeBillion = parseInt(moeMatch[1], 10) * parseInt(moeMatch[2], 10)
  } else {
    // Regular: prefer \d+B preceded by a dash
    const dashMatch = name.match(/-(\d+)B/i)
    if (dashMatch) {
      sizeBillion = parseInt(dashMatch[1], 10)
    } else {
      // Fall back to any \d+B pattern
      const anyMatch = name.match(/(\d+)B/i)
      if (anyMatch) {
        sizeBillion = parseInt(anyMatch[1], 10)
      }
    }
  }

  return { sizeBillion, quant }
}
