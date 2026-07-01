import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'
import type { ComponentManifest } from '../src/types'

export type ComponentBucket = 'ui' | 'charts' | 'forms' | 'layout' | 'other'

export function categorizeComponents(files: string[]): Record<ComponentBucket, string[]> {
  const result: Record<ComponentBucket, string[]> = {
    ui: [],
    charts: [],
    forms: [],
    layout: [],
    other: [],
  }
  for (const file of files) {
    if (file.includes('/components/ui/')) result.ui.push(file)
    else if (file.includes('/components/charts/')) result.charts.push(file)
    else if (file.includes('/components/forms/')) result.forms.push(file)
    else if (file.includes('/components/layout/')) result.layout.push(file)
    else result.other.push(file)
  }
  return result
}

export function buildDestinationPath(sourcePath: string): string {
  const rules: Array<[string, ComponentBucket]> = [
    ['/components/ui/', 'ui'],
    ['/components/charts/', 'charts'],
    ['/components/forms/', 'forms'],
    ['/components/layout/', 'layout'],
  ]
  const filename = path.basename(sourcePath)
  for (const [pattern, bucket] of rules) {
    if (sourcePath.includes(pattern)) return `components/${bucket}/${filename}`
  }
  return `components/other/${filename}`
}

function toPascalCase(filename: string): string {
  return filename
    .replace(/\.tsx?$/, '')
    .split(/[-_]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
}

async function main() {
  const hardminPath = process.env.HARDMIN_PATH
  if (!hardminPath) {
    console.error('HARDMIN_PATH is not set. Copy .env.local.example → .env.local and fill it in.')
    process.exit(1)
  }

  const manifestPath = path.resolve('components-manifest.json')
  const manifest: ComponentManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))

  const pattern = path.join(hardminPath, 'resources/js/components/**/*.tsx')
  const absoluteFiles = await glob(pattern)
  const relativeFiles = absoluteFiles.map(f => f.slice(hardminPath.length + 1))

  let newCount = 0
  for (const relFile of relativeFiles) {
    const name = toPascalCase(path.basename(relFile))
    if (!manifest.components[name]) {
      manifest.components[name] = {
        source: relFile,
        status: 'pending',
        extractedAt: null,
        destination: buildDestinationPath(relFile),
      }
      newCount++
    }
  }

  if (newCount === 0) {
    console.log('Manifest up to date — no new components found.')
    return
  }

  console.log(`Discovered ${newCount} new component(s). Copying...`)

  const today = new Date().toISOString().split('T')[0]
  for (const [name, entry] of Object.entries(manifest.components)) {
    if (entry.status !== 'pending') continue
    const src = path.join(hardminPath, entry.source)
    const dest = path.resolve(entry.destination)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(src, dest)
    manifest.components[name] = { ...entry, status: 'synced', extractedAt: today }
    console.log(`  ✓ ${name}  →  ${entry.destination}`)
  }

  manifest.lastSync = today
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  console.log('\nManifest updated.')
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  main()
}
