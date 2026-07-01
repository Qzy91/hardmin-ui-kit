import type { Project } from '../types'

interface Props {
  project: Project
}

export function ProjectCard({ project }: Props) {
  const pageLabel = project.pages.length === 1 ? '1 page' : `${project.pages.length} pages`

  return (
    <a
      href={`#/projects/${project.slug}`}
      className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-main_color hover:shadow-sm transition-all"
    >
      <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
      <p className="mt-1 text-sm text-gray-500">{project.description}</p>
      <p className="mt-3 text-xs text-gray-400">{pageLabel}</p>
    </a>
  )
}
