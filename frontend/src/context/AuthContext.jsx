import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => localStorage.getItem('user'))

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', user)
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }, [token, user])

  async function login(username, password, rememberMe = false) {
    const res = await api.login(username, password, rememberMe)
    setToken(res.access_token)
    setUser(username)
    localStorage.setItem('token', res.access_token)
    localStorage.setItem('user', username)
    return res
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
