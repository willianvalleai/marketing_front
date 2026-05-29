import { api, unwrap } from './api'
import type { Project, TaskDetails, TaskStatus, TaskPriority, TaskType } from '@/shared/types'

export type ClientDashboard = {
  projectsCount: number
  tasksByStatus: Record<TaskStatus, number>
  awaitingApproval: Array<{
    id: string
    title: string
    priority: TaskPriority
    dueDate: string | null
    projectId: string
    projectTitle: string
  }>
  upcoming: Array<{
    id: string
    title: string
    priority: TaskPriority
    status: TaskStatus
    dueDate: string | null
    projectId: string
    projectTitle: string
  }>
  recentUpdates: Array<{
    id: string
    title: string
    status: TaskStatus
    priority: TaskPriority
    type: TaskType
    updatedAt: string
    projectId: string
    projectTitle: string
  }>
}

export type ClientCalendarItem = {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  type: TaskType
  dueDate: string
  projectId: string
  project: { id: string; title: string }
}

export const clientService = {
  async dashboard(): Promise<ClientDashboard> {
    const res = await api.get('/client/dashboard')
    return unwrap<ClientDashboard>(res)
  },
  async projects(): Promise<Project[]> {
    const res = await api.get('/client/projects')
    return unwrap<Project[]>(res)
  },
  async project(projectId: string): Promise<Project> {
    const res = await api.get(`/client/projects/${projectId}`)
    return unwrap<Project>(res)
  },
  async calendar(): Promise<ClientCalendarItem[]> {
    const res = await api.get('/client/calendar')
    return unwrap<ClientCalendarItem[]>(res)
  },
  async task(taskId: string): Promise<TaskDetails> {
    const res = await api.get(`/client/tasks/${taskId}`)
    return unwrap<TaskDetails>(res)
  },
  async addComment(taskId: string, content: string) {
    const res = await api.post(`/client/tasks/${taskId}/comments`, { content })
    return unwrap(res)
  },
  async approveTask(taskId: string): Promise<boolean> {
    const res = await api.post(`/client/tasks/${taskId}/approve`)
    return unwrap<boolean>(res)
  },
  async requestChanges(taskId: string, message: string): Promise<boolean> {
    const res = await api.post(`/client/tasks/${taskId}/request-changes`, { message })
    return unwrap<boolean>(res)
  },
}

