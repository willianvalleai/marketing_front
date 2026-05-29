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
import { UserPlus, Trash2, ShieldCheck, Briefcase, UserCircle2, Mail, Phone, Building2, FileText, CheckCircle2, XCircle } from 'lucide-react'

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`

const PageTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const PageTitle = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.font.xl};
  font-weight: ${({ theme }) => theme.weights.bold};
  color: ${({ theme }) => theme.colors.textDark};
`

const PageSub = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`

const ListPanel = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  overflow: hidden;
`

const ListHead = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ListTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.font.md};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
`

const CountBadge = styled.span`
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.primaryMid};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.font.xs};
  font-weight: ${({ theme }) => theme.weights.semibold};
`

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: background 0.12s;
  &:last-child { border-bottom: none; }
  &:hover { background: ${({ theme }) => theme.colors.bg}; }
`

const UserAvatarBox = styled.div<{ $role: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.pill};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.weights.bold};
  font-size: ${({ theme }) => theme.font.sm};
  flex-shrink: 0;
  background: ${({ $role, theme }) =>
    $role === 'ADMIN' ? theme.colors.dangerMid :
    $role === 'COLABORADOR' ? theme.colors.primaryMid :
    theme.colors.successMid};
  color: ${({ $role, theme }) =>
    $role === 'ADMIN' ? theme.colors.danger :
    $role === 'COLABORADOR' ? theme.colors.primary :
    theme.colors.success};
`

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`

const UserNameText = styled.div`
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
`

const UserEmail = styled.div`
  font-size: ${({ theme }) => theme.font.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 2px;
`

const RoleBadge = styled.span<{ $role: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.font.xs};
  font-weight: ${({ theme }) => theme.weights.semibold};
  background: ${({ $role, theme }) =>
    $role === 'ADMIN' ? theme.colors.dangerMid :
    $role === 'COLABORADOR' ? theme.colors.primaryMid :
    theme.colors.successMid};
  color: ${({ $role, theme }) =>
    $role === 'ADMIN' ? theme.colors.danger :
    $role === 'COLABORADOR' ? theme.colors.primary :
    theme.colors.success};
  svg { width: 11px; height: 11px; }
`

const RemoveBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid transparent;
  background: transparent;
  font-size: ${({ theme }) => theme.font.xs};
  font-weight: ${({ theme }) => theme.weights.medium};
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  transition: all 0.15s;
  svg { width: 13px; height: 13px; }
  &:hover {
    background: ${({ theme }) => theme.colors.dangerFaint};
    border-color: ${({ theme }) => theme.colors.dangerMid};
    color: ${({ theme }) => theme.colors.danger};
  }
`

const EditBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg};
  font-size: ${({ theme }) => theme.font.xs};
  font-weight: ${({ theme }) => theme.weights.medium};
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryMid};
    background: ${({ theme }) => theme.colors.primaryFaint};
    color: ${({ theme }) => theme.colors.textDark};
  }
`

const Empty = styled.div`
  padding: 40px;
  text-align: center;
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textMuted};
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

  if (!isAdmin) return <Navigate to="/home" replace />

  return (
    <PageContainer>
      <PageHeader>
        <PageTitleGroup>
          <PageTitle>Usuários</PageTitle>
          <PageSub>{users.length} usuário{users.length !== 1 ? 's' : ''} no total</PageSub>
        </PageTitleGroup>
        <Button data-variant="primary" data-size="lg" onClick={openCreateModal}>
          <UserPlus />
          Novo Usuário
        </Button>
      </PageHeader>

      <ContentSection>
        <ListPanel>
          <ListHead>
            <ListTitle>Todos os usuários</ListTitle>
            <CountBadge>{users.length}</CountBadge>
          </ListHead>
          {loading ? (
            <Empty>Carregando…</Empty>
          ) : users.length === 0 ? (
            <Empty>Nenhum usuário cadastrado.</Empty>
          ) : (
            users.map((u) => (
              <UserItem key={u.id}>
                <UserAvatarBox $role={u.role}>
                  {u.name.charAt(0).toUpperCase()}
                </UserAvatarBox>
                <UserDetails>
                  <UserNameText>{u.name}</UserNameText>
                  <UserEmail>{u.email}</UserEmail>
                </UserDetails>
                <RoleBadge $role={u.role}>{roleIcon(u.role)}{u.role}</RoleBadge>
                {u.role !== 'ADMIN' && (
                  <EditBtn type="button" onClick={() => openEdit(u)}>
                    Editar
                  </EditBtn>
                )}
                {u.role !== 'ADMIN' && (
                  <RemoveBtn onClick={async () => {
                    if (!confirm(`Remover ${u.name}?`)) return
                    await usersService.remove(u.id)
                    await load()
                  }}>
                    <Trash2 />Remover
                  </RemoveBtn>
                )}
              </UserItem>
            ))
          )}
        </ListPanel>
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
