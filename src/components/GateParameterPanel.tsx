import { GATE_DEFINITIONS, type GateId } from '../quantum/gates'

interface GateParameterPanelProps {
  armedGateId: GateId | null
  params: Record<string, number>
  onParamChange: (name: string, value: number) => void
}

export function GateParameterPanel({ armedGateId, params, onParamChange }: GateParameterPanelProps) {
  const paramNames = armedGateId ? GATE_DEFINITIONS[armedGateId].paramNames : []

  return (
    <div className="border border-neutral-700 p-3">
      <h2 className="mb-3 font-mono text-xs tracking-widest text-neutral-400 uppercase">Parameters</h2>
      {paramNames.length === 0 ? (
        <p className="font-mono text-xs text-neutral-500">
          {armedGateId ? 'This gate takes no parameters.' : 'Select a gate to configure it.'}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {paramNames.map((name) => (
            <label key={name} className="flex items-center justify-between gap-3 font-mono text-xs text-neutral-300">
              <span>
                {name} (rad)
              </span>
              <input
                type="number"
                step={0.01}
                value={params[name] ?? 0}
                onChange={(e) => onParamChange(name, Number(e.target.value))}
                className="w-24 border border-neutral-600 bg-neutral-900 px-2 py-1 text-right text-neutral-100"
              />
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
