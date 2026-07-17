import { GATE_DEFINITIONS, type GateId } from '../quantum/gates'
import type { CircuitStep, Qubit } from './circuitStore'

const FORMAT_VERSION = 1
// Mirrors circuitStore.ts's MAX_QUBITS, duplicated (not imported) so this
// module stays a dependency-free leaf that's trivial to test in isolation.
const MAX_QUBITS = 10

type EncodedStep = [gateId: string, targets: number[], theta?: number]

interface EncodedCircuit {
  v: number
  n: number
  /** Disabled qubit indices; omitted when every qubit is enabled. */
  d?: number[]
  s: EncodedStep[]
}

export interface DecodedCircuit {
  qubitCount: number
  disabledIndices: number[]
  steps: { gateId: GateId; targets: number[]; params?: Record<string, number> }[]
}

/** Encodes a circuit into a URL-safe string suitable for a `?c=` search param. */
export function encodeCircuit(qubits: Qubit[], steps: CircuitStep[]): string {
  const indexOf = new Map(qubits.map((q, i) => [q.id, i]))
  const disabled = qubits.flatMap((q, i) => (q.enabled ? [] : [i]))

  const encodedSteps: EncodedStep[] = steps.map((step) => {
    const targets = step.targets.map((id) => indexOf.get(id)!)
    const wantsTheta = GATE_DEFINITIONS[step.gateId].paramNames.includes('theta')
    return wantsTheta ? [step.gateId, targets, step.params?.theta ?? 0] : [step.gateId, targets]
  })

  const payload: EncodedCircuit = {
    v: FORMAT_VERSION,
    n: qubits.length,
    ...(disabled.length > 0 ? { d: disabled } : {}),
    s: encodedSteps,
  }

  return base64UrlEncode(JSON.stringify(payload))
}

/**
 * Decodes a `?c=` value back into a circuit description. Returns null for
 * anything that invalidates the circuit's basic shape (bad base64/JSON, bad
 * qubit count) since there's no safe partial recovery from that. Individual
 * bad steps (unknown gate, wrong target count, out-of-range target) are
 * dropped instead, so a mostly-valid hand-edited URL still loads what it can.
 */
export function decodeCircuit(encoded: string): DecodedCircuit | null {
  let payload: unknown
  try {
    payload = JSON.parse(base64UrlDecode(encoded))
  } catch {
    return null
  }

  if (!isEncodedCircuit(payload)) return null
  const { n, d, s } = payload
  if (!Number.isInteger(n) || n < 1 || n > MAX_QUBITS) return null

  const disabledIndices = Array.from(new Set((d ?? []).filter((i) => Number.isInteger(i) && i >= 0 && i < n)))

  const steps: DecodedCircuit['steps'] = []
  for (const raw of s) {
    const step = decodeStep(raw, n)
    if (step) steps.push(step)
  }

  return { qubitCount: n, disabledIndices, steps }
}

function decodeStep(
  raw: unknown,
  qubitCount: number,
): { gateId: GateId; targets: number[]; params?: Record<string, number> } | null {
  if (!Array.isArray(raw) || raw.length < 2 || raw.length > 3) return null
  const [gateId, targets, theta] = raw as [unknown, unknown, unknown]

  if (typeof gateId !== 'string' || !(gateId in GATE_DEFINITIONS)) return null
  const def = GATE_DEFINITIONS[gateId as GateId]

  if (!Array.isArray(targets) || targets.length !== def.arity) return null
  if (!targets.every((i) => Number.isInteger(i) && i >= 0 && i < qubitCount)) return null
  if (new Set(targets).size !== targets.length) return null

  if (!def.paramNames.includes('theta')) {
    return { gateId: gateId as GateId, targets }
  }
  const resolvedTheta = typeof theta === 'number' && Number.isFinite(theta) ? theta : 0
  return { gateId: gateId as GateId, targets, params: { theta: resolvedTheta } }
}

function isEncodedCircuit(value: unknown): value is EncodedCircuit {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return v.v === FORMAT_VERSION && typeof v.n === 'number' && Array.isArray(v.s)
}

function base64UrlEncode(text: string): string {
  return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(text: string): string {
  const padded = text + '='.repeat((4 - (text.length % 4)) % 4)
  return atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
}
