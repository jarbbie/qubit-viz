import { useEffect, useState } from 'react'
import { GATE_DEFINITIONS, type GateId } from '../quantum/gates'
import { useCircuitStore } from '../store/circuitStore'
import { CircuitWiring } from './CircuitWiring'
import { GateParameterPanel } from './GateParameterPanel'
import { GatePalette } from './GatePalette'

/**
 * Owns the transient "which gate is armed for placement" selection — this is
 * UI interaction state, not circuit data, so it stays out of useCircuitStore.
 */
export function CircuitBuilder() {
  const qubits = useCircuitStore((s) => s.qubits)
  const steps = useCircuitStore((s) => s.steps)
  const addGate = useCircuitStore((s) => s.addGate)
  const removeGate = useCircuitStore((s) => s.removeGate)
  const addQubit = useCircuitStore((s) => s.addQubit)
  const removeQubit = useCircuitStore((s) => s.removeQubit)
  const setQubitEnabled = useCircuitStore((s) => s.setQubitEnabled)

  const [armedGateId, setArmedGateId] = useState<GateId | null>(null)
  const [params, setParams] = useState<Record<string, number>>({})
  const [pendingTargets, setPendingTargets] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // A gate armed before qubits were removed can outlive the qubits it needs
  // to complete placement, otherwise leaving it stuck armed with no way to
  // finish (or restart) placement.
  useEffect(() => {
    if (armedGateId && GATE_DEFINITIONS[armedGateId].arity > qubits.length) {
      setArmedGateId(null)
      setParams({})
      setPendingTargets([])
    }
  }, [armedGateId, qubits.length])

  function selectGate(gateId: GateId) {
    if (GATE_DEFINITIONS[gateId].arity > qubits.length) return
    setError(null)
    setPendingTargets([])
    if (armedGateId === gateId) {
      setArmedGateId(null)
      setParams({})
      return
    }
    setArmedGateId(gateId)
    const defaults: Record<string, number> = {}
    for (const name of GATE_DEFINITIONS[gateId].paramNames) defaults[name] = 0
    setParams(defaults)
  }

  function handleWireClick(qubitId: string) {
    if (!armedGateId || pendingTargets.includes(qubitId)) return

    const targets = [...pendingTargets, qubitId]
    const arity = GATE_DEFINITIONS[armedGateId].arity
    if (targets.length < arity) {
      setPendingTargets(targets)
      return
    }

    try {
      addGate(armedGateId, targets, params)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place gate')
    }
    setArmedGateId(null)
    setParams({})
    setPendingTargets([])
  }

  return (
    <div className="flex flex-col gap-4">
      <GatePalette armedGateId={armedGateId} qubitCount={qubits.length} onSelectGate={selectGate} />
      <CircuitWiring
        qubits={qubits}
        steps={steps}
        armedGateId={armedGateId}
        pendingTargets={pendingTargets}
        onWireClick={handleWireClick}
        onRemoveStep={removeGate}
        onRemoveQubit={removeQubit}
        onToggleQubit={setQubitEnabled}
        onAddQubit={addQubit}
      />
      {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      <GateParameterPanel
        armedGateId={armedGateId}
        params={params}
        onParamChange={(name, value) => setParams((p) => ({ ...p, [name]: value }))}
      />
    </div>
  )
}
