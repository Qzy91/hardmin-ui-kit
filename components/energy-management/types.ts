export interface EmsColumn {
  id: string
  period: string
  label: string
  dataType: 'consumption' | 'price'
}

export interface EmsNodeMetadata {
  photosCount?: number
  contactsCount?: number
  hasDistribution?: boolean
  hasContracts?: boolean
  hasDocuments?: boolean
  hasAi?: boolean
}

export interface EmsRow {
  id: string
  label: string
  level: number
  data: Record<string, string | null>
  metadata?: EmsNodeMetadata
  children?: EmsRow[]
}

export interface EmsMediaTab {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  colorClass?: string
  textColorClass?: string
  borderColorClass?: string
}
