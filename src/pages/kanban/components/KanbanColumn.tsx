import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import styled from 'styled-components'
import type { Task, TaskStatus } from '@/shared/types'
import { TaskCard } from './TaskCard'

const Col = styled.div`
  flex: 1;
  min-width: 270px;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const ColHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
`

const ColTitle = styled.span<{ $status: TaskStatus }>`
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
  display: flex;
  align-items: center;
  gap: 6px;
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ $status, theme }) =>
      $status === 'TODO' ? theme.colors.borderStrong :
      $status === 'IN_PROGRESS' ? theme.colors.primary :
      $status === 'INTERNAL_REVIEW' ? '#f59e0b' :
      $status === 'CHANGES_REQUESTED' ? theme.colors.danger :
      $status === 'CLIENT_REVIEW' ? '#8b5cf6' :
      theme.colors.success};
  }
`

const ColCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.bg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.font.xs};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textLight};
`

const DropArea = styled.div<{ $over: boolean }>`
  flex: 1;
  min-height: 100px;
  border-radius: ${({ theme }) => theme.radii.xl};
  border: 2px dashed ${({ $over, theme }) => $over ? theme.colors.primary : theme.colors.border};
  background: ${({ $over, theme }) => $over ? theme.colors.primaryFaint : theme.colors.bg};
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.15s, background 0.15s;
`

export function KanbanColumn({
  status,
  title,
  tasks,
  onOpenTask,
  projectMetaById,
}: {
  status: TaskStatus
  title: string
  tasks: Task[]
  onOpenTask: (taskId: string) => void
  projectMetaById: Record<string, { projectTitle: string; clientName: string }>
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
            const meta = projectMetaById[t.projectId]
            return (
              <TaskCard
                key={t.id}
                task={t}
                onOpen={onOpenTask}
                clientName={meta?.clientName}
                projectTitle={meta?.projectTitle}
              />
            )
          })}
        </DropArea>
      </SortableContext>
    </Col>
  )
}
