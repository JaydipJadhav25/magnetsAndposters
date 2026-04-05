import { createContext, useContext, useEffect, useState } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => { try { return JSON.parse(localStorage.getItem('map_user')) } catch { return null } })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('map_token', data.token)
    localStorage.setItem('map_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const register = async (name, email, password, phone) => {
    const { data } = await api.post('/auth/register', { name, email, password, phone })
    localStorage.setItem('map_token', data.token)
    localStorage.setItem('map_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('map_token')
    localStorage.removeItem('map_user')
    setUser(null)
  }

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('map_token')
    if (!token) return
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(logout)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
