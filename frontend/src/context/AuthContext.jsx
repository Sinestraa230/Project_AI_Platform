import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { getToken, setUnauthorizedHandler } from '../services/api'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Có token sẵn -> đang kiểm tra lại với backend, chưa được chuyển hướng vội
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
    if (!getToken()) return undefined
    let cancelled = false
    authService
      .fetchMe()
      .then((u) => !cancelled && setUser(u))
      .catch(() => !cancelled && setUser(null))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const u = await authService.login(credentials)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, logout, register: authService.register }),
    [user, loading, login, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải dùng bên trong <AuthProvider>')
  return ctx
}
