---
name: sync-components
description: Sync components from HardminCloud into this kit. Discovers new components and extracts them.
---

# Sync Components

## Usage with /loop (recommended during active HardminCloud development)

```
/loop 30m /sync-components
```

This re-runs the skill every 30 minutes automatically.

## Steps

1. Check that `.env.local` exists and contains `HARDMIN_PATH`.
   - If missing: tell the user to copy `.env.local.example` → `.env.local` and set the path.

2. Run:
   ```bash
   npm run sync
   ```

3. Read `components-manifest.json` and report:
   - Total synced components
   - Any newly added components (name + destination path)
   - How many are still pending

4. If new components were added: suggest using the `build-page` skill to use them.

## Adding a single component manually

If the user wants to add one specific component without a full sync:
1. Ask for the source file path in HardminCloud (e.g. `resources/js/components/ui/badge.tsx`)
2. Determine destination via `buildDestinationPath()` logic: `/components/ui/` → `components/ui/`, unknown → `components/other/`
3. Copy the file
4. Add entry to `components-manifest.json` with `status: "synced"` and today's date
