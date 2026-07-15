import { GATE_DEFINITIONS, type GateId } from '../quantum/gates'

interface GatePaletteProps {
  armedGateId: GateId | null
  qubitCount: number
  onSelectGate: (gateId: GateId) => void
}

const GATE_IDS = Object.keys(GATE_DEFINITIONS) as GateId[]

export function GatePalette({ armedGateId, qubitCount, onSelectGate }: GatePaletteProps) {
  return (
    <div className="border border-neutral-700 p-3">
      <h2 className="mb-3 font-mono text-xs tracking-widest text-neutral-400 uppercase">Gates</h2>
      <div className="grid grid-cols-4 gap-2">
        {GATE_IDS.map((id) => {
          const isArmed = armedGateId === id
          const needsMoreQubits = GATE_DEFINITIONS[id].arity > qubitCount
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectGate(id)}
              disabled={needsMoreQubits}
              aria-pressed={isArmed}
              title={needsMoreQubits ? `${id} needs ${GATE_DEFINITIONS[id].arity} qubits` : id}
              className={`flex h-12 w-12 items-center justify-center border font-mono text-sm font-semibold transition-colors ${
                isArmed
                  ? 'border-sky-400 bg-sky-600/40 text-white'
                  : needsMoreQubits
                    ? 'cursor-not-allowed border-neutral-800 bg-neutral-300/5 text-neutral-600'
                    : 'border-neutral-600 bg-neutral-300/10 text-neutral-200 hover:bg-neutral-300/20'
              }`}
            >
              {id}
            </button>
          )
        })}
      </div>
    </div>
  )
}
