import { getProbabilities } from '../../quantum/stateVector'
import { selectCurrentState, useCircuitStore } from '../../store/circuitStore'
import { basisLabel } from './ketFormat'

export function ProbabilitiesPanel() {
  const state = useCircuitStore(selectCurrentState)
  const probs = state ? getProbabilities(state) : []

  return (
    <div className="p-4">
      <h2 className="mb-3 font-mono text-xs tracking-widest text-neutral-400 uppercase">Probabilities</h2>
      <ul className="flex flex-col gap-1">
        {probs.map((p, i) => (
          <li key={i} className="flex items-center gap-2 font-mono text-xs text-neutral-300">
            <span className="shrink-0">|{basisLabel(i, state!.numQubits)}⟩</span>
            <div className="h-2 flex-1 bg-neutral-800">
              <div className="h-2 bg-sky-500" style={{ width: `${p * 100}%` }} />
            </div>
            <span className="w-10 text-right">{(p * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
