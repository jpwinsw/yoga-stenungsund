'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { braincore } from '@/lib/api/braincore'
import type { LoginRequest, LoginResponse, SignupRequest, Member } from '@/lib/types/braincore'

interface AuthContextType {
  isAuthenticated: boolean
  member: Member | null
  isLoading: boolean
  sessionExpiresAt: Date | null
  login: (credentials: LoginRequest) => Promise<LoginResponse>
  signup: (data: SignupRequest) => Promise<unknown>
  logout: () => void
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null)

  const checkAuth = useCallback(() => {
    const authenticated = braincore.isAuthenticated()
    setIsAuthenticated(authenticated)
    if (authenticated) {
      const memberData = braincore.getMember()
      setMember(memberData)
      const expiresAt = braincore.getSessionExpiresAt()
      setSessionExpiresAt(expiresAt)
    } else {
      setMember(null)
      setSessionExpiresAt(null)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()
    
    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', checkAuth)
    // Listen for explicit logout events
    window.addEventListener('auth-logout', checkAuth)
    
    // Check session validity every minute
    const intervalId = setInterval(() => {
      if (braincore.isAuthenticated()) {
        // Still valid, update expiry time
        const expiresAt = braincore.getSessionExpiresAt()
        setSessionExpiresAt(expiresAt)
      } else {
        // Session expired
        checkAuth()
      }
    }, 60000) // Check every minute
    
    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('auth-logout', checkAuth)
      clearInterval(intervalId)
    }
  }, [checkAuth])

  const login = async (credentials: LoginRequest) => {
    const response = await braincore.login(credentials)
    checkAuth() // Update state after login
    return response
  }

  const signup = async (data: SignupRequest) => {
    const response = await braincore.signup(data)
    // Note: signup doesn't automatically log in, so we don't update auth state here
    return response
  }

  const logout = () => {
    braincore.logout()
    setIsAuthenticated(false)
    setMember(null)
    setSessionExpiresAt(null)
  }

  const refreshAuth = () => {
    checkAuth()
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        member,
        isLoading,
        sessionExpiresAt,
        login,
        signup,
        logout,
        refreshAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}