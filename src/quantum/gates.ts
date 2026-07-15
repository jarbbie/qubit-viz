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

/** Control is the first target qubit, target is the second (same basis order as CNOT). */
export const CZ: Gate = [
  [c(1), c(0), c(0), c(0)],
  [c(0), c(1), c(0), c(0)],
  [c(0), c(0), c(1), c(0)],
  [c(0), c(0), c(0), c(-1)],
]

/** Permutation matrix: basis state j maps to basis state perm(j). */
function permutationGate(size: number, perm: (j: number) => number): Gate {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => c(row === perm(col) ? 1 : 0)),
  )
}

/**
 * Toffoli / CCX. Controls are the first two target qubits, target (flipped
 * only when both controls are 1) is the third. Basis order |c1,c2,t>.
 */
export const CCX: Gate = permutationGate(8, (j) => {
  const c1 = (j >> 2) & 1
  const c2 = (j >> 1) & 1
  return c1 === 1 && c2 === 1 ? j ^ 1 : j
})

export function rx(theta: number): Gate {
  const cos = Math.cos(theta / 2)
  const sin = Math.sin(theta / 2)
  return [
    [c(cos), c(0, -sin)],
    [c(0, -sin), c(cos)],
  ]
}

export function ry(theta: number): Gate {
  const cos = Math.cos(theta / 2)
  const sin = Math.sin(theta / 2)
  return [
    [c(cos), c(-sin)],
    [c(sin), c(cos)],
  ]
}

export function rz(theta: number): Gate {
  return [
    [c(Math.cos(-theta / 2), Math.sin(-theta / 2)), c(0)],
    [c(0), c(Math.cos(theta / 2), Math.sin(theta / 2))],
  ]
}

export type GateId = 'I' | 'X' | 'Y' | 'Z' | 'H' | 'S' | 'T' | 'RX' | 'RY' | 'RZ' | 'CNOT' | 'SWAP' | 'CZ' | 'CCX'

export interface GateDefinition {
  id: GateId
  /** Short display name, e.g. "Hadamard", shown in the gate palette tooltip. */
  name: string
  /** One-sentence, user-facing explanation of what the gate does. */
  description: string
  arity: number
  /** Names of the numeric parameters `matrix` expects, e.g. ['theta'] for rotation gates. */
  paramNames: readonly string[]
  matrix: (params?: Record<string, number>) => Gate
}

/** Single source of truth for turning a placed gate (id + params) into a concrete matrix. */
export const GATE_DEFINITIONS: Record<GateId, GateDefinition> = {
  I: {
    id: 'I',
    name: 'Identity',
    description: 'Leaves the qubit unchanged.',
    arity: 1,
    paramNames: [],
    matrix: () => I,
  },
  X: {
    id: 'X',
    name: 'Pauli-X',
    description: 'Flips |0⟩ and |1⟩, like a classical NOT.',
    arity: 1,
    paramNames: [],
    matrix: () => X,
  },
  Y: {
    id: 'Y',
    name: 'Pauli-Y',
    description: 'Flips |0⟩ and |1⟩ with an added phase twist.',
    arity: 1,
    paramNames: [],
    matrix: () => Y,
  },
  Z: {
    id: 'Z',
    name: 'Pauli-Z',
    description: 'Flips the phase of |1⟩, leaving |0⟩ unchanged.',
    arity: 1,
    paramNames: [],
    matrix: () => Z,
  },
  H: {
    id: 'H',
    name: 'Hadamard',
    description: 'Creates an equal superposition of |0⟩ and |1⟩.',
    arity: 1,
    paramNames: [],
    matrix: () => H,
  },
  S: {
    id: 'S',
    name: 'S (Phase)',
    description: 'Adds a 90° phase to |1⟩.',
    arity: 1,
    paramNames: [],
    matrix: () => S,
  },
  T: {
    id: 'T',
    name: 'T (π/8)',
    description: 'Adds a 45° phase to |1⟩.',
    arity: 1,
    paramNames: [],
    matrix: () => T,
  },
  RX: {
    id: 'RX',
    name: 'X Rotation',
    description: 'Rotates the qubit around the X axis by angle θ.',
    arity: 1,
    paramNames: ['theta'],
    matrix: (p) => rx(p?.theta ?? 0),
  },
  RY: {
    id: 'RY',
    name: 'Y Rotation',
    description: 'Rotates the qubit around the Y axis by angle θ.',
    arity: 1,
    paramNames: ['theta'],
    matrix: (p) => ry(p?.theta ?? 0),
  },
  RZ: {
    id: 'RZ',
    name: 'Z Rotation',
    description: 'Rotates the qubit around the Z axis by angle θ.',
    arity: 1,
    paramNames: ['theta'],
    matrix: (p) => rz(p?.theta ?? 0),
  },
  CNOT: {
    id: 'CNOT',
    name: 'CNOT',
    description: 'Flips the target qubit if the control qubit is |1⟩.',
    arity: 2,
    paramNames: [],
    matrix: () => CNOT,
  },
  SWAP: {
    id: 'SWAP',
    name: 'SWAP',
    description: 'Swaps the states of two qubits.',
    arity: 2,
    paramNames: [],
    matrix: () => SWAP,
  },
  CZ: {
    id: 'CZ',
    name: 'CZ',
    description: 'Flips the phase of the target if both qubits are |1⟩.',
    arity: 2,
    paramNames: [],
    matrix: () => CZ,
  },
  CCX: {
    id: 'CCX',
    name: 'Toffoli (CCX)',
    description: 'Flips the target if both control qubits are |1⟩.',
    arity: 3,
    paramNames: [],
    matrix: () => CCX,
  },
}
