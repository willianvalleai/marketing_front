import { api, unwrap } from './api'
import type { Sector } from '@/shared/types'

export const sectorsService = {
  async list(): Promise<Sector[]> {
    const res = await api.get('/sectors')
    return unwrap<Sector[]>(res)
  },

  async create(name: string): Promise<Sector> {
    const res = await api.post('/sectors', { name })
    return unwrap<Sector>(res)
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/sectors/${id}`)
  },
}
