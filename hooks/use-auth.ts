'use client'

import { useState, useEffect } from 'react'
import type { User, AuthSession } from '@/types/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for existing session
    const session = localStorage.getItem('auth_session')
    if (session) {
      try {
        const parsed: AuthSession = JSON.parse(session)
        setUser(parsed.user)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Failed to parse session:', error)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // TODO: Implement actual login logic
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('auth_session')
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  }
}
