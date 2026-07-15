import { describe, expect, it } from 'vitest'
import { circlePoints, toThreeVector } from './blochCoordinates'

describe('toThreeVector', () => {
  it('maps quantum +z (|0>) to three +Y (vertical)', () => {
    expect(toThreeVector({ x: 0, y: 0, z: 1 })).toEqual([0, 1, 0])
  })

  it('maps quantum +x to three +Z (toward camera)', () => {
    expect(toThreeVector({ x: 1, y: 0, z: 0 })).toEqual([0, 0, 1])
  })

  it('maps quantum +y to three +X (right)', () => {
    expect(toThreeVector({ x: 0, y: 1, z: 0 })).toEqual([1, 0, 0])
  })

  it('preserves vector magnitude (proper rotation)', () => {
    const v = { x: 0.3, y: -0.5, z: 0.8 }
    const [tx, ty, tz] = toThreeVector(v)
    const before = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2)
    const after = Math.sqrt(tx ** 2 + ty ** 2 + tz ** 2)
    expect(after).toBeCloseTo(before)
  })
})

describe('circlePoints', () => {
  it('returns a closed loop', () => {
    const pts = circlePoints('xz', 8)
    const [first, last] = [pts[0], pts[pts.length - 1]]
    first.forEach((coord, i) => expect(coord).toBeCloseTo(last[i]))
  })

  it('lies in the requested plane', () => {
    for (const p of circlePoints('xy', 16)) expect(p[2]).toBeCloseTo(0)
    for (const p of circlePoints('yz', 16)) expect(p[0]).toBeCloseTo(0)
    for (const p of circlePoints('xz', 16)) expect(p[1]).toBeCloseTo(0)
  })

  it('lies at the given radius from the origin', () => {
    for (const p of circlePoints('xy', 16, 1.5)) {
      expect(Math.sqrt(p[0] ** 2 + p[1] ** 2 + p[2] ** 2)).toBeCloseTo(1.5)
    }
  })
})
