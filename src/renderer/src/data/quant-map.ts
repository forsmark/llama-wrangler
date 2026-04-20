export const quantBytesPerParam: Record<string, number> = {
  'F32': 4.0,
  'F16': 2.0,
  'BF16': 2.0,
  'Q8_0': 1.0,
  'Q6_K': 0.8,
  'Q5_K_M': 0.625,
  'Q5_K_S': 0.625,
  'Q5_0': 0.625,
  'Q5_1': 0.6875,
  'Q4_K_M': 0.5,
  'Q4_K_S': 0.5,
  'Q4_0': 0.5,
  'Q4_1': 0.5625,
  'Q3_K_M': 0.375,
  'Q3_K_S': 0.375,
  'Q3_K_L': 0.375,
  'Q2_K': 0.25,
  'IQ4_NL': 0.5,
  'IQ4_XS': 0.45,
  'IQ3_M': 0.375,
  'IQ3_XS': 0.375,
  'IQ2_M': 0.25,
  'IQ2_XS': 0.25,
  'IQ1_M': 0.1875,
  'IQ1_S': 0.195,
}

/**
 * Returns the approximate bytes-per-parameter for a given quantization name.
 * Normalizes input to uppercase and looks up in the map.
 * Returns 0.5 (Q4 equivalent) as a safe default for unknown quants.
 */
export function getBytesPerParam(quantName: string): number {
  const normalized = quantName.toUpperCase().trim()
  if (normalized in quantBytesPerParam) {
    return quantBytesPerParam[normalized]
  }
  return 0.5
}
