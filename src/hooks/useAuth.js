import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export function useAuth() {
  const [user, setUser] = useState(undefined) // undefined = carregando

  useEffect(() => {
    const carregar = () => api('auth?acao=eu').then(r => setUser(r.usuario)).catch(() => setUser(null))
    carregar()
    window.addEventListener('pace-auth', carregar)
    return () => window.removeEventListener('pace-auth', carregar)
  }, [])

  const logout = async () => {
    await api('auth?acao=sair').catch(() => {})
    setUser(null)
  }

  return { user, logout, loading: user === undefined }
}
