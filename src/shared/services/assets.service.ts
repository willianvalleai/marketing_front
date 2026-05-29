import { api, unwrap } from './api'
import type { Asset } from '@/shared/types'

export const assetsService = {
  async list(params: { projectId?: string; taskId?: string; take?: number; skip?: number }): Promise<Asset[]> {
    const res = await api.get('/assets', { params })
    return unwrap<Asset[]>(res)
  },
  async createLink(payload: { name: string; url: string; projectId?: string; taskId?: string }): Promise<Asset> {
    const res = await api.post('/assets', payload)
    return unwrap<Asset>(res)
  },
  async update(id: string, payload: { name?: string; url?: string }): Promise<Asset> {
    const res = await api.put(`/assets/${id}`, payload)
    return unwrap<Asset>(res)
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/assets/${id}`)
  },
}

