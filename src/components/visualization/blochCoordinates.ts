import type { BlochVector } from '../../quantum/blochVector'

/**
 * Maps the quantum Bloch convention (|0> = +z, x = Tr(ρX), y = Tr(ρY)) onto
 * Three.js's Y-up axes: quantum z -> three Y (vertical), quantum y -> three
 * X (right), quantum x -> three Z (toward camera). A cyclic axis
 * permutation, so it's a proper rotation (no mirroring).
 */
export function toThreeVector(v: BlochVector): [number, number, number] {
  return [v.y, v.z, v.x]
}

/**
 * Generates a closed loop of points around a circle lying in one of the
 * three.js coordinate planes, for drawing sparse reference great-circles
 * (equator + meridians) on the Bloch sphere surface.
 */
export function circlePoints(
  plane: 'xy' | 'yz' | 'xz',
  segments = 64,
  radius = 1,
): [number, number, number][] {
  const points: [number, number, number][] = []
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2
    const a = radius * Math.cos(theta)
    const b = radius * Math.sin(theta)
    switch (plane) {
      case 'xy':
        points.push([a, b, 0])
        break
      case 'yz':
        points.push([0, a, b])
        break
      case 'xz':
        points.push([a, 0, b])
        break
    }
  }
  return points
}
