import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '@/app/providers/AuthContext'
import { projectsService } from '@/shared/services/projects.service'
import { tasksService } from '@/shared/services/tasks.service'
import { usersService } from '@/shared/services/users.service'
import type { Project, Task, TaskPriority, TaskStatus } from '@/shared/types'
import { Select } from '@/shared/components/ui/Select'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { KanbanBoard } from './components/KanbanBoard'
import { TaskDetailsModal } from './components/TaskDetailsModal'
import { Plus, ChevronDown } from 'lucide-react'

const ALL_PROJECTS = '__all__'

const PageLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
`

/* ── Top Bar ───────────────────────────── */
const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`

const ProjectPicker = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const PickerLabel = styled.span`
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textLight};
  white-space: nowrap;
`

const PickerSelect = styled(Select)`
  width: auto;
  min-width: 200px;
  max-width: 320px;
`

const AddBtn = styled(Button)``

/* ── Collapsible form ───────────────────── */
const FormCard = styled.div<{ $open: boolean }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  overflow: hidden;
  display: ${({ $open }) => $open ? 'block' : 'none'};
`

const FormInner = styled.form`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 0.8fr auto;
  gap: 12px;
  padding: 16px 20px;
  align-items: end;

  @media (max-width: 900px) { grid-template-columns: 1fr; }
