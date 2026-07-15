import { describe, expect, it } from 'vitest'
import { add, complex, conj, equalsApprox, mul, ZERO } from './complex'
import { CCX, CNOT, CZ, GATE_DEFINITIONS, type Gate, H, I, rx, ry, rz, S, SWAP, T, X, Y, Z } from './gates'

/** G is unitary iff G * G^dagger === identity. */
function isUnitary(gate: Gate): boolean {
  const dim = gate.length
  for (let row = 0; row < dim; row++) {
    for (let col = 0; col < dim; col++) {
      let sum = ZERO
      for (let k = 0; k < dim; k++) {
        // (G * G^dagger)[row][col] = sum_k G[row][k] * conj(G[col][k])
        sum = add(sum, mul(gate[row][k], conj(gate[col][k])))
      }
      const expected = row === col ? complex(1) : complex(0)
      if (!equalsApprox(sum, expected, 1e-9)) return false
    }
  }
  return true
}

/** Element-wise approximate comparison — trig-derived matrices can land on -0 vs 0. */
function expectGateApprox(actual: Gate, expected: Gate) {
  for (let row = 0; row < expected.length; row++) {
    for (let col = 0; col < expected[row].length; col++) {
      expect(equalsApprox(actual[row][col], expected[row][col])).toBe(true)
    }
  }
}

describe('gates', () => {
  it.each([
    ['I', I],
    ['X', X],
    ['Y', Y],
    ['Z', Z],
    ['H', H],
    ['S', S],
    ['T', T],
    ['CNOT', CNOT],
    ['SWAP', SWAP],
    ['CZ', CZ],
    ['CCX', CCX],
  ])('%s is unitary', (_name, gate) => {
    expect(isUnitary(gate)).toBe(true)
  })

  it('CNOT leaves |00> and |01> unchanged (control=0)', () => {
    expect(CNOT[0]).toEqual([complex(1), complex(0), complex(0), complex(0)])
    expect(CNOT[1]).toEqual([complex(0), complex(1), complex(0), complex(0)])
  })

  it('CNOT flips the target when control=1', () => {
    expect(CNOT[2]).toEqual([complex(0), complex(0), complex(0), complex(1)]) // |10> -> |11>
    expect(CNOT[3]).toEqual([complex(0), complex(0), complex(1), complex(0)]) // |11> -> |10>
  })

  it('SWAP exchanges the two qubits', () => {
    expect(SWAP[1]).toEqual([complex(0), complex(0), complex(1), complex(0)]) // |01> -> |10>
    expect(SWAP[2]).toEqual([complex(0), complex(1), complex(0), complex(0)]) // |10> -> |01>
  })

  it('CZ leaves every basis state unchanged except |11>, which gets a -1 phase', () => {
    for (let i = 0; i < 3; i++) {
      expect(CZ[i][i]).toEqual(complex(1))
    }
    expect(CZ[3][3]).toEqual(complex(-1))
  })

  it('CCX only flips the target when both controls are 1', () => {
    expect(CCX[5]).toEqual(Array.from({ length: 8 }, (_, j) => complex(j === 5 ? 1 : 0))) // |101> unchanged
    expect(CCX[7]).toEqual(Array.from({ length: 8 }, (_, j) => complex(j === 6 ? 1 : 0))) // |111> -> |110>
    expect(CCX[6]).toEqual(Array.from({ length: 8 }, (_, j) => complex(j === 7 ? 1 : 0))) // |110> -> |111>
  })
})

describe('rotation gates', () => {
  it.each([
    ['RX(0.7)', rx(0.7)],
    ['RY(1.3)', ry(1.3)],
    ['RZ(-2.1)', rz(-2.1)],
  ])('%s is unitary', (_name, gate) => {
    expect(isUnitary(gate)).toBe(true)
  })

  it('RX(0) and RY(0) and RZ(0) are the identity', () => {
    expectGateApprox(rx(0), I)
    expectGateApprox(ry(0), I)
    expectGateApprox(rz(0), I)
  })

  it('RY(pi) maps |0> to |1>, same as X (both real-valued rotations)', () => {
    // acting on |0> reads off the matrix's first column
    expect(equalsApprox(ry(Math.PI)[0][0], X[0][0])).toBe(true)
    expect(equalsApprox(ry(Math.PI)[1][0], X[1][0])).toBe(true)
  })
})

describe('GATE_DEFINITIONS', () => {
  it('reports arity matching each matrix dimension', () => {
    for (const def of Object.values(GATE_DEFINITIONS)) {
      const dim = def.matrix(def.paramNames.length ? { theta: 0.5 } : undefined).length
      expect(dim).toBe(1 << def.arity)
    }
  })

  it('resolves RX with the given theta', () => {
    expect(GATE_DEFINITIONS.RX.matrix({ theta: 0.7 })).toEqual(rx(0.7))
  })

  it('defaults theta to 0 when omitted', () => {
    expectGateApprox(GATE_DEFINITIONS.RZ.matrix(), I)
  })
})
