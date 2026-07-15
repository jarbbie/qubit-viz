import { Canvas } from '@react-three/fiber'
import { Line, OrbitControls } from '@react-three/drei'
import type { BlochVector } from '../../quantum/blochVector'
import { circlePoints, toThreeVector } from './blochCoordinates'

// Static reference rings — same shape for every BlochSphere instance.
const EQUATOR = circlePoints('xz', 64, 1.01)
const MERIDIAN_A = circlePoints('xy', 64, 1.01)
const MERIDIAN_B = circlePoints('yz', 64, 1.01)

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
        camera={{ position: [2.64, 2.15, 2.97], fov: 35 }}
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
