import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '@/app/providers/AuthContext'
import { useSocket } from '@/app/providers/SocketContext'
import { messagesService, type ContactDto } from '@/shared/services/messages.service'
import type { Channel, Message, User } from '@/shared/types'
import { Send, Hash, MessageCircle, Circle } from 'lucide-react'

/* ── Root layout ─────────────────────────────────────── */
const Root = styled.div`
  height: calc(100vh - 60px - 56px);
  min-height: 400px;
  display: grid;
  grid-template-columns: 240px 1fr;
  background: rgba(25, 25, 25, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;

  @media (max-width: 768px) { grid-template-columns: 1fr; }
`

/* ── Left sidebar ─────────────────────────────────────── */
const Sidebar = styled.div`
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(18, 18, 18, 0.6);
  backdrop-filter: blur(8px);
`

const SideSection = styled.div`
  padding: 16px 12px 8px;
`

const SideSectionLabel = styled.div`
  padding: 8px 12px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8b90a0;
  line-height: 1.5;
`

const SideList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`

const SideItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  text-align: left;
  background: ${({ $active }) => $active ? 'rgba(143, 216, 255, 0.1)' : 'transparent'};
  color: ${({ $active }) => $active ? '#e2e2e2' : '#8b90a0'};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  font-weight: ${({ $active }) => $active ? 500 : 400};
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  
  svg { 
    width: 16px; 
    height: 16px; 
    flex-shrink: 0;
    color: ${({ $active }) => $active ? '#8fd8ff' : '#8b90a0'};
  }
  
  &:hover {
    background: ${({ $active }) => $active ? 'rgba(143, 216, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
    color: #e2e2e2;
    
    svg {
      color: ${({ $active }) => $active ? '#8fd8ff' : '#e2e2e2'};
    }
  }
  
  ${({ $active }) => $active && `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 16px;
      background: #8fd8ff;
      border-radius: 0 2px 2px 0;
      box-shadow: 0 0 8px rgba(143, 216, 255, 0.4);
    }
  `}
`

const SideItemText = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  line-height: 1.5;
`

const UserAvatar = styled.div<{ $role: string }>`
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 8px;
  font-weight: 600;
  background: ${({ $role }) =>
    $role === 'ADMIN' ? 'linear-gradient(135deg, #8fd8ff, #6366f1)' :
    $role === 'COLABORADOR' ? 'linear-gradient(135deg, #8fd8ff, #3b82f6)' :
    'linear-gradient(135deg, #fbbf24, #f59e0b)'};
  color: #131313;
  border: 2px solid rgba(255, 255, 255, 0.1);
`

const SideItemMain = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const SidePills = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: flex-start;
  min-width: 0;
`

const Pill = styled.span<{ $tone: 'neutral' | 'primary' | 'success' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 8px;
  font-weight: 500;
  border: 1px solid ${({ $tone }) =>
    $tone === 'primary' ? 'rgba(143, 216, 255, 0.2)' :
    $tone === 'success' ? 'rgba(16, 185, 129, 0.2)' :
    $tone === 'danger' ? 'rgba(239, 68, 68, 0.2)' :
    'rgba(255, 255, 255, 0.05)'};
  background: ${({ $tone }) =>
    $tone === 'primary' ? 'rgba(143, 216, 255, 0.1)' :
    $tone === 'success' ? 'rgba(16, 185, 129, 0.1)' :
    $tone === 'danger' ? 'rgba(239, 68, 68, 0.1)' :
    'rgba(255, 255, 255, 0.03)'};
  color: ${({ $tone }) =>
    $tone === 'primary' ? '#8fd8ff' :
    $tone === 'success' ? '#10b981' :
    $tone === 'danger' ? '#ef4444' :
    '#8b90a0'};
`

const Unread = styled.span`
  margin-left: auto;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 9999px;
  background: #ef4444;
  color: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
`

const Filters = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 12px 12px;
  margin-top: 4px;
`

const FilterSelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  background: rgba(35, 35, 35, 0.5);
  backdrop-filter: blur(4px);
  color: #e2e2e2;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  font-weight: 400;
  line-height: 1.5;
  cursor: pointer;
  outline: none;
  transition: all 0.15s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238b90a0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 32px;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    background-color: rgba(35, 35, 35, 0.7);
  }
  
  &:focus {
    border-color: rgba(143, 216, 255, 0.4);
    background-color: rgba(35, 35, 35, 0.7);
    box-shadow: 0 0 0 3px rgba(143, 216, 255, 0.1);
  }
  
  option {
    background: #2a2a2a;
    color: #e2e2e2;
    padding: 8px;
  }
`

/* ── Chat main area ─────────────────────────────────────── */
const ChatMain = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(19, 19, 19, 0.3);
`

const ChatHeader = styled.div`
  height: 56px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(25, 25, 25, 0.4);
  backdrop-filter: blur(8px);
`

