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
