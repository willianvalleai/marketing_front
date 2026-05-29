import React, { useEffect, useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useAuth } from '@/app/providers/AuthContext'
import { projectsService } from '@/shared/services/projects.service'
import { usersService } from '@/shared/services/users.service'
import { assetsService } from '@/shared/services/assets.service'
import type { Asset, Project, TaskPriority, User } from '@/shared/types'
import { Input, Textarea } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import {
  Plus, Trash2, FolderOpen, Users as UsersIcon,
  Link as LinkIcon, Pencil, CheckSquare, Search,
} from 'lucide-react'
import { ClientProjectsPage } from './client'
import { getErrorMessage } from '@/shared/services/api'

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #3b82f6, #6366f1)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #f59e0b, #f97316)',
  'linear-gradient(135deg, #ef4444, #f97316)',
  'linear-gradient(135deg, #8b5cf6, #a855f7)',
]

/* ── Page Layout ────────────────────────────────── */
const PageWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: ${fadeUp} 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
`

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`

const PageTitleGroup = styled.div``

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.xxxl};
  font-weight: ${({ theme }) => theme.weights.extrabold};
  color: ${({ theme }) => theme.colors.textDark};
  letter-spacing: -0.03em;
  margin: 0 0 4px;
  line-height: 1.15;
`

const PageSub = styled.p`
  font-size: ${({ theme }) => theme.font.md};
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0;
  font-weight: ${({ theme }) => theme.weights.medium};
`

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const FilterRow = styled.div`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  align-items: center;
`

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
`

const ProjectCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xxl};
  box-shadow: ${({ theme }) => theme.shadow.card};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadow.lg};
    transform: translateY(-6px);
    border-color: ${({ theme }) => theme.colors.primaryMid};
  }
`

const CardBand = styled.div<{ $gradient: string }>`
  height: 120px;
  background: ${({ $gradient }) => $gradient};
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
`

const CardBandDecor = styled.div`
  position: absolute;
  inset: 0;
  
  &::before {
    content: '';
    position: absolute;
    right: -30px;
    top: -30px;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: rgba(255,255,255,0.12);
    filter: blur(20px);
  }
  
  &::after {
    content: '';
    position: absolute;
    right: 40px;
    bottom: -40px;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    filter: blur(15px);
  }
`

const CardIconFloat = styled.div<{ $gradient: string }>`
  position: absolute;
  bottom: -28px;
  left: 24px;
  width: 64px;
  height: 64px;
  border-radius: ${({ theme }) => theme.radii.xxl};
  background: ${({ $gradient }) => $gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.weights.extrabold};
  font-size: 1.75rem;
  color: white;
  border: 4px solid ${({ theme }) => theme.colors.surface};
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  letter-spacing: -0.03em;
  z-index: 1;
`

const CardContent = styled.div`
  padding: 38px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
`

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.lg};
  font-weight: ${({ theme }) => theme.weights.extrabold};
  color: ${({ theme }) => theme.colors.textDark};
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.3;
`

const ProjectStatusBadge = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: ${({ theme }) => theme.weights.bold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 8px;
  background: ${({ $status }) => {
    switch ($status) {
      case 'PLANNING': return '#dbeafe'
      case 'IN_PROGRESS': return '#d1fae5'
      case 'ON_HOLD': return '#fef3c7'
      case 'COMPLETED': return '#e5e7eb'
      case 'CANCELLED': return '#fee2e2'
      default: return '#e5e7eb'
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'PLANNING': return '#1e40af'
      case 'IN_PROGRESS': return '#065f46'
      case 'ON_HOLD': return '#92400e'
      case 'COMPLETED': return '#374151'
      case 'CANCELLED': return '#991b1b'
      default: return '#374151'
    }
  }};
`

const CardClient = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: ${({ theme }) => theme.weights.medium};
  svg { width: 14px; height: 14px; opacity: 0.7; }
`

const CardDesc = styled.p`
  font-size: ${({ theme }) => theme.font.md};
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const CardProgress = styled.div`
  margin-top: 4px;
`

const ProgressTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`

const ProgressLbl = styled.span`
  font-size: 12px;
  font-weight: ${({ theme }) => theme.weights.bold};
  color: ${({ theme }) => theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const ProgressPct = styled.span<{ $done: boolean }>`
  font-size: 13px;
  font-weight: ${({ theme }) => theme.weights.extrabold};
  color: ${({ $done, theme }) => $done ? theme.colors.success : theme.colors.primary};
  letter-spacing: -0.01em;
`

const ProgressBar = styled.div`
  height: 8px;
  border-radius: 99px;
  background: ${({ theme }) => theme.colors.border};
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
`

const ProgressFill = styled.div<{ $pct: number; $done: boolean }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: ${({ $done }) =>
    $done
      ? 'linear-gradient(90deg, #10b981, #34d399)'
      : 'linear-gradient(90deg, #6366f1, #8b5cf6)'};
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 99px;
  box-shadow: 0 0 8px ${({ $done }) => $done ? 'rgba(16, 185, 129, 0.4)' : 'rgba(99, 102, 241, 0.4)'};
`

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceHover};
`

const TasksInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: ${({ theme }) => theme.weights.bold};
  color: ${({ theme }) => theme.colors.textDark};
  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.primary};
  }
`

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

