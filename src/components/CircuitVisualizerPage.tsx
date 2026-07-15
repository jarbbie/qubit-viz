import { CircuitBuilder } from './CircuitBuilder'
import { ProbabilitiesPanel } from './visualization/ProbabilitiesPanel'
import { SimulationRunner } from './visualization/SimulationRunner'
import { StatePanel } from './visualization/StatePanel'
import { VisualizationPanel } from './visualization/VisualizationPanel'

export function CircuitVisualizerPage() {
  return (
    <div className="min-h-screen bg-neutral-950 p-6 text-white">
      <h1 className="mb-6 font-mono text-2xl font-bold">Qubit Visualizer</h1>
      <div className="flex gap-4">
        <div className="w-80 shrink-0">
          <CircuitBuilder />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <VisualizationPanel className="min-h-[420px] flex-1" />
          <div className="grid grid-cols-[2fr_3fr] items-start gap-4">
            <SimulationRunner />
            <div className="grid grid-cols-2 divide-x divide-neutral-700 border border-neutral-700">
              <StatePanel />
              <ProbabilitiesPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
