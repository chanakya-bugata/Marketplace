import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3005'
      const newSocket = io(socketUrl, {
        withCredentials: true,
      })

      newSocket.on('connect', () => {
        setIsConnected(true)
        console.log('Socket connected')
      })

      newSocket.on('disconnect', () => {
        setIsConnected(false)
        console.log('Socket disconnected')
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    } else {
      if (socket) {
        socket.close()
        setSocket(null)
        setIsConnected(false)
      }
    }
  }, [user])

  const value = {
    socket,
    isConnected,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}