import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '@/app/providers/AuthContext'
import { usersService } from '@/shared/services/users.service'
import type { Role, User } from '@/shared/types'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { UserPlus, Trash2, ShieldCheck, Briefcase, UserCircle2, Mail, Phone, Building2, FileText, CheckCircle2, XCircle, Filter, Download, Edit2, ChevronLeft, ChevronRight } from 'lucide-react'

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 0 4px;
`

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
`

const PageTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`

const PageTitle = styled.h1`
  margin: 0;
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 19px;
  font-weight: 600;
  color: #e2e2e2;
  line-height: 1.25;
  letter-spacing: -0.02em;
`

const PageSub = styled.p`
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  font-weight: 400;
  color: #8b90a0;
  line-height: 1.6;
  max-width: 600px;
`

const UserCount = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  font-weight: 400;
  color: #8b90a0;
  line-height: 1.6;
  white-space: nowrap;
`

const HeaderRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
`

const NewUserBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #8fd8ff, #6366f1);
  color: #131313;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  font-weight: 600;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 4px 12px rgba(143, 216, 255, 0.25);
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(143, 216, 255, 0.35);
  }
  
  &:active {
    transform: translateY(0);
  }
`

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`

const TablePanel = styled.div`
  background: rgba(25, 25, 25, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
`

const TableHead = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const TableTitle = styled.h3`
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  font-weight: 600;
  color: #e2e2e2;
  line-height: 1.5;
`

const TableActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  color: #8b90a0;
  cursor: pointer;
  transition: all 0.15s;
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: #e2e2e2;
  }
`

const Table = styled.div`
  width: 100%;
`

const TableHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 120px;
  gap: 16px;
  padding: 12px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(18, 18, 18, 0.5);
`

const TableHeaderCell = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 8px;
  font-weight: 600;
  color: #8b90a0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.5;
`

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 120px;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.15s;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`

const UserCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const UserAvatarBox = styled.div<{ $role: string }>`
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  font-weight: 600;
  flex-shrink: 0;
  background: ${({ $role }) =>
    $role === 'ADMIN' ? 'linear-gradient(135deg, #8fd8ff, #6366f1)' :
    $role === 'COLABORADOR' ? 'linear-gradient(135deg, #8fd8ff, #3b82f6)' :
    'linear-gradient(135deg, #fbbf24, #f59e0b)'};
  color: #131313;
  border: 2px solid rgba(255, 255, 255, 0.1);
`

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const UserNameText = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  font-weight: 500;
  color: #e2e2e2;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const UserEmail = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 8px;
  font-weight: 400;
  color: #8b90a0;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RoleCell = styled.div``

const RoleBadge = styled.span<{ $role: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 6px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.5;
  background: ${({ $role }) =>
    $role === 'ADMIN' ? 'rgba(143, 216, 255, 0.15)' :
    $role === 'COLABORADOR' ? 'rgba(59, 130, 246, 0.15)' :
    'rgba(251, 191, 36, 0.15)'};
  color: ${({ $role }) =>
    $role === 'ADMIN' ? '#8fd8ff' :
    $role === 'COLABORADOR' ? '#60a5fa' :
    '#fbbf24'};
  border: 1px solid ${({ $role }) =>
    $role === 'ADMIN' ? 'rgba(143, 216, 255, 0.2)' :
    $role === 'COLABORADOR' ? 'rgba(59, 130, 246, 0.2)' :
    'rgba(251, 191, 36, 0.2)'};
`

const StatusCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const StatusDot = styled.div<{ $status: 'ativo' | 'offline' | 'pendente' }>`
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  flex-shrink: 0;
  background: ${({ $status }) =>
    $status === 'ativo' ? '#10b981' :
    $status === 'pendente' ? '#f59e0b' :
    'transparent'};
  box-shadow: ${({ $status }) =>
    $status === 'ativo' ? '0 0 8px rgba(16, 185, 129, 0.4)' :
    $status === 'pendente' ? '0 0 8px rgba(245, 158, 11, 0.4)' :
    'none'};
`

const StatusText = styled.span<{ $status: 'ativo' | 'offline' | 'pendente' }>`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ $status }) =>
    $status === 'ativo' ? '#10b981' :
    $status === 'pendente' ? '#f59e0b' :
    '#8b90a0'};
`

const ActionsCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
`

const ActionIconBtn = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  color: #8b90a0;
  cursor: pointer;
  transition: all 0.15s;
  
  svg {
    width: 14px;
    height: 14px;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: #e2e2e2;
  }
  
  &.delete:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }
`

const TableFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const FooterText = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  font-weight: 400;
  color: #8b90a0;
  line-height: 1.5;
`

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const PaginationBtn = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  color: #8b90a0;
  cursor: pointer;
  transition: all 0.15s;
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: #e2e2e2;
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`

const Empty = styled.div`
  padding: 60px 40px;
  text-align: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 9px;
  color: #8b90a0;
`

const EditModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 4px 0;
`

const EditSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.primary};
  }
`

const EditFieldRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const EditFieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const EditLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.font.xs};
  font-weight: ${({ theme }) => theme.weights.medium};
  color: ${({ theme }) => theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  svg {
    width: 14px;
    height: 14px;
    opacity: 0.6;
  }
`

const StatusToggle = styled.div`
  display: flex;
  gap: 8px;
  padding: 4px;
  background: ${({ theme }) => theme.colors.bg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
`

const StatusOption = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ theme }) => theme.weights.medium};
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ $active, theme }) => $active ? theme.colors.success : 'transparent'};
  color: ${({ $active, theme }) => $active ? '#fff' : theme.colors.textMuted};
  svg {
    width: 15px;
    height: 15px;
  }
  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.success : theme.colors.border};
  }
  &:first-child {
    background: ${({ $active, theme }) => $active ? theme.colors.success : 'transparent'};
    &:hover {
      background: ${({ $active, theme }) => $active ? theme.colors.success : theme.colors.border};
    }
  }
  &:last-child {
    background: ${({ $active, theme }) => $active ? theme.colors.danger : 'transparent'};
    &:hover {
      background: ${({ $active, theme }) => $active ? theme.colors.danger : theme.colors.border};
    }
  }
`

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textDark};
  background: ${({ theme }) => theme.colors.surface};
  resize: vertical;
  transition: all 0.15s;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryFaint};
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`

const UserAvatar = styled.div<{ $role: string }>`
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.radii.pill};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.weights.bold};
  font-size: ${({ theme }) => theme.font.lg};
  flex-shrink: 0;
  margin: 0 auto 8px;
  background: ${({ $role, theme }) =>
    $role === 'ADMIN' ? theme.colors.dangerMid :
    $role === 'COLABORADOR' ? theme.colors.primaryMid :
    theme.colors.successMid};
  color: ${({ $role, theme }) =>
    $role === 'ADMIN' ? theme.colors.danger :
    $role === 'COLABORADOR' ? theme.colors.primary :
    theme.colors.success};
