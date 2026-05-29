import { useRef, type CSSProperties } from 'react'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import styled from 'styled-components'
import type { Task } from '@/shared/types'
import { GripVertical } from 'lucide-react'

const Wrap = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: grab;
  transition: box-shadow 0.15s;
  &:hover { box-shadow: ${({ theme }) => theme.shadow.md}; }
`

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`

const GripIcon = styled.div`
  margin-top: 2px;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  opacity: 0.4;
  svg { width: 14px; height: 14px; }
`

const Title = styled.div`
  flex: 1;
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
  line-height: 1.4;
`

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`

const PriorityChip = styled.span<{ $p: 'HIGH' | 'MEDIUM' | 'LOW' }>`
  padding: 2px 7px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 10.5px;
  font-weight: ${({ theme }) => theme.weights.semibold};
  background: ${({ $p, theme }) =>
    $p === 'HIGH' ? theme.colors.dangerMid :
    $p === 'MEDIUM' ? theme.colors.warningMid :
    theme.colors.successMid};
  color: ${({ $p, theme }) =>
    $p === 'HIGH' ? theme.colors.dangerText :
    $p === 'MEDIUM' ? theme.colors.warningText :
    theme.colors.successText};
`

const DueDateText = styled.span`
  font-size: ${({ theme }) => theme.font.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`

const ContextText = styled.span`
  font-size: 10.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg};
  padding: 2px 7px;
  border-radius: ${({ theme }) => theme.radii.pill};
`

export function TaskCard({
  task,
  onOpen,
  projectTitle,
  clientName,
}: {
  task: Task
  onOpen?: (taskId: string) => void
  projectTitle?: string
  clientName?: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const didDragRef = useRef(false)

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
          <GripIcon aria-hidden="true">
            <GripVertical />
          </GripIcon>
          <Title>{task.title}</Title>
        </CardTop>
        <Meta>
          <PriorityChip $p={task.priority as 'HIGH' | 'MEDIUM' | 'LOW'}>{task.priority}</PriorityChip>
          {task.dueDate && <DueDateText>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</DueDateText>}
          {clientName && <ContextText>{clientName}</ContextText>}
          {projectTitle && <ContextText>{projectTitle}</ContextText>}
        </Meta>
      </Wrap>
    </div>
  )
}
