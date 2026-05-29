import { useEffect, useMemo, useState, useCallback } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '@/app/providers/AuthContext'
import { clientService } from '@/shared/services/client.service'
import { milestonesService } from '@/shared/services/milestones.service'
import type { Asset, Milestone, Project, Task } from '@/shared/types'
import { Button } from '@/shared/components/ui/Button'
import { Textarea } from '@/shared/components/ui/Input'
import { FolderOpen, Link as LinkIcon, ClipboardList, CheckCircle2, SendHorizonal, MessageSquareText, AlertCircle, Clock, CheckCircle, Circle, ArrowRight, Target } from 'lucide-react'
import { Modal } from '@/shared/components/ui/Modal'

const Grid = styled.div`
  display: grid;
  gap: 20px;
`

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
`

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.font.lg};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
  svg { 
    width: 18px; 
    height: 18px; 
    color: ${({ theme }) => theme.colors.primary};
  }
`

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  overflow: hidden;
`

const PanelHead = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const PanelTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: ${({ theme }) => theme.font.md};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
  svg { 
    width: 16px; 
    height: 16px; 
    color: ${({ theme }) => theme.colors.primary};
  }
`

const ProgressSection = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`

const ProgressLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  
  span:first-child {
    font-size: ${({ theme }) => theme.font.xs};
    color: ${({ theme }) => theme.colors.textMuted};
    font-weight: ${({ theme }) => theme.weights.semibold};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`

