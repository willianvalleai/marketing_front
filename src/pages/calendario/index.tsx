import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '@/app/providers/AuthContext'
import { clientService, type ClientCalendarItem } from '@/shared/services/client.service'
import { CalendarClock, ChevronRight, CircleDashed } from 'lucide-react'

const Wrap = styled.div`
  display: grid;
  gap: 16px;
`

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: ${({ theme }) => theme.font.lg};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
  svg { width: 18px; height: 18px; color: ${({ theme }) => theme.colors.primary}; }
`

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  overflow: hidden;
`

const Row = styled.button`
  width: 100%;
  padding: 14px 18px;
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 12px;
  align-items: center;
  background: transparent;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  text-align: left;
  &:last-child { border-bottom: none; }
  &:hover { background: ${({ theme }) => theme.colors.bg}; }
  @media (max-width: 800px) { grid-template-columns: 1fr auto; }
`

const DatePill = styled.div`
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textDark};
  font-weight: ${({ theme }) => theme.weights.semibold};
`

const Main = styled.div`
  min-width: 0;
`

const TaskTitle = styled.div`
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textDark};
  font-weight: ${({ theme }) => theme.weights.semibold};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Meta = styled.div`
  margin-top: 2px;
  font-size: ${({ theme }) => theme.font.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Empty = styled.div`
  padding: 42px 18px;
  text-align: center;
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  display: grid;
  justify-items: center;
  gap: 10px;
  svg { width: 38px; height: 38px; opacity: 0.2; }
`

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function CalendarioPage() {
  const { user } = useAuth()
  const nav = useNavigate()
  const isCliente = user?.role === 'CLIENTE'

  const [items, setItems] = useState<ClientCalendarItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isCliente) return
    setLoading(true)
    clientService.calendar()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [isCliente])

  const grouped = useMemo(() => {
    const m = new Map<string, ClientCalendarItem[]>()
    for (const i of items) {
      const k = new Date(i.dueDate).toISOString().slice(0, 10)
      m.set(k, [...(m.get(k) ?? []), i])
    }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [items])

  if (!user) return <Navigate to="/login" replace />
  if (!isCliente) return <Navigate to="/home" replace />

  return (
    <Wrap>
      <Head>
        <Title><CalendarClock />Calendário</Title>
      </Head>

      <Panel>
        {loading ? (
          <Empty>Carregando…</Empty>
        ) : grouped.length === 0 ? (
          <Empty>
            <CircleDashed />
            <div>Nenhuma tarefa com prazo definida ainda.</div>
          </Empty>
        ) : (
          grouped.flatMap(([day, list]) =>
            list.map((i) => (
              <Row key={i.id} onClick={() => nav(`/projetos/${i.projectId}`)} type="button">
                <DatePill>{fmtDate(day)}</DatePill>
                <Main>
                  <TaskTitle>{i.title}</TaskTitle>
                  <Meta>{i.project.title}</Meta>
                </Main>
                <ChevronRight />
              </Row>
            )),
          )
        )}
      </Panel>
    </Wrap>
  )
}

