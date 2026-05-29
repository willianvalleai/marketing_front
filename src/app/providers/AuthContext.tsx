import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '@/shared/services/auth.service'
import { getErrorMessage } from '@/shared/services/api'
import type { User } from '@/shared/types'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthValue {
  user: User | null
  status: AuthStatus
  login(email: string, password: string): Promise<void>
  logout(): Promise<void>
  reload(): Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [boot, setBoot] = useState(true)

  const reload = async () => {
    try {
      const me = await authService.me()
      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setBoot(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  const value = useMemo<AuthValue>(() => {
    const status: AuthStatus = boot ? 'loading' : user ? 'authenticated' : 'unauthenticated'
    return {
      user,
      status,
      async login(email: string, password: string) {
        try {
          const u = await authService.login(email, password)
          setUser(u)
          setBoot(false)
        } catch (err) {
          throw new Error(getErrorMessage(err, 'Falha ao fazer login.'))
        }
      },
      async logout() {
        try {
          await authService.logout()
        } finally {
          setUser(null)
          setBoot(false)
        }
      },
      reload,
    }
  }, [boot, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.')
  return ctx
}

