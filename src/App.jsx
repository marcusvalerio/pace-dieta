import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import ResumoGeracao from './pages/ResumoGeracao'
import Dashboard from './pages/Dashboard'
import Dieta from './pages/Dieta'
import Receitas from './pages/Receitas'
import Compras from './pages/Compras'
import Perfil from './pages/Perfil'
import NavBar from './components/NavBar'
import DailyCheckin from './components/DailyCheckin'
import Celebration from './components/Celebration'
import { useAuth } from './hooks/useAuth'
import {
  getPlano, savePlano, clearPlano,
  getChecked, saveCheckedDia,
  getCompras, saveCompras,
  getCelebracoes, marcarCelebrado,
  calcularStreak,
} from './lib/storage'

const easeSoft = [0.22, 1, 0.36, 1]

function today() { return new Date().toISOString().split('T')[0] }

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity }}
        style={{ fontFamily: 'Funnel Display, sans-serif', fontWeight: 700, fontSize: 22, color: 'var(--text)' }}>
        Pace
      </motion.span>
    </div>
  )
}

export default function App() {
  const { user, logout, loading: authLoading } = useAuth()

  const [plano, setPlano] = useState(undefined) // undefined = carregando, null = sem plano
  const [checkedPorDia, setCheckedPorDia] = useState({})
  const [compras, setCompras] = useState({})
  const [celebracoes, setCelebracoes] = useState([])
  const [mostrarResumo, setMostrarResumo] = useState(false)
  const [tab, setTab] = useState('dashboard')
  const [celebrar, setCelebrar] = useState(false)
  const [dadosCarregados, setDadosCarregados] = useState(false)

  // Carrega tudo do Supabase assim que o usuário loga
  useEffect(() => {
    if (!user) { setPlano(null); setDadosCarregados(false); return }
    let ativo = true
    async function carregar() {
      const [p, c, comp, cel] = await Promise.all([
        getPlano(user.id), getChecked(user.id), getCompras(user.id), getCelebracoes(user.id)
      ])
      if (!ativo) return
      setPlano(p)
      setCheckedPorDia(c)
      setCompras(comp)
      setCelebracoes(cel)
      setDadosCarregados(true)
    }
    carregar()
    return () => { ativo = false }
  }, [user])

  const todayKey = today()
  const checkedHoje = checkedPorDia[todayKey] || {}

  const toggleCheck = useCallback((key) => {
    const diaAtual = { ...checkedHoje, [key]: !checkedHoje[key] }
    const next = { ...checkedPorDia, [todayKey]: diaAtual }
    setCheckedPorDia(next)
    saveCheckedDia(user.id, todayKey, diaAtual)
  }, [checkedHoje, checkedPorDia, todayKey, user])

  const toggleCompra = useCallback((key) => {
    const next = { ...compras, [key]: !compras[key] }
    setCompras(next)
    saveCompras(user.id, next)
  }, [compras, user])

  const updatePlano = useCallback((novoPlano) => {
    setPlano(novoPlano)
    savePlano(user.id, novoPlano)
  }, [user])

  const handlePlanoAtualizado = (novoPlano, mostrarResumoFlag) => {
    setPlano(novoPlano)
    if (mostrarResumoFlag) { setMostrarResumo(true); setTab('dashboard') }
  }

  const handleGeracaoCompleta = async (novoPlano) => {
    setPlano(novoPlano)
    await savePlano(user.id, novoPlano)
    setMostrarResumo(true)
  }

  const handleApagarTudo = async () => {
    await clearPlano(user.id)
    setPlano(null)
    setCheckedPorDia({})
    setCompras({})
    setCelebracoes([])
  }

  const totalItens = Object.values(plano?.plano_diario || {}).reduce((s, m) => s + (m.alimentos?.length || 0), 0)
  const totalChecked = Object.values(checkedHoje).filter(Boolean).length
  const dietaPct = totalItens ? Math.round((totalChecked / totalItens) * 100) : 0
  const streak = calcularStreak(checkedPorDia, totalItens)

  // Celebração — dispara uma vez por dia quando a dieta bate 100%
  useEffect(() => {
    if (!user || !dadosCarregados) return
    if (dietaPct === 100 && totalItens > 0 && !celebracoes.includes(todayKey)) {
      marcarCelebrado(user.id, todayKey)
      setCelebracoes(c => [...c, todayKey])
      setCelebrar(true)
    }
  }, [dietaPct, totalItens, celebracoes, dadosCarregados, user, todayKey])

  if (authLoading) return <LoadingScreen />
  if (!user) return <Auth />
  if (plano === undefined || !dadosCarregados) return <LoadingScreen />
  if (!plano) return <Onboarding userId={user.id} onComplete={handleGeracaoCompleta} />
  if (mostrarResumo) return <ResumoGeracao plano={plano} onContinue={() => setMostrarResumo(false)} />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 'var(--safe-top)' }}>
      <DailyCheckin userId={user.id} />
      <Celebration show={celebrar} onDismiss={() => setCelebrar(false)} streak={streak} />

      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 14, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
            transition={{ duration: 0.45, ease: easeSoft }}>
            {tab === 'dashboard' && <Dashboard plano={plano} dietaPct={dietaPct} streak={streak} userId={user.id} />}
            {tab === 'dieta'     && <Dieta plano={plano} checked={checkedHoje} onToggle={toggleCheck} onUpdatePlano={updatePlano} />}
            {tab === 'receitas'  && <Receitas plano={plano} />}
            {tab === 'compras'   && <Compras plano={plano} compras={compras} onToggle={toggleCompra} />}
            {tab === 'perfil'    && <Perfil plano={plano} userId={user.id} onPlanoAtualizado={handlePlanoAtualizado} onLogout={logout} onApagarTudo={handleApagarTudo} />}
          </motion.div>
        </AnimatePresence>
      </div>
      <NavBar active={tab} onChange={setTab} />
    </div>
  )
}
