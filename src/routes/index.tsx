import { createFileRoute } from '@tanstack/react-router'
import { CircuitVisualizerPage } from '../components/CircuitVisualizerPage'

interface IndexSearch {
  /** URL-encoded circuit, present when the page was opened from a shared link. */
  c?: string
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): IndexSearch => ({
    c: typeof search.c === 'string' ? search.c : undefined,
  }),
  component: CircuitVisualizerPage,
})