const ProgressPercent = styled.span<{ $percent: number }>`
  font-size: ${({ theme }) => theme.font.md};
  font-weight: ${({ theme }) => theme.weights.bold};
  color: ${({ $percent, theme }) => 
    $percent === 100 ? theme.colors.success :
    $percent >= 75 ? theme.colors.primary :
    $percent >= 50 ? theme.colors.info :
    $percent >= 25 ? theme.colors.warning :
    theme.colors.textMuted};
`

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: ${({ theme }) => theme.colors.bg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  overflow: hidden;
  position: relative;
`

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: ${({ $percent, theme }) => 
    $percent === 100 
      ? `linear-gradient(90deg, ${theme.colors.success}, ${theme.colors.successLight})`
      : `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`
  };
  border-radius: ${({ theme }) => theme.radii.pill};
  transition: width 0.6s ease, background 0.3s ease;
  min-width: ${({ $percent }) => $percent > 0 && $percent < 3 ? '3%' : '0'};
`

const Timeline = styled.div`
  padding: 18px 20px;
  display: grid;
  gap: 0;
`

const TimelineStep = styled.div<{ $variant: 'success' | 'primary' | 'danger' | 'muted' }>`
  display: grid;
  grid-template-columns: 38px 1fr;
  gap: 14px;
  position: relative;
  padding-bottom: 20px;

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 18px;
    top: 38px;
    bottom: 0;
    width: 2px;
    background: ${({ theme, $variant }) =>
      $variant === 'success' ? theme.colors.successMid :
      $variant === 'primary' ? theme.colors.primaryMid :
      $variant === 'danger' ? theme.colors.dangerMid :
      theme.colors.border};
  }

  &:last-child {
    padding-bottom: 0;
  }
`

const StepIcon = styled.div<{ $variant: 'success' | 'primary' | 'danger' | 'muted' }>`
  width: 38px;
  height: 38px;
  border-radius: ${({ theme }) => theme.radii.pill};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme, $variant }) =>
    $variant === 'success' ? theme.colors.successFaint :
    $variant === 'primary' ? theme.colors.primaryFaint :
    $variant === 'danger' ? theme.colors.dangerFaint :
    theme.colors.bg};
  border: 2px solid ${({ theme, $variant }) =>
    $variant === 'success' ? theme.colors.success :
    $variant === 'primary' ? theme.colors.primary :
    $variant === 'danger' ? theme.colors.danger :
    theme.colors.borderStrong};
  color: ${({ theme, $variant }) =>
    $variant === 'success' ? theme.colors.success :
    $variant === 'primary' ? theme.colors.primary :
    $variant === 'danger' ? theme.colors.danger :
    theme.colors.textMuted};
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  
  svg {
    width: 18px;
    height: 18px;
  }
`

const StepContent = styled.div`
  padding-top: 2px;
`

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
`

const StepTitle = styled.div`
  font-size: ${({ theme }) => theme.font.md};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
  display: flex;
  align-items: center;
  gap: 7px;
`

const StepBadge = styled.span<{ $variant: 'success' | 'primary' | 'danger' | 'muted' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.font.xs};
  font-weight: ${({ theme }) => theme.weights.bold};
  background: ${({ theme, $variant }) =>
    $variant === 'success' ? theme.colors.success :
    $variant === 'primary' ? theme.colors.primary :
    $variant === 'danger' ? theme.colors.danger :
    theme.colors.borderStrong};
  color: white;
`

const StepMeta = styled.div`
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 10px;
  line-height: 1.4;
`

const MilestoneGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 16px 20px;
`

const MilestoneCard = styled.div<{ $status: string }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme, $status }) =>
    $status === 'COMPLETED' ? theme.colors.success :
    $status === 'IN_PROGRESS' ? theme.colors.primary :
    theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadow.md};
    transform: translateY(-2px);
  }
`

const MilestoneCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`

const MilestoneCardTitle = styled.div`
  font-size: ${({ theme }) => theme.font.md};
  font-weight: ${({ theme }) => theme.weights.bold};
  color: ${({ theme }) => theme.colors.textDark};
  line-height: 1.3;
  flex: 1;
`

const MilestoneStatusBadge = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 10px;
  font-weight: ${({ theme }) => theme.weights.bold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${({ $status, theme }) =>
    $status === 'COMPLETED' ? theme.colors.successMid :
    $status === 'IN_PROGRESS' ? theme.colors.primaryMid :
    theme.colors.borderStrong};
  color: ${({ $status, theme }) =>
    $status === 'COMPLETED' ? theme.colors.successText :
    $status === 'IN_PROGRESS' ? theme.colors.primaryText :
    theme.colors.textMuted};
`

const MilestoneCardDesc = styled.div`
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.5;
`

const MilestoneCardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.font.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`

const TasksList = styled.div`
  display: grid;
  gap: 6px;
`

const TaskCard = styled.button<{ $active?: boolean }>`
  width: 100%;
  border: none;
  background: ${({ theme, $active }) => $active ? theme.colors.primaryFaint : theme.colors.surface};
  border: 1px solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 10px 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: ${({ theme }) => theme.colors.primary};
    opacity: ${({ $active }) => $active ? 1 : 0};
    transition: opacity 0.15s ease;
  }
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryFaint};
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateX(2px);
    &::before { opacity: 1; }
  }
`

const TaskCardTitle = styled.div`
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
  margin-bottom: 3px;
  display: flex;
  align-items: center;
  gap: 6px;
`

const TaskCardMeta = styled.div`
  font-size: ${({ theme }) => theme.font.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
`

const SplitLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 16px;
  align-items: start;
  @media (max-width: 960px) { grid-template-columns: 1fr; }
`

const LeftCol = styled.div`
  min-height: 400px;
`

const RightCol = styled.div`
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow: hidden;
`

const DetailPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  font-size: ${({ theme }) => theme.font.sm};
  svg { color: ${({ theme }) => theme.colors.borderStrong}; width: 32px; height: 32px; }
`

const DetailBody = styled.div`
  padding: 14px 16px;
  display: grid;
  gap: 14px;
  overflow-y: auto;
  max-height: calc(100vh - 280px);
`

const DetailInfoRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`

const DetailInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`

const DetailInfoLabel = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: ${({ theme }) => theme.weights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.3px;
`

const DetailInfoValue = styled.span`
  font-size: ${({ theme }) => theme.font.xs};
  color: ${({ theme }) => theme.colors.textDark};
  font-weight: ${({ theme }) => theme.weights.semibold};
`

const PriorityDot = styled.span<{ $priority: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $priority }) =>
    $priority === 'HIGH' ? '#dc2626' :
    $priority === 'MEDIUM' ? '#d97706' :
    '#059669'};
