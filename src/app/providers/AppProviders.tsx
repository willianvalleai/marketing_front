import React from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from '@/shared/styles/theme'
import { GlobalStyles } from '@/shared/styles/globalStyles'
import { AuthProvider } from './AuthContext'
import { SocketProvider } from './SocketContext'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AuthProvider>
        <SocketProvider>{children}</SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

