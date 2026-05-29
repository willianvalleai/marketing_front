import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '@/app/providers/AuthContext'
import { tasksService } from '@/shared/services/tasks.service'
import { usersService } from '@/shared/services/users.service'
import { timeLogsService } from '@/shared/services/time-logs.service'
import { milestonesService } from '@/shared/services/milestones.service'
import { getErrorMessage } from '@/shared/services/api'
import type { ChecklistItem, Milestone, Task, TaskDetails, TaskPriority, TaskStatus, TimeLog, User } from '@/shared/types'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { Modal } from '@/shared/components/ui/Modal'

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`

const Section = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bg};
`

const SectionHeader = styled.div`
  padding: 12px 14px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
`

const SectionBody = styled.div`
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const FieldLabel = styled.label`
  font-size: ${({ theme }) => theme.font.xs};
  font-weight: ${({ theme }) => theme.weights.medium};
  color: ${({ theme }) => theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

const Textarea = styled.textarea`
  width: 100%;
  min-height: 110px;
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

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`

const Muted = styled.div`
  font-size: ${({ theme }) => theme.font.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`

const Inline = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
`

function toDateInputValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function parseLabels(text: string): string[] {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function TaskDetailsModal({
  open,
  taskId,
  onClose,
  onTaskUpdated,
}: {
  open: boolean
  taskId: string | null
  onClose: () => void
  onTaskUpdated: (updated: Task) => void
}) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [details, setDetails] = useState<TaskDetails | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM')
  const [status, setStatus] = useState<TaskStatus>('TODO')
  const [dueDate, setDueDate] = useState('')
  const [alertDaysBefore, setAlertDaysBefore] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [milestoneId, setMilestoneId] = useState('')
  const [requiredApprovals, setRequiredApprovals] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringPattern, setRecurringPattern] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY')
  const [labelsText, setLabelsText] = useState('')
  const [assigneeIds, setAssigneeIds] = useState<string[]>([])

  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [newLogHours, setNewLogHours] = useState('')
  const [newLogDesc, setNewLogDesc] = useState('')
  const [newLogDate, setNewLogDate] = useState(() => new Date().toISOString().split('T')[0])
  const [savingLog, setSavingLog] = useState(false)
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const [editLogHours, setEditLogHours] = useState('')
  const [editLogDesc, setEditLogDesc] = useState('')
  const [editLogDate, setEditLogDate] = useState('')
  const [savingEditLog, setSavingEditLog] = useState(false)

  const canInteract = user?.role !== 'CLIENTE'

  const assigneesDonePct = useMemo(() => {
    if (!details?.assignees?.length) return null
    const done = details.assignees.filter((a) => Boolean(a.doneAt)).length
    return Math.round((done / details.assignees.length) * 100)
  }, [details?.assignees])

  const totalWorkedHours = useMemo(() => {
    return timeLogs.reduce((sum, log) => sum + log.hours, 0)
  }, [timeLogs])

  const load = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const [d, u] = await Promise.all([
        tasksService.get(id),
        usersService.list().catch(() => [] as User[]),
      ])
      setDetails(d)
      setUsers(u)
      setTitle(d.title ?? '')
      setDescription(d.description ?? '')
      setPriority(d.priority)
      setStatus(d.status)
      setDueDate(toDateInputValue(d.dueDate))
      setAlertDaysBefore(d.alertDaysBefore?.toString() ?? '')
      setEstimatedHours(d.estimatedHours?.toString() ?? '')
      setMilestoneId(d.milestoneId ?? '')
      setRequiredApprovals(d.requiredApprovals?.toString() ?? '')
      setIsRecurring(d.isRecurring ?? false)
      setRecurringPattern(d.recurringPattern ?? 'WEEKLY')
      setLabelsText((d.labels ?? []).join(', '))
      setAssigneeIds((d.assignees ?? []).map((a) => a.userId))
      
      // Carregar milestones e time logs de forma independente
      const [milestonesResult, logsResult] = await Promise.allSettled([
        milestonesService.listByProject(d.projectId),
        timeLogsService.listByTask(id),
      ])
      setMilestones(milestonesResult.status === 'fulfilled' ? milestonesResult.value : [])
      setTimeLogs(logsResult.status === 'fulfilled' ? logsResult.value : [])
    } catch (err) {
      setError(getErrorMessage(err, 'Falha ao carregar detalhes da tarefa.'))
      setDetails(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open || !taskId) return
    void load(taskId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, taskId])

  const toggleAssignee = (id: string) => {
    setAssigneeIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
  }

  const save = async () => {
    if (!taskId || !details) return
    setSaving(true)
    setError(null)
    try {
      const updated = await tasksService.update(taskId, {
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        priority,
        status,
        dueDate: dueDate ? dueDate : null,
        alertDaysBefore: alertDaysBefore ? parseInt(alertDaysBefore) : null,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        milestoneId: milestoneId || null,
        requiredApprovals: requiredApprovals ? parseInt(requiredApprovals) : null,
        isRecurring: isRecurring,
        recurringPattern: isRecurring ? recurringPattern : null,
        labels: parseLabels(labelsText),
        assigneeIds: isAdmin ? assigneeIds : undefined,
      })

      onTaskUpdated(updated)
      await load(taskId)
    } catch (err) {
      setError(getErrorMessage(err, 'Falha ao salvar a tarefa.'))
    } finally {
      setSaving(false)
    }
  }

  const addTimeLog = async () => {
    if (!taskId || !newLogHours) return
    setSavingLog(true)
    const today = new Date().toISOString().split('T')[0]
    try {
      const created = await timeLogsService.create({
        taskId,
        hours: parseFloat(newLogHours),
        description: newLogDesc.trim() || undefined,
        date: newLogDate || today
      })
      setTimeLogs((cur) => [...cur, created])
      setNewLogHours('')
      setNewLogDesc('')
      setNewLogDate(new Date().toISOString().split('T')[0])
    } catch (err) {
      console.error('Erro ao adicionar time log:', err)
    } finally {
      setSavingLog(false)
    }
  }

  const removeTimeLog = async (logId: string) => {
    if (!confirm('Remover este registro de horas?')) return
    try {
      await timeLogsService.remove(logId)
      setTimeLogs((cur) => cur.filter((log) => log.id !== logId))
    } catch (err) {
      console.error('Erro ao remover time log:', err)
    }
  }

  const startEditLog = (log: TimeLog) => {
    setEditingLogId(log.id)
    setEditLogHours(log.hours.toString())
    setEditLogDesc(log.description ?? '')
    setEditLogDate(log.logDate ? log.logDate.split('T')[0] : new Date().toISOString().split('T')[0])
  }

  const cancelEditLog = () => {
    setEditingLogId(null)
    setEditLogHours('')
    setEditLogDesc('')
    setEditLogDate('')
  }

  const saveEditLog = async (logId: string) => {
    if (!editLogHours) return
    setSavingEditLog(true)
    try {
      const updated = await timeLogsService.update(logId, {
        hours: parseFloat(editLogHours),
        description: editLogDesc.trim() || null,
        logDate: editLogDate || undefined,
      })
      setTimeLogs((cur) => cur.map((log) => log.id === logId ? updated : log))
      cancelEditLog()
    } catch (err) {
      console.error('Erro ao editar time log:', err)
    } finally {
      setSavingEditLog(false)
    }
  }

  const addChecklist = async (text: string) => {
    if (!taskId || !text.trim()) return
    const created = await tasksService.addChecklistItem(taskId, text.trim())
    setDetails((cur) => (cur ? { ...cur, checklistItems: [...cur.checklistItems, created] } : cur))
  }

  const toggleChecklist = async (item: ChecklistItem) => {
    if (!taskId) return
    const updated = await tasksService.updateChecklistItem(taskId, item.id, { done: !item.done })
    setDetails((cur) => {
      if (!cur) return cur
      return { ...cur, checklistItems: cur.checklistItems.map((i) => (i.id === item.id ? updated : i)) }
    })
  }

  const removeChecklist = async (itemId: string) => {
    if (!taskId) return
    await tasksService.removeChecklistItem(taskId, itemId)
    setDetails((cur) => (cur ? { ...cur, checklistItems: cur.checklistItems.filter((i) => i.id !== itemId) } : cur))
  }

  const addComment = async (content: string) => {
    if (!taskId || !content.trim()) return
    const created = await tasksService.addComment(taskId, content.trim())
    setDetails((cur) => (cur ? { ...cur, comments: [...cur.comments, created] } : cur))
  }

  const markMyPart = async (done?: boolean) => {
    if (!taskId || !user?.id) return
    const updated = await tasksService.setAssigneeDone(taskId, user.id, done)
    setDetails((cur) => {
      if (!cur) return cur
      return {
        ...cur,
        assignees: cur.assignees.map((a) => (a.userId === updated.userId ? updated : a)),
      }
    })
  }

  const [newChecklistText, setNewChecklistText] = useState('')
  const [newComment, setNewComment] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectMessage, setRejectMessage] = useState('')

  const submitForReview = async () => {
    if (!taskId) return
    setActionLoading(true)
    try {
      await tasksService.submitForInternalReview(taskId)
      await load(taskId)
    } catch (err) {
      alert(getErrorMessage(err, 'Erro ao enviar para revisão'))
    } finally {
      setActionLoading(false)
    }
  }

  const approveInternal = async () => {
    if (!taskId) return
    setActionLoading(true)
    try {
      await tasksService.approveInternal(taskId)
      await load(taskId)
    } catch (err) {
      alert(getErrorMessage(err, 'Erro ao aprovar'))
    } finally {
      setActionLoading(false)
    }
  }

  const rejectInternal = async () => {
    if (!taskId) return
    const msg = rejectMessage.trim() || prompt('Motivo da rejeição:')
    if (!msg) {
      alert('Mensagem é obrigatória')
      return
    }
    setActionLoading(true)
    try {
      await tasksService.rejectInternal(taskId, msg)
      await load(taskId)
      setRejectMessage('')
    } catch (err) {
      alert(getErrorMessage(err, 'Erro ao rejeitar'))
    } finally {
      setActionLoading(false)
    }
  }

  const approveClient = async () => {
    if (!taskId) return
    setActionLoading(true)
    try {
      await tasksService.approveClient(taskId)
      await load(taskId)
    } catch (err) {
      alert(getErrorMessage(err, 'Erro ao aprovar'))
    } finally {
      setActionLoading(false)
    }
  }

  const requestChangesClient = async () => {
    if (!taskId) return
    const msg = prompt('Descreva as mudanças necessárias:')
    if (!msg?.trim()) {
      alert('Mensagem é obrigatória')
      return
    }
    setActionLoading(true)
    try {
      await tasksService.requestChangesClient(taskId, msg.trim())
      await load(taskId)
    } catch (err) {
      alert(getErrorMessage(err, 'Erro ao solicitar mudanças'))
    } finally {
      setActionLoading(false)
    }
  }

  const getActionButtons = () => {
    const buttons = []
    
    // Botão fechar sempre presente
    buttons.push(
      <Button key="close" data-variant="ghost" data-size="md" onClick={onClose} type="button">
        Fechar
      </Button>
    )

    if (!details) return buttons

    // Colaborador/Admin pode enviar para revisão interna
    if ((user?.role === 'COLABORADOR' || user?.role === 'ADMIN') && 
        (details.status === 'TODO' || details.status === 'IN_PROGRESS' || details.status === 'CHANGES_REQUESTED')) {
      buttons.push(
        <Button 
          key="submit-review" 
          data-variant="primary" 
          data-size="md" 
          onClick={submitForReview}
          disabled={actionLoading}
          type="button"
        >
          Enviar para Revisão
        </Button>
      )
    }

    // Admin pode aprovar internamente
    if (user?.role === 'ADMIN' && details.status === 'INTERNAL_REVIEW') {
      buttons.push(
        <Button 
          key="reject-internal" 
          data-variant="ghost" 
          data-size="md" 
          onClick={rejectInternal}
          disabled={actionLoading}
          type="button"
        >
          Rejeitar
        </Button>,
        <Button 
          key="approve-internal" 
          data-variant="primary" 
          data-size="md" 
          onClick={approveInternal}
          disabled={actionLoading}
          type="button"
        >
          Aprovar e Enviar ao Cliente
        </Button>
      )
    }

    // Cliente pode aprovar ou solicitar mudanças
    if (user?.role === 'CLIENTE' && details.status === 'CLIENT_REVIEW') {
      buttons.push(
        <Button 
          key="request-changes" 
          data-variant="ghost" 
          data-size="md" 
          onClick={requestChangesClient}
          disabled={actionLoading}
          type="button"
        >
          Solicitar Mudanças
        </Button>,
        <Button 
          key="approve-client" 
          data-variant="primary" 
          data-size="md" 
          onClick={approveClient}
          disabled={actionLoading}
          type="button"
        >
          Aprovar
        </Button>
      )
    }

    // Botão salvar para admin em status não finais
    if (isAdmin && details.status !== 'DONE') {
      buttons.push(
        <Button
          key="save"
          data-variant="primary"
          data-size="md"
          onClick={save}
          disabled={saving || loading || actionLoading}
          data-loading={saving ? 'true' : 'false'}
          type="button"
        >
          {saving ? 'Salvando…' : 'Salvar'}
        </Button>
      )
    }

    return buttons
  }

  const footer = <>{getActionButtons()}</>

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={taskId ? 'Detalhes da tarefa' : 'Detalhes'}
      footer={footer}
    >
      {loading && <Muted>Carregando…</Muted>}
      {error && <Muted style={{ color: '#b91c1c' }}>{error}</Muted>}

      {details && (
        <Grid>
          <Section>
            <SectionHeader>Resumo</SectionHeader>
            <SectionBody>
              <Field>
                <FieldLabel>Título</FieldLabel>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={!isAdmin} />
              </Field>

              <Inline>
                <Field style={{ flex: 1, minWidth: 200 }}>
                  <FieldLabel>Status</FieldLabel>
                  <Select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} disabled={!isAdmin}>
                    <option value="TODO">A fazer</option>
                    <option value="IN_PROGRESS">Em progresso</option>
                    <option value="INTERNAL_REVIEW">Revisão Interna</option>
                    <option value="CHANGES_REQUESTED">Mudanças Solicitadas</option>
                    <option value="CLIENT_REVIEW">Revisão do Cliente</option>
                    <option value="DONE">Concluído</option>
                  </Select>
                </Field>

                <Field style={{ flex: 1, minWidth: 200 }}>
                  <FieldLabel>Nível (prioridade)</FieldLabel>
                  <Select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} disabled={!isAdmin}>
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                  </Select>
                </Field>
              </Inline>

              <Inline>
                <Field style={{ flex: 1, minWidth: 200 }}>
                  <FieldLabel>Prazo</FieldLabel>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={!isAdmin} />
                </Field>

                <Field style={{ flex: 1, minWidth: 150 }}>
                  <FieldLabel>Alertar (dias antes)</FieldLabel>
                  <Input 
                    type="number" 
                    min="1" 
                    value={alertDaysBefore} 
                    onChange={(e) => setAlertDaysBefore(e.target.value)} 
                    disabled={!isAdmin} 
                    placeholder="Ex: 3" 
                  />
                </Field>

                <Field style={{ flex: 1, minWidth: 200 }}>
                  <FieldLabel>Labels (separadas por vírgula)</FieldLabel>
                  <Input value={labelsText} onChange={(e) => setLabelsText(e.target.value)} disabled={!isAdmin} placeholder="ex.: design, urgente" />
                </Field>
              </Inline>

              {milestones.length > 0 && (
                <Field>
                  <FieldLabel>Milestone/Fase</FieldLabel>
                  <Select value={milestoneId} onChange={(e) => setMilestoneId(e.target.value)} disabled={!isAdmin}>
                    <option value="">Nenhum</option>
                    {milestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title} ({m.status === 'PENDING' ? 'Pendente' : m.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Concluído'})
                      </option>
                    ))}
                  </Select>
                </Field>
              )}

              <Inline>
                <Field style={{ flex: 1, minWidth: 150 }}>
                  <FieldLabel>Horas Estimadas</FieldLabel>
                  <Input 
                    type="number" 
                    step="0.5"
                    min="0" 
                    value={estimatedHours} 
                    onChange={(e) => setEstimatedHours(e.target.value)} 
                    disabled={!isAdmin} 
                    placeholder="Ex: 8" 
                  />
                </Field>

                <Field style={{ flex: 1, minWidth: 150 }}>
                  <FieldLabel>Aprovações Necessárias</FieldLabel>
                  <Input 
                    type="number" 
                    min="0" 
                    value={requiredApprovals} 
                    onChange={(e) => setRequiredApprovals(e.target.value)} 
                    disabled={!isAdmin} 
                    placeholder="Ex: 2" 
                  />
                </Field>
              </Inline>

              <Field>
                <FieldLabel style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input 
                    type="checkbox" 
                    checked={isRecurring} 
                    onChange={(e) => setIsRecurring(e.target.checked)} 
                    disabled={!isAdmin}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  Tarefa Recorrente
                </FieldLabel>
                {isRecurring && (
                  <Select 
                    value={recurringPattern} 
                    onChange={(e) => setRecurringPattern(e.target.value as any)} 
                    disabled={!isAdmin}
                    style={{ marginTop: 8 }}
                  >
                    <option value="DAILY">Diariamente</option>
                    <option value="WEEKLY">Semanalmente</option>
                    <option value="MONTHLY">Mensalmente</option>
                  </Select>
                )}
              </Field>

              <Field>
                <FieldLabel>Descrição</FieldLabel>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={!isAdmin} placeholder="Detalhes do que precisa ser feito…" />
              </Field>
            </SectionBody>
          </Section>

          <Section>
            <SectionHeader>Colaboradores {assigneesDonePct !== null ? `(${assigneesDonePct}%)` : ''}</SectionHeader>
            <SectionBody>
              {details.assignees.length === 0 ? (
                <Muted>Nenhum colaborador atribuído.</Muted>
              ) : (
                <List>
                  {details.assignees.map((a) => (
                    <Row key={a.userId}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.user?.name ?? 'Usuário'}</div>
                        <Muted>{a.doneAt ? 'Concluído' : 'Em aberto'}</Muted>
                      </div>
                      {user?.id === a.userId && (
                        <Button
                          data-variant={a.doneAt ? 'ghost' : 'primary'}
                          data-size="sm"
                          onClick={() => void markMyPart(a.doneAt ? false : true)}
                          type="button"
                        >
                          {a.doneAt ? 'Reabrir minha parte' : 'Concluir minha parte'}
                        </Button>
                      )}
                    </Row>
                  ))}
                </List>
              )}

              {isAdmin && (
                <div>
                  <FieldLabel style={{ marginBottom: 8 }}>Atribuir colaboradores</FieldLabel>
                  <List>
                    {users
                      .filter((u) => u.role === 'COLABORADOR')
                      .map((u) => (
                        <Row key={u.id}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{u.name}</div>
                            <Muted>{u.email}</Muted>
                          </div>
                          <input
                            type="checkbox"
                            checked={assigneeIds.includes(u.id)}
                            onChange={() => toggleAssignee(u.id)}
                            aria-label={`Atribuir ${u.name}`}
                          />
                        </Row>
                      ))}
                  </List>
                </div>
              )}
            </SectionBody>
          </Section>

          <Section>
            <SectionHeader>Checklist</SectionHeader>
            <SectionBody>
              {details.checklistItems.length === 0 ? <Muted>Sem checklist ainda.</Muted> : (
                <List>
                  {details.checklistItems.map((i) => (
                    <Row key={i.id}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                        <input type="checkbox" checked={i.done} onChange={() => void toggleChecklist(i)} />
                        <span style={{ textDecoration: i.done ? 'line-through' : 'none' }}>{i.text}</span>
                      </label>
                      {isAdmin && (
                        <Button data-variant="ghost" data-size="sm" onClick={() => void removeChecklist(i.id)} type="button">
                          Remover
                        </Button>
                      )}
                    </Row>
                  ))}
                </List>
              )}

              <Inline>
                <Input
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  placeholder="Adicionar item…"
                />
                <Button
                  data-variant="primary"
                  data-size="sm"
                  onClick={() => {
                    const v = newChecklistText
                    setNewChecklistText('')
                    void addChecklist(v)
                  }}
                  type="button"
                >
                  Adicionar
                </Button>
              </Inline>
            </SectionBody>
          </Section>

          <Section>
            <SectionHeader>Comentários</SectionHeader>
            <SectionBody>
              {details.comments.length === 0 ? <Muted>Nenhum comentário ainda.</Muted> : (
                <List>
                  {details.comments.map((c) => (
                    <Row key={c.id} style={{ alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                          <div style={{ fontWeight: 700 }}>{c.author?.name ?? 'Usuário'}</div>
                          <Muted>{new Date(c.createdAt).toLocaleString('pt-BR')}</Muted>
                        </div>
                        <div style={{ marginTop: 6 }}>{c.content}</div>
                      </div>
                    </Row>
                  ))}
                </List>
              )}

              <Field>
                <FieldLabel>Novo comentário</FieldLabel>
                <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Escreva um comentário…" />
                <Button
                  data-variant="primary"
                  data-size="sm"
                  onClick={() => {
                    const v = newComment
                    setNewComment('')
                    void addComment(v)
                  }}
                  type="button"
                >
                  Enviar
                </Button>
              </Field>
            </SectionBody>
          </Section>

          {canInteract && (
            <Section>
              <SectionHeader>
                Registro de Horas
                {details.estimatedHours && (
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'normal' }}>
                    {totalWorkedHours.toFixed(1)}h / {details.estimatedHours}h estimadas
                  </span>
                )}
              </SectionHeader>
              <SectionBody>
                {timeLogs.length === 0 ? <Muted>Nenhum registro ainda.</Muted> : (
                  <List>
                    {timeLogs.map((log) => (
                      <Row key={log.id} style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 8 }}>
                        {editingLogId === log.id ? (
                          <div style={{ width: '100%', display: 'grid', gap: 8 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 130px', gap: 8 }}>
                              <Input
                                type="number"
                                step="0.5"
                                min="0"
                                value={editLogHours}
                                onChange={(e) => setEditLogHours(e.target.value)}
                                placeholder="Horas"
                              />
                              <Input
                                value={editLogDesc}
                                onChange={(e) => setEditLogDesc(e.target.value)}
                                placeholder="Descrição (opcional)"
                              />
                              <Input
                                type="date"
                                value={editLogDate}
                                onChange={(e) => setEditLogDate(e.target.value)}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Button
                                data-variant="primary"
                                data-size="sm"
                                type="button"
                                onClick={() => void saveEditLog(log.id)}
                                disabled={!editLogHours || savingEditLog}
                                data-loading={savingEditLog ? 'true' : 'false'}
                              >
                                Salvar
                              </Button>
                              <Button
                                data-variant="ghost"
                                data-size="sm"
                                type="button"
                                onClick={cancelEditLog}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                                <div style={{ fontWeight: 700 }}>
                                  {log.hours}h — {log.user?.name ?? 'Usuário'}
                                </div>
                                <Muted>{new Date(log.logDate).toLocaleDateString('pt-BR')}</Muted>
                              </div>
                              {log.description && (
                                <div style={{ marginTop: 4, fontSize: '13px', color: '#6b7280' }}>{log.description}</div>
                              )}
                            </div>
                            {(isAdmin || user?.id === log.userId) && (
                              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                <Button
                                  data-variant="ghost"
                                  data-size="sm"
                                  type="button"
                                  onClick={() => startEditLog(log)}
                                >
                                  Editar
                                </Button>
                                <Button
                                  data-variant="ghost"
                                  data-size="sm"
                                  type="button"
                                  onClick={() => void removeTimeLog(log.id)}
                                  style={{ color: '#ef4444' }}
                                >
                                  Remover
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </Row>
                    ))}
                  </List>
                )}

                <Field>
                  <FieldLabel>Registrar Horas Trabalhadas</FieldLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 8 }}>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      value={newLogHours}
                      onChange={(e) => setNewLogHours(e.target.value)}
                      placeholder="Ex: 3.5"
                    />
                    <Input
                      value={newLogDesc}
                      onChange={(e) => setNewLogDesc(e.target.value)}
                      placeholder="Descrição (opcional)"
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Data do trabalho
                        </span>
                        <span
                          title="Informe o dia em que você trabalhou. Útil para registrar horas de dias anteriores. Por padrão, usa a data de hoje."
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: '#e5e7eb',
                            color: '#6b7280',
                            fontSize: 10,
                            fontWeight: 700,
                            cursor: 'help',
                            flexShrink: 0,
                          }}
                        >
                          ?
                        </span>
                      </div>
                      <Input
                        type="date"
                        value={newLogDate}
                        onChange={(e) => setNewLogDate(e.target.value)}
                      />
                    </div>
                    <Button
                      data-variant="primary"
                      data-size="sm"
                      onClick={() => void addTimeLog()}
                      type="button"
                      disabled={!newLogHours || savingLog}
                      data-loading={savingLog ? 'true' : 'false'}
                      style={{ alignSelf: 'flex-end' }}
                    >
                      Adicionar
                    </Button>
                  </div>
                </Field>
              </SectionBody>
            </Section>
          )}
        </Grid>
      )}
    </Modal>
  )
}

