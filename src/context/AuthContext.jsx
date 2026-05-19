import { createContext, useContext, useState } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("auth_user")
    return stored ? JSON.parse(stored) : null
  })

  function login(email, password) {
    const userData = { email, name: "Admin User" }
    localStorage.setItem("auth_user", JSON.stringify(userData))
    setUser(userData)
  }

  function signup(name, email, password) {
    const userData = { email, name }
    localStorage.setItem("auth_user", JSON.stringify(userData))
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem("auth_user")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
