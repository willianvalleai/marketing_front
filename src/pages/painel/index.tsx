import { useEffect, useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  Clock,
  Folder,
  Layers,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/app/providers/AuthContext'
import { projectsService } from '@/shared/services/projects.service'
import { usersService } from '@/shared/services/users.service'
import { sectorsService } from '@/shared/services/sectors.service'
import { clientService } from '@/shared/services/client.service'
import type { Project, Task, User, Sector } from '@/shared/types'
import type { ClientDashboard } from '@/shared/services/client.service'

// ─── helpers ──────────────────────────────────────────────────────────────────

function isOverdue(task: Task) {
  return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
}

function isDueSoon(task: Task) {
  if (!task.dueDate || task.status === 'DONE') return false
  const diff = new Date(task.dueDate).getTime() - Date.now()
  return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function priorityColor(p: string) {
  return p === 'HIGH' ? '#f87171' : p === 'MEDIUM' ? '#fbbf24' : '#6ee7b7'
}

function statusLabel(s: string) {
  const m: Record<string, string> = {
    TODO: 'A fazer',
    IN_PROGRESS: 'Em progresso',
    INTERNAL_REVIEW: 'Revisão',
    CHANGES_REQUESTED: 'Ajustes',
    CLIENT_REVIEW: 'Cl. Review',
    DONE: 'Concluída',
  }
  return m[s] ?? s
}

// ─── animations ───────────────────────────────────────────────────────────────

const fadeIn = keyframes`from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; }`

// ─── layout ───────────────────────────────────────────────────────────────────

const PageWrap = styled.div`
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  animation: ${fadeIn} 0.35s ease;
`

const PageTitle = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #f1f5f9;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
`

const SectionTitle = styled.h2`
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  margin: 0 0 14px;
`

// ─── stat cards ───────────────────────────────────────────────────────────────

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
`

const StatCard = styled.div<{ $accent?: string }>`
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: ${({ $accent }) => $accent ?? '#6366f1'};
    border-radius: 14px 14px 0 0;
  }
`

const StatValue = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #f1f5f9;
  line-height: 1;
`

const StatLabel = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
`

const StatIcon = styled.div<{ $color: string }>`
  width: 36px; height: 36px;
  border-radius: 10px;
  background: ${({ $color }) => $color}22;
  display: flex; align-items: center; justify-content: center;
  color: ${({ $color }) => $color};
  svg { width: 18px; height: 18px; }
`

// ─── table ────────────────────────────────────────────────────────────────────

const Card = styled.div`
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  overflow: hidden;
`

const Table = styled.div`
  width: 100%;
`

const THead = styled.div`
  display: grid;
  padding: 10px 20px;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.06);
`

const TRow = styled.div`
  display: grid;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  align-items: center;
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(255,255,255,0.03); }
`

const TCell = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #cbd5e1;
`

const THeadCell = styled(TCell)`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #64748b;
`

const Avatar = styled.div<{ $i?: number }>`
  width: 28px; height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
`

const LoadBadge = styled.span<{ $level: 'low' | 'mid' | 'high' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  background: ${({ $level }) =>
    $level === 'high' ? 'rgba(239,68,68,0.15)' :
    $level === 'mid'  ? 'rgba(245,158,11,0.15)' :
                        'rgba(16,185,129,0.15)'};
  color: ${({ $level }) =>
    $level === 'high' ? '#fca5a5' :
    $level === 'mid'  ? '#fcd34d' :
                        '#6ee7b7'};
`

const PriorityDot = styled.span<{ $p: string }>`
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: ${({ $p }) => priorityColor($p)};
  margin-right: 5px;
  flex-shrink: 0;
`

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`

// ─── sector cards ─────────────────────────────────────────────────────────────

const SectorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
`

const SectorCard = styled.div<{ $gradient: string }>`
  background: ${({ $gradient }) => $gradient};
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const SECTOR_GRADIENTS = [
  'linear-gradient(135deg,rgba(99,102,241,0.18) 0%,rgba(139,92,246,0.08) 100%)',
  'linear-gradient(135deg,rgba(236,72,153,0.18) 0%,rgba(239,68,68,0.08) 100%)',
  'linear-gradient(135deg,rgba(16,185,129,0.18) 0%,rgba(5,150,105,0.08) 100%)',
  'linear-gradient(135deg,rgba(245,158,11,0.18) 0%,rgba(234,88,12,0.08) 100%)',
  'linear-gradient(135deg,rgba(59,130,246,0.18) 0%,rgba(99,102,241,0.08) 100%)',
  'linear-gradient(135deg,rgba(168,85,247,0.18) 0%,rgba(236,72,153,0.08) 100%)',
]

const SectorName = styled.span`
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: #f1f5f9;
`

const SectorMeta = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: #94a3b8;
`

const SectorAvatarRow = styled.div`
  display: flex;
  gap: -6px;
`

// ─── task list item ───────────────────────────────────────────────────────────

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(255,255,255,0.03); cursor: pointer; }
`

const TaskTitle = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #e2e8f0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const TaskDate = styled.span<{ $overdue?: boolean }>`
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: ${({ $overdue }) => $overdue ? '#fca5a5' : '#94a3b8'};
  white-space: nowrap;
`

const TaskProject = styled.span`
  font-size: 10px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 110px;
`

const EmptyNote = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #64748b;
  padding: 16px 20px;
  margin: 0;
`

// ─── client dashboard ─────────────────────────────────────────────────────────

const StatusBadge = styled.span<{ $s: string }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  background: ${({ $s }) => $s === 'DONE' ? 'rgba(16,185,129,0.15)' :
    $s === 'IN_PROGRESS' ? 'rgba(59,130,246,0.15)' :
    $s === 'CLIENT_REVIEW' ? 'rgba(245,158,11,0.15)' :
    'rgba(99,102,241,0.12)'};
  color: ${({ $s }) => $s === 'DONE' ? '#6ee7b7' :
    $s === 'IN_PROGRESS' ? '#93c5fd' :
    $s === 'CLIENT_REVIEW' ? '#fcd34d' :
    '#a5b4fc'};
`

// ─── main component ───────────────────────────────────────────────────────────

export function PainelPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isCliente = user?.role === 'CLIENTE'
  const isColab = user?.role === 'COLABORADOR'

  // admin/colab state
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])

  // client state
  const [clientData, setClientData] = useState<ClientDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  // gantt tab state (for g5-gantt)
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline'>('overview')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        if (isCliente) {
          const d = await clientService.dashboard()
          setClientData(d)
        } else {
          const [p, u, s] = await Promise.all([
            projectsService.list(),
            usersService.list(),
            sectorsService.list(),
          ])
          setProjects(p)
          setUsers(u)
          setSectors(s)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isCliente])

  // ── derived data ─────────────────────────────────────────────────────────────

  const allTasks = useMemo(() =>
    projects.flatMap((p) => (p.tasks ?? []).map((t) => ({ ...t, projectTitle: p.title }))),
    [projects]
  )

  const stats = useMemo(() => {
    const total = allTasks.length
    const done = allTasks.filter((t) => t.status === 'DONE').length
    const inProg = allTasks.filter((t) => t.status === 'IN_PROGRESS').length
    const overdue = allTasks.filter(isOverdue).length
    const activeProjects = projects.filter((p) =>
      p.projectStatus !== 'COMPLETED' && p.projectStatus !== 'CANCELLED'
    ).length
    return { total, done, inProg, overdue, activeProjects }
  }, [allTasks, projects])

  const collaborators = useMemo(
    () => users.filter((u) => u.role === 'COLABORADOR'),
    [users]
  )

  const collabLoad = useMemo(() => {
    return collaborators.map((colab) => {
      const myTasks = allTasks.filter(
        (t) =>
          t.assignedToId === colab.id ||
          (t.assignees ?? []).some((a) => a.userId === colab.id)
      )
      const active = myTasks.filter((t) => t.status !== 'DONE').length
      const done = myTasks.filter((t) => t.status === 'DONE').length
      const over = myTasks.filter(isOverdue).length
      return { colab, active, done, over }
    })
  }, [collaborators, allTasks])

  const tasksDueSoon = useMemo(
    () =>
      allTasks
        .filter(isDueSoon)
        .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? '')),
    [allTasks]
  )

  const overdueTasks = useMemo(
    () =>
      allTasks
        .filter(isOverdue)
        .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? '')),
    [allTasks]
  )

  const sectorPerf = useMemo(() => {
    return sectors.map((s, idx) => {
      const collabsInSector = collaborators.filter((c) =>
        (c.sectors ?? []).some((cs) => cs.id === s.id)
      )
      const sectorTasks = allTasks.filter((t) =>
        collabsInSector.some(
          (c) =>
            t.assignedToId === c.id ||
            (t.assignees ?? []).some((a) => a.userId === c.id)
        )
      )
      const total = sectorTasks.length
      const done = sectorTasks.filter((t) => t.status === 'DONE').length
      const pct = total === 0 ? 0 : Math.round((done / total) * 100)
      return { sector: s, total, done, pct, gradient: SECTOR_GRADIENTS[idx % SECTOR_GRADIENTS.length], collabsInSector }
    })
  }, [sectors, collaborators, allTasks])

  const myLoad = useMemo(
    () => collabLoad.find((cl) => cl.colab.id === user?.id),
    [collabLoad, user]
  )

  // ─── render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <PageWrap>
        <PageTitle><BarChart2 size={22} /> Painel</PageTitle>
        <EmptyNote>Carregando dados...</EmptyNote>
      </PageWrap>
    )
  }

  // ── cliente view ───────────────────────────────────────────────────────────
  if (isCliente && clientData) {
    return <ClientView data={clientData} navigate={navigate} />
  }

  // ── admin / colaborador view ───────────────────────────────────────────────
  return (
    <PageWrap>
      <PageTitle><BarChart2 size={22} /> Painel de Gestão</PageTitle>

      {/* Tab bar */}
      <TabBar activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <>
          {/* stat cards */}
          <StatsRow>
            <StatCard $accent="#6366f1">
              <StatIcon $color="#6366f1"><Folder /></StatIcon>
              <StatValue>{stats.activeProjects}</StatValue>
              <StatLabel>Projetos ativos</StatLabel>
            </StatCard>
            <StatCard $accent="#3b82f6">
              <StatIcon $color="#3b82f6"><Zap /></StatIcon>
              <StatValue>{stats.total}</StatValue>
              <StatLabel>Total de tarefas</StatLabel>
            </StatCard>
            <StatCard $accent="#10b981">
              <StatIcon $color="#10b981"><CheckCircle2 /></StatIcon>
              <StatValue>{stats.done}</StatValue>
              <StatLabel>Concluídas</StatLabel>
            </StatCard>
            <StatCard $accent="#f59e0b">
              <StatIcon $color="#f59e0b"><Clock /></StatIcon>
              <StatValue>{stats.inProg}</StatValue>
              <StatLabel>Em andamento</StatLabel>
            </StatCard>
            <StatCard $accent="#ef4444">
              <StatIcon $color="#ef4444"><AlertTriangle /></StatIcon>
              <StatValue>{stats.overdue}</StatValue>
              <StatLabel>Atrasadas</StatLabel>
            </StatCard>
          </StatsRow>

          {/* colab load table */}
          {!isColab && (
            <div>
              <SectionTitle><Users size={12} style={{ marginRight: 6 }} />Carga por Colaborador</SectionTitle>
              <Card>
                <Table>
                  <THead style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 80px' }}>
                    <THeadCell>Colaborador</THeadCell>
                    <THeadCell>Ativas</THeadCell>
                    <THeadCell>Atrasadas</THeadCell>
                    <THeadCell>Concluídas</THeadCell>
                    <THeadCell>Carga</THeadCell>
                  </THead>
                  {collabLoad.length === 0
                    ? <EmptyNote>Nenhum colaborador cadastrado.</EmptyNote>
                    : collabLoad.map(({ colab, active, done, over }) => (
                    <TRow key={colab.id} style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 80px' }}>
                      <TCell style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar>{colab.name.charAt(0).toUpperCase()}</Avatar>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 12, color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>{colab.name}</span>
                          <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
                            {(colab.sectors ?? []).map((s) => s.name).join(', ') || '—'}
                          </span>
                        </div>
                      </TCell>
                      <TCell>{active}</TCell>
                      <TCell style={{ color: over > 0 ? '#fca5a5' : '#94a3b8' }}>{over}</TCell>
                      <TCell style={{ color: '#6ee7b7' }}>{done}</TCell>
                      <TCell>
                        <LoadBadge $level={active >= 7 ? 'high' : active >= 4 ? 'mid' : 'low'}>{active}</LoadBadge>
                      </TCell>
                    </TRow>
                  ))}
                </Table>
              </Card>
            </div>
          )}

          {/* my tasks highlight for colab */}
          {isColab && myLoad && (
            <div>
              <SectionTitle><TrendingUp size={12} style={{ marginRight: 6 }} />Minha Carga</SectionTitle>
              <StatsRow>
                <StatCard $accent="#f59e0b">
                  <StatIcon $color="#f59e0b"><Clock /></StatIcon>
                  <StatValue>{myLoad.active}</StatValue>
                  <StatLabel>Tarefas ativas</StatLabel>
                </StatCard>
                <StatCard $accent="#ef4444">
                  <StatIcon $color="#ef4444"><AlertTriangle /></StatIcon>
                  <StatValue>{myLoad.over}</StatValue>
                  <StatLabel>Atrasadas</StatLabel>
                </StatCard>
                <StatCard $accent="#10b981">
                  <StatIcon $color="#10b981"><CheckCircle2 /></StatIcon>
                  <StatValue>{myLoad.done}</StatValue>
                  <StatLabel>Concluídas</StatLabel>
                </StatCard>
              </StatsRow>
            </div>
          )}

          {/* due soon + overdue */}
          <TwoCol>
            <div>
              <SectionTitle><Clock size={12} style={{ marginRight: 6 }} />A vencer (7 dias)</SectionTitle>
              <Card>
                {tasksDueSoon.length === 0
                  ? <EmptyNote>Nenhuma tarefa vencendo nos próximos 7 dias.</EmptyNote>
                  : tasksDueSoon.slice(0, 10).map((t) => (
                  <TaskItem
                    key={t.id}
                    onClick={() => navigate(`/kanban?task=${t.id}&project=${t.projectId}`)}
                  >
                    <PriorityDot $p={t.priority} />
                    <TaskTitle title={t.title}>{t.title}</TaskTitle>
                    <TaskProject title={(t as any).projectTitle}>{(t as any).projectTitle}</TaskProject>
                    <TaskDate>{fmtDate(t.dueDate)}</TaskDate>
                  </TaskItem>
                ))}
              </Card>
            </div>

            <div>
              <SectionTitle><AlertTriangle size={12} style={{ marginRight: 6 }} />Atrasadas</SectionTitle>
              <Card>
                {overdueTasks.length === 0
                  ? <EmptyNote style={{ color: '#6ee7b7' }}>Nenhuma tarefa atrasada!</EmptyNote>
                  : overdueTasks.slice(0, 10).map((t) => (
                  <TaskItem
                    key={t.id}
                    onClick={() => navigate(`/kanban?task=${t.id}&project=${t.projectId}`)}
                  >
                    <PriorityDot $p={t.priority} />
                    <TaskTitle title={t.title}>{t.title}</TaskTitle>
                    <TaskProject title={(t as any).projectTitle}>{(t as any).projectTitle}</TaskProject>
                    <TaskDate $overdue>{fmtDate(t.dueDate)}</TaskDate>
                  </TaskItem>
                ))}
              </Card>
            </div>
          </TwoCol>

          {/* sector performance */}
          {!isColab && sectorPerf.length > 0 && (
            <div>
              <SectionTitle><Layers size={12} style={{ marginRight: 6 }} />Performance por Setor</SectionTitle>
              <SectorGrid>
                {sectorPerf.map(({ sector, total, done, pct, gradient, collabsInSector }) => (
                  <SectorCard key={sector.id} $gradient={gradient}>
                    <SectorName>{sector.name}</SectorName>
                    <SectorMeta>{collabsInSector.length} colaborador{collabsInSector.length !== 1 ? 'es' : ''}</SectorMeta>
                    <SectorMeta>{done}/{total} tarefas concluídas</SectorMeta>
                    <ProgressBar pct={pct} />
                    <SectorMeta style={{ fontWeight: 600, color: pct >= 70 ? '#6ee7b7' : pct >= 40 ? '#fcd34d' : '#fca5a5' }}>
                      {pct}% concluído
                    </SectorMeta>
                    <SectorAvatarRow>
                      {collabsInSector.slice(0, 5).map((c) => (
                        <Avatar key={c.id} style={{ width: 22, height: 22, fontSize: 9, marginRight: -4 }}>
                          {c.name.charAt(0).toUpperCase()}
                        </Avatar>
                      ))}
                    </SectorAvatarRow>
                  </SectorCard>
                ))}
              </SectorGrid>
            </div>
          )}
        </>
      )}

      {activeTab === 'timeline' && (
        <GanttView projects={projects} navigate={navigate} />
      )}
    </PageWrap>
  )
}

// ─── progress bar ─────────────────────────────────────────────────────────────

const ProgressTrack = styled.div`
  height: 5px;
  background: rgba(255,255,255,0.08);
  border-radius: 99px;
  overflow: hidden;
`

const ProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: linear-gradient(90deg, #6366f1, #a78bfa);
  border-radius: 99px;
  transition: width 0.4s ease;
`

function ProgressBar({ pct }: { pct: number }) {
  return (
    <ProgressTrack>
      <ProgressFill $pct={pct} />
    </ProgressTrack>
  )
}

// ─── tab bar ──────────────────────────────────────────────────────────────────

const TabsRow = styled.div`
  display: flex;
  gap: 4px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 4px;
  width: fit-content;
`

const Tab = styled.button<{ $active: boolean }>`
  border: none;
  background: ${({ $active }) => $active ? 'rgba(99,102,241,0.25)' : 'transparent'};
  color: ${({ $active }) => $active ? '#a5b4fc' : '#64748b'};
  border-radius: 7px;
  padding: 6px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { color: #c7d2fe; }
`

function TabBar({
  activeTab,
  onChange,
}: {
  activeTab: 'overview' | 'timeline'
  onChange: (v: 'overview' | 'timeline') => void
}) {
  return (
    <TabsRow>
      <Tab $active={activeTab === 'overview'} onClick={() => onChange('overview')}>
        Visão Geral
      </Tab>
      <Tab $active={activeTab === 'timeline'} onClick={() => onChange('timeline')}>
        Timeline
      </Tab>
    </TabsRow>
  )
}

// ─── gantt / timeline view ────────────────────────────────────────────────────

const GanttWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const GanttRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const GanttProjectLabel = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding-bottom: 4px;
`

const GanttGrid = styled.div`
  position: relative;
  height: 36px;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  overflow: hidden;
`

const GanttBar = styled.div<{ $left: number; $width: number; $color: string }>`
  position: absolute;
  left: ${({ $left }) => $left}%;
  width: ${({ $width }) => Math.max($width, 2)}%;
  height: 100%;
  background: ${({ $color }) => $color};
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding: 0 6px;
  cursor: pointer;
  transition: filter 0.15s;
  &:hover { filter: brightness(1.2); }
  span {
    font-size: 10px;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const GANTT_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6']

function GanttView({ projects, navigate }: { projects: Project[]; navigate: (p: string) => void }) {
  const horizon = 90 // days to show
  const start = new Date()
  start.setDate(start.getDate() - 7)
  const end = new Date()
  end.setDate(end.getDate() + horizon)
  const totalMs = end.getTime() - start.getTime()

  const projectsWithTasks = projects.filter(
    (p) => (p.tasks ?? []).some((t) => t.dueDate)
  )

  if (projectsWithTasks.length === 0) {
    return <EmptyNote>Nenhum projeto com tarefas com data de vencimento para exibir na timeline.</EmptyNote>
  }

  return (
    <GanttWrap>
      <SectionTitle>Timeline de Projetos ({horizon} dias)</SectionTitle>
      {projectsWithTasks.map((p, pi) => (
        <GanttRow key={p.id}>
          <GanttProjectLabel>{p.title}</GanttProjectLabel>
          <GanttGrid>
            {(p.tasks ?? [])
              .filter((t) => t.dueDate)
              .slice(0, 20)
              .map((t) => {
                const due = new Date(t.dueDate!).getTime()
                const taskStart = Math.max(due - 3 * 24 * 60 * 60 * 1000, start.getTime())
                const left = Math.max(0, ((taskStart - start.getTime()) / totalMs) * 100)
                const width = Math.max(1, (Math.min(due, end.getTime()) - taskStart) / totalMs * 100)
                const color = GANTT_COLORS[pi % GANTT_COLORS.length]
                return (
                  <GanttBar
                    key={t.id}
                    $left={left}
                    $width={width}
                    $color={color}
                    title={`${t.title} — ${fmtDate(t.dueDate)}`}
                    onClick={() => navigate(`/kanban?task=${t.id}&project=${p.id}`)}
                  >
                    <span>{t.title}</span>
                  </GanttBar>
                )
              })}
          </GanttGrid>
        </GanttRow>
      ))}
    </GanttWrap>
  )
}

// ─── client view ──────────────────────────────────────────────────────────────

function ClientView({ data, navigate }: { data: ClientDashboard; navigate: (p: string) => void }) {
  const statusOrder: Array<keyof ClientDashboard['tasksByStatus']> = [
    'TODO', 'IN_PROGRESS', 'INTERNAL_REVIEW', 'CHANGES_REQUESTED', 'CLIENT_REVIEW', 'DONE',
  ]

  return (
    <PageWrap>
      <PageTitle><BarChart2 size={22} /> Painel do Cliente</PageTitle>

      {/* stat cards */}
      <StatsRow>
        <StatCard $accent="#6366f1">
          <StatIcon $color="#6366f1"><Folder /></StatIcon>
          <StatValue>{data.projectsCount}</StatValue>
          <StatLabel>Projetos</StatLabel>
        </StatCard>
        {statusOrder.map((s) => (
          <StatCard key={s} $accent={
            s === 'DONE' ? '#10b981' : s === 'IN_PROGRESS' ? '#3b82f6' :
            s === 'CLIENT_REVIEW' ? '#f59e0b' : '#6366f1'
          }>
            <StatValue>{data.tasksByStatus[s] ?? 0}</StatValue>
            <StatLabel>{statusLabel(s)}</StatLabel>
          </StatCard>
        ))}
      </StatsRow>

      {/* awaiting approval */}
      {data.awaitingApproval.length > 0 && (
        <div>
          <SectionTitle style={{ color: '#fcd34d' }}>
            <AlertTriangle size={12} style={{ marginRight: 6, color: '#fcd34d', verticalAlign: 'middle' }} />
            Aguardando sua aprovação ({data.awaitingApproval.length})
          </SectionTitle>
          <Card>
            {data.awaitingApproval.map((t) => (
              <TaskItem key={t.id} onClick={() => navigate(`/projetos/${t.projectId}`)}>
                <PriorityDot $p={t.priority} />
                <TaskTitle>{t.title}</TaskTitle>
                <TaskProject>{t.projectTitle}</TaskProject>
                <TaskDate $overdue={!!t.dueDate && new Date(t.dueDate) < new Date()}>
                  {fmtDate(t.dueDate)}
                </TaskDate>
              </TaskItem>
            ))}
          </Card>
        </div>
      )}

      {/* upcoming + recent */}
      <TwoCol>
        <div>
          <SectionTitle><Clock size={12} style={{ marginRight: 6 }} />Próximas entregas</SectionTitle>
          <Card>
            {data.upcoming.length === 0
              ? <EmptyNote>Nenhuma entrega próxima.</EmptyNote>
              : data.upcoming.map((t) => (
              <TaskItem key={t.id} onClick={() => navigate(`/projetos/${t.projectId}`)}>
                <PriorityDot $p={t.priority} />
                <TaskTitle>{t.title}</TaskTitle>
                <TaskProject>{t.projectTitle}</TaskProject>
                <StatusBadge $s={t.status}>{statusLabel(t.status)}</StatusBadge>
                <TaskDate>{fmtDate(t.dueDate)}</TaskDate>
              </TaskItem>
            ))}
          </Card>
        </div>

        <div>
          <SectionTitle><TrendingUp size={12} style={{ marginRight: 6 }} />Atividade recente</SectionTitle>
          <Card>
            {data.recentUpdates.length === 0
              ? <EmptyNote>Nenhuma atualização recente.</EmptyNote>
              : data.recentUpdates.map((t) => (
              <TaskItem key={t.id} onClick={() => navigate(`/projetos/${t.projectId}`)}>
                <PriorityDot $p={t.priority} />
                <TaskTitle>{t.title}</TaskTitle>
                <TaskProject>{t.projectTitle}</TaskProject>
                <StatusBadge $s={t.status}>{statusLabel(t.status)}</StatusBadge>
              </TaskItem>
            ))}
          </Card>
        </div>
      </TwoCol>
    </PageWrap>
  )
}
