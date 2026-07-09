import { describe, expect, it } from 'vitest'
import { abs, abs2, add, complex, conj, equalsApprox, mul, scale, sub } from './complex'

describe('complex', () => {
  it('adds', () => {
    expect(add(complex(1, 2), complex(3, -1))).toEqual(complex(4, 1))
  })

  it('subtracts', () => {
    expect(sub(complex(1, 2), complex(3, -1))).toEqual(complex(-2, 3))
  })

  it('multiplies', () => {
    // (1+2i)(3-1i) = 3 -1i +6i -2i^2 = 3 +5i +2 = 5+5i
    expect(mul(complex(1, 2), complex(3, -1))).toEqual(complex(5, 5))
  })

  it('multiplies i by i to get -1', () => {
    expect(mul(complex(0, 1), complex(0, 1))).toEqual(complex(-1, 0))
  })

  it('scales', () => {
    expect(scale(complex(2, -3), 2)).toEqual(complex(4, -6))
  })

  it('conjugates', () => {
    expect(conj(complex(2, -3))).toEqual(complex(2, 3))
  })

  it('computes magnitude and squared magnitude', () => {
    expect(abs2(complex(3, 4))).toBe(25)
    expect(abs(complex(3, 4))).toBe(5)
  })

  it('compares approximately', () => {
    expect(equalsApprox(complex(1, 1), complex(1 + 1e-12, 1))).toBe(true)
    expect(equalsApprox(complex(1, 1), complex(1.1, 1))).toBe(false)
  })
})
