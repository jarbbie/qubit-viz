import { create } from 'zustand'
import { GATE_DEFINITIONS, type GateId } from '../quantum/gates'
import { applyGate, createState, type StateVector } from '../quantum/stateVector'

/** Beyond this, basis labels (2^n rows) get unwieldy and simulation cost grows exponentially. */
export const MAX_QUBITS = 10

export interface Qubit {
  id: string
  label: string
  enabled: boolean
}

export interface CircuitStep {
  id: string
  gateId: GateId
  /** Qubit ids in gate-basis order (e.g. [control, target] for CNOT). */
  targets: string[]
  params?: Record<string, number>
}

export interface CircuitStore {
  qubits: Qubit[]
  steps: CircuitStep[]
  /** history[0] is the initial |0...0> state; history[i] is the state after steps[i - 1]. */
  history: StateVector[]
  /** Scrub position into `history`, driven by the simulation runner. */
  currentStepIndex: number

  addQubit: () => void
  removeQubit: (qubitId: string) => void
  setQubitEnabled: (qubitId: string, enabled: boolean) => void

  addGate: (gateId: GateId, targets: string[], params?: Record<string, number>) => void
  removeGate: (stepId: string) => void
  clearCircuit: () => void

  setCurrentStepIndex: (index: number) => void
  stepForward: () => void
  stepBackward: () => void

  reset: () => void
}

/**
 * Replays `steps` over the enabled qubits from scratch. A step whose targets
 * aren't all currently enabled is skipped (its qubit has no bit position to
 * act on) but still gets a history entry so the scrub bar stays aligned with
 * step count regardless of which qubits are enabled at any given time.
 */
function computeHistory(qubits: Qubit[], steps: CircuitStep[]): StateVector[] {
  const activeIds = qubits.filter((q) => q.enabled).map((q) => q.id)
  if (activeIds.length === 0) return []

  let state = createState(activeIds.length)
  const history = [state]
  for (const step of steps) {
    if (!step.targets.every((t) => activeIds.includes(t))) {
      history.push(state)
      continue
    }
    const gate = GATE_DEFINITIONS[step.gateId].matrix(step.params)
    const positions = step.targets.map((t) => activeIds.indexOf(t))
    state = applyGate(state, gate, positions)
    history.push(state)
  }
  return history
}

function recompute(qubits: Qubit[], steps: CircuitStep[], prevIndex: number) {
  const history = computeHistory(qubits, steps)
  const maxIndex = Math.max(history.length - 1, 0)
  return { history, currentStepIndex: Math.min(prevIndex, maxIndex) }
}

function createDefaultQubit(existing: Qubit[]): Qubit {
  return { id: crypto.randomUUID(), label: `Q${existing.length + 1}`, enabled: true }
}

const initialQubits = [createDefaultQubit([])]

export const useCircuitStore = create<CircuitStore>((set) => ({
  qubits: initialQubits,
  steps: [],
  history: computeHistory(initialQubits, []),
  currentStepIndex: 0,

  addQubit: () =>
    set((s) => {
      if (s.qubits.length >= MAX_QUBITS) return s
      const qubits = [...s.qubits, createDefaultQubit(s.qubits)]
      return { qubits, ...recompute(qubits, s.steps, s.currentStepIndex) }
    }),

  removeQubit: (qubitId) =>
    set((s) => {
      const qubits = s.qubits.filter((q) => q.id !== qubitId)
      const steps = s.steps.filter((step) => !step.targets.includes(qubitId))
      return { qubits, steps, ...recompute(qubits, steps, s.currentStepIndex) }
    }),

  setQubitEnabled: (qubitId, enabled) =>
    set((s) => {
      const qubits = s.qubits.map((q) => (q.id === qubitId ? { ...q, enabled } : q))
      return { qubits, ...recompute(qubits, s.steps, s.currentStepIndex) }
    }),

  addGate: (gateId, targets, params) =>
    set((s) => {
      const def = GATE_DEFINITIONS[gateId]
      if (targets.length !== def.arity) {
        throw new Error(`${gateId} requires ${def.arity} target qubit(s), got ${targets.length}`)
      }
      for (const t of targets) {
        if (!s.qubits.some((q) => q.id === t)) throw new Error(`unknown qubit ${t}`)
      }
      const step: CircuitStep = { id: crypto.randomUUID(), gateId, targets, params }
      const steps = [...s.steps, step]
      const history = computeHistory(s.qubits, steps)
      // jump the scrub position to the step just added, since that's what the user is building
      return { steps, history, currentStepIndex: history.length - 1 }
    }),

  removeGate: (stepId) =>
    set((s) => {
      const steps = s.steps.filter((step) => step.id !== stepId)
      return { steps, ...recompute(s.qubits, steps, s.currentStepIndex) }
    }),

  clearCircuit: () =>
    set((s) => {
      const steps: CircuitStep[] = []
      return { steps, ...recompute(s.qubits, steps, 0) }
    }),

  setCurrentStepIndex: (index) =>
    set((s) => ({
      currentStepIndex: Math.max(0, Math.min(index, s.history.length - 1)),
    })),

  stepForward: () =>
    set((s) => ({
      currentStepIndex: Math.min(s.currentStepIndex + 1, s.history.length - 1),
    })),

  stepBackward: () =>
    set((s) => ({
      currentStepIndex: Math.max(s.currentStepIndex - 1, 0),
    })),

  reset: () => {
    const qubits = [createDefaultQubit([])]
    set({ qubits, steps: [], history: computeHistory(qubits, []), currentStepIndex: 0 })
  },
}))

export function selectCurrentState(store: Pick<CircuitStore, 'history' | 'currentStepIndex'>): StateVector | undefined {
  return store.history[store.currentStepIndex]
}
