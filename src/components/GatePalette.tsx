import { GATE_DEFINITIONS, type GateId } from '../quantum/gates'

interface GatePaletteProps {
  armedGateId: GateId | null
  qubitCount: number
  onSelectGate: (gateId: GateId) => void
}

const GATE_IDS = Object.keys(GATE_DEFINITIONS) as GateId[]
const GRID_COLUMNS = 4

/** Keeps the tooltip from overflowing off the edge of the palette's outer columns. */
function tooltipAlignment(column: number): string {
  if (column === 0) return 'left-0'
  if (column === GRID_COLUMNS - 1) return 'right-0'
  return 'left-1/2 -translate-x-1/2'
}

export function GatePalette({ armedGateId, qubitCount, onSelectGate }: GatePaletteProps) {
  return (
    <div className="border border-neutral-700 p-3">
      <h2 className="mb-3 font-mono text-xs tracking-widest text-neutral-400 uppercase">Gates</h2>
      <div className="grid grid-cols-4 gap-2">
        {GATE_IDS.map((id, index) => {
          const gate = GATE_DEFINITIONS[id]
          const isArmed = armedGateId === id
          const needsMoreQubits = gate.arity > qubitCount
          return (
            <div key={id} className="group relative">
              <button
                type="button"
                onClick={() => onSelectGate(id)}
                disabled={needsMoreQubits}
                aria-pressed={isArmed}
                title={needsMoreQubits ? `${id} needs ${gate.arity} qubits` : id}
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
              <div
                className={`pointer-events-none absolute bottom-full z-20 mb-2 hidden w-48 border border-neutral-600 bg-neutral-900 p-2 font-mono text-xs group-hover:block ${tooltipAlignment(index % GRID_COLUMNS)}`}
              >
                <p className="font-semibold text-neutral-100">{gate.name}</p>
                <p className="mt-1 text-neutral-400">{gate.description}</p>
                {needsMoreQubits && <p className="mt-1 text-amber-400">Needs {gate.arity} qubits</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
