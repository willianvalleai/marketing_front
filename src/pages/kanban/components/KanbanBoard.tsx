import { useMemo } from 'react'
import { DndContext, PointerSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import styled from 'styled-components'
import type { Task, TaskStatus } from '@/shared/types'
import { KanbanColumn } from './KanbanColumn'

const Board = styled.div`
  display: flex;
  gap: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
`

const columns: Array<{ status: TaskStatus; title: string }> = [
  { status: 'TODO', title: 'TO DO' },
  { status: 'IN_PROGRESS', title: 'IN PROGRESS' },
  { status: 'INTERNAL_REVIEW', title: 'INTERNAL REVIEW' },
  { status: 'CHANGES_REQUESTED', title: 'CHANGES REQUESTED' },
  { status: 'CLIENT_REVIEW', title: 'CLIENT REVIEW' },
  { status: 'DONE', title: 'DONE' },
]

export function KanbanBoard({
  tasks,
  onMoveTask,
  onOpenTask,
  projectMetaById,
}: {
  tasks: Task[]
  onMoveTask: (taskId: string, toStatus: TaskStatus) => void
  onOpenTask: (taskId: string) => void
  projectMetaById: Record<string, { projectTitle: string; clientName: string }>
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const byStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { 
      TODO: [], 
      IN_PROGRESS: [], 
      INTERNAL_REVIEW: [], 
      CHANGES_REQUESTED: [], 
      CLIENT_REVIEW: [], 
      DONE: [] 
    }
    for (const t of tasks) map[t.status].push(t)
    return map
  }, [tasks])

  const statusOfTask = useMemo(() => {
    const m = new Map<string, TaskStatus>()
    for (const t of tasks) m.set(t.id, t.status)
    return m
  }, [tasks])

  const onDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id)
    const overId = event.over?.id ? String(event.over.id) : null
    if (!overId) return

    let nextStatus: TaskStatus | null = null
    if (overId.startsWith('col:')) {
      nextStatus = overId.replace('col:', '') as TaskStatus
    } else {
      nextStatus = statusOfTask.get(overId) ?? null
    }

    if (!nextStatus) return
    const current = statusOfTask.get(activeId)
    if (!current || current === nextStatus) return

    onMoveTask(activeId, nextStatus)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
      <Board>
        {columns.map((c) => (
          <KanbanColumn
            key={c.status}
            status={c.status}
            title={c.title}
            tasks={byStatus[c.status]}
            onOpenTask={onOpenTask}
            projectMetaById={projectMetaById}
          />
        ))}
      </Board>
    </DndContext>
  )
}

