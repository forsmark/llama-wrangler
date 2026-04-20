import { getBytesPerParam } from './quant-map'

const OVERHEAD_FACTOR = 1.15

/**
 * Estimates VRAM required to load a model in MB.
 *
 * Formula: sizeBillion * 1e9 * bytesPerParam / 1024 / 1024 * OVERHEAD_FACTOR
 *
 * The 1.15 overhead factor accounts for KV cache, activations, and other
 * runtime allocations beyond the raw model weights.
 */
export function estimateVramMB(sizeBillion: number, quantName: string): number {
  const bytesPerParam = getBytesPerParam(quantName)
  return (sizeBillion * 1e9 * bytesPerParam / 1024 / 1024) * OVERHEAD_FACTOR
}

/**
 * Returns the ratio of estimated VRAM to available VRAM.
 * Values > 1.0 mean the model likely won't fit.
 * Used for badge color logic (e.g. green < 0.8, yellow < 1.0, red >= 1.0).
 */
export function fitRatio(estimatedVramMB: number, availableVramMB: number): number {
  if (availableVramMB <= 0) return Infinity
  return estimatedVramMB / availableVramMB
}
