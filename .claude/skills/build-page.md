---
name: build-page
description: Add a new page to an existing section under pages/
---

# Build Page

## Language rule

Communicate with the user in whatever language they write in.
All UI text inside generated `.tsx` files — labels, headings, button text, placeholder text — must be in **Czech** unless the user explicitly asks for another language.

## Ask the user

1. **Which section?** — list folder names from `pages/*/` (e.g. `ems`, `service-module`)
2. **Page name** (e.g. "Seznam uživatelů", "Editace faktury")
3. **Page type:**
   - **Dashboard** — stat cards + placeholder charts
   - **Form** — labeled inputs, submit button
   - **Table** — `UnifiedTable` with mock data
   - **Custom** — blank page, user describes content
4. **Reference screenshot?** — Ask: "Máš screenshot nebo příklad, jak má stránka vypadat? (z reálné aplikace, Figmy, nebo jiného zdroje)"
   - If yes: study the screenshot carefully before generating — match the layout, sections, colors, and component structure as closely as possible
   - If no: build a reasonable default and note: "Bez reference — výsledek může vyžadovat úpravy."

## RULE: always use components, never native HTML equivalents

This is the most important rule. Before writing any HTML element, check the table below.
If a component exists — use it. **Never use native HTML when a component is available.**

| Native HTML | Use instead | Import |
|---|---|---|
| `<input type="text">` | `Input` | `@/components/ui/input` |
| `<textarea>` | `Textarea` | `@/components/ui/textarea` |
| `<select>` / `<option>` | `Select` + `SelectTrigger` + `SelectContent` + `SelectItem` | `@/components/ui/select` |
| `<button>` | `Button` | `@/components/ui/button` |
| `<label>` | `Label` | `@/components/ui/label` |
| `<input type="checkbox">` | `Checkbox` | `@/components/ui/checkbox` |
| `<input type="radio">` | `RadioGroup` + `RadioGroupItem` | `@/components/ui/radio-group` |
| `<table>` | `UnifiedTable` | `@/components/table` |
| `<dialog>` / modal overlay | `Dialog` + `DialogContent` etc. | `@/components/ui/dialog` |
| Tab buttons | `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent` | `@/components/ui/tabs` |
| `<input type="date">` | `DatePicker` | `@/components/other/date-picker` |
| Search field | `SearchInput` | `@/components/other/search-input` |
| Multi-select dropdown | `MultiSelect` | `@/components/other/multi-select` |

Exceptions — where raw Tailwind is acceptable:
- Page header bar (`bg-bg_primary border-b ...`) — no component for this
- Static info fields (read-only label+value pairs) — plain `<div>` is fine
- Category tab bars that are NOT shadcn Tabs (e.g. filter tabs that just set state) — plain `<button>` is fine

## Component usage examples

### Select (dropdown filter)

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

<Select value={filter} onValueChange={(v) => setFilter(v)}>
  <SelectTrigger className="w-44">
    <SelectValue placeholder="Všechny stavy" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="">Všechny stavy</SelectItem>
    <SelectItem value="aktivni">Aktivní</SelectItem>
    <SelectItem value="smazane">Smazané</SelectItem>
  </SelectContent>
</Select>
```

### Input + Label

```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<div className="space-y-1.5">
  <Label htmlFor="nazev">Název</Label>
  <Input id="nazev" placeholder="Zadejte název…" value={form.nazev} onChange={(e) => setForm({ ...form, nazev: e.target.value })} />
</div>
```

### Button variants

```tsx
import { Button } from '@/components/ui/button'

<Button>Uložit</Button>                          // primary (main_color)
<Button variant="outline">Zrušit</Button>        // bordered
<Button variant="destructive">Smazat</Button>    // red
<Button variant="ghost">Skrýt</Button>           // no border
```

### Dialog (modal)

```tsx
import { Dialog, DialogContent } from '@/components/ui/dialog'

<Dialog open={open} onOpenChange={(o: boolean) => setOpen(o)}>
  <DialogContent className="max-w-lg">
    {/* modal content */}
  </DialogContent>
</Dialog>
```

### Tabs (shadcn)

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

<Tabs defaultValue="obecne">
  <TabsList>
    <TabsTrigger value="obecne">Obecné</TabsTrigger>
    <TabsTrigger value="parametry">Parametry</TabsTrigger>
  </TabsList>
  <TabsContent value="obecne">…</TabsContent>
  <TabsContent value="parametry">…</TabsContent>
</Tabs>
```

## Tables — always use these, never write `<table>` manually

| Need | Component | Import |
|---|---|---|
| Standard data table (sort, pagination, actions, columns) | `UnifiedTable` | `@/components/table` |
| Row action menu (⋯) | `RowActionsMenu` | `@/components/table` |
| EMS energy hierarchy table | `EmsTable` | `@/components/energy-management/EmsTable` |

