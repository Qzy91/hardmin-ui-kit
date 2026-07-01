import type { LucideIcon } from 'lucide-react'
import type { ComponentType } from 'react'

const pageModules = import.meta.glob('/pages/**/*.tsx', { eager: true })
const sectionMetas = import.meta.glob('/pages/**/_section.ts', { eager: true })

function formatLabel(slug: string): string {
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export interface PageEntry {
  section: string
  page: string
  path: string
  component: ComponentType
  title: string
  icon?: LucideIcon
  hidden?: boolean
}

export interface SectionEntry {
  key: string
  title: string
  icon?: LucideIcon
  group?: string
  pages: PageEntry[]
}

function getSectionMeta(section: string): { title?: string; icon?: LucideIcon; group?: string } {
  const key = `/pages/${section}/_section.ts`
  const mod = sectionMetas[key] as { title?: string; icon?: LucideIcon; group?: string } | undefined
  return mod ?? {}
}

export function buildSections(): SectionEntry[] {
  const sections = new Map<string, SectionEntry>()

  for (const [key, mod] of Object.entries(pageModules)) {
    // '/pages/service-module/index.tsx' → section='service-module', page='index'
    const match = key.match(/^\/pages\/([^/]+)\/([^/]+)\.tsx$/)
    if (!match) continue

    const [, section, page] = match
    const m = mod as { default?: ComponentType; title?: string; icon?: LucideIcon; hidden?: boolean }
    if (!m.default) continue

    if (!sections.has(section)) {
      const meta = getSectionMeta(section)
      sections.set(section, {
        key: section,
        title: meta.title ?? formatLabel(section),
        icon: meta.icon,
        group: meta.group,
        pages: [],
      })
    }

    sections.get(section)!.pages.push({
      section,
      page,
      path: `/${section}/${page}`,
      component: m.default,
      title: m.title ?? formatLabel(page),
      icon: m.icon,
      hidden: m.hidden,
    })
  }

  for (const section of sections.values()) {
    section.pages.sort((a, b) => {
      if (a.page === 'index') return -1
      if (b.page === 'index') return 1
      return a.page.localeCompare(b.page)
    })
  }

  return Array.from(sections.values())
}
