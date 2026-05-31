import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '@/app/providers/AuthContext'
import { NotificationsBell } from '@/shared/components/notifications/NotificationsBell'
import {
  LayoutGrid,
  Folders,
  Kanban,
  MessageSquare,
  CalendarDays,
  Users,
  LogOut,
  ChevronRight,
  Zap,
  BarChart2,
} from 'lucide-react'
import { GlobalSearch } from '@/shared/components/GlobalSearch'

/* ── Shell ─────────────────────────────────────────────── */
const Shell = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bg};
`

/* ── Sidebar ─────────────────────────────────────────────── */
const Sidebar = styled.aside`
  width: 248px;
  flex-shrink: 0;
  height: 100vh;
  background: ${({ theme }) => theme.colors.sidebar};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const SidebarLogo = styled.div`
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
`

const LogoMark = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.primaryHover});
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 20px rgba(143, 216, 255, 0.3);
  svg { color: #131313; width: 16px; height: 16px; }
`

const LogoName = styled.span`
  font-size: ${({ theme }) => theme.font.md};
  font-weight: ${({ theme }) => theme.weights.bold};
  color: ${({ theme }) => theme.colors.textDark};
  letter-spacing: -0.01em;
`

const SidebarBody = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const SectionLabel = styled.div`
  font-size: 10.5px;
  font-weight: ${({ theme }) => theme.weights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 10px 10px 4px;
`

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ theme }) => theme.weights.medium};
  color: ${({ theme }) => theme.colors.textLight};
  transition: background 0.12s, color 0.12s;
  position: relative;

  svg { width: 17px; height: 17px; flex-shrink: 0; }

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: ${({ theme }) => theme.colors.textDark};
  }

  &.active {
    background: ${({ theme }) => theme.colors.sidebarActive};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.weights.semibold};
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 6px;
      bottom: 6px;
      width: 3px;
      border-radius: 0 3px 3px 0;
      background: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 8px ${({ theme }) => theme.colors.primary};
    }
  }
`

const NavText = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const SidebarFooter = styled.div`
  flex-shrink: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 12px 10px;
`

const UserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: default;
`

const UserAvatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.primaryMid};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ theme }) => theme.weights.bold};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid ${({ theme }) => theme.colors.border};
`

const UserMeta = styled.div`
  flex: 1;
  min-width: 0;
`
const UserName = styled.div`
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
const UserRole = styled.div`
  font-size: ${({ theme }) => theme.font.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: capitalize;
`

const LogoutBtn = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  flex-shrink: 0;
  transition: background 0.12s, color 0.12s;
  svg { width: 16px; height: 16px; }
  &:hover { background: ${({ theme }) => theme.colors.dangerFaint}; color: ${({ theme }) => theme.colors.danger}; }
`

/* ── Main ─────────────────────────────────────────────── */
const Main = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`

const Topbar = styled.header`
  height: 60px;
  flex-shrink: 0;
  padding: 0 28px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(25, 25, 25, 0.4);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;
  z-index: 200;
`

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
`

const BreadcrumbHome = styled.span`
  font-size: ${({ theme }) => theme.font.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`

const BreadcrumbSep = styled(ChevronRight)`
  width: 14px !important;
  height: 14px !important;
  color: ${({ theme }) => theme.colors.textMuted};
  flex-shrink: 0;
`

const BreadcrumbCurrent = styled.span`
  font-size: ${({ theme }) => theme.font.sm};
  font-weight: ${({ theme }) => theme.weights.semibold};
  color: ${({ theme }) => theme.colors.textDark};
`

const TopbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const Content = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 32px 28px;
`

/* ── Route titles ─────────────────────────────────────── */
const TITLES: Record<string, string> = {
  '/home': 'Overview',
  '/projetos': 'Projetos',
  '/kanban': 'Kanban',
  '/chat': 'Chat',
  '/users': 'Clientes',
  '/colaboradores': 'Central do Colaborador',
  '/calendario': 'Calendário',
  '/painel': 'Painel',
}

export function AppShell() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const { pathname } = useLocation()

  const isAdmin = user?.role === 'ADMIN'
  const isCliente = user?.role === 'CLIENTE'
  const initials = (user?.name ?? '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const pageTitle = TITLES[pathname] ?? 'Dashboard'

  return (
    <Shell>
      <Sidebar>
        <SidebarLogo>
          <LogoMark><Zap /></LogoMark>
          <LogoName>Marketing Hub</LogoName>
        </SidebarLogo>

        <SidebarBody>
          <SectionLabel>Geral</SectionLabel>
          <NavItem to="/home"><LayoutGrid /><NavText>Overview</NavText></NavItem>
          <NavItem to="/projetos"><Folders /><NavText>Projetos</NavText></NavItem>
          {!isCliente && <NavItem to="/kanban"><Kanban /><NavText>Kanban</NavText></NavItem>}
          <NavItem to="/chat"><MessageSquare /><NavText>Chat</NavText></NavItem>
          {isCliente && <NavItem to="/calendario"><CalendarDays /><NavText>Calendário</NavText></NavItem>}
          <NavItem to="/painel"><BarChart2 /><NavText>Painel</NavText></NavItem>
          {isAdmin && (
            <>
              <SectionLabel>Admin</SectionLabel>
              <NavItem to="/colaboradores"><Users /><NavText>Central do Colaborador</NavText></NavItem>
              <NavItem to="/users"><Users /><NavText>Clientes</NavText></NavItem>
            </>
          )}
        </SidebarBody>

        <SidebarFooter>
          <UserRow>
            <UserAvatar>{initials}</UserAvatar>
            <UserMeta>
              <UserName>{user?.name}</UserName>
              <UserRole>{user?.role?.toLowerCase()}</UserRole>
            </UserMeta>
            <LogoutBtn
              title="Sair"
              onClick={async () => {
                await logout()
                nav('/login', { replace: true })
              }}
            >
              <LogOut />
            </LogoutBtn>
          </UserRow>
        </SidebarFooter>
      </Sidebar>

      <Main>
        <Topbar>
          <Breadcrumb>
            <BreadcrumbHome>Marketing Hub</BreadcrumbHome>
            <BreadcrumbSep />
            <BreadcrumbCurrent>{pageTitle}</BreadcrumbCurrent>
          </Breadcrumb>
          <TopbarRight>
            <GlobalSearch />
            <NotificationsBell />
          </TopbarRight>
        </Topbar>

        <Content>
          <Outlet />
        </Content>
      </Main>
    </Shell>
  )
}
