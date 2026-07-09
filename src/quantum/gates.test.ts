import { describe, expect, it } from 'vitest'
import { add, complex, conj, equalsApprox, mul, ZERO } from './complex'
import { CNOT, type Gate, H, I, S, SWAP, T, X, Y, Z } from './gates'

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
})
