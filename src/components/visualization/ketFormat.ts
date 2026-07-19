import { abs2, type Complex } from '../../quantum/complex'
import type { StateVector } from '../../quantum/stateVector'

const DEFAULT_EPSILON = 1e-6

/**
 * Formats a *display* index (not a raw basis-state array index — see
 * `bitReverse`) as a binary string with qubit 0 written leftmost, e.g.
 * displayIndex=1, numQubits=2 -> "01" (q0=0, q1=1). This matches the
 * left-to-right qubit order used elsewhere in the UI (Circuit rows top to
 * bottom, Bloch spheres left to right), rather than the physics-notation
 * convention of writing the most-significant qubit first.
 */
export function basisLabel(displayIndex: number, numQubits: number): string {
  return displayIndex.toString(2).padStart(numQubits, '0')
}

/**
 * Reverses the low `numBits` bits of `value`. The state vector's basis
 * index has qubit 0 as the least-significant bit (see stateVector.ts), the
 * opposite of `basisLabel`'s qubit-0-leftmost display order — this
 * converts between the two (it's its own inverse, so it works both ways).
 */
export function bitReverse(value: number, numBits: number): number {
  let reversed = 0
  for (let bit = 0; bit < numBits; bit++) {
    reversed |= ((value >> bit) & 1) << (numBits - 1 - bit)
  }
  return reversed
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
    .map((_, displayIndex) => ({
      amp: state.amplitudes[bitReverse(displayIndex, state.numQubits)],
      label: basisLabel(displayIndex, state.numQubits),
    }))
    .filter(({ amp }) => abs2(amp) > epsilon2)
    .map(({ amp, label }) => `${formatComplex(amp, digits)}|${label}⟩`)

  if (terms.length === 0) return '0'

  return terms.reduce((acc, term) => {
    if (acc === '') return term
    return term.startsWith('-') ? `${acc} - ${term.slice(1)}` : `${acc} + ${term}`
  }, '')
}