`

const DetailSection = styled.div`
  display: grid;
  gap: 8px;
`

const DetailSectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: ${({ theme }) => theme.font.xs};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
  padding-bottom: 6px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  svg { width: 13px; height: 13px; color: ${({ theme }) => theme.colors.primary}; }
`

const DetailEmpty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  font-size: ${({ theme }) => theme.font.xs};
  svg { width: 20px; height: 20px; color: ${({ theme }) => theme.colors.borderStrong}; }
`

const DetailFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg};
`

const ReviewHighlight = styled.div`
  background: ${({ theme }) => theme.colors.dangerFaint};
  border: 1px solid ${({ theme }) => theme.colors.dangerMid};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 10px 12px;
  margin-top: -2px;
`

const ReviewHighlightTitle = styled.div`
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.danger};
  margin-bottom: 3px;
  display: flex;
  align-items: center;
  gap: 6px;
`

const ReviewHighlightMeta = styled.div`
  font-size: ${({ theme }) => theme.font.xs};
  color: ${({ theme }) => theme.colors.dangerText};
  margin-bottom: 8px;
`

const ReviewHighlightTasks = styled.div`
  display: grid;
  gap: 5px;
  margin-bottom: 8px;
`

const ReviewHighlightCard = styled.button`
  width: 100%;
  border: none;
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.dangerMid};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 8px 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  
  &:hover {
    background: ${({ theme }) => theme.colors.dangerFaint};
    transform: translateX(2px);
  }
`

const ReviewButton = styled(Button)`
  margin-top: 2px;
  font-size: ${({ theme }) => theme.font.sm};
  
  svg {
    width: 14px;
    height: 14px;
    transition: transform 0.2s ease;
  }
  
  &:hover svg {
    transform: translateX(3px);
  }
`

const ProjectCard = styled.button`
  width: 100%;
  border: none;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 16px 20px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryFaint};
  }
  
  &:last-child {
    border-bottom: none;
  }
`

const ProjectCardTitle = styled.div`
  font-size: ${({ theme }) => theme.font.md};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
  margin-bottom: 6px;
`

const ProjectCardMeta = styled.div`
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  gap: 8px;
  align-items: center;
`

const Chips = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding: 12px 16px;
`

const Chip = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 9px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.bg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textDark};
  font-size: ${({ theme }) => theme.font.xs};
  text-decoration: none;
  svg { width: 12px; height: 12px; color: ${({ theme }) => theme.colors.primary}; }
  &:hover { background: ${({ theme }) => theme.colors.primaryFaint}; border-color: ${({ theme }) => theme.colors.primaryMid}; }
`

const Form = styled.form`
  display: grid;
  gap: 10px;
`

const Hint = styled.div`
  font-size: ${({ theme }) => theme.font.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`

const Empty = styled.div`
  padding: 16px;
  text-align: center;
  font-size: ${({ theme }) => theme.font.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`

const CommentsWrap = styled.div`
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: grid;
  gap: 10px;
`

const CommentItem = styled.div<{ $own?: boolean }>`
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ $own, theme }) => ($own ? theme.colors.primaryFaint : theme.colors.bg)};
  border: 1px solid ${({ theme }) => theme.colors.border};
`

const CommentMeta = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  font-size: ${({ theme }) => theme.font.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`

const CommentAuthor = styled.span`
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
`

const CommentText = styled.div`
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textDark};
  line-height: 1.55;
  white-space: pre-wrap;
