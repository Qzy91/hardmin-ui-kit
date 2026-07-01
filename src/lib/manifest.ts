import type { ComponentManifest, ComponentEntry } from '../types'

export interface ManifestSummary {
  synced: Array<{ name: string } & ComponentEntry>
  pending: Array<{ name: string } & ComponentEntry>
  outdated: Array<{ name: string } & ComponentEntry>
}

export function parseManifest(manifest: ComponentManifest): ManifestSummary {
  const entries = Object.entries(manifest.components).map(([name, entry]) => ({ name, ...entry }))
  return {
    synced: entries.filter(e => e.status === 'synced'),
    pending: entries.filter(e => e.status === 'pending'),
    outdated: entries.filter(e => e.status === 'outdated'),
  }
}

export function getUnsynced(manifest: ComponentManifest): Array<{ name: string; source: string }> {
  return Object.entries(manifest.components)
    .filter(([, entry]) => entry.status === 'pending')
    .map(([name, entry]) => ({ name, source: entry.source }))
}

export function markSynced(
  manifest: ComponentManifest,
  name: string,
  date: string,
): ComponentManifest {
  return {
    ...manifest,
    components: {
      ...manifest.components,
      [name]: { ...manifest.components[name], status: 'synced', extractedAt: date },
    },
  }
}
