import { api, unwrap } from './api'
import type { Notification } from '@/shared/types'

export const notificationsService = {
  async list(params?: { unreadOnly?: boolean; projectId?: string; take?: number; skip?: number }): Promise<Notification[]> {
    const res = await api.get('/notifications', { params })
    return unwrap<Notification[]>(res)
  },
  async unreadCount(): Promise<number> {
    const res = await api.get('/notifications/unread-count')
    return unwrap<{ count: number }>(res).count
  },
  async markRead(id: string): Promise<boolean> {
    const res = await api.post(`/notifications/${id}/read`)
    return unwrap<boolean>(res)
  },
  async markAllRead(): Promise<boolean> {
    const res = await api.post('/notifications/read-all')
    return unwrap<boolean>(res)
  },
}

