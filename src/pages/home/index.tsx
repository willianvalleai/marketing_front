import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '@/app/providers/AuthContext'
import { projectsService } from '@/shared/services/projects.service'
import { tasksService } from '@/shared/services/tasks.service'
import type { Project, Task } from '@/shared/types'
import {
  FolderOpen,
  CheckCircle2,
  Clock4,
  CircleDashed,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'

/* ── Stat Card ─────────────────────────────────── */
const Grid = styled.div`
  display: grid;
  gap: 24px;
`

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
`

const StatCard = styled.div<{ $accent: string; $accentFaint: string }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 20px;
  box-shadow: ${({ theme }) => theme.shadow.sm};
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const StatTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`

const StatIconBox = styled.div<{ $bg: string; $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  svg { width: 18px; height: 18px; color: ${({ $color }) => $color}; }
`

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: ${({ theme }) => theme.weights.extrabold};
  color: ${({ theme }) => theme.colors.textDark};
  letter-spacing: -0.03em;
  line-height: 1;
`

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: ${({ theme }) => theme.weights.medium};
`

const StatChange = styled.div<{ $positive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.font.xs};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ $positive, theme }) => $positive ? theme.colors.success : theme.colors.textMuted};
  svg { width: 13px; height: 13px; }
`

/* ── Two columns ─────────────────────────────── */
const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  align-items: start;

  @media (max-width: 1100px) { grid-template-columns: 1fr; }
`

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  overflow: hidden;
`

const PanelHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const PanelTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.md};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
  margin: 0;
`

const ViewAll = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.font.xs};
  font-weight: ${({ theme }) => theme.weights.medium};
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  &:hover { text-decoration: underline; }
  svg { width: 13px; height: 13px; }
`

/* Project item */
const ProjectItem = styled.div`
  padding: 14px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: 14px;
  transition: background 0.12s;
  &:last-child { border-bottom: none; }
  &:hover { background: ${({ theme }) => theme.colors.bg}; }
`

const ProjectIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.primaryMid};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: ${({ theme }) => theme.weights.bold};
  font-size: ${({ theme }) => theme.font.md};
`

const ProjectInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const ProjectName = styled.div`
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const ProjectMeta = styled.div`
  font-size: ${({ theme }) => theme.font.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 2px;
`

const BarWrap = styled.div`
  width: 80px;
  flex-shrink: 0;
`
const BarTrack = styled.div`
  height: 5px;
  border-radius: 3px;
  background: ${({ theme }) => theme.colors.border};
  overflow: hidden;
  margin-bottom: 3px;
`
const BarFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: ${({ theme }) => theme.colors.primary};
`
const BarLabel = styled.div`
  font-size: 10.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: right;
`

/* Task item */
const StatusDot = styled.div<{ $status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $status, theme }) =>
    $status === 'DONE' ? theme.colors.success :
    $status === 'IN_PROGRESS' ? theme.colors.primary :
    $status === 'REVIEW' ? theme.colors.warning :
    theme.colors.borderStrong};
`

