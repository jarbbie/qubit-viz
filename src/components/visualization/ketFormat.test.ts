import { describe, expect, it } from 'vitest'
import { complex } from '../../quantum/complex'
import { CNOT, H, X } from '../../quantum/gates'
import { applyGate, createState } from '../../quantum/stateVector'
import { basisLabel, bitReverse, formatComplex, formatStateVector } from './ketFormat'

describe('basisLabel', () => {
  it('zero-pads a display index to the qubit count', () => {
    expect(basisLabel(0, 2)).toBe('00')
    expect(basisLabel(2, 2)).toBe('10')
    expect(basisLabel(3, 3)).toBe('011')
  })
})

describe('bitReverse', () => {
  it('reverses the low n bits', () => {
    expect(bitReverse(0b10, 2)).toBe(0b01)
    expect(bitReverse(0b001, 3)).toBe(0b100)
    expect(bitReverse(0b011, 3)).toBe(0b110)
  })

  it('is its own inverse', () => {
    for (let v = 0; v < 8; v++) {
      expect(bitReverse(bitReverse(v, 3), 3)).toBe(v)
    }
  })

  it('is a no-op for a single bit', () => {
    expect(bitReverse(0, 1)).toBe(0)
    expect(bitReverse(1, 1)).toBe(1)
  })
})

describe('formatComplex', () => {
  it('formats a pure real amplitude', () => {
    expect(formatComplex(complex(0.7071, 0))).toBe('0.71')
  })

  it('formats a negative real amplitude', () => {
    expect(formatComplex(complex(-0.7071, 0))).toBe('-0.71')
  })

  it('formats a purely imaginary amplitude', () => {
    expect(formatComplex(complex(0, 1))).toBe('1i')
    expect(formatComplex(complex(0, -0.5))).toBe('-0.5i')
  })

  it('formats a mixed real+imaginary amplitude', () => {
    expect(formatComplex(complex(0.5, 0.5))).toBe('0.5+0.5i')
    expect(formatComplex(complex(0.5, -0.5))).toBe('0.5-0.5i')
  })
})

describe('formatStateVector', () => {
  it('formats |0...0> as a single term', () => {
    expect(formatStateVector(createState(2))).toBe('1|00⟩')
  })

  it('omits amplitudes below epsilon and joins remaining terms with +', () => {
    let state = createState(2)
    state = applyGate(state, H, [0])
    state = applyGate(state, CNOT, [0, 1])
    // Bell state: 0.71|00> + 0.71|11>, |01> and |10> suppressed as ~0
    expect(formatStateVector(state)).toBe('0.71|00⟩ + 0.71|11⟩')
  })

  it('renders a negative term with a minus rather than "+ -"', () => {
    // |1> - the sole term should show its own sign, not a leading " + "
    const state = applyGate(createState(1), X, [0])
    expect(formatStateVector(state)).toBe('1|1⟩')
  })

  it('joins a positive then negative term with " - "', () => {
    // (H then Z)|0> = 0.71|0> - 0.71|1>
    let state = createState(1)
    state = applyGate(state, H, [0])
    state = applyGate(
      state,
      [
        [complex(1), complex(0)],
        [complex(0), complex(-1)],
      ],
      [0],
    )
    expect(formatStateVector(state)).toBe('0.71|0⟩ - 0.71|1⟩')
  })

  it('returns "0" for an all-suppressed state', () => {
    const state = createState(1)
    state.amplitudes[0] = complex(0, 0)
    expect(formatStateVector(state)).toBe('0')
  })

  it('writes qubit 0 leftmost, not the raw basis-index bit order', () => {
    // X on qubit 1 only (qubit 0 untouched): q0=0, q1=1 -> "01" in the
    // qubit-0-leftmost convention. The Bell-state test above is a
    // palindrome (00/11) and wouldn't catch a bit-reversal regression;
    // this asymmetric case would.
    const state = applyGate(createState(2), X, [1])
    expect(formatStateVector(state)).toBe('1|01⟩')
  })
})
