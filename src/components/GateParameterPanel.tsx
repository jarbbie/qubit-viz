import { GATE_DEFINITIONS, type GateId } from '../quantum/gates'

interface GateParameterPanelProps {
  armedGateId: GateId | null
  params: Record<string, number>
  onParamChange: (name: string, value: number) => void
}

const PARAM_STEP = 0.1

/** Rounds to the step's precision to avoid float drift from repeated +/- clicks (e.g. 0.3 - 0.1 -> 0.19999999999999998). */
function stepValue(value: number, delta: number): number {
  return Math.round((value + delta) * 1000) / 1000
}

export function GateParameterPanel({ armedGateId, params, onParamChange }: GateParameterPanelProps) {
  const paramNames = armedGateId ? GATE_DEFINITIONS[armedGateId].paramNames : []

  if (paramNames.length === 0) return null

  return (
    <div className="border border-neutral-700 p-3">
      <h2 className="mb-3 font-mono text-xs tracking-widest text-neutral-400 uppercase">Parameters</h2>
      <div className="flex flex-col gap-2">
        {paramNames.map((name) => {
          const value = params[name] ?? 0
          return (
            <label key={name} className="flex items-center justify-between gap-3 font-mono text-xs text-neutral-300">
              <span>
                {name} (rad)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onParamChange(name, stepValue(value, -PARAM_STEP))}
                  className="flex h-6 w-6 shrink-0 items-center justify-center border border-neutral-600 text-neutral-300 hover:border-sky-400 hover:text-sky-400"
                >
                  −
                </button>
                <input
                  type="number"
                  step={PARAM_STEP}
                  value={value}
                  onChange={(e) => onParamChange(name, Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  className="w-20 appearance-none border border-neutral-600 bg-neutral-900 px-2 py-1 text-right text-neutral-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => onParamChange(name, stepValue(value, PARAM_STEP))}
                  className="flex h-6 w-6 shrink-0 items-center justify-center border border-neutral-600 text-neutral-300 hover:border-sky-400 hover:text-sky-400"
                >
                  +
                </button>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}