const TaskRow = styled.div`
  padding: 12px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: 10px;
  &:last-child { border-bottom: none; }
  &:hover { background: ${({ theme }) => theme.colors.bg}; }
`
const TaskTitle = styled.div`
  flex: 1;
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textDark};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
const TaskStatus = styled.div`
  font-size: ${({ theme }) => theme.font.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  flex-shrink: 0;
`

const Empty = styled.div`
  padding: 32px 20px;
  text-align: center;
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`

export function HomePage() {
  const { user } = useAuth()
  const isCliente = user?.role === 'CLIENTE'
  const [projects, setProjects] = useState<Project[]>([])
  const [myTasks, setMyTasks] = useState<Task[]>([])
  const [clientDash, setClientDash] = useState<any>(null)

  useEffect(() => {
    if (isCliente) {
      import('@/shared/services/client.service')
        .then(({ clientService }) => clientService.dashboard())
        .then(setClientDash)
        .catch(() => setClientDash(null))
      projectsService.list().then(setProjects).catch(() => setProjects([]))
      return
    }
    projectsService.list().then(setProjects).catch(() => setProjects([]))
    tasksService.listMine().then(setMyTasks).catch(() => setMyTasks([]))
  }, [isCliente])

  const done      = useMemo(() => (isCliente ? (clientDash?.tasksByStatus?.DONE ?? 0) : myTasks.filter((t) => t.status === 'DONE').length), [myTasks, isCliente, clientDash])
  const progress  = useMemo(() => (isCliente ? (clientDash?.tasksByStatus?.IN_PROGRESS ?? 0) : myTasks.filter((t) => t.status === 'IN_PROGRESS').length), [myTasks, isCliente, clientDash])
  const todo      = useMemo(() => (isCliente ? (clientDash?.tasksByStatus?.TODO ?? 0) : myTasks.filter((t) => t.status === 'TODO').length), [myTasks, isCliente, clientDash])

  const progressMap = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of projects) {
      if (!p.tasks?.length) { m.set(p.id, 0); continue }
      m.set(p.id, Math.round((p.tasks.filter((t) => t.status === 'DONE').length / p.tasks.length) * 100))
    }
    return m
  }, [projects])

  const STATUS_LABEL: Record<string, string> = {
    TODO: 'A fazer', IN_PROGRESS: 'Em progresso', REVIEW: 'Revisão', DONE: 'Concluído',
  }

  return (
    <Grid>
      {/* Stats */}
      <StatsRow>
        <StatCard $accent="#7c3aed" $accentFaint="#f5f3ff">
          <StatTop>
            <StatIconBox $bg="#f5f3ff" $color="#7c3aed"><FolderOpen /></StatIconBox>
          </StatTop>
          <div>
            <StatValue>{projects.length}</StatValue>
            <StatLabel>Projetos</StatLabel>
          </div>
          <StatChange $positive={true}><TrendingUp />Total visível</StatChange>
        </StatCard>

        <StatCard $accent="#059669" $accentFaint="#ecfdf5">
          <StatTop>
            <StatIconBox $bg="#ecfdf5" $color="#059669"><CheckCircle2 /></StatIconBox>
          </StatTop>
          <div>
            <StatValue>{done}</StatValue>
            <StatLabel>Tarefas concluídas</StatLabel>
          </div>
          <StatChange $positive={done > 0}>
            {done > 0 && <TrendingUp />}
            {myTasks.length > 0 ? `${Math.round((done / myTasks.length) * 100)}% do total` : 'Nenhuma ainda'}
          </StatChange>
        </StatCard>

        <StatCard $accent="#2563eb" $accentFaint="#eff6ff">
          <StatTop>
            <StatIconBox $bg="#eff6ff" $color="#2563eb"><Clock4 /></StatIconBox>
          </StatTop>
          <div>
            <StatValue>{progress}</StatValue>
            <StatLabel>Em andamento</StatLabel>
          </div>
          <StatChange>{progress > 0 ? 'Tarefas ativas' : 'Nenhuma ativa'}</StatChange>
        </StatCard>

        <StatCard $accent="#d97706" $accentFaint="#fffbeb">
          <StatTop>
            <StatIconBox $bg="#fffbeb" $color="#d97706"><CircleDashed /></StatIconBox>
          </StatTop>
          <div>
            <StatValue>{todo}</StatValue>
            <StatLabel>A fazer</StatLabel>
          </div>
          <StatChange>{todo > 0 ? 'Aguardando início' : 'Tudo em dia!'}</StatChange>
        </StatCard>
      </StatsRow>

      {/* Projects + Tasks */}
      <TwoCol>
        <Panel>
          <PanelHeader>
            <PanelTitle>Projetos recentes</PanelTitle>
            <ViewAll><ArrowRight />Ver todos</ViewAll>
          </PanelHeader>
          {projects.length === 0 ? (
            <Empty>Nenhum projeto ainda.</Empty>
          ) : (
            projects.slice(0, 6).map((p) => {
              const pct = progressMap.get(p.id) ?? 0
              return (
                <ProjectItem key={p.id}>
                  <ProjectIcon>{p.title.charAt(0).toUpperCase()}</ProjectIcon>
                  <ProjectInfo>
                    <ProjectName>{p.title}</ProjectName>
                    <ProjectMeta>Cliente: {p.client?.name ?? '—'}</ProjectMeta>
                  </ProjectInfo>
                  <BarWrap>
                    <BarTrack><BarFill $pct={pct} /></BarTrack>
                    <BarLabel>{pct}%</BarLabel>
                  </BarWrap>
                </ProjectItem>
              )
            })
          )}
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>{isCliente ? 'Aguardando você' : 'Minhas tarefas'}</PanelTitle>
          </PanelHeader>
          {isCliente ? (
            (clientDash?.awaitingApproval?.length ?? 0) === 0 ? (
              <Empty>Nenhuma tarefa aguardando sua aprovação.</Empty>
            ) : (
              clientDash.awaitingApproval.slice(0, 8).map((t: any) => (
                <TaskRow key={t.id}>
                  <StatusDot $status={'REVIEW'} />
                  <TaskTitle>{t.title}</TaskTitle>
                  <TaskStatus>Aprovação</TaskStatus>
                </TaskRow>
              ))
            )
          ) : (
            myTasks.length === 0 ? (
              <Empty>Nenhuma tarefa atribuída a você.</Empty>
            ) : (
              myTasks.slice(0, 8).map((t) => (
                <TaskRow key={t.id}>
                  <StatusDot $status={t.status as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'} />
                  <TaskTitle>{t.title}</TaskTitle>
                  <TaskStatus>{STATUS_LABEL[t.status] ?? t.status}</TaskStatus>
                </TaskRow>
              ))
            )
          )}
        </Panel>
      </TwoCol>
    </Grid>
  )
}
