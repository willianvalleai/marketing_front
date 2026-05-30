import { useEffect, useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useAuth } from '@/app/providers/AuthContext'
import { projectsService } from '@/shared/services/projects.service'
import { tasksService } from '@/shared/services/tasks.service'
import { sectorsService } from '@/shared/services/sectors.service'
import { usersService } from '@/shared/services/users.service'
import type { Project, Sector, Task, User } from '@/shared/types'
import {
  FolderOpen,
  CheckCircle2,
  Clock4,
  CircleDashed,
  TrendingUp,
  ArrowRight,
  Layers,
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

/* ── Sectors Section ─────────────────────────── */
const sectorPulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`

const SectorsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const SectionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const SectionHeading = styled.h3`
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #e2e2e2;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    width: 18px;
    height: 18px;
    color: #8fd8ff;
  }
`

const SectionSubtitle = styled.p`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 11px;
  color: #8b90a0;
  margin: 0;
`

const SectorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`

const SECTOR_GRADIENTS = [
  ['linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 'rgba(99,102,241,0.15)', 'rgba(99,102,241,0.3)'],
  ['linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', 'rgba(59,130,246,0.15)', 'rgba(59,130,246,0.3)'],
  ['linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', 'rgba(6,182,212,0.15)', 'rgba(6,182,212,0.3)'],
  ['linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', 'rgba(16,185,129,0.15)', 'rgba(16,185,129,0.3)'],
  ['linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', 'rgba(245,158,11,0.15)', 'rgba(245,158,11,0.3)'],
  ['linear-gradient(135deg, #ef4444 0%, #f97316 100%)', 'rgba(239,68,68,0.15)', 'rgba(239,68,68,0.3)'],
  ['linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)', 'rgba(139,92,246,0.15)', 'rgba(139,92,246,0.3)'],
  ['linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', 'rgba(236,72,153,0.15)', 'rgba(236,72,153,0.3)'],
]

const SectorCard = styled.div<{ $bg: string; $border: string }>`
  background: rgba(20, 20, 25, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid ${({ $border }) => $border};
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ $bg }) => $bg};
    border-radius: 16px 16px 0 0;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
    border-color: ${({ $border }) => $border};
    filter: brightness(1.08);
  }
`

const SectorIconWrap = styled.div<{ $gradient: string; $faint: string }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${({ $faint }) => $faint};
  border: 1px solid ${({ $gradient }) => $gradient.replace('0.15', '0.25')};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 20px;
    height: 20px;
    color: white;
    opacity: 0.9;
  }
`

const SectorCardName = styled.div`
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #e2e2e2;
  line-height: 1.3;
`

const SectorCardMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const SectorCollabCount = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 11px;
  color: #8b90a0;
  display: flex;
  align-items: center;
  gap: 5px;
`

const SectorAvatarsRow = styled.div`
  display: flex;
  align-items: center;
`

const SectorAvatar = styled.div<{ $idx: number; $gradient: string }>`
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  background: ${({ $gradient }) => $gradient};
  border: 2px solid rgba(20, 20, 25, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  font-size: 8px;
  font-weight: 700;
  color: white;
  margin-left: ${({ $idx }) => $idx > 0 ? '-6px' : '0'};
  position: relative;
  z-index: ${({ $idx }) => 10 - $idx};
  flex-shrink: 0;
`

const SectorEmptyState = styled.div`
  grid-column: 1 / -1;
  padding: 40px 24px;
  text-align: center;
  background: rgba(20, 20, 25, 0.4);
  border: 1px dashed rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  color: #8b90a0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 1.6;
`

export function HomePage() {
  const { user } = useAuth()
  const isCliente = user?.role === 'CLIENTE'
  const isAdmin = user?.role === 'ADMIN'
  const [projects, setProjects] = useState<Project[]>([])
  const [myTasks, setMyTasks] = useState<Task[]>([])
  const [clientDash, setClientDash] = useState<any>(null)
  const [sectors, setSectors] = useState<Sector[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])

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
    sectorsService.list().then(setSectors).catch(() => setSectors([]))
    if (isAdmin) {
      usersService.list().then((u) => setAllUsers(u.filter((x) => x.role === 'COLABORADOR'))).catch(() => setAllUsers([]))
    }
  }, [isCliente, isAdmin])

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

  // Mapeia colaboradores por setor
  const collabsBySector = useMemo(() => {
    const m = new Map<string, User[]>()
    for (const s of sectors) {
      m.set(s.id, allUsers.filter((u) => (u.sectors ?? []).some((us) => us.id === s.id)))
    }
    return m
  }, [sectors, allUsers])

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

      {/* Setores — visível para Admin e Colaborador */}
      {!isCliente && (
        <SectorsSection>
          <SectionHeaderRow>
            <div>
              <SectionHeading>
                <Layers />
                Setores
              </SectionHeading>
              <SectionSubtitle style={{ marginTop: 4 }}>
                {isAdmin
                  ? `${sectors.length} setor${sectors.length !== 1 ? 'es' : ''} cadastrado${sectors.length !== 1 ? 's' : ''} na plataforma`
                  : 'Setores ativos na plataforma'}
              </SectionSubtitle>
            </div>
          </SectionHeaderRow>

          <SectorsGrid>
            {sectors.length === 0 ? (
              <SectorEmptyState>
                Nenhum setor cadastrado ainda.{isAdmin ? ' Acesse Usuários › Setores para criar.' : ''}
              </SectorEmptyState>
            ) : (
              sectors.map((s, idx) => {
                const [gradient, faint, border] = SECTOR_GRADIENTS[idx % SECTOR_GRADIENTS.length]
                const sectorCollabs = collabsBySector.get(s.id) ?? []
                return (
                  <SectorCard key={s.id} $bg={gradient} $border={border}>
                    <SectorIconWrap $gradient={faint} $faint={faint}>
                      <Layers />
                    </SectorIconWrap>

                    <SectorCardName>{s.name}</SectorCardName>

                    <SectorCardMeta>
                      <SectorCollabCount>
                        {isAdmin
                          ? `${sectorCollabs.length} colaborador${sectorCollabs.length !== 1 ? 'es' : ''}`
                          : ''}
                      </SectorCollabCount>
                      {isAdmin && sectorCollabs.length > 0 && (
                        <SectorAvatarsRow>
                          {sectorCollabs.slice(0, 4).map((c, i) => (
                            <SectorAvatar key={c.id} $idx={i} $gradient={gradient} title={c.name}>
                              {c.name.charAt(0).toUpperCase()}
                            </SectorAvatar>
                          ))}
                          {sectorCollabs.length > 4 && (
                            <SectorAvatar $idx={4} $gradient="rgba(139,144,160,0.4)" title={`+${sectorCollabs.length - 4} mais`}>
                              +{sectorCollabs.length - 4}
                            </SectorAvatar>
                          )}
                        </SectorAvatarsRow>
                      )}
                    </SectorCardMeta>
                  </SectorCard>
                )
              })
            )}
          </SectorsGrid>
        </SectorsSection>
      )}
    </Grid>
  )
}
