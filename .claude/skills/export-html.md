---
name: export-html
description: Export a specific page to a standalone HTML file that works without a server
---

# Export HTML

Ask the user: **which page to export?**
- List available pages: read `pages/` and show as `{section}/{page}` (e.g. `ems/index`, `service-module/devices`)

Then run:

```bash
npm run export -- --section={section} --page={page}
```

> ⚠️ The export script (`scripts/export.ts`) was written for the old `projects/` structure.
> If it fails, tell the user: "The export script needs to be updated for the new `pages/` structure. Until then, use `npm run build` to build the full app, or share the dev server URL."

## Alternative: full build

```bash
npm run build
```

Output goes to `dist/`. Can be deployed to any static host (GitHub Pages, Netlify, etc.).

## Sharing without export

While the export script is being updated, the easiest way to share a prototype:
1. Run `npm run dev` (or keep it running)
2. Share the URL `http://localhost:5200` — works within the same local network if `--host` flag is added
3. Or use `npm run build` and deploy `dist/`
