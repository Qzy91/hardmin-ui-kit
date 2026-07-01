---
name: create-project
description: Create a new section (folder) under pages/ with _section.ts and a starter index.tsx
---

# Create Section

## Language rule

Communicate with the user in whatever language they write in.
All UI text inside generated `.tsx` files — labels, headings, button text — must be in **Czech** unless the user explicitly asks for another language.

## What this creates

A new section = a new folder under `pages/`. It appears automatically in the sidebar after the browser reloads.

## Ask the user

1. **Section name** — Czech label shown in sidebar (e.g. "Fakturační modul", "Uživatelé")
2. **Sidebar group** — which group header to appear under:
   - `Moduly` — EMS, Servisní modul, Fakturační modul, etc.
   - `Administrace` — Users, Operators, Platform settings
   - `Hlavní` — Dashboard, overview pages
   - Or a custom group name, or leave empty (no group header)
3. **Icon** — suggest one based on section name:
   | Section | Suggested icon |
   |---|---|
   | EMS, energie | `Zap` |
   | Servisní, opravy | `Wrench` |
   | Fakturace, billing | `Receipt` |
   | Uživatelé | `Users` |
   | Dokumenty | `FileText` |
   | Reporty | `BarChart3` |
   | Nastavení | `Settings` |
   | Organizace | `Building2` |

Generate a slug from the section name: lowercase, hyphens, ASCII only (e.g. "Fakturační modul" → `fakturacni-modul`).

## Files to create

**`pages/{slug}/_section.ts`:**
```ts
import { IconName } from 'lucide-react'

export const title = '{Czech section name}'
export const icon = IconName
export const group = '{group}'   // omit line if no group
```

**`pages/{slug}/index.tsx`:**
```tsx
import { IconName } from 'lucide-react'

export const title = 'Přehled'
export const icon = IconName

export default function {PascalSlug}Index() {
  return (
    <div className="min-h-screen bg-bg_secondary">
      <div className="bg-bg_primary border-b border-bg_border_element px-8 py-4 flex items-center gap-3">
        <IconName className="h-5 w-5 text-text_secondary" />
        <span className="text-text_secondary text-sm">{Czech section name}</span>
        <span className="text-text_secondary mx-1">–</span>
        <h1 className="text-xl font-bold text-text_primary">Přehled</h1>
      </div>
      <div className="px-8 py-6">
        <div className="rounded-lg border border-bg_border_element bg-bg_primary p-6">
          <p className="text-sm text-text_secondary">Obsah sekce.</p>
        </div>
      </div>
    </div>
  )
}
```

## After creating

1. Tell the user: "Sekce vytvořena. Prohlížeč se automaticky přenačte."
2. Navigation URL: `http://localhost:5200/{slug}/index`
3. Suggest: "Use the `build-page` skill to add more pages to this section."

> No `npm run dev` restart needed — Vite detects new files and reloads the browser.
