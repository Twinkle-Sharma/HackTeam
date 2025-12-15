"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("currentUser")
      if (stored) {
        setUser(JSON.parse(stored))
      }
    }
    setLoading(false)
  }, [])

  const signup = (userData) => {
    const newUser = {
      id: Date.now(),
      ...userData,
      avatar: "/diverse-user-avatars.png",
      lookingForTeam: true,
    }
    setUser(newUser)
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUser", JSON.stringify(newUser))
    }
    return newUser
  }

  const login = (email) => {
    const mockUser = {
      id: 1,
      name: "Demo User",
      email: email,
      skills: ["React", "Node.js"],
      bio: "Software developer",
      avatar: "/diverse-user-avatars.png",
      lookingForTeam: true,
    }
    setUser(mockUser)
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUser", JSON.stringify(mockUser))
    }
    return mockUser
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser")
    }
  }

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates }
    setUser(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUser", JSON.stringify(updated))
    }
  }

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
