import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './RequireAuth'
import { AppShell } from '@/shared/components/layout/AppShell'

import { LoginPage } from '@/pages/login'
import { HomePage } from '@/pages/home'
import { ProjetosPage } from '@/pages/projetos'
import { UsersPage } from '@/pages/users'
import { KanbanPage } from '@/pages/kanban'
import { ChatPage } from '@/pages/chat'
import { CalendarioPage } from '@/pages/calendario'
import { ClientProjectPage } from '@/pages/projetos/client'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<HomePage />} />
          <Route path="projetos" element={<ProjetosPage />} />
          <Route path="projetos/:projectId" element={<ClientProjectPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="calendario" element={<CalendarioPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

