export type Role = 'ADMIN' | 'COLABORADOR' | 'CLIENTE'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  phone?: string | null
  company?: string | null
  notes?: string | null
  isActive?: boolean
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'INTERNAL_REVIEW' | 'CHANGES_REQUESTED' | 'CLIENT_REVIEW' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type TaskType = 'NORMAL' | 'CLIENT_REQUEST'
export type AssetKind = 'LINK' | 'FILE' | 'DELIVERABLE'

export interface Asset {
  id: string
  name: string
  url: string
  kind: AssetKind
  createdAt: string
  projectId: string | null
  taskId: string | null
  uploadedById: string | null
}

export interface TaskAssignee {
  userId: string
  assignedAt: string
  doneAt: string | null
  user: User
}

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface TaskComment {
  id: string
  content: string
  createdAt: string
  authorId: string
  author: User
}

export type RecurringPattern = 'DAILY' | 'WEEKLY' | 'MONTHLY'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  type?: TaskType
  dueDate: string | null
  alertDaysBefore?: number | null
  alertSentAt?: string | null
  estimatedHours?: number | null
  milestoneId?: string | null
  requiredApprovals?: number | null
  isRecurring?: boolean
  recurringPattern?: RecurringPattern | null
  nextRecurrenceDate?: string | null
  parentTaskId?: string | null
  labels: string[]
  projectId: string
  assignedToId: string | null
  assignees?: TaskAssignee[]
  milestone?: Milestone
}

export interface TaskDetails extends Task {
  createdAt: string
  updatedAt: string
  assignees: TaskAssignee[]
  checklistItems: ChecklistItem[]
  comments: TaskComment[]
  assets?: Asset[]
}

export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'

export interface Milestone {
  id: string
  projectId: string
  title: string
  description?: string | null
  dueDate?: string | null
  status: MilestoneStatus
  order: number
  createdAt: string
  updatedAt: string
  _count?: {
    tasks: number
  }
}

export interface TimeLog {
  id: string
  taskId: string
  userId: string
  hours: number
  description?: string | null
  logDate: string
  createdAt: string
  user?: User
}

export interface Project {
  id: string
  title: string
  description: string | null
  clientId: string
  client: User
  tasks: Task[]
  assets?: Asset[]
  briefing?: string | null
  objectives?: string[]
  targetAudience?: string | null
  budget?: number | null
  projectStatus?: ProjectStatus
  milestones?: Milestone[]
}

export interface ChannelMember {
  userId: string
  user: User
}

export interface Channel {
  id: string
  name: string
  isGeneral: boolean
  members: ChannelMember[]
}

export interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string | null
  channelId: string | null
  createdAt: string
  sender?: User
}

export type NotificationType =
  | 'DIRECT_MESSAGE'
  | 'TASK_COMMENT'
  | 'TASK_INTERNAL_REVIEW'
  | 'TASK_CLIENT_REVIEW'
  | 'TASK_APPROVED'
  | 'TASK_CHANGES_REQUESTED'
  | 'TASK_REJECTED_INTERNAL'
  | 'TASK_DUE_SOON'
  | 'TASK_OVERDUE'

export type EntityType = 'MESSAGE' | 'TASK' | 'PROJECT'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string | null
  entityType: EntityType
  entityId: string
  projectId: string | null
  recipientId: string
  actorId: string | null
  readAt: string | null
  createdAt: string
  actor: User | null
}

export type ApiOk<T> = { success: true; data: T }
export type ApiFail = { success: false; error: string }
export type ApiResponse<T> = ApiOk<T> | ApiFail

