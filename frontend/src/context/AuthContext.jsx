import { createContext, useState, useCallback } from 'react'
import { queryClient } from '../main.jsx'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('tf_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => sessionStorage.getItem('tf_token'))

  const login = useCallback((userData, jwtToken) => {
    // Wipe previous user's cached data before setting new user
    queryClient.clear()
    setUser(userData)
    setToken(jwtToken)
    sessionStorage.setItem('tf_user', JSON.stringify(userData))
    sessionStorage.setItem('tf_token', jwtToken)
  }, [])

  const logout = useCallback(() => {
    // Wipe all cached queries so next login starts completely fresh
    queryClient.clear()
    setUser(null)
    setToken(null)
    sessionStorage.removeItem('tf_user')
    sessionStorage.removeItem('tf_token')
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  )
}