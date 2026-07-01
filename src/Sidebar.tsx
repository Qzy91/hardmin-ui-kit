import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SidebarNavGroup } from './SidebarNavGroup'
import { SidebarNavLink } from './SidebarNavLink'
import { SidebarSection } from './SidebarSection'
import type { SectionEntry } from './use-pages'

interface Props {
  collapsed: boolean
  sections: SectionEntry[]
}

function groupSections(sections: SectionEntry[]): Array<{ title?: string; sections: SectionEntry[] }> {
  const map = new Map<string, SectionEntry[]>()
  const order: string[] = []

  for (const section of sections) {
    const key = section.group ?? ''
    if (!map.has(key)) {
      map.set(key, [])
      order.push(key)
    }
    map.get(key)!.push(section)
  }

  return order.map((key) => ({
    title: key || undefined,
    sections: map.get(key)!,
  }))
}

export function Sidebar({ collapsed, sections }: Props) {
  const { pathname } = useLocation()

  const activeSection =
    sections.find((s) => s.pages.some((p) => p.path === pathname))?.key ?? null

  const [openSection, setOpenSection] = useState<string | null>(
    activeSection ?? sections[0]?.key ?? null,
  )

  useEffect(() => {
    if (activeSection) setOpenSection(activeSection)
  }, [activeSection])

  const groups = groupSections(sections)

  return (
    <div
      className={cn(
        'relative sticky top-0 flex h-screen flex-shrink-0 flex-col overflow-hidden border-r border-bg_border_element bg-bg_primary text-text_primary transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex h-16 flex-shrink-0 items-center border-b border-bg_border_element',
          collapsed ? 'justify-center px-2' : 'pl-5',
        )}
      >
        {collapsed ? (
          <span className="text-xl font-bold text-main_color">H</span>
        ) : (
          <span className="text-base font-semibold text-text_primary">Hardmin UI Kit</span>
        )}
      </div>

      {/* Nav */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {groups.map((group, gi) => (
          <div key={group.title ?? gi}>
            {gi > 0 && <div className="mx-2 my-1 h-px bg-bg_border_element" />}
            <SidebarSection title={group.title} collapsed={collapsed}>
              {group.sections.map((section) => {
                const hasActiveItem = section.pages.filter((p) => !p.hidden).some((p) => p.path === pathname)

                return (
                  <SidebarNavGroup
                    key={section.key}
                    label={section.title}
                    icon={section.icon}
                    collapsed={collapsed}
                    isOpen={openSection === section.key}
                    onOpenChange={(open) => setOpenSection(open ? section.key : null)}
                    hasActiveItem={hasActiveItem}
                  >
                    {section.pages.filter((p) => !p.hidden).map((page) => (
                      <SidebarNavLink
                        key={page.path}
                        to={page.path}
                        label={page.title}
                        icon={page.icon}
                        collapsed={collapsed}
                      />
                    ))}
                  </SidebarNavGroup>
                )
              })}
            </SidebarSection>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-bg_border_element p-3">
        {!collapsed && (
          <span className="text-xs text-text_secondary">UI Kit preview</span>
        )}
      </div>
    </div>
  )
}
