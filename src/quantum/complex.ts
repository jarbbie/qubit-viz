export interface Complex {
  re: number
  im: number
}

export function complex(re: number, im = 0): Complex {
  return { re, im }
}

export const ZERO: Complex = complex(0, 0)
export const ONE: Complex = complex(1, 0)

export function add(a: Complex, b: Complex): Complex {
  return complex(a.re + b.re, a.im + b.im)
}

export function sub(a: Complex, b: Complex): Complex {
  return complex(a.re - b.re, a.im - b.im)
}

export function mul(a: Complex, b: Complex): Complex {
  return complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re)
}

export function scale(a: Complex, s: number): Complex {
  return complex(a.re * s, a.im * s)
}

export function conj(a: Complex): Complex {
  return complex(a.re, -a.im)
}

/** Squared magnitude — avoids the sqrt when only relative size or probability matters. */
export function abs2(a: Complex): number {
  return a.re * a.re + a.im * a.im
}

export function abs(a: Complex): number {
  return Math.sqrt(abs2(a))
}

export function equalsApprox(a: Complex, b: Complex, eps = 1e-9): boolean {
  return Math.abs(a.re - b.re) < eps && Math.abs(a.im - b.im) < eps
}
