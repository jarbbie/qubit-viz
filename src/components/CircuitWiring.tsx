import { Fragment, type CSSProperties } from 'react'
import type { GateId } from '../quantum/gates'
import type { CircuitStep, Qubit } from '../store/circuitStore'

interface CircuitWiringProps {
  qubits: Qubit[]
  steps: CircuitStep[]
  armedGateId: GateId | null
  pendingTargets: string[]
  onWireClick: (qubitId: string) => void
  onRemoveStep: (stepId: string) => void
  onRemoveQubit: (qubitId: string) => void
  onToggleQubit: (qubitId: string, enabled: boolean) => void
  onAddQubit: () => void
}

const COLUMN_WIDTH = 56
const ROW_HEIGHT = 44

/** Marker glyph for a gate at a given position within its target list (control vs. target, etc.). */
function gateMarker(gateId: GateId, targetIndex: number, targetCount: number): { label: string; boxed: boolean } {
  if (gateId === 'CNOT') return targetIndex === 0 ? { label: '●', boxed: false } : { label: '⊕', boxed: true }
  if (gateId === 'CCX') return targetIndex < targetCount - 1 ? { label: '●', boxed: false } : { label: '⊕', boxed: true }
  if (gateId === 'CZ') return { label: '●', boxed: false }
  if (gateId === 'SWAP') return { label: '✕', boxed: false }
  return { label: gateId, boxed: true }
}

export function CircuitWiring({
  qubits,
  steps,
  armedGateId,
  pendingTargets,
  onWireClick,
  onRemoveStep,
  onRemoveQubit,
  onToggleQubit,
  onAddQubit,
}: CircuitWiringProps) {
  const rowOf = (qubitId: string) => qubits.findIndex((q) => q.id === qubitId)
  const appendCol = steps.length + 2 // col 1 = header, cols 2..steps.length+1 = placed gates

  const gridStyle: CSSProperties = {
    gridTemplateColumns: `max-content repeat(${steps.length + 1}, ${COLUMN_WIDTH}px)`,
    gridTemplateRows: `repeat(${qubits.length}, ${ROW_HEIGHT}px)`,
  }

  return (
    <div className="border border-neutral-700 p-3">
      <h2 className="mb-3 font-mono text-xs tracking-widest text-neutral-400 uppercase">Circuit</h2>

      <div className="grid items-center overflow-x-auto" style={gridStyle}>
        {qubits.map((qubit, row) => (
          <div
            key={`header-${qubit.id}`}
            style={{ gridRow: row + 1, gridColumn: 1 }}
            className="flex items-center gap-2 pr-3 font-mono text-sm text-neutral-200"
          >
            <button
              type="button"
              onClick={() => onRemoveQubit(qubit.id)}
              title="Remove qubit"
              className="text-neutral-500 hover:text-red-400"
            >
              ×
            </button>
            <button
              type="button"
              onClick={() => onToggleQubit(qubit.id, !qubit.enabled)}
              title={qubit.enabled ? 'Disable qubit' : 'Enable qubit'}
              className={qubit.enabled ? 'text-sky-400' : 'text-neutral-600'}
            >
              ●
            </button>
            <span>q[{row}]</span>
          </div>
        ))}

        {qubits.map((qubit, row) => (
          <div
            key={`wire-${qubit.id}`}
            style={{ gridRow: row + 1, gridColumn: '2 / -1', alignSelf: 'center' }}
            className="h-px bg-neutral-600"
          />
        ))}

        {steps.map((step, stepIndex) => {
          const col = stepIndex + 2
          const rows = step.targets.map(rowOf).filter((r) => r >= 0)
          if (rows.length === 0) return null // targets currently disabled/removed
          const minRow = Math.min(...rows)
          const maxRow = Math.max(...rows)

          return (
            <Fragment key={step.id}>
              {rows.length > 1 && (
                <div
                  style={{ gridColumn: col, gridRow: `${minRow + 1} / span ${maxRow - minRow + 1}` }}
                  className="z-10 mx-auto w-px self-stretch bg-neutral-400"
                />
              )}
              {step.targets.map((targetId, i) => {
                const r = rowOf(targetId)
                if (r < 0) return null
                const marker = gateMarker(step.gateId, i, step.targets.length)
                return (
                  <button
                    key={`${step.id}-${targetId}`}
                    type="button"
                    onClick={() => onRemoveStep(step.id)}
                    title={`${step.gateId} — click to remove`}
                    style={{ gridColumn: col, gridRow: r + 1 }}
                    className={
                      marker.boxed
                        ? 'z-10 mx-auto flex h-8 w-10 items-center justify-center border border-neutral-500 bg-neutral-800 font-mono text-xs text-neutral-100 hover:border-red-400'
                        : 'z-10 mx-auto flex h-8 w-10 items-center justify-center font-mono text-base text-neutral-100 hover:text-red-400'
                    }
                  >
                    {marker.label}
                  </button>
                )
              })}
            </Fragment>
          )
        })}

        {qubits.map((qubit, row) => {
          const isPending = pendingTargets.includes(qubit.id)
          return (
            <button
              key={`append-${qubit.id}`}
              type="button"
              disabled={!armedGateId}
              onClick={() => onWireClick(qubit.id)}
              style={{ gridColumn: appendCol, gridRow: row + 1 }}
              className={`z-10 mx-auto flex h-8 w-10 items-center justify-center border border-dashed font-mono text-xs ${
                isPending
                  ? 'border-sky-400 bg-sky-600/30 text-white'
                  : armedGateId
                    ? 'border-neutral-500 text-neutral-500 hover:border-sky-400 hover:text-sky-400'
                    : 'border-transparent text-transparent'
              }`}
            >
              {isPending ? '…' : '+'}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onAddQubit}
        className="mt-3 border border-neutral-700 px-2 py-1 font-mono text-xs text-neutral-300 hover:border-neutral-500"
      >
        + Add qubit
      </button>
    </div>
  )
}
