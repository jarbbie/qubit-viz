import { type Complex, ZERO, add, conj, mul } from './complex'
import type { StateVector } from './stateVector'

/** 2x2 Hermitian, trace-1 density matrix for a single qubit, traced out of the full state. */
export type DensityMatrix2x2 = [[Complex, Complex], [Complex, Complex]]

export interface BlochVector {
  x: number
  y: number
  z: number
}

/**
 * Traces out every qubit except `qubit`, giving that qubit's reduced density
 * matrix. For a state entangled with the rest of the register this is mixed
 * (|Bloch vector| < 1); for a product state it stays pure (|Bloch vector| = 1).
 */
export function reducedDensityMatrix(state: StateVector, qubit: number): DensityMatrix2x2 {
  if (qubit < 0 || qubit >= state.numQubits) {
    throw new Error(`qubit ${qubit} out of range for ${state.numQubits} qubit(s)`)
  }

  const { amplitudes } = state
  const size = amplitudes.length
  const bit = 1 << qubit

  let rho00 = ZERO
  let rho01 = ZERO
  let rho10 = ZERO
  let rho11 = ZERO

  for (let base = 0; base < size; base++) {
    if ((base & bit) !== 0) continue // only visit each "other qubits" combination once, at qubit-bit=0
    const c0 = amplitudes[base]
    const c1 = amplitudes[base | bit]
    rho00 = add(rho00, mul(c0, conj(c0)))
    rho01 = add(rho01, mul(c0, conj(c1)))
    rho10 = add(rho10, mul(c1, conj(c0)))
    rho11 = add(rho11, mul(c1, conj(c1)))
  }

  return [
    [rho00, rho01],
    [rho10, rho11],
  ]
}

/**
 * Bloch vector for `qubit`, derived from its reduced density matrix via the
 * Pauli expectation values (x,y,z) = (Tr(ρX), Tr(ρY), Tr(ρZ)). Convention:
 * |0> -> +z, |1> -> -z, |+> -> +x, |+i> -> +y.
 */
export function blochVector(state: StateVector, qubit: number): BlochVector {
  const rho = reducedDensityMatrix(state, qubit)
  return {
    x: 2 * rho[0][1].re,
    y: -2 * rho[0][1].im,
    z: rho[0][0].re - rho[1][1].re,
  }
}
