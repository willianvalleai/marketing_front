import { api, unwrap } from './api'
import type { Project, TaskPriority } from '@/shared/types'

export const projectsService = {
  async list(): Promise<Project[]> {
    const res = await api.get('/projects')
    return unwrap<Project[]>(res)
  },
  async create(payload: {
    title: string
    description?: string
    clientId: string
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
    payload: Partial<Pick<Project, 'title' | 'description' | 'clientId'>>,
  ): Promise<Project> {
    const res = await api.put(`/projects/${id}`, payload)
    return unwrap<Project>(res)
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/projects/${id}`)
  },
}

