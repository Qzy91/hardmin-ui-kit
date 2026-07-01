import { useParams } from 'react-router-dom'
import type { Project } from '../types'

const projectModules = import.meta.glob('/projects/*/project.json', { eager: true })
const pageModules = import.meta.glob('/projects/*/pages/*.tsx', { eager: true })

export function ProjectPage() {
  const { slug, page } = useParams<{ slug: string; page?: string }>()

  const project = Object.entries(projectModules)
    .find(([path]) => path.includes(`/projects/${slug}/`))
    ?.[1] as Project | undefined

  if (page) {
    const pageKey = Object.keys(pageModules).find(p => p.includes(`/projects/${slug}/pages/${page}.tsx`))
    const PageComponent = pageKey ? (pageModules[pageKey] as { default: React.ComponentType }).default : null

    return (
      <div className="min-h-screen bg-bg_primary">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-3">
          <a href={`#/projects/${slug}`} className="text-sm text-gray-500 hover:text-gray-900">← {project?.name ?? slug}</a>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-900">{page}</span>
        </header>
        <main>{PageComponent ? <PageComponent /> : <p className="p-8 text-gray-400">Page not found.</p>}</main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg_primary">
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center gap-4">
        <a href="#/" className="text-sm text-gray-500 hover:text-gray-900">← Back</a>
        <h1 className="text-2xl font-bold text-gray-900">{project?.name ?? slug}</h1>
      </header>
      <main className="px-8 py-8">
        {project && project.pages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.pages.map(p => (
              <a
                key={p}
                href={`#/projects/${slug}/pages/${p}`}
                className="block p-5 bg-white rounded-lg border border-gray-200 hover:border-main_color hover:shadow-sm transition-all"
              >
                <span className="font-medium text-gray-900">{p}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">
            Use the <code className="bg-gray-100 px-1 rounded">build-page</code> skill to add pages.
          </p>
        )}
      </main>
    </div>
  )
}
