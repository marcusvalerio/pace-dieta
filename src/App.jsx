import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Onboarding from './pages/Onboarding'
import ResumoGeracao from './pages/ResumoGeracao'
import Dashboard from './pages/Dashboard'
import Dieta from './pages/Dieta'
import Receitas from './pages/Receitas'
import Compras from './pages/Compras'
import Sintomas from './pages/Sintomas'
import NavBar from './components/NavBar'
import { getPlano, savePlano, getChecked, saveChecked, getCompras, saveCompras, calcularStreak } from './lib/storage'

const ease = [0.16, 1, 0.3, 1]

function today() { return new Date().toISOString().split('T')[0] }

export default function App() {
  const [plano, setPlano] = useState(() => getPlano())
  const [mostrarResumo, setMostrarResumo] = useState(false)
  const [tab, setTab] = useState('dashboard')
  const [checkedPorDia, setCheckedPorDia] = useState(() => getChecked())
  const [compras, setCompras] = useState(() => getCompras())

  const todayKey = today()
  const checkedHoje = checkedPorDia[todayKey] || {}

  const toggleCheck = (key) => {
    const diaAtual = { ...checkedHoje, [key]: !checkedHoje[key] }
    const next = { ...checkedPorDia, [todayKey]: diaAtual }
    setCheckedPorDia(next)
    saveChecked(next)
  }

  const toggleCompra = (key) => {
    const next = { ...compras, [key]: !compras[key] }
    setCompras(next)
    saveCompras(next)
  }

  const updatePlano = (novoPlano) => {
    setPlano(novoPlano)
    savePlano(novoPlano)
  }

  const totalItens = Object.values(plano?.plano_diario || {}).reduce((s, m) => s + (m.alimentos?.length || 0), 0)
  const totalChecked = Object.values(checkedHoje).filter(Boolean).length
  const dietaPct = totalItens ? Math.round((totalChecked / totalItens) * 100) : 0
  const streak = calcularStreak(checkedPorDia, totalItens)

  const handleGeracaoCompleta = (novoPlano) => {
    setPlano(novoPlano)
    setMostrarResumo(true)
  }

  if (!plano) {
    return <Onboarding onComplete={handleGeracaoCompleta} />
  }

  if (mostrarResumo) {
    return <ResumoGeracao plano={plano} onContinue={() => setMostrarResumo(false)} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 'var(--safe-top)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease }}>
            {tab === 'dashboard' && <Dashboard plano={plano} dietaPct={dietaPct} streak={streak} />}
            {tab === 'dieta'     && <Dieta plano={plano} checked={checkedHoje} onToggle={toggleCheck} onUpdatePlano={updatePlano} />}
            {tab === 'receitas'  && <Receitas plano={plano} />}
            {tab === 'compras'   && <Compras plano={plano} compras={compras} onToggle={toggleCompra} />}
            {tab === 'sintomas'  && <Sintomas />}
          </motion.div>
        </AnimatePresence>
      </div>
      <NavBar active={tab} onChange={setTab} />
    </div>
  )
}
