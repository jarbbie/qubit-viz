import { useEffect, useState } from 'react'
import { useCircuitStore } from '../../store/circuitStore'

const STEP_DURATION_MS = 700
// Beyond this many steps, numbers would start wrapping onto a second line,
// so switch to plain tick marks instead of collapsing the layout.
const MAX_NUMBERED_TICKS = 17

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

  const maxStepIndex = Math.max(historyLength - 1, 0)

  function goToStep(index: number) {
    setCurrentStepIndex(Math.min(Math.max(index, 0), maxStepIndex))
  }

  return (
    <div className="border border-neutral-700 p-4">
      <h2 className="mb-4 font-mono text-xs tracking-widest text-neutral-400 uppercase">Simulation runner</h2>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={handlePlayToggle}
          disabled={!canPlay}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-950 disabled:opacity-30"
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={maxStepIndex}
            value={currentStepIndex}
            onChange={(e) => setCurrentStepIndex(Number(e.target.value))}
            disabled={!canPlay}
            className="w-full accent-sky-400"
          />
          <div className="mt-1.5 flex items-end justify-between gap-x-2 font-mono text-[10px] text-neutral-500">
            {Array.from({ length: historyLength }, (_, i) =>
              historyLength <= MAX_NUMBERED_TICKS ? (
                <span key={i}>{i}</span>
              ) : (
                <span key={i} className="h-2 w-px bg-neutral-700" />
              ),
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-neutral-400">
          <button
            type="button"
            onClick={() => goToStep(currentStepIndex - 1)}
            disabled={!canPlay || currentStepIndex <= 0}
            className="flex h-6 w-6 items-center justify-center border border-neutral-600 text-neutral-300 hover:border-sky-400 hover:text-sky-400 disabled:opacity-30 disabled:hover:border-neutral-600 disabled:hover:text-neutral-300"
          >
            −
          </button>
          <input
            type="number"
            min={0}
            max={maxStepIndex}
            value={currentStepIndex}
            disabled={!canPlay}
            onChange={(e) => {
              const parsed = Number(e.target.value)
              if (!Number.isNaN(parsed)) goToStep(Math.round(parsed))
            }}
            className="w-14 appearance-none border border-neutral-600 bg-neutral-900 px-1 py-1 text-center text-neutral-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => goToStep(currentStepIndex + 1)}
            disabled={!canPlay || currentStepIndex >= maxStepIndex}
            className="flex h-6 w-6 items-center justify-center border border-neutral-600 text-neutral-300 hover:border-sky-400 hover:text-sky-400 disabled:opacity-30 disabled:hover:border-neutral-600 disabled:hover:text-neutral-300"
          >
            +
          </button>
          <span>/ {maxStepIndex}</span>
        </div>
      </div>
    </div>
  )
}
