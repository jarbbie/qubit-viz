import { Canvas } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import type { BlochVector } from '../../quantum/blochVector'
import { toThreeVector } from './blochCoordinates'

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
        camera={{ position: [1.6, 1.3, 1.8], fov: 35 }}
        frameloop="demand"
      >
        <ambientLight intensity={1} />
        <mesh>
          <sphereGeometry args={[1, 16, 12]} />
          <meshBasicMaterial color="#8ea2c6" wireframe />
        </mesh>
        <Line points={[[-1.3, 0, 0], [1.3, 0, 0]]} color="#6b7280" />
        <Line points={[[0, -1.3, 0], [0, 1.3, 0]]} color="#6b7280" />
        <Line points={[[0, 0, -1.3], [0, 0, 1.3]]} color="#6b7280" />
        <Line points={[[0, 0, 0], tip]} color="#facc15" lineWidth={2} />
        <mesh position={tip}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
      </Canvas>
      {label && <span className="font-mono text-xs text-neutral-400">{label}</span>}
    </div>
  )
}
