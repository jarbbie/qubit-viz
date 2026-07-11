import { describe, expect, it } from 'vitest'
import { toThreeVector } from './blochCoordinates'

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
