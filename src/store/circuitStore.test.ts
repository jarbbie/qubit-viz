import { beforeEach, describe, expect, it } from 'vitest'
import { getProbabilities } from '../quantum/stateVector'
import { selectCurrentState, useCircuitStore } from './circuitStore'

beforeEach(() => {
  useCircuitStore.getState().reset()
})

function qubitIds(): string[] {
  return useCircuitStore.getState().qubits.map((q) => q.id)
}

describe('initial state', () => {
  it('starts with a single enabled qubit and an empty circuit', () => {
    const s = useCircuitStore.getState()
    expect(s.qubits).toHaveLength(1)
    expect(s.qubits[0].enabled).toBe(true)
    expect(s.steps).toHaveLength(0)
    expect(s.history).toHaveLength(1)
    expect(s.currentStepIndex).toBe(0)
    expect(selectCurrentState(s)?.amplitudes).toHaveLength(2)
  })
})

describe('qubit management', () => {
  it('addQubit grows the register and history width', () => {
    useCircuitStore.getState().addQubit()
    const s = useCircuitStore.getState()
    expect(s.qubits).toHaveLength(2)
    expect(selectCurrentState(s)?.amplitudes).toHaveLength(4)
  })

  it('removeQubit drops it and cascades to steps that reference it', () => {
    useCircuitStore.getState().addQubit()
    const [q0, q1] = qubitIds()
    useCircuitStore.getState().addGate('X', [q0])
    useCircuitStore.getState().addGate('X', [q1])

    useCircuitStore.getState().removeQubit(q1)

    const s = useCircuitStore.getState()
    expect(s.qubits).toHaveLength(1)
    expect(s.steps).toHaveLength(1) // the gate on q1 was dropped
    expect(s.steps[0].targets).toEqual([q0])
  })

  it('setQubitEnabled(false) excludes the qubit from simulation without deleting its gates', () => {
    useCircuitStore.getState().addQubit()
    const [, q1] = qubitIds()
    useCircuitStore.getState().addGate('X', [q1])

    useCircuitStore.getState().setQubitEnabled(q1, false)

    const s = useCircuitStore.getState()
    expect(s.steps).toHaveLength(1) // gate is preserved
    expect(selectCurrentState(s)?.amplitudes).toHaveLength(2) // but only q0 is simulated

    useCircuitStore.getState().setQubitEnabled(q1, true)
    const restored = useCircuitStore.getState()
    // re-enabling replays the preserved gate: X on q1 flips it to |1>
    expect(getProbabilities(selectCurrentState(restored)!)[0b10]).toBeCloseTo(1)
  })
})

describe('gate placement', () => {
  it('addGate appends a step and advances the scrub position to it', () => {
    const [q0] = qubitIds()
    useCircuitStore.getState().addGate('H', [q0])
    const s = useCircuitStore.getState()
    expect(s.steps).toHaveLength(1)
    expect(s.history).toHaveLength(2)
    expect(s.currentStepIndex).toBe(1)
  })

  it('rejects a gate with the wrong number of targets', () => {
    const [q0] = qubitIds()
    expect(() => useCircuitStore.getState().addGate('CNOT', [q0])).toThrow()
  })

  it('rejects a target qubit that does not exist', () => {
    expect(() => useCircuitStore.getState().addGate('X', ['nope'])).toThrow()
  })

  it('builds a Bell state from H + CNOT across two qubits', () => {
    useCircuitStore.getState().addQubit()
    const [q0, q1] = qubitIds()
    useCircuitStore.getState().addGate('H', [q0])
    useCircuitStore.getState().addGate('CNOT', [q0, q1])

    const s = useCircuitStore.getState()
    const probs = getProbabilities(selectCurrentState(s)!)
    expect(probs[0b00]).toBeCloseTo(0.5)
    expect(probs[0b11]).toBeCloseTo(0.5)
    expect(probs[0b01]).toBeCloseTo(0)
    expect(probs[0b10]).toBeCloseTo(0)
  })

  it('removeGate drops a step and recomputes history around it', () => {
    const [q0] = qubitIds()
    useCircuitStore.getState().addGate('X', [q0])
    useCircuitStore.getState().addGate('H', [q0])
    const stepToRemove = useCircuitStore.getState().steps[0].id

    useCircuitStore.getState().removeGate(stepToRemove)

    const s = useCircuitStore.getState()
    expect(s.steps).toHaveLength(1)
    expect(s.steps[0].gateId).toBe('H')
    expect(s.history).toHaveLength(2)
  })

  it('clearCircuit empties the circuit and resets the scrub position', () => {
    const [q0] = qubitIds()
    useCircuitStore.getState().addGate('X', [q0])
    useCircuitStore.getState().clearCircuit()

    const s = useCircuitStore.getState()
    expect(s.steps).toHaveLength(0)
    expect(s.history).toHaveLength(1)
    expect(s.currentStepIndex).toBe(0)
  })

  it('supports a parametrized rotation gate', () => {
    const [q0] = qubitIds()
    useCircuitStore.getState().addGate('RY', [q0], { theta: Math.PI })
    const s = useCircuitStore.getState()
    // RY(pi)|0> = |1>
    expect(getProbabilities(selectCurrentState(s)!)[1]).toBeCloseTo(1)
  })
})

describe('scrubbing', () => {
  it('setCurrentStepIndex clamps to the valid history range', () => {
    const [q0] = qubitIds()
    useCircuitStore.getState().addGate('X', [q0])

    useCircuitStore.getState().setCurrentStepIndex(99)
    expect(useCircuitStore.getState().currentStepIndex).toBe(1)

    useCircuitStore.getState().setCurrentStepIndex(-5)
    expect(useCircuitStore.getState().currentStepIndex).toBe(0)
  })

  it('stepBackward/stepForward move one history entry at a time', () => {
    const [q0] = qubitIds()
    useCircuitStore.getState().addGate('X', [q0])
    useCircuitStore.getState().addGate('X', [q0])
    expect(useCircuitStore.getState().currentStepIndex).toBe(2)

    useCircuitStore.getState().stepBackward()
    expect(useCircuitStore.getState().currentStepIndex).toBe(1)

    useCircuitStore.getState().stepBackward()
    useCircuitStore.getState().stepBackward() // clamps at 0
    expect(useCircuitStore.getState().currentStepIndex).toBe(0)

    useCircuitStore.getState().stepForward()
    expect(useCircuitStore.getState().currentStepIndex).toBe(1)
  })

  it('history is read-only in the sense that each entry is a snapshot, not recomputed in place', () => {
    const [q0] = qubitIds()
    useCircuitStore.getState().addGate('X', [q0])
    const firstSnapshot = useCircuitStore.getState().history[0]

    useCircuitStore.getState().addGate('H', [q0])
    expect(useCircuitStore.getState().history[0]).not.toBe(firstSnapshot)
    // but the initial state's *values* are unaffected by later gates
    expect(useCircuitStore.getState().history[0].amplitudes).toEqual(firstSnapshot.amplitudes)
  })
})