`

const CommentComposer = styled.form`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`

const ComposerInput = styled.textarea`
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  resize: vertical;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textDark};
  background: ${({ theme }) => theme.colors.surface};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryFaint};
  }
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
`

const SendBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.primaryMid};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  cursor: pointer;
  transition: transform 0.1s, filter 0.15s;
  svg { width: 16px; height: 16px; }
  &:hover { filter: brightness(0.97); }
  &:active { transform: scale(0.98); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

function statusLabel(s: Task['status']) {
  switch (s) {
    case 'DONE': return 'Concluído'
    case 'TODO': return 'A fazer'
    case 'IN_PROGRESS': return 'Em progresso'
    case 'INTERNAL_REVIEW': return 'Revisão Interna'
    case 'CHANGES_REQUESTED': return 'Ajustes Solicitados'
    case 'CLIENT_REVIEW': return 'Aguardando Aprovação'
    default: return s
  }
}

function fmtDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('pt-BR')
}

export function ClientProjectsPage() {
  const { user } = useAuth()
  const isCliente = user?.role === 'CLIENTE'
  const nav = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isCliente) return
    setLoading(true)
    clientService.projects()
      .then(setProjects)
      .finally(() => setLoading(false))
  }, [isCliente])

  if (!user) return <Navigate to="/login" replace />
  if (!isCliente) return <Navigate to="/home" replace />

  return (
    <Grid>
      <Head>
        <Title><FolderOpen />Meus projetos</Title>
      </Head>
      <Panel>
        {loading ? (
          <Empty>Carregando…</Empty>
        ) : projects.length === 0 ? (
          <Empty>Nenhum projeto ainda.</Empty>
        ) : (
          projects.map((p) => (
            <ProjectCard key={p.id} onClick={() => nav(`/projetos/${p.id}`)} type="button">
              <ProjectCardTitle>{p.title}</ProjectCardTitle>
              <ProjectCardMeta>
                <span>{p.tasks?.length ?? 0} tarefas</span>
                <span>•</span>
                <span>{Math.round(((p.tasks?.filter((t) => t.status === 'DONE').length ?? 0) / Math.max(1, p.tasks?.length ?? 1)) * 100)}%</span>
              </ProjectCardMeta>
            </ProjectCard>
          ))
        )}
      </Panel>
    </Grid>
  )
}

export function ClientProjectPage() {
  const { user } = useAuth()
  const isCliente = user?.role === 'CLIENTE'
  const { projectId } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  const [taskId, setTaskId] = useState<string | null>(null)
  const [task, setTask] = useState<any>(null)
  const [commentText, setCommentText] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [requestingChanges, setRequestingChanges] = useState(false)

  const load = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const [proj, miles] = await Promise.all([
        clientService.project(projectId),
        milestonesService.listByProject(projectId).catch(() => [] as Milestone[])
      ])
      setProject(proj)
      setMilestones(miles)
    } finally { setLoading(false) }
  }, [projectId])

  useEffect(() => { if (isCliente) void load() }, [isCliente, load])

  const groups = useMemo(() => {
    const tasks = project?.tasks ?? []
    return {
      DONE: tasks.filter((t) => t.status === 'DONE'),
      IN_DEVELOPMENT: tasks.filter((t) => ['TODO', 'IN_PROGRESS', 'INTERNAL_REVIEW', 'CHANGES_REQUESTED'].includes(t.status)),
      CLIENT_REVIEW: tasks.filter((t) => t.status === 'CLIENT_REVIEW'),
      TODO: tasks.filter((t) => t.status === 'TODO'),
    }
  }, [project?.tasks])

  const progressPercent = useMemo(() => {
    const tasks = project?.tasks ?? []
    if (tasks.length === 0) return 0
    const statusWeight: Record<string, number> = {
      'TODO': 0, 'IN_PROGRESS': 30, 'INTERNAL_REVIEW': 60,
      'CHANGES_REQUESTED': 40, 'CLIENT_REVIEW': 80, 'DONE': 100,
    }
    const total = tasks.reduce((sum, t) => sum + (statusWeight[t.status] ?? 0), 0)
    return Math.round(total / tasks.length)
  }, [project?.tasks])

  const openTask = useCallback(async (id: string) => {
    setTaskId(id)
    setTask(null)
    setTask(await clientService.task(id))
  }, [])

  const approve = useCallback(async () => {
    if (!taskId) return
    await clientService.approveTask(taskId)
    setTaskId(null)
    setTask(null)
    await load()
  }, [taskId, load])

  const requestChanges = useCallback(async () => {
    if (!taskId) return
    if (!confirm('Solicitar ajustes nesta tarefa? Use os comentários para detalhar o que precisa ser mudado.')) return
    setRequestingChanges(true)
    try {
      await clientService.requestChanges(taskId, '')
      alert('✅ Ajustes solicitados! A tarefa voltou para o Admin revisar.')
      setTaskId(null)
      setTask(null)
      await load()
    } catch (err) {
      alert('❌ Erro ao solicitar ajustes: ' + ((err as any)?.message || 'Erro desconhecido'))
    } finally {
      setRequestingChanges(false)
    }
  }, [taskId, load])

  const sendComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskId) return
    const content = commentText.trim()
    if (!content) return
    setSendingComment(true)
    try {
      await clientService.addComment(taskId, content)
      setCommentText('')
      setTask(await clientService.task(taskId))
    } finally {
      setSendingComment(false)
    }
  }, [taskId, commentText])

  if (!user) return <Navigate to="/login" replace />
  if (!isCliente) return <Navigate to="/home" replace />
  if (!projectId) return <Navigate to="/projetos" replace />

  return (
    <Grid>
      <Head>
        <Title><FolderOpen />{project?.title ?? 'Projeto'}</Title>
      </Head>

      {project && (project.briefing || project.objectives?.length || project.targetAudience || project.budget) && (
        <Panel>
          <PanelHead>
            <PanelTitle><ClipboardList />Briefing do Projeto</PanelTitle>
          </PanelHead>
          <div style={{ padding: '16px 20px', display: 'grid', gap: 16 }}>
            {project.briefing && (
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Contexto
                </div>
                <div style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {project.briefing}
                </div>
              </div>
            )}
            {project.objectives && project.objectives.length > 0 && (
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Objetivos
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {project.objectives.map((obj, idx) => (
                    <div key={idx} style={{ 
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
                      color: 'white',
                      padding: '6px 12px', 
                      borderRadius: 8, 
                      fontSize: 13,
                      fontWeight: 500
                    }}>
                      {obj}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {project.targetAudience && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Público-alvo
                  </div>
                  <div style={{ fontSize: '14px', color: '#374151' }}>
                    {project.targetAudience}
                  </div>
                </div>
              )}
              {project.budget && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Orçamento
                  </div>
                  <div style={{ fontSize: '18px', color: '#10b981', fontWeight: 700 }}>
                    R$ {project.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Panel>
      )}

      {milestones.length > 0 && (
        <Panel>
          <PanelHead>
            <PanelTitle><Target />Milestones & Fases</PanelTitle>
          </PanelHead>
          <MilestoneGrid>
            {milestones.map((m) => (
              <MilestoneCard key={m.id} $status={m.status}>
                <MilestoneCardHeader>
                  <MilestoneCardTitle>{m.title}</MilestoneCardTitle>
                  <MilestoneStatusBadge $status={m.status}>
                    {m.status === 'PENDING' && 'Pendente'}
                    {m.status === 'IN_PROGRESS' && 'Em Andamento'}
                    {m.status === 'COMPLETED' && 'Concluído'}
                  </MilestoneStatusBadge>
                </MilestoneCardHeader>
                {m.description && <MilestoneCardDesc>{m.description}</MilestoneCardDesc>}
                <MilestoneCardFooter>
                  {m.dueDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock style={{ width: 12, height: 12 }} />
                      {new Date(m.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  {m._count && (
                    <div>
                      {m._count.tasks} tarefa{m._count.tasks !== 1 ? 's' : ''}
                    </div>
                  )}
                </MilestoneCardFooter>
              </MilestoneCard>
            ))}
          </MilestoneGrid>
        </Panel>
      )}

      <SplitLayout>
        {/* Coluna esquerda — timeline */}
        <LeftCol>
          <Panel>
            <PanelHead>
              <div>
                <PanelTitle><ClipboardList />Project Progress Overview</PanelTitle>
              </div>
            </PanelHead>
            {loading ? (
              <Empty>Carregando…</Empty>
            ) : (
              <>
                <ProgressSection>
                  <ProgressLabel>
                    <span>Overall Progress</span>
                    <ProgressPercent $percent={progressPercent}>{progressPercent}% Complete</ProgressPercent>
                  </ProgressLabel>
                  <ProgressBar>
                    <ProgressFill $percent={progressPercent} />
                  </ProgressBar>
                </ProgressSection>

                <Timeline>
                  {/* Concluídas */}
                  <TimelineStep $variant="success">
                    <StepIcon $variant="success"><CheckCircle /></StepIcon>
                    <StepContent>
                      <StepHeader>
                        <StepTitle>
                          Concluídas
                          {groups.DONE.length > 0 && <StepBadge $variant="success">{groups.DONE.length}</StepBadge>}
                        </StepTitle>
                      </StepHeader>
                      <StepMeta>
                        {groups.DONE.length === 0
                          ? 'Nenhuma tarefa concluída ainda'
                          : `${groups.DONE.length} ${groups.DONE.length === 1 ? 'tarefa concluída' : 'tarefas concluídas'}`}
                      </StepMeta>
                      {groups.DONE.length > 0 && (
                        <TasksList>
                          {groups.DONE.map((t) => (
                            <TaskCard key={t.id} onClick={() => openTask(t.id)} type="button" $active={taskId === t.id}>
                              <TaskCardTitle>{t.title}</TaskCardTitle>
                              <TaskCardMeta>
                                {t.priority && <span>Prioridade: {t.priority}</span>}
                                {t.dueDate && <span>• Prazo: {fmtDate(t.dueDate)}</span>}
                              </TaskCardMeta>
                            </TaskCard>
                          ))}
                        </TasksList>
                      )}
                    </StepContent>
                  </TimelineStep>

                  {/* Em Desenvolvimento */}
                  <TimelineStep $variant="primary">
                    <StepIcon $variant="primary"><Clock /></StepIcon>
                    <StepContent>
                      <StepHeader>
                        <StepTitle>
                          Em Desenvolvimento
                          {groups.IN_DEVELOPMENT.length > 0 && <StepBadge $variant="primary">{groups.IN_DEVELOPMENT.length}</StepBadge>}
                        </StepTitle>
                      </StepHeader>
                      <StepMeta>
                        {groups.IN_DEVELOPMENT.length === 0
                          ? 'Nenhuma tarefa em desenvolvimento'
                          : `${groups.IN_DEVELOPMENT.length} ${groups.IN_DEVELOPMENT.length === 1 ? 'tarefa' : 'tarefas'} • Equipe trabalhando nas tarefas`}
                      </StepMeta>
                      {groups.IN_DEVELOPMENT.length > 0 && (
                        <TasksList>
                          {groups.IN_DEVELOPMENT.map((t) => (
                            <TaskCard key={t.id} onClick={() => openTask(t.id)} type="button" $active={taskId === t.id}>
                              <TaskCardTitle>{t.title}</TaskCardTitle>
                              <TaskCardMeta>
                                <span>{statusLabel(t.status)}</span>
                                {t.priority && <span>• Prioridade: {t.priority}</span>}
                                {t.dueDate && <span>• Prazo: {fmtDate(t.dueDate)}</span>}
                              </TaskCardMeta>
                            </TaskCard>
                          ))}
                        </TasksList>
                      )}
                    </StepContent>
                  </TimelineStep>

                  {/* Aguardando Revisão */}
                  <TimelineStep $variant="danger">
                    <StepIcon $variant="danger"><AlertCircle /></StepIcon>
                    <StepContent>
                      {groups.CLIENT_REVIEW.length === 0 ? (
                        <>
                          <StepHeader><StepTitle>Aguardando Sua Revisão</StepTitle></StepHeader>
                          <StepMeta>Nenhuma tarefa aguardando revisão</StepMeta>
                        </>
                      ) : (
                        <ReviewHighlight>
                          <ReviewHighlightTitle>
                            <AlertCircle size={18} />
                            Aguardando Sua Revisão
                            <StepBadge $variant="danger">{groups.CLIENT_REVIEW.length}</StepBadge>
                          </ReviewHighlightTitle>
                          <ReviewHighlightMeta>
                            {groups.CLIENT_REVIEW.length} {groups.CLIENT_REVIEW.length === 1 ? 'tarefa requer' : 'tarefas requerem'} sua atenção
                          </ReviewHighlightMeta>
                          <ReviewHighlightTasks>
                            {groups.CLIENT_REVIEW.map((t) => (
                              <ReviewHighlightCard key={t.id} onClick={() => openTask(t.id)} type="button">
                                <div>
                                  <TaskCardTitle style={{ marginBottom: 2 }}>{t.title}</TaskCardTitle>
                                  <TaskCardMeta>
                                    {t.priority && <span>Prioridade: {t.priority}</span>}
                                    {t.dueDate && <span>• Prazo: {fmtDate(t.dueDate)}</span>}
                                  </TaskCardMeta>
                                </div>
                                <ArrowRight size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
                              </ReviewHighlightCard>
                            ))}
                          </ReviewHighlightTasks>
                          <ReviewButton data-variant="danger" data-size="md" type="button"
                            onClick={() => { const f = groups.CLIENT_REVIEW[0]; if (f) openTask(f.id) }}>
                            Revisar Agora <ArrowRight />
                          </ReviewButton>
                        </ReviewHighlight>
                      )}
                    </StepContent>
                  </TimelineStep>

                  {/* Pendentes */}
                  <TimelineStep $variant="muted">
                    <StepIcon $variant="muted"><Circle /></StepIcon>
                    <StepContent>
                      <StepHeader>
                        <StepTitle>
                          Pendentes
                          {groups.TODO.length > 0 && <StepBadge $variant="muted">{groups.TODO.length}</StepBadge>}
                        </StepTitle>
                      </StepHeader>
                      <StepMeta>
                        {groups.TODO.length === 0
                          ? 'Nenhuma tarefa pendente'
                          : `${groups.TODO.length} ${groups.TODO.length === 1 ? 'tarefa' : 'tarefas'} ainda não ${groups.TODO.length === 1 ? 'iniciada' : 'iniciadas'}`}
                      </StepMeta>
                      {groups.TODO.length > 0 && (
                        <TasksList>
                          {groups.TODO.map((t) => (
                            <TaskCard key={t.id} onClick={() => openTask(t.id)} type="button" $active={taskId === t.id}>
                              <TaskCardTitle>{t.title}</TaskCardTitle>
                              <TaskCardMeta>
                                {t.priority && <span>Prioridade: {t.priority}</span>}
                                {t.dueDate && <span>• Prazo: {fmtDate(t.dueDate)}</span>}
                              </TaskCardMeta>
                            </TaskCard>
                          ))}
                        </TasksList>
                      )}
                    </StepContent>
                  </TimelineStep>
                </Timeline>
              </>
            )}
          </Panel>
        </LeftCol>

        {/* Coluna direita — painel de detalhes */}
        <RightCol>
          <Panel>
            {!taskId ? (
              <DetailPlaceholder>
                <ClipboardList size={32} strokeWidth={1.2} />
                <div>Selecione uma tarefa para ver os detalhes</div>
              </DetailPlaceholder>
            ) : !task ? (
              <Empty style={{ padding: 30 }}>Carregando…</Empty>
            ) : (
              <>
                <PanelHead>
                  <PanelTitle style={{ fontSize: '1.1rem' }}>{task.title}</PanelTitle>
                </PanelHead>

                <DetailBody>
                  {/* Info rápida */}
                  <DetailInfoRow>
                    {task.priority && (
                      <DetailInfoItem>
                        <DetailInfoLabel>Prioridade</DetailInfoLabel>
                        <PriorityDot $priority={task.priority} />
                        <DetailInfoValue>{task.priority}</DetailInfoValue>
                      </DetailInfoItem>
                    )}
                    {task.dueDate && (
                      <DetailInfoItem>
                        <DetailInfoLabel>Prazo</DetailInfoLabel>
                        <DetailInfoValue>📅 {fmtDate(task.dueDate)}</DetailInfoValue>
                      </DetailInfoItem>
                    )}
                  </DetailInfoRow>

                  {task.description && (
                    <DetailSection>
                      <DetailSectionTitle>Descrição</DetailSectionTitle>
                      <div style={{ color: '#374151', lineHeight: 1.6, fontSize: '0.9rem' }}>{task.description}</div>
                    </DetailSection>
                  )}

                  {/* Arquivos e links */}
                  <DetailSection>
                    <DetailSectionTitle><LinkIcon size={14} /> Arquivos e links</DetailSectionTitle>
                    {(task.assets?.length ?? 0) === 0 ? (
                      <DetailEmpty>
                        <LinkIcon size={28} strokeWidth={1.2} />
                        <span>Nenhum arquivo ou link anexado para esta tarefa ainda.</span>
                      </DetailEmpty>
                    ) : (
                      <Chips style={{ padding: 0 }}>
                        {task.assets.map((a: Asset) => (
                          <Chip key={a.id} href={a.url} target="_blank" rel="noreferrer"><LinkIcon />{a.name}</Chip>
                        ))}
                      </Chips>
                    )}
                  </DetailSection>

                  {/* Comentários */}
                  <DetailSection>
                    <DetailSectionTitle><MessageSquareText size={14} /> Comentários</DetailSectionTitle>
                    <CommentsWrap style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                      {(task.comments?.length ?? 0) === 0 ? (
                        <Hint>Nenhum comentário ainda.</Hint>
                      ) : (
                        task.comments.map((c: any) => {
                          const own = c.authorId === user?.id
                          return (
                            <CommentItem key={c.id} $own={own}>
                              <CommentMeta>
                                <CommentAuthor>{c.author?.name ?? 'Usuário'}</CommentAuthor>
                                <span>{new Date(c.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                              </CommentMeta>
                              <CommentText>{c.content}</CommentText>
                            </CommentItem>
                          )
                        })
                      )}
                      <CommentComposer onSubmit={sendComment}>
                        <ComposerInput value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Escreva um comentário…" />
                        <SendBtn type="submit" disabled={sendingComment || !commentText.trim()}><SendHorizonal /></SendBtn>
                      </CommentComposer>
                    </CommentsWrap>
                  </DetailSection>
                </DetailBody>

                {/* Ações */}
                {task.status === 'CLIENT_REVIEW' && (
                  <DetailFooter>
                    <Button data-variant="ghost" data-size="md" type="button" onClick={requestChanges} disabled={requestingChanges}>
                      Solicitar Ajustes
                    </Button>
                    <Button data-variant="primary" data-size="md" type="button" onClick={approve}>
                      <CheckCircle2 size={16} /> Aprovar
                    </Button>
                  </DetailFooter>
                )}
              </>
            )}
          </Panel>
        </RightCol>
      </SplitLayout>

      {/* Assets do projeto */}
      <Panel>
        <PanelHead>
          <PanelTitle><LinkIcon />Arquivos e links do Projeto</PanelTitle>
        </PanelHead>
        {((project?.assets ?? []) as Asset[]).length === 0 ? (
          <Empty>Nenhum arquivo/link cadastrado ainda.</Empty>
        ) : (
          <Chips>
            {(project!.assets as Asset[]).map((a) => (
              <Chip key={a.id} href={a.url} target="_blank" rel="noreferrer"><LinkIcon />{a.name}</Chip>
            ))}
          </Chips>
        )}
      </Panel>
    </Grid>
  )
}
