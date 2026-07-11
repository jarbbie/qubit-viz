import { blochVector } from '../../quantum/blochVector'
import { selectCurrentState, useCircuitStore } from '../../store/circuitStore'
import { BlochSphere } from './BlochSphere'

interface VisualizationPanelProps {
  className?: string
}

export function VisualizationPanel({ className }: VisualizationPanelProps) {
  const qubits = useCircuitStore((s) => s.qubits)
  const state = useCircuitStore(selectCurrentState)
  const enabledQubits = qubits.filter((q) => q.enabled)

  return (
    <section className={`border border-neutral-700 p-4 ${className ?? ''}`}>
      <h2 className="mb-4 font-mono text-xs tracking-widest text-neutral-400 uppercase">Visualization</h2>
      {!state || enabledQubits.length === 0 ? (
        <p className="font-mono text-xs text-neutral-500">No enabled qubits.</p>
      ) : (
        <div className="flex flex-wrap items-start gap-6">
          {/*
            computeHistory (circuitStore.ts) rebuilds `state` from the current
            `qubits` array on every mutation, so state.numQubits ===
            enabledQubits.length here and ordering matches — index i into
            enabledQubits is the correct bloch-vector qubit index, not the
            qubit's row position in the full (unfiltered) qubits list.
          */}
          {enabledQubits.map((qubit, i) => (
            <BlochSphere key={qubit.id} vector={blochVector(state, i)} label={qubit.label} />
          ))}
        </div>
      )}
    </section>
  )
}
