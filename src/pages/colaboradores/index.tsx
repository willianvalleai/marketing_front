import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '@/app/providers/AuthContext'
import { usersService } from '@/shared/services/users.service'
import { sectorsService } from '@/shared/services/sectors.service'
import type { Role, Sector, User } from '@/shared/types'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { UserPlus, Trash2, Briefcase, UserCircle2, Mail, Phone, Building2, FileText, CheckCircle2, XCircle, Filter, Download, Edit2, ChevronLeft, ChevronRight, Tag, Plus, X } from 'lucide-react'

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
  grid-template-columns: 2fr 1fr 1fr 80px 100px 100px;
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

const TaskCountBadge = styled.span<{ $level: 'low' | 'mid' | 'high' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 22px;
  padding: 0 8px;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  background: ${({ $level }) =>
    $level === 'high' ? 'rgba(239,68,68,0.15)' :
    $level === 'mid'  ? 'rgba(245,158,11,0.15)' :
                        'rgba(16,185,129,0.15)'};
  color: ${({ $level }) =>
    $level === 'high' ? '#fca5a5' :
    $level === 'mid'  ? '#fcd34d' :
                        '#6ee7b7'};
`

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 80px 100px 100px;
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

/* ── Tabs ──────────────────────────────────── */
const TabsBar = styled.div`
  display: flex;
  gap: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 24px;
`

const TabBtn = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: ${({ $active }) => $active ? '#e2e2e2' : '#8b90a0'};
  border-bottom: 2px solid ${({ $active }) => $active ? '#8fd8ff' : 'transparent'};
  margin-bottom: -1px;
  transition: all 0.2s ease;
  
  &:hover { color: #e2e2e2; }
`

/* ── Sector badges ─────────────────────────── */
const SectorBadgeList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`

const SectorBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 9999px;
  background: rgba(143, 216, 255, 0.12);
  border: 1px solid rgba(143, 216, 255, 0.25);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: #8fd8ff;
  white-space: nowrap;
`

/* ── Sector picker (modal) ─────────────────── */
const SectorPickerWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const SectorPickerBtn = styled.button<{ $selected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 9999px;
  cursor: pointer;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.15s ease;
  border: 1px solid ${({ $selected }) => $selected ? '#8fd8ff' : 'rgba(255,255,255,0.12)'};
  background: ${({ $selected }) => $selected ? 'rgba(143,216,255,0.15)' : 'rgba(35,35,35,0.4)'};
  color: ${({ $selected }) => $selected ? '#8fd8ff' : '#8b90a0'};
  
  &:hover {
    border-color: #8fd8ff;
    color: #8fd8ff;
    background: rgba(143,216,255,0.1);
  }
`

/* ── Sectors management tab ────────────────── */
const SectorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`

const SectorCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(25, 25, 25, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(35, 35, 35, 0.6);
  }
`

const SectorCardName = styled.span`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #e2e2e2;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg { width: 14px; height: 14px; color: #8fd8ff; }
`

const SectorDeleteBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #8b90a0;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }
  
  svg { width: 14px; height: 14px; }
`

const AddSectorRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
`

const AddSectorBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #8fd8ff, #6366f1);
  color: #131313;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
  
  &:hover { opacity: 0.9; transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  
  svg { width: 14px; height: 14px; }
`

export function ColaboradoresPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [activeTab, setActiveTab] = useState<'users' | 'sectors'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [sectors, setSectors] = useState<Sector[]>([])
  const [sectorsLoading, setSectorsLoading] = useState(false)
  const [newSectorName, setNewSectorName] = useState('')
  const [savingSector, setSavingSector] = useState(false)
  
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
  const [role, setRole] = useState<Role>('COLABORADOR')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedSectorIds, setSelectedSectorIds] = useState<string[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [eName, setEName] = useState('')
  const [eEmail, setEEmail] = useState('')
  const [eRole, setERole] = useState<Role>('COLABORADOR')
  const [ePhone, setEPhone] = useState('')
  const [eCompany, setECompany] = useState('')
  const [eNotes, setENotes] = useState('')
  const [eActive, setEActive] = useState(true)
  const [eSelectedSectorIds, setESelectedSectorIds] = useState<string[]>([])
  const [savingEdit, setSavingEdit] = useState(false)

  const loadSectors = async () => {
    setSectorsLoading(true)
    try { setSectors(await sectorsService.list()) } finally { setSectorsLoading(false) }
  }

  const load = async () => {
    setLoading(true)
    try {
      const allUsers = await usersService.list()
      setUsers(allUsers.filter((u) => u.role === 'COLABORADOR' || u.role === 'ADMIN'))
    } finally { setLoading(false) }
  }

  useEffect(() => {
    if (isAdmin) {
      void load()
      void loadSectors()
    }
  }, [isAdmin])

  const createSector = async () => {
    const name = newSectorName.trim()
    if (!name) return
    setSavingSector(true)
    try {
      const created = await sectorsService.create(name)
      setSectors((cur) => [...cur, created].sort((a, b) => a.name.localeCompare(b.name)))
      setNewSectorName('')
    } catch {
      alert('Erro ao criar setor.')
    } finally {
      setSavingSector(false)
    }
  }

  const deleteSector = async (s: Sector) => {
    if (!confirm(`Remover setor "${s.name}"? Todos os colaboradores perderão essa associação.`)) return
    try {
      await sectorsService.remove(s.id)
      setSectors((cur) => cur.filter((x) => x.id !== s.id))
    } catch {
      alert('Erro ao remover setor.')
    }
  }

  const toggleSectorId = (id: string, current: string[], setter: (v: string[]) => void) => {
    setter(current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
  }

  const openCreateModal = () => {
    setName('')
    setEmail('')
    setPassword('')
    setRole('COLABORADOR')
    setPhone('')
    setCompany('')
    setNotes('')
    setSelectedSectorIds([])
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
        sectorIds: role === 'COLABORADOR' || role === 'ADMIN' ? selectedSectorIds : undefined,
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
    setERole(u.role)
    setEPhone(u.phone ?? '')
    setECompany(u.company ?? '')
    setENotes(u.notes ?? '')
    setEActive(u.isActive ?? true)
    setESelectedSectorIds((u.sectors ?? []).map((s) => s.id))
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
        sectorIds: eRole === 'COLABORADOR' || eRole === 'ADMIN' ? eSelectedSectorIds : [],
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
          <PageTitle>Central do Colaborador</PageTitle>
          <PageSub>Cadastro de Admins, Colaboradores e gerenciamento de setores.</PageSub>
        </PageTitleGroup>
        <HeaderRight>
          <UserCount>Total de Colaboradores/Admin: {users.length}</UserCount>
          {activeTab === 'users' && (
            <NewUserBtn onClick={openCreateModal}>
              <UserPlus />
              Novo Colaborador/Admin
            </NewUserBtn>
          )}
        </HeaderRight>
      </PageHeader>

      <ContentSection>
        <TabsBar>
          <TabBtn $active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
            Colaboradores e Admin
          </TabBtn>
          <TabBtn $active={activeTab === 'sectors'} onClick={() => setActiveTab('sectors')}>
            Setores
          </TabBtn>
        </TabsBar>

        {/* ── Aba Usuários ── */}
        {activeTab === 'users' && (
          <TablePanel>
            <TableHead>
              <TableTitle>Lista de Colaboradores e Admin</TableTitle>
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
                    <TableHeaderCell>Setores</TableHeaderCell>
                    <TableHeaderCell>Tarefas</TableHeaderCell>
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

                        <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px', flexWrap: 'wrap', gap: 4 }}>
                          {u.role === 'COLABORADOR' && (u.sectors ?? []).length > 0 ? (
                            <SectorBadgeList>
                              {(u.sectors ?? []).map((s) => (
                                <SectorBadge key={s.id}>{s.name}</SectorBadge>
                              ))}
                            </SectorBadgeList>
                          ) : (
                            <span style={{ fontSize: 11, color: '#8b90a0' }}>—</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {u.role === 'COLABORADOR' && u.taskCount !== undefined ? (
                            <TaskCountBadge $level={u.taskCount >= 7 ? 'high' : u.taskCount >= 4 ? 'mid' : 'low'}>
                              {u.taskCount}
                            </TaskCountBadge>
                          ) : (
                            <span style={{ fontSize: 11, color: '#8b90a0' }}>—</span>
                          )}
                        </div>

                        <StatusCell>
                          <StatusDot $status={status} />
                          <StatusText $status={status}>{getStatusLabel(status)}</StatusText>
                        </StatusCell>
                        
                        <ActionsCell>
                          <ActionIconBtn 
                            type="button" 
                            onClick={() => openEdit(u)}
                            title="Editar"
                          >
                            <Edit2 />
                          </ActionIconBtn>
                          {u.role !== 'ADMIN' && (
                            <>
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
                    Exibindo {startIndex + 1} de {users.length} registros
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
        )}

        {/* ── Aba Setores ── */}
        {activeTab === 'sectors' && (
          <TablePanel>
            <TableHead>
              <TableTitle>Gerenciar Setores</TableTitle>
            </TableHead>
            <div style={{ padding: '20px 24px' }}>
              <AddSectorRow>
                <Input
                  value={newSectorName}
                  onChange={(e) => setNewSectorName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void createSector() } }}
                  placeholder="Nome do setor (ex: Design, Marketing…)"
                  style={{ flex: 1 }}
                />
                <AddSectorBtn type="button" onClick={() => void createSector()} disabled={savingSector || !newSectorName.trim()}>
                  <Plus />
                  {savingSector ? 'Criando…' : 'Criar Setor'}
                </AddSectorBtn>
              </AddSectorRow>

              {sectorsLoading ? (
                <Empty>Carregando…</Empty>
              ) : sectors.length === 0 ? (
                <Empty>Nenhum setor cadastrado ainda. Crie o primeiro acima.</Empty>
              ) : (
                <SectorsGrid>
                  {sectors.map((s) => (
                    <SectorCard key={s.id}>
                      <SectorCardName>
                        <Tag />
                        {s.name}
                      </SectorCardName>
                      <SectorDeleteBtn type="button" onClick={() => void deleteSector(s)} title="Remover setor">
                        <X />
                      </SectorDeleteBtn>
                    </SectorCard>
                  ))}
                </SectorsGrid>
              )}
            </div>
          </TablePanel>
        )}
      </ContentSection>

      {/* Create User Modal */}
      <Modal
        open={createOpen}
        onClose={() => { setCreateOpen(false); setError('') }}
        title="Criar Novo Colaborador/Admin"
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
              {saving ? 'Criando…' : 'Criar'}
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
              <option value="ADMIN">Admin</option>
              <option value="COLABORADOR">Colaborador</option>
            </Select>
          </FieldGroup>
          {(role === 'COLABORADOR' || role === 'ADMIN') && sectors.length > 0 && (
            <FieldGroup>
              <Label>Setores (opcional)</Label>
              <SectorPickerWrap>
                {sectors.map((s) => (
                  <SectorPickerBtn
                    key={s.id}
                    type="button"
                    $selected={selectedSectorIds.includes(s.id)}
                    onClick={() => toggleSectorId(s.id, selectedSectorIds, setSelectedSectorIds)}
                  >
                    {selectedSectorIds.includes(s.id) && <X style={{ width: 10, height: 10 }} />}
                    {s.name}
                  </SectorPickerBtn>
                ))}
              </SectorPickerWrap>
            </FieldGroup>
          )}
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
        title={editing ? `Editar ${editing.role === 'ADMIN' ? 'admin' : 'colaborador'}` : 'Editar'}
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
                  <option value="ADMIN">Admin</option>
                  <option value="COLABORADOR">Colaborador</option>
                </Select>
              </EditFieldGroup>
              {(eRole === 'COLABORADOR' || eRole === 'ADMIN') && sectors.length > 0 && (
                <EditFieldGroup>
                  <EditLabel><Tag />Setores</EditLabel>
                  <SectorPickerWrap>
                    {sectors.map((s) => (
                      <SectorPickerBtn
                        key={s.id}
                        type="button"
                        $selected={eSelectedSectorIds.includes(s.id)}
                        onClick={() => toggleSectorId(s.id, eSelectedSectorIds, setESelectedSectorIds)}
                      >
                        {eSelectedSectorIds.includes(s.id) && <X style={{ width: 10, height: 10 }} />}
                        {s.name}
                      </SectorPickerBtn>
                    ))}
                  </SectorPickerWrap>
                </EditFieldGroup>
              )}
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
