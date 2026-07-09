import { complex, type Complex } from './complex'

/** Square matrix in row-major order, dimension 2^k for a k-qubit gate. */
export type Gate = Complex[][]

const c = complex
const SQRT1_2 = Math.SQRT1_2

export const I: Gate = [
  [c(1), c(0)],
  [c(0), c(1)],
]

export const X: Gate = [
  [c(0), c(1)],
  [c(1), c(0)],
]

export const Y: Gate = [
  [c(0), c(0, -1)],
  [c(0, 1), c(0)],
]

export const Z: Gate = [
  [c(1), c(0)],
  [c(0), c(-1)],
]

export const H: Gate = [
  [c(SQRT1_2), c(SQRT1_2)],
  [c(SQRT1_2), c(-SQRT1_2)],
]

export const S: Gate = [
  [c(1), c(0)],
  [c(0), c(0, 1)],
]

export const T: Gate = [
  [c(1), c(0)],
  [c(0), c(SQRT1_2, SQRT1_2)],
]

/**
 * Control is the first target qubit (matrix row/col MSB), target is the second.
 * Basis order |control,target>: 00, 01, 10, 11.
 */
export const CNOT: Gate = [
  [c(1), c(0), c(0), c(0)],
  [c(0), c(1), c(0), c(0)],
  [c(0), c(0), c(0), c(1)],
  [c(0), c(0), c(1), c(0)],
]

export const SWAP: Gate = [
  [c(1), c(0), c(0), c(0)],
  [c(0), c(0), c(1), c(0)],
  [c(0), c(1), c(0), c(0)],
  [c(0), c(0), c(0), c(1)],
]