const ChatHeaderIcon = styled.div`
  color: #8fd8ff;
  svg { width: 18px; height: 18px; }
`

const ChatHeaderName = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  font-weight: 600;
  color: #e2e2e2;
  line-height: 1.5;
`

const ChatHeaderBadges = styled.div`
  margin-left: auto;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`

/* ── Messages ─────────────────────────────────────── */
const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`

const MsgGroup = styled.div<{ $own: boolean }>`
  display: flex;
  flex-direction: ${({ $own }) => $own ? 'row-reverse' : 'row'};
  align-items: flex-end;
  gap: 10px;
  margin-top: 12px;
`

const MsgAvatar = styled.div<{ $own: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  flex-shrink: 0;
  background: ${({ $own }) => $own ? 'linear-gradient(135deg, #8fd8ff, #6366f1)' : 'linear-gradient(135deg, #8b90a0, #6b7280)'};
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: #131313;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
`

const MsgContent = styled.div<{ $own: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $own }) => $own ? 'flex-end' : 'flex-start'};
  gap: 4px;
  max-width: min(72%, 560px);
`

const MsgSender = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 8px;
  font-weight: 600;
  color: #8b90a0;
  padding: 0 4px;
  display: flex;
  align-items: center;
  gap: 6px;
`

const Bubble = styled.div<{ $own: boolean }>`
  padding: 10px 14px;
  border-radius: ${({ $own }) => $own ? '12px 12px 2px 12px' : '12px 12px 12px 2px'};
  background: ${({ $own }) => $own ? 'rgba(143, 216, 255, 0.2)' : 'rgba(25, 25, 25, 0.6)'};
  color: #e2e2e2;
  border: 1px solid ${({ $own }) => $own ? 'rgba(143, 216, 255, 0.3)' : 'rgba(255, 255, 255, 0.05)'};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  line-height: 1.5;
  word-break: break-word;
  backdrop-filter: blur(8px);
`

const MsgTime = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  color: #8b90a0;
  padding: 0 4px;
  line-height: 1.5;
`

const EmptyMsg = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #8b90a0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  svg { width: 40px; height: 40px; opacity: 0.2; }
`

/* ── Composer ─────────────────────────────────────── */
const Composer = styled.form`
  flex-shrink: 0;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(25, 25, 25, 0.4);
  backdrop-filter: blur(8px);
`

const ComposerInput = styled.input`
  flex: 1;
  padding: 10px 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  color: #e2e2e2;
  background: rgba(35, 35, 35, 0.5);
  backdrop-filter: blur(4px);
  outline: none;
  transition: all 0.15s;
  line-height: 1.5;
  
  &::placeholder { 
    color: #8b90a0; 
  }
  
  &:focus { 
    border-color: rgba(143, 216, 255, 0.4);
    background: rgba(35, 35, 35, 0.7);
    box-shadow: 0 0 0 3px rgba(143, 216, 255, 0.1);
  }
  
  &:disabled { 
    opacity: 0.5; 
    cursor: not-allowed; 
  }
`

const SendBtn = styled.button<{ $active?: boolean }>`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 8px;
  border: none;
  background: ${({ $active }) => $active ? 'linear-gradient(135deg, #8fd8ff, #6366f1)' : 'rgba(35, 35, 35, 0.5)'};
  color: ${({ $active }) => $active ? '#131313' : '#8b90a0'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ $active }) => $active ? 'pointer' : 'default'};
  transition: all 0.15s;
  
  svg { 
    width: 18px; 
    height: 18px; 
  }
  
  &:hover { 
    ${({ $active }) => $active && `
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(143, 216, 255, 0.3);
    `} 
  }
  
  &:active {
    ${({ $active }) => $active && 'transform: translateY(0);'}
  }
`

const Placeholder = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  color: #8b90a0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  svg { width: 48px; height: 48px; opacity: 0.15; }
`

type Target = { kind: 'channel'; channelId: string; title: string } | { kind: 'direct'; userId: string; title: string } | null

type Contact = ContactDto

function roleLabel(role: string) {
  if (role === 'CLIENTE') return 'Cliente'
  if (role === 'COLABORADOR') return 'Colaborador'
  if (role === 'ADMIN') return 'Admin'
  return role
}

function roleTone(role: string): 'neutral' | 'primary' | 'success' | 'danger' {
  if (role === 'CLIENTE') return 'success'
  if (role === 'COLABORADOR') return 'primary'
  if (role === 'ADMIN') return 'danger'
  return 'neutral'
}