`

const UserHeader = styled.div`
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 8px;
`

const UserHeaderName = styled.h3`
  margin: 0 0 4px;
  font-size: ${({ theme }) => theme.font.lg};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
`

const UserHeaderEmail = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textMuted};
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
    border-radius: ${({ theme }) => theme.radii.sm};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.sm};
    &:hover {
      background: ${({ theme }) => theme.colors.textMuted};
    }
  }
`

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Label = styled.label`
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ theme }) => theme.weights.medium};
  color: ${({ theme }) => theme.colors.textDark};
`

const ErrorMsg = styled.p`
  font-size: ${({ theme }) => theme.font.xs};
  color: ${({ theme }) => theme.colors.danger};
  margin: 0;
`

const roleIcon = (role: string) => {
  if (role === 'ADMIN') return <ShieldCheck />
  if (role === 'COLABORADOR') return <Briefcase />
  return <UserCircle2 />
}

export function UsersPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(users.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = users.slice(startIndex, endIndex)
  
  // Create modal state
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Exclude<Role, 'ADMIN'>>('COLABORADOR')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [eName, setEName] = useState('')
  const [eEmail, setEEmail] = useState('')
  const [eRole, setERole] = useState<Exclude<Role, 'ADMIN'>>('CLIENTE')
  const [ePhone, setEPhone] = useState('')
  const [eCompany, setECompany] = useState('')
  const [eNotes, setENotes] = useState('')
  const [eActive, setEActive] = useState(true)
  const [savingEdit, setSavingEdit] = useState(false)

  const load = async () => {
    setLoading(true)
    try { setUsers(await usersService.list()) } finally { setLoading(false) }
  }

  useEffect(() => { if (isAdmin) void load() }, [isAdmin])

  const openCreateModal = () => {
    setName('')
    setEmail('')
    setPassword('')
    setRole('COLABORADOR')
    setPhone('')
    setCompany('')
    setNotes('')
    setError('')
    setCreateOpen(true)
  }

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await usersService.create({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      setCreateOpen(false)
      await load()
    } catch { 
      setError('Erro ao criar usuário.') 
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (u: User) => {
    setEditing(u)
    setEName(u.name ?? '')
    setEEmail(u.email ?? '')
    setERole((u.role === 'ADMIN' ? 'CLIENTE' : u.role) as Exclude<Role, 'ADMIN'>)
    setEPhone(u.phone ?? '')
    setECompany(u.company ?? '')
    setENotes(u.notes ?? '')
    setEActive(u.isActive ?? true)
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!editing) return
    setSavingEdit(true)
    try {
      const updated = await usersService.update(editing.id, {
        name: eName.trim(),
        email: eEmail.trim(),
        role: eRole,
        phone: ePhone.trim() || null,
        company: eCompany.trim() || null,
        notes: eNotes.trim() || null,
        isActive: eActive,
      })
      setUsers((cur) => cur.map((x) => (x.id === updated.id ? updated : x)))
      setEditOpen(false)
      setEditing(null)
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDelete = async (u: User) => {
    if (!confirm(`Remover ${u.name}?`)) return
    await usersService.remove(u.id)
    await load()
  }

  // Determine user status
  const getUserStatus = (u: User): 'ativo' | 'offline' | 'pendente' => {
    if (!u.isActive) return 'pendente'
    // You can add more logic here based on lastLogin or other fields
    return 'ativo'
  }

  const getStatusLabel = (status: 'ativo' | 'offline' | 'pendente') => {
    if (status === 'ativo') return 'Ativo'
    if (status === 'pendente') return 'Pendente'
    return 'Offline'
  }

  if (!isAdmin) return <Navigate to="/home" replace />

  return (
    <PageContainer>
      <PageHeader>
        <PageTitleGroup>
          <PageTitle>Gerenciamento de Usuários</PageTitle>
          <PageSub>Controle acessos, permissões e monitore a atividade dos colaboradores da plataforma.</PageSub>
        </PageTitleGroup>
        <HeaderRight>
          <UserCount>Total de Usuários: {users.length}</UserCount>
          <NewUserBtn onClick={openCreateModal}>
            <UserPlus />
            Novo Usuário
          </NewUserBtn>
        </HeaderRight>
      </PageHeader>

      <ContentSection>
        <TablePanel>
          <TableHead>
            <TableTitle>Lista de Usuários</TableTitle>
            <TableActions>
              <IconButton type="button" title="Filtrar">
                <Filter />
              </IconButton>
              <IconButton type="button" title="Exportar">
                <Download />
              </IconButton>
            </TableActions>
          </TableHead>
          
          {loading ? (
            <Empty>Carregando…</Empty>
          ) : users.length === 0 ? (
            <Empty>Nenhum usuário cadastrado.</Empty>
          ) : (
            <>
              <Table>
                <TableHeaderRow>
                  <TableHeaderCell>Usuário</TableHeaderCell>
                  <TableHeaderCell>Role</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Ações</TableHeaderCell>
                </TableHeaderRow>
                {currentUsers.map((u) => {
                  const status = getUserStatus(u)
                  return (
                    <TableRow key={u.id}>
                      <UserCell>
                        <UserAvatarBox $role={u.role}>
                          {u.name.charAt(0).toUpperCase()}
                        </UserAvatarBox>
                        <UserInfo>
                          <UserNameText>{u.name}</UserNameText>
                          <UserEmail>{u.email}</UserEmail>
                        </UserInfo>
                      </UserCell>
                      
                      <RoleCell>
                        <RoleBadge $role={u.role}>
                          {u.role}
                        </RoleBadge>
                      </RoleCell>
                      
                      <StatusCell>
                        <StatusDot $status={status} />
                        <StatusText $status={status}>{getStatusLabel(status)}</StatusText>
                      </StatusCell>
                      
                      <ActionsCell>
                        {u.role !== 'ADMIN' && (
                          <>
                            <ActionIconBtn 
                              type="button" 
                              onClick={() => openEdit(u)}
                              title="Editar"
                            >
                              <Edit2 />
                            </ActionIconBtn>
                            <ActionIconBtn 
                              type="button"
                              className="delete"
                              onClick={() => handleDelete(u)}
                              title="Excluir"
                            >
                              <Trash2 />
                            </ActionIconBtn>
                          </>
                        )}
                      </ActionsCell>
                    </TableRow>
                  )
                })}
              </Table>
              
              <TableFooter>
                <FooterText>
                  Exibindo {startIndex + 1} de {users.length} usuários
                </FooterText>
                <Pagination>
                  <PaginationBtn 
                    type="button"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    title="Página anterior"
                  >
                    <ChevronLeft />
                  </PaginationBtn>
                  <PaginationBtn 
                    type="button"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    title="Próxima página"
                  >
                    <ChevronRight />
                  </PaginationBtn>
                </Pagination>
              </TableFooter>
            </>
          )}
        </TablePanel>
      </ContentSection>

      {/* Create User Modal */}
      <Modal
        open={createOpen}
        onClose={() => { setCreateOpen(false); setError('') }}
        title="Criar Novo Usuário"
        footer={
          <>
            <Button 
              data-variant="ghost" 
              data-size="md" 
              type="button" 
              onClick={() => { setCreateOpen(false); setError('') }}
            >
              Cancelar
            </Button>
            <Button 
              data-variant="primary" 
              data-size="md" 
              type="submit" 
              form="create-user-form"
              data-loading={saving ? 'true' : 'false'}
              disabled={saving || !name.trim() || !email.trim() || !password}
            >
              {saving ? 'Criando…' : 'Criar Usuário'}
            </Button>
          </>
        }
      >
        <FormBody id="create-user-form" onSubmit={create}>
          <FieldGroup>
            <Label>Nome completo</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="João Silva" 
              required 
            />
          </FieldGroup>
          <FieldGroup>
            <Label>E-mail</Label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="joao@empresa.com" 
              required 
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Senha</Label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Min. 6 caracteres" 
              minLength={6} 
              required 
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Função</Label>
            <Select value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
              <option value="COLABORADOR">Colaborador</option>
              <option value="CLIENTE">Cliente</option>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Telefone/WhatsApp (opcional)</Label>
            <Input 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="(11) 99999-9999" 
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Empresa (opcional)</Label>
            <Input 
              value={company} 
              onChange={(e) => setCompany(e.target.value)} 
              placeholder="Nome da empresa" 
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Observações (opcional)</Label>
            <Input 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Ex.: melhor horário / preferências" 
            />
          </FieldGroup>
          {error && <ErrorMsg>{error}</ErrorMsg>}
        </FormBody>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditing(null) }}
        title={editing ? `Editar ${editing.role === 'CLIENTE' ? 'cliente' : 'colaborador'}` : 'Editar'}
        footer={(
          <>
            <Button data-variant="ghost" data-size="md" onClick={() => { setEditOpen(false); setEditing(null) }} type="button">
              Cancelar
            </Button>
            <Button data-variant="primary" data-size="md" onClick={saveEdit} disabled={savingEdit} data-loading={savingEdit ? 'true' : 'false'} type="button">
              Salvar Alterações
            </Button>
          </>
        )}
      >
        {editing && (
          <EditModalContent>
            <UserHeader>
              <UserAvatar $role={editing.role}>
                {editing.name.charAt(0).toUpperCase()}
              </UserAvatar>
              <UserHeaderName>{editing.name}</UserHeaderName>
              <UserHeaderEmail>{editing.email}</UserHeaderEmail>
            </UserHeader>

            <EditSection>
              <SectionTitle>
                <UserCircle2 />
                Informações Básicas
              </SectionTitle>
              <EditFieldRow>
                <EditFieldGroup>
                  <EditLabel><UserCircle2 />Nome Completo</EditLabel>
                  <Input value={eName} onChange={(e) => setEName(e.target.value)} placeholder="Nome completo" />
                </EditFieldGroup>
                <EditFieldGroup>
                  <EditLabel><Mail />E-mail</EditLabel>
                  <Input type="email" value={eEmail} onChange={(e) => setEEmail(e.target.value)} placeholder="email@exemplo.com" />
                </EditFieldGroup>
              </EditFieldRow>
              <EditFieldGroup>
                <EditLabel><Briefcase />Função</EditLabel>
                <Select value={eRole} onChange={(e) => setERole(e.target.value as typeof eRole)}>
                  <option value="COLABORADOR">Colaborador</option>
                  <option value="CLIENTE">Cliente</option>
                </Select>
              </EditFieldGroup>
            </EditSection>

            <EditSection>
              <SectionTitle>
                <Phone />
                Contato
              </SectionTitle>
              <EditFieldRow>
                <EditFieldGroup>
                  <EditLabel><Phone />Telefone / WhatsApp</EditLabel>
                  <Input value={ePhone} onChange={(e) => setEPhone(e.target.value)} placeholder="(11) 99999-9999" />
                </EditFieldGroup>
                <EditFieldGroup>
                  <EditLabel><Building2 />Empresa</EditLabel>
                  <Input value={eCompany} onChange={(e) => setECompany(e.target.value)} placeholder="Nome da empresa" />
                </EditFieldGroup>
              </EditFieldRow>
            </EditSection>

            <EditSection>
              <SectionTitle>
                <FileText />
                Observações
              </SectionTitle>
              <EditFieldGroup>
                <EditLabel><FileText />Notas / Preferências</EditLabel>
                <TextArea 
                  value={eNotes} 
                  onChange={(e) => setENotes(e.target.value)} 
                  placeholder="Ex.: Prefere contato por WhatsApp, melhor horário após 14h..."
                />
              </EditFieldGroup>
            </EditSection>

            <EditSection>
              <SectionTitle>
                <CheckCircle2 />
                Status
              </SectionTitle>
              <EditFieldGroup>
                <EditLabel>Estado do Usuário</EditLabel>
                <StatusToggle>
                  <StatusOption 
                    type="button"
                    $active={eActive} 
                    onClick={() => setEActive(true)}
                  >
                    <CheckCircle2 />
                    Ativo
                  </StatusOption>
                  <StatusOption 
                    type="button"
                    $active={!eActive} 
                    onClick={() => setEActive(false)}
                  >
                    <XCircle />
                    Inativo
                  </StatusOption>
                </StatusToggle>
              </EditFieldGroup>
            </EditSection>
          </EditModalContent>
        )}
      </Modal>
    </PageContainer>
  )
}
