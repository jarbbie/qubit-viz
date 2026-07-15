import { Canvas } from '@react-three/fiber'
import { Html, Line, OrbitControls } from '@react-three/drei'
import type { BlochVector } from '../../quantum/blochVector'
import { circlePoints, toThreeVector } from './blochCoordinates'

// Static reference rings — same shape for every BlochSphere instance.
const EQUATOR = circlePoints('xz', 64, 1.01)
const MERIDIAN_A = circlePoints('xy', 64, 1.01)
const MERIDIAN_B = circlePoints('yz', 64, 1.01)

// Quantum-axis labels at the tip of each axis line, so orientation stays
// readable after dragging. Positions follow toThreeVector's mapping
// (quantum z -> three Y, quantum y -> three X, quantum x -> three Z).
const AXIS_LABELS: { position: [number, number, number]; text: string }[] = [
  { position: [0, 1.42, 0], text: '|0⟩' },
  { position: [0, -1.42, 0], text: '|1⟩' },
  { position: [1.42, 0, 0], text: 'Y' },
  { position: [0, 0, 1.42], text: 'X' },
]

// Rendered as real DOM text (not a 3D SDF mesh) so labels use the browser's
// built-in font — no external font asset to fetch, so there's nothing to
// fail if the network is unavailable.
function AxisLabel({ position, text }: { position: [number, number, number]; text: string }) {
  return (
    <Html position={position} center style={{ pointerEvents: 'none' }}>
      <span className="font-mono text-[10px] whitespace-nowrap text-neutral-400">{text}</span>
    </Html>
  )
}

interface BlochSphereProps {
  vector: BlochVector
  label?: string
  size?: number
}

export function BlochSphere({ vector, label, size = 160 }: BlochSphereProps) {
  const tip = toThreeVector(vector)

  return (
    <div className="flex flex-col items-center gap-1">
      <Canvas
        style={{ width: size, height: size }}
        camera={{ position: [3.25, 2.64, 3.65], fov: 35 }}
        frameloop="demand"
      >
        <ambientLight intensity={1} />
        <mesh>
          <sphereGeometry args={[1, 32, 24]} />
          <meshBasicMaterial color="#8ea2c6" transparent opacity={0.12} depthWrite={false} />
        </mesh>
        <Line points={EQUATOR} color="#6b7280" transparent opacity={0.45} />
        <Line points={MERIDIAN_A} color="#6b7280" transparent opacity={0.45} />
        <Line points={MERIDIAN_B} color="#6b7280" transparent opacity={0.45} />
        <Line points={[[-1.3, 0, 0], [1.3, 0, 0]]} color="#6b7280" />
        <Line points={[[0, -1.3, 0], [0, 1.3, 0]]} color="#6b7280" />
        <Line points={[[0, 0, -1.3], [0, 0, 1.3]]} color="#6b7280" />
        {AXIS_LABELS.map((a) => (
          <AxisLabel key={a.text} position={a.position} text={a.text} />
        ))}
        <Line points={[[0, 0, 0], tip]} color="#facc15" lineWidth={2} />
        <mesh position={tip}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
        <OrbitControls enableRotate enableZoom={false} enablePan={false} />
      </Canvas>
      {label && <span className="font-mono text-xs text-neutral-400">{label}</span>}
    </div>
  )
}
