import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface SocketValue {
  socket: Socket | null
}

const SocketContext = createContext<SocketValue | null>(null)

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3001'

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    if (!user) {
      setSocket((prev) => {
        prev?.disconnect()
        return null
      })
      return
    }

    const s = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })
    setSocket(s)

    return () => {
      s.disconnect()
      setSocket(null)
    }
  }, [user?.id])

  const value = useMemo<SocketValue>(() => ({ socket }), [socket])
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket(): SocketValue {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket deve ser usado dentro de <SocketProvider>.')
  return ctx
}

