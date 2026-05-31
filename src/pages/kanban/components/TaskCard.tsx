import { useRef, useMemo, type CSSProperties } from 'react'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import styled from 'styled-components'
import type { Task } from '@/shared/types'
import { Clock, AlertTriangle, MessageSquare, Paperclip, ListTodo } from 'lucide-react'

const Wrap = styled.div`
  background: rgba(25, 25, 25, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 17px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: grab;
  transition: box-shadow 0.15s, border-color 0.15s;
  overflow: clip;
  &:hover { 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.1);
  }
`

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`

const LabelBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 4px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 8px;
  font-weight: 400;
  line-height: 15px;
  text-transform: uppercase;
  background: rgba(0, 193, 253, 0.2);
  border: 1px solid rgba(143, 216, 255, 0.2);
  color: #8fd8ff;
  white-space: nowrap;
`

const Title = styled.div`
  flex: 1;
  min-width: 0;
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
  font-size: 9px;
  font-weight: 400;
  color: #e2e2e2;
  line-height: 24px;
`

const Meta = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
  padding: 4px 0 0 0;
`

const PriorityChip = styled.span<{ $p: 'HIGH' | 'MEDIUM' | 'LOW' }>`
  padding: 3px 9px;
  border-radius: 6px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  font-weight: 400;
  line-height: 16.5px;
  border: 1px solid rgba(65, 71, 85, 0.2);
  background: ${({ $p }) =>
    $p === 'HIGH' ? 'rgba(147, 0, 10, 0.2)' :
    $p === 'MEDIUM' ? '#353535' :
    '#353535'};
  color: ${({ $p }) =>
    $p === 'HIGH' ? '#ffb4ab' :
    $p === 'MEDIUM' ? '#c2c1ff' :
    '#8b90a0'};
`

const DueAlertBadge = styled.span<{ $variant: 'warning' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 6px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  font-weight: 400;
  line-height: 16.5px;
  border: 1px solid rgba(255, 180, 171, 0.2);
  background: rgba(147, 0, 10, 0.2);
  color: #ffb4ab;
  svg {
    width: 10px;
    height: 10px;
  }
`

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 13px;
  border-top: 1px solid rgba(65, 71, 85, 0.1);
`

const Assignees = styled.div`
  display: flex;
  align-items: center;
`

const Avatar = styled.div<{ $index: number }>`
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: 2px solid #131313;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 8px;
  font-weight: 600;
  color: white;
  margin-left: ${({ $index }) => $index > 0 ? '-8px' : '0'};
  position: relative;
  z-index: ${({ $index }) => 10 - $index};
`

const CardStats = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const SubtaskBadge = styled.div<{ $done: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 7px;
  border-radius: 6px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  font-weight: 500;
  background: ${({ $done }) => $done ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.1)'};
  border: 1px solid ${({ $done }) => $done ? 'rgba(16, 185, 129, 0.25)' : 'rgba(99, 102, 241, 0.2)'};
  color: ${({ $done }) => $done ? '#34d399' : '#a5b4fc'};
  svg { width: 10px; height: 10px; }
`

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 8px;
  font-weight: 400;
  color: #8b90a0;
  line-height: 18px;
  
  svg {
    width: 12px;
    height: 12px;
  }
`

export function TaskCard({
  task,
  onOpen,
}: {
  task: Task
  onOpen?: (taskId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const didDragRef = useRef(false)

  const dueAlert = useMemo(() => {
    if (!task.dueDate || task.status === 'DONE') return null
    const now = new Date()
    const due = new Date(task.dueDate)
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDue < 0) {
      return { variant: 'danger' as const, label: `${Math.abs(daysUntilDue)}d atrasada`, icon: AlertTriangle }
    }
    if (daysUntilDue <= 3) {
      return { variant: 'warning' as const, label: `${daysUntilDue}d restante${daysUntilDue !== 1 ? 's' : ''}`, icon: Clock }
    }
    return null
  }, [task.dueDate, task.status])

  const subtaskInfo = useMemo(() => {
    const subs = task.subtasks ?? []
    if (subs.length === 0) return null
    const done = subs.filter((s) => s.status === 'DONE').length
    return { total: subs.length, done, allDone: done === subs.length }
  }, [task.subtasks])

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : undefined,
  }

  const dragThreshold = 6
  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    didDragRef.current = false
    pointerStartRef.current = { x: e.clientX, y: e.clientY }
    ;(listeners as any)?.onPointerDown?.(e)
  }

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const start = pointerStartRef.current
    if (start && !didDragRef.current) {
      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      if (Math.hypot(dx, dy) >= dragThreshold) didDragRef.current = true
    }
    ;(listeners as any)?.onPointerMove?.(e)
  }

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    pointerStartRef.current = null
    ;(listeners as any)?.onPointerUp?.(e)
  }

  const onPointerCancel: React.PointerEventHandler<HTMLDivElement> = (e) => {
    pointerStartRef.current = null
    ;(listeners as any)?.onPointerCancel?.(e)
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Wrap
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClick={() => {
          if (didDragRef.current) return
          onOpen?.(task.id)
        }}
        {...listeners}
      >
        <CardTop>
          {task.labels && task.labels.length > 0 && (
            <LabelBadge>{task.labels[0]}</LabelBadge>
          )}
        </CardTop>
        
        <Title>{task.title}</Title>
        
        <Meta>
          <PriorityChip $p={task.priority as 'HIGH' | 'MEDIUM' | 'LOW'}>
            {task.priority === 'HIGH' ? 'High' : task.priority === 'MEDIUM' ? 'Medium' : 'Low Priority'}
          </PriorityChip>
          {dueAlert && (
            <DueAlertBadge $variant={dueAlert.variant}>
              <dueAlert.icon />
              {dueAlert.label}
            </DueAlertBadge>
          )}
        </Meta>

        <CardFooter>
          <Assignees>
            {task.assignees && task.assignees.length > 0 ? (
              task.assignees.slice(0, 3).map((assignee, idx) => {
                const name = assignee.user?.name ?? ''
                return (
                  <Avatar key={assignee.userId} $index={idx} title={name}>
                    {name ? name.charAt(0).toUpperCase() : '?'}
                  </Avatar>
                )
              })
            ) : (
              <Avatar $index={0}>?</Avatar>
            )}
          </Assignees>
          
          <CardStats>
            {subtaskInfo && (
              <SubtaskBadge $done={subtaskInfo.allDone} title={`${subtaskInfo.done}/${subtaskInfo.total} sub-tarefas concluídas`}>
                <ListTodo />
                {subtaskInfo.done}/{subtaskInfo.total}
              </SubtaskBadge>
            )}
            <Stat>
              <MessageSquare />
              {0}
            </Stat>
            <Stat>
              <Paperclip />
              {0}
            </Stat>
          </CardStats>
        </CardFooter>
      </Wrap>
    </div>
  )
}
