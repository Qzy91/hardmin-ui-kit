import { describe, it, expect } from 'vitest'
import { parseManifest, getUnsynced, markSynced } from './manifest'
import type { ComponentManifest } from '../types'

const sample: ComponentManifest = {
  version: 1,
  lastSync: null,
  components: {
    Button: {
      source: 'resources/js/components/ui/button.tsx',
      status: 'synced',
      extractedAt: '2026-06-26',
      destination: 'components/ui/button.tsx',
    },
    LineChart: {
      source: 'resources/js/components/charts/line-chart.tsx',
      status: 'pending',
      extractedAt: null,
      destination: 'components/charts/line-chart.tsx',
    },
  },
}

describe('parseManifest', () => {
  it('groups components by status', () => {
    const result = parseManifest(sample)
    expect(result.synced).toHaveLength(1)
    expect(result.synced[0].name).toBe('Button')
    expect(result.pending).toHaveLength(1)
    expect(result.pending[0].name).toBe('LineChart')
    expect(result.outdated).toHaveLength(0)
  })
})

describe('getUnsynced', () => {
  it('returns only pending components with name and source', () => {
    const result = getUnsynced(sample)
    expect(result).toEqual([
      { name: 'LineChart', source: 'resources/js/components/charts/line-chart.tsx' },
    ])
  })
})

describe('markSynced', () => {
  it('sets status to synced and records the date', () => {
    const updated = markSynced(sample, 'LineChart', '2026-06-26')
    expect(updated.components.LineChart.status).toBe('synced')
    expect(updated.components.LineChart.extractedAt).toBe('2026-06-26')
  })

  it('does not mutate the original manifest', () => {
    markSynced(sample, 'LineChart', '2026-06-26')
    expect(sample.components.LineChart.status).toBe('pending')
  })
})
