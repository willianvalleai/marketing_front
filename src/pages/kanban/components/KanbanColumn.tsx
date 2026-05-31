import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import styled from 'styled-components'
import type { Task, TaskStatus } from '@/shared/types'
import { TaskCard } from './TaskCard'

const Col = styled.div`
  flex: 0 0 320px;
  min-width: 320px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const ColHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
`

const ColTitle = styled.span<{ $status: TaskStatus }>`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 8px;
  font-weight: 600;
  color: #e2e2e2;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  line-height: 14.4px;
  display: flex;
  align-items: center;
  gap: 8px;
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    flex-shrink: 0;
    box-shadow: ${({ $status }) =>
      $status === 'TODO' ? '0px 0px 8px 0px rgba(173, 198, 255, 0.6)' :
      $status === 'IN_PROGRESS' ? '0px 0px 8px 0px rgba(143, 216, 255, 0.6)' :
      $status === 'INTERNAL_REVIEW' ? '0px 0px 8px 0px rgba(194, 193, 255, 0.6)' :
      $status === 'CHANGES_REQUESTED' ? '0px 0px 8px 0px rgba(255, 180, 171, 0.6)' :
      $status === 'CLIENT_REVIEW' ? '0px 0px 8px 0px rgba(194, 193, 255, 0.6)' :
      '0px 0px 8px 0px rgba(16, 185, 129, 0.6)'};
    background: ${({ $status }) =>
      $status === 'TODO' ? '#adc6ff' :
      $status === 'IN_PROGRESS' ? '#8fd8ff' :
      $status === 'INTERNAL_REVIEW' ? '#c2c1ff' :
      $status === 'CHANGES_REQUESTED' ? '#ffb4ab' :
      $status === 'CLIENT_REVIEW' ? '#c2c1ff' :
      '#10b981'};
  }
`

const ColCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 9999px;
  background: #2a2a2a;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 8px;
  font-weight: 400;
  color: #8b90a0;
  line-height: 18px;
`

const DropArea = styled.div<{ $over: boolean }>`
  flex: 1;
  min-height: 100px;
  border-radius: 12px;
  border: 2px dashed ${({ $over }) => $over ? '#8fd8ff' : 'transparent'};
  background: transparent;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: border-color 0.15s, background 0.15s;
`

export function KanbanColumn({
  status,
  title,
  tasks,
  onOpenTask,
}: {
  status: TaskStatus
  title: string
  tasks: Task[]
  onOpenTask: (taskId: string) => void
}) {
  const id = `col:${status}`
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <Col>
      <ColHeader>
        <ColTitle $status={status}>{title}</ColTitle>
        <ColCount>{tasks.length}</ColCount>
      </ColHeader>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <DropArea ref={setNodeRef} $over={isOver}>
          {tasks.map((t) => {
            return (
              <TaskCard
                key={t.id}
                task={t}
                onOpen={onOpenTask}
              />
            )
          })}
        </DropArea>
      </SortableContext>
    </Col>
  )
}
