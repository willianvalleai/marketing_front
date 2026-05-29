import { api, unwrap } from './api'
import type { Milestone, MilestoneStatus } from '@/shared/types'

export const milestonesService = {
  async listByProject(projectId: string): Promise<Milestone[]> {
    const res = await api.get(`/milestones/project/${projectId}`)
    return unwrap<Milestone[]>(res)
  },

  async get(id: string): Promise<Milestone> {
    const res = await api.get(`/milestones/${id}`)
    return unwrap<Milestone>(res)
  },

  async create(data: {
    projectId: string
    title: string
    description?: string
    dueDate?: string
    status?: MilestoneStatus
    order?: number
  }): Promise<Milestone> {
    const res = await api.post('/milestones', data)
    return unwrap<Milestone>(res)
  },

  async update(
    id: string,
    data: {
      title?: string
      description?: string | null
      dueDate?: string | null
      status?: MilestoneStatus
      order?: number
    }
  ): Promise<Milestone> {
    const res = await api.put(`/milestones/${id}`, data)
    return unwrap<Milestone>(res)
  },

  async reorder(milestones: Array<{ id: string; order: number }>): Promise<void> {
    const res = await api.post('/milestones/reorder', { milestones })
    unwrap(res)
  },

  async remove(id: string): Promise<void> {
    const res = await api.delete(`/milestones/${id}`)
    unwrap(res)
  },
}