`

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const Label = styled.label`
  font-size: ${({ theme }) => theme.font.xs};
  font-weight: ${({ theme }) => theme.weights.medium};
  color: ${({ theme }) => theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

const Textarea = styled.textarea`
  width: 100%;
  min-height: 84px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textDark};
  outline: none;
  resize: vertical;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.sm};
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
`

const AssignBox = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 10px;
`

const AssignItem = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
`

function parseLabels(text: string): string[] {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/* ── Board wrapper ───────────────────────── */
const BoardWrap = styled.div`
  flex: 1;
  overflow-x: auto;
  overflow-y: visible;
  padding-bottom: 8px;
`

const NotAllowed = styled.div`
  padding: 40px;
  text-align: center;
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`

export function KanbanPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const canUse = user?.role !== 'CLIENTE'
  const loc = useLocation()
  const nav = useNavigate()

  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState<string>(ALL_PROJECTS)
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; role: string }>>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [labelsText, setLabelsText] = useState('')
  const [assigneeIds, setAssigneeIds] = useState<string[]>([])
  const [creating, setCreating] = useState(false)

  const [openTaskId, setOpenTaskId] = useState<string | null>(null)

  // deep-link: /kanban?task=<taskId>
  useEffect(() => {
    const sp = new URLSearchParams(loc.search)
    const tid = sp.get('task')
    if (tid) setOpenTaskId(tid)
  }, [loc.search])

  const selectedProject = useMemo(() => projects.find((p) => p.id === projectId) ?? null, [projects, projectId])
  void selectedProject // used to future label display

  const projectMetaById = useMemo(() => {
    const m: Record<string, { projectTitle: string; clientName: string }> = {}
    for (const p of projects) {
      m[p.id] = { projectTitle: p.title, clientName: p.client?.name ?? '—' }
    }
    return m
  }, [projects])

  const loadProjects = async () => {
    const p = await projectsService.list().catch(() => [] as Project[])
    setProjects(p)
    // default stays as ALL_PROJECTS
  }

  const loadUsers = async () => {
    const u = await usersService.list().catch(() => [] as any[])
    setUsers(u)
  }

  const loadAllTasks = async () => {
    setLoading(true)
    try {
      const p = await projectsService.list().catch(() => [] as Project[])
      setProjects(p)
      const flat = p.flatMap((proj) => proj.tasks ?? [])
      setTasks(flat)
    } finally {
      setLoading(false)
    }
  }

  const loadTasks = async (id: string) => {
    setLoading(true)
    try { setTasks(await tasksService.listByProject(id)) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (canUse) { void loadProjects(); void loadUsers() } }, [canUse]) // eslint-disable-line
  useEffect(() => {
    if (!projectId) return
    if (projectId === ALL_PROJECTS) void loadAllTasks()
    else void loadTasks(projectId)
  }, [projectId])

  const moveTask = async (taskId: string, toStatus: TaskStatus) => {
    const prev = tasks
    setTasks((cur) => cur.map((t) => (t.id === taskId ? { ...t, status: toStatus } : t)))
    try { await tasksService.update(taskId, { status: toStatus }) }
    catch { setTasks(prev) }
  }

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin || !projectId || projectId === ALL_PROJECTS) return
    setCreating(true)
    try {
      const created = await tasksService.create({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        projectId,
        dueDate: dueDate ? dueDate : undefined,
        labels: parseLabels(labelsText),
        assigneeIds,
      })
      setTasks((cur) => [created, ...cur])
      setTitle(''); setDescription(''); setPriority('MEDIUM'); setDueDate(''); setLabelsText(''); setAssigneeIds([])
      setFormOpen(false)
    } finally { setCreating(false) }
  }

  if (!canUse) return <NotAllowed>Kanban disponível apenas para Admin e Colaborador.</NotAllowed>

  return (
    <PageLayout>
      <TopBar>
        <ProjectPicker>
          <PickerLabel>Projeto:</PickerLabel>
          <PickerSelect value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value={ALL_PROJECTS}>Todos os projetos</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </PickerSelect>
        </ProjectPicker>

        {isAdmin && (
          <AddBtn
            data-variant="primary"
            data-size="sm"
            onClick={() => setFormOpen((v) => !v)}
            disabled={projectId === ALL_PROJECTS}
          >
            <Plus style={{ width: 15, height: 15 }} />
            Nova tarefa
            <ChevronDown style={{ width: 14, height: 14, transition: '0.2s', transform: formOpen ? 'rotate(180deg)' : 'none' }} />
          </AddBtn>
        )}
      </TopBar>

      {isAdmin && (
        <FormCard $open={formOpen}>
          <FormInner onSubmit={createTask}>
            <FieldGroup>
              <Label>Título da tarefa</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="O que precisa ser feito?" required />
            </FieldGroup>
            <FieldGroup>
              <Label>Nível (prioridade)</Label>
              <Select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <Label>Prazo</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </FieldGroup>
            <Button data-variant="primary" data-size="md" data-loading={creating ? 'true' : 'false'} disabled={creating}>
              {creating ? 'Criando…' : 'Criar'}
            </Button>

            <FieldGroup style={{ gridColumn: '1 / -1' }}>
              <Label>Descrição</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes do que precisa ser feito…" />
            </FieldGroup>

            <FieldGroup style={{ gridColumn: '1 / -1' }}>
              <Label>Labels (separadas por vírgula)</Label>
              <Input value={labelsText} onChange={(e) => setLabelsText(e.target.value)} placeholder="ex.: design, urgente" />
            </FieldGroup>

            <FieldGroup style={{ gridColumn: '1 / -1' }}>
              <Label>Quem vai fazer (colaboradores)</Label>
              <AssignBox>
                {users
                  .filter((u) => u.role === 'COLABORADOR')
                  .map((u) => (
                    <AssignItem key={u.id}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                        <div style={{ fontSize: 12, opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={assigneeIds.includes(u.id)}
                        onChange={() => setAssigneeIds((cur) => (cur.includes(u.id) ? cur.filter((x) => x !== u.id) : [...cur, u.id]))}
                        aria-label={`Atribuir ${u.name}`}
                      />
                    </AssignItem>
                  ))}
              </AssignBox>
            </FieldGroup>
          </FormInner>
        </FormCard>
      )}

      <BoardWrap>
        {loading
          ? <NotAllowed>Carregando tarefas…</NotAllowed>
          : <KanbanBoard
              tasks={tasks}
              onMoveTask={moveTask}
              onOpenTask={(id) => setOpenTaskId(id)}
              projectMetaById={projectMetaById}
            />
        }
      </BoardWrap>

      <TaskDetailsModal
        open={Boolean(openTaskId)}
        taskId={openTaskId}
        onClose={() => {
          setOpenTaskId(null)
          const sp = new URLSearchParams(loc.search)
          if (sp.has('task')) {
            sp.delete('task')
            const next = sp.toString()
            nav({ pathname: loc.pathname, search: next ? `?${next}` : '' }, { replace: true })
          }
        }}
        onTaskUpdated={(updated) => setTasks((cur) => cur.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)))}
      />
    </PageLayout>
  )
}
