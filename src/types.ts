export type ComponentStatus = 'synced' | 'pending' | 'outdated'

export interface ComponentEntry {
  source: string
  status: ComponentStatus
  extractedAt: string | null
  destination: string
}

export interface ComponentManifest {
  version: number
  lastSync: string | null
  components: Record<string, ComponentEntry>
}

export interface Project {
  slug: string
  name: string
  description: string
  createdAt: string
  pages: string[]
}
