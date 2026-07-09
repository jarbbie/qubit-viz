import { describe, expect, it } from 'vitest'
import { complex } from './complex'
import { CNOT, H, X } from './gates'
import { blochVector, reducedDensityMatrix } from './blochVector'
import { applyGate, createState } from './stateVector'

function expectBloch(
  actual: { x: number; y: number; z: number },
  expected: { x: number; y: number; z: number },
) {
  expect(actual.x).toBeCloseTo(expected.x)
  expect(actual.y).toBeCloseTo(expected.y)
  expect(actual.z).toBeCloseTo(expected.z)
}

describe('blochVector', () => {
  it('|0> sits at the north pole', () => {
    expectBloch(blochVector(createState(1), 0), { x: 0, y: 0, z: 1 })
  })

  it('|1> sits at the south pole', () => {
    const state = applyGate(createState(1), X, [0])
    expectBloch(blochVector(state, 0), { x: 0, y: 0, z: -1 })
  })

  it('|+> sits on the +x axis', () => {
    const state = applyGate(createState(1), H, [0])
    expectBloch(blochVector(state, 0), { x: 1, y: 0, z: 0 })
  })

  it('is a unit vector for any unentangled (pure) single qubit', () => {
    const state = applyGate(createState(1), H, [0])
    const { x, y, z } = blochVector(state, 0)
    expect(Math.sqrt(x * x + y * y + z * z)).toBeCloseTo(1)
  })

  it('shrinks to the center for a qubit entangled via a Bell pair', () => {
    let state = createState(2)
    state = applyGate(state, H, [0])
    state = applyGate(state, CNOT, [0, 1])

    for (const qubit of [0, 1]) {
      const { x, y, z } = blochVector(state, qubit)
      expect(Math.sqrt(x * x + y * y + z * z)).toBeCloseTo(0)
    }
  })

  it('is unaffected by other qubits when the register is a product state', () => {
    // |1> on qubit 0, |+> on qubit 1 — no entanglement, so each Bloch vector
    // matches its single-qubit counterpart above.
    let state = createState(2)
    state = applyGate(state, X, [0])
    state = applyGate(state, H, [1])

    expectBloch(blochVector(state, 0), { x: 0, y: 0, z: -1 })
    expectBloch(blochVector(state, 1), { x: 1, y: 0, z: 0 })
  })

  it('rejects an out-of-range qubit index', () => {
    expect(() => blochVector(createState(2), 5)).toThrow()
  })
})

describe('reducedDensityMatrix', () => {
  it('is I/2 for a qubit maximally entangled with the rest of the register', () => {
    let state = createState(2)
    state = applyGate(state, H, [0])
    state = applyGate(state, CNOT, [0, 1])

    const rho = reducedDensityMatrix(state, 0)
    expect(rho[0][0].re).toBeCloseTo(0.5)
    expect(rho[1][1].re).toBeCloseTo(0.5)
    expect(rho[0][1]).toEqual(complex(0, 0))
    expect(rho[1][0]).toEqual(complex(0, 0))
  })

  it('has trace 1', () => {
    const state = applyGate(createState(1), H, [0])
    const rho = reducedDensityMatrix(state, 0)
    expect(rho[0][0].re + rho[1][1].re).toBeCloseTo(1)
  })

  it('is Hermitian (rho10 = conj(rho01))', () => {
    let state = createState(2)
    state = applyGate(state, H, [0])
    state = applyGate(state, CNOT, [0, 1])
    const rho = reducedDensityMatrix(state, 1)
    expect(rho[1][0].re).toBeCloseTo(rho[0][1].re)
    expect(rho[1][0].im).toBeCloseTo(-rho[0][1].im)
  })
})
