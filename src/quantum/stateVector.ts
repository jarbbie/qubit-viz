import { type Complex, ZERO, add, mul, complex } from './complex'
import type { Gate } from './gates'

export interface StateVector {
  numQubits: number
  /**
   * Length 2^numQubits. Basis index bit `q` (i.e. `(index >> q) & 1`) is the
   * value of qubit `q` — qubit 0 is the least significant bit.
   */
  amplitudes: Complex[]
}

/** Builds the state |basisIndex> for `numQubits` qubits (defaults to |00...0>). */
export function createState(numQubits: number, basisIndex = 0): StateVector {
  if (numQubits < 1) throw new Error('numQubits must be at least 1')
  const size = 1 << numQubits
  if (basisIndex < 0 || basisIndex >= size) {
    throw new Error(`basisIndex ${basisIndex} out of range for ${numQubits} qubit(s)`)
  }
  const amplitudes = new Array<Complex>(size).fill(ZERO)
  amplitudes[basisIndex] = complex(1)
  return { numQubits, amplitudes }
}

/**
 * Applies `gate` (dimension 2^targets.length) to the given target qubits and
 * returns a new StateVector — the input is left untouched, matching the
 * read-only per-step history the simulation runner relies on.
 *
 * `targets[0]` is the most significant bit of the gate's basis ordering, so
 * e.g. CNOT expects targets = [control, target].
 */
export function applyGate(state: StateVector, gate: Gate, targets: number[]): StateVector {
  const k = targets.length
  const dim = 1 << k

  if (gate.length !== dim || gate.some((row) => row.length !== dim)) {
    throw new Error(`gate dimension must be ${dim} for ${k} target qubit(s)`)
  }
  if (new Set(targets).size !== k) {
    throw new Error('target qubits must be distinct')
  }
  for (const t of targets) {
    if (t < 0 || t >= state.numQubits) {
      throw new Error(`target qubit ${t} out of range for ${state.numQubits} qubit(s)`)
    }
  }

  const { amplitudes } = state
  const size = amplitudes.length
  const targetMask = targets.reduce((mask, t) => mask | (1 << t), 0)
  const out = amplitudes.slice()

  for (let base = 0; base < size; base++) {
    if ((base & targetMask) !== 0) continue // only visit each group once, at its all-zero base index

    const indices = new Array<number>(dim)
    const v = new Array<Complex>(dim)
    for (let sub = 0; sub < dim; sub++) {
      let idx = base
      for (let j = 0; j < k; j++) {
        if ((sub >> (k - 1 - j)) & 1) idx |= 1 << targets[j]
      }
      indices[sub] = idx
      v[sub] = amplitudes[idx]
    }

    for (let row = 0; row < dim; row++) {
      let sum = ZERO
      for (let col = 0; col < dim; col++) {
        sum = add(sum, mul(gate[row][col], v[col]))
      }
      out[indices[row]] = sum
    }
  }

  return { numQubits: state.numQubits, amplitudes: out }
}

/** Born-rule probability of each basis state, length 2^numQubits. */
export function getProbabilities(state: StateVector): number[] {
  return state.amplitudes.map((a) => a.re * a.re + a.im * a.im)
}

export function getProbability(state: StateVector, basisIndex: number): number {
  const a = state.amplitudes[basisIndex]
  return a.re * a.re + a.im * a.im
}

/** Sanity check that total probability is ~1; gates are unitary so this should always hold. */
export function isNormalized(state: StateVector, eps = 1e-9): boolean {
  const total = getProbabilities(state).reduce((s, p) => s + p, 0)
  return Math.abs(total - 1) < eps
}