const ActionBtn = styled.button<{ $danger?: boolean }>`
  width: 38px;
  height: 38px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1.5px solid transparent;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  svg { width: 16px; height: 16px; }
  
  &:hover {
    background: ${({ $danger, theme }) => $danger ? theme.colors.dangerFaint : theme.colors.primaryFaint};
    border-color: ${({ $danger, theme }) => $danger ? theme.colors.dangerMid : theme.colors.primaryMid};
    color: ${({ $danger, theme }) => $danger ? theme.colors.danger : theme.colors.primary};
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`

const EmptyState = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xxl};
  text-align: center;
  gap: 16px;
`

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: ${({ theme }) => theme.radii.xxl};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primaryFaint}, ${({ theme }) => theme.colors.infoFaint});
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
  svg {
    width: 36px;
    height: 36px;
    color: ${({ theme }) => theme.colors.primary};
  }
`

const EmptyTitle = styled.div`
  font-size: ${({ theme }) => theme.font.xxl};
  font-weight: ${({ theme }) => theme.weights.extrabold};
  color: ${({ theme }) => theme.colors.textDark};
  letter-spacing: -0.02em;
`

const EmptyDesc = styled.div`
  font-size: ${({ theme }) => theme.font.md};
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 400px;
  line-height: 1.7;
  font-weight: ${({ theme }) => theme.weights.medium};
`

const FormBody = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-height: 65vh;
  overflow-y: auto;
  padding-right: 8px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.bg};
    border-radius: 99px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 99px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.borderStrong};
  }
`

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label`
  font-size: 13px;
  font-weight: ${({ theme }) => theme.weights.bold};
  color: ${({ theme }) => theme.colors.textDark};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const Hint = styled.p`
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
  line-height: 1.6;
  font-weight: ${({ theme }) => theme.weights.normal};
`

const ErrorMsg = styled.p`
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.danger};
  margin: 0;
  font-weight: ${({ theme }) => theme.weights.medium};
`

const SectionDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: 8px 0;
`

const TaskBox = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryMid};
    box-shadow: ${({ theme }) => theme.shadow.sm};
  }
`

const TaskBoxHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const TaskBoxNum = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ theme }) => theme.weights.extrabold};
  color: ${({ theme }) => theme.colors.primary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  @media (max-width: 1100px) { grid-template-columns: 1fr; }
`

const AssignItem = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryFaint};
    transform: translateX(2px);
  }
`

const ModalFieldLabel = styled.div`
  font-size: 13px;
  font-weight: ${({ theme }) => theme.weights.bold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textDark};
  margin-bottom: 8px;
`

const LinksGrid = styled.div`
  display: grid;
  gap: 20px;
`

const LinksForm = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 14px;
  align-items: end;
  @media (max-width: 700px) { grid-template-columns: 1fr; }
`

const LinksList = styled.div`
  display: grid;
  gap: 12px;
`

const LinkRow = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryMid};
    box-shadow: ${({ theme }) => theme.shadow.sm};
  }
`

const LinkMain = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: ${({ theme }) => theme.colors.textDark};
  text-decoration: none;
  font-size: ${({ theme }) => theme.font.md};
  font-weight: ${({ theme }) => theme.weights.medium};
  
  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
  }
  
  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
