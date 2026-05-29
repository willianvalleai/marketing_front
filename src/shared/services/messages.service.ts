import { api, unwrap } from './api'
import type { Channel, Message, User } from '@/shared/types'

export type ContactDto = {
  user: User
  projects: Array<{ id: string; title: string }>
}

export const messagesService = {
  async channels(): Promise<Channel[]> {
    const res = await api.get('/messages/channels')
    return unwrap<Channel[]>(res)
  },
  async channelMessages(channelId: string): Promise<Message[]> {
    const res = await api.get(`/messages/channels/${channelId}`)
    return unwrap<Message[]>(res)
  },
  async contacts(): Promise<ContactDto[]> {
    const res = await api.get('/messages/contacts')
    return unwrap<ContactDto[]>(res)
  },
  async directMessages(userId: string): Promise<Message[]> {
    const res = await api.get(`/messages/direct/${userId}`)
    return unwrap<Message[]>(res)
  },
}

