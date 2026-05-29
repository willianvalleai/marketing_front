import { api, unwrap } from './api'
import type { TimeLog } from '../types'

export const timeLogsService = {
  async create(data: {
    taskId: string
    hours: number
    description?: string
    date: string
  }): Promise<TimeLog> {
    const res = await api.post('/time-logs', {
      taskId: data.taskId,
      hours: data.hours,
      description: data.description,
      logDate: data.date,
    })
    return unwrap<TimeLog>(res)
  },

  async listByTask(taskId: string): Promise<TimeLog[]> {
    const res = await api.get(`/time-logs/task/${taskId}`)
    return unwrap<TimeLog[]>(res)
  },

  async update(id: string, data: { hours?: number; description?: string | null; logDate?: string }): Promise<TimeLog> {
    const res = await api.put(`/time-logs/${id}`, data)
    return unwrap<TimeLog>(res)
  },

  async remove(id: string): Promise<void> {
    const res = await api.delete(`/time-logs/${id}`)
    return unwrap<void>(res)
  },
}
