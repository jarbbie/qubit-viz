import { useEffect, useRef, useState } from 'react'
import { blochVector } from '../../quantum/blochVector'
import { selectCurrentState, useCircuitStore } from '../../store/circuitStore'
import { BlochSphere } from './BlochSphere'

const MIN_SPHERE_SIZE = 64
const MAX_SPHERE_SIZE = 360
const SPHERE_GAP = 24 // matches the sphere grid's gap-6
const MAX_COLUMNS = 5

/**
 * Picks the largest square size that fits `count` spheres into the
 * available content box using at most MAX_COLUMNS per row (wrapping to
 * further rows beyond that), mirroring the grid layout below.
 */
function sphereSizeFor(contentWidth: number, contentHeight: number, count: number): number {
  if (count <= 0 || contentWidth <= 0 || contentHeight <= 0) return MAX_SPHERE_SIZE

  const cols = Math.min(count, MAX_COLUMNS)
  const rows = Math.ceil(count / cols)
  const sizeByWidth = (contentWidth - (cols - 1) * SPHERE_GAP) / cols
  const sizeByHeight = (contentHeight - (rows - 1) * SPHERE_GAP) / rows

  return Math.max(MIN_SPHERE_SIZE, Math.min(MAX_SPHERE_SIZE, Math.min(sizeByWidth, sizeByHeight)))
}

interface VisualizationPanelProps {
  className?: string
}

export function VisualizationPanel({ className }: VisualizationPanelProps) {
  const qubits = useCircuitStore((s) => s.qubits)
  const state = useCircuitStore(selectCurrentState)
  const enabledQubits = qubits.filter((q) => q.enabled)

  const contentRef = useRef<HTMLDivElement>(null)
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) =>
      setContentSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const sphereSize = sphereSizeFor(contentSize.width, contentSize.height, enabledQubits.length)

  return (
    <section className={`flex flex-col border border-neutral-700 p-4 ${className ?? ''}`}>
      <h2 className="mb-4 font-mono text-xs tracking-widest text-neutral-400 uppercase">Visualization</h2>
      <div ref={contentRef} className="min-h-0 flex-1">
        {!state || enabledQubits.length === 0 ? (
          <p className="font-mono text-xs text-neutral-500">No enabled qubits.</p>
        ) : (
          <div
            className="grid items-start gap-6"
            style={{ gridTemplateColumns: `repeat(${Math.min(enabledQubits.length, MAX_COLUMNS)}, max-content)` }}
          >
            {/*
              computeHistory (circuitStore.ts) rebuilds `state` from the current
              `qubits` array on every mutation, so state.numQubits ===
              enabledQubits.length here and ordering matches — index i into
              enabledQubits is the correct bloch-vector qubit index, not the
              qubit's row position in the full (unfiltered) qubits list.
            */}
            {enabledQubits.map((qubit, i) => (
              <BlochSphere key={qubit.id} vector={blochVector(state, i)} label={qubit.label} size={sphereSize} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