```tsx
import { UnifiedTable, RowActionsMenu } from '@/components/table'
import type { ColumnDef } from '@tanstack/react-table'

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'name', header: 'Název' },
  { accessorKey: 'status', header: 'Stav',
    cell: ({ getValue }) => <Badge variant="success">{getValue() as string}</Badge> },
]

<UnifiedTable
  data={DATA}
  columns={columns}
  renderRowActions={(row: Row) => (
    <RowActionsMenu items={[
      { label: 'Upravit', onClick: () => {} },
      { label: 'Smazat', onClick: () => {}, isDestructive: true },
    ]} />
  )}
/>
```

`UnifiedTable` props: `data`, `columns`, `onRowClick`, `renderRowActions`,
`rowTone` (`'deleted'` → red row), `pageSize`, `showColumnSelector`, `showResultsCount`.

## Badge variants (never invent custom ones)

`default · secondary · destructive · outline · success · warning`

Mapping: active/done → `success`, deleted/error → `destructive`, pending → `warning`, neutral → `outline`.

## Empty cell values

Always `?? '—'` (em-dash), never empty string.

## Dynamic pages (detail / edit with data)

If the page needs to show data for a specific record (detail faktury, editace uživatele), use **query params** — not static mock data:

```tsx
import { useSearchParams } from 'react-router-dom'

export default function DetailPage() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const item = DATA.find((d) => String(d.id) === id)
  if (!item) return <div className="p-8 text-text_secondary">Záznam nenalezen.</div>
  // render item
}
```

The list page navigates on row click:
```tsx
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()

<UnifiedTable
  data={DATA}
  columns={COLUMNS}
  onRowClick={(row) => navigate(`/section/detail?id=${row.id}`)}
/>
```

**Hide from sidebar** — detail/edit pages should not appear as sidebar items. Add:
```tsx
export const hidden = true
```

**Shared data between pages** — extract to `pages/{section}/_data.ts`:
```ts
export interface Faktura { id: number; cislo: string; ... }
export const DATA: Faktura[] = [...]
```

Generate page slug from name: lowercase, hyphens, ASCII (e.g. "Seznam uživatelů" → `seznam-uzivatelu`).

## File to create

**`pages/{section}/{page-slug}.tsx`**

Always add these named exports at the top:

```tsx
export const title = '{Czech page name}'   // shown in sidebar
export const icon = SomeIcon               // optional, from lucide-react
```

## Page structure

Every page must have this header pattern (matches the real HardminCloud look):

```tsx
<div className="min-h-screen bg-bg_secondary">
  <div className="bg-bg_primary border-b border-bg_border_element px-8 py-4 flex items-center gap-3">
    <SomeIcon className="h-5 w-5 text-text_secondary" />
    <span className="text-text_secondary text-sm">{Section name}</span>
    <span className="text-text_secondary mx-1">–</span>
    <h1 className="text-xl font-bold text-text_primary">{Page name}</h1>
  </div>
  <div className="px-8 py-6">
    {/* page content */}
  </div>
</div>
```

## Template: Dashboard

```tsx
export const title = 'Přehled'

const STATS = [
  { label: 'Celkem', value: '0' },
  { label: 'Aktivní', value: '0' },
]

export default function SectionDashboard() {
  return (
    <div className="min-h-screen bg-bg_secondary">
      <div className="bg-bg_primary border-b border-bg_border_element px-8 py-4 flex items-center gap-3">
        <span className="text-text_secondary text-sm">Sekce</span>
        <span className="text-text_secondary mx-1">–</span>
        <h1 className="text-xl font-bold text-text_primary">Přehled</h1>
      </div>
      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-lg border border-bg_border_element bg-bg_primary p-5">
              <p className="text-sm text-text_secondary">{s.label}</p>
              <p className="mt-1 text-3xl font-bold text-text_primary">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

## Template: Form

```tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export const title = 'Formulář'

export default function SectionForm() {
  return (
    <div className="min-h-screen bg-bg_secondary">
      <div className="bg-bg_primary border-b border-bg_border_element px-8 py-4 flex items-center gap-3">
        <span className="text-text_secondary text-sm">Sekce</span>
        <span className="text-text_secondary mx-1">–</span>
        <h1 className="text-xl font-bold text-text_primary">Formulář</h1>
      </div>
      <div className="px-8 py-6 max-w-xl">
        <div className="rounded-lg border border-bg_border_element bg-bg_primary p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pole">Pole</Label>
            <Input id="pole" placeholder="Zadejte hodnotu…" />
          </div>
          <div className="space-y-1.5">
            <Label>Stav</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Vyberte stav…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="aktivni">Aktivní</SelectItem>
                <SelectItem value="neaktivni">Neaktivní</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button>Uložit</Button>
            <Button variant="outline">Zrušit</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## After creating

1. Tell the user: "Stránka vytvořena. Prohlížeč se automaticky přenačte."
2. Navigation URL: `http://localhost:5200/{section}/{page-slug}`
3. File to edit: `pages/{section}/{page-slug}.tsx`

> No `project.json` to update — the page appears in the sidebar automatically.
> No `npm run dev` restart needed — Vite detects new files and reloads the browser.
