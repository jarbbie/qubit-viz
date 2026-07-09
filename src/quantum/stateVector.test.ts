import { describe, expect, it } from 'vitest'
import { complex, equalsApprox } from './complex'
import { CNOT, H, I, X } from './gates'
import { applyGate, createState, getProbabilities, getProbability, isNormalized } from './stateVector'

describe('createState', () => {
  it('defaults to |0...0>', () => {
    const state = createState(2)
    expect(state.amplitudes).toEqual([complex(1), complex(0), complex(0), complex(0)])
  })

  it('builds an arbitrary basis state', () => {
    const state = createState(2, 3) // |11>
    expect(state.amplitudes).toEqual([complex(0), complex(0), complex(0), complex(1)])
  })

  it('rejects an out-of-range basis index', () => {
    expect(() => createState(2, 4)).toThrow()
  })
})

describe('applyGate', () => {
  it('X flips |0> to |1>', () => {
    const state = applyGate(createState(1), X, [0])
    expect(state.amplitudes).toEqual([complex(0), complex(1)])
  })

  it('does not mutate the input state', () => {
    const before = createState(1)
    const beforeAmplitudes = before.amplitudes.slice()
    applyGate(before, X, [0])
    expect(before.amplitudes).toEqual(beforeAmplitudes)
  })

  it('I leaves the state unchanged', () => {
    const state = applyGate(createState(1), I, [0])
    expect(state.amplitudes).toEqual([complex(1), complex(0)])
  })

  it('H puts |0> into an equal superposition', () => {
    const state = applyGate(createState(1), H, [0])
    expect(getProbabilities(state)[0]).toBeCloseTo(0.5)
    expect(getProbabilities(state)[1]).toBeCloseTo(0.5)
  })

  it('applies a gate to a specific qubit within a larger register', () => {
    // |00>, flip qubit 1 -> |10> (qubit 1 is the more significant bit, index 2)
    const state = applyGate(createState(2), X, [1])
    expect(state.amplitudes).toEqual([complex(0), complex(0), complex(1), complex(0)])
  })

  it('creates a Bell state from H followed by CNOT', () => {
    let state = createState(2)
    state = applyGate(state, H, [0]) // control qubit into superposition
    state = applyGate(state, CNOT, [0, 1]) // control=0, target=1
    const probs = getProbabilities(state)
    expect(probs[0]).toBeCloseTo(0.5) // |00>
    expect(probs[1]).toBeCloseTo(0) // |01>
    expect(probs[2]).toBeCloseTo(0) // |10>
    expect(probs[3]).toBeCloseTo(0.5) // |11>
    expect(isNormalized(state)).toBe(true)
  })

  it('rejects a gate whose dimension does not match the target count', () => {
    expect(() => applyGate(createState(2), X, [0, 1])).toThrow()
  })

  it('rejects duplicate target qubits', () => {
    expect(() => applyGate(createState(2), CNOT, [0, 0])).toThrow()
  })

  it('rejects an out-of-range target qubit', () => {
    expect(() => applyGate(createState(1), X, [5])).toThrow()
  })
})

describe('probabilities', () => {
  it('sum to 1 for any reachable state', () => {
    let state = createState(3)
    state = applyGate(state, H, [0])
    state = applyGate(state, H, [1])
    state = applyGate(state, CNOT, [1, 2])
    const total = getProbabilities(state).reduce((s, p) => s + p, 0)
    expect(total).toBeCloseTo(1)
  })

  it('getProbability matches getProbabilities at the same index', () => {
    const state = applyGate(createState(1), H, [0])
    expect(getProbability(state, 0)).toBeCloseTo(getProbabilities(state)[0])
  })
})

describe('equalsApprox sanity', () => {
  it('is usable for comparing amplitudes with floating point noise', () => {
    const state = applyGate(createState(1), H, [0])
    expect(equalsApprox(state.amplitudes[0], complex(Math.SQRT1_2, 0))).toBe(true)
  })
})
