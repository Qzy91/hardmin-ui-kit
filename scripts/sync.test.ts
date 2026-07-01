import { describe, it, expect } from 'vitest'
import { categorizeComponents, buildDestinationPath } from './sync'

describe('categorizeComponents', () => {
  it('routes ui components to ui bucket', () => {
    const result = categorizeComponents(['resources/js/components/ui/button.tsx'])
    expect(result.ui).toContain('resources/js/components/ui/button.tsx')
    expect(result.charts).toHaveLength(0)
  })

  it('routes chart components to charts bucket', () => {
    const result = categorizeComponents(['resources/js/components/charts/line-chart.tsx'])
    expect(result.charts).toContain('resources/js/components/charts/line-chart.tsx')
  })

  it('routes unknown paths to other bucket', () => {
    const result = categorizeComponents(['resources/js/sections/ems/components/metadata-icons.tsx'])
    expect(result.other).toContain('resources/js/sections/ems/components/metadata-icons.tsx')
  })
})

describe('buildDestinationPath', () => {
  it('maps ui component to components/ui/', () => {
    expect(buildDestinationPath('resources/js/components/ui/button.tsx')).toBe('components/ui/button.tsx')
  })

  it('maps chart component to components/charts/', () => {
    expect(buildDestinationPath('resources/js/components/charts/line-chart.tsx')).toBe(
      'components/charts/line-chart.tsx',
    )
  })

  it('maps unknown path to components/other/', () => {
    expect(buildDestinationPath('resources/js/sections/ems/metadata-icons.tsx')).toBe(
      'components/other/metadata-icons.tsx',
    )
  })
})
