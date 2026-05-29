import { api, unwrap } from './api'
import type { User } from '@/shared/types'

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const res = await api.post('/auth/login', { email, password })
    return unwrap<User>(res)
  },
  async me(): Promise<User> {
    const res = await api.get('/auth/me')
    return unwrap<User>(res)
  },
  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },
}

