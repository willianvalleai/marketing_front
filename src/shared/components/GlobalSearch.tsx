import { useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { Search, X, Folder, Zap, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { projectsService } from '@/shared/services/projects.service'
import { usersService } from '@/shared/services/users.service'
import type { Project, User } from '@/shared/types'
import { useAuth } from '@/app/providers/AuthContext'

// ─── styled ──────────────────────────────────────────────────────────────────

const fadeDown = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: none; }
`

const Wrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const SearchInput = styled.input`
  width: 200px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #e2e8f0;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  padding: 7px 34px 7px 32px;
  outline: none;
  transition: border-color 0.15s, width 0.2s;
  &:focus {
    border-color: #6366f1;
    width: 260px;
  }
  &::placeholder { color: #475569; }
`

const SearchIcon = styled.div`
  position: absolute;
  left: 10px;
  color: #475569;
  display: flex;
  align-items: center;
  pointer-events: none;
  svg { width: 14px; height: 14px; }
`

const ClearBtn = styled.button`
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  &:hover { color: #94a3b8; }
  svg { width: 12px; height: 12px; }
`

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 340px;
  background: #1a1d27;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
  z-index: 500;
  overflow: hidden;
  animation: ${fadeDown} 0.15s ease;
  max-height: 420px;
  overflow-y: auto;
`

const GroupLabel = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #475569;
  padding: 10px 14px 4px;
`

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  cursor: pointer;
  transition: background 0.1s;
  &:hover { background: rgba(255,255,255,0.05); }
`

const ResultIcon = styled.div<{ $color: string }>`
  width: 28px; height: 28px;
  border-radius: 8px;
  background: ${({ $color }) => $color}22;
  color: ${({ $color }) => $color};
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  svg { width: 14px; height: 14px; }
`

const ResultText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
`

const ResultTitle = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ResultSub = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  color: #64748b;
`

const EmptyMsg = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #475569;
  padding: 16px 14px;
  text-align: center;
`

// ─── types ───────────────────────────────────────────────────────────────────

type ResultKind = 'project' | 'task' | 'user'

interface SearchResult {
  id: string
  kind: ResultKind
  title: string
  subtitle?: string
  projectId?: string
}

// ─── component ───────────────────────────────────────────────────────────────

export function GlobalSearch() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loaded, setLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  // load data lazily on first focus
  async function ensureLoaded() {
    if (loaded) return
    try {
      const [p, u] = await Promise.all([
        projectsService.list().catch(() => [] as Project[]),
        user?.role !== 'CLIENTE'
          ? usersService.list().catch(() => [] as User[])
          : Promise.resolve([] as User[]),
      ])
      setProjects(p)
      setUsers(u)
      setLoaded(true)
    } catch {}
  }

  // close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
        ensureLoaded()
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [loaded]) // eslint-disable-line

  const q = query.trim().toLowerCase()

  const results: SearchResult[] = q.length < 2 ? [] : [
    ...projects
      .filter((p) => p.title.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({ id: p.id, kind: 'project' as ResultKind, title: p.title, subtitle: p.client?.name })),

    ...projects
      .flatMap((p) => (p.tasks ?? []).map((t) => ({ ...t, projectTitle: p.title, projectId: p.id })))
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 6)
      .map((t) => ({ id: t.id, kind: 'task' as ResultKind, title: t.title, subtitle: t.projectTitle, projectId: t.projectId })),

    ...users
      .filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .slice(0, 4)
      .map((u) => ({ id: u.id, kind: 'user' as ResultKind, title: u.name, subtitle: u.email })),
  ]

  function handleSelect(r: SearchResult) {
    setQuery('')
    setOpen(false)
    if (r.kind === 'project') navigate(`/projetos`)
    else if (r.kind === 'task') navigate(`/kanban?task=${r.id}&project=${r.projectId}`)
    else if (r.kind === 'user') navigate(`/users`)
  }

  const projectResults = results.filter((r) => r.kind === 'project')
  const taskResults = results.filter((r) => r.kind === 'task')
  const userResults = results.filter((r) => r.kind === 'user')
  const hasResults = results.length > 0

  return (
    <Wrap ref={wrapRef}>
      <SearchIcon><Search /></SearchIcon>
      <SearchInput
        ref={inputRef}
        placeholder="Buscar... (Ctrl+K)"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => { setOpen(true); ensureLoaded() }}
      />
      {query && (
        <ClearBtn type="button" onClick={() => { setQuery(''); inputRef.current?.focus() }}>
          <X />
        </ClearBtn>
      )}

      {open && query.length >= 2 && (
        <Dropdown>
          {!hasResults && <EmptyMsg>Nenhum resultado para "{query}"</EmptyMsg>}

          {projectResults.length > 0 && (
            <>
              <GroupLabel><Folder size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />Projetos</GroupLabel>
              {projectResults.map((r) => (
                <ResultItem key={r.id} onMouseDown={() => handleSelect(r)}>
                  <ResultIcon $color="#6366f1"><Folder /></ResultIcon>
                  <ResultText>
                    <ResultTitle>{r.title}</ResultTitle>
                    {r.subtitle && <ResultSub>{r.subtitle}</ResultSub>}
                  </ResultText>
                </ResultItem>
              ))}
            </>
          )}

          {taskResults.length > 0 && (
            <>
              <GroupLabel><Zap size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />Tarefas</GroupLabel>
              {taskResults.map((r) => (
                <ResultItem key={r.id} onMouseDown={() => handleSelect(r)}>
                  <ResultIcon $color="#f59e0b"><Zap /></ResultIcon>
                  <ResultText>
                    <ResultTitle>{r.title}</ResultTitle>
                    {r.subtitle && <ResultSub>{r.subtitle}</ResultSub>}
                  </ResultText>
                </ResultItem>
              ))}
            </>
          )}

          {userResults.length > 0 && (
            <>
              <GroupLabel><Users size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />Usuários</GroupLabel>
              {userResults.map((r) => (
                <ResultItem key={r.id} onMouseDown={() => handleSelect(r)}>
                  <ResultIcon $color="#10b981"><Users /></ResultIcon>
                  <ResultText>
                    <ResultTitle>{r.title}</ResultTitle>
                    {r.subtitle && <ResultSub>{r.subtitle}</ResultSub>}
                  </ResultText>
                </ResultItem>
              ))}
            </>
          )}
        </Dropdown>
      )}
    </Wrap>
  )
}
