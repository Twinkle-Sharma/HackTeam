"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { API_URL } from "@/lib/constants"

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

  const signup = async (userData) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');

      setUser(data.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
      }
      return data.user;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      setUser(data.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
      }
      return data.user;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
    }
  }

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUser", JSON.stringify(updated));
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
