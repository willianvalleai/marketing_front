import { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '@/app/providers/AuthContext'
import { tasksService } from '@/shared/services/tasks.service'
import { usersService } from '@/shared/services/users.service'
import { timeLogsService } from '@/shared/services/time-logs.service'
import { getErrorMessage } from '@/shared/services/api'
import type { ChecklistItem, Task, TaskDetails, TaskPriority, TaskStatus, TimeLog, User } from '@/shared/types'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { Modal } from '@/shared/components/ui/Modal'
import { MessageSquare } from 'lucide-react'

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`

const Section = styled.div`
  border-radius: 12px;
  overflow: hidden;
  background: rgba(25, 25, 25, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
`

const SectionHeader = styled.div`
  padding: 16px 20px;
  background: rgba(18, 18, 18, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #e2e2e2;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const SectionBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const FieldLabel = styled.label`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: #8b90a0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

const CollaboratorAvatar = styled.div<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  flex-shrink: 0;
`

const CollaboratorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(35, 35, 35, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(45, 45, 45, 0.4);
    border-color: rgba(255, 255, 255, 0.1);
  }
`

const CollaboratorInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const CollaboratorName = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #e2e2e2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const CollaboratorStatus = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 10px;
  color: #8b90a0;
  margin-top: 2px;
`

const SectorTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 9999px;
  background: rgba(143, 216, 255, 0.1);
  border: 1px solid rgba(143, 216, 255, 0.2);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: #8fd8ff;
  white-space: nowrap;
`

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #6366f1;
`

const CommentCard = styled.div`
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: 8px;
  background: rgba(35, 35, 35, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(45, 45, 45, 0.4);
    border-color: rgba(255, 255, 255, 0.1);
  }
`

const CommentContent = styled.div`
  flex: 1;
  min-width: 0;
`

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
`

const CommentAuthor = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #e2e2e2;
`

const CommentDate = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 10px;
  color: #8b90a0;
`

const CommentText = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 12px;
  color: #e2e2e2;
  line-height: 1.5;
  word-break: break-word;
`

const MentionHighlight = styled.span`
  color: #a5b4fc;
  font-weight: 600;
  cursor: default;
`

const MentionDropdown = styled.div`
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #1a1d27;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  z-index: 100;
  overflow: hidden;
  max-height: 180px;
  overflow-y: auto;
`

const MentionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #e2e8f0;
  transition: background 0.1s;
  &:hover { background: rgba(99,102,241,0.15); }
`

const CommentInputWrap = styled.div`
  position: relative;
`

const SubtaskItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  margin-bottom: 6px;
`

const SubtaskHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const SubtaskCheckbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  flex-shrink: 0;
`

const SubtaskTitle = styled.span<{ $done: boolean }>`
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: ${({ $done }) => $done ? '#94a3b8' : '#cbd5e1'};
  text-decoration: ${({ $done }) => $done ? 'line-through' : 'none'};
  flex: 1;
`

const SubtaskActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

const SubtaskCommentBtn = styled.button<{ $hasComments?: boolean }>`
  background: transparent;
  border: 1px solid ${({ $hasComments }) => $hasComments ? '#6366f1' : 'rgba(255,255,255,0.1)'};
  color: ${({ $hasComments }) => $hasComments ? '#a5b4fc' : '#64748b'};
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s;
  font-family: 'Inter', sans-serif;
  
  &:hover {
    border-color: #6366f1;
    color: #a5b4fc;
    background: rgba(99,102,241,0.08);
  }
`

const SubtaskCommentsSection = styled.div`
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const SubtaskComment = styled.div`
  font-size: 11px;
  padding: 6px 8px;
  background: rgba(255,255,255,0.02);
  border-radius: 6px;
  border-left: 2px solid #6366f1;
`

const SubtaskCommentAuthor = styled.div`
  font-weight: 600;
  color: #a5b4fc;
  margin-bottom: 2px;
  font-size: 10px;
`

const SubtaskCommentText = styled.div`
  color: #cbd5e1;
  line-height: 1.4;
`

const SubtaskCommentDate = styled.div`
  font-size: 9px;
  color: #64748b;
  margin-top: 2px;
`

const Textarea = styled.textarea`
  width: 100%;
  min-height: 110px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(35, 35, 35, 0.5);
  color: #e2e2e2;
  outline: none;
  resize: vertical;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 12px;
  transition: all 0.2s ease;
  
  &:focus { 
    border-color: rgba(143, 216, 255, 0.3);
    background: rgba(40, 40, 40, 0.6);
  }
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(35, 35, 35, 0.3);
  font-size: 12px;
`

const Muted = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 11px;
  color: #8b90a0;
`

const Inline = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
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

function getAvatarColor(name: string): string {
  const colors = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)', // roxo/azul
    'linear-gradient(135deg, #ec4899, #f472b6)', // rosa
    'linear-gradient(135deg, #3b82f6, #6366f1)', // azul
    'linear-gradient(135deg, #10b981, #06b6d4)', // verde/cyan
    'linear-gradient(135deg, #f59e0b, #f97316)', // laranja
    'linear-gradient(135deg, #ef4444, #f97316)', // vermelho
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
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
  const [alertDaysBefore, setAlertDaysBefore] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
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

  // Sub-tarefas
  const [expandedSubtaskId, setExpandedSubtaskId] = useState<string | null>(null)
  const [subtaskComments, setSubtaskComments] = useState<Record<string, any[]>>({})
  const [loadingSubtaskComments, setLoadingSubtaskComments] = useState<Record<string, boolean>>({})
  const [newSubtaskComment, setNewSubtaskComment] = useState<Record<string, string>>({})
  const [savingSubtaskComment, setSavingSubtaskComment] = useState<Record<string, boolean>>({})

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
      setRequiredApprovals(d.requiredApprovals?.toString() ?? '')
      setIsRecurring(d.isRecurring ?? false)
      setRecurringPattern(d.recurringPattern ?? 'WEEKLY')
      setLabelsText((d.labels ?? []).join(', '))
      setAssigneeIds((d.assignees ?? []).map((a) => a.userId))
      
      const logsResult = await timeLogsService.listByTask(id).catch(() => [] as TimeLog[])
      setTimeLogs(logsResult)
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
    if (commentVisibility === 'CLIENT_VISIBLE') {
      const confirmed = window.confirm('O cliente também verá essa mensagem. Deseja continuar?')
      if (!confirmed) return
    }
    const created = await tasksService.addComment(taskId, content.trim(), commentVisibility)
    setDetails((cur) => (cur ? { ...cur, comments: [...cur.comments, created] } : cur))
  }

  const createSubtask = async () => {
    if (!taskId || !newSubtaskTitle.trim() || !details) return
    setAddingSubtask(true)
    try {
      const created = await tasksService.create({
        title: newSubtaskTitle.trim(),
        projectId: details.projectId,
        priority: 'MEDIUM',
        subtaskParentId: taskId,
      })
      setDetails((cur) =>
        cur
          ? {
              ...cur,
              subtasks: [
                ...(cur.subtasks ?? []),
                { id: created.id, title: created.title, status: created.status, priority: created.priority, assignedToId: created.assignedToId, dueDate: created.dueDate },
              ],
            }
          : cur
      )
      setNewSubtaskTitle('')
    } catch (e) {
      console.error('Erro ao criar subtarefa', e)
    } finally {
      setAddingSubtask(false)
    }
  }

  const toggleSubtaskStatus = async (subtaskId: string, currentStatus: TaskStatus) => {
    const newStatus: TaskStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE'
    
    try {
      await tasksService.update(subtaskId, { status: newStatus })
      setDetails((cur) => {
        if (!cur) return cur
        return {
          ...cur,
          subtasks: (cur.subtasks ?? []).map((s) =>
            s.id === subtaskId ? { ...s, status: newStatus } : s
          ),
        }
      })
      // Notifica a tarefa pai para atualizar o badge
      if (details) {
        onTaskUpdated({ ...details, subtasks: details.subtasks?.map(s => s.id === subtaskId ? { ...s, status: newStatus } : s) } as Task)
      }
    } catch (e) {
      console.error('Erro ao atualizar status da subtarefa', e)
    }
  }

  const toggleSubtaskComments = async (subtaskId: string) => {
    if (expandedSubtaskId === subtaskId) {
      setExpandedSubtaskId(null)
      return
    }

    setExpandedSubtaskId(subtaskId)

    // Se já carregou os comentários, não precisa carregar de novo
    if (subtaskComments[subtaskId]) return

    setLoadingSubtaskComments((prev) => ({ ...prev, [subtaskId]: true }))
    try {
      const subtaskDetails = await tasksService.get(subtaskId)
      setSubtaskComments((prev) => ({
        ...prev,
        [subtaskId]: subtaskDetails.comments ?? [],
      }))
    } catch (e) {
      console.error('Erro ao carregar comentários da subtarefa', e)
    } finally {
      setLoadingSubtaskComments((prev) => ({ ...prev, [subtaskId]: false }))
    }
  }

  const addSubtaskComment = async (subtaskId: string) => {
    const content = newSubtaskComment[subtaskId]?.trim()
    if (!content) return

    setSavingSubtaskComment((prev) => ({ ...prev, [subtaskId]: true }))
    try {
      const created = await tasksService.addComment(subtaskId, content)
      setSubtaskComments((prev) => ({
        ...prev,
        [subtaskId]: [...(prev[subtaskId] ?? []), created],
      }))
      setNewSubtaskComment((prev) => ({ ...prev, [subtaskId]: '' }))
    } catch (e) {
      console.error('Erro ao adicionar comentário na subtarefa', e)
    } finally {
      setSavingSubtaskComment((prev) => ({ ...prev, [subtaskId]: false }))
    }
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
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [addingSubtask, setAddingSubtask] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [commentVisibility, setCommentVisibility] = useState<'INTERNAL' | 'CLIENT_VISIBLE'>('INTERNAL')
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const commentTextareaRef = useRef<HTMLTextAreaElement>(null)

  function handleCommentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setNewComment(val)
    const atIdx = val.lastIndexOf('@')
    if (atIdx !== -1) {
      const after = val.slice(atIdx + 1)
      if (!after.includes(' ') && after.length <= 20) {
        setMentionQuery(after.toLowerCase())
        return
      }
    }
    setMentionQuery(null)
  }

  function insertMention(name: string) {
    const val = newComment
    const atIdx = val.lastIndexOf('@')
    if (atIdx === -1) return
    const newVal = val.slice(0, atIdx) + '@' + name + ' '
    setNewComment(newVal)
    setMentionQuery(null)
    setTimeout(() => {
      const ta = commentTextareaRef.current
      if (ta) { ta.focus(); ta.selectionStart = ta.selectionEnd = newVal.length }
    }, 0)
  }

  const mentionSuggestions = mentionQuery !== null
    ? users.filter((u) => u.name.toLowerCase().includes(mentionQuery)).slice(0, 6)
    : []

  function renderCommentText(content: string) {
    const parts = content.split(/(@\w[\w\s]{0,30}?)(?=\s|$|@)/g)
    return parts.map((part, i) =>
      part.startsWith('@') ? (
        <MentionHighlight key={i}>{part}</MentionHighlight>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  }
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
                <Field>
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

                <Field>
                  <FieldLabel>Nível (prioridade)</FieldLabel>
                  <Select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} disabled={!isAdmin}>
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                  </Select>
                </Field>
              </Inline>

              <Inline>
                <Field>
                  <FieldLabel>Prazo</FieldLabel>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={!isAdmin} />
                </Field>

                <Field>
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
              </Inline>

              <Field>
                <FieldLabel>Labels (separadas por vírgula)</FieldLabel>
                <Input value={labelsText} onChange={(e) => setLabelsText(e.target.value)} disabled={!isAdmin} placeholder="ex.: design, urgente" />
              </Field>

              <Inline>
                <Field>
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

                <Field>
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
                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#6366f1' }}
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
            <SectionHeader>
              Colaboradores
              {assigneesDonePct !== null && (
                <span style={{ fontSize: '13px', color: '#8fd8ff', fontWeight: 600 }}>
                  {assigneesDonePct}%
                </span>
              )}
            </SectionHeader>
            <SectionBody>
              {details.assignees.length === 0 ? (
                <Muted>Nenhum colaborador atribuído.</Muted>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {details.assignees.map((a) => (
                    <CollaboratorRow key={a.userId}>
                      <CollaboratorAvatar $color={getAvatarColor(a.user?.name ?? 'U')}>
                        {(a.user?.name ?? 'U').charAt(0).toUpperCase()}
                      </CollaboratorAvatar>
                      <CollaboratorInfo>
                        <CollaboratorName>{a.user?.name ?? 'Usuário'}</CollaboratorName>
                        <CollaboratorStatus>
                          {a.doneAt ? 'Concluído' : 'Em aberto'}
                        </CollaboratorStatus>
                        {(a.user?.sectors ?? []).length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                            {(a.user?.sectors ?? []).map((s) => (
                              <SectorTag key={s.id}>{s.name}</SectorTag>
                            ))}
                          </div>
                        )}
                      </CollaboratorInfo>
                      {user?.id === a.userId && (
                        <Button
                          data-variant={a.doneAt ? 'ghost' : 'primary'}
                          data-size="sm"
                          onClick={() => void markMyPart(a.doneAt ? false : true)}
                          type="button"
                        >
                          {a.doneAt ? 'Reabrir' : 'Concluir'}
                        </Button>
                      )}
                    </CollaboratorRow>
                  ))}
                </div>
              )}

              {isAdmin && (
                <div style={{ marginTop: 8 }}>
                  <FieldLabel style={{ marginBottom: 12 }}>Atribuir colaboradores</FieldLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {users
                      .filter((u) => u.role === 'COLABORADOR')
                      .map((u) => (
                        <CollaboratorRow key={u.id}>
                          <CollaboratorAvatar $color={getAvatarColor(u.name)}>
                            {u.name.charAt(0).toUpperCase()}
                          </CollaboratorAvatar>
                          <CollaboratorInfo>
                            <CollaboratorName>{u.name}</CollaboratorName>
                            <CollaboratorStatus>{u.email}</CollaboratorStatus>
                            {(u.sectors ?? []).length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                                {(u.sectors ?? []).map((s) => (
                                  <SectorTag key={s.id}>{s.name}</SectorTag>
                                ))}
                              </div>
                            )}
                          </CollaboratorInfo>
                          <Checkbox
                            checked={assigneeIds.includes(u.id)}
                            onChange={() => toggleAssignee(u.id)}
                            aria-label={`Atribuir ${u.name}`}
                          />
                        </CollaboratorRow>
                      ))}
                  </div>
                </div>
              )}
            </SectionBody>
          </Section>

          <Section>
            <SectionHeader>
              Sub-tarefas
              {(details.subtasks ?? []).length > 0 && (
                <span style={{ fontSize: 10, color: '#64748b', marginLeft: 8 }}>
                  {(details.subtasks ?? []).filter((s) => s.status === 'DONE').length}/{(details.subtasks ?? []).length} concluídas
                </span>
              )}
            </SectionHeader>
            <SectionBody>
              {(details.subtasks ?? []).length === 0
                ? <Muted>Nenhuma sub-tarefa ainda.</Muted>
                : (details.subtasks ?? []).map((s) => (
                <SubtaskItem key={s.id}>
                  <SubtaskHeader>
                    {canInteract && (
                      <SubtaskCheckbox
                        type="checkbox"
                        checked={s.status === 'DONE'}
                        onChange={() => void toggleSubtaskStatus(s.id, s.status)}
                      />
                    )}
                    <SubtaskTitle $done={s.status === 'DONE'}>{s.title}</SubtaskTitle>
                    <SubtaskActions>
                      <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
                        {s.status === 'DONE' ? 'Concluída' : s.status === 'IN_PROGRESS' ? 'Em prog.' : 'A fazer'}
                      </span>
                      <SubtaskCommentBtn
                        type="button"
                        $hasComments={subtaskComments[s.id]?.length > 0}
                        onClick={() => void toggleSubtaskComments(s.id)}
                      >
                        <MessageSquare style={{ width: 11, height: 11 }} />
                        {subtaskComments[s.id]?.length || 0}
                      </SubtaskCommentBtn>
                    </SubtaskActions>
                  </SubtaskHeader>

                  {expandedSubtaskId === s.id && (
                    <SubtaskCommentsSection>
                      {loadingSubtaskComments[s.id] ? (
                        <Muted style={{ fontSize: 10 }}>Carregando comentários...</Muted>
                      ) : (subtaskComments[s.id] ?? []).length === 0 ? (
                        <Muted style={{ fontSize: 10 }}>Nenhum comentário ainda.</Muted>
                      ) : (
                        (subtaskComments[s.id] ?? []).map((comment: any) => (
                          <SubtaskComment key={comment.id}>
                            <SubtaskCommentAuthor>
                              {comment.author?.name ?? 'Usuário'} • {' '}
                              <SubtaskCommentDate style={{ display: 'inline' }}>
                                {new Date(comment.createdAt).toLocaleString('pt-BR')}
                              </SubtaskCommentDate>
                            </SubtaskCommentAuthor>
                            <SubtaskCommentText>{comment.content}</SubtaskCommentText>
                          </SubtaskComment>
                        ))
                      )}

                      {canInteract && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                          <Input
                            value={newSubtaskComment[s.id] || ''}
                            onChange={(e) =>
                              setNewSubtaskComment((prev) => ({ ...prev, [s.id]: e.target.value }))
                            }
                            placeholder="Adicionar comentário..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                void addSubtaskComment(s.id)
                              }
                            }}
                            style={{ fontSize: 11 }}
                          />
                          <Button
                            data-variant="primary"
                            data-size="sm"
                            type="button"
                            disabled={!newSubtaskComment[s.id]?.trim() || savingSubtaskComment[s.id]}
                            onClick={() => void addSubtaskComment(s.id)}
                            style={{ fontSize: 10, padding: '4px 10px' }}
                          >
                            {savingSubtaskComment[s.id] ? '...' : 'Enviar'}
                          </Button>
                        </div>
                      )}
                    </SubtaskCommentsSection>
                  )}
                </SubtaskItem>
              ))}
              {isAdmin && (
                <Inline style={{ marginTop: 8 }}>
                  <Input
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Título da sub-tarefa..."
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void createSubtask() } }}
                  />
                  <Button
                    data-variant="primary"
                    data-size="sm"
                    type="button"
                    disabled={!newSubtaskTitle.trim() || addingSubtask}
                    onClick={() => void createSubtask()}
                  >
                    {addingSubtask ? '…' : 'Adicionar'}
                  </Button>
                </Inline>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {details.comments.map((c) => (
                    <CommentCard key={c.id}>
                      <CollaboratorAvatar $color={getAvatarColor(c.author?.name ?? 'U')}>
                        {(c.author?.name ?? 'U').charAt(0).toUpperCase()}
                      </CollaboratorAvatar>
                      <CommentContent>
                        <CommentHeader>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CommentAuthor>{c.author?.name ?? 'Usuário'}</CommentAuthor>
                            {!c.isSystemComment && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                  padding: '2px 6px',
                                  borderRadius: 9999,
                                  background: c.visibility === 'CLIENT_VISIBLE' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(251, 191, 36, 0.18)',
                                  color: c.visibility === 'CLIENT_VISIBLE' ? '#34d399' : '#fbbf24',
                                  border: c.visibility === 'CLIENT_VISIBLE' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(251, 191, 36, 0.3)',
                                }}
                              >
                                {c.visibility === 'CLIENT_VISIBLE' ? 'Cliente vê' : 'Interno'}
                              </span>
                            )}
                          </div>
                          <CommentDate>{new Date(c.createdAt).toLocaleString('pt-BR')}</CommentDate>
                        </CommentHeader>
                        <CommentText>{renderCommentText(c.content)}</CommentText>
                      </CommentContent>
                    </CommentCard>
                  ))}
                </div>
              )}

              <Field style={{ marginTop: 8 }}>
                <FieldLabel>Novo comentário</FieldLabel>
                {canInteract && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <Button
                      data-variant={commentVisibility === 'INTERNAL' ? 'primary' : 'ghost'}
                      data-size="sm"
                      type="button"
                      onClick={() => setCommentVisibility('INTERNAL')}
                    >
                      Interno (equipe)
                    </Button>
                    <Button
                      data-variant={commentVisibility === 'CLIENT_VISIBLE' ? 'primary' : 'ghost'}
                      data-size="sm"
                      type="button"
                      onClick={() => setCommentVisibility('CLIENT_VISIBLE')}
                    >
                      Visível ao cliente
                    </Button>
                  </div>
                )}
                {commentVisibility === 'CLIENT_VISIBLE' && (
                  <Muted style={{ marginBottom: 8, color: '#f59e0b' }}>
                    Atenção: o cliente também verá esta mensagem.
                  </Muted>
                )}
                <CommentInputWrap>
                  <Textarea
                    ref={commentTextareaRef}
                    value={newComment}
                    onChange={handleCommentChange}
                    placeholder="Escreva um comentário… (use @ para mencionar)"
                  />
                  {mentionSuggestions.length > 0 && (
                    <MentionDropdown>
                      {mentionSuggestions.map((u) => (
                        <MentionItem key={u.id} onMouseDown={(e) => { e.preventDefault(); insertMention(u.name) }}>
                          <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                          {u.name}
                        </MentionItem>
                      ))}
                    </MentionDropdown>
                  )}
                </CommentInputWrap>
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

