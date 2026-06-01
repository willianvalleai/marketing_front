import { api, unwrap } from './api'
import type { ChecklistItem, Task, TaskComment, TaskDetails, TaskPriority, TaskStatus, TaskAssignee } from '@/shared/types'

export const tasksService = {
  async listByProject(projectId: string): Promise<Task[]> {
    const res = await api.get(`/tasks/project/${projectId}`)
    return unwrap<Task[]>(res)
  },
  async listMine(): Promise<Task[]> {
    const res = await api.get('/tasks/my')
    return unwrap<Task[]>(res)
  },
  async get(id: string): Promise<TaskDetails> {
    const res = await api.get(`/tasks/${encodeURIComponent(id)}`)
    return unwrap<TaskDetails>(res)
  },
  async create(payload: {
    title: string
    description?: string
    projectId: string
    priority: TaskPriority
    status?: TaskStatus
    assignedToId?: string | null
    assigneeIds?: string[]
    dueDate?: string
    labels?: string[]
    subtaskParentId?: string

  }): Promise<Task> {
    const res = await api.post('/tasks', payload)
    return unwrap<Task>(res)
  },
  async update(id: string, payload: Partial<Task> & { assigneeIds?: string[] }): Promise<Task> {
    const res = await api.put(`/tasks/${encodeURIComponent(id)}`, payload)
    return unwrap<Task>(res)
  },
  async addComment(taskId: string, content: string, visibility: 'INTERNAL' | 'CLIENT_VISIBLE' = 'INTERNAL'): Promise<TaskComment> {
    const res = await api.post(`/tasks/${encodeURIComponent(taskId)}/comments`, { content, visibility })
    return unwrap<TaskComment>(res)
  },
  async addChecklistItem(taskId: string, text: string): Promise<ChecklistItem> {
    const res = await api.post(`/tasks/${encodeURIComponent(taskId)}/checklist`, { text })
    return unwrap<ChecklistItem>(res)
  },
  async updateChecklistItem(taskId: string, itemId: string, payload: { done?: boolean; text?: string }): Promise<ChecklistItem> {
    const res = await api.put(`/tasks/${encodeURIComponent(taskId)}/checklist/${encodeURIComponent(itemId)}`, payload)
    return unwrap<ChecklistItem>(res)
  },
  async removeChecklistItem(taskId: string, itemId: string): Promise<void> {
    await api.delete(`/tasks/${encodeURIComponent(taskId)}/checklist/${encodeURIComponent(itemId)}`)
  },
  async setAssigneeDone(taskId: string, userId: string, done?: boolean): Promise<TaskAssignee> {
    const res = await api.put(`/tasks/${encodeURIComponent(taskId)}/assignees/${encodeURIComponent(userId)}`, typeof done === 'boolean' ? { done } : {})
    return unwrap<TaskAssignee>(res)
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/tasks/${encodeURIComponent(id)}`)
  },

  // Fluxo de aprovação
  async submitForInternalReview(taskId: string): Promise<boolean> {
    const res = await api.post(`/tasks/${encodeURIComponent(taskId)}/submit-for-review`)
    return unwrap<boolean>(res)
  },
  async approveInternal(taskId: string, message?: string): Promise<boolean> {
    const res = await api.post(`/tasks/${encodeURIComponent(taskId)}/approve-internal`, { message })
    return unwrap<boolean>(res)
  },
  async rejectInternal(taskId: string, message: string): Promise<boolean> {
    const res = await api.post(`/tasks/${encodeURIComponent(taskId)}/reject-internal`, { message })
    return unwrap<boolean>(res)
  },
  async approveClient(taskId: string): Promise<boolean> {
    const res = await api.post(`/tasks/${encodeURIComponent(taskId)}/approve-client`)
    return unwrap<boolean>(res)
  },
  async requestChangesClient(taskId: string, message: string): Promise<boolean> {
    const res = await api.post(`/tasks/${encodeURIComponent(taskId)}/request-changes-client`, { message })
    return unwrap<boolean>(res)
  },
}

