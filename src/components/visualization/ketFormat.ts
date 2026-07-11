import { abs2, type Complex } from '../../quantum/complex'
import type { StateVector } from '../../quantum/stateVector'

const DEFAULT_EPSILON = 1e-6

/** e.g. index=2, numQubits=2 -> "10" (qubit 0 = LSB, rendered MSB..LSB to match |q_{n-1}...q_0>). */
export function basisLabel(basisIndex: number, numQubits: number): string {
  return basisIndex.toString(2).padStart(numQubits, '0')
}

/** Formats one complex amplitude's coefficient, e.g. "0.71", "-0.71i", "0.5+0.5i". */
export function formatComplex(c: Complex, digits = 2): string {
  const re = Number(c.re.toFixed(digits))
  const im = Number(c.im.toFixed(digits))

  if (im === 0) return re.toString()
  if (re === 0) return `${im}i`

  const sign = im > 0 ? '+' : '-'
  return `${re}${sign}${Math.abs(im)}i`
}

/**
 * "0.71|00> + 0.71|11>" style sum over basis states, omitting amplitudes
 * with |amp|^2 <= epsilon^2 (numerically zero).
 */
export function formatStateVector(state: StateVector, opts?: { epsilon?: number; digits?: number }): string {
  const epsilon = opts?.epsilon ?? DEFAULT_EPSILON
  const digits = opts?.digits ?? 2
  const epsilon2 = epsilon * epsilon

  const terms = state.amplitudes
    .map((amp, i) => ({ amp, label: basisLabel(i, state.numQubits) }))
    .filter(({ amp }) => abs2(amp) > epsilon2)
    .map(({ amp, label }) => `${formatComplex(amp, digits)}|${label}⟩`)

  if (terms.length === 0) return '0'

  return terms.reduce((acc, term) => {
    if (acc === '') return term
    return term.startsWith('-') ? `${acc} - ${term.slice(1)}` : `${acc} + ${term}`
  }, '')
}
