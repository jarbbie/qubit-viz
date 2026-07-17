import { describe, expect, it } from 'vitest'
import type { CircuitStep, Qubit } from './circuitStore'
import { decodeCircuit, encodeCircuit } from './circuitUrlCodec'

function qubit(id: string, enabled = true): Qubit {
  return { id, label: id, enabled }
}

describe('encodeCircuit / decodeCircuit round-trip', () => {
  it('round-trips a Bell state (H then CNOT across two qubits)', () => {
    const qubits = [qubit('q0'), qubit('q1')]
    const steps: CircuitStep[] = [
      { id: 's0', gateId: 'H', targets: ['q0'] },
      { id: 's1', gateId: 'CNOT', targets: ['q0', 'q1'] },
    ]

    const decoded = decodeCircuit(encodeCircuit(qubits, steps))

    expect(decoded).toEqual({
      qubitCount: 2,
      disabledIndices: [],
      steps: [
        { gateId: 'H', targets: [0] },
        { gateId: 'CNOT', targets: [0, 1] },
      ],
    })
  })

  it('round-trips a disabled qubit and a rotation gate theta', () => {
    const qubits = [qubit('q0'), qubit('q1', false), qubit('q2')]
    const steps: CircuitStep[] = [{ id: 's0', gateId: 'RX', targets: ['q2'], params: { theta: 1.25 } }]

    const decoded = decodeCircuit(encodeCircuit(qubits, steps))

    expect(decoded).toEqual({
      qubitCount: 3,
      disabledIndices: [1],
      steps: [{ gateId: 'RX', targets: [2], params: { theta: 1.25 } }],
    })
  })

  it('round-trips an empty circuit', () => {
    const decoded = decodeCircuit(encodeCircuit([qubit('q0')], []))
    expect(decoded).toEqual({ qubitCount: 1, disabledIndices: [], steps: [] })
  })
})

describe('decodeCircuit malformed input', () => {
  it('returns null for invalid base64', () => {
    expect(decodeCircuit('not-valid-base64!!!')).toBeNull()
  })

  it('returns null for valid base64 that is not JSON', () => {
    expect(decodeCircuit(btoa('not json').replace(/=+$/, ''))).toBeNull()
  })

  it('returns null when the top-level shape is wrong', () => {
    const encode = (obj: unknown) => btoa(JSON.stringify(obj)).replace(/=+$/, '')
    expect(decodeCircuit(encode({ n: 2, s: [] }))).toBeNull() // missing v
    expect(decodeCircuit(encode({ v: 2, n: 2, s: [] }))).toBeNull() // wrong version
    expect(decodeCircuit(encode({ v: 1, n: 2 }))).toBeNull() // missing s
  })

  it.each([0, -1, 1.5, 11])('returns null for an out-of-range qubit count (n=%s)', (n) => {
    const encode = (obj: unknown) => btoa(JSON.stringify(obj)).replace(/=+$/, '')
    expect(decodeCircuit(encode({ v: 1, n, s: [] }))).toBeNull()
  })
})

describe('decodeCircuit per-step validation', () => {
  const encode = (obj: unknown) => btoa(JSON.stringify(obj)).replace(/=+$/, '')

  it('drops a step with an unknown gate id but keeps the rest', () => {
    const decoded = decodeCircuit(
      encode({
        v: 1,
        n: 1,
        s: [
          ['FAKE', [0]],
          ['X', [0]],
        ],
      }),
    )
    expect(decoded?.steps).toEqual([{ gateId: 'X', targets: [0] }])
  })

  it('drops a step with the wrong target count for its arity', () => {
    const decoded = decodeCircuit(encode({ v: 1, n: 2, s: [['CNOT', [0]]] }))
    expect(decoded?.steps).toEqual([])
  })

  it('drops a step with an out-of-range target index', () => {
    const decoded = decodeCircuit(encode({ v: 1, n: 2, s: [['X', [5]]] }))
    expect(decoded?.steps).toEqual([])
  })

  it('drops a step with duplicate target indices', () => {
    const decoded = decodeCircuit(encode({ v: 1, n: 2, s: [['CNOT', [0, 0]]] }))
    expect(decoded?.steps).toEqual([])
  })

  it('filters and dedupes out-of-range disabled indices instead of rejecting the payload', () => {
    const decoded = decodeCircuit(encode({ v: 1, n: 2, d: [0, 0, 5, -1], s: [] }))
    expect(decoded?.disabledIndices).toEqual([0])
  })

  it('defaults a missing or non-finite theta to 0 rather than dropping the step', () => {
    const missing = decodeCircuit(encode({ v: 1, n: 1, s: [['RX', [0]]] }))
    expect(missing?.steps).toEqual([{ gateId: 'RX', targets: [0], params: { theta: 0 } }])

    const nanTheta = decodeCircuit(encode({ v: 1, n: 1, s: [['RY', [0], Number.NaN]] }))
    expect(nanTheta?.steps).toEqual([{ gateId: 'RY', targets: [0], params: { theta: 0 } }])
  })
})
