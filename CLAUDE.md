# Quantum Circuit Visualizer

Interactive web app for building quantum circuits and visualizing qubit
states in real time on Bloch spheres.

## Stack
- Vite + React + TypeScript
- TanStack Router (file-based routing)
- Tailwind CSS v4 (via @tailwindcss/vite plugin — no tailwind.config.js)
- Three.js + @react-three/fiber + @react-three/drei (Bloch sphere rendering)
- Zustand (circuit/gate state)
- No backend — all simulation runs client-side (state vector math is cheap)
- Circuits are shareable via URL-encoded state (`src/store/circuitUrlCodec.ts`), not a database

## Core concepts
- Each qubit is a 2-element complex vector; gates are 2x2 (or 4x4 for
  two-qubit gates like CNOT) unitary matrices applied via matrix multiplication
- N qubits = one visualization sphere per qubit; users can add/remove/
  enable/disable qubits dynamically
- Entanglement is shown by shrinking a qubit's Bloch vector toward the
  center (reduced density matrix), not a separate visualization
- Simulation runner supports step-by-step replay via a duration/scrub bar —
  state history must be stored per-step (read-only history for v1, no
  retroactive editing of past gate parameters)

## Layout (see wireframe in /docs if added)
- Toolbar (gate palette, icon grid) + Circuit wiring + Gate parameters (left)
- Visualization (N Bloch spheres) + Simulation runner + State + Probabilities (right/bottom)

## Conventions
- Prefer editing existing files over creating new ones unless a clear
  new module is warranted
- Keep gate matrix logic and rendering logic in separate modules
