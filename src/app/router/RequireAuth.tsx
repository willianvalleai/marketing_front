import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthContext'
import { CenterSpinner } from '@/shared/components/ui/Spinner'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()

  if (status === 'loading') return <CenterSpinner />
  if (status === 'unauthenticated') return <Navigate to="/login" replace />
  return <>{children}</>
}

