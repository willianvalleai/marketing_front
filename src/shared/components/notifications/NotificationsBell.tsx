import { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { Bell, CheckCheck, CircleDashed, X, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthContext'
import { useSocket } from '@/app/providers/SocketContext'
import { notificationsService } from '@/shared/services/notifications.service'
import type { Notification } from '@/shared/types'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'

const shake = `
  @keyframes bell-shake {
    0% { transform: rotate(0deg); }
    15% { transform: rotate(10deg); }
    30% { transform: rotate(-12deg); }
    45% { transform: rotate(8deg); }
    60% { transform: rotate(-6deg); }
    75% { transform: rotate(4deg); }
    100% { transform: rotate(0deg); }
  }
  @keyframes pulse-ring {
    0% { transform: scale(1); opacity: 0.85; }
    100% { transform: scale(1.55); opacity: 0; }
  }
  @keyframes blink-dot {
    0% { opacity: 1; }
    45% { opacity: 1; }
    60% { opacity: 0.35; }
    100% { opacity: 1; }
  }
  @keyframes bell-glow {
    0% { box-shadow: 0 0 0 rgba(124, 58, 237, 0); }
    55% { box-shadow: 0 0 0 rgba(124, 58, 237, 0); }
    70% { box-shadow: 0 0 0 6px rgba(124, 58, 237, 0.10); }
    100% { box-shadow: 0 0 0 rgba(124, 58, 237, 0); }
  }
  @keyframes toast-in {
    0% { transform: translateY(-10px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
`

const IconBtn = styled.button<{ $hasUnread: boolean }>`
  ${shake}
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textLight};
  transition: background 0.12s, color 0.12s;
  position: relative;
  svg { width: 18px; height: 18px; }
  ${({ $hasUnread, theme }) =>
    $hasUnread
      ? `
        animation: bell-glow 1.6s ease-in-out infinite;
        background: ${theme.colors.primaryFaint};
        color: ${theme.colors.textDark};
      `
      : ''}
  &:hover { background: ${({ theme }) => theme.colors.bg}; color: ${({ theme }) => theme.colors.textDark}; }
`

const DotRing = styled.span`
  ${shake}
  position: absolute;
  top: 6px;
  right: 6px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.danger};
  border: 2px solid ${({ theme }) => theme.colors.surface};
  box-shadow: 0 6px 18px rgba(239, 68, 68, 0.35);
  animation: blink-dot 0.95s ease-in-out infinite;
  &::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 2px solid ${({ theme }) => theme.colors.dangerMid};
    animation: pulse-ring 1.15s ease-out infinite;
  }
`

const CountBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  border: 2px solid ${({ theme }) => theme.colors.surface};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.weights.bold};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 28px rgba(239, 68, 68, 0.28);
`

const BellWrap = styled.div<{ $ring: boolean }>`
  ${shake}
  display: grid;
  place-items: center;
  transform-origin: 50% 20%;
  ${({ $ring }) => ($ring ? 'animation: bell-shake 0.65s ease-in-out;' : '')}
`

const ToastStack = styled.div`
  ${shake}
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(360px, calc(100vw - 32px));
`

const Toast = styled.div`
  animation: toast-in 0.18s ease-out;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadow.lg};
  overflow: hidden;
`

const ToastHead = styled.div`
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const ToastTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
  svg { width: 16px; height: 16px; color: ${({ theme }) => theme.colors.primary}; flex-shrink: 0; }
  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

const ToastClose = styled.button`
  width: 28px;
  height: 28px;
  border: none;
  background: ${({ theme }) => theme.colors.bg};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { color: ${({ theme }) => theme.colors.textDark}; }
  svg { width: 16px; height: 16px; }
`

const ToastBody = styled.button`
  width: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 10px 12px 12px;
  text-align: left;
`

