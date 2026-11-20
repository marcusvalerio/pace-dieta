import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Hoje from './pages/Hoje'
import Progresso from './pages/Progresso'
import RegistroRapido from './components/RegistroRapido'
import Simbolo from './components/Simbolo'
import Importar from './pages/Importar'
import Dieta from './pages/Dieta'
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
  getWeights, saveWeight,
  calcularStreak,
} from './lib/storage'

const easeSoft = [0.22, 1, 0.36, 1]

function today() { return new Date().toISOString().split('T')[0] }

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}>
        <Simbolo size={44} cor="#2B2B2B" titulo="Carregando" />
      </motion.div>
    </div>
  )
}

export default function App() {
  const { user, logout, loading: authLoading } = useAuth()

  const [plano, setPlano] = useState(undefined) // undefined = carregando, null = sem plano
  const [checkedPorDia, setCheckedPorDia] = useState({})
  const [compras, setCompras] = useState({})
  const [celebracoes, setCelebracoes] = useState([])
  const [tab, setTab] = useState('hoje')
  const [registro, setRegistro] = useState(false)
  const [importando, setImportando] = useState(false)
  const [pesos, setPesos] = useState([])
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
      getWeights(user.id).then(w => ativo && setPesos(w))
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

  const marcarRefeicao = useCallback((mealKey) => {
    const itens = plano?.plano_diario?.[mealKey]?.alimentos || []
    const diaAtual = { ...checkedHoje }
    itens.forEach((_, i) => { diaAtual[`${mealKey}__${i}`] = true })
    setCheckedPorDia(prev => ({ ...prev, [todayKey]: diaAtual }))
    saveCheckedDia(user.id, todayKey, diaAtual)
  }, [checkedHoje, plano, todayKey, user])

  const salvarPeso = useCallback((val) => {
    setPesos(prev => [...prev.filter(w => w.date !== todayKey), { date: todayKey, val }])
    saveWeight(user.id, todayKey, val)
  }, [todayKey, user])

  const toggleCompra = useCallback((key) => {
    const next = { ...compras, [key]: !compras[key] }
    setCompras(next)
    saveCompras(user.id, next)
  }, [compras, user])

  const updatePlano = useCallback((novoPlano) => {
    setPlano(novoPlano)
    savePlano(user.id, novoPlano)
  }, [user])

  const handlePlanoAtualizado = (novoPlano) => {
    setPlano(novoPlano)
  }

  const handleGeracaoCompleta = async (novoPlano) => {
    setPlano(novoPlano)
    await savePlano(user.id, novoPlano)
    setTab('plano')
  }

  const handleApagarTudo = async () => {
    await clearPlano(user.id)
    setPlano(null)
    setCheckedPorDia({})
    setCompras({})
    setCelebracoes([])
  }

  const totalItens = Object.values(plano?.plano_diario || {}).reduce((s, m) => s + (m.alimentos?.length || 0), 0) + (plano?.suplementos?.length || 0)
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
            {tab === 'hoje'      && <Hoje plano={plano} checked={checkedHoje} dietaPct={dietaPct} streak={streak}
              pesoAtual={[...pesos].sort((a, b) => a.date.localeCompare(b.date)).at(-1)?.val}
              onMarcarRefeicao={marcarRefeicao} onAbrir={setTab} onPerfil={() => setTab('perfil')} onImportar={() => setImportando(true)} />}
            {tab === 'progresso' && <Progresso checkedPorDia={checkedPorDia} totalItens={totalItens} pesos={pesos} onSalvarPeso={salvarPeso} />}
            {tab === 'plano'     && <Dieta plano={plano} checked={checkedHoje} onToggle={toggleCheck} onUpdatePlano={updatePlano} onImportar={() => setImportando(true)} />}
            {tab === 'compras'   && <Compras plano={plano} compras={compras} onToggle={toggleCompra} />}
            {tab === 'perfil'    && <Perfil plano={plano} userId={user.id} onPlanoAtualizado={handlePlanoAtualizado} onLogout={logout} onApagarTudo={handleApagarTudo} onVoltar={() => setTab('hoje')} />}
          </motion.div>
        </AnimatePresence>
      </div>
      <NavBar active={tab} onChange={setTab} onRegistrar={() => setRegistro(true)} />
      {importando && <Importar plano={plano} onFechar={() => setImportando(false)}
        onSalvar={(novo) => { updatePlano(novo); setImportando(false); setTab('plano') }} />}
      <RegistroRapido aberto={registro} onFechar={() => setRegistro(false)} plano={plano} checked={checkedHoje}
        onMarcarRefeicao={marcarRefeicao} onSalvarPeso={salvarPeso} />
    </div>
  )
}
