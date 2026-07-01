# Hardmin UI Kit

## What is this?

A standalone React app for prototyping UI pages using HardminCloud's design system.
No Docker, no PHP, no backend — just Node.js and a browser.

## Setup

```bash
npm install
npm run dev    # http://localhost:5200
```

`.env.local` is only needed if you use `npm run sync` (component sync from HardminCloud).
Copy `.env.local.example` → `.env.local` and set `HARDMIN_PATH` for that.

## Common commands

```bash
npm run dev       # start dev server at http://localhost:5200
npm run types     # TypeScript check (npx tsc --noEmit)
npm run build     # production build → dist/
npm run sync      # sync components from HardminCloud (requires .env.local)
```

> `npm run export` is currently broken — it was written for the old project structure.
> Use `npm run build` to get a deployable `dist/` instead.

## How to work with Claude

Just describe what you want in plain language. Claude will pick the right skill automatically.

> **Skip brainstorming.** For page and section creation tasks, go directly to implementation — do not run brainstorming or planning skills first. Ask the required questions from the skill, then build.

**Examples:**

| You say | Claude does |
|---|---|
| "Vytvoř novou sekci Uživatelé" | `create-project` skill |
| "Přidej stránku Graf spotřeby do sekce ems" | `build-page` skill |
| "Zkopíruj nové komponenty z HardminCloudu" | `sync-components` skill |

> **Always attach a screenshot** when asking to build a page — it helps Claude match the real HC look.

Slash commands (`/build-page`) work only in **Claude Code CLI** (`claude` in terminal).
In **VS Code chat** just describe the task in plain text.

## Project structure

```
pages/
  {section}/
    _section.ts      ← sidebar metadata: title, icon, group
    index.tsx        ← first page (sorted to top in sidebar)
    list.tsx         ← visible page (appears in sidebar)
    detail.tsx       ← hidden page: export const hidden = true
    _data.ts         ← shared mock data (not a page, underscore prefix)

components/
  ui/                ← shadcn components synced from HC (do not edit)
  table/             ← UnifiedTable, RowActionsMenu (canonical, not synced)
  energy-management/ ← EmsTable, EmsTableRow (canonical, not synced)
  other/             ← common HC components synced from HC (do not edit)

components-manifest.json  ← tracks what was synced and when
```

## Sidebar groups

`_section.ts` controls where a section appears in the sidebar:

```ts
export const group = 'MODULY'        // groups: MODULY, ADMINISTRACE, or any string
export const group = 'ADMINISTRACE'
// omit group entirely → section appears without a header
```

## Page patterns

### Visible page (appears in sidebar)
```tsx
export const title = 'Seznam'
export const icon = ListIcon
export default function PageName() { ... }
```

### Hidden page (routable but not in sidebar — for detail/edit)
```tsx
export const hidden = true

// read record by query param:
const [params] = useSearchParams()
const id = params.get('id')
const item = DATA.find(d => String(d.id) === id)
```

### Navigate to detail from list
```tsx
<UnifiedTable onRowClick={(row) => navigate(`/section/detail?id=${row.id}`)} />
```

### Shared mock data
Put in `_data.ts` (underscore → not treated as a page):
```ts
export interface Item { id: number; ... }
export const DATA: Item[] = [...]
```

## Component rule — no native HTML equivalents

**Never use native HTML when a component exists.** Always check `components/ui/` first.

| ❌ Native | ✅ Use instead | Import |
|---|---|---|
| `<input>` | `Input` | `@/components/ui/input` |
| `<textarea>` | `Textarea` | `@/components/ui/textarea` |
| `<select>` | `Select` + `SelectTrigger` + `SelectContent` + `SelectItem` | `@/components/ui/select` |
| `<button>` | `Button` | `@/components/ui/button` |
| `<label>` | `Label` | `@/components/ui/label` |
| `<table>` | `UnifiedTable` | `@/components/table` |
| `<dialog>` | `Dialog` + `DialogContent` | `@/components/ui/dialog` |
| Tab buttons | `Tabs` + `TabsList` + `TabsTrigger` | `@/components/ui/tabs` |
| `<input type="date">` | `DatePicker` | `@/components/other/date-picker` |

Exception: page header bar and static read-only field layouts — plain `<div>` is fine there.

Full examples are in `.claude/skills/build-page.md`.

## Import alias

Always use `@/components` — works from any file depth:
```tsx
import { Button } from '@/components/ui/button'
import { UnifiedTable } from '@/components/table'
import { Input } from '@/components/ui/input'
```
Never use relative paths like `../../components/`.

## Badge variants

Only these variants exist — never invent custom ones:

| Variant | When to use |
|---|---|
| `success` | active, paid, done |
| `warning` | pending, waiting |
| `destructive` | deleted, error, overdue |
| `outline` | neutral, inactive |
| `secondary` | secondary info |
| `default` | fallback |

## Design tokens

Match HardminCloud exactly — never hardcode colors:

| Token | Meaning |
|---|---|
| `bg-bg_primary` | white card / panel background |
| `bg-bg_secondary` | page background (light gray) |
| `border-bg_border_element` | border color |
| `text-text_primary` | main text |
| `text-text_secondary` | muted / label text |
| `bg-main_color` / `text-main_color` | brand gold color |

## Page header pattern

Every page must start with this structure:
```tsx
<div className="min-h-screen bg-bg_secondary">
  <div className="bg-bg_primary border-b border-bg_border_element px-8 py-4 flex items-center gap-3">
    <SomeIcon className="h-5 w-5 text-text_secondary" />
    <span className="text-text_secondary text-sm">Section name</span>
    <span className="text-text_secondary mx-1">–</span>
    <h1 className="text-xl font-bold text-text_primary">Page name</h1>
  </div>
  <div className="px-8 py-6">
    {/* content */}
  </div>
</div>
```
