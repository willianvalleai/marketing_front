import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '@/app/providers/AuthContext'
import { useSocket } from '@/app/providers/SocketContext'
import { messagesService, type ContactDto } from '@/shared/services/messages.service'
import type { Channel, Message, User } from '@/shared/types'
import { Send, Hash, MessageCircle, Circle } from 'lucide-react'
import { Select } from '@/shared/components/ui/Select'

/* ── Root layout ─────────────────────────────────────── */
const Root = styled.div`
  height: calc(100vh - 60px - 56px);
  min-height: 400px;
  display: grid;
  grid-template-columns: 220px 1fr;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  overflow: hidden;

  @media (max-width: 768px) { grid-template-columns: 1fr; }
`

/* ── Left sidebar ─────────────────────────────────────── */
const Sidebar = styled.div`
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bg};
`

const SideSection = styled.div`
  padding: 10px 8px 4px;
`

const SideSectionLabel = styled.div`
  padding: 6px 8px;
  font-size: 10.5px;
  font-weight: ${({ theme }) => theme.weights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textMuted};
`

const SideList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow-y: auto;
`

const SideItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: none;
  text-align: left;
  background: ${({ $active, theme }) => $active ? theme.colors.primaryMid : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.textLight};
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ $active, theme }) => $active ? theme.weights.semibold : theme.weights.normal};
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  svg { width: 14px; height: 14px; flex-shrink: 0; }
  &:hover:not([data-active='true']) { background: ${({ theme }) => theme.colors.border}; color: ${({ theme }) => theme.colors.textDark}; }
`

const SideItemText = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-start;
  min-width: 0;
`

const Pill = styled.span<{ $tone: 'neutral' | 'primary' | 'success' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 10.5px;
  font-weight: ${({ theme }) => theme.weights.semibold};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $tone, theme }) =>
    $tone === 'primary' ? theme.colors.primaryMid :
    $tone === 'success' ? theme.colors.successMid :
    $tone === 'danger' ? theme.colors.dangerMid :
    theme.colors.bg};
  color: ${({ $tone, theme }) =>
    $tone === 'primary' ? theme.colors.primary :
    $tone === 'success' ? theme.colors.success :
    $tone === 'danger' ? theme.colors.danger :
    theme.colors.textMuted};
`

const Unread = styled.span`
  margin-left: auto;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  font-size: 11px;
  font-weight: ${({ theme }) => theme.weights.bold};
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const Filters = styled.div`
  display: grid;
  gap: 6px;
  padding: 0 8px 10px;
`

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`

/* ── Chat main area ─────────────────────────────────────── */
const ChatMain = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const ChatHeader = styled.div`
  height: 50px;
  flex-shrink: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const ChatHeaderIcon = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  svg { width: 16px; height: 16px; }
`

const ChatHeaderName = styled.div`
  font-size: ${({ theme }) => theme.font.md};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
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
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const MsgGroup = styled.div<{ $own: boolean }>`
  display: flex;
  flex-direction: ${({ $own }) => $own ? 'row-reverse' : 'row'};
  align-items: flex-end;
  gap: 8px;
  margin-top: 8px;
`

const MsgAvatar = styled.div<{ $own: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $own, theme }) => $own ? theme.colors.primaryMid : theme.colors.bg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ $own, theme }) => $own ? theme.colors.primary : theme.colors.textLight};
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`

const MsgContent = styled.div<{ $own: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $own }) => $own ? 'flex-end' : 'flex-start'};
  gap: 2px;
  max-width: min(72%, 560px);
`

const MsgSender = styled.div`
  font-size: ${({ theme }) => theme.font.xs};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 0 4px;
`

const Bubble = styled.div<{ $own: boolean }>`
  padding: 8px 13px;
  border-radius: ${({ $own }) => $own ? '14px 14px 2px 14px' : '14px 14px 14px 2px'};
  background: ${({ $own, theme }) => $own ? theme.colors.primary : theme.colors.bg};
  color: ${({ $own, theme }) => $own ? 'white' : theme.colors.textDark};
  border: 1px solid ${({ $own, theme }) => $own ? 'transparent' : theme.colors.border};
  font-size: ${({ theme }) => theme.font.sm};
  line-height: 1.5;
  word-break: break-word;
`

const MsgTime = styled.div`
  font-size: 10.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 0 4px;
`

const EmptyMsg = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.font.sm};
  svg { width: 36px; height: 36px; opacity: 0.25; }
`

/* ── Composer ─────────────────────────────────────── */
const Composer = styled.form`
  flex-shrink: 0;
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: 8px;
`

const ComposerInput = styled.input`
  flex: 1;
  padding: 9px 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textDark};
  background: ${({ theme }) => theme.colors.bg};
  outline: none;
  transition: border-color 0.15s;
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; background: white; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const SendBtn = styled.button<{ $active?: boolean }>`
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 50%;
  border: none;
  background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border};
  color: ${({ $active }) => $active ? 'white' : '#9ca3af'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ $active }) => $active ? 'pointer' : 'default'};
  transition: background 0.15s, transform 0.1s;
  svg { width: 17px; height: 17px; }
  &:hover { ${({ $active }) => $active && 'transform: scale(1.05);'} }
`

const Placeholder = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.font.sm};
  svg { width: 40px; height: 40px; opacity: 0.2; }
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
            <FilterRow>
              <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)}>
                <option value="ALL">Todos</option>
                <option value="CLIENTE">Clientes</option>
                <option value="COLABORADOR">Colabs</option>
                <option value="ADMIN">Admins</option>
              </Select>
              <Select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                <option value="ALL">Todos projetos</option>
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </Select>
            </FilterRow>
          </Filters>
          <SideList>
            {filteredContacts.map((c) => {
              const u = c.user
              const active = target?.kind === 'direct' && target.userId === u.id
              const firstProject = c.projects[0]
              const unread = unreadByUser[u.id] ?? 0
              return (
                <SideItem key={u.id} $active={active} onClick={() => setTarget({ kind: 'direct', userId: u.id, title: u.name })}>
                  <MessageCircle />
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
