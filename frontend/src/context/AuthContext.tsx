import { useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import type { AuthContextValue, User } from '../types'
import { AuthContext } from './authContext'

interface LoginResponse {
  token: string
  user: User
}

function readStoredUser(): User | null {
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(() => readStoredUser())

  const persist = (t: string, u: User) => {
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
    setToken(t)
    setUser(u)
  }

  const login = async (email: string, password: string) => {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
    persist(data.token, data.user)
  }

  const register = async (nombre: string, email: string, password: string) => {
    const { data } = await api.post<LoginResponse>('/auth/register', { nombre, email, password })
    persist(data.token, data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const value: AuthContextValue = { user, token, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}