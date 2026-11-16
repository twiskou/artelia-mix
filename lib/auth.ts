'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User, AuthState } from '@/lib/types'
import { validateCredentials, createUser } from '@/lib/users-store'

const STORAGE_KEY = 'artelia_auth'

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isAuthenticated: false })

  // Restaure la session depuis localStorage au démarrage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as AuthState
        if (parsed.user && parsed.isAuthenticated) {
          setState(parsed)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  function persist(next: AuthState) {
    setState(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  /**
   * Connexion avec validation email + password.
   * Les credentials sont vérifiés contre le registre local (artelia_users).
   */
  async function login(email: string, password: string) {
    // Validation de format
    if (!email.trim()) return { success: false, error: 'Veuillez saisir votre adresse email.' }
    if (!email.includes('@')) return { success: false, error: 'Adresse email invalide.' }
    if (!password) return { success: false, error: 'Veuillez saisir votre mot de passe.' }
    if (password.length < 6) return { success: false, error: 'Mot de passe trop court (minimum 6 caractères).' }

    // Validation des credentials contre le registre
    const storedUser = validateCredentials(email.trim(), password)
    if (!storedUser) {
      return {
        success: false,
        error: 'Email ou mot de passe incorrect. Vérifiez vos identifiants ou créez un compte.',
      }
    }

    // Connexion réussie — on stocke les infos de l'utilisateur réel
    const user: User = {
      id: storedUser.id,
      name: storedUser.name,
      email: storedUser.email,
      createdAt: storedUser.createdAt,
    }
    persist({ user, isAuthenticated: true })
    return { success: true }
  }

  /**
   * Inscription : crée un nouveau compte, vérifie l'unicité de l'email,
   * puis connecte directement l'utilisateur.
   */
  async function register(name: string, email: string, password: string) {
    if (!name.trim()) return { success: false, error: 'Le nom est requis.' }
    if (!email.includes('@')) return { success: false, error: 'Adresse email invalide.' }
    if (password.length < 6) return { success: false, error: 'Mot de passe trop court (minimum 6 caractères).' }

    const result = createUser(name, email, password)

    if ('error' in result) {
      return { success: false, error: result.error }
    }

    // Inscription réussie — connexion automatique
    const user: User = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      createdAt: result.user.createdAt,
    }
    persist({ user, isAuthenticated: true })
    return { success: true }
  }

  function logout() {
    setState({ user: null, isAuthenticated: false })
    localStorage.removeItem(STORAGE_KEY)
    window.location.href = '/login'
  }

  return React.createElement(
    AuthContext.Provider,
    { value: { ...state, login, register, logout } },
    children
  )
}

function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { AuthContext, AuthProvider, useAuth }
