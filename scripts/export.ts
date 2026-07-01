import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

const args = process.argv.slice(2)
const projectArg = args.find(a => a.startsWith('--project='))

if (!projectArg) {
  console.error('Usage: npm run export -- --project={slug}')
  process.exit(1)
}

const slug = projectArg.replace('--project=', '')
const projectJsonPath = path.resolve(`projects/${slug}/project.json`)

if (!fs.existsSync(projectJsonPath)) {
  console.error(`Project not found: projects/${slug}/project.json`)
  console.error('Use the create-project skill to create it first.')
  process.exit(1)
}

const project = JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8'))
console.log(`Exporting: ${project.name} (${slug})`)

const outDir = path.resolve(`projects/${slug}/dist`)

execSync(`npx vite build --base=./ --outDir "${outDir}" --emptyOutDir`, {
  stdio: 'inherit',
  env: { ...process.env, VITE_EXPORT_PROJECT: slug },
})

console.log(`\nDone. Open: projects/${slug}/dist/index.html`)