export function ChatPage() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const isCliente = user?.role === 'CLIENTE'
  const canUse = !!user
  const loc = useLocation()
  const nav = useNavigate()

  const [channels, setChannels] = useState<Channel[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [target, setTarget] = useState<Target>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const targetRef = useRef<Target>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CLIENTE' | 'COLABORADOR' | 'ADMIN'>('ALL')
  const [projectFilter, setProjectFilter] = useState<'ALL' | string>('ALL')
  const [unreadByUser, setUnreadByUser] = useState<Record<string, number>>({})

  useEffect(() => { targetRef.current = target }, [target])

  useEffect(() => {
    if (!canUse) return
    if (!isCliente) {
      messagesService.channels().then((c) => {
        setChannels(c)
        const g = c.find((x) => x.isGeneral) ?? c[0]
        if (g) setTarget({ kind: 'channel', channelId: g.id, title: g.name })
      })
    } else {
      setChannels([])
    }

    messagesService.contacts()
      .then((list) => {
        const filtered = list.filter((x) => x.user.id !== user!.id)
        setContacts(filtered)
        const sp = new URLSearchParams(loc.search)
        const directUserId = sp.get('u')
        if (directUserId) {
          const c = filtered.find((x) => x.user.id === directUserId)
          if (c) setTarget({ kind: 'direct', userId: c.user.id, title: c.user.name })
          else setTarget({ kind: 'direct', userId: directUserId, title: 'Conversa' })
          return
        }
        if (isCliente && list.length > 0) {
          const first = filtered[0]
          if (first) setTarget({ kind: 'direct', userId: first.user.id, title: first.user.name })
        }
      })
      .catch(() => setContacts([]))
  }, [canUse, isCliente, loc.search]) // eslint-disable-line

  useEffect(() => {
    if (!target) return
    if (target.kind === 'direct') {
      setUnreadByUser((cur) => {
        if (!cur[target.userId]) return cur
        const next = { ...cur }
        delete next[target.userId]
        return next
      })
      const sp = new URLSearchParams(loc.search)
      if (sp.get('u') === target.userId) {
        sp.delete('u')
        const next = sp.toString()
        nav({ pathname: loc.pathname, search: next ? `?${next}` : '' }, { replace: true })
      }
    }
    ;(async () => {
      const list = target.kind === 'channel'
        ? await messagesService.channelMessages(target.channelId)
        : await messagesService.directMessages(target.userId)
      setMessages(list)
    })()
  }, [target]) // eslint-disable-line

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isCliente) return
    if (!socket || !target || target.kind !== 'channel') return
    socket.emit('join_channel', target.channelId)
    return () => { socket.emit('leave_channel', target.channelId) }
  }, [socket, target, isCliente])

  useEffect(() => {
    if (!socket) return
    const onChannel = (msg: Message) => {
      const t = targetRef.current
      if (!t || t.kind !== 'channel' || msg.channelId !== t.channelId) return
      setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg])
    }
    const onDirect = (msg: Message) => {
      const t = targetRef.current
      // ensure new sender shows up in contacts list
      if (msg.sender && msg.senderId !== user?.id) {
        setContacts((prev) => prev.some((c) => c.user.id === msg.sender!.id) ? prev : [{ user: msg.sender as User, projects: [] }, ...prev])
      }
      const otherId = msg.senderId === user?.id ? msg.receiverId : msg.senderId
      if (!otherId) return

      if (!t || t.kind !== 'direct' || t.userId !== otherId) {
        // increment unread for that conversation (only for incoming)
        if (msg.senderId !== user?.id) {
          setUnreadByUser((cur) => ({ ...cur, [otherId]: (cur[otherId] ?? 0) + 1 }))
        }
        return
      }
      setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg])
    }
    socket.on('new_channel_message', onChannel)
    socket.on('new_direct_message', onDirect)
    return () => { socket.off('new_channel_message', onChannel); socket.off('new_direct_message', onDirect) }
  }, [socket])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = text.trim()
    if (!content || !socket || !target) return
    setText('')
    if (target.kind === 'channel') {
      if (isCliente) return
      socket.emit('send_channel_message', { channelId: target.channelId, content })
    } else {
      socket.emit('send_direct_message', { receiverId: target.userId, content })
    }
  }

  if (!canUse) return (
    <Root style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Placeholder><Circle /><span>Você precisa estar logado.</span></Placeholder>
    </Root>
  )

  const allProjects = Array.from(
    new Map(
      contacts.flatMap((c) => c.projects.map((p) => [p.id, p] as const)),
    ).values(),
  )

  const filteredContacts = contacts.filter((c) => {
    if (roleFilter !== 'ALL' && c.user.role !== roleFilter) return false
    if (projectFilter !== 'ALL' && !c.projects.some((p) => p.id === projectFilter)) return false
    return true
  })

  const activeContact = target?.kind === 'direct' ? contacts.find((c) => c.user.id === target.userId) : null

  return (
    <Root>
      {/* Sidebar */}
      <Sidebar>
        {!isCliente && (
          <SideSection>
            <SideSectionLabel>Canais</SideSectionLabel>
            <SideList>
              {channels.map((c) => {
                const active = target?.kind === 'channel' && target.channelId === c.id
                return (
                  <SideItem key={c.id} $active={active} onClick={() => setTarget({ kind: 'channel', channelId: c.id, title: c.name })}>
                    <Hash />
                    <SideItemText>{c.name}</SideItemText>
                  </SideItem>
                )
              })}
            </SideList>
          </SideSection>
        )}

        <SideSection>
          <SideSectionLabel>{isCliente ? 'Contato' : 'Direto'}</SideSectionLabel>
          <Filters>
            <FilterSelect value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)}>
              <option value="ALL">Todos</option>
              <option value="CLIENTE">Clientes</option>
              <option value="COLABORADOR">Colaboradores</option>
              <option value="ADMIN">Admins</option>
            </FilterSelect>
            <FilterSelect value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
              <option value="ALL">Todos os projetos</option>
              {allProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </FilterSelect>
          </Filters>
          <SideList>
            {filteredContacts.map((c) => {
              const u = c.user
              const active = target?.kind === 'direct' && target.userId === u.id
              const firstProject = c.projects[0]
              const unread = unreadByUser[u.id] ?? 0
              return (
                <SideItem key={u.id} $active={active} onClick={() => setTarget({ kind: 'direct', userId: u.id, title: u.name })}>
                  <UserAvatar $role={u.role}>
                    {u.name.charAt(0).toUpperCase()}
                  </UserAvatar>
                  <SideItemMain>
                    <SideItemText>{u.name}</SideItemText>
                    <SidePills>
                      <Pill $tone={roleTone(u.role)}>{roleLabel(u.role)}</Pill>
                      {firstProject && <Pill $tone="neutral">{firstProject.title}</Pill>}
                      {c.projects.length > 1 && <Pill $tone="neutral">+{c.projects.length - 1}</Pill>}
                    </SidePills>
                  </SideItemMain>
                  {unread > 0 && <Unread>{unread > 99 ? '99+' : unread}</Unread>}
                </SideItem>
              )
            })}
          </SideList>
        </SideSection>
      </Sidebar>

      {/* Chat area */}
      <ChatMain>
        {target ? (
          <>
            <ChatHeader>
              <ChatHeaderIcon>{target.kind === 'channel' ? <Hash /> : <MessageCircle />}</ChatHeaderIcon>
              <ChatHeaderName>{target.title}</ChatHeaderName>
              {target.kind === 'direct' && activeContact && (
                <ChatHeaderBadges>
                  <Pill $tone={roleTone(activeContact.user.role)}>{roleLabel(activeContact.user.role)}</Pill>
                  {activeContact.projects.slice(0, 2).map((p) => (
                    <Pill key={p.id} $tone="neutral">{p.title}</Pill>
                  ))}
                  {activeContact.projects.length > 2 && <Pill $tone="neutral">+{activeContact.projects.length - 2}</Pill>}
                </ChatHeaderBadges>
              )}
            </ChatHeader>

            <Messages>
              {messages.length === 0 ? (
                <EmptyMsg>
                  <MessageCircle />
                  <span>Nenhuma mensagem ainda. Diga oi! 👋</span>
                </EmptyMsg>
              ) : (
                messages.map((m) => {
                  const own = m.senderId === user!.id
                  const sender = m.sender?.name ?? (own ? user!.name : 'Usuário')
                  const initials = sender.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                  const senderRole = (m.sender?.role ?? (own ? user!.role : undefined)) as any
                  return (
                    <MsgGroup key={m.id} $own={own}>
                      <MsgAvatar $own={own}>{initials}</MsgAvatar>
                      <MsgContent $own={own}>
                        {!own && (
                          <MsgSender>
                            {sender}
                            {senderRole && <span style={{ marginLeft: 8 }}><Pill $tone={roleTone(senderRole)}>{roleLabel(senderRole)}</Pill></span>}
                          </MsgSender>
                        )}
                        <Bubble $own={own}>{m.content}</Bubble>
                        <MsgTime>
                          {new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </MsgTime>
                      </MsgContent>
                    </MsgGroup>
                  )
                })
              )}
              <div ref={bottomRef} />
            </Messages>

            <Composer onSubmit={send}>
              <ComposerInput
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={socket ? `Mensagem em ${target.kind === 'channel' ? '#' : ''}${target.title}` : 'Conectando…'}
                disabled={!socket}
              />
              <SendBtn type="submit" $active={!!text.trim() && !!socket && !!target}>
                <Send />
              </SendBtn>
            </Composer>
          </>
        ) : (
          <Placeholder>
            <MessageCircle />
            <span>Selecione um canal ou conversa</span>
          </Placeholder>
        )}
      </ChatMain>
    </Root>
  )
}
