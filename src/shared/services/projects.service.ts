import { api, unwrap } from './api'
import type { Project, ProjectStatus, TaskPriority } from '@/shared/types'

type ProjectPayloadBase = {
  title: string
  description?: string
  clientId: string
  briefing?: string
  objectives?: string[]
  targetAudience?: string
  budget?: number
  projectStatus?: ProjectStatus
}

export const projectsService = {
  async list(): Promise<Project[]> {
    const res = await api.get('/projects')
    return unwrap<Project[]>(res)
  },
  async create(payload: ProjectPayloadBase & {
    tasks?: Array<{
      title: string
      description?: string
      priority?: TaskPriority
      dueDate?: string
      labels?: string[]
      assigneeIds?: string[]
    }>
  }): Promise<Project> {
    const res = await api.post('/projects', payload)
    return unwrap<Project>(res)
  },
  async update(
    id: string,
    payload: Partial<ProjectPayloadBase>,
  ): Promise<Project> {
    const res = await api.put(`/projects/${id}`, payload)
    return unwrap<Project>(res)
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/projects/${id}`)
  },
}