const ToastText = styled.div`
  font-size: ${({ theme }) => theme.font.xs};
  color: ${({ theme }) => theme.colors.textLight};
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Item = styled.button<{ $unread: boolean }>`
  width: 100%;
  text-align: left;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $unread, theme }) => ($unread ? theme.colors.primaryFaint : theme.colors.surface)};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 12px 12px;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryMid};
    background: ${({ theme }) => theme.colors.primaryFaint};
  }
`

const ItemTitle = styled.div`
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
`

const ItemBody = styled.div`
  margin-top: 4px;
  font-size: ${({ theme }) => theme.font.xs};
  color: ${({ theme }) => theme.colors.textLight};
  line-height: 1.45;
`

const ItemMeta = styled.div`
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 10.5px;
  color: ${({ theme }) => theme.colors.textMuted};
`

const Empty = styled.div`
  padding: 40px 12px;
  text-align: center;
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  display: grid;
  justify-items: center;
  gap: 10px;
  svg { width: 38px; height: 38px; opacity: 0.2; }
`

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function NotificationsBell() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const nav = useNavigate()

  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [list, setList] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [ring, setRing] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: string; notif: Notification; createdAt: number }>>([])
  const ringT = useRef<number | null>(null)
  const unreadRef = useRef(0)

  const hasUnread = unreadCount > 0

  const loadUnreadCount = async () => {
    if (!user) return
    setUnreadCount(await notificationsService.unreadCount().catch(() => 0))
  }

  const loadList = async () => {
    if (!user) return
    setLoading(true)
    try {
      setList(await notificationsService.list({ take: 30 }).catch(() => []))
    } finally {
      setLoading(false)
    }
  }

  const triggerRing = () => {
    setRing(true)
    if (ringT.current) window.clearTimeout(ringT.current)
    ringT.current = window.setTimeout(() => setRing(false), 720)
  }

  useEffect(() => {
    if (!user) { setUnreadCount(0); setList([]); return }
    void loadUnreadCount()
  }, [user?.id]) // eslint-disable-line

  useEffect(() => {
    unreadRef.current = unreadCount
  }, [unreadCount])

  useEffect(() => {
    if (!socket || !user) return
    const onNotif = (payload: any) => {
      // payload geralmente é a Notification completa (backend emite)
      const n = payload as Notification | undefined
      setUnreadCount((c) => c + 1)
      triggerRing()

      if (n?.id && n?.title) {
        setList((cur) => (cur.some((x) => x.id === n.id) ? cur : [n, ...cur].slice(0, 30)))
        setToasts((cur) => [{ id: n.id, notif: n, createdAt: Date.now() }, ...cur].slice(0, 3))
      }
    }
    socket.on('notification', onNotif)
    return () => { socket.off('notification', onNotif) }
  }, [socket, user?.id])

  const pushNagToast = () => {
    const c = unreadRef.current
    if (c <= 0) return
    const now = Date.now()
    const nagNotif: Notification = {
      id: 'nag',
      type: 'TASK_COMMENT',
      title: `Você tem ${c} notificação${c === 1 ? '' : 's'} não lida${c === 1 ? '' : 's'}.`,
      body: 'Clique aqui para abrir.',
      entityType: 'PROJECT',
      entityId: '',
      projectId: null,
      recipientId: user?.id ?? '',
      actorId: null,
      readAt: null,
      createdAt: new Date().toISOString(),
      actor: null,
    }
    setToasts((cur) => [{ id: 'nag', notif: nagNotif, createdAt: now }, ...cur.filter((t) => t.id !== 'nag')].slice(0, 3))
    triggerRing()
  }

  useEffect(() => {
    if (!open) return
    void loadList()
    void loadUnreadCount()
  }, [open])

  const onClickItem = async (n: Notification) => {
    if (!n.readAt) {
      await notificationsService.markRead(n.id).catch(() => {})
      setUnreadCount((c) => Math.max(0, c - 1))
      setList((cur) => cur.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)))
    }

    // Navegação rápida (MVP)
    if (n.type === 'DIRECT_MESSAGE') {
      const otherId = n.actor?.id ?? n.actorId
      nav(otherId ? `/chat?u=${encodeURIComponent(otherId)}` : '/chat')
      setOpen(false)
      return
    }

    if (n.entityType === 'TASK') {
      if (user?.role === 'CLIENTE') {
        if (n.projectId) nav(`/projetos/${n.projectId}`)
        else nav('/projetos')
      } else {
        nav(`/kanban?task=${encodeURIComponent(n.entityId)}`)
      }
      setOpen(false)
      return
    }

    if (n.entityType === 'PROJECT') {
      if (n.projectId) nav(`/projetos/${n.projectId}`)
      else nav('/projetos')
      setOpen(false)
      return
    }
  }

  const unreadInList = useMemo(() => list.filter((n) => !n.readAt).length, [list])

  const markAll = async () => {
    await notificationsService.markAllRead().catch(() => {})
    setUnreadCount(0)
    setList((cur) => cur.map((x) => (x.readAt ? x : { ...x, readAt: new Date().toISOString() })))
  }

  const closeToast = (id: string) => {
    setToasts((cur) => cur.filter((t) => t.id !== id))
  }

  useEffect(() => {
    if (toasts.length === 0) return
    const now = Date.now()
    const timers = toasts.map((t) => {
      const left = Math.max(800, 5500 - (now - t.createdAt))
      return window.setTimeout(() => closeToast(t.id), left)
    })
    return () => timers.forEach((x) => window.clearTimeout(x))
  }, [toasts])

  useEffect(() => {
    if (!user) return
    if (!hasUnread) return
    if (open) return

    // Lembrete a cada 1 minuto enquanto houver não lidas
    const i = window.setInterval(() => {
      pushNagToast()
    }, 60_000)
    return () => window.clearInterval(i)
  }, [user?.id, hasUnread, open])

  if (!user) return null

  return (
    <>
      <ToastStack aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => (
          <Toast key={t.id}>
            <ToastHead>
              <ToastTitle>
                <Sparkles />
                <span>{t.notif.title}</span>
              </ToastTitle>
              <ToastClose onClick={() => closeToast(t.id)} type="button" aria-label="Fechar">
                <X />
              </ToastClose>
            </ToastHead>
            <ToastBody
              onClick={() => {
                closeToast(t.id)
                void onClickItem(t.notif)
              }}
              type="button"
            >
              <ToastText>{t.notif.body ?? 'Toque para ver detalhes.'}</ToastText>
            </ToastBody>
          </Toast>
        ))}
      </ToastStack>

      <IconBtn title="Notificações" onClick={() => setOpen(true)} type="button" $hasUnread={hasUnread}>
        <BellWrap $ring={ring}>
          <Bell />
        </BellWrap>
        {hasUnread && <DotRing />}
        {hasUnread && <CountBadge>{unreadCount > 99 ? '99+' : unreadCount}</CountBadge>}
      </IconBtn>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Notificações"
        footer={(
          <>
            <Button data-variant="ghost" data-size="md" onClick={() => setOpen(false)} type="button">
              Fechar
            </Button>
            <Button data-variant="primary" data-size="md" onClick={markAll} disabled={unreadInList === 0} type="button">
              <CheckCheck />Marcar tudo como lido
            </Button>
          </>
        )}
      >
        {loading ? (
          <Empty>Carregando…</Empty>
        ) : list.length === 0 ? (
          <Empty>
            <CircleDashed />
            <div>Nenhuma notificação ainda.</div>
          </Empty>
        ) : (
          <List>
            {list.map((n) => (
              <Item key={n.id} $unread={!n.readAt} onClick={() => void onClickItem(n)} type="button">
                <ItemTitle>{n.title}</ItemTitle>
                {n.body && <ItemBody>{n.body}</ItemBody>}
                <ItemMeta>
                  <span>{n.actor?.name ? `Por ${n.actor.name}` : ''}</span>
                  <span>{fmtTime(n.createdAt)}</span>
                </ItemMeta>
              </Item>
            ))}
          </List>
        )}
      </Modal>
    </>
  )
}

