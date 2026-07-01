import { render, screen } from '@testing-library/react'
import { ProjectCard } from './ProjectCard'
import type { Project } from '../types'

const project: Project = {
  slug: 'my-project',
  name: 'My Project',
  description: 'A test project',
  createdAt: '2026-06-26',
  pages: ['dashboard', 'users'],
}

it('renders project name', () => {
  render(<ProjectCard project={project} />)
  expect(screen.getByText('My Project')).toBeInTheDocument()
})

it('renders page count', () => {
  render(<ProjectCard project={project} />)
  expect(screen.getByText('2 pages')).toBeInTheDocument()
})

it('renders description', () => {
  render(<ProjectCard project={project} />)
  expect(screen.getByText('A test project')).toBeInTheDocument()
})

it('links to the project page', () => {
  render(<ProjectCard project={project} />)
  expect(screen.getByRole('link')).toHaveAttribute('href', '#/projects/my-project')
})
