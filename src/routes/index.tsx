import { createFileRoute } from '@tanstack/react-router'
import { CircuitVisualizerPage } from '../components/CircuitVisualizerPage'

export const Route = createFileRoute('/')({
  component: CircuitVisualizerPage,
})
