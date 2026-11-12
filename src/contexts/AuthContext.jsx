import { useState } from 'react'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('ai-plant-user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const login = (email, password) => {
    if (!email || !password) return false

    const newUser = {
      name: email.split('@')[0],
      email,
    }

    localStorage.setItem('ai-plant-user', JSON.stringify(newUser))
    setUser(newUser)

    return true
  }

  const logout = () => {
    localStorage.removeItem('ai-plant-user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}