`

const LinkRowActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`

const LinkRowBtn = styled.button`
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textMuted};
  border-radius: ${({ theme }) => theme.radii.lg};
  height: 36px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ theme }) => theme.weights.semibold};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryFaint};
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  svg { width: 14px; height: 14px; }
`

function parseLabels(text: string): string[] {
  return text.split(',').map((s) => s.trim()).filter(Boolean)
}

export function ProjetosPage() {
  const { user } = useAuth()
  if (user?.role === 'CLIENTE') return <ClientProjectsPage />
  const isAdmin = user?.role === 'ADMIN'

  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<User[]>([])
  const [collabs, setCollabs] = useState<User[]>([])
  const [q, setQ] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)
  
  const [createOpen, setCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [clientId, setClientId] = useState('')
  const [briefing, setBriefing] = useState('')
  const [objectives, setObjectives] = useState<string[]>([])
  const [objectiveInput, setObjectiveInput] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [budget, setBudget] = useState('')
  const [projectStatus, setProjectStatus] = useState<'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'>('PLANNING')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [editOpen, setEditOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [eTitle, setETitle] = useState('')
  const [eDescription, setEDescription] = useState('')
  const [eClientId, setEClientId] = useState('')
  const [eBriefing, setEBriefing] = useState('')
  const [eObjectives, setEObjectives] = useState<string[]>([])
  const [eObjectiveInput, setEObjectiveInput] = useState('')
  const [eTargetAudience, setETargetAudience] = useState('')
  const [eProjectStatus, setEProjectStatus] = useState<'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'>('PLANNING')
  const [eBudget, setEBudget] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const [linksOpen, setLinksOpen] = useState(false)
  const [linksProject, setLinksProject] = useState<Project | null>(null)
  const [links, setLinks] = useState<Asset[]>([])
  const [linksLoading, setLinksLoading] = useState(false)
  const [linksName, setLinksName] = useState('')
  const [linksUrl, setLinksUrl] = useState('')
  const [linksSaving, setLinksSaving] = useState(false)
  const [editingLink, setEditingLink] = useState<Asset | null>(null)

  type DraftTask = { title: string; description: string; priority: TaskPriority; dueDate: string; labelsText: string; assigneeIds: string[] }
  const [tasks, setTasks] = useState<DraftTask[]>([{ title: '', description: '', priority: 'MEDIUM', dueDate: '', labelsText: '', assigneeIds: [] }])

  const load = async () => {
    setLoadError(null)
    try {
      const p = await projectsService.list()
      setProjects(p)
      if (!isAdmin) return
      const u = await usersService.list()
      setClients(u.filter((x) => x.role === 'CLIENTE'))
      setCollabs(u.filter((x) => x.role === 'COLABORADOR'))
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Falha ao carregar projetos.'))
      setProjects([]); setClients([]); setCollabs([])
    }
  }

  useEffect(() => { void load() }, [isAdmin]) // eslint-disable-line

  const progressMap = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of projects) {
      if (!p.tasks?.length) { m.set(p.id, 0); continue }
      m.set(p.id, Math.round((p.tasks.filter((t) => t.status === 'DONE').length / p.tasks.length) * 100))
    }
    return m
  }, [projects])

  const visibleProjects = useMemo(() => {
    const s = q.trim().toLowerCase()
    return projects.filter((p) => {
      if (clientFilter && p.clientId !== clientFilter) return false
      if (!s) return true
      return (p.title ?? '').toLowerCase().includes(s) || (p.client?.name ?? '').toLowerCase().includes(s)
    })
  }, [projects, q, clientFilter])

  const openCreateModal = () => {
    setTitle('')
    setDescription('')
    setClientId('')
    setBriefing('')
    setObjectives([])
    setObjectiveInput('')
    setTargetAudience('')
    setBudget('')
    setTasks([{ title: '', description: '', priority: 'MEDIUM', dueDate: '', labelsText: '', assigneeIds: [] }])
    setError('')
    setCreateOpen(true)
  }

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) return
    setError(''); setSaving(true)
    try {
      await projectsService.create({
        title: title.trim(),
        description: description.trim() || undefined,
        clientId,
        briefing: briefing.trim() || undefined,
        objectives: objectives.length > 0 ? objectives : undefined,
        targetAudience: targetAudience.trim() || undefined,
        budget: budget ? parseFloat(budget) : undefined,
        projectStatus,
        tasks: tasks.map((t) => ({ title: t.title.trim(), description: t.description.trim() || undefined, priority: t.priority, dueDate: t.dueDate || undefined, labels: parseLabels(t.labelsText), assigneeIds: t.assigneeIds })).filter((t) => t.title.length > 0),
      })
      setCreateOpen(false)
      await load()
    } catch { setError('Erro ao criar projeto.') }
    finally { setSaving(false) }
  }

  const canManageLink = (a: Asset) => !user ? false : user.role === 'ADMIN' || a.uploadedById === user.id
  const openLinks = async (p: Project) => {
    setLinksProject(p); setLinksOpen(true); setLinksLoading(true)
    try { setLinks(await assetsService.list({ projectId: p.id, take: 50 }).catch(() => [])) } finally { setLinksLoading(false) }
  }
  const startAddLink = () => { setEditingLink(null); setLinksName(''); setLinksUrl('') }
  const startEditLink = (a: Asset) => { setEditingLink(a); setLinksName(a.name ?? ''); setLinksUrl(a.url ?? '') }
  const saveLink = async () => {
    if (!linksProject) return
    const name = linksName.trim(); const url = linksUrl.trim()
    if (!name || !url) return
    setLinksSaving(true)
    try {
      if (editingLink) { const u = await assetsService.update(editingLink.id, { name, url }); setLinks((c) => c.map((x) => x.id === u.id ? u : x)) }
      else { const cr = await assetsService.createLink({ name, url, projectId: linksProject.id }); setLinks((c) => [cr, ...c]) }
      startAddLink()
    } finally { setLinksSaving(false) }
  }
  const removeLink = async (a: Asset) => {
    if (!confirm(`Remover link "${a.name}"?`)) return
    await assetsService.remove(a.id); setLinks((c) => c.filter((x) => x.id !== a.id))
  }
  const openEditProject = (p: Project) => {
    setEditingProject(p)
    setETitle(p.title ?? '')
    setEDescription(p.description ?? '')
    setEClientId(p.clientId ?? '')
    setEBriefing(p.briefing ?? '')
    setEObjectives(p.objectives ?? [])
    setEObjectiveInput('')
    setETargetAudience(p.targetAudience ?? '')
    setEBudget(p.budget?.toString() ?? '')
    setEProjectStatus(p.projectStatus ?? 'PLANNING')
    setEditOpen(true)
  }
  const saveEditProject = async () => {
    if (!isAdmin || !editingProject) return
    setSavingEdit(true)
    try {
      const upd = await projectsService.update(editingProject.id, {
        title: eTitle.trim(),
        description: eDescription.trim() || undefined,
        clientId: eClientId,
        briefing: eBriefing.trim() || undefined,
        objectives: eObjectives.length > 0 ? eObjectives : undefined,
        targetAudience: eTargetAudience.trim() || undefined,
        budget: eBudget ? parseFloat(eBudget) : undefined,
        projectStatus: eProjectStatus,
      })
      setProjects((c) => c.map((x) => x.id === upd.id ? upd : x)); setEditOpen(false); setEditingProject(null)
    } finally { setSavingEdit(false) }
  }

  return (
    <PageWrap>
      <PageHeader>
        <PageTitleGroup>
          <PageTitle>Projetos</PageTitle>
          <PageSub>{projects.length} projeto{projects.length !== 1 ? 's' : ''} no total</PageSub>
        </PageTitleGroup>
        {isAdmin && (
          <Button data-variant="primary" data-size="lg" onClick={openCreateModal}>
            <Plus />
            Novo Projeto
          </Button>
        )}
      </PageHeader>

      <ContentSection>
        {loadError && (
          <div style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', fontSize: 13 }}>{loadError}</div>
        )}

        <FilterRow>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af', pointerEvents: 'none' }} />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título ou cliente…" style={{ paddingLeft: 34 }} />
          </div>
          {isAdmin && (
            <Select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} style={{ width: 210, flexShrink: 0 }}>
              <option value="">Todos os clientes</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          )}
        </FilterRow>

        <CardsGrid>
          {visibleProjects.length === 0 ? (
            <EmptyState>
              <EmptyIcon><FolderOpen /></EmptyIcon>
              <EmptyTitle>{projects.length === 0 ? 'Nenhum projeto ainda' : 'Nenhum projeto encontrado'}</EmptyTitle>
              <EmptyDesc>
                {isAdmin ? 'Clique no botão "Novo Projeto" acima para criar seu primeiro projeto.' : 'Os projetos que você tem acesso aparecerão aqui.'}
              </EmptyDesc>
            </EmptyState>
          ) : (
            visibleProjects.map((p, idx) => {
              const pct = progressMap.get(p.id) ?? 0
              const taskCount = p.tasks?.length ?? 0
              const doneCount = p.tasks?.filter((t) => t.status === 'DONE').length ?? 0
              const grad = CARD_GRADIENTS[idx % CARD_GRADIENTS.length]
              return (
                <ProjectCard key={p.id}>
                  <CardBand $gradient={grad}>
                    <CardBandDecor />
                    <CardIconFloat $gradient={grad}>{p.title.charAt(0).toUpperCase()}</CardIconFloat>
                  </CardBand>

                  <CardContent>
                    <div>
                      <CardTitle>{p.title}</CardTitle>
                      <CardClient><UsersIcon />{p.client?.name ?? '—'}</CardClient>
                      {p.projectStatus && (
                        <ProjectStatusBadge $status={p.projectStatus}>
                          {p.projectStatus === 'PLANNING' && 'Planejamento'}
                          {p.projectStatus === 'IN_PROGRESS' && 'Em Andamento'}
                          {p.projectStatus === 'ON_HOLD' && 'Pausado'}
                          {p.projectStatus === 'COMPLETED' && 'Concluído'}
                          {p.projectStatus === 'CANCELLED' && 'Cancelado'}
                        </ProjectStatusBadge>
                      )}
                    </div>
                    {p.description && <CardDesc>{p.description}</CardDesc>}
                    <CardProgress>
                      <ProgressTop>
                        <ProgressLbl>Progresso</ProgressLbl>
                        <ProgressPct $done={pct === 100}>{pct}%</ProgressPct>
                      </ProgressTop>
                      <ProgressBar><ProgressFill $pct={pct} $done={pct === 100} /></ProgressBar>
                    </CardProgress>
                  </CardContent>

                  <CardFooter>
                    <TasksInfo><CheckSquare />{doneCount} de {taskCount} tarefa{taskCount !== 1 ? 's' : ''}</TasksInfo>
                    <CardActions>
                      {isAdmin && <ActionBtn type="button" title="Editar" onClick={() => openEditProject(p)}><Pencil /></ActionBtn>}
                      <ActionBtn type="button" title="Links" onClick={() => void openLinks(p)}><LinkIcon /></ActionBtn>
                      {isAdmin && (
                        <ActionBtn $danger type="button" title="Excluir" onClick={async () => {
                          if (!confirm(`Excluir "${p.title}"?`)) return
                          await projectsService.remove(p.id); await load()
                        }}><Trash2 /></ActionBtn>
                      )}
                    </CardActions>
                  </CardFooter>
                </ProjectCard>
              )
            })
          )}
        </CardsGrid>
      </ContentSection>

      <Modal open={createOpen} onClose={() => { setCreateOpen(false); setError('') }}
        title="Criar Novo Projeto"
        footer={<>
          <Button data-variant="ghost" data-size="md" type="button" onClick={() => { setCreateOpen(false); setError('') }}>Cancelar</Button>
          <Button data-variant="primary" data-size="md" type="submit" form="create-project-form" data-loading={saving ? 'true' : 'false'} disabled={saving || !title.trim() || !clientId}>
            {saving ? 'Criando…' : 'Criar Projeto'}
          </Button>
        </>}>
        <FormBody id="create-project-form" onSubmit={create}>
          <FieldGroup>
            <Label>Título do projeto</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Site Institucional" required />
          </FieldGroup>
          <FieldGroup>
            <Label>Descrição <span style={{ opacity: 0.5, textTransform: 'none', fontWeight: 400 }}>(opcional)</span></Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o objetivo do projeto..." style={{ minHeight: 80 }} />
          </FieldGroup>
          <FieldGroup>
            <Label>Cliente</Label>
            <Select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
              <option value="">Selecione o cliente...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            {clients.length === 0 && <Hint>Cadastre um CLIENTE em Usuários primeiro.</Hint>}
          </FieldGroup>

          <SectionDivider />
          <FieldGroup>
            <Label>Briefing <span style={{ opacity: 0.5, textTransform: 'none', fontWeight: 400 }}>(opcional)</span></Label>
            <Textarea value={briefing} onChange={(e) => setBriefing(e.target.value)} placeholder="Descreva o contexto e necessidades do projeto..." style={{ minHeight: 100 }} />
          </FieldGroup>
          <FieldGroup>
            <Label>Objetivos <span style={{ opacity: 0.5, textTransform: 'none', fontWeight: 400 }}>(opcional)</span></Label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Input 
                value={objectiveInput} 
                onChange={(e) => setObjectiveInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const val = objectiveInput.trim()
                    if (val && !objectives.includes(val)) {
                      setObjectives([...objectives, val])
                      setObjectiveInput('')
                    }
                  }
                }}
                placeholder="Digite um objetivo e pressione Enter" 
              />
              <Button 
                type="button" 
                data-variant="ghost" 
                data-size="sm"
                onClick={() => {
                  const val = objectiveInput.trim()
                  if (val && !objectives.includes(val)) {
                    setObjectives([...objectives, val])
                    setObjectiveInput('')
                  }
                }}
              >
                <Plus style={{ width: 14, height: 14 }} />
              </Button>
            </div>
            {objectives.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {objectives.map((obj, idx) => (
                  <div key={idx} style={{ 
                    background: '#f3f4f6', 
                    padding: '4px 8px', 
                    borderRadius: 6, 
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    {obj}
                    <button
                      type="button"
                      onClick={() => setObjectives(objectives.filter((_, i) => i !== idx))}
                      style={{ 
                        border: 'none', 
                        background: 'transparent', 
                        cursor: 'pointer', 
                        color: '#9ca3af',
                        padding: 0,
                        display: 'flex'
                      }}
                    >
                      <Trash2 style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FieldGroup>
          <Row>
            <FieldGroup>
              <Label>Público-alvo <span style={{ opacity: 0.5, textTransform: 'none', fontWeight: 400 }}>(opcional)</span></Label>
              <Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="Ex: Empresas B2B" />
            </FieldGroup>
            <FieldGroup>
              <Label>Orçamento (R$) <span style={{ opacity: 0.5, textTransform: 'none', fontWeight: 400 }}>(opcional)</span></Label>
              <Input type="number" step="0.01" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="0.00" />
            </FieldGroup>
          </Row>
          <FieldGroup>
            <Label>Status do Projeto</Label>
            <Select value={projectStatus} onChange={(e) => setProjectStatus(e.target.value as any)}>
              <option value="PLANNING">Planejamento</option>
              <option value="IN_PROGRESS">Em Andamento</option>
              <option value="ON_HOLD">Pausado</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELLED">Cancelado</option>
            </Select>
          </FieldGroup>

          <SectionDivider />
          <FieldGroup>
            <Label style={{ display: 'flex', alignItems: 'center', gap: 5 }}><CheckSquare style={{ width: 12 }} />Tarefas iniciais <span style={{ opacity: 0.5, textTransform: 'none', fontWeight: 400 }}>(opcional)</span></Label>
            <Hint>Crie as tarefas do projeto agora. Elas aparecerão no Kanban.</Hint>
          </FieldGroup>

          {tasks.map((t, idx) => (
            <TaskBox key={idx}>
              <TaskBoxHeader>
                <TaskBoxNum><CheckSquare style={{ width: 12 }} />Tarefa #{idx + 1}</TaskBoxNum>
                {tasks.length > 1 && (
                  <button type="button" onClick={() => setTasks((cur) => cur.filter((_, i) => i !== idx))}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 2, borderRadius: 4 }}>
                    <Trash2 style={{ width: 13, height: 13 }} />
                  </button>
                )}
              </TaskBoxHeader>
              <FieldGroup>
                <Label>Título</Label>
                <Input value={t.title} onChange={(e) => setTasks((cur) => cur.map((x, i) => i === idx ? { ...x, title: e.target.value } : x))} placeholder="Ex: Criar landing page" />
              </FieldGroup>
              <Row>
                <FieldGroup>
                  <Label>Prioridade</Label>
                  <Select value={t.priority} onChange={(e) => setTasks((cur) => cur.map((x, i) => i === idx ? { ...x, priority: e.target.value as TaskPriority } : x))}>
                    <option value="LOW">Baixa</option><option value="MEDIUM">Média</option><option value="HIGH">Alta</option>
                  </Select>
                </FieldGroup>
                <FieldGroup>
                  <Label>Prazo</Label>
                  <Input type="date" value={t.dueDate} onChange={(e) => setTasks((cur) => cur.map((x, i) => i === idx ? { ...x, dueDate: e.target.value } : x))} />
                </FieldGroup>
              </Row>
              <FieldGroup>
                <Label>Colaboradores</Label>
                {collabs.length === 0 ? <Hint>Cadastre COLABORADOR em Usuários primeiro.</Hint> : (
                  <div style={{ display: 'grid', gap: 6 }}>
                    {collabs.map((c) => (
                      <AssignItem key={c.id}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{c.email}</div>
                        </div>
                        <input type="checkbox" checked={t.assigneeIds.includes(c.id)}
                          onChange={() => setTasks((cur) => cur.map((x, i) => { if (i !== idx) return x; const has = x.assigneeIds.includes(c.id); return { ...x, assigneeIds: has ? x.assigneeIds.filter((id) => id !== c.id) : [...x.assigneeIds, c.id] } }))}
                          aria-label={`Atribuir ${c.name}`} />
                      </AssignItem>
                    ))}
                  </div>
                )}
              </FieldGroup>
            </TaskBox>
          ))}

          <Button type="button" data-variant="ghost" data-size="sm"
            onClick={() => setTasks((cur) => [...cur, { title: '', description: '', priority: 'MEDIUM', dueDate: '', labelsText: '', assigneeIds: [] }])}
            style={{ border: '1.5px dashed #e4e4e7', width: '100%' }}>
            <Plus style={{ width: 14, height: 14 }} />Adicionar tarefa
          </Button>

          {error && <ErrorMsg>{error}</ErrorMsg>}
        </FormBody>
      </Modal>

      <Modal open={linksOpen} onClose={() => { setLinksOpen(false); setLinksProject(null); setLinks([]); startAddLink() }}
        title={linksProject ? `Links — ${linksProject.title}` : 'Links'}
        footer={<Button data-variant="primary" data-size="md" type="button" onClick={() => setLinksOpen(false)}>Fechar</Button>}>
        <LinksGrid>
          <LinksForm>
            <div><ModalFieldLabel>Nome</ModalFieldLabel><Input value={linksName} onChange={(e) => setLinksName(e.target.value)} placeholder="Ex.: Figma, Drive" /></div>
            <div><ModalFieldLabel>URL</ModalFieldLabel><Input value={linksUrl} onChange={(e) => setLinksUrl(e.target.value)} placeholder="https://..." /></div>
            <div style={{ display: 'flex', gap: 8 }}>
              {editingLink && <Button data-variant="ghost" data-size="md" type="button" onClick={startAddLink}>Cancelar</Button>}
              <Button data-variant="primary" data-size="md" type="button" onClick={saveLink} disabled={linksSaving || !linksName.trim() || !linksUrl.trim()} data-loading={linksSaving ? 'true' : 'false'}>
                {editingLink ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </LinksForm>
          {linksLoading ? <div style={{ padding: 18, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Carregando…</div>
            : links.length === 0 ? <div style={{ padding: 18, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Nenhum link neste projeto.</div>
            : <LinksList>{links.map((a) => (
              <LinkRow key={a.id}>
                <LinkMain href={a.url} target="_blank" rel="noreferrer"><LinkIcon /><span>{a.name}</span></LinkMain>
                {canManageLink(a) && <LinkRowActions>
                  <LinkRowBtn type="button" onClick={() => startEditLink(a)}><Pencil />Editar</LinkRowBtn>
                  <LinkRowBtn type="button" onClick={() => void removeLink(a)}><Trash2 />Remover</LinkRowBtn>
                </LinkRowActions>}
              </LinkRow>
            ))}</LinksList>}
        </LinksGrid>
      </Modal>

      <Modal open={editOpen} onClose={() => { setEditOpen(false); setEditingProject(null) }}
        title={editingProject ? `Editar: ${editingProject.title}` : 'Editar projeto'}
        footer={<>
          <Button data-variant="ghost" data-size="md" type="button" onClick={() => { setEditOpen(false); setEditingProject(null) }}>Cancelar</Button>
          <Button data-variant="primary" data-size="md" type="button" onClick={saveEditProject} disabled={savingEdit || !eTitle.trim() || !eClientId} data-loading={savingEdit ? 'true' : 'false'}>Salvar</Button>
        </>}>
        <div style={{ display: 'grid', gap: 14 }}>
          <div><ModalFieldLabel>Título</ModalFieldLabel><Input value={eTitle} onChange={(e) => setETitle(e.target.value)} placeholder="Título do projeto" /></div>
          <div><ModalFieldLabel>Cliente</ModalFieldLabel><Select value={eClientId} onChange={(e) => setEClientId(e.target.value)}><option value="">Selecione...</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></div>
          <div><ModalFieldLabel>Descrição</ModalFieldLabel><Textarea value={eDescription} onChange={(e) => setEDescription(e.target.value)} placeholder="Descrição (opcional)" style={{ minHeight: 90 }} /></div>
          <div><ModalFieldLabel>Briefing</ModalFieldLabel><Textarea value={eBriefing} onChange={(e) => setEBriefing(e.target.value)} placeholder="Briefing do projeto (opcional)" style={{ minHeight: 100 }} /></div>
          <div>
            <ModalFieldLabel>Objetivos</ModalFieldLabel>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Input 
                value={eObjectiveInput} 
                onChange={(e) => setEObjectiveInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const val = eObjectiveInput.trim()
                    if (val && !eObjectives.includes(val)) {
                      setEObjectives([...eObjectives, val])
                      setEObjectiveInput('')
                    }
                  }
                }}
                placeholder="Digite um objetivo e pressione Enter" 
              />
              <Button 
                type="button" 
                data-variant="ghost" 
                data-size="sm"
                onClick={() => {
                  const val = eObjectiveInput.trim()
                  if (val && !eObjectives.includes(val)) {
                    setEObjectives([...eObjectives, val])
                    setEObjectiveInput('')
                  }
                }}
              >
                <Plus style={{ width: 14, height: 14 }} />
              </Button>
            </div>
            {eObjectives.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {eObjectives.map((obj, idx) => (
                  <div key={idx} style={{ 
                    background: '#f3f4f6', 
                    padding: '4px 8px', 
                    borderRadius: 6, 
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    {obj}
                    <button
                      type="button"
                      onClick={() => setEObjectives(eObjectives.filter((_, i) => i !== idx))}
                      style={{ 
                        border: 'none', 
                        background: 'transparent', 
                        cursor: 'pointer', 
                        color: '#9ca3af',
                        padding: 0,
                        display: 'flex'
                      }}
                    >
                      <Trash2 style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><ModalFieldLabel>Público-alvo</ModalFieldLabel><Input value={eTargetAudience} onChange={(e) => setETargetAudience(e.target.value)} placeholder="Ex: Empresas B2B" /></div>
            <div><ModalFieldLabel>Orçamento (R$)</ModalFieldLabel><Input type="number" step="0.01" min="0" value={eBudget} onChange={(e) => setEBudget(e.target.value)} placeholder="0.00" /></div>
          </div>
          <div>
            <ModalFieldLabel>Status do Projeto</ModalFieldLabel>
            <Select value={eProjectStatus} onChange={(e) => setEProjectStatus(e.target.value as any)}>
              <option value="PLANNING">Planejamento</option>
              <option value="IN_PROGRESS">Em Andamento</option>
              <option value="ON_HOLD">Pausado</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELLED">Cancelado</option>
            </Select>
          </div>
        </div>
      </Modal>
    </PageWrap>
  )
}
