import { useEffect, useState } from 'react'
import { useCircuitStore } from '../../store/circuitStore'

const STEP_DURATION_MS = 700

export function SimulationRunner() {
  const historyLength = useCircuitStore((s) => s.history.length)
  const currentStepIndex = useCircuitStore((s) => s.currentStepIndex)
  const setCurrentStepIndex = useCircuitStore((s) => s.setCurrentStepIndex)
  const stepForward = useCircuitStore((s) => s.stepForward)
  const [isPlaying, setIsPlaying] = useState(false)

  const atEnd = currentStepIndex >= historyLength - 1
  const canPlay = historyLength > 1

  useEffect(() => {
    if (!isPlaying) return
    if (atEnd) {
      setIsPlaying(false)
      return
    }
    const id = setInterval(stepForward, STEP_DURATION_MS)
    return () => clearInterval(id)
  }, [isPlaying, atEnd, stepForward])

  function handlePlayToggle() {
    if (!canPlay) return
    if (!isPlaying && atEnd) setCurrentStepIndex(0)
    setIsPlaying((p) => !p)
  }

  return (
    <div className="border border-neutral-700 p-4">
      <h2 className="mb-4 font-mono text-xs tracking-widest text-neutral-400 uppercase">Simulation runner</h2>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handlePlayToggle}
          disabled={!canPlay}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-950 disabled:opacity-30"
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <div className="relative flex-1 pb-4">
          <input
            type="range"
            min={0}
            max={Math.max(historyLength - 1, 0)}
            value={currentStepIndex}
            onChange={(e) => setCurrentStepIndex(Number(e.target.value))}
            disabled={!canPlay}
            className="w-full accent-sky-400"
          />
          <div className="pointer-events-none absolute inset-x-0 top-4 font-mono text-[10px] text-neutral-500">
            {Array.from({ length: historyLength }, (_, i) => i).map((i) => (
              <span
                key={i}
                className="absolute -translate-x-1/2"
                style={{ left: `${historyLength > 1 ? (i / (historyLength - 1)) * 100 : 0}%` }}
              >
                {i}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
