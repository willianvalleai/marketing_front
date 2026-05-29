import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '@/app/providers/AuthContext'
import { tasksService } from '@/shared/services/tasks.service'
import { usersService } from '@/shared/services/users.service'
import { getErrorMessage } from '@/shared/services/api'
import type { ChecklistItem, Task, TaskDetails, TaskPriority, TaskStatus, User } from '@/shared/types'
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

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM')
  const [status, setStatus] = useState<TaskStatus>('TODO')
  const [dueDate, setDueDate] = useState('')
  const [labelsText, setLabelsText] = useState('')
  const [assigneeIds, setAssigneeIds] = useState<string[]>([])

  const canInteract = user?.role !== 'CLIENTE'

  const assigneesDonePct = useMemo(() => {
    if (!details?.assignees?.length) return null
    const done = details.assignees.filter((a) => Boolean(a.doneAt)).length
    return Math.round((done / details.assignees.length) * 100)
  }, [details?.assignees])

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
      setLabelsText((d.labels ?? []).join(', '))
      setAssigneeIds((d.assignees ?? []).map((a) => a.userId))
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

                <Field style={{ flex: 1, minWidth: 200 }}>
                  <FieldLabel>Labels (separadas por vírgula)</FieldLabel>
                  <Input value={labelsText} onChange={(e) => setLabelsText(e.target.value)} disabled={!isAdmin} placeholder="ex.: design, urgente" />
                </Field>
              </Inline>

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
        </Grid>
      )}
    </Modal>
  )
}

