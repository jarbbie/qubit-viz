import { CircuitBuilder } from './components/CircuitBuilder'

function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <h1 className="mb-6 font-mono text-2xl font-bold">Qubit Visualizer</h1>
      <div className="max-w-sm">
        <CircuitBuilder />
      </div>
    </div>
  )
}

export default App
