import { api, unwrap } from './api'
import type { Role, User } from '@/shared/types'

export const usersService = {
  async list(): Promise<User[]> {
    const res = await api.get('/users')
    return unwrap<User[]>(res)
  },

  async create(payload: {
    name: string
    email: string
    password: string
    role: Exclude<Role, 'ADMIN'>
    phone?: string
    company?: string
    notes?: string
    isActive?: boolean
    sectorIds?: string[]
  }): Promise<User> {
    const res = await api.post('/users', payload)
    return unwrap<User>(res)
  },

  async update(
    id: string,
    payload: Partial<Pick<User, 'name' | 'email' | 'role' | 'phone' | 'company' | 'notes' | 'isActive'>> & {
      sectorIds?: string[]
    },
  ): Promise<User> {
    const res = await api.put(`/users/${id}`, payload)
    return unwrap<User>(res)
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`)
  },
}
