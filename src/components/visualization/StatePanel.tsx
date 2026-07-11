import { selectCurrentState, useCircuitStore } from '../../store/circuitStore'
import { formatStateVector } from './ketFormat'

export function StatePanel() {
  const state = useCircuitStore(selectCurrentState)

  return (
    <div className="p-4">
      <h2 className="mb-3 font-mono text-xs tracking-widest text-neutral-400 uppercase">State</h2>
      <p className="break-words font-mono text-sm text-neutral-100">{state ? formatStateVector(state) : '—'}</p>
    </div>
  )
}
