import { useEffect, useRef, useState } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useCircuitStore } from '../store/circuitStore'
import { decodeCircuit, encodeCircuit } from '../store/circuitUrlCodec'
import { CircuitBuilder } from './CircuitBuilder'
import { ProbabilitiesPanel } from './visualization/ProbabilitiesPanel'
import { SimulationRunner } from './visualization/SimulationRunner'
import { StatePanel } from './visualization/StatePanel'
import { VisualizationPanel } from './visualization/VisualizationPanel'

const routeApi = getRouteApi('/')
const COPY_FEEDBACK_MS = 1500

export function CircuitVisualizerPage() {
  const { c } = routeApi.useSearch()
  const navigate = useNavigate({ from: '/' })
  const loadCircuit = useCircuitStore((s) => s.loadCircuit)
  const qubits = useCircuitStore((s) => s.qubits)
  const steps = useCircuitStore((s) => s.steps)

  // Guards against StrictMode's double-invoked effects re-running the load.
  const loadedRef = useRef(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')

  useEffect(() => {
    if (loadedRef.current || !c) return
    loadedRef.current = true
    const decoded = decodeCircuit(c)
    if (decoded) loadCircuit(decoded)
  }, [c, loadCircuit])

  async function handleShare() {
    const encoded = encodeCircuit(qubits, steps)
    navigate({ search: { c: encoded }, replace: true })

    const url = new URL(window.location.href)
    url.searchParams.set('c', encoded)
    try {
      await navigator.clipboard.writeText(url.toString())
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
    setTimeout(() => setCopyState('idle'), COPY_FEEDBACK_MS)
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-6 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-mono text-2xl font-bold">Qubit Visualizer</h1>
        <button
          type="button"
          onClick={handleShare}
          className="border border-neutral-700 px-2 py-1 font-mono text-xs text-neutral-300 hover:border-neutral-500"
        >
          {copyState === 'copied' ? 'Copied!' : copyState === 'error' ? 'Copy failed — see URL bar' : 'Share'}
        </button>
      </div>
      <div className="flex gap-4">
        <div className="w-80 shrink-0">
          <CircuitBuilder />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <SimulationRunner />
          <VisualizationPanel className="min-h-105 flex-1" />
          <div className="grid grid-cols-2 divide-x divide-neutral-700 border border-neutral-700">
            <StatePanel />
            <ProbabilitiesPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
