import { ProjectCard } from '../components/ProjectCard'
import type { Project } from '../types'

const projectModules = import.meta.glob('/projects/*/project.json', { eager: true })
const projects = Object.values(projectModules) as Project[]

export function HomePage() {
  return (
    <div className="min-h-screen bg-bg_primary">
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-900">Hardmin UI Kit</h1>
        <p className="text-sm text-gray-500 mt-1">Your projects</p>
      </header>

      <main className="px-8 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">No projects yet.</p>
            <p className="text-sm mt-2">
              Use the <code className="bg-gray-100 px-1 rounded">create-project</code> skill in Claude Code to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